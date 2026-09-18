// Test ciblé — BUG-002 (audit Phase 2.1) : l'import JSON acceptait n'importe quel
// type pour les champs censés être des tableaux, ce qui pouvait rendre l'app
// définitivement inutilisable au rendu suivant (ex. logEntries non-array fait
// planter entriesFor()/dayTotals() partout, et l'état corrompu est déjà persisté).
//
// On ne réexécute pas ici tout le handler DOM de js/ui.js (FileReader, input file) —
// on extrait sa logique de validation/affectation (les lignes entre `const data =
// JSON.parse(...)` et `save(); render();`) et on l'exerce directement sur un objet
// `data`, contre le VRAI js/core.js chargé en `vm` pour les variables logEntries/etc.
// et la fonction save() réellement utilisée.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ARRAY_FIELDS = ['customFoods','favorites','weightEntries','workoutPresets','logEntries','todos','shoppingList','recipes','recipeBooks','favSports'];

function extractImportLogic() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'const data = JSON.parse(reader.result);';
  const start = uiSrc.indexOf(marker);
  const end = uiSrc.indexOf('save(); render();', start);
  assert.ok(start !== -1 && end !== -1, 'le handler importFile.onchange doit toujours exister sous cette forme dans js/ui.js');
  // On saute la ligne `const data = ...` : `data` est déjà fourni comme paramètre de la
  // fonction dans laquelle ce bloc est rejoué (voir runImport ci-dessous).
  return uiSrc.slice(start + marker.length, end);
}

function loadKaloSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  return sandbox;
}

// Rejoue la logique réelle du handler d'import (extraite de js/ui.js) dans le sandbox,
// avec `data` comme JSON importé — reader.result/JSON.parse déjà résolus ici.
function runImport(sandbox, data) {
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} \n this.__lastInvalidFields = invalidFields; })(${JSON.stringify(data)});`, sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('Import JSON parfaitement valide : tous les champs tableaux acceptés, aucun signalement', () => {
  const sandbox = loadKaloSandbox();
  const validExport = Object.fromEntries(ARRAY_FIELDS.map(k => [k, []]));
  validExport.logEntries = [{ id: 'a', date: '2026-09-18', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 }];
  validExport.settings = { calorieGoal: 2000, proteinGoal: 100, carbGoal: 200, fatGoal: 60 };
  runImport(sandbox, validExport);
  assert.strictEqual(JSON.stringify(sandbox.__lastInvalidFields), '[]');
  vm.runInContext('this.__le = logEntries;', sandbox);
  assert.strictEqual(sandbox.__le.length, 1);
});

test('Import avec logEntries non-tableau : champ ignoré, signalé, aucun crash au rendu suivant', () => {
  const sandbox = loadKaloSandbox();
  // Précondition : l'état courant a une entrée valide.
  vm.runInContext("this.__setLog = (v)=>{ logEntries = v; }; ", sandbox);
  sandbox.__setLog([{ id: 'existing', date: '2026-09-18', type: 'meal', kcal: 300, protein: 5, carbs: 5, fat: 5 }]);
  runImport(sandbox, { logEntries: 'PAS_UN_TABLEAU', customFoods: [] });
  assert.ok(sandbox.__lastInvalidFields.includes('logEntries'));
  // logEntries doit être resté un tableau valide (l'ancien état, jamais remplacé par la string).
  let crashed = false;
  try { vm.runInContext("entriesFor('2026-09-18');", sandbox); } catch (e) { crashed = true; }
  assert.strictEqual(crashed, false, 'entriesFor() ne doit jamais planter après un import invalide');
  vm.runInContext('this.__le = logEntries;', sandbox);
  assert.ok(Array.isArray(sandbox.__le), 'logEntries doit rester un tableau');
});

test('Import avec plusieurs champs invalides : tous listés, les champs valides restants sont quand même appliqués', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: { not: 'an array' },
    todos: 42,
    customFoods: [{ id: 'f1', name: 'Test', kcal: 100, protein: 1, carbs: 1, fat: 1 }],
  });
  const sortedInvalid = Array.from(sandbox.__lastInvalidFields).sort();
  assert.strictEqual(JSON.stringify(sortedInvalid), JSON.stringify(['logEntries', 'todos']));
  vm.runInContext('this.__cf = customFoods;', sandbox);
  assert.strictEqual(sandbox.__cf.length, 1, 'un champ valide à côté de champs invalides doit quand même être importé');
});

test('Import sans le champ logEntries du tout (ancien format d\'export) : ignoré silencieusement, comme avant', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext("this.__setLog = (v)=>{ logEntries = v; }; ", sandbox);
  const existing = [{ id: 'kept', date: '2026-09-18', type: 'meal', kcal: 200, protein: 1, carbs: 1, fat: 1 }];
  sandbox.__setLog(existing);
  runImport(sandbox, { customFoods: [] });
  assert.ok(!sandbox.__lastInvalidFields.includes('logEntries'), 'un champ absent ne doit pas être signalé comme invalide (rétrocompatibilité)');
  vm.runInContext('this.__le = logEntries;', sandbox);
  assert.deepStrictEqual(sandbox.__le, existing, 'logEntries inchangé quand absent du fichier importé');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
