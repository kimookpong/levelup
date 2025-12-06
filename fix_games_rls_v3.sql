-- =============================================
-- COMPLETE RLS POLICIES FOR ALL TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. HELPER FUNCTION: is_admin()
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- =============================================
-- 2. USERS TABLE
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Allow insert for auth callback" ON public.users;
DROP POLICY IF EXISTS "Service role can do anything" ON public.users;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.users FOR SELECT
USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.users FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow insert for auth callback (when user signs up)
CREATE POLICY "Allow insert for auth callback"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- =============================================
-- 3. GAMES TABLE
-- =============================================
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public games are viewable by everyone" ON public.games;
DROP POLICY IF EXISTS "Allow public read access" ON public.games;
DROP POLICY IF EXISTS "Allow admin full access" ON public.games;
DROP POLICY IF EXISTS "Admins can insert games" ON public.games;
DROP POLICY IF EXISTS "Admins can update games" ON public.games;
DROP POLICY IF EXISTS "Admins can delete games" ON public.games;

-- Everyone can read games
CREATE POLICY "Allow public read access"
ON public.games FOR SELECT
USING (true);

-- Admins can INSERT games
CREATE POLICY "Admins can insert games"
ON public.games FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can UPDATE games
CREATE POLICY "Admins can update games"
ON public.games FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can DELETE games
CREATE POLICY "Admins can delete games"
ON public.games FOR DELETE
USING (public.is_admin());

-- Grant permissions
GRANT SELECT ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;

-- =============================================
-- 4. PACKAGES TABLE
-- =============================================
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public packages are viewable by everyone" ON public.packages;
DROP POLICY IF EXISTS "Allow public read access" ON public.packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.packages;

-- Everyone can read packages
CREATE POLICY "Allow public read access"
ON public.packages FOR SELECT
USING (true);

-- Admins can INSERT packages
CREATE POLICY "Admins can insert packages"
ON public.packages FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can UPDATE packages
CREATE POLICY "Admins can update packages"
ON public.packages FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can DELETE packages
CREATE POLICY "Admins can delete packages"
ON public.packages FOR DELETE
USING (public.is_admin());

-- Grant permissions
GRANT SELECT ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;

-- =============================================
-- 5. TRANSACTIONS TABLE
-- =============================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions (when making a purchase)
CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.is_admin());

-- Admins can update all transactions (change status, etc.)
CREATE POLICY "Admins can update all transactions"
ON public.transactions FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can insert transactions (manual entry)
CREATE POLICY "Admins can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can delete transactions
CREATE POLICY "Admins can delete transactions"
ON public.transactions FOR DELETE
USING (public.is_admin());

-- Grant permissions
GRANT SELECT, INSERT ON public.transactions TO authenticated;

-- =============================================
-- 6. PROMOTIONS TABLE
-- =============================================
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can insert promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can delete promotions" ON public.promotions;

-- Everyone can view promotions (to validate codes)
CREATE POLICY "Everyone can view promotions"
ON public.promotions FOR SELECT
USING (true);

-- Admins can INSERT promotions
CREATE POLICY "Admins can insert promotions"
ON public.promotions FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can UPDATE promotions
CREATE POLICY "Admins can update promotions"
ON public.promotions FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can DELETE promotions
CREATE POLICY "Admins can delete promotions"
ON public.promotions FOR DELETE
USING (public.is_admin());

-- Grant permissions
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;

-- =============================================
-- 7. CHAT_MESSAGES TABLE
-- =============================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.chat_messages;

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (public.is_admin());

-- Admins can insert messages (reply to users)
CREATE POLICY "Admins can insert messages"
ON public.chat_messages FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can update messages (mark as read, etc.)
CREATE POLICY "Admins can update messages"
ON public.chat_messages FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can delete messages
CREATE POLICY "Admins can delete messages"
ON public.chat_messages FOR DELETE
USING (public.is_admin());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;

-- =============================================
-- 8. HELPER FUNCTION: get_chat_users (for Admin Chat)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_chat_users()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  avatar_url text,
  last_message_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (u.id)
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    MAX(cm.created_at) as last_message_at
  FROM public.users u
  JOIN public.chat_messages cm ON u.id = cm.sender_id OR u.id = cm.receiver_id
  WHERE u.role != 'admin' -- Exclude admins from the list
  GROUP BY u.id
  ORDER BY u.id, MAX(cm.created_at) DESC;
END;
$$;

-- =============================================
-- VERIFICATION QUERIES (Run these to test)
-- =============================================
-- Check if you're an admin:
-- SELECT public.is_admin();

-- Check policies on games table:
-- SELECT * FROM pg_policies WHERE tablename = 'games';

-- Check policies on all tables:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

