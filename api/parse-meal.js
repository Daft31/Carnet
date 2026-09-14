// Fonction serverless Vercel : parse une description de repas en langage
// naturel via Mammouth AI (API compatible OpenAI), en utilisant la clé
// stockée côté serveur uniquement (jamais exposée au client).

const MAMMOUTH_API_URL = 'https://api.mammouth.ai/v1/chat/completions';
const MAMMOUTH_MODEL = 'gpt-5.4-mini';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Message système : cadre le persona, le format de sortie strict et la
// gestion des quantités imprécises. Les exemples few-shot (voir plus bas)
// sont envoyés séparément comme tours user/assistant, pas inclus ici.
const SYSTEM_PROMPT = `Tu es un(e) diététicien(ne)-nutritionniste professionnel(le), spécialisé(e) dans l'estimation rapide des valeurs nutritionnelles de repas décrits en langage libre et familier (français courant, y compris argot alimentaire type "maxi best of", "kebab", "menu"). Tu connais aussi bien la cuisine internationale que la cuisine française régionale (plats mijotés, gratins, galettes, charcuterie, etc.), où une estimation générique naïve est souvent moins fiable.

Ta tâche : à partir d'une description de repas, estimer les valeurs nutritionnelles totales du repas décrit dans son ensemble (pas par portion de 100g).

Format de sortie — règles strictes :
- Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre : pas de markdown, pas de blocs \`\`\`, pas de phrase avant ou après, pas de commentaire.
- L'objet JSON doit contenir exactement ces champs, dans cet ordre :
  {
    "name": "nom court et naturel du repas",
    "calories": nombre (kcal, total du repas),
    "protein": nombre (grammes, total du repas),
    "carbs": nombre (grammes de glucides totaux, total du repas — n'exclus PAS les fibres de ce chiffre),
    "fat": nombre (grammes, total du repas),
    "fiber": nombre (grammes de fibres, information séparée, incluse dans "carbs" et non soustraite),
    "ingredients": ["ingrédient 1", "ingrédient 2", "..."]
  }
- Tous les champs numériques sont des nombres (pas de chaînes, pas d'unités dans la valeur).
- "calories" doit être cohérent avec les macros : environ 4 kcal/g de protéines + 4 kcal/g de glucides + 9 kcal/g de lipides (un écart raisonnable est normal — alcool, arrondis — mais évite un écart flagrant).

Gestion des quantités imprécises :
- Si une quantité n'est pas précisée (ex. "un poulet basquaise", "des frites"), estime une portion normale de restaurant ou de repas fait maison (ni portion minuscule, ni portion XXL), de façon raisonnable et plutôt conservatrice (ne pas surestimer par excès de prudence dans l'autre sens non plus).
- Si le repas mentionne plusieurs éléments (plat + accompagnement + boisson), additionne tout dans le total retourné : le JSON représente le repas complet décrit, pas un seul élément.
- En cas de plat composite dont la recette varie (ex. "tartiflette", "blanquette"), base-toi sur une recette et une portion typiques, pas sur le cas le plus riche ni le plus léger possible.

Produits de marque / fast-food (ex. "Big Tasty", "Croq McDo", "Menu Best Of", produits McDonald's/Burger King/KFC/Subway...) :
- Ce ne sont PAS des plats à improviser librement : ce sont des références précises avec une composition standardisée quasiment fixe d'un restaurant à l'autre. Base-toi sur tes connaissances les plus précises et les plus stables des valeurs nutritionnelles réellement publiées par l'enseigne pour CE produit exact (nom, variante, taille), au lieu d'estimer "une assiette plausible" comme pour un plat maison.
- Reste cohérent avec toi-même : pour une même description exacte, tes valeurs ne doivent pas varier de façon significative d'une fois à l'autre — traite ça comme un rappel de fait connu, pas comme une nouvelle estimation à chaque fois.
- Si tu ne connais pas avec confiance un produit de marque précis (nom ambigu, enseigne peu connue), dis-le implicitement en restant sur une estimation raisonnable plutôt que d'inventer un chiffre à fausse précision.`;

// Exemples few-shot calibrés sur des plats français/régionaux, où un modèle
// généraliste a tendance à être moins précis que sur de la nourriture
// américaine/générique. Valeurs cohérentes avec des tables nutritionnelles
// usuelles (type CIQUAL) pour une portion typique du plat complet décrit,
// recoupées avec la règle 4/4/9 (protéines/glucides à 4 kcal/g, lipides à
// 9 kcal/g) pour rester elles-mêmes internement cohérentes.
const FEW_SHOT_EXAMPLES = [
  {
    user: 'poulet basquaise avec du riz',
    assistant: {
      name: 'Poulet basquaise avec riz',
      calories: 600,
      protein: 50,
      carbs: 58,
      fat: 14,
      fiber: 5,
      ingredients: ['blanc de poulet', 'poivrons', 'tomates', 'oignons', 'riz'],
    },
  },
  {
    user: 'une portion de tartiflette',
    assistant: {
      name: 'Tartiflette',
      calories: 650,
      protein: 22,
      carbs: 38,
      fat: 42,
      fiber: 4,
      ingredients: ['pommes de terre', 'reblochon', 'lardons', 'oignons', 'crème fraîche'],
    },
  },
  {
    user: 'blanquette de veau avec du riz',
    assistant: {
      name: 'Blanquette de veau avec riz',
      calories: 550,
      protein: 38,
      carbs: 52,
      fat: 18,
      fiber: 3,
      ingredients: ['veau', 'carottes', 'champignons', 'sauce crème', 'riz'],
    },
  },
  {
    user: 'une galette saucisse',
    assistant: {
      name: 'Galette saucisse',
      calories: 450,
      protein: 22,
      carbs: 23,
      fat: 29,
      fiber: 2,
      ingredients: ['galette de blé noir', 'saucisse de porc grillée'],
    },
  },
];

