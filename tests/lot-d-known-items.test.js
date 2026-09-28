// Test ciblé — Phase 3, Lot D — Option A ("montrer davantage ce que Kalo sait déjà,
// sans prétendre savoir davantage") : `api/parse-meal.js` expose désormais un champ
// `knownItems` (réutilisant tel quel matchFastfoodItems()/sumMatched(), aucun nouveau
// matching, aucun nouvel appel IA) listant les éléments reconnus de façon déterministe
// avec leur sous-total réel après application de leur quantité. `js/mealparser.js`
// (openAIResultModal) affiche ce bloc en lecture seule ("Éléments identifiés") et, pour
// un repas 'mixed', une ligne distincte "Reste du repas : ~X kcal (estimation IA)" —
// jamais présentée comme déterministe, jamais affichée en négatif.
//
// Deux familles de tests dans ce fichier :
// - Tests 1, 2, 3, 4, 5 : la VRAIE logique serveur d'api/parse-meal.js (`export default`
//   retiré avant `vm.runInContext`, même stratégie que tests/api-cors-and-size-limits.test.js),
//   avec `fetch` stubbé UNIQUEMENT pour la partie IA (jamais pour le matching déterministe,
//   qui n'appelle jamais fetch).
// - Tests 6 à 9 : le VRAI js/mealparser.js (+ js/core.js + js/ui.js pour openModal/
//   closeModal réels), même DOM minimal mémoïsé par id que
//   tests/qty-modal-manual-meal-add.test.js, pour inspecter le HTML réellement généré
//   dans #modal-root et le comportement réel de confirmation/annulation.
// Test 10 : régression — les fichiers hors périmètre du Lot D restent inchangés.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { execFileSync } = require('child_process');

let passed = 0, failed = 0;
const pending = [];
function test(name, fn) {
  pending.push(async () => {
    try { await fn(); passed++; console.log(`  ok  ${name}`); }
    catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
  });
}

/* ===================== Partie API (api/parse-meal.js) ===================== */

function loadHandler(fetchImpl, envOverrides = {}) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'api', 'parse-meal.js'), 'utf8');
  const scriptSrc = src.replace(/^export default /m, '');
  const sandbox = {
    console,
    process: { env: { CARNET_API_KEY: 'test-key', ...envOverrides } },
    fetch: fetchImpl || (async () => { throw new Error('fetch ne doit pas être appelé (repas entièrement catalogué)'); }),
  };
  vm.createContext(sandbox);
  vm.runInContext(scriptSrc, sandbox, { filename: 'api/parse-meal.js' });
  return sandbox.handler;
}
function mockReq(mealDescription) {
  return { method: 'POST', headers: { origin: 'https://daft31.github.io' }, body: { mealDescription } };
}
function mockRes() {
  const res = {
    statusCode: null, headers: {}, _body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this._body = payload; return this; },
    end() { return this; },
  };
  return res;
}
function mammouthFetchReturning(aiJson) {
  return async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(aiJson) } }] }),
  });
}

test('1 — repas entièrement déterministe ("big mac") : confidence=catalog, knownItems contient le Big Mac, kcal/macros correctes', async () => {
  const handler = loadHandler();
  const req = mockReq('big mac');
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const data = res._body.data;
  assert.strictEqual(data.confidence, 'catalog');
  assert.ok(Array.isArray(data.knownItems));
  assert.strictEqual(data.knownItems.length, 1);
  const item = data.knownItems[0];
  assert.strictEqual(item.label, 'Big Mac');
  assert.strictEqual(item.kcal, 530);
  assert.strictEqual(item.protein, 27);
  assert.strictEqual(item.carbs, 42);
  assert.strictEqual(item.fat, 28);
});

test('2 — repas mixte ("big mac + un peu de salade") : Big Mac dans knownItems, salade absente de knownItems, total = catalogue + IA', async () => {
  const handler = loadHandler(mammouthFetchReturning({ name: 'Salade', calories: 50, protein: 2, carbs: 5, fat: 2 }));
  const req = mockReq('big mac + un peu de salade');
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const data = res._body.data;
  assert.strictEqual(data.confidence, 'mixed');
  assert.ok(Array.isArray(data.knownItems));
  assert.strictEqual(data.knownItems.length, 1, 'seul le Big Mac est déterministe, jamais la salade (estimée par IA)');
  assert.strictEqual(data.knownItems[0].label, 'Big Mac');
  assert.strictEqual(data.knownItems[0].kcal, 530);
  // La salade n'apparaît jamais dans knownItems, seulement dans ingredients (agrégé).
  assert.ok(!data.knownItems.some(it => /salade/i.test(it.label)));
  // Total final = 530 (Big Mac, catalogue) + 50 (salade, IA) = 580.
  assert.strictEqual(data.calories, 580);
  // total - somme(knownItems) = partie IA, reconstituable côté client (voir js/mealparser.js).
  const knownSum = data.knownItems.reduce((s, it) => s + it.kcal, 0);
  assert.strictEqual(data.calories - knownSum, 50);
});

