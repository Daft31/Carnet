// Test ciblé — P1-1 (audit Phase 2.2) : todayStr()/fmtDate() utilisaient
// `d.toISOString().slice(0,10)`, qui convertit en UTC avant de tronquer. Pour un
// utilisateur à l'est de UTC (ex. France, UTC+1/+2), pendant les 1-2h suivant
// minuit local, ça renvoyait la date de la VEILLE — décalant silencieusement
// currentDate, les repas/séances/pesées/todos du jour, et calorieStreak().
//
// Ce fichier fixe process.env.TZ AVANT tout chargement de core.js (Node relit TZ
// à chaque construction de Date, pas besoin de sous-processus) pour reproduire
// fidèlement le fuseau concerné, puis charge le VRAI js/core.js dans un bac à
// sable `vm`, avec une classe Date substituée uniquement pour figer "maintenant"
// à un instant précis (les dates explicites du code, ex. `new Date(dateStr+'T12:00:00')`
// dans shiftDate(), restent inchangées et testées telles quelles).
//
// Exécution : node tests/date-locale.test.js

process.env.TZ = 'Europe/Paris'; // UTC+1 (hiver) / UTC+2 (été) — fuseau concerné par le bug

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// `nowUTCIso` : instant UTC à figer pour `new Date()` sans argument. Les appels
// avec arguments (ex. `new Date(dateStr+'T12:00:00')` dans shiftDate/daysBetween)
// passent par le vrai Date natif, inchangés.
function loadKaloSandbox(nowUTCIso) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  class FixedNowDate extends Date {
    constructor(...args) {
      if (args.length === 0) super(nowUTCIso);
      else super(...args);
    }
  }
  const sandbox = {
    localStorage,
    console,
    window: {},
    navigator: { userAgent: 'node-test' },
    Date: FixedNowDate,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext(
    'this.__bindings = { logEntries, currentDate, settings };',
    sandbox
  );
  Object.assign(sandbox, sandbox.__bindings);
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test("Juste après minuit local en UTC+1 (hiver) : todayStr() renvoie le jour LOCAL, pas le jour UTC", () => {
  // 2026-01-15T23:30:00Z = 2026-01-16 00:30 heure de Paris (UTC+1, hors DST).
  // L'ancien code (toISOString().slice(0,10)) renvoyait "2026-01-15" (faux).
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z');
  assert.strictEqual(sandbox.todayStr(), '2026-01-16');
});

test("Juste après minuit local en UTC+2 (été, DST) : todayStr() renvoie le jour LOCAL", () => {
  // 2026-07-14T22:30:00Z = 2026-07-15 00:30 heure de Paris (UTC+2, DST actif).
  const sandbox = loadKaloSandbox('2026-07-14T22:30:00Z');
  assert.strictEqual(sandbox.todayStr(), '2026-07-15');
});

test("En pleine journée locale : todayStr() reste correct (pas de régression)", () => {
  // 2026-03-10T14:00:00Z = 2026-03-10 15:00 heure de Paris — même jour des deux côtés.
  const sandbox = loadKaloSandbox('2026-03-10T14:00:00Z');
  assert.strictEqual(sandbox.todayStr(), '2026-03-10');
});

test("currentDate (calculé à l'ouverture de l'app via todayStr()) suit la date locale, pas UTC", () => {
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z');
  assert.strictEqual(sandbox.currentDate, '2026-01-16');
});

test("shiftDate() n'est pas affecté par le correctif : ancrage midi local déjà correct avant/après", () => {
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z');
  assert.strictEqual(sandbox.shiftDate('2026-01-16', -1), '2026-01-15');
  assert.strictEqual(sandbox.shiftDate('2026-01-16', 1), '2026-01-17');
  // Traversée de fin de mois / année, toujours cohérent.
  assert.strictEqual(sandbox.shiftDate('2026-01-31', 1), '2026-02-01');
  assert.strictEqual(sandbox.shiftDate('2025-12-31', 1), '2026-01-01');
});

test("daysBetween() reste correct après le correctif", () => {
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z');
  assert.strictEqual(sandbox.daysBetween('2026-01-10', '2026-01-16'), 6);
});

test("calorieStreak() : un repas loggué à 00:30 heure de Paris compte pour le bon jour (pas la veille)", () => {
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z'); // "aujourd'hui" local = 2026-01-16
  sandbox.settings.calorieGoal = 2000;
  // Repas loggués sur le jour LOCAL réel (16), pas sur le jour UTC erroné (15).
  sandbox.logEntries.push(
    { id: 'a', date: '2026-01-16', type: 'meal', kcal: 1800, protein: 100, carbs: 200, fat: 50 },
    { id: 'b', date: '2026-01-15', type: 'meal', kcal: 1900, protein: 100, carbs: 200, fat: 50 }
  );
  // calorieStreak() part de todayStr() = "2026-01-16" : les deux jours consécutifs comptent.
  assert.strictEqual(sandbox.calorieStreak(), 2);
});

test("Régression — dateLabel() distingue toujours correctement Aujourd'hui/Hier/Demain avec le nouveau fmtDate()", () => {
  const sandbox = loadKaloSandbox('2026-01-15T23:30:00Z'); // "aujourd'hui" local = 2026-01-16
  assert.strictEqual(sandbox.dateLabel('2026-01-16'), "Aujourd'hui");
  assert.strictEqual(sandbox.dateLabel('2026-01-15'), 'Hier');
  assert.strictEqual(sandbox.dateLabel('2026-01-17'), 'Demain');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
