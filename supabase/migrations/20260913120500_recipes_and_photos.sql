-- Carnet — migration Supabase 6/6
-- Prépare le terrain pour la feature (pas encore construite) "importer une recette" :
-- une recette + une ou plusieurs photos. Les photos vivent dans Supabase Storage
-- (bucket binaire), pas en base64 dans une colonne, pour éviter d'avoir à re-migrer
-- plus tard des blobs potentiellement volumineux. Seules les métadonnées sont en Postgres.
--
-- Rien de ceci n'est branché sur l'UI pour l'instant : c'est du scaffolding pour que
-- l'ajout de la feature plus tard n'impose pas une nouvelle migration de stockage.

create table if not exists public.recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text,
  name        text not null,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.recipes enable row level security;

create policy "recipes: select own"
  on public.recipes for select using (auth.uid() = user_id);
create policy "recipes: insert own"
  on public.recipes for insert with check (auth.uid() = user_id);
create policy "recipes: update own"
  on public.recipes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipes: delete own"
  on public.recipes for delete using (auth.uid() = user_id);

-- Métadonnées des photos ; storage_path pointe vers un objet du bucket 'recipe-photos'.
-- Convention de chemin imposée par les policies Storage ci-dessous :
--   <user_id>/<recipe_id ou "unfiled">/<fichier>
create table if not exists public.recipe_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  recipe_id     uuid references public.recipes(id) on delete cascade, -- nullable : photo pas encore rattachée
  storage_path  text not null,
  content_type  text,
  created_at    timestamptz not null default now(),
  unique (storage_path)
);

alter table public.recipe_photos enable row level security;

create policy "recipe_photos: select own"
  on public.recipe_photos for select using (auth.uid() = user_id);
create policy "recipe_photos: insert own"
  on public.recipe_photos for insert with check (auth.uid() = user_id);
create policy "recipe_photos: update own"
  on public.recipe_photos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipe_photos: delete own"
  on public.recipe_photos for delete using (auth.uid() = user_id);

-- Bucket de stockage privé pour les photos de recettes.
-- Privé (public = false) : l'accès passe par des URLs signées générées côté client
-- après authentification, jamais par une URL publique statique.
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', false)
on conflict (id) do nothing;

-- Policies Storage : un utilisateur ne peut lire/écrire que sous son propre préfixe
-- <user_id>/... dans le bucket recipe-photos. storage.foldername(name) découpe le
-- chemin de l'objet en segments ; le segment [1] est le premier dossier du chemin.
create policy "recipe-photos: select own prefix"
  on storage.objects for select
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos: insert own prefix"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos: update own prefix"
  on storage.objects for update
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recipe-photos: delete own prefix"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
