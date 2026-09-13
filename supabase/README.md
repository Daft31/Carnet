# Configuration Supabase pour Carnet

Étapes à faire une seule fois, côté dashboard Supabase (je ne peux pas créer de compte externe à ta place).

## 1. Créer le projet

1. Va sur [supabase.com](https://supabase.com), crée un compte/projet (plan gratuit, largement suffisant pour 2 utilisateurs).
2. Note l'**URL du projet** et la **clé `anon` `public`** (Project Settings → API). Ce sont les deux valeurs à me redonner ensuite — la clé `anon` est publique par design (elle part dans le code JS), la sécurité vient des policies RLS, pas du secret de cette clé.

## 2. Exécuter le schéma

Dans le Dashboard → **SQL Editor**, colle et exécute le contenu de [`schema.sql`](./schema.sql) (dans ce même dossier). Ça crée toutes les tables + active RLS + les policies d'isolation par utilisateur.

## 3. Passer les inscriptions en "invitation uniquement"

Dashboard → **Authentication → Sign In / Providers → Email** :
- Désactive "**Allow new users to sign up**" (ou équivalent selon la version de l'UI — parfois sous Authentication → Settings).
- Garde "Email OTP / Magic Link" activé.

Résultat : plus personne ne peut créer de compte tout seul en visitant le site, même en connaissant l'URL.

## 4. Inviter les 2 utilisateurs (toi + ton ami)

Dashboard → **Authentication → Users → Invite user** (ou "Add user" → "Send invitation") :
- Rentre ton email, puis celui de ton ami.
- Chacun reçoit un email avec un lien de connexion.

## 5. Me donner les infos de connexion

Une fois les étapes 1-4 faites, donne-moi :
- L'URL du projet (ex. `https://xxxxxxxx.supabase.co`)
- La clé `anon public`

Je les mets dans `js/supabaseClient.js` (même principe que `VERCEL_API_BASE` dans `js/mealparser.js` : une constante en dur dans le code, puisque l'app est 100% statique sans variables d'environnement côté client).

## Domaines autorisés pour les redirections d'auth

Dashboard → **Authentication → URL Configuration** : ajoute les URLs où l'app tourne (GitHub Pages **et** Vercel) dans "Redirect URLs", ex. :
- `https://daft31.github.io/carnet/`
- `https://carnet-self.vercel.app/`
- (et l'URL de preview Vercel de cette branche si tu veux tester avant de merger)

Sinon le lien magique redirigera vers une URL par défaut qui ne correspond pas à l'app.
