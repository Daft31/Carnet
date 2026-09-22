/* ===================== SCANNER CODE-BARRES (Quagga2 + Open Food Facts) ===================== */
const offCache = new Map();

async function lookupBarcode(barcode) {
  if (offCache.has(barcode)) return offCache.get(barcode);
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  if (!res.ok) throw new Error('Erreur réseau Open Food Facts');
  const data = await res.json();
  if (data.status === 0 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments || {};
  // Side quest P0 (auto-ajout catalogue) : `kcalKnown` distingue "kcal absente
  // d'Open Food Facts" de "kcal réellement à 0" — `parseFloat(...)||0` juste en
  // dessous masquerait cette différence si on ne la capturait pas avant. Sert
  // uniquement à décider si ce produit est assez fiable pour un ajout automatique
  // au catalogue (voir Quagga.onDetected) ; n'affecte pas l'affichage existant
  // de la modale de quantité, qui continue d'utiliser `kcal` (0 si inconnue,
  // comportement inchangé pour ce chemin).
  const kcalRaw = n['energy-kcal_100g'] ?? n['energy-kcal'];
  const product = {
    barcode,
    name: p.product_name || p.generic_name || 'Produit inconnu',
    brand: p.brands || '',
    kcal: parseFloat(kcalRaw ?? 0) || 0,
    protein: parseFloat(n['proteins_100g'] ?? n.proteins ?? 0) || 0,
    carbs: parseFloat(n['carbohydrates_100g'] ?? n.carbohydrates ?? 0) || 0,
    fat: parseFloat(n['fat_100g'] ?? n.fat ?? 0) || 0,
    kcalKnown: kcalRaw != null,
  };
  offCache.set(barcode, product);
  return product;
}

// Side quest P0 (auto-ajout catalogue) : trouve l'aliment déjà catalogué pour ce
// `barcode` (customFoods, js/core.js) ou en crée un. Déduplication STRICTE sur
// `barcode` uniquement (identifiant GS1/EAN déjà normalisé par Open Food Facts)
// — jamais de rapprochement approximatif par nom, même règle que
// frequentMealFor()/typicalGramsFor() (correspondance exacte, zéro fuzzy
// matching). Ne pose volontairement aucun champ source/confidence sur l'objet
// customFoods créé : ce modèle ne couvre aujourd'hui que les entrées logEntries
// (voir CLAUDE.md), l'étendre aux définitions catalogue est une décision
// produit séparée, pas traitée dans cette P0.
function findOrAddScannedFood(product) {
  const existing = customFoods.find(f => f.barcode === product.barcode);
  if (existing) return existing;
  const food = {
    id: 'c' + uid(),
    name: product.name,
    kcal: product.kcal,
    protein: product.protein,
    carbs: product.carbs,
    fat: product.fat,
    barcode: String(product.barcode),
  };
  customFoods.unshift(food);
  save();
  return food;
}

function stopQuagga() {
  try { if (window.Quagga) Quagga.stop(); } catch (e) { /* noop */ }
}

// Chargement paresseux de Quagga2 (audit Phase 2.5, correctif LOAD-1) : la librairie
// pesait sur CHAQUE chargement de page (bloquante dans <head>, index.html) alors
// qu'elle ne sert qu'au scanner de code-barres, utilisé occasionnellement. Chargée
// ici uniquement à la première ouverture réelle du scanner, puis mise en cache (la
// promesse elle-même, pas juste `window.Quagga`) pour que les ouvertures suivantes
// ne retéléchargent jamais le script. `quaggaLoadPromise` est réinitialisée à `null`
// en cas d'échec réseau, pour qu'une réouverture ultérieure retente un chargement
// frais plutôt que de rester bloquée sur un rejet définitif.
//
// JsBarcode (index.html) n'est pas concerné par ce correctif : la review l'a
// identifié comme inutilisé dans le code JS, mais sa suppression est une décision
// séparée, non traitée ici (voir rapport de correction Phase 2.5).
let quaggaLoadPromise = null;
function loadQuaggaScript() {
  if (window.Quagga) return Promise.resolve();
  if (quaggaLoadPromise) return quaggaLoadPromise;
  quaggaLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
    script.onload = () => resolve();
    script.onerror = () => { quaggaLoadPromise = null; reject(new Error('Échec du chargement de Quagga2')); };
    document.head.appendChild(script);
  });
  return quaggaLoadPromise;
}

