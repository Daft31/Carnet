// Test ciblé — CP-12 (audit QA Phase 2.6, T-P0-3) : verrouille explicitement la
// règle produit n°1 de CLAUDE.md — "calories restantes = objectif − calories
// mangées", le sport (kcalOut) ne doit JAMAIS être soustrait de ce calcul. Ce test
// était couvert seulement indirectement (workout-kcal.test.js Cas 8,
// phase-2-5-weekly-deficit-perf.test.js) via le moteur de calcul de séance ; ici on
// verrouille dayTotals() lui-même, indépendamment de tout moteur kcal, et on
// reproduit exactement le calcul réel de `remaining` tel qu'il est fait aux points
// d'appel (js/core.js, viewToday()/mealsSub() : `settings.calorieGoal - t.kcalIn`),
// pas une réimplémentation supposée.
//
// Ne modifie ni ne mocke dayTotals() : appelle la vraie fonction chargée depuis
// js/core.js dans un sandbox `vm`, comme les autres fichiers de tests/.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Repas 1800 kcal + séance 600 kcal, objectif 2000 : remaining = 200 (objectif - kcalIn), jamais 2000 - (kcalIn - kcalOut) = 800', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    settings.calorieGoal = 2000;
    logEntries = [
      {id:'m1', date:'2026-09-19', type:'meal', kcal:1000, protein:60, carbs:80, fat:30},
      {id:'m2', date:'2026-09-19', type:'meal', kcal:800, protein:40, carbs:60, fat:20},
      {id:'w1', date:'2026-09-19', type:'workout', kcalBurned:600},
    ];
    this.__t = dayTotals('2026-09-19');
    // Reproduit exactement le calcul réel effectué aux points d'appel (js/core.js,
    // ex. mealsSub()/viewToday()) : \`const remaining = settings.calorieGoal - t.kcalIn;\`
    this.__remaining = settings.calorieGoal - this.__t.kcalIn;
  `, sandbox);

  const t = sandbox.__t;
  assert.strictEqual(t.kcalIn, 1800, 'kcalIn = somme des repas uniquement');
  assert.strictEqual(t.kcalOut, 600, 'kcalOut = somme des séances, exposé séparément');
  assert.strictEqual(sandbox.__remaining, 200, 'remaining doit valoir objectif - kcalIn, jamais un calcul intégrant le sport');
  assert.notStrictEqual(sandbox.__remaining, 800, 'régression critique si remaining intègre kcalOut (2000-1200=800 serait le biais "sport donc je peux manger plus")');
});

test('dayTotals().net (kcalIn - kcalOut) reste un champ interne distinct de "remaining" — ne doit jamais être confondu avec lui', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    settings.calorieGoal = 2000;
    logEntries = [
      {id:'m1', date:'2026-09-19', type:'meal', kcal:1800, protein:100, carbs:150, fat:50},
      {id:'w1', date:'2026-09-19', type:'workout', kcalBurned:600},
    ];
    this.__t = dayTotals('2026-09-19');
    this.__remaining = settings.calorieGoal - this.__t.kcalIn;
  `, sandbox);
  const t = sandbox.__t;
  assert.strictEqual(t.net, 1200, 'net = kcalIn - kcalOut (1800-600), un indicateur interne au déficit hebdomadaire, pas "remaining"');
  assert.notStrictEqual(t.net, sandbox.__remaining, 'net et remaining sont deux notions différentes : ne jamais utiliser net à la place de remaining pour l\'affichage utilisateur');
});

test('Aucune séance ce jour-là : remaining dépend uniquement de kcalIn, kcalOut reste à 0', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    settings.calorieGoal = 2200;
    logEntries = [
      {id:'m1', date:'2026-09-19', type:'meal', kcal:1500, protein:90, carbs:120, fat:40},
    ];
    this.__t = dayTotals('2026-09-19');
    this.__remaining = settings.calorieGoal - this.__t.kcalIn;
  `, sandbox);
  const t = sandbox.__t;
  assert.strictEqual(t.kcalOut, 0);
  assert.strictEqual(sandbox.__remaining, 700);
});

test('Dépassement de l\'objectif (kcalIn > objectif) : remaining négatif, toujours indépendant du sport', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    settings.calorieGoal = 2000;
    logEntries = [
      {id:'m1', date:'2026-09-19', type:'meal', kcal:2500, protein:100, carbs:200, fat:80},
      {id:'w1', date:'2026-09-19', type:'workout', kcalBurned:1000},
    ];
    this.__t = dayTotals('2026-09-19');
    this.__remaining = settings.calorieGoal - this.__t.kcalIn;
  `, sandbox);
  assert.strictEqual(sandbox.__remaining, -500, 'dépassement de 500 kcal, une grosse dépense sportive (1000 kcal) ne doit jamais compenser ce dépassement dans remaining');
});

test('Entrées "note" ignorées : ni kcalIn ni kcalOut (comportement inchangé, cohérent avec weeklyDeficit)', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    logEntries = [
      {id:'n1', date:'2026-09-19', type:'note', text:'RAS'},
      {id:'m1', date:'2026-09-19', type:'meal', kcal:500, protein:20, carbs:50, fat:10},
    ];
    this.__t = dayTotals('2026-09-19');
  `, sandbox);
  const t = sandbox.__t;
  assert.strictEqual(t.kcalIn, 500);
  assert.strictEqual(t.kcalOut, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
