-- Enable RLS on games table
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to view games
DROP POLICY IF EXISTS "Allow public read access" ON public.games;
CREATE POLICY "Allow public read access"
ON public.games
FOR SELECT
USING (true);

-- Policy to allow admins to insert, update, delete games
DROP POLICY IF EXISTS "Allow admin full access" ON public.games;
CREATE POLICY "Allow admin full access"
ON public.games
FOR ALL
USING (
  public.is_admin()
);
