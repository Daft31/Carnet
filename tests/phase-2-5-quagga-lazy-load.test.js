// Tests ciblés — correctif Phase 2.5 / LOAD-1 (audit Performance, corrigé ci-après).
//
// Contexte : Quagga2 (js/scanner.js) était chargé en blocage sur `<head>` à CHAQUE
// page (index.html), pour une fonctionnalité (scanner code-barres) utilisée
// occasionnellement. Le correctif introduit `loadQuaggaScript()` (js/scanner.js) :
// chargement paresseux au premier `openScannerModal()`, mis en cache (la promesse,
// pas juste `window.Quagga`), avec garde contre une modale fermée pendant le
// chargement (même pattern que l'annulation des requêtes IA en vol, js/mealparser.js).
//
// Ce test simule le chargement du script `<script>` sans réseau réel (on ne peut
// pas atteindre cdn.jsdelivr.net dans cet environnement de test) : un faux DOM
// minimal intercepte `document.head.appendChild(script)` et laisse le test
// déclencher lui-même `script.onload()`/`script.onerror()`, pour contrôler
// précisément le timing (fermeture pendant le chargement, échec CDN, etc.).
//
// Pas de framework ajouté (cohérent avec le "sans build" de Kalo).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// Fausse implémentation DOM minimale — seulement ce dont js/scanner.js a besoin
// (getElementById par id, textContent, onclick, classList, document.body.contains,
// document.head.appendChild pour intercepter la balise <script>).
function makeFakeDom() {
  const elements = new Map();
  const bodySet = new Set();
  function makeEl(id) {
    const el = { id, textContent: '', onclick: null, classList: { add(){}, remove(){} } };
    elements.set(id, el);
    bodySet.add(el);
    return el;
  }
  const appendedScripts = [];
  const document = {
    getElementById: (id) => elements.get(id) || null,
    createElement: (tag) => {
      if (tag === 'script') {
        const script = { tagName: 'SCRIPT', src: '', onload: null, onerror: null };
        return script;
      }
      return {};
    },
    head: {
      appendChild: (script) => { appendedScripts.push(script); },
    },
    body: {
      contains: (el) => bodySet.has(el),
    },
  };
  return { document, elements, bodySet, appendedScripts, makeEl };
}

function loadScannerSandbox(fakeDom) {
  const openModalCalls = [];
  let modalOpen = false;
  const sandbox = {
    console,
    navigator: { userAgent: 'node-test' },
    document: fakeDom.document,
    fetch: async () => { throw new Error('fetch ne doit pas être appelé dans ces tests (lazy-load uniquement)'); },
    // openModal()/closeModal() réels de js/ui.js dépendent de tout un DOM que ce test
    // n'a pas besoin de simuler : on stub leur CONTRAT (créer/retirer les éléments
    // scannerStatus/scannerCancelBtn/scannerVideoWrap que js/scanner.js attend),
    // pas leur implémentation interne (animation, #modal-root, etc.).
    openModal: (html) => {
      openModalCalls.push(html);
      modalOpen = true;
      // Reproduit fidèlement ce que openModal() réel ferait (injecter le HTML tel
      // quel dans le DOM) pour la seule partie qui compte ici : le texte initial de
      // #scannerStatus, embarqué dans le template HTML passé par openScannerModal().
      const statusEl = fakeDom.makeEl('scannerStatus');
      const m = html.match(/id="scannerStatus"[^>]*>([^<]*)</);
      statusEl.textContent = m ? m[1] : '';
      fakeDom.makeEl('scannerCancelBtn');
      fakeDom.makeEl('scannerVideoWrap');
    },
    closeModal: () => {
      modalOpen = false;
      for (const id of ['scannerStatus', 'scannerCancelBtn', 'scannerVideoWrap']) {
        const el = fakeDom.elements.get(id);
        if (el) fakeDom.bodySet.delete(el);
      }
    },
    escapeHtml: (s) => String(s),
    toast: () => {},
    openCustomFoodModal: () => {},
    openScannedProductModal: () => {},
    mealSlot: 'Déjeuner',
    currentDate: '2026-09-19',
    logEntries: [],
    uid: () => 'x',
    save: () => {},
    render: () => {},
  };
  vm.createContext(sandbox);
  // `window` doit être le même objet que le global du contexte (comme dans un vrai
  // navigateur, où `window` EST le global) : js/scanner.js utilise `window.Quagga`
  // pour le test de disponibilité mais l'identifiant global nu `Quagga` pour les
  // appels (`Quagga.init(...)`, `Quagga.start()`, `Quagga.onDetected(...)`) — un
  // `window` séparé du global romprait ce lien et ferait planter startQuagga() avec
  // un faux `ReferenceError: Quagga is not defined`, un artefact du bac à sable et
  // non de js/scanner.js.
  vm.runInContext('var window = this;', sandbox);
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'scanner.js'), 'utf8');
  vm.runInContext(src, sandbox, { filename: 'js/scanner.js' });
  sandbox.__isModalOpen = () => modalOpen;
  sandbox.__openModalCalls = openModalCalls;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  return fn().then(() => {
    passed++;
    console.log(`  ok  ${name}`);
  }).catch((e) => {
    failed++;
    console.log(`FAIL  ${name}`);
    console.log('      ' + (e && e.stack ? e.stack : e));
  });
}

