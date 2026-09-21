// Test ciblé — CP-08 (audit QA Phase 2.6, T-P1-2) : jusqu'ici l'import était très
// couvert (8 fichiers dédiés), mais l'EXPORT et le roundtrip export->import
// n'avaient aucun test. Ce fichier n'invente pas une sérialisation parallèle : il
// extrait l'expression objet RÉELLE construite par le handler #exportBtn de
// js/ui.js (`JSON.stringify({settings,customFoods,...})`) et la logique RÉELLE du
// handler #importFile.onchange (même technique d'extraction que
// tests/import-validation.test.js), et les enchaîne : un sandbox "source" peuplé
// de données représentatives exporte son état, un second sandbox "cible" (nouvelle
// session, état par défaut) importe le JSON produit, puis on compare les deux.
//
// Champs réellement inclus dans l'export (lus directement dans js/ui.js, pas
// supposés) : settings, customFoods, foodOverrides, favorites, weightEntries,
// profile, workoutPresets, logEntries, todos, shoppingList, recipes, recipeBooks,
// favSports. insightsSeen/calibrationSeen/portionRevealSeen (état UI pur) n'en
// font PAS partie — on ne les teste donc pas ici, ce ne serait pas un vrai trou de
// couverture mais une donnée hors périmètre par choix produit.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function extractExportExpression() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'JSON.stringify(';
  const idx = uiSrc.indexOf('const blob = new Blob([JSON.stringify(');
  assert.ok(idx !== -1, 'le handler #exportBtn doit toujours exister sous cette forme dans js/ui.js');
  const start = idx + uiSrc.slice(idx).indexOf(marker) + marker.length;
  const end = uiSrc.indexOf(',null,2)', start);
  assert.ok(end !== -1, 'la construction JSON.stringify({...},null,2) doit toujours exister');
  return uiSrc.slice(start, end); // l'objet littéral réel exporté, ex: {settings,customFoods,...}
}

function extractImportLogic() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'const data = JSON.parse(reader.result);';
  const start = uiSrc.indexOf(marker);
  const end = uiSrc.indexOf('save(); render();', start);
  assert.ok(start !== -1 && end !== -1, 'le handler importFile.onchange doit toujours exister sous cette forme dans js/ui.js');
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
  return sandbox;
}

// Exécute le VRAI code de construction de l'export dans le sandbox source, et
// renvoie le JSON exact qu'produirait new Blob([JSON.stringify({...},null,2)]).
function exportFromSandbox(sandbox) {
  const expr = extractExportExpression();
  vm.runInContext(`this.__exportJSON = JSON.stringify(${expr}, null, 2);`, sandbox);
  return sandbox.__exportJSON;
}

// Rejoue la logique réelle du handler d'import dans le sandbox cible.
function importIntoSandbox(sandbox, exportedJSON) {
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} })(JSON.parse(${JSON.stringify(exportedJSON)}));`, sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

// Peuple un état "source" représentatif sur les 13 champs réellement exportés,
// avec des valeurs qui passent TOUTES les sanitisations d'import telles quelles
// (aucune correction/rejet attendu) — le roundtrip doit donc être une identité
// exacte, pas juste "une partie survit".
function seedRepresentativeState(sandbox) {
  vm.runInContext(`
    settings = {calorieGoal:2100, proteinGoal:140, carbGoal:210, fatGoal:65};
    customFoods = [{id:'cf1', name:'Houmous maison', kcal:166, protein:8, carbs:14, fat:10}];
    foodOverrides = {apple_0: {kcal:55}};
    favorites = ['apple_0'];
    weightEntries = [{id:'w1', date:'2026-09-10', weight:79.5, bodyFat:18, muscleMass:35, water:55, note:'le matin'}];
    profile = {sex:'F', age:'29', height:'168', activity:'actif', goalWeight:'70', rate:'-0.3'};
    workoutPresets = [{id:'p1', name:'Tapis rapide', type:'tapis', params:{vitesse:12}}];
    logEntries = [
      {id:'m1', date:'2026-09-19', type:'meal', mealSlot:'Déjeuner', foodId:'cf1', foodName:'Houmous maison', grams:150, kcal:249, protein:12, carbs:21, fat:15, time:'12:30', source:'manual', quantitySource:'user'},
      {id:'w1', date:'2026-09-19', type:'workout', workoutType:'tapis', duration:30, kcalBurned:280},
    ];
    todos = [{id:'t1', text:'Acheter du houmous', daily:false, done:false, completedDate:null}];
    shoppingList = [{id:'s1', name:'Pois chiches', checked:false, qty:'1 boîte'}];
    recipes = [{id:'r1', name:'Houmous', ingredients:[{name:'Pois chiches', qty:'400g'}], steps:['Mixer'], servings:4, sourceUrl:null, savedAt:'2026-09-01', bookId:'b1'}];
    recipeBooks = [{id:'b1', name:'Mezze'}];
    favSports = [{type:'tapis'}, {type:'club', sport:'escalade'}];
  `, sandbox);
}

test('Roundtrip complet : chaque champ réellement exporté (13) survit à l\'export -> import à l\'identique dans une nouvelle session', () => {
  const source = loadKaloSandbox();
  seedRepresentativeState(source);
  const exportedJSON = exportFromSandbox(source);

  // "nouvelle session" = un sandbox totalement neuf, état par défaut (comme un
  // navigateur/localStorage vide), pas une réinitialisation en place du même sandbox.
  const target = loadKaloSandbox();
  importIntoSandbox(target, exportedJSON);

  const FIELDS = ['settings','customFoods','foodOverrides','favorites','weightEntries','profile','workoutPresets','logEntries','todos','shoppingList','recipes','recipeBooks','favSports'];
  FIELDS.forEach(field => {
    vm.runInContext(`this.__f = JSON.stringify(${field});`, source);
    const before = source.__f;
    vm.runInContext(`this.__f = JSON.stringify(${field});`, target);
    const after = target.__f;
    assert.strictEqual(after, before, `${field} doit survivre à l'identique au roundtrip export -> import`);
  });
});

