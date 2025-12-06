-- =============================================
-- LevelUp Game Top-up Platform
-- Complete Database Initialization Script
-- (NO PERMISSION RESTRICTIONS)
-- =============================================
-- Run this script in Supabase SQL Editor to set up
-- the entire database from scratch.
-- =============================================

-- =============================================
-- SECTION 1: EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SECTION 2: DROP EXISTING TABLES (if re-initializing)
-- =============================================
-- WARNING: This will delete all data!
-- Uncomment ALL lines below to reset the database completely

-- DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
-- DROP POLICY IF EXISTS "Allow all access to games" ON public.games;
-- DROP POLICY IF EXISTS "Allow all access to packages" ON public.packages;
-- DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;
-- DROP POLICY IF EXISTS "Allow all access to promotions" ON public.promotions;
-- DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;

-- DROP TABLE IF EXISTS public.chat_messages CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.promotions CASCADE;
-- DROP TABLE IF EXISTS public.packages CASCADE;
-- DROP TABLE IF EXISTS public.games CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP FUNCTION IF EXISTS public.is_admin();
-- DROP FUNCTION IF EXISTS public.get_chat_users();

-- =============================================
-- SECTION 3: CREATE TABLES
-- =============================================

-- 3.1 Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 Games Table
CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.3 Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'THB',
  bonus_details text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.4 Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  game_id uuid REFERENCES public.games(id),
  package_id uuid REFERENCES public.packages(id),
  player_id text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_method text,
  omise_charge_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 Promotions Table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.6 Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id),
  receiver_id uuid REFERENCES public.users(id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- SECTION 4: CREATE INDEXES (for better performance)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_active ON public.games(active);
CREATE INDEX IF NOT EXISTS idx_packages_game_id ON public.packages(game_id);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(active);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON public.promotions(code);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- =============================================
-- SECTION 5: HELPER FUNCTIONS
-- =============================================

-- 5.1 is_admin() - Check if current user is admin
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

-- 5.2 get_chat_users() - Get list of users who have chatted (for admin)
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
  RETURN QUERY
  SELECT DISTINCT ON (u.id)
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    MAX(cm.created_at) as last_message_at
  FROM public.users u
  JOIN public.chat_messages cm ON u.id = cm.sender_id OR u.id = cm.receiver_id
  WHERE u.role != 'admin'
  GROUP BY u.id
  ORDER BY u.id, MAX(cm.created_at) DESC;
END;
$$;

-- =============================================
-- SECTION 6: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTION 7: RLS POLICIES (OPEN ACCESS - NO RESTRICTIONS)
-- =============================================
-- All tables allow full CRUD access to everyone (authenticated and anonymous)

-- ===================
-- 7.1 USERS POLICIES
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
-- 7.2 GAMES POLICIES
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
-- 7.3 PACKAGES POLICIES
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
-- 7.4 TRANSACTIONS POLICIES
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
-- 7.5 PROMOTIONS POLICIES
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
-- 7.6 CHAT_MESSAGES POLICIES
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

-- =============================================
-- SECTION 8: GRANT FULL PERMISSIONS
-- =============================================

-- Grant to anon (public/unauthenticated users)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon;

-- Grant to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

-- =============================================
-- SECTION 9: SEED DATA (Sample Games)
-- =============================================
-- Uncomment to insert sample games

INSERT INTO public.games (name, slug, image_url, active) VALUES
('Teamfight Tactics Mobile', 'tft-mobile', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Where Winds Meet', 'where-winds-meet', 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000', true),
('ROM: Classic', 'rom-classic', 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000', true),
('Lineage 2M', 'lineage-2m', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Sword of Justice', 'sword-of-justice', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('Seven Knights Re:Birth', 'seven-knights-rebirth', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000', true),
('Bleach: Soul Resonance', 'bleach-soul-resonance', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true),
('Delta Force PC', 'delta-force-pc', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1000', true),
('Free Fire (TH)', 'free-fire-th', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000', true),
('RoV (TH)', 'rov-th', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Ghost Soul M (TH)', 'ghost-soul-m-th', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000', true),
('Path of Exile 2', 'path-of-exile-2', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Racing Master', 'racing-master', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true),
('Crystal of Atlan', 'crystal-of-atlan', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('Black Desert Online PC', 'black-desert-online-pc', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Genshin Impact', 'genshin-impact', 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000', true),
('Honkai: Star Rail', 'honkai-star-rail', 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=1000', true),
('Valorant TH', 'valorant-th', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Mobile Legends: Bang Bang', 'mobile-legends', 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=1000', true),
('Ragnarok Online', 'ragnarok-online', 'https://images.unsplash.com/photo-1531297461136-82lw9b285bb6?auto=format&fit=crop&q=80&w=1000', true),
('PUBG Mobile (TH)', 'pubg-mobile-th', 'https://images.unsplash.com/photo-1593305841991-05c29736f87e?auto=format&fit=crop&q=80&w=1000', true),
('Point Blank', 'point-blank', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', true),
('Zenless Zone Zero', 'zenless-zone-zero', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000', true),
('Dragonica Origin', 'dragonica-origin', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000', true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SECTION 10: SEED PACKAGES FOR ROV
-- =============================================
DO $$
DECLARE
  target_game_id uuid;
BEGIN
  SELECT id INTO target_game_id FROM public.games WHERE slug = 'rov-th';

  IF target_game_id IS NOT NULL THEN
    INSERT INTO public.packages (game_id, name, price, active) VALUES
    (target_game_id, '37 Coupons', 35, true),
    (target_game_id, '115 Coupons', 100, true),
    (target_game_id, '240 Coupons', 200, true),
    (target_game_id, '370 Coupons', 300, true),
    (target_game_id, '610 Coupons', 500, true),
    (target_game_id, '1,250 Coupons', 1000, true),
    (target_game_id, '2,550 Coupons', 2000, true),
    (target_game_id, '3,900 Coupons', 3000, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Seeded packages for ROV (TH)';
  END IF;
END $$;

-- =============================================
-- SECTION 11: SEED PACKAGES FOR FREE FIRE
-- =============================================
DO $$
DECLARE
  target_game_id uuid;
BEGIN
  SELECT id INTO target_game_id FROM public.games WHERE slug = 'free-fire-th';

  IF target_game_id IS NOT NULL THEN
    INSERT INTO public.packages (game_id, name, price, active) VALUES
    (target_game_id, '50 Diamonds', 19, true),
    (target_game_id, '100 Diamonds', 35, true),
    (target_game_id, '310 Diamonds', 99, true),
    (target_game_id, '520 Diamonds', 169, true),
    (target_game_id, '1,060 Diamonds', 329, true),
    (target_game_id, '2,180 Diamonds', 659, true),
    (target_game_id, '5,600 Diamonds', 1649, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Seeded packages for Free Fire (TH)';
  END IF;
END $$;

-- =============================================
-- SECTION 12: SEED PACKAGES FOR GENSHIN IMPACT
-- =============================================
DO $$
DECLARE
  target_game_id uuid;
BEGIN
  SELECT id INTO target_game_id FROM public.games WHERE slug = 'genshin-impact';

  IF target_game_id IS NOT NULL THEN
    INSERT INTO public.packages (game_id, name, price, active) VALUES
    (target_game_id, '60 Genesis Crystals', 35, true),
    (target_game_id, '300 Genesis Crystals', 169, true),
    (target_game_id, '980 Genesis Crystals', 499, true),
    (target_game_id, '1,980 Genesis Crystals', 989, true),
    (target_game_id, '3,280 Genesis Crystals', 1649, true),
    (target_game_id, '6,480 Genesis Crystals', 3249, true),
    (target_game_id, 'Blessing of the Welkin Moon', 169, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Seeded packages for Genshin Impact';
  END IF;
END $$;

-- =============================================
-- SECTION 13: SEED SAMPLE PROMOTIONS
-- =============================================
INSERT INTO public.promotions (code, discount_type, discount_value, max_uses, expires_at) VALUES
('WELCOME10', 'percent', 10, 100, NOW() + INTERVAL '30 days'),
('NEWUSER', 'fixed', 50, 50, NOW() + INTERVAL '30 days'),
('LEVELUP20', 'percent', 20, 200, NOW() + INTERVAL '7 days')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the setup:

-- Check if is_admin function works:
-- SELECT public.is_admin();

-- Check all tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check policies on all tables:
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- Count records in each table:
-- SELECT 'users' as table_name, COUNT(*) FROM public.users
-- UNION ALL SELECT 'games', COUNT(*) FROM public.games
-- UNION ALL SELECT 'packages', COUNT(*) FROM public.packages
-- UNION ALL SELECT 'transactions', COUNT(*) FROM public.transactions
-- UNION ALL SELECT 'promotions', COUNT(*) FROM public.promotions
-- UNION ALL SELECT 'chat_messages', COUNT(*) FROM public.chat_messages;

-- =============================================
-- END OF INITIALIZATION SCRIPT
-- =============================================
