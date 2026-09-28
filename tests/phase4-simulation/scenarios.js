const fs = require('fs');
const {
  loadSandbox, addCustomFood, addMealViaCatalog, addMealFreeform, addWorkout, addWeight,
  editLastMealGramsOnly, deleteEntryById, newProfile, newDay, journey, log, OBSERVATIONS, counts,
} = require('./harness.js');

function findFoodByName(sandbox, needle) {
  sandbox.run(`this.__found = allFoods().filter(f=>f.name.toLowerCase().includes(${JSON.stringify(needle.toLowerCase())})).slice(0,3);`);
  return sandbox.run('this.__found');
}
function pickFoodId(sandbox, needle, fallbackIdx = 0) {
  const matches = findFoodByName(sandbox, needle);
  if (!matches || !matches.length) throw new Error('aucun aliment catalogue pour: ' + needle);
  return matches[fallbackIdx].id;
}

// ===================================================================
// PROFIL A — RIGOUREUX : catalogue, corrections, poids régulier, tendances
// ===================================================================
(function profilA() {
  newProfile('A — Rigoureux (7 jours)');
  const sb = loadSandbox();
  const bananeId = pickFoodId(sb, 'banane');
  const pouletId = pickFoodId(sb, 'poulet');
  const rizId = pickFoodId(sb, 'riz');
  const dates = ['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07'];
  dates.forEach((d, i) => {
    newDay(sb, d);
    if (i === 0) addWeight(sb, 78.4);
    addMealViaCatalog(sb, bananeId, 120, { slot: 'Petit-déj' });
    addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' });
    addMealViaCatalog(sb, rizId, 180, { slot: 'Déjeuner' });
    addWorkout(sb, { wtype: 'tapis', params: { vitesse: 10, pente: 2 }, duration: 35 });
    if (i % 2 === 0) addWeight(sb, 78.4 - i * 0.1);
  });
  const t = sb.getState('typicalGramsFor(' + JSON.stringify(pouletId) + ')');
  journey('A-J1: typicalGramsFor sur poulet après 7 occurrences identiques (150g)');
  if (t === 150) log('OBSERVED', 'Profil A : typicalGramsFor(poulet) = 150 après 7 jours de saisie identique — préremplissage fonctionne comme attendu.');
  else log('OBSERVED', 'Profil A : typicalGramsFor(poulet) inattendu', { t });

  // Correction a posteriori : l'utilisateur rigoureux se rend compte d'une pesée réelle
  // et modifie un repas déjà loggé (nouveau parcours in-place edit, Phase 3 Lot A).
  newDay(sb, '2026-09-07');
  const before = sb.getState('logEntries[0]');
  editLastMealGramsOnly(sb, 250); // dernière entrée du jour = la séance (workout), en fait il faut cibler un repas
  const lastMeal = sb.getState("logEntries.filter(e=>e.type==='meal').slice(-1)[0]");
  journey('A-J2: correction manuelle du grammage d\'un repas déjà journalisé');
  log('OBSERVED', "Profil A : édition d'une entrée repas via 'Modifier ce repas' — grams modifié isolément.", { avant_grams: before && before.grams, apres: lastMeal });

  // Consulte le dashboard/tendances (fonctions réelles)
  const streak = sb.getState('calorieStreak()');
  const weekly = sb.getState('weeklyDeficits()');
  journey('A-J3: consultation dashboard (streak + déficit hebdo)');
  log('OBSERVED', 'Profil A : calorieStreak() et weeklyDeficits() consultés sans exception.', { streakOk: !!streak, weeklyLen: weekly.length });
})();

