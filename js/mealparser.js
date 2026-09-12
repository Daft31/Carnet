/* ===================== IA — DÉCRIRE UN REPAS ===================== */
/* Appelle la fonction serverless /api/parse-meal (Vercel), qui utilise
   l'API Anthropic côté serveur avec CARNET_API_KEY. Aucune clé n'est
   exposée côté client.

   L'app peut être ouverte depuis GitHub Pages (daft31.github.io/carnet),
   qui n'a pas de fonction serverless : on appelle donc explicitement le
   domaine Vercel. Si tu changes de domaine Vercel (ou passes sur un
   domaine perso), mets à jour VERCEL_API_BASE ci-dessous. */
const VERCEL_API_BASE = 'https://carnet-self.vercel.app';

function aiMealApiUrl() {
  // Si l'app tourne déjà sur ce même domaine Vercel, un chemin relatif suffit.
  if (location.hostname.endsWith('.vercel.app')) return '/api/parse-meal';
  return `${VERCEL_API_BASE}/api/parse-meal`;
}

function openAIDescribeModal() {
  openModal(`
    <h3>Décrire un repas (IA)</h3>
    <div class="hint">Décris ton repas en langage naturel, l'IA estime les macros. Exemple : "poulet 150g avec riz et brocolis".</div>
    <textarea id="aiMealText" placeholder="ex. burger + frites au restaurant"></textarea>
    <div id="aiStatus" class="hint" style="display:none;"></div>
    <button class="btn" id="aiSubmitBtn" type="button">Analyser</button>
  `);
  document.getElementById('aiSubmitBtn').onclick = async () => {
    const text = document.getElementById('aiMealText').value.trim();
    if (!text) { toast("Décris un repas d'abord"); return; }
    const statusEl = document.getElementById('aiStatus');
    const btn = document.getElementById('aiSubmitBtn');
    statusEl.style.display = 'block';
    statusEl.textContent = '🤖 Analyse en cours…';
    btn.disabled = true;
    try {
      const res = await fetch(aiMealApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDescription: text })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.details || 'Erreur inconnue');
      openAIResultModal(json.data);
    } catch (e) {
      statusEl.textContent = '❌ ' + (e.message || "Erreur lors de l'analyse");
      btn.disabled = false;
    }
  };
}

function openAIResultModal(data) {
  const kcal = Math.round(parseFloat(data.calories) || 0);
  const protein = parseFloat(data.protein) || 0;
  const carbs = parseFloat(data.carbs) || 0;
  const fat = parseFloat(data.fat) || 0;
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
  openModal(`
    <h3>${escapeHtml(data.name || 'Repas analysé')}</h3>
    ${ingredients.length ? `<div class="hint">${ingredients.map(escapeHtml).join(' · ')}</div>` : ''}
    <div class="qty-preview">
      <div class="item"><div class="n">${kcal}</div><div class="l">kcal</div></div>
      <div class="item"><div class="n">${protein.toFixed(0)}</div><div class="l">prot g</div></div>
      <div class="item"><div class="n">${carbs.toFixed(0)}</div><div class="l">gluc g</div></div>
      <div class="item"><div class="n">${fat.toFixed(0)}</div><div class="l">lip g</div></div>
    </div>
    <div class="hint" style="margin-top:10px;">⚠️ Estimation IA, vérifie si besoin avant de confirmer.</div>
    <button class="btn" id="aiConfirmBtn" type="button">Ajouter à ${mealSlot}</button>
    <button class="btn ghost" id="aiRedoBtn" type="button">Reformuler</button>
  `);
  document.getElementById('aiConfirmBtn').onclick = () => {
    logEntries.push({
      id: uid(), date: currentDate, type: 'meal', mealSlot,
      foodName: data.name || 'Repas (IA)', grams: null,
      kcal, protein, carbs, fat,
      time: new Date().toTimeString().slice(0, 5), source: 'ai'
    });
    save(); closeModal(); render(); toast('Ajouté ✓');
  };
  document.getElementById('aiRedoBtn').onclick = openAIDescribeModal;
}
