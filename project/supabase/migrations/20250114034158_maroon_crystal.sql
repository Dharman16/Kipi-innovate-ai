/*
  # Update profile creation trigger
  
  1. Changes
    - Update trigger to handle empty metadata
    - Ensure profile is always created with at least an ID
  
  2. Security
    - Maintains existing RLS policies
    - Only system can create profiles through trigger
*/

-- Update the function that creates a profile to handle empty metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (no changes needed, but included for completeness)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();