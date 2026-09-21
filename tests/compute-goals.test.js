// Test ciblé — CP-12 (audit QA Phase 2.6, T-P2-1) : computeGoals() (js/core.js)
// n'avait aucun test direct, alors qu'il calcule les objectifs affichés partout
// dans l'app (dashboard, onboarding, Réglages). Chaque valeur attendue ci-dessous
// a été calculée une seule fois hors du test (Node direct, formule copiée telle
// quelle depuis js/core.js pour produire les nombres de référence), puis figée en
// dur — le test appelle ensuite la VRAIE fonction chargée depuis js/core.js et
// compare à ces constantes, sans jamais réimplémenter la formule dans le fichier
// de test lui-même.
//
// Règles réelles couvertes (lues dans js/core.js, computeGoals()) :
//   - retourne null si weight/age/height manquant (falsy) ;
//   - BMR Mifflin-St Jeor, formule différente si sexe 'F' ;
//   - facteur d'activité par table, repli à 1.55 si activité inconnue ;
//   - goalState 'loss'/'gain'/'maintain' selon goalWeight vs weight ;
//   - 'maintain' (goalWeight===weight) : AUCUN ajustement de targetKcal (bugfix
//     Brique 11 : pas de déficit/surplus fantôme), weeksToGoal reste 0 ;
//   - warning si le rythme (rate) va dans le sens opposé à l'objectif ;
//   - targetKcal plancher à 1200 kcal ;
//   - rééquilibrage glucides/lipides si carbG tombe sous 50g.

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

function computeGoals(sandbox, profile, weight) {
  vm.runInContext(`this.__g = computeGoals(${JSON.stringify(profile)}, ${JSON.stringify(weight)});`, sandbox);
  return sandbox.__g;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Sans objectif de poids (goalWeight/rate vides) : targetKcal = tdee tel quel, goalState/weeksToGoal/warning à null', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'H', age: '30', height: '180', activity: 'modere', goalWeight: '', rate: '-0.5' }, 80);
  assert.strictEqual(JSON.stringify(g), JSON.stringify({ bmr: 1780, tdee: 2759, targetKcal: 2759, proteinG: 160, carbG: 357, fatG: 77, weeksToGoal: null, warning: null, goalState: null }));
});

test('Perte (goalWeight < weight, rate négatif cohérent) : goalState=loss, déficit appliqué, aucun warning', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'H', age: '35', height: '175', activity: 'sedentaire', goalWeight: '80', rate: '-0.5' }, 90);
  assert.strictEqual(JSON.stringify(g), JSON.stringify({ bmr: 1824, tdee: 2189, targetKcal: 1639, proteinG: 180, carbG: 126, fatG: 46, weeksToGoal: 20, warning: null, goalState: 'loss' }));
});

test('Prise (goalWeight > weight, rate positif cohérent) : goalState=gain, surplus appliqué, aucun warning, formule BMR femme utilisée', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'F', age: '25', height: '165', activity: 'leger', goalWeight: '65', rate: '0.3' }, 60);
  assert.strictEqual(JSON.stringify(g), JSON.stringify({ bmr: 1345, tdee: 1850, targetKcal: 2180, proteinG: 120, carbG: 288, fatG: 61, weeksToGoal: 16.666666666666668, warning: null, goalState: 'gain' }));
});

test('goalWeight === weight (objectif déjà atteint) : goalState=maintain, AUCUN déficit/surplus fantôme (bugfix Brique 11), weeksToGoal=0', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'H', age: '40', height: '178', activity: 'modere', goalWeight: '85', rate: '-0.5' }, 85);
  assert.strictEqual(JSON.stringify(g), JSON.stringify({ bmr: 1768, tdee: 2740, targetKcal: 2740, proteinG: 170, carbG: 344, fatG: 76, weeksToGoal: 0, warning: null, goalState: 'maintain' }));
  assert.strictEqual(g.targetKcal, g.tdee, 'sans ajustement : targetKcal doit rester exactement égal au tdee, jamais un déficit/surplus fantôme');
});

