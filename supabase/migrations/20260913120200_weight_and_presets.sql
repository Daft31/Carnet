-- Carnet — migration Supabase 3/6
-- ct_weight (pesées) et ct_wpresets (préréglages de séances)

-- ct_weight : historique de pesées. muscleMass est en kg depuis la migration
-- ct_muscleUnitMigrated côté client (avant : % du poids) — on stocke uniquement
-- la valeur finale en kg, pas besoin de reproduire cette migration ponctuelle en base.
create table if not exists public.weight_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  client_id    text,
  date         date not null,
  weight       numeric not null,
  body_fat     numeric,      -- % masse grasse
  muscle_mass  numeric,      -- kg
  water        numeric,      -- % eau
  note         text,
  created_at   timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists weight_entries_user_date_idx on public.weight_entries (user_id, date);

alter table public.weight_entries enable row level security;

create policy "weight_entries: select own"
  on public.weight_entries for select
  using (auth.uid() = user_id);

create policy "weight_entries: insert own"
  on public.weight_entries for insert
  with check (auth.uid() = user_id);

create policy "weight_entries: update own"
  on public.weight_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weight_entries: delete own"
  on public.weight_entries for delete
  using (auth.uid() = user_id);

-- ct_wpresets : préréglages de séances (tapis/vélo/renfo), params libres selon le type
-- (ex. {vitesse, pente} pour tapis, {effort} pour vélo, {intensite} pour renfo) -> jsonb.
create table if not exists public.workout_presets (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  client_id             text,
  name                  text not null,
  type                  text not null check (type in ('tapis','velo','renfo','manuel')),
  params                jsonb not null default '{}'::jsonb,
  default_duration_min  numeric,
  notes                 text,
  created_at            timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.workout_presets enable row level security;

create policy "workout_presets: select own"
  on public.workout_presets for select
  using (auth.uid() = user_id);

create policy "workout_presets: insert own"
  on public.workout_presets for insert
  with check (auth.uid() = user_id);

create policy "workout_presets: update own"
  on public.workout_presets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_presets: delete own"
  on public.workout_presets for delete
  using (auth.uid() = user_id);
