# 📔 Carnet - Fitness & Nutrition Tracker

Une **application web complète** pour tracker vos **entraînements, repas et statistiques de fitness** en temps réel.

---

## 🎯 Description du Projet

**Carnet** est une application progressive web app (PWA) qui permet de :
- 📊 **Tracker les entraînements** : exercices, séries, poids, durée
- 🍽️ **Logger les repas** : calories, macros (protéines, glucides, lipides)
- 📈 **Visualiser les statistiques** : graphiques, tendances, bilan nutritionnel
- 📱 **Fonctionner hors-ligne** : données stockées localement
- 🔍 **Scanner les codes-barres** : reconnaissance automatique des produits alimentaires

---

## 🏗️ Architecture Technique

### Structure des Fichiers

```
carnet/
├── index.html           # Interface principale (HTML/CSS)
├── app.js              # Logique métier et gestion d'état
├── core.js             # Utilitaires et helpers
├── ui.js               # Gestion de l'interface utilisateur
├── workout.js          # Gestion des entraînements
├── food.js             # Gestion de la nutrition
├── scanner.js          # Reconnaissance codes-barres (intégration API)
├── api/                # Endpoints Vercel serverless
├── js/                 # Scripts additionnels
├── vercel.json         # Configuration Vercel
└── DEPLOYMENT.md       # Guide de déploiement
```

### Stack Technologique

| Composant | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Stockage** | LocalStorage / IndexedDB |
| **Scanner** | API Mammouth (reconnaissance codes-barres) |
| **Hébergement** | Vercel (serverless) |
| **API Backend** | Node.js avec serverless functions |
| **Version Control** | Git / GitHub |

---

## 🚀 Déploiement

### ✅ Status Actuel
- **Environnement** : Production sur Vercel
- **Domain** : carnet.vercel.app
- **CI/CD** : Auto-déploiement à chaque push sur `main`

### 🔧 Configuration Vercel

Le projet utilise les **Environment Variables** suivantes :

```env
MAMMOUTH_API_KEY=<ta_clé_API_mammouth>
```

⚠️ **Important** : Cette clé doit être définie dans les Settings Vercel pour la reconnaissance des codes-barres.

### 📝 Comment Déployer

1. **Push les changements sur GitHub** (branche `main`)
2. **Vercel détecte automatiquement** le nouveau commit
3. **Build et déploie en ~2-3 minutes**
4. **Le site est à jour** sur carnet.vercel.app

