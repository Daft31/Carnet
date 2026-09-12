# Carnet

Application web personnelle de suivi sportif et nutritionnel (calories, macros, poids, séances, historique). 100 % en français, pensée pour un usage individuel (une seule personne, pas de comptes multi-utilisateurs).

Ce document s'adresse autant à un humain qu'à un futur agent IA qui interviendrait sur ce repo : il explique l'architecture, les pièges connus, et où trouver quoi.

> 🤖 **Agents Claude (Claude Code, etc.)** : un fichier [`CLAUDE.md`](./CLAUDE.md) à la racine du repo condense les règles critiques à ne jamais casser (calcul calorique, clé API Mammouth, domaine Vercel en dur...). Il est généralement lu automatiquement en début de session — le lire avant toute modification, en complément de ce README.

## Aperçu rapide

- **Frontend** : HTML/CSS/JS vanilla, sans build step, sans framework, sans bundler. Tout l'état est stocké dans le `localStorage` du navigateur.
- **Backend** : une seule fonction serverless (`api/parse-meal.js`) pour la fonctionnalité "décrire un repas par IA". Tout le reste est 100 % statique/client-side.
- **Déploiement double** :
  - **GitHub Pages** (`daft31.github.io/carnet`) — sert uniquement les fichiers statiques (`index.html`, `css/`, `js/`). Ne peut pas exécuter `api/parse-meal.js` (pas de serverless sur Pages).
  - **Vercel** (domaine de prod stable : `carnet-self.vercel.app`) — sert la même appli statique **et** héberge la fonction serverless. C'est le seul endroit où l'IA de description de repas peut réellement tourner.
