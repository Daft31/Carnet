// Test ciblé — Phase 3, Lot A (édition en place des entrées journalisées) : jusqu'ici
// une entrée logEntries (repas/séance) déjà enregistrée ne pouvait être corrigée qu'en
// la supprimant puis en la recréant — aucun chemin de modification en place n'existait.
// openEditMealEntryModal()/openEditWorkoutEntryModal() (js/ui.js) couvrent ce trou :
// formulaire prérempli à partir de l'entrée réelle, sauvegarde par remplacement
// `logEntries[idx] = {...}` (jamais un `push`), `id` conservé.
//
// Même technique que tests/qty-modal-manual-meal-add.test.js : chargement des VRAIS
// js/core.js + js/ui.js dans un bac à sable Node (`vm`), DOM minimal mémoïsé par id
// (getElementById). render() est neutralisée (le rendu DOM complet qui suivrait est
// hors propos ici — seule l'intégrité de logEntries/la persistance sont testées).
//
// Important (limite du DOM mémoïsé, même famille que les autres fichiers de tests/) :
// `openModal()` écrit le template HTML dans `#modal-root`.innerHTML — un vrai texte,
// jamais parsé en éléments réels. Donc `document.getElementById('emeKcal')` après coup
// renvoie un nouvel élément VIERGE (valeur ''), pas un champ prérempli avec la valeur
// écrite dans la chaîne HTML. Deux conséquences : (1) le préremplissage n'est vérifiable
// qu'en lisant directement le texte de `#modal-root`.innerHTML (regex sur les attributs
// `value="..."`), jamais via `.value` après coup ; (2) chaque test qui déclenche
// #xxSave doit renseigner EXPLICITEMENT tous les champs requis par la validation (nom,
// calories, durée) avant de cliquer, sinon le clic est rejeté silencieusement par la
// validation existante (comme un utilisateur réel qui viderait ces champs).
//
// Autre point issu des mêmes tests existants (voir commentaire dans
// qty-modal-manual-meal-add.test.js) : les objets/tableaux lus depuis `logEntries`
// via `vm.runInContext` appartiennent au realm du sandbox — `assert.deepStrictEqual`
// échoue sur la seule différence de prototype même à contenu identique. Comparaison
// par JSON canonique partout où un objet/tableau du sandbox est comparé.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      const classes = new Set();
      elements.set(id, {
        id,
        value: '',
        innerHTML: '',
        className: '',
        style: {},
        disabled: false,
        classList: {
          add(c) { classes.add(c); },
          remove(c) { classes.delete(c); },
          toggle(c, force) {
            const on = force === undefined ? !classes.has(c) : force;
            if (on) classes.add(c); else classes.delete(c);
          },
          contains(c) { return classes.has(c); },
        },
        addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn); },
        _dispatch(type, evt) { (listeners[type] || []).forEach(fn => fn(evt || { target: elements.get(id) })); },
        onclick: null,
      });
    }
    return elements.get(id);
  }
  return { getElementById: elFor, querySelectorAll: () => [], _elements: elements };
}

function loadSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  const sandbox = {
    localStorage, console, window: { __toastT: null }, navigator: { userAgent: 'node-test' },
    document,
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8'), sandbox, { filename: 'js/ui.js' });
  vm.runInContext('render = function(){ this.__renderCalls = (this.__renderCalls||0) + 1; };', sandbox);
  sandbox.__document = document;
  return sandbox;
}

