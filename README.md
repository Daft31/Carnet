# Kalo

Application web personnelle de suivi sportif et nutritionnel (calories, macros, poids, séances, historique). 100 % en français.

> **Note de renommage** : l'appli s'appelait auparavant "Carnet" ; le nom visible (titre, header, logo) est désormais **Kalo**. Par prudence, l'infrastructure historique n'a **pas** été renommée en profondeur : le nom du repo GitHub, le domaine Vercel (`carnet-self.vercel.app`), le chemin GitHub Pages (`daft31.github.io/carnet`), le préfixe des clés `localStorage` (`ct_*`) et la variable d'environnement `CARNET_API_KEY` restent tels quels. Les renommer casserait des liens/domaines en prod ou ferait perdre les données existantes des utilisateurs ; ce sont des changements distincts, plus risqués, à faire consciemment et séparément (voir la règle correspondante dans `CLAUDE.md`).

Ce document s'adresse autant à un humain qu'à un futur agent IA qui interviendrait sur ce repo.

> 🤖 **Agents Claude (Claude Code, etc.), y compris tout agent délégué/spawné pour une sous-tâche** : lire **ce README en entier** et [`CLAUDE.md`](./CLAUDE.md) (règles critiques, principes d'architecture, état détaillé des briques, décisions de ne-pas-construire) **avant d'entreprendre ou d'exécuter quoi que ce soit** sur ce repo, même pour une tâche qui paraît petite ou isolée.

## 1. Kalo en quelques lignes

Un tracker sport/nutrition 100 % statique (HTML/CSS/JS vanilla, sans build, sans framework), toutes les données dans le `localStorage` du navigateur. Il calcule des objectifs personnalisés, enregistre repas/séances/pesées, et — sur un périmètre précis et volontairement limité — adapte certains de ses comportements futurs à partir de l'historique réel de chaque utilisateur (portions habituelles, repas fréquents), sans machine learning ni IA pour ces décisions-là.

## 2. Objectif produit

Réduire la friction de saisie au quotidien, donner une lecture honnête et non biaisée de l'équilibre calorique/macros, et — progressivement, à mesure que l'historique s'accumule — reconnaître certains comportements répétés de l'utilisateur pour lui faire gagner du temps (portion préremplie, repas fréquent en un tap) sans jamais prétendre comprendre plus que ce que les données permettent réellement d'établir.

## 3. Fonctionnalités actuellement disponibles

Navigation **dashboard-first** : un seul hub central ("Aujourd'hui"), composé de cartes cliquables résumant chaque section, plus un bouton "+" flottant pour les raccourcis d'ajout et une icône Réglages dans l'en-tête. Pas de barre d'onglets persistante classique.

- **Aujourd'hui** (dashboard) : anneau de calories, macros du jour, carte "Kalo a remarqué" (Insights, voir §6), mini-graphe 7 jours, bloc Conseils (suggestions macro personnalisées par fréquence/favoris, voir §6), et une grille de cartes vers Repas / Recettes / Séances / Poids / Historique / Notes / To-do / Courses.
  - ⚠️ **Règle volontaire** : calories "restantes" = `objectif − calories mangées`, jamais moins les calories brûlées en sport (affichées séparément, "Brûlées (info)").
- **Repas** : recherche dans la base d'aliments intégrée, favoris, aliments personnalisés, créneau (Petit-déj/Déjeuner/Collation/Dîner) présélectionné selon l'heure, bloc "Repas fréquent" quand un pattern est détecté (Quick-add en un tap), portion préremplie automatiquement pour un aliment habituel (avec un petit label "quantité habituelle" dans le journal). Deux méthodes d'ajout rapide : **scanner un code-barres** (Open Food Facts) et **décrire un repas en langage libre (IA)**.
- **Séances** : plusieurs types (tapis, vélo, sport libre, club, saisie IA d'un programme collé en texte libre), favoris de type de séance, préréglages, estimation kcal en temps réel.
- **Poids** : suivi + graphes (poids, muscle, composition), interprétation en langage courant de la tendance, calcul BMR/TDEE, objectif de poids optionnel avec badge dashboard cliquable et libellé "Objectif : perte/prise/maintien".
- **Recettes** : import depuis un lien TikTok public (oEmbed + IA), rangement par "livres" personnalisés.
- **Courses** : liste manuelle + ajout automatique des ingrédients d'une recette importée.
- **Historique** : déficit calorique hebdomadaire (expand/collapse par semaine).
- **Notes**, **To-do**, **Réglages** (objectifs manuels, aliments perso, préréglages de séances, export/import JSON, reset complet).
- **Onboarding Day 0** : à la toute première utilisation (aucun repas, aucune pesée, profil vide), un écran unique (poids/âge/taille/sexe) calcule immédiatement des objectifs de départ.

## 4. Architecture / principes importants

Résumé — le détail et la justification de chaque principe sont dans `CLAUDE.md` :

- `localStorage` = seule persistance, aucun serveur de données, aucun compte.
- L'historique brut (`logEntries`/`weightEntries`) est la source de vérité ; tout est recalculé à la demande plutôt que mis en cache dans un objet de connaissance séparé.
- Logique déterministe d'abord — l'IA n'intervient que pour extraire du texte libre (repas décrit, recette, programme de sport), jamais pour une décision qu'une fonction déterministe peut prendre.
- Aucune causalité déduite d'une corrélation dans les textes d'Insight ; silence préféré à un constat fragile.

## 5. État actuel du projet

Douze "briques" de personnalisation/intelligence ont été construites et validées (provenance des données, Insights, repas récurrents + Quick-add, portions habituelles, comparaison de périodes, onboarding, raffinement d'objectifs, créneau contextuel, traçabilité `quantitySource`, cohérence des deux surfaces "Repas fréquent"...). Détail brique par brique dans `CLAUDE.md`.

**Chantier séparé, non fusionné sur `main`** : une migration vers un backend multi-utilisateur (Supabase — Postgres, auth par lien magique, Row Level Security) est en cours sur la branche dédiée `claude/supabase-migration` (Phase 1 auth déjà écrite là-bas). L'app utilisée en pratique (`main` et les autres branches) reste 100 % `localStorage`, sans compte, sans synchronisation entre appareils.

## 6. Personnalisation actuelle

Kalo adapte réellement son comportement futur sur deux points précis, tous deux basés sur une correspondance **exacte** (aucun fuzzy matching, aucune IA) :

- **Portion habituelle** (`typicalGramsFor`) : si un aliment du catalogue a été logué au moins 3 fois, sa quantité se préremplit automatiquement (médiane des dernières occurrences), avec un petit rappel "quantité habituelle" dans le journal par la suite.
- **Repas fréquent** (`frequentMealFor`) : si un même ensemble d'aliments domine nettement un créneau sur les 30 derniers jours (8 occurrences minimum), un raccourci "Ajouter ce repas" apparaît (et, ponctuellement, une carte sur le dashboard).

En complément, une couche d'**Insights** ("Kalo a remarqué") produit des constats chiffrés sur l'historique personnel (tendance de poids, écart semaine/week-end, ce qui a changé d'une semaine à l'autre) — ce sont des analyses calculées sur les données de l'utilisateur, pas une adaptation du comportement du système : distinction importante, détaillée dans `CLAUDE.md` (section Brique 12).

## 7. Limites connues

- Les portions habituelles et les repas fréquents ne se déclenchent que sur une **correspondance exacte** d'identifiant d'aliment ou d'ensemble d'aliments — un utilisateur à alimentation très variée peut ne jamais en bénéficier.
- Les entrées créées par **scan de code-barres** ou par **description IA** n'ont pas d'identifiant d'aliment stable : elles ne contribuent jamais aux portions habituelles, même en cas de répétition exacte du même produit/repas.
- Le champ `quantitySource:'habitual'` prouve qu'une quantité personnalisée a été **proposée**, pas que l'utilisateur l'a acceptée telle quelle ni qu'il l'a réellement consommée.
- Les Insights de comparaison de périodes ne peuvent structurellement pas apparaître avant environ 14 jours d'historique, quel que soit le comportement de l'utilisateur.
- Les recettes importées (texte libre) ne sont pas reliées au catalogue nutritionnel — impossible aujourd'hui de "logger une recette comme repas" directement.
- Un aliment reconnu "en partie" par le catalogue lors d'une description IA (confiance `mixed`) perd cette nuance à l'enregistrement (stocké comme `source:'ai'`, comme une estimation complète).

## 8. Vision future (pas en construction aujourd'hui)

À distinguer clairement de l'état actuel ci-dessus — rien de cette section n'est en cours de développement :

- Un éventuel **assistant en langage naturel** ("Demande à Kalo") qui orchestrerait les capacités déterministes déjà présentes (repas fréquent, portion habituelle, comparaison de périodes...) pour répondre à des questions comme "quel est mon petit-déj le plus fréquent" ou "qu'est-ce qui a changé cette semaine" — toutes déjà calculables aujourd'hui sans IA. Un futur assistant ne doit jamais devenir un prétexte pour construire une nouvelle capacité "au cas où".
- Un éventuel assouplissement (fuzzy matching) de la détection de repas fréquents/portions, si l'usage réel démontre que la correspondance exacte est trop restrictive pour une part significative des utilisateurs.
- La migration Supabase multi-utilisateur (voir §5), une fois sa branche jugée prête et testée.

## 9. Phase actuelle : usage réel / observation

**Kalo est en phase d'usage réel, pas en phase de construction active.** Aucun nouveau chantier ne doit être lancé sans un signal concret (friction récurrente, problème observé, donnée sous-exploitée dont la valeur est démontrée) — voir le protocole détaillé dans `CLAUDE.md`. Le fait qu'une amélioration soit possible n'est pas, à lui seul, une raison de la construire.

## Structure du repo

```
index.html          Coquille de l'appli (en-tête, #main, #modal-root, bouton "+" flottant)
css/style.css        Design system complet (couleurs, cards, modals, animations)
js/core.js            État (localStorage), utilitaires, calculs, rendu de toutes les pages (view*), moteur de personnalisation/Insights
js/ui.js               Système de modal (openModal/closeModal) + liaison des événements (bindTabEvents)
js/scanner.js          Scanner code-barres : Quagga2 (caméra) + Open Food Facts (base produits)
js/mealparser.js       Feature IA "décrire un repas" : appelle /api/parse-meal
js/recipeimport.js     Import de recette (lien TikTok) : appelle /api/parse-recipe
js/workoutparser.js    Saisie IA d'un programme de sport (texte libre) : appelle /api/parse-workout
js/app.js              Point d'entrée : listeners de l'en-tête (retour/réglages) et du bouton "+", thème, render() initial, enregistrement du service worker
api/parse-meal.js     Fonction serverless Vercel : proxy sécurisé vers l'API Mammouth AI (repas)
api/parse-recipe.js   Fonction serverless Vercel : oEmbed TikTok + structuration recette via Mammouth AI
api/parse-workout.js  Fonction serverless Vercel : structuration d'un programme de sport via Mammouth AI
manifest.json         Manifest PWA (nom, icônes, couleurs, display standalone)
sw.js                  Service worker minimal (réseau en priorité + secours cache, same-origin GET uniquement)
icons/                 Icônes PWA (icon-192.png, icon-512.png, maskable-512.png)
package.json          Pas de dépendances (les fonctions serverless utilisent fetch natif de Node)
vercel.json           Config build Vercel
.github/workflows/static.yml   Déploiement automatique vers GitHub Pages à chaque push sur main (seul workflow existant)
DEPLOYMENT.md         Notes de déploiement (variables d'environnement)
```

Aucun fichier `js/food.js` ni `js/workout.js` séparé : cette logique vit directement dans `core.js` (fusionnée lors d'un refactor historique, voir "Historique utile" plus bas).

## Modèle de données (localStorage)

Tout vit dans le navigateur, clé par clé (`LS.get/set` dans `core.js`) :

| Clé localStorage     | Contenu                                              |
| --------------------- | ----------------------------------------------------- |
| `ct_settings`         | Objectifs quotidiens (calories, protéines, glucides, lipides) |
| `ct_customFoods`      | Aliments créés manuellement par l'utilisateur         |
| `ct_foodOverrides`    | Surcharges de valeurs pour des aliments intégrés      |
| `ct_favorites`        | IDs des aliments favoris                              |
| `ct_weight`           | Historique de pesées (poids, masse grasse %, muscle en kg, eau) |
| `ct_profile`          | Profil (sexe, âge, taille, activité, objectif de poids, rythme) |
| `ct_wpresets`         | Préréglages de séances                                |
| `ct_favSports`        | Sports/types de séance mis en favori (blocs dédiés)   |
| `ct_log`              | Journal principal : repas + séances + notes           |
| `ct_todos`            | Tâches à faire                                        |
| `ct_shoppingList`     | Liste de courses                                      |
| `ct_recipes`          | Recettes importées                                    |
| `ct_recipeBooks`      | "Livres" de recettes créés par l'utilisateur           |
| `ct_insightsSeen`     | Dernière date d'affichage de chaque Insight (cooldown) |
| `ct_calibrationSeen`  | Banner Calibration déjà vu (one-shot)                  |
| `ct_portionRevealSeen`| Message "portion apprise" déjà vu (one-shot, tous aliments confondus) |
| `ct_theme`            | Thème clair/sombre                                    |

Aucune base de données externe, aucun compte utilisateur, aucune synchronisation entre appareils — tout est local à l'appareil/navigateur utilisé. L'export/import JSON (Réglages) est le seul moyen de transférer les données (voir §5 pour le chantier Supabase, non fusionné à ce jour).

### Base d'aliments intégrée

`RAW_FOODS`/`BUILTIN_FOODS` dans `js/core.js` (grosse array littérale en ligne 4, à ne pas lire d'un coup avec un outil de lecture classique — préférer `grep`/scripts ciblés). Chaque entrée a une `category` et un champ `state` (raw/cooked/baked/dry/...), utilisé notamment par le filtre "comestible tel quel". Les entrées fast-food (McDonald's, Burger King, KFC...) ont été ajoutées pour améliorer la reconnaissance côté saisie IA. Note connue non corrigée : certains caractères accentués sont corrompus dans les données sources (artefact de double encodage) — à contourner, pas à "corriger" au cas par cas sans vérifier l'étendue du problème.

## Les fonctionnalités IA (`api/parse-meal.js`, `api/parse-recipe.js`, `api/parse-workout.js`)

C'est le point le plus piégeux du repo, à lire avant d'y toucher.

- La variable d'environnement s'appelle **`CARNET_API_KEY`** (nom historique) mais **c'est en réalité une clé de l'abonnement Mammouth AI** de l'utilisateur (API compatible OpenAI, `https://api.mammouth.ai/v1/chat/completions`), **pas** une clé Anthropic. Partagée par les trois fonctions.
- **Modèle actuellement utilisé : `claude-haiku-4-5`** — un identifiant propre au catalogue Mammouth, pas un nom Anthropic officiel malgré son apparence. C'est un **fallback temporaire** : les modèles GPT de Mammouth sont indisponibles depuis un incident confirmé par leur support le 16/09/2026 ; le modèle "normal" avant l'incident était `gpt-5.4-mini`. Avant de changer de modèle, vérifier l'état de l'incident et la liste à jour sur `https://info.mammouth.ai/fr/docs/api-quick-start/`.
- Les trois fonctions doivent garder leurs en-têtes **CORS** (`Access-Control-Allow-Origin: *` + gestion de `OPTIONS`), car l'appli est ouverte depuis un domaine différent (GitHub Pages) de celui qui héberge les fonctions (Vercel).
- Côté client, `VERCEL_API_BASE` (actuellement `https://carnet-self.vercel.app`) est défini dans chacun des trois fichiers JS correspondants (`mealparser.js`, `recipeimport.js`, `workoutparser.js`) : URL absolue utilisée quand l'appli tourne sur un domaine autre que `*.vercel.app`. **Si le domaine de prod Vercel change, mettre à jour les trois**, sinon les features IA cessent de fonctionner silencieusement depuis GitHub Pages.
- `api/parse-recipe.js` récupère d'abord la légende d'une vidéo TikTok publique via l'API oEmbed officielle (pas d'authentification), puis la structure en recette via Mammouth AI.
- `api/parse-workout.js` structure un programme de sport en texte libre (blocks/EMOM/tempo/repos, formats variés) ; la durée totale estimée est recalculée côté code à partir de la structure renvoyée, jamais demandée directement au modèle (l'arithmétique est plus fiable en déterministe qu'en LLM).

## Déploiement

- **GitHub Pages** : automatique via `.github/workflows/static.yml` à chaque push sur `main`. Sert tout le contenu du repo tel quel (site statique) — ce workflow ne lance aucun test et ne touche pas à Vercel.
- **Vercel** : automatique via l'intégration GitHub native de Vercel (pas un workflow dans ce repo). Le projet s'appelle `carnet` sous le compte `daft31`.
  - Il existait auparavant deux workflows GitHub Actions redondants et cassés (`deploy-to-vercel.yml`, `mammouth-api.yml`) — **supprimés**, ne pas les recréer.
  - **Vercel → Settings → Deployment Protection → "Vercel Authentication"** doit rester **désactivé** en Production, sinon toutes les routes `/api/parse-*` sont bloquées avant même d'atteindre le code.
  - La variable d'environnement `CARNET_API_KEY` (clé Mammouth) doit être configurée dans **Vercel → Settings → Environment Variables**, en valeur directe.

### Cache-busting

Les balises `<script>`/`<link>` dans `index.html` portent un paramètre `?v=...`. **Penser à l'incrémenter à chaque modification d'un fichier JS/CSS** (`git hash-object <fichier> | cut -c1-7`), sinon les navigateurs (en particulier sur GitHub Pages) peuvent continuer à charger une version obsolète après déploiement.

### PWA (installation sur l'écran d'accueil)

Kalo est une PWA installable depuis `manifest.json` + `sw.js` (service worker minimal, stratégie réseau-prioritaire avec secours cache, uniquement sur les requêtes GET same-origin — n'intercepte jamais les appels vers les fonctions Mammouth, Open Food Facts, TikTok oEmbed ou les CDN externes).

- **Android/Chrome** : prompt d'installation automatique une fois les critères d'installabilité remplis.
- **iOS/Safari** : pas de prompt automatique (limitation Apple) — passer par Partager → "Sur l'écran d'accueil".
- Le service worker cache une copie de secours de chaque page/asset same-origin visité (usage hors-ligne basique après une première visite), sans liste de préchargement figée.

## Historique utile

- Le repo a connu un refactor important qui a **fusionné une ancienne interface monolithique** (une unique page HTML avec CSS/JS inline, plus riche en fonctionnalités : poids, historique, notes, todos, réglages) avec une **infrastructure plus récente** mais alors incomplète (scanner code-barres + IA). L'UI/UX actuelle vient de cette fusion, puis d'une refonte ultérieure vers une navigation dashboard-first (cartes cliquables plutôt que barre d'onglets) — ne pas repartir d'une version antérieure sans vérifier d'abord ce qui a été consolidé depuis.
- Avant ce refactor, le repo contenait des fichiers JS orphelins à la racine (`app.js`, `core.js`, `food.js`, `scanner.js`, `ui.js`, `workout.js`) qui ne correspondaient plus au HTML servi. Ils ont été supprimés ; tout le JS vit maintenant exclusivement dans `js/`.