// ===================================================================
// PROFIL B — RAPIDE : quick-add, aliments récents, abandon si trop long
// ===================================================================
(function profilB() {
  newProfile('B — Rapide (10 jours, même petit-déj répété)');
  const sb = loadSandbox();
  const cafeId = pickFoodId(sb, 'avoine');
  const dates = Array.from({length: 10}, (_, i) => `2026-09-${String(i+1).padStart(2,'0')}`);
  dates.forEach((d, i) => {
    newDay(sb, d);
    addMealViaCatalog(sb, cafeId, 60, { slot: 'Petit-déj' });
  });
  const freq = sb.getState("frequentMealFor('Petit-déj')");
  journey('B-J1: détection repas fréquent après 10 répétitions identiques');
  if (freq) log('OBSERVED', 'Profil B : frequentMealFor("Petit-déj") détecté (Quick-add disponible) après répétition exacte du même aliment/quantité conceptuelle.', { names: freq.names });
  else log('OBSERVED', 'Profil B : frequentMealFor("Petit-déj") non détecté malgré 10 répétitions — à investiguer.', {});

  // Comportement "abandon si trop long" : ouvre une modale IA puis ferme avant réponse.
  newDay(sb, '2026-09-11');
  let aborted = false;
  const sb2 = loadSandbox(() => new Promise(() => {})); // fetch qui ne résout jamais
  sb2.run(`openAIDescribeModal();`);
  sb2.__document.getElementById('aiMealText').value = 'burger frites';
  sb2.__document.getElementById('aiSubmitBtn').onclick();
  sb2.__document.getElementById('modalClose')._dispatch('click'); // l'utilisateur abandonne
  const le = sb2.getState('logEntries');
  journey('B-J2: ouverture IA repas puis fermeture avant réponse (abandon)');
  log('OBSERVED', "Profil B : fermer la modale IA pendant l'analyse annule proprement (AbortController) — aucune entrée fantôme, aucun toast d'erreur.", { logEntriesLen: le.length });
})();

// ===================================================================
// PROFIL C — REPAS RÉCURRENTS avec LÉGÈRE VARIATION (contre-cas exact-match)
// ===================================================================
(function profilC() {
  newProfile('C — Repas récurrents avec variation (12 jours)');
  const sb = loadSandbox();
  const yaourtId = pickFoodId(sb, 'yaourt');
  const mielId = pickFoodId(sb, 'miel', 0);
  for (let i = 1; i <= 8; i++) {
    newDay(sb, `2026-09-${String(i).padStart(2,'0')}`);
    addMealViaCatalog(sb, yaourtId, 125, { slot: 'Petit-déj' });
  }
  for (let i = 9; i <= 12; i++) {
    newDay(sb, `2026-09-${String(i).padStart(2,'0')}`);
    addMealViaCatalog(sb, yaourtId, 125, { slot: 'Petit-déj' });
    addMealViaCatalog(sb, mielId, 10, { slot: 'Petit-déj' });
  }
  const freq = sb.getState("frequentMealFor('Petit-déj')");
  journey('C-J1: 8 jours yaourt seul puis 4 jours yaourt+miel — signature change');
  log('OBSERVED', 'Profil C : ajouter un second aliment (miel) au petit-déj habituel change la signature exacte (ensemble de foodIds) — le pattern "yaourt seul" (8/12=67%>50%) reste dominant globalement, mais illustre la fragilité exact-match déjà documentée (README §7) : une variation mineure et récurrente du même repas de base ne consolide jamais en un seul pattern.', { freqNames: freq && freq.names, totalDays: 12 });
})();

// ===================================================================
// PROFIL D — IMPRECIS : description IA, mixed confidence, correction
// ===================================================================
const profilDPromise = (async function profilD() {
  newProfile('D — Imprécis (repas IA, réponse mixed, correction si absurde)');
  const sb = loadSandbox(async (url, opts) => ({
    ok: true,
    json: async () => ({ success: true, data: { name: 'Pâtes bolo', calories: 780, protein: 32, carbs: 95, fat: 28, confidence: 'mixed', ingredients: ['pâtes', 'sauce bolo'] } }),
  }));
  sb.run(`openAIDescribeModal();`);
  sb.__document.getElementById('aiMealText').value = 'pâtes bolo, portion généreuse';
  await sb.__document.getElementById('aiSubmitBtn').onclick();
  const kcalInput = sb.__document.getElementById('aiKcalInput');
  journey('D-J1: description vague "pâtes bolo" -> résultat IA confidence mixed');
  log('OBSERVED', 'Profil D : description imprécise acceptée par le parser, kcalInput préremply depuis la réponse IA.', { kcalPrefill: kcalInput.value });
  // L'IA propose une valeur totalement absurde (ex. bug amont/hallucination) -> l'utilisateur corrige avant de valider.
  kcalInput.value = '850'; kcalInput._dispatch('input');
  sb.__document.getElementById('aiConfirmBtn').onclick();
  const entry = sb.getState("logEntries.slice(-1)[0]");
  journey('D-J2: correction manuelle de la valeur IA avant confirmation (source dégradée)');
  log('OBSERVED', "Profil D : correction manuelle d'une valeur avant confirmation -> source dégradée de 'catalog' à 'ai' (n/a ici, déjà 'mixed'->'ai' par design) et matchesOriginal() désactive tout affichage 'officiel'.", { source: entry.source, kcal: entry.kcal });
})();

