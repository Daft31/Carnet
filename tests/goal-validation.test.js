// Test ciblé — BUG-008 (audit Phase 2.1) : les objectifs (calories/protéines/
// glucides/lipides, saveGoals.onclick) acceptaient une valeur négative sans
// validation JS (parseFloat(...)||fallback ne filtre que 0/NaN, pas le signe).
//
// Extrait le corps réel de saveGoals.onclick depuis js/ui.js et le rejoue dans un
// bac à sable Node (`vm`) chargeant le vrai js/core.js, avec un stub minimal des 4
// <input> lus par ce handler.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function extractSaveGoalsBody() {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const marker = "document.getElementById('saveGoals').onclick=()=>{";
  const idx = uiSrc.indexOf(marker);
  assert.ok(idx !== -1, 'saveGoals.onclick introuvable dans js/ui.js');
  const bodyStart = idx + marker.length;
  const bodyEnd = uiSrc.indexOf('\n    };', bodyStart);
  return uiSrc.slice(bodyStart, bodyEnd);
}

function loadKaloSandbox(inputValues) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const inputs = {
    goalKcal: { value: String(inputValues.goalKcal) },
    goalP: { value: String(inputValues.goalP) },
    goalC: { value: String(inputValues.goalC) },
    goalF: { value: String(inputValues.goalF) },
  };
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: (id) => inputs[id] || { className: '', innerHTML: '', classList: { add(){}, remove(){} } } },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  return sandbox;
}

function runSaveGoals(inputValues) {
  const sandbox = loadKaloSandbox(inputValues);
  const body = extractSaveGoalsBody();
  vm.runInContext(`(function(){ ${body} })();`, sandbox);
  vm.runInContext(`this.__settings = settings;`, sandbox);
  return sandbox.__settings;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('Valeur positive : acceptée telle quelle (comportement inchangé)', () => {
  const s = runSaveGoals({ goalKcal: 2000, goalP: 150, goalC: 200, goalF: 60 });
  assert.strictEqual(s.calorieGoal, 2000);
  assert.strictEqual(s.proteinGoal, 150);
  assert.strictEqual(s.carbGoal, 200);
  assert.strictEqual(s.fatGoal, 60);
});

test('Valeur à 0 : comportement préexistant inchangé (repli sur le fallback, comme avant ce correctif)', () => {
  const s = runSaveGoals({ goalKcal: 0, goalP: 0, goalC: 0, goalF: 0 });
  // calorieGoal retombe sur l'ancienne valeur des settings (2200 par défaut du
  // sandbox), proteinGoal/carbGoal/fatGoal retombent sur 0 — exactement le
  // comportement du code original (v>0 se comporte comme v||fallback pour 0/NaN).
  assert.strictEqual(s.calorieGoal, 2200);
  assert.strictEqual(s.proteinGoal, 0);
  assert.strictEqual(s.carbGoal, 0);
  assert.strictEqual(s.fatGoal, 0);
});

test('Valeur négative : jamais enregistrée comme objectif actif (BUG-008)', () => {
  const s = runSaveGoals({ goalKcal: -2200, goalP: -50, goalC: -30, goalF: -20 });
  assert.notStrictEqual(s.calorieGoal, -2200);
  assert.ok(s.calorieGoal > 0, 'calorieGoal doit rester positif (repli sur l\'ancienne valeur)');
  assert.strictEqual(s.calorieGoal, 2200, 'repli sur l\'ancien objectif, jamais sur une valeur négative');
  assert.ok(s.proteinGoal >= 0 && s.proteinGoal !== -50);
  assert.ok(s.carbGoal >= 0 && s.carbGoal !== -30);
  assert.ok(s.fatGoal >= 0 && s.fatGoal !== -20);
});

test('Valeur non numérique : comportement préexistant inchangé (repli sur fallback)', () => {
  const s = runSaveGoals({ goalKcal: 'abc', goalP: 'abc', goalC: 'abc', goalF: 'abc' });
  assert.strictEqual(s.calorieGoal, 2200);
  assert.strictEqual(s.proteinGoal, 0);
  assert.strictEqual(s.carbGoal, 0);
  assert.strictEqual(s.fatGoal, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
