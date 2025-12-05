-- 1. Create a secure function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/admin), bypassing RLS
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.users
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the problematic recursive policy
drop policy if exists "Admins can view all profiles" on public.users;

-- 3. Create a new policy using the secure function
create policy "Admins can view all profiles"
on public.users for select
using (
  public.is_admin()
);

-- 4. Ensure other policies are still correct (re-run just in case)
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);
