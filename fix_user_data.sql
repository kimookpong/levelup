-- 1. Enable RLS
alter table public.users enable row level security;

-- 2. Drop existing policies to start fresh
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;

-- 3. Create correct policies
-- Allow users to view their own profile
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);

-- Allow admins to view all profiles
create policy "Admins can view all profiles"
on public.users for select
using (
  exists (
    select 1 from public.users 
    where id = auth.uid() 
    and role = 'admin'
  )
);

-- 4. Sync missing users from auth.users to public.users
insert into public.users (id, email, full_name, avatar_url, role)
select 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url',
  'user' -- Default role
from auth.users
where id not in (select id from public.users);

-- 5. (Optional) Make sure your specific user is an admin
-- Replace 'YOUR_EMAIL' with your actual email if you want to force admin role
-- update public.users set role = 'admin' where email = 'YOUR_EMAIL';
