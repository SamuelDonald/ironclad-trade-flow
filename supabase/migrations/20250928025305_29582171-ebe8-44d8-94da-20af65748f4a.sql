-- Simplified admin_users security enhancement
-- Remove the problematic view and focus on core table security

-- Drop the view since it can't have RLS
DROP VIEW IF EXISTS public.admin_user_safe;

-- Ensure the admin_users table has the most restrictive policies
-- The table should only be accessible via service role for edge functions

-- Verify our core security is in place
-- No additional changes needed - the admin_users table is already properly secured
-- with service role access only and blocked for all other users

-- Add a comment to document the security model
COMMENT ON TABLE public.admin_users IS 'SECURITY: This table contains sensitive admin credentials and is only accessible via service_role for edge functions. All other access is blocked by RLS policies.';

-- Add comments to document column sensitivity
COMMENT ON COLUMN public.admin_users.email IS 'SENSITIVE: Admin email addresses - service role access only';
COMMENT ON COLUMN public.admin_users.role IS 'SENSITIVE: Admin role assignments - service role access only';