test('Rythme dans le sens opposé à l\'objectif (perte visée mais rate positif) : warning déclenché', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'H', age: '30', height: '175', activity: 'modere', goalWeight: '70', rate: '0.5' }, 80);
  assert.strictEqual(g.goalState, 'loss');
  assert.strictEqual(g.warning, "Le rythme indiqué va dans le sens opposé à ton objectif de poids.");
  assert.strictEqual(g.targetKcal, 3261, 'le rate positif (0.5) applique quand même un SURPLUS malgré un objectif de perte : comportement réel, le warning informe sans corriger le calcul');
});

test('Rythme dans le sens opposé à l\'objectif (prise visée mais rate négatif) : warning déclenché', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'H', age: '30', height: '175', activity: 'modere', goalWeight: '90', rate: '-0.5' }, 80);
  assert.strictEqual(g.goalState, 'gain');
  assert.strictEqual(g.warning, "Le rythme indiqué va dans le sens opposé à ton objectif de poids.");
  assert.strictEqual(g.targetKcal, 2161);
});

test('Plancher à 1200 kcal : un déficit qui calculerait moins est remonté à exactement 1200', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'F', age: '55', height: '150', activity: 'sedentaire', goalWeight: '40', rate: '-1.0' }, 45);
  assert.strictEqual(g.targetKcal, 1200);
});

test('Rééquilibrage glucides/lipides : quand carbG tomberait sous 50g (gros poids + targetKcal au plancher), carbG est forcé à 50 et fatG recalculé (min 20)', () => {
  const sandbox = loadSandbox();
  const g = computeGoals(sandbox, { sex: 'F', age: '60', height: '150', activity: 'sedentaire', goalWeight: '100', rate: '-1.5' }, 120);
  assert.strictEqual(g.targetKcal, 1200, 'précondition : le plancher est bien atteint dans ce scénario');
  assert.strictEqual(g.carbG, 50, 'carbG ne doit jamais descendre sous 50g, même à poids élevé et déficit extrême');
  assert.strictEqual(g.fatG, 20, 'fatG recalculé après le forçage de carbG (min 20, jamais négatif ni absurdement bas)');
});

test('Activité inconnue : repli sur le facteur 1.55 (identique à "modere"), pas de plantage ni de NaN', () => {
  const sandbox = loadSandbox();
  const gUnknown = computeGoals(sandbox, { sex: 'H', age: '30', height: '180', activity: 'un_type_qui_nexiste_pas', goalWeight: '', rate: '' }, 80);
  const gModere = computeGoals(sandbox, { sex: 'H', age: '30', height: '180', activity: 'modere', goalWeight: '', rate: '' }, 80);
  assert.strictEqual(gUnknown.tdee, gModere.tdee, 'une activité non reconnue doit se comporter exactement comme "modere" (facteur 1.55 par défaut)');
  assert.ok(Number.isFinite(gUnknown.tdee), 'jamais de NaN propagé');
});

test('Retourne null si age/height/weight manquant (chacun individuellement) — aucun calcul partiel', () => {
  const sandbox = loadSandbox();
  const base = { sex: 'H', height: '180', activity: 'modere', goalWeight: '', rate: '' };
  assert.strictEqual(computeGoals(sandbox, { ...base, age: '' }, 80), null, 'age manquant');
  assert.strictEqual(computeGoals(sandbox, { sex: 'H', age: '30', activity: 'modere', goalWeight: '', rate: '', height: '' }, 80), null, 'height manquant');
  assert.strictEqual(computeGoals(sandbox, { sex: 'H', age: '30', height: '180', activity: 'modere', goalWeight: '', rate: '' }, 0), null, 'weight à 0/absent');
});

test('proteinG = round(weight * 2), indépendant du reste du calcul (vérifié sur plusieurs poids)', () => {
  const sandbox = loadSandbox();
  const profile = { sex: 'H', age: '30', height: '180', activity: 'modere', goalWeight: '', rate: '' };
  assert.strictEqual(computeGoals(sandbox, profile, 73.4).proteinG, 147); // round(146.8)
  assert.strictEqual(computeGoals(sandbox, profile, 55).proteinG, 110);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
