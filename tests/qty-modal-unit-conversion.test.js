// Test ciblé — CP-01 (audit QA Phase 2.6, T-P0-2) : la conversion Grammes<->Portions
// dans openQtyModal() a déjà connu une régression P0 (bug identifié à l'audit UX :
// changer d'unité RÉINTERPRÉTAIT le même nombre au lieu de le CONVERTIR — "160" en
// grammes cliqué sur "Portions" devenait silencieusement 160 portions). Ce fichier
// exerce le vrai `setQtyMode()` (via les boutons #qtyGrams/#qtyPortions réels de
// js/ui.js), pas une réimplémentation de la formule de conversion.
//
// Même sandbox `vm` mémoïsé par id que tests/qty-modal-manual-meal-add.test.js.

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
  vm.runInContext('render = function(){};', sandbox);
  sandbox.__document = document;
  return sandbox;
}

function openModalWithFood(sandbox, food) {
  vm.runInContext(`
    customFoods.push(${JSON.stringify(food)});
    this.__food = allFoods().find(f=>f.id===${JSON.stringify(food.id)});
    openQtyModal(this.__food);
  `, sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Conversion exacte (valeur multiple de serving_g) : grammes -> portions -> grammes revient à la valeur de départ', () => {
  const sandbox = loadSandbox();
  // serving_g:50 (ex. "1 oeuf") ; 200g = exactement 4 portions, round-trip sans perte.
  openModalWithFood(sandbox, { id: 'kalo_test_egg', name: 'Oeuf test', kcal: 155, protein: 13, carbs: 1, fat: 11, serving_g: 50, serving_label: '1 oeuf (50 g)' });

  // qtyGrams/qtyPortions sont bindés via `.onclick=` (pas addEventListener) dans
  // js/ui.js — on appelle donc directement le handler, comme un vrai clic navigateur
  // l'invoquerait via la propriété onclick de l'élément.
  const input = sandbox.__document.getElementById('qtyInput');
  input.value = '200';
  sandbox.__document.getElementById('qtyPortions').onclick();
  assert.strictEqual(input.value, 4, 'conversion réelle en portions : 200g / 50g = 4, jamais "200" réinterprété tel quel');

  sandbox.__document.getElementById('qtyGrams').onclick();
  assert.strictEqual(input.value, 200, 'reconversion en grammes : 4 * 50 = 200, valeur de départ retrouvée exactement');
});

test('Conversion avec arrondi inhérent (valeur non multiple de serving_g) : formule réelle du code, pas une égalité mathématique impossible', () => {
  const sandbox = loadSandbox();
  // serving_g:150, valeur de départ 100g -> ne tombe pas rond en portions.
  openModalWithFood(sandbox, { id: 'kalo_test_pack', name: 'Pack test', kcal: 300, protein: 5, carbs: 40, fat: 10, serving_g: 150, serving_label: '1 pack (150 g)' });

  const input = sandbox.__document.getElementById('qtyInput');
  input.value = '100';
  sandbox.__document.getElementById('qtyPortions').onclick();
  // Formule réelle (js/ui.js, setQtyMode) : Math.round((current/servingG)*100)/100
  const expectedPortion = Math.round((100 / 150) * 100) / 100; // 0.67
  assert.strictEqual(input.value, expectedPortion);

  sandbox.__document.getElementById('qtyGrams').onclick();
  // Formule réelle : Math.round(current*servingG) — reconversion depuis la valeur
  // ARRONDIE en portions, pas depuis la valeur d'origine : un petit écart de
  // reconversion est donc un comportement réel et attendu, pas un bug à masquer.
  const expectedGramsBack = Math.round(expectedPortion * 150); // 101, pas 100
  assert.strictEqual(input.value, expectedGramsBack);
  assert.notStrictEqual(expectedGramsBack, 100, 'cet écart d\'arrondi est documenté ici comme comportement réel du code, pas une régression');
});

test('Cliquer sur le mode déjà actif ne modifie rien (pas de conversion inutile ni de perte de précision répétée)', () => {
  const sandbox = loadSandbox();
  openModalWithFood(sandbox, { id: 'kalo_test_egg2', name: 'Oeuf test 2', kcal: 155, protein: 13, carbs: 1, fat: 11, serving_g: 50, serving_label: '1 oeuf (50 g)' });
  const input = sandbox.__document.getElementById('qtyInput');
  input.value = '73';
  sandbox.__document.getElementById('qtyGrams').onclick(); // déjà en mode grammes (mode initial de setQtyMode)
  assert.strictEqual(input.value, '73', 'aucune conversion appliquée quand on reclique sur le mode déjà actif');
});

test('État visuel des boutons : le mode actif bascule réellement entre Grammes et Portions au fil des clics', () => {
  // Le marquage `class="active"` initial vient du gabarit HTML injecté par
  // openModal() (jamais réellement parsé par ce DOM de test, qui ne fait que
  // mémoïser des éléments par id) — ce test porte sur le TOGGLE réel opéré par
  // setQtyMode() au fil des clics, pas sur l'état initial avant tout clic.
  const sandbox = loadSandbox();
  openModalWithFood(sandbox, { id: 'kalo_test_egg3', name: 'Oeuf test 3', kcal: 155, protein: 13, carbs: 1, fat: 11, serving_g: 50, serving_label: '1 oeuf (50 g)' });
  const gBtn = sandbox.__document.getElementById('qtyGrams');
  const pBtn = sandbox.__document.getElementById('qtyPortions');
  sandbox.__document.getElementById('qtyInput').value = '100';
  pBtn.onclick();
  assert.ok(pBtn.classList.contains('active'), 'Portions devient actif après son clic');
  assert.ok(!gBtn.classList.contains('active'), 'Grammes perd la classe active');
  gBtn.onclick();
  assert.ok(gBtn.classList.contains('active'), 'Grammes redevient actif après son clic');
  assert.ok(!pBtn.classList.contains('active'), 'Portions perd la classe active');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
