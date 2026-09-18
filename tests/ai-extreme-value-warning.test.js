// Test ciblé — AI-P2-3 (audit Phase 2.3.1) : openAIResultModal() (js/mealparser.js)
// vérifiait déjà nombre fini / positif pour les calories et nombre fini / non-négatif pour
// les macros, mais n'appliquait aucune borne haute — une réponse IA à 999999 kcal pouvait
// être confirmée en un clic sans aucun avertissement.
//
// Correctif : un seuil de vraisemblance (MEAL_AI_REASONABLE_MAX), qui ne rejette ni ne
// modifie jamais la valeur — il déclenche un avertissement + exige un second clic explicite
// ("Confirmer quand même") avant d'enregistrer. Ce fichier vérifie le COMPORTEMENT (rien
// n'est enregistré au premier clic sur une valeur aberrante, la valeur enregistrée au
// second clic est EXACTEMENT celle affichée, jamais altérée), pas seulement la présence
// d'une constante dans le code source.
//
// Même approche que tests/ai-describe-modal.test.js : charge les VRAIS js/core.js +
// js/mealparser.js dans un bac à sable Node (`vm`).

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
  const toastCalls = [];
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document,
    openModal: () => {},
    closeModal: () => {},
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'mealparser.js'), 'utf8'), sandbox, { filename: 'js/mealparser.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  // render() (js/core.js) réconstruit toute la page — hors périmètre de ce test (on vérifie
  // uniquement logEntries/l'état des inputs de la modale), donc neutralisée comme closeModal.
  vm.runInContext('render = function(){};', sandbox);
  vm.runInContext('this.__setState = (mealSlot, currentDate) => { globalThis.mealSlot = mealSlot; globalThis.currentDate = currentDate; };', sandbox);
  sandbox.__setState('Déjeuner', '2026-09-18');
  sandbox.__document = document;
  sandbox.getToastCalls = () => sandbox.__toastCalls;
  return sandbox;
}

// openModal() est mocké en no-op (ce test n'exerce pas le rendu HTML réel) : les
// <input value="..."> initiaux ne sont donc jamais appliqués aux éléments DOM stub tant
// qu'on ne les renseigne pas nous-mêmes — on reproduit ici exactement le même calcul de
// valeur affichée qu'openAIResultModal() (Math.round(parseFloat(...)||0)) pour que les
// champs reflètent, comme dans un vrai navigateur, la proposition initiale de l'IA avant
// toute saisie de l'utilisateur.
function openResultAndFillInputs(sandbox, data) {
  sandbox.openAIResultModal(data, 'texte original');
  const els = {
    kcalInput: sandbox.__document.getElementById('aiKcalInput'),
    proteinInput: sandbox.__document.getElementById('aiProteinInput'),
    carbsInput: sandbox.__document.getElementById('aiCarbsInput'),
    fatInput: sandbox.__document.getElementById('aiFatInput'),
    confirmBtn: sandbox.__document.getElementById('aiConfirmBtn'),
    extremeWarning: sandbox.__document.getElementById('aiExtremeWarning'),
  };
  els.kcalInput.value = String(Math.round(parseFloat(data.calories) || 0));
  els.proteinInput.value = String(Math.round(parseFloat(data.protein) || 0));
  els.carbsInput.value = String(Math.round(parseFloat(data.carbs) || 0));
  els.fatInput.value = String(Math.round(parseFloat(data.fat) || 0));
  return els;
}

function logEntriesOf(sandbox) {
  vm.runInContext('this.__le = logEntries;', sandbox);
  return sandbox.__le;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Valeur normale (500 kcal) : un seul clic suffit, enregistrée directement, aucun avertissement affiché', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 30, carbs: 50, fat: 15, name: 'Repas normal' });
  assert.strictEqual(els.extremeWarning.style.display, 'none');
  els.confirmBtn.onclick();
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1, 'un clic doit suffire pour une valeur normale');
  assert.strictEqual(log[0].kcal, 500);
});

test('Valeur négative (kcal) : rejet inchangé, aucun avertissement extrême (le rejet dur reste prioritaire)', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 30, carbs: 50, fat: 15 });
  els.proteinInput.value = '-5';
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'une macro négative doit toujours être rejetée, jamais enregistrée');
  const calls = sandbox.getToastCalls();
  assert.ok(calls.some(c => /macros valides/.test(c.msg)));
});

test('Valeur non numérique (kcal) : rejet inchangé', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 30, carbs: 50, fat: 15 });
  els.kcalInput.value = 'abc';
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
});

test('Valeur Infinity (kcal) : rejet inchangé (jamais transformée en avertissement "élevé")', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 30, carbs: 50, fat: 15 });
  els.kcalInput.value = 'Infinity';
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'Infinity doit rester rejeté par Number.isFinite(), pas traité comme une valeur juste "élevée"');
});

test('Valeur NaN (macro vide non numérique après trim, ex. "  ") : rejet inchangé', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 30, carbs: 50, fat: 15 });
  els.carbsInput.value = 'NaN';
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
});

test('Valeur juste sous la limite (kcal:5000 exactement, à la borne) : enregistrée en un clic, pas d\'avertissement', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 5000, protein: 30, carbs: 50, fat: 15 });
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 1, 'la borne elle-même (5000) ne doit pas déclencher l\'avertissement, seul un dépassement strict le doit');
});

test('Valeur juste au-dessus de la limite (kcal:5001) : premier clic bloque l\'enregistrement et affiche l\'avertissement', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 5001, protein: 30, carbs: 50, fat: 15 });
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0, 'le premier clic sur une valeur aberrante ne doit rien enregistrer');
  assert.strictEqual(els.extremeWarning.style.display, 'block', 'l\'avertissement doit devenir visible');
  assert.strictEqual(els.confirmBtn.textContent, 'Confirmer quand même');
});

test('Valeur extrême (999999 kcal) : second clic explicite ("Confirmer quand même") enregistre la valeur EXACTE affichée, sans la modifier', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 999999, protein: 30, carbs: 50, fat: 15 });
  els.confirmBtn.onclick(); // 1er clic : avertissement seulement
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
  els.confirmBtn.onclick(); // 2e clic explicite : enregistre
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].kcal, 999999, 'la valeur enregistrée doit être exactement celle affichée/confirmée, jamais réduite ou plafonnée silencieusement');
});

test('Valeur extrême modifiée après le premier avertissement : le "quand même" en attente est annulé, un nouveau clic réévalue', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 999999, protein: 30, carbs: 50, fat: 15 });
  els.confirmBtn.onclick(); // 1er clic : avertissement
  assert.strictEqual(els.extremeWarning.style.display, 'block');
  // L'utilisateur corrige la valeur vers quelque chose de raisonnable avant de recliquer.
  els.kcalInput.value = '600';
  els.kcalInput.dispatchInput();
  assert.strictEqual(els.extremeWarning.style.display, 'none', 'modifier un champ doit réinitialiser l\'état d\'avertissement en attente');
  els.confirmBtn.onclick(); // ce clic doit maintenant enregistrer directement (valeur redevenue raisonnable)
  const log = logEntriesOf(sandbox);
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].kcal, 600);
});

test('Macro seule extrême (protein:400, kcal normal) : déclenche aussi l\'avertissement (pas seulement kcal)', () => {
  const sandbox = loadSandbox();
  const els = openResultAndFillInputs(sandbox, { calories: 500, protein: 400, carbs: 50, fat: 15 });
  els.confirmBtn.onclick();
  assert.strictEqual(logEntriesOf(sandbox).length, 0);
  assert.strictEqual(els.extremeWarning.style.display, 'block');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
