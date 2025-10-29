import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin middleware function
async function requireAdmin(req: Request, supabase: any) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error('Invalid or expired token');
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Admin privileges required');
  }

  return { user, admin: adminUser };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user, admin } = await requireAdmin(req, supabase);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const query = url.searchParams.get('query') || '';
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let usersQuery = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at
        `)
        .range(offset, offset + limit - 1);

      if (query) {
        // Escape special characters to prevent SQL injection
        const sanitizedQuery = query.replace(/[%_]/g, '\\$&');
        usersQuery = usersQuery.or(`email.ilike.%${sanitizedQuery}%,full_name.ilike.%${sanitizedQuery}%`);
      }

      const { data: users, error: usersError } = await usersQuery;

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      // Log admin action
      await supabase.from('admin_audits').insert({
        admin_user_id: admin.id,
        action: 'list_users',
        target_table: 'profiles',
        meta: { query, limit, offset }
      });

      return new Response(
        JSON.stringify({ users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PUT') {
      const { userId, updates } = await req.json();
      
      if (!userId || !updates) {
        throw new Error('Missing userId or updates');
      }

      // Get user before update for audit
      const { data: beforeUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Update user profile
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }

      // Log admin action
      await supabase.from('admin_audits').insert({
        admin_user_id: admin.id,
        action: 'update_user',
        target_table: 'profiles',
        target_id: userId,
        meta: { 
          before: beforeUser,
          after: updatedUser,
          updates 
        }
      });

      return new Response(
        JSON.stringify({ user: updatedUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: errorMessage.includes('Admin privileges') ? 403 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});