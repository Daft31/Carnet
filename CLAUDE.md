# CLAUDE.md

Instructions pour Claude Code (ou tout agent Claude) travaillant sur ce repo. Lire ce fichier avant toute modification. Le `README.md` contient le détail complet ; ce fichier ne liste que les règles **critiques à ne jamais casser par erreur**.

> ⚠️ **Priorité absolue, avant toute action** : que tu sois l'agent principal ou un agent délégué (spawné pour une tâche précise), tu dois lire **ce fichier en entier** et **le `README.md` en entier** avant d'exécuter, modifier, committer ou pousser quoi que ce soit sur ce repo — même pour une tâche qui semble petite ou isolée. Ces deux fichiers contiennent des règles produit volontaires et des pièges déjà rencontrés qui ne sont pas devinables depuis le code seul. Un agent qui saute cette lecture risque de casser une règle listée ci-dessous sans le savoir.

## Le projet en une phrase

Kalo (anciennement "Carnet" — voir note de renommage ci-dessous) : appli web perso de suivi sport/nutrition, 100% statique (HTML/CSS/JS vanilla, sans build, sans framework), données en `localStorage`, une seule fonction serverless (`api/parse-meal.js`) pour la feature IA. Déployée à la fois sur GitHub Pages (statique seul) et Vercel (statique + API).

**Note de renommage** : le nom visible de l'appli (titre `<title>`, texte du header, logo) est "Kalo" depuis le renommage. L'infrastructure historique garde volontairement le nom "Carnet" : nom du repo GitHub, domaine Vercel (`carnet-self.vercel.app`), chemin GitHub Pages (`daft31.github.io/carnet`), variable d'environnement `CARNET_API_KEY`, préfixe `ct_*` des clés `localStorage`. Ne pas renommer ces éléments d'infra à l'occasion d'une simple demande de rebranding UI — ce sont des changements séparés, plus risqués (domaines cassés, perte de données existantes), à ne faire que sur demande explicite et avec un vrai plan de migration.

## Règles à ne jamais casser sans confirmation explicite de l'utilisateur

1. **Calcul calorique** : `calories restantes = objectif − calories mangées`. Le sport (calories brûlées) **ne doit jamais** être soustrait de ce calcul — affiché séparément à titre informatif seulement ("Brûlées (info)"). C'est un choix produit volontaire pour éviter le biais "j'ai fait du sport donc je peux manger plus". Ne pas réintroduire `kcalIn - kcalOut` dans `remaining` ou le déficit hebdomadaire.

2. **`CARNET_API_KEY` = clé Mammouth AI, pas Anthropic.** Le nom de la variable prête à confusion mais c'est une clé de l'API Mammouth (compatible OpenAI, `https://api.mammouth.ai/v1/chat/completions`). Ne pas la faire passer par le SDK `@anthropic-ai/sdk` (ça a déjà été essayé, ça échoue avec "API key is invalid").

3. **Noms de modèles Mammouth** : ce sont des identifiants propres à Mammouth (ex. `gpt-5.4-mini`, `gpt-5.4-nano`, `claude-haiku-4-5`, `glm-5.3-flash`), pas les noms officiels OpenAI/Anthropic. Avant de changer de modèle dans `api/parse-meal.js`, vérifier le tableau à jour sur `https://info.mammouth.ai/fr/docs/api-quick-start/`.

4. **`VERCEL_API_BASE` dans `js/mealparser.js`** : URL Vercel en dur (actuellement `https://carnet-self.vercel.app`), utilisée quand l'appli tourne sur un domaine hors `*.vercel.app` (ex. GitHub Pages, qui ne peut pas exécuter de fonction serverless). Si le domaine de prod Vercel change, cette constante doit être mise à jour, sinon l'IA casse silencieusement (erreur "Failed to fetch") sur la version GitHub Pages.

