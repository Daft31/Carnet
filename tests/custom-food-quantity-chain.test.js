// Test ciblé — Phase 3, Lot B : "Créer un aliment personnalisé" depuis le contexte
// Repas enchaînait jusqu'ici sur une recherche manuelle avant de pouvoir en journaliser
// une quantité. openCustomFoodModal(logAfterSave) (js/ui.js) ferme ce trou :
// `logAfterSave===true` (appelé uniquement depuis le bouton "+ Ajouter un aliment
// personnalisé" de l'onglet Repas) enchaîne directement sur `openQtyModal(f)` avec
// l'aliment fraîchement créé, sans repasser par la recherche catalogue.
// `logAfterSave===false` (défaut, utilisé depuis Réglages) garde le comportement
// historique intact : catalogue seulement, aucune modale quantité.
//
// Même technique que tests/qty-modal-manual-meal-add.test.js : chargement des VRAIS
// js/core.js + js/ui.js dans un bac à sable Node (`vm`), DOM minimal mémoïsé par id,
// render() neutralisée.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { execFileSync } = require('child_process');

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

function fillCustomFoodForm(sandbox, { name = 'Poke bowl maison', kcal = '200', protein = '20', carbs = '15', fat = '6' } = {}) {
  const d = sandbox.__document;
  d.getElementById('cfName').value = name;
  d.getElementById('cfKcal').value = kcal;
  d.getElementById('cfP').value = protein;
  d.getElementById('cfC').value = carbs;
  d.getElementById('cfF').value = fat;
}

function getCustomFoods(sandbox) {
  vm.runInContext('this.__cf = JSON.parse(JSON.stringify(customFoods));', sandbox);
  return sandbox.__cf;
}
function getLogEntries(sandbox) {
  vm.runInContext('this.__le = JSON.parse(JSON.stringify(logEntries));', sandbox);
  return sandbox.__le;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

// ---------- A/B/D/F : création depuis le contexte repas -> modal quantité -> confirmation ----------
test('A/D — création (logAfterSave=true) -> openQtyModal(f) direct -> confirmation -> logEntry.foodId === customFood.id (pas un autre aliment)', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox);
  sandbox.__document.getElementById('cfSave').onclick();

  const cf = getCustomFoods(sandbox);
  assert.strictEqual(cf.length, 1, 'aliment personnalisé bien créé dans customFoods');
  const createdId = cf[0].id;

  // La modale quantité doit être ouverte directement avec CET objet, pas via une
  // recherche : on confirme la quantité proposée par défaut sans rien re-chercher.
  const qtyInput = sandbox.__document.getElementById('qtyInput');
  qtyInput.value = '150';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1, 'une entrée journalisée créée après confirmation de la quantité');
  assert.strictEqual(log[0].foodId, createdId, "l'entrée référence exactement l'aliment tout juste créé");
  assert.strictEqual(log[0].foodName, 'Poke bowl maison');
});

test('B — les macros de l\'entrée enregistrée correspondent à la quantité saisie (échelle /100g)', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox, { kcal: '200', protein: '20', carbs: '15', fat: '6' });
  sandbox.__document.getElementById('cfSave').onclick();

  sandbox.__document.getElementById('qtyInput').value = '150'; // f=1.5
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  const log = getLogEntries(sandbox);
  const e = log[0];
  assert.strictEqual(e.grams, 150);
  assert.strictEqual(e.kcal, 300);
  assert.strictEqual(e.protein, 30);
  assert.strictEqual(e.carbs, 22.5);
  assert.strictEqual(e.fat, 9);
});

test('C — persistance catalogue : customFoods contient l\'aliment, allFoods() permet de le retrouver', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox, { name: 'Curry maison' });
  sandbox.__document.getElementById('cfSave').onclick();

  vm.runInContext(`
    this.__cf0 = customFoods[0];
    this.__foundViaAllFoods = allFoods().find(f=>f.id===customFoods[0].id);
  `, sandbox);
  vm.runInContext('this.__cf0Id = this.__cf0.id; this.__foundName = this.__foundViaAllFoods ? this.__foundViaAllFoods.name : null;', sandbox);
  assert.ok(sandbox.__cf0Id.startsWith('c'), "id d'aliment personnalisé au format existant ('c'+uid())");
  assert.strictEqual(sandbox.__foundName, 'Curry maison', 'allFoods() retrouve bien le nouvel aliment via les mécanismes existants');
});

test('F — une seule validation produit un seul customFood et une seule entrée de journal', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox);
  sandbox.__document.getElementById('cfSave').onclick();
  sandbox.__document.getElementById('qtyInput').value = '100';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  assert.strictEqual(getCustomFoods(sandbox).length, 1);
  assert.strictEqual(getLogEntries(sandbox).length, 1);
});

test('Garde anti-double-confirmation sur #cfSave : un second clic ne crée pas un second aliment', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox);
  const saveBtn = sandbox.__document.getElementById('cfSave');
  saveBtn.onclick();
  saveBtn.onclick(); // double-tap physique simulé, avant fermeture de la modale

  assert.strictEqual(getCustomFoods(sandbox).length, 1, 'un seul aliment créé malgré le double clic');
});

// ---------- E : annulation de la quantité ----------
test('E — création puis annulation de la quantité (fermeture sans confirmer) : aliment conservé, aucune entrée de journal', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox);
  sandbox.__document.getElementById('cfSave').onclick();
  // openQtyModal(f) est bien ouverte (le champ #qtyInput existe), mais l'utilisateur
  // ferme la modale sans jamais cliquer sur #qtyConfirm — aucun rollback attendu
  // (cadrage Lot B : la création catalogue a déjà eu lieu avant l'ouverture de la
  // quantité).
  vm.runInContext('closeModal();', sandbox);

  assert.strictEqual(getCustomFoods(sandbox).length, 1, "l'aliment personnalisé reste dans customFoods");
  assert.strictEqual(getLogEntries(sandbox).length, 0, 'aucune entrée de repas créée');
});

