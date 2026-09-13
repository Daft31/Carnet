-- Carnet — migration Supabase 2/6
-- Aliments : ct_customFoods, ct_foodOverrides, ct_favorites

-- ct_customFoods : aliments créés manuellement par l'utilisateur (valeurs pour 100 g).
-- L'ancien id front était "c"+uid() (ex. "c1a2b3c4d") ; on le garde en client_id pour
-- que favoris/journal (qui référencent cet id en texte) puissent être réécrits pendant
-- la migration, et pour l'idempotence du script de migration one-shot.
create table if not exists public.custom_foods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  client_id  text,
  name       text not null,
  kcal       numeric not null default 0,
  protein    numeric not null default 0,
  carbs      numeric not null default 0,
  fat        numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.custom_foods enable row level security;

create policy "custom_foods: select own"
  on public.custom_foods for select
  using (auth.uid() = user_id);

create policy "custom_foods: insert own"
  on public.custom_foods for insert
  with check (auth.uid() = user_id);

create policy "custom_foods: update own"
  on public.custom_foods for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "custom_foods: delete own"
  on public.custom_foods for delete
  using (auth.uid() = user_id);

-- ct_foodOverrides : surcharge de valeurs pour un aliment intégré (BUILTIN_FOODS, qui
-- reste codé en dur côté client, pas en base). builtin_food_id = l'id généré par
-- slugify() côté front (ex. "b_poulet_roti_12"), stable tant que BUILTIN_FOODS ne change pas.
create table if not exists public.food_overrides (
  user_id         uuid not null references auth.users(id) on delete cascade,
  builtin_food_id text not null,
  name            text,
  kcal            numeric,
  protein         numeric,
  carbs           numeric,
  fat             numeric,
  updated_at      timestamptz not null default now(),
  primary key (user_id, builtin_food_id)
);

alter table public.food_overrides enable row level security;

create policy "food_overrides: select own"
  on public.food_overrides for select
  using (auth.uid() = user_id);

create policy "food_overrides: insert own"
  on public.food_overrides for insert
  with check (auth.uid() = user_id);

create policy "food_overrides: update own"
  on public.food_overrides for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "food_overrides: delete own"
  on public.food_overrides for delete
  using (auth.uid() = user_id);

-- ct_favorites : liste d'ids d'aliments favoris (builtin "b_..." ou perso "c...").
-- Pas de clé étrangère vers custom_foods/BUILTIN_FOODS : les ids builtin ne vivent
-- pas en base, et un favori sur un aliment perso supprimé doit pouvoir être toléré
-- (le front filtre déjà silencieusement les favoris qui ne matchent plus rien).
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  food_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

alter table public.favorites enable row level security;

create policy "favorites: select own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites: insert own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites: delete own"
  on public.favorites for delete
  using (auth.uid() = user_id);