Pour plus de détails → voir [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📚 Modules Principaux

### 🏋️ `workout.js`
Gère la logique des entraînements :
- Ajout/suppression d'exercices
- Calcul des volumes (séries × reps × poids)
- Historique et statistiques par muscle
- Export des données d'entraînement

**Fonctions clés :**
- `addWorkout()` - Enregistrer un nouvel entraînement
- `getWorkoutHistory()` - Récupérer l'historique
- `calculateStats()` - Calculer les statistiques

### 🍽️ `food.js`
Gère la nutrition et les calories :
- Logging des repas
- Calcul des macros (protéines, glucides, lipides)
- Suivi du déficit calorique
- Historique nutritionnel

**Fonctions clés :**
- `addMeal()` - Enregistrer un repas
- `calculateMacros()` - Calculer les macronutriments
- `getDailyIntake()` - Bilan journalier

### 🔍 `scanner.js`
Intégration avec l'API Mammouth :
- Scanner de codes-barres
- Reconnaissance automatique des produits
- Récupération des valeurs nutritionnelles

**Fonctions clés :**
- `scanBarcode()` - Scanner un code-barres
- `parseNutritionData()` - Extraire les infos nutritionnelles

### 🎨 `ui.js`
Gestion complète de l'interface utilisateur :
- Rendu des composants
- Mise à jour dynamique du DOM
- Gestion des événements utilisateur
- Responsive design

**Fonctions clés :**
- `renderDashboard()` - Afficher le tableau de bord
- `updateStats()` - Mettre à jour les statistiques
- `handleUserInput()` - Traiter les entrées utilisateur

### ⚙️ `core.js`
Utilitaires et helpers :
- Gestion de l'état global
- Persistance des données (LocalStorage)
- Utility functions
- Validation des données

### 📱 `app.js`
Point d'entrée principal :
- Initialisation de l'application
- Orchestration des modules
- Gestion des événements
- Lifecycle de l'app

---

## 💾 Stockage des Données

### LocalStorage
Les données sont sauvegardées **localement dans le navigateur** :
```javascript
localStorage.setItem('workoutHistory', JSON.stringify(data))
localStorage.setItem('foodLog', JSON.stringify(data))
```

### Données Synchronisées
- ✅ Entraînements : Historique complet
- ✅ Repas : Journal nutritionnel
- ✅ Préférences utilisateur : Thème, langue, etc.

⚠️ **Note** : Les données sont persistantes mais locales. Pas de synchronisation cloud par défaut.

---

## 🔌 API Endpoints

### `api/parse-meal`
Parse les données nutritionnelles d'un produit alimentaire via code-barres.

**Request :**
```json
{
  "barcode": "3596710012345",
  "quantity": 100
}
```

**Response :**
```json
{
  "productName": "Yaourt Nature",
  "calories": 59,
  "protein": 3.5,
  "carbs": 4.7,
  "fat": 0.4
}
```

---

## 🛠️ Développement Local

### Prérequis
- Node.js 16+ (optionnel, pour tester les API serverless)
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Cloner le repo
git clone https://github.com/daft31/carnet.git
cd carnet

# Ouvrir dans un serveur local (VS Code Live Server)
# OU simplement ouvrir index.html dans le navigateur
```

### Tester les Modifications
1. Modifier les fichiers `.js` ou `.html`
2. Rafraîchir le navigateur (F5 ou Cmd+R)
3. Vérifier les changements sur http://localhost:5500

### Tester l'API Mammouth
```javascript
// Dans la console du navigateur
fetch('/api/parse-meal', {
  method: 'POST',
  body: JSON.stringify({ barcode: '3596710012345' })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 📋 Checklist de Développement

Avant tout commit, vérifier :
- ✅ L'application fonctionne sans erreur console
- ✅ Les données sont sauvegardées en LocalStorage
- ✅ Responsive design testé (mobile, tablet, desktop)
- ✅ Les APIs répondent correctement
- ✅ Pas de code console.log() inutile
- ✅ Les commits sont bien documentés

---

## 🔐 Variables d'Environnement

### En Production (Vercel)
Ces variables doivent être configurées dans les **Settings → Environment Variables** :

| Variable | Utilisation | Exemple |
|----------|------------|---------|
| `MAMMOUTH_API_KEY` | API de reconnaissance codes-barres | `sk_live_xxxx...` |

### Localement (.env.local - ⚠️ Ne pas committer)
```env
MAMMOUTH_API_KEY=sk_test_xxxx
```

---

## 🚦 Processus de Versioning

### Branches Principales
- **`main`** : Version en production (code stable)
- **`develop`** : Branche de développement (nouvelles features)
- **`feature/*`** : Branches de features spécifiques

### Workflow
1. Créer une branche `feature/nom-feature` depuis `develop`
2. Faire les modifications et commits
3. Tester localement
4. Créer une Pull Request vers `develop`
5. Une fois approuvée et testée → merge dans `main`
6. Vercel déploie automatiquement sur production

---

## 📊 Fonctionnalités Principales

### ✅ Implémentées
- [x] Dashboard avec statistiques
- [x] Logging des entraînements
- [x] Tracking nutritionnel
- [x] Calcul des macros
- [x] Scanner codes-barres
- [x] Persistance LocalStorage
- [x] Responsive design
- [x] Déploiement Vercel

### 🔄 En Développement
- [ ] Synchronisation cloud
- [ ] Export PDF/Excel
- [ ] Graphiques avancés
- [ ] Intégration Strava
- [ ] App mobile native
- [ ] Notifications push
- [ ] Partage des données

### 📌 Planifiées
- [ ] Companion app mobile
- [ ] API REST publique
- [ ] Système de goals/challenges
- [ ] Social features (amis, compétitions)

---

## 🐛 Troubleshooting

### Le scanner ne fonctionne pas
**Cause** : Variable `MAMMOUTH_API_KEY` non configurée
**Solution** : Ajouter la clé dans Vercel Settings → Environment Variables

### Les données ne se sauvegardent pas
**Cause** : LocalStorage désactivé ou navigateur en mode incognito
**Solution** : Vérifier les permissions du navigateur et utiliser IndexedDB

### L'API retourne une erreur 500
**Cause** : Problème serverless sur Vercel
**Solution** : Vérifier les logs dans Vercel Dashboard → Deployments → Logs

---

## 📞 Support & Contributions

### Signaler un Bug
1. Créer une issue sur GitHub avec :
   - Description du problème
   - Steps to reproduce
   - Navigateur utilisé
   - Capture d'écran si applicable

### Proposer une Feature
1. Discuter de l'idée dans une issue
2. Créer une branche `feature/nom-feature`
3. Soumettre une Pull Request avec documentation

---

## 📄 Licence

MIT License - Libre d'utilisation

---

## 👤 Auteur

**daft31** - Créateur et mainteneur du projet

---

## 🗺️ Roadmap 2026

| Trimestre | Objectifs |
|-----------|-----------|
| **Q3** | ✅ Lancement production, API Mammouth |
| **Q4** | 🔄 Synchronisation cloud, app mobile |
| **Q1 2027** | 📊 Rapports avancés, intégrations sociales |

---

## 🔗 Ressources Utiles

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 🔌 [API Mammouth](https://mammouth.app)
- 📱 [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- 🎯 [GitHub Workflow](https://github.com/daft31/carnet)

---

**Dernière mise à jour** : 12 Septembre 2026  
**Statut** : ✅ Production  
**Version** : 1.0.0