5. **Vercel → Deployment Protection → "Vercel Authentication"** doit rester désactivé en Production. Si quelqu'un le réactive, `/api/parse-meal` devient injoignable depuis l'extérieur (bloqué avant même d'atteindre le code).

6. **Cache-busting** : les `<script src="...?v=...">` / `<link ... ?v=...>` dans `index.html` doivent voir leur `?v=` incrémenté à chaque modification du fichier JS/CSS correspondant, sinon les navigateurs (surtout sur GitHub Pages) servent une version en cache après déploiement.

7. **Ne pas recréer** `deploy-to-vercel.yml` ni `mammouth-api.yml` (supprimés volontairement, cassés depuis le début — le vrai déploiement Vercel passe par l'intégration GitHub native, pas par un workflow Actions).

8. **`sw.js` (service worker PWA)** : stratégie volontairement simple — réseau en priorité, secours sur le cache, **uniquement pour les requêtes GET same-origin**. Ne jamais élargir son `fetch` handler pour intercepter les appels vers l'API Mammouth (`/api/parse-meal`), Open Food Facts, ou les CDN externes (jsbarcode/quagga) : un service worker mal scopé qui met en cache une réponse d'API ou sert une version obsolète du JS peut casser l'appli silencieusement pour les utilisateurs qui l'ont installée en PWA, bien plus difficile à déboguer qu'un simple problème de cache navigateur classique.

## Avant de modifier l'UI/UX

- Le design system (`css/style.css`) et la structure des onglets viennent d'une fusion volontaire entre une ancienne interface plus riche et l'infra actuelle (scanner + IA) — voir section "Historique utile" du `README.md` avant de repartir d'une version antérieure ou de renommer des classes/IDs à la légère (le JS de plusieurs fichiers dépend des mêmes IDs).
- Reste cohérent avec le thème existant (palette verte/papier, cards arrondies, `--font-mono` pour les chiffres) sauf demande contraire explicite.
- La nav est un hybride : 5 onglets directs (`data-tab`) + un bouton `#moreToggle` qui déplie `#moreMenu` (Notes/To-do/Réglages). Ces IDs sont câblés en dur dans `js/app.js` (délégation de clic) et `css/style.css` (media query `hover`/`pointer` pour éviter le libellé qui reste collé au tap sur mobile) — ne pas les renommer sans mettre à jour les deux.
- Le libellé de bouton d'onglet en `:hover`/`:focus-visible` doit rester restreint à `@media (hover:hover) and (pointer:fine)` : sur un vrai appareil tactile il n'existe aucun état de sortie du hover, donc sans cette restriction le libellé reste affiché après un tap (bug déjà rencontré et corrigé).
- `closeModal()` (`js/ui.js`) ajoute la classe `.closing` puis attend 180ms (durée de l'animation CSS `modalSheetOut`/`modalBgOut`) avant de vider `#modal-root`, en revérifiant que `#modalBg` est toujours le même élément. Ce garde-fou est nécessaire à cause du scanner (`js/scanner.js`) qui enchaîne `closeModal(); openXxxModal();` sans attendre : sans la vérification, le minuteur de l'ancienne fermeture effacerait la nouvelle modale ouverte entre-temps. Ne pas revenir à un `closeModal()` synchrone sans revalider ce flux.

## Workflow git : quand pousser direct sur `main`, quand passer par une branche + PR

- Pour les changements courants (petites features, fixes, ajustements UI) sur ce projet solo, le workflow historique est un push direct sur `main` après chaque changement testé — c'est le mode par défaut si l'utilisateur ne précise rien d'autre.
- **Exception explicite : tout chantier qui touche à la persistance des données ou à l'architecture multi-utilisateur (ex. migration vers une vraie base de données / Supabase) doit se faire sur une branche dédiée, testée en profondeur, et n'être mergée sur `main` que via Pull Request.** Ne jamais pousser un tel chantier directement sur `main`, même partiellement — `main` est utilisé en production par l'utilisateur et au moins un autre utilisateur réel (un ami), donc une régression de données y est beaucoup plus coûteuse qu'un bug UI mineur.
- Si un agent délégué travaille sur un tel chantier, il doit committer/pousser uniquement sur sa branche dédiée et ne jamais ouvrir de PR ni merger sans confirmation explicite de l'utilisateur.

## Où lire le reste

`README.md` : architecture complète, structure des fichiers, modèle de données localStorage, détails de déploiement, état des chantiers en cours.
