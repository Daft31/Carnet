/**
 * Core Module - IndexedDB Management and Data Operations
 * Handles all database operations for meals, foods, and products
 */

const CoreDB = {
    dbName: 'CarnetDB',
    version: 2, // Incremented version for products store
    stores: {
        meals: 'meals',
        foods: 'foods',
        products: 'products', // NEW: for scanner cache
        workouts: 'workouts'
    },

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('DB initialization error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                console.log('DB initialized successfully');
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('DB upgrade needed');

                // Create meals store
                if (!db.objectStoreNames.contains(this.stores.meals)) {
                    const mealsStore = db.createObjectStore(this.stores.meals, { keyPath: 'id', autoIncrement: true });
                    mealsStore.createIndex('date', 'date', { unique: false });
                    console.log('Meals store created');
                }

                // Create foods store
                if (!db.objectStoreNames.contains(this.stores.foods)) {
                    const foodsStore = db.createObjectStore(this.stores.foods, { keyPath: 'id', autoIncrement: true });
                    foodsStore.createIndex('name', 'name', { unique: false });
                    console.log('Foods store created');
                }

                // Create products store (NEW - for scanner cache)
                if (!db.objectStoreNames.contains(this.stores.products)) {
                    const productsStore = db.createObjectStore(this.stores.products, { keyPath: 'barcode' });
                    productsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    productsStore.createIndex('name', 'name', { unique: false });
                    console.log('Products store created');
                }

                // Create workouts store
                if (!db.objectStoreNames.contains(this.stores.workouts)) {
                    const workoutsStore = db.createObjectStore(this.stores.workouts, { keyPath: 'id', autoIncrement: true });
                    workoutsStore.createIndex('date', 'date', { unique: false });
                    console.log('Workouts store created');
                }
            };
        });
    },

    /**
     * Get database instance
     */
    async getDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

    /* ===== MEALS OPERATIONS ===== */

    /**
     * Add a new meal
     */
    async addMeal(mealData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.meals], 'readwrite');
            const store = transaction.objectStore(this.stores.meals);

            const meal = {
                ...mealData,
                date: new Date().toISOString(),
                createdAt: Date.now()
            };

            return new Promise((resolve, reject) => {
                const request = store.add(meal);
                request.onsuccess = () => {
                    console.log('Meal added:', meal);
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error adding meal:', error);
            throw error;
        }
    },

    /**
     * Get all meals
     */
    async getMeals() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.meals], 'readonly');
            const store = transaction.objectStore(this.stores.meals);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    console.log('Meals retrieved:', request.result);
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting meals:', error);
            throw error;
        }
    },

    /**
     * Get meals by date
     */
    async getMealsByDate(date) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.meals], 'readonly');
            const store = transaction.objectStore(this.stores.meals);
            const index = store.index('date');

            const dateStr = new Date(date).toISOString().split('T')[0];

            return new Promise((resolve, reject) => {
                const range = IDBKeyRange.bound(
                    `${dateStr}T00:00:00`,
                    `${dateStr}T23:59:59`
                );
                const request = index.getAll(range);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting meals by date:', error);
            throw error;
        }
    },

    /**
     * Delete meal by ID
     */
    async deleteMeal(mealId) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.meals], 'readwrite');
            const store = transaction.objectStore(this.stores.meals);

            return new Promise((resolve, reject) => {
                const request = store.delete(mealId);
                request.onsuccess = () => {
                    console.log('Meal deleted:', mealId);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting meal:', error);
            throw error;
        }
    },

    /* ===== PRODUCTS OPERATIONS (NEW - SCANNER CACHE) ===== */

    /**
     * Cache a product from scanner
     */
    async cacheProduct(barcode, productData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.products], 'readwrite');
            const store = transaction.objectStore(this.stores.products);

            const product = {
                barcode: barcode,
                data: productData,
                timestamp: Date.now(),
                name: productData.name
            };

            return new Promise((resolve, reject) => {
                const request = store.put(product);
                request.onsuccess = () => {
                    console.log('Product cached:', product);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error caching product:', error);
            throw error;
        }
    },

    /**
     * Get cached product by barcode
     */
    async getCachedProduct(barcode) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.products], 'readonly');
            const store = transaction.objectStore(this.stores.products);

            return new Promise((resolve, reject) => {
                const request = store.get(barcode);
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        console.log('Cached product found:', result);
                        resolve(result.data);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting cached product:', error);
            return null;
        }
    },

    /**
     * Get all cached products
     */
    async getAllCachedProducts() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.products], 'readonly');
            const store = transaction.objectStore(this.stores.products);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const products = request.result.map(p => p.data);
                    console.log('All cached products retrieved:', products);
                    resolve(products);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting all cached products:', error);
            throw error;
        }
    },

    /**
     * Clear expired products from cache
     */
    async clearExpiredProducts(expiryDays = 7) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.products], 'readwrite');
            const store = transaction.objectStore(this.stores.products);
            const expiryTime = Date.now() - (expiryDays * 24 * 60 * 60 * 1000);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const productsToDelete = request.result
                        .filter(p => p.timestamp < expiryTime)
                        .map(p => p.barcode);

                    let deleted = 0;
                    productsToDelete.forEach(barcode => {
                        store.delete(barcode);
                        deleted++;
                    });

                    console.log(`${deleted} expired products cleared`);
                    resolve(deleted);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing expired products:', error);
            throw error;
        }
    },

    /**
     * Delete product from cache
     */
    async deleteProduct(barcode) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.products], 'readwrite');
            const store = transaction.objectStore(this.stores.products);

            return new Promise((resolve, reject) => {
                const request = store.delete(barcode);
                request.onsuccess = () => {
                    console.log('Product deleted from cache:', barcode);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    /* ===== FOODS OPERATIONS ===== */

    /**
     * Add a new food
     */
    async addFood(foodData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.foods], 'readwrite');
            const store = transaction.objectStore(this.stores.foods);

            const food = {
                ...foodData,
                addedAt: Date.now()
            };

            return new Promise((resolve, reject) => {
                const request = store.add(food);
                request.onsuccess = () => {
                    console.log('Food added:', food);
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error adding food:', error);
            throw error;
        }
    },

    /**
     * Get all foods
     */
    async getFoods() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.foods], 'readonly');
            const store = transaction.objectStore(this.stores.foods);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting foods:', error);
            throw error;
        }
    },

    /**
     * Search foods by name
     */
    async searchFoods(query) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.foods], 'readonly');
            const store = transaction.objectStore(this.stores.foods);
            const index = store.index('name');

            return new Promise((resolve, reject) => {
                const request = index.getAll();
                request.onsuccess = () => {
                    const results = request.result.filter(food =>
                        food.name.toLowerCase().includes(query.toLowerCase())
                    );
                    resolve(results);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error searching foods:', error);
            throw error;
        }
    },

    /**
     * Delete food by ID
     */
    async deleteFood(foodId) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.foods], 'readwrite');
            const store = transaction.objectStore(this.stores.foods);

            return new Promise((resolve, reject) => {
                const request = store.delete(foodId);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting food:', error);
            throw error;
        }
    },

    /* ===== WORKOUTS OPERATIONS ===== */

    /**
     * Add a new workout
     */
    async addWorkout(workoutData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.workouts], 'readwrite');
            const store = transaction.objectStore(this.stores.workouts);

            const workout = {
                ...workoutData,
                date: new Date().toISOString(),
                createdAt: Date.now()
            };

            return new Promise((resolve, reject) => {
                const request = store.add(workout);
                request.onsuccess = () => {
                    console.log('Workout added:', workout);
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error adding workout:', error);
            throw error;
        }
    },

    /**
     * Get all workouts
     */
    async getWorkouts() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.workouts], 'readonly');
            const store = transaction.objectStore(this.stores.workouts);

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting workouts:', error);
            throw error;
        }
    },

    /**
     * Get workouts by date
     */
    async getWorkoutsByDate(date) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.workouts], 'readonly');
            const store = transaction.objectStore(this.stores.workouts);
            const index = store.index('date');

            const dateStr = new Date(date).toISOString().split('T')[0];

            return new Promise((resolve, reject) => {
                const range = IDBKeyRange.bound(
                    `${dateStr}T00:00:00`,
                    `${dateStr}T23:59:59`
                );
                const request = index.getAll(range);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting workouts by date:', error);
            throw error;
        }
    },

    /**
     * Delete workout by ID
     */
    async deleteWorkout(workoutId) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction([this.stores.workouts], 'readwrite');
            const store = transaction.objectStore(this.stores.workouts);

            return new Promise((resolve, reject) => {
                const request = store.delete(workoutId);
                request.onsuccess = () => {
                    console.log('Workout deleted:', workoutId);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting workout:', error);
            throw error;
        }
    },

    /* ===== UTILITY OPERATIONS ===== */

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            const db = await this.getDB();
            const stores = Object.values(this.stores);

            for (const storeName of stores) {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }

            console.log('All data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
    },

    /**
     * Export all data as JSON
     */
    async exportData() {
        try {
            const data = {
                meals: await this.getMeals(),
                foods: await this.getFoods(),
                products: await this.getAllCachedProducts(),
                workouts: await this.getWorkouts(),
                exportDate: new Date().toISOString()
            };

            console.log('Data exported:', data);
            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },

    /**
     * Get database stats
     */
    async getStats() {
        try {
            const meals = await this.getMeals();
            const foods = await this.getFoods();
            const products = await this.getAllCachedProducts();
            const workouts = await this.getWorkouts();

            return {
                meals: meals.length,
                foods: foods.length,
                cachedProducts: products.length,
                workouts: workouts.length,
                totalSize: meals.length + foods.length + products.length + workouts.length
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }
};

// Initialize database on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await CoreDB.init();
            console.log('✅ Core database initialized');
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
        }
    });
} else {
    CoreDB.init().catch(error => {
        console.error('❌ Failed to initialize database:', error);
    });
}
