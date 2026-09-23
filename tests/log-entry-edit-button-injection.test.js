// Test ciblé — Phase 3, Lot A : bindLogEntryEditButtons() (js/ui.js) pose le bouton
// "✎" à côté de chaque "✕" ([data-del]) des entrées meal/workout affichées (Repas du
// jour, Séances du jour, Historique), en retrouvant l'entrée par `entry.id` (jamais une
// position DOM) — jamais pour une entrée `note` (hors périmètre Lot A). Un bouton
// "Modifier" seul ne suffit pas à démontrer le comportement (voir CLAUDE.md, critère de
// réussite) : ce test vérifie qu'il n'apparaît QUE pour meal/workout, qu'il porte le bon
// id, et qu'un clic dessus ouvre bien le bon formulaire d'édition (jamais le catalogue).
//
// DOM minimal spécifique à ce test (createElement + querySelectorAll('button[data-del]')
// + insertBefore) — plus léger que les autres fichiers de tests/ (getElementById
// mémoïsé) car bindLogEntryEditButtons() n'utilise que ce sous-ensemble de l'API DOM.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeDelButton(id) {
  return {
    tagName: 'BUTTON', className: 'del', dataset: { del: id },
    parentNode: null, // assigné ci-dessous
  };
}

function makeSandbox(delIds) {
  const delButtons = delIds.map(makeDelButton);
  const createdButtons = [];
  delButtons.forEach(b => {
    b.parentNode = {
      insertBefore(newNode, ref) { newNode.__insertedBeforeDelId = ref.dataset.del; },
    };
  });
  const document = {
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(), dataset: {}, className: '', textContent: '',
        onclick: null, _attrs: {},
        setAttribute(k, v) { this._attrs[k] = v; },
      };
      createdButtons.push(el);
      return el;
    },
    querySelectorAll(sel) { return sel === 'button[data-del]' ? delButtons : []; },
  };
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document,
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8'), sandbox, { filename: 'js/ui.js' });
  return { sandbox, delButtons, createdButtons };
}

function setLogEntries(sandbox, entries) {
  vm.runInContext(`logEntries = ${JSON.stringify(entries)};`, sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Un bouton "✎" est créé pour une entrée meal et pour une entrée workout, avec le bon data-editentry', () => {
  const { sandbox, createdButtons } = makeSandbox(['m1', 'w1']);
  setLogEntries(sandbox, [
    { id: 'm1', date: '2026-01-01', type: 'meal', mealSlot: 'Déjeuner', foodName: 'Riz', grams: 100, kcal: 130, protein: 3, carbs: 28, fat: 0.3, time: '12:00', source: 'manual' },
    { id: 'w1', date: '2026-01-01', type: 'workout', wtype: 'velo', params: { effort: 'modere' }, duration: 30, kcalBurned: 200, time: '18:00' },
  ]);
  vm.runInContext('bindLogEntryEditButtons();', sandbox);
  assert.strictEqual(createdButtons.length, 2, 'un bouton ✎ créé par entrée meal/workout affichée');
  const ids = createdButtons.map(b => b.dataset.editentry).sort();
  assert.deepStrictEqual(ids, ['m1', 'w1']);
  // Inséré juste avant le bouton ✕ correspondant (même ligne), jamais ailleurs.
  createdButtons.forEach(b => assert.strictEqual(b.__insertedBeforeDelId, b.dataset.editentry));
});

test('Aucun bouton "✎" créé pour une entrée note — hors périmètre Lot A (meal/workout uniquement)', () => {
  const { sandbox, createdButtons } = makeSandbox(['n1']);
  setLogEntries(sandbox, [
    { id: 'n1', date: '2026-01-01', type: 'note', text: 'Une observation', time: '09:00' },
  ]);
  vm.runInContext('bindLogEntryEditButtons();', sandbox);
  assert.strictEqual(createdButtons.length, 0);
});

test('Un [data-del] sans entrée correspondante dans logEntries (état incohérent) n\'explose pas et ne crée rien', () => {
  const { sandbox, createdButtons } = makeSandbox(['ghost']);
  setLogEntries(sandbox, []);
  assert.doesNotThrow(() => vm.runInContext('bindLogEntryEditButtons();', sandbox));
  assert.strictEqual(createdButtons.length, 0);
});

test('Cliquer sur le bouton "✎" d\'une entrée meal ouvre openEditMealEntryModal avec CETTE entrée — jamais openEditFoodModal (catalogue)', () => {
  const { sandbox, createdButtons } = makeSandbox(['m1']);
  setLogEntries(sandbox, [
    { id: 'm1', date: '2026-01-01', type: 'meal', mealSlot: 'Déjeuner', foodName: 'Riz', grams: 100, kcal: 130, protein: 3, carbs: 28, fat: 0.3, time: '12:00', source: 'manual' },
  ]);
  vm.runInContext(`
    this.__calls = [];
    openEditMealEntryModal = (e)=>{ this.__calls.push('meal:'+e.id); };
    openEditWorkoutEntryModal = (e)=>{ this.__calls.push('workout:'+e.id); };
    openEditFoodModal = (f)=>{ this.__calls.push('food'); };
  `, sandbox);
  vm.runInContext('bindLogEntryEditButtons();', sandbox);
  createdButtons[0].onclick();
  vm.runInContext('this.__callsJSON = JSON.stringify(this.__calls);', sandbox);
  assert.strictEqual(sandbox.__callsJSON, JSON.stringify(['meal:m1']));
});

test('Cliquer sur le bouton "✎" d\'une entrée supprimée entre-temps affiche un toast au lieu d\'ouvrir une modale sur une entrée fantôme', () => {
  const { sandbox, createdButtons } = makeSandbox(['m1']);
  setLogEntries(sandbox, [
    { id: 'm1', date: '2026-01-01', type: 'meal', mealSlot: 'Déjeuner', foodName: 'Riz', grams: 100, kcal: 130, protein: 3, carbs: 28, fat: 0.3, time: '12:00', source: 'manual' },
  ]);
  vm.runInContext(`
    this.__opened = false;
    this.__toasts = [];
    openEditLogEntryModal = ()=>{ this.__opened = true; };
    toast = (msg)=>{ this.__toasts.push(msg); };
  `, sandbox);
  vm.runInContext('bindLogEntryEditButtons();', sandbox);
  // L'entrée est supprimée du journal après la pose du bouton mais avant le clic
  // (ex. suppression concurrente depuis un autre onglet du navigateur) : le clic ne
  // doit jamais rouvrir une modale sur des données qui n'existent plus.
  vm.runInContext('logEntries = [];', sandbox);
  createdButtons[0].onclick();
  vm.runInContext('this.__openedVal = this.__opened; this.__toastsJSON = JSON.stringify(this.__toasts);', sandbox);
  assert.strictEqual(sandbox.__openedVal, false);
  assert.ok(JSON.parse(sandbox.__toastsJSON).length === 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