function openScannerModal() {
  openModal(`
    <h3>Scanner un code-barres</h3>
    <div class="hint">Vise le code-barres du produit avec la caméra.</div>
    <div class="scanner-video-wrap" id="scannerVideoWrap"><div class="scanner-frame"></div></div>
    <div id="scannerStatus" class="hint" style="margin-top:10px;">Chargement du scanner…</div>
    <button class="btn ghost" id="scannerCancelBtn" type="button">Annuler</button>
  `);
  const statusEl = document.getElementById('scannerStatus');
  document.getElementById('scannerCancelBtn').onclick = () => { stopQuagga(); closeModal(); };
  // Garde (même raison que l'abandon des requêtes IA en vol, js/mealparser.js) :
  // si la modale a été fermée (ou remplacée par une réouverture du scanner) pendant
  // le chargement du script, `statusEl` n'est alors plus dans le DOM — ne jamais
  // agir sur une modale déjà quittée par l'utilisateur.
  loadQuaggaScript().then(() => {
    if (!document.body.contains(statusEl)) return;
    statusEl.textContent = 'Initialisation de la caméra…';
    startQuagga(statusEl);
  }).catch(() => {
    if (!document.body.contains(statusEl)) return;
    statusEl.textContent = 'Scanner indisponible (échec du chargement de la librairie).';
  });
}

function startQuagga(statusEl) {
  if (!window.Quagga) {
    statusEl.textContent = "Scanner indisponible (librairie non chargée).";
    return;
  }
  Quagga.init({
    inputStream: {
      type: 'LiveStream',
      target: document.getElementById('scannerVideoWrap'),
      constraints: { facingMode: 'environment' }
    },
    decoder: { readers: ['ean_reader', 'ean_8_reader', 'upc_reader'] },
    locate: true
  }, (err) => {
    if (err) {
      statusEl.textContent = "Impossible d'accéder à la caméra.";
      console.error(err);
      return;
    }
    Quagga.start();
    statusEl.textContent = 'Recherche du code-barres…';
  });

  let lastCode = null, lastTime = 0;
  // Side quest P0 : garde anti-détections concurrentes. Quagga continue de tourner
  // pendant l'appel réseau lookupBarcode() (stopQuagga() n'est appelé qu'une fois la
  // réponse revenue) — sans cette garde, une seconde détection (même code ou non)
  // pendant que la première est encore en vol pourrait déclencher un second passage
  // dans findOrAddScannedFood() en parallèle et créer un doublon avant que le premier
  // n'ait fini d'écrire dans customFoods. `processing` bloque toute nouvelle détection
  // tant qu'un lookup est en cours ; remis à false uniquement sur le chemin d'erreur
  // réseau (le seul cas où le scanner reste actif pour permettre une nouvelle tentative
  // — tous les autres chemins appellent déjà stopQuagga()/closeModal()).
  let processing = false;
  Quagga.onDetected(async (result) => {
    const code = result?.codeResult?.code;
    if (!code || processing) return;
    const now = Date.now();
    if (code === lastCode && now - lastTime < 2000) return;
    lastCode = code; lastTime = now;
    processing = true;
    statusEl.textContent = `Code détecté : ${code} — recherche…`;
    try {
      const product = await lookupBarcode(code);
      stopQuagga();
      if (!product) {
        closeModal();
        toast('Produit introuvable, ajoute-le manuellement.', 'warn');
        openCustomFoodModal();
        return;
      }
      // Cas C (side quest P0) : produit identifié mais données nutritionnelles
      // insuffisantes (kcal absente d'Open Food Facts) — ne jamais ajouter
      // automatiquement un aliment à kcal:0 fabriquée par défaut. Message distinct
      // de "Produit introuvable" : la situation réelle n'est pas la même (le
      // produit a été trouvé), donc le message doit le refléter. Repli sur le
      // même flux de création manuelle existant que le cas "introuvable" — pas de
      // nouveau formulaire pour cette P0.
      if (!product.kcalKnown) {
        closeModal();
        toast('Produit trouvé mais données nutritionnelles insuffisantes, ajoute-le manuellement.', 'warn');
        openCustomFoodModal();
        return;
      }
      const food = findOrAddScannedFood(product);
      closeModal();
      openScannedProductModal(food, product.brand);
    } catch (e) {
      console.error(e);
      statusEl.textContent = 'Erreur réseau, réessaie.';
      processing = false;
    }
  });
}

