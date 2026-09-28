// PHASE 4 V2 — Extension du harnais V1 (tests/phase4-simulation/harness.js) :
// helpers génériques pour simulation générative multi-jours (édition arbitraire,
// flux IA complet, flux scanner réutilisable, abandon de saisie, oracle de
// cohérence état-mémoire/localStorage, et un collecteur de résultats classés
// PASS/OBSERVATION/FRICTION/BUG/SIGNAL). N'importe/ne duplique JAMAIS la logique
// de tests/phase4-simulation/harness.js (V1) — l'étend uniquement, pour que la
// campagne V1 reste reproductible à l'identique sans dépendre de ce fichier.

const vm = require('vm');
const V1 = require('./harness.js');

// CONSTAT MÉTHODOLOGIQUE (consigné ici, jamais traité comme un bug produit) :
// un vrai navigateur remplace TOUT le contenu de #modal-root à chaque
// openModal() (js/ui.js) — les anciens éléments (et leurs listeners) sont
// détruits avec lui. Notre DOM stub mémoïse par id en PERMANENCE (même objet
// réutilisé indéfiniment, cf. tests/*.test.js et harness.js V1, dont l'API
// n'expose pas les éléments internes pour les réinitialiser depuis l'extérieur)
// : rouvrir deux fois le même type de modale sur le même id, SANS que la
// première ouverture ait été confirmée entre-temps, empile un second listener
// sur l'élément déjà existant — un clic sur le bouton de la 2e ouverture
// déclenche alors AUSSI le handler jamais nettoyé de la 1re (son `confirmed`
// local est toujours à false), créant une entrée fantôme dans LE BAC À SABLE
// uniquement (aucun risque en usage réel : le navigateur détruit l'ancien
// bouton). Implication pour cette V2 : tout scénario "abandon" ne doit jamais
// rouvrir le MÊME id de modale dans le MÊME sandbox sans passer par une
// confirmation entre les deux — voir la campagne Abandons ciblés.

const RESULTS = []; // {kind: PASS|OBSERVATION|FRICTION|BUG|SIGNAL, campaign, label, detail}
function record(kind, campaign, label, detail) {
  RESULTS.push({ kind, campaign, label, detail: detail || null });
  const tag = kind.padEnd(11, ' ');
  console.log(`[${tag}] (${campaign}) ${label}` + (detail ? ' ' + JSON.stringify(detail) : ''));
}

// ---------- Compteur de friction par parcours (section 17 de la mission) ----------
function newJourneyMeter() {
  return { actions: 0, screens: 0, corrections: 0, cancellations: 0, repetitions: 0 };
}

// ---------- Édition générique d'une entrée repas déjà journalisée ----------
// Rejoue le VRAI openEditMealEntryModal() (js/ui.js) ; `patch` ne renseigne que
// les champs que l'utilisateur simulé choisit de modifier — les autres gardent
// la valeur préremplie par le formulaire (comportement réel d'un utilisateur qui
// ne touche pas un champ).
function editMealEntry(sandbox, entry, patch = {}) {
  sandbox.run(`this.__entry = ${JSON.stringify(entry)};`);
  sandbox.run(`openEditMealEntryModal(logEntries.find(e=>e.id===${JSON.stringify(entry.id)}));`);
  const set = (id, v) => { if (v !== undefined) sandbox.__document.getElementById(id).value = String(v); };
  set('emeDate', patch.date);
  set('emeName', patch.name);
  set('emeGrams', patch.grams);
  set('emeKcal', patch.kcal);
  set('emeP', patch.protein);
  set('emeC', patch.carbs);
  set('emeF', patch.fat);
  if (patch.slot) {
    const btns = sandbox.__document.querySelectorAll ? [] : [];
    // Le seg de créneau est bindé par onclick réel sur chaque bouton mémoïsé —
    // notre DOM stub n'implémente pas querySelectorAll('#emeSlotSeg button') avec
    // un vrai résultat (toujours []), donc le créneau n'est modifiable ici que si
    // on connaît son id ; hors périmètre de cette V2 (jamais testé volontairement).
  }
  sandbox.__document.getElementById('emeSave')._dispatch('click');
}

function editWorkoutEntry(sandbox, entry, patch = {}) {
  sandbox.run(`openEditWorkoutEntryModal(logEntries.find(e=>e.id===${JSON.stringify(entry.id)}));`);
  const set = (id, v) => { if (v !== undefined) sandbox.__document.getElementById(id).value = String(v); };
  set('eweDate', patch.date);
  set('eweName', patch.name);
  set('eweDuration', patch.duration);
  set('eweKcal', patch.kcalBurned);
  sandbox.__document.getElementById('eweSave')._dispatch('click');
}

