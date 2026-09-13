# Plan de migration vers Supabase

Statut : **conception + scaffolding seulement**. Rien dans ce commit ne change le
comportement de l'appli — `js/core.js` continue de lire/écrire exclusivement dans
`localStorage` via `LS.get`/`LS.set`. Ce document sert de feuille de route pour la suite.

> Note : cette branche contenait déjà un premier jet de schéma (`supabase/schema.sql`,
> un seul fichier, table `log_entries` en `jsonb`) issu d'une session précédente. Il a
> été remplacé par le découpage en `supabase/migrations/*.sql` ci-dessous — format
> standard de la Supabase CLI, plus fidèle aux champs réellement présents dans
> `ct_customFoods`/`ct_log` (vérifiés directement dans `js/core.js`, `js/ui.js`,
> `js/mealparser.js`, `js/scanner.js` plutôt que déduits de `BUILTIN_FOODS`), et incluant
> les tables `recipes`/`recipe_photos` + le bucket Storage demandés pour la feature
> recette. Les étapes utiles de l'ancien `supabase/README.md` (inscriptions en
> invitation uniquement, redirect URLs) ont été reprises plus bas.

## Pourquoi Supabase, pourquoi maintenant

Les données de l'appli (repas, séances, poids, aliments perso, favoris, profil,
objectifs, notes, todos, thème) vivent uniquement dans le `localStorage` du navigateur.
Un vidage de cache, un changement de téléphone, ou l'utilisation de l'appli depuis un
second appareil perdent ou dupliquent silencieusement ces données. Un ami utilise déjà
la même URL avec son propre localStorage (donc pas de conflit aujourd'hui, mais aucune
isolation réelle si on centralisait bêtement).

Supabase apporte, gratuitement à cette échelle (quelques utilisateurs) :
- Auth par lien magique (pas de mot de passe à gérer) ;
- Postgres avec **Row Level Security (RLS)** pour isoler strictement les données par
  utilisateur, même si tout le monde tape sur la même URL/API publique ;
- Une clé "anon" conçue pour vivre côté client (contrairement à `CARNET_API_KEY`,
  qui doit rester secrète côté serveur — voir CLAUDE.md, ne pas confondre les deux
  modèles de sécurité) ;
- Un SDK JS utilisable sans build step, cohérent avec l'esprit "vanilla" du repo.

## Schéma retenu

Le détail est dans `supabase/migrations/*.sql` (commentaires SQL inclus). Résumé du
mapping clé localStorage -> table(s) :

| Clé localStorage      | Forme                                  | Table(s) Supabase                              |
| ---------------------- | --------------------------------------- | ----------------------------------------------- |
| `ct_settings`          | objet unique                            | `user_settings` (+ colonne `theme`)              |
| `ct_theme`             | string `'light'\|'dark'`                | `user_settings.theme`                            |
| `ct_customFoods`       | tableau d'objets                        | `custom_foods`                                   |
| `ct_foodOverrides`     | objet `{builtinId: {...}}`              | `food_overrides` (PK composite user_id+builtin_food_id) |
| `ct_favorites`         | tableau d'ids (string)                  | `favorites` (PK composite user_id+food_id)       |
| `ct_weight`            | tableau d'objets                        | `weight_entries`                                 |
| `ct_profile`           | objet unique                            | `user_profile`                                   |
| `ct_wpresets`          | tableau d'objets (params libres)        | `workout_presets` (params en `jsonb`)            |
| `ct_log` (type=meal)   | tableau, sous-ensemble de champs        | `meal_entries`                                   |
| `ct_log` (type=workout)| tableau, sous-ensemble de champs        | `workout_entries`                                |
| `ct_log` (type=note)   | tableau, sous-ensemble de champs        | `notes`                                          |
| `ct_todos`             | tableau d'objets                        | `todos`                                          |
| `ct_muscleUnitMigrated`| flag technique ponctuel (front only)    | non migré — c'était une migration d'unité qui a déjà eu lieu côté client, sans équivalent utile en base |
| *(pas encore existant)*| —                                       | `recipes` + `recipe_photos` + bucket Storage `recipe-photos`, prévus pour la feature "importer une recette" (voir plus bas) |

### Choix structurants

