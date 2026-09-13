-- Carnet — schéma Supabase (Postgres)
-- À exécuter dans Supabase Dashboard → SQL Editor (une seule fois, sur un projet neuf).
-- Toutes les tables sont isolées par utilisateur via Row Level Security (RLS) :
-- chaque ligne appartient à auth.uid() et n'est visible que par lui.
--
-- Les colonnes `id` reprennent le format des IDs déjà générés côté client
-- (fonction uid() de js/core.js, ex. "k3x9a2.f7q1z") pour permettre une migration
-- 1:1 des données localStorage existantes, sans les régénérer.

-- ===================== user_settings (singleton par utilisateur) =====================
-- Fusionne ct_settings + ct_profile + ct_theme : un seul aller-retour réseau au démarrage.
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  calorie_goal numeric not null default 2200,
  protein_goal numeric not null default 150,
  carb_goal numeric not null default 220,
  fat_goal numeric not null default 70,
  sex text default 'H',
  age numeric,
  height numeric,
  activity text default 'modere',
  goal_weight numeric,
  rate text default '-0.5',
  theme text default 'light',
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user_settings_select_own" on user_settings for select using (user_id = auth.uid());
create policy "user_settings_insert_own" on user_settings for insert with check (user_id = auth.uid());
create policy "user_settings_update_own" on user_settings for update using (user_id = auth.uid());
create policy "user_settings_delete_own" on user_settings for delete using (user_id = auth.uid());

-- ===================== custom_foods =====================
create table if not exists custom_foods (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  kcal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  sugars numeric,
  category text,
  state text,
  brand text,
  serving_g numeric default 100,
  serving_label text,
  created_at timestamptz not null default now()
);

create index if not exists custom_foods_user_id_idx on custom_foods(user_id);

alter table custom_foods enable row level security;

create policy "custom_foods_select_own" on custom_foods for select using (user_id = auth.uid());
create policy "custom_foods_insert_own" on custom_foods for insert with check (user_id = auth.uid());
create policy "custom_foods_update_own" on custom_foods for update using (user_id = auth.uid());
create policy "custom_foods_delete_own" on custom_foods for delete using (user_id = auth.uid());

-- ===================== food_overrides =====================
-- Surcharge de valeurs pour un aliment intégré (RAW_FOODS), identifié par son id (ex. "chicken_breast_raw").
create table if not exists food_overrides (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  builtin_id text not null,
  name text,
  kcal numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  primary key (user_id, builtin_id)
);

alter table food_overrides enable row level security;

create policy "food_overrides_select_own" on food_overrides for select using (user_id = auth.uid());
create policy "food_overrides_insert_own" on food_overrides for insert with check (user_id = auth.uid());
create policy "food_overrides_update_own" on food_overrides for update using (user_id = auth.uid());
create policy "food_overrides_delete_own" on food_overrides for delete using (user_id = auth.uid());

-- ===================== favorites =====================
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  food_id text not null,
  primary key (user_id, food_id)
);

alter table favorites enable row level security;

create policy "favorites_select_own" on favorites for select using (user_id = auth.uid());
create policy "favorites_insert_own" on favorites for insert with check (user_id = auth.uid());
create policy "favorites_delete_own" on favorites for delete using (user_id = auth.uid());

-- ===================== weight_entries =====================
create table if not exists weight_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  water numeric,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists weight_entries_user_date_idx on weight_entries(user_id, date);

alter table weight_entries enable row level security;

create policy "weight_entries_select_own" on weight_entries for select using (user_id = auth.uid());
create policy "weight_entries_insert_own" on weight_entries for insert with check (user_id = auth.uid());
create policy "weight_entries_update_own" on weight_entries for update using (user_id = auth.uid());
create policy "weight_entries_delete_own" on weight_entries for delete using (user_id = auth.uid());

-- ===================== workout_presets =====================
create table if not exists workout_presets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workout_presets_user_id_idx on workout_presets(user_id);

alter table workout_presets enable row level security;

create policy "workout_presets_select_own" on workout_presets for select using (user_id = auth.uid());
create policy "workout_presets_insert_own" on workout_presets for insert with check (user_id = auth.uid());
create policy "workout_presets_update_own" on workout_presets for update using (user_id = auth.uid());
create policy "workout_presets_delete_own" on workout_presets for delete using (user_id = auth.uid());

-- ===================== log_entries =====================
-- Journal principal (repas + séances + notes), miroir de ct_log.
-- `payload` contient les champs spécifiques au type :
--   meal:    {foodId?, foodName, mealSlot, grams, kcal, protein, carbs, fat, fiber?}
--   workout: {workoutType, kcalBurned, params?}
--   note:    {text}
create table if not exists log_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  time text not null,
  type text not null check (type in ('meal','workout','note')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists log_entries_user_date_idx on log_entries(user_id, date);

alter table log_entries enable row level security;

create policy "log_entries_select_own" on log_entries for select using (user_id = auth.uid());
create policy "log_entries_insert_own" on log_entries for insert with check (user_id = auth.uid());
create policy "log_entries_update_own" on log_entries for update using (user_id = auth.uid());
create policy "log_entries_delete_own" on log_entries for delete using (user_id = auth.uid());

-- ===================== todos =====================
create table if not exists todos (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null,
  daily boolean not null default false,
  done boolean not null default false,
  completed_date date,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on todos(user_id);

alter table todos enable row level security;

create policy "todos_select_own" on todos for select using (user_id = auth.uid());
create policy "todos_insert_own" on todos for insert with check (user_id = auth.uid());
create policy "todos_update_own" on todos for update using (user_id = auth.uid());
create policy "todos_delete_own" on todos for delete using (user_id = auth.uid());

-- ===================== Notes pour plus tard (feature recette en pause) =====================
-- Ne PAS stocker de photos en base64 dans une colonne. Le jour venu, utiliser un bucket
-- Supabase Storage privé (ex. "recipe-photos"), avec des policies de storage restreignant
-- chaque utilisateur à son propre dossier ({user_id}/...), et ne référencer que le chemin
-- du fichier (text) dans une éventuelle table `recipes`.
