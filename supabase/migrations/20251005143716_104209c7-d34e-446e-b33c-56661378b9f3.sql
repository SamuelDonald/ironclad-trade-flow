-- Add KYC-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS kyc_reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS kyc_rejection_reason text,
ADD COLUMN IF NOT EXISTS kyc_documents jsonb DEFAULT '[]'::jsonb;

-- Add index for KYC status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status 
ON public.profiles(kyc_status) 
WHERE kyc_status = 'pending';

-- Enable realtime for portfolio_balances (check if already exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'portfolio_balances'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_balances;
  END IF;
END $$;

-- Enable realtime for profiles (check if already exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;