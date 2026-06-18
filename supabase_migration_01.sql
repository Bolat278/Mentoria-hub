-- ==========================================
-- ROLE MODIFICATION
-- ==========================================
-- Drop existing constraint safely
alter table profiles drop constraint if exists profiles_role_check;
-- Re-add constraint to allow 'teacher'
alter table profiles add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));
-- Also alter the table just in case the column is somehow missing
alter table profiles add column if not exists role text check (role in ('teacher', 'student', 'admin')) default 'student';

-- ==========================================
-- TEACHER UPLOADED COURSES
-- ==========================================
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  file_type text,
  created_at timestamptz default now()
);

-- ==========================================
-- TEACHER UPLOADED OLYMPIADS
-- ==========================================
create table if not exists olympiads (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  event_date date,
  file_url text,
  created_at timestamptz default now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table courses enable row level security;
drop policy if exists "Teachers can insert own courses" on courses;
create policy "Teachers can insert own courses" on courses for insert with check (auth.uid() = teacher_id);
drop policy if exists "Teachers can delete own courses" on courses;
create policy "Teachers can delete own courses" on courses for delete using (auth.uid() = teacher_id);
drop policy if exists "Anyone can read courses" on courses;
create policy "Anyone can read courses" on courses for select using (true);

alter table olympiads enable row level security;
drop policy if exists "Teachers can insert own olympiads" on olympiads;
create policy "Teachers can insert own olympiads" on olympiads for insert with check (auth.uid() = teacher_id);
drop policy if exists "Teachers can delete own olympiads" on olympiads;
create policy "Teachers can delete own olympiads" on olympiads for delete using (auth.uid() = teacher_id);
drop policy if exists "Anyone can read olympiads" on olympiads;
create policy "Anyone can read olympiads" on olympiads for select using (true);

-- ==========================================
-- LEADERBOARD VIEW
-- ==========================================
create or replace view teacher_leaderboard as
select 
  p.id,
  p.full_name,
  p.role,
  count(distinct c.id) as courses_count,
  count(distinct o.id) as olympiads_count,
  (count(distinct c.id) * 10 + count(distinct o.id) * 15) as score
from profiles p
left join courses c on c.teacher_id = p.id
left join olympiads o on o.teacher_id = p.id
where p.role = 'teacher'
group by p.id, p.full_name, p.role
order by score desc;
