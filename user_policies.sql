-- Enable RLS on users table (if not already enabled)
alter table public.users enable row level security;

-- Allow users to view their own profile
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);

-- Allow admins to view all profiles
-- Note: This relies on the first policy allowing the admin to read their own 'role'
create policy "Admins can view all profiles"
on public.users for select
using (
  exists (
    select 1 from public.users 
    where id = auth.uid() 
    and role = 'admin'
  )
);
