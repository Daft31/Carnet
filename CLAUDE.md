# CLAUDE.md

Instructions pour Claude Code (ou tout agent Claude) travaillant sur ce repo. Lire ce fichier avant toute modification. Le `README.md` contient une vue plus courte et plus lisible ; ce fichier est la référence complète — contexte produit, règles critiques, état réel des briques, et ce qu'on a explicitement décidé de ne pas construire.

> ⚠️ **Priorité absolue, avant toute action** : que tu sois l'agent principal ou un agent délégué (spawné pour une tâche précise), tu dois lire **ce fichier en entier** et **le `README.md` en entier** avant d'exécuter, modifier, committer ou pousser quoi que ce soit sur ce repo — même pour une tâche qui semble petite ou isolée. Ces deux fichiers contiennent des règles produit volontaires, des pièges déjà rencontrés, et des décisions de ne-pas-construire qui ne sont pas devinables depuis le code seul. Un agent qui saute cette lecture risque de casser une règle listée ci-dessous, ou de reconstruire une fonctionnalité déjà volontairement écartée.

## Le projet en une phrase

Kalo (anciennement "Carnet" — voir note de renommage ci-dessous) : appli web perso de suivi sport/nutrition, 100% statique (HTML/CSS/JS vanilla, sans build, sans framework), données en `localStorage`. Trois fonctions serverless Vercel pour les features IA (`api/parse-meal.js`, `api/parse-recipe.js`, `api/parse-workout.js`). Déployée à la fois sur GitHub Pages (statique seul) et Vercel (statique + API).

**Note de renommage** : le nom visible de l'appli (titre `<title>`, texte du header, logo) est "Kalo" depuis le renommage. L'infrastructure historique garde volontairement le nom "Carnet" : nom du repo GitHub, domaine Vercel (`carnet-self.vercel.app`), chemin GitHub Pages (`daft31.github.io/carnet`), variable d'environnement `CARNET_API_KEY`, préfixe `ct_*` des clés `localStorage`. Ne pas renommer ces éléments d'infra à l'occasion d'une simple demande de rebranding UI — ce sont des changements séparés, plus risqués (domaines cassés, perte de données existantes), à ne faire que sur demande explicite et avec un vrai plan de migration.

## Identité et objectif de Kalo

**Ce que Kalo est aujourd'hui** : un tracker sport/nutrition qui calcule (objectifs caloriques/macros à partir du profil), enregistre (repas/séances/pesées) et, sur certains points précis, adapte son propre comportement futur à partir de l'historique réel de l'utilisateur — sans machine learning, sans embeddings, sans fuzzy matching, uniquement via des fonctions déterministes avec seuils documentés (voir "État des briques" et "Brique 12" ci-dessous).

**Ce que Kalo n'est pas (aujourd'hui)** : ni un planificateur de repas, ni un coach IA conversationnel, ni un produit multi-utilisateur synchronisé (voir "Chantier Supabase" plus bas — isolé sur sa propre branche, non fusionné). Un futur "Demande à Kalo" (assistant en langage naturel au-dessus des capacités déterministes existantes) a été évoqué comme direction possible mais **n'est pas en construction** — voir "Vision future" dans le README et la section Decisions/Do Not Build ci-dessous : ne jamais construire une fonctionnalité au prétexte qu'elle "servirait" à cet assistant hypothétique.

## Architecture et principes fondamentaux

Ces principes ont émergé au fil des briques 6 à 12 (couche personnalisation/Insights) et s'appliquent à tout ajout futur dans le même esprit :

- **`raw history` (`logEntries`/`weightEntries`) = source de vérité unique.** Toute personnalisation se recalcule à partir de l'historique brut à chaque rendu ; on ne maintient pas de "profil comportemental" séparé qui pourrait diverger des données sources.
- **Préférer le recalculable au persistant.** Une donnée qu'on peut redériver de l'historique à la demande (ex. `typicalGramsFor()`, `frequentMealFor()`) ne doit pas devenir un objet de connaissance stocké séparément "pour aller plus vite" — le risque de désynchronisation dépasse le gain de perf sur ce volume de données. Exception assumée : `quantitySource` (Brique 12A), qui persiste une information de **provenance** (comment cette entrée précise a été créée) qu'on ne peut justement pas redériver après coup sans se tromper — voir plus bas.
- **Logique déterministe avant IA.** L'IA (Mammouth) est réservée aux trois cas où une extraction depuis du texte libre est nécessaire (décrire un repas, importer une recette, coller un programme de sport) — jamais pour une décision qu'une fonction déterministe peut prendre (ex. ne jamais demander à l'IA d'estimer une portion habituelle, un repas fréquent, ou une tendance : ce sont des calculs, pas des estimations).
- **Séparation stricte faits observés / personnalisation issue de l'historique / IA générative.** Ce sont trois couches distinctes dans le code (détecteur → Insight/affichage, jamais fusionnées) et dans le vocabulaire produit — ne jamais présenter un résultat de l'une comme s'il venait d'une autre.
- **Aucune causalité déduite d'une corrélation.** Tous les textes d'Insight (`whatChangedInsight`, `weightIntakeAlignment`, `activityIntakeShift`, `weekendVsWeekdayInsight`, `weightTrendInsight`) sont volontairement rédigés au niveau du simple constat chiffré — jamais "parce que", "ce qui explique", "grâce à". Ne pas franchir cette ligne même quand la corrélation semble évidente.
- **Éviter la fausse précision.** Chaque seuil (`INSIGHT_WEIGHT_DELTA_KG`, `PERIOD_MIN_COVERAGE_RATIO`, etc.) est documenté en commentaire avec sa justification ou son caractère arbitraire assumé — jamais un chiffre silencieux non expliqué.
- **Préférer le silence à un insight fragile ou banal.** Toute la couche Insights suit la règle "peu d'insights mais solides" : sous le seuil, on n'affiche rien plutôt qu'une observation possiblement fausse ou triviale.
- **Ne pas utiliser l'IA pour reproduire ce qu'une fonction déterministe fait déjà.** Si une réponse est calculable exactement (ex. "quel est mon petit-déj le plus fréquent") avec les fonctions existantes, ne jamais la faire passer par un appel IA — plus lent, moins fiable, et redondant.
- **Ne pas construire une fonctionnalité seulement parce qu'elle serait utile à un futur assistant.** Le futur assistant doit rester une couche d'orchestration au-dessus de capacités déterministes qui existent parce qu'elles ont une valeur utilisateur directe et démontrée — jamais l'inverse.