function setLogEntries(sandbox, entries) {
  vm.runInContext(`logEntries = ${JSON.stringify(entries)};`, sandbox);
}
function getLogEntries(sandbox) {
  vm.runInContext('this.__le = JSON.parse(JSON.stringify(logEntries));', sandbox);
  return sandbox.__le;
}
function modalRootHtml(sandbox) {
  return sandbox.__document.getElementById('modal-root').innerHTML;
}
// Renseigne explicitement tous les champs requis par la validation avant un clic sur
// #emeSave (voir note de tête de fichier — pas de vrai préremplissage DOM ici).
function fillMealForm(sandbox, values) {
  const d = sandbox.__document;
  const v = { date: '', name: 'Repas test', grams: '', kcal: '0', protein: '0', carbs: '0', fat: '0', ...values };
  d.getElementById('emeDate').value = v.date;
  d.getElementById('emeName').value = v.name;
  d.getElementById('emeGrams').value = v.grams;
  d.getElementById('emeKcal').value = v.kcal;
  d.getElementById('emeP').value = v.protein;
  d.getElementById('emeC').value = v.carbs;
  d.getElementById('emeF').value = v.fat;
}
function fillWorkoutForm(sandbox, values) {
  const d = sandbox.__document;
  const v = { date: '', name: 'Séance test', duration: '30', kcal: '0', ...values };
  d.getElementById('eweDate').value = v.date;
  d.getElementById('eweName').value = v.name;
  d.getElementById('eweDuration').value = v.duration;
  d.getElementById('eweKcal').value = v.kcal;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

const MEAL = {
  id: 'm1', date: '2026-01-01', type: 'meal', mealSlot: 'Déjeuner',
  foodId: 'f1', foodName: 'Poulet', grams: 150,
  kcal: 300, protein: 45, carbs: 20, fat: 8,
  time: '12:30', source: 'manual', quantitySource: 'user',
};
const WORKOUT_TAPIS = {
  id: 'w1', date: '2026-01-01', type: 'workout', wtype: 'tapis',
  params: { vitesse: 6, pente: 2 }, duration: 30, kcalBurned: 250, time: '08:00',
};
const WORKOUT_IA = {
  id: 'w2', date: '2026-01-01', type: 'workout', wtype: 'ia',
  name: 'Séance jambes', blocks: [{ exercises: [{ name: 'Squat' }] }],
  duration: 40, estimatedDurationMin: 40, warnings: [], text: 'squat 3x10',
  kcalBurned: 300, time: '19:00',
};

// ---------- Test 1 : édition d'un repas (meal) ----------
test('Meal — le formulaire est prérempli avec les valeurs actuelles de l\'entrée (texte HTML généré par openModal())', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('id="emeDate" type="date" value="2026-01-01"'), 'date préremplie');
  assert.ok(html.includes('id="emeName" type="text" value="Poulet"'), 'nom préremplie');
  assert.ok(html.includes('id="emeGrams" type="number" inputmode="numeric" value="150"'), 'quantité préremplie');
  assert.ok(html.includes('id="emeKcal" type="number" inputmode="numeric" value="300"'), 'calories préremplies');
  assert.ok(html.includes('id="emeP" type="number" inputmode="numeric" value="45"'), 'protéines préremplies');
  assert.ok(html.includes('id="emeC" type="number" inputmode="numeric" value="20"'), 'glucides préremplis');
  assert.ok(html.includes('id="emeF" type="number" inputmode="numeric" value="8"'), 'lipides préremplis');
  assert.ok(html.includes('data-slot="Déjeuner" class="active"'), 'créneau actuel présélectionné dans le sélecteur de repas');
});

test('Meal — Enregistrer met à jour la MÊME entrée (id conservé, aucun doublon, nouvelles valeurs présentes)', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { date: '2026-01-02', name: 'Poulet grillé', grams: '200', kcal: '400', protein: '50', carbs: '25', fat: '10' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1, 'aucun doublon : toujours une seule entrée après édition');
  const e = log[0];
  assert.strictEqual(e.id, 'm1', 'id inchangé après modification');
  assert.strictEqual(e.date, '2026-01-02');
  assert.strictEqual(e.foodName, 'Poulet grillé');
  assert.strictEqual(e.grams, 200);
  assert.strictEqual(e.kcal, 400);
  assert.strictEqual(e.protein, 50);
  assert.strictEqual(e.carbs, 25);
  assert.strictEqual(e.fat, 10);
  // Champs non couverts par ce formulaire (foodId, source, quantitySource, time,
  // mealSlot non modifié ici) préservés tels quels — remplacement en place, pas une
  // reconstruction complète de l'objet.
  assert.strictEqual(e.foodId, 'f1');
  assert.strictEqual(e.source, 'manual');
  assert.strictEqual(e.quantitySource, 'user');
  assert.strictEqual(e.time, '12:30');
  assert.strictEqual(e.mealSlot, 'Déjeuner');
});

