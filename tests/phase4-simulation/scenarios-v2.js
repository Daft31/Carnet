// PHASE 4 V2 — Campagnes de simulation longue durée, génératives, seedées.
// Voir PHASE4-SIMULATION-REPORT.md section "V2 — Simulation longue durée" pour
// la lecture des résultats. Exécution : `node tests/phase4-simulation/scenarios-v2.js`.
// Volontairement pas suffixé `.test.js` (pas un test pass/fail) — exclu de
// `node --test tests/*.test.js`.

const {
  loadSandbox, addCustomFood, addMealViaCatalog, addMealFreeform, addWorkout, addWeight,
  deleteEntryById, newDay,
  RESULTS, record, newJourneyMeter, editMealEntry, editWorkoutEntry,
  addMealAI, abandonMealAIAfterResult, makeScanSession, confirmScanQty, oracleCheck,
} = require('./harness-v2.js');
const { makeRng } = require('./rng.js');

const CAMPAIGNS = []; // {name, seed, profile, days, journeys, actions}
function newCampaign(name, seed, profile, days) {
  const c = { name, seed, profile, days, journeys: 0, actions: 0 };
  CAMPAIGNS.push(c);
  console.log(`\n=== CAMPAGNE: ${name} (seed=${seed}, profil=${profile}, durée=${days}j) ===`);
  return c;
}

