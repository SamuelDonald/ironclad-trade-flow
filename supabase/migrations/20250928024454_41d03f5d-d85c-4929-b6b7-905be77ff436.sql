-- Fix the overly permissive support_conversations policy
-- The current "Service role can manage all support data" policy allows any authenticated user
-- to access all support conversations because it has "true" condition for public role

-- Drop the problematic policy
DROP POLICY IF EXISTS "Service role can manage all support data" ON public.support_conversations;

-- Create a proper service role policy that only applies to service_role, not public
-- This policy will only be used by edge functions with service role access
CREATE POLICY "Admin operations via service role" 
ON public.support_conversations 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Ensure users can only delete their own conversations (was missing)
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.support_conversations;
CREATE POLICY "Users can delete their own conversations" 
ON public.support_conversations 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);