- Conséquence : le front (`js/mealparser.js`) appelle **toujours** l'URL Vercel en dur pour l'IA (même quand l'appli est ouverte depuis GitHub Pages), avec CORS activé côté serveur pour l'autoriser.

## Structure du repo

```
index.html          Coquille de l'appli (nav, tabs, conteneurs #main/#modal-root)
css/style.css        Design system complet (couleurs, cards, modals, animations)
js/core.js            État (localStorage), utilitaires, calculs, rendu de tous les onglets (view*)
js/ui.js               Système de modal (openModal/closeModal) + liaison des événements par onglet (bindTabEvents)
js/scanner.js          Scanner code-barres : Quagga2 (caméra) + Open Food Facts (base produits)
js/mealparser.js       Feature IA "décrire un repas" : appelle /api/parse-meal
js/app.js              Point d'entrée : listener des tabs, thème, render() initial
api/parse-meal.js     Fonction serverless Vercel : proxy sécurisé vers l'API Mammouth AI
package.json          Pas de dépendances (l'API function utilise fetch natif de Node)
vercel.json           Config build Vercel (pas de variables d'env ici, voir plus bas)
.github/workflows/static.yml   Déploiement automatique vers GitHub Pages à chaque push sur main
DEPLOYMENT.md         Notes de déploiement (variables GitHub Secrets, etc.)
```

Aucun fichier `js/food.js` ni `js/workout.js` séparé : cette logique vit directement dans `core.js` (elle a été fusionnée lors d'un gros refactor, voir historique Git).

## Fonctionnalités

- **Aujourd'hui** (dashboard) : anneau de calories, macros du jour, mini-graphe 7 jours.
  - ⚠️ **Règle volontaire** : les calories "restantes" = `objectif − calories mangées`, **jamais** moins les calories brûlées en sport. Les calories brûlées sont affichées séparément ("Brûlées (info)"), à titre purement informatif — le but est d'éviter le biais "j'ai fait du sport donc je peux manger plus". Ne pas réintroduire de soustraction ici sans qu'on te le demande explicitement.
- **Repas** : recherche dans la base d'aliments intégrée, favoris, aliments personnalisés, + 2 méthodes d'ajout rapide :
  - **Scanner un code-barres** (caméra + Open Food Facts, aucune clé API requise, tout se passe côté client).
  - **Décrire un repas (IA)** : texte libre → extraction structurée des macros via l'API Mammouth (voir section dédiée).
- **Séances** : types tapis/vélo/renfo, préréglages, estimation kcal brûlées (affichage informatif uniquement, cf. règle ci-dessus).
- **Poids** : suivi, calcul BMR/TDEE, objectif calorique adaptatif.
- **Historique** : détail par jour + déficit hebdomadaire (ignore aussi le sport, par cohérence avec la règle du dashboard).
- **Notes**, **To-do**, **Réglages** (objectifs manuels, gestion des aliments perso, export/import JSON, reset complet).

## Modèle de données (localStorage)

Tout vit dans le navigateur, clé par clé (`LS.get/set` dans `core.js`) :

| Clé localStorage     | Contenu                                              |
| --------------------- | ----------------------------------------------------- |
| `ct_settings`         | Objectifs (calories, protéines, glucides, lipides)    |
| `ct_customFoods`      | Aliments créés manuellement par l'utilisateur         |
| `ct_foodOverrides`    | Surcharges de valeurs pour des aliments intégrés      |
| `ct_favorites`        | IDs des aliments favoris                              |
| `ct_weight`           | Historique de pesées (poids, masse grasse, muscle...) |
| `ct_profile`          | Profil (sexe, âge, taille, activité, objectif, rythme)|
| `ct_wpresets`         | Préréglages de séances                                |
| `ct_log`              | Journal principal : repas + séances + notes           |
| `ct_todos`            | Tâches à faire                                        |
| `ct_theme`            | Thème clair/sombre                                    |

Aucune base de données externe, aucun compte utilisateur, aucune synchronisation entre appareils — tout est local à l'appareil/navigateur utilisé. L'export/import JSON (onglet Réglages) est le seul moyen de transférer les données.

## La fonctionnalité IA (`api/parse-meal.js`)

C'est le point le plus piégeux du repo, à lire avant d'y toucher.

- La variable d'environnement s'appelle **`CARNET_API_KEY`** (nom historique) mais **c'est en réalité une clé de l'abonnement Mammouth AI** de l'utilisateur (API compatible OpenAI, `https://api.mammouth.ai/v1/chat/completions`), **pas** une clé Anthropic. Une version antérieure du code utilisait le SDK Anthropic directement — ça ne fonctionnait pas car la clé n'était pas de ce type. Ne pas réintroduire le SDK Anthropic ici sans vérifier d'abord quelle clé l'utilisateur possède réellement.
- Modèle utilisé : **`gpt-5.4-mini`** — un identifiant **propre au catalogue Mammouth**, pas un nom OpenAI officiel. Les noms de modèles Mammouth changent avec le temps ; avant de changer le modèle, vérifier la liste à jour et les tarifs sur `https://info.mammouth.ai/fr/docs/api-quick-start/` (section "Modèles et tarifs"). Il existe aussi un raccourci `mammouth-recommended` qui pointe vers "le meilleur rapport qualité/prix du moment" (mais coûte généralement plus cher qu'un modèle mini/nano dédié).
- La fonction doit impérativement garder ses en-têtes **CORS** (`Access-Control-Allow-Origin: *` + gestion de `OPTIONS`), car l'appli est ouverte depuis un domaine différent (GitHub Pages) de celui qui héberge la fonction (Vercel).
- Côté client, `js/mealparser.js` définit `VERCEL_API_BASE` (actuellement `https://carnet-self.vercel.app`) : c'est l'URL absolue utilisée quand l'appli tourne sur un domaine autre que `*.vercel.app`. **Si le domaine de prod Vercel change un jour (renommage de projet, domaine perso, etc.), il faut mettre cette constante à jour**, sinon l'IA cesse de fonctionner depuis GitHub Pages silencieusement (erreur "Failed to fetch" côté utilisateur).
- Format de retour attendu par le front (`openAIResultModal` dans `mealparser.js`) :
  ```json
  {
    "success": true,
    "data": {
      "name": "string",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "ingredients": ["string", "..."]
    }
  }
  ```

## Déploiement

- **GitHub Pages** : automatique via `.github/workflows/static.yml` à chaque push sur `main`. Sert tout le contenu du repo tel quel (site statique).
- **Vercel** : automatique via l'intégration GitHub native de Vercel (pas un workflow dans ce repo). Le projet s'appelle `carnet` sous le compte `daft31`.
  - Il existait auparavant deux workflows GitHub Actions redondants et cassés (`deploy-to-vercel.yml` référençant une action GitHub inexistante, `mammouth-api.yml` essayant d'exécuter la fonction serverless comme un script Node autonome) — **ils ont été supprimés**. Ne pas les recréer sans corriger le problème sous-jacent (le déploiement Vercel réel n'en a de toute façon pas besoin).
  - **Vercel → Settings → Deployment Protection → "Vercel Authentication"** doit rester **désactivé** en Production. S'il est réactivé, toutes les requêtes (y compris vers `/api/parse-meal`) sont bloquées avant même d'atteindre le code, ce qui se manifeste par un "Failed to fetch" générique côté client.
  - La variable d'environnement `CARNET_API_KEY` (clé Mammouth, voir plus haut) doit être configurée dans **Vercel → Settings → Environment Variables**, en valeur directe (pas via l'ancienne syntaxe `@secret` de `vercel.json`, qui référence un système de Secrets legacy différent des variables d'environnement classiques).

### Cache-busting

Les balises `<script>`/`<link>` dans `index.html` portent un paramètre `?v=...`. **Penser à l'incrémenter à chaque modification d'un fichier JS/CSS** (surtout `core.js`, gros et souvent modifié), sinon les navigateurs (en particulier sur GitHub Pages, servi avec un cache HTTP standard) peuvent continuer à charger une version obsolète après déploiement.

## Historique utile

- Le repo a connu un refactor important qui a **fusionné une ancienne interface monolithique** (une unique page HTML avec CSS/JS inline, plus riche en fonctionnalités : poids, historique, notes, todos, réglages) avec une **infrastructure plus récente** mais alors incomplète (scanner code-barres + IA, chemins de fichiers cassés, CSS manquant). L'UI/UX actuelle vient de cette fusion : ne pas repartir d'une version antérieure sans vérifier d'abord ce qui a été consolidé.
- Avant ce refactor, le repo contenait des fichiers JS orphelins à la racine (`app.js`, `core.js`, `food.js`, `scanner.js`, `ui.js`, `workout.js`) qui ne correspondaient plus au HTML servi. Ils ont été supprimés ; tout le JS vit maintenant exclusivement dans `js/`.
