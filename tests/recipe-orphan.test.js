// Test ciblé — P1-2 (audit Phase 2.2) : une recette dont le bookId est absent ou
// ne correspond à aucun livre existant devenait invisible en permanence, sans
// aucun chemin de récupération dans l'UI (normalizeRecipeBooks() ne répare le
// cas "bookId absent" qu'une seule fois, uniquement si recipeBooks.length===0 —
// jamais si des livres existent déjà, ex. après un import partiel).
//
// Correctif (js/core.js) : orphanRecipes() recalcule à chaque appel la liste des
// recettes dont bookId est absent OU invalide ; viewRecipes() les rend visibles
// dans un bucket "Recettes sans livre" permanent (jamais juste au premier
// chargement) ; assignRecipeToBook() permet de les ranger dans un livre valide
// sans perdre id/ingrédients/étapes ; deleteRecipeBookEmpty() vérifie désormais
// elle-même qu'aucune recette ne référence encore le livre avant de le supprimer.
//
// Même approche que les autres fichiers de tests/ : on charge le VRAI js/core.js
// dans un bac à sable Node (`vm`), sans dépendance ajoutée.

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
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: () => ({ className: '', innerHTML: '', classList: { add(){}, remove(){} } }) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8');
  vm.runInContext(coreSrc, sandbox, { filename: 'js/core.js' });
  vm.runInContext(
    'this.__setRecipes = (v)=>{ recipes = v; };' +
    'this.__setBooks = (v)=>{ recipeBooks = v; };' +
    'this.__getRecipes = ()=> recipes;' +
    'this.__getBooks = ()=> recipeBooks;',
    sandbox
  );
  // `recipes`/`recipeBooks` sont des `let` de haut niveau réassignés PAR RÉFÉRENCE
  // à l'intérieur des fonctions de core.js (ex. `recipeBooks = recipeBooks.filter(...)`
  // dans deleteRecipeBookEmpty()) : une copie de propriété prise une seule fois sur
  // `sandbox` deviendrait obsolète après un tel appel. On relit donc toujours la
  // valeur courante via ces accesseurs plutôt que via une propriété figée du sandbox
  // (même limitation déjà documentée dans save-persistence.test.js pour logEntries).
  sandbox.setRecipes = (v) => sandbox.__setRecipes(v);
  sandbox.setBooks = (v) => sandbox.__setBooks(v);
  Object.defineProperty(sandbox, 'recipes', { get: () => sandbox.__getRecipes(), configurable: true });
  Object.defineProperty(sandbox, 'recipeBooks', { get: () => sandbox.__getBooks(), configurable: true });
  return sandbox;
}

const orphanRecipe = (overrides = {}) => ({
  id: 'r1', name: 'Recette orpheline', ingredients: [{ name: 'Sel', qty: '1 pincée' }],
  steps: ['Étape 1'], servings: 2, sourceUrl: null, savedAt: '2026-09-18', bookId: undefined,
  ...overrides,
});

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('1. Recette sans bookId du tout : orphanRecipes() la détecte', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ bookId: undefined })]);
  const orphans = sandbox.orphanRecipes();
  assert.strictEqual(orphans.length, 1);
  assert.strictEqual(orphans[0].id, 'r1');
});

test('2. Recette avec bookId pointant vers un livre inexistant : orphanRecipes() la détecte aussi', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ bookId: 'b_supprime_depuis' })]);
  const orphans = sandbox.orphanRecipes();
  assert.strictEqual(orphans.length, 1);
});

test("3. Import d'une recette orpheline alors que plusieurs livres existent déjà : normalizeRecipeBooks() (rattrapage \"aucun livre\") ne la touche pas, mais orphanRecipes() la couvre quand même en permanence", () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }, { id: 'b2', name: 'Plats' }]);
  sandbox.setRecipes([orphanRecipe({ bookId: 'introuvable' })]);
  sandbox.normalizeRecipeBooks(); // ne doit rien faire ici (recipeBooks.length!==0)
  assert.strictEqual(sandbox.recipes[0].bookId, 'introuvable', "normalizeRecipeBooks() n'est pas censée agir dans ce cas");
  const orphans = sandbox.orphanRecipes();
  assert.strictEqual(orphans.length, 1, 'orphanRecipes() reste le filet de sécurité permanent pour ce cas');
});

test('4. Affichage/récupération : viewRecipes() rend la recette orpheline dans un bucket dédié, avec son nom, jamais masquée', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ name: 'Tarte mystère', bookId: null })]);
  const html = sandbox.viewRecipes();
  assert.ok(/Recettes sans livre/.test(html), 'un bucket "Recettes sans livre" doit apparaître');
  assert.ok(html.includes('Tarte mystère'), 'le nom de la recette orpheline doit être visible');
  assert.ok(/data-recipe-delete="r1"/.test(html), 'la recette orpheline doit rester supprimable (bouton présent)');
});

