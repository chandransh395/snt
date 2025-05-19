
-- Add is_super_admin column to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

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
DROP TRIGGER IF EXISTS on_user_role_created ON public.user_roles;

CREATE TRIGGER on_user_role_created
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.make_first_user_super_admin();

-- Create increment_bookings function if it doesn't exist
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
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE is_super_admin = TRUE) INTO super_admin_exists;
  
  IF NOT super_admin_exists THEN
    -- Make the first admin we find a super admin
    UPDATE public.user_roles
    SET is_super_admin = TRUE
    WHERE is_admin = TRUE
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
END
$$;
