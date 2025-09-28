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

    if (req.method === 'GET' && path === '/admin-support/conversations') {
      // Get all support conversations
      const { data: conversations, error } = await supabase
        .from('support_conversations')
        .select(`
          *,
          support_messages(
            id,
            sender,
            body,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(conversations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && path.startsWith('/admin-support/conversations/')) {
      const conversationId = path.split('/').pop();
      const { message } = await req.json();

      // Send admin reply
      const { data: newMessage, error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender: 'admin',
          sender_id: adminUser.user_id,
          body: message
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_audits')
        .insert({
          admin_user_id: adminUser.id,
          action: 'support_reply',
          target_table: 'support_messages',
          target_id: newMessage.id,
          meta: { conversation_id: conversationId, message }
        });

      return new Response(JSON.stringify(newMessage), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-support:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Access denied' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});