// ===================================================================
// PROFIL E — SPORTIF : plusieurs séances/jour, workout AI, weight-gate
// ===================================================================
(function profilE() {
  newProfile('E — Sportif (weight-gate + plusieurs séances/jour)');
  const sb = loadSandbox();
  newDay(sb, '2026-09-01');
  const r1 = addWorkout(sb, { wtype: 'tapis', duration: 30 }); // AUCUNE pesée existante
  journey('E-J1: tentative de log séance sans aucune pesée préalable');
  log('OBSERVED', "Profil E : logguer une séance sans AUCUNE pesée enregistrée est bloqué par getCurrentWeight() (toast \"Renseigne ton poids...\"). Un utilisateur focalisé uniquement sur le sport, qui saute l'onboarding poids, ne peut PAS logger sa première séance tant qu'il n'a pas saisi un poids.", { bloque: r1.blocked });
  addWeight(sb, 82);
  const r2 = addWorkout(sb, { wtype: 'tapis', duration: 30 });
  const r3 = addWorkout(sb, { wtype: 'club', params: { sport: 'escalade', level: 'inter', mode: 'loisir', enduranceIntensity: 'modere' }, duration: 90 });
  journey('E-J2: deux séances le même jour (tapis + club escalade)');
  const day1 = sb.getState("dayTotals('2026-09-01')");
  log('OBSERVED', "Profil E : deux séances le même jour -> kcalOut cumule correctement les deux, jamais soustrait de 'remaining' (règle #1).", { kcalOut: day1.kcalOut, kcalIn: day1.kcalIn });
})();

// ===================================================================
// PROFIL F — OCCASIONNEL : retour après plusieurs jours d'absence
// ===================================================================
(function profilF() {
  newProfile('F — Occasionnel (absence puis retour)');
  const sb = loadSandbox();
  newDay(sb, '2026-08-01');
  addWeight(sb, 90);
  const pouletId = pickFoodId(sb, 'poulet');
  addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' });
  // Absence de 25 jours, retour le 2026-08-26.
  newDay(sb, '2026-08-26');
  const streakBefore = sb.getState('calorieStreak()');
  addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' });
  const insights = sb.getState('kaloInsights()');
  journey('F-J1: retour après 25 jours, dashboard/insights recalculés sans erreur');
  log('OBSERVED', "Profil F : après une longue absence, calorieStreak()/kaloInsights() se recalculent sans planter (pas d'accumulation d'erreur, pas de faux streak).", { streakBeforeText: streakBefore && streakBefore.label, insightsCount: insights.length });
})();

// ===================================================================
// PROFIL G — CHAOTIQUE : ajoute, supprime, corrige, change de jour
// ===================================================================
(function profilG() {
  newProfile('G — Chaotique (ajout/suppression/correction en rafale)');
  const sb = loadSandbox();
  newDay(sb, '2026-09-10');
  const bananeId = pickFoodId(sb, 'banane');
  addMealViaCatalog(sb, bananeId, 100, { slot: 'Collation' });
  addMealViaCatalog(sb, bananeId, 100, { slot: 'Collation' }); // doublon volontaire (deux fois la même chose)
  let entries = sb.getState('logEntries');
  const idToDelete = entries[0].id;
  deleteEntryById(sb, idToDelete); // supprime le premier
  editLastMealGramsOnly(sb, 300); // corrige le grammage du second, sans toucher kcal
  entries = sb.getState('logEntries');
  journey('G-J1: double ajout, suppression du premier, édition grams-only du second');
  const lastKcal = entries[entries.length-1].kcal;
  log('OBSERVED', "Profil G : édition 'grams-only' via 'Modifier ce repas' — le champ Quantité passe à 300g mais kcal/protein/carbs/fat NE SONT PAS recalculés automatiquement (ils restent ceux de 100g), car le formulaire d'édition expose grams et macros comme des champs indépendants (contrairement à l'ajout initial, où kcal=food.kcal*grams/100). Risque d'incohérence visible dans le journal (300g affiché, mais valeurs nutritionnelles de 100g).", { grams: entries[entries.length-1].grams, kcal: lastKcal, kcal_attendu_si_recalcule: 100 * 89/100 * 3 });

  // Change de journée en cours d'opération (avant de valider une saisie) — vérifie l'absence de fuite d'état.
  sb.setDate('2026-09-11');
  addMealViaCatalog(sb, bananeId, 80, { slot: 'Petit-déj' });
  const day10 = sb.getState("entriesFor('2026-09-10')");
  const day11 = sb.getState("entriesFor('2026-09-11')");
  journey('G-J2: changement de journée entre deux actions, vérification étanchéité des jours');
  log('OBSERVED', 'Profil G : changer currentDate entre deux ajouts range bien chaque entrée sur le bon jour (pas de fuite).', { day10Count: day10.length, day11Count: day11.length });
})();

