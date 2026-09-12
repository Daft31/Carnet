import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.CARNET_API_KEY,
});

// Autorise l'appel depuis GitHub Pages (l'app peut être ouverte depuis un
// domaine différent de celui qui héberge cette fonction serverless).
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

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this meal description and extract nutritional information. Return a JSON object with: name (string), calories (number), protein (number in grams), carbs (number in grams), fat (number in grams), fiber (number in grams), and ingredients (array of strings).

Meal description: "${mealDescription}"

Return ONLY valid JSON, no markdown formatting.`,
        },
      ],
    });

    let nutritionData;
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Try to parse the response as JSON
    try {
      nutritionData = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse nutrition data from response');
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