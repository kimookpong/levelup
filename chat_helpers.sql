-- Function to get list of users who have chatted, sorted by most recent message
create or replace function public.get_chat_users()
returns table (
  id uuid,
  full_name text,
  email text,
  avatar_url text,
  last_message_at timestamptz
) as $$
begin
  return query
  select distinct on (u.id)
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    max(cm.created_at) as last_message_at
  from public.users u
  join public.chat_messages cm on u.id = cm.sender_id or u.id = cm.receiver_id
  group by u.id
  order by u.id, max(cm.created_at) desc;
end;
$$ language plpgsql security definer;