## Règles à ne jamais casser sans confirmation explicite de l'utilisateur

1. **Calcul calorique** : `calories restantes = objectif − calories mangées`. Le sport (calories brûlées) **ne doit jamais** être soustrait de ce calcul — affiché séparément à titre informatif seulement ("Brûlées (info)"). C'est un choix produit volontaire pour éviter le biais "j'ai fait du sport donc je peux manger plus". Ne pas réintroduire `kcalIn - kcalOut` dans `remaining` ou le déficit hebdomadaire.

2. **`CARNET_API_KEY` = clé Mammouth AI, pas Anthropic.** Le nom de la variable prête à confusion mais c'est une clé de l'API Mammouth (compatible OpenAI, `https://api.mammouth.ai/v1/chat/completions`). Ne pas la faire passer par le SDK `@anthropic-ai/sdk` (ça a déjà été essayé, ça échoue avec "API key is invalid"). Cette clé est partagée par les **trois** fonctions serverless (`api/parse-meal.js`, `api/parse-recipe.js`, `api/parse-workout.js`).

3. **Noms de modèles Mammouth** : ce sont des identifiants propres à Mammouth, pas les noms officiels OpenAI/Anthropic. **État actuel (temporaire)** : les trois fonctions utilisent `claude-haiku-4-5` — un incident côté Mammouth rend les modèles GPT temporairement indisponibles (confirmé par leur support le 16/09/2026). Le modèle "normal" avant cet incident était `gpt-5.4-mini`. Avant de changer de modèle dans l'un des trois fichiers `api/parse-*.js`, vérifier l'état de l'incident et le tableau à jour sur `https://info.mammouth.ai/fr/docs/api-quick-start/` — et si l'incident est résolu, envisager de revenir à un modèle GPT mini/nano plutôt que de garder le fallback indéfiniment.

4. **`VERCEL_API_BASE` dans `js/mealparser.js`** (et le même pattern dans `js/recipeimport.js`/`js/workoutparser.js`) : URL Vercel en dur (actuellement `https://carnet-self.vercel.app`), utilisée quand l'appli tourne sur un domaine hors `*.vercel.app` (ex. GitHub Pages, qui ne peut pas exécuter de fonction serverless). Si le domaine de prod Vercel change, cette constante doit être mise à jour dans les trois fichiers, sinon les features IA cassent silencieusement (erreur "Failed to fetch") sur la version GitHub Pages.

