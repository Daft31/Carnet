// Test ciblé — AI-P2-1 (audit Phase 2.3.1) : une requête fetch() IA en vol devait
// continuer même après fermeture de la modale correspondante, avec le risque qu'une
// réponse tardive manipule des éléments DOM déjà retirés (#aiStatus/#riStatus/#wiStatus,
// boutons de soumission). Correctif : un AbortController local à chaque ouverture de
// modale (js/mealparser.js, js/recipeimport.js, js/workoutparser.js), annulé quand
// l'utilisateur ferme la modale via #modalClose ou un clic sur #modalBg — jamais de
// modification de closeModal() (js/ui.js), qui reste générique et partagé.
//
// Même approche que les autres fichiers de tests/ : charge les VRAIS fichiers source dans
// un bac à sable Node (`vm`), avec un stub `fetch`/`document` qui expose un vrai système
// d'écoute d'événements (addEventListener/dispatch) pour pouvoir simuler un clic réel sur
// #modalClose pendant qu'une requête est en attente — on vérifie un COMPORTEMENT (le
// signal transmis au fetch passe bien à `aborted:true`, aucun toast/texte d'erreur
// n'apparaît, le second bouton reste dans l'état "en cours"), pas juste la présence du
// mot "AbortController" dans le code source.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// ------- stub DOM minimal avec un vrai addEventListener par élément (mémoïsé par id) -------
function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      elements.set(id, {
        id,
        value: '',
        _text: '',
        get textContent() { return this._text; },
        set textContent(v) { this._text = v; },
        style: { display: 'none' },
        disabled: false,
        addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn); },
        _dispatch(type, evt) { (listeners[type] || []).forEach(fn => fn(evt || { target: elements.get(id) })); },
        onclick: null,
        addEventListenerCount(type) { return (listeners[type] || []).length; },
      });
    }
    return elements.get(id);
  }
  return { getElementById: elFor, _elements: elements };
}

function loadSandbox(sourceFiles, extraGlobals = {}) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    location: { hostname: 'localhost' },
    document,
    AbortController,
    toast: () => {},
    openModal: () => {},
    escapeHtml: (s) => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    ...extraGlobals,
  };
  vm.createContext(sandbox);
  sourceFiles.forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), sandbox, { filename: f });
  });
  sandbox.__document = document;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// ===================== Meal AI (js/mealparser.js) =====================

test('Meal AI — fermeture de la modale (#modalClose) pendant la requête : le signal passé à fetch() est bien abandonné', () => {
  let capturedSignal = null;
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js'], {
    fetch: (url, opts) => { capturedSignal = opts.signal; return pending.promise; },
  });
  sandbox.openAIDescribeModal();
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise';
  sandbox.__document.getElementById('aiSubmitBtn').onclick();
  assert.ok(capturedSignal, 'un AbortSignal doit être transmis à fetch()');
  assert.strictEqual(capturedSignal.aborted, false, 'précondition : pas encore annulé avant la fermeture');
  sandbox.__document.getElementById('modalClose')._dispatch('click');
  assert.strictEqual(capturedSignal.aborted, true, 'le signal doit être abandonné après un clic sur #modalClose pendant la requête');
});

test('Meal AI — fermeture via clic sur #modalBg (fond de modale) pendant la requête : annule aussi', () => {
  let capturedSignal = null;
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js'], {
    fetch: (url, opts) => { capturedSignal = opts.signal; return pending.promise; },
  });
  sandbox.openAIDescribeModal();
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise';
  sandbox.__document.getElementById('aiSubmitBtn').onclick();
  const bg = sandbox.__document.getElementById('modalBg');
  bg._dispatch('click', { target: bg });
  assert.strictEqual(capturedSignal.aborted, true);
});

test('Meal AI — requête annulée : la rejection AbortError ne déclenche ni toast ni manipulation de #aiStatus/#aiSubmitBtn', async () => {
  let capturedSignal = null;
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js'], {
    fetch: (url, opts) => {
      capturedSignal = opts.signal;
      capturedSignal.addEventListener('abort', () => {
        const err = new Error('The operation was aborted.');
        err.name = 'AbortError';
        pending.reject(err);
      });
      return pending.promise;
    },
  });
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise';
  const clickPromise = btn.onclick();
  sandbox.__document.getElementById('modalClose')._dispatch('click');
  await clickPromise;
  assert.strictEqual(statusEl.textContent, '🤖 Analyse en cours…', 'le texte de statut ne doit jamais être remplacé par un message d\'erreur après une annulation volontaire');
  assert.strictEqual(btn.disabled, true, 'le bouton ne doit pas être réactivé après une annulation volontaire (la modale est de toute façon en train de se fermer)');
});

