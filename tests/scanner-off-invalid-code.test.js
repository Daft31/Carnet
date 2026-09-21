// Test ciblé — CP-10 (audit QA Phase 2.6, T-P2-2) : comportement du scanner
// (js/scanner.js) quand le code transmis à Open Food Facts est invalide/introuvable.
// Aucune caméra réelle, aucun réseau réel : seule la frontière externe (fetch())
// est stubbée, tout le reste (lookupBarcode(), startQuagga()/onDetected()) est le
// vrai code chargé depuis js/core.js + js/ui.js + js/scanner.js.
//
// CONSTAT RÉEL (lecture de js/scanner.js, documenté ici, pas corrigé) : le code
// actuel NE VALIDE PAS explicitement le format d'un code-barres avant de
// l'envoyer à Open Food Facts (`fetch(.../product/${barcode}.json)`, aucune regex,
// aucune longueur minimale) — "invalide" est donc entièrement délégué à la réponse
// de la source externe : soit `{status:0}` / pas de `product` (code bien formé mais
// inconnu d'OFF), soit un vrai échec réseau (res.ok===false). Les deux chemins sont
// couverts ci-dessous tels quels, sans imposer une règle de validation qui n'existe
// pas dans le produit.
//
// Autre constat réel, documenté sans le corriger : un résultat "introuvable"
// (`data.status===0`) n'est PAS mis en cache (`offCache.set()` n'est atteint que sur
// un vrai produit) — contrairement à un produit trouvé, chaque nouveau scan du même
// code introuvable refait un appel réseau.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      const classes = new Set();
      elements.set(id, {
        id, value: '', innerHTML: '', className: '', style: {}, disabled: false,
        classList: {
          add(c) { classes.add(c); }, remove(c) { classes.delete(c); },
          toggle(c, f) { const on = f === undefined ? !classes.has(c) : f; if (on) classes.add(c); else classes.delete(c); },
          contains(c) { return classes.has(c); },
        },
        addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn); },
        _dispatch(type, evt) { (listeners[type] || []).forEach(fn => fn(evt || { target: elements.get(id) })); },
        onclick: null,
      });
    }
    return elements.get(id);
  }
  return {
    getElementById: elFor,
    querySelectorAll: () => [],
    body: { contains: () => true },
    head: { appendChild() {} },
    createElement: () => ({ set src(v) {}, onload: null, onerror: null }),
  };
}

function loadSandbox(fetchImpl) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  const sandbox = {
    localStorage, console, navigator: { userAgent: 'node-test' },
    document,
    window: {},
    fetch: fetchImpl,
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  sandbox.window.window = sandbox.window; // scanner.js lit `window.Quagga` via le global `window`
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8'), sandbox, { filename: 'js/ui.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'scanner.js'), 'utf8'), sandbox, { filename: 'js/scanner.js' });
  vm.runInContext('render = function(){};', sandbox);
  sandbox.__document = document;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}
