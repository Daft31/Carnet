// Tests ciblés — P2.4-03 (audit Phase 2.4) : sur les 7 tableaux importés inspectés
// (customFoods, workoutPresets, recipes, recipeBooks, shoppingList, favSports,
// favorites), seuls workoutPresets/recipes/favSports montrent un risque de CRASH
// démontré par lecture du code de rendu — voir les commentaires au-dessus de
// sanitizeImportedWorkoutPresets()/sanitizeImportedRecipes()/
// sanitizeImportedFavSports() dans js/core.js, et le rapport de correctif pour le
// détail des 4 structures volontairement non modifiées.
//
// Même approche vm que les autres fichiers de tests/.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadKaloSandbox(store = new Map()) {
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
  return { sandbox, store };
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

// ===== workoutPresets =====

test('workoutPresets — préréglage type reconnu ("tapis") sans params : rejeté (aurait planté viewSettings())', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWorkoutPresets([{ id:'p1', name:'Course', type:'tapis' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 0);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('workoutPresets — préréglage type reconnu avec params objet valide : conservé', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWorkoutPresets([{ id:'p1', name:'Course', type:'tapis', params:{vitesse:8,pente:2} }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('workoutPresets — type non reconnu sans params : conservé (ne plante rien dans viewSettings(), pas de sur-rejet)', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWorkoutPresets([{ id:'p1', name:'Mystère', type:'yoga' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1, 'un type inconnu ne déclenche jamais l\'accès à p.params dans viewSettings(), donc pas de risque à conserver l\'entrée');
});

test('workoutPresets — élément non-objet (null) : rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWorkoutPresets([null, { id:'p1', name:'Vélo', type:'velo', params:{effort:'modere'} }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('workoutPresets — preuve du crash évité : viewSettings() ne plante jamais après import corrompu', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWorkoutPresets([
    { id:'bad', name:'Cassé', type:'club' },
    { id:'good', name:'OK', type:'sport', params:{sport:'course', sportIntensity:'modere'} },
  ]);`, sandbox);
  vm.runInContext('workoutPresets = this.__r.entries;', sandbox);
  let html;
  assert.doesNotThrow(() => { html = vm.runInContext('viewSettings();', sandbox); }, 'viewSettings() ne doit jamais planter (avant ce correctif : TypeError sur p.params.sport)');
  assert.strictEqual(typeof html, 'string');
});

// ===== recipes =====

test('recipes — sans ingredients (tableau) : rejetée (aurait planté recipeRow()/viewRecipes())', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipes([{ id:'r1', name:'Tarte', bookId:null }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 0);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('recipes — ingredients non-tableau (chaîne) : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipes([{ id:'r1', name:'Tarte', ingredients:'farine, sucre' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 0);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('recipes — ingredients tableau (même vide) : conservée', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipes([{ id:'r1', name:'Tarte', ingredients:[] }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('recipes — preuve du crash évité : viewRecipes() ne plante jamais après import corrompu', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipes([
    { id:'bad', name:'Cassée' },
    { id:'good', name:'OK', ingredients:[{name:'Farine', qty:'200g'}], bookId:null },
  ]);`, sandbox);
  vm.runInContext('recipes = this.__r.entries;', sandbox);
  let html;
  assert.doesNotThrow(() => { html = vm.runInContext('viewRecipes();', sandbox); }, 'viewRecipes() ne doit jamais planter (avant ce correctif : TypeError sur r.ingredients.length)');
  assert.strictEqual(typeof html, 'string');
});

// ===== favSports =====

test('favSports — élément non-objet (null) : rejeté (aurait planté viewWorkouts())', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedFavSports([null, {type:'tapis'}]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('favSports — élément chaîne (corruption) : rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedFavSports(['tapis', {type:'velo'}]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('favSports — objets valides conservés tels quels', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedFavSports([{type:'tapis'}, {type:'sport', sport:'course'}]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('favSports — preuve du crash évité : viewWorkouts() ne plante jamais après import corrompu', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedFavSports([null, {type:'velo'}]);`, sandbox);
  vm.runInContext('favSports = this.__r.entries;', sandbox);
  let html;
  assert.doesNotThrow(() => { html = vm.runInContext('viewWorkouts();', sandbox); }, 'viewWorkouts() ne doit jamais planter (avant ce correctif : TypeError sur fav.type dans favSportKey())');
  assert.strictEqual(typeof html, 'string');
});

// ===== Bout-en-bout via le vrai handler d'import (js/ui.js) =====

function extractImportLogic() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'const data = JSON.parse(reader.result);';
  const start = uiSrc.indexOf(marker);
  const end = uiSrc.indexOf('save(); render();', start);
  assert.ok(start !== -1 && end !== -1);
  return uiSrc.slice(start + marker.length, end);
}
function runImport(sandbox, data) {
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} \n save(); })(${JSON.stringify(data)});`, sandbox);
}

test('Bout-en-bout — import avec workoutPresets/recipes/favSports corrompus : persistance propre, aucun crash après reload', () => {
  const store = new Map();
  const { sandbox: importSandbox } = loadKaloSandbox(store);
  runImport(importSandbox, {
    workoutPresets: [{ id: 'bad', name: 'X', type: 'renfo' }, { id: 'good', name: 'Y', type: 'velo', params: { effort: 'leger' } }],
    recipes: [{ id: 'bad', name: 'X' }, { id: 'good', name: 'Y', ingredients: [] }],
    favSports: [null, { type: 'tapis' }],
  });
  assert.strictEqual(JSON.parse(store.get('ct_wpresets')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_recipes')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_favSports')).length, 1);

  const { sandbox: reloaded } = loadKaloSandbox(store);
  assert.doesNotThrow(() => vm.runInContext('viewSettings(); viewRecipes(); viewWorkouts();', reloaded));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
