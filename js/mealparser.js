/**
 * MEAL PARSER - AI-POWERED NATURAL LANGUAGE MEAL RECOGNITION
 * Uses Mammouth AI API (OpenAI compatible) to parse meal descriptions
 * 
 * Example inputs:
 * - "burger classique restaurant avec sa portion de frite"
 * - "entrecôte 350g avec sa portion de frites maison"
 * - "150g de poulet avec 200g de riz basmati"
 * - "2 œufs avec 100g de pain et du beurre"
 * - "pizza 4 fromages entière"
 */

class MealParser {
  constructor(mamouthApiKey) {
    this.apiKey = mamouthApiKey;
    this.apiUrl = 'https://api.mammouth.ai/v1';
    this.model = 'gpt-4-mini'; // Petit modèle, peu coûteux mais performant
    this.requestCount = 0;
    this.lastReset = Date.now();
  }

  /**
   * Parse natural language meal description using AI
   * Returns structured meal data with ingredients and quantities
   */
  async parseMealDescription(mealText) {
    if (!mealText || mealText.trim().length === 0) {
      throw new Error('La description du repas ne peut pas être vide');
    }

    try {
      // Check rate limiting (prevent API quota exhaustion)
      if (!this.checkRateLimit()) {
        throw new Error('Trop de requêtes. Attends quelques secondes...');
      }

      const systemPrompt = this.getSystemPrompt();
      const userPrompt = this.getUserPrompt(mealText);

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.3, // Déterministe pour extraction structurée
          max_tokens: 1000,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Mammouth API Error:', error);
        throw new Error(`Erreur API: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      // Parse JSON response from AI
      const parsedMeal = JSON.parse(responseText);

      // Validate and sanitize the response
      return this.validateAndEnhanceMeal(parsedMeal);

    } catch (error) {
      console.error('Meal parsing error:', error);
      throw error;
    }
  }

  /**
   * System prompt that teaches the AI how to parse meals
   */
  getSystemPrompt() {
    return `Tu es un expert en nutrition et en analyse culinaire. 
    
Ton rôle est de transformer une description textuelle d'un repas en données structurées JSON.

Pour chaque repas décrit, tu dois :
1. Identifier CHAQUE aliment mentionné
2. Extraire les quantités (grammes, portions, unités)
3. Si la quantité n'est pas mentionnée, l'ESTIMER de manière RAISONNABLE et CONSERVATRICE
4. Chercher l'aliment dans ta base de connaissances nutritionnelles
5. Retourner STRICTEMENT du JSON valide

RÈGLES IMPORTANTES :
- Ne JAMAIS inventer de données nutritionnelles complètes. Utilisez des valeurs estimées basées sur des aliments similaires
- Les quantités doivent être en grammes ou portions standard
- Si c'est un restaurant, ajoute un coefficient d'huile +20% aux calories
- Toujours retourner du JSON valide et parsable

Format de réponse OBLIGATOIRE (JSON strict) :
{
  "meal_name": "nom du repas",
  "description": "description complète",
  "ingredients": [
    {
      "name": "nom de l'aliment",
      "quantity": 150,
      "unit": "g",
      "quantity_text": "150g",
      "source": "user_input | estimated",
      "estimated_reason": "raison de l'estimation si applicable",
      "calories": 0,
      "proteins": 0,
      "carbs": 0,
      "fats": 0,
      "fiber": 0
    }
  ],
  "totals": {
    "calories": 0,
    "proteins": 0,
    "carbs": 0,
    "fats": 0,
    "fiber": 0
  },
  "confidence": 0.95,
  "needs_verification": false,
  "restaurant": false,
  "notes": "notes éventuelles sur l'estimation"
}`;
  }

  /**
   * User prompt with the actual meal description
   */
  getUserPrompt(mealText) {
    return `Analyse cette description de repas et retourne STRICTEMENT du JSON valide :

"${mealText}"

Retourne uniquement du JSON, sans texte supplémentaire. Le JSON doit être parsable.`;
  }

  /**
   * Validate AI response and enhance with additional data
   */
  validateAndEnhanceMeal(meal) {
    // Validate required fields
    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      throw new Error('Réponse IA invalide: manque ingrédients');
    }

    if (meal.ingredients.length === 0) {
      throw new Error('Aucun aliment détecté dans la description');
    }

    // Ensure all ingredients have required fields
    meal.ingredients = meal.ingredients.map(ing => ({
      name: ing.name || 'Aliment inconnu',
      quantity: ing.quantity || 100,
      unit: ing.unit || 'g',
      quantity_text: ing.quantity_text || `${ing.quantity || 100}${ing.unit || 'g'}`,
      source: ing.source || 'estimated',
      estimated_reason: ing.estimated_reason || '',
      calories: parseFloat(ing.calories || 0),
      proteins: parseFloat(ing.proteins || 0),
      carbs: parseFloat(ing.carbs || 0),
      fats: parseFloat(ing.fats || 0),
      fiber: parseFloat(ing.fiber || 0)
    }));

    // Recalculate totals
    meal.totals = {
      calories: meal.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0),
      proteins: meal.ingredients.reduce((sum, ing) => sum + (ing.proteins || 0), 0),
      carbs: meal.ingredients.reduce((sum, ing) => sum + (ing.carbs || 0), 0),
      fats: meal.ingredients.reduce((sum, ing) => sum + (ing.fats || 0), 0),
      fiber: meal.ingredients.reduce((sum, ing) => sum + (ing.fiber || 0), 0)
    };

    // Round totals
    Object.keys(meal.totals).forEach(key => {
      meal.totals[key] = Math.round(meal.totals[key] * 10) / 10;
    });

    meal.confidence = meal.confidence || 0.8;
    meal.needs_verification = meal.confidence < 0.75 || meal.ingredients.some(i => i.source === 'estimated');
    meal.restaurant = meal.restaurant || false;
    meal.created_at = new Date().toISOString();

    return meal;
  }

  /**
   * Rate limiting to prevent API quota exhaustion
   * Max 10 requests per 60 seconds
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter every 60 seconds
    if (now - this.lastReset > 60000) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    if (this.requestCount >= 10) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Get remaining API quota info
   */
  getQuotaInfo() {
    const timeSinceReset = Date.now() - this.lastReset;
    const secondsUntilReset = Math.max(0, 60 - Math.floor(timeSinceReset / 1000));

    return {
      requestsUsed: this.requestCount,
      requestsRemaining: Math.max(0, 10 - this.requestCount),
      secondsUntilReset: secondsUntilReset
    };
  }

  /**
   * Format meal data for display in UI
   */
  formatMealForDisplay(meal) {
    return {
      name: meal.meal_name,
      description: meal.description,
      ingredients: meal.ingredients.map(ing => ({
        name: ing.name,
        quantity_text: ing.quantity_text,
        calories: ing.calories.toFixed(0),
        source: ing.source === 'user_input' ? '✓ Exact' : '⚠ Estimé'
      })),
      totals: {
        calories: meal.totals.calories.toFixed(0),
        proteins: meal.totals.proteins.toFixed(1),
        carbs: meal.totals.carbs.toFixed(1),
        fats: meal.totals.fats.toFixed(1),
        fiber: meal.totals.fiber.toFixed(1)
      },
      confidence: (meal.confidence * 100).toFixed(0) + '%',
      needs_verification: meal.needs_verification,
      restaurant: meal.restaurant
    };
  }

  /**
   * Save parsed meal to IndexedDB cache
   */
  async saveParsedMealToCache(meal) {
    try {
      await addParsedMeal(meal);
      return true;
    } catch (error) {
      console.error('Error saving parsed meal:', error);
      return false;
    }
  }

  /**
   * Fuzzy search in local food database for better estimates
   */
  findSimilarFood(foodName) {
    // This will be called if needed to find similar foods in local DB
    if (typeof getAllFoods === 'function') {
      const allFoods = getAllFoods();
      return allFoods.filter(food => 
        food.name.toLowerCase().includes(foodName.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }
}

/**
 * Initialize Mammouth AI Meal Parser
 * Call this in your main app initialization
 */
let mealParser = null;

function initMealParser(apiKey) {
  if (!apiKey) {
    console.warn('Mammouth API key not provided. Meal parser disabled.');
    return false;
  }
  
  mealParser = new MealParser(apiKey);
  console.log('✅ Meal Parser initialized with Mammouth AI');
  return true;
}

/**
 * Parse a meal description and add it to the current meal
 */
async function parseAndAddMeal(mealDescription, mealDate = new Date()) {
  if (!mealParser) {
    throw new Error('Meal parser not initialized. Please set your Mammouth API key.');
  }

  try {
    // Show loading state
    showLoadingState('🤖 Analyse en cours...');

    // Parse the meal
    const parsedMeal = await mealParser.parseMealDescription(mealDescription);

    // Format for display
    const displayData = mealParser.formatMealForDisplay(parsedMeal);

    // Show confirmation dialog with parsed data
    const confirmed = await showMealConfirmation(displayData, parsedMeal);

    if (confirmed) {
      // Add each ingredient to the meal
      for (const ingredient of parsedMeal.ingredients) {
        addFoodToMeal({
          name: ingredient.name,
          calories: ingredient.calories,
          proteins: ingredient.proteins,
          carbs: ingredient.carbs,
          fats: ingredient.fats,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          mealDate: mealDate,
          source: 'ai_parsed'
        });
      }

      // Save parsed meal to cache for future reference
      await mealParser.saveParsedMealToCache(parsedMeal);

      return {
        success: true,
        meal: parsedMeal,
        message: `✅ Repas ajouté: ${parsedMeal.meal_name}`
      };
    } else {
      return {
        success: false,
        message: 'Ajout annulé par l\'utilisateur'
      };
    }

  } catch (error) {
    console.error('Meal parsing failed:', error);
    throw error;
  }
}

/**
 * Show loading animation during AI processing
 */
function showLoadingState(message) {
  const loadingDiv = document.getElementById('ai-parsing-loading');
  if (loadingDiv) {
    loadingDiv.textContent = message;
    loadingDiv.style.display = 'flex';
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const loadingDiv = document.getElementById('ai-parsing-loading');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

/**
 * Show confirmation dialog with parsed meal data
 */
async function showMealConfirmation(displayData, parsedMeal) {
  return new Promise((resolve) => {
    const modal = document.getElementById('meal-confirmation-modal');
    if (!modal) {
      console.error('Confirmation modal not found');
      resolve(true); // Fallback to auto-confirm
      return;
    }

    // Populate modal with parsed data
    const modalContent = document.getElementById('meal-confirmation-content');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="meal-confirmation-card">
          <h3>${displayData.name}</h3>
          <p class="meal-description">${displayData.description}</p>
          
          ${displayData.restaurant ? '<span class="badge-restaurant">🍽️ Restaurant</span>' : ''}
          ${displayData.needs_verification ? '<span class="badge-warning">⚠️ À vérifier</span>' : ''}
          <span class="badge-confidence">🎯 ${displayData.confidence}</span>
          
          <div class="ingredients-list">
            <h4>Ingrédients détectés :</h4>
            ${displayData.ingredients.map(ing => `
              <div class="ingredient-item">
                <span class="ingredient-name">${ing.name}</span>
                <span class="ingredient-qty">${ing.quantity_text}</span>
                <span class="ingredient-cal">${ing.calories} kcal</span>
                <span class="ingredient-source">${ing.source}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="macros-summary">
            <div class="macro">
              <span class="label">Calories</span>
              <span class="value">${displayData.totals.calories}</span>
            </div>
            <div class="macro">
              <span class="label">Protéines</span>
              <span class="value">${displayData.totals.proteins}g</span>
            </div>
            <div class="macro">
              <span class="label">Glucides</span>
              <span class="value">${displayData.totals.carbs}g</span>
            </div>
            <div class="macro">
              <span class="label">Lipides</span>
              <span class="value">${displayData.totals.fats}g</span>
            </div>
          </div>
          
          ${displayData.needs_verification ? `
            <div class="alert-warning">
              ⚠️ Certaines quantités ont été estimées. Vérifiez et ajustez si nécessaire.
            </div>
          ` : ''}
        </div>
      `;
    }

    // Set up button handlers
    const confirmBtn = document.getElementById('meal-confirmation-confirm');
    const cancelBtn = document.getElementById('meal-confirmation-cancel');

    const cleanup = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      modal.style.display = 'none';
    };

    const onConfirm = () => {
      cleanup();
      hideLoadingState();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      hideLoadingState();
      resolve(false);
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);

    // Show modal
    modal.style.display = 'flex';
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MealParser,
    initMealParser,
    parseAndAddMeal,
    showLoadingState,
    hideLoadingState
  };
}