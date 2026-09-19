// Tests ciblés — correctif Phase 2.5 / CPU-1 (audit Performance, corrigé ci-après).
//
// Contexte : `weeklyDeficits()` refaisait plusieurs `logEntries.filter(...)` complets
// PAR SEMAINE (jours de la semaine, séances de la semaine) et appelait `dayTotals()`
// (elle-même un `entriesFor(date)` + `.filter()` complet) DEUX FOIS par jour — coût
// mesuré ~O(nb_semaines × taille de l'historique), perceptible (~250ms de blocage
// réel en navigateur) dès quelques milliers de repas. Le correctif introduit un
// index interne `buildDailyDeficitIndex()` construit en une seule passe sur
// `logEntries`, réutilisé pour toutes les semaines. `dayTotals()`/`entriesFor()`
// restent inchangées (utilisées ailleurs dans l'app) — ce test ne couvre QUE le
// chemin `weeklyDeficit()`/`weeklyDeficits()`.
//
// Pas de framework ajouté (cohérent avec le "sans build" de Kalo) : on charge le
// VRAI js/core.js dans un bac à sable `vm`, comme tous les autres tests de tests/.

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
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__bindings = { logEntries, settings };', sandbox);
  Object.assign(sandbox, sandbox.__bindings);
  vm.runInContext('this.__setLogEntries = (v) => { logEntries = v; };', sandbox);
  sandbox.setLogEntries = (v) => sandbox.__setLogEntries(v);
  vm.runInContext('this.__setSettings = (v) => { settings = v; };', sandbox);
  sandbox.setSettings = (v) => sandbox.__setSettings(v);
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

function makeMeal(id, date, kcal, extra) {
  return Object.assign({ id, date, type: 'meal', mealSlot: 'Déjeuner', foodName: 'Aliment', grams: 100,
    kcal, protein: 10, carbs: 10, fat: 5, time: '12:00', source: 'manual' }, extra || {});
}
function makeWorkout(id, date, kcalBurned) {
  return { id, date, type: 'workout', wtype: 'tapis', kcalBurned, time: '08:00' };
}
function makeNote(id, date) {
  return { id, date, type: 'note', text: 'note', time: '20:00' };
}

// ----- Semaine vide -----
test('Semaine vide (aucune entrée) : weeklyDeficits() renvoie un tableau vide', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  assert.strictEqual(sandbox.__w.length, 0);
});

test('Semaine avec uniquement des séances (aucun repas) : absente de weeklyDeficits() (jamais de jour sans repas compté)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([makeWorkout('w1', '2024-06-10', 300)]); // lundi
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  assert.strictEqual(sandbox.__w.length, 0, 'une semaine sans aucun repas ne doit jamais apparaître dans weeklyDeficits()');
});

// ----- Semaine avec repas -----
test('Semaine avec repas : total/deficit corrects pour un seul jour', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([makeMeal('m1', '2024-06-10', 1800)]); // lundi 10 juin 2024
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const w = sandbox.__w;
  assert.strictEqual(w.length, 1);
  assert.strictEqual(w[0].start, '2024-06-10');
  assert.strictEqual(w[0].days.length, 1);
  assert.strictEqual(w[0].days[0].calories, 1800);
  assert.strictEqual(w[0].days[0].deficit, 400); // 2200 - 1800
  assert.strictEqual(w[0].total, 400);
});

// ----- Semaine avec séances (en plus des repas) -----
test('Semaine avec repas + séances : burned informatif, jamais intégré au deficit/total (kcalOut jamais soustrait)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-10', 1800),
    makeWorkout('w1', '2024-06-10', 500),
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const w = sandbox.__w[0];
  assert.strictEqual(w.burned, 500, 'burned doit refléter les séances de la semaine');
  assert.strictEqual(w.days[0].deficit, 400, 'deficit = objectif - kcalIn UNIQUEMENT, jamais objectif - (kcalIn - kcalOut)');
  assert.strictEqual(w.total, 400, 'total ne doit jamais intégrer les calories brûlées (règle produit invariante, CLAUDE.md)');
});

test('Séance seule un jour donné (sans repas ce jour précis, mais un autre jour de la même semaine a un repas) : le jour "séance seule" n\'apparaît pas dans days[], mais ses calories brûlées comptent dans burned', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-10', 1800),   // lundi : repas
    makeWorkout('w1', '2024-06-11', 500), // mardi : séance seule, pas de repas
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const w = sandbox.__w[0];
  assert.strictEqual(w.days.length, 1, 'seul le lundi (avec repas) doit apparaître dans days[]');
  assert.strictEqual(w.days[0].date, '2024-06-10');
  assert.strictEqual(w.burned, 500, 'la séance du mardi doit quand même compter dans burned (comportement identique à avant le correctif)');
});

