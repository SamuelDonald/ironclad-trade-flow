-- Enhance admin_users table security
-- Fix the RLS policies to ensure proper service role access

-- Drop the current policy
DROP POLICY IF EXISTS "Admin users only accessible via service role" ON public.admin_users;

-- Create explicit service role policy with proper access control
CREATE POLICY "Service role admin access only" 
ON public.admin_users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Ensure no other roles can access this table
CREATE POLICY "Block all non-service access to admin users" 
ON public.admin_users 
FOR ALL 
TO authenticated, anon 
USING (false) 
WITH CHECK (false);

-- Create a safer view for admin operations that masks sensitive data
CREATE OR REPLACE VIEW public.admin_user_safe AS
SELECT 
    id,
    user_id,
    role,
    -- Mask email for safer operations
    CASE 
        WHEN LENGTH(email) > 0 THEN 
            LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2)
        ELSE 
            'masked'
    END as masked_email,
    meta,
    created_at,
    updated_at
FROM public.admin_users;

-- Restrict view access to service role only
ALTER VIEW public.admin_user_safe OWNER TO postgres;
REVOKE ALL ON public.admin_user_safe FROM PUBLIC;
GRANT SELECT ON public.admin_user_safe TO service_role;

-- Create a simple admin verification function
CREATE OR REPLACE FUNCTION public.is_admin_user(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE email = _email
    );
$$;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION public.is_admin_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user(text) TO service_role;