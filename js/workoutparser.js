/* ===================== IA — COLLER UN PROGRAMME DE SPORT ===================== */
/* Appelle la fonction serverless /api/parse-workout (Vercel) : celle-ci fait
   structurer un texte de programme (collé depuis un coach, Skool, etc.) en
   blocks/exercices par l'IA Mammouth, et calcule côté serveur une durée totale
   estimée (voir commentaire dans api/parse-workout.js).

   Réutilise le même mécanisme cross-domaine que js/mealparser.js /
   js/recipeimport.js plutôt que d'en inventer un autre : VERCEL_API_BASE est
   déjà défini dans mealparser.js (chargé avant ce fichier dans index.html),
   donc la constante est disponible en global. Sur GitHub Pages (pas de
   fonction serverless), on appelle donc explicitement le domaine Vercel. */
function workoutApiUrl() {
  if (location.hostname.endsWith('.vercel.app')) return '/api/parse-workout';
  return `${VERCEL_API_BASE}/api/parse-workout`;
}

// Ce mode d'ajout ("Saisie manuelle (IA)", une entrée à part entière du sélecteur
// "Type de séance") est ADDITIF : il ne touche pas aux autres formulaires
// (wkType/wkParams/... dans core.js) ni à la structure des séances saisies à
// l'ancienne. Le résultat IA est stocké dans un logEntry type:'workout' comme
// les autres, avec en plus les champs `blocks`/`estimatedDurationMin`/
// `warnings` — workoutSummary() (core.js) sait afficher ce cas en plus des cas
// existants (tapis/vélo/sport/club/renfo/manuel).
function openWorkoutImportModal() {
  openModal(`
    <h3>Coller un programme (IA)</h3>
    <div class="hint">Colle le texte de ta séance tel que ton coach te l'a donné (blocks, EMOM/AMRAP/Tabata, tempo, repos...). L'IA structure le programme et estime une durée totale.</div>
    <textarea id="wiText" placeholder="ex.&#10;Block 1&#10;A1. Squat 4x8 tempo 2/2/X/1 repos 90s&#10;A2. Développé couché 4x8 repos 90s&#10;Block 2 EMOM 12min&#10;- 10 burpees&#10;- 15 kettlebell swings"></textarea>
    <div id="wiStatus" class="hint" style="display:none;"></div>
    <button class="btn" id="wiSubmitBtn" type="button">Analyser avec l'IA</button>
  `);
  document.getElementById('wiSubmitBtn').onclick = async () => {
    const text = document.getElementById('wiText').value.trim();
    if (!text) { toast("Colle un programme d'abord"); return; }
    const statusEl = document.getElementById('wiStatus');
    const btn = document.getElementById('wiSubmitBtn');
    statusEl.style.display = 'block';
    statusEl.textContent = '🤖 Analyse du programme…';
    btn.disabled = true;
    try {
      const res = await fetch(workoutApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programText: text })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.details || json.error || 'Erreur inconnue');
      openWorkoutResultModal(json.data);
    } catch (e) {
      statusEl.textContent = '❌ ' + (e.message || "Erreur lors de l'analyse");
      btn.disabled = false;
    }
  };
}

// Synthétise les blocks/exercices structurés par l'IA en texte plat, pour les faire
// passer par le même moteur canonique que la saisie manuelle libre (estimateManualSession,
// catalogue EXERCISES kcal/rep + kcal/min réels) plutôt que par un MET fixe grossier —
// garantit un calcul cohérent entre "saisie manuelle (IA)" et une éventuelle note tapée à
// la main décrivant les mêmes exercices.
function blocksToText(blocks) {
  return (blocks || []).flatMap(b => (b.exercises || []).map(ex => {
    const bits = [];
    if (ex.sets != null && ex.reps != null) bits.push(`${ex.sets}x${ex.reps}`);
    else if (ex.reps != null) bits.push(String(ex.reps));
    else if (ex.sets != null) bits.push(`${ex.sets} séries`);
    if (ex.restSec != null) bits.push(`repos ${ex.restSec}s`);
    return `${ex.name}${bits.length ? ' ' + bits.join(', ') : ''}`;
  })).join('\n');
}

function workoutBlockTypeLabel(type) {
  return { standard: 'Standard', emom: 'EMOM', amrap: 'AMRAP', tabata: 'Tabata', circuit: 'Circuit' }[type] || type;
}

function exerciseLineHtml(ex) {
  const bits = [];
  if (ex.sets != null) bits.push(`${ex.sets} séries`);
  if (ex.reps != null) {
    // ex.reps est parfois un nombre/plage brut ("8", "8-12") et parfois déjà
    // du texte libre incluant son unité (ex. "3 reps/minute", "15 cal", cf.
    // exemples du prompt système) : n'ajouter le mot "reps" que dans le
    // premier cas, sinon on obtient des doublons ("3 reps/minute reps").
    const repsStr = String(ex.reps);
    const isBareNumberOrRange = /^\s*\d+\s*([-–à]\s*\d+\s*)?$/i.test(repsStr);
    bits.push(isBareNumberOrRange ? `${escapeHtml(repsStr)} reps` : escapeHtml(repsStr));
  }
  if (ex.tempo != null) bits.push(`tempo ${escapeHtml(String(ex.tempo))}`);
  if (ex.restSec != null) bits.push(`repos ${ex.restSec}s`);
  return `<li><b>${escapeHtml(ex.name)}</b>${bits.length ? ' — ' + bits.join(' · ') : ''}</li>`;
}

