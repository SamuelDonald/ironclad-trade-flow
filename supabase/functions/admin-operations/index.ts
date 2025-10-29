import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// safeParseReqJson helper — robust JSON parsing for request bodies
async function safeParseReqJson(req: Request) {
  try {
    const text = await req.text();
    if (!text || !text.trim()) return {}; // empty body
    try {
      return JSON.parse(text);
    } catch (parseErr: any) {
      console.error('safeParseReqJson: invalid JSON', { 
        message: parseErr.message, 
        rawPreview: text.slice(0, 200),
        headers: {
          contentType: req.headers.get('content-type'),
          contentLength: req.headers.get('content-length')
        }
      });
      // throw to be handled by caller or return special error object — we prefer throwing so caller returns a response
      throw new Error('Invalid JSON in request body');
    }
  } catch (err) {
    console.error('safeParseReqJson: read error', err);
    throw new Error('Failed to read request body');
  }
}

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
    .eq('user_id', user.id)
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
    
    // Parse request body or URL for action-based routing
    let body: any = {};
    let action = '';
    
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        console.log('[Admin Operations] About to parse request body...');
        console.log('[Admin Operations] Request headers:', {
          contentType: req.headers.get('content-type'),
          contentLength: req.headers.get('content-length'),
          authorization: req.headers.get('authorization') ? 'Present' : 'Missing'
        });
        
        // Use safe JSON parsing to prevent "Unexpected end of JSON input" errors
        try {
          body = await safeParseReqJson(req);
          console.log('[Admin Operations] Request body parsed successfully:', {
            hasBody: !!body,
            action: body?.action,
            userId: body?.userId,
            hasReason: !!body?.reason,
            bodyKeys: body ? Object.keys(body) : []
          });
        } catch (jsonError) {
          console.error('[Admin Operations] JSON parsing error:', jsonError);
          return new Response(
            JSON.stringify({ 
              ok: false,
              error: 'Invalid JSON in request body',
              details: jsonError instanceof Error ? jsonError.message : 'Failed to parse request body as JSON',
              debugInfo: {
                method: req.method,
                contentType: req.headers.get('content-type'),
                contentLength: req.headers.get('content-length')
              }
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        if (!body) {
          console.error('[Admin Operations] CRITICAL: Empty request body after parsing!');
          return new Response(
            JSON.stringify({ 
              ok: false,
              error: 'Empty request body',
              details: 'The request body is empty. Expected JSON with action, userId, reason, etc.'
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        action = body.action || '';
        
  console.log('[Admin Operations] Request parsed successfully:', {
    method: req.method,
    action,
    timestamp: new Date().toISOString()
  });

  // Safeguard: Check if action is present for POST requests
  if (req.method === 'POST' && (!action || action === '')) {
    console.error('[Admin Operations] No action found in request body:', {
      bodyKeys: Object.keys(body),
      bodyContent: JSON.stringify(body).substring(0, 200),
      method: req.method,
      path
    });
    return new Response(
      JSON.stringify({ 
        ok: false,
        error: 'Missing required field: action',
        details: 'POST requests must include an "action" field in the request body',
        validActions: ['overview', 'users', 'transactions', 'approve-kyc', 'reject-kyc', 'user-details', 'update-balances'],
        receivedBody: body
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
        
        console.log('[Admin Operations] Request body:', {
          action,
          hasUserId: !!body.userId,
          hasReason: !!body.reason,
          bodyKeys: Object.keys(body),
          fullBody: JSON.stringify(body)
        });
      } catch (parseError: any) {
        console.error('[Admin Operations] CRITICAL JSON parse error:', {
          error: parseError.message,
          stack: parseError.stack,
          errorType: parseError.constructor.name
        });
        return new Response(
          JSON.stringify({ 
            ok: false,
            error: 'Invalid JSON in request body',
            details: parseError.message,
            errorType: parseError.constructor.name,
            stack: parseError.stack,
            debugInfo: {
              method: req.method,
              contentType: req.headers.get('content-type'),
              contentLength: req.headers.get('content-length')
            }
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // For GET requests, check URL path
      if (path.endsWith('/overview')) action = 'overview';
      else if (path.endsWith('/users') && !path.includes('/users/')) action = 'users';
      else if (path.endsWith('/kyc') && !path.includes('/kyc/')) action = 'kyc';
      else if (path.endsWith('/transactions')) action = 'transactions';
      else if (path.endsWith('/trades')) action = 'trades';
    }

    console.log('[Admin Operations] Admin verified:', {
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Get overview data
    if (action === 'overview') {
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
        supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      // Fetch user emails for recent trades
      const userIds = [...new Set(recentTrades?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Map trades with user data
      const tradesWithUsers = recentTrades?.map(trade => ({
        ...trade,
        profiles: profiles?.find(p => p.id === trade.user_id) || null
      })) || [];

      const responseData = {
        totalUsers,
        totalTrades,
        totalTransactions,
        pendingKYC: pendingKycCount,
        pendingDeposits: pendingDepositsCount,
        pendingWithdrawals: pendingWithdrawalsCount,
        recentTrades: tradesWithUsers
      };

      console.log('[Admin Operations] Sending overview response:', {
        action,
        status: 200,
        dataKeys: Object.keys(responseData)
      });

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get users with portfolio data and search/pagination
    if (action === 'users') {
      const searchQuery = body.search || '';
      const limit = body.limit || 20;
      const offset = body.offset || 0;

      let query = supabase
        .from('profiles')
        .select('*');

      if (searchQuery) {
        // Escape special characters to prevent SQL injection
        const sanitizedQuery = searchQuery.replace(/[%_]/g, '\\$&');
        query = query.or('full_name.ilike.%' + sanitizedQuery + '%,email.ilike.%' + sanitizedQuery + '%');
      }

      const { data: users, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch portfolio balances for these users
      const userIds = users.map(u => u.id);
      const { data: portfolios } = await supabase
        .from('portfolio_balances')
        .select('*')
        .in('user_id', userIds);

      // Get last_sign_in_at from auth.users
      const usersWithAuth = await Promise.all(users.map(async (user) => {
        const { data: authData } = await supabase.auth.admin.getUserById(user.id);
        const portfolio = portfolios?.find(p => p.user_id === user.id) || {};
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
        action,
        status: 200,
        userCount: usersWithAuth.length,
        totalCount
      });

      return new Response(JSON.stringify({ users: usersWithAuth, totalCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Approve KYC (action-based)
    if (action === 'approve-kyc' && body.userId) {
      const userId = body.userId;

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          kyc_reviewed_at: new Date().toISOString(),
          kyc_rejection_reason: null
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('admin_audits').insert({
        admin_user_id: adminUser.id,
        action: 'kyc_approved',
        target_table: 'profiles',
        target_id: userId,
        meta: { status: 'approved' }
      });

      console.log('[Admin Operations] KYC approved:', { userId });

      return new Response(JSON.stringify(updatedProfile), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Reject KYC (action-based)
    if (action === 'reject-kyc' && body.userId && body.reason) {
      const userId = body.userId;
      const reason = body.reason;

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

      await supabase.from('admin_audits').insert({
        admin_user_id: adminUser.id,
        action: 'kyc_rejected',
        target_table: 'profiles',
        target_id: userId,
        meta: { status: 'rejected', reason }
      });

      console.log('[Admin Operations] KYC rejected:', { userId, reason });

      return new Response(JSON.stringify(updatedProfile), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user detail by ID (action-based)
    if (action === 'user-details' && body.userId) {
      const userId = body.userId;

      const [
        { data: profile },
        { data: portfolio, error: portfolioError },
        { data: paymentMethods },
        { data: recentTransactions },
        { data: recentTrades }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('portfolio_balances').select('cash_balance, invested_amount, free_margin, total_value, daily_change, daily_change_percent').eq('user_id', userId).maybeSingle(),
        supabase.from('payment_methods').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);

      // If no portfolio exists, create one with default values
      let finalPortfolio = portfolio;
      if (!portfolio && !portfolioError) {
        const { data: newPortfolio } = await supabase
          .from('portfolio_balances')
          .insert({
            user_id: userId,
            cash_balance: 0,
            invested_amount: 0,
            free_margin: 0,
            total_value: 0,
            daily_change: 0,
            daily_change_percent: 0
          })
          .select('cash_balance, invested_amount, free_margin, total_value, daily_change, daily_change_percent')
          .single();
        
        finalPortfolio = newPortfolio;
        console.log('[Admin Operations] Created new portfolio for user:', userId);
      }

      console.log('[Admin Operations] Sending user details response:', {
        action,
        status: 200,
        userId,
        hasProfile: !!profile,
        hasPortfolio: !!finalPortfolio,
        portfolioFields: finalPortfolio ? Object.keys(finalPortfolio) : []
      });

      return new Response(JSON.stringify({
        profile,
        portfolio: finalPortfolio,
        paymentMethods,
        recentTransactions,
        recentTrades
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user detail by ID (legacy path-based)
    if (req.method === 'GET' && path.startsWith('/admin-operations/users/') && !path.endsWith('/balances')) {
      const userId = path.split('/')[3];

      const [
        { data: profile },
        { data: portfolio, error: portfolioError },
        { data: paymentMethods },
        { data: recentTransactions },
        { data: recentTrades }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('portfolio_balances').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('payment_methods').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);

      // If no portfolio exists, create one with default values
      let finalPortfolio = portfolio;
      if (!portfolio && !portfolioError) {
        const { data: newPortfolio } = await supabase
          .from('portfolio_balances')
          .insert({
            user_id: userId,
            cash_balance: 0,
            invested_amount: 0,
            free_margin: 0,
            total_value: 0,
            daily_change: 0,
            daily_change_percent: 0
          })
          .select()
          .single();
        
        finalPortfolio = newPortfolio;
      }

      return new Response(JSON.stringify({
        profile,
        portfolio: finalPortfolio,
        paymentMethods,
        recentTransactions,
        recentTrades
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Balance updates are now handled by the dedicated balance-update edge function
    // This endpoint is deprecated and should not be used
    if ((req.method === 'PUT' && path.startsWith('/admin-operations/users/') && path.endsWith('/balances')) || 
        action === 'update-balances') {
      
      console.warn('[Admin Operations] Balance update endpoint is deprecated. Use balance-update function instead.');
      
        return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'This endpoint is deprecated. Please use the balance-update edge function instead.',
          migration: 'Use supabase.functions.invoke("balance-update", { body: { userId, mode, reason, ...updates } })'
        }),
        { 
          status: 410, // Gone - resource is no longer available
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
      );
    }

    // Removed duplicate action-based handler - now consolidated above

    // Get KYC submissions (action-based)
    if (action === 'kyc') {
      const status = body.status || 'pending';
      const page = body.page || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const { data: kycSubmissions, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, kyc_status, kyc_submitted_at, kyc_documents, kyc_rejection_reason, phone, address')
        .eq('kyc_status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', status);

      console.log('[Admin Operations] Sending KYC response:', {
        action,
        status: 200,
        kycStatus: status,
        submissionCount: kycSubmissions?.length || 0,
        totalCount
      });

      return new Response(JSON.stringify({ 
        submissions: kycSubmissions?.map(k => ({ ...k, user_id: k.id })) || [], 
        totalCount: totalCount || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get KYC submissions (legacy path-based)
    if (req.method === 'GET' && (path === '/admin-operations/kyc' || path.endsWith('/kyc'))) {
      const status = url.searchParams.get('status') || 'pending';
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data: kycSubmissions, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, kyc_status, kyc_submitted_at, kyc_documents, kyc_rejection_reason, phone, address')
        .eq('kyc_status', status)
        .order('created_at', { ascending: false })
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
      const { reason } = body;

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

    // Get all transactions (action-based)
    if (action === 'transactions') {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(transactions?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Map transactions with user data
      const transactionsWithUsers = transactions?.map(transaction => ({
        ...transaction,
        profiles: profiles?.find(p => p.id === transaction.user_id) || null
      })) || [];

      console.log('[Admin Operations] Sending transactions response:', {
        action,
        status: 200,
        transactionCount: transactionsWithUsers.length
      });

      return new Response(JSON.stringify(transactionsWithUsers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all transactions (legacy path-based)
    if (req.method === 'GET' && path === '/admin-operations/transactions') {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(transactions?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Map transactions with user data
      const transactionsWithUsers = transactions?.map(transaction => ({
        ...transaction,
        profiles: profiles?.find(p => p.id === transaction.user_id) || null
      })) || [];

      return new Response(JSON.stringify(transactionsWithUsers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all trades
    if (req.method === 'GET' && path === '/admin-operations/trades') {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(trades?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Map trades with user data
      const tradesWithUsers = trades?.map(trade => ({
        ...trade,
        profiles: profiles?.find(p => p.id === trade.user_id) || null
      })) || [];

      return new Response(JSON.stringify(tradesWithUsers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Health check endpoint
    if (req.method === 'GET' && path === '/admin-operations') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        service: 'admin-operations',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If we reach here, no valid action or route was matched
    console.error('[Admin Operations] No matching route found:', {
      method: req.method,
      path,
      action,
      bodyKeys: Object.keys(body || {})
    });

    return new Response(JSON.stringify({ 
      error: 'Route not found',
      details: `No handler found for ${req.method} ${path} with action: ${action || 'none'}`,
      validRoutes: {
        POST: ['overview', 'users', 'transactions', 'approve-kyc', 'reject-kyc', 'user-details'],
        GET: ['/admin-operations', '/admin-operations/users', '/admin-operations/transactions', '/admin-operations/trades', '/admin-operations/users/{userId}']
      }
    }), {
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