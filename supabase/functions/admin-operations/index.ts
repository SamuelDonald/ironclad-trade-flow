import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin middleware
async function requireAdmin(req: Request, supabase: any) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (!adminUser) {
    throw new Error('Access denied');
  }

  return { user, adminUser };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { adminUser } = await requireAdmin(req, supabase);
    const url = new URL(req.url);
    const path = url.pathname;

    // Get overview data
    if (req.method === 'GET' && path === '/admin-operations/overview') {
      const [
        { count: totalUsers },
        { count: totalTrades },
        { count: totalTransactions },
        { data: recentTrades }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      return new Response(JSON.stringify({
        totalUsers,
        totalTrades,
        totalTransactions,
        recentTrades
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get users with portfolio data
    if (req.method === 'GET' && path === '/admin-operations/users') {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          *,
          portfolio_balances(cash_balance, invested_amount, free_margin, total_value)
        `);

      if (error) throw error;

      return new Response(JSON.stringify(users), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update user balances
    if (req.method === 'PUT' && path.startsWith('/admin-operations/users/') && path.endsWith('/balances')) {
      const userId = path.split('/')[3];
      const { cashBalance, investedAmount, freeMargin } = await req.json();

      // Get current balances for audit
      const { data: currentBalance } = await supabase
        .from('portfolio_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Update or insert balances
      const { data: updatedBalance, error } = await supabase
        .from('portfolio_balances')
        .upsert({
          user_id: userId,
          cash_balance: cashBalance,
          invested_amount: investedAmount,
          free_margin: freeMargin,
          total_value: cashBalance + investedAmount,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_audits')
        .insert({
          admin_user_id: adminUser.id,
          action: 'balance_update',
          target_table: 'portfolio_balances',
          target_id: userId,
          meta: {
            before: currentBalance,
            after: { cashBalance, investedAmount, freeMargin }
          }
        });

      return new Response(JSON.stringify(updatedBalance), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all transactions
    if (req.method === 'GET' && path === '/admin-operations/transactions') {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(transactions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all trades
    if (req.method === 'GET' && path === '/admin-operations/trades') {
      const { data: trades, error } = await supabase
        .from('trades')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(trades), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-operations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage === 'Access denied' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});