test('Meal AI — requête qui échoue réellement (pas une annulation) : message d\'erreur normal affiché, bouton réactivé', async () => {
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js'], {
    fetch: () => pending.promise,
  });
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise';
  const clickPromise = btn.onclick();
  pending.reject(new TypeError('Failed to fetch'));
  await clickPromise;
  assert.ok(statusEl.textContent.startsWith('❌'), 'une vraie erreur réseau doit toujours afficher un message d\'erreur');
  assert.strictEqual(btn.disabled, false, 'le bouton doit être réactivé après une vraie erreur (comportement inchangé)');
});

test('Meal AI — requête réussie normalement : comportement inchangé (openAIResultModal appelée)', async () => {
  const pending = deferred();
  let openResultCalled = null;
  const sandbox = loadSandbox(['js/mealparser.js'], {
    fetch: () => pending.promise,
  });
  // openAIResultModal fait partie du même fichier — on le remplace après chargement pour
  // observer l'appel sans exécuter tout son rendu (hors périmètre de ce test).
  vm.runInContext('this.__origOpenAIResultModal = openAIResultModal; openAIResultModal = function(data, text){ this.__called = {data, text}; };', sandbox);
  sandbox.openAIDescribeModal();
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise';
  const clickPromise = btn.onclick();
  pending.resolve({ ok: true, json: async () => ({ success: true, data: { calories: 500 } }) });
  await clickPromise;
  vm.runInContext('this.__result = this.__called;', sandbox);
  assert.ok(sandbox.__result, 'openAIResultModal doit être appelée normalement en cas de succès');
  assert.strictEqual(sandbox.__result.data.calories, 500);
});

// ===================== Recipe AI (js/recipeimport.js) =====================

test('Recipe AI — fermeture de la modale pendant la requête : signal abandonné, aucune donnée persistée', () => {
  let capturedSignal = null;
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js', 'js/recipeimport.js'], {
    fetch: (url, opts) => { capturedSignal = opts.signal; return pending.promise; },
  });
  sandbox.openRecipeImportModal();
  sandbox.__document.getElementById('riUrl').value = 'https://www.tiktok.com/@x/video/123';
  sandbox.__document.getElementById('riSubmitBtn').onclick();
  assert.ok(capturedSignal);
  sandbox.__document.getElementById('modalClose')._dispatch('click');
  assert.strictEqual(capturedSignal.aborted, true);
});

test('Recipe AI — annulation : aucun message d\'erreur affiché, aucun appel à recipes.unshift (rien de persisté)', async () => {
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js', 'js/recipeimport.js'], {
    fetch: (url, opts) => {
      opts.signal.addEventListener('abort', () => {
        const err = new Error('aborted'); err.name = 'AbortError';
        pending.reject(err);
      });
      return pending.promise;
    },
    recipes: [],
  });
  sandbox.openRecipeImportModal();
  const statusEl = sandbox.__document.getElementById('riStatus');
  const btn = sandbox.__document.getElementById('riSubmitBtn');
  sandbox.__document.getElementById('riUrl').value = 'https://www.tiktok.com/@x/video/123';
  const clickPromise = btn.onclick();
  sandbox.__document.getElementById('modalClose')._dispatch('click');
  await clickPromise;
  assert.ok(!statusEl.textContent.startsWith('❌'));
  vm.runInContext('this.__recipes = recipes;', sandbox);
  assert.strictEqual(sandbox.__recipes.length, 0, 'aucune recette ne doit être enregistrée suite à une requête annulée');
});

// ===================== Workout AI (js/workoutparser.js) =====================

test('Workout AI — fermeture de la modale pendant la requête : signal abandonné, aucune séance persistée', async () => {
  let capturedSignal = null;
  const pending = deferred();
  const sandbox = loadSandbox(['js/mealparser.js', 'js/workoutparser.js'], {
    fetch: (url, opts) => {
      capturedSignal = opts.signal;
      opts.signal.addEventListener('abort', () => {
        const err = new Error('aborted'); err.name = 'AbortError';
        pending.reject(err);
      });
      return pending.promise;
    },
    logEntries: [],
  });
  sandbox.openWorkoutImportModal();
  const statusEl = sandbox.__document.getElementById('wiStatus');
  const btn = sandbox.__document.getElementById('wiSubmitBtn');
  sandbox.__document.getElementById('wiText').value = 'Squat 4x8';
  const clickPromise = btn.onclick();
  assert.ok(capturedSignal);
  sandbox.__document.getElementById('modalClose')._dispatch('click');
  await clickPromise;
  assert.strictEqual(capturedSignal.aborted, true);
  assert.ok(!statusEl.textContent.startsWith('❌'), 'aucun message d\'erreur après une annulation volontaire');
  vm.runInContext('this.__log = logEntries;', sandbox);
  assert.strictEqual(sandbox.__log.length, 0, 'aucune séance ne doit être enregistrée suite à une requête annulée');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
