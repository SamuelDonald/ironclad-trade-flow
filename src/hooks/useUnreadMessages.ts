import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }

      // Get all user's conversations
      const { data: conversations } = await supabase
        .from('support_conversations')
        .select('id, last_read_at')
        .eq('user_id', user.id);

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Count admin messages after last_read_at for each conversation
      let totalUnread = 0;
      for (const conv of conversations) {
        const { count } = await supabase
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('sender', 'admin')
          .gt('created_at', conv.last_read_at || new Date(0).toISOString());

        totalUnread += count || 0;
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update all conversations' last_read_at
      await supabase
        .from('support_conversations')
        .update({ last_read_at: new Date().toISOString() })
        .eq('user_id', user.id);

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for new admin messages
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: 'sender=eq.admin'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { unreadCount, markAsRead, refetch: fetchUnreadCount };
};