function workoutBlockHtml(block) {
  const typeLbl = workoutBlockTypeLabel(block.type);
  const durLbl = block.durationMin ? ` · ${block.durationMin} min` : '';
  const roundsLbl = block.rounds ? ` · ${block.rounds} tour${block.rounds > 1 ? 's' : ''}` : '';
  return `<div class="list-entry" style="display:block;">
    <div class="title">${escapeHtml(block.name)} <span class="hint" style="display:inline;">(${typeLbl}${durLbl}${roundsLbl})</span></div>
    ${block.exercises.length ? `<ul class="recipe-ing">${block.exercises.map(exerciseLineHtml).join('')}</ul>` : '<div class="empty">Aucun exercice détaillé.</div>'}
  </div>`;
}

// Le résultat reste éditable avant sauvegarde (nom de séance + date), comme
// demandé : l'utilisateur relit/ajuste avant de confirmer, l'IA ne pousse
// jamais directement dans le suivi.
function openWorkoutResultModal(data) {
  const blocks = Array.isArray(data.blocks) ? data.blocks : [];
  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const totalExercises = blocks.reduce((n, b) => n + (b.exercises ? b.exercises.length : 0), 0);
  const defaultName = blocks.length ? `Séance (${blocks.length} block${blocks.length > 1 ? 's' : ''}, ${totalExercises} exercice${totalExercises > 1 ? 's' : ''})` : 'Séance (programme IA)';
  openModal(`
    <h3>Programme analysé</h3>
    <label>Nom de la séance</label>
    <input id="wiName" type="text" value="${escapeHtml(defaultName)}">
    <label>Date</label>
    <input id="wiDate" type="date" value="${currentDate}">
    <div class="qty-preview">
      <div class="item"><div class="n">${blocks.length}</div><div class="l">block${blocks.length > 1 ? 's' : ''}</div></div>
      <div class="item"><div class="n">${totalExercises}</div><div class="l">exercice${totalExercises > 1 ? 's' : ''}</div></div>
    </div>
    ${warnings.length ? `<div class="hint" style="margin-top:10px;">⚠️ ${warnings.map(escapeHtml).join(' · ')}</div>` : ''}
    <div class="hint" style="margin-top:12px;font-weight:700;color:var(--ink);">Détail</div>
    ${blocks.length ? blocks.map(workoutBlockHtml).join('') : '<div class="empty">Aucun block identifié.</div>'}
    <div class="hint" style="margin-top:12px;">⚠️ Durée estimée automatiquement à partir des séries/reps/tempo/repos — ajuste-la si besoin, elle sert directement au calcul des calories ci-dessous.</div>
    <label>Durée totale (min)</label>
    <input id="wiDuration" type="number" min="1" value="${Number(data.estimatedDurationMin) || 0}">
    <button class="btn rust" id="wiSaveBtn" type="button">Enregistrer la séance</button>
    <button class="btn ghost" id="wiRedoBtn" type="button">Recommencer</button>
    <div class="wk-estimate" id="wiEstimate">
      <div class="num" id="wiEstimateNum">—</div>
      <div class="lbl">kcal estimés — même moteur que la saisie manuelle libre (catalogue d'exercices reconnus, kcal/rep et kcal/min réels)</div>
    </div>
  `);
  // Le programme structuré (blocks/exercices) est synthétisé en texte plat puis passé
  // par estimateManualSession() — le même moteur canonique que n'importe quelle note
  // manuelle décrivant les mêmes exercices — au lieu d'un MET fixe grossier. Ça garantit
  // que les deux façons de loguer une séance de muscu (notes tapées à la main, ou
  // programme collé et structuré par l'IA) convergent vers le même calcul plutôt que
  // deux formules différentes.
  const weight = getCurrentWeight() || 70;
  const synthText = blocksToText(blocks);
  const updateWiEstimate = () => {
    const duration = Number(document.getElementById('wiDuration').value) || 0;
    const num = document.getElementById('wiEstimateNum');
    const kcal = duration > 0 ? estimateManualSession(synthText, duration, weight).kcal : 0;
    num.textContent = kcal > 0 ? Math.round(kcal) + ' kcal' : '—';
  };
  document.getElementById('wiDuration').addEventListener('input', updateWiEstimate);
  updateWiEstimate();
  document.getElementById('wiSaveBtn').onclick = () => {
    const name = document.getElementById('wiName').value.trim() || defaultName;
    const date = document.getElementById('wiDate').value || currentDate;
    const duration = Number(document.getElementById('wiDuration').value) || 0;
    if (duration <= 0) { toast('Indique la durée'); return; }
    // Poids par défaut 70kg si aucune pesée enregistrée, pour ne jamais bloquer la
    // sauvegarde faute de pesée (contrairement aux séances tapis/vélo/sport/club qui,
    // elles, l'exigent).
    const estimation = estimateManualSession(synthText, duration, weight);
    logEntries.push({
      id: uid(), date, type: 'workout', wtype: 'ia',
      time: new Date().toTimeString().slice(0, 5),
      name, blocks, estimatedDurationMin: duration, warnings,
      duration, text: synthText, estimation,
      kcalBurned: estimation.kcal,
    });
    save(); closeModal(); render(); toast('Séance enregistrée ✓');
  };
  document.getElementById('wiRedoBtn').onclick = openWorkoutImportModal;
}
