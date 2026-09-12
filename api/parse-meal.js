const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get API key from environment variable
const API_KEY = process.env.CARNET_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: CARNET_API_KEY environment variable is not set');
  process.exit(1);
}

const API_BASE_URL = 'https://api.mammouth.app';
const MEALS_FILE = path.join(__dirname, '../data/meals.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchMealsFromAPI() {
  try {
    console.log('🔄 Fetching meals from Mammouth API...');
    
    const response = await axios.get(`${API_BASE_URL}/meals`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching from Mammouth API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    throw error;
  }
}

async function parseMeals(rawData) {
  try {
    console.log('📝 Parsing meal data...');
    
    const meals = Array.isArray(rawData) ? rawData : [rawData];
    
    const parsedMeals = meals.map(meal => ({
      id: meal.id || '',
      name: meal.name || '',
      description: meal.description || '',
      date: meal.date || new Date().toISOString(),
      ingredients: meal.ingredients || [],
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      source: 'mammouth-api'
    }));

    return parsedMeals;
  } catch (error) {
    console.error('❌ Error parsing meal data:', error.message);
    throw error;
  }
}

async function saveMealsToFile(meals) {
  try {
    console.log(`💾 Saving ${meals.length} meals to file...`);
    
    fs.writeFileSync(MEALS_FILE, JSON.stringify(meals, null, 2));
    console.log('✅ Meals saved successfully');
  } catch (error) {
    console.error('❌ Error saving meals to file:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Mammouth API sync...\n');
    
    const rawData = await fetchMealsFromAPI();
    const parsedMeals = await parseMeals(rawData);
    await saveMealsToFile(parsedMeals);
    
    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
