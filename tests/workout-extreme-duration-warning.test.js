// Test ciblé — AI-ROB-2 (audit Phase 2.3.3) : openWorkoutResultModal() (js/workoutparser.js)
// ne validait la durée saisie que par `duration <= 0` (après `Number(...) || 0`), sans
// aucun plafond de vraisemblance ni même de vérification explicite de `Number.isFinite` —
// une durée `Infinity` passait silencieusement (Infinity > 0), et une durée manifestement
// aberrante (ex. 99999 min) pouvait être enregistrée en un seul clic, sans le filet de
// sécurité "avertissement + seconde confirmation" déjà en place pour Meal AI (AI-P2-3).
//
// Correctif : WORKOUT_DURATION_REASONABLE_MAX_MIN = 300 (5h, jamais un plafond métier —
// seulement un seuil de vraisemblance UX) + Number.isFinite() explicite avant tout. Ce
// fichier vérifie le COMPORTEMENT réel (aucune sauvegarde au premier clic sur une durée
// extrême, valeur enregistrée EXACTEMENT celle confirmée, reset après modification), pas
// la simple présence d'une constante dans le code source.
//
// Même approche que tests/ai-extreme-value-warning.test.js : charge les VRAIS js/core.js +
// js/workoutparser.js dans un bac à sable Node (`vm`).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        className: '',
        innerHTML: '',
        _text: '',
        get textContent() { return this._text; },
        set textContent(v) { this._text = v; },
        style: { display: 'none' },
        classList: { add() {}, remove() {} },
        _listeners: {},
        addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
        dispatchInput() { (this._listeners.input || []).forEach(fn => fn()); },
        onclick: null,
      });
    }
    return elements.get(id);
  }
  return { getElementById: elFor };
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
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document,
    location: { hostname: 'localhost' },
    openModal: () => {},
    closeModal: () => {},
    escapeHtml: (s) => (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'workoutparser.js'), 'utf8'), sandbox, { filename: 'js/workoutparser.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  // render() (js/core.js) réconstruit toute la page — hors périmètre de ce test.
  vm.runInContext('render = function(){};', sandbox);
  vm.runInContext('this.__setState = (currentDate) => { globalThis.currentDate = currentDate; };', sandbox);
  sandbox.__setState('2026-09-18');
  sandbox.__document = document;
  sandbox.getToastCalls = () => sandbox.__toastCalls;
  return sandbox;
}

// openModal() est mocké en no-op : les <input value="..."> initiaux ne sont jamais
// appliqués aux éléments DOM stub tant qu'on ne les renseigne pas nous-mêmes.
function openResultAndSetDuration(sandbox, data, durationValue) {
  sandbox.openWorkoutResultModal(data);
  const els = {
    durationInput: sandbox.__document.getElementById('wiDuration'),
    saveBtn: sandbox.__document.getElementById('wiSaveBtn'),
    extremeWarning: sandbox.__document.getElementById('wiExtremeDurationWarning'),
    nameInput: sandbox.__document.getElementById('wiName'),
    dateInput: sandbox.__document.getElementById('wiDate'),
  };
  els.durationInput.value = String(durationValue);
  return els;
}

function logEntriesOf(sandbox) {
  vm.runInContext('this.__le = logEntries;', sandbox);
  return sandbox.__le;
}

const SAMPLE_DATA = {
  blocks: [{ name: 'Bloc 1', type: 'standard', exercises: [{ name: 'Squat', sets: 4, reps: '8' }] }],
  estimatedDurationMin: 30,
  warnings: [],
};

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('1. Durée normale (45 min) : un seul clic suffit, enregistrée directement, aucun avertissement', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 45);
  assert.strictEqual(els.extremeWarning.style.display, 'none');
  els.saveBtn.onclick();
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1, 'un clic doit suffire pour une durée normale');
  assert.strictEqual(log[0].duration, 45);
  assert.strictEqual(log[0].estimatedDurationMin, 45);
});

test('2. Durée juste sous le seuil (300 min exactement, à la borne) : enregistrée en un clic, pas d\'avertissement', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 300);
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 1, 'la borne elle-même (300) ne doit pas déclencher l\'avertissement, seul un dépassement strict le doit');
});

