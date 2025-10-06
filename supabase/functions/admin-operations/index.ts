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

    console.log('[Admin Operations] Request received:', {
      method: req.method,
      path,
      timestamp: new Date().toISOString()
    });

    console.log('[Admin Operations] Admin verified:', {
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Get overview data
    if (req.method === 'GET' && (path === '/admin-operations/overview' || path.endsWith('/overview'))) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { count: totalUsers },
        { count: totalTrades },
        { count: totalTransactions },
        { count: pendingKycCount },
        { count: pendingDepositsCount },
        { count: pendingWithdrawalsCount },
        { count: activeTraders },
        { data: recentTrades }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
        supabase.from('trades').select('user_id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('trades').select(`
          *,
          profiles(full_name, email)
        `).order('created_at', { ascending: false }).limit(20)
      ]);

      const responseData = {
        totalUsers,
        activeTraders,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingTransactions: 0,
        activeTrades: totalTrades,
        pendingKyc: pendingKycCount,
        totalAssets: 0,
        pendingKycCount,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        recentTrades
      };

      console.log('[Admin Operations] Sending overview response:', {
        path,
        status: 200,
        dataKeys: Object.keys(responseData)
      });

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get users with portfolio data and search/pagination
    if (req.method === 'GET' && (path === '/admin-operations/users' || path.endsWith('/users'))) {
      const searchQuery = url.searchParams.get('search') || '';
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('profiles')
        .select(`
          *,
          portfolio_balances(cash_balance, invested_amount, free_margin, total_value)
        `);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data: users, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get last_sign_in_at from auth.users
      const usersWithAuth = await Promise.all(users.map(async (user) => {
        const { data: authData } = await supabase.auth.admin.getUserById(user.id);
        const portfolio = user.portfolio_balances?.[0] || {};
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          kyc_status: user.kyc_status,
          cash_balance: portfolio.cash_balance || 0,
          invested_amount: portfolio.invested_amount || 0,
          free_margin: portfolio.free_margin || 0,
          total_value: portfolio.total_value || 0,
          last_sign_in_at: authData?.user?.last_sign_in_at || null
        };
      }));

      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      console.log('[Admin Operations] Sending users response:', {
        path,
        status: 200,
        userCount: usersWithAuth.length,
        totalCount
      });

      return new Response(JSON.stringify({ users: usersWithAuth, totalCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user detail by ID
    if (req.method === 'GET' && path.startsWith('/admin-operations/users/') && !path.endsWith('/balances')) {
      const userId = path.split('/')[3];

      const [
        { data: profile },
        { data: portfolio },
        { count: paymentMethodsCount },
        { data: recentTransactions },
        { data: recentTrades }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('portfolio_balances').select('*').eq('user_id', userId).single(),
        supabase.from('payment_methods').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);

      return new Response(JSON.stringify({
        profile,
        portfolio,
        paymentMethodsCount,
        recentTransactions,
        recentTrades
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update user balances
    if (req.method === 'PUT' && path.startsWith('/admin-operations/users/') && path.endsWith('/balances')) {
      const userId = path.split('/')[3];
      const { mode, cashBalance, investedAmount, freeMargin, reason } = await req.json();

      if (!reason || reason.trim() === '') {
        throw new Error('Reason is required for balance updates');
      }

      // Get current balances for audit
      const { data: currentBalance } = await supabase
        .from('portfolio_balances')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let newCashBalance, newInvestedAmount, newFreeMargin;

      if (mode === 'delta') {
        // Add to existing values
        newCashBalance = (parseFloat(currentBalance?.cash_balance || 0) + parseFloat(cashBalance || 0));
        newInvestedAmount = (parseFloat(currentBalance?.invested_amount || 0) + parseFloat(investedAmount || 0));
        newFreeMargin = (parseFloat(currentBalance?.free_margin || 0) + parseFloat(freeMargin || 0));
      } else {
        // Set absolute values (only update fields that are provided)
        newCashBalance = cashBalance !== undefined ? parseFloat(cashBalance) : parseFloat(currentBalance?.cash_balance || 0);
        newInvestedAmount = investedAmount !== undefined ? parseFloat(investedAmount) : parseFloat(currentBalance?.invested_amount || 0);
        newFreeMargin = freeMargin !== undefined ? parseFloat(freeMargin) : parseFloat(currentBalance?.free_margin || 0);
      }

      // Update or insert balances
      const { data: updatedBalance, error } = await supabase
        .from('portfolio_balances')
        .upsert({
          user_id: userId,
          cash_balance: newCashBalance,
          invested_amount: newInvestedAmount,
          free_margin: newFreeMargin,
          total_value: newCashBalance + newInvestedAmount,
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
            after: { cash_balance: newCashBalance, invested_amount: newInvestedAmount, free_margin: newFreeMargin },
            reason,
            mode
          }
        });

      return new Response(JSON.stringify(updatedBalance), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get KYC submissions
    if (req.method === 'GET' && (path === '/admin-operations/kyc' || path.endsWith('/kyc'))) {
      const status = url.searchParams.get('status') || 'pending';
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data: kycSubmissions, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, kyc_status, kyc_submitted_at, kyc_documents, kyc_rejection_reason')
        .eq('kyc_status', status)
        .order('kyc_submitted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', status);

      console.log('[Admin Operations] Sending KYC response:', {
        path,
        status: 200,
        submissionCount: kycSubmissions.length,
        totalCount
      });

      return new Response(JSON.stringify({ 
        submissions: kycSubmissions.map(k => ({ ...k, user_id: k.id })), 
        totalCount 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Approve KYC
    if (req.method === 'POST' && path.includes('/kyc/') && path.endsWith('/approve')) {
      const userId = path.split('/')[3];

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          kyc_reviewed_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_audits')
        .insert({
          admin_user_id: adminUser.id,
          action: 'kyc_approved',
          target_table: 'profiles',
          target_id: userId,
          meta: { status: 'approved' }
        });

      return new Response(JSON.stringify(updatedProfile), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Reject KYC
    if (req.method === 'POST' && path.includes('/kyc/') && path.endsWith('/reject')) {
      const userId = path.split('/')[3];
      const { reason } = await req.json();

      if (!reason || reason.trim() === '') {
        throw new Error('Rejection reason is required');
      }

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'rejected',
          kyc_rejection_reason: reason,
          kyc_reviewed_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_audits')
        .insert({
          admin_user_id: adminUser.id,
          action: 'kyc_rejected',
          target_table: 'profiles',
          target_id: userId,
          meta: { status: 'rejected', reason }
        });

      return new Response(JSON.stringify(updatedProfile), {
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