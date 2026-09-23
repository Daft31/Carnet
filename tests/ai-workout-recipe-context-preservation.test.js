// Test ciblé — Phase 3, Lot C : préservation du contexte dans les flux IA
// "Coller un programme (IA)" (js/workoutparser.js) et "Importer une recette"
// (js/recipeimport.js). Avant ce lot, cliquer "Recommencer"/"Importer une autre
// recette" rouvrait la modale d'import totalement vide, perdant le texte/l'URL
// que l'utilisateur venait de fournir — comportement corrigé en répliquant le
// pattern déjà stabilisé dans js/mealparser.js (prefillText/sourceText).
//
// Même technique que tests/meal-parser-network-error.test.js : chargement du
// VRAI js/workoutparser.js ou js/recipeimport.js dans un bac à sable Node (`vm`),
// DOM minimal mémoïsé par id, seule la frontière externe (`fetch`) est stubbée.
// `openModal(html)` est mocké pour capturer le HTML réellement généré (pas de
// vrai parsing DOM) — permet de vérifier le contenu prérempli de #wiText/#riUrl
// tel qu'écrit dans le template, sans dépendre d'un moteur HTML.
//
// Point important (Test "fidélité") : les données IA simulées (blocks/exercices,
// nom/ingrédients de recette) sont délibérément DIFFÉRENTES du texte/URL
// d'origine — si une implémentation reconstruisait le préremplissage depuis
// `data` (blocks, defaultName, ingredients...) au lieu de repasser le texte/URL
// réellement envoyé au fetch(), ces tests échoueraient en détectant un contenu
// reconstruit au lieu de l'original.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { execFileSync } = require('child_process');

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
        onclick: null,
      });
    }
    return elements.get(id);
  }
  return { getElementById: elFor, querySelectorAll: () => [], _elements: elements };
}

function loadWorkoutSandbox(fetchImpl) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  let lastModalHtml = '';
  const logEntries = [];
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    location: { hostname: 'kalo-test.vercel.app' },
    document,
    AbortController,
    toast: () => {},
    openModal: (html) => { lastModalHtml = html; },
    closeModal: () => {},
    escapeHtml: (s) => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    logEntries,
    save: () => {},
    render: () => {},
    uid: (() => { let n = 0; return () => 'wid' + (n++); })(),
    currentDate: '2026-01-15',
    getCurrentWeight: () => 70,
    estimateManualSession: () => ({ kcal: 300 }),
    fetch: fetchImpl,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'workoutparser.js'), 'utf8'), sandbox, { filename: 'js/workoutparser.js' });
  sandbox.__document = document;
  sandbox.__getLastModalHtml = () => lastModalHtml;
  sandbox.__getLogEntries = () => logEntries;
  return sandbox;
}

function loadRecipeSandbox(fetchImpl) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  let lastModalHtml = '';
  const recipes = [];
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    location: { hostname: 'kalo-test.vercel.app' },
    document,
    AbortController,
    toast: () => {},
    openModal: (html) => { lastModalHtml = html; },
    closeModal: () => {},
    escapeHtml: (s) => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    recipes,
    recipeBooks: [],
    save: () => {},
    render: () => {},
    uid: (() => { let n = 0; return () => 'rid' + (n++); })(),
    todayStr: () => '2026-01-15',
    createRecipeBook: (name) => ({ id: 'book1', name }),
    addIngredientsToShoppingList: () => 0,
    fetch: fetchImpl,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'recipeimport.js'), 'utf8'), sandbox, { filename: 'js/recipeimport.js' });
  sandbox.__document = document;
  sandbox.__getLastModalHtml = () => lastModalHtml;
  return sandbox;
}

function jsonResponse(body) {
  return { ok: true, json: async () => body };
}

let passed = 0, failed = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => {
    passed++; console.log(`  ok  ${name}`);
  }).catch(e => {
    failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e));
  });
}

