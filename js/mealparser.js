/* ===================== IA — DÉCRIRE UN REPAS ===================== */
/* Appelle la fonction serverless /api/parse-meal (Vercel), qui utilise
   l'API Mammouth AI côté serveur avec CARNET_API_KEY. Aucune clé n'est
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

// `prefillText` (brique cohérence Reformuler) : texte à remettre dans la
// textarea à l'ouverture — utilisé uniquement par le bouton "Reformuler" de
// openAIResultModal(), qui repasse la description ORIGINALE (celle réellement
// envoyée à l'analyse précédente), jamais le nom/les ingrédients/les macros
// du résultat IA. Undefined au premier appel (FAB, bouton "Décrire un repas")
// -> textarea vide comme avant, aucun changement de ce cas.
function openAIDescribeModal(prefillText) {
  openModal(`
    <h3>Décrire un repas (IA)</h3>
    <div class="hint">Décris ton repas en langage naturel, l'IA estime les macros. Exemple : "poulet 150g avec riz et brocolis".</div>
    <textarea id="aiMealText" placeholder="ex. burger + frites au restaurant">${escapeHtml(prefillText || '')}</textarea>
    <div id="aiStatus" class="hint" style="display:none;"></div>
    <button class="btn" id="aiSubmitBtn" type="button">Analyser</button>
  `);
  // AI-P2-1 (audit Phase 2.3.1) : la requête IA doit être annulée si l'utilisateur ferme
  // cette modale pendant qu'elle est en vol, sinon une réponse tardive peut manipuler des
  // éléments DOM déjà retirés (#aiStatus/#aiSubmitBtn). `controller` est local à cette
  // ouverture de modale (jamais une variable globale) — mécanisme local au flux IA plutôt
  // qu'une modification de closeModal() global (js/ui.js), qui reste inchangé et partagé
  // par toutes les autres modales de l'app.
  let controller = null;
  const cancelInFlightRequest = () => { if (controller) { controller.abort(); controller = null; } };
  document.getElementById('modalClose').addEventListener('click', cancelInFlightRequest);
  document.getElementById('modalBg').addEventListener('click', e => { if (e.target.id === 'modalBg') cancelInFlightRequest(); });
  document.getElementById('aiSubmitBtn').onclick = async () => {
    const text = document.getElementById('aiMealText').value.trim();
    if (!text) { toast("Décris un repas d'abord"); return; }
    const statusEl = document.getElementById('aiStatus');
    const btn = document.getElementById('aiSubmitBtn');
    statusEl.style.display = 'block';
    statusEl.textContent = '🤖 Analyse en cours…';
    btn.disabled = true;
    controller = new AbortController();
    try {
      const res = await fetch(aiMealApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDescription: text }),
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.details || json.error || 'Erreur inconnue');
      openAIResultModal(json.data, text);
    } catch (e) {
      // Annulation volontaire (modale fermée pendant la requête) : jamais de toast/message
      // d'erreur (l'utilisateur a déjà quitté ce flux), et surtout aucune manipulation de
      // statusEl/btn — la modale (et donc ces éléments) peut déjà avoir été retirée du DOM.
      if (e.name === 'AbortError') return;
      statusEl.textContent = '❌ ' + (e.message || "Erreur lors de l'analyse");
      btn.disabled = false;
    }
  };
}

// Provenance de la donnée renvoyée par /api/parse-meal (voir api/parse-meal.js) :
// 'catalog' = reconnu à 100% contre des valeurs fixes vérifiées (zéro IA), 'mixed'
// = une partie catalogue + une partie estimée, 'ai' = entièrement estimé. Un repas
// résolu par le catalogue n'est PAS une estimation — le dire quand même serait
// aussi malhonnête que l'inverse (afficher une estimation comme une certitude).
function confidenceNotice(confidence) {
  if (confidence === 'catalog') return '✓ Valeurs officielles (produit reconnu), pas une estimation.';
  if (confidence === 'mixed') return '⚠️ Repas en partie reconnu (valeurs officielles) et en partie estimé par IA.';
  return '⚠️ Estimation IA, vérifie si besoin avant de confirmer.';
}

// AI-P2-3 (audit Phase 2.3.1) : bornes hautes de simple vraisemblance, jamais un rejet dur
// (contrairement à négatif/non-numérique/infini juste au-dessus, inchangé) — un repas
// exceptionnellement calorique existe réellement (ex. un très gros repas de fête), donc
// Kalo ne doit jamais bloquer ni modifier silencieusement une valeur à la place de
// l'utilisateur. Seuils volontairement larges (très au-dessus d'un repas plausible même
// généreux) pour ne signaler que les cas manifestement aberrants (ex. une réponse IA à
// 999999 kcal) — voir exceedsReasonableMax(), utilisée uniquement pour déclencher une
// seconde confirmation explicite ("Confirmer quand même"), jamais pour changer la valeur.
const MEAL_AI_REASONABLE_MAX = { kcal: 5000, protein: 300, carbs: 500, fat: 300 };
function exceedsReasonableMax(kcal, protein, carbs, fat) {
  return kcal > MEAL_AI_REASONABLE_MAX.kcal || protein > MEAL_AI_REASONABLE_MAX.protein ||
    carbs > MEAL_AI_REASONABLE_MAX.carbs || fat > MEAL_AI_REASONABLE_MAX.fat;
}

function openAIResultModal(data, sourceText) {
  const kcal = Math.round(parseFloat(data.calories) || 0);
  // Valeurs d'affichage arrondies (même rendu que l'ancien `.toFixed(0)` statique) :
  // ce sont elles qui deviennent la valeur initiale des champs éditables ci-dessous,
  // pas les floats bruts de `data` — ce que l'utilisateur voyait avant doit rester
  // ce qu'il voit maintenant dans le champ, avant toute modification de sa part.
  const proteinDisplay = Math.round(parseFloat(data.protein) || 0);
  const carbsDisplay = Math.round(parseFloat(data.carbs) || 0);
  const fatDisplay = Math.round(parseFloat(data.fat) || 0);
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
  openModal(`
    <h3>${escapeHtml(data.name || 'Repas analysé')}</h3>
    ${ingredients.length ? `<div class="hint">${ingredients.map(escapeHtml).join(' · ')}</div>` : ''}
    <div class="qty-preview">
      <div class="item"><input id="aiKcalInput" type="number" inputmode="numeric" value="${kcal}"><div class="l">kcal</div></div>
      <div class="item"><input id="aiProteinInput" type="number" inputmode="numeric" value="${proteinDisplay}"><div class="l">prot g</div></div>
      <div class="item"><input id="aiCarbsInput" type="number" inputmode="numeric" value="${carbsDisplay}"><div class="l">gluc g</div></div>
      <div class="item"><input id="aiFatInput" type="number" inputmode="numeric" value="${fatDisplay}"><div class="l">lip g</div></div>
    </div>
    <div class="hint" style="margin-top:10px;">${confidenceNotice(data.confidence)}</div>
    <div class="hint" id="aiEditedNotice" style="display:none;">Valeurs modifiées manuellement.</div>
    <div class="hint" id="aiExtremeWarning" style="display:none;">⚠️ Cette valeur semble très élevée. Vérifie-la avant d'enregistrer.</div>
    <button class="btn" id="aiConfirmBtn" type="button">Ajouter à ${mealSlot}</button>
    <button class="btn ghost" id="aiRedoBtn" type="button">Reformuler</button>
  `);
  const kcalInput = document.getElementById('aiKcalInput');
  const proteinInput = document.getElementById('aiProteinInput');
  const carbsInput = document.getElementById('aiCarbsInput');
  const fatInput = document.getElementById('aiFatInput');
  // Le bandeau de confiance (confidenceNotice) décrit la proposition D'ORIGINE de
  // Kalo — ça reste vrai même après une modification manuelle, donc on ne le
  // touche pas. Mais pour le cas 'catalog' spécifiquement ("pas une estimation"),
  // laisser cette affirmation seule à l'écran juste sous des champs devenus
  // éditables pourrait laisser croire qu'une valeur modifiée à la main reste
  // "officielle" — un seul repère texte, discret, réutilisant .hint existant
  // (aucune nouvelle classe), apparaît uniquement si une valeur diffère
  // effectivement de la proposition initiale.
  const editedNotice = document.getElementById('aiEditedNotice');
  // Un seul prédicat, utilisé à la fois par le repère visuel ci-dessous ET par
  // la provenance enregistrée à la confirmation (voir aiConfirmBtn) — jamais
  // deux logiques séparées qui pourraient diverger. Comparaison de la valeur
  // ACTUELLE à la proposition d'origine, réévaluée à chaque appel : si
  // l'utilisateur modifie puis revient exactement à la valeur catalogue
  // initiale, `matchesOriginal()` redevient vrai. Choix délibéré, pas un
  // drapeau "modifié pendant la session" : `source:'catalog'` affirme un fait
  // sur le NOMBRE effectivement enregistré ("cette valeur vient d'une donnée
  // vérifiée"), pas sur l'historique de la saisie — si le nombre final est
  // identique à la valeur vérifiée, l'affirmation reste vraie. Différent de
  // `quantitySource` (brique 12A), qui répond à une question distincte
  // ("cette suggestion était-elle personnalisée ?") et reste donc 'habitual'
  // même après modification — pas le même genre d'affirmation, pas le même
  // critère, volontairement pas copié ici.
  const matchesOriginal = () => kcalInput.value == kcal && proteinInput.value == proteinDisplay &&
    carbsInput.value == carbsDisplay && fatInput.value == fatDisplay;
  const checkEdited = () => { editedNotice.style.display = matchesOriginal() ? 'none' : 'block'; };
  const extremeWarning = document.getElementById('aiExtremeWarning');
  const confirmBtn = document.getElementById('aiConfirmBtn');
  const CONFIRM_BTN_LABEL = confirmBtn.textContent;
  // AI-P2-3 : `pendingExtremeConfirm` retombe à false dès qu'une valeur change (même
  // logique de "réévaluation à chaque frappe" que matchesOriginal() ci-dessus) — un premier
  // clic sur une valeur aberrante affiche l'avertissement et attend un second clic explicite
  // ("Confirmer quand même") avant d'enregistrer quoi que ce soit ; modifier un champ après
  // coup annule ce "quand même" en attente et force une nouvelle vérification au prochain
  // clic, plutôt que de laisser un vieux consentement s'appliquer à une valeur différente.
  let pendingExtremeConfirm = false;
  const resetExtremeConfirm = () => {
    pendingExtremeConfirm = false;
    extremeWarning.style.display = 'none';
    confirmBtn.textContent = CONFIRM_BTN_LABEL;
  };
  [kcalInput, proteinInput, carbsInput, fatInput].forEach(el => el.addEventListener('input', () => { checkEdited(); resetExtremeConfirm(); }));
  // Garde anti-double-confirmation (voir js/ui.js: openQtyModal, même raison).
  let confirmed = false;
  document.getElementById('aiConfirmBtn').onclick = () => {
    if (confirmed) return;
    const kcalRaw = parseFloat(kcalInput.value);
    if (!Number.isFinite(kcalRaw) || kcalRaw <= 0) { toast('Entre un nombre de calories valide'); return; }
    // Macro vide -> 0g (même convention que openCustomFoodModal/openEditFoodModal :
    // un macro à 0 est une valeur légitime, pas une absence de saisie). Macro non
    // numérique ou négative -> invalide, jamais enregistrée silencieusement.
    const parseMacro = (input) => {
      const raw = input.value.trim();
      if (raw === '') return 0;
      const v = parseFloat(raw);
      if (!Number.isFinite(v) || v < 0) return null;
      return v;
    };
    const proteinVal = parseMacro(proteinInput);
    const carbsVal = parseMacro(carbsInput);
    const fatVal = parseMacro(fatInput);
    if (proteinVal === null || carbsVal === null || fatVal === null) { toast('Entre des valeurs de macros valides'); return; }
    // AI-P2-3 : une valeur manifestement aberrante n'est jamais rejetée ni modifiée —
    // seulement signalée, avec un second clic explicite obligatoire avant d'enregistrer.
    // Le premier clic sur une valeur aberrante s'arrête ici (aucun save, aucun toast).
    if (exceedsReasonableMax(kcalRaw, proteinVal, carbsVal, fatVal) && !pendingExtremeConfirm) {
      pendingExtremeConfirm = true;
      extremeWarning.style.display = 'block';
      confirmBtn.textContent = 'Confirmer quand même';
      return;
    }
    confirmed = true;
    // 'catalog' n'est conservé que si la valeur réellement enregistrée est
    // encore celle vérifiée par le catalogue (voir matchesOriginal ci-dessus) —
    // sinon 'ai' : pas une nouvelle catégorie de provenance, seulement le
    // même repli déjà utilisé pour 'mixed' et pour une estimation pure.
    // 'officiel' ne doit jamais s'afficher (mealProvenanceLabel) sur un
    // nombre que l'utilisateur vient de taper lui-même. 'mixed'/'ai' restent
    // inchangés dans tous les cas (déjà 'ai' avant et après, ce correctif ne
    // les concerne pas).
    const source = (data.confidence === 'catalog' && matchesOriginal()) ? 'catalog' : 'ai';
    logEntries.push({
      id: uid(), date: currentDate, type: 'meal', mealSlot,
      foodName: data.name || 'Repas (IA)', grams: null,
      kcal: Math.round(kcalRaw), protein: proteinVal, carbs: carbsVal, fat: fatVal,
      time: new Date().toTimeString().slice(0, 5),
      source
    });
    save('Ajouté ✓'); closeModal(); render();
  };
  // Repasse la description d'origine (paramètre `sourceText`, jamais `data`) —
  // voir le commentaire sur `prefillText` dans openAIDescribeModal() : incohérence
  // relevée à l'audit, le chemin d'erreur réseau préservait déjà le texte tapé
  // (seul `statusEl` était modifié), "Reformuler" doit se comporter pareil.
  document.getElementById('aiRedoBtn').onclick = () => openAIDescribeModal(sourceText);
}