test('3 — repas entièrement IA (texte non reconnu) : knownItems === [], aucune décomposition artificielle', async () => {
  const handler = loadHandler(mammouthFetchReturning({ name: 'Plat mystère maison', calories: 400, protein: 20, carbs: 30, fat: 15 }));
  const req = mockReq('un plat que ma grand-mère a inventé');
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const data = res._body.data;
  assert.strictEqual(data.confidence, 'ai');
  assert.strictEqual(data.knownItems.length, 0);
});

test('4 — quantité explicite ("6 nuggets") : knownItems reflète la quantité réelle, macros multipliées correctement', async () => {
  const handler = loadHandler();
  const req = mockReq('6 nuggets');
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const data = res._body.data;
  assert.strictEqual(data.confidence, 'catalog');
  assert.strictEqual(data.knownItems.length, 1);
  const item = data.knownItems[0];
  assert.strictEqual(item.label, '6x Chicken McNugget');
  assert.strictEqual(item.qty, 6);
  // 43.5 kcal/protein 2.5/carbs 3.25/fat 2.25 par nugget x6 — sous-total réel, pas la
  // valeur d'un seul nugget.
  assert.strictEqual(item.kcal, 261);
  assert.strictEqual(item.protein, 15);
  assert.strictEqual(item.carbs, 19.5);
  assert.strictEqual(item.fat, 13.5);
});

test('5 — générique sans grammage ("fromage blanc" seul) : jamais placé artificiellement dans knownItems (estimé par IA à la place)', async () => {
  const handler = loadHandler(mammouthFetchReturning({ name: 'Fromage blanc', calories: 130, protein: 13, carbs: 6, fat: 5 }));
  const req = mockReq('fromage blanc');
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  const data = res._body.data;
  // Sans grammage explicite, matchFastfoodItems() ne reconnaît rien (voir le
  // commentaire dédié dans api/parse-meal.js) -> texte entier envoyé à l'IA.
  assert.strictEqual(data.confidence, 'ai');
  assert.strictEqual(data.knownItems.length, 0);
});

/* ===================== Partie Frontend (js/mealparser.js) ===================== */

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      const classes = new Set();
      elements.set(id, {
        id, value: '', innerHTML: '', className: '', style: {}, disabled: false,
        classList: {
          add(c) { classes.add(c); }, remove(c) { classes.delete(c); },
          toggle(c, force) { const on = force === undefined ? !classes.has(c) : force; if (on) classes.add(c); else classes.delete(c); },
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

function loadFrontendSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  const sandbox = {
    localStorage, console, window: { __toastT: null }, navigator: { userAgent: 'node-test' },
    location: { hostname: 'localhost' },
    document,
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
    AbortController,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8'), sandbox, { filename: 'js/ui.js' });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'mealparser.js'), 'utf8'), sandbox, { filename: 'js/mealparser.js' });
  vm.runInContext('render = function(){ this.__renderCalls = (this.__renderCalls||0) + 1; };', sandbox);
  sandbox.__document = document;
  return sandbox;
}
function modalRootHtml(sandbox) { return sandbox.__document.getElementById('modal-root').innerHTML; }
function getLogEntries(sandbox) {
  vm.runInContext('this.__le = JSON.parse(JSON.stringify(logEntries));', sandbox);
  return sandbox.__le;
}

test('6 — compatibilité défensive : ancienne réponse API sans knownItems -> aucun crash, comportement inchangé', () => {
  const sandbox = loadFrontendSandbox();
  const oldData = { name: 'Repas ancien', calories: 500, protein: 20, carbs: 40, fat: 15, confidence: 'ai', ingredients: ['ingrédient A', 'ingrédient B'] };
  assert.doesNotThrow(() => vm.runInContext(`openAIResultModal(${JSON.stringify(oldData)}, 'texte original');`, sandbox));
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('ingrédient A'), "l'ancien affichage ingredients reste utilisé en l'absence de knownItems");
  assert.ok(!html.includes('Éléments identifiés'), 'pas de bloc "Éléments identifiés" sans knownItems');
});

test('7 — confirmation : une seule entrée logEntries créée, sans champ knownItems', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac', calories: 530, protein: 27, carbs: 42, fat: 28, confidence: 'catalog',
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac');`, sandbox);
  // openModal() écrit un texte HTML dans #modal-root, jamais réellement parsé par ce DOM
  // mémoïsé (même limite que tests/log-entry-edit-inplace.test.js) : les champs éditables
  // doivent être renseignés explicitement avant de simuler la confirmation, comme le
  // ferait un vrai navigateur qui, lui, les aurait déjà préremplis depuis la valeur HTML.
  const d = sandbox.__document;
  d.getElementById('aiKcalInput').value = '530';
  d.getElementById('aiProteinInput').value = '27';
  d.getElementById('aiCarbsInput').value = '42';
  d.getElementById('aiFatInput').value = '28';
  d.getElementById('aiConfirmBtn').onclick();

  const log = getLogEntries(sandbox);
  assert.strictEqual(log.length, 1, 'une seule entrée créée');
  assert.strictEqual(log[0].kcal, 530);
  assert.ok(!('knownItems' in log[0]), "knownItems ne doit jamais être persisté dans logEntries (donnée transitoire de la modale)");
});

test('8 — annulation : fermer la modale sans confirmer ne crée aucune entrée', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac', calories: 530, protein: 27, carbs: 42, fat: 28, confidence: 'catalog',
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac');`, sandbox);
  vm.runInContext('closeModal();', sandbox); // jamais de clic sur #aiConfirmBtn
  assert.strictEqual(getLogEntries(sandbox).length, 0);
});

