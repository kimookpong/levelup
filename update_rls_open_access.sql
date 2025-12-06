-- =============================================
-- LevelUp - Update RLS to Open Access
-- =============================================
-- Run this script to remove permission restrictions
-- Everyone can SELECT, INSERT, UPDATE, DELETE
-- =============================================

-- ===================
-- USERS
-- ===================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Allow insert for auth callback" ON public.users;
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;

CREATE POLICY "Allow all access to users"
ON public.users FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- GAMES
-- ===================
DROP POLICY IF EXISTS "Public games are viewable by everyone" ON public.games;
DROP POLICY IF EXISTS "Allow public read access" ON public.games;
DROP POLICY IF EXISTS "Admins can insert games" ON public.games;
DROP POLICY IF EXISTS "Admins can update games" ON public.games;
DROP POLICY IF EXISTS "Admins can delete games" ON public.games;
DROP POLICY IF EXISTS "Allow all access to games" ON public.games;

CREATE POLICY "Allow all access to games"
ON public.games FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- PACKAGES
-- ===================
DROP POLICY IF EXISTS "Public packages are viewable by everyone" ON public.packages;
DROP POLICY IF EXISTS "Allow public read access" ON public.packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.packages;
DROP POLICY IF EXISTS "Allow all access to packages" ON public.packages;

CREATE POLICY "Allow all access to packages"
ON public.packages FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- TRANSACTIONS
-- ===================
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;

CREATE POLICY "Allow all access to transactions"
ON public.transactions FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- PROMOTIONS
-- ===================
DROP POLICY IF EXISTS "Everyone can view promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can insert promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can delete promotions" ON public.promotions;
DROP POLICY IF EXISTS "Allow all access to promotions" ON public.promotions;

CREATE POLICY "Allow all access to promotions"
ON public.promotions FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- CHAT_MESSAGES
-- ===================
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;

CREATE POLICY "Allow all access to chat_messages"
ON public.chat_messages FOR ALL
USING (true)
WITH CHECK (true);

-- ===================
-- GRANT FULL PERMISSIONS
-- ===================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

-- ===================
-- VERIFICATION
-- ===================
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
