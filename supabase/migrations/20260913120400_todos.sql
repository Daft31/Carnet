-- Carnet — migration Supabase 5/6
-- ct_todos : tâches à faire, avec option "quotidienne" (daily) qui se reset chaque jour côté front.

create table if not exists public.todos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  client_id       text,
  text            text not null,
  daily           boolean not null default false,
  done            boolean not null default false,
  completed_date  date,
  created_at      timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.todos enable row level security;

create policy "todos: select own"
  on public.todos for select using (auth.uid() = user_id);
create policy "todos: insert own"
  on public.todos for insert with check (auth.uid() = user_id);
create policy "todos: update own"
  on public.todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "todos: delete own"
  on public.todos for delete using (auth.uid() = user_id);
