/**
 * Food Module - Meal and Food Management with Scanner Integration
 * Handles food database, meal creation, and scanned product management
 */

const foodModule = {
    currentMeal: {
        name: '',
        foods: [],
        totalNutrients: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        }
    },

    // Base de données locale d'aliments
    FOOD_DATABASE: [
        // Petits-déjeuners
        { name: 'Œuf', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, serving: '100g' },
        { name: 'Pain blanc', calories: 265, protein: 9, carbs: 49, fat: 3, fiber: 2.7, serving: '100g' },
        { name: 'Lait entier', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, serving: '100ml' },
        { name: 'Yaourt nature', calories: 59, protein: 10, carbs: 3.3, fat: 0.4, fiber: 0, serving: '100g' },
        { name: 'Miel', calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, serving: '100g' },
        { name: 'Beurre', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, serving: '100g' },
        { name: 'Confiture', calories: 278, protein: 0.4, carbs: 69, fat: 0.1, fiber: 0.4, serving: '100g' },
        { name: 'Céréales', calories: 375, protein: 11, carbs: 75, fat: 5, fiber: 4, serving: '100g' },
        { name: 'Muesli', calories: 380, protein: 10, carbs: 70, fat: 8, fiber: 6, serving: '100g' },
        { name: 'Jus d\'orange', calories: 45, protein: 0.7, carbs: 11, fat: 0.2, fiber: 0.2, serving: '100ml' },

        // Fruits
        { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving: '100g' },
        { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving: '100g' },
        { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, serving: '100g' },
        { name: 'Fraise', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, serving: '100g' },
        { name: 'Raisin', calories: 67, protein: 0.6, carbs: 17, fat: 0.2, fiber: 0.9, serving: '100g' },

        // Légumes
        { name: 'Carotte', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, serving: '100g' },
        { name: 'Brocoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.4, serving: '100g' },
        { name: 'Salade verte', calories: 15, protein: 1.4, carbs: 3, fat: 0.2, fiber: 1.3, serving: '100g' },
        { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, serving: '100g' },
        { name: 'Riz blanc', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, serving: '100g' },

        // Protéines
        { name: 'Poulet rôti', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: '100g' },
        { name: 'Steak de bœuf', calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, serving: '100g' },
        { name: 'Saumon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, serving: '100g' },
        { name: 'Œuf dur', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, serving: '100g' },
        { name: 'Thon en conserve', calories: 132, protein: 29, carbs: 0, fat: 1.3, fiber: 0, serving: '100g' },

        // Produits laitiers
        { name: 'Fromage blanc', calories: 40, protein: 3.5, carbs: 1.3, fat: 0.4, fiber: 0, serving: '100g' },
        { name: 'Fromage dur', calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, serving: '100g' },
        { name: 'Crème fraîche', calories: 340, protein: 2.3, carbs: 3, fat: 35, fiber: 0, serving: '100g' },

        // Féculents
        { name: 'Pâtes cuites', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, serving: '100g' },
        { name: 'Pomme de terre', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1, serving: '100g' },
        { name: 'Pain complet', calories: 218, protein: 8, carbs: 41, fat: 2, fiber: 6.8, serving: '100g' },

        // Huiles et sauces
        { name: 'Huile d\'olive', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, serving: '100ml' },
        { name: 'Mayonnaise', calories: 680, protein: 1.4, carbs: 0.6, fat: 75, fiber: 0, serving: '100g' },

        // Snacks
        { name: 'Amandes', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, serving: '100g' },
        { name: 'Cacahuètes', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 6, serving: '100g' },
        { name: 'Chocolat noir', calories: 531, protein: 12, carbs: 61, fat: 30, fiber: 3.3, serving: '100g' },

        // Boissons
        { name: 'Café', calories: 0, protein: 0.2, carbs: 0, fat: 0, fiber: 0, serving: '100ml' },
        { name: 'Thé', calories: 2, protein: 0, carbs: 0.4, fat: 0, fiber: 0, serving: '100ml' },
        { name: 'Eau', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, serving: '100ml' },
    ],

    /**
     * Initialize food module
     */
    async init() {
        console.log('Food module initialized');
        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const foodInput = document.getElementById('foodInput');
        if (foodInput) {
            foodInput.addEventListener('input', (e) => this.suggestFoods(e.target.value));
        }
    },

    /**
     * Suggest foods based on input
     */
    async suggestFoods(query) {
        if (query.length < 2) {
            document.getElementById('foodSuggestions').innerHTML = '';
            return;
        }

        const suggestions = this.FOOD_DATABASE.filter(food =>
            food.name.toLowerCase().includes(query.toLowerCase())
        );

        const suggestionsHTML = suggestions.map(food => `
            <div style="
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
                cursor: pointer;
                margin-bottom: 5px;
                border-left: 3px solid #667eea;
                transition: all 0.2s ease;
            "
            onmouseover="this.style.background='#e8e8e8'"
            onmouseout="this.style.background='#f5f5f5'"
            onclick="foodModule.addFoodToMeal('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat}, '${food.serving}')">
                <strong>${food.name}</strong>
                <span style="float: right; color: #666; font-size: 12px;">
                    ${food.calories} kcal - ${food.serving}
                </span>
            </div>
        `).join('');

        document.getElementById('foodSuggestions').innerHTML = suggestionsHTML;
    },

    /**
     * Add food to current meal
     */
    addFoodToMeal(name, calories, protein, carbs, fat, serving, quantity = 1) {
        const food = {
            id: Date.now(),
            name: name,
            quantity: quantity,
            serving: serving,
            nutrients: {
                calories: calories * quantity,
                protein: protein * quantity,
                carbs: carbs * quantity,
                fat: fat * quantity,
                fiber: 0
            }
        };

        this.currentMeal.foods.push(food);
        this.updateMealDisplay();
        document.getElementById('foodInput').value = '';
        document.getElementById('foodSuggestions').innerHTML = '';
    },

    /**
     * Add scanned product to meal
     */
    async addScannedProduct(product) {
        console.log('Adding scanned product:', product);

        const quantity = product.quantity || 1;
        const serving = product.servingSize || '100g';

        // Parse serving size to extract portion
        const portionMatch = serving.match(/(\d+)/);
        const portion = portionMatch ? parseInt(portionMatch[0]) : 100;
        const multiplier = portion / 100;

        const food = {
            id: `scan-${Date.now()}`,
            name: `${product.name} (${product.brand || 'Sans marque'})`,
            quantity: quantity,
            serving: serving,
            barcode: product.barcode,
            source: product.source || 'Scanner',
            nutrients: {
                calories: (product.nutrients.calories || 0) * multiplier * quantity,
                protein: (product.nutrients.protein || 0) * multiplier * quantity,
                carbs: (product.nutrients.carbs || 0) * multiplier * quantity,
                fat: (product.nutrients.fat || 0) * multiplier * quantity,
                fiber: (product.nutrients.fiber || 0) * multiplier * quantity
            }
        };

        this.currentMeal.foods.push(food);
        this.updateMealDisplay();

        // Auto-fill meal name if empty
        if (!this.currentMeal.name) {
            const mealNameInput = document.getElementById('mealName');
            if (mealNameInput) {
                mealNameInput.value = product.name;
                this.currentMeal.name = product.name;
            }
        }

        // Switch to meal modal
        const mealModal = document.getElementById('mealModal');
        if (mealModal) {
            mealModal.classList.add('active');
            mealModal.style.display = 'flex';
        }
    },

    /**
     * Update meal display
     */
    updateMealDisplay() {
        const addedFoodsDiv = document.getElementById('addedFoods');
        if (!addedFoodsDiv) return;

        let totalNutrients = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };

        const foodsHTML = this.currentMeal.foods.map(food => {
            totalNutrients.calories += food.nutrients.calories;
            totalNutrients.protein += food.nutrients.protein;
            totalNutrients.carbs += food.nutrients.carbs;
            totalNutrients.fat += food.nutrients.fat;
            totalNutrients.fiber += food.nutrients.fiber;

            return `
                <div class="meal-item" style="margin-bottom: 10px;">
                    <div class="meal-item-info">
                        <div class="meal-item-name">${food.name}</div>
                        <div class="meal-item-nutrition" style="font-size: 12px;">
                            ${food.quantity}x ${food.serving} - 
                            ${food.nutrients.calories.toFixed(0)} kcal | 
                            ${food.nutrients.protein.toFixed(1)}g prot | 
                            ${food.nutrients.carbs.toFixed(1)}g glucides | 
                            ${food.nutrients.fat.toFixed(1)}g lipides
                        </div>
                    </div>
                    <button class="delete-btn" onclick="foodModule.removeFoodFromMeal(${food.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            `;
        }).join('');

        const summaryHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
                margin-bottom: 20px;
            ">
                <h3 style="margin: 0 0 10px 0; font-size: 18px;">📊 Résumé du repas</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px;">
                    <div>🔥 Calories: <strong>${totalNutrients.calories.toFixed(0)}</strong> kcal</div>
                    <div>🥩 Protéines: <strong>${totalNutrients.protein.toFixed(1)}</strong>g</div>
                    <div>🍞 Glucides: <strong>${totalNutrients.carbs.toFixed(1)}</strong>g</div>
                    <div>🧈 Lipides: <strong>${totalNutrients.fat.toFixed(1)}</strong>g</div>
                </div>
            </div>
        `;

        addedFoodsDiv.innerHTML = summaryHTML + foodsHTML;
        this.currentMeal.totalNutrients = totalNutrients;
    },

    /**
     * Remove food from meal
     */
    removeFoodFromMeal(foodId) {
        this.currentMeal.foods = this.currentMeal.foods.filter(food => food.id !== foodId);
        this.updateMealDisplay();
    },

    /**
     * Save meal to database
     */
    async saveMeal() {
        const mealName = document.getElementById('mealName')?.value || 'Repas sans nom';

        if (this.currentMeal.foods.length === 0) {
            alert('⚠️ Veuillez ajouter au moins un aliment au repas');
            return;
        }

        const mealToSave = {
            name: mealName,
            foods: this.currentMeal.foods,
            totalNutrients: this.currentMeal.totalNutrients,
            timestamp: new Date().toISOString()
        };

        try {
            await CoreDB.addMeal(mealToSave);
            alert('✅ Repas enregistré avec succès!');

            // Reset form
            this.currentMeal = {
                name: '',
                foods: [],
                totalNutrients: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
            };

            document.getElementById('mealModal').classList.remove('active');
            document.getElementById('mealModal').style.display = 'none';
            document.getElementById('mealName').value = '';
            document.getElementById('foodInput').value = '';
            document.getElementById('addedFoods').innerHTML = '';

            // Update displays
            this.updateDashboard();
            this.updateMealsList();
        } catch (error) {
            console.error('Error saving meal:', error);
            alert('❌ Erreur lors de l\'enregistrement du repas');
        }
    },

    /**
     * Update dashboard with today's meals
     */
    async updateDashboard() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const meals = await CoreDB.getMeals();
            const todayMeals = meals.filter(meal => 
                meal.date && meal.date.split('T')[0] === today
            );

            let totalCalories = 0;
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;

            todayMeals.forEach(meal => {
                if (meal.totalNutrients) {
                    totalCalories += meal.totalNutrients.calories;
                    totalProtein += meal.totalNutrients.protein;
                    totalCarbs += meal.totalNutrients.carbs;
                    totalFat += meal.totalNutrients.fat;
                }
            });

            document.getElementById('totalCalories').textContent = Math.round(totalCalories);
            document.getElementById('totalProtein').textContent = Math.round(totalProtein);
            document.getElementById('totalCarbs').textContent = Math.round(totalCarbs);
            document.getElementById('totalFat').textContent = Math.round(totalFat);

            // Recent meals
            const recentMealsHTML = todayMeals.slice(-3).reverse().map(meal => `
                <div class="meal-item">
                    <div class="meal-item-info">
                        <div class="meal-item-name">${meal.name}</div>
                        <div class="meal-item-nutrition">
                            ${meal.foods.length} aliment(s) | 
                            ${Math.round(meal.totalNutrients.calories)} kcal
                        </div>
                    </div>
                </div>
            `).join('');

            const recentMealsDiv = document.getElementById('recentMeals');
            if (recentMealsDiv) {
                recentMealsDiv.innerHTML = recentMealsHTML || '<p style="color: #999;">Aucun repas enregistré aujourd\'hui</p>';
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    },

    /**
     * Update meals list for today
     */
    async updateMealsList() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const meals = await CoreDB.getMeals();
            const todayMeals = meals.filter(meal => 
                meal.date && meal.date.split('T')[0] === today
            );

            const mealsHTML = todayMeals.map(meal => `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 10px 0; color: #333;">${meal.name}</h3>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                ${new Date(meal.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <button class="delete-btn" onclick="foodModule.deleteMeal(${meal.id})">
                            🗑️ Supprimer
                        </button>
                    </div>

                    <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        ${meal.foods.map(food => `
                            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;">
                                <div style="font-weight: 600; color: #333;">${food.name}</div>
                                <div style="font-size: 12px; color: #666;">
                                    ${food.quantity}x ${food.serving} - ${food.nutrients.calories.toFixed(0)} kcal
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px;
                        border-radius: 10px;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        font-size: 13px;
                    ">
                        <div>🔥 ${meal.totalNutrients.calories.toFixed(0)} kcal</div>
                        <div>🥩 ${meal.totalNutrients.protein.toFixed(1)}g protéines</div>
                        <div>🍞 ${meal.totalNutrients.carbs.toFixed(1)}g glucides</div>
                        <div>🧈 ${meal.totalNutrients.fat.toFixed(1)}g lipides</div>
                    </div>
                </div>
            `).join('');

            const mealsTodayDiv = document.getElementById('mealsToday');
            if (mealsTodayDiv) {
                mealsTodayDiv.innerHTML = mealsHTML || '<p style="color: #999;">Aucun repas enregistré pour aujourd\'hui. Commencez par scanner un produit ou ajouter un repas!</p>';
            }
        } catch (error) {
            console.error('Error updating meals list:', error);
        }
    },

    /**
     * Delete meal
     */
    async deleteMeal(mealId) {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce repas?')) {
            return;
        }

        try {
            await CoreDB.deleteMeal(mealId);
            this.updateDashboard();
            this.updateMealsList();
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('❌ Erreur lors de la suppression du repas');
        }
    }
};

// Initialize food module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        foodModule.init();
    });
} else {
    foodModule.init();
}
