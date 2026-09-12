# CLAUDE.md

Instructions pour Claude Code (ou tout agent Claude) travaillant sur ce repo. Lire ce fichier avant toute modification. Le `README.md` contient le détail complet ; ce fichier ne liste que les règles **critiques à ne jamais casser par erreur**.

## Le projet en une phrase

Carnet : appli web perso de suivi sport/nutrition, 100% statique (HTML/CSS/JS vanilla, sans build, sans framework), données en `localStorage`, une seule fonction serverless (`api/parse-meal.js`) pour la feature IA. Déployée à la fois sur GitHub Pages (statique seul) et Vercel (statique + API).

## Règles à ne jamais casser sans confirmation explicite de l'utilisateur

1. **Calcul calorique** : `calories restantes = objectif − calories mangées`. Le sport (calories brûlées) **ne doit jamais** être soustrait de ce calcul — affiché séparément à titre informatif seulement ("Brûlées (info)"). C'est un choix produit volontaire pour éviter le biais "j'ai fait du sport donc je peux manger plus". Ne pas réintroduire `kcalIn - kcalOut` dans `remaining` ou le déficit hebdomadaire.

2. **`CARNET_API_KEY` = clé Mammouth AI, pas Anthropic.** Le nom de la variable prête à confusion mais c'est une clé de l'API Mammouth (compatible OpenAI, `https://api.mammouth.ai/v1/chat/completions`). Ne pas la faire passer par le SDK `@anthropic-ai/sdk` (ça a déjà été essayé, ça échoue avec "API key is invalid").

3. **Noms de modèles Mammouth** : ce sont des identifiants propres à Mammouth (ex. `gpt-5.4-mini`, `gpt-5.4-nano`, `claude-haiku-4-5`, `glm-5.3-flash`), pas les noms officiels OpenAI/Anthropic. Avant de changer de modèle dans `api/parse-meal.js`, vérifier le tableau à jour sur `https://info.mammouth.ai/fr/docs/api-quick-start/`.

4. **`VERCEL_API_BASE` dans `js/mealparser.js`** : URL Vercel en dur (actuellement `https://carnet-self.vercel.app`), utilisée quand l'appli tourne sur un domaine hors `*.vercel.app` (ex. GitHub Pages, qui ne peut pas exécuter de fonction serverless). Si le domaine de prod Vercel change, cette constante doit être mise à jour, sinon l'IA casse silencieusement (erreur "Failed to fetch") sur la version GitHub Pages.

5. **Vercel → Deployment Protection → "Vercel Authentication"** doit rester désactivé en Production. Si quelqu'un le réactive, `/api/parse-meal` devient injoignable depuis l'extérieur (bloqué avant même d'atteindre le code).

6. **Cache-busting** : les `<script src="...?v=...">` / `<link ... ?v=...>` dans `index.html` doivent voir leur `?v=` incrémenté à chaque modification du fichier JS/CSS correspondant, sinon les navigateurs (surtout sur GitHub Pages) servent une version en cache après déploiement.

7. **Ne pas recréer** `deploy-to-vercel.yml` ni `mammouth-api.yml` (supprimés volontairement, cassés depuis le début — le vrai déploiement Vercel passe par l'intégration GitHub native, pas par un workflow Actions).

## Avant de modifier l'UI/UX

- Le design system (`css/style.css`) et la structure des onglets viennent d'une fusion volontaire entre une ancienne interface plus riche et l'infra actuelle (scanner + IA) — voir section "Historique utile" du `README.md` avant de repartir d'une version antérieure ou de renommer des classes/IDs à la légère (le JS de plusieurs fichiers dépend des mêmes IDs).
- Reste cohérent avec le thème existant (palette verte/papier, cards arrondies, `--font-mono` pour les chiffres) sauf demande contraire explicite.

## Où lire le reste

`README.md` : architecture complète, structure des fichiers, modèle de données localStorage, détails de déploiement.
