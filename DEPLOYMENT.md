# 🚀 Déploiement Carnet avec API Mammouth Sécurisée

## Architecture

```
Frontend (GitHub Pages)
    ↓ HTTPS
API Serverless (Vercel)
    ↓ (clé secrète)
Mammouth AI
```

**La clé API Mammouth reste TOUJOURS secrète côté serveur !** ✅

---

## 📋 Étapes de Déploiement

### **1️⃣ Créer un compte Vercel**
- Va sur https://vercel.com
- Connecte-toi avec GitHub
- Authorize Vercel à accéder à tes repos

### **2️⃣ Importer le repo Carnet**
1. Clique sur "Add New" → "Project"
2. Sélectionne `Daft31/Carnet`
3. Branche : `Dev`
4. Framework : "Other" (site statique)

### **3️⃣ Configurer la clé API secrète**
1. Dans les paramètres du projet Vercel :
   - Onglet "Settings" → "Environment Variables"
   - Ajoute une variable :
     - **Name** : `MAMMOUTH_API_KEY`
     - **Value** : `sk-1zWXN38jLlkRhFLEn8rdiQ` (ta clé)
     - **Environments** : Production, Preview, Development (coche tout)

2. Redéploie le projet après avoir saisi la clé

### **4️⃣ Récupérer l'URL de l'API**
Une fois déployé, tu auras une URL comme :
```
https://carnet-kappa.vercel.app
```

L'API sera accessible à :
```
https://carnet-kappa.vercel.app/api/parse-meal
```

### **5️⃣ Mettre à jour le frontend**
Dans `mealparser.js`, remplace :
```javascript
const API_URL = 'https://carnet-kappa.vercel.app/api/parse-meal';
// ↑ Change par ton vrai domaine Vercel
```

---

## 🧪 Tester l'API

### Via cURL :
```bash
curl -X POST https://carnet-kappa.vercel.app/api/parse-meal \
  -H "Content-Type: application/json" \
  -d '{"description": "burger classique restaurant avec sa portion de frite"}'
```

### Réponse attendue :
```json
{
  "success": true,
  "meal": {
    "name": "Burger classique + frites",
    "calories": 1200,
    "proteins": 45,
    "carbs": 95,
    "fats": 40,
    "quantity": "1 portion",
    "confidence": 85,
    "notes": "Estimation restaurant +20% calories"
  },
  "timestamp": "2026-09-12T15:22:00Z"
}
```

---

## 🔐 Sécurité

✅ La clé API est **dans les variables d'environnement Vercel**, jamais en dur  
✅ Le frontend **ne voit jamais la clé**  
✅ Seul Vercel peut l'accéder  
✅ HTTPS obligatoire (Vercel l'applique)  
✅ Rate limiting côté Mammouth (10 req/min max)  

---

## 📊 Coûts

- **Vercel** : Gratuit (jusqu'à 100GB/mois)
- **Mammouth API** : ~$0.005 par requête avec gpt-4-mini
  - À $2/mois, tu peux faire ~400 requêtes/mois
  - Parfait pour tes besoins !

---

## 🆘 Troubleshooting

### Error: "MAMMOUTH_API_KEY not set"
→ Vérifie que la variable est bien configurée dans les env variables de Vercel

### Error: "401 Unauthorized"
→ La clé API est invalide ou expirée, regénère-la sur Mammouth

### Error: "Failed to parse AI response"
→ Le format JSON de la réponse Mammouth a changé, contacte le support Mammouth

---

## 📝 Variables d'environnement à configurer

| Plateforme | Variable | Valeur |
|-----------|----------|--------|
| **Vercel** | `MAMMOUTH_API_KEY` | `sk-...` (ta clé) |
| **GitHub** | `MAMMOUTH_API_KEY` | (déjà configuré) |

---

## 🎯 Prochaines étapes

1. ✅ Crée un compte Vercel
2. ✅ Import du repo Carnet
3. ✅ Configure la clé API en env variable
4. ✅ Test l'API via cURL
5. ✅ Mets à jour l'URL dans mealparser.js
6. ✅ Enjoy ! 🎉
