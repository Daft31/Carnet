// api/parse-meal.js
// API serverless Vercel pour parser les repas avec Mammouth AI
// La clé API reste secrète côté serveur ✅

export default async function handler(req, res) {
  // Sécurité : vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Récupérer la description du repas
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Missing meal description' });
  }

  // Vérifier que la clé API existe
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) {
    console.error('❌ MAMMOUTH_API_KEY not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Appeler Mammouth API avec la clé secrète (jamais exposée au client)
    const response = await fetch('https://api.mammouth.ai/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-mini',
        messages: [
          {
            role: 'user',
            content: `Tu es un expert nutritioniste. Analyse ce repas décrit en langage naturel et retourne UNIQUEMENT un objet JSON valide (aucun texte avant/après).

Description du repas: "${description}"

Réponds avec EXACTEMENT ce format JSON:
{
  "name": "nom du repas",
  "calories": nombre,
  "proteins": nombre (en grammes),
  "carbs": nombre (en grammes),
  "fats": nombre (en grammes),
  "quantity": "quantité estimée (ex: 1 portion, 250g)",
  "confidence": nombre entre 0 et 100 (certitude de l'analyse),
  "notes": "notes utiles si applicable"
}

Important: Retourne UNIQUEMENT le JSON, pas d'explications.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Mammouth API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Mammouth API error',
        details: errorData 
      });
    }

    const data = await response.json();
    
    // Extraire le contenu de la réponse
    const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('❌ Unexpected Mammouth response format:', data);
      return res.status(500).json({ 
        error: 'Unexpected API response format',
        raw: data 
      });
    }

    // Parser le JSON de la réponse
    let mealData;
    try {
      // Nettoyer la réponse (enlever les backticks si présents)
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      mealData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ Failed to parse Mammouth JSON response:', content);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        raw: content 
      });
    }

    // Valider les champs obligatoires
    const required = ['name', 'calories', 'proteins', 'carbs', 'fats', 'confidence'];
    const missing = required.filter(field => !(field in mealData));
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields in AI response',
        missing,
        received: mealData 
      });
    }

    // Répondre avec succès ✅
    return res.status(200).json({
      success: true,
      meal: mealData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
