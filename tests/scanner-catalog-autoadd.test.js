// Tests ciblés — Side quest P0 : auto-ajout du produit scanné au catalogue Kalo.
//
// Contexte : avant ce correctif, un produit scanné (js/scanner.js) n'était jamais
// écrit dans customFoods (js/core.js) — il n'existait que comme copie figée dans
// une seule entrée logEntries, sans foodId. Ce fichier teste `findOrAddScannedFood()`
// (dédup stricte par `barcode`) et le branchement dans le flux Quagga.onDetected
// (cas A/B/C/D/E, voir js/scanner.js) sans passer par un vrai scanner caméra.
//
// Même gabarit que tests/phase-2-5-quagga-lazy-load.test.js : Node `vm` + faux DOM
// minimal, pas de framework, pas de nouvelle dépendance de test. Différence
// importante par rapport à ce fichier existant : ici `openModal()` est un mock
// GÉNÉRIQUE (crée un élément pour chaque `id="..."` trouvé dans le HTML, avec sa
// `value`/`textContent` initiale) — nécessaire car ce fichier exerce la VRAIE
// `openScannedProductModal()` de js/scanner.js (pas un stub), jusqu'au clic sur
// "Ajouter", pour vérifier que `foodId` est bien posé sur `logEntries`.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeFakeDom() {
  const elements = new Map();
  function makeEl(id) {
    const el = {
      id, textContent: '', innerHTML: '', value: '',
      onclick: null,
      classList: { add(){}, remove(){}, toggle(){} },
      addEventListener(){},
    };
    elements.set(id, el);
    return el;
  }
  const document = {
    getElementById: (id) => elements.get(id) || null,
    createElement: () => ({}),
    head: { appendChild: () => {} },
    body: { contains: (el) => elements.get(el && el.id) === el },
  };
  return { document, elements, makeEl };
}