async function testAsync(name, fn) {
  try { await fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

async function main() {

// ===================== lookupBarcode() direct =====================

await testAsync("Code inconnu d'Open Food Facts (réponse 200, status:0) : lookupBarcode() renvoie null, sans exception, un seul appel réseau vers l'URL attendue", async () => {
  let fetchCalls = [];
  const sandbox = loadSandbox(async (url) => {
    fetchCalls.push(url);
    return { ok: true, json: async () => ({ status: 0 }) };
  });
  vm.runInContext(`this.__p = lookupBarcode('0000000000000').then(p => { this.__result = p; });`, sandbox);
  await sandbox.__p;
  assert.strictEqual(sandbox.__result, null, "un code introuvable doit renvoyer null, jamais un produit fantôme");
  assert.strictEqual(fetchCalls.length, 1);
  assert.strictEqual(fetchCalls[0], 'https://world.openfoodfacts.org/api/v0/product/0000000000000.json');
});

await testAsync('Réponse OFF sans champ `product` du tout (même avec status truthy) : traitée comme introuvable, jamais un objet produit à moitié rempli', async () => {
  const sandbox = loadSandbox(async () => ({ ok: true, json: async () => ({ status: 1 }) }));
  vm.runInContext(`this.__p = lookupBarcode('123').then(p => { this.__result = p; });`, sandbox);
  await sandbox.__p;
  assert.strictEqual(sandbox.__result, null);
});

await testAsync("Constat documenté : aucune validation de FORMAT du code n'existe — un code manifestement non numérique est envoyé tel quel à Open Food Facts, qui décide seul", async () => {
  let fetchCalls = [];
  const sandbox = loadSandbox(async (url) => { fetchCalls.push(url); return { ok: true, json: async () => ({ status: 0 }) }; });
  vm.runInContext(`this.__p = lookupBarcode('pas-un-code-barre!!').then(p => { this.__result = p; });`, sandbox);
  await sandbox.__p;
  assert.strictEqual(fetchCalls[0], 'https://world.openfoodfacts.org/api/v0/product/pas-un-code-barre!!.json', "aucune regex/longueur ne filtre le code avant l'appel réseau : comportement réel, pas une règle imposée par le test");
  assert.strictEqual(sandbox.__result, null);
});

await testAsync('Produit trouvé mais nutriments absents du tout (format OFF inattendu) : lookupBarcode() ne plante jamais, renvoie 0 plutôt que NaN pour chaque valeur manquante', async () => {
  const sandbox = loadSandbox(async () => ({ ok: true, json: async () => ({ status: 1, product: { product_name: 'Produit sans nutriments' } }) }));
  vm.runInContext(`this.__p = lookupBarcode('111').then(p => { this.__result = p; });`, sandbox);
  await sandbox.__p;
  const r = sandbox.__result;
  assert.strictEqual(r.name, 'Produit sans nutriments');
  assert.strictEqual(r.kcal, 0);
  assert.strictEqual(r.protein, 0);
  assert.strictEqual(r.carbs, 0);
  assert.strictEqual(r.fat, 0);
  assert.ok(Number.isFinite(r.kcal), 'jamais de NaN propagé vers l\'aperçu/la sauvegarde');
});

await testAsync('Échec réseau réel (res.ok=false, ex. 404/500) : lookupBarcode() rejette explicitement, jamais un null silencieux confondu avec "introuvable"', async () => {
  const sandbox = loadSandbox(async () => ({ ok: false, json: async () => ({}) }));
  let threw = null;
  vm.runInContext(`this.__p = lookupBarcode('222').catch(e => { this.__err = e.message; });`, sandbox);
  await sandbox.__p;
  assert.strictEqual(sandbox.__err, 'Erreur réseau Open Food Facts', 'une vraie erreur réseau est un cas distinct de "produit introuvable" (null), jamais confondu côté appelant');
});

await testAsync("Constat documenté : un résultat \"introuvable\" n'est jamais mis en cache — un second scan du même code refait un appel réseau (contrairement à un produit trouvé)", async () => {
  let fetchCalls = 0;
  const sandbox = loadSandbox(async () => { fetchCalls++; return { ok: true, json: async () => ({ status: 0 }) }; });
  vm.runInContext(`this.__p = lookupBarcode('333').then(()=>lookupBarcode('333'));`, sandbox);
  await sandbox.__p;
  assert.strictEqual(fetchCalls, 2, "offCache.set() n'est jamais atteint sur le chemin \"introuvable\" : comportement réel, pas un bug corrigé ici");
});

// ===================== Chemin réel onDetected() : aucune pollution du catalogue =====================

await testAsync('onDetected() sur un code introuvable : aucune entrée créée dans logEntries, aucun aliment créé dans customFoods, la modale se ferme, openCustomFoodModal() est proposée (jamais un ajout automatique)', async () => {
  const sandbox = loadSandbox(async () => ({ ok: true, json: async () => ({ status: 0 }) }));
  let onDetectedCb = null;
  const quagga = {
    init(cfg, cb) { cb(null); },
    start() {},
    onDetected(fn) { onDetectedCb = fn; },
    stop() {},
  };
  vm.runInContext('this.__setQuagga = (q) => { window.Quagga = q; Quagga = q; };', sandbox);
  sandbox.__setQuagga(quagga);

  vm.runInContext(`
    this.__closeModalCalls = 0; closeModal = function(){ this.__closeModalCalls++; };
    this.__toastCalls = []; toast = function(msg, kind){ this.__toastCalls.push({msg, kind}); };
    this.__customFoodModalCalls = 0; openCustomFoodModal = function(){ this.__customFoodModalCalls++; };
  `, sandbox);

  const statusEl = sandbox.__document.getElementById('scannerStatus');
  vm.runInContext(`startQuagga(this.__document.getElementById('scannerStatus'));`, sandbox);
  assert.ok(onDetectedCb, 'onDetected doit avoir enregistré un callback réel');

  await onDetectedCb({ codeResult: { code: '9999999999999' } });

  vm.runInContext('this.__le = JSON.stringify(logEntries); this.__cf = JSON.stringify(customFoods);', sandbox);
  assert.strictEqual(sandbox.__le, '[]', 'un code introuvable ne doit jamais créer d\'entrée de repas');
  assert.strictEqual(sandbox.__cf, '[]', 'un code introuvable ne doit jamais créer un aliment personnalisé automatiquement (le catalogue n\'est pas pollué)');
  assert.strictEqual(sandbox.__closeModalCalls, 1, 'la modale scanner doit se fermer');
  assert.strictEqual(sandbox.__customFoodModalCalls, 1, 'l\'utilisateur doit se voir proposer un ajout manuel, jamais un ajout silencieux');
  assert.strictEqual(JSON.stringify(sandbox.__toastCalls[0]), JSON.stringify({ msg: 'Produit introuvable, ajoute-le manuellement.', kind: 'warn' }));
});

await testAsync('onDetected() sur un échec réseau réel : aucune entrée créée, statut d\'erreur affiché, chemin reste déterministe (pas d\'exception non gérée)', async () => {
  const sandbox = loadSandbox(async () => ({ ok: false, json: async () => ({}) }));
  let onDetectedCb = null;
  const quagga = { init(cfg, cb) { cb(null); }, start() {}, onDetected(fn) { onDetectedCb = fn; }, stop() {} };
  vm.runInContext('this.__setQuagga = (q) => { window.Quagga = q; Quagga = q; };', sandbox);
  sandbox.__setQuagga(quagga);
  vm.runInContext(`this.__closeModalCalls = 0; closeModal = function(){ this.__closeModalCalls++; };`, sandbox);

  vm.runInContext(`startQuagga(this.__document.getElementById('scannerStatus'));`, sandbox);
  await onDetectedCb({ codeResult: { code: '444' } });

  vm.runInContext('this.__le = JSON.stringify(logEntries);', sandbox);
  assert.strictEqual(sandbox.__le, '[]', 'un échec réseau ne doit jamais créer d\'entrée de repas');
  assert.strictEqual(sandbox.__closeModalCalls, 0, 'la modale reste ouverte pour permettre un nouvel essai (comportement réel : seul le statut est mis à jour)');
  const status = sandbox.__document.getElementById('scannerStatus');
  assert.strictEqual(status.textContent, 'Erreur réseau, réessaie.', 'le statut affiché doit refléter l\'échec réseau, sans exception non gérée qui laisserait le statut figé');
});

}

main().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
});