function buildMessages(mealDescription) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const ex of FEW_SHOT_EXAMPLES) {
    messages.push({ role: 'user', content: `Description du repas : "${ex.user}"` });
    messages.push({ role: 'assistant', content: JSON.stringify(ex.assistant) });
  }
  messages.push({
    role: 'user',
    content: `Description du repas : "${mealDescription}"`,
  });
  return messages;
}

// Vérification de cohérence côté code (aucun appel IA supplémentaire :
// calcul local instantané et gratuit). On recalcule les calories à partir
// des macros (4 kcal/g protéines, 4 kcal/g glucides, 9 kcal/g lipides) et on
// compare au total "calories" annoncé par le modèle.
//
// Choix volontairement conservateur : on se contente de logguer un
// avertissement serveur (console.warn) quand l'écart dépasse le seuil, sans
// jamais modifier les valeurs retournées au client. Corriger/ajuster
// automatiquement les chiffres serait risqué : des cas parfaitement valides
// s'écartent légèrement de la règle 4/4/9 (alcool à ~7 kcal/g non compté
// dans les champs macro, arrondis du modèle, polyols...), et une "correction"
// pourrait rendre un repas plausible incohérent avec sa propre estimation.
// Le but ici est de détecter et surveiller les cas aberrants (utile pour
// repérer un modèle qui dérive), pas de retoucher la réponse utilisateur.
const MACRO_MISMATCH_THRESHOLD = 0.3; // 30% d'écart relatif

function checkMacroConsistency(data) {
  if (!data || typeof data !== 'object') return null;

  const calories = Number(data.calories);
  const protein = Number(data.protein) || 0;
  const carbs = Number(data.carbs) || 0;
  const fat = Number(data.fat) || 0;

  if (!Number.isFinite(calories) || calories <= 0) return null;

  const computed = 4 * protein + 4 * carbs + 9 * fat;
  const relativeDiff = Math.abs(computed - calories) / calories;

  if (relativeDiff > MACRO_MISMATCH_THRESHOLD) {
    return {
      declaredCalories: calories,
      computedCalories: Math.round(computed),
      relativeDiff,
    };
  }
  return null;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealDescription } = req.body;

    if (!mealDescription) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    if (!process.env.CARNET_API_KEY) {
      return res.status(500).json({ error: 'CARNET_API_KEY manquante côté serveur (Vercel)' });
    }

    const apiRes = await fetch(MAMMOUTH_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARNET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MAMMOUTH_MODEL,
        messages: buildMessages(mealDescription),
        // Baissé de 0.2 à 0.1 : la variance élevée constatée en régénérant plusieurs fois
        // le même repas (ex. un repas McDonald's précis donnant entre 1200 et 1600 kcal
        // selon la régénération) venait surtout d'un manque de repère pour les produits de
        // marque dans le prompt (voir la section "Produits de marque / fast-food" plus haut),
        // mais une température plus basse réduit aussi la variance résiduelle de décodage.
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Mammouth API error:', apiRes.status, errText);
      return res.status(502).json({
        error: 'Erreur API Mammouth',
        details: `${apiRes.status}: ${errText.slice(0, 300)}`,
      });
    }

    const payload = await apiRes.json();
    const responseText = payload?.choices?.[0]?.message?.content || '';

    let nutritionData;
    try {
      nutritionData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Réponse IA non parsable en JSON');
      }
    }

    const mismatch = checkMacroConsistency(nutritionData);
    if (mismatch) {
      console.warn(
        'Incohérence macro/calories détectée pour la description',
        JSON.stringify(mealDescription),
        '- calories annoncées:', mismatch.declaredCalories,
        '- calories calculées depuis les macros (4/4/9):', mismatch.computedCalories,
        `- écart relatif: ${(mismatch.relativeDiff * 100).toFixed(0)}%`
      );
    }

    return res.status(200).json({
      success: true,
      data: nutritionData,
    });
  } catch (error) {
    console.error('Error parsing meal:', error);
    return res.status(500).json({
      error: 'Failed to parse meal description',
      details: error.message,
    });
  }
}