5. **Vercel → Deployment Protection → "Vercel Authentication"** doit rester désactivé en Production. Si quelqu'un le réactive, les trois routes `/api/parse-*` deviennent injoignables depuis l'extérieur (bloquées avant même d'atteindre le code).

6. **Cache-busting** : les `<script src="...?v=...">` / `<link ... ?v=...>` dans `index.html` doivent voir leur `?v=` incrémenté à chaque modification du fichier JS/CSS correspondant, sinon les navigateurs (surtout sur GitHub Pages) servent une version en cache après déploiement. Calcul : `git hash-object <fichier> | cut -c1-7`.

7. **Ne pas recréer** `deploy-to-vercel.yml` ni `mammouth-api.yml` (supprimés volontairement, cassés depuis le début — le vrai déploiement Vercel passe par l'intégration GitHub native, pas par un workflow Actions ; le seul workflow qui doit exister est `.github/workflows/static.yml`, pour GitHub Pages uniquement).

8. **`sw.js` (service worker PWA)** : stratégie volontairement simple — réseau en priorité, secours sur le cache, **uniquement pour les requêtes GET same-origin**. Ne jamais élargir son `fetch` handler pour intercepter les appels vers les fonctions Mammouth (`/api/parse-*`), Open Food Facts, TikTok oEmbed, ou les CDN externes (jsbarcode/quagga) : un service worker mal scopé qui met en cache une réponse d'API ou sert une version obsolète du JS peut casser l'appli silencieusement pour les utilisateurs qui l'ont installée en PWA, bien plus difficile à déboguer qu'un simple problème de cache navigateur classique.

## Avant de modifier l'UI/UX

- **Navigation actuelle (dashboard-first)** : il n'y a **plus** de barre d'onglets persistante avec 5 boutons directs + "Plus" (cette description est obsolète, ne pas s'y fier). Le hub central est le dashboard ("today"/Accueil), composé de cartes cliquables (`dashCard()` dans `core.js`, une par section : Repas, Recettes, Séances, Poids, Historique, Notes, To-do, Courses). Chaque carte navigue vers sa page complète via `switchTab()`. On en sort via le bouton retour `#backBtn` dans l'en-tête (statique dans `index.html`, lié une seule fois dans `js/app.js`) ou l'icône Réglages `#settingsBtn`. `nav.tabs`/`#tabs` dans `index.html` ne contient plus qu'un bouton flottant "+" (`#fabAdd`) qui ouvre `openFabMenu()` (raccourcis vers les flux d'ajout existants). Ne pas réintroduire une barre d'onglets classique sans en discuter — c'est un choix de refonte assumé.
- Le design system (`css/style.css`) et la structure des pages viennent d'une fusion volontaire entre une ancienne interface plus riche et l'infra actuelle (scanner + IA) — voir section "Historique utile" du `README.md` avant de repartir d'une version antérieure ou de renommer des classes/IDs à la légère (le JS de plusieurs fichiers dépend des mêmes IDs).
- Reste cohérent avec le thème existant (palette verte/papier, cards arrondies, `--font-mono` pour les chiffres) sauf demande contraire explicite.
- Le libellé de bouton d'onglet en `:hover`/`:focus-visible` doit rester restreint à `@media (hover:hover) and (pointer:fine)` : sur un vrai appareil tactile il n'existe aucun état de sortie du hover, donc sans cette restriction le libellé reste affiché après un tap (bug déjà rencontré et corrigé).
- `closeModal()` (`js/ui.js`) ajoute la classe `.closing` puis attend 180ms (durée de l'animation CSS `modalSheetOut`/`modalBgOut`) avant de vider `#modal-root`, en revérifiant que `#modalBg` est toujours le même élément. Ce garde-fou est nécessaire à cause du scanner (`js/scanner.js`) qui enchaîne `closeModal(); openXxxModal();` sans attendre : sans la vérification, le minuteur de l'ancienne fermeture effacerait la nouvelle modale ouverte entre-temps. Ne pas revenir à un `closeModal()` synchrone sans revalider ce flux.
- **Changer d'onglet doit remettre le scroll en haut** (`window.scrollTo(0,0)` + `#main.scrollTop=0` dans `switchTab()`, `js/core.js`, juste après `render()`). Bug réel déjà rencontré et corrigé : `render()` remplace `main.innerHTML` mais ne touche jamais à la position de scroll de la fenêtre ; sans ce reset, on atterrit sur le nouvel onglet à la position laissée par le précédent. Ne pas déplacer ce reset à l'intérieur de `render()` elle-même (appelée aussi après de simples actions dans le même onglet — ajout d'un repas, coche d'une case — où on ne veut surtout pas sauter en haut de page à chaque fois) : il doit rester spécifique à `switchTab()`.
- Le vrai scroll de cette appli est le scroll de **page** (`window`/`document`), pas un scroll interne à `#main`. En diagnostiquer un futur bug de scroll, tester `window.scrollY`/`document.documentElement.scrollHeight`, pas seulement `main.scrollTop`.
- Par prudence, éviter `backdrop-filter` sur `nav.tabs` (ou tout élément `position:fixed` pleine largeur) et toute animation avec `transform` directement sur `#main` : patterns CSS connus pour poser des problèmes de performance/scroll sur certains GPU/pilotes Android.
- **Garde anti-double-confirmation** sur les 4 boutons de confirmation d'ajout (`qtyConfirm`/`qaConfirm`/`scanQtyConfirm`/`aiConfirmBtn`) : un booléen `confirmed` local à chaque ouverture de modale (pas une variable globale), vérifié en premier dans le handler et posé uniquement **après** que la validation ait réussi — jamais avant, sinon une première saisie invalide bloquerait tout réessai. Nécessaire car `closeModal()` laisse le bouton cliquable pendant les ~180ms de son animation de fermeture : un double-tap physique redéclenchait deux fois le même ajout avant ce correctif. Toute nouvelle modale de confirmation qui écrit dans `logEntries` doit reprendre ce pattern.
- **`mealSearchResultsHtml(q, results)`** (`js/core.js`, juste avant `viewMeals()`) est la **seule source de vérité** pour le bloc Récents/Favoris/`foodRow`/état-vide de la recherche dans l'onglet Repas — utilisée à la fois par `viewMeals()` (rendu complet) et par le handler `input` incrémental (`js/ui.js`, qui ne redémonte jamais `#foodsearch` à chaque frappe pour éviter le flicker clavier mobile). Ne jamais recopier cette logique séparément dans l'un des deux chemins : une divergence entre eux a déjà causé un bug livré (Récents qui ne réapparaissaient pas après effacement d'une recherche).
- **`mealSearchQ` se réinitialise à la sortie de l'onglet Repas**, pas seulement après un ajout réussi : `switchTab(tab)` remet `mealSearchQ=''` dès que l'onglet actif est `'meals'` et que `tab` ne l'est pas (avant de changer `activeTab`). `switchTab()` est le seul point de sortie réel de Repas (bouton retour, Réglages, raccourcis du FAB) — un reset localisé au seul `#backBtn` laisserait les sorties par le FAB non couvertes.
- **Vocabulaire des toasts de confirmation** : `'Ajouté ✓'`/`'Repas ajouté ✓'` sont réservés aux actions qui écrivent réellement dans `logEntries` (catalogue/favoris/récents, scanner, IA, Quick-add). La création d'une simple définition réutilisable sans écriture dans `logEntries` (aliment personnalisé dans `customFoods`, préréglage de séance) utilise `'X enregistré ✓'` — jamais `'ajouté'`, qui laisserait croire que la consommation est déjà tracée au journal.

## Workflow git : quand pousser direct sur `main`, quand passer par une branche + PR

- Pour les changements courants (petites features, fixes, ajustements UI) sur ce projet solo, le workflow historique est un push direct sur `main` après chaque changement testé — c'est le mode par défaut si l'utilisateur ne précise rien d'autre.
- **Exception explicite : tout chantier qui touche à la persistance des données ou à l'architecture multi-utilisateur (ex. migration vers une vraie base de données / Supabase) doit se faire sur une branche dédiée, testée en profondeur, et n'être mergée sur `main` que via Pull Request.** Ne jamais pousser un tel chantier directement sur `main`, même partiellement — `main` est utilisé en production par l'utilisateur et au moins un autre utilisateur réel (un ami), donc une régression de données y est beaucoup plus coûteuse qu'un bug UI mineur.
- Si un agent délégué travaille sur un tel chantier, il doit committer/pousser uniquement sur sa branche dédiée et ne jamais ouvrir de PR ni merger sans confirmation explicite de l'utilisateur.
- **Chantier Supabase** : une Phase 1 (auth par lien magique, additive/défensive) existe déjà sur la branche `claude/supabase-migration` (schéma SQL + plan de migration également présents sur cette branche). Ce code n'existe **pas** sur `main` ni sur les autres branches de travail — avant de reconcevoir quoi que ce soit sur ce chantier, lire ce qui existe déjà sur cette branche plutôt que repartir de zéro.

## Multi-Agent Git Workflow

Depuis la mise en place de ce workflow (voir historique Git, commit `docs: établir le workflow Git multi-agents`), Kalo peut être travaillé en parallèle par plusieurs agents Claude spécialisés par domaine (UI/UX, direction artistique, marketing, accessibilité, performance, sécurité, tests, etc.), en plus du chat de développement générique habituel. Cette section est la référence unique pour ce fonctionnement — **tout nouvel agent doit la lire avant de commencer**.

### Ce que cette section change (et ce qu'elle ne change pas)

- **Ne change rien** au workflow historique décrit juste au-dessus pour le chat de développement générique/solo : petits fixes et ajustements courants continuent, par défaut, en push direct sur `main`.
- **Ajoute une règle nouvelle et stricte pour tout agent spécialisé par domaine** (un agent créé pour travailler spécifiquement UI/UX, DA, marketing, accessibilité, performance, sécurité, tests...) : **cet agent ne pousse jamais directement sur `main`**, quelle que soit la taille du changement. Il travaille exclusivement sur sa branche dédiée `agent/<domaine>`.
- Le chantier Supabase (`claude/supabase-migration`, voir ci-dessus) reste un cas à part : c'est une branche de migration/architecture, pas une branche d'agent-domaine, mais la même règle de fond s'applique (jamais de push direct sur `main`, intégration via PR uniquement, avec confirmation explicite de l'utilisateur).

### Convention de nommage des branches

```
main                    branche stable/intégrée — référence du projet
agent/<domaine>         branche de travail d'un agent spécialisé
```

Exemples actuels et futurs : `agent/ui-ux`, `agent/da`, `agent/marketing`, `agent/accessibility`, `agent/performance`, `agent/security`, `agent/testing`.

Un domaine = une branche. Si un même agent couvre en pratique deux domaines proches (ex. UI/UX et direction artistique confondues dans le même travail), ne pas créer artificiellement deux branches — le nommer selon le domaine dominant et le documenter explicitement dans le "État des branches agents" ci-dessous, plutôt que d'inventer une séparation qui n'existe pas dans le travail réel.

### `main` — responsabilité

Doit contenir en permanence : fonctionnalités validées, documentation synchronisée, état cohérent du produit. Aucun agent spécialisé ne pousse directement dessus. Un push direct sur `main` par un agent de domaine, même pour un correctif jugé mineur par cet agent, est une violation de ce workflow — pas une exception à laisser passer silencieusement.

### `agent/<domaine>` — responsabilité

Peut contenir du travail en cours, de l'expérimentation, des commits intermédiaires. N'est jamais considérée comme intégrée tant qu'elle n'a pas été validée puis fusionnée dans `main`. Un agent peut pousser librement sur sa propre branche sans validation préalable.

### Workflow d'un agent spécialisé

1. **Lire** `CLAUDE.md` (ce fichier) et `README.md` en entier avant toute action, même pour une tâche qui semble petite.
2. **Partir d'un `main` à jour** : `git fetch origin main && git checkout -b agent/<domaine> origin/main` (ou, si la branche existe déjà, la mettre à jour depuis `main` avant de continuer — voir "Branches longues" ci-dessous).
3. **Vérifier qu'aucun autre agent ne travaille déjà sur exactement le même périmètre** (voir "État des branches agents" ci-dessous, à tenir à jour par le chat Archiviste).
4. **Travailler uniquement sur sa branche**, committer régulièrement, pousser sur GitHub (`git push -u origin agent/<domaine>`). Ne jamais pousser directement sur `main`, ne jamais ouvrir de PR ni merger soi-même sans confirmation explicite de l'utilisateur.
5. **Ne pas se déclarer "terminé" comme s'il s'agissait d'une intégration.** "Terminé" signifie : travail de l'agent achevé et prêt pour relecture — pas validé, pas fusionné. À la fin de son chantier, l'agent doit produire un état clair : résumé du travail, fichiers modifiés, fonctionnalités/modifications réalisées, tests effectués, limites connues, conflits ou dépendances éventuels, statut du chantier.
6. **Signaler que la branche est prête pour validation/intégration** — au chat Archiviste, ou à l'utilisateur directement.

### Intégration dans `main`

```
agent/<domaine> → validation (chat Archiviste / utilisateur) → main
```

C'est une étape distincte du développement, jamais automatique. Avant toute fusion, vérifier au minimum : code, tests (s'ils existent), absence de régression évidente, cohérence avec l'architecture Kalo (principes de ce fichier), cohérence UX si le domaine est concerné, documentation à jour, version (voir plus bas), compatibilité avec d'autres branches récemment intégrées. Une branche qui dit "terminé" n'est pas de fait "validée" — ce sont deux états différents, ne jamais les confondre.

### Travail en parallèle (plusieurs agents simultanés)

Deux branches (ex. `agent/ui-ux` et `agent/da`) peuvent partir du même état connu de `main` et évoluer en parallèle. Si elles touchent des fichiers communs (typiquement `css/style.css`, `index.html`), vérifier avant intégration : conflits Git, conflits logiques (deux agents changent la même règle dans des sens différents), incohérences visuelles, modifications d'un agent silencieusement écrasées par l'autre. Un merge Git qui s'effectue sans conflit technique ne garantit pas un résultat correct — le vérifier quand même. **Ne jamais décréter d'ordre d'intégration fixe** (ex. "UI/UX toujours avant DA") : décider au cas par cas selon les dépendances réelles entre les deux chantiers au moment de l'intégration.

### Branches longues / synchronisation avec `main`

Un agent qui travaille longtemps sur sa branche peut prendre du retard par rapport à `main`. Avant intégration, vérifier si la branche a besoin d'être resynchronisée. Ne pas rebase/merge automatiquement une branche d'agent sans raison concrète (ex. conflit avéré ou dépendance sur un changement récent de `main`) — préserver l'historique et minimiser les opérations qui le réécrivent inutilement.

### Rôle du chat Archiviste

Un chat dédié ("Archiviste / Gardien Git & Documentation de Kalo") fait le pont entre chaque chantier d'agent et l'état officiel du repository :

```
Agent spécialisé → branche agent/<domaine> → travail + commits + push → branche prête
   → chat Archiviste → audit / documentation / version / validation → intégration → main
```

Ce chat n'est pas un agent produit : il ne développe pas de fonctionnalité, ne refactore pas "pendant qu'il y est", ne corrige pas de bug hors de son périmètre d'archivage. Son rôle : synchroniser README/CLAUDE.md/changelog, vérifier l'état des branches, maintenir les versions, archiver les décisions (y compris les décisions de **ne pas** construire quelque chose), vérifier la cohérence code/documentation, préparer et contrôler l'intégration des branches vers `main`.

### Versioning — état réel et proposition

**État constaté (vérifié dans le repo, pas supposé)** : `package.json` contient un champ `"version": "1.0.0"` qui n'est référencé nulle part ailleurs (aucun affichage dans l'UI, aucun tag Git, aucun `CHANGELOG.md`). Il n'existe donc **aucune convention de version réellement en usage** dans ce projet à ce jour — ne pas prétendre le contraire.

**Proposition (non appliquée automatiquement, à valider par l'utilisateur avant adoption)** : un numéro `MAJOR.MINOR.PATCH` simple, incrémenté **uniquement au moment où un chantier est intégré dans `main`** (jamais à la création d'une branche, jamais par agent, jamais proportionnellement au nombre de chantiers en cours) :
- `PATCH` : correctifs/ajustements mineurs intégrés.
- `MINOR` : nouvelle capacité ou brique produit intégrée.
- `MAJOR` : changement d'architecture ou de comportement significatif (ex. arrivée du multi-utilisateur Supabase).

La responsabilité de l'incrément, si cette convention est adoptée, reviendrait au chat Archiviste au moment de l'intégration — jamais à l'agent de domaine lui-même. Trois branches en cours de travail ne justifient jamais trois incréments de version : la version reflète l'état livré sur `main`, pas le nombre d'agents actifs.

### État des branches agents (à tenir à jour par le chat Archiviste)

| Branche | Domaine | Statut |
| --- | --- | --- |
| `agent/ui-ux` | UI/UX | Contient 2 commits (positionnement de la ligne d'objectif calorique sur le graphe, alignement de couleur des CTA positifs) hérités de l'ancienne branche `claude/busy-einstein-z2b995`, renommée pour respecter la convention. Non intégrée à `main` à ce jour. |
| `agent/da` | Direction artistique | Créée comme point de départ à partir de l'ancienne branche `claude/webapp-refinement-e1n74o`, qui était strictement identique à `main` au moment du renommage (aucun travail propre dedans) — sert de base vierge pour un futur travail DA, pas une branche contenant déjà un chantier DA achevé. |
| `claude/supabase-migration` | Migration architecture (hors convention agent/\<domaine\>) | Phase 1 (auth lien magique) écrite, non fusionnée. Voir section dédiée plus haut. |

**Nettoyage en attente (limitation d'outillage constatée, pas une décision produit)** : au moment de ce renommage, la suppression des anciens noms de branches distants (`claude/busy-einstein-z2b995`, `claude/webapp-refinement-e1n74o`, ainsi que `Dev` — une branche historique pré-refactor, très divergente, jugée obsolète) a échoué avec une erreur HTTP 403 : les identifiants Git disponibles dans les sessions d'agent permettent de créer/pousser des branches mais pas d'en supprimer côté distant. Ces trois branches existent donc encore sur GitHub en doublon/obsolètes le temps qu'un humain avec les droits suffisants les supprime manuellement (Settings → Branches, ou `git push origin --delete <branche>` avec un compte disposant du droit de suppression de refs).

### Before Starting Work (checklist pour tout nouvel agent spécialisé)

1. Lire `CLAUDE.md` (ce fichier) en entier.
2. Lire `README.md` si besoin de contexte produit général.
3. Vérifier la branche Git actuelle (`git branch --show-current`) et l'état du repo (`git status`).
4. Partir d'un `main` à jour (`git fetch origin main`).
5. Créer ou reprendre `agent/<domaine>` — jamais travailler directement sur `main`.
6. Vérifier dans le tableau "État des branches agents" ci-dessus qu'aucun autre agent ne travaille déjà sur exactement le même périmètre.
7. Lire les contraintes produit pertinentes (règles à ne jamais casser, décisions de ne-pas-construire) avant de modifier quoi que ce soit.

```
Agent <domaine>
      ↓
lit CLAUDE.md + README.md
      ↓
vérifie main à jour
      ↓
agent/<domaine>
      ↓
travail + commits + push
      ↓
ready for validation
```

## État des briques (jusqu'à la Brique 12)

Chronologie fonctionnelle, toutes dans `js/core.js` sauf mention contraire. "Hors périmètre" = limite volontaire, pas un oubli.

- **Provenance `source`/`confidence`** — chaque entrée `meal` porte un `source` (`manual`/`recurring`/`scan`/`catalog`/`ai`), affiché discrètement via `mealProvenanceLabel()`. `confidence` (`catalog`/`mixed`/estimation) n'existe que dans la réponse IA transitoire (`js/mealparser.js`) : à la sauvegarde, `mixed` est réduit à `source:'ai'` — la nuance "partiellement reconnu" ne persiste pas. Incohérence connue, non corrigée (mineure, hors scope Brique 12, auditée puis jugée P3 — voir cycle d'audit post-Brique 12 plus bas). Depuis ce même cycle, un résultat `confidence:'catalog'` modifié manuellement dans `openAIResultModal()` avant confirmation dégrade aussi `source` en `'ai'` (jamais une nouvelle catégorie) — réévalué à chaque frappe via un prédicat unique `matchesOriginal()`, donc redevient `'catalog'` si la valeur est restaurée exactement à l'identique. `'officiel'` (`mealProvenanceLabel()`) ne doit jamais s'afficher sur un nombre que l'utilisateur vient de taper lui-même.
- **Recommandations personnalisées (`topFoodsFor`)** — suggestions "à privilégier/éviter" dans le bloc Conseils du dashboard : triées par pertinence nutritionnelle d'abord, avec un bonus (plafonné à 5 occurrences) pour les aliments favoris/personnellement fréquents (`personalFoodFrequency`, fenêtre 60 jours). **Ce comportement a changé depuis une version antérieure du produit qui piochait volontairement hors de l'historique** — ne pas se fier à un vieux commentaire ou une vieille doc qui dirait le contraire.
- **Kalo Insights v0** (`kaloInsights()`/`kaloInsightsCard()`) — carte "Kalo a remarqué", max `INSIGHT_MAX_SHOWN=2` affichés, cooldown `INSIGHT_COOLDOWN_DAYS=4` par insight (voir `isInsightOnCooldown()` — le jour même de la première apparition n'est jamais compté comme cooldown). Composée de `whatChangedInsight`, `weightTrendInsight`, `weekendVsWeekdayInsight`, `commonBreakfastInsight`, avec subsomption (si `whatChanged` couvre déjà le poids, `weightTrendInsight` est retiré du pool pour ne jamais doublonner).
- **Détection des repas récurrents + Quick-add** (`recurringMealPatterns()`, `frequentMealFor(slot)`) — détecteur générique par créneau : `FREQUENT_MEAL_WINDOW_DAYS=30`, `FREQUENT_MEAL_MIN_SAMPLES=8`, dominance stricte `>50%` avec 2e option à `>10pts` d'écart. Signature = ensemble exact de `foodId` (zéro fuzzy matching, zéro tolérance — un ingrédient en plus/en moins = pattern différent). Exposé sur deux surfaces **prouvées identiques** (Brique 12B, voir plus bas) : bloc permanent dans `viewMeals()` et carte dashboard `commonBreakfastInsight()` (Petit-déj uniquement, cooldown Insight standard).
- **Portions habituelles personnalisées** (`typicalGramsFor(foodId)`) — médiane des `TYPICAL_PORTION_RECENT_SAMPLES=8` dernières entrées avec le même `foodId`, sous réserve d'au moins `TYPICAL_PORTION_MIN_SAMPLES=3`. **Dépend d'un `foodId` exact** : les entrées créées via scan (`js/scanner.js`) ou IA (`js/mealparser.js`) n'ont pas de `foodId` et ne contribuent ni ne bénéficient jamais de ce mécanisme — seul le flux "recherche catalogue" (`openQtyModal`) est concerné.
- **Comparaison de périodes** (`comparePeriods()`, `PERIOD_METRICS`) — moteur générique : compare deux fenêtres sur une métrique, statut `insufficient_data`/`stable`/`significant_change`. Couverture minimale `PERIOD_MIN_COVERAGE_DAYS=3` et `PERIOD_MIN_COVERAGE_RATIO=0.5` par fenêtre pour les métriques déclaratives (poids/kcal/protéines) — **conséquence structurelle : aucun insight basé là-dessus ne peut apparaître avant J14** (deux fenêtres de 7 jours), quel que soit le comportement de l'utilisateur.
- **Insight "Ce qui a changé"** (`whatChangedInsight()`) — compose jusqu'à 2 groupes (contexte croisé ou métrique simple) à partir de `comparePeriods()` sur 7j vs 7j précédents. Formulations strictement descriptives, jamais causales.
- **Cross-context `weightIntakeAlignment` (A1) / `activityIntakeShift` (B1)** — A1 : poids et calories évoluent significativement dans le même sens (co-mouvement). B1 : séances changent significativement pendant que les calories restent stables (divergence). Structurellement exclusifs (A1 exige kcal significatif, B1 exige kcal stable) — pas d'arbitrage de priorité nécessaire entre eux.
- **Personal Knowledge Layer (audit Brique 9)** — 9A (`typicalGramsFor`), 9B (`frequentMealFor` généralisé à 4 créneaux), 9C (`personalFoodFrequency`, 60 jours). 9D (détection de rythme d'entraînement) **auditée puis explicitement abandonnée** — aucun consommateur prêt, ne pas la reconstruire sans nouveau besoin démontré.
- **Fréquence alimentaire 60 jours** (`personalFoodFrequency()`) — comptage par `foodId` sur `PERSONAL_FREQUENCY_WINDOW_DAYS=60`, alimente uniquement le bonus de `topFoodsFor()`. Reste **silencieux** : aucun libellé n'indique à l'utilisateur qu'une suggestion vient de sa fréquence personnelle (recommandation d'exposition explicite étudiée puis **mise en attente**, voir Decisions/Do Not Build).
- **Calibration MVP** — `calibrationBanner()` : bandeau one-shot ("Kalo apprend de tes habitudes...") affiché au premier `viewToday()` réel, dismissible, flag `calibrationSeen` persisté, jamais réaffiché. "Portion reveal" (`portionRevealSeen`, dans `openQtyModal()`, `js/ui.js`) : message affiché une seule fois dans toute la vie de l'app, la première fois qu'une portion réellement personnalisée (jamais le repli 100g) est proposée.
- **Onboarding Day 0** (`isNewUser()`, `viewOnboarding()`) — condition dérivée (aucun repas ET aucune pesée ET profil vide), pas un flag "vu" séparé. Formulaire poids/âge/taille/sexe unique, `computeGoals()` appliqué immédiatement, redirige vers le premier ajout de repas.
- **Raffinement des objectifs (Brique 11)** — `computeGoals()` retourne aussi `goalState` (`'loss'|'gain'|'maintain'|null`), dérivé une seule fois et réutilisé par le dashboard (pas de re-comparaison `goalWeight`/`weight` dupliquée). Bugfix : `goalWeight === weight` avec `rate` non nul ne produit plus de déficit/surplus fantôme. Badge dashboard cliquable dans l'état "Point de départ" → scroll vers `#weightGoalCard` (onglet Poids, carte existante, pas de modale dupliquée).
- **Contexte `mealSlot` (Brique 10)** (`mealSlotForTime()`) — présélection du créneau à l'entrée réelle sur l'onglet Repas (via `switchTab()`, jamais recalculé en cours de visite). Bornes : Petit-déj 5h-11h, Déjeuner 11h-15h, Collation 15h-19h, Dîner 19h-5h (traverse minuit). Une suggestion, jamais une mémoire — un choix manuel pendant la visite n'est jamais écrasé.
- **Brique 12A — `quantitySource`** (`'user'|'habitual'`) — champ ajouté **uniquement** à la création d'une entrée via `openQtyModal()` (`js/ui.js`), capturé au moment de l'ouverture de la modale (jamais déduit après coup d'une comparaison grammage/médiane). `'habitual'` si `typicalGramsFor()` a proposé une valeur, `'user'` sinon — reste `'habitual'` même si l'utilisateur modifie ensuite la valeur proposée (V1 volontaire : ne prouve que "proposé", pas "accepté tel quel"). Quick-add (`source:'recurring'`) garde son propre mécanisme de quantité, **jamais** de `quantitySource`. Affiché discrètement via `mealProvenanceLabel()` ("160 g · quantité habituelle") dans "Repas du jour" (`viewMeals()`) et l'Historique (`dayLogList()`) — jamais rétroactif sur les anciennes entrées sans le champ.
- **Brique 12B — cohérence Dashboard/Repas fréquent** — `commonBreakfastInsight()` appelle `frequentMealFor('Petit-déj')` sans transformation : **même détecteur, même contenu, prouvé par test**, sur les deux surfaces. Seule la visibilité diffère volontairement (cooldown côté Insight dashboard, permanent côté bloc utilitaire `viewMeals()`) — ne jamais faire diverger le contenu entre les deux, seule la visibilité peut différer.

## Brique 12 — Personalization Loop

**Statut : CLOSE / FROZEN.**

Conclusions de l'audit à connaître avant de rouvrir quoi que ce soit sur ce périmètre (repas, portions, fréquence, Insights, Calibration, onboarding, raffinement d'objectif, `mealSlot`, Quick-add) :

- Kalo exploite réellement certaines habitudes pour modifier son **comportement futur** — ce n'est pas qu'un calcul affiché une fois. `typicalGramsFor` et `frequentMealFor` sont les deux mécanismes qui font ça concrètement (préremplissage persistant, bloc Quick-add).
- `comparePeriods()`/Insights sont des **analyses personnalisées de l'historique** (calculées sur les propres données de l'utilisateur), mais **ne constituent pas une boucle d'apprentissage comportemental** — ils ne changent aucune décision future du système, contrairement aux deux mécanismes ci-dessus. Ne pas les citer comme preuve que "Kalo apprend" au sens fort.
- `quantitySource:'habitual'` prouve qu'une quantité habituelle a été **proposée** à la création de l'entrée. Ça **ne prouve pas** que l'utilisateur l'a acceptée telle quelle, ni qu'il l'a réellement consommée — l'information persistée est plus faible qu'elle n'y paraît, ne pas la sur-interpréter dans un futur usage (dashboard, assistant, export).
- `source:'recurring'` (Quick-add) est une preuve structurellement **plus forte** : c'est un flux opt-in (l'utilisateur clique explicitement pour l'utiliser), donc l'existence de l'entrée prouve un geste d'acceptation actif — contrairement au préremplissage passif de `quantitySource:'habitual'`.
- `typicalGramsFor` dépend d'un `foodId` exact : les flux **scanner et IA-repas n'en bénéficient jamais**, même en cas de répétition parfaite du même produit/repas — c'est une limite structurelle du flux d'entrée, pas de la logique de détection.
- Le système de repas fréquents (`recurringMealPatterns`) utilise une **correspondance exacte** de l'ensemble des `foodId` — aucun fuzzy matching, aucun embedding. Volontaire et documenté, pas un manque à corriger dans l'immédiat.
- Ces limitations sont des **choix architecturaux assumés à ce stade**, pas des bugs — ne pas les traiter comme des tickets à corriger sans nouveau signal d'usage réel qui en démontre le besoin.
- Le wording du banner Calibration ("Kalo apprend de tes habitudes") a été audité spécifiquement et jugé **suffisamment honnête** dans son registre courant (pas une revendication ML) — décision **KEEP**, ne pas rouvrir cette question sans signal nouveau.

## Cycle d'audit UX du parcours d'ajout de repas (post-Brique 12)

Après la Brique 12 (gelée), une série d'audits UX ciblés puis un audit transversal de l'app entière ont été menés sur le parcours "ajouter un repas" (catalogue/favoris/récents/repas fréquent/Quick-add/scanner/IA/aliment personnalisé) et sur les écrans principaux, suivis d'un audit technique de consolidation. Conclusions et changements réels à connaître :

- **Corrections livrées** (comportement réel, pas juste visuel) : toggle Grammes↔Portions convertit réellement la valeur affichée au changement d'unité ; la carte Poids du dashboard affiche une fraîcheur explicite (`· hier`/`· il y a Nj`) quand la dernière pesée n'est pas du jour même ; l'Historique fait écho au streak calorique du dashboard ; le résultat d'une description IA (`openAIResultModal()`) est éditable (kcal/macros) avant confirmation, avec validation (macro vide → 0g légitime, valeur négative/non-numérique → rejetée avec toast) ; "Reformuler" repasse la description originale telle que tapée, jamais reconstruite depuis le résultat IA ; provenance catalogue correctement dégradée après modification manuelle (voir le bullet Provenance ci-dessus) ; garde anti-double-confirmation sur les 4 chemins d'ajout ; Récents réapparaissent immédiatement après effacement d'une recherche ; toast de création d'aliment personnalisé distinct d'un ajout au journal ; `mealSearchQ` réinitialisé à la sortie de Repas ; duplication Récents/Favoris/`foodRow` consolidée dans `mealSearchResultsHtml()` (voir les bullets correspondants dans "Avant de modifier l'UI/UX" ci-dessus pour le détail de chaque pattern à respecter).
- **Audit transversal des écrans principaux et des parcours quotidiens réels** (dashboard, repas, historique, poids, activité, insights, et dix parcours utilisateur bout-en-bout incluant une fermeture/réouverture réelle de l'app) : **aucun problème P0/P1 démontré**. Seule incohérence de vocabulaire notée : `'enregistré'` est utilisé à la fois pour un événement journalisé (séance, pesée) et pour une définition réutilisable (aliment perso, préréglage) — pas de confusion démontrée à ce jour (chaque toast reprend le libellé exact du bouton cliqué), à surveiller seulement si un signal d'usage réel apparaît.
- **Audit technique de consolidation** (duplication, couplage, état global, modales, validations, provenance, tests, complexité des fonctions, localStorage, documentation) : architecture jugée globalement saine, pas de refactor massif justifié. Un seul point de dette corrigé (la duplication de recherche ci-dessus). Un point signalé mais **volontairement non corrigé** : `openCustomFoodModal()`/`openEditFoodModal()` (`js/ui.js`) acceptent une saisie de kcal/macro négative ou non numérique sans la rejeter (`parseFloat(...)||0` ne filtre pas le signe), contrairement à la validation plus stricte d'`openAIResultModal()` — gap pré-existant (pas introduit par ce cycle), laissé tel quel faute de signal d'usage réel démontrant un risque concret ; ne pas le "corriger" par symétrie seule sans un vrai signal.
- **Important pour un futur agent** : les fichiers de test Playwright écrits au fil de ce cycle (un par correctif ci-dessus, plusieurs dizaines de fichiers en régression active au moment de l'audit) **ne sont pas committés dans ce repo** — ils n'existent que dans le scratchpad éphémère de la session qui les a écrits, jamais dans `git` (pas de dossier `tests/`, pas de dépendance de test dans `package.json`). Ne pas supposer qu'une suite de tests existe quelque part dans le projet ; en écrire une ciblée pour toute nouvelle modification reste la norme ici, pas l'exception.

Phase actuelle du produit inchangée par ce cycle : toujours "usage réel / observation" (voir plus bas) — ce cycle était un audit puis correctif de friction déjà existante dans une brique déjà livrée, pas un nouveau chantier de construction.

## Decisions / Do Not Build

Pistes explicitement envisagées puis écartées — un futur agent qui repère l'un de ces "trous" ne doit pas en déduire qu'il faut le combler. Le combler parce qu'il est visible, sans preuve de besoin, est le mode de sur-construction qu'on cherche justement à éviter.

- **Personnalisation des séances par symétrie avec les repas** (un "typicalGramsFor pour les séances") — capacité réellement absente, mais aucune preuve qu'elle résout un problème utilisateur actuel. Construire par pure symétrie architecturale n'est pas une justification.
- **Liaison automatique recettes ↔ catalogue nutritionnel** — les recettes importées (`js/recipeimport.js`) stockent des ingrédients en texte libre, sans lien vers `foodId`/macros. Combler ce trou demanderait du fuzzy matching ou de l'IA pour faire correspondre texte libre → catalogue, avec un vrai risque d'erreur nutritionnelle, pour un besoin non démontré.
- **Fuzzy matching / embeddings pour la détection de repas/portions** — évoqué à plusieurs reprises comme solution à l'asymétrie "utilisateur répétitif vs utilisateur varié" (Brique 12), volontairement pas construit : mesurer le problème avant de le résoudre.
- **Nouvelle couche de connaissance persistante** ("profil utilisateur" séparé de l'historique brut) — contraire au principe "raw history = source de vérité" ci-dessus.
- **Enrichissement massif de l'onglet Historique** (au-delà du déficit hebdomadaire actuel) — équivaudrait à prolonger la boucle Insights/personnalisation gelée sous un autre nom.
- **Assistant IA comme couche parallèle de connaissance** — un futur "Demande à Kalo" doit rester une orchestration de capacités déterministes existantes, jamais un prétexte pour construire une nouvelle capacité "au cas où l'assistant en aurait besoin".
- **Instrumentation analytics spécifique** pour mesurer l'usage — non construite : les données nécessaires (`quantitySource`, `source:'recurring'`, etc.) existent déjà dans `logEntries`/localStorage et sont consultables manuellement, pas besoin d'un pipeline dédié tant que l'échelle reste ce qu'elle est (usage perso + un ami).

Raisons générales de ces refus (à réutiliser comme grille pour tout nouveau candidat) : absence de besoin utilisateur démontré, risque de surconstruction, coût/complexité disproportionné par rapport au signal disponible, proximité excessive avec une brique déjà gelée, ou absence de signal d'usage réel.

## Phase actuelle du projet : usage réel / observation

**Kalo est actuellement en phase d'usage réel / observation.** Aucun nouveau chantier produit ne doit être lancé sans signal concret — ne jamais transformer "il reste des choses constructibles" en obligation de les construire.

Signaux acceptables pour justifier de rouvrir un chantier :
- friction récurrente (pas ponctuelle) observée dans l'usage réel ;
- problème concrètement rencontré par l'utilisateur (ou son entourage réel de test) ;
- donnée existante sous-exploitée dont la valeur peut être démontrée (pas supposée) ;
- besoin utilisateur concret, pas une idée de fonctionnalité qui "semble logique" ;
- comportement récurrent (pas une observation isolée de quelques jours) montrant qu'une capacité manque réellement.

Protocole à appliquer à tout nouveau signal, dans cet ordre : **Fait observé → Friction → Hypothèse (jamais traitée comme un fait avant vérification) → Impact → Solution minimale (seulement si l'intervention est justifiée, en réutilisant les briques existantes en priorité) → Décision (NO ACTION / INVESTIGATE / BUILD)**. Ne jamais combler une donnée manquante par une supposition.

### Signal d'usage observé (à date)

**Observation** (pas une conclusion produit) : pendant environ 3 jours consécutifs, lors de la préparation du déjeuner et de la collation, l'utilisateur a renseigné ces repas immédiatement le matin plutôt qu'au moment réel de leur consommation — pour éviter d'avoir à le refaire plus tard dans la journée.

Formulation conceptuelle retenue : *"l'utilisateur renseigne parfois plusieurs repas futurs au moment de leur préparation, car l'information et l'action sont simultanément disponibles, ce qui évite une friction ultérieure."*

Important : observation répétée sur ~3 jours seulement — **insuffisant pour conclure à un besoin général**. Aucune fonctionnalité ne doit être construite sur cette seule observation (en particulier : ne pas en déduire que Kalo devrait devenir une application de planification de repas). Elle constitue un signal à surveiller, pas un mandat de construction.

## Où lire le reste

`README.md` : présentation courte du projet, structure des fichiers, modèle de données localStorage, détails de déploiement, vision future clairement séparée de l'état actuel.