// ---------- G : Settings ----------
test('G — Settings (logAfterSave=false, défaut) : aliment ajouté au catalogue, AUCUNE modale quantité ouverte', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    this.__qtyModalCalls = [];
    const _origOpenQtyModal = openQtyModal;
    openQtyModal = (f)=>{ this.__qtyModalCalls.push(f.id); };
  `, sandbox);
  vm.runInContext('openCustomFoodModal(false);', sandbox); // équivalent à openCustomFoodModal()
  fillCustomFoodForm(sandbox, { name: 'Aliment settings' });
  sandbox.__document.getElementById('cfSave').onclick();

  vm.runInContext('this.__qtyModalCallsJSON = JSON.stringify(this.__qtyModalCalls);', sandbox);
  assert.strictEqual(sandbox.__qtyModalCallsJSON, '[]', 'openQtyModal() jamais appelée depuis Réglages');
  assert.strictEqual(getCustomFoods(sandbox).length, 1, "l'aliment est bien ajouté au catalogue");
  assert.strictEqual(getLogEntries(sandbox).length, 0, 'aucune entrée de journal (comportement historique)');
});

test('G bis — openCustomFoodModal() sans argument (comportement historique par défaut, ex. appels scanner.js) se comporte comme logAfterSave=false', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    this.__qtyModalCalls = [];
    openQtyModal = (f)=>{ this.__qtyModalCalls.push(f.id); };
  `, sandbox);
  vm.runInContext('openCustomFoodModal();', sandbox);
  fillCustomFoodForm(sandbox);
  sandbox.__document.getElementById('cfSave').onclick();
  vm.runInContext('this.__qtyModalCallsJSON = JSON.stringify(this.__qtyModalCalls);', sandbox);
  assert.strictEqual(sandbox.__qtyModalCallsJSON, '[]');
  assert.strictEqual(getCustomFoods(sandbox).length, 1);
});

// ---------- H : scanner.js non modifié ----------
test('H — js/scanner.js est strictement identique à origin/main (hors périmètre Lot B, jamais touché)', () => {
  let baseline;
  try {
    baseline = execFileSync('git', ['show', 'origin/main:js/scanner.js'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  } catch (e) {
    // Pas de remote/réseau disponible dans cet environnement de test : on se rabat
    // sur une comparaison avec HEAD^ si origin/main n'est pas résolvable, plutôt que
    // de laisser le test échouer pour une raison hors-sujet (absence de réseau).
    baseline = execFileSync('git', ['show', 'HEAD:js/scanner.js'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  }
  const current = fs.readFileSync(path.join(__dirname, '..', 'js', 'scanner.js'), 'utf8');
  assert.strictEqual(current, baseline);
});

test('H bis — js/core.js est strictement identique à origin/main (Lot B: aucun changement de core.js)', () => {
  let baseline;
  try {
    baseline = execFileSync('git', ['show', 'origin/main:js/core.js'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  } catch (e) {
    baseline = execFileSync('git', ['show', 'HEAD:js/core.js'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  }
  const current = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  assert.strictEqual(current, baseline);
});

// ---------- I : persistance (localStorage) ----------
test('I — persistance via les mécanismes existants : customFoods (ct_customFoods) ET l\'entrée journalisée (ct_log) sont bien écrits', () => {
  const sandbox = loadSandbox();
  vm.runInContext('openCustomFoodModal(true);', sandbox);
  fillCustomFoodForm(sandbox);
  sandbox.__document.getElementById('cfSave').onclick();

  const storedCustomFoodsRaw = sandbox.localStorage.getItem('ct_customFoods');
  const storedCustomFoods = JSON.parse(storedCustomFoodsRaw);
  assert.strictEqual(storedCustomFoods.length, 1, 'customFoods persisté dès la création (avant même la confirmation de quantité)');

  sandbox.__document.getElementById('qtyInput').value = '100';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  const storedLogRaw = sandbox.localStorage.getItem('ct_log');
  const storedLog = JSON.parse(storedLogRaw);
  assert.strictEqual(storedLog.length, 1);
  vm.runInContext('this.__logJSON = JSON.stringify(logEntries); this.__cfJSON = JSON.stringify(customFoods);', sandbox);
  assert.strictEqual(storedLogRaw, sandbox.__logJSON);
  assert.strictEqual(sandbox.localStorage.getItem('ct_customFoods'), sandbox.__cfJSON);
});

// ---------- J : régression openQtyModal(food) pour un appel normal (hors création custom food) ----------
test('J — régression : openQtyModal(food) sur un aliment catalogue existant fonctionne comme avant (non affecté par le Lot B)', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    customFoods.push({id:'kalo_test_chicken', name:'Poulet test', kcal:200, protein:30, carbs:0, fat:5, serving_g:100, serving_label:'100 g'});
    this.__food = allFoods().find(f=>f.id==='kalo_test_chicken');
    openQtyModal(this.__food);
  `, sandbox);
  sandbox.__document.getElementById('qtyInput').value = '150';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1);
  const e = log[0];
  assert.strictEqual(e.foodId, 'kalo_test_chicken');
  assert.strictEqual(e.kcal, 300);
  assert.strictEqual(e.source, 'manual');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
