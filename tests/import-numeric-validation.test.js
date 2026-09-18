// Tests ciblés — P2-1/P2-2 (audit Phase 2.2) : l'import JSON (js/ui.js) ne
// vérifiait que le type tableau de logEntries/settings/profile/foodOverrides,
// jamais la forme de leurs éléments/contenu :
//
//  - P2-1 : une valeur numérique corrompue dans un élément de logEntries
//    (chaîne non numérique, champ absent, ou un nombre qui déborde en Infinity
//    via un littéral JSON valide comme 1e400) contaminait ensuite silencieusement
//    dayTotals()/weeklyDeficit() (`kcalIn+=e.kcal`, `kcalOut+=e.kcalBurned`, sans
//    coercition). Correctif : sanitizeImportedLogEntries() (js/core.js).
//  - P2-2 : `if(data.settings) settings = data.settings;` (même chose pour
//    profile/foodOverrides) acceptait n'importe quelle valeur non-falsy — une
//    chaîne, un nombre, un tableau — remplaçant l'objet attendu par une
//    structure incompatible. Correctif : isPlainObject() (js/core.js), utilisée
//    dans le handler d'import (js/ui.js).
//
// Même approche que tests/import-validation.test.js (déjà existant, BUG-002,
// Phase 2.1) : on rejoue la logique RÉELLE du handler d'import, extraite de
// js/ui.js, contre le vrai js/core.js chargé en `vm`.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

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
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  return sandbox;
}

function runImport(sandbox, data) {
  const logic = extractImportLogic();
  vm.runInContext(
    `(function(data){ ${logic} \n this.__lastInvalidFields = invalidFields; this.__le = logEntries; this.__settings = settings; this.__profile = profile; this.__fo = foodOverrides; })(${JSON.stringify(data)});`,
    sandbox
  );
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

// ---------- P2-1 : éléments de logEntries ----------

test('P2-1 — kcal en chaîne non numérique sur une entrée meal : normalisée à 0, jamais introduite telle quelle dans dayTotals()', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: [{ id: 'a', date: '2026-09-18', type: 'meal', kcal: 'abc', protein: 10, carbs: 10, fat: 10 }],
  });
  assert.strictEqual(sandbox.__le[0].kcal, 0);
  vm.runInContext("this.__totals = dayTotals('2026-09-18');", sandbox);
  assert.ok(Number.isFinite(sandbox.__totals.kcalIn), 'dayTotals().kcalIn doit rester un nombre fini, jamais NaN/chaîne concaténée');
  assert.strictEqual(sandbox.__totals.kcalIn, 0);
});

test('P2-1 — kcal en Infinity (littéral JSON valide 1e400, débordement en nombre JS) : normalisée à 0', () => {
  const sandbox = loadKaloSandbox();
  // 1e400 est un littéral JSON syntaxiquement valide ; JSON.parse le convertit
  // en Infinity (dépassement de la plage des nombres flottants IEEE 754) —
  // c'est la seule façon dont une "vraie" valeur Infinity peut réellement
  // atteindre `data` ici (JSON.parse('{"k":Infinity}') lève une SyntaxError).
  const raw = '{"logEntries":[{"id":"a","date":"2026-09-18","type":"meal","kcal":1e400,"protein":10,"carbs":10,"fat":10}]}';
  const data = JSON.parse(raw);
  assert.strictEqual(data.logEntries[0].kcal, Infinity, 'précondition : kcal doit bien valoir Infinity après JSON.parse');
  runImport(sandbox, data);
  assert.strictEqual(sandbox.__le[0].kcal, 0);
  vm.runInContext("this.__totals = dayTotals('2026-09-18');", sandbox);
  assert.ok(Number.isFinite(sandbox.__totals.kcalIn));
});

test('P2-1 — champ kcal absent sur une entrée meal importée : normalisé à 0 plutôt que undefined (évite NaN dans dayTotals())', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: [{ id: 'a', date: '2026-09-18', type: 'meal', protein: 10, carbs: 10, fat: 10 }],
  });
  assert.strictEqual(sandbox.__le[0].kcal, 0);
  vm.runInContext("this.__totals = dayTotals('2026-09-18');", sandbox);
  assert.ok(Number.isFinite(sandbox.__totals.kcalIn));
});

test('P2-1 — kcalBurned invalide sur une entrée workout : normalisé à 0, jamais NaN dans kcalOut', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: [{ id: 'w', date: '2026-09-18', type: 'workout', wtype: 'tapis', kcalBurned: 'beaucoup' }],
  });
  assert.strictEqual(sandbox.__le[0].kcalBurned, 0);
  vm.runInContext("this.__totals = dayTotals('2026-09-18');", sandbox);
  assert.ok(Number.isFinite(sandbox.__totals.kcalOut));
  assert.strictEqual(sandbox.__totals.kcalOut, 0);
});

