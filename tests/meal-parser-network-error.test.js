// Test ciblé — CP-02 (audit QA Phase 2.6, T-P2-3) : chemin d'erreur réseau NORMAL
// du parser repas IA (js/mealparser.js) — un échec réseau classique (fetch()
// rejeté, ou réponse serveur non-succès), pas une annulation (déjà couverte par
// tests/ai-abort-on-modal-close.test.js), pas un timeout extrême, pas une réponse
// malformée, pas une erreur de quota.
//
// tests/ai-abort-on-modal-close.test.js couvre déjà partiellement ce chemin
// (statusEl affiche l'erreur, bouton réactivé) pour le cas "fetch() rejette
// carrément" — ce fichier n'y ajoute PAS de doublon sur ces deux points précis,
// mais complète ce qui manquait : absence de donnée fantôme dans logEntries,
// le second cas réel "réponse serveur reçue mais non-succès" (res.ok===false ou
// json.success===false, chemin de code distinct — `if (!res.ok || !json.success)
// throw new Error(...)`), la garantie qu'openAIResultModal() n'est jamais appelée
// sur erreur, et la récupération déterministe après erreur (un nouvel essai
// fonctionne normalement).
//
// Même sandbox `vm` avec DOM mémoïsé par id que tests/ai-abort-on-modal-close.test.js
// (dupliqué localement, convention du repo : chaque fichier de tests/ est
// autonome). Seule la frontière externe (fetch) est stubbée ; openAIDescribeModal()
// et son handler de clic réel sont exécutés tels quels depuis js/mealparser.js.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      elements.set(id, {
        id, value: '', _text: '',
        get textContent() { return this._text; },
        set textContent(v) { this._text = v; },
        style: { display: 'none' },
        disabled: false,
        addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn); },
        _dispatch(type, evt) { (listeners[type] || []).forEach(fn => fn(evt || { target: elements.get(id) })); },
        onclick: null,
      });
    }
    return elements.get(id);
  }
  return { getElementById: elFor, _elements: elements };
}

function loadSandbox(fetchImpl) {
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
    logEntries: [],
    save: () => {},
    closeModal: () => {},
    render: () => {},
    uid: () => 'test-id',
    currentDate: '2026-09-19',
    mealSlot: 'Déjeuner',
    fetch: fetchImpl,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'mealparser.js'), 'utf8'), sandbox, { filename: 'js/mealparser.js' });
  sandbox.__document = document;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
}

test('Échec réseau normal (fetch() rejette, ex. hors-ligne) : aucune entrée fantôme dans logEntries, openAIResultModal() jamais appelée', async () => {
  const sandbox = loadSandbox(() => Promise.reject(new TypeError('Failed to fetch')));
  vm.runInContext('this.__resultCalled = false; openAIResultModal = function(){ this.__resultCalled = true; };', sandbox);
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise avec riz';
  await btn.onclick();

  assert.ok(statusEl.textContent.startsWith('❌'), 'un message d\'erreur normal doit toujours être affiché');
  assert.strictEqual(btn.disabled, false, 'le bouton doit être réactivé, jamais bloqué après une erreur');
  vm.runInContext('this.__le = JSON.stringify(logEntries);', sandbox);
  assert.strictEqual(sandbox.__le, '[]', 'aucune donnée alimentaire fantôme ne doit être enregistrée suite à un échec réseau');
  assert.strictEqual(sandbox.__resultCalled, false, 'openAIResultModal() ne doit jamais être appelée sur un échec réseau');
});

test('Réponse serveur reçue mais non-succès (res.ok=false avec un message d\'erreur métier) : message remonté tel quel, aucune donnée persistée', async () => {
  const sandbox = loadSandbox(() => Promise.resolve({
    ok: false,
    json: async () => ({ success: false, error: 'Clé API invalide' }),
  }));
  vm.runInContext('this.__resultCalled = false; openAIResultModal = function(){ this.__resultCalled = true; };', sandbox);
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet basquaise avec riz';
  await btn.onclick();

  assert.strictEqual(statusEl.textContent, '❌ Clé API invalide', 'le message d\'erreur du serveur (json.error) doit être remonté tel quel à l\'utilisateur');
  assert.strictEqual(btn.disabled, false);
  vm.runInContext('this.__le = JSON.stringify(logEntries);', sandbox);
  assert.strictEqual(sandbox.__le, '[]');
  assert.strictEqual(sandbox.__resultCalled, false);
});

test('Réponse HTTP ok mais success:false côté métier (cas réel distinct de res.ok=false) : traité comme une erreur normale, pas un succès silencieux', async () => {
  const sandbox = loadSandbox(() => Promise.resolve({
    ok: true,
    json: async () => ({ success: false, details: 'Description trop courte' }),
  }));
  vm.runInContext('this.__resultCalled = false; openAIResultModal = function(){ this.__resultCalled = true; };', sandbox);
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'x';
  await btn.onclick();

  assert.strictEqual(statusEl.textContent, '❌ Description trop courte', 'json.details doit être préféré à json.error quand présent (ordre réel du code : json.details || json.error)');
  assert.strictEqual(sandbox.__resultCalled, false, 'success:false ne doit jamais déclencher openAIResultModal(), même avec un statut HTTP 200');
});

test('Récupération déterministe : après une erreur réseau normale, un nouvel essai réussi fonctionne normalement (pas d\'état bloqué)', async () => {
  let callCount = 0;
  const sandbox = loadSandbox(() => {
    callCount++;
    if (callCount === 1) return Promise.reject(new TypeError('Failed to fetch'));
    return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { calories: 400, name: 'Repas test' } }) });
  });
  vm.runInContext('this.__result = null; openAIResultModal = function(data, text){ this.__result = data; };', sandbox);
  sandbox.openAIDescribeModal();
  const statusEl = sandbox.__document.getElementById('aiStatus');
  const btn = sandbox.__document.getElementById('aiSubmitBtn');
  sandbox.__document.getElementById('aiMealText').value = 'poulet';

  await btn.onclick(); // 1er essai : échoue
  assert.ok(statusEl.textContent.startsWith('❌'));
  assert.strictEqual(btn.disabled, false, 'le bouton doit être réutilisable pour un nouvel essai');

  await btn.onclick(); // 2e essai : réussit
  assert.strictEqual(callCount, 2);
  vm.runInContext('this.__r = this.__result;', sandbox);
  assert.strictEqual(sandbox.__r.calories, 400, 'un nouvel essai après erreur doit aboutir normalement, sans état résiduel bloquant');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