test('Meal — quantité laissée vide devient grams:null (pas rejetée)', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { kcal: '300', grams: '' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].grams, null);
});

test('Meal — calories négatives rejetées : aucune mutation, pas de doublon', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { kcal: '-50' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].kcal, 300, 'entrée non modifiée après un rejet de validation');
});

test('Meal — nom vide rejeté : aucune mutation', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { name: '   ', kcal: '300' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(log[0].foodName, 'Poulet');
});

// ---------- Test 2 : édition d'une séance (workout) ----------
test('Workout (tapis) — le formulaire est prérempli avec les valeurs actuelles de l\'entrée (texte HTML généré par openModal())', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [WORKOUT_TAPIS]);
  vm.runInContext('openEditWorkoutEntryModal(logEntries[0]);', sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('id="eweDate" type="date" value="2026-01-01"'), 'date préremplie');
  assert.ok(html.includes('id="eweDuration" type="number" inputmode="numeric" value="30"'), 'durée préremplie');
  assert.ok(html.includes('id="eweKcal" type="number" inputmode="numeric" value="250"'), 'calories brûlées préremplies');
  assert.ok(!html.includes('id="eweName"'), 'pas de champ Nom pour une séance typée (tapis/vélo/sport/club) : titre non éditable, dérivé de wtype/params');
});

test('Workout (tapis) — Enregistrer met à jour la MÊME entrée (id conservé, aucun doublon, params/wtype préservés)', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [WORKOUT_TAPIS]);
  vm.runInContext('openEditWorkoutEntryModal(logEntries[0]);', sandbox);
  fillWorkoutForm(sandbox, { date: '2026-01-05', duration: '45', kcal: '300' });
  sandbox.__document.getElementById('eweSave')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1, 'aucun doublon');
  const e = log[0];
  assert.strictEqual(e.id, 'w1', 'id inchangé');
  assert.strictEqual(e.date, '2026-01-05');
  assert.strictEqual(e.duration, 45);
  assert.strictEqual(e.kcalBurned, 300);
  assert.strictEqual(e.wtype, 'tapis', 'type de séance non touché par ce lot (hors périmètre)');
  assert.strictEqual(JSON.stringify(e.params), JSON.stringify({ vitesse: 6, pente: 2 }), 'params (vitesse/pente) préservés tels quels');
});

test('Workout (séance IA/blocks) — nom éditable, durée synchronisée sur duration ET estimatedDurationMin', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [WORKOUT_IA]);
  vm.runInContext('openEditWorkoutEntryModal(logEntries[0]);', sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('id="eweName" type="text" value="Séance jambes"'), 'nom prérempli pour une séance IA (blocks)');

  fillWorkoutForm(sandbox, { name: 'Séance jambes v2', duration: '50', kcal: '350' });
  sandbox.__document.getElementById('eweSave')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1);
  const e = log[0];
  assert.strictEqual(e.id, 'w2');
  assert.strictEqual(e.name, 'Séance jambes v2');
  assert.strictEqual(e.duration, 50);
  assert.strictEqual(e.estimatedDurationMin, 50, 'estimatedDurationMin ne doit jamais diverger de duration (workoutSummary() lit l\'un ou l\'autre selon le type)');
  assert.strictEqual(e.kcalBurned, 350);
  assert.strictEqual(JSON.stringify(e.blocks), JSON.stringify(WORKOUT_IA.blocks), 'contenu des blocks non touché par ce lot');
});

test('Workout — durée invalide (0) rejetée : aucune mutation', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [WORKOUT_TAPIS]);
  vm.runInContext('openEditWorkoutEntryModal(logEntries[0]);', sandbox);
  fillWorkoutForm(sandbox, { duration: '0', kcal: '300' });
  sandbox.__document.getElementById('eweSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(log[0].duration, 30, 'entrée non modifiée après un rejet de validation');
});