- **Une table par type d'entrée du journal** (`meal_entries` / `workout_entries` /
  `notes`) plutôt qu'une seule table `log_entries` façon "un blob JSON par ligne" :
  les trois types ont des colonnes assez différentes (une note n'a pas de macros,
  un repas n'a pas de `kcal_burned`...) pour qu'une vraie séparation relationnelle
  apporte des contraintes utiles (ex. `wtype` contraint par `check`) sans complexifier
  les requêtes — le front filtre déjà par `type` partout.
- **`client_id text` + `unique(user_id, client_id)`** sur toutes les tables qui
  correspondent à un tableau localStorage : conserve l'ancien id généré par `uid()`
  côté front, pour que le script de migration one-shot (phase 3 ci-dessous) soit
  idempotent — le relancer deux fois ne duplique pas les lignes.
- **Pas de clé étrangère vers un catalogue d'aliments intégrés** : `BUILTIN_FOODS`
  (dans `js/core.js`) reste codé en dur côté client et n'est pas répliqué en base.
  `meal_entries.food_id` et `food_overrides.builtin_food_id` stockent l'id texte
  (`b_...` ou `c...`) sans contrainte FK — cohérent avec le comportement actuel qui
  tolère déjà un id qui ne correspond plus à rien.
- **RLS strict partout** : chaque table a `user_id uuid references auth.users(id)`
  et 4 policies (select/insert/update/delete) `using/with check (auth.uid() = user_id)`.
  Aucune policy "publique" nulle part. C'est ce qui garantit l'isolation entre
  l'utilisateur et son ami sans logique applicative supplémentaire à maintenir.
- **Règle calorique préservée** : aucune vue, fonction ou policy SQL de ce schéma ne
  calcule de "calories restantes" ou de déficit. `workout_entries.kcal_burned` est
  explicitement commenté comme informatif uniquement dans la migration SQL. Ce calcul
  reste — et doit rester — dans `js/core.js` (`dayTotals`, `weeklyDeficit`), inchangé.
- **Photos de recettes préparées mais pas branchées** : `recipes` + `recipe_photos`
  (métadonnées) + bucket Storage privé `recipe-photos` avec policies par préfixe
  `<user_id>/...`. Aucun code front n'utilise ces tables — l'objectif est juste
  d'éviter une re-migration de stockage (base64 -> Storage) si la feature "importer
  une recette" est construite plus tard.

## Ce que l'utilisateur doit faire lui-même

Un agent ne peut pas créer de compte/projet Supabase à la place de l'utilisateur.
Étapes à faire côté utilisateur, puis infos à redonner à l'agent pour continuer :

1. Créer un compte sur [supabase.com](https://supabase.com) (le plan gratuit suffit
   largement à cette échelle : 2 utilisateurs, quelques centaines de lignes/jour).
2. Créer un nouveau projet (choisir une région proche, ex. Europe).
3. Dans **Project Settings -> API**, noter :
   - **Project URL** (ex. `https://xxxxxxxx.supabase.co`)
   - **anon public key** (PAS la `service_role` key, qui ne doit jamais atterrir
     dans du code client)
4. Appliquer les migrations de `supabase/migrations/` au projet : soit via le SQL
   Editor du dashboard (copier/coller chaque fichier dans l'ordre des timestamps),
   soit via la Supabase CLI (`supabase link` puis `supabase db push`) si l'utilisateur
   préfère ce workflow.
5. Dans **Authentication -> Providers**, vérifier que "Email" est activé avec le lien
   magique (magic link).
6. Passer les inscriptions en "invitation uniquement" — important puisque l'app est
   sur une URL publique et que rien n'empêcherait sinon un inconnu de créer un compte :
   Dashboard -> **Authentication -> Sign In / Providers -> Email**, désactiver
   "Allow new users to sign up" (l'intitulé exact varie selon la version de l'UI,
   parfois sous Authentication -> Settings) en gardant le lien magique actif.
7. Inviter les deux utilisateurs (l'utilisateur + son ami) : Dashboard ->
   **Authentication -> Users -> Invite user**, une fois par email. Chacun reçoit un
   lien de connexion.
8. Dans **Authentication -> URL Configuration**, ajouter en "Redirect URLs" tous les
   domaines où l'app tourne, sinon le lien magique redirige vers une URL par défaut
   qui ne correspond pas à l'appli :
   - `https://daft31.github.io/carnet/`
   - `https://carnet-self.vercel.app/`
   - l'URL de preview Vercel de cette branche, si l'utilisateur veut tester avant de merger
9. Appliquer les migrations de `supabase/migrations/` au projet : soit via le SQL
   Editor du dashboard (copier/coller chaque fichier dans l'ordre des timestamps),
   soit via la Supabase CLI (`supabase link` puis `supabase db push`) si l'utilisateur
   préfère ce workflow.
10. Redonner à l'agent : l'URL du projet + la clé anon, pour compléter
    `js/supabaseClient.js` et démarrer la phase 2.

## Phases restantes (après ce commit)

Ce commit couvre uniquement la phase 0 bis (schéma + scaffolding). Suite prévue,
dans l'ordre :

1. **Phase 0 — setup projet** (utilisateur, décrit ci-dessus).
2. **Phase 1 — auth minimale** : écran de connexion par lien magique, gestion de la
   session Supabase, affichage d'un état "non connecté" qui bascule l'appli en
   lecture/écriture localStorage pure (comportement actuel inchangé) tant que
   personne n'est connecté — pour ne rien casser pour un usage hors-ligne éventuel.
3. **Phase 2 — couche de stockage asynchrone** : réécrire `LS.get`/`LS.set` (et tous
   leurs appelants dans `core.js`/`ui.js`/`app.js`, qui sont aujourd'hui synchrones)
   en une API async adossée à Supabase quand une session existe. C'est le plus gros
   chantier : `save()` et tous les handlers d'événements deviennent `async`, et
   l'UI doit gérer l'attente réseau (voir phase 4).
4. **Phase 3 — migration one-shot des données existantes** : au premier login d'un
   utilisateur, détecter des données localStorage non encore migrées et les pousser
   vers Supabase (en réutilisant les anciens ids comme `client_id` pour l'idempotence
   décrite plus haut), puis marquer la migration faite (ex. un flag local ou une
   table `migration_status`) pour ne pas la relancer à chaque session.
5. **Phase 4 — états de chargement/erreur réseau** : squelettes de chargement pendant
   les requêtes initiales, messages d'erreur clairs en cas de perte réseau, et une
   stratégie de repli explicite (cache local en lecture ? blocage en écriture ?) à
   décider avec l'utilisateur plutôt qu'à deviner.
6. **Phase 5 — tests multi-comptes** : vérifier concrètement avec l'ami de
   l'utilisateur que deux comptes sur la même URL ne voient jamais les données l'un
   de l'autre (RLS + tests manuels croisés), avant de considérer la migration terminée.

Aucune estimation de durée n'est donnée ici : la phase 2 (réécriture async) touche
la quasi-totalité de `core.js`/`ui.js`/`app.js` et son ampleur réelle ne sera claire
qu'en la faisant.

## Risques et points d'attention

- **Dépendance au réseau** : aujourd'hui, tout est instantané (localStorage synchrone,
  fonctionne hors-ligne). Après migration, chaque lecture/écriture devient une requête
  réseau — latence perceptible, et un vrai risque de perte de données saisies hors-ligne
  si aucune stratégie de file d'attente/retry n'est prévue en phase 4.
- **Migration one-shot ratée ou relancée** : le choix `client_id` + contrainte
  `unique(user_id, client_id)` protège contre la duplication si le script tourne deux
  fois, mais ne protège pas contre un import partiel (crash en cours de route) —
  prévoir que la phase 3 soit idempotente *et* reprenable.
- **RLS mal configuré = fuite de données entre l'utilisateur et son ami** : les
  policies de ce schéma sont strictes par construction, mais toute nouvelle table
  ajoutée plus tard doit reprendre exactement le même patron (`user_id` + 4 policies
  `auth.uid() = user_id`) — un oubli de policy sur une nouvelle table expose ses
  données à n'importe quel compte authentifié par défaut sur Supabase tant que RLS
  n'est pas activé dessus.
- **Clé anon vs clé service_role** : la clé anon est censée être publique, mais elle
  n'est sans danger que si RLS est bien activé sur *toutes* les tables — vérifier après
  chaque migration qu'aucune table n'est restée sans RLS (`select * from
  pg_tables where rowsecurity = false` côté SQL Editor est un bon réflexe de contrôle).
- **Coexistence avec GitHub Pages** : Supabase (comme Vercel) fonctionne depuis
  n'importe quel domaine statique puisque tout passe par la clé anon + CORS géré par
  Supabase lui-même — pas de piège équivalent au `VERCEL_API_BASE` attendu ici, mais
  à vérifier concrètement une fois l'auth branchée depuis les deux domaines de prod.
- **Coût** : gratuit au tier actuel (quelques utilisateurs, faible volume), mais
  Supabase facture au-delà de certains seuils (lignes, requêtes, stockage) — pas un
  risque à court terme ici, juste à garder en tête si le nombre d'utilisateurs grandit
  significativement au-delà de "l'utilisateur + son ami + quelques autres".