// `food` : entrée customFoods (existante ou tout juste créée par findOrAddScannedFood,
// voir js/core.js pour la forme de customFoods) — plus le `product` OFF éphémère
// d'avant cette P0. `brand` reste un simple texte d'affichage (Open Food Facts),
// jamais persisté dans customFoods (hors du modèle minimal demandé pour cette P0).
function openScannedProductModal(food, brand) {
  openModal(`
    <h3>${escapeHtml(food.name)}</h3>
    <div class="hint">${brand ? escapeHtml(brand) + ' · ' : ''}Valeurs pour 100 g : ${Math.round(food.kcal)} kcal · P${food.protein.toFixed(1)} G${food.carbs.toFixed(1)} L${food.fat.toFixed(1)}</div>
    <label>Quantité (g)</label>
    <input id="scanQtyInput" type="number" inputmode="numeric" value="100" autofocus>
    <div class="qty-preview" id="scanQtyPreview"></div>
    <button class="btn" id="scanQtyConfirm" type="button">Ajouter à ${mealSlot}</button>
  `);
  const update = () => {
    const g = parseFloat(document.getElementById('scanQtyInput').value) || 0;
    const f = g / 100;
    document.getElementById('scanQtyPreview').innerHTML = `
      <div class="item"><div class="n">${Math.round(food.kcal * f)}</div><div class="l">kcal</div></div>
      <div class="item"><div class="n">${Math.round(food.protein * f)}</div><div class="l">prot g</div></div>
      <div class="item"><div class="n">${Math.round(food.carbs * f)}</div><div class="l">gluc g</div></div>
      <div class="item"><div class="n">${Math.round(food.fat * f)}</div><div class="l">lip g</div></div>`;
  };
  document.getElementById('scanQtyInput').addEventListener('input', update);
  update();
  // Garde anti-double-confirmation (voir js/ui.js: openQtyModal, même raison).
  let confirmed = false;
  document.getElementById('scanQtyConfirm').onclick = () => {
    if (confirmed) return;
    const g = parseFloat(document.getElementById('scanQtyInput').value) || 0;
    if (g <= 0) { toast('Entre une quantité valide'); return; }
    confirmed = true;
    const f = g / 100;
    // foodId posé (side quest P0) : le repas scanné référence désormais réellement
    // l'aliment catalogue, comme le flux recherche catalogue (js/ui.js openQtyModal)
    // — débloque typicalGramsFor()/frequentMealFor() pour les repas scannés, jusqu'ici
    // structurellement impossible (voir CLAUDE.md/README, limite connue).
    logEntries.push({
      id: uid(), date: currentDate, type: 'meal', mealSlot, foodId: food.id, foodName: food.name, grams: g,
      kcal: food.kcal * f, protein: food.protein * f, carbs: food.carbs * f, fat: food.fat * f,
      time: new Date().toTimeString().slice(0, 5), source: 'scan'
    });
    save('Ajouté ✓'); closeModal(); render();
  };
}
