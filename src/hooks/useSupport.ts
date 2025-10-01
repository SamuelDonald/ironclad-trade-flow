import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupportConversation {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'admin' | string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const useSupport = () => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (subject: string, initialMessage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          subject,
          status: 'open'
        })
        .select()
        .single();

      if (convError) throw convError;

      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversation.id,
          sender: 'user',
          sender_id: user.id,
          body: initialMessage
        });

      if (msgError) throw msgError;

      await fetchConversations();
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender: 'user',
          sender_id: user.id,
          body: message
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      await fetchMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const uploadAttachment = async (conversationId: string, file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileName = `${user.id}/${conversationId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(fileName);

      return {
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscriptions
    const conversationsChannel = supabase
      .channel('support_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('support_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages'
        },
        (payload) => {
          // Only update if we're viewing this conversation
          const newRecord = payload.new as any;
          if (messages.length > 0 && newRecord?.conversation_id) {
            const currentConvId = messages[0]?.conversation_id;
            if (currentConvId === newRecord.conversation_id) {
              fetchMessages(newRecord.conversation_id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [messages]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    uploadAttachment
  };
};