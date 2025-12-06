-- 1. Create a secure function to check if a user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres),
-- bypassing RLS on the users table for the check.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Enable RLS on games table (if not already enabled)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow everyone to read games
DROP POLICY IF EXISTS "Allow public read access" ON public.games;
CREATE POLICY "Allow public read access"
ON public.games
FOR SELECT
USING (true);

-- 4. Policy: Allow admins to do EVERYTHING (Insert, Update, Delete)
DROP POLICY IF EXISTS "Allow admin full access" ON public.games;
CREATE POLICY "Allow admin full access"
ON public.games
FOR ALL
USING (
  public.is_admin()
);

-- 5. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE games_id_seq TO authenticated; -- If you use a sequence for IDs
