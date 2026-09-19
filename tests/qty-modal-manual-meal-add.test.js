// Test ciblé — CP-01 (audit QA Phase 2.6, T-P0-1) : le parcours d'ajout manuel
// d'un repas depuis le catalogue (recherche -> openQtyModal() -> confirmation)
// n'avait jusqu'ici AUCUN test, alors que c'est le parcours le plus emprunté de
// toute l'app. On charge les VRAIS js/core.js ET js/ui.js dans un bac à sable
// Node (`vm`), avec un DOM minimal mais mémoïsé par id (mêmes éléments réutilisés
// d'un appel à l'autre, comme dans tests/ai-abort-on-modal-close.test.js) pour
// pouvoir dispatcher un vrai clic sur #qtyConfirm après avoir renseigné #qtyInput.
//
// render() est neutralisée après chargement (même technique que le remplacement
// de openAIResultModal dans tests/ai-abort-on-modal-close.test.js) : ce test porte
// sur l'intégrité de logEntries/la persistance, pas sur le rendu DOM complet qui
// suivrait (viewToday() + bindTabEvents() nécessiteraient un DOM bien plus riche,
// hors propos ici). openQtyModal() et son handler de confirmation, eux, sont
// exécutés tels quels, sans extraction ni réécriture.

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
  // render() en aval (viewToday()+bindTabEvents()) exigerait un DOM bien plus
  // complet ; on la neutralise pour isoler la logique de données du handler de
  // confirmation, exactement comme openAIResultModal est remplacée après
  // chargement dans tests/ai-abort-on-modal-close.test.js. openQtyModal() et son
  // handler de clic, seuls objets réels de ce test, restent inchangés.
  vm.runInContext('render = function(){ this.__renderCalls = (this.__renderCalls||0) + 1; };', sandbox);
  sandbox.__document = document;
  return sandbox;
}

function addTestFood(sandbox) {
  vm.runInContext(`
    customFoods.push({id:'kalo_test_chicken', name:'Poulet test', kcal:200, protein:30, carbs:0, fat:5, serving_g:100, serving_label:'100 g'});
    this.__food = allFoods().find(f=>f.id==='kalo_test_chicken');
  `, sandbox);
  return vm.runInContext('this.__food', sandbox);
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('openQtyModal() -> confirmation grammes -> logEntries : une entrée avec les bonnes données nutritionnelles, la bonne provenance et le bon quantitySource', () => {
  const sandbox = loadSandbox();
  addTestFood(sandbox);
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);

  const qtyInput = sandbox.__document.getElementById('qtyInput');
  qtyInput.value = '150';
  qtyInput._dispatch('input');
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  vm.runInContext('this.__log = logEntries; this.__today = currentDate; this.__slot = mealSlot;', sandbox);
  const log = sandbox.__log;
  assert.strictEqual(log.length, 1, 'une seule entrée créée après confirmation');
  const e = log[0];
  assert.strictEqual(e.type, 'meal');
  assert.strictEqual(e.foodId, 'kalo_test_chicken');
  assert.strictEqual(e.foodName, 'Poulet test');
  assert.strictEqual(e.grams, 150, 'grammage exact saisi (mode grammes par défaut)');
  // 200 kcal / 100g -> f=1.5 pour 150g
  assert.strictEqual(e.kcal, 300);
  assert.strictEqual(e.protein, 45);
  assert.strictEqual(e.carbs, 0);
  assert.strictEqual(e.fat, 7.5);
  assert.strictEqual(e.source, 'manual', "l'ajout catalogue via openQtyModal() enregistre toujours source:'manual'");
  assert.strictEqual(e.quantitySource, 'user', "aucun historique pour ce foodId -> typicalGramsFor()===null -> quantitySource:'user'");
  assert.strictEqual(e.date, sandbox.__today, "l'entrée est datée sur currentDate, pas une date en dur");
  assert.strictEqual(e.mealSlot, sandbox.__slot);
  assert.ok(/^\d{2}:\d{2}$/.test(e.time), 'heure au format HH:MM');
});

test('Persistance : l\'entrée confirmée est bien écrite dans localStorage (ct_log) via save()', () => {
  const sandbox = loadSandbox();
  addTestFood(sandbox);
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);
  sandbox.__document.getElementById('qtyInput').value = '80';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  const storedRaw = sandbox.localStorage.getItem('ct_log');
  const stored = JSON.parse(storedRaw);
  assert.strictEqual(stored.length, 1);
  // Comparaison par JSON canonique plutôt que deepStrictEqual : `stored` (parsé
  // dans le realm Node du test) et logEntries (objet du realm `vm` du sandbox)
  // ont des prototypes Array/Object distincts malgré un contenu identique —
  // deepStrictEqual échouerait sur la seule différence de realm, pas sur une
  // vraie divergence de données.
  vm.runInContext('this.__logJSON = JSON.stringify(logEntries);', sandbox);
  assert.strictEqual(storedRaw, sandbox.__logJSON, 'le contenu persisté correspond exactement à logEntries en mémoire');
});

test('Garde anti-double-confirmation : un second déclenchement du même clic ne crée pas de seconde entrée', () => {
  const sandbox = loadSandbox();
  addTestFood(sandbox);
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);
  const confirmBtn = sandbox.__document.getElementById('qtyConfirm');
  sandbox.__document.getElementById('qtyInput').value = '120';
  confirmBtn._dispatch('click');
  confirmBtn._dispatch('click'); // double-tap physique simulé sur le même bouton, avant que la modale ne disparaisse

  vm.runInContext('this.__log = logEntries;', sandbox);
  assert.strictEqual(sandbox.__log.length, 1, 'le second déclenchement est ignoré (booléen confirmed local à cette ouverture de modale)');
});

test('Régression — rouvrir la modale (nouvel ajout légitime) n\'est jamais bloqué par la garde d\'une confirmation précédente', () => {
  const sandbox = loadSandbox();
  const food = addTestFood(sandbox);
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);
  sandbox.__document.getElementById('qtyInput').value = '100';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  // Nouvelle ouverture réelle : addEventListener empile un NOUVEAU listener sur
  // le même élément mémoïsé #qtyConfirm (jamais retiré, comme en production où
  // closeModal() ne vide le DOM qu'après 180ms) — le test vérifie que malgré ça,
  // un deuxième ajout légitime après réouverture produit bien une 2e entrée.
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);
  sandbox.__document.getElementById('qtyInput').value = '50';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');

  vm.runInContext('this.__log = logEntries;', sandbox);
  assert.strictEqual(sandbox.__log.length, 2, 'une réouverture légitime doit permettre un nouvel ajout');
});

test('Quantité invalide (0 ou vide) : aucune entrée créée, la garde n\'est jamais posée avant validation', () => {
  const sandbox = loadSandbox();
  addTestFood(sandbox);
  vm.runInContext(`openQtyModal(this.__food);`, sandbox);
  sandbox.__document.getElementById('qtyInput').value = '0';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');
  vm.runInContext('this.__log = logEntries;', sandbox);
  assert.strictEqual(sandbox.__log.length, 0, 'quantité à 0 rejetée, aucune entrée');

  // Une quantité valide ensuite doit pouvoir être confirmée (la garde n'a pas
  // été posée par le clic invalide précédent).
  sandbox.__document.getElementById('qtyInput').value = '75';
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');
  vm.runInContext('this.__log = logEntries;', sandbox);
  assert.strictEqual(sandbox.__log.length, 1, 'un clic invalide ne doit jamais bloquer le réessai suivant');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