test('9a — provenance (mixed) : "Éléments identifiés" + "Reste du repas : ~X kcal (estimation IA)" corrects, jamais présentés comme déterministes', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac, Salade', calories: 580, protein: 29, carbs: 47, fat: 30, confidence: 'mixed',
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac + salade');`, sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('Éléments identifiés'));
  assert.ok(html.includes('Big Mac'));
  assert.ok(html.includes('530 kcal'));
  // 580 (total) - 530 (knownItems) = 50 de reste, jamais présenté comme une valeur sûre.
  assert.ok(html.includes('Reste du repas : ~50 kcal (estimation IA)'), 'le "~" et la mention "estimation IA" sont obligatoires');
});

test('9b — provenance (catalog) : aucune ligne "Reste du repas" (pas de partie IA)', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac', calories: 530, protein: 27, carbs: 42, fat: 28, confidence: 'catalog',
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac');`, sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(html.includes('Éléments identifiés'));
  assert.ok(!html.includes('Reste du repas'), 'un repas 100% catalogué ne doit jamais afficher de "reste"');
});

test('9c — défensif : total incohérent (< somme des knownItems) -> aucune valeur négative affichée, ligne "Reste du repas" omise', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac', calories: 100, protein: 5, carbs: 10, fat: 3, confidence: 'mixed', // total absurdement bas
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac');`, sandbox);
  const html = modalRootHtml(sandbox);
  assert.ok(!/Reste du repas.*-\d/.test(html), 'jamais un "reste" négatif affiché');
  assert.ok(!html.includes('Reste du repas'), 'ligne "Reste du repas" omise plutôt que trompeuse quand le calcul est incohérent');
});

test('9d — lecture seule : le bloc "Éléments identifiés" ne contient aucun contrôle interactif (pas de bouton, pas d\'input)', () => {
  const sandbox = loadFrontendSandbox();
  const data = {
    name: 'Big Mac, Salade', calories: 580, protein: 29, carbs: 47, fat: 30, confidence: 'mixed',
    knownItems: [{ label: 'Big Mac', kcal: 530, protein: 27, carbs: 42, fat: 28 }],
  };
  vm.runInContext(`openAIResultModal(${JSON.stringify(data)}, 'big mac + salade');`, sandbox);
  const html = modalRootHtml(sandbox);
  const startIdx = html.indexOf('Éléments identifiés');
  const endIdx = html.indexOf('qty-preview');
  assert.ok(startIdx > -1 && endIdx > startIdx);
  const block = html.slice(startIdx, endIdx);
  assert.ok(!/<button|<input|data-/.test(block), 'aucun bouton/input/attribut data- dans le bloc éléments identifiés (strictement lecture seule)');
});

/* ===================== Régression : fichiers hors périmètre du Lot D ===================== */

const FORBIDDEN_FILES = [
  'js/core.js', 'js/ui.js', 'js/scanner.js', 'js/workoutparser.js', 'js/recipeimport.js',
  'api/parse-workout.js', 'api/parse-recipe.js',
];
FORBIDDEN_FILES.forEach(f => {
  test(`10 — régression : ${f} est strictement identique à origin/main (hors périmètre Lot D)`, () => {
    let baseline;
    try {
      baseline = execFileSync('git', ['show', `origin/main:${f}`], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    } catch (e) {
      baseline = execFileSync('git', ['show', `HEAD:${f}`], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    }
    const current = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.strictEqual(current, baseline);
  });
});

(async () => {
  for (const run of pending) await run();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
