// Tests ciblés — P2.4-03, seconde passe (review Archiviste, audit Phase 2.4) :
// customFoods, recipeBooks et shoppingList présentent la même classe de
// vulnérabilité que workoutPresets/recipes/favSports déjà corrigés (élément
// non-objet dans un tableau parcouru sans garde par le rendu) :
//   - customFoods : viewSettings() accède f.name/f.kcal/f.protein/f.carbs/f.fat
//     sans garde sur chaque élément.
//   - recipeBooks : orphanRecipes() (recipeBooks.map(b=>b.id)) et
//     recipeBookCard() (book.id/book.name) sans garde.
//   - shoppingList : dashboardGrid() (vue par défaut au démarrage !) et
//     viewShoppingList() font shoppingList.filter(x=>!x.checked) sans garde.
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

// ===================== customFoods =====================

test('customFoods — tableau valide : toutes conservées', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods([
    { id:'c1', name:'Poke bowl', kcal:150, protein:10, carbs:20, fat:5 },
    { id:'c2', name:'Barre maison', kcal:300, protein:5, carbs:40, fat:10 },
  ]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('customFoods — élément valide conservé', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods([{ id:'c1', name:'Poke bowl', kcal:150, protein:10, carbs:20, fat:5 }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
});

test('customFoods — null rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods([null, { id:'c1', name:'OK', kcal:100, protein:1, carbs:1, fat:1 }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('customFoods — scalaire (chaîne) rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods(['Poke bowl', { id:'c1', name:'OK', kcal:100, protein:1, carbs:1, fat:1 }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('customFoods — mélange valide/invalide : ne rejette pas toute la collection', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods([
    { id:'c1', name:'OK1', kcal:100, protein:1, carbs:1, fat:1 },
    42,
    null,
    { id:'c2', name:'OK2', kcal:200, protein:2, carbs:2, fat:2 },
  ]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 2);
});

test('customFoods — preuve du crash évité : viewSettings() ne plante jamais après import corrompu', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedCustomFoods([null, { id:'c1', name:'OK', kcal:100, protein:1, carbs:1, fat:1 }]);`, sandbox);
  vm.runInContext('customFoods = this.__r.entries;', sandbox);
  let html;
  assert.doesNotThrow(() => { html = vm.runInContext('viewSettings();', sandbox); }, 'viewSettings() ne doit jamais planter (avant ce correctif : TypeError sur f.name)');
  assert.strictEqual(typeof html, 'string');
});

// ===================== recipeBooks =====================

test('recipeBooks — tableau valide : tous conservés', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([{ id:'b1', name:'Mes recettes' }, { id:'b2', name:'Desserts' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('recipeBooks — livre valide conservé', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([{ id:'b1', name:'Mes recettes' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
});

test('recipeBooks — null rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([null, { id:'b1', name:'OK' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('recipeBooks — scalaire (nombre) rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([7, { id:'b1', name:'OK' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('recipeBooks — mélange valide/invalide : livres valides conservés', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([{ id:'b1', name:'OK1' }, null, 'x', { id:'b2', name:'OK2' }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 2);
});

test('recipeBooks — preuve du crash évité : orphanRecipes() ne plante jamais après import corrompu', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([null, { id:'b1', name:'OK' }]);`, sandbox);
  vm.runInContext('recipeBooks = this.__r.entries; recipes = [{id:"r1", name:"Tarte", ingredients:[], bookId:null}];', sandbox);
  let orphans;
  assert.doesNotThrow(() => { orphans = vm.runInContext('orphanRecipes();', sandbox); }, 'orphanRecipes() ne doit jamais planter (avant ce correctif : TypeError sur b.id)');
  assert.ok(Array.isArray(orphans));
});

test('recipeBooks — preuve du crash évité : viewRecipes() (recipeBookCard incluse) ne plante jamais', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedRecipeBooks([null, { id:'b1', name:'OK' }]);`, sandbox);
  vm.runInContext('recipeBooks = this.__r.entries;', sandbox);
  let html;
  assert.doesNotThrow(() => { html = vm.runInContext('viewRecipes();', sandbox); }, 'viewRecipes() ne doit jamais planter (avant ce correctif : TypeError sur book.id/book.name)');
  assert.strictEqual(typeof html, 'string');
});

// ===================== shoppingList =====================

test('shoppingList — tableau valide : tous conservés', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedShoppingList([{ id:'s1', name:'Tomates', checked:false }, { id:'s2', name:'Pain', checked:true }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 0);
});

test('shoppingList — élément valide conservé', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedShoppingList([{ id:'s1', name:'Tomates', checked:false }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
});

test('shoppingList — null rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedShoppingList([null, { id:'s1', name:'OK', checked:false }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('shoppingList — scalaire (chaîne) rejeté', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedShoppingList(['Tomates', { id:'s1', name:'OK', checked:false }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 1);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

test('shoppingList — mélange valide/invalide : conservés séparément du rejet', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedShoppingList([{ id:'s1', name:'OK1', checked:false }, null, 3, { id:'s2', name:'OK2', checked:true }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 2);
  assert.strictEqual(sandbox.__r.rejectedCount, 2);
});

// ----- Scénario bout-en-bout explicitement demandé : import shoppingList corrompue
// -> sauvegarde -> nouveau contexte -> render() -> dashboard (viewToday()), sans
// crash. -----
function extractImportLogic() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'const data = JSON.parse(reader.result);';
  const start = uiSrc.indexOf(marker);
  const end = uiSrc.indexOf('save(); render();', start);
  assert.ok(start !== -1 && end !== -1, 'le handler importFile.onchange doit toujours exister sous cette forme dans js/ui.js');
  return uiSrc.slice(start + marker.length, end);
}
function runImport(sandbox, data) {
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} \n save(); })(${JSON.stringify(data)});`, sandbox);
}

test('Bout-en-bout — import shoppingList corrompue -> sauvegarde -> nouveau contexte -> render() -> viewToday() (dashboard) sans crash', () => {
  const store = new Map();
  const { sandbox: importSandbox } = loadKaloSandbox(store);
  runImport(importSandbox, {
    shoppingList: [
      { id: 's1', name: 'Tomates', checked: false },
      null,
      'corruption',
      { id: 's2', name: 'Pain', checked: true },
    ],
  });
  const persisted = JSON.parse(store.get('ct_shoppingList'));
  assert.strictEqual(persisted.length, 2, 'seuls les 2 articles valides doivent être persistés');
  assert.strictEqual(JSON.stringify(persisted.map(x => x.id)), JSON.stringify(['s1', 's2']));

  // Nouveau contexte / reload : sandbox complètement séparé relisant le même store.
  const { sandbox: reloaded } = loadKaloSandbox(store);
  vm.runInContext('this.__sl = shoppingList;', reloaded);
  assert.strictEqual(reloaded.__sl.length, 2, 'shoppingList doit être rechargée avec seulement les articles valides après reload');

  let todayHtml;
  assert.doesNotThrow(() => {
    todayHtml = vm.runInContext('viewToday();', reloaded);
  }, 'viewToday() (dashboard, vue par défaut au démarrage) ne doit jamais planter après un import de shoppingList corrompu');
  assert.strictEqual(typeof todayHtml, 'string');

  let shopHtml;
  assert.doesNotThrow(() => {
    shopHtml = vm.runInContext('viewShoppingList();', reloaded);
  }, 'viewShoppingList() ne doit jamais planter non plus');
  assert.strictEqual(typeof shopHtml, 'string');
});

// ----- Régression combinée : les 3 corrections de la seconde passe cohabitent avec
// celles déjà validées (P2.4-01/02, workoutPresets/recipes/favSports) sur un même
// import mixte, sans interférence. -----
test('Régression — import mixte (toutes structures corrompues à la fois) : chaque compteur de rejet reste indépendant', () => {
  const store = new Map();
  const { sandbox } = loadKaloSandbox(store);
  runImport(sandbox, {
    weightEntries: [{ id: 'w1', date: '2026-09-18', weight: 75 }, { id: 'w2', weight: -5 }],
    logEntries: [{ id: 'l1', date: '2026-09-18', type: 'meal', kcal: 500, protein: 1, carbs: 1, fat: 1 }, { id: 'l2', type: 'inconnu' }],
    workoutPresets: [{ id: 'p1', name: 'OK', type: 'velo', params: { effort: 'leger' } }, { id: 'p2', name: 'Bad', type: 'tapis' }],
    recipes: [{ id: 'r1', name: 'OK', ingredients: [] }, { id: 'r2', name: 'Bad' }],
    favSports: [{ type: 'tapis' }, null],
    customFoods: [{ id: 'c1', name: 'OK', kcal: 1, protein: 1, carbs: 1, fat: 1 }, null],
    recipeBooks: [{ id: 'b1', name: 'OK' }, 'bad'],
    shoppingList: [{ id: 's1', name: 'OK', checked: false }, 42],
  });
  assert.strictEqual(JSON.parse(store.get('ct_weight')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_log')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_wpresets')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_recipes')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_favSports')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_customFoods')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_recipeBooks')).length, 1);
  assert.strictEqual(JSON.parse(store.get('ct_shoppingList')).length, 1);

  const { sandbox: reloaded } = loadKaloSandbox(store);
  assert.doesNotThrow(() => vm.runInContext('viewToday(); viewSettings(); viewRecipes(); viewWorkouts(); viewShoppingList(); viewWeight();', reloaded));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
