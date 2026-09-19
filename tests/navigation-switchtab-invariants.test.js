// Test ciblé — CP-11 (audit QA Phase 2.6, T-P1-1) : deux invariants de navigation
// documentés dans CLAUDE.md ("Avant de modifier l'UI/UX"), chacun corrigeant un bug
// réel déjà rencontré, n'avaient jusqu'ici aucun test :
//   1. Changer d'onglet remet le scroll en haut (`window.scrollTo(0,0)` +
//      `#main.scrollTop=0`), fait UNIQUEMENT dans switchTab() — jamais dans
//      render() elle-même (appelée aussi après de simples actions dans le même
//      onglet, où on ne veut surtout pas sauter en haut de page).
//   2. `mealSearchQ` se réinitialise à la sortie RÉELLE de l'onglet Repas
//      (switchTab(tab) avec activeTab==='meals' && tab!=='meals'), jamais en
//      restant sur Repas.
//
// switchTab() n'est PAS modifiée ni extraite : elle est appelée telle quelle,
// chargée depuis le vrai js/core.js. render() (fonction volumineuse qui appelle
// tous les view*() puis bindTabEvents() de js/ui.js) est neutralisée après
// chargement — même technique que le remplacement de openAIResultModal dans
// tests/ai-abort-on-modal-close.test.js — car ce test porte sur la logique de
// switchTab() elle-même (scroll + mealSearchQ), pas sur le rendu DOM complet qui
// nécessiterait de charger et binder tout js/ui.js.

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
  const scrollToCalls = [];
  const mainEl = { scrollTop: 0 };
  const document = {
    getElementById: (id) => (id === 'main' ? mainEl : { className: '', innerHTML: '', hidden: false, classList: { add(){}, remove(){}, toggle(){} } }),
  };
  const sandbox = {
    localStorage, console, navigator: { userAgent: 'node-test' },
    document,
    window: { scrollTo: (x, y) => scrollToCalls.push([x, y]) },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  // render() exigerait tout js/ui.js (view*() + bindTabEvents()) pour un DOM
  // complet ; hors périmètre de ce test, qui vérifie switchTab() elle-même — la
  // note de CLAUDE.md est explicite : le reset de scroll doit rester dans
  // switchTab(), jamais glisser dans render() qu'on neutralise ici sans crainte
  // de masquer une régression sur CE point précis.
  vm.runInContext('render = function(){ this.__renderCalls = (this.__renderCalls||0) + 1; };', sandbox);
  sandbox.__mainEl = mainEl;
  sandbox.__scrollToCalls = scrollToCalls;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('switchTab() remet le scroll de page en haut (window.scrollTo(0,0) et #main.scrollTop=0)', () => {
  const sandbox = loadSandbox();
  sandbox.__mainEl.scrollTop = 850; // simule une position de scroll non nulle avant navigation
  vm.runInContext(`switchTab('history');`, sandbox);
  assert.deepStrictEqual(sandbox.__scrollToCalls, [[0, 0]], 'window.scrollTo(0,0) doit être appelé exactement une fois');
  assert.strictEqual(sandbox.__mainEl.scrollTop, 0, '#main.scrollTop doit être remis à 0');
});

test('mealSearchQ est réinitialisée en sortant réellement de l\'onglet Repas', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    activeTab = 'meals';
    mealSearchQ = 'poulet basquaise';
    switchTab('workouts');
    this.__q = mealSearchQ;
    this.__tab = activeTab;
  `, sandbox);
  assert.strictEqual(sandbox.__q, '', 'sortir de Repas vers un autre onglet doit vider mealSearchQ');
  assert.strictEqual(sandbox.__tab, 'workouts');
});

test('Régression — rester sur l\'onglet Repas ne vide jamais mealSearchQ (condition stricte activeTab===meals && tab!==meals)', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    activeTab = 'meals';
    mealSearchQ = 'poulet basquaise';
    switchTab('meals');
    this.__q = mealSearchQ;
  `, sandbox);
  assert.strictEqual(sandbox.__q, 'poulet basquaise', 'un appel switchTab(\'meals\') en étant déjà sur Repas (ex. raccourci FAB) ne doit jamais écraser une recherche en cours');
});

test('Entrer sur Repas depuis un autre onglet ne touche pas mealSearchQ (seule la SORTIE la réinitialise, jamais l\'entrée)', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`
    activeTab = 'today';
    mealSearchQ = 'reste dune recherche precedente';
    switchTab('meals');
    this.__q = mealSearchQ;
  `, sandbox);
  // Le code ne réinitialise mealSearchQ qu'à la condition
  // (activeTab==='meals' && tab!=='meals') — entrer sur Repas ne matche jamais
  // cette condition, donc une valeur résiduelle n'est PAS effacée ici : documenté
  // tel quel, ce n'est pas ce chemin qui protège contre une recherche obsolète
  // (c'est la sortie précédente qui l'aurait déjà fait dans un usage réel).
  assert.strictEqual(sandbox.__q, 'reste dune recherche precedente');
});

test('Le scroll est remis en haut même quand on reste sur le même onglet (switchTab reste inconditionnel sur ce point)', () => {
  const sandbox = loadSandbox();
  vm.runInContext(`activeTab = 'meals';`, sandbox);
  sandbox.__mainEl.scrollTop = 400;
  vm.runInContext(`switchTab('meals');`, sandbox);
  assert.strictEqual(sandbox.__mainEl.scrollTop, 0);
  assert.deepStrictEqual(sandbox.__scrollToCalls, [[0, 0]]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
