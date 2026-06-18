-- ==========================================
-- MESSAGES (Feedback system)
-- ==========================================

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ==========================================
-- MESSAGES RLS POLICIES
-- ==========================================
alter table messages enable row level security;

drop policy if exists "Users can view their own messages" on messages;
create policy "Users can view their own messages" on messages 
for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on messages;
create policy "Users can send messages" on messages 
for insert with check (auth.uid() = sender_id);
