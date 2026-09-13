-- Carnet — migration Supabase 4/6
-- ct_log : le "journal" front est un seul tableau hétérogène (repas + séances + notes)
-- discriminé par un champ `type`. Les trois types ont des colonnes assez différentes
-- (un repas n'a pas de kcalBurned, une note n'a que du texte...) pour qu'une vraie
-- séparation relationnelle ait du sens plutôt qu'une unique table "blob jsonb" :
-- ça donne des contraintes propres (kcal not null sur les repas, etc.) et des requêtes
-- simples pour l'historique/dashboard qui filtrent déjà par type côté front.
--
-- IMPORTANT (voir CLAUDE.md racine) : les calories brûlées (workout_entries.kcal_burned)
-- sont uniquement informatives. Ne JAMAIS les soustraire des calories consommées dans
-- une vue, une fonction ou une policy ici — ce schéma ne doit contenir aucun calcul
-- de ce type, le "restant" se calcule côté client comme aujourd'hui
-- (objectif - calories mangées, indépendamment du sport).

-- Repas (ex ct_log où type==='meal')
create table if not exists public.meal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  client_id  text,
  date       date not null,
  time       text,                 -- "HH:MM", affichage/tri uniquement
  meal_slot  text,                 -- ex. petit-déj / déjeuner / dîner / collation
  food_id    text,                 -- id builtin ("b_...") ou perso ("c...") au moment de l'ajout,
                                    -- pas de FK : peut référencer un aliment builtin (hors base)
                                    -- ou un custom_food depuis supprimé/modifié.
  food_name  text not null,
  grams      numeric,              -- null pour un repas décrit par l'IA (pas de quantité en grammes)
  kcal       numeric not null default 0,
  protein    numeric not null default 0,
  carbs      numeric not null default 0,
  fat        numeric not null default 0,
  source     text check (source in ('scan','ai') or source is null), -- null = ajout manuel
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists meal_entries_user_date_idx on public.meal_entries (user_id, date);

alter table public.meal_entries enable row level security;

create policy "meal_entries: select own"
  on public.meal_entries for select using (auth.uid() = user_id);
create policy "meal_entries: insert own"
  on public.meal_entries for insert with check (auth.uid() = user_id);
create policy "meal_entries: update own"
  on public.meal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_entries: delete own"
  on public.meal_entries for delete using (auth.uid() = user_id);

-- Séances (ex ct_log où type==='workout')
create table if not exists public.workout_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text,
  date        date not null,
  time        text,
  wtype       text not null check (wtype in ('manuel','tapis','velo','renfo')),
  text        text,               -- description libre (manuel/renfo)
  duration    numeric,            -- minutes
  steps       numeric,            -- mode "pas" du tapis
  params      jsonb default '{}'::jsonb,     -- {vitesse,pente} | {effort} | {intensite}
  estimation  jsonb,              -- détail de l'estimation kcal quand type='manuel' sans kcal saisi
  kcal_burned numeric not null default 0, -- INFORMATIF UNIQUEMENT — cf. note en tête de fichier
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists workout_entries_user_date_idx on public.workout_entries (user_id, date);

alter table public.workout_entries enable row level security;

create policy "workout_entries: select own"
  on public.workout_entries for select using (auth.uid() = user_id);
create policy "workout_entries: insert own"
  on public.workout_entries for insert with check (auth.uid() = user_id);
create policy "workout_entries: update own"
  on public.workout_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_entries: delete own"
  on public.workout_entries for delete using (auth.uid() = user_id);

-- Notes (ex ct_log où type==='note')
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  client_id  text,
  date       date not null,
  time       text,
  text       text not null,
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists notes_user_date_idx on public.notes (user_id, date);

alter table public.notes enable row level security;

create policy "notes: select own"
  on public.notes for select using (auth.uid() = user_id);
create policy "notes: insert own"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "notes: update own"
  on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: delete own"
  on public.notes for delete using (auth.uid() = user_id);
