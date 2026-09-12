/**
 * MAIN APPLICATION MODULE
 * Handles initialization, UI events, and integration of all features
 */

// Configuration
const CONFIG = {
  MAMMOUTH_API_KEY: localStorage.getItem('MAMMOUTH_API_KEY') || '', // Must be set by user
  OPENAI_API_COMPATIBLE: true, // Mammouth is OpenAI compatible
  DEFAULT_CALORIE_MULTIPLIER: 1.2, // 20% more for restaurant meals
  SCANNER_TIMEOUT: 30000 // 30 seconds scanner timeout
};

// Global state
let currentMealDate = new Date().toISOString().split('T')[0];
let mealParser = null;
let barcodeScanner = null;

/**
 * Initialize the entire application
 */
async function initializeApp() {
  console.log('🚀 Initializing Carnet Nutritionnel & Sportif...');

  try {
    // 1. Initialize database
    await initDB();
    console.log('✅ Database ready');

    // 2. Check for API key and initialize meal parser
    if (CONFIG.MAMMOUTH_API_KEY) {
      initMealParser(CONFIG.MAMMOUTH_API_KEY);
      console.log('✅ AI Meal Parser initialized');
    } else {
      console.warn('⚠️ No Mammouth API key. AI features disabled.');
      promptForMamouthKey();
    }

    // 3. Initialize UI event listeners
    setupUIEventListeners();
    console.log('✅ UI events configured');

    // 4. Load initial data
    await refreshMealsDisplay();
    await updateDashboard();
    console.log('✅ Data loaded');

    // 5. Set today's date as default
    document.getElementById('ai-meal-date').valueAsDate = new Date();
    document.getElementById('manual-meal-date').valueAsDate = new Date();

    console.log('✅ Application fully initialized!');

  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    showError('Erreur lors de l\'initialisation de l\'application');
  }
}

/**
 * ========== UI EVENT LISTENERS ==========
 */

function setupUIEventListeners() {
  // Tab navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // Meal input methods
  document.getElementById('open-scanner-btn')?.addEventListener('click', openScannerModal);
  document.getElementById('open-ai-input-btn')?.addEventListener('click', openAIMealModal);
  document.getElementById('open-manual-form-btn')?.addEventListener('click', openManualFormModal);

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.dataset.modal;
      closeModal(modalId);
    });
  });

  document.querySelectorAll('[data-modal]').forEach(btn => {
    if (btn.classList.contains('btn-secondary')) {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.dataset.modal;
        closeModal(modalId);
      });
    }
  });

  // AI Meal form submission
  document.getElementById('ai-meal-submit-btn')?.addEventListener('click', handleAIMealSubmit);

  // Manual form submission
  document.getElementById('manual-meal-submit-btn')?.addEventListener('click', handleManualFormSubmit);

  // Meal confirmation
  document.getElementById('meal-confirmation-confirm')?.addEventListener('click', () => {
    // Handled in showMealConfirmation
  });

  document.getElementById('meal-confirmation-cancel')?.addEventListener('click', () => {
    closeModal('meal-confirmation-modal');
  });

  // Scanner retry button
  document.getElementById('scanner-retry-btn')?.addEventListener('click', initializeScanner);
}

/**
 * ========== MODAL HANDLERS ==========
 */

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Refresh data if meals tab
  if (tabName === 'meals') {
    refreshMealsDisplay();
  }
}

function openScannerModal() {
  const modal = document.getElementById('scanner-modal');
  if (modal) {
    modal.style.display = 'flex';
    initializeScanner();
  }
}

function openAIMealModal() {
  if (!CONFIG.MAMMOUTH_API_KEY) {
    promptForMamouthKey();
    return;
  }

  const modal = document.getElementById('ai-meal-input-modal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Update quota display
    if (mealParser) {
      const quota = mealParser.getQuotaInfo();
      const quotaDisplay = document.getElementById('ai-quota-display');
      if (quotaDisplay) {
        quotaDisplay.style.display = 'block';
        document.getElementById('quota-remaining').textContent = quota.requestsRemaining;
      }
    }
  }
}

function openManualFormModal() {
  const modal = document.getElementById('manual-meal-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    
    // Clean up scanner if closing scanner modal
    if (modalId === 'scanner-modal' && barcodeScanner) {
      barcodeScanner.stop();
    }

    // Clear forms if closing input modals
    if (modalId === 'ai-meal-input-modal') {
      document.getElementById('ai-meal-form')?.reset();
    }
    if (modalId === 'manual-meal-modal') {
      document.getElementById('manual-food-form')?.reset();
    }
  }
}

/**
 * ========== SCANNER HANDLER ==========
 */

