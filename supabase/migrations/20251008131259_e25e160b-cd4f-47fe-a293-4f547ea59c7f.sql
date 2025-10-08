-- Fix the handle_new_user trigger with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log the attempt
  RAISE LOG 'Creating profile and portfolio for user: %', NEW.id;
  
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
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    kyc_status = COALESCE(public.profiles.kyc_status, 'pending');
  
  -- Create initial portfolio balance
  INSERT INTO public.portfolio_balances (user_id, cash_balance, invested_amount, free_margin, total_value)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    cash_balance = COALESCE(public.portfolio_balances.cash_balance, 0),
    invested_amount = COALESCE(public.portfolio_balances.invested_amount, 0),
    free_margin = COALESCE(public.portfolio_balances.free_margin, 0),
    total_value = COALESCE(public.portfolio_balances.total_value, 0);
  
  RAISE LOG 'Successfully created profile and portfolio for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    -- Don't block signup, but log the error
    RETURN NEW;
END;
$function$;