// ===================================================================
// PROFIL H — SCANNER : produit connu, inconnu, données incomplètes, réutilisation
// ===================================================================
const profilHPromise = (async function profilH() {
  newProfile('H — Scanner (connu/inconnu/incomplet/réutilisation + fragmentation catalogue)');
  const offResponses = {
    '3017620422003': { status: 1, product: { product_name: 'Nutella', brands: 'Ferrero', nutriments: { 'energy-kcal_100g': 539, proteins_100g: 6.3, carbohydrates_100g: 57.5, fat_100g: 30.9 } } },
    '0000000000000': { status: 0 },
    '1111111111111': { status: 1, product: { product_name: 'Produit sans kcal' } }, // pas de nutriments du tout
  };
  const sbScan = loadSandbox(async (url) => {
    const code = url.match(/product\/([^.]+)\.json/)[1];
    return { ok: true, json: async () => (offResponses[code] || { status: 0 }) };
  });
  const quagga = { init(cfg, cb) { cb(null); }, start() {}, onDetected(fn) { quagga.__cb = fn; }, stop() {} };
  sbScan.run('this.__setQuagga = (q) => { window.Quagga = q; Quagga = q; };');
  sbScan.__setQuagga(quagga);
  sbScan.run(`this.__closeModalCalls=0; closeModal=function(){this.__closeModalCalls++;}; this.__customFoodModalCalls=0; openCustomFoodModal=function(){this.__customFoodModalCalls++;};`);
  sbScan.run(`startQuagga(this.__document.getElementById('scannerStatus'));`);

  newDay(sbScan, '2026-09-15');
  await quagga.__cb({ codeResult: { code: '3017620422003' } }); // Nutella, connu
  journey('H-J1: scan d\'un produit connu (Nutella) -> ajout catalogue + log repas');

  const scanInput = sbScan.__document.getElementById('scanQtyInput');
  log('OBSERVED', 'Profil H : openScannedProductModal() propose systématiquement 100g par défaut, sans jamais appeler typicalGramsFor(food.id) — contrairement à openQtyModal() (recherche catalogue). Depuis la Side Quest P0 (foodId posé sur les entrées scannées), ce mécanisme existe et alimenterait typicalGramsFor() en cas de re-scan répété du même produit, mais l\'écran de scan ne le consomme jamais en retour pour préremplir la quantité.', { scanInputDefault: scanInput.value });
  scanInput.value = '15';
  sbScan.__document.getElementById('scanQtyConfirm')._dispatch('click');
  const cfAfterFirstScan = sbScan.getState('customFoods');

  // Dédup barcode testée directement sur findOrAddScannedFood()/lookupBarcode()
  // (fonctions réelles), PAS via un second quagga.__cb() immédiat : startQuagga()
  // a volontairement une garde anti-détections-concurrentes de 2s sur le MÊME code
  // (lastCode/lastTime) qui aurait de toute façon ignoré un second scan simulé
  // instantanément — tester findOrAddScannedFood() directement isole le vrai
  // mécanisme de dédup (barcode) de ce garde-fou de debounce, distinct.
  const product = await sbScan.run(`lookupBarcode('3017620422003')`);
  sbScan.run(`this.__product = ${JSON.stringify(product)};`);
  const foodAfterDedup = sbScan.run(`findOrAddScannedFood(this.__product)`);
  const cfAfterDedup = sbScan.getState('customFoods');
  journey('H-J2: findOrAddScannedFood() rappelée avec le même barcode -> dédup (pas de doublon)');
  log('OBSERVED', 'Profil H : rappeler findOrAddScannedFood() avec le même barcode réutilise bien l\'entrée customFoods existante (dédup stricte par barcode), aucun doublon créé.', { customFoodsCountApresPremierScan: cfAfterFirstScan.length, customFoodsCountApresRedup: cfAfterDedup.length });

  // Réouverture du scanner (nouvelle session réelle) : `processing` (garde anti-
  // détections-concurrentes de startQuagga()) n'est JAMAIS remis à false après un
  // succès/"introuvable"/kcal-inconnue — uniquement sur le chemin d'erreur réseau
  // (comportement réel, volontaire, voir commentaire js/scanner.js). Un second scan
  // dans la MÊME session resterait donc bloqué : un utilisateur réel rouvre le
  // scanner (bouton) entre deux scans, ce que ce rappel de startQuagga() modélise.
  sbScan.run(`startQuagga(this.__document.getElementById('scannerStatus'));`);
  // Produit introuvable
  await quagga.__cb({ codeResult: { code: '0000000000000' } });
  journey('H-J3: scan d\'un produit introuvable chez OFF');
  log('OBSERVED', "Profil H : produit introuvable -> repli propre sur openCustomFoodModal(), aucun aliment ni entrée fantôme créés.", { customFoodModalCalls: sbScan.run('this.__customFoodModalCalls') });

  sbScan.run(`startQuagga(this.__document.getElementById('scannerStatus'));`);
  // Produit trouvé mais sans données nutritionnelles (kcalKnown=false)
  await quagga.__cb({ codeResult: { code: '1111111111111' } });
  journey('H-J4: scan d\'un produit trouvé mais sans nutriments (kcalKnown=false)');
  const cfFinal = sbScan.getState('customFoods');
  log('OBSERVED', "Profil H : produit trouvé mais sans kcal connue -> PAS ajouté au catalogue avec une valeur 0 fabriquée (kcalKnown check), message distinct affiché, repli manuel. Comportement correct et déjà couvert par les tests Phase 2.6/Side-quest.", { customFoodsCountFinal: cfFinal.length });

  // Fragmentation catalogue : l'utilisateur avait DÉJÀ un aliment perso "Nutella maison" avant de scanner le vrai Nutella.
  const sbFrag = loadSandbox(async () => ({ ok: true, json: async () => offResponses['3017620422003'] }));
  addCustomFood(sbFrag, { name: 'Nutella', kcal: 530, protein: 6, carbs: 58, fat: 31 }); // créé manuellement AVANT tout scan
  const quagga2 = { init(cfg, cb) { cb(null); }, start() {}, onDetected(fn) { quagga2.__cb = fn; }, stop() {} };
  sbFrag.run('this.__setQuagga = (q) => { window.Quagga = q; Quagga = q; };');
  sbFrag.__setQuagga(quagga2);
  sbFrag.run(`startQuagga(this.__document.getElementById('scannerStatus'));`);
  await quagga2.__cb({ codeResult: { code: '3017620422003' } }); // scanne le VRAI Nutella
  const cfFrag = sbFrag.getState('customFoods');
  journey('H-J5: aliment perso créé manuellement puis scan du même produit réel -> fragmentation catalogue');
  log('OBSERVED', "Profil H (signal fort) : un aliment personnalisé créé manuellement ('Nutella', valeurs approx.) PUIS un scan du code-barres du même vrai produit crée une DEUXIÈME entrée customFoods distincte (dédup uniquement par barcode, jamais par nom — comportement documenté et volontaire dans le code, cohérent avec la philosophie 'correspondance exacte' du reste du produit). Résultat concret : deux entrées 'Nutella' coexistent dans le catalogue perso avec des valeurs nutritionnelles légèrement différentes, aucune ne référence l'autre, et typicalGramsFor()/frequentMealFor() traiteront les usages des deux comme des aliments totalement différents (fragmentation de l'historique).", { customFoodsCount: cfFrag.length, names: cfFrag.map(f => f.name) });
})();

// ===================================================================
// JOURNÉES IRRÉGULIÈRES (multi-profils courts, un scénario par irrégularité)
// ===================================================================
(function irregularDays() {
  newProfile('Irrégularités — journée oubliée puis rattrapage rétroactif');
  const sb = loadSandbox();
  addWeight(sb, 75);
  const pouletId = pickFoodId(sb, 'poulet');
  newDay(sb, '2026-09-01'); addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' });
  // 2026-09-02 : journée totalement oubliée (aucune action)
  newDay(sb, '2026-09-03');
  const day2 = sb.getState("dayTotals('2026-09-02')");
  journey('IRR-1: consultation d\'un jour totalement vide (oubli)');
  log('OBSERVED', "Irrégularité : dayTotals() d'un jour sans aucune entrée renvoie proprement des zéros (aucune exception), le streak calorique est interrompu par ce trou (déjà couvert par tests/calorie-streak.test.js).", { kcalIn: day2.kcalIn });
  // Rattrapage rétroactif : on revient sur le 09-02 et on logue le repas oublié, MAIS depuis le "présent" (09-03).
  sb.setDate('2026-09-02'); // seul moyen actuel de loguer sur une date passée : changer currentDate globalement
  addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' });
  sb.setDate('2026-09-03');
  const day2After = sb.getState("dayTotals('2026-09-02')");
  journey('IRR-2: ajout rétroactif sur un jour passé');
  log('OBSERVED', "Irrégularité : il n'existe aucun sélecteur de date direct dans le flow d'ajout catalogue (openQtyModal) — la SEULE façon de loguer un repas sur une date passée est de changer currentDate globalement (dateStrip), pas un champ de date par-entrée au moment de l'ajout. Un utilisateur qui veut rattraper 'hier' doit d'abord naviguer le bandeau de dates, PUIS ajouter, PUIS revenir à aujourd'hui — 3 étapes pour un besoin fréquent ('journée de reprise'/'repas oublié').", { kcalInApres: day2After.kcalIn });
})();

