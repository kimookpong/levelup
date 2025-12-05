-- Allow users to insert their own messages
create policy "Users can insert their own messages"
on public.chat_messages for insert
with check (auth.uid() = sender_id);

-- Allow users to view messages sent by or to them
create policy "Users can view their own messages"
on public.chat_messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Allow admins to view all messages
create policy "Admins can view all messages"
on public.chat_messages for select
using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
