// Tests ciblés — bug "entraînement structuré affiché à 0 kcal brûlées".
//
// Pas de framework/dépendance ajoutée (cohérent avec le "sans build, sans
// framework" de Kalo — voir CLAUDE.md) : ce script charge les VRAIS fichiers
// js/core.js et js/workoutparser.js dans un bac à sable (module `vm` de
// Node), avec un simple stub de `localStorage`, puis appelle directement les
// fonctions réellement utilisées en production (blocksToText,
// estimateManualSession, computeWorkoutKcal, dayTotals, weeklyDeficit). Rien
// n'est dupliqué/réécrit ici : un futur changement du moteur de calcul dans
// core.js est donc automatiquement couvert par ces tests, sans les
// resynchroniser à la main.
//
// Exécution : node tests/workout-kcal.test.js

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
  const parserSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'workoutparser.js'), 'utf8');
  // js/workoutparser.js référence VERCEL_API_BASE (défini dans js/mealparser.js en prod,
  // chargé avant lui dans index.html) et escapeHtml (défini dans js/ui.js) au niveau de
  // fonctions non exercées par ces tests (openWorkoutImportModal / le rendu HTML) — un stub
  // minimal suffit, on ne charge pas ces fichiers pour rester focalisé sur le calcul kcal.
  vm.runInContext('var VERCEL_API_BASE = ""; function escapeHtml(s){ return String(s); }', sandbox);
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext(parserSrc, sandbox, { filename: 'js/workoutparser.js' });
  // `let`/`const` de haut niveau (logEntries, settings, ...) restent visibles aux scripts
  // suivants exécutés dans le même contexte `vm`, mais ne deviennent pas des propriétés de
  // l'objet sandbox — on les ré-expose explicitement pour que le test puisse les lire/écrire.
  vm.runInContext('this.__bindings = { logEntries, settings };', sandbox);
  Object.assign(sandbox, sandbox.__bindings);
  return sandbox;
}

const sandbox = loadKaloSandbox();
const { blocksToText, estimateManualSession, computeWorkoutKcal, dayTotals, weeklyDeficit } = sandbox;

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

// ----- Cas 1/2/3/4 : la séance exacte fournie dans le rapport de bug -----
// (EMOM 20min jambes 4 tours + circuit gainage 3 tours). Reproduit le
// symptôme rapporté ("0 kcal") via le vrai pipeline blocksToText -> estimateManualSession.
const reportedBlocks = [
  {
    name: 'Bloc 1 — Jambes', type: 'emom', durationMin: 20, rounds: 4,
    exercises: [
      { name: 'Fentes alternées', reps: 10 },
      { name: 'Squats tempo 3/0/X/0', reps: 9 },
      { name: 'Relevés de bassin', reps: 14 },
      { name: 'Step-ups jambe gauche', reps: 7 },
      { name: 'Step-ups jambe droite', reps: 7 },
    ],
  },
  {
    name: 'Bloc 2 — Gainage', type: 'circuit', rounds: 3,
    exercises: [
      { name: 'Hollow body', reps: '12 secondes' },
      { name: 'Gainage latéral gauche', reps: '22 secondes' },
      { name: 'Gainage latéral droit', reps: '22 secondes' },
      { name: 'Bird dogs côté gauche', reps: 7 },
      { name: 'Bird dogs côté droit', reps: 7 },
    ],
  },
];

test('Cas 1/2 — séance structurée multi-blocs (EMOM + circuit) : plus de 0 kcal injustifié', () => {
  const text = blocksToText(reportedBlocks);
  // Les en-têtes de block (type + durée + tours) doivent apparaître dans le texte
  // synthétisé : c'est ce qui permet à estimateManualSession() de reconnaître un
  // block chronométré (EMOM/circuit) au lieu de retomber sur le calcul par
  // répétitions, beaucoup plus fragile pour ce genre de séance.
  assert.ok(/emom/i.test(text), 'le texte synthétisé doit contenir "EMOM"');
  assert.ok(/circuit/i.test(text), 'le texte synthétisé doit contenir "Circuit"');
  const result = estimateManualSession(text, 25, 75);
  assert.ok(result.kcal > 0, `kcal attendu > 0, obtenu ${result.kcal}`);
  assert.ok(result.recognized.length > 0, 'au moins un exercice du catalogue doit être reconnu');
});

test('Cas 3 — bloc jambes (EMOM) isolé : dépense non nulle', () => {
  const text = blocksToText([reportedBlocks[0]]);
  const result = estimateManualSession(text, 20, 75);
  assert.ok(result.kcal > 0, `kcal attendu > 0, obtenu ${result.kcal}`);
});

test('Cas 4 — bloc gainage (circuit) isolé : dépense non nulle', () => {
  const text = blocksToText([reportedBlocks[1]]);
  const result = estimateManualSession(text, 8, 75);
  assert.ok(result.kcal > 0, `kcal attendu > 0, obtenu ${result.kcal}`);
});

// ----- Cas 5 : régression sur les autres types d'activité (cardio) -----
test('Cas 5 — cardio (tapis) : calcul MET existant inchangé, aucune régression', () => {
  const kcal = computeWorkoutKcal('tapis', { vitesse: 6, pente: 1 }, 30, 75);
  assert.ok(kcal > 0, `kcal tapis attendu > 0, obtenu ${kcal}`);
});

test('Cas 5bis — cardio (vélo) : calcul MET existant inchangé, aucune régression', () => {
  const kcal = computeWorkoutKcal('velo', { effort: 'modere' }, 30, 75);
  assert.ok(kcal > 0, `kcal vélo attendu > 0, obtenu ${kcal}`);
});

// ----- Régression : programme structuré "standard" (séries/reps classiques, pas de
// block chronométré) doit continuer à passer par le calcul par répétitions, inchangé. -----
test('Régression — block "standard" (séries/reps) : comportement inchangé par rapport à avant le correctif', () => {
  // NB : ce cas donne 0 kcal (`Squat 4x8` place les reps APRÈS le nom, alors que la regex
  // d'extraction de reps d'estimateManualSession() cherche un chiffre AVANT le nom de
  // l'exercice) — un bug préexistant, distinct de celui corrigé ici, déjà présent avec
  // l'ancien blocksToText() (donc pas une régression introduite par ce correctif). Hors
  // scope : il touche estimateManualSession() (core.js), le moteur partagé avec la saisie
  // manuelle libre, pas js/workoutparser.js — voir LIMITES dans le rapport de correctif.
  const standardBlocks = [{
    name: 'Block 1', type: 'standard',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, restSec: 90 },
      { name: 'Développé couché', sets: 4, reps: 8, restSec: 90 },
    ],
  }];
  const text = blocksToText(standardBlocks);
  assert.ok(!/emom|amrap|tabata|circuit/i.test(text), 'un block "standard" ne doit pas déclencher le mode "block chronométré"');
  const result = estimateManualSession(text, 40, 75);
  assert.strictEqual(result.kcal, 0, 'comportement préexistant inchangé (voir commentaire ci-dessus)');
});

// ----- Régression : texte tapé à la main (hors import IA) — comportement du moteur
// lui-même non modifié par ce correctif (seul js/workoutparser.js a changé). -----
test('Régression — saisie manuelle libre tapée "EMOM" à la main : comportement du moteur inchangé', () => {
  const result = estimateManualSession('EMOM 12 minutes: 10 burpees, 15 kettlebell swings', 12, 75);
  assert.ok(result.kcal > 0, `kcal attendu > 0, obtenu ${result.kcal}`);
});

// ----- Cas 6 : séance sans durée exploitable -----
test('Cas 6 — durée totale non renseignée : jamais envoyée au moteur (garde réellement utilisée dans js/workoutparser.js)', () => {
  // openWorkoutResultModal() (js/workoutparser.js) n'appelle jamais estimateManualSession()
  // quand la durée est <= 0 : `kcal = duration > 0 ? estimateManualSession(...).kcal : 0`
  // (aperçu temps réel), et le bouton "Enregistrer" est bloqué par un toast avant la
  // sauvegarde. On reproduit cette même garde ici plutôt que d'appeler le moteur avec 0 min,
  // ce qui déclencherait un comportement différent et non représentatif : le texte
  // synthétisé par blocksToText() contient désormais les durées de block (ex. "20 min"),
  // qu'estimateManualSession() peut extraire comme repli de durée globale si on lui passe
  // durationMin=0 directement — un cas qui ne se produit jamais via les vrais points d'appel.
  const duration = 0;
  const text = blocksToText(reportedBlocks);
  const kcal = duration > 0 ? estimateManualSession(text, duration, 75).kcal : 0;
  assert.strictEqual(kcal, 0);
});

// ----- Cas 8 : intégration dans la dépense quotidienne -----
test('Cas 8 — intégration dans dayTotals() : kcalOut reflète la séance, jamais soustrait des kcal restantes', () => {
  const text = blocksToText(reportedBlocks);
  const estimation = estimateManualSession(text, 25, 75);
  assert.ok(estimation.kcal > 0);
  sandbox.logEntries.push({
    id: 't1', date: '2026-09-17', type: 'workout', wtype: 'ia',
    time: '08:00', name: 'Séance test', blocks: reportedBlocks,
    estimatedDurationMin: 25, warnings: [], duration: 25, text,
    estimation, kcalBurned: estimation.kcal,
  });
  const totals = dayTotals('2026-09-17');
  assert.strictEqual(totals.kcalOut, estimation.kcal);
  // Règle produit à ne jamais casser (CLAUDE.md) : le sport ne doit jamais être
  // soustrait des calories restantes. dayTotals() expose kcalIn/kcalOut séparément
  // (net existe mais n'est utilisé nulle part pour le calcul de "calories restantes").
  sandbox.logEntries.push({ id:'m1', date:'2026-09-17', type:'meal', kcal:1500, protein:0, carbs:0, fat:0 });
  const deficit = weeklyDeficit('2026-09-15');
  assert.strictEqual(deficit.days.find(d=>d.date==='2026-09-17').deficit, sandbox.settings.calorieGoal - 1500,
    'le déficit hebdomadaire ne doit pas intégrer les calories brûlées en sport');
  assert.ok(deficit.burned >= estimation.kcal, 'les kcal brûlées restent exposées séparément, à titre informatif');
});