async function initializeScanner() {
  const videoElement = document.getElementById('scanner-video');
  const canvasElement = document.getElementById('scanner-canvas');
  const loadingDiv = document.getElementById('scanner-loading');

  if (!videoElement || !canvasElement) {
    console.error('Scanner elements not found');
    return;
  }

  try {
    loadingDiv.style.display = 'flex';

    // Try to get camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    videoElement.srcObject = stream;
    loadingDiv.style.display = 'none';

    // Initialize Quagga scanner
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: videoElement,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: 'environment'
        }
      },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'upc_reader']
      }
    }, (err) => {
      if (err) {
        console.error('Quagga init error:', err);
        showScannerError('Erreur lors de l\'initialisation du scanner');
        return;
      }

      Quagga.start();

      // Handle barcode detection
      Quagga.onDetected(async (result) => {
        const barcode = result.codeResult.code;
        console.log('📷 Barcode detected:', barcode);

        Quagga.stop();
        
        try {
          await processScannerResult(barcode);
        } catch (error) {
          showScannerError(`Erreur: ${error.message}`);
        }
      });

      // Set scanner timeout
      setTimeout(() => {
        if (Quagga.state === 'running') {
          showScannerError('Délai d\'attente dépassé');
          Quagga.stop();
        }
      }, CONFIG.SCANNER_TIMEOUT);
    });

  } catch (error) {
    console.error('Camera access error:', error);
    showScannerError('Impossible d\'accéder à la caméra');
    loadingDiv.style.display = 'none';
  }
}

async function processScannerResult(barcode) {
  // 1. Check cache first
  const cached = await getCachedProduct(barcode);
  if (cached) {
    console.log('✅ Product found in cache');
    showScannerSuccess(cached.product_name);
    return;
  }

  // 2. Query Open Food Facts API
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error('Produit non trouvé dans Open Food Facts');
    }

    const data = await response.json();
    
    if (data.status !== 1) {
      throw new Error('Produit non trouvé');
    }

    const product = data.product;

    // Extract nutritional info
    const nutrition = product.nutriments || {};
    const nutrition_facts_per = product.nutrition_facts_per || '100g';

    const parsedProduct = {
      barcode: barcode,
      product_name: product.product_name || 'Produit inconnu',
      brand: product.brands || 'Non spécifié',
      calories: nutrition.energy_kcal || nutrition['energy-kcal'] || 0,
      proteins: nutrition.proteins || 0,
      carbs: nutrition.carbohydrates || 0,
      fats: nutrition.fat || 0,
      fiber: nutrition.fiber || 0,
      quantity: 100,
      unit: 'g',
      source: 'open_food_facts'
    };

    // Cache the product
    await cacheProduct({
      barcode: barcode,
      ...parsedProduct
    });

    // Show in UI for confirmation
    showScannerSuccess(product.product_name);
    
    // Add to meal
    const confirmed = await showMealConfirmation({
      name: product.product_name,
      description: `${product.brands || ''} - ${product.categories || ''}`,
      ingredients: [{
        name: product.product_name,
        quantity_text: '100g',
        calories: parsedProduct.calories,
        source: '✓ Open Food Facts'
      }],
      totals: {
        calories: parsedProduct.calories.toFixed(0),
        proteins: parsedProduct.proteins.toFixed(1),
        carbs: parsedProduct.carbs.toFixed(1),
        fats: parsedProduct.fats.toFixed(1),
        fiber: parsedProduct.fiber.toFixed(1)
      },
      confidence: '95%',
      needs_verification: false
    }, parsedProduct);

    if (confirmed) {
      addFoodToMeal({
        name: product.product_name,
        calories: parsedProduct.calories,
        proteins: parsedProduct.proteins,
        carbs: parsedProduct.carbs,
        fats: parsedProduct.fats,
        quantity: 100,
        unit: 'g',
        mealDate: currentMealDate,
        source: 'scanner'
      });

      closeModal('scanner-modal');
      await refreshMealsDisplay();
      showSuccess('✅ Produit ajouté au repas');
    }

  } catch (error) {
    console.error('Open Food Facts error:', error);
    throw error;
  }
}

function showScannerSuccess(productName) {
  const resultDiv = document.getElementById('scanner-result');
  const resultText = document.getElementById('scanner-result-text');

  if (resultDiv && resultText) {
    resultText.textContent = `✅ Produit trouvé: ${productName}`;
    resultDiv.style.display = 'block';
  }
}

function showScannerError(message) {
  const errorDiv = document.getElementById('scanner-error');
  if (errorDiv) {
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.style.display = 'block';
  }

  const retryBtn = document.getElementById('scanner-retry-btn');
  if (retryBtn) {
    retryBtn.style.display = 'inline-block';
  }
}

/**
 * ========== AI MEAL HANDLER ==========
 */

