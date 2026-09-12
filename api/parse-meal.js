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

    const prompt = `Analyse cette description de repas et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans texte autour) avec exactement ces champs :
{
  "name": "nom court du repas",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "ingredients": ["ingrédient 1", "ingrédient 2"]
}
Les valeurs numériques sont en grammes (sauf calories en kcal), pour la totalité du repas décrit. Si une quantité n'est pas précisée, estime-la de façon raisonnable et conservatrice.

Description du repas : "${mealDescription}"`;

    const apiRes = await fetch(MAMMOUTH_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARNET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MAMMOUTH_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 400,
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
