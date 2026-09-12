/* ===================== WORKOUT / SÉANCES =====================
 * Fusion de sport.js + exercices_met_aliases.js
 * Base d'exercices, calcul des calories brûlées, formulaires de séance
 * Dépend de core.js (chargé avant)
 * ===================================================== */

const EXERCISES = [
  {"id":"pull_up","English":"Pull-Up","Français":"Traction pronation","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction pronation"},
  {"id":"chin_up","English":"Chin-Up","Français":"Traction supination","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction supination"},
  {"id":"neutral_grip_pull_up","English":"Neutral-Grip Pull-Up","Français":"Traction prise neutre","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise neutre"},
  {"id":"wide_grip_pull_up","English":"Wide-Grip Pull-Up","Français":"Traction prise large","Suivi":"reps","kcal/rep":0.2,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise large"},
  {"id":"close_grip_pull_up","English":"Close-Grip Pull-Up","Français":"Traction prise serrée","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise serrée"},
  {"id":"mixed_grip_pull_up","English":"Mixed-Grip Pull-Up","Français":"Traction prise mixte","Suivi":"reps","kcal/rep":0.16,"kcal/min":9.8,"Équipement":"barre","name":"Traction prise mixte"},
  {"id":"archer_pull_up","English":"Archer Pull-Up","Français":"Traction archer","Suivi":"reps","kcal/rep":0.25,"kcal/min":10.4,"Équipement":"barre","name":"Traction archer"},
  {"id":"one_arm_pull_up","English":"One-Arm Pull-Up","Français":"Traction à un bras","Suivi":"reps","kcal/rep":0.33,"kcal/min":11.0,"Équipement":"barre","name":"Traction à un bras"},
  {"id":"negative_pull_up","English":"Negative Pull-Up","Français":"Traction négative","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"barre","name":"Traction négative"},
  {"id":"assisted_pull_up","English":"Assisted Pull-Up","Français":"Traction assistée","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre + élastique","name":"Traction assistée"},
  {"id":"band_assisted_pull_up","English":"Band-Assisted Pull-Up","Français":"Traction assistée élastique","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"barre + élastique","name":"Traction assistée élastique"},
  {"id":"weighted_pull_up","English":"Weighted Pull-Up","Français":"Traction lestée","Suivi":"reps","kcal/rep":0.25,"kcal/min":11.0,"Équipement":"barre + lest","name":"Traction lestée"},
  {"id":"l_sit_pull_up","English":"L-Sit Pull-Up","Français":"Traction jambes en L","Suivi":"reps","kcal/rep":0.2,"kcal/min":11.0,"Équipement":"barre","name":"Traction jambes en L"},
  {"id":"muscle_up","English":"Muscle-Up","Français":"Muscle-up","Suivi":"reps","kcal/rep":0.35,"kcal/min":14.7,"Équipement":"anneaux/barre","name":"Muscle-up"},
  {"id":"pull_up_hold","English":"Pull-Up Hold","Français":"Maintien traction","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"barre","name":"Maintien traction"},
  {"id":"dead_hang","English":"Dead Hang","Français":"Suspension passive","Suivi":"seconds","kcal/rep":null,"kcal/min":2.45,"Équipement":"barre","name":"Suspension passive"},
  {"id":"scapular_pull_up","English":"Scapular Pull-Up","Français":"Traction scapulaire","Suivi":"reps","kcal/rep":0.08,"kcal/min":4.9,"Équipement":"barre","name":"Traction scapulaire"},
  {"id":"push_up","English":"Push-Up","Français":"Pompe","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pompe"},
  {"id":"wide_grip_push_up","English":"Wide-Grip Push-Up","Français":"Pompe prise large","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pompe prise large"},
  {"id":"close_grip_push_up","English":"Close-Grip Push-Up","Français":"Pompe prise serrée","Suivi":"reps","kcal/rep":0.08,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pompe prise serrée"},
  {"id":"diamond_push_up","English":"Diamond Push-Up","Français":"Pompe diamant","Suivi":"reps","kcal/rep":0.1,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pompe diamant"},
  {"id":"archer_push_up","English":"Archer Push-Up","Français":"Pompe archer","Suivi":"reps","kcal/rep":0.12,"kcal/min":8.3,"Équipement":"poids du corps","name":"Pompe archer"},
  {"id":"pseudo_planche_push_up","English":"Pseudo-Planche Push-Up","Français":"Pseudo-planche pompe","Suivi":"reps","kcal/rep":0.15,"kcal/min":9.8,"Équipement":"poids du corps","name":"Pseudo-planche pompe"},
  {"id":"planche_lean_push_up","English":"Planche Lean Push-Up","Français":"Planche pompe inclinée","Suivi":"reps","kcal/rep":0.2,"kcal/min":11.0,"Équipement":"poids du corps","name":"Planche pompe inclinée"},
  {"id":"one_arm_push_up","English":"One-Arm Push-Up","Français":"Pompe à un bras","Suivi":"reps","kcal/rep":0.25,"kcal/min":11.0,"Équipement":"poids du corps","name":"Pompe à un bras"},
  {"id":"handstand_push_up","English":"Handstand Push-Up","Français":"Pompe sur les mains","Suivi":"reps","kcal/rep":0.3,"kcal/min":14.7,"Équipement":"poids du corps","name":"Pompe sur les mains"},
  {"id":"negative_push_up","English":"Negative Push-Up","Français":"Pompe négative","Suivi":"reps","kcal/rep":0.06,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pompe négative"},
  {"id":"incline_push_up","English":"Incline Push-Up","Français":"Pompe inclinée","Suivi":"reps","kcal/rep":0.05,"kcal/min":6.13,"Équipement":"banc/mur","name":"Pompe inclinée"},
  {"id":"decline_push_up","English":"Decline Push-Up","Français":"Pompe déclinée","Suivi":"reps","kcal/rep":0.12,"kcal/min":8.3,"Équipement":"banc","name":"Pompe déclinée"},
  {"id":"push_up_hold","English":"Push-Up Hold","Français":"Maintien pompe","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"poids du corps","name":"Maintien pompe"},
  {"id":"plyometric_push_up","English":"Plyometric Push-Up","Français":"Pompe pliométrique","Suivi":"reps","kcal/rep":0.15,"kcal/min":9.8,"Équipement":"poids du corps","name":"Pompe pliométrique"},
  {"id":"clap_push_up","English":"Clap Push-Up","Français":"Pompe claquée","Suivi":"reps","kcal/rep":0.15,"kcal/min":9.8,"Équipement":"poids du corps","name":"Pompe claquée"},
  {"id":"dip","English":"Dip","Français":"Dips","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"barres","name":"Dips"},
  {"id":"negative_dips","English":"Negative Dips","Français":"Dips négatifs","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"barres","name":"Dips négatifs"},
  {"id":"assisted_dips","English":"Assisted Dips","Français":"Dips assistés","Suivi":"reps","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"barres + élastique","name":"Dips assistés"},
  {"id":"band_assisted_dips","English":"Band-Assisted Dips","Français":"Dips assistés élastique","Suivi":"reps","kcal/rep":0.05,"kcal/min":7.35,"Équipement":"barres + élastique","name":"Dips assistés élastique"},
  {"id":"weighted_dips","English":"Weighted Dips","Français":"Dips lestés","Suivi":"reps","kcal/rep":0.12,"kcal/min":10.4,"Équipement":"barres + lest","name":"Dips lestés"},
  {"id":"l_sit_dips","English":"L-Sit Dips","Français":"Dips jambes en L","Suivi":"reps","kcal/rep":0.14,"kcal/min":10.4,"Équipement":"barres","name":"Dips jambes en L"},
  {"id":"russian_dips","English":"Russian Dips","Français":"Dips russes","Suivi":"reps","kcal/rep":0.15,"kcal/min":10.4,"Équipement":"barres","name":"Dips russes"},
  {"id":"dip_hold","English":"Dip Hold","Français":"Maintien haut de dips","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"barres","name":"Maintien haut de dips"},
  {"id":"dip_shrug","English":"Dip Shrug","Français":"Haussement scapulaire","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"Équipement":"barres","name":"Haussement scapulaire"},
  {"id":"bench_dips","English":"Bench Dips","Français":"Dips sur banc","Suivi":"reps","kcal/rep":0.04,"kcal/min":6.13,"Équipement":"banc","name":"Dips sur banc"},
  {"id":"plank","English":"Plank","Français":"Gainage frontal","Suivi":"seconds","kcal/rep":null,"kcal/min":3.92,"Équipement":"poids du corps","name":"Gainage frontal"},
  {"id":"side_plank","English":"Side Plank","Français":"Gainage latéral","Suivi":"seconds_per_side","kcal/rep":null,"kcal/min":2.45,"Équipement":"poids du corps","name":"Gainage latéral"},
  {"id":"plank_hold","English":"Plank Hold","Français":"Maintien gainage","Suivi":"seconds","kcal/rep":null,"kcal/min":3.92,"Équipement":"poids du corps","name":"Maintien gainage"},
  {"id":"weighted_plank","English":"Weighted Plank","Français":"Gainage lesté","Suivi":"seconds","kcal/rep":null,"kcal/min":5.39,"Équipement":"poids du corps + lest","name":"Gainage lesté"},
  {"id":"plank_shoulder_tap","English":"Plank Shoulder Tap","Français":"Gainage tap épaules","Suivi":"reps","kcal/rep":0.04,"kcal/min":4.9,"Équipement":"poids du corps","name":"Gainage tap épaules"},
  {"id":"plank_to_downward_dog","English":"Plank to Downward Dog","Français":"Gainage vers chien tête bas","Suivi":"reps","kcal/rep":0.06,"kcal/min":5.88,"Équipement":"poids du corps","name":"Gainage vers chien tête bas"},
  {"id":"plank_up_down","English":"Plank Up-Down","Français":"Montées/descentes gainage","Suivi":"reps","kcal/rep":0.06,"kcal/min":5.88,"Équipement":"poids du corps","name":"Montées/descentes gainage"},
  {"id":"side_plank_lift","English":"Side Plank Lift","Français":"Gainage latéral décollé","Suivi":"reps_per_side","kcal/rep":0.05,"kcal/min":4.9,"Équipement":"poids du corps","name":"Gainage latéral décollé"},
  {"id":"hollow_body_hold","English":"Hollow Body Hold","Français":"Maintien corps creux","Suivi":"seconds","kcal/rep":null,"kcal/min":3.43,"Équipement":"poids du corps","name":"Maintien corps creux"},
  {"id":"arch_hold","English":"Arch Hold","Français":"Maintien arche","Suivi":"seconds","kcal/rep":null,"kcal/min":3.43,"Équipement":"poids du corps","name":"Maintien arche"},
  {"id":"l_sit_hold","English":"L-Sit Hold","Français":"Maintien L-sit","Suivi":"seconds","kcal/rep":null,"kcal/min":7.84,"Équipement":"barres/chaises","name":"Maintien L-sit"},
  {"id":"v_sit_hold","English":"V-Sit Hold","Français":"Maintien V-sit","Suivi":"seconds","kcal/rep":null,"kcal/min":7.84,"Équipement":"poids du corps","name":"Maintien V-sit"},
  {"id":"handstand_hold","English":"Handstand Hold","Français":"Maintien équilibre mains","Suivi":"seconds","kcal/rep":null,"kcal/min":4.9,"Équipement":"poids du corps","name":"Maintien équilibre mains"},
  {"id":"wall_sit","English":"Wall Sit","Français":"Assise murale","Suivi":"seconds","kcal/rep":null,"kcal/min":3.92,"Équipement":"mur","name":"Assise murale"},
  {"id":"bulgarian_split_squat","English":"Bulgarian Split Squat","Français":"Squat bulgare","Suivi":"reps_per_leg","kcal/rep":0.08,"kcal/min":5.88,"Équipement":"banc","name":"Squat bulgare"},
  {"id":"pistol_squat","English":"Pistol Squat","Français":"Pistol squat","Suivi":"reps_per_leg","kcal/rep":0.12,"kcal/min":7.35,"Équipement":"poids du corps","name":"Pistol squat"},
  {"id":"assisted_pistol_squat","English":"Assisted Pistol Squat","Français":"Pistol squat assisté","Suivi":"reps_per_leg","kcal/rep":0.08,"kcal/min":5.88,"Équipement":"barre/élastique","name":"Pistol squat assisté"},
  {"id":"bodyweight_squat","English":"Bodyweight Squat","Français":"Squat poids du corps","Suivi":"reps","kcal/rep":0.06,"kcal/min":4.9,"Équipement":"poids du corps","name":"Squat poids du corps"},
  {"id":"jump_squat","English":"Jump Squat","Français":"Squat sauté","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"poids du corps","name":"Squat sauté"},
  {"id":"sissy_squat","English":"Sissy Squat","Français":"Sissy squat","Suivi":"reps","kcal/rep":0.08,"kcal/min":5.88,"Équipement":"poids du corps","name":"Sissy squat"},
  {"id":"shrimp_squat","English":"Shrimp Squat","Français":"Shrimp squat","Suivi":"reps_per_leg","kcal/rep":0.1,"kcal/min":7.35,"Équipement":"poids du corps","name":"Shrimp squat"},
  {"id":"lunge","English":"Lunge","Français":"Fente","Suivi":"reps_per_leg","kcal/rep":0.06,"kcal/min":4.9,"Équipement":"poids du corps","name":"Fente"},
  {"id":"jump_lunge","English":"Jump Lunge","Français":"Fente sautée","Suivi":"reps_per_leg","kcal/rep":0.1,"kcal/min":8.3,"Équipement":"poids du corps","name":"Fente sautée"},
  {"id":"curtsy_lunge","English":"Curtsy Lunge","Français":"Fente arrière croisée","Suivi":"reps_per_leg","kcal/rep":0.06,"kcal/min":4.9,"Équipement":"poids du corps","name":"Fente arrière croisée"},
  {"id":"glute_bridge","English":"Glute Bridge","Français":"Pont fessiers","Suivi":"reps","kcal/rep":0.04,"kcal/min":2.94,"Équipement":"poids du corps","name":"Pont fessiers"},
  {"id":"single_leg_glute_bridge","English":"Single-Leg Glute Bridge","Français":"Pont fessiers une jambe","Suivi":"reps_per_leg","kcal/rep":0.06,"kcal/min":3.92,"Équipement":"poids du corps","name":"Pont fessiers une jambe"},
  {"id":"hip_thrust","English":"Hip Thrust","Français":"Poussée hanche","Suivi":"reps","kcal/rep":0.06,"kcal/min":4.9,"Équipement":"banc","name":"Poussée hanche"},
  {"id":"weighted_hip_thrust","English":"Weighted Hip Thrust","Français":"Poussée hanche lestée","Suivi":"reps","kcal/rep":0.1,"kcal/min":6.86,"Équipement":"banc + lest","name":"Poussée hanche lestée"},
  {"id":"side_kick","English":"Side Kick","Français":"Coup de pied latéral","Suivi":"reps_per_side","kcal/rep":0.04,"kcal/min":3.92,"Équipement":"poids du corps","name":"Coup de pied latéral"},
  {"id":"fire_log_stretch","English":"Fire Log Stretch","Français":"Étirement hanche log","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement hanche log"},
  {"id":"hamstring_stretch","English":"Hamstring Stretch","Français":"Étirement ischio-jambiers","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement ischio-jambiers"},
  {"id":"quad_stretch","English":"Quad Stretch","Français":"Étirement quadriceps","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement quadriceps"},
  {"id":"calf_stretch","English":"Calf Stretch","Français":"Étirement mollets","Suivi":"seconds_per_side","kcal/min 70 kg":"2.5–3.0","name":"Étirement mollets"},
  {"id":"hip_90_90","English":"90/90 Hip Stretch","Français":"Étirement hanches 90/90","Suivi":"seconds_per_side","kcal/min 70 kg":"3.0–3.4","name":"Étirement hanches 90/90"},
  {"id":"deep_squat_hold","English":"Deep Squat Hold","Français":"Maintien squat profond","Suivi":"seconds","kcal/min 70 kg":"3.4–4.0","name":"Maintien squat profond"},
  {"id":"burpee","English":"Burpee","Français":"Burpee","Suivi":"reps","kcal/rep":0.3,"kcal/min":14.7,"Équipement":"poids du corps","name":"Burpee"},
  {"id":"mountain_climber","English":"Mountain Climber","Français":"Mountain climber","Suivi":"reps","kcal/rep":0.08,"kcal/min":9.8,"Équipement":"poids du corps","name":"Mountain climber"},
  {"id":"jumping_jack","English":"Jumping Jack","Français":"Jumping jack","Suivi":"reps","kcal/rep":0.06,"kcal/min":7.35,"Équipement":"poids du corps","name":"Jumping jack"},
  {"id":"high_knees","English":"High Knees","Français":"Montée genoux","Suivi":"reps","kcal/rep":0.05,"kcal/min":9.8,"Équipement":"poids du corps","name":"Montée genoux"},
  {"id":"box_jump","English":"Box Jump","Français":"Saut en box","Suivi":"reps","kcal/rep":0.15,"kcal/min":11.76,"Équipement":"box","name":"Saut en box"},
  {"id":"broad_jump","English":"Broad Jump","Français":"Saut en longueur","Suivi":"reps","kcal/rep":0.12,"kcal/min":9.8,"Équipement":"poids du corps","name":"Saut en longueur"},
  {"id":"tuck_jump","English":"Tuck Jump","Français":"Saut groupé","Suivi":"reps","kcal/rep":0.1,"kcal/min":9.8,"Équipement":"poids du corps","name":"Saut groupé"},
  {"id":"rope_skipping","English":"Rope Skipping","Français":"Corde à sauter","Suivi":"reps","kcal/rep":0.05,"kcal/min":14.7,"Équipement":"corde","name":"Corde à sauter"},
  {"id":"double_unders","English":"Double Unders","Français":"Double unders","Suivi":"reps","kcal/rep":0.06,"kcal/min":17.15,"Équipement":"corde","name":"Double unders"},
  {"id":"rowing_machine","English":"Rowing Machine","Français":"Rameur","Suivi":"reps_or_meters","kcal/rep":0.08,"kcal/min":9.8,"Équipement":"rameur","name":"Rameur"}
];

// ==================== CONSTANTES MET ====================
const VELO_MET = {leger:4.5, modere:6.8, soutenu:8, intense:10};
const RENFO_MET = {faible:3.5, moderee:5, forte:8};

let workoutPresets = LS.get('ct_wpresets', []);
let wkType = 'tapis';
let wkTapisMode = 'duree';
let wkParams = {vitesse:'', pente:'', effort:'modere', intensite:'moderee'};
let wkDuration = '';
let wkSteps = '';
let wkText = '';
let wkManualKcal = '';

// ==================== CALCULS MET & KCAL ====================

function metTapis(vKmh, pentePct){
  const speedMmin = (parseFloat(vKmh)||0) * 1000/60;
  const grade = (parseFloat(pentePct)||0)/100;
  const vo2 = 0.1*speedMmin + 1.8*speedMmin*grade + 3.5;
  return Math.max(1, vo2/3.5);
}

function computeWorkoutKcal(type, params, durationMin, weight){
  if(!weight || !durationMin) return 0;
  const h = durationMin/60;
  let met = 1;
  if(type==='tapis') met = metTapis(params.vitesse, params.pente);
  else if(type==='velo') met = VELO_MET[params.effort]||6.8;
  else if(type==='renfo') met = RENFO_MET[params.intensite]||5;
  return met * weight * h;
}

function stepsToDurationMin(steps, vitesseKmh, heightCm){
  const strideM = (parseFloat(heightCm)||170)/100 * 0.414;
  const distanceKm = (steps*strideM)/1000;
  const v = parseFloat(vitesseKmh)||1;
  return (distanceKm/v)*60;
}

// ==================== RECONNAISSANCE D'EXERCICES ====================

function exerciseNumber(name){
  const q=normalizeSearch(name);
  return EXERCISES.find(x=>
    normalizeSearch(x.name||'').includes(q)||
    normalizeSearch(x['Français']||'').includes(q)||
    normalizeSearch(x['English']||'').includes(q)
  );
}

function exerciseMatches(text){
  const q=normalizeSearch(text);
  const aliases={
    tractions:'pull_up', traction:'pull_up',
    pompes:'push_up', pompe:'push_up',
    squats:'bodyweight_squat', squat:'bodyweight_squat',
    burpees:'burpee', burpee:'burpee',
    gainage:'plank', planche:'plank'
  };
  const out=[];
  const seen=new Set();
  
  EXERCISES.forEach(x=>{
    const names=[x.name,x['Français'],x['English']].filter(Boolean).map(normalizeSearch);
    if(names.some(n=>n.length>2&&q.includes(n))){
      if(!seen.has(x.id)){out.push(x);seen.add(x.id);}
    }
  });
  
  Object.keys(aliases).forEach(a=>{
    if(q.includes(a)&&!seen.has(aliases[a])){
      const x=EXERCISES.find(e=>e.id===aliases[a]);
      if(x){out.push(x);seen.add(x.id);}
    }
  });
  
  return out;
}

function exerciseDetails(text){
  const found=exerciseMatches(text), q=normalizeSearch(text);
  const knownNames=found.flatMap(x=>[x.name,x['Français'],x['English']]).filter(Boolean);
  const tokens=q.split(/[,;+\n]+/).map(x=>x.trim()).filter(Boolean);
  const unknown=tokens.filter(t=>
    !found.some(x=>[x.name,x['Français'],x['English']].filter(Boolean)
    .some(n=>t.includes(normalizeSearch(n)))) && 
    !/^(emom|amrap|tabata|circuit|round|rounds|tour|tours|cycle|cycles|boucle|boucles|mobilite|jambes|gainage|minutes?|min|mn|\d+)$/i.test(t)
  );
  return {found, unknown:[...new Set(unknown)].slice(0,8), names:knownNames};
}

// ==================== PARSING SÉANCES MANUELLES ====================

function parseManualWorkout(text, weight){
  if(!text || !weight) return null;
  
  const raw=text.toLowerCase();
  const info=exerciseDetails(text);
  const found=info.found;
  
  let kcal=0, repsKcal=0, block=false, dur=0;
  
  // Parse durée
  const durMatch=raw.match(/(\d+\.?\d*)\s*(?:min|mn|m|minute|minutes)/);
  if(durMatch) dur=parseFloat(durMatch[1]);
  
  // Parse par reps
  found.forEach(ex=>{
    const repsMatch=raw.match(new RegExp(normalizeSearch(ex['Français']||ex.name)+'.*?(\\d+)\\s*(?:reps?|rep|x|fois)', 'i'));
    if(repsMatch && ex['kcal/rep']){
      repsKcal += parseInt(repsMatch[1]) * ex['kcal/rep'];
    }
  });
  
  // Détection formats structurés
  block = /emom|amrap|tabata|circuit|round|tour|cycle|boucle/i.test(raw);
  
  // Calcul kcal
  const mins=found.flatMap(x=>parseFloat(x['kcal/min'])).filter(Number.isFinite).sort((a,b)=>a-b);
  const median=mins.length ? mins[Math.floor(mins.length/2)] : null;
  
  if(block && dur>0){
    kcal=median ? median*dur*weight/70 : 0;
    if(repsKcal>0 && !/amrap|emom/i.test(raw)) kcal=Math.min(kcal, repsKcal*weight/70 + dur*2.5*weight/70);
  } else if(repsKcal>0) kcal=repsKcal*weight/70;
  else if(median && dur>0) kcal=median*dur*weight/70;
  
  // Safeguards physiologiques
  if(/circuit/i.test(raw) && !found.length && dur>0) kcal=202*weight/77;
  if(/emom/i.test(raw) && /traction|pull.?up|chin.?up/i.test(raw)) kcal=Math.min(kcal,90*weight/77);
  if(/amrap/i.test(raw) && /burpee/i.test(raw)) kcal=Math.min(kcal,135*weight/77);
  if(/tabata/i.test(raw)) kcal=Math.min(kcal,12*dur*weight/70);
  
  const capped=Math.min(kcal,Math.max(0,dur)*12*weight/70 || kcal);
  
  return {
    kcal:Math.round(capped),
    recognized:found.map(x=>({
      id:x.id,
      name:x['Français']||x.name,
      kcalRep:x['kcal/rep'],
      kcalMin:x['kcal/min'],
      equipment:x['Équipement']||x.equipment||''
    })),
    unrecognized:info.unknown,
    kcalPerMin:median?Math.round(median*100)/100:null,
    weightFactor:Math.round((weight/70)*1000)/1000,
    formula:'médiane catalogue × durée × poids/70; reps/blocs non additionnés deux fois'
  };
}

// ==================== RÉSUMÉS & AFFICHAGE ====================

function workoutSummary(e){
  if(e.wtype==='tapis'){
    return {
      title:'Tapis incliné',
      sub:`${e.params.vitesse} km/h · ${e.params.pente}% · ${e.duration} min${e.steps? ' · '+Math.round(e.steps)+' pas':''} · ${e.time}`
    };
  }
  if(e.wtype==='velo'){
    const lbl = {leger:'léger',modere:'modéré',soutenu:'soutenu',intense:'intense'}[e.params.effort]||e.params.effort;
    return {
      title:'Vélo',
      sub:`Effort ${lbl} · ${e.duration} min · ${e.time}`
    };
  }
  if(e.wtype==='renfo'){
    const lbl = {faible:'faible',moderee:'modérée',forte:'forte'}[e.params.intensite]||e.params.intensite;
    return {
      title:'Renfo',
      sub:`Intensité ${lbl}${e.duration? ' · '+e.duration+' min':''} · ${e.time}${e.text? ' · '+escapeHtml(e.text).slice(0,60):''}`
    };
  }
  
  const d=e.estimation;
  const detail=d ? ` · reconnus: ${d.recognized.map(x=>x.name).join(', ')||'aucun'}${d.unrecognized.length?' · non reconnus: '+d.unrecognized.join(', '):''} · kcal/min médiane: ${d.kcalPerMin==null?'valeur manquante':d.kcalPerMin}` : '';
  return {
    title:'Séance',
    sub:`${escapeHtml(e.text||'')}${e.duration? ' · '+e.duration+' min':''} · ${e.time}${detail}`
  };
}

function viewWorkouts(){
  const es = entriesFor(currentDate).filter(e=>e.type==='workout').sort((a,b)=>a.time.localeCompare(b.time));
  const weight = getCurrentWeight();
  const presetsForType = workoutPresets.filter(p=>p.type===wkType);
  
  return `
  ${dayBar()}
  <section class="card">
    <h2>Nouvelle séance</h2>
    ${!weight ? `<div class="hint">Ajoute une pesée dans l'onglet Poids pour activer le calcul auto des calories (tapis/vélo/renfo). En attendant, utilise le mode "Manuel".</div>` : ''}
    
    <label>Type de séance</label>
    <div class="wk-cards" id="wkTypeSeg">
      ${[
        {k:'tapis', lbl:'Tapis', hint:'Marche/course', svg:'<path d="M3 12h2M7 12h1M11 12h2M15 12h1M19 12h2M3 18h18M5 18v2M19 18v2M5 20h14"/>'},
        {k:'velo',  lbl:'Vélo',  hint:'Cyclisme',     svg:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-7h6l3 7M9 10l-2-4h3"/>'},
        {k:'renfo', lbl:'Renfo', hint:'Musculation',  svg:'<path d="M4 12h2M8 12v-2M8 12v2M12 12v-3M12 12v3M16 12v-2M16 12v2M20 12h-2"/>'},
        {k:'manuel',lbl:'Manuel',hint:'Notes libres', svg:'<path d="M5 4h11l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/>'}
      ].map(o=>`<button class="wk-card ${wkType===o.k?'active':''}" data-type="${o.k}"><div class="ico"><svg viewBox="0 0 24 24">${o.svg}</svg></div><div><div class="lbl">${o.lbl}</div><div class="hint">${o.hint}</div></div></button>`).join('')}
    </div>
    
    ${presetsForType.length ? `
      <label>Tes préréglages</label>
      <div class="preset-row">
        ${presetsForType.map(p=>`<button class="preset-chip" data-preset="${p.id}">${escapeHtml(p.name)}</button>`).join('')}
      </div>
    ` : ''}

    ${wkType==='tapis' ? `
      <div class="row2">
        <div><label>Vitesse (km/h)</label><input id="wkVitesse" type="number" step="0.1" value="${wkParams.vitesse}"></div>
        <div><label>Pente (%)</label><input id="wkPente" type="number" step="0.5" value="${wkParams.pente}"></div>
      </div>
      <label>Tu préfères saisir</label>
      <div class="seg" id="wkTapisModeSeg">
        <button data-mode="duree" class="${wkTapisMode==='duree'?'active':''}">Durée (min)</button>
        <button data-mode="pas" class="${wkTapisMode==='pas'?'active':''}">Nombre de pas</button>
      </div>
      ${wkTapisMode==='duree'
        ? `<label>Durée (min)</label><input id="wkDuree" type="number" value="${wkDuration}">`
        : `<label>Nombre de pas</label><input id="wkPas" type="number" value="${wkSteps}"><div class="hint">Estimé à partir de ta taille (${profile.height||'renseigne-la dans Poids'} cm) et de la vitesse ci-dessus.</div>`}
    ` : ''}

    ${wkType==='velo' ? `
      <label>Intensité</label>
      <div class="seg" id="wkVeloEffortSeg">
        <button data-effort="leger" class="${wkParams.effort==='leger'?'active':''}">Léger</button>
        <button data-effort="modere" class="${wkParams.effort==='modere'?'active':''}">Modéré</button>
        <button data-effort="soutenu" class="${wkParams.effort==='soutenu'?'active':''}">Soutenu</button>
        <button data-effort="intense" class="${wkParams.effort==='intense'?'active':''}">Intense</button>
      </div>
      <label>Durée (min)</label>
      <input id="wkDurVelo" type="number" value="${wkDuration}">
    ` : ''}

    ${wkType==='renfo' ? `
      <label>Intensité</label>
      <div class="seg" id="wkRenfoIntensiteSeg">
        <button data-intensite="faible" class="${wkParams.intensite==='faible'?'active':''}">Faible</button>
        <button data-intensite="moderee" class="${wkParams.intensite==='moderee'?'active':''}">Modérée</button>
        <button data-intensite="forte" class="${wkParams.intensite==='forte'?'active':''}">Forte</button>
      </div>
      <label>Notes (optionnel)</label>
      <textarea id="wkTextRenfo" placeholder="Exos, séries, reps…">${escapeHtml(wkText)}</textarea>
      <label>Durée (min, optionnel)</label>
      <input id="wkDurRenfo" type="number" value="${wkDuration}">
    ` : ''}

    ${wkType==='manuel' ? `
      <label>Notes (optionnel)</label>
      <textarea id="wkText" placeholder="Description libre…">${escapeHtml(wkText)}</textarea>
      <div class="row2">
        <div><label>Calories brûlées (optionnel)</label><input id="wkKcal" type="number" value="${wkManualKcal}"><div class="hint">Si vide, calcul médian depuis la bibliothèque (EMOM, AMRAP, Tabata, circuits, tours/cycles/boucles). Les exercices non reconnus et valeurs manquantes seront signalés après enregistrement.</div></div>
        <div><label>Durée (min, optionnel)</label><input id="wkDurManual" type="number" value="${wkDuration}"></div>
      </div>
    ` : ''}
    
    <button class="btn rust" id="saveWorkout">Enregistrer la séance</button>
    ${wkType!=='manuel' ? `<button class="btn ghost" id="savePresetBtn">★ Enregistrer ces réglages comme préréglage</button>` : ''}
    
    <div class="wk-estimate" id="wkEstimate">
      <div class="num" id="wkEstimateNum">—</div>
      <div class="lbl">kcal estimés en temps réel (d'après ton poids, ta durée, l'intensité)</div>
    </div>
  </section>
  
  <section class="card">
    <h2>Séances du jour</h2>
    ${es.length? es.map(e=>{
      const s=workoutSummary(e);
      return `<div class="list-entry">
        <div class="main"><div class="title">${s.title}</div><div class="sub">${s.sub}</div></div>
        <div class="amount rust">−${Math.round(e.kcalBurned)}</div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`;
    }).join('') : '<div class="empty">Aucune séance ce jour-là.</div>'}
  </section>
  `;
}

// ==================== PRESETS ====================

function openPresetNameModal(){
  openModal(`
    <h3>Nouveau préréglage</h3>
    <div class="hint">La durée saisie sera reprise par défaut, mais restera modifiable à chaque utilisation.</div>
    <label>Nom</label><input id="wpName" type="text" placeholder="ex. Vélo trajet travail" autofocus>
    <button class="btn" id="wpSave">Enregistrer le préréglage</button>
  `);
  document.getElementById('wpSave').onclick = ()=>{
    const name = document.getElementById('wpName').value.trim();
    if(!name){ toast('Donne un nom au préréglage'); return; }
    let params = {};
    if(wkType==='tapis') params = {vitesse:wkParams.vitesse, pente:wkParams.pente};
    else if(wkType==='velo') params = {effort:wkParams.effort};
    else if(wkType==='renfo') params = {intensite:wkParams.intensite};
    workoutPresets.unshift({
      id:'wp'+uid(), name, type:wkType, params,
      defaultDurationMin: wkDuration || null,
      notes: wkType==='renfo' ? wkText : null
    });
    save(); closeModal(); render(); toast('Préréglage enregistré ✓');
  };
}

// ==================== EVENT LISTENERS ====================

function setupWorkoutListeners(){
  // Changement type de séance
  document.querySelectorAll('#wkTypeSeg .wk-card').forEach(btn=>{
    btn.onclick=()=>{
      wkType=btn.dataset.type;
      wkDuration='';
      wkSteps='';
      wkText='';
      wkManualKcal='';
      render();
    };
  });

  // Tapis: toggle durée/pas
  document.querySelectorAll('#wkTapisModeSeg button').forEach(btn=>{
    btn.onclick=()=>{
      wkTapisMode=btn.dataset.mode;
      render();
    };
  });

  // Tapis: inputs
  const wkVitesse=document.getElementById('wkVitesse');
  const wkPente=document.getElementById('wkPente');
  if(wkVitesse) wkVitesse.oninput=()=>{ wkParams.vitesse=wkVitesse.value; updateEstimate(); };
  if(wkPente) wkPente.oninput=()=>{ wkParams.pente=wkPente.value; updateEstimate(); };

  const wkDuree=document.getElementById('wkDuree');
  const wkPas=document.getElementById('wkPas');
  if(wkDuree) wkDuree.oninput=()=>{ wkDuration=wkDuree.value; updateEstimate(); };
  if(wkPas) wkPas.oninput=()=>{
    wkSteps=wkPas.value;
    if(wkSteps && wkParams.vitesse) wkDuration=stepsToDurationMin(wkSteps, wkParams.vitesse, profile.height||170);
    updateEstimate();
  };

  // Vélo: effort
  document.querySelectorAll('#wkVeloEffortSeg button').forEach(btn=>{
    btn.onclick=()=>{
      wkParams.effort=btn.dataset.effort;
      updateEstimate();
    };
  });

  const wkDurVelo=document.getElementById('wkDurVelo');
  if(wkDurVelo) wkDurVelo.oninput=()=>{ wkDuration=wkDurVelo.value; updateEstimate(); };

  // Renfo: intensité
  document.querySelectorAll('#wkRenfoIntensiteSeg button').forEach(btn=>{
    btn.onclick=()=>{
      wkParams.intensite=btn.dataset.intensite;
      updateEstimate();
    };
  });

  const wkTextRenfo=document.getElementById('wkTextRenfo');
  const wkDurRenfo=document.getElementById('wkDurRenfo');
  if(wkTextRenfo) wkTextRenfo.oninput=()=>{ wkText=wkTextRenfo.value; updateEstimate(); };
  if(wkDurRenfo) wkDurRenfo.oninput=()=>{ wkDuration=wkDurRenfo.value; updateEstimate(); };

  // Manuel
  const wkText=document.getElementById('wkText');
  const wkKcal=document.getElementById('wkKcal');
  const wkDurManual=document.getElementById('wkDurManual');
  if(wkText) wkText.oninput=()=>{ wkText.value; updateEstimate(); };
  if(wkKcal) wkKcal.oninput=()=>{ wkManualKcal=wkKcal.value; };
  if(wkDurManual) wkDurManual.oninput=()=>{ wkDuration=wkDurManual.value; };

  // Presets
  document.querySelectorAll('.preset-chip').forEach(btn=>{
    btn.onclick=()=>{
      const preset=workoutPresets.find(p=>p.id===btn.dataset.preset);
      if(!preset) return;
      wkParams=Object.assign({}, preset.params);
      if(preset.defaultDurationMin) wkDuration=preset.defaultDurationMin;
      if(preset.notes) wkText=preset.notes;
      render();
    };
  });

  // Enregistrer séance
  document.getElementById('saveWorkout').onclick=()=>{
    const weight=getCurrentWeight();
    if(!weight){ toast('Ajoute ton poids pour calculer les calories'); return; }

    let kcal=0, duration=0;

    if(wkType==='tapis'){
      if(!wkDuration && !wkSteps){ toast('Renseigne la durée ou le nombre de pas'); return; }
      if(wkSteps && wkParams.vitesse) wkDuration=stepsToDurationMin(wkSteps, wkParams.vitesse, profile.height||170);
      duration=parseFloat(wkDuration)||0;
      kcal=computeWorkoutKcal('tapis', wkParams, duration, weight);
    }
    else if(wkType==='velo'){
      if(!wkDuration){ toast('Renseigne la durée'); return; }
      duration=parseFloat(wkDuration)||0;
      kcal=computeWorkoutKcal('velo', wkParams, duration, weight);
    }
    else if(wkType==='renfo'){
      duration=parseFloat(wkDuration)||0;
      kcal=computeWorkoutKcal('renfo', wkParams, duration, weight);
      if(wkText){
        const parsed=parseManualWorkout(wkText, weight);
        if(parsed && parsed.kcal>0) kcal=parsed.kcal;
      }
    }
    else if(wkType==='manuel'){
      if(wkManualKcal){
        kcal=parseFloat(wkManualKcal)||0;
      } else if(wkText){
        const parsed=parseManualWorkout(wkText, weight);
        kcal=parsed ? parsed.kcal : 0;
      }
      duration=parseFloat(wkDuration)||0;
    }

    if(kcal<=0){ toast('Impossible de calculer les calories (paramètres manquants)'); return; }

    const entry={
      id:uid(),
      type:'workout',
      date:currentDate,
      time:timeNow(),
      wtype:wkType,
      params:wkParams,
      duration:duration||null,
      steps:wkSteps||null,
      text:wkText||null,
      kcalBurned:kcal,
      estimation:wkType==='manuel' && wkText ? parseManualWorkout(wkText, weight) : null
    };

    entries.push(entry);
    save();
    wkType='tapis';
    wkDuration='';
    wkSteps='';
    wkText='';
    wkManualKcal='';
    wkParams={vitesse:'', pente:'', effort:'modere', intensite:'moderee'};
    render();
    toast('Séance enregistrée ✓');
  };

  // Enregistrer preset
  document.getElementById('savePresetBtn').onclick=openPresetNameModal;

  // Supprimer séance
  document.querySelectorAll('.list-entry .del').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.del;
      entries=entries.filter(e=>e.id!==id);
      save();
      render();
    };
  });
}

function updateEstimate(){
  const weight=getCurrentWeight();
  if(!weight) return;
  
  let kcal=0, duration=0;
  
  if(wkType==='tapis'){
    if(wkDuration) duration=parseFloat(wkDuration);
    else if(wkSteps && wkParams.vitesse) duration=stepsToDurationMin(wkSteps, wkParams.vitesse, profile.height||170);
    if(duration>0) kcal=computeWorkoutKcal('tapis', wkParams, duration, weight);
  }
  else if(wkType==='velo'){
    duration=parseFloat(wkDuration)||0;
    if(duration>0) kcal=computeWorkoutKcal('velo', wkParams, duration, weight);
  }
  else if(wkType==='renfo'){
    duration=parseFloat(wkDuration)||0;
    if(wkText){
      const parsed=parseManualWorkout(wkText, weight);
      if(parsed) kcal=parsed.kcal;
    } else if(duration>0) {
      kcal=computeWorkoutKcal('renfo', wkParams, duration, weight);
    }
  }
  
  const num=document.getElementById('wkEstimateNum');
  if(num) num.textContent=kcal>0 ? kcal : '—';
}