async function handleAIMealSubmit() {
  if (!mealParser) {
    showError('Analyseur de repas non initialisé');
    return;
  }

  const mealDescription = document.getElementById('ai-meal-description').value;
  const mealDate = document.getElementById('ai-meal-date').value;
  const restaurantHint = document.getElementById('ai-restaurant-hint').checked;

  if (!mealDescription.trim()) {
    showError('Veuillez décrire votre repas');
    return;
  }

  try {
    showLoadingState('🤖 Analyse en cours avec Mammouth AI...');

    // Add restaurant hint to the description
    const enhancedDescription = restaurantHint 
      ? `[AU RESTAURANT] ${mealDescription}`
      : mealDescription;

    // Parse the meal with AI
    const parsedMeal = await mealParser.parseMealDescription(enhancedDescription);

    // Show confirmation
    const displayData = mealParser.formatMealForDisplay(parsedMeal);
    const confirmed = await showMealConfirmation(displayData, parsedMeal);

    if (confirmed) {
      // Add each ingredient to the meal
      for (const ingredient of parsedMeal.ingredients) {
        await addFoodToMeal({
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

      // Save parsed meal to cache
      await addParsedMeal(parsedMeal);

      closeModal('ai-meal-input-modal');
      document.getElementById('ai-meal-form')?.reset();
      
      await refreshMealsDisplay();
      await updateDashboard();
      
      showSuccess(`✅ Repas ajouté: ${parsedMeal.meal_name}`);
    }

  } catch (error) {
    console.error('AI parsing error:', error);
    showError(`Erreur d'analyse: ${error.message}`);
  } finally {
    hideLoadingState();
  }
}

/**
 * ========== MANUAL FORM HANDLER ==========
 */

async function handleManualFormSubmit() {
  const foodName = document.getElementById('manual-food-name').value;
  const quantity = parseFloat(document.getElementById('manual-food-quantity').value);
  const unit = document.getElementById('manual-food-unit').value;
  const mealDate = document.getElementById('manual-meal-date').value;

  if (!foodName || !quantity) {
    showError('Veuillez remplir les champs obligatoires');
    return;
  }

  try {
    // Get nutritional info
    const calories = parseFloat(document.getElementById('manual-food-calories').value) || 0;
    const proteins = parseFloat(document.getElementById('manual-food-proteins').value) || 0;
    const carbs = parseFloat(document.getElementById('manual-food-carbs').value) || 0;
    const fats = parseFloat(document.getElementById('manual-food-fats').value) || 0;

    await addFoodToMeal({
      name: foodName,
      calories: calories,
      proteins: proteins,
      carbs: carbs,
      fats: fats,
      quantity: quantity,
      unit: unit,
      mealDate: mealDate,
      source: 'manual'
    });

    closeModal('manual-meal-modal');
    document.getElementById('manual-food-form')?.reset();

    await refreshMealsDisplay();
    await updateDashboard();

    showSuccess(`✅ ${foodName} ajouté au repas`);

  } catch (error) {
    console.error('Manual form error:', error);
    showError(`Erreur lors de l'ajout: ${error.message}`);
  }
}

/**
 * ========== DISPLAY FUNCTIONS ==========
 */

async function refreshMealsDisplay() {
  const mealsList = document.getElementById('meals-list');
  if (!mealsList) return;

  try {
    const meals = await getMealsByDate(currentMealDate);
    
    if (meals.length === 0) {
      mealsList.innerHTML = '<p class="empty-state">Aucun repas ajouté aujourd\'hui</p>';
      return;
    }

    mealsList.innerHTML = meals.map(meal => `
      <div class="meal-card">
        <h4>${meal.name || 'Repas'}</h4>
        <div class="meal-macros">
          <span>${meal.calories || 0} kcal</span>
          <span>${meal.proteins || 0}g protéines</span>
          <span>${meal.carbs || 0}g glucides</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error refreshing meals:', error);
    mealsList.innerHTML = '<p class="empty-state">Erreur lors du chargement des repas</p>';
  }
}

async function updateDashboard() {
  try {
    const meals = await getMealsByDate(currentMealDate);
    
    const totals = {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0
    };

    meals.forEach(meal => {
      totals.calories += meal.calories || 0;
      totals.proteins += meal.proteins || 0;
      totals.carbs += meal.carbs || 0;
      totals.fats += meal.fats || 0;
    });

    document.getElementById('daily-calories').textContent = Math.round(totals.calories);
    document.getElementById('daily-proteins').textContent = Math.round(totals.proteins) + 'g';
    document.getElementById('daily-carbs').textContent = Math.round(totals.carbs) + 'g';
    document.getElementById('daily-fats').textContent = Math.round(totals.fats) + 'g';

  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

/**
 * ========== UTILITY FUNCTIONS ==========
 */

function promptForMamouthKey() {
  const apiKey = prompt(
    '🔑 Entrez votre clé API Mammouth:\n' +
    '(Créez-en une sur https://app.mammouth.ai/)\n\n' +
    'Copiez-la ici pour activer les fonctionnalités IA:'
  );

  if (apiKey) {
    CONFIG.MAMMOUTH_API_KEY = apiKey;
    localStorage.setItem('MAMMOUTH_API_KEY', apiKey);
    initMealParser(apiKey);
    showSuccess('✅ Clé API sauvegardée! Fonctionnalités IA activées');
  }
}

function showSuccess(message) {
  const notification = document.createElement('div');
  notification.className = 'notification notification-success';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showError(message) {
  const notification = document.createElement('div');
  notification.className = 'notification notification-error';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Start the app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}