// ---------- Test 3 : persistance ----------
test('Persistance — la modification est bien écrite dans localStorage (ct_log) via save()', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { kcal: '350' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');

  const storedRaw = sandbox.localStorage.getItem('ct_log');
  const stored = JSON.parse(storedRaw);
  assert.strictEqual(stored.length, 1);
  assert.strictEqual(stored[0].kcal, 350);
  vm.runInContext('this.__logJSON = JSON.stringify(logEntries);', sandbox);
  assert.strictEqual(storedRaw, sandbox.__logJSON, 'le contenu persisté correspond exactement à logEntries en mémoire');
});

// ---------- Test 4 : aucun doublon (explicite, count avant === count après) ----------
test('Aucun doublon — le nombre total d\'entrées ne change jamais après une édition', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL, WORKOUT_TAPIS]);
  vm.runInContext('this.__countBefore = logEntries.length;', sandbox);
  vm.runInContext('openEditMealEntryModal(logEntries.find(e=>e.id==="m1"));', sandbox);
  fillMealForm(sandbox, { kcal: '999' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(sandbox.__countBefore, 2);
  assert.strictEqual(log.length, 2, 'toujours 2 entrées : la mise à jour ne pousse jamais une nouvelle entrée');
});

// ---------- Test 5 : identité (id avant === id après) ----------
test('Identité — entry.id est strictement identique avant et après modification', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL]);
  vm.runInContext('this.__idBefore = logEntries[0].id;', sandbox);
  vm.runInContext('openEditMealEntryModal(logEntries[0]);', sandbox);
  fillMealForm(sandbox, { name: 'Autre nom', kcal: '300' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');
  const log = getLogEntries(sandbox);
  assert.strictEqual(log[0].id, sandbox.__idBefore);
});

// ---------- Test 6 : entrées distinctes — éditer la seconde ne touche jamais la première ----------
test('Entrées distinctes — modifier la seconde entrée laisse la première strictement intacte', () => {
  const sandbox = loadSandbox();
  const mealA = { ...MEAL, id: 'mA', foodName: 'Riz' };
  const mealB = { ...MEAL, id: 'mB', foodName: 'Pâtes' };
  setLogEntries(sandbox, [mealA, mealB]);
  vm.runInContext('this.__beforeA = JSON.stringify(logEntries.find(e=>e.id==="mA"));', sandbox);
  vm.runInContext('openEditMealEntryModal(logEntries.find(e=>e.id==="mB"));', sandbox);
  fillMealForm(sandbox, { name: 'Pâtes carbonara', kcal: '777' });
  sandbox.__document.getElementById('emeSave')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 2);
  const a = log.find(e => e.id === 'mA');
  const b = log.find(e => e.id === 'mB');
  vm.runInContext('this.__afterAJSON = JSON.stringify(logEntries.find(e=>e.id==="mA"));', sandbox);
  assert.strictEqual(sandbox.__afterAJSON, sandbox.__beforeA, 'entrée mA totalement inchangée');
  assert.strictEqual(b.foodName, 'Pâtes carbonara');
  assert.strictEqual(b.kcal, 777);
});

// ---------- Édition en place ≠ édition du catalogue (section 4 du cadrage) ----------
test('openEditLogEntryModal() route bien vers le formulaire meal ou workout selon entry.type, jamais vers openEditFoodModal (catalogue)', () => {
  const sandbox = loadSandbox();
  setLogEntries(sandbox, [MEAL, WORKOUT_TAPIS]);
  vm.runInContext(`
    this.__calls = [];
    openEditMealEntryModal = (e)=>{ this.__calls.push('meal:'+e.id); };
    openEditWorkoutEntryModal = (e)=>{ this.__calls.push('workout:'+e.id); };
    openEditFoodModal = (f)=>{ this.__calls.push('food'); };
    openEditLogEntryModal(logEntries.find(e=>e.id==='m1'));
    openEditLogEntryModal(logEntries.find(e=>e.id==='w1'));
  `, sandbox);
  vm.runInContext('this.__cJSON = JSON.stringify(this.__calls);', sandbox);
  assert.strictEqual(sandbox.__cJSON, JSON.stringify(['meal:m1', 'workout:w1']));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
