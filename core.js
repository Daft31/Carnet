/**
 * CORE DATABASE MODULE
 * Handles IndexedDB initialization and meal data management
 */

// Database configuration
const DB_NAME = 'CarnetNutritionnel';
const DB_VERSION = 3; // Updated for new stores
let db = null;

// Store names
const STORES = {
  MEALS: 'meals',
  FOODS: 'foods',
  PRODUCTS: 'products', // Cache for scanned/Open Food Facts products
  PARSED_MEALS: 'parsed_meals', // Cache for AI-parsed meals
  WORKOUTS: 'workouts'
};

/**
 * Initialize IndexedDB
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Erreur lors de l\'ouverture de la base de données');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ Base de données initializée');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create or update object stores
      if (!database.objectStoreNames.contains(STORES.MEALS)) {
        const mealsStore = database.createObjectStore(STORES.MEALS, { keyPath: 'id', autoIncrement: true });
        mealsStore.createIndex('date', 'date', { unique: false });
        mealsStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.FOODS)) {
        const foodsStore = database.createObjectStore(STORES.FOODS, { keyPath: 'id', autoIncrement: true });
        foodsStore.createIndex('mealId', 'mealId', { unique: false });
        foodsStore.createIndex('name', 'name', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productsStore = database.createObjectStore(STORES.PRODUCTS, { keyPath: 'barcode' });
        productsStore.createIndex('timestamp', 'timestamp', { unique: false });
        productsStore.createIndex('name', 'name', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.PARSED_MEALS)) {
        const parsedMealsStore = database.createObjectStore(STORES.PARSED_MEALS, { keyPath: 'id', autoIncrement: true });
        parsedMealsStore.createIndex('timestamp', 'timestamp', { unique: false });
        parsedMealsStore.createIndex('mealName', 'meal_name', { unique: false });
        parsedMealsStore.createIndex('description', 'description', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.WORKOUTS)) {
        const workoutsStore = database.createObjectStore(STORES.WORKOUTS, { keyPath: 'id', autoIncrement: true });
        workoutsStore.createIndex('date', 'date', { unique: false });
      }

      console.log('✅ Object stores créés/mis à jour');
    };
  });
}

/**
 * Get all meals for a specific date
 */
