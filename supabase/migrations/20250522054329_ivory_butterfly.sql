/*
  # Add super admin functionality

  1. New Columns
    - Add `is_super_admin` column to `user_roles` table

  2. Functions
    - Create function to make first user a super admin
    - Create function to increment bookings count

  3. Triggers
    - Create trigger for making first user super admin

  4. Data Updates
    - Make existing admin into super admin if none exists
*/

-- Drop existing trigger and function if they exist to ensure clean state
DROP TRIGGER IF EXISTS on_user_role_created ON public.user_roles;
DROP FUNCTION IF EXISTS public.make_first_user_super_admin();
DROP FUNCTION IF EXISTS public.increment_bookings(INTEGER);

-- Add is_super_admin column to user_roles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_roles'
    AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE public.user_roles
    ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create a function to make the first user a super admin
CREATE OR REPLACE FUNCTION public.make_first_user_super_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  IF user_count = 1 THEN
    UPDATE public.user_roles
    SET is_super_admin = TRUE
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to make the first user a super admin
CREATE TRIGGER on_user_role_created
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.make_first_user_super_admin();

-- Create increment_bookings function
CREATE OR REPLACE FUNCTION public.increment_bookings(destination_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.destinations
  SET bookings_count = bookings_count + 1
  WHERE id = destination_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make existing admin into a super admin if none exists
DO $$
DECLARE
  super_admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE is_super_admin = TRUE
  ) INTO super_admin_exists;
  
  IF NOT super_admin_exists THEN
    UPDATE public.user_roles
    SET is_super_admin = TRUE
    WHERE is_admin = TRUE
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
END $$;