/* ===================== IMPORT DE RECETTE (TIKTOK) + LIVRES ===================== */
/* Appelle la fonction serverless /api/parse-recipe (Vercel) : celle-ci va
   chercher la légende de la vidéo TikTok via l'API oEmbed publique de
   TikTok, puis la fait structurer en recette par l'IA Mammouth (même
   modèle/clé que js/mealparser.js).

   Réutilise le même mécanisme cross-domaine que js/mealparser.js plutôt que
   d'en inventer un autre : VERCEL_API_BASE est déjà défini là-bas (ce
   fichier est chargé après mealparser.js dans index.html, donc la constante
   est disponible en global). Sur GitHub Pages (pas de fonction serverless),
   on appelle donc explicitement le domaine Vercel de prod.

   Ce fichier héberge aussi les modales liées aux "livres de cuisine"
   (openSaveRecipeModal, openMoveBookRecipesModal) : le choix/création de livre
   au moment d'enregistrer une recette importée, et la modale de suppression
   d'un livre non-vide. La page dédiée "Recettes" (liste des livres, détail
   d'un livre/d'une recette) vit dans js/core.js (viewRecipes()) comme les
   autres pages ; les mutations pures de données (createRecipeBook,
   renameRecipeBook, deleteRecipeBookEmpty, moveBookRecipesAndDelete,
   addIngredientsToShoppingList) vivent aussi dans core.js pour rester
   réutilisables sans dépendre de ce fichier. */
function recipeApiUrl() {
  if (location.hostname.endsWith('.vercel.app')) return '/api/parse-recipe';
  return `${VERCEL_API_BASE}/api/parse-recipe`;
}

function openRecipeImportModal() {
  openModal(`
    <h3>Importer une recette (TikTok)</h3>
    <div class="hint">Colle le lien d'une vidéo TikTok publique de cuisine. L'IA lit la légende de la vidéo et essaie d'en extraire une recette structurée.</div>
    <label>Lien TikTok</label>
    <input id="riUrl" type="url" inputmode="url" placeholder="https://www.tiktok.com/@.../video/..." autofocus>
    <div id="riStatus" class="hint" style="display:none;"></div>
    <button class="btn" id="riSubmitBtn" type="button">Extraire</button>
  `);
  const submit = async () => {
    const url = document.getElementById('riUrl').value.trim();
    if (!url) { toast("Colle un lien TikTok d'abord"); return; }
    const statusEl = document.getElementById('riStatus');
    const btn = document.getElementById('riSubmitBtn');
    statusEl.style.display = 'block';
    statusEl.textContent = '🎬 Récupération de la vidéo puis analyse…';
    btn.disabled = true;
    try {
      const res = await fetch(recipeApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokUrl: url })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.details || json.error || 'Erreur inconnue');
      openRecipeResultModal(json.data, url);
    } catch (e) {
      statusEl.textContent = '❌ ' + (e.message || "Erreur lors de l'extraction");
      btn.disabled = false;
    }
  };
  document.getElementById('riSubmitBtn').onclick = submit;
  document.getElementById('riUrl').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
}