test('P2-1 — valeur numérique valide : inchangée, aucune entrée comptée comme assainie', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: [{ id: 'a', date: '2026-09-18', type: 'meal', kcal: 500, protein: 20, carbs: 40, fat: 15 }],
  });
  assert.strictEqual(sandbox.__le[0].kcal, 500);
  assert.strictEqual(sandbox.__le[0].protein, 20);
  vm.runInContext("this.__totals = dayTotals('2026-09-18');", sandbox);
  assert.strictEqual(sandbox.__totals.kcalIn, 500);
});

test('P2-1 — plusieurs champs invalides sur la même entrée : tous normalisés, l\'entrée reste visible (pas rejetée en bloc)', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    logEntries: [{ id: 'a', date: '2026-09-18', type: 'meal', kcal: 'x', protein: 'y', carbs: 10, fat: null }],
  });
  const e = sandbox.__le[0];
  assert.strictEqual(e.kcal, 0);
  assert.strictEqual(e.protein, 0);
  assert.strictEqual(e.carbs, 10, 'un champ valide au milieu de champs invalides doit être préservé');
  assert.strictEqual(e.fat, 0);
  assert.strictEqual(e.id, 'a', "l'entrée entière n'est jamais rejetée, seuls ses champs numériques invalides le sont");
});

// ---------- P2-2 : settings/profile/foodOverrides ----------

test('P2-2 — settings scalaire (chaîne) : rejeté, jamais assigné, signalé comme invalide', () => {
  const sandbox = loadKaloSandbox();
  const before = { calorieGoal: 2200, proteinGoal: 150, carbGoal: 220, fatGoal: 70 };
  vm.runInContext(`this.__setSettings = (v)=>{ settings = v; }; this.__setSettings(${JSON.stringify(before)});`, sandbox);
  runImport(sandbox, { settings: 'x' });
  assert.ok(sandbox.__lastInvalidFields.includes('settings'));
  assert.strictEqual(sandbox.__settings.calorieGoal, 2200, "l'ancien settings valide ne doit jamais être remplacé par une chaîne");
});

test('P2-2 — profile scalaire (nombre) : rejeté, jamais assigné', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, { profile: 42 });
  assert.ok(sandbox.__lastInvalidFields.includes('profile'));
  assert.ok(sandbox.__profile && typeof sandbox.__profile === 'object' && !Array.isArray(sandbox.__profile), 'profile doit rester un objet');
});

test('P2-2 — foodOverrides tableau (pas un objet-dictionnaire) : rejeté, jamais assigné', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, { foodOverrides: ['pas', 'un', 'dictionnaire'] });
  assert.ok(sandbox.__lastInvalidFields.includes('foodOverrides'));
  assert.ok(!Array.isArray(sandbox.__fo), 'foodOverrides ne doit jamais devenir un tableau');
});

test('P2-2 — settings/profile/foodOverrides objets valides : acceptés normalement (pas de régression)', () => {
  const sandbox = loadKaloSandbox();
  runImport(sandbox, {
    settings: { calorieGoal: 1900, proteinGoal: 120, carbGoal: 180, fatGoal: 60 },
    profile: { sex: 'F', age: '30', height: '165', activity: 'modere', goalWeight: '', rate: '0' },
    foodOverrides: { apple_0: { name: 'Pomme bio', kcal: 55, protein: 0.3, carbs: 14, fat: 0.2 } },
  });
  assert.ok(!sandbox.__lastInvalidFields.includes('settings'));
  assert.ok(!sandbox.__lastInvalidFields.includes('profile'));
  assert.ok(!sandbox.__lastInvalidFields.includes('foodOverrides'));
  assert.strictEqual(sandbox.__settings.calorieGoal, 1900);
  assert.strictEqual(sandbox.__profile.sex, 'F');
  assert.strictEqual(sandbox.__fo.apple_0.kcal, 55);
});

test('P2-2 — settings absent du fichier importé : ignoré silencieusement, comme avant (rétrocompatibilité, pas de régression du comportement historique)', () => {
  const sandbox = loadKaloSandbox();
  const before = { calorieGoal: 2200, proteinGoal: 150, carbGoal: 220, fatGoal: 70 };
  vm.runInContext(`this.__setSettings = (v)=>{ settings = v; }; this.__setSettings(${JSON.stringify(before)});`, sandbox);
  runImport(sandbox, { customFoods: [] });
  assert.ok(!sandbox.__lastInvalidFields.includes('settings'), 'un champ absent ne doit pas être signalé comme invalide');
  assert.strictEqual(sandbox.__settings.calorieGoal, 2200);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
