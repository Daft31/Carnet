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
  const product = {
    barcode,
    name: p.product_name || p.generic_name || 'Produit inconnu',
    brand: p.brands || '',
    kcal: parseFloat(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0) || 0,
    protein: parseFloat(n['proteins_100g'] ?? n.proteins ?? 0) || 0,
    carbs: parseFloat(n['carbohydrates_100g'] ?? n.carbohydrates ?? 0) || 0,
    fat: parseFloat(n['fat_100g'] ?? n.fat ?? 0) || 0,
  };
  offCache.set(barcode, product);
  return product;
}

function stopQuagga() {
  try { if (window.Quagga) Quagga.stop(); } catch (e) { /* noop */ }
}

function openScannerModal() {
  openModal(`
    <h3>Scanner un code-barres</h3>
    <div class="hint">Vise le code-barres du produit avec la caméra.</div>
    <div class="scanner-video-wrap" id="scannerVideoWrap"><div class="scanner-frame"></div></div>
    <div id="scannerStatus" class="hint" style="margin-top:10px;">Initialisation de la caméra…</div>
    <button class="btn ghost" id="scannerCancelBtn" type="button">Annuler</button>
  `);
  document.getElementById('scannerCancelBtn').onclick = () => { stopQuagga(); closeModal(); };
  startQuagga(document.getElementById('scannerStatus'));
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
  Quagga.onDetected(async (result) => {
    const code = result?.codeResult?.code;
    if (!code) return;
    const now = Date.now();
    if (code === lastCode && now - lastTime < 2000) return;
    lastCode = code; lastTime = now;
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
      closeModal();
      openScannedProductModal(product);
    } catch (e) {
      console.error(e);
      statusEl.textContent = 'Erreur réseau, réessaie.';
    }
  });
}

function openScannedProductModal(product) {
  openModal(`
    <h3>${escapeHtml(product.name)}</h3>
    <div class="hint">${product.brand ? escapeHtml(product.brand) + ' · ' : ''}Valeurs pour 100 g : ${Math.round(product.kcal)} kcal · P${product.protein.toFixed(1)} G${product.carbs.toFixed(1)} L${product.fat.toFixed(1)}</div>
    <label>Quantité (g)</label>
    <input id="scanQtyInput" type="number" inputmode="numeric" value="100" autofocus>
    <div class="qty-preview" id="scanQtyPreview"></div>
    <button class="btn" id="scanQtyConfirm" type="button">Ajouter à ${mealSlot}</button>
  `);
  const update = () => {
    const g = parseFloat(document.getElementById('scanQtyInput').value) || 0;
    const f = g / 100;
    document.getElementById('scanQtyPreview').innerHTML = `
      <div class="item"><div class="n">${Math.round(product.kcal * f)}</div><div class="l">kcal</div></div>
      <div class="item"><div class="n">${Math.round(product.protein * f)}</div><div class="l">prot g</div></div>
      <div class="item"><div class="n">${Math.round(product.carbs * f)}</div><div class="l">gluc g</div></div>
      <div class="item"><div class="n">${Math.round(product.fat * f)}</div><div class="l">lip g</div></div>`;
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
    logEntries.push({
      id: uid(), date: currentDate, type: 'meal', mealSlot, foodName: product.name, grams: g,
      kcal: product.kcal * f, protein: product.protein * f, carbs: product.carbs * f, fat: product.fat * f,
      time: new Date().toTimeString().slice(0, 5), source: 'scan'
    });
    save(); closeModal(); render(); toast('Ajouté ✓');
  };
}