function openRecipeResultModal(data, sourceUrl) {
  const name = data.name || 'Recette importée';
  const servings = data.servings ? `${data.servings} personne${data.servings > 1 ? 's' : ''}` : null;
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
  const steps = Array.isArray(data.steps) ? data.steps : [];
  openModal(`
    <h3>${escapeHtml(name)}</h3>
    ${servings ? `<div class="hint">Pour ${escapeHtml(servings)}</div>` : ''}
    <div class="hint" style="margin-top:12px;font-weight:700;color:var(--ink);">Ingrédients</div>
    ${ingredients.length
      ? `<ul class="recipe-ing">${ingredients.map(i => `<li>${escapeHtml(i.name || '')}${i.qty ? ' — ' + escapeHtml(i.qty) : ''}</li>`).join('')}</ul>`
      : '<div class="empty">Aucun ingrédient identifié.</div>'}
    <div class="hint" style="margin-top:12px;font-weight:700;color:var(--ink);">Étapes</div>
    ${steps.length
      ? `<ol class="recipe-steps">${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
      : '<div class="empty">Étapes non précisées dans la légende de la vidéo.</div>'}
    <div class="hint" style="margin-top:12px;">⚠️ Extraction automatique depuis la légende TikTok — vérifie avant de cuisiner.</div>
    <button class="btn" id="riAddShopBtn" type="button">Ajouter les ingrédients à la liste de courses</button>
    <button class="btn ghost" id="riSaveRecipeBtn" type="button">Enregistrer la recette</button>
    <button class="btn ghost" id="riRedoBtn" type="button">Importer une autre recette</button>
  `);
  document.getElementById('riAddShopBtn').onclick = () => {
    const count = addIngredientsToShoppingList(ingredients, name);
    if (!count) { toast('Aucun ingrédient à ajouter'); return; }
    toast('Ingrédients ajoutés à la liste de courses ✓');
  };
  document.getElementById('riSaveRecipeBtn').onclick = () => {
    openSaveRecipeModal({ name, ingredients, steps, servings: data.servings || null, sourceUrl });
  };
  document.getElementById('riRedoBtn').onclick = openRecipeImportModal;
}

/* ===================== LIVRES DE RECETTES ===================== */
// Choix du livre au moment d'enregistrer une recette importée : livre existant
// (bouton par livre) ou création à la volée d'un nouveau livre. On enregistre la
// recette seulement une fois le livre choisi/créé — jamais de recette sans bookId
// à partir d'ici (les seules recettes sans bookId sont d'anciennes recettes
// pré-migration, voir normalizeRecipeBooks() dans core.js).
function openSaveRecipeModal(draft) {
  const bookButtons = recipeBooks.map(b => {
    const count = recipes.filter(r => r.bookId === b.id).length;
    return `<button class="btn ghost" data-picksavebook="${b.id}" type="button" style="margin-top:8px;">${escapeHtml(b.name)} <span class="hint" style="margin:0;display:inline;">(${count})</span></button>`;
  }).join('');
  openModal(`
    <h3>Dans quel livre ranger cette recette ?</h3>
    <div class="hint">Choisis un livre existant, ou crée-en un nouveau ci-dessous.</div>
    ${recipeBooks.length ? bookButtons : '<div class="empty">Aucun livre pour l\'instant — crée-en un ci-dessous.</div>'}
    <label>Nouveau livre</label>
    <input id="newBookNameModal" type="text" maxlength="60" placeholder="Ex. Desserts, Plats rapides…" autofocus>
    <button class="btn" id="saveRecipeCreateBookBtn" type="button">Créer ce livre et enregistrer</button>
  `);
  const saveInto = (bookId, bookName) => {
    recipes.unshift({ id: uid(), name: draft.name, ingredients: draft.ingredients, steps: draft.steps, servings: draft.servings, sourceUrl: draft.sourceUrl, bookId, savedAt: todayStr() });
    save();
    closeModal();
    toast(bookName ? `Recette enregistrée dans "${bookName}" ✓` : 'Recette enregistrée ✓');
  };
  document.querySelectorAll('[data-picksavebook]').forEach(b => b.onclick = () => {
    const book = recipeBooks.find(x => x.id === b.dataset.picksavebook);
    saveInto(b.dataset.picksavebook, book && book.name);
  });
  document.getElementById('saveRecipeCreateBookBtn').onclick = () => {
    const bookName = document.getElementById('newBookNameModal').value.trim();
    if (!bookName) { toast('Donne un nom au livre'); return; }
    const book = createRecipeBook(bookName);
    saveInto(book.id, book.name);
  };
}

// Ranger une recette déjà existante (typiquement orpheline, bucket "Recettes
// sans livre" de viewRecipes()) dans un livre — même choix livre existant/nouveau
// livre que openSaveRecipeModal() ci-dessus, mais réassigne assignRecipeToBook()
// au lieu de recréer une recette (P1-2, audit Phase 2.2) : id/ingrédients/étapes
// inchangés, seule la référence bookId change.
function openAssignRecipeBookModal(recipe) {
  const bookButtons = recipeBooks.map(b => {
    const count = recipes.filter(r => r.bookId === b.id).length;
    return `<button class="btn ghost" data-pickassignbook="${b.id}" type="button" style="margin-top:8px;">${escapeHtml(b.name)} <span class="hint" style="margin:0;display:inline;">(${count})</span></button>`;
  }).join('');
  openModal(`
    <h3>Dans quel livre ranger "${escapeHtml(recipe.name)}" ?</h3>
    <div class="hint">Choisis un livre existant, ou crée-en un nouveau ci-dessous.</div>
    ${recipeBooks.length ? bookButtons : '<div class="empty">Aucun livre pour l\'instant — crée-en un ci-dessous.</div>'}
    <label>Nouveau livre</label>
    <input id="newBookNameAssignModal" type="text" maxlength="60" placeholder="Ex. Desserts, Plats rapides…" autofocus>
    <button class="btn" id="assignRecipeCreateBookBtn" type="button">Créer ce livre et ranger la recette</button>
  `);
  const moveInto = (bookId, bookName) => {
    if (!assignRecipeToBook(recipe.id, bookId)) { toast('Impossible de ranger cette recette'); return; }
    closeModal();
    render();
    toast(bookName ? `Recette rangée dans "${bookName}" ✓` : 'Recette rangée ✓');
  };
  document.querySelectorAll('[data-pickassignbook]').forEach(b => b.onclick = () => {
    const book = recipeBooks.find(x => x.id === b.dataset.pickassignbook);
    moveInto(b.dataset.pickassignbook, book && book.name);
  });
  document.getElementById('assignRecipeCreateBookBtn').onclick = () => {
    const bookName = document.getElementById('newBookNameAssignModal').value.trim();
    if (!bookName) { toast('Donne un nom au livre'); return; }
    const book = createRecipeBook(bookName);
    moveInto(book.id, book.name);
  };
}

// Suppression d'un livre non-vide : jamais de perte silencieuse de recettes — on
// force le choix d'un livre de destination avant de vraiment supprimer. Le cas
// "livre vide" (suppression directe après confirm()) est géré dans ui.js, qui
// n'ouvre cette modale que si le livre contient au moins une recette.
function openMoveBookRecipesModal(book, bookRecipes, otherBooks) {
  const options = otherBooks.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
  openModal(`
    <h3>Supprimer "${escapeHtml(book.name)}"</h3>
    <div class="hint">Ce livre contient ${bookRecipes.length} recette${bookRecipes.length > 1 ? 's' : ''}. Choisis où les déplacer avant de supprimer le livre — rien n'est perdu.</div>
    <label>Déplacer les recettes vers</label>
    <select id="moveBookTarget">${options}</select>
    <button class="btn rust" id="moveBookConfirmBtn" type="button">Déplacer les recettes et supprimer le livre</button>
    <button class="btn ghost" id="moveBookCancelBtn" type="button">Annuler</button>
  `);
  document.getElementById('moveBookConfirmBtn').onclick = () => {
    const targetId = document.getElementById('moveBookTarget').value;
    moveBookRecipesAndDelete(book.id, targetId);
    closeModal();
    render();
    toast('Livre supprimé, recettes déplacées ✓');
  };
  document.getElementById('moveBookCancelBtn').onclick = closeModal;
}