test('3. Durée au-dessus du seuil (301 min) : premier clic affiche l\'avertissement', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 301);
  els.saveBtn.onclick();
  assert.strictEqual(els.extremeWarning.style.display, 'block', 'l\'avertissement doit devenir visible');
});

test('4. Premier clic sur une durée extrême : aucune sauvegarde', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 99999);
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'le premier clic sur une durée aberrante ne doit rien enregistrer');
});

test('5. Après le premier clic sur une valeur extrême, le bouton devient explicitement une confirmation secondaire', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 99999);
  const originalLabel = els.saveBtn.textContent;
  els.saveBtn.onclick();
  assert.strictEqual(els.saveBtn.textContent, 'Confirmer quand même');
  assert.notStrictEqual(els.saveBtn.textContent, originalLabel);
});

test('6/7. Second clic explicite ("Confirmer quand même") enregistre la valeur EXACTE confirmée, sans la modifier', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 99999);
  els.saveBtn.onclick(); // 1er clic : avertissement seulement
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
  els.saveBtn.onclick(); // 2e clic explicite : enregistre
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].duration, 99999, 'la durée enregistrée doit être exactement celle confirmée, jamais réduite ou plafonnée silencieusement');
  assert.strictEqual(log[0].estimatedDurationMin, 99999);
});

test('8. Modifier la durée après l\'avertissement réinitialise l\'état de confirmation (avertissement caché, bouton normal)', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 99999);
  const originalLabel = els.saveBtn.textContent;
  els.saveBtn.onclick(); // avertissement
  assert.strictEqual(els.extremeWarning.style.display, 'block');
  els.durationInput.value = '45';
  els.durationInput.dispatchInput();
  assert.strictEqual(els.extremeWarning.style.display, 'none', 'modifier la durée doit réinitialiser l\'état d\'avertissement en attente');
  assert.strictEqual(els.saveBtn.textContent, originalLabel, 'le bouton doit revenir à son libellé normal');
});

test('9. Nouvelle durée extrême après modification : nouvelle seconde confirmation requise (le "quand même" précédent ne s\'applique pas)', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 99999);
  els.saveBtn.onclick(); // 1er avertissement
  els.durationInput.value = '45';
  els.durationInput.dispatchInput(); // valeur redevenue raisonnable, reset
  els.durationInput.value = '50000'; // nouvelle valeur extrême, différente de la précédente
  els.durationInput.dispatchInput();
  els.saveBtn.onclick(); // doit de nouveau s'arrêter à l'avertissement, pas sauvegarder direct
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'une nouvelle valeur extrême doit exiger sa propre seconde confirmation, pas hériter de l\'ancienne');
  assert.strictEqual(els.saveBtn.textContent, 'Confirmer quand même');
  els.saveBtn.onclick(); // confirmation explicite de la NOUVELLE valeur
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].duration, 50000);
});

test('10. Durée vide/invalide (chaîne non numérique) : refusée, aucune sauvegarde, aucun avertissement extrême affiché', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 0);
  els.durationInput.value = 'abc';
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
  assert.strictEqual(els.extremeWarning.style.display, 'none', 'une valeur invalide ne doit jamais déclencher le chemin "avertissement extrême", seulement le rejet de base');
  assert.ok(sandbox.getToastCalls().some(c => /durée/i.test(c.msg)));
});

test('11. Durée NaN explicite : refusée, aucune sauvegarde', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 0);
  els.durationInput.value = 'NaN';
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
});

test('12. Durée Infinity : refusée (Number.isFinite), jamais traitée comme une simple valeur "élevée"', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 0);
  els.durationInput.value = 'Infinity';
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'Infinity doit être rejeté par Number.isFinite(), pas glisser au travers de duration<=0 comme avant le correctif');
  assert.strictEqual(els.extremeWarning.style.display, 'none', 'Infinity est un rejet de base, pas un avertissement de vraisemblance');
});

test('13. Durée négative : refusée, aucune sauvegarde (comportement inchangé)', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, -30);
  els.saveBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
});

test('Régression — nom/date par défaut toujours appliqués correctement sur une sauvegarde normale', () => {
  const sandbox = loadSandbox();
  const els = openResultAndSetDuration(sandbox, SAMPLE_DATA, 45);
  els.saveBtn.onclick();
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log[0].date, '2026-09-18');
  assert.ok(log[0].name && log[0].name.length > 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