// ---------- Flux IA repas complet (réel, awaited) ----------
// `mockResponse.data` doit porter calories/protein/carbs/fat : notre DOM stub ne
// parse jamais le HTML de openModal() (mémoïsation par id uniquement, comme dans
// tous les fichiers tests/*.test.js existants), donc les valeurs `value="..."`
// du template d'openAIResultModal() ne sont jamais appliquées automatiquement à
// nos éléments stub. On reproduit ici exactement le même arrondi que le code
// réel (`Math.round(parseFloat(data.X)||0)`, js/mealparser.js) pour renseigner
// les champs comme le ferait un vrai navigateur au premier rendu — pas un
// raccourci autour de la logique métier, seulement la mécanique DOM manquante
// (même nécessité que `qtyInput.value = String(grams)` dans le harnais V1).
function roundLikeMealparser(v) { return Math.round(parseFloat(v) || 0); }
// `data` : l'objet {name, calories, protein, carbs, fat, confidence, ...} que le
// fetch() mocké du sandbox renvoie déjà comme `json().data` — le même objet,
// pas un niveau d'imbrication supplémentaire.
async function addMealAI(sandbox, description, data, { correctKcal } = {}) {
  sandbox.run(`openAIDescribeModal();`);
  sandbox.__document.getElementById('aiMealText').value = description;
  await sandbox.__document.getElementById('aiSubmitBtn').onclick();
  const kcalInput = sandbox.__document.getElementById('aiKcalInput');
  const proteinInput = sandbox.__document.getElementById('aiProteinInput');
  const carbsInput = sandbox.__document.getElementById('aiCarbsInput');
  const fatInput = sandbox.__document.getElementById('aiFatInput');
  if (data) {
    kcalInput.value = String(roundLikeMealparser(data.calories));
    proteinInput.value = String(roundLikeMealparser(data.protein));
    carbsInput.value = String(roundLikeMealparser(data.carbs));
    fatInput.value = String(roundLikeMealparser(data.fat));
  }
  const prefill = kcalInput.value;
  if (correctKcal != null) {
    kcalInput.value = String(correctKcal);
    kcalInput._dispatch('input');
  }
  sandbox.__document.getElementById('aiConfirmBtn').onclick();
  return { prefillKcal: prefill, corrected: correctKcal != null };
}

// Abandon volontaire du flux IA APRÈS réception de la réponse (avant confirmation) —
// distinct de l'abandon PENDANT la requête (déjà couvert en V1,
// tests/ai-abort-on-modal-close.test.js). Ferme via #modalClose sans jamais
// cliquer #aiConfirmBtn.
async function abandonMealAIAfterResult(sandbox, description, mockResponse) {
  sandbox.run(`openAIDescribeModal();`);
  sandbox.__document.getElementById('aiMealText').value = description;
  await sandbox.__document.getElementById('aiSubmitBtn').onclick();
  sandbox.__document.getElementById('modalClose')._dispatch('click');
}

// ---------- Flux scanner réutilisable (réel, awaited) ----------
// `session` regroupe le quagga stub + sandbox pour permettre plusieurs scans
// successifs en rouvrant startQuagga() à chaque fois (voir constat V1 sur le
// garde `processing`, jamais remis à false hors erreur réseau).
function makeScanSession(sandbox) {
  const quagga = { init(cfg, cb) { cb(null); }, start() {}, onDetected(fn) { quagga.__cb = fn; }, stop() {} };
  sandbox.run('this.__setQuagga = (q) => { window.Quagga = q; Quagga = q; };');
  sandbox.__setQuagga(quagga);
  return {
    async scan(code) {
      sandbox.run(`startQuagga(this.__document.getElementById('scannerStatus'));`);
      await quagga.__cb({ codeResult: { code } });
    },
  };
}
function confirmScanQty(sandbox, grams) {
  const input = sandbox.__document.getElementById('scanQtyInput');
  input.value = String(grams);
  // #scanQtyConfirm est bindé via `.onclick=` dans js/scanner.js (pas addEventListener) —
  // appel direct requis, `_dispatch('click')` (réservé aux éléments addEventListener) le
  // manquerait silencieusement.
  sandbox.__document.getElementById('scanQtyConfirm').onclick();
}

// ---------- Oracle de cohérence (section 16 de la mission) ----------
// Compare l'état mémoire (logEntries/weightEntries/customFoods) au JSON réellement
// écrit dans localStorage par save() — jamais une réimplémentation de save(),
// juste une lecture après coup des deux sources.
function oracleCheck(sandbox, campaign, label) {
  sandbox.run(`
    this.__oracle = {
      logMem: JSON.stringify(logEntries), logLS: localStorage.getItem('ct_log'),
      weightMem: JSON.stringify(weightEntries), weightLS: localStorage.getItem('ct_weight'),
      cfMem: JSON.stringify(customFoods), cfLS: localStorage.getItem('ct_customFoods'),
      logIds: logEntries.map(e=>e.id),
    };
  `);
  const o = sandbox.run('this.__oracle');
  const mismatches = [];
  if (o.logMem !== o.logLS) mismatches.push('ct_log mémoire != localStorage');
  if (o.weightMem !== o.weightLS) mismatches.push('ct_weight mémoire != localStorage');
  if (o.cfMem !== o.cfLS) mismatches.push('ct_customFoods mémoire != localStorage');
  const dupIds = o.logIds.filter((id, i) => o.logIds.indexOf(id) !== i);
  if (dupIds.length) mismatches.push('id(s) de logEntries dupliqué(s): ' + dupIds.join(','));
  if (mismatches.length) {
    record('BUG', campaign, `Oracle KO — ${label}`, { mismatches });
  } else {
    record('PASS', campaign, `Oracle OK — ${label}`);
  }
  return mismatches.length === 0;
}

module.exports = {
  ...V1,
  RESULTS, record, newJourneyMeter,
  editMealEntry, editWorkoutEntry,
  addMealAI, abandonMealAIAfterResult,
  makeScanSession, confirmScanQty,
  oracleCheck,
};