async function getMealsByDate(date) {
  const transaction = db.transaction([STORES.MEALS], 'readonly');
  const store = transaction.objectStore(STORES.MEALS);
  const index = store.index('date');

  return new Promise((resolve, reject) => {
    const request = index.getAll(date);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a meal to the database
 */
async function addMeal(mealData) {
  const transaction = db.transaction([STORES.MEALS], 'readwrite');
  const store = transaction.objectStore(STORES.MEALS);

  const meal = {
    ...mealData,
    date: mealData.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(meal);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add food item to a meal
 */
async function addFoodToMeal(foodData) {
  const transaction = db.transaction([STORES.FOODS], 'readwrite');
  const store = transaction.objectStore(STORES.FOODS);

  const food = {
    ...foodData,
    addedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(food);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get foods for a specific meal
 */
async function getFoodsByMealId(mealId) {
  const transaction = db.transaction([STORES.FOODS], 'readonly');
  const store = transaction.objectStore(STORES.FOODS);
  const index = store.index('mealId');

  return new Promise((resolve, reject) => {
    const request = index.getAll(mealId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all meals (paginated)
 */
async function getAllMeals(limit = 50, offset = 0) {
  const transaction = db.transaction([STORES.MEALS], 'readonly');
  const store = transaction.objectStore(STORES.MEALS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const allMeals = request.result;
      const paginated = allMeals.slice(offset, offset + limit).reverse();
      resolve(paginated);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * ========== PRODUCT CACHE FUNCTIONS (for scanner) ==========
 */

/**
 * Cache a product from Open Food Facts or scanner
 */
async function cacheProduct(product) {
  const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
  const store = transaction.objectStore(STORES.PRODUCTS);

  const cachedProduct = {
    ...product,
    barcode: product.barcode || product.ean,
    timestamp: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days cache
  };

  return new Promise((resolve, reject) => {
    const request = store.put(cachedProduct);
    request.onsuccess = () => resolve(cachedProduct);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached product by barcode
 */
async function getCachedProduct(barcode) {
  const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
  const store = transaction.objectStore(STORES.PRODUCTS);

  return new Promise((resolve, reject) => {
    const request = store.get(barcode);
    request.onsuccess = () => {
      const product = request.result;
      if (product && product.expiresAt > Date.now()) {
        resolve(product);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear expired cached products
 */
async function clearExpiredProducts() {
  const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
  const store = transaction.objectStore(STORES.PRODUCTS);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => {
      const products = request.result;
      const now = Date.now();

      products.forEach(product => {
        if (product.expiresAt < now) {
          store.delete(product.barcode);
        }
      });

      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * ========== PARSED MEALS CACHE FUNCTIONS (for AI) ==========
 */

/**
 * Save a parsed meal to cache for future reference
 */
async function addParsedMeal(parsedMealData) {
  const transaction = db.transaction([STORES.PARSED_MEALS], 'readwrite');
  const store = transaction.objectStore(STORES.PARSED_MEALS);

  const parsedMeal = {
    ...parsedMealData,
    timestamp: Date.now(),
    cached_at: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(parsedMeal);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all cached parsed meals
 */
async function getCachedParsedMeals() {
  const transaction = db.transaction([STORES.PARSED_MEALS], 'readonly');
  const store = transaction.objectStore(STORES.PARSED_MEALS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.reverse());
    request.onerror = () => reject(request.error);
  });
}

/**
 * Search cached parsed meals by name
 */
async function searchParsedMealsByName(query) {
  const transaction = db.transaction([STORES.PARSED_MEALS], 'readonly');
  const store = transaction.objectStore(STORES.PARSED_MEALS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const allMeals = request.result;
      const filtered = allMeals.filter(meal =>
        meal.meal_name.toLowerCase().includes(query.toLowerCase()) ||
        meal.description.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * ========== WORKOUT FUNCTIONS ==========
 */

/**
 * Add a workout
 */
async function addWorkout(workoutData) {
  const transaction = db.transaction([STORES.WORKOUTS], 'readwrite');
  const store = transaction.objectStore(STORES.WORKOUTS);

  const workout = {
    ...workoutData,
    date: workoutData.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(workout);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get workouts by date
 */
async function getWorkoutsByDate(date) {
  const transaction = db.transaction([STORES.WORKOUTS], 'readonly');
  const store = transaction.objectStore(STORES.WORKOUTS);
  const index = store.index('date');

  return new Promise((resolve, reject) => {
    const request = index.getAll(date);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * ========== UTILITY FUNCTIONS ==========
 */

/**
 * Clear all data (use with caution)
 */
async function clearAllData() {
  const transaction = db.transaction(Object.values(STORES), 'readwrite');

  Object.values(STORES).forEach(storeName => {
    const store = transaction.objectStore(storeName);
    store.clear();
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log('✅ Toutes les données ont été supprimées');
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Export data as JSON
 */
async function exportDataAsJSON() {
  const data = {
    meals: await getAllMeals(1000),
    workouts: [],
    parsedMeals: await getCachedParsedMeals(),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Get database statistics
 */
async function getDBStats() {
  const stats = {};

  for (const storeName of Object.values(STORES)) {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    const count = await new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });

    stats[storeName] = count;
  }

  return stats;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDB,
    getMealsByDate,
    addMeal,
    addFoodToMeal,
    getFoodsByMealId,
    getAllMeals,
    cacheProduct,
    getCachedProduct,
    clearExpiredProducts,
    addParsedMeal,
    getCachedParsedMeals,
    searchParsedMealsByName,
    addWorkout,
    getWorkoutsByDate,
    clearAllData,
    exportDataAsJSON,
    getDBStats
  };
}

// Initialize database on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDB);
} else {
  initDB().catch(err => console.error('Database init failed:', err));
}