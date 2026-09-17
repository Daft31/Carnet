// Tests ciblés — tolérance de 2% sur le streak calorique + distinction
// "aucun historique" / "série interrompue aujourd'hui" (audit produit dédié).
//
// Pas de framework/dépendance ajoutée (cohérent avec le "sans build, sans
// framework" de Kalo — voir CLAUDE.md) : ce script charge le VRAI js/core.js
// dans un bac à sable (module `vm` de Node), avec un simple stub de
// `localStorage`, puis appelle directement calorieStreak()/calorieStreakAsOf()/
// calorieStreakThreshold() et dashboardGrid() (en lisant le HTML réellement
// produit pour la carte "Historique", pas une réimplémentation séparée du
// texte attendu). Un futur changement du calcul dans core.js est donc
// automatiquement couvert par ces tests, sans les resynchroniser à la main.
//
// Exécution : node tests/calorie-streak.test.js

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
    localStorage,
    console,
    window: {},
    navigator: { userAgent: 'node-test' },
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  // `let`/`const` de haut niveau (logEntries, settings, currentDate, ...) restent
  // visibles aux scripts suivants exécutés dans le même contexte `vm`, mais ne
  // deviennent pas des propriétés de l'objet sandbox — on les ré-expose
  // explicitement pour que le test puisse les lire/écrire.
  vm.runInContext(
    'this.__bindings = { logEntries, settings, weightEntries, recipes, recipeBooks, todos, shoppingList };',
    sandbox
  );
  Object.assign(sandbox, sandbox.__bindings);
  return sandbox;
}

const sandbox = loadKaloSandbox();
const {
  calorieStreak, calorieStreakAsOf, calorieStreakThreshold,
  dashboardGrid, dayTotals, todayStr, shiftDate,
} = sandbox;

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

function resetState({ calorieGoal = 1725 } = {}) {
  sandbox.logEntries.length = 0;
  sandbox.weightEntries.length = 0;
  sandbox.recipes.length = 0;
  sandbox.recipeBooks.length = 0;
  sandbox.todos.length = 0;
  sandbox.shoppingList.length = 0;
  sandbox.settings.calorieGoal = calorieGoal;
  vm.runInContext(`currentDate = ${JSON.stringify(todayStr())};`, sandbox);
}

function addMealDay(dateStr, kcal) {
  sandbox.logEntries.push({
    id: 'm_' + dateStr, date: dateStr, type: 'meal', mealSlot: 'Déjeuner',
    foodName: 'Test', grams: 100, kcal, protein: 0, carbs: 0, fat: 0, time: '12:00', source: 'manual',
  });
}
function addWorkoutDay(dateStr, kcalBurned) {
  sandbox.logEntries.push({
    id: 'w_' + dateStr, date: dateStr, type: 'workout', wtype: 'tapis',
    duration: 30, kcalBurned, time: '08:00',
  });
}

// Extrait value/sub de la carte "Historique" du VRAI HTML produit par
// dashboardGrid() — jamais une réimplémentation séparée du texte attendu.
function historyCardText() {
  const t = dayTotals(todayStr());
  const html = dashboardGrid(t);
  const m = html.match(/data-tab="history"[\s\S]*?dash-value">([^<]*)<\/div>[\s\S]*?dash-sub">([^<]*)<\/div>/);
  assert.ok(m, 'carte Historique introuvable dans le HTML du dashboard');
  return { value: m[1], sub: m[2] };
}

// ===================== SEUIL (objectif 1725) =====================
test('Seuil 1725 — calorieStreakThreshold(1725) === 1759.5', () => {
  assert.strictEqual(calorieStreakThreshold(1725), 1759.5);
});

const THRESHOLD_CASES_1725 = [
  [1724, true], [1725, true], [1726, true], [1741, true], [1750, true], [1759, true],
  [1760, false], [1761, false], [1800, false], [2000, false],
];
for (const [kcal, expectedCounted] of THRESHOLD_CASES_1725) {
  test(`Seuil 1725 — ${kcal} kcal ${expectedCounted ? 'compte' : 'ne compte pas'}`, () => {
    resetState({ calorieGoal: 1725 });
    const today = todayStr();
    addMealDay(today, kcal);
    const streak = calorieStreak();
    assert.strictEqual(streak > 0, expectedCounted, `streak=${streak} pour kcal=${kcal}`);
  });
}

// ===================== PROPORTIONNALITÉ (autres objectifs) =====================
const GOALS = [1400, 1600, 1725, 1800, 2200, 2500];
for (const goal of GOALS) {
  test(`Proportionnalité — objectif ${goal} : marge ≈ 2% (pas de marge fixe cachée)`, () => {
    const threshold = calorieStreakThreshold(goal);
    const expectedThreshold = Math.round(goal * 1.02 * 100) / 100;
    assert.strictEqual(threshold, expectedThreshold);
    assert.strictEqual(threshold - goal, Math.round(goal * 0.02 * 100) / 100);
  });
  test(`Proportionnalité — objectif ${goal} : juste sous le seuil compte, juste au-dessus ne compte pas`, () => {
    resetState({ calorieGoal: goal });
    const threshold = calorieStreakThreshold(goal);
    const today = todayStr();
    addMealDay(today, threshold);
    assert.ok(calorieStreak() > 0, `${threshold} (exactement au seuil) devrait compter`);
    resetState({ calorieGoal: goal });
    addMealDay(today, threshold + 1);
    assert.strictEqual(calorieStreak(), 0, `${threshold + 1} (juste au-dessus) ne devrait pas compter`);
  });
}

// ===================== SPORT — kcalOut jamais mêlé au calcul =====================
test('Sport — objectif 1725, kcalIn 1741, kcalOut 115 : compte dans le streak', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(today, 1741);
  addWorkoutDay(today, 115);
  assert.ok(calorieStreak() > 0, 'kcalOut ne doit jamais être mêlé au calcul du streak');
});
test('Sport — objectif 1725, kcalIn 1760, kcalOut 500 : hors streak malgré une grosse dépense', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(today, 1760);
  addWorkoutDay(today, 500);
  assert.strictEqual(calorieStreak(), 0, 'kcalOut ne doit jamais compenser un dépassement de kcalIn');
});

// ===================== JOURS SANS REPAS — comportement inchangé =====================
test('Jour sans repas interrompt toujours le streak (comportement inchangé)', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -2), 1700);
  addMealDay(shiftDate(today, -1), 1700);
  // Aucun repas aujourd'hui.
  assert.strictEqual(calorieStreak(), 0);
});

// ===================== FEEDBACK — les 3 états =====================
test('État 1 — aucun historique qualifiant : "—" / "Commence aujourd\'hui"', () => {
  resetState({ calorieGoal: 1725 });
  const { value, sub } = historyCardText();
  assert.strictEqual(value, '—');
  assert.strictEqual(sub, 'Commence aujourd\'hui');
});

test('État 2 — streak actif : "N jours" / "d\'affilée dans l\'objectif"', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -1), 1700);
  addMealDay(today, 1700);
  const { value, sub } = historyCardText();
  assert.strictEqual(value, '2 jours');
  assert.strictEqual(sub, "d'affilée dans l'objectif");
});

test('État 3 — série interrompue aujourd\'hui : "—" / "Série interrompue"', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -1), 1700);
  addMealDay(today, 2000); // largement hors marge
  const { value, sub } = historyCardText();
  assert.strictEqual(value, '—');
  assert.strictEqual(sub, 'Série interrompue');
});

// ===================== CAS HISTORIQUES (A à E) =====================
test('Cas A — hier qualifiant + aujourd\'hui qualifiant → streak = 2', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -1), 1700);
  addMealDay(today, 1700);
  assert.strictEqual(calorieStreak(), 2);
});

test('Cas B — hier qualifiant + aujourd\'hui hors marge → streak = 0, "Série interrompue"', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -1), 1700);
  addMealDay(today, 2000);
  assert.strictEqual(calorieStreak(), 0);
  assert.strictEqual(historyCardText().sub, 'Série interrompue');
});

test('Cas C — aucun historique + aujourd\'hui hors marge → "Commence aujourd\'hui"', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(today, 2000);
  assert.strictEqual(calorieStreak(), 0);
  assert.strictEqual(historyCardText().sub, 'Commence aujourd\'hui');
});

test('Cas D — plusieurs jours qualifiants + aujourd\'hui hors marge → "Série interrompue"', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  addMealDay(shiftDate(today, -5), 1700);
  addMealDay(shiftDate(today, -4), 1700);
  addMealDay(shiftDate(today, -3), 1700);
  addMealDay(shiftDate(today, -2), 1700);
  addMealDay(shiftDate(today, -1), 1700);
  addMealDay(today, 2000);
  assert.strictEqual(calorieStreak(), 0);
  assert.strictEqual(historyCardText().sub, 'Série interrompue');
});

test('Cas E — ancien streak lointain + trou de plusieurs jours + aujourd\'hui → "Commence aujourd\'hui" (pas de "Série interrompue" artificielle)', () => {
  resetState({ calorieGoal: 1725 });
  const today = todayStr();
  // Un vieux streak, mais séparé d'aujourd'hui par plusieurs jours sans repas.
  addMealDay(shiftDate(today, -10), 1700);
  addMealDay(shiftDate(today, -9), 1700);
  // Trou : rien entre J-8 et J-1.
  addMealDay(today, 2000); // aujourd'hui, hors marge
  assert.strictEqual(calorieStreak(), 0);
  assert.strictEqual(
    historyCardText().sub, 'Commence aujourd\'hui',
    'un vieux streak non "immédiatement actif" hier ne doit pas déclencher "Série interrompue"'
  );
});

// ===================== FLOTTANTS — stabilité du seuil =====================
test('Flottant — objectif non multiple de 50 (1730) : seuil stable et reproductible', () => {
  const threshold = calorieStreakThreshold(1730);
  // 1730 * 1.02 = 1764.6 exactement en décimal ; on vérifie l'absence de bruit
  // de flottant (ex. 1764.5999999999999) en comparant à la valeur arrondie.
  assert.strictEqual(threshold, Math.round(1730 * 1.02 * 100) / 100);
  resetState({ calorieGoal: 1730 });
  const today = todayStr();
  addMealDay(today, threshold);
  assert.ok(calorieStreak() > 0, `kcalIn exactement égal au seuil (${threshold}) doit compter`);
  resetState({ calorieGoal: 1730 });
  addMealDay(today, threshold + 0.01);
  assert.strictEqual(calorieStreak(), 0, 'kcalIn juste au-dessus du seuil ne doit pas compter');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