const ORIGINAL_WORKOUT_TEXT = '45 min tapis incliné 9% à 5 km/h';
// Réponse IA délibérément SANS RAPPORT avec ORIGINAL_WORKOUT_TEXT : si le
// préremplissage de "Recommencer" était reconstruit depuis `blocks`/le nom par
// défaut plutôt que de repasser le texte réellement envoyé, il contiendrait
// "Squat"/"Développé couché", jamais "tapis incliné".
const WORKOUT_AI_RESPONSE = {
  success: true,
  data: {
    blocks: [{ name: 'Block 1', type: 'standard', exercises: [{ name: 'Squat', sets: 4, reps: 8 }, { name: 'Développé couché', sets: 4, reps: 8 }] }],
    warnings: [],
    estimatedDurationMin: 40,
  },
};

const ORIGINAL_RECIPE_URL = 'https://www.tiktok.com/@chef/video/1234567890';
// Idem : nom/ingrédients IA sans rapport avec ORIGINAL_RECIPE_URL.
const RECIPE_AI_RESPONSE = {
  success: true,
  data: {
    name: 'Curry de légumes',
    servings: 2,
    ingredients: [{ name: 'curry', qty: '1 c.à.s' }],
    steps: ['Faire revenir les légumes'],
  },
};

async function run() {
  // ---------- Workout : Test 1 + Test 6 (contexte conservé + fidélité) ----------
  await test('Workout — "Recommencer" prérempli #wiText avec le texte EXACT envoyé au fetch (jamais reconstruit depuis les blocks IA)', async () => {
    const fetchCalls = [];
    const sandbox = loadWorkoutSandbox(async (url, opts) => {
      fetchCalls.push(JSON.parse(opts.body));
      return jsonResponse(WORKOUT_AI_RESPONSE);
    });
    vm.runInContext('openWorkoutImportModal();', sandbox);
    sandbox.__document.getElementById('wiText').value = ORIGINAL_WORKOUT_TEXT;
    await sandbox.__document.getElementById('wiSubmitBtn').onclick();

    assert.strictEqual(fetchCalls.length, 1);
    assert.strictEqual(fetchCalls[0].programText, ORIGINAL_WORKOUT_TEXT, 'le texte réellement envoyé au fetch est bien le texte saisi');

    // Le résultat est affiché (openWorkoutResultModal a bien été appelée avec le
    // vrai sourceText) : on clique "Recommencer".
    let html = sandbox.__getLastModalHtml();
    assert.ok(html.includes('id="wiRedoBtn"'), 'la modale de résultat doit être affichée avec le bouton Recommencer');
    sandbox.__document.getElementById('wiRedoBtn').onclick();

    html = sandbox.__getLastModalHtml();
    // Le `placeholder="ex. ... Squat 4x8 ..."` de ce template contient légitimement
    // le mot "Squat" à titre d'exemple statique — on isole donc le contenu RÉEL de
    // la textarea (entre sa balise ouvrante, qui inclut ce placeholder, et sa
    // fermeture) plutôt que de chercher "Squat" dans le HTML entier.
    const textareaMatch = html.match(/<textarea id="wiText"[^>]*>([\s\S]*?)<\/textarea>/);
    assert.ok(textareaMatch, '#wiText doit être présent dans la modale rouverte');
    assert.strictEqual(textareaMatch[1], ORIGINAL_WORKOUT_TEXT, '#wiText rouvert contient EXACTEMENT le texte original, pas une reconstruction depuis les blocks IA');
  });

  // ---------- Workout : Test 3 (pas de contamination) ----------
  await test('Workout — openWorkoutImportModal() sans argument, y compris après une session précédente, laisse #wiText vide', async () => {
    const sandbox = loadWorkoutSandbox(async () => jsonResponse(WORKOUT_AI_RESPONSE));
    vm.runInContext('openWorkoutImportModal();', sandbox);
    sandbox.__document.getElementById('wiText').value = ORIGINAL_WORKOUT_TEXT;
    await sandbox.__document.getElementById('wiSubmitBtn').onclick();
    sandbox.__document.getElementById('wiRedoBtn').onclick(); // une session avec contexte a bien eu lieu

    // Nouvelle ouverture normale (FAB / sélecteur "Saisie manuelle (IA)"), sans argument.
    vm.runInContext('openWorkoutImportModal();', sandbox);
    const html = sandbox.__getLastModalHtml();
    assert.ok(html.includes('id="wiText"'));
    assert.ok(!html.includes(ORIGINAL_WORKOUT_TEXT), 'aucun état résiduel ne doit préremplir #wiText lors d\'un appel sans argument');
    assert.ok(/<textarea id="wiText"[^>]*><\/textarea>/.test(html), '#wiText doit être strictement vide');
  });

  // ---------- Workout : Test 5 (annulation puis nouvelle session normale) ----------
  await test('Workout — après une session avec contexte, une nouvelle ouverture normale (pas via Recommencer) reste vide', async () => {
    const sandbox = loadWorkoutSandbox(async () => jsonResponse(WORKOUT_AI_RESPONSE));
    vm.runInContext('openWorkoutImportModal();', sandbox);
    sandbox.__document.getElementById('wiText').value = ORIGINAL_WORKOUT_TEXT;
    await sandbox.__document.getElementById('wiSubmitBtn').onclick();
    // L'utilisateur ferme la modale de résultat sans cliquer "Recommencer" (✕/fond,
    // hors périmètre de ce test — closeModal() est un no-op ici), puis relance le
    // flux depuis son point d'entrée normal.
    vm.runInContext('openWorkoutImportModal();', sandbox);
    const html = sandbox.__getLastModalHtml();
    assert.ok(/<textarea id="wiText"[^>]*><\/textarea>/.test(html), '#wiText vide lors d\'une réouverture normale après une session précédente non reprise via Recommencer');
  });

  // ---------- Workout : Test 7 (confirmation unique inchangée) ----------
  await test('Workout — la garde anti-double-confirmation de #wiSaveBtn n\'est pas cassée par l\'ajout du préremplissage', async () => {
    const sandbox = loadWorkoutSandbox(async () => jsonResponse(WORKOUT_AI_RESPONSE));
    vm.runInContext('openWorkoutImportModal();', sandbox);
    sandbox.__document.getElementById('wiText').value = ORIGINAL_WORKOUT_TEXT;
    await sandbox.__document.getElementById('wiSubmitBtn').onclick();

    sandbox.__document.getElementById('wiDuration').value = '45';
    const saveBtn = sandbox.__document.getElementById('wiSaveBtn');
    saveBtn.onclick();
    saveBtn.onclick(); // double-tap physique simulé

    assert.strictEqual(sandbox.__getLogEntries().length, 1, 'un seul logEntry malgré le double clic');
  });

  // ---------- Recipe : Test 2 + Test 6bis (contexte conservé + fidélité) ----------
  await test('Recipe — "Importer une autre recette" prérempli #riUrl avec l\'URL EXACTE envoyée au fetch (jamais reconstruite depuis les données IA)', async () => {
    const fetchCalls = [];
    const sandbox = loadRecipeSandbox(async (url, opts) => {
      fetchCalls.push(JSON.parse(opts.body));
      return jsonResponse(RECIPE_AI_RESPONSE);
    });
    vm.runInContext('openRecipeImportModal();', sandbox);
    sandbox.__document.getElementById('riUrl').value = ORIGINAL_RECIPE_URL;
    await sandbox.__document.getElementById('riSubmitBtn').onclick();

    assert.strictEqual(fetchCalls.length, 1);
    assert.strictEqual(fetchCalls[0].tiktokUrl, ORIGINAL_RECIPE_URL);

    let html = sandbox.__getLastModalHtml();
    assert.ok(html.includes('id="riRedoBtn"'));
    sandbox.__document.getElementById('riRedoBtn').onclick();

    html = sandbox.__getLastModalHtml();
    assert.ok(html.includes(`value="${ORIGINAL_RECIPE_URL}"`), '#riUrl rouvert contient EXACTEMENT l\'URL originale, pas une reconstruction depuis les données IA');
    assert.ok(!html.includes('Curry'), 'le préremplissage ne doit jamais provenir du nom/des ingrédients retournés par l\'IA');
  });

  // ---------- Recipe : Test 4 (pas de contamination) ----------
  await test('Recipe — openRecipeImportModal() sans argument, y compris après une session précédente, laisse #riUrl vide', async () => {
    const sandbox = loadRecipeSandbox(async () => jsonResponse(RECIPE_AI_RESPONSE));
    vm.runInContext('openRecipeImportModal();', sandbox);
    sandbox.__document.getElementById('riUrl').value = ORIGINAL_RECIPE_URL;
    await sandbox.__document.getElementById('riSubmitBtn').onclick();
    sandbox.__document.getElementById('riRedoBtn').onclick();

    vm.runInContext('openRecipeImportModal();', sandbox);
    const html = sandbox.__getLastModalHtml();
    assert.ok(!html.includes(ORIGINAL_RECIPE_URL), 'aucun état résiduel ne doit préremplir #riUrl lors d\'un appel sans argument');
    assert.ok(html.includes('value=""'), '#riUrl doit être strictement vide');
  });

  // ---------- Recipe : Test 5bis (annulation puis nouvelle session normale) ----------
  await test('Recipe — après une session avec contexte, une nouvelle ouverture normale (pas via le bouton de reprise) reste vide', async () => {
    const sandbox = loadRecipeSandbox(async () => jsonResponse(RECIPE_AI_RESPONSE));
    vm.runInContext('openRecipeImportModal();', sandbox);
    sandbox.__document.getElementById('riUrl').value = ORIGINAL_RECIPE_URL;
    await sandbox.__document.getElementById('riSubmitBtn').onclick();
    vm.runInContext('openRecipeImportModal();', sandbox);
    const html = sandbox.__getLastModalHtml();
    assert.ok(html.includes('value=""'), '#riUrl vide lors d\'une réouverture normale après une session précédente non reprise');
  });

  // ---------- Recipe : Test 8 (pas de double création via riSaveRecipeBtn) ----------
  await test('Recipe — cliquer "Enregistrer la recette" (même deux fois) n\'ajoute jamais directement à `recipes` : ouvre le choix de livre avec le bon sourceUrl', async () => {
    const sandbox = loadRecipeSandbox(async () => jsonResponse(RECIPE_AI_RESPONSE));
    vm.runInContext('openRecipeImportModal();', sandbox);
    sandbox.__document.getElementById('riUrl').value = ORIGINAL_RECIPE_URL;
    await sandbox.__document.getElementById('riSubmitBtn').onclick();

    const saveBtn = sandbox.__document.getElementById('riSaveRecipeBtn');
    saveBtn.onclick();
    saveBtn.onclick(); // double-tap physique simulé

    vm.runInContext('this.__recipesLen = recipes.length;', sandbox);
    assert.strictEqual(sandbox.__recipesLen, 0, 'aucune recette créée avant le choix explicite d\'un livre (comportement inchangé, non affecté par le Lot C)');
    const html = sandbox.__getLastModalHtml();
    assert.ok(html.includes('Dans quel livre ranger cette recette'), 'le clic ouvre bien le choix de livre existant');
  });

  // ---------- H : fichiers hors périmètre inchangés ----------
  function assertUnchanged(relPath) {
    let baseline;
    try {
      baseline = execFileSync('git', ['show', `origin/main:${relPath}`], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    } catch (e) {
      baseline = execFileSync('git', ['show', `HEAD:${relPath}`], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    }
    const current = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
    assert.strictEqual(current, baseline, `${relPath} doit rester strictement identique à origin/main`);
  }

  await test('js/core.js est strictement identique à origin/main (aucun changement de modèle, aucun impact sur les flux manuels tapis/vélo/sport/club)', () => {
    assertUnchanged('js/core.js');
  });
  await test('js/ui.js est strictement identique à origin/main (Test 9 : les flux manuels de séance — wkType/wkParams — vivent entièrement ici et restent inchangés)', () => {
    assertUnchanged('js/ui.js');
  });
  await test('js/scanner.js est strictement identique à origin/main (hors périmètre Lot C)', () => {
    assertUnchanged('js/scanner.js');
  });
  await test('js/mealparser.js est strictement identique à origin/main (Test 10 : son mécanisme prefillText/sourceText existant reste intact)', () => {
    assertUnchanged('js/mealparser.js');
  });
  await test('api/parse-workout.js est strictement identique à origin/main (aucune modification backend)', () => {
    assertUnchanged('api/parse-workout.js');
  });
  await test('api/parse-recipe.js est strictement identique à origin/main (aucune modification backend)', () => {
    assertUnchanged('api/parse-recipe.js');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
