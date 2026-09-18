// Test ciblé — BUG-007 (audit Phase 2.1) : les suppressions d'entrée de journal
// ([data-del]), d'aliment personnalisé ([data-delfood]) et de préréglage de séance
// ([data-delpreset]) s'exécutaient instantanément au clic, sans confirm().
//
// Comme pour tests/import-validation.test.js : on extrait le corps réel de chaque
// handler depuis js/ui.js (pas une réimplémentation séparée) et on le rejoue dans
// un bac à sable Node (`vm`) chargeant le vrai js/core.js, avec un stub de
// `confirm()` contrôlable et un faux bouton `b` portant le bon `dataset`.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function extractHandlerBody(marker) {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const idx = uiSrc.indexOf(marker);
  assert.ok(idx !== -1, `handler introuvable dans js/ui.js : ${marker}`);
  const bodyStart = uiSrc.indexOf('{', uiSrc.indexOf('=>{', idx)) + 1;
  // On s'arrête juste après le save() de ce handler, sans aller jusqu'à render() : le
  // test porte sur l'intégrité des données (confirm() gèle bien la mutation d'état +
  // la persistance), pas sur le rendu DOM qui suit — appeler le vrai render() ici
  // nécessiterait de stubber l'intégralité du DOM de l'app, hors propos pour ce bug.
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

test('[data-del] — confirmation acceptée : l\'entrée de journal est supprimée', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ logEntries=v; };`, sandbox);
  sandbox.__set([{ id: 'e1', date: '2026-09-18', type: 'meal', kcal: 100, protein: 0, carbs: 0, fat: 0 }]);
  sandbox.setConfirmReturn(true);
  runHandler(sandbox, "document.querySelectorAll('[data-del]')", 'del', 'e1');
  vm.runInContext(`this.__le = logEntries;`, sandbox);
  assert.strictEqual(sandbox.__le.length, 0, 'confirmation acceptée -> suppression effective');
});

test('[data-del] — confirmation refusée : aucune suppression, rien de persisté', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ logEntries=v; };`, sandbox);
  sandbox.__set([{ id: 'e1', date: '2026-09-18', type: 'meal', kcal: 100, protein: 0, carbs: 0, fat: 0 }]);
  sandbox.setConfirmReturn(false);
  runHandler(sandbox, "document.querySelectorAll('[data-del]')", 'del', 'e1');
  vm.runInContext(`this.__le = logEntries;`, sandbox);
  assert.strictEqual(sandbox.__le.length, 1, 'confirmation refusée -> aucune modification persistée');
});

test('[data-delfood] — confirmation acceptée : aliment personnalisé supprimé', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ customFoods=v; };`, sandbox);
  sandbox.__set([{ id: 'f1', name: 'Test', kcal: 100, protein: 1, carbs: 1, fat: 1 }]);
  sandbox.setConfirmReturn(true);
  runHandler(sandbox, "document.querySelectorAll('[data-delfood]')", 'delfood', 'f1');
  vm.runInContext(`this.__cf = customFoods;`, sandbox);
  assert.strictEqual(sandbox.__cf.length, 0);
});

test('[data-delfood] — confirmation refusée : aliment personnalisé conservé', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ customFoods=v; };`, sandbox);
  sandbox.__set([{ id: 'f1', name: 'Test', kcal: 100, protein: 1, carbs: 1, fat: 1 }]);
  sandbox.setConfirmReturn(false);
  runHandler(sandbox, "document.querySelectorAll('[data-delfood]')", 'delfood', 'f1');
  vm.runInContext(`this.__cf = customFoods;`, sandbox);
  assert.strictEqual(sandbox.__cf.length, 1);
});

test('[data-delpreset] — confirmation acceptée : préréglage supprimé', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ workoutPresets=v; };`, sandbox);
  sandbox.__set([{ id: 'p1', name: 'Preset', type: 'tapis', params: {} }]);
  sandbox.setConfirmReturn(true);
  runHandler(sandbox, "document.querySelectorAll('[data-delpreset]')", 'delpreset', 'p1');
  vm.runInContext(`this.__wp = workoutPresets;`, sandbox);
  assert.strictEqual(sandbox.__wp.length, 0);
});

test('[data-delpreset] — confirmation refusée : préréglage conservé', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`this.__set=(v)=>{ workoutPresets=v; };`, sandbox);
  sandbox.__set([{ id: 'p1', name: 'Preset', type: 'tapis', params: {} }]);
  sandbox.setConfirmReturn(false);
  runHandler(sandbox, "document.querySelectorAll('[data-delpreset]')", 'delpreset', 'p1');
  vm.runInContext(`this.__wp = workoutPresets;`, sandbox);
  assert.strictEqual(sandbox.__wp.length, 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