test('Roundtrip : aucun champ signalé comme invalide (les données réellement exportées sont toujours acceptées par le propre import de Kalo)', () => {
  const source = loadKaloSandbox();
  seedRepresentativeState(source);
  const exportedJSON = exportFromSandbox(source);

  const target = loadKaloSandbox();
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} \n this.__lastInvalidFields = JSON.stringify(invalidFields); })(JSON.parse(${JSON.stringify(exportedJSON)}));`, target);
  assert.strictEqual(target.__lastInvalidFields, '[]', "un fichier produit par Kalo lui-même ne doit jamais déclencher son propre garde-fou d'import invalide");
});

test('Roundtrip avec un état vide (utilisateur Day 0) : export -> import ne fait planter ni l\'export ni l\'import, tableaux vides préservés', () => {
  const source = loadKaloSandbox(); // état par défaut : tableaux vides
  const exportedJSON = exportFromSandbox(source);
  const target = loadKaloSandbox();
  importIntoSandbox(target, exportedJSON);
  vm.runInContext('this.__le = JSON.stringify(logEntries); this.__we = JSON.stringify(weightEntries);', target);
  assert.strictEqual(target.__le, '[]');
  assert.strictEqual(target.__we, '[]');
});

test('Roundtrip : les champs UI hors export (insightsSeen/calibrationSeen/portionRevealSeen) ne sont jamais dans le JSON exporté', () => {
  const source = loadKaloSandbox();
  seedRepresentativeState(source);
  const exportedJSON = exportFromSandbox(source);
  const parsed = JSON.parse(exportedJSON);
  assert.ok(!('insightsSeen' in parsed), 'insightsSeen est un état UI, volontairement hors export');
  assert.ok(!('calibrationSeen' in parsed), 'calibrationSeen est un état UI, volontairement hors export');
  assert.ok(!('portionRevealSeen' in parsed), 'portionRevealSeen est un état UI, volontairement hors export');
});

test('Import d\'un export contenant un champ invalide (fichier corrompu après export, ex. logEntries écrasé à la main) : rejeté et signalé, comme pour tout autre import invalide — pas de traitement de faveur pour un fichier "auto-exporté"', () => {
  const source = loadKaloSandbox();
  seedRepresentativeState(source);
  const exportedJSON = exportFromSandbox(source);
  const corrupted = JSON.parse(exportedJSON);
  corrupted.logEntries = 'PAS_UN_TABLEAU';

  const target = loadKaloSandbox();
  const logic = extractImportLogic();
  vm.runInContext(`(function(data){ ${logic} \n this.__lastInvalidFields = invalidFields.slice(); })(${JSON.stringify(corrupted)});`, target);
  assert.ok(target.__lastInvalidFields.includes('logEntries'));
  vm.runInContext('this.__le = JSON.stringify(logEntries);', target);
  assert.strictEqual(target.__le, '[]', 'logEntries reste au défaut (nouvelle session), jamais remplacé par la valeur corrompue');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