function flushMicrotasks() { return new Promise((r) => setTimeout(r, 0)); }

async function run() {
  await test('Chargement initial : ouvrir openScannerModal() n\'appelle jamais fetch/réseau tant que le script n\'a pas répondu, et affiche un état de chargement explicite', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.strictEqual(statusEl.textContent, 'Chargement du scanner…', 'un état de chargement explicite doit être affiché avant que Quagga soit disponible');
    assert.strictEqual(fakeDom.appendedScripts.length, 1, 'un seul <script> Quagga doit être injecté');
    assert.ok(fakeDom.appendedScripts[0].src.includes('quagga'), 'le script injecté doit être Quagga2');
  });

  await test('Ouverture du scanner : après succès du chargement CDN, Quagga est disponible et startQuagga() est appelée (caméra initialisée)', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    const script = fakeDom.appendedScripts[0];
    // Simule window.Quagga apparaissant une fois le script exécuté (comportement réel
    // d'un <script> classique : il pose son global avant que `onload` ne se déclenche),
    // PUIS le déclenchement effectif de `onload` — jamais avant l'ouverture, sinon on
    // ne testerait plus le chemin de chargement paresseux (loadQuaggaScript() retourne
    // immédiatement si window.Quagga existe déjà).
    vm.runInContext(`
      window.Quagga = {
        init: (opts, cb) => { this.__quaggaInitCalled = true; this.__quaggaInitOpts = opts; cb(null); },
        start: () => { this.__quaggaStarted = true; },
        stop: () => {},
        onDetected: () => {},
      };
    `, sandbox);
    script.onload(); // simule la fin du téléchargement/exécution du CDN
    await flushMicrotasks();
    assert.strictEqual(vm.runInContext('this.__quaggaInitCalled', sandbox), true, 'Quagga.init() doit être appelée une fois le script chargé');
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.strictEqual(statusEl.textContent, 'Recherche du code-barres…', 'le flux caméra doit démarrer normalement après chargement');
  });

  await test('Disponibilité avant startQuagga() : le chargement est bien terminé (window.Quagga défini) avant que startQuagga() ne soit invoquée — jamais de "Quagga undefined"', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    vm.runInContext(`
      window.Quagga = { init:(o,cb)=>{ this.__initSeenQuagga = !!window.Quagga; cb(null); }, start(){}, stop(){}, onDetected(){} };
    `, sandbox);
    fakeDom.appendedScripts[0].onload();
    await flushMicrotasks();
    assert.strictEqual(vm.runInContext('this.__initSeenQuagga', sandbox), true, 'window.Quagga doit être défini au moment où startQuagga()/Quagga.init() s\'exécute');
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.notStrictEqual(statusEl.textContent, 'Scanner indisponible (librairie non chargée).', 'ne doit jamais atteindre le message "Quagga undefined" après un chargement réussi');
  });

  await test('Fermeture pendant le chargement : le scanner fermé avant la fin du chargement CDN ne doit JAMAIS déclencher startQuagga()/Quagga.init() sur une modale disparue', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    vm.runInContext(`window.Quagga = { init:()=>{ this.__initCalledAfterClose = true; }, start(){}, stop(){}, onDetected(){} };`, sandbox);
    // L'utilisateur ferme la modale AVANT que le script n'ait fini de charger.
    vm.runInContext('closeModal();', sandbox);
    // Le <script> continue de charger en tâche de fond (on ne peut pas annuler un
    // <script src> déjà injecté) et finit par répondre — ne doit rien casser.
    fakeDom.appendedScripts[0].onload();
    await flushMicrotasks();
    assert.strictEqual(vm.runInContext('this.__initCalledAfterClose', sandbox), undefined, 'Quagga.init() ne doit jamais être appelée après la fermeture de la modale pendant le chargement');
  });

  await test('Réouverture du scanner : la seconde ouverture réutilise le même chargement (pas de second <script> injecté), et fonctionne normalement', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox); // 1re ouverture (déclenche le chargement)
    vm.runInContext('closeModal();', sandbox);
    vm.runInContext('openScannerModal();', sandbox); // 2e ouverture, AVANT la fin du chargement
    assert.strictEqual(fakeDom.appendedScripts.length, 1, 'la promesse de chargement doit être partagée, jamais un second <script> injecté pour une même session');
    vm.runInContext(`window.Quagga = { init:(o,cb)=>{ this.__initCount = (this.__initCount||0)+1; cb(null); }, start(){}, stop(){}, onDetected(){} };`, sandbox);
    fakeDom.appendedScripts[0].onload();
    await flushMicrotasks();
    assert.strictEqual(vm.runInContext('this.__initCount', sandbox), 1, 'la 2e ouverture (celle encore ouverte au moment du chargement) doit bien démarrer la caméra');
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.strictEqual(statusEl.textContent, 'Recherche du code-barres…');
  });

  await test('Réouverture après un chargement déjà réussi : aucun nouveau <script> injecté, Quagga redémarre immédiatement', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    vm.runInContext(`window.Quagga = { init:(o,cb)=>{ this.__initCount2 = (this.__initCount2||0)+1; cb(null); }, start(){}, stop(){}, onDetected(){} };`, sandbox);
    fakeDom.appendedScripts[0].onload();
    await flushMicrotasks();
    vm.runInContext('closeModal(); openScannerModal();', sandbox); // 2e ouverture, Quagga déjà chargé
    await flushMicrotasks();
    assert.strictEqual(fakeDom.appendedScripts.length, 1, 'aucun script supplémentaire ne doit être injecté une fois Quagga déjà chargé');
    assert.strictEqual(vm.runInContext('this.__initCount2', sandbox), 2, 'la caméra doit redémarrer à chaque ouverture, y compris quand Quagga est déjà en cache');
  });

  await test('Erreur de chargement CDN : un échec réseau affiche un message d\'erreur explicite, sans planter, et permet une nouvelle tentative à la prochaine ouverture', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    vm.runInContext('openScannerModal();', sandbox);
    fakeDom.appendedScripts[0].onerror();
    await flushMicrotasks();
    const statusEl = fakeDom.elements.get('scannerStatus');
    assert.strictEqual(statusEl.textContent, 'Scanner indisponible (échec du chargement de la librairie).');

    // Réouverture après échec : doit retenter un chargement frais (pas rester bloqué
    // sur la promesse rejetée précédente).
    vm.runInContext('closeModal(); openScannerModal();', sandbox);
    assert.strictEqual(fakeDom.appendedScripts.length, 2, 'une réouverture après échec doit retenter un chargement (nouveau <script>)');
    vm.runInContext(`window.Quagga = { init:(o,cb)=>{ this.__retrySucceeded = true; cb(null); }, start(){}, stop(){}, onDetected(){} };`, sandbox);
    fakeDom.appendedScripts[1].onload();
    await flushMicrotasks();
    assert.strictEqual(vm.runInContext('this.__retrySucceeded', sandbox), true, 'le scanner doit redevenir fonctionnel après une réouverture suivant un échec réseau');
  });

  await test('Absence de régression Open Food Facts : lookupBarcode() reste inchangée par ce correctif (aucun lien avec le chargement de Quagga)', async () => {
    const fakeDom = makeFakeDom();
    const sandbox = loadScannerSandbox(fakeDom);
    let fetchCalledWith = null;
    vm.runInContext('this.__setFetch = (fn) => { fetch = fn; };', sandbox);
    sandbox.__setFetch = (fn) => sandbox.__setFetch_inner ? null : null;
    // Remplace fetch directement dans le contexte (fetch est une variable globale du sandbox).
    vm.runInContext(`
      fetch = async (url) => {
        this.__fetchUrl = url;
        return { ok: true, json: async () => ({ status: 1, product: { product_name: 'Test', brands: '', nutriments: { 'energy-kcal_100g': 100, proteins_100g: 5, carbohydrates_100g: 10, fat_100g: 2 } } }) };
      };
    `, sandbox);
    const product = vm.runInContext('lookupBarcode("1234567890123")', sandbox);
    const result = await product;
    assert.ok(vm.runInContext('this.__fetchUrl', sandbox).includes('1234567890123'), 'lookupBarcode() doit toujours interroger Open Food Facts par code-barres, inchangé par le correctif Quagga');
    assert.strictEqual(result.kcal, 100);
    assert.strictEqual(result.name, 'Test');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
