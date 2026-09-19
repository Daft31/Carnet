// Tests ciblés — P2.4-01 (audit Phase 2.4) : l'import JSON ne validait que le
// type tableau de `weightEntries`, jamais la forme de ses éléments. Plusieurs
// vues trient weightEntries avec `b.date.localeCompare(a.date)` : une entrée
// sans `date` (ou non-chaîne) y provoquait un TypeError immédiat au rendu
// suivant (dashboard, onglet Poids), potentiellement dès le prochain
// chargement de l'app après un import corrompu.
//
// Même approche que les fichiers de tests/ existants : pas de dépendance
// ajoutée, on charge le VRAI js/core.js (et, pour le scénario bout-en-bout, le
// VRAI handler d'import extrait de js/ui.js) dans un bac à sable Node (`vm`).

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

function sanitize(sandbox, arr) {
  vm.runInContext(`this.__r = sanitizeImportedWeightEntries(${JSON.stringify(arr)});`, sandbox);
  return sandbox.__r;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

// ----- 1. Nominal -----
test('1. weightEntries nominal : toutes les entrées valides conservées', () => {
  const { sandbox } = loadKaloSandbox();
  const arr = [
    { id: 'w1', date: '2026-09-18', weight: 75.2 },
    { id: 'w2', date: '2026-09-17', weight: 75.5 },
  ];
  const { entries, rejectedCount } = sanitize(sandbox, arr);
  assert.strictEqual(rejectedCount, 0);
  assert.strictEqual(entries.length, 2);
});

// ----- 2. Sans date -----
test('2. Entrée sans date : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', weight: 75 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 3. Date invalide -----
test('3a. Entrée avec date malformée (mauvais format) : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: '18/09/2026', weight: 75 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});
test('3b. Entrée avec date impossible (bon format, valeur invalide, ex. 2026-13-40) : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: '2026-13-40', weight: 75 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});
test('3c. Entrée avec date non-chaîne (nombre) : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: 20260918, weight: 75 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 4. Poids non numérique -----
test('4. Entrée avec weight non numérique (chaîne) : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: '2026-09-18', weight: 'soixante-quinze' }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 5. weight = Infinity -----
test('5. Entrée avec weight = Infinity : rejetée (Number.isFinite, pas juste typeof number)', () => {
  const { sandbox } = loadKaloSandbox();
  vm.runInContext(`this.__r = sanitizeImportedWeightEntries([{ id:'w1', date:'2026-09-18', weight: Infinity }]);`, sandbox);
  assert.strictEqual(sandbox.__r.entries.length, 0);
  assert.strictEqual(sandbox.__r.rejectedCount, 1);
});

// ----- 6. weight <= 0 -----
test('6a. Entrée avec weight = 0 : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: '2026-09-18', weight: 0 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});
test('6b. Entrée avec weight négatif : rejetée', () => {
  const { sandbox } = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'w1', date: '2026-09-18', weight: -75 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 7. Tableau mixte -----
test('7. Tableau avec plusieurs entrées dont une invalide : seule l\'invalide est retirée', () => {
  const { sandbox } = loadKaloSandbox();
  const arr = [
    { id: 'w1', date: '2026-09-18', weight: 75 },
    { id: 'w2', date: null, weight: 76 },
    { id: 'w3', date: '2026-09-16', weight: 74.5 },
  ];
  const { entries, rejectedCount } = sanitize(sandbox, arr);
  assert.strictEqual(rejectedCount, 1);
  assert.strictEqual(JSON.stringify(entries.map(e => e.id)), JSON.stringify(['w1', 'w3']));
});

// ----- 8/9/10 + scénario bout-en-bout : import corrompu -> persistance -> nouveau
// contexte (reload) -> render() -> viewToday()/viewWeight(), sans crash. -----
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
  // L'extraction s'arrête juste avant `save(); render();` (voir extractImportLogic) —
  // on rappelle save() nous-mêmes pour exercer la vraie persistance, sans jamais
  // invoquer le vrai render() (DOM complet, hors propos ici).
  vm.runInContext(`(function(data){ ${logic} \n save(); })(${JSON.stringify(data)});`, sandbox);
}

test('8/9/10 — import corrompu -> persistance -> nouveau contexte (reload) -> render() -> viewToday()/viewWeight() sans crash, entrées valides conservées', () => {
  const store = new Map();
  const { sandbox: importSandbox } = loadKaloSandbox(store);

  // Import corrompu : reproduit le bug original (avant P2.4-01, ce JSON aurait été
  // persisté tel quel et aurait fait planter le tri de weightEntries au rendu
  // suivant).
  const corruptExport = {
    weightEntries: [
      { id: 'good1', date: '2026-09-18', weight: 75 },
      { date: null, weight: 76 },              // sans date exploitable
      { id: 'bad2', date: '2026-09-17' },       // sans weight
      { id: 'bad3', date: '2026-09-16', weight: -10 }, // weight <= 0
      { id: 'good2', date: '2026-09-15', weight: 74.8 },
    ],
  };
  runImport(importSandbox, corruptExport);

  // "Persistance" : ct_weight doit refléter uniquement les entrées valides — jamais
  // les entrées corrompues, jamais un import silencieusement vide non plus.
  const persisted = JSON.parse(store.get('ct_weight'));
  assert.strictEqual(persisted.length, 2, 'seules les 2 pesées valides doivent être persistées');
  assert.deepStrictEqual(persisted.map(e => e.id).sort(), ['good1', 'good2']);

  // "Nouveau contexte / reload" : un DEUXIÈME sandbox complètement séparé, qui relit
  // le même store localStorage au chargement de core.js (LS.get('ct_weight', [])),
  // exactement comme une vraie réouverture de l'app.
  const { sandbox: reloadedSandbox } = loadKaloSandbox(store);
  vm.runInContext('this.__we = weightEntries;', reloadedSandbox);
  assert.strictEqual(reloadedSandbox.__we.length, 2, 'weightEntries doit être rechargé avec seulement les entrées valides après reload');

  // render() -> viewToday() : ne doit jamais planter (c'était le symptôme du bug
  // original : dashboard par défaut inutilisable après reload).
  let todayHtml;
  assert.doesNotThrow(() => {
    todayHtml = vm.runInContext('viewToday();', reloadedSandbox);
  }, 'viewToday() ne doit jamais planter après un import de weightEntries corrompu');
  assert.strictEqual(typeof todayHtml, 'string');

  // viewWeight() : idem pour l'onglet Poids.
  let weightHtml;
  assert.doesNotThrow(() => {
    weightHtml = vm.runInContext('viewWeight();', reloadedSandbox);
  }, 'viewWeight() ne doit jamais planter après un import de weightEntries corrompu');
  assert.strictEqual(typeof weightHtml, 'string');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