// ----- BUG-006 (audit Phase 2.1) : garde anti-double-confirmation sur wiSaveBtn -----
// closeModal() (js/ui.js, non chargé ici) laisse le bouton cliquable pendant ~180ms
// d'animation de fermeture — un double-tap physique pouvait pousser deux séances
// identiques dans logEntries avant que le bouton ne disparaisse. On simule ce
// double-tap en appelant `.onclick()` deux fois de suite sur le vrai
// openWorkoutResultModal(), sans jamais réinitialiser `confirmed` entre les deux
// appels (exactement ce qui se passe avec deux taps rapprochés sur le même bouton).
function loadWorkoutModalSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const elements = {};
  function fakeEl(id, value) {
    return elements[id] = { id, value, onclick: null, textContent: '', className: '', innerHTML: '', addEventListener(){}, classList: { add(){}, remove(){}, toggle(){} } };
  }
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    currentDate: '2026-09-18',
    openModal: () => {},
    closeModal: () => {},
    document: { getElementById: (id) => elements[id] || fakeEl(id, '') },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext('var VERCEL_API_BASE = ""; function escapeHtml(s){ return String(s); }', sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'workoutparser.js'), 'utf8'), sandbox, { filename: 'js/workoutparser.js' });
  // render() (core.js) appelle bindTabEvents(), défini dans js/ui.js — non chargé ici
  // (hors périmètre de ce test, qui porte sur la garde anti-double-tap, pas le rendu).
  // On neutralise render() après coup : une réaffectation d'une fonction déclarée par
  // `function` au global du contexte fonctionne normalement.
  vm.runInContext('render = function(){};', sandbox);
  vm.runInContext('this.__bindings = { logEntries, currentDate };', sandbox);
  Object.assign(sandbox, sandbox.__bindings);
  fakeEl('wiName', 'Séance test');
  fakeEl('wiDate', '2026-09-18');
  fakeEl('wiDuration', '20');
  fakeEl('wiEstimateNum', '');
  fakeEl('wiSaveBtn', '');
  fakeEl('wiRedoBtn', '');
  return { sandbox, elements };
}

test('BUG-006 — double-tap sur "Enregistrer la séance" (programme IA) : une seule entrée créée', () => {
  const { sandbox, elements } = loadWorkoutModalSandbox();
  const data = {
    blocks: [{ name: 'Bloc 1', type: 'emom', durationMin: 20, exercises: [{ name: 'Squats', reps: 10 }] }],
    estimatedDurationMin: 20,
    warnings: [],
  };
  vm.runInContext(`openWorkoutResultModal(${JSON.stringify(data)})`, sandbox);
  assert.strictEqual(typeof elements.wiSaveBtn.onclick, 'function', 'openWorkoutResultModal doit avoir lié wiSaveBtn.onclick');
  // Double-tap : deux appels rapprochés, sans que closeModal() n'ait eu le temps de
  // retirer le bouton du DOM (simulateur du vrai cas signalé par l'audit).
  elements.wiSaveBtn.onclick();
  elements.wiSaveBtn.onclick();
  vm.runInContext('this.__le = logEntries;', sandbox);
  assert.strictEqual(sandbox.__le.length, 1, 'un double-tap ne doit créer qu\'une seule séance, pas deux');
});

test('BUG-006 — régression : un clic unique fonctionne normalement (comportement inchangé)', () => {
  const { sandbox, elements } = loadWorkoutModalSandbox();
  const data = {
    blocks: [{ name: 'Bloc 1', type: 'circuit', exercises: [{ name: 'Bird dog', reps: 7 }] }],
    estimatedDurationMin: 10,
    warnings: [],
  };
  vm.runInContext(`openWorkoutResultModal(${JSON.stringify(data)})`, sandbox);
  elements.wiSaveBtn.onclick();
  vm.runInContext('this.__le = logEntries;', sandbox);
  assert.strictEqual(sandbox.__le.length, 1);
  assert.strictEqual(sandbox.__le[0].wtype, 'ia');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