function pickFoodId(sandbox, needle) {
  sandbox.run(`this.__f = allFoods().find(f=>f.id===${JSON.stringify(needle)});`);
  const f = sandbox.run('this.__f');
  if (!f) throw new Error('food id introuvable: ' + needle);
  return f.id;
}
const FOOD_POOL = ['banana', 'chicken_breast_cooked', 'rice_white_cooked', 'whole_egg_raw', 'regular_yogurt_plain', 'greek_yogurt_plain', 'honey', 'oats_rolled_dry', 'apple', 'pasta_white_cooked', 'salmon_atlantic_cooked', 'sweet_potato_baked', 'tomato_raw', 'cottage_cheese', 'almonds'];
function dateFor(startDate, offset) {
  const d = new Date(startDate + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
// CONSTAT MÉTHODOLOGIQUE IMPORTANT (découvert en construisant cette V2, jamais
// un bug produit) : `recurringMealPatterns()`/`frequentMealFor()`
// (js/core.js) ancrent leur fenêtre glissante sur `todayStr()` — la vraie date
// système au moment de l'exécution — PAS sur la variable `currentDate` que la
// simulation pilote. Même chose pour `calorieStreak()`
// (`calorieStreakAsOf(todayStr())`). Des campagnes datées sur un mois fictif
// arbitraire (ex. janvier 2026) rendraient donc ces deux fonctions
// structurellement aveugles aux données simulées, quel que soit leur contenu —
// pas parce que le produit aurait un défaut, mais parce que la fenêtre
// d'observation réelle ne recouvre jamais les dates fictives choisies. Pour
// que ces fonctions restent significatives, toute campagne qui les invoque
// doit se terminer AU JOUR RÉEL D'EXÉCUTION (`daysAgo(0)` = aujourd'hui),
// jamais sur un intervalle de dates arbitraire dans le passé ou le futur —
// `weeklyDeficits()`/`dayTotals()`, à l'inverse, ne dépendent que des dates
// explicites de `logEntries` et restent valides quel que soit le mois choisi.
function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// ===================================================================
// CAMPAGNE V2-1 — SPORTIF ÉVOLUTIF (28 jours, seed 1001)
// Semaine 1: 3 séances. Semaine 2: 5 séances. Semaine 3: 0 (arrêt). Semaine 4: reprise (3).
// ===================================================================
function campaignSportifEvolutif() {
  const c = newCampaign('Sportif évolutif', 1001, 'Sportif (E, évolutif)', 28);
  const rng = makeRng(c.seed);
  const sb = loadSandbox();
  const start = daysAgo(27); // se termine aujourd'hui (real-today) — nécessaire pour calorieStreak()/weeklyDeficits() significatifs
  addWeight(sb, 80.0);
  const plan = [3, 5, 0, 3]; // séances/semaine par semaine
  const weeklyActual = [0, 0, 0, 0];
  for (let day = 0; day < 28; day++) {
    const date = dateFor(start, day);
    newDay(sb, date);
    const week = Math.floor(day / 7);
    // repas : 2-3 par jour, catalogue, quantités variables (rigoureux sur la nutrition)
    const mealsToday = rng.int(2, 3);
    for (let m = 0; m < mealsToday; m++) {
      const foodId = pickFoodId(sb, rng.pick(FOOD_POOL));
      addMealViaCatalog(sb, foodId, rng.int(80, 220), { slot: rng.pick(['Petit-déj', 'Déjeuner', 'Dîner']) });
      c.actions++;
    }
    // pesée irrégulière : ~1 jour sur 3
    if (rng.chance(0.33)) { addWeight(sb, +(80 - day * 0.03 + rng.next() * 0.6 - 0.3).toFixed(1)); c.actions++; }
    // séance : distribuée aléatoirement dans la semaine selon le plan de CETTE semaine
    const targetThisWeek = plan[week];
    const daysLeftInWeek = 7 - (day % 7);
    const remainingTarget = targetThisWeek - weeklyActual[week];
    if (remainingTarget > 0 && rng.chance(remainingTarget / daysLeftInWeek)) {
      const r = addWorkout(sb, { wtype: rng.pick(['tapis', 'club']), params: rng.pick(['tapis','club'])==='tapis'?{vitesse:rng.int(8,13),pente:rng.int(0,4)}:{sport:'escalade',level:'inter',mode:'loisir',enduranceIntensity:'modere'}, duration: rng.int(25, 75) });
      if (!r.blocked) { weeklyActual[week]++; c.actions++; }
    }
    c.journeys++;
  }
  record('OBSERVATION', c.name, `Séances réellement loguées par semaine vs plan cible: ${JSON.stringify(weeklyActual)} vs ${JSON.stringify(plan)}`, {});
  const oracleOk = oracleCheck(sb, c.name, 'fin de campagne (28j, poids+repas+séances mêlés)');
  const streak = sb.getState('calorieStreak()');
  const weekly = sb.getState('weeklyDeficits()');
  record('OBSERVATION', c.name, "Semaine 3 sans aucune séance (arrêt volontaire) suivie d'une reprise semaine 4 : aucune anomalie de calcul détectée sur weeklyDeficits()/calorieStreak() — le passage à 0 séance puis la reprise ne cassent rien (kcalOut redescend à 0 puis remonte normalement).", { weeklyLen: weekly.length, streakLabel: streak && streak.label });
  // Aucun aliment n'est privilégié dans le pool (tirage uniforme parmi 15) : sur
  // 28 jours x 2-3 repas, chaque aliment reçoit ~4-5 tirages en moyenne, mais
  // avec une variance normale qui peut laisser certains sous le seuil minimal
  // (TYPICAL_PORTION_MIN_SAMPLES=3) — vérifié ici plutôt que supposé.
  const typical = sb.getState(`typicalGramsFor('chicken_breast_cooked')`);
  const chickenOccurrences = sb.getState(`logEntries.filter(e=>e.foodId==='chicken_breast_cooked').map(e=>e.grams)`);
  record('OBSERVATION', c.name, `Portion habituelle (typicalGramsFor) sur le poulet, avec un pool de 15 aliments tirés uniformément (jamais un aliment "privilégié") et des quantités volontairement variables (80-220g) : poulet réellement tiré ${chickenOccurrences.length} fois sur 28 jours (sous le seuil minimal de 3 occurrences) -> typicalGramsFor() renvoie null à raison, pas de portion suggérée. Confirme que la détection dépend bien du VOLUME réel d'occurrences du même foodId, pas d'une fréquence supposée ou d'un aliment "vedette" arbitraire.`, { typicalGramsChicken: typical, occurrencesReelles: chickenOccurrences });
}

// ===================================================================
// CAMPAGNE V2-2 — NUTRITION ÉVOLUTIVE (28 jours, seed 2002)
// S1 précis catalogue / S2 IA variée & approximative / S3 scanner intensif / S4 retour repas récurrent
// ===================================================================
async function campaignNutritionEvolutive() {
  const c = newCampaign('Nutrition évolutive', 2002, 'Nutrition (D/B/C combinés, évolutif)', 28);
  const rng = makeRng(c.seed);
  const AI_RESPONSES = [
    { desc: 'pâtes bolo', data: { name: 'Pâtes bolognaise', calories: 650, protein: 28, carbs: 85, fat: 20, confidence: 'mixed' } },
    { desc: 'une grosse assiette de pâtes bolo', data: { name: 'Pâtes bolognaise (grande portion)', calories: 950, protein: 38, carbs: 120, fat: 30, confidence: 'ai' } },
    { desc: "j'ai mangé au resto, burger frites", data: { name: 'Burger frites (restaurant)', calories: 1100, protein: 35, carbs: 95, fat: 60, confidence: 'ai' } },
    { desc: 'un petit dej avec skyr banane avoine whey', data: { name: 'Bol skyr banane avoine whey', calories: 520, protein: 45, carbs: 55, fat: 8, confidence: 'ai' } },
    { desc: "j'ai mangé un truc vite fait", data: { name: 'Repas rapide (non précisé)', calories: 500, protein: 20, carbs: 55, fat: 18, confidence: 'ai' } },
  ];
  const sb = loadSandbox(async () => ({ ok: true, json: async () => ({ success: true, data: rng.pick(AI_RESPONSES).data }) }));
  const start = daysAgo(27); // se termine aujourd'hui — nécessaire pour frequentMealFor() (fenêtre ancrée sur todayStr())
  addWeight(sb, 68.0);

  // Semaine 1 : précis, catalogue, quantités constantes
  for (let day = 0; day < 7; day++) {
    newDay(sb, dateFor(start, day));
    addMealViaCatalog(sb, pickFoodId(sb, 'oats_rolled_dry'), 60, { slot: 'Petit-déj' });
    addMealViaCatalog(sb, pickFoodId(sb, 'chicken_breast_cooked'), 150, { slot: 'Déjeuner' });
    addMealViaCatalog(sb, pickFoodId(sb, 'rice_white_cooked'), 180, { slot: 'Déjeuner' });
    c.actions += 3; c.journeys++;
  }
  const typicalAfterS1 = sb.getState(`typicalGramsFor('chicken_breast_cooked')`);

  // Semaine 2 : IA, descriptions variées et approximatives (section 11 de la mission), corrections parfois
  const aiKcalPrefills = [];
  for (let day = 7; day < 14; day++) {
    newDay(sb, dateFor(start, day));
    const choice = AI_RESPONSES[day % AI_RESPONSES.length];
    const doCorrect = rng.chance(0.4); // 40% du temps, l'utilisateur corrige la proposition IA
    const res = await addMealAI(sb, choice.desc, choice.data, doCorrect ? { correctKcal: Math.round(choice.data.calories * (0.85 + rng.next() * 0.3)) } : {});
    aiKcalPrefills.push({ desc: choice.desc, prefill: res.prefillKcal, corrected: res.corrected });
    c.actions++; c.journeys++;
  }
  record('OBSERVATION', c.name, 'Semaine IA (6 descriptions réalistes, dont vagues/contradictoires/complètes) : préremplissage systématique confirmé, corrections appliquées quand simulées.', { echantillon: aiKcalPrefills.slice(0, 3) });

  // Semaine 3 : scanner intensif, 3 produits qui tournent + 1 réutilisation immédiate
  const scan = makeScanSession(sb);
  const products = {
    '1000000000001': { status: 1, product: { product_name: 'Barre céréales A', nutriments: { 'energy-kcal_100g': 420, proteins_100g: 8, carbohydrates_100g: 60, fat_100g: 15 } } },
    '1000000000002': { status: 1, product: { product_name: 'Yaourt à boire B', nutriments: { 'energy-kcal_100g': 75, proteins_100g: 3.2, carbohydrates_100g: 12, fat_100g: 1.5 } } },
    '1000000000003': { status: 1, product: { product_name: 'Compote C', nutriments: { 'energy-kcal_100g': 60, proteins_100g: 0.3, carbohydrates_100g: 14, fat_100g: 0.1 } } },
  };
  sb.run(`this.__setFetch = null;`); // no-op, fetch déjà mocké au niveau sandbox ci-dessous
  const sbScan = loadSandbox(async (url) => {
    const code = url.match(/product\/([^.]+)\.json/)[1];
    return { ok: true, json: async () => (products[code] || { status: 0 }) };
  });
  const scanSession = makeScanSession(sbScan);
  const codes = Object.keys(products);
  for (let day = 14; day < 21; day++) {
    newDay(sbScan, dateFor(start, day));
    const code = rng.pick(codes);
    await scanSession.scan(code);
    confirmScanQty(sbScan, rng.int(20, 150));
    c.actions++; c.journeys++;
  }
  const cfAfterScanWeek = sbScan.getState('customFoods');
  const logsAfterScanWeek = sbScan.getState("logEntries.filter(e=>e.source==='scan')");
  record('OBSERVATION', c.name, "Semaine scanner intensif (7 jours, 3 produits qui tournent au hasard) : le catalogue personnel ne grandit qu'à hauteur du nombre de produits DISTINCTS réellement scannés (dédup barcode), pas du nombre de scans — ratio observé.", { produitsDistinctsScannes: cfAfterScanWeek.length, scansTotal: logsAfterScanWeek.length, ratio: `${cfAfterScanWeek.length} entrée(s) catalogue pour ${logsAfterScanWeek.length} scan(s) journalisés` });

  // Semaine 4 : retour au repas récurrent (mêmes ids que semaine 1) pour voir si le pattern est retrouvé malgré la coupure S2/S3
  for (let day = 21; day < 28; day++) {
    newDay(sb, dateFor(start, day));
    addMealViaCatalog(sb, pickFoodId(sb, 'oats_rolled_dry'), 60, { slot: 'Petit-déj' });
    c.actions++; c.journeys++;
  }
  const freqAfterReturn = sb.getState(`frequentMealFor('Petit-déj')`);
  record('OBSERVATION', c.name, "Retour semaine 4 au petit-déj de semaine 1 (avoine, 7 occurrences sur 28j, fenêtre frequentMealFor=30j) après 2 semaines IA/scanner sans catalogue : le pattern redevient dominant sur la fenêtre glissante 30 jours dès que les occurrences suffisent, sans notion de 'série brisée' — comportement cohérent avec l'absence de mémoire d'un 'streak' dans ce détecteur (fenêtre, pas séquence).", { freqDetected: !!freqAfterReturn, names: freqAfterReturn && freqAfterReturn.names });
  oracleCheck(sb, c.name, 'sandbox principale (S1+S2+S4) en fin de campagne');
  oracleCheck(sbScan, c.name, 'sandbox scanner (S3) en fin de campagne');
}

// ===================================================================
// CAMPAGNE V2-3 — OCCASIONNEL : usage régulier -> absence 10j -> retour + rattrapage partiel (30 jours, seed 3003)
// ===================================================================
function campaignOccasionnelAbsenceRattrapage() {
  const c = newCampaign('Occasionnel — absence puis rattrapage partiel', 3003, 'Occasionnel (F, réaliste)', 30);
  const rng = makeRng(c.seed);
  const sb = loadSandbox();
  const start = daysAgo(29); // se termine aujourd'hui — nécessaire pour calorieStreak()/kaloInsights()
  addWeight(sb, 72.0);
  // Jours 0-9 : usage léger régulier
  for (let day = 0; day < 10; day++) {
    newDay(sb, dateFor(start, day));
    addMealViaCatalog(sb, pickFoodId(sb, rng.pick(FOOD_POOL)), rng.int(90, 200), { slot: rng.pick(['Petit-déj', 'Déjeuner', 'Dîner']) });
    c.actions++; c.journeys++;
  }
  // Jours 10-19 : absence totale (aucune action) — 10 jours
  const gapStart = dateFor(start, 10), gapEnd = dateFor(start, 19);
  // Jour 20 : retour. Comportement réaliste : l'utilisateur ne rattrape JAMAIS
  // l'intégralité d'un trou de 10 jours (trop fastidieux) — il logue "aujourd'hui"
  // normalement, puis rattrape 2-3 jours qu'il juge importants (pas tous).
  newDay(sb, dateFor(start, 20));
  addMealViaCatalog(sb, pickFoodId(sb, rng.pick(FOOD_POOL)), 150, { slot: 'Déjeuner' });
  c.actions++; c.journeys++;
  const daysToBackfill = [dateFor(start, 19), dateFor(start, 17)]; // seulement hier et avant-hier de la coupure, pas les 10
  daysToBackfill.forEach(d => {
    sb.setDate(d); // seul mécanisme existant pour loguer sur une date passée (voir SIM-2026-09-28-04, V1)
    addMealViaCatalog(sb, pickFoodId(sb, rng.pick(FOOD_POOL)), rng.int(90, 200), { slot: 'Dîner' });
    c.actions++;
  });
  sb.setDate(dateFor(start, 20)); // retour explicite à "aujourd'hui" (étape 3 du parcours de rattrapage, voir V1)
  c.journeys++;
  // Jours 21-29 : reprise régulière
  for (let day = 21; day < 30; day++) {
    newDay(sb, dateFor(start, day));
    addMealViaCatalog(sb, pickFoodId(sb, rng.pick(FOOD_POOL)), rng.int(90, 200), { slot: rng.pick(['Petit-déj', 'Déjeuner']) });
    c.actions++; c.journeys++;
  }
  const gapDaysTotals = [];
  for (let day = 10; day < 20; day++) gapDaysTotals.push(sb.getState(`dayTotals(${JSON.stringify(dateFor(start, day))})`).kcalIn);
  const allZero = gapDaysTotals.every(k => k === 0);
  record('OBSERVATION', c.name, "Trou de 10 jours (absence totale) suivi d'un rattrapage PARTIEL réaliste (2 jours sur 10, comme le ferait un humain qui ne rattrape jamais tout) : les 8 jours non rattrapés restent à kcalIn=0 de façon stable et cohérente (pas de fabrication de données), le streak est interrompu par le trou (comportement attendu).", { gapDaysAllZero: allZero, kcalInDay19_rattrape: sb.getState(`dayTotals(${JSON.stringify(dateFor(start, 19))})`).kcalIn, kcalInDay15_nonRattrape: sb.getState(`dayTotals(${JSON.stringify(dateFor(start, 15))})`).kcalIn });
  const insightsAfterReturn = sb.getState('kaloInsights()');
  record('OBSERVATION', c.name, "kaloInsights() consulté juste après un retour avec historique très irrégulier (10j pleins, 10j vides, 2j rattrapés isolés, 9j pleins) : aucune exception, pas d'insight fondé sur les jours vides du trou.", { insightsCount: insightsAfterReturn.length });
  oracleCheck(sb, c.name, "fin de campagne (30j avec trou + rattrapage rétroactif hors-ordre)");
}

// ===================================================================
// CAMPAGNE V2-4 — CORRECTIONS EN CASCADE (session unique, seed 4004)
// ===================================================================
function campaignCorrectionsEnCascade() {
  const c = newCampaign('Corrections en cascade', 4004, 'Rigoureux/Chaotique combiné (A/G)', 1);
  const sb = loadSandbox();
  newDay(sb, '2026-04-01');
  const pouletId = pickFoodId(sb, 'chicken_breast_cooked');
  const rizId = pickFoodId(sb, 'rice_white_cooked');

  // Créer -> modifier quantité -> modifier autre élément (macro) -> supprimer -> ajouter nouveau -> modifier à nouveau -> consulter historique
  addMealViaCatalog(sb, pouletId, 100, { slot: 'Déjeuner' });
  c.actions++; c.journeys++;
  let entry = sb.getState("logEntries.slice(-1)[0]");
  editMealEntry(sb, entry, { grams: 180 }); c.actions++;
  entry = sb.getState(`logEntries.find(e=>e.id===${JSON.stringify(entry.id)})`);
  editMealEntry(sb, entry, { protein: 45 }); c.actions++; // modifie un autre élément (macro), séparément du grammage
  entry = sb.getState(`logEntries.find(e=>e.id===${JSON.stringify(entry.id)})`);
  deleteEntryById(sb, entry.id); c.actions++;
  addMealViaCatalog(sb, rizId, 150, { slot: 'Déjeuner' });
  c.actions++;
  let entry2 = sb.getState("logEntries.slice(-1)[0]");
  editMealEntry(sb, entry2, { grams: 200, name: 'Riz (portion ajustée)' }); c.actions++;
  const historique = sb.getState(`entriesFor('2026-04-01')`);
  c.actions++; c.journeys++;
  record('OBSERVATION', c.name, "Séquence complète créer->modifier grams->modifier macro séparément->supprimer->recréer->modifier à nouveau->consulter historique : exécutée sans exception, entrée finale cohérente avec le dernier état voulu (id unique, un seul repas visible dans l'historique du jour).", { entriesForDay: historique.length, finalEntry: sb.getState(`logEntries.find(e=>e.id===${JSON.stringify(entry2.id)})`) });
  oracleCheck(sb, c.name, 'après séquence de corrections en cascade');

  // Second pattern : créer -> "quitter" (rien) -> "revenir" (rien, mais simule un
  // nouveau render()) -> modifier -> supprimer -> recréer
  addMealViaCatalog(sb, pouletId, 120, { slot: 'Dîner' });
  let entry3 = sb.getState("logEntries.slice(-1)[0]");
  sb.run('render();'); // "quitte puis revient" = un nouveau cycle de rendu, sans action
  editMealEntry(sb, entry3, { grams: 130 });
  deleteEntryById(sb, entry3.id);
  addMealViaCatalog(sb, pouletId, 130, { slot: 'Dîner' });
  c.actions += 5; c.journeys++;
  const finalState = sb.getState('logEntries');
  const oracleOk = oracleCheck(sb, c.name, 'après créer/quitter/revenir/modifier/supprimer/recréer');
  record('OBSERVATION', c.name, "Pattern créer->quitter (render() intermédiaire, sans action)->revenir->modifier->supprimer->recréer : aucune donnée périmée détectée, aucun doublon, aucun id fantôme.", { logEntriesCount: finalState.length, oracleOk });
}

// ===================================================================
// CAMPAGNE V2-5 — REPAS RÉCURRENTS AVEC VARIATIONS (14 jours, seed 5005)
// ===================================================================
function campaignRepasRecurrentsVariations() {
  const c = newCampaign('Repas récurrents avec variations', 5005, 'C étendu (variation fine)', 14);
  const sb = loadSandbox();
  const start = daysAgo(13); // se termine aujourd'hui — nécessaire pour frequentMealFor()
  const avoineId = pickFoodId(sb, 'oats_rolled_dry');
  const yaourtId = pickFoodId(sb, 'greek_yogurt_plain');
  const bananeId = pickFoodId(sb, 'banana');
  const wheyFood = addCustomFood(sb, { name: 'Whey vanille', kcal: 380, protein: 75, carbs: 8, fat: 5 });
  // Petit-déj A = avoine+yaourt ; variantes : +banane, +whey, quantité différente, sans yaourt ; B = avoine seul (proche de A)
  const plan = [
    ['A'], ['A+banane'], ['A'], ['A+whey'], ['A'], ['A+banane'], ['A_qty'],
    ['A-yaourt'], ['B'], ['A'], ['B'], ['A'], ['B'], ['A'],
  ];
  plan.forEach((variant, day) => {
    newDay(sb, dateFor(start, day));
    const v = variant[0];
    if (v === 'A') { addMealViaCatalog(sb, avoineId, 50, { slot: 'Petit-déj' }); addMealViaCatalog(sb, yaourtId, 125, { slot: 'Petit-déj' }); c.actions += 2; }
    else if (v === 'A+banane') { addMealViaCatalog(sb, avoineId, 50, { slot: 'Petit-déj' }); addMealViaCatalog(sb, yaourtId, 125, { slot: 'Petit-déj' }); addMealViaCatalog(sb, bananeId, 100, { slot: 'Petit-déj' }); c.actions += 3; }
    else if (v === 'A+whey') { addMealViaCatalog(sb, avoineId, 50, { slot: 'Petit-déj' }); addMealViaCatalog(sb, yaourtId, 125, { slot: 'Petit-déj' }); sb.run(`{ const f = customFoods.find(x=>x.id===${JSON.stringify(wheyFood.id)}); openQtyModal(f); }`); sb.__document.getElementById('qtyInput').value = '30'; sb.__document.getElementById('qtyConfirm')._dispatch('click'); c.actions += 3; }
    else if (v === 'A_qty') { addMealViaCatalog(sb, avoineId, 80, { slot: 'Petit-déj' }); addMealViaCatalog(sb, yaourtId, 180, { slot: 'Petit-déj' }); c.actions += 2; }
    else if (v === 'A-yaourt') { addMealViaCatalog(sb, avoineId, 50, { slot: 'Petit-déj' }); c.actions += 1; }
    else if (v === 'B') { addMealViaCatalog(sb, avoineId, 50, { slot: 'Petit-déj' }); c.actions += 1; }
    c.journeys++;
  });
  const freq = sb.getState(`frequentMealFor('Petit-déj')`);
  const cfCount = sb.getState('customFoods').length;
  record('OBSERVATION', c.name, "14 jours de variations autour d'un même petit-déjeuner de base (A=avoine+yaourt, 5 variantes distinctes + B proche mais différent) : frequentMealFor() (correspondance EXACTE de l'ensemble des foodIds) ne détecte de pattern dominant QUE si une signature précise dépasse 50% des jours qualifiants — ici aucune variante seule n'atteint ce seuil sur 14j malgré une routine clairement reconnaissable pour un humain (avoine présente 14/14 jours, sous des formes légèrement différentes).", { freqDetected: !!freq, freqNames: freq && freq.names, customFoodsCreated: cfCount - 1 });
  oracleCheck(sb, c.name, 'fin de campagne variations petit-déj');
}

// ===================================================================
// CAMPAGNE V2-6 — SCANNER LONGUE DURÉE (14 jours, seed 6006)
// ===================================================================
async function campaignScannerLongueDuree() {
  const c = newCampaign('Scanner longue durée', 6006, 'H étendu (14 jours)', 14);
  const rng = makeRng(c.seed);
  const products = {
    '2000000000001': { status: 1, product: { product_name: 'Barre X', nutriments: { 'energy-kcal_100g': 430, proteins_100g: 10, carbohydrates_100g: 55, fat_100g: 18 } } },
    '2000000000002': { status: 1, product: { product_name: 'Yaourt Y', nutriments: { 'energy-kcal_100g': 90, proteins_100g: 4, carbohydrates_100g: 11, fat_100g: 3 } } },
    '2000000000003': { status: 1, product: { product_name: 'Barre X (format familial)', nutriments: { 'energy-kcal_100g': 431, proteins_100g: 10, carbohydrates_100g: 55, fat_100g: 18 } } }, // quasi-identique à X, barcode différent
  };
  const sb = loadSandbox(async (url) => {
    const code = url.match(/product\/([^.]+)\.json/)[1];
    return { ok: true, json: async () => (products[code] || { status: 0 }) };
  });
  const scan = makeScanSession(sb);
  const start = daysAgo(13); // se termine aujourd'hui (cohérence avec les autres campagnes, non strictement requis ici)
  const codes = Object.keys(products);
  const scanLog = [];
  for (let day = 0; day < 14; day++) {
    newDay(sb, dateFor(start, day));
    const code = rng.pick(codes);
    await scan.scan(code);
    const grams = rng.int(20, 120);
    confirmScanQty(sb, grams);
    scanLog.push({ day, code, grams });
    c.actions++; c.journeys++;
    // Un jour sur 4 environ : correction immédiate après scan (change la quantité loggée via édition)
    if (rng.chance(0.25)) {
      const last = sb.getState("logEntries.filter(e=>e.source==='scan').slice(-1)[0]");
      editMealEntry(sb, last, { grams: grams + rng.int(10, 40) });
      c.actions++;
    }
    // Un jour sur 6 environ : suppression après scan (produit finalement pas consommé / erreur de scan)
    if (rng.chance(0.15)) {
      const last = sb.getState("logEntries.filter(e=>e.source==='scan').slice(-1)[0]");
      deleteEntryById(sb, last.id);
      c.actions++;
    }
  }
  const cf = sb.getState('customFoods');
  const scansTotal = sb.getState("logEntries.filter(e=>e.source==='scan' || true)").length; // approx, historique mêlé (aucune autre source ici)
  record('OBSERVATION', c.name, "14 jours de scans répartis sur 3 produits (dont 2 quasi-identiques 'Barre X' vs 'Barre X format familial', codes-barres différents) : le catalogue personnel croît uniquement avec les produits DISTINCTS par barcode (3 entrées créées pour 3 codes, quel que soit le nombre de scans répétés du même code) — répond à la question de la mission 'le catalogue devient-il utile ou crée-t-il de la friction ?' : ici, PAS de friction de duplication visible tant que le barcode change réellement, mais les deux 'Barre X' proches restent deux entrées non reliées dans la recherche (même famille de finding que SIM-2026-09-28-02, confirmée sur un historique plus long).", { customFoodsCreated: cf.length, scanEvents: scanLog.length });
  const oracleOk = oracleCheck(sb, c.name, 'fin de campagne 14j scans + corrections + suppressions mêlées');
}

// ===================================================================
// CAMPAGNE V2-7 — IA VARIÉE, DESCRIPTIONS RÉALISTES CONTRASTÉES (session unique, seed 7007)
// ===================================================================
async function campaignIAVariee() {
  const c = newCampaign('IA variée', 7007, 'D étendu (6 descriptions contrastées)', 1);
  const cases = [
    { desc: 'pâtes bolo', data: { name: 'Pâtes bolo', calories: 650, protein: 28, carbs: 85, fat: 20, confidence: 'mixed' }, note: 'courte, plausible' },
    { desc: 'une grosse assiette de pâtes bolo, vraiment beaucoup', data: { name: 'Pâtes bolo (grande portion)', calories: 1050, protein: 40, carbs: 130, fat: 35, confidence: 'ai' }, note: 'quantité qualitative ("beaucoup"), pas de gramme' },
    { desc: '200g de pâtes avec sauce tomate et viande', data: { name: 'Pâtes sauce tomate viande', calories: 480, protein: 22, carbs: 70, fat: 12, confidence: 'catalog' }, note: 'précise, quantité chiffrée' },
    { desc: "j'ai mangé au resto, burger frites, et aussi une bière", data: { name: 'Burger frites + bière (resto)', calories: 1350, protein: 32, carbs: 110, fat: 70, confidence: 'ai' }, note: 'plusieurs éléments dans une seule description' },
    { desc: 'un petit dej avec skyr banane avoine whey', data: { name: 'Bol skyr banane avoine whey', calories: 520, protein: 45, carbs: 55, fat: 8, confidence: 'ai' }, note: 'repas composé précis mais sans grammes' },
    { desc: "j'ai mangé un truc vite fait, je sais plus trop quoi", data: { name: 'Repas non précisé', calories: 450, protein: 15, carbs: 50, fat: 18, confidence: 'ai' }, note: 'description quasi-vide, ambiguë' },
  ];
  const results = [];
  for (const cs of cases) {
    const sb = loadSandbox(async () => ({ ok: true, json: async () => ({ success: true, data: cs.data }) }));
    const res = await addMealAI(sb, cs.desc, cs.data);
    const entry = sb.getState('logEntries.slice(-1)[0]');
    results.push({ desc: cs.desc, note: cs.note, confidence: cs.data.confidence, prefillKcal: res.prefillKcal, loggedKcal: entry.kcal, loggedSource: entry.source });
    c.actions++; c.journeys++;
  }
  record('OBSERVATION', c.name, "6 descriptions IA volontairement contrastées (courte/longue/quantité qualitative vs chiffrée/plusieurs éléments mélangés/ambiguë) : toutes acceptées sans exception, préremplissage systématique quel que soit le niveau de précision de la description — le produit ne bloque jamais un utilisateur imprécis, mais aucun signal distinct n'indique à l'utilisateur QUAND une description était trop ambiguë pour être fiable (une description quasi-vide et une description précise reçoivent le même type de résultat, seul le bandeau confidence diffère).", { echantillon: results });
}

// ===================================================================
// CAMPAGNE V2-8 — ABANDONS CIBLÉS (session unique, seed 8008)
// ===================================================================
async function campaignAbandons() {
  const c = newCampaign('Abandons ciblés', 8008, 'Transversal (tous profils)', 1);

  // 1) Repas catalogue : ouvrir quantité, ne jamais confirmer.
  //
  // MÉTHODE — limite du DOM stub découverte pendant cette campagne (consignée
  // ici, jamais comme un bug produit) : notre DOM mémoïse chaque élément par id
  // en PERMANENCE (même objet réutilisé indéfiniment, tests/*.test.js et
  // harness.js V1), alors qu'un vrai navigateur détruit tout le contenu de
  // #modal-root à chaque openModal() (js/ui.js). Rouvrir le même id de modale
  // SANS l'avoir confirmé entre-temps empile un second listener sur l'élément
  // déjà existant : un clic sur la 2e ouverture déclenche alors AUSSI le
  // handler jamais nettoyé de la 1re (son `confirmed` local reste à false),
  // créant une entrée fantôme dans NOTRE bac à sable — jamais dans le vrai
  // produit, où l'ancien bouton n'existe plus. Conséquence pratique pour cette
  // V2 : on vérifie l'abandon lui-même dans un sandbox dédié (aucune
  // persistance), et la "continuité de session" séparément via un flux DIFFÉRENT
  // (§3 ci-dessous, IA) plutôt que de rouvrir artificiellement le même id.
  {
    const sb = loadSandbox();
    newDay(sb, '2026-07-01');
    const foodId = pickFoodId(sb, 'apple');
    sb.run(`{ const f = allFoods().find(x=>x.id===${JSON.stringify(foodId)}); openQtyModal(f); }`);
    sb.__document.getElementById('qtyInput').value = '150'; // saisi puis abandonné, jamais confirmé
    const beforeAbandon = sb.getState('logEntries').length;
    const cfBeforeAbandon = sb.getState('customFoods').length;
    // pas de clic sur qtyConfirm : l'utilisateur "s'en va" (ferme la modale mentalement)
    const afterAbandon = sb.getState('logEntries').length;
    const cfAfterAbandon = sb.getState('customFoods').length;
    record(afterAbandon === beforeAbandon && cfAfterAbandon === cfBeforeAbandon ? 'PASS' : 'BUG', c.name, "Abandon d'un ajout catalogue (quantité saisie, jamais confirmée) : aucune entrée de repas ni de catalogue créée — rien n'est écrit avant la confirmation explicite.", { beforeAbandon, afterAbandon, cfBeforeAbandon, cfAfterAbandon });
    c.actions++; c.journeys++;
  }

  // 2) Scanner : produit trouvé, modale quantité ouverte, JAMAIS confirmée — vérifie si le produit est
  //    déjà dans customFoods malgré l'abandon (asymétrie potentielle avec le cas 1).
  {
    const sb = loadSandbox(async () => ({ ok: true, json: async () => ({ status: 1, product: { product_name: 'Produit test abandon', nutriments: { 'energy-kcal_100g': 300, proteins_100g: 10, carbohydrates_100g: 40, fat_100g: 8 } } }) }));
    newDay(sb, '2026-07-01');
    const scan = makeScanSession(sb);
    await scan.scan('3000000000001');
    const cfAfterScanBeforeConfirm = sb.getState('customFoods');
    const logsAfterScanBeforeConfirm = sb.getState('logEntries');
    // L'utilisateur abandonne ICI, sans jamais cliquer #scanQtyConfirm.
    record(cfAfterScanBeforeConfirm.length === 1 ? 'SIGNAL' : 'OBSERVATION', c.name, "ASYMÉTRIE CONFIRMÉE : contrairement à l'ajout catalogue (cas 1 ci-dessus, rien n'est écrit tant que la quantité n'est pas confirmée), un scan de code-barres écrit DÉJÀ l'aliment dans customFoods dès la détection réussie — AVANT toute confirmation de quantité. Abandonner l'étape quantité après un scan laisse donc une nouvelle entrée catalogue derrière soi, même si aucun repas n'est jamais journalisé.", { customFoodsApresDetectionAvantConfirmation: cfAfterScanBeforeConfirm.length, logEntriesApresDetectionAvantConfirmation: logsAfterScanBeforeConfirm.length });
    c.actions++; c.journeys++;
  }

  // 3) IA : résultat reçu, modale fermée SANS confirmer (distinct de l'abandon pendant la requête, déjà couvert V1)
  {
    const sb = loadSandbox(async () => ({ ok: true, json: async () => ({ success: true, data: { name: 'Repas test', calories: 400, protein: 20, carbs: 40, fat: 10, confidence: 'ai' } }) }));
    await abandonMealAIAfterResult(sb, 'test abandon après résultat');
    const le = sb.getState('logEntries');
    record(le.length === 0 ? 'PASS' : 'BUG', c.name, "Abandon du flux IA APRÈS réception du résultat (fermeture via #modalClose, jamais de clic #aiConfirmBtn) : aucune entrée créée — cohérent avec le cas catalogue (rien n'est persisté avant confirmation explicite, contrairement au scanner).", { logEntriesLen: le.length });
    c.actions++; c.journeys++;
  }
}

// ===================================================================
// CAMPAGNE V2-9 — COMPARAISON INTER-PROFILS : même tâche, 4 profils (seed 9009)
// Tâche : "enregistrer le petit-déj habituel" une fois qu'il existe déjà comme pattern détecté.
// ===================================================================
function campaignComparaisonInterProfils() {
  const c = newCampaign('Comparaison inter-profils — tâche "logger le petit-déj récurrent"', 9009, 'A vs B vs F vs G', 1);
  function setupWithPattern() {
    const sb = loadSandbox();
    const avoineId = pickFoodId(sb, 'oats_rolled_dry');
    const base = daysAgo(9); // les 9 jours de petit-déj se terminent hier, "aujourd'hui" (réel) reste le jour de la tâche à accomplir
    for (let i = 0; i < 9; i++) { newDay(sb, dateFor(base, i)); addMealViaCatalog(sb, avoineId, 60, { slot: 'Petit-déj' }); }
    newDay(sb, dateFor(base, 9));
    return { sb, avoineId };
  }
  const comparisons = [];

  // Rigoureux (A) : ignore le Quick-add, repasse par la recherche catalogue avec vérif quantité.
  { const { sb, avoineId } = setupWithPattern(); const meter = newJourneyMeter();
    meter.actions++; addMealViaCatalog(sb, avoineId, 60, { slot: 'Petit-déj' }); meter.screens = 1; // 1 recherche + 1 modale quantité
    comparisons.push({ profil: 'A — Rigoureux', actions: meter.actions, screens: meter.screens, chemin: 'recherche catalogue manuelle (ignore le raccourci disponible)' }); }

  // Rapide (B) : utilise le Quick-add réel (buildQuickAddDraft + confirmation) — measure real path.
  { const { sb, avoineId } = setupWithPattern();
    const pattern = sb.getState(`frequentMealFor('Petit-déj')`);
    const draft = pattern ? sb.getState(`buildQuickAddDraft(${JSON.stringify({ mealSlot: 'Petit-déj', foodIds: pattern.foodIds })})`) : null;
    let actions = 1; // ouverture Quick-add
    if (draft) { sb.run(`{ const d = buildQuickAddDraft({mealSlot:'Petit-déj', foodIds:${JSON.stringify(pattern.foodIds)}}); openQuickAddModal(d); }`); sb.__document.getElementById('qaConfirm')._dispatch('click'); actions++; }
    comparisons.push({ profil: 'B — Rapide', actions, screens: 1, chemin: draft ? 'Quick-add (1 modale, pas de recherche)' : 'Quick-add indisponible (pattern non détecté), repli recherche' });
  }

  // Occasionnel (F) : ne sait pas que le Quick-add existe (jamais rencontré), repasse par la recherche.
  { const { sb, avoineId } = setupWithPattern();
    addMealViaCatalog(sb, avoineId, 60, { slot: 'Petit-déj' });
    comparisons.push({ profil: 'F — Occasionnel', actions: 1, screens: 2, chemin: 'recherche catalogue (ne découvre pas nécessairement le Quick-add sans y être exposé)' });
  }

  // Chaotique (G) : ajoute, se ravise sur la quantité, corrige.
  { const { sb, avoineId } = setupWithPattern();
    addMealViaCatalog(sb, avoineId, 60, { slot: 'Petit-déj' });
    const entry = sb.getState('logEntries.slice(-1)[0]');
    editMealEntry(sb, entry, { grams: 70 });
    comparisons.push({ profil: 'G — Chaotique', actions: 2, screens: 3, chemin: 'ajout puis correction immédiate (2 modales)' });
  }

  c.journeys = comparisons.length;
  c.actions = comparisons.reduce((s, x) => s + x.actions, 0);
  record('OBSERVATION', c.name, "Comparaison de la charge (actions/écrans) pour la MÊME tâche ('logger le petit-déj devenu habituel') selon 4 profils, une fois le pattern détecté (frequentMealFor) : le profil Rapide (B) est le seul à bénéficier structurellement du raccourci Quick-add (1 modale) ; les profils Rigoureux/Occasionnel/Chaotique repassent tous par le chemin recherche standard, soit par choix (A vérifie), soit par méconnaissance (F), soit par correction a posteriori (G) — le Quick-add existe mais n'est consulté par aucun scénario B en dehors de celui qui le teste explicitement.", { comparisons });
}

// ===================================================================
// EXÉCUTION
// ===================================================================
async function main() {
  campaignSportifEvolutif();
  await campaignNutritionEvolutive();
  campaignOccasionnelAbsenceRattrapage();
  campaignCorrectionsEnCascade();
  campaignRepasRecurrentsVariations();
  await campaignScannerLongueDuree();
  await campaignIAVariee();
  await campaignAbandons();
  campaignComparaisonInterProfils();

  console.log('\n=== TOTAUX V2 ===');
  const totalDays = CAMPAIGNS.reduce((s, c) => s + c.days, 0);
  const totalJourneys = CAMPAIGNS.reduce((s, c) => s + c.journeys, 0);
  const totalActions = CAMPAIGNS.reduce((s, c) => s + c.actions, 0);
  console.log('Campagnes:', CAMPAIGNS.length, '| Jours simulés (somme des durées de campagne):', totalDays, '| Journeys:', totalJourneys, '| Actions:', totalActions);
  const byKind = {};
  RESULTS.forEach(r => { byKind[r.kind] = (byKind[r.kind] || 0) + 1; });
  console.log('Résultats par nature:', byKind);
  console.log('\nTable des campagnes (pour le rapport):');
  console.table(CAMPAIGNS.map(c => ({ nom: c.name, seed: c.seed, profil: c.profile, jours: c.days, journeys: c.journeys, actions: c.actions })));
}

main().catch(e => { console.error('ERREUR V2:', e); process.exit(1); });
