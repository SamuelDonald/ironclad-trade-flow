-- Fix the overly permissive support_messages policy
-- The current "Service role can manage all support messages" policy allows any authenticated user
-- to access all support messages because it has "true" condition for public role

-- Drop the problematic policy
DROP POLICY IF EXISTS "Service role can manage all support messages" ON public.support_messages;

-- Create a proper service role policy that only applies to service_role, not public
-- This policy will only be used by edge functions with service role access
CREATE POLICY "Admin operations via service role" 
ON public.support_messages 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Add missing UPDATE and DELETE policies for users to manage their own messages
-- Users should be able to edit/delete messages in their own conversations
CREATE POLICY "Users can update messages in their conversations" 
ON public.support_messages 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 
    FROM support_conversations 
    WHERE support_conversations.id = support_messages.conversation_id 
    AND support_conversations.user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in their conversations" 
ON public.support_messages 
FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 
    FROM support_conversations 
    WHERE support_conversations.id = support_messages.conversation_id 
    AND support_conversations.user_id = auth.uid()
));