// Tests ciblés — correctif Phase 2.5 / LS-1 (audit Performance, corrigé ci-après).
//
// Contexte : save() (js/core.js) réécrivait les 16 clés localStorage à CHAQUE appel,
// même quand une seule avait changé (ex. cocher une tâche réécrivait aussi ct_log,
// ct_recipes... avec un contenu strictement identique). Le correctif introduit
// `lastSavedJSON` : chaque clé est TOUJOURS resérialisée et comparée à la dernière
// version réellement écrite avec succès — jamais "supposée" inchangée sans preuve —
// et seule l'écriture `localStorage.setItem()` réelle (via LS.set(), inchangée) est
// évitée quand elle serait un pur no-op. La robustesse existante (LS.set(),
// failedKeys, toast d'erreur, comportement best-effort par clé — BUG-001) doit
// rester intacte : ces tests vérifient explicitement qu'aucune régression n'a été
// introduite sur ce point.
//
// Même approche que tests/save-persistence.test.js : on charge le VRAI js/core.js
// dans un bac à sable `vm`, avec un `localStorage` instrumenté qui compte les vrais
// appels `setItem()` (c'est précisément ce que ce correctif doit réduire).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadKaloSandbox(storageOverrides = {}) {
  const store = new Map();
  const setItemCalls = []; // trace de CHAQUE écriture réelle localStorage.setItem() (clé, à l'ordre d'appel)
  function DOMExceptionLike(name) { this.name = name; this.message = name; }
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      setItemCalls.push(k);
      if (storageOverrides.failOn && storageOverrides.failOn(k)) {
        throw new DOMExceptionLike('QuotaExceededError');
      }
      store.set(k, String(v));
    },
    removeItem: (k) => store.delete(k),
  };
  const sandbox = {
    localStorage,
    console,
    window: {},
    navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  sandbox.getToastCalls = () => sandbox.__toastCalls;
  sandbox.getSetItemCalls = () => setItemCalls.slice();
  sandbox.clearSetItemCalls = () => { setItemCalls.length = 0; };
  sandbox.rawStore = store;
  // Setters pour les `let` de haut niveau (invisibles comme propriétés du sandbox,
  // même limitation documentée dans tests/save-persistence.test.js).
  for (const name of ['logEntries','settings','customFoods','foodOverrides','favorites','weightEntries',
    'profile','todos','shoppingList','recipes','recipeBooks','insightsSeen','workoutPresets','favSports',
    'calibrationSeen','portionRevealSeen']) {
    vm.runInContext(`this.__set_${name} = (v) => { ${name} = v; };`, sandbox);
    sandbox[`set_${name}`] = (v) => sandbox[`__set_${name}`](v);
  }
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name}`);
    console.log('      ' + (e && e.message ? e.message : e));
  }
}

const ALL_KEYS = ['ct_settings','ct_customFoods','ct_foodOverrides','ct_favorites','ct_weight','ct_profile',
  'ct_wpresets','ct_log','ct_todos','ct_shoppingList','ct_recipes','ct_recipeBooks','ct_insightsSeen',
  'ct_favSports','ct_calibrationSeen','ct_portionRevealSeen'];

// ----- Sauvegarde complète (premier appel, cache vide) -----
test('Premier save() (cache vide) : écrit les 16 clés — comportement identique à avant le correctif', () => {
  const sandbox = loadKaloSandbox();
  // Le chargement de core.js déclenche à froid une migration ponctuelle
  // (ct_muscleUnitMigrated, hors périmètre de save()) qui écrit 2 clés à part —
  // on isole ici uniquement les écritures dues à l'appel explicite à save().
  sandbox.clearSetItemCalls();
  vm.runInContext('save();', sandbox);
  const calls = sandbox.getSetItemCalls();
  assert.strictEqual(calls.length, 16, `premier save() doit écrire les 16 clés (obtenu: ${calls.length})`);
  assert.deepStrictEqual([...calls].sort(), [...ALL_KEYS].sort());
});

// ----- Sauvegarde partielle ciblée : action mineure (cocher une tâche) -----
test('Action mineure (cocher une tâche) après un premier save() : seule ct_todos est réécrite, pas les 15 autres clés', () => {
  const sandbox = loadKaloSandbox();
  sandbox.set_todos([{ id: 't1', text: 'Courses', daily: false, done: false, completedDate: null }]);
  vm.runInContext('save();', sandbox); // état initial complet
  sandbox.clearSetItemCalls();

  // "Cocher une tâche" : seule `todos` change en mémoire, rien d'autre.
  sandbox.set_todos([{ id: 't1', text: 'Courses', daily: false, done: true, completedDate: '2026-09-19' }]);
  vm.runInContext('save();', sandbox);
  const calls = sandbox.getSetItemCalls();
  assert.deepStrictEqual(calls, ['ct_todos'], `une action mineure ne doit réécrire QUE la clé réellement modifiée (obtenu: ${JSON.stringify(calls)})`);
});

// ----- Chaque clé modifiée individuellement -----
for (const key of ALL_KEYS) {
  test(`Seule ${key} modifiée : seule ${key} est réécrite au save() suivant`, () => {
    const sandbox = loadKaloSandbox();
    vm.runInContext('save();', sandbox);
    sandbox.clearSetItemCalls();
    if (key === 'ct_calibrationSeen' || key === 'ct_portionRevealSeen') {
      sandbox[`set_${key === 'ct_calibrationSeen' ? 'calibrationSeen' : 'portionRevealSeen'}`](true);
    } else if (key === 'ct_settings') {
      sandbox.set_settings({ calorieGoal: 1800, proteinGoal: 150, carbGoal: 220, fatGoal: 70 });
    } else if (key === 'ct_profile') {
      sandbox.set_profile({ sex: 'F', age: '29', height: '165', activity: 'actif', goalWeight: '60', rate: '-0.3' });
    } else if (key === 'ct_foodOverrides') {
      sandbox.set_foodOverrides({ apple: { kcal: 60 } });
    } else if (key === 'ct_insightsSeen') {
      sandbox.set_insightsSeen({ whatChanged: '2026-09-19' });
    } else {
      const varName = { ct_customFoods:'customFoods', ct_favorites:'favorites', ct_weight:'weightEntries',
        ct_wpresets:'workoutPresets', ct_log:'logEntries', ct_todos:'todos', ct_shoppingList:'shoppingList',
        ct_recipes:'recipes', ct_recipeBooks:'recipeBooks', ct_favSports:'favSports' }[key];
      sandbox[`set_${varName}`]([{ id: 'x' + Math.random() }]);
    }
    vm.runInContext('save();', sandbox);
    const calls = sandbox.getSetItemCalls();
    assert.deepStrictEqual(calls, [key], `attendu uniquement [${key}], obtenu ${JSON.stringify(calls)}`);
  });
}

// ----- Plusieurs clés modifiées -----
test('Plusieurs clés modifiées simultanément (todos + weight + log) : exactement ces 3 clés réécrites, les 13 autres épargnées', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext('save();', sandbox);
  sandbox.clearSetItemCalls();
  sandbox.set_todos([{ id: 't1', text: 'X', daily: false, done: false, completedDate: null }]);
  sandbox.set_weightEntries([{ id: 'w1', date: '2026-09-19', weight: 75 }]);
  sandbox.set_logEntries([{ id: 'e1', date: '2026-09-19', type: 'meal', kcal: 500 }]);
  vm.runInContext('save();', sandbox);
  const calls = sandbox.getSetItemCalls().sort();
  assert.deepStrictEqual(calls, ['ct_log', 'ct_todos', 'ct_weight']);
});

// ----- Clé volumineuse -----
test('Clé volumineuse (ct_log, 2000 entrées) : écrite une fois, jamais réécrite tant qu\'inchangée, réécrite dès qu\'un seul élément change', () => {
  const sandbox = loadKaloSandbox();
  const bigLog = Array.from({ length: 2000 }, (_, i) => ({ id: 'e' + i, date: '2026-09-19', type: 'meal', kcal: 300 + i }));
  sandbox.set_logEntries(bigLog);
  vm.runInContext('save();', sandbox);
  assert.ok(sandbox.getSetItemCalls().includes('ct_log'));
  sandbox.clearSetItemCalls();

  // Plusieurs save() consécutifs SANS aucune modification : ct_log ne doit plus jamais être réécrite.
  vm.runInContext('save(); save(); save();', sandbox);
  assert.ok(!sandbox.getSetItemCalls().includes('ct_log'), 'ct_log inchangée ne doit plus jamais être réécrite sur des save() répétés');

  // Une seule entrée modifiée parmi 2000 : ct_log doit être réécrite immédiatement.
  const bigLog2 = bigLog.slice();
  bigLog2[999] = { ...bigLog2[999], kcal: 999999 };
  sandbox.set_logEntries(bigLog2);
  vm.runInContext('save();', sandbox);
  assert.ok(sandbox.getSetItemCalls().includes('ct_log'), 'un seul élément changé au milieu de 2000 doit suffire à déclencher la réécriture (jamais une clé "supposée" inchangée sans preuve)');
});

// ----- Échec LS.set() -----
test('Échec LS.set() (quota dépassé) sur une clé : failedKeys détecté, toast d\'erreur, PAS de succès mensonger, et la clé est retentée au save() suivant', () => {
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_log' });
  sandbox.set_logEntries([{ id: 'e1', date: '2026-09-19', type: 'meal', kcal: 500 }]);
  vm.runInContext("save('Repas ajouté ✓');", sandbox);
  const toasts = sandbox.getToastCalls();
  assert.strictEqual(toasts.length, 1, 'un seul toast doit être émis (jamais succès ET erreur en même temps — non-régression BUG-001)');
  assert.strictEqual(toasts[0].kind, 'error');
  assert.ok(toasts[0].msg.includes('ct_log'), 'le toast d\'erreur doit nommer la clé en échec');
  assert.ok(!toasts[0].msg.includes('Repas ajouté'), 'absence de succès mensonger : le message de succès ne doit jamais apparaître si une clé a échoué');

  // localStorage réel ne doit PAS contenir la valeur en échec.
  assert.strictEqual(sandbox.rawStore.has('ct_log'), false);

  // Réessai au save() suivant (toujours en échec) : ct_log doit être RETENTÉE, pas
  // sautée sous prétexte qu'elle a "déjà été traitée" — elle n'a jamais réussi.
  sandbox.clearSetItemCalls();
  vm.runInContext('save();', sandbox);
  assert.ok(sandbox.getSetItemCalls().includes('ct_log'), 'une clé jamais confirmée en succès doit être retentée à chaque save(), jamais mise en cache comme "déjà sauvegardée"');
});

// ----- Plusieurs échecs -----
test('Plusieurs échecs simultanés (ct_log ET ct_weight) : les deux sont signalées dans le même toast, les autres clés réussissent normalement', () => {
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_log' || k === 'ct_weight' });
  sandbox.set_logEntries([{ id: 'e1', date: '2026-09-19', type: 'meal', kcal: 500 }]);
  sandbox.set_weightEntries([{ id: 'w1', date: '2026-09-19', weight: 75 }]);
  sandbox.set_todos([{ id: 't1', text: 'X', daily: false, done: false, completedDate: null }]);
  vm.runInContext('save();', sandbox);
  const toasts = sandbox.getToastCalls();
  assert.strictEqual(toasts.length, 1);
  assert.strictEqual(toasts[0].kind, 'error');
  assert.ok(toasts[0].msg.includes('ct_log') && toasts[0].msg.includes('ct_weight'), 'les deux clés en échec doivent apparaître dans le même toast');
  // ct_todos (non concernée par l'échec) doit malgré tout être persistée normalement.
  assert.ok(sandbox.rawStore.has('ct_todos'));
});

// ----- Persistance après rechargement -----
test('Persistance après rechargement : un état construit via plusieurs save() partiels successifs se recharge intégralement et correctement dans un nouveau sandbox', () => {
  const sandbox1 = loadKaloSandbox();
  sandbox1.set_settings({ calorieGoal: 2000, proteinGoal: 140, carbGoal: 200, fatGoal: 65 });
  vm.runInContext('save();', sandbox1);
  sandbox1.set_logEntries([{ id: 'e1', date: '2026-09-19', type: 'meal', kcal: 450, protein: 30, carbs: 40, fat: 10 }]);
  vm.runInContext('save();', sandbox1); // save partiel : ne réécrit que ct_log (settings inchangés)
  sandbox1.set_todos([{ id: 't1', text: 'Courses', daily: false, done: true, completedDate: '2026-09-19' }]);
  vm.runInContext('save();', sandbox1); // save partiel : ne réécrit que ct_todos

  // "Rechargement" : nouveau sandbox pointant vers le MÊME store localStorage brut.
  const store2 = sandbox1.rawStore;
  const localStorage2 = {
    getItem: (k) => (store2.has(k) ? store2.get(k) : null),
    setItem: (k, v) => store2.set(k, String(v)),
    removeItem: (k) => store2.delete(k),
  };
  const sandbox2 = {
    localStorage: localStorage2, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(), setTimeout, clearTimeout,
  };
  vm.createContext(sandbox2);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox2, { filename: 'js/core.js' });
  vm.runInContext('this.__snapshot = JSON.stringify({ settings, logEntries, todos });', sandbox2);
  const snapshot = JSON.parse(vm.runInContext('this.__snapshot', sandbox2));

  assert.strictEqual(snapshot.settings.calorieGoal, 2000, 'settings (écrit lors du 1er save partiel) doit survivre au rechargement');
  assert.strictEqual(snapshot.logEntries.length, 1);
  assert.strictEqual(snapshot.logEntries[0].kcal, 450, 'logEntries (écrit lors du 2e save partiel) doit survivre au rechargement');
  assert.strictEqual(snapshot.todos.length, 1);
  assert.strictEqual(snapshot.todos[0].done, true, 'todos (écrit lors du 3e save partiel) doit survivre au rechargement');
});

// ----- Non-régression : les tests de persistance déjà existants doivent continuer à passer -----
// (vérifié séparément par `node --test tests/*.test.js` — tests/save-persistence.test.js,
// tests/phase-2-4-*.test.js — non dupliqués ici pour éviter la redondance.)

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