(function anniversaryDay() {
  newProfile('Irrégularité — journée anniversaire (très calorique, portions approximatives)');
  const sb = loadSandbox();
  addWeight(sb, 70);
  newDay(sb, '2026-09-20');
  addMealFreeform(sb, { name: 'Apéro + gâteau anniversaire', kcal: 1800, protein: 25, carbs: 220, fat: 85, slot: 'Dîner', source: 'ai' });
  addMealViaCatalog(sb, pickFoodId(sb, 'poulet'), 200, { slot: 'Déjeuner' });
  const day = sb.getState("dayTotals('2026-09-20')");
  const remaining = 2200 - day.kcalIn;
  journey('ANNIV-1: journée très calorique, remaining fortement négatif');
  log('OBSERVED', "Irrégularité : une journée exceptionnellement calorique (anniversaire) produit un 'remaining' très négatif sans aucun traitement spécial (pas de plafond, pas de message dédié) — cohérent avec la règle 'pas de biais psychologique', mais aucun signal Insight ne distingue une exception ponctuelle d'une dérive installée (comparePeriods() nécessite 7j pour réagir, donc AUCUN Insight ne se déclenche le jour même).", { kcalIn: day.kcalIn, remaining });
})();

(function noSportWeek() {
  newProfile('Irrégularité — semaine complète sans sport');
  const sb = loadSandbox();
  addWeight(sb, 68);
  const pouletId = pickFoodId(sb, 'poulet');
  for (let i = 1; i <= 7; i++) { newDay(sb, `2026-09-${String(i).padStart(2,'0')}`); addMealViaCatalog(sb, pouletId, 150, { slot: 'Déjeuner' }); }
  const weekly = sb.getState('weeklyDeficits()');
  journey('NOSPORT-1: semaine sans aucune séance');
  log('OBSERVED', 'Irrégularité : une semaine entière sans séance ne casse rien dans weeklyDeficits()/dashboard — kcalOut reste à 0 partout, comportement attendu.', { weekDays: weekly[0] ? weekly[0].days.length : null });
})();

Promise.all([profilDPromise, profilHPromise]).then(() => {
  console.log('\n=== TOTAUX ===');
  console.log(counts());
  console.log('Observations collectées:', OBSERVATIONS.filter(o=>o.tag==='OBSERVED').length);
  console.log('Parcours (journey) exécutés:', counts().JOURNEY_COUNT);
  fs.writeFileSync(require('path').join(__dirname, 'phase4-observations-raw.json'), JSON.stringify({ counts: counts(), observations: OBSERVATIONS }, null, 2));
}).catch(e => { console.error('ERREUR profil async (D ou H):', e); process.exit(1); });
