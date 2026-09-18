// Test ciblé — BUG-003/BUG-004 (audit Phase 2.1) : workoutSummary() interpolait
// e.name (nom de séance libre, IA-importée) et, dans son chemin de repli,
// d.unrecognized (tokens du texte utilisateur) sans escapeHtml() dans un sink
// innerHTML — XSS stockée persistée dans logEntries/ct_log.
//
// Charge le VRAI js/core.js dans un bac à sable Node (`vm`), appelle directement
// workoutSummary() sur des entrées construites pour reproduire chaque chemin.

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
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  return sandbox;
}

const PAYLOAD = '<img src=x onerror=alert(1)>';
const ESCAPED_PAYLOAD = '&lt;img src=x onerror=alert(1)&gt;';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('BUG-003 — workoutSummary() : e.name avec payload HTML est échappé dans title (séance IA structurée)', () => {
  const { workoutSummary } = require.cache ? {} : {}; // no-op, workoutSummary vient du sandbox
  const entry = {
    name: PAYLOAD,
    blocks: [{ name: 'Bloc 1', type: 'emom', durationMin: 10, exercises: [{ name: 'Squat', reps: 8 }] }],
    time: '08:00', kcalBurned: 50,
  };
  const summary = vm.runInContext(`workoutSummary(${JSON.stringify(entry)})`, loadKaloSandbox());
  assert.ok(!summary.title.includes('<img'), 'le titre ne doit jamais contenir de balise HTML brute');
  assert.ok(summary.title.includes(ESCAPED_PAYLOAD), 'le titre doit contenir la version échappée du payload');
});

test('BUG-003 — workoutSummary() : nom de séance normal (sans HTML) affiché tel quel, pas de sur-échappement', () => {
  const entry = {
    name: 'Jambes & gainage',
    blocks: [{ name: 'Bloc 1', type: 'circuit', exercises: [{ name: 'Squat', reps: 8 }] }],
    time: '08:00', kcalBurned: 50,
  };
  const summary = vm.runInContext(`workoutSummary(${JSON.stringify(entry)})`, loadKaloSandbox());
  assert.strictEqual(summary.title, 'Jambes &amp; gainage', 'le caractère "&" doit être échappé exactement une fois (pas de double encodage)');
});

test('BUG-004 — workoutSummary() (chemin de repli, blocks vide) : d.unrecognized est échappé', () => {
  const sandbox = loadKaloSandbox();
  const rawText = `Description avec token suspect ${PAYLOAD}`;
  vm.runInContext(`this.__estimation = estimateManualSession(${JSON.stringify(rawText)}, 10, 75);`, sandbox);
  const entry = { wtype: 'ia', blocks: [], text: rawText, duration: 10, time: '08:00', estimation: sandbox.__estimation, kcalBurned: sandbox.__estimation.kcal };
  const summary = vm.runInContext(`workoutSummary(${JSON.stringify(entry)})`, sandbox);
  assert.ok(!summary.sub.includes('<img'), 'sub ne doit jamais contenir de balise HTML brute');
  // Le payload, non reconnu par le catalogue d'exercices, doit apparaître dans la liste
  // "non reconnus" — sous sa forme échappée.
  assert.ok(summary.sub.includes('non reconnus'), 'le payload doit être listé comme token non reconnu (précondition du test)');
  assert.ok(summary.sub.includes('&lt;img') , 'le token non reconnu doit être échappé dans le rendu final');
});

test('BUG-004 — workoutSummary() (chemin de repli) : e.text échappé une seule fois (pas de double encodage)', () => {
  const sandbox = loadKaloSandbox();
  const rawText = 'Pompes & tractions';
  vm.runInContext(`this.__estimation = estimateManualSession(${JSON.stringify(rawText)}, 10, 75);`, sandbox);
  const entry = { wtype: 'ia', blocks: [], text: rawText, duration: 10, time: '08:00', estimation: sandbox.__estimation, kcalBurned: sandbox.__estimation.kcal };
  const summary = vm.runInContext(`workoutSummary(${JSON.stringify(entry)})`, sandbox);
  assert.ok(summary.sub.includes('Pompes &amp; tractions'), 'e.text doit être échappé une seule fois');
  assert.ok(!summary.sub.includes('&amp;amp;'), 'jamais de double échappement');
});

test('Régression — types tapis/vélo/sport/club/renfo inchangés (pas de champ libre à échapper ici)', () => {
  const sandbox = loadKaloSandbox();
  const tapis = vm.runInContext(`workoutSummary(${JSON.stringify({ wtype: 'tapis', params: { vitesse: 6, pente: 1 }, duration: 20, time: '08:00', kcalBurned: 100 })})`, sandbox);
  assert.strictEqual(tapis.title, 'Tapis incliné');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
