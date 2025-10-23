import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple, robust JSON parser
async function parseRequestBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text || !text.trim()) {
      return {};
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error('Invalid JSON in request body');
  }
}

// Admin verification
async function verifyAdmin(req: Request, supabase: any) {
  console.log('Starting admin verification...');
  
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    console.error('Missing authorization header');
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted, length:', token.length);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Token validation failed:', error);
    throw new Error('Invalid token');
  }

  console.log('User authenticated:', { userId: user.id, email: user.email });

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (adminError) {
    console.error('Admin verification error:', adminError);
    throw new Error('Failed to verify admin privileges');
  }

  if (!adminUser) {
    console.error('No admin user found for:', { userId: user.id, email: user.email });
    throw new Error('Access denied - admin privileges required');
  }

  console.log('Admin verified:', { adminId: adminUser.id, role: adminUser.role });
  return { user, adminUser };
}

// Validate balance update request
function validateBalanceUpdateRequest(body: any) {
  const errors: string[] = [];

  if (!body.userId || typeof body.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }

  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim() === '') {
    errors.push('reason is required and cannot be empty');
  }

  if (!body.mode || !['delta', 'absolute'].includes(body.mode)) {
    errors.push('mode must be either "delta" or "absolute"');
  }

  // At least one balance field must be provided
  const hasBalanceUpdate = body.cashBalance !== undefined || 
                          body.investedAmount !== undefined || 
                          body.freeMargin !== undefined;

  if (!hasBalanceUpdate) {
    errors.push('At least one balance field (cashBalance, investedAmount, freeMargin) must be provided');
  }

  return errors;
}

// Calculate new balances
function calculateNewBalances(
  currentBalances: any,
  updates: { cashBalance?: number; investedAmount?: number; freeMargin?: number },
  mode: 'delta' | 'absolute'
) {
  const current = {
    cash: parseFloat(currentBalances?.cash_balance || '0') || 0,
    invested: parseFloat(currentBalances?.invested_amount || '0') || 0,
    free: parseFloat(currentBalances?.free_margin || '0') || 0,
  };

  let newBalances;
  
  if (mode === 'delta') {
    newBalances = {
      cash: current.cash + (updates.cashBalance || 0),
      invested: current.invested + (updates.investedAmount || 0),
      free: current.free + (updates.freeMargin || 0),
    };
  } else {
    newBalances = {
      cash: updates.cashBalance !== undefined ? updates.cashBalance : current.cash,
      invested: updates.investedAmount !== undefined ? updates.investedAmount : current.invested,
      free: updates.freeMargin !== undefined ? updates.freeMargin : current.free,
    };
  }

  // Validate all values are finite numbers
  if (!Object.values(newBalances).every(val => Number.isFinite(val))) {
    throw new Error('Invalid numeric values in balance calculation');
  }

  return newBalances;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Balance-update function initialized:', {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      supabaseUrl: Deno.env.get('SUPABASE_URL')
    });

    // Verify admin access
    const { adminUser } = await verifyAdmin(req, supabase);

    // Parse request body
    const body = await parseRequestBody(req);
    console.log('Balance update request:', { 
      userId: body.userId, 
      mode: body.mode, 
      hasReason: !!body.reason,
      updates: {
        cashBalance: body.cashBalance,
        investedAmount: body.investedAmount,
        freeMargin: body.freeMargin
      }
    });

    // Validate request
    const validationErrors = validateBalanceUpdateRequest(body);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation failed', 
          details: validationErrors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { userId, reason, mode, cashBalance, investedAmount, freeMargin } = body;

    // Get current balances
    const { data: currentBalances, error: fetchError } = await supabase
      .from('portfolio_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching current balances:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch current balances',
          details: fetchError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate new balances
    const newBalances = calculateNewBalances(
      currentBalances,
      { cashBalance, investedAmount, freeMargin },
      mode
    );

    console.log('Balance calculation:', {
      current: currentBalances,
      new: newBalances,
      mode
    });

    // Update portfolio balances
    const { data: updatedBalances, error: updateError } = await supabase
      .from('portfolio_balances')
      .upsert({
        user_id: userId,
        cash_balance: newBalances.cash,
        invested_amount: newBalances.invested,
        free_margin: newBalances.free,
        total_value: newBalances.cash + newBalances.invested,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error updating balances:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update balances',
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log admin action (best effort, don't fail on audit log errors)
    try {
      await supabase.from('admin_audits').insert({
        admin_user_id: adminUser.id,
        action: 'balance_update',
        target_table: 'portfolio_balances',
        target_id: userId,
        meta: {
          before: currentBalances,
          after: updatedBalances,
          reason,
          mode,
          updates: { cashBalance, investedAmount, freeMargin }
        },
        created_at: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Failed to log audit entry:', auditError);
      // Continue - don't fail the operation for audit log issues
    }

    console.log('Balance update successful:', {
      userId,
      adminId: adminUser.id,
      newBalances
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedBalances,
        message: 'Balance updated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Balance update error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Access denied') ? 403 : 
                      errorMessage.includes('Invalid JSON') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