test('5. Suppression normale : une recette orpheline supprimée disparaît de recipes ET de orphanRecipes()', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ id: 'r1', bookId: null }), orphanRecipe({ id: 'r2', bookId: 'b1' })]);
  // Même mécanisme que le handler réel [data-recipe-delete] (js/ui.js) : filtrer par id.
  sandbox.setRecipes(sandbox.recipes.filter(r => r.id !== 'r1'));
  assert.strictEqual(sandbox.orphanRecipes().length, 0);
  assert.strictEqual(sandbox.recipes.length, 1);
  assert.strictEqual(sandbox.recipes[0].id, 'r2');
});

test("6. deleteRecipeBookEmpty() s'auto-protège : refuse de supprimer un livre encore référencé par une recette, même sans passer par le garde-fou de l'appelant UI", () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ id: 'r1', bookId: 'b1' })]);
  const result = sandbox.deleteRecipeBookEmpty('b1');
  assert.strictEqual(result, false, 'doit refuser et renvoyer false');
  assert.strictEqual(sandbox.recipeBooks.length, 1, 'le livre ne doit pas avoir été supprimé');
  assert.strictEqual(sandbox.orphanRecipes().length, 0, 'la recette ne doit surtout pas devenir orpheline par ce chemin');
});

test('6bis. deleteRecipeBookEmpty() supprime bien un livre réellement vide (régression)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([]);
  const result = sandbox.deleteRecipeBookEmpty('b1');
  assert.strictEqual(result, true);
  assert.strictEqual(sandbox.recipeBooks.length, 0);
});

test('7. Déplacement vers un livre valide : assignRecipeToBook() range la recette sans perdre id/nom/ingrédients/étapes', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }, { id: 'b2', name: 'Plats' }]);
  const r = orphanRecipe({ id: 'r1', name: 'Tarte mystère', bookId: null });
  sandbox.setRecipes([r]);
  const ok = sandbox.assignRecipeToBook('r1', 'b2');
  assert.strictEqual(ok, true);
  assert.strictEqual(sandbox.recipes[0].bookId, 'b2');
  assert.strictEqual(sandbox.recipes[0].id, 'r1');
  assert.strictEqual(sandbox.recipes[0].name, 'Tarte mystère');
  assert.deepStrictEqual(sandbox.recipes[0].ingredients, [{ name: 'Sel', qty: '1 pincée' }]);
  assert.deepStrictEqual(sandbox.recipes[0].steps, ['Étape 1']);
  assert.strictEqual(sandbox.orphanRecipes().length, 0, "n'est plus orpheline une fois rangée");
});

test('assignRecipeToBook() renvoie false sans rien modifier si le livre cible n\'existe pas (jamais de bookId invalide introduit)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([orphanRecipe({ id: 'r1', bookId: null })]);
  const ok = sandbox.assignRecipeToBook('r1', 'inexistant');
  assert.strictEqual(ok, false);
  assert.strictEqual(sandbox.recipes[0].bookId, null, 'bookId ne doit pas avoir été modifié');
});

test('Régression — recipeBookCard() (détail d\'un livre normal) ne casse pas avec plusieurs recettes (pas d\'index injecté comme showMoveButton via .map(recipeRow))', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([{ id: 'b1', name: 'Desserts' }]);
  sandbox.setRecipes([
    orphanRecipe({ id: 'r1', bookId: 'b1' }),
    orphanRecipe({ id: 'r2', bookId: 'b1' }),
  ]);
  sandbox.openRecipeBookId = 'b1';
  sandbox.openRecipeId = 'r2'; // ouvre le détail de la 2e recette (index 1 dans .map)
  const html = sandbox.recipeBookCard(sandbox.recipeBooks[0]);
  // Si .map(recipeRow) avait injecté l'index comme 2e argument, le bouton
  // "Ranger dans un livre" apparaîtrait pour la recette d'index 1 alors qu'elle
  // est déjà dans un livre — ne doit jamais apparaître ici.
  assert.ok(!html.includes('data-recipe-movebook'), 'jamais de bouton "Ranger dans un livre" dans le détail normal d\'un livre');
});

test('Régression — normalizeRecipeBooks() migre toujours correctement le cas historique (recipeBooks vide + recettes orphelines)', () => {
  const sandbox = loadKaloSandbox();
  sandbox.setBooks([]);
  sandbox.setRecipes([orphanRecipe({ id: 'r1', bookId: undefined })]);
  sandbox.normalizeRecipeBooks();
  assert.strictEqual(sandbox.recipeBooks.length, 1, 'un livre par défaut doit être créé');
  assert.strictEqual(sandbox.recipes[0].bookId, sandbox.recipeBooks[0].id);
  assert.strictEqual(sandbox.orphanRecipes().length, 0);
});

test("Régression — ui.js relie bien [data-recipe-movebook] à openAssignRecipeBookModal()", () => {
  const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  assert.ok(/data-recipe-movebook/.test(uiSrc), 'le handler doit exister dans js/ui.js');
  const idx = uiSrc.indexOf('[data-recipe-movebook]');
  const snippet = uiSrc.slice(idx, idx + 300);
  assert.ok(/openAssignRecipeBookModal/.test(snippet), 'le clic doit appeler openAssignRecipeBookModal()');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
