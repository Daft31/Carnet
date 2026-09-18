// Test ciblé — P2-6 (audit Phase 2.2) : workoutBlockHtml() (js/workoutparser.js)
// supposait block.exercises toujours tableau (`block.exercises.length`), sans
// garde Array.isArray() — contrairement à blocksToText()/workoutSummary()
// (js/core.js), déjà défensifs sur ce même champ. Un bloc IA malformé (exercises
// manquant/non-tableau) faisait planter le rendu de la modale de résultat AVANT
// toute sauvegarde (aucune perte de donnée persistée, mais le flux de
// sauvegarde de séance restait bloqué pour l'utilisateur).
//
// Même approche que tests/workout-kcal.test.js : charge les VRAIS js/core.js et
// js/workoutparser.js dans un bac à sable `vm`, avec le même stub minimal
// d'escapeHtml/VERCEL_API_BASE.

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
  const sandbox = { localStorage, console, window: {}, navigator: { userAgent: 'node-test' } };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  const parserSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'workoutparser.js'), 'utf8');
  vm.runInContext('var VERCEL_API_BASE = ""; function escapeHtml(s){ return (s==null?"":String(s)).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c])); }', sandbox);
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext(parserSrc, sandbox, { filename: 'js/workoutparser.js' });
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('workoutBlockHtml() : bloc sans champ exercises du tout ne plante pas, affiche "Aucun exercice détaillé."', () => {
  const sandbox = loadKaloSandbox();
  let html;
  assert.doesNotThrow(() => {
    html = sandbox.workoutBlockHtml({ name: 'Bloc mystère', type: 'circuit' });
  });
  assert.ok(html.includes('Aucun exercice détaillé.'));
});

test('workoutBlockHtml() : bloc avec exercises non-tableau (ex. null) ne plante pas', () => {
  const sandbox = loadKaloSandbox();
  assert.doesNotThrow(() => {
    sandbox.workoutBlockHtml({ name: 'Bloc mystère', type: 'emom', exercises: null });
  });
});

test('workoutBlockHtml() : bloc avec exercises un objet (pas un tableau) ne plante pas', () => {
  const sandbox = loadKaloSandbox();
  assert.doesNotThrow(() => {
    sandbox.workoutBlockHtml({ name: 'Bloc mystère', type: 'standard', exercises: { not: 'an array' } });
  });
});

test('Régression — bloc valide avec exercices : rendu inchangé', () => {
  const sandbox = loadKaloSandbox();
  const html = sandbox.workoutBlockHtml({ name: 'Bloc jambes', type: 'circuit', exercises: [{ name: 'Squats', reps: 10 }] });
  assert.ok(html.includes('Squats'));
  assert.ok(!html.includes('Aucun exercice détaillé.'));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
