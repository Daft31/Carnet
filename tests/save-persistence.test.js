// Test ciblé — BUG-001 (audit Phase 2.1) : save() laissait une exception non gérée
// de localStorage.setItem() interrompre silencieusement le reste des écritures,
// donnant l'impression que la sauvegarde avait réussi alors qu'elle était partielle.
//
// Même approche que les autres fichiers de tests/ : pas de dépendance ajoutée, on
// charge le VRAI js/core.js dans un bac à sable Node (`vm`).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadKaloSandbox(storageOverrides = {}) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      if (storageOverrides.failOn && storageOverrides.failOn(k)) {
        throw new DOMExceptionLike('QuotaExceededError');
      }
      store.set(k, String(v));
    },
    removeItem: (k) => store.delete(k),
  };
  function DOMExceptionLike(name) { this.name = name; this.message = name; }
  let lastToast = null;
  const sandbox = {
    localStorage,
    console,
    window: {},
    navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  sandbox.getToastCalls = () => sandbox.__toastCalls;
  // logEntries est un `let` de haut niveau dans core.js : visible aux scripts suivants
  // exécutés dans ce même contexte vm, mais pas comme propriété de l'objet sandbox
  // (même limitation déjà rencontrée dans tests/workout-kcal.test.js) — passer par un
  // setter exécuté DANS le contexte plutôt que par une affectation directe depuis Node.
  vm.runInContext('this.__setLogEntries = (v) => { logEntries = v; };', sandbox);
  sandbox.setLogEntries = (v) => sandbox.__setLogEntries(v);
  return sandbox;
}

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

test('save() sans échec : toutes les clés écrites, aucun toast d\'erreur', () => {
  const sandbox = loadKaloSandbox();
  const ok = sandbox.save();
  assert.strictEqual(ok, true);
  assert.strictEqual(sandbox.getToastCalls().length, 0);
});

test('save() avec un setItem qui throw sur ct_log : aucune exception non gérée ne remonte', () => {
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_log' });
  assert.doesNotThrow(() => sandbox.save());
});

test('save() avec un setItem qui throw sur ct_log : l\'échec est signalé (toast error) et nomme la clé', () => {
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_log' });
  const ok = sandbox.save();
  assert.strictEqual(ok, false);
  const calls = sandbox.getToastCalls();
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].kind, 'error');
  assert.ok(/ct_log/.test(calls[0].msg), 'le message doit nommer la clé en échec');
});

test('save() avec un setItem qui throw sur une clé du MILIEU de la liste : les clés suivantes sont quand même tentées', () => {
  // ct_wpresets est écrite avant ct_log dans save() — si elle échoue, ct_log doit
  // quand même être tentée (pas d'abandon du reste de la séquence, cf. BUG-001).
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_wpresets' });
  const entries = [{ id: 'x1', date: '2026-09-18', type: 'meal', kcal: 100, protein: 0, carbs: 0, fat: 0 }];
  sandbox.setLogEntries(entries);
  sandbox.save();
  const raw = sandbox.localStorage.getItem('ct_log');
  assert.ok(raw, 'ct_log doit être écrit même si une clé précédente a échoué');
  assert.deepStrictEqual(JSON.parse(raw), entries);
});

test('save() avec plusieurs clés en échec : toutes sont nommées dans le message', () => {
  const sandbox = loadKaloSandbox({ failOn: (k) => k === 'ct_log' || k === 'ct_todos' });
  sandbox.save();
  const calls = sandbox.getToastCalls();
  assert.strictEqual(calls.length, 1);
  assert.ok(/ct_log/.test(calls[0].msg) && /ct_todos/.test(calls[0].msg));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
