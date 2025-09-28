-- Create admin users table for centralized admin authorization
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'superadmin',
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin audit log table for tracking all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market assets table for admin management
CREATE TABLE IF NOT EXISTS public.market_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'stocks', 'forex', 'crypto'
  active BOOLEAN DEFAULT true,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users (only accessible via service role)
CREATE POLICY "Admin users only accessible via service role" 
ON public.admin_users FOR ALL 
USING (false);

-- RLS policies for admin_audits (only accessible via service role)
CREATE POLICY "Admin audits only accessible via service role" 
ON public.admin_audits FOR ALL 
USING (false);

-- RLS policies for market_assets (read-only for authenticated users, full access via service role)
CREATE POLICY "Market assets are viewable by authenticated users" 
ON public.market_assets FOR SELECT 
TO authenticated
USING (active = true);

CREATE POLICY "Market assets managed via service role" 
ON public.market_assets FOR ALL 
USING (false);

-- Create updated_at trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for market_assets
CREATE TRIGGER update_market_assets_updated_at
BEFORE UPDATE ON public.market_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the initial admin user
INSERT INTO public.admin_users (email, role)
VALUES ('ictradehub@gmail.com', 'superadmin')
ON CONFLICT (email) DO NOTHING;