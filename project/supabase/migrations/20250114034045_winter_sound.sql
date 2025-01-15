/*
  # Add profile creation trigger
  
  1. Changes
    - Add trigger to automatically create a profile when a user signs up
    - Add function to handle the profile creation
  
  2. Security
    - Maintains existing RLS policies
    - Only system can create profiles through trigger
*/

-- Create the function that creates a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();