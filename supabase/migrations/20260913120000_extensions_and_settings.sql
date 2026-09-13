-- Carnet — migration Supabase 1/6
-- Extensions communes + tables "singleton par utilisateur" :
--   ct_settings (objectifs), ct_profile (profil), ct_theme (thème clair/sombre)
--
-- Convention utilisée dans tout le schéma :
--   - Chaque table porte une colonne user_id -> auth.users(id), NOT NULL.
--   - RLS activé partout, avec des policies "un utilisateur ne voit/modifie que ses lignes".
--   - Les tables qui correspondent à un tableau localStorage (ct_log, ct_weight, ...)
--     gardent une colonne client_id (text) = l'ancien `id` généré par uid() côté front,
--     pour pouvoir faire correspondre les lignes lors de la migration one-shot
--     localStorage -> Supabase sans dupliquer les entrées si le script est relancé.

create extension if not exists pgcrypto; -- pour gen_random_uuid()

-- ct_settings : objectifs caloriques/macros. Un seul enregistrement par utilisateur.
create table if not exists public.user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  calorie_goal  numeric not null default 2200,
  protein_goal  numeric not null default 150,
  carb_goal     numeric not null default 220,
  fat_goal      numeric not null default 70,
  -- ct_theme : 'light' | 'dark'. Rattaché ici plutôt qu'une table dédiée à une seule valeur.
  theme         text not null default 'light' check (theme in ('light','dark')),
  updated_at    timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: select own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings: insert own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings: update own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings: delete own"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- ct_profile : sexe, âge, taille, niveau d'activité, poids objectif, rythme visé.
create table if not exists public.user_profile (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  sex          text default 'H' check (sex in ('H','F')),
  age          numeric,
  height       numeric,
  activity     text default 'modere',
  goal_weight  numeric,
  rate         numeric default -0.5, -- kg/semaine visé (négatif = perte)
  updated_at   timestamptz not null default now()
);

alter table public.user_profile enable row level security;

create policy "user_profile: select own"
  on public.user_profile for select
  using (auth.uid() = user_id);

create policy "user_profile: insert own"
  on public.user_profile for insert
  with check (auth.uid() = user_id);

create policy "user_profile: update own"
  on public.user_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_profile: delete own"
  on public.user_profile for delete
  using (auth.uid() = user_id);
