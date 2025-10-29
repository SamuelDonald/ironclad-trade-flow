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

    const { user, adminUser } = await requireAdmin(req, supabase);
    const url = new URL(req.url);
    const path = url.pathname;

    // GET /admin-support/conversations - Get all conversations
    if (req.method === 'GET' && path === '/admin-support/conversations') {
      const search = url.searchParams.get('search');
      
      let query = supabase
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
        .order('updated_at', { ascending: false });

      // If search is provided, filter by user
      if (search) {
        // Escape special characters to prevent SQL injection
        const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .or('email.ilike.%' + sanitizedSearch + '%,full_name.ilike.%' + sanitizedSearch + '%');
        
        const userIds = profiles?.map(p => p.id) || [];
        if (userIds.length > 0) {
          query = query.in('user_id', userIds);
        }
      }

      const { data: conversations, error } = await query;

      if (error) throw error;

      // Enrich conversations with user data
      const enrichedConversations = await Promise.all(
        (conversations || []).map(async (conv) => {
          let user_name = 'Unknown user';
          let user_email = 'No email';

          if (conv.user_id) {
            // Fetch user email from auth.users
            const { data: authUser } = await supabase.auth.admin.getUserById(conv.user_id);
            if (authUser?.user?.email) {
              user_email = authUser.user.email;
            }

            // Fetch full name from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', conv.user_id)
              .single();

            if (profile?.full_name) {
              user_name = profile.full_name;
            } else if (authUser?.user?.email) {
              user_name = authUser.user.email;
            }
          }

          return {
            ...conv,
            user_name,
            user_email
          };
        })
      );

      // Log admin action
      await supabase.from('admin_audits').insert({
        admin_user_id: adminUser.id,
        action: 'list_support_conversations',
        meta: { search: search || null }
      });

      return new Response(JSON.stringify(enrichedConversations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /admin-support/start - Start conversation with user
    if (req.method === 'POST' && path === '/admin-support/start') {
      const { user_id, subject, initial_message } = await req.json();

      if (!user_id || !subject || !initial_message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
          user_id,
          subject,
          status: 'open'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Insert initial admin message
      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversation.id,
          sender: 'admin',
          sender_id: user.id,
          body: initial_message
        });

      if (msgError) throw msgError;

      // Log admin action
      await supabase.from('admin_audits').insert({
        admin_user_id: adminUser.id,
        action: 'start_support_conversation',
        target_table: 'support_conversations',
        target_id: conversation.id,
        meta: { user_id, subject }
      });

      return new Response(
        JSON.stringify({ conversation_id: conversation.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /admin-support/conversations/:id - Reply to conversation
    if (req.method === 'POST' && path.startsWith('/admin-support/conversations/')) {
      const conversationId = path.split('/').pop();
      const { message, attachments } = await req.json();

      if (!message) {
        return new Response(
          JSON.stringify({ error: 'Message is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send admin reply
      const { data: newMessage, error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender: 'admin',
          sender_id: user.id,
          body: message,
          attachments: attachments || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Log admin action
      await supabase
        .from('admin_audits')
        .insert({
          admin_user_id: adminUser.id,
          action: 'support_reply',
          target_table: 'support_messages',
          target_id: newMessage.id,
          meta: { conversation_id: conversationId, message, has_attachments: !!attachments }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage === 'Access denied' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});