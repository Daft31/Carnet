// Test ciblé — bug "Décrire un repas (IA) : le bouton ne fait plus rien (pas de modale)".
//
// Root cause démontrée en prod (voir README.md) : `aiBtn.onclick = openAIDescribeModal;`
// (js/ui.js) liait la fonction PAR RÉFÉRENCE DIRECTE. Le navigateur appelle alors le
// handler avec le MouseEvent du clic comme premier argument, donc
// `openAIDescribeModal(prefillText)` recevait l'event comme `prefillText` ; `escapeHtml`
// (js/core.js) plantait sur `event.replace(...)` avant même l'appel à `openModal()`,
// d'où l'absence totale de modale.
//
// Même approche que tests/workout-kcal.test.js : pas de dépendance ajoutée, on charge les
// VRAIS fichiers (js/core.js, js/mealparser.js, js/ui.js) dans un bac à sable Node (`vm`).

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
  let lastModalHtml = null;
  const sandbox = {
    localStorage,
    console,
    window: {},
    navigator: { userAgent: 'node-test' },
    location: { hostname: 'localhost' },
    openModal: (html) => { lastModalHtml = html; },
    // openAIDescribeModal() lit le HTML qu'elle vient de passer à openModal() pour construire
    // la modale, puis lie #aiSubmitBtn.onclick et (AI-P2-1, audit Phase 2.3.1) les listeners
    // d'annulation sur #modalClose/#modalBg — un stub d'élément générique avec addEventListener
    // no-op suffit, on n'exerce pas le clic "Analyser" lui-même (appel réseau), seulement la
    // construction de la modale qui est l'étape qui plantait avant l'ouverture (voir root cause
    // ci-dessus).
    document: { getElementById: () => ({ onclick: null, value: '', style: {}, addEventListener: () => {} }) },
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  const mealparserSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'mealparser.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext(mealparserSrc, sandbox, { filename: 'js/mealparser.js' });
  sandbox.getLastModalHtml = () => lastModalHtml;
  return sandbox;
}

const sandbox = loadKaloSandbox();
const { openAIDescribeModal } = sandbox;

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

test('openAIDescribeModal() sans argument (cas réel : bouton "Décrire un repas") ouvre bien la modale', () => {
  assert.doesNotThrow(() => openAIDescribeModal());
  assert.ok(sandbox.getLastModalHtml() && /aiMealText/.test(sandbox.getLastModalHtml()), 'openModal() doit être appelée avec le HTML de la modale IA');
});

test('openAIDescribeModal(texte) (cas réel : bouton "Reformuler") préremplit sans planter', () => {
  assert.doesNotThrow(() => openAIDescribeModal('poulet 150g'));
  assert.ok(/poulet 150g/.test(sandbox.getLastModalHtml()));
});

test('Régression — plus aucun binding par référence directe de openAIDescribeModal dans js/ui.js', () => {
  // Le bug venait précisément d'un `el.onclick = openAIDescribeModal;` (référence nue) :
  // le navigateur passe alors le MouseEvent comme `prefillText`. Les bindings valides
  // wrappent toujours l'appel (`()=>openAIDescribeModal()` ou avec un argument texte
  // explicite) — on vérifie qu'aucune régression ne réintroduit le pattern nu.
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  const bareBinding = /\.onclick\s*=\s*openAIDescribeModal\s*;/;
  assert.ok(!bareBinding.test(uiSrc), 'openAIDescribeModal ne doit jamais être bindé par référence directe (recevrait le MouseEvent comme prefillText)');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
