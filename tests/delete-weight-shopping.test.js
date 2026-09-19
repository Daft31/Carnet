// Test ciblé — CP-07 (audit QA Phase 2.6, T-P1-3) : étend la couverture de
// suppression déjà existante dans tests/delete-confirmations.test.js
// ([data-del]/[data-delfood]/[data-delpreset], tous gardés par confirm()) aux deux
// chemins de suppression non couverts identifiés par l'audit : la pesée
// ([data-delw]) et l'article de liste de courses ([data-shop-delete]).
//
// ÉCART CONSTATÉ PAR RAPPORT AU PÉRIMÈTRE INITIAL DE L'AUDIT (documenté ici, pas
// corrigé — consigne explicite du lot) : contrairement aux 3 chemins déjà couverts,
// LA LECTURE DU CODE RÉEL (js/ui.js) MONTRE QU'AUCUN DES DEUX HANDLERS CI-DESSOUS
// N'APPELLE confirm() AVANT DE SUPPRIMER :
//   - [data-delw]        : `weightEntries = weightEntries.filter(...); save(); render();`
//   - [data-shop-delete] : `shoppingList = shoppingList.filter(...); save(); render();`
// La suppression y est donc immédiate et inconditionnelle, sans boîte de dialogue.
// Les tests ci-dessous reflètent ce comportement RÉEL (une suppression a bien
// lieu, et cela reste vrai même si un `confirm()` global est présent dans le
// sandbox et configuré pour renvoyer `false` — la preuve que le code ne le
// consulte pas) plutôt que de supposer un garde-fou qui n'existe pas dans le code
// produit. Voir le rapport de ce lot pour le signalement complet à l'Archiviste.
//
// Même pattern d'extraction que tests/delete-confirmations.test.js : on rejoue le
// corps réel du handler extrait de js/ui.js dans un sandbox `vm` chargeant le vrai
// js/core.js, jamais une réimplémentation séparée.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function extractHandlerBody(marker) {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const idx = uiSrc.indexOf(marker);
  assert.ok(idx !== -1, `handler introuvable dans js/ui.js : ${marker}`);
  const bodyStart = uiSrc.indexOf('{', uiSrc.indexOf('=>{', idx)) + 1;
  const saveIdx = uiSrc.indexOf('save();', bodyStart);
  assert.ok(saveIdx !== -1, `save() introuvable après le handler : ${marker}`);
  return uiSrc.slice(bodyStart, saveIdx + 'save();'.length);
}

function loadKaloSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  let confirmReturn = true;
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
    confirm: () => confirmReturn,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  sandbox.setConfirmReturn = (v) => { confirmReturn = v; };
  return sandbox;
}

function runHandler(sandbox, marker, datasetKey, datasetValue) {
  const body = extractHandlerBody(marker);
  vm.runInContext(`(function(b){ ${body} })({ dataset: { ${datasetKey}: ${JSON.stringify(datasetValue)} } });`, sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

// ===================== Poids — [data-delw] =====================

test('[data-delw] — clic : la pesée ciblée est supprimée, les autres conservées', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ weightEntries=v; };`, sandbox);
  sandbox.__set([
    { id: 'w1', date: '2026-09-17', weight: 80.2, bodyFat: null, muscleMass: null, water: null, note: null },
    { id: 'w2', date: '2026-09-18', weight: 80.0, bodyFat: null, muscleMass: null, water: null, note: null },
  ]);
  runHandler(sandbox, "document.querySelectorAll('[data-delw]')", 'delw', 'w1');
  vm.runInContext(`this.__we = weightEntries;`, sandbox);
  assert.strictEqual(sandbox.__we.length, 1, 'la pesée ciblée doit disparaître');
  assert.strictEqual(sandbox.__we[0].id, 'w2', 'aucune entrée fantôme, la seconde pesée reste intacte');
});

test("[data-delw] — ÉCART DOCUMENTÉ : la suppression a lieu même si confirm() est configuré pour refuser (le code réel n'appelle jamais confirm() sur ce chemin, contrairement à [data-del]/[data-delfood]/[data-delpreset])", () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ weightEntries=v; };`, sandbox);
  sandbox.__set([{ id: 'w1', date: '2026-09-18', weight: 80.0, bodyFat: null, muscleMass: null, water: null, note: null }]);
  sandbox.setConfirmReturn(false); // si le code consultait confirm(), la suppression serait bloquée ici
  runHandler(sandbox, "document.querySelectorAll('[data-delw]')", 'delw', 'w1');
  vm.runInContext(`this.__we = weightEntries;`, sandbox);
  assert.strictEqual(sandbox.__we.length, 0, "la suppression a lieu malgré confirm()=false : preuve que [data-delw] ne consulte pas confirm() dans le code actuel");
});

test('[data-delw] — persistance : la suppression est bien écrite dans localStorage (ct_weight)', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ weightEntries=v; };`, sandbox);
  sandbox.__set([
    { id: 'w1', date: '2026-09-17', weight: 80.2, bodyFat: null, muscleMass: null, water: null, note: null },
    { id: 'w2', date: '2026-09-18', weight: 80.0, bodyFat: null, muscleMass: null, water: null, note: null },
  ]);
  runHandler(sandbox, "document.querySelectorAll('[data-delw]')", 'delw', 'w1');
  const stored = JSON.parse(sandbox.localStorage.getItem('ct_weight'));
  assert.strictEqual(stored.length, 1);
  assert.strictEqual(stored[0].id, 'w2');
});

// ===================== ShoppingList — [data-shop-delete] =====================

test('[data-shop-delete] — clic : l\'article ciblé est supprimé, les autres conservés', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ shoppingList=v; };`, sandbox);
  sandbox.__set([
    { id: 's1', name: 'Poulet', checked: false, qty: '1' },
    { id: 's2', name: 'Riz', checked: false, qty: '500g' },
  ]);
  runHandler(sandbox, "document.querySelectorAll('[data-shop-delete]')", 'shopDelete', 's1');
  vm.runInContext(`this.__sl = shoppingList;`, sandbox);
  assert.strictEqual(sandbox.__sl.length, 1);
  assert.strictEqual(sandbox.__sl[0].id, 's2', 'aucun article fantôme, le second article reste intact');
});

test("[data-shop-delete] — ÉCART DOCUMENTÉ : la suppression a lieu même si confirm() est configuré pour refuser (aucun appel confirm() sur ce chemin dans le code réel)", () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ shoppingList=v; };`, sandbox);
  sandbox.__set([{ id: 's1', name: 'Poulet', checked: false, qty: '1' }]);
  sandbox.setConfirmReturn(false);
  runHandler(sandbox, "document.querySelectorAll('[data-shop-delete]')", 'shopDelete', 's1');
  vm.runInContext(`this.__sl = shoppingList;`, sandbox);
  assert.strictEqual(sandbox.__sl.length, 0, "la suppression a lieu malgré confirm()=false : preuve que [data-shop-delete] ne consulte pas confirm() dans le code actuel");
});

test('[data-shop-delete] — persistance : la suppression est bien écrite dans localStorage (ct_shoppingList)', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ shoppingList=v; };`, sandbox);
  sandbox.__set([
    { id: 's1', name: 'Poulet', checked: false, qty: '1' },
    { id: 's2', name: 'Riz', checked: false, qty: '500g' },
  ]);
  runHandler(sandbox, "document.querySelectorAll('[data-shop-delete]')", 'shopDelete', 's1');
  const stored = JSON.parse(sandbox.localStorage.getItem('ct_shoppingList'));
  assert.strictEqual(stored.length, 1);
  assert.strictEqual(stored[0].id, 's2');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
