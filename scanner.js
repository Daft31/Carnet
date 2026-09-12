/**
 * Scanner Module - Barcode scanning with Quagga2 and Open Food Facts API
 * Handles barcode detection, product lookup, and caching
 */

class BarcodeScanner {
  constructor() {
    this.isScanning = false;
    this.scannerVideo = null;
    this.lastScannedCode = null;
    this.scanDelay = 500; // Délai entre scans (ms)
  }

  /**
   * Initialize Quagga2 scanner
   */
  async initQuagga(elementId) {
    return new Promise((resolve, reject) => {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector(`#${elementId}`),
            constraints: {
              facingMode: "environment", // Camera arrière
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1440 },
            },
          },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader",
            ],
            debug: {
              showCanvas: true,
              showPatternLabel: false,
              showFrequency: false,
              showSkeleton: false,
            },
          },
          locator: {
            halfSample: true,
          },
        },
        (err) => {
          if (err) {
            console.error("Quagga init error:", err);
            reject(err);
            return;
          }
          console.log("Quagga initialized successfully");
          resolve();
        }
      );
    });
  }

  /**
   * Start scanning for barcodes
   */
  startScanning(onDetected, onError) {
    try {
      if (this.isScanning) return;

      Quagga.start();
      this.isScanning = true;

      Quagga.onDetected((result) => {
        if (result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code;

          // Éviter les faux positifs
          if (code !== this.lastScannedCode) {
            this.lastScannedCode = code;
            console.log("Barcode detected:", code);
            onDetected(code);

            // Reset après délai
            setTimeout(() => {
              this.lastScannedCode = null;
            }, this.scanDelay);
          }
        }
      });

      Quagga.onProcessed((result) => {
        // Optionnel: feedback visuel
        if (result && result.boxes) {
          // Les boxes contiennent les zones de détection
        }
      });
    } catch (error) {
      console.error("Error starting scanner:", error);
      onError(error);
    }
  }

  /**
   * Stop scanning
   */
  stopScanning() {
    try {
      if (this.isScanning) {
        Quagga.stop();
        this.isScanning = false;
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  }

  /**
   * Clean up scanner
   */
  destroyScanner() {
    try {
      Quagga.offDetected();
      Quagga.offProcessed();
      Quagga.stop();
      this.isScanning = false;
    } catch (error) {
      console.error("Error destroying scanner:", error);
    }
  }
}

/**
 * Open Food Facts API Integration
 */
class FoodDatabase {
  constructor() {
    this.apiUrl = "https://world.openfoodfacts.org/api/v0/product";
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 jours
  }

  /**
   * Search product by barcode
   */
  async searchProduct(barcode) {
    try {
      // Check cache first
      const cached = await this.getCachedProduct(barcode);
      if (cached) {
        console.log("Product found in cache:", cached);
        return cached;
      }

      // Query Open Food Facts API
      const response = await fetch(`${this.apiUrl}/${barcode}.json`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        console.log("Product not found in Open Food Facts");
        return null;
      }

      // Format product data
      const product = this.formatProduct(data.product, barcode);

      // Cache the product
      await this.cacheProduct(barcode, product);

      return product;
    } catch (error) {
      console.error("Error searching product:", error);
      return null;
    }
  }

  /**
   * Format product data from API
   */
  formatProduct(apiProduct, barcode) {
    return {
      barcode: barcode,
      name:
        apiProduct.product_name ||
        apiProduct.generic_name ||
        "Produit inconnu",
      brand: apiProduct.brands || "Marque inconnue",
      quantity: apiProduct.quantity || "",
      servingSize:
        apiProduct.serving_size || apiProduct.portion_size || "100g",
      nutrients: {
        calories: this.parseNutrient(apiProduct, "energy-kcal", 0),
        protein: this.parseNutrient(apiProduct, "proteins", 0),
        carbs: this.parseNutrient(apiProduct, "carbohydrates", 0),
        fat: this.parseNutrient(apiProduct, "fat", 0),
        fiber: this.parseNutrient(apiProduct, "fiber", 0),
        sodium: this.parseNutrient(apiProduct, "sodium", 0),
      },
      imageUrl: apiProduct.image_front_url || apiProduct.image_url || "",
      source: "Open Food Facts",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Parse nutrient value from API
   */
  parseNutrient(product, nutrientKey, defaultValue = 0) {
    if (!product.nutriments) return defaultValue;
    const value =
      product.nutriments[nutrientKey] ||
      product.nutriments[`${nutrientKey}_100g`];
    return value ? parseFloat(value) : defaultValue;
  }

  /**
   * Cache product in IndexedDB
   */
  async cacheProduct(barcode, productData) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(["products"], "readwrite");
      const store = tx.objectStore("products");

      await store.put({
        barcode: barcode,
        data: productData,
        timestamp: Date.now(),
      });

      return true;
    } catch (error) {
      console.error("Error caching product:", error);
      return false;
    }
  }

  /**
   * Get cached product
   */
  async getCachedProduct(barcode) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(["products"], "readonly");
      const store = tx.objectStore("products");

      return new Promise((resolve, reject) => {
        const request = store.get(barcode);

        request.onsuccess = () => {
          const result = request.result;

          if (result) {
            // Check if cache is still valid
            if (Date.now() - result.timestamp < this.cacheExpiry) {
              resolve(result.data);
            } else {
              // Cache expired
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error getting cached product:", error);
      return null;
    }
  }

  /**
   * Open or create IndexedDB
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CarnetDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create products store if not exists
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "barcode" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  /**
   * Clear product cache
   */
  async clearCache() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(["products"], "readwrite");
      const store = tx.objectStore("products");

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
}

/**
 * Scanner UI Manager
 */
class ScannerUI {
  constructor() {
    this.scanner = new BarcodeScanner();
    this.foodDb = new FoodDatabase();
    this.isScannerActive = false;
  }

  /**
   * Show scanner modal
   */
  async showScannerModal() {
    const modal = document.getElementById("scannerModal");
    if (!modal) {
      console.error("Scanner modal not found");
      return;
    }

    modal.style.display = "flex";
    this.isScannerActive = true;

    try {
      // Initialize Quagga
      await this.scanner.initQuagga("scanner-video");

      // Start scanning
      this.scanner.startScanning(
        (barcode) => this.onBarcodeDetected(barcode),
        (error) => this.onScanError(error)
      );

      console.log("Scanner initialized and started");
    } catch (error) {
      console.error("Error initializing scanner:", error);
      this.showError("Erreur lors de l'initialisation du scanner");
    }
  }

  /**
   * Handle barcode detection
   */
  async onBarcodeDetected(barcode) {
    console.log("Processing barcode:", barcode);

    // Show loading state
    this.showLoading(true);

    try {
      const product = await this.foodDb.searchProduct(barcode);

      if (product) {
        // Product found
        this.closeScannerModal();
        this.showProductResult(product);
      } else {
        // Product not found - show manual form
        this.showManualForm(barcode);
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
      this.showError("Erreur lors de la recherche du produit");
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Handle scan error
   */
  onScanError(error) {
    console.error("Scanner error:", error);
    this.showError(
      "Erreur caméra: " +
        (error.message || "Impossible d'accéder à la caméra")
    );
  }

  /**
   * Show product result and add to meal
   */
  showProductResult(product) {
    const confirmation = `
      ✅ Produit trouvé!
      
      📦 ${product.name}
      🏷️ ${product.brand}
      📏 Portion: ${product.servingSize}
      
      Nutrition (pour ${product.servingSize}):
      🔥 ${product.nutrients.calories} kcal
      🥩 ${product.nutrients.protein}g protéines
      🍞 ${product.nutrients.carbs}g glucides
      🧈 ${product.nutrients.fat}g lipides
      
      Ajouter à votre repas?
    `;

    if (confirm(confirmation)) {
      this.addProductToMeal(product);
    }
  }

  /**
   * Show manual form for product not found
   */
  showManualForm(barcode) {
    this.closeScannerModal();

    const manualForm = `
      <div id="manualProductForm" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
      ">
        <h3 style="margin-top: 0; color: #333;">
          📝 Produit non trouvé
        </h3>
        <p style="color: #666; margin-bottom: 20px;">
          Code-barres: <strong>${barcode}</strong>
        </p>
        
        <form id="productForm" style="display: grid; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Nom du produit *
            </label>
            <input 
              type="text" 
              name="name" 
              required
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
              "
              placeholder="Ex: Pomme rouge"
            />
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Marque
            </label>
            <input 
              type="text" 
              name="brand"
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
              "
              placeholder="Ex: Bio Marché"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Portion
              </label>
              <input 
                type="text" 
                name="servingSize"
                value="100g"
                style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  font-size: 16px;
                  box-sizing: border-box;
                "
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Quantité *
              </label>
              <input 
                type="number" 
                name="quantity"
                min="0.1"
                step="0.1"
                value="1"
                required
                style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  font-size: 16px;
                  box-sizing: border-box;
                "
              />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Kcal *
              </label>
              <input 
                type="number" 
                name="calories"
                min="0"
                step="1"
                required
                style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  font-size: 16px;
                  box-sizing: border-box;
                "
                placeholder="0"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Protéines (g)
              </label>
              <input 
                type="number" 
                name="protein"
                min="0"
                step="0.1"
                style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  font-size: 16px;
                  box-sizing: border-box;
                "
                placeholder="0"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                Glucides (g)
              </label>
              <input 
                type="number" 
                name="carbs"
                min="0"
                step="0.1"
                style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  font-size: 16px;
                  box-sizing: border-box;
                "
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Lipides (g)
            </label>
            <input 
              type="number" 
              name="fat"
              min="0"
              step="0.1"
              style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
              "
              placeholder="0"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <button 
              type="button"
              onclick="document.getElementById('manualProductForm').remove()"
              style="
                padding: 12px;
                background: #ddd;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 16px;
              "
            >
              Annuler
            </button>
            <button 
              type="submit"
              style="
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                font-size: 16px;
              "
            >
              ✅ Ajouter
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", manualForm);

    document.getElementById("productForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const product = {
        barcode: barcode,
        name: formData.get("name"),
        brand: formData.get("brand"),
        servingSize: formData.get("servingSize"),
        quantity: parseFloat(formData.get("quantity")),
        nutrients: {
          calories: parseFloat(formData.get("calories")) || 0,
          protein: parseFloat(formData.get("protein")) || 0,
          carbs: parseFloat(formData.get("carbs")) || 0,
          fat: parseFloat(formData.get("fat")) || 0,
          fiber: 0,
          sodium: 0,
        },
        source: "Manuel",
        timestamp: new Date().toISOString(),
      };

      this.addProductToMeal(product);
      document.getElementById("manualProductForm").remove();
    });
  }

  /**
   * Add product to meal
   */
  addProductToMeal(product) {
    // Trigger food.js to add the product
    if (window.foodModule && window.foodModule.addScannedProduct) {
      window.foodModule.addScannedProduct(product);
    } else {
      this.showError("Module food non disponible");
    }
  }

  /**
   * Close scanner modal
   */
  closeScannerModal() {
    this.scanner.stopScanning();
    this.scanner.destroyScanner();

    const modal = document.getElementById("scannerModal");
    if (modal) {
      modal.style.display = "none";
    }

    this.isScannerActive = false;
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const loading = document.getElementById("scannerLoading");
    if (loading) {
      loading.style.display = show ? "flex" : "none";
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    alert("⚠️ " + message);
  }
}

// Initialize scanner UI when DOM is ready
let scannerUI = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    scannerUI = new ScannerUI();
  });
} else {
  scannerUI = new ScannerUI();
}