// Mock générique : crée un élément DOM (avec value/textContent initiaux tirés du
// HTML) pour chaque `id="..."` rencontré dans le template passé à openModal().
// Couvre à la fois la modale scanner (scannerStatus, scannerCancelBtn,
// scannerVideoWrap) et la modale de quantité (scanQtyInput, scanQtyPreview,
// scanQtyConfirm) sans avoir à les lister à la main pour chaque test.
function makeOpenModal(fakeDom) {
  const calls = [];
  return (html) => {
    calls.length = 0; // une seule modale "ouverte" à la fois dans ces tests
    calls.push(html);
    const idRegex = /id="([^"]+)"/g;
    let m;
    while ((m = idRegex.exec(html))) {
      const id = m[1];
      const el = fakeDom.elements.get(id) || fakeDom.makeEl(id);
      const openTagMatch = html.slice(m.index).match(/^id="[^"]+"[^>]*>([^<]*)</);
      if (openTagMatch) el.textContent = openTagMatch[1];
      const valueMatch = html.slice(Math.max(0, m.index - 200), m.index + 200).match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`));
      if (valueMatch) el.value = valueMatch[1];
    }
    return calls;
  };
}

function loadScannerSandbox(fakeDom, initial) {
  const toasts = [];
  const openCustomFoodModalCalls = [];
  let customFoods = (initial && initial.customFoods) || [];
  let logEntries = (initial && initial.logEntries) || [];
  let renderCallCount = 0;
  const openModal = makeOpenModal(fakeDom);
  const sandbox = {
    console,
    navigator: { userAgent: 'node-test' },
    document: fakeDom.document,
    openModal,
    closeModal: () => {},
    escapeHtml: (s) => String(s),
    toast: (msg, kind) => { toasts.push({ msg, kind }); },
    openCustomFoodModal: () => { openCustomFoodModalCalls.push(true); },
    mealSlot: 'Déjeuner',
    currentDate: '2026-09-22',
    get logEntries() { return logEntries; },
    set logEntries(v) { logEntries = v; },
    get customFoods() { return customFoods; },
    set customFoods(v) { customFoods = v; },
    uid: (() => { let n = 0; return () => 'uid' + (n++); })(),
    save: (msg, kind) => { if (msg) toasts.push({ msg, kind }); return true; },
    render: () => { renderCallCount++; },
  };
  vm.createContext(sandbox);
  vm.runInContext('var window = this;', sandbox);
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'scanner.js'), 'utf8');
  vm.runInContext(src, sandbox, { filename: 'js/scanner.js' });
  sandbox.__toasts = toasts;
  sandbox.__openCustomFoodModalCalls = openCustomFoodModalCalls;
  sandbox.__getCustomFoods = () => customFoods;
  sandbox.__getLogEntries = () => logEntries;
  sandbox.__getRenderCallCount = () => renderCallCount;
  return sandbox;
}

function offResponseFound({ kcal = 165, protein = 31, carbs = 0, fat = 3.6, name = 'Blanc de poulet', brand = 'MaMarque' } = {}) {
  return {
    ok: true,
    json: async () => ({
      status: 1,
      product: {
        product_name: name,
        brands: brand,
        nutriments: {
          'energy-kcal_100g': kcal,
          proteins_100g: protein,
          carbohydrates_100g: carbs,
          fat_100g: fat,
        },
      },
    }),
  };
}

// Produit trouvé mais sans `energy-kcal_100g` (cas C).
function offResponseFoundNoKcal({ name = 'Produit sans kcal', brand = '' } = {}) {
  return {
    ok: true,
    json: async () => ({
      status: 1,
      product: {
        product_name: name,
        brands: brand,
        nutriments: { proteins_100g: 5, carbohydrates_100g: 10, fat_100g: 2 },
      },
    }),
  };
}

function offResponseNotFound() {
  return { ok: true, json: async () => ({ status: 0 }) };
}

// Exerce directement startQuagga() -> Quagga.onDetected(code), plutôt que
// openScannerModal() complet : openScannerModal()/loadQuaggaScript() (chargement
// paresseux du CDN) sont déjà entièrement couverts par
// tests/phase-2-5-quagga-lazy-load.test.js. Appeler openScannerModal() ici en
// plus de startQuagga() manuel déclencherait un second enregistrement de
// Quagga.onDetected via sa propre chaîne .then() asynchrone (course inutile) —
// on crée donc ici seulement le DOM minimal attendu par startQuagga()
// (#scannerStatus) via le mock openModal(), puis on appelle startQuagga() une
// seule fois nous-mêmes.
function setupScanner(sandbox) {
  vm.runInContext(`
    window.Quagga = {
      init: (opts, cb) => cb(null),
      start: () => {},
      stop: () => {},
      onDetected: (cb) => { this.__detectedCb = cb; },
    };
  `, sandbox);
  vm.runInContext(`
    openModal('<h3>Scanner un code-barres</h3><div id="scannerStatus" class="hint">Chargement du scanner…</div><button class="btn ghost" id="scannerCancelBtn" type="button">Annuler</button>');
  `, sandbox);
  vm.runInContext('startQuagga(document.getElementById("scannerStatus"));', sandbox);
  return vm.runInContext('this.__detectedCb', sandbox);
}

async function simulateScan(sandbox, code, fetchImpl) {
  sandbox.fetch = fetchImpl;
  vm.runInContext('fetch = this.fetch;', sandbox);
  const cb = setupScanner(sandbox);
  await cb({ codeResult: { code } });
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
}

let passed = 0, failed = 0;
function test(name, fn) {
  return fn().then(() => {
    passed++;
    console.log(`  ok  ${name}`);
  }).catch((e) => {
    failed++;
    console.log(`FAIL  ${name}`);
    console.log('      ' + (e && e.stack ? e.stack : e));
  });
}

async function run() {
  await test('Cas A — produit valide + catalogue vide : ajout au catalogue avec tous les champs attendus', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    await simulateScan(sandbox, '3017620422003', async () => offResponseFound());
    const foods = sandbox.__getCustomFoods();
    assert.strictEqual(foods.length, 1, 'un seul aliment doit être ajouté');
    const f = foods[0];
    assert.strictEqual(f.barcode, '3017620422003');
    assert.strictEqual(f.name, 'Blanc de poulet');
    assert.strictEqual(f.kcal, 165);
    assert.strictEqual(f.protein, 31);
    assert.strictEqual(f.carbs, 0);
    assert.strictEqual(f.fat, 3.6);
    assert.ok(f.id && f.id.startsWith('c'), 'id doit être préfixé "c" comme les autres aliments personnalisés');
    // La modale de quantité doit maintenant afficher le nom du produit catalogué.
    const h3 = fakeDom.elements.get('scanQtyConfirm');
    assert.ok(h3, 'la modale de quantité doit avoir été ouverte (produit reconnu et suffisant)');
    assert.strictEqual(sandbox.__openCustomFoodModalCalls.length, 0, 'pas de repli manuel pour un produit valide');
  });

  await test('Cas B — barcode déjà présent : aucune nouvelle entrée, id réutilisé', async () => {
    const fakeDom = makeFakeDom();
    const existing = { id: 'c_existing', name: 'Ancien nom', kcal: 100, protein: 10, carbs: 10, fat: 1, barcode: '3017620422003' };
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [existing] });
    await simulateScan(sandbox, '3017620422003', async () => offResponseFound({ name: 'Nom OFF différent' }));
    const foods = sandbox.__getCustomFoods();
    assert.strictEqual(foods.length, 1, 'aucune entrée supplémentaire ne doit être créée');
    assert.strictEqual(foods[0].id, 'c_existing', 'l\'aliment existant doit être réutilisé tel quel');
    assert.strictEqual(foods[0].name, 'Ancien nom', 'la définition existante ne doit pas être écrasée par un nouveau scan');
  });

  await test('foodId — l\'entrée logEntries créée à la confirmation référence bien food.id du catalogue', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    await simulateScan(sandbox, '1111111111111', async () => offResponseFound());
    const food = sandbox.__getCustomFoods()[0];
    // Simule la saisie utilisateur puis le clic sur "Ajouter à Déjeuner".
    fakeDom.elements.get('scanQtyInput').value = '150';
    fakeDom.elements.get('scanQtyConfirm').onclick();
    const entries = sandbox.__getLogEntries();
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].foodId, food.id, 'logEntries doit référencer le foodId du catalogue, pas rester orphelin');
    assert.strictEqual(entries[0].source, 'scan');
    assert.strictEqual(entries[0].grams, 150);
    assert.strictEqual(Math.round(entries[0].kcal), Math.round(165 * 1.5));
    assert.strictEqual(sandbox.__getRenderCallCount(), 1);
  });

  await test('Cas C — kcal absente : aucun ajout au catalogue, message distinct de "introuvable"', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    await simulateScan(sandbox, '2222222222222', async () => offResponseFoundNoKcal());
    assert.strictEqual(sandbox.__getCustomFoods().length, 0, 'aucune entrée ne doit être créée sans kcal connue');
    assert.strictEqual(sandbox.__openCustomFoodModalCalls.length, 1, 'repli sur la création manuelle existante');
    const lastToast = sandbox.__toasts[sandbox.__toasts.length - 1];
    assert.ok(lastToast, 'un toast doit informer l\'utilisateur');
    assert.notStrictEqual(lastToast.msg, 'Produit introuvable, ajoute-le manuellement.', 'le message doit refléter que le produit a été trouvé, contrairement au cas D');
    assert.ok(/insuffisant/i.test(lastToast.msg), 'le message doit mentionner des données insuffisantes');
  });

  await test('Cas D — produit inconnu (status 0) : comportement inchangé, aucun ajout catalogue', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    await simulateScan(sandbox, '9999999999999', async () => offResponseNotFound());
    assert.strictEqual(sandbox.__getCustomFoods().length, 0);
    assert.strictEqual(sandbox.__openCustomFoodModalCalls.length, 1);
    const lastToast = sandbox.__toasts[sandbox.__toasts.length - 1];
    assert.strictEqual(lastToast.msg, 'Produit introuvable, ajoute-le manuellement.', 'le message "introuvable" existant ne doit pas changer');
  });

  await test('Cas E — erreur réseau : aucun ajout catalogue, aucune donnée partielle persistée', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    await simulateScan(sandbox, '5555555555555', async () => { throw new Error('network down'); });
    assert.strictEqual(sandbox.__getCustomFoods().length, 0, 'aucune entrée catalogue ne doit être créée sur erreur réseau');
    assert.strictEqual(sandbox.__openCustomFoodModalCalls.length, 0, 'le chemin erreur réseau ne doit pas se rabattre sur la création manuelle (comportement existant)');
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.strictEqual(statusEl.textContent, 'Erreur réseau, réessaie.');
  });

  await test('Second scan du même barcode (deux sessions scanner distinctes) : un seul aliment catalogue, même foodId réutilisable', async () => {
    const fakeDom1 = makeFakeDom();
    const sandbox1 = loadScannerSandbox(fakeDom1, { customFoods: [] });
    await simulateScan(sandbox1, '7777777777777', async () => offResponseFound());
    const foodsAfterFirst = sandbox1.__getCustomFoods();
    assert.strictEqual(foodsAfterFirst.length, 1);

    const fakeDom2 = makeFakeDom();
    const sandbox2 = loadScannerSandbox(fakeDom2, { customFoods: foodsAfterFirst });
    await simulateScan(sandbox2, '7777777777777', async () => offResponseFound());
    const foodsAfterSecond = sandbox2.__getCustomFoods();
    assert.strictEqual(foodsAfterSecond.length, 1, 'un seul produit catalogue après deux scans du même code-barres');
    assert.strictEqual(foodsAfterSecond[0].id, foodsAfterFirst[0].id, 'le même foodId doit être proposé au second scan');

    // Les deux scans doivent pouvoir chacun donner lieu à un repas distinct,
    // référençant le même foodId.
    fakeDom1.elements.get('scanQtyInput').value = '100';
    fakeDom1.elements.get('scanQtyConfirm').onclick();
    fakeDom2.elements.get('scanQtyInput').value = '120';
    fakeDom2.elements.get('scanQtyConfirm').onclick();
    assert.strictEqual(sandbox1.__getLogEntries().length, 1);
    assert.strictEqual(sandbox2.__getLogEntries().length, 1);
    assert.strictEqual(sandbox1.__getLogEntries()[0].foodId, sandbox2.__getLogEntries()[0].foodId, 'même foodId pour les deux repas issus du même produit scanné');
  });

  await test('Détections concurrentes : une seconde détection pendant un lookup en vol ne crée pas de doublon', async () => {
    const fakeDom = makeFakeDom();
    let resolveFetch;
    const pending = new Promise((r) => { resolveFetch = r; });
    const sandbox = loadScannerSandbox(fakeDom, { customFoods: [] });
    sandbox.fetch = async () => pending;
    vm.runInContext('fetch = this.fetch;', sandbox);
    const cb = setupScanner(sandbox);
    const first = cb({ codeResult: { code: '4444444444444' } });
    // Seconde détection (code différent) pendant que le premier lookup est encore en vol.
    const second = cb({ codeResult: { code: '4444444444440' } });
    resolveFetch(offResponseFound());
    await first;
    await second;
    await new Promise((r) => setTimeout(r, 0));
    assert.strictEqual(sandbox.__getCustomFoods().length, 1, 'la seconde détection pendant le lookup en vol doit être ignorée (garde processing)');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
