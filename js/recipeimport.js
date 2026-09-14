/* ===================== IMPORT DE RECETTE (TIKTOK) ===================== */
/* Appelle la fonction serverless /api/parse-recipe (Vercel) : celle-ci va
   chercher la légende de la vidéo TikTok via l'API oEmbed publique de
   TikTok, puis la fait structurer en recette par l'IA Mammouth (même
   modèle/clé que js/mealparser.js).

   Réutilise le même mécanisme cross-domaine que js/mealparser.js plutôt que
   d'en inventer un autre : VERCEL_API_BASE est déjà défini là-bas (ce
   fichier est chargé après mealparser.js dans index.html, donc la constante
   est disponible en global). Sur GitHub Pages (pas de fonction serverless),
   on appelle donc explicitement le domaine Vercel de prod. */
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
    if (!ingredients.length) { toast('Aucun ingrédient à ajouter'); return; }
    ingredients.forEach(i => {
      const iname = (i.name || '').trim();
      if (!iname) return;
      shoppingList.push({ id: uid(), name: iname, qty: (i.qty || '').trim() || null, checked: false, source: name });
    });
    save();
    toast('Ingrédients ajoutés à la liste de courses ✓');
  };
  document.getElementById('riSaveRecipeBtn').onclick = () => {
    recipes.unshift({ id: uid(), name, ingredients, steps, servings: data.servings || null, sourceUrl, savedAt: todayStr() });
    save();
    toast('Recette enregistrée ✓');
  };
  document.getElementById('riRedoBtn').onclick = openRecipeImportModal;
}
