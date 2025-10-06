-- Create trigger function to auto-create profile and portfolio on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with pending KYC status
  INSERT INTO public.profiles (id, email, full_name, kyc_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    ),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create initial portfolio balance
  INSERT INTO public.portfolio_balances (user_id, cash_balance, invested_amount, free_margin, total_value)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for portfolio_balances and profiles
ALTER TABLE portfolio_balances REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;