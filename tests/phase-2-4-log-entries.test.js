// Tests ciblés — P2.4-02 (audit Phase 2.4) : sanitizeImportedLogEntries() (js/core.js)
// assainissait déjà les champs numériques (P2-1, Phase 2.2) mais ne validait ni
// `date` ni `type`. Une entrée avec une date malformée n'était pas rejetée : elle
// restait importée dans ct_log en permanence, mais invisible partout puisque
// entriesFor()/dayTotals() comparent `e.date===date` et ne la retrouvent jamais —
// pire qu'un rejet explicite, car silencieux. Corrigé en rejetant ces entrées
// (comptées dans `rejectedCount`, jamais silencieux).
//
// Important : le type réellement supporté par logEntries inclut 'note' (bloc
// Notes du dashboard, js/ui.js), pas seulement 'meal'/'workout' — vérifié dans le
// code réel avant d'écrire ce test, pour ne pas casser la rétrocompatibilité des
// imports contenant des notes.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

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

function sanitize(sandbox, arr) {
  vm.runInContext(`this.__r = sanitizeImportedLogEntries(${JSON.stringify(arr)});`, sandbox);
  return sandbox.__r;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

// ----- 1. logEntry sans date -----
test('1. logEntry sans date : rejetée', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 2. logEntry avec date malformée -----
test('2a. logEntry avec date malformée (format) : rejetée', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '18-09-2026', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});
test('2b. logEntry avec date impossible (bon format, valeur invalide) : rejetée — ne devient jamais silencieusement invisible', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '2026-02-30', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 }]);
  assert.strictEqual(entries.length, 0, 'une date qui ne correspond à aucun jour réel ne doit jamais être importée silencieusement');
  assert.strictEqual(rejectedCount, 1);
});

// ----- 3. logEntry avec type inconnu -----
test('3. logEntry avec type inconnu (ex. "workoutout", faute de frappe) : rejetée', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '2026-09-18', type: 'workoutout', kcalBurned: 100 }]);
  assert.strictEqual(entries.length, 0);
  assert.strictEqual(rejectedCount, 1);
});

// ----- 4. Entrée valide conservée -----
test('4a. logEntry type "meal" valide : conservée', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '2026-09-18', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 }]);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(rejectedCount, 0);
});
test('4b. logEntry type "workout" valide : conservée', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '2026-09-18', type: 'workout', kcalBurned: 200 }]);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(rejectedCount, 0);
});
test('4c. logEntry type "note" valide : conservée (type réellement supporté, absent de la liste littérale de l\'audit)', () => {
  const sandbox = loadKaloSandbox();
  const { entries, rejectedCount } = sanitize(sandbox, [{ id: 'e1', date: '2026-09-18', type: 'note', text: 'RAS' }]);
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(rejectedCount, 0);
});

// ----- 5. Mélange d'entrées valides et invalides -----
test('5. Mélange valides/invalides : seules les invalides sont retirées, comptées séparément des corrections numériques', () => {
  const sandbox = loadKaloSandbox();
  const arr = [
    { id: 'ok1', date: '2026-09-18', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 },
    { id: 'bad1', date: 'pas-une-date', type: 'meal', kcal: 100, protein: 1, carbs: 1, fat: 1 },
    { id: 'bad2', date: '2026-09-17', type: 'inconnu' },
    { id: 'ok2', date: '2026-09-16', type: 'workout', kcalBurned: 'oops' }, // numérique invalide -> corrigée, pas rejetée
  ];
  const { entries, sanitizedCount, rejectedCount } = sanitize(sandbox, arr);
  assert.strictEqual(rejectedCount, 2);
  assert.strictEqual(sanitizedCount, 1, 'ok2 doit être corrigée (kcalBurned -> 0), pas rejetée : date/type valides');
  assert.strictEqual(JSON.stringify(entries.map(e => e.id)), JSON.stringify(['ok1', 'ok2']));
  const ok2 = entries.find(e => e.id === 'ok2');
  assert.strictEqual(ok2.kcalBurned, 0);
});

// ----- 6. Message d'import signalant le rejet -----
function extractImportLogic() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = 'const data = JSON.parse(reader.result);';
  const start = uiSrc.indexOf(marker);
  const end = uiSrc.indexOf('save(); render();', start);
  assert.ok(start !== -1 && end !== -1);
  return uiSrc.slice(start + marker.length, end);
}
test('6. Import réel (js/ui.js) : le toast signale les entrées de journal rejetées', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  const logic = extractImportLogic();
  const data = { logEntries: [
    { id: 'ok', date: '2026-09-18', type: 'meal', kcal: 500, protein: 10, carbs: 10, fat: 10 },
    { id: 'bad', date: 'invalide', type: 'meal', kcal: 100, protein: 1, carbs: 1, fat: 1 },
  ] };
  vm.runInContext(`(function(data){ ${logic} \n save(); \n this.__parts_test = true; \n if(rejectedLogCount) this.__toastCalls.push({msg:'rejectedLogCount:'+rejectedLogCount}); })(${JSON.stringify(data)});`, sandbox);
  const calls = sandbox.__toastCalls;
  assert.ok(calls.some(c => /rejectedLogCount:1/.test(c.msg)), 'rejectedLogCount doit valoir 1 et être disponible pour le message affiché à l\'utilisateur');
});

// ----- Régression : rétrocompatibilité avec un import valide existant -----
test('Régression — import valide existant (format actuel) inchangé', () => {
  const sandbox = loadKaloSandbox();
  const arr = [
    { id: 'a', date: '2026-09-18', type: 'meal', foodName: 'Pomme', grams: 150, kcal: 78, protein: 0.5, carbs: 21, fat: 0.3, source: 'manual' },
    { id: 'b', date: '2026-09-18', type: 'workout', wtype: 'tapis', params: { vitesse: 6, pente: 1 }, duration: 30, time: '08:00', kcalBurned: 250 },
  ];
  const { entries, sanitizedCount, rejectedCount } = sanitize(sandbox, arr);
  assert.strictEqual(rejectedCount, 0);
  assert.strictEqual(sanitizedCount, 0);
  assert.strictEqual(entries.length, 2);
  assert.strictEqual(JSON.stringify(entries), JSON.stringify(arr), 'des entrées déjà valides doivent traverser sans aucune modification');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
