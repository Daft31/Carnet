// Test ciblé — P2-7 (audit Phase 2.2) : caractérisation + correction du
// "clobbering" de toast après un échec partiel de save().
//
// L'audit constatait que save() (déjà durcie en Phase 2.1, BUG-001 : chaque clé
// est tentée indépendamment, un échec est signalé par un toast 'error') était
// presque toujours suivie, dans le même tick synchrone, d'un appel séparé
// `toast('X enregistré ✓')` par l'appelant. `toast()` réutilise un unique
// élément DOM (#toast) : ce second appel écrasait silencieusement le toast
// d'erreur de save() avant qu'il ne soit jamais visible à l'écran, donnant
// l'illusion d'une sauvegarde totale même quand certaines clés avaient échoué.
//
// Correctif : save(successMsg, successKind) est désormais la SEULE à décider du
// toast final (échec OU succès, jamais les deux) — voir js/core.js. Ce fichier
// vérifie ce comportement directement sur le vrai save(), et caractérise ce qui
// reste vrai après un rechargement simulé (les clés qui ont échoué gardent leur
// ancienne valeur en storage, comme documenté — pas un système transactionnel).
//
// Exécution : node tests/save-toast-clobbering.test.js

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
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__toastCalls = []; const _origToast = toast; toast = (msg, kind) => { this.__toastCalls.push({msg, kind}); return _origToast(msg, kind); };', sandbox);
  sandbox.getToastCalls = () => sandbox.__toastCalls;
  vm.runInContext('this.__setWeight = (v) => { weightEntries = v; };', sandbox);
  sandbox.setWeightEntries = (v) => sandbox.__setWeight(v);
  return { sandbox, store };
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test("save(msg) sans échec : affiche le message de succès, un seul toast", () => {
  const { sandbox } = loadKaloSandbox();
  const ok = sandbox.save('Pesée enregistrée ✓');
  assert.strictEqual(ok, true);
  const calls = sandbox.getToastCalls();
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].msg, 'Pesée enregistrée ✓');
  assert.notStrictEqual(calls[0].kind, 'error');
});

test("save() sans argument (sauvegarde interne silencieuse) : aucun toast si tout réussit — comportement historique préservé", () => {
  const { sandbox } = loadKaloSandbox();
  const ok = sandbox.save();
  assert.strictEqual(ok, true);
  assert.strictEqual(sandbox.getToastCalls().length, 0);
});

test("save(msg) avec une clé en échec : le toast d'ERREUR est affiché, jamais le message de succès (plus de clobbering)", () => {
  const { sandbox } = loadKaloSandbox({ failOn: (k) => k === 'ct_weight' });
  const ok = sandbox.save('Pesée enregistrée ✓');
  assert.strictEqual(ok, false);
  const calls = sandbox.getToastCalls();
  // Un seul toast émis par save() : jamais le succès ET l'échec (c'est tout le
  // point du correctif — avant, l'appelant émettait un second toast('Pesée
  // enregistrée ✓') juste après, qui écrasait celui-ci).
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].kind, 'error');
  assert.ok(/ct_weight/.test(calls[0].msg), 'le message doit nommer la clé en échec');
  assert.ok(!/Pesée enregistrée/.test(calls[0].msg), 'le message de succès ne doit jamais apparaître à la place de l\'échec');
});

test("save(msg, kind) : le kind personnalisé (ex. 'warn') est respecté quand la sauvegarde réussit", () => {
  const { sandbox } = loadKaloSandbox();
  sandbox.save('Import partiel : X invalide', 'warn');
  const calls = sandbox.getToastCalls();
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].kind, 'warn');
});

test("Caractérisation P2-7 — échec partiel puis 'reload' simulé : la clé en échec garde son ANCIENNE valeur en storage (pas de rollback mémoire, documenté, pas un bug)", () => {
  const { sandbox, store } = loadKaloSandbox();
  // Pesée initiale, sauvegardée avec succès (ct_weight = [w1] dans store).
  sandbox.setWeightEntries([{ id: 'w1', date: '2026-09-17', weight: 70 }]);
  sandbox.save();
  assert.deepStrictEqual(JSON.parse(store.get('ct_weight')), [{ id: 'w1', date: '2026-09-17', weight: 70 }]);

  // Deuxième pesée ajoutée en mémoire, mais ct_weight échoue à s'écrire cette fois
  // (ex. quota dépassé) — save() le signale (toast error), l'app continue avec
  // l'état mémoire à jour (comportement Phase 2.1, inchangé ici).
  const { sandbox: sandbox2 } = (() => {
    // Reconstruit un sandbox qui échoue spécifiquement sur ct_weight, mais
    // partage le même Map `store` pour simuler la MÊME session continuant après
    // l'échec (pas un nouveau localStorage vide).
    const localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { if (k === 'ct_weight') throw new Error('QuotaExceededError'); store.set(k, String(v)); },
      removeItem: (k) => store.delete(k),
    };
    const sb = { localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
      document: { getElementById: () => ({ className:'', innerHTML:'', classList:{add(){},remove(){}} }) },
      requestAnimationFrame: (fn) => fn(), setTimeout, clearTimeout };
    vm.createContext(sb);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sb, { filename: 'js/core.js' });
    vm.runInContext('this.__setWeight = (v) => { weightEntries = v; };', sb);
    return { sandbox: sb };
  })();
  sandbox2.__setWeight([{ id: 'w1', date: '2026-09-17', weight: 70 }, { id: 'w2', date: '2026-09-18', weight: 69.5 }]);
  const ok2 = sandbox2.save();
  assert.strictEqual(ok2, false, 'save() doit signaler explicitement que ct_weight a échoué');
  // Caractérisation : ct_weight en storage est resté à SON ANCIENNE valeur
  // (une seule pesée) — la nouvelle pesée w2 existe en mémoire mais n'a jamais
  // atteint le storage. C'est le comportement attendu et déjà correctement
  // signalé (BUG-001, Phase 2.1) : pas un rollback silencieux, pas une
  // corruption — juste une non-persistance honnêtement rapportée.
  assert.deepStrictEqual(JSON.parse(store.get('ct_weight')), [{ id: 'w1', date: '2026-09-17', weight: 70 }]);

  // "Reload" simulé : un tout nouveau contexte relit le storage tel quel (comme
  // le ferait un vrai rechargement de page) — w2 est bien absent, conforme au
  // toast d'erreur déjà montré à l'utilisateur au moment de l'échec (jamais
  // présenté comme entièrement sauvegardé, grâce au correctif ci-dessus).
  const localStorageReload = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const reloadSandbox = { localStorage: localStorageReload, console, window: {}, navigator: { userAgent: 'node-test' } };
  vm.createContext(reloadSandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), reloadSandbox, { filename: 'js/core.js' });
  vm.runInContext('this.__we = weightEntries;', reloadSandbox);
  assert.strictEqual(reloadSandbox.__we.length, 1, 'après reload, seule la pesée réellement persistée doit être là');
  assert.strictEqual(reloadSandbox.__we[0].id, 'w1');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
