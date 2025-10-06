-- Phase 3: Strengthen Admin Security

-- Step 1: Update existing admin_users records to link user_id
UPDATE admin_users 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = admin_users.email
  LIMIT 1
)
WHERE user_id IS NULL;

-- Step 2: Make user_id NOT NULL and add unique constraint
ALTER TABLE admin_users 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE admin_users 
ADD CONSTRAINT unique_admin_user_id UNIQUE (user_id);

-- Step 3: Create app_role enum (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'moderator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 4: Create secure admin check function using security definer
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;