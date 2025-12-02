-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Games Table
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Packages Table
create table public.packages (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  currency text default 'THB',
  bonus_details text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  game_id uuid references public.games(id),
  package_id uuid references public.packages(id),
  player_id text not null, -- In-game ID
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  payment_method text,
  omise_charge_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promotions Table
create table public.promotions (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null,
  max_uses integer,
  current_uses integer default 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat Messages Table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id), -- Null if system message
  receiver_id uuid references public.users(id), -- Null for broadcast/admin channel
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table public.users enable row level security;
alter table public.games enable row level security;
alter table public.packages enable row level security;
alter table public.transactions enable row level security;
alter table public.promotions enable row level security;
alter table public.chat_messages enable row level security;

-- Policies (Simplified for demo)
create policy "Public games are viewable by everyone" on public.games for select using (true);
create policy "Public packages are viewable by everyone" on public.packages for select using (true);
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins can view all transactions" on public.transactions for select using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