// ----- Plusieurs types d'entrées (meal + workout + note le même jour) -----
test('Entrées "note" ignorées par weeklyDeficit (ni kcalIn ni burned)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-10', 1800),
    makeWorkout('w1', '2024-06-10', 300),
    makeNote('n1', '2024-06-10'),
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const w = sandbox.__w[0];
  assert.strictEqual(w.days[0].calories, 1800);
  assert.strictEqual(w.burned, 300);
});

// ----- Plusieurs semaines -----
test('Plusieurs semaines : regroupement correct par semaine (lundi->dimanche), triées de la plus récente à la plus ancienne', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-03', 2000), // semaine du 3 juin (lundi)
    makeMeal('m2', '2024-06-10', 1900), // semaine du 10 juin (lundi)
    makeMeal('m3', '2024-06-17', 2100), // semaine du 17 juin (lundi)
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const starts = JSON.parse(vm.runInContext('JSON.stringify(this.__w.map(x => x.start))', sandbox));
  assert.strictEqual(sandbox.__w.length, 3);
  assert.deepStrictEqual(starts, ['2024-06-17', '2024-06-10', '2024-06-03'], 'ordre décroissant attendu (semaine la plus récente en premier)');
});

test('Plusieurs repas le même jour : sommés correctement dans calories/deficit', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-10', 600),
    makeMeal('m2', '2024-06-10', 700),
    makeMeal('m3', '2024-06-10', 500),
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const w = sandbox.__w[0];
  assert.strictEqual(w.days[0].calories, 1800);
  assert.strictEqual(w.days[0].deficit, 400);
});

// ----- weeklyDeficit(startStr) appelable seule (sans index), résultat identique -----
test('weeklyDeficit(startStr) appelée seule (sans index partagé, comme tests/workout-kcal.test.js) donne un résultat identique à celui obtenu via weeklyDeficits()', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setLogEntries([
    makeMeal('m1', '2024-06-10', 1800),
    makeWorkout('w1', '2024-06-11', 500),
    makeMeal('m2', '2024-06-12', 2000),
  ]);
  sandbox.setSettings({ calorieGoal: 2200 });
  vm.runInContext('this.__viaAll = weeklyDeficits()[0]; this.__viaSingle = weeklyDeficit("2024-06-10");', sandbox);
  const a = vm.runInContext('JSON.stringify(this.__viaAll)', sandbox);
  const b = vm.runInContext('JSON.stringify(this.__viaSingle)', sandbox);
  assert.strictEqual(a, b, 'weeklyDeficit() appelée seule doit produire un résultat rigoureusement identique à weeklyDeficits()');
});

// ----- Historique long : pas de crash, résultat exact sur un volume réaliste -----
test('Historique long (1000 jours × 3 repas/jour + séances 1 jour sur 3, ~3600 entrées) : pas de crash, totaux corrects, temps d\'exécution raisonnable', () => {
  const sandbox = loadKaloSandbox();
  const entries = [];
  const start = new Date('2023-01-01T00:00:00');
  for (let d = 0; d < 1000; d++) {
    const dateStr = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    for (let m = 0; m < 3; m++) entries.push(makeMeal(`m${d}_${m}`, dateStr, 400 + m * 10));
    if (d % 3 === 0) entries.push(makeWorkout(`w${d}`, dateStr, 250));
  }
  sandbox.setLogEntries(entries);
  sandbox.setSettings({ calorieGoal: 2200 });
  const t0 = process.hrtime.bigint();
  vm.runInContext('this.__w = weeklyDeficits();', sandbox);
  const t1 = process.hrtime.bigint();
  const ms = Number(t1 - t0) / 1e6;
  const w = sandbox.__w;
  assert.ok(w.length > 100, 'doit couvrir un grand nombre de semaines');
  // Vérifie un jour connu au hasard (jour 500 => 2024-05-15, 3 repas 400+410+420=1230)
  const day500 = new Date(start.getTime() + 500 * 86400000).toISOString().slice(0, 10);
  const week = w.find(wk => day500 >= wk.start && day500 <= wk.end);
  const day = week.days.find(d => d.date === day500);
  assert.strictEqual(day.calories, 1230);
  assert.strictEqual(day.deficit, 2200 - 1230);
  // Non-régression perf : ce calcul ne doit plus dépendre de façon quadratique du
  // nombre de semaines — seuil volontairement large (machine de CI potentiellement
  // lente) pour ne détecter qu'une vraie régression algorithmique, pas une variance
  // normale de machine.
  assert.ok(ms < 500, `weeklyDeficits() sur ~3600 entrées / ~143 semaines a pris ${ms.toFixed(1)}ms — bien au-delà du seuil de non-régression (500ms), possible retour à un scan répété par semaine`);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
