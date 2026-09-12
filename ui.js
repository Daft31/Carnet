/**
 * UI MODULE
 * Handles modal interactions, styling, and display utilities
 */

/**
 * Show modal
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Hide modal (already in app.js but defined here for reference)
 */
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Show meal confirmation modal with parsed data
 */
async function showMealConfirmation(displayData, parsedMeal) {
  return new Promise((resolve) => {
    const modal = document.getElementById('meal-confirmation-modal');
    if (!modal) {
      console.error('Confirmation modal not found');
      resolve(true); // Auto-confirm if modal missing
      return;
    }

    // Populate modal content
    const modalContent = document.getElementById('meal-confirmation-content');
    if (modalContent) {
      const ingredientsHtml = displayData.ingredients.map(ing => `
        <div class="ingredient-row">
          <div class="ingredient-info">
            <span class="ingredient-name">${ing.name}</span>
            <span class="ingredient-qty">${ing.quantity_text}</span>
          </div>
          <div class="ingredient-nutrition">
            <span class="ingredient-cal">${ing.calories} kcal</span>
            <span class="ingredient-source">${ing.source}</span>
          </div>
        </div>
      `).join('');

      modalContent.innerHTML = `
        <div class="meal-confirmation-card">
          <div class="meal-header">
            <h3>${displayData.name || 'Repas'}</h3>
            <div class="badges">
              ${displayData.restaurant ? '<span class="badge badge-restaurant">🍽️ Restaurant</span>' : ''}
              ${displayData.needs_verification ? '<span class="badge badge-warning">⚠️ À vérifier</span>' : ''}
              <span class="badge badge-confidence">🎯 ${displayData.confidence}</span>
            </div>
          </div>

          ${displayData.description ? `<p class="meal-description">${displayData.description}</p>` : ''}

          <div class="ingredients-section">
            <h4>Ingrédients détectés :</h4>
            <div class="ingredients-list">
              ${ingredientsHtml}
            </div>
          </div>

          <div class="macros-grid">
            <div class="macro-card">
              <span class="macro-label">Calories</span>
              <span class="macro-value">${displayData.totals.calories}</span>
            </div>
            <div class="macro-card">
              <span class="macro-label">Protéines</span>
              <span class="macro-value">${displayData.totals.proteins}g</span>
            </div>
            <div class="macro-card">
              <span class="macro-label">Glucides</span>
              <span class="macro-value">${displayData.totals.carbs}g</span>
            </div>
            <div class="macro-card">
              <span class="macro-label">Lipides</span>
              <span class="macro-value">${displayData.totals.fats}g</span>
            </div>
          </div>

          ${displayData.needs_verification ? `
            <div class="alert alert-warning">
              <span class="alert-icon">⚠️</span>
              <span>Certaines quantités ont été estimées. Vérifiez et ajustez si nécessaire.</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Set up button handlers
    const confirmBtn = document.getElementById('meal-confirmation-confirm');
    const cancelBtn = document.getElementById('meal-confirmation-cancel');

    const cleanup = () => {
      confirmBtn?.removeEventListener('click', onConfirm);
      cancelBtn?.removeEventListener('click', onCancel);
      modal.style.display = 'none';
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    confirmBtn?.addEventListener('click', onConfirm);
    cancelBtn?.addEventListener('click', onCancel);

    // Show modal
    modal.style.display = 'flex';
  });
}

/**
 * Show loading state during AI processing
 */
function showLoadingState(message) {
  const loadingDiv = document.getElementById('ai-parsing-loading');
  if (loadingDiv) {
    const content = loadingDiv.querySelector('p');
    if (content) {
      content.textContent = message;
    }
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
 * Show error alert
 */
function showErrorAlert(message, modalId) {
  const errorDiv = document.getElementById(`${modalId}-error-message`) || 
                   document.getElementById('error-message');
  
  if (errorDiv) {
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.style.display = 'block';
  }
}

/**
 * Clear error alert
 */
function clearErrorAlert(modalId) {
  const errorDiv = document.getElementById(`${modalId}-error-message`);
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
}

/**
 * Format food items for display
 */
function formatFoodDisplay(food) {
  return {
    name: food.name || 'Aliment inconnu',
    quantity: food.quantity || 0,
    unit: food.unit || 'g',
    calories: Math.round(food.calories || 0),
    proteins: (food.proteins || 0).toFixed(1),
    carbs: (food.carbs || 0).toFixed(1),
    fats: (food.fats || 0).toFixed(1),
    source: food.source || 'manuel'
  };
}

/**
 * Format meal totals for display
 */
function formatMealTotals(meal) {
  return {
    calories: Math.round(meal.calories || 0),
    proteins: (meal.proteins || 0).toFixed(1),
    carbs: (meal.carbs || 0).toFixed(1),
    fats: (meal.fats || 0).toFixed(1),
    fiber: (meal.fiber || 0).toFixed(1)
  };
}

/**
 * Create a meal card HTML
 */
function createMealCard(meal) {
  const totals = formatMealTotals(meal);
  
  return `
    <div class="meal-card">
      <div class="meal-card-header">
        <h4>${meal.name || 'Repas'}</h4>
        <span class="meal-source badge-${meal.source || 'manual'}">
          ${getMealSourceIcon(meal.source)}
        </span>
      </div>
      <div class="meal-card-body">
        <div class="nutrition-summary">
          <div class="nutrition-stat">
            <span class="stat-value">${totals.calories}</span>
            <span class="stat-label">kcal</span>
          </div>
          <div class="nutrition-stat">
            <span class="stat-value">${totals.proteins}g</span>
            <span class="stat-label">Protéines</span>
          </div>
          <div class="nutrition-stat">
            <span class="stat-value">${totals.carbs}g</span>
            <span class="stat-label">Glucides</span>
          </div>
          <div class="nutrition-stat">
            <span class="stat-value">${totals.fats}g</span>
            <span class="stat-label">Lipides</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get meal source icon
 */
function getMealSourceIcon(source) {
  const icons = {
    'scanner': '📷 Code-barres',
    'ai_parsed': '🤖 IA',
    'manual': '✍️ Manuel',
    'open_food_facts': '🔍 Open Food Facts'
  };
  return icons[source] || '📝 Autre';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Create notification
 */
function createNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      ${message}
    </div>
  `;

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Auto-remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);

  return notification;
}

/**
 * Add CSS for notifications if not already added
 */
function initNotificationStyles() {
  const styleId = 'notification-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .notification-success {
      background-color: #10b981;
      color: white;
    }

    .notification-error {
      background-color: #ef4444;
      color: white;
    }

    .notification-info {
      background-color: #3b82f6;
      color: white;
    }

    .notification-warning {
      background-color: #f59e0b;
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .notification.show {
      animation: slideOut 0.3s ease-out forwards;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Add CSS for modals and forms if not already added
 */
function initModalStyles() {
  const styleId = 'modal-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }

    .modal-content {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px rgba(0,0,0,0.15);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 700px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      color: #111827;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 8px;
      font-weight: 500;
      color: #111827;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group small {
      margin-top: 6px;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .meal-confirmation-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
    }

    .meal-header {
      margin-bottom: 16px;
    }

    .meal-header h3 {
      margin: 0 0 12px 0;
      font-size: 1.25rem;
    }

    .badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-restaurant {
      background-color: #fecaca;
      color: #991b1b;
    }

    .badge-warning {
      background-color: #fde047;
      color: #854d0e;
    }

    .badge-confidence {
      background-color: #bfdbfe;
      color: #1e40af;
    }

    .ingredients-section {
      margin: 16px 0;
    }

    .ingredients-section h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #374151;
    }

    .ingredients-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ingredient-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: white;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .ingredient-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ingredient-name {
      font-weight: 500;
      color: #111827;
    }

    .ingredient-qty {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .ingredient-nutrition {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .ingredient-cal {
      font-weight: 600;
      color: #3b82f6;
    }

    .ingredient-source {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .macros-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 16px 0;
    }

    .macro-card {
      background-color: white;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }

    .macro-label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .macro-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-top: 12px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .alert-warning {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    .alert-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .alert-icon {
      flex-shrink: 0;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Initialize all UI styles
 */
function initUIStyles() {
  initNotificationStyles();
  initModalStyles();
}

/**
 * Initialize UI when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUIStyles);
} else {
  initUIStyles();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showModal,
    hideModal,
    showMealConfirmation,
    showLoadingState,
    hideLoadingState,
    showErrorAlert,
    clearErrorAlert,
    formatFoodDisplay,
    formatMealTotals,
    createMealCard,
    getMealSourceIcon,
    formatDate,
    formatTime,
    createNotification,
    initUIStyles
  };
}