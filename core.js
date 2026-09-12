/* ===================== CORE APP =====================
 * État global partagé (LS, profil, log, todos...), utilitaires
 * de dates, rendu des vues (dashboard, poids, historique,
 * notes, réglages), gestion des modales et des events.
 * À charger EN PREMIER (food.js et sport.js en dépendent).
 * ===================================================== */

function slugify(s){return "b_"+String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}

const LS = {
  get(k,d){try{const v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){localStorage.setItem(k, JSON.stringify(v));}
};

let settings = LS.get('ct_settings', {calorieGoal:2200, proteinGoal:150, carbGoal:220, fatGoal:70});

let weightEntries = LS.get('ct_weight', []);

let profile = LS.get('ct_profile', {sex:'H', age:'', height:'', activity:'modere', goalWeight:'', rate:'-0.5'});

let logEntries = LS.get('ct_log', []);

let todos = LS.get('ct_todos', []);

let currentDate = todayStr();

let activeTab = 'today';

function todayStr(){ return fmtDate(new Date()); }

function fmtDate(d){ return d.toISOString().slice(0,10); }

function shiftDate(dateStr, delta){ const d=new Date(dateStr+'T12:00:00'); d.setDate(d.getDate()+delta); return fmtDate(d); }

function dateLabel(dateStr){
  const d = new Date(dateStr+'T12:00:00');
  const t = new Date(); const y = new Date(); y.setDate(t.getDate()-1); const tm = new Date(); tm.setDate(t.getDate()+1);
  if(dateStr===fmtDate(t)) return "Aujourd'hui";
  if(dateStr===fmtDate(y)) return "Hier";
  if(dateStr===fmtDate(tm)) return "Demain";
  return d.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
}

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function save(){
  LS.set('ct_settings',settings); LS.set('ct_customFoods',customFoods); LS.set('ct_foodOverrides',foodOverrides);
  LS.set('ct_favorites',favorites); LS.set('ct_weight',weightEntries); LS.set('ct_profile',profile);
  LS.set('ct_wpresets',workoutPresets);
  LS.set('ct_log',logEntries);
  LS.set('ct_todos',todos);
}

const TOAST_ICONS = {
  success: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
  warn:    '<svg class="ico" viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 17.5v.5"/></svg>',
  error:   '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  info:    '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h2v5"/></svg>',
};

function toast(msg, kind='info'){
  const t=document.getElementById('toast');
  t.className = 'toast ' + kind;
  t.innerHTML = (TOAST_ICONS[kind]||TOAST_ICONS.info) + '<span>'+msg+'</span>';
  // restart animation
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(window.__toastT);
  window.__toastT=setTimeout(()=>{ t.classList.remove('show'); }, 2200);
}

function flashEl(el){
  if(!el) return;
  el.classList.remove('flash'); void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(()=>el.classList.remove('flash'), 900);
}

function entriesFor(date){ return logEntries.filter(e=>e.date===date); }

function dayTotals(date){
  const es = entriesFor(date);
  let kcalIn=0, kcalOut=0, protein=0, carbs=0, fat=0;
  es.forEach(e=>{
    if(e.type==='meal'){ kcalIn+=e.kcal; protein+=e.protein; carbs+=e.carbs; fat+=e.fat; }
    else if(e.type==='workout'){ kcalOut += e.kcalBurned; }
  });
  return {kcalIn,kcalOut,protein,carbs,fat,net:kcalIn-kcalOut};
}

function weekStart(dateStr){
  const d = new Date(dateStr+'T12:00:00');
  const mondayOffset = (d.getDay()+6)%7;
  d.setDate(d.getDate()-mondayOffset);
  return fmtDate(d);
}

function weekEnd(startStr){ return shiftDate(startStr, 6); }

function weeklyDeficit(startStr){
  const endStr = weekEnd(startStr);
  const days = [...new Set(logEntries.filter(e=>e.type==='meal' && e.date>=startStr && e.date<=endStr).map(e=>e.date))].sort();
  const dayValues = days.map(date=>({date, calories:dayTotals(date).kcalIn, deficit:settings.calorieGoal-dayTotals(date).kcalIn}));
  return {start:startStr, end:endStr, days:dayValues, total:dayValues.reduce((sum,d)=>sum+d.deficit,0)};
}

function weeklyDeficits(){
  const starts = [...new Set(logEntries.filter(e=>e.type==='meal').map(e=>weekStart(e.date)))].sort((a,b)=>b.localeCompare(a));
  return starts.map(weeklyDeficit);
}

function weeklyRangeLabel(startStr,endStr){
  const fmt = d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
  return `${fmt(startStr)} au ${fmt(endStr)}`;
}

function weeklyDeficitCard(week, isCurrent){
  const surplus = week.total < 0;
  const label = surplus ? 'Surplus' : 'Déficit';
  return `<section class="weekly-deficit ${isCurrent?'current':'past'}">
    <div class="eyebrow">${isCurrent?'Semaine en cours':'Semaine précédente'} · ${label}</div>
    <div class="range">Semaine du ${weeklyRangeLabel(week.start,week.end)}</div>
    <div class="total ${surplus?'surplus':'deficit'}">${week.total < 0 ? '+' : '-'}${Math.round(Math.abs(week.total))} kcal</div>
    <div class="meta">${week.days.length} jour${week.days.length>1?'s':''} avec repas · objectif ${settings.calorieGoal} kcal/jour · séances non déduites</div>
  </section>`;
}

function normalizeTodos(){
  const today = todayStr();
  todos = (Array.isArray(todos)?todos:[]).map(t=>({...t, daily:!!t.daily, done:!!t.done}));
  let changed=false;
  todos.forEach(t=>{ if(t.daily && t.done && t.completedDate!==today){t.done=false; t.completedDate=null; changed=true;} });
  if(changed) save();
}

function viewTodos(){
  normalizeTodos();
  const done=todos.filter(t=>t.done).length;
  const pending=todos.filter(t=>!t.done);
  const completed=todos.filter(t=>t.done);
  const item=t=>`<div class="todo-item ${t.done?'done':''}">
    <input class="todo-check" type="checkbox" data-todo-toggle="${t.id}" ${t.done?'checked':''} aria-label="Marquer ${escapeHtml(t.text)} comme fait">
    <div class="todo-copy"><div class="todo-label">${escapeHtml(t.text)}</div><span class="todo-kind">${t.daily?'Chaque jour':'Objectif ponctuel'}</span></div>
    <div class="todo-actions"><button data-todo-edit="${t.id}" aria-label="Modifier">✎</button><button data-todo-delete="${t.id}" aria-label="Supprimer">✕</button></div>
  </div>`;
  return `<h1 class="page-title">To-do</h1>
  <section class="card todo-intro"><h2>Petits pas, grands effets</h2><p>Ajoute tes objectifs personnels ou tes rappels de médicaments. Les habitudes quotidiennes repartent à zéro chaque jour.</p></section>
  <section class="card"><h2>Ajouter une tâche</h2>
    <div class="todo-form"><input id="todoInput" type="text" maxlength="120" placeholder="Ex. Prendre mes médicaments" autocomplete="off"><button class="btn primary" id="todoAdd">Ajouter</button>
      <label class="todo-options"><input id="todoDaily" type="checkbox"> Tâche quotidienne <span class="hint" style="margin:0">(à recocher demain)</span></label>
    </div>
  </section>
  <section class="card"><h2>À faire</h2>
    <div class="todo-progress" aria-label="Progression des tâches">${done}/${todos.length} complétée${done>1?'s':''} <span aria-hidden="true">·</span> ${todos.length?Math.round(done/todos.length*100):0}%
      <div class="todo-progress-bar"><span style="--progress:${todos.length?Math.round(done/todos.length*100):0}%"></span></div>
    </div>
    <div class="todo-list">${pending.length?pending.map(item).join(''):'<div class="empty">Tout est fait pour le moment ✨</div>'}</div>
    ${completed.length?`<h2 style="margin-top:20px">Terminées</h2><div class="todo-list">${completed.map(item).join('')}</div>`:''}
  </section>`;
}

function render(){
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===activeTab));
  const main = document.getElementById('main');
  if(activeTab==='today') main.innerHTML = viewToday();
  else if(activeTab==='meals') main.innerHTML = viewMeals();
  else if(activeTab==='workouts') main.innerHTML = viewWorkouts();
  else if(activeTab==='weight') main.innerHTML = viewWeight();
  else if(activeTab==='notes') main.innerHTML = viewNotes();
  else if(activeTab==='todos') main.innerHTML = viewTodos();
  else if(activeTab==='history') main.innerHTML = viewHistory();
  else if(activeTab==='settings') main.innerHTML = viewSettings();
  bindTabEvents();
}

function dayBar(){
  return `<div class="daybar">
    <button data-act="prevday">‹</button>
    <div class="label">${dateLabel(currentDate)}<small>${new Date(currentDate+'T12:00:00').toLocaleDateString('fr-FR')}</small></div>
    <button data-act="nextday">›</button>
  </div>`;
}

function viewToday(){
  const t = dayTotals(currentDate);
  const remaining = settings.calorieGoal - t.net;
  const pctRaw = Math.max(0,(t.net/settings.calorieGoal));
  const pct = Math.min(100, pctRaw*100);
  const over = t.net > settings.calorieGoal;
  const macroRow = (name,val,goal,color)=>{
    const p = goal? Math.min(100,(val/goal)*100) : 0;
    return `<div class="macro-row"><div class="name">${name}</div><div class="bar"><div style="width:${p}%; background:${color}"></div></div><div class="amt">${Math.round(val)}${goal? ' / '+goal:''} g</div></div>`;
  };
  // SVG ring (circumference = 2π·r with r=52)
  const r=52, cx=60, cy=60, C=2*Math.PI*r;
  const dash = (pct/100)*C;
  const proteinLeft = Math.max(0, settings.proteinGoal - t.protein);
  const summaryText = over
    ? `Tu as dépassé ton objectif de ${Math.round(-remaining)} kcal.`
    : `Il te reste <b>${Math.round(remaining)} kcal</b> et <b>${Math.round(proteinLeft)} g de protéines</b> à répartir aujourd'hui.`;

  // Mini bar chart: last 7 days calories (oldest -> today)
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = fmtDate(d);
    const tt = dayTotals(ds);
    days.push({date:ds, kcal: tt.kcalIn, label:['D','L','M','M','J','V','S'][d.getDay()]});
  }
  const maxK = Math.max(settings.calorieGoal, ...days.map(x=>x.kcal), 1);
  const bars = days.map((d,i)=>{
    const h = Math.round((d.kcal/maxK)*54);
    const isToday = d.date===currentDate;
    const isEmpty = d.kcal===0 && !isToday;
    return `<div class="bar-col ${isToday?'today':''} ${isEmpty?'empty':''}"><div class="b" style="height:${Math.max(2,h)}px"></div><div class="l">${d.label}</div></div>`;
  }).join('');
  const avg = Math.round(days.reduce((s,d)=>s+d.kcal,0)/7);

  return `
  ${dayBar()}
  <section class="card">
    <div class="kcal-ring-wrap">
      <svg class="kcal-ring ${over?'over':''}" viewBox="0 0 120 120">
        <circle class="track" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="10"/>
        <circle class="fill" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="10" stroke-linecap="round"
          transform="rotate(-90 ${cx} ${cy})"
          stroke-dasharray="${C.toFixed(1)}"
          stroke-dashoffset="${(C-dash).toFixed(1)}"/>
        <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="26" fill="currentColor">${Math.round(t.net)}</text>
        <text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="10" fill="var(--ink-faint)">/ ${settings.calorieGoal} kcal</text>
      </svg>
      <div class="kcal-summary">
        <div class="big ${remaining<0?'neg':''}">${over?'+'+Math.round(-remaining):Math.round(remaining)} <span style="font-size:13px;color:var(--ink-soft);font-family:var(--font-sans);font-weight:600;">kcal</span></div>
        <div class="sub">${summaryText}</div>
        <span class="pill">${Math.round(pctRaw*100)}% de l'objectif</span>
      </div>
    </div>
    <div class="trio">
      <div class="cell blue"><div class="k">Repas</div><div class="v">${Math.round(t.kcalIn)}</div></div>
      <div class="cell rust"><div class="k">Brûlées</div><div class="v">${Math.round(t.kcalOut)}</div></div>
      <div class="cell green"><div class="k">Net</div><div class="v">${Math.round(t.net)}</div></div>
    </div>
  </section>
  <section class="card">
    <h2>Calories — 7 derniers jours</h2>
    <div class="mini-bars">${bars}</div>
    <div class="axis">Moyenne ${avg} kcal · objectif ${settings.calorieGoal}</div>
  </section>
  <section class="card">
    <h2>Macros du jour</h2>
    ${macroRow('Protéines', t.protein, settings.proteinGoal, 'var(--blue)')}
    ${macroRow('Glucides', t.carbs, settings.carbGoal, 'var(--rust)')}
    ${macroRow('Lipides', t.fat, settings.fatGoal, 'var(--green)')}
  </section>
  <section class="card">
    <h2>Journal du jour</h2>
    ${dayLogList(currentDate)}
  </section>`;
}

function dayLogList(date){
  const es = entriesFor(date).filter(e=>e.type!=='note').sort((a,b)=>a.time.localeCompare(b.time));
  if(!es.length) return `<div class="empty">Rien enregistré ce jour-là.</div>`;
  return es.map((e,i)=>{
    if(e.type==='meal'){
      return `<div class="list-entry enter"><div class="main"><div class="title">${escapeHtml(e.foodName)}</div><div class="sub">${e.mealSlot} · ${e.grams} g · ${e.time}</div></div>
        <div class="amount blue">+${Math.round(e.kcal)}</div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`;
    }
    if(e.type==='note'){
      return `<div class="list-entry enter"><div class="main"><div class="title">Note · ${e.time}</div><div class="sub">${escapeHtml(e.text||'')}</div></div>
        <button class="del" data-del="${e.id}">✕</button>
      </div>`;
    }
    const s = workoutSummary(e);
    return `<div class="list-entry enter">
      <div class="main"><div class="title">${s.title}</div><div class="sub">${s.sub}</div></div>
      <div class="amount rust">−${Math.round(e.kcalBurned)}</div>
      <button class="del" data-del="${e.id}">✕</button>
    </div>`;
  }).join('');
}

function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function getCurrentWeight(){
  const sorted = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date));
  return sorted.length ? sorted[0].weight : null;
}

function normalizeSearch(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

let openHistDay = null;

function svgWeightTrend(entriesDesc){
  const sorted = [...entriesDesc].sort((a,b)=>a.date.localeCompare(b.date));
  if(sorted.length<2) return '';
  const weights = sorted.map(e=>e.weight);
  const min = Math.min(...weights), max = Math.max(...weights);
  const range = (max-min)||1;
  const w=300,h=70,pad=8;
  const coords = sorted.map((e,i)=>({
    x: pad + (i/(sorted.length-1))*(w-2*pad),
    y: h-pad - ((e.weight-min)/range)*(h-2*pad)
  }));
  const pts = coords.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:70px; margin-top:4px; display:block;">
    <polyline points="${pts}" fill="none" style="stroke:var(--blue); stroke-width:2"/>
    ${coords.map(c=>`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="2.6" style="fill:var(--blue)"/>`).join('')}
  </svg>`;
}

function computeGoals(p, weight){
  const age = parseFloat(p.age), height = parseFloat(p.height);
  if(!weight || !age || !height) return null;
  const bmr = p.sex==='F' ? (10*weight + 6.25*height - 5*age - 161) : (10*weight + 6.25*height - 5*age + 5);
  const actMap = {sedentaire:1.2, leger:1.375, modere:1.55, intense:1.725};
  const tdee = bmr * (actMap[p.activity]||1.55);
  const goalWeight = parseFloat(p.goalWeight), rate = parseFloat(p.rate);
  let targetKcal = tdee, weeksToGoal = null, warning = null;
  if(goalWeight && rate){
    targetKcal = tdee + (rate*7700/7);
    weeksToGoal = Math.abs((goalWeight-weight)/rate);
    const needsLoss = goalWeight < weight, needsGain = goalWeight > weight;
    if((needsLoss && rate>0) || (needsGain && rate<0)) warning = "Le rythme indiqué va dans le sens opposé à ton objectif de poids.";
  }
  targetKcal = Math.max(1200, Math.round(targetKcal));
  const proteinG = Math.round(weight*2);
  let fatG = Math.round(targetKcal*0.25/9);
  let carbG = Math.round((targetKcal - proteinG*4 - fatG*9)/4);
  if(carbG < 50){ carbG = 50; fatG = Math.max(20, Math.round((targetKcal - proteinG*4 - carbG*4)/9)); }
  return {bmr:Math.round(bmr), tdee:Math.round(tdee), targetKcal, proteinG, carbG, fatG, weeksToGoal, warning};
}

function viewWeight(){
  const sorted = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date));
  const latest = sorted[0];
  const goals = latest ? computeGoals(profile, latest.weight) : null;
  return `
  <h1 class="page-title">Poids &amp; objectifs</h1>
  <section class="card">
    <h2>Nouvelle pesée</h2>
    <label>Date</label>
    <input id="wDate" type="date" value="${todayStr()}">
    <label>Poids (kg)</label>
    <input id="wWeight" type="number" step="0.1" inputmode="decimal" placeholder="ex. 78.4">
    <div class="row2">
      <div><label>Masse grasse (%, optionnel)</label><input id="wFat" type="number" step="0.1"></div>
      <div><label>Masse musculaire (%, optionnel)</label><input id="wMuscle" type="number" step="0.1"></div>
    </div>
    <label>Note (optionnel)</label>
    <input id="wNote" type="text" placeholder="à jeun, après le sport…">
    <button class="btn" id="saveWeight">Enregistrer la pesée</button>
  </section>
  <section class="card">
    <h2>Historique</h2>
    ${sorted.length===0 ? '<div class="empty">Aucune pesée enregistrée.</div>' : svgWeightTrend(sorted) + sorted.map(e=>`
      <div class="list-entry">
        <div class="main"><div class="title">${e.weight} kg</div><div class="sub">${dateLabel(e.date)}${e.bodyFat?' · MG '+e.bodyFat+'%':''}${e.muscleMass?' · MM '+e.muscleMass+'%':''}${e.note? ' · '+escapeHtml(e.note):''}</div></div>
        <button class="del" data-delw="${e.id}">✕</button>
      </div>`).join('')}
  </section>
  <section class="card">
    <h2>Objectif de poids</h2>
    <div class="row2">
      <div><label>Poids objectif (kg)</label><input id="pGoalWeight" type="number" step="0.1" value="${profile.goalWeight}"></div>
      <div><label>Rythme visé (kg/semaine)</label><input id="pRate" type="number" step="0.1" value="${profile.rate}" placeholder="-0.5 perte, +0.25 prise"></div>
    </div>
    <div class="hint">Négatif pour perdre du poids, positif pour en prendre. -0.5 à -1 kg/semaine pour une perte raisonnable ; +0.2 à +0.4 pour une prise propre.</div>
    <h2 style="margin-top:16px;">Ton profil (pour le calcul)</h2>
    <label>Sexe</label>
    <div class="seg" id="pSexSeg">
      <button data-sex="H" class="${profile.sex==='H'?'active':''}">Homme</button>
      <button data-sex="F" class="${profile.sex==='F'?'active':''}">Femme</button>
    </div>
    <div class="row2">
      <div><label>Âge</label><input id="pAge" type="number" value="${profile.age}"></div>
      <div><label>Taille (cm)</label><input id="pHeight" type="number" value="${profile.height}"></div>
    </div>
    <label>Niveau d'activité</label>
    <div class="seg" id="pActSeg">
      ${[['sedentaire','Sédentaire'],['leger','Léger'],['modere','Modéré'],['intense','Intense']].map(([k,l])=>`<button data-act="${k}" class="${profile.activity===k?'active':''}">${l}</button>`).join('')}
    </div>
    <button class="btn secondary" id="saveProfile">Enregistrer le profil et l'objectif</button>
  </section>
  ${!latest ? `<section class="card"><div class="empty">Ajoute une première pesée ci-dessus pour débloquer le calcul de tes objectifs quotidiens.</div></section>` :
    !goals ? `<section class="card"><div class="empty">Renseigne ton âge et ta taille pour calculer tes objectifs.</div></section>` :
    `<section class="card">
      <h2>Objectifs calculés (à partir de ${latest.weight} kg)</h2>
      <div class="trio">
        <div class="cell blue"><div class="k">Métabolisme (BMR)</div><div class="v">${goals.bmr}</div></div>
        <div class="cell green"><div class="k">Maintenance (TDEE)</div><div class="v">${goals.tdee}</div></div>
        <div class="cell rust"><div class="k">Objectif calculé</div><div class="v">${goals.targetKcal}</div></div>
      </div>
      <div class="trio">
        <div class="cell blue"><div class="k">Protéines</div><div class="v">${goals.proteinG}g</div></div>
        <div class="cell rust"><div class="k">Glucides</div><div class="v">${goals.carbG}g</div></div>
        <div class="cell green"><div class="k">Lipides</div><div class="v">${goals.fatG}g</div></div>
      </div>
      ${goals.warning? `<div class="hint" style="color:var(--rust); margin-top:10px;">${goals.warning}</div>` : ''}
      ${goals.weeksToGoal!=null && isFinite(goals.weeksToGoal) ? `<div class="hint" style="margin-top:10px;">À ce rythme, ~${Math.round(goals.weeksToGoal)} semaines pour atteindre ${profile.goalWeight} kg.</div>` : ''}
      <div class="hint" style="margin-top:10px;">Estimation basée sur la formule de Mifflin-St Jeor + 7700 kcal/kg. À ajuster si tu vois que ça ne correspond pas à ta réalité après 2-3 semaines.</div>
      <button class="btn rust" id="applyGoals">Appliquer à mes objectifs quotidiens</button>
    </section>`}
  `;
}

function viewNotes(){
  const todaysNotes = entriesFor(currentDate).filter(e=>e.type==='note').sort((a,b)=>a.time.localeCompare(b.time));
  const allNotes = logEntries.filter(e=>e.type==='note').sort((a,b)=> b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  return `
  ${dayBar()}
  <section class="card journal">
    <h2>Nouvelle note</h2>
    <textarea id="noteText" class="journal-textarea" placeholder="Une observation, un ressenti, un rappel pour toi…"></textarea>
    <button class="btn ghost" id="saveNote">Ajouter la note</button>
  </section>
  <section class="card journal">
    <h2>Notes de ce jour</h2>
    ${todaysNotes.length? todaysNotes.map(e=>`<div class="journal-entry">
        <div class="jdate">${e.time}</div><div class="jtext">${escapeHtml(e.text||'')}</div>
        <button class="jdel" data-del="${e.id}">✕</button>
      </div>`).join('') : '<div class="empty">Aucune note ce jour-là.</div>'}
  </section>
  <section class="card journal">
    <h2>Toutes tes notes</h2>
    ${allNotes.length? allNotes.map(e=>`<div class="journal-entry">
        <div class="jdate">${dateLabel(e.date)} · ${e.time}</div><div class="jtext">${escapeHtml(e.text||'')}</div>
        <button class="jdel" data-del="${e.id}">✕</button>
      </div>`).join('') : '<div class="empty">Ton carnet est vide pour l\'instant.</div>'}
  </section>`;
}

function viewHistory(){
  const days = [...new Set(logEntries.map(e=>e.date))].sort((a,b)=>b.localeCompare(a));
  const weeks = weeklyDeficits();
  if(!days.length) return `<h1 class="page-title">Historique</h1><div class="empty">Rien à afficher pour l'instant.</div>`;
  const weeklyCards = weeks.length ? `<div class="weekly-history-label">Déficit hebdomadaire</div>${weeks.map((week,index)=>weeklyDeficitCard(week,index===0 && week.start===weekStart(todayStr()))).join('')}` : '';
  return `<h1 class="page-title">Historique</h1>` + weeklyCards + `<div class="weekly-history-label">Jours détaillés</div>` + days.map(d=>{
    const t = dayTotals(d);
    const open = openHistDay===d;
    return `<div class="hist-day">
      <div class="hist-head" data-hist="${d}">
        <div class="d">${dateLabel(d)}</div>
        <div class="n">net ${Math.round(t.net)} / obj ${settings.calorieGoal}</div>
      </div>
      <div class="hist-body ${open?'open':''}">${dayLogList(d)}</div>
    </div>`;
  }).join('');
}

function viewSettings(){
  return `
  <h1 class="page-title">Réglages</h1>
  <section class="card">
    <h2>Objectifs quotidiens</h2>
    <label>Calories (kcal)</label>
    <input id="goalKcal" type="number" value="${settings.calorieGoal}">
    <div class="row2">
      <div><label>Protéines (g)</label><input id="goalP" type="number" value="${settings.proteinGoal}"></div>
      <div><label>Glucides (g)</label><input id="goalC" type="number" value="${settings.carbGoal}"></div>
    </div>
    <label>Lipides (g)</label>
    <input id="goalF" type="number" value="${settings.fatGoal}">
    <button class="btn" id="saveGoals">Enregistrer les objectifs</button>
  </section>
  <section class="card">
    <h2>Aliments personnalisés (${customFoods.length})</h2>
    ${customFoods.length? customFoods.map(f=>`<div class="list-entry">
      <div class="main"><div class="title">${escapeHtml(f.name)}</div><div class="sub">/100g · ${f.kcal} kcal · P${f.protein} G${f.carbs} L${f.fat}</div></div>
      <button class="del" data-editfood="${f.id}" style="color:var(--blue);">✎</button>
      <button class="del" data-delfood="${f.id}">✕</button>
    </div>`).join('') : '<div class="empty">Pas encore d\'aliment personnalisé.</div>'}
    ${Object.keys(foodOverrides).length? `<div class="hint" style="margin-top:10px;">${Object.keys(foodOverrides).length} aliment(s) de la base ont des valeurs modifiées par toi.</div>` : ''}
    <button class="btn ghost" id="addCustomFoodBtn2">+ Ajouter un aliment</button>
  </section>
  <section class="card">
    <h2>Préréglages de séances (${workoutPresets.length})</h2>
    ${workoutPresets.length? workoutPresets.map(p=>{
      const typeLbl = {tapis:'Tapis incliné',velo:'Vélo',renfo:'Renfo'}[p.type]||p.type;
      let paramSub = '';
      if(p.type==='tapis') paramSub = `${p.params.vitesse}km/h · ${p.params.pente}%`;
      else if(p.type==='velo') paramSub = `effort ${p.params.effort}`;
      else if(p.type==='renfo') paramSub = `intensité ${p.params.intensite}`;
      return `<div class="list-entry">
        <div class="main"><div class="title">${escapeHtml(p.name)}</div><div class="sub">${typeLbl} · ${paramSub}</div></div>
        <button class="del" data-delpreset="${p.id}">✕</button>
      </div>`;
    }).join('') : '<div class="empty">Pas encore de préréglage de séance.</div>'}
  </section>
  <section class="card">
    <h2>Tes données</h2>
    <div class="hint">Tout est stocké uniquement sur cet appareil, dans ce navigateur. Rien n'est envoyé nulle part. Exporte régulièrement pour avoir une sauvegarde.</div>
    <button class="btn secondary" id="exportBtn">Exporter mes données (.json)</button>
    <label>Importer une sauvegarde</label>
    <input id="importFile" type="file" accept="application/json">
    <button class="btn ghost" id="resetBtn" style="color:var(--rust); border-color:var(--rust);">Tout réinitialiser</button>
  </section>`;
}

function openModal(html){
  document.getElementById('modal-root').innerHTML = `<div class="modal-bg" id="modalBg"><div class="modal modal-wrap">
    <button class="close" id="modalClose">✕</button>${html}</div></div>`;
  document.getElementById('modalBg').addEventListener('click', e=>{ if(e.target.id==='modalBg') closeModal(); });
  document.getElementById('modalClose').addEventListener('click', closeModal);
}

function closeModal(){ document.getElementById('modal-root').innerHTML=''; }

function bindTabEvents(){
  const ttBtn = document.getElementById('themeToggle');
  if(ttBtn) ttBtn.onclick = ()=>{
    const dark=!document.body.classList.contains('dark');
    document.body.classList.toggle('dark',dark); LS.set('ct_theme',dark?'dark':'light');
    toast(dark?'Mode sombre activé 🌙':'Mode clair ☀️','success'); render();
  };
  document.querySelectorAll('[data-act="prevday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,-1); render(); });
  document.querySelectorAll('[data-act="nextday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,1); render(); });

  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    logEntries = logEntries.filter(e=>e.id!==b.dataset.del); save(); render();
  });

  if(activeTab==='meals'){
    const search = document.getElementById('foodsearch');
    if(search) search.addEventListener('input', e=>{
      // Keep the search input node mounted: re-rendering <main> here would
      // destroy/recreate it on every keystroke and make mobile keyboards flicker.
      mealSearchQ = e.target.value;
      const q = normalizeSearch(mealSearchQ.trim());
      let results = [];
      if(q.length){
        results = allFoods().filter(f=>normalizeSearch(f.name).includes(q));
        results.sort((a,b)=> (isFavorite(b.id)-isFavorite(a.id)) || a.name.localeCompare(b.name));
        results = results.slice(0,30);
      }
      const favFoods = favorites.map(id=>allFoods().find(f=>f.id===id)).filter(Boolean);
      const foodRow = f => `
        <div class="food-row" data-pick="${f.id}">
          <div><div class="fn">${escapeHtml(f.name)}</div><div class="fm">/100g · ${f.kcal} kcal · P${f.protein} G${f.carbs} L${f.fat}</div></div>
          <button class="star ${isFavorite(f.id)?'active':''}" data-fav="${f.id}" title="Favori">${isFavorite(f.id)?'★':'☆'}</button>
          <button class="edit" data-edit="${f.id}" title="Modifier les valeurs">✎</button>
        </div>`;
      const resultsNode = document.querySelector('#main .search-results');
      if(!resultsNode) return;
      resultsNode.innerHTML = q.length===0
        ? (favFoods.length ? `<div class="hint" style="margin:8px 0 2px;">Tes favoris</div>${favFoods.map(foodRow).join('')}` : '<div class="empty">Cherche un aliment, ou marque tes aliments récurrents en favoris (★) pour les retrouver ici direct.</div>')
        : (results.length ? results.map(foodRow).join('') : `<div class="empty">Aucun résultat. Tu peux l'ajouter en aliment perso ci-dessous.</div>`);
      bindMealResultEvents();
    });
    document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{ mealSlot=b.dataset.slot; render(); });
    bindMealResultEvents();
    const addBtn = document.getElementById('addCustomFoodBtn');
    if(addBtn) addBtn.onclick = openCustomFoodModal;
  }

  if(activeTab==='workouts'){
    const captureWorkoutForm = ()=>{
      if(wkType==='tapis'){
        wkParams.vitesse = document.getElementById('wkVitesse')?.value ?? wkParams.vitesse;
        wkParams.pente = document.getElementById('wkPente')?.value ?? wkParams.pente;
        if(wkTapisMode==='duree') wkDuration = document.getElementById('wkDuree')?.value ?? wkDuration;
        else wkSteps = document.getElementById('wkPas')?.value ?? wkSteps;
      } else if(wkType==='velo'){
        wkDuration = document.getElementById('wkDuree')?.value ?? wkDuration;
      } else if(wkType==='renfo'){
        wkDuration = document.getElementById('wkDuree')?.value ?? wkDuration;
        wkText = document.getElementById('wkText')?.value ?? wkText;
      } else if(wkType==='manuel'){
        wkText = document.getElementById('wkText')?.value ?? wkText;
        wkManualKcal = document.getElementById('wkKcal')?.value ?? wkManualKcal;
        wkDuration = document.getElementById('wkDurManual')?.value ?? wkDuration;
      }
    };

    document.querySelectorAll('#wkTypeSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkType=b.dataset.type; render(); });
    document.querySelectorAll('#wkTapisModeSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkTapisMode=b.dataset.mode; render(); });
    document.querySelectorAll('#wkVeloSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.effort=b.dataset.effort; render(); });
    document.querySelectorAll('#wkRenfoSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.intensite=b.dataset.int; render(); });
    const updateEstimate = ()=>{
      try{
        captureWorkoutForm();
        const w = getCurrentWeight();
        const num = document.getElementById('wkEstimateNum');
        const wrap = document.getElementById('wkEstimate');
        if(!num||!wrap) return;
        let kcal = 0;
        if(wkType==='manuel'){
          const k = parseFloat(wkManualKcal)||0;
          if(k>0){ kcal = k; }
          else{
            const est = estimateManualSession(wkText.trim(), parseFloat(wkDuration)||null, w);
            kcal = est.kcal;
          }
        } else {
          const dur = parseFloat(wkDuration)||0;
          let params = {};
          if(wkType==='tapis'){
            params = {vitesse: parseFloat(wkParams.vitesse)||0, pente: parseFloat(wkParams.pente)||0};
            if(wkTapisMode==='pas'){
              const steps = parseFloat(wkSteps)||0;
              if(steps>0 && params.vitesse>0 && profile.height){
                params.steps = steps;
              }
            }
          } else if(wkType==='velo'){
            params.effort = wkParams.effort;
          } else if(wkType==='renfo'){
            params.intensite = wkParams.intensite;
          }
          if(dur>0 && w) kcal = computeWorkoutKcal(wkType, params, dur, w);
        }
        num.textContent = kcal>0 ? Math.round(kcal) + ' kcal' : '—';
        wrap.classList.toggle('pulse', false);
        void wrap.offsetWidth; wrap.classList.add('pulse');
        num.classList.toggle('over', kcal > settings.calorieGoal);
      }catch(e){}
    };
    ['wkVitesse','wkPente','wkDuree','wkPas','wkText','wkKcal','wkDurManual'].forEach(id=>{
      const el = document.getElementById(id);
      if(el){ el.addEventListener('input', updateEstimate); el.addEventListener('change', updateEstimate); }
    });
    updateEstimate();


    document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
      const p = workoutPresets.find(x=>x.id===b.replace('-', '_').dataset.preset); if(!p) return;
      wkType = p.type;
      wkParams = {...wkParams, ...p.params};
      wkDuration = p.defaultDurationMin || '';
      wkTapisMode = 'duree';
      wkSteps = '';
      wkText = p.notes || '';
      render();
      toast('Préréglage chargé — confirme la durée');
    });

    const savePresetBtn = document.getElementById('savePresetBtn');
    if(savePresetBtn) savePresetBtn.onclick = ()=>{ captureWorkoutForm(); openPresetNameModal(); };

    const btn = document.getElementById('saveWorkout');
    if(btn) btn.onclick = ()=>{
      captureWorkoutForm();
      const weight = getCurrentWeight();
      const entry = {id:uid(), date:currentDate, type:'workout', wtype:wkType, time:new Date().toTimeString().slice(0,5)};
      if(wkType==='manuel'){
        let kcal = parseFloat(wkManualKcal)||0;
        entry.text = wkText.trim(); entry.duration = parseFloat(wkDuration)||null;
        if(kcal<=0){ const estimate=estimateManualSession(entry.text, entry.duration, weight);
          if(/circuit/i.test(entry.text) && !entry.duration){ toast("Pour un circuit sans durée, indique la durée plutôt que de l'inventer"); return; }
          kcal=estimate.kcal; entry.estimation=estimate;
        }
        if(kcal<=0){ toast('Indique une description, une durée ou les calories brûlées'); return; }
        entry.kcalBurned = kcal;
      } else {
        if(!weight){ toast("Renseigne ton poids dans l'onglet Poids d'abord"); return; }
        let duration = parseFloat(wkDuration)||0;
        let params = {};
        if(wkType==='tapis'){
          params = {vitesse: parseFloat(wkParams.vitesse)||0, pente: parseFloat(wkParams.pente)||0};
          if(!params.vitesse){ toast('Indique la vitesse'); return; }
          if(wkTapisMode==='pas'){
            const steps = parseFloat(wkSteps)||0;
            if(steps<=0){ toast('Indique le nombre de pas'); return; }
            if(!profile.height){ toast("Renseigne ta taille dans l'onglet Poids pour ce mode"); return; }
            duration = stepsToDurationMin(steps, params.vitesse, profile.height);
            entry.steps = steps;
          }
        } else if(wkType==='velo'){
          params = {effort: wkParams.effort};
        } else if(wkType==='renfo'){
          params = {intensite: wkParams.intensite};
          entry.text = wkText.trim();
        }
        if(duration<=0){ toast('Indique la durée'); return; }
        entry.params = params;
        entry.duration = Math.round(duration);
        entry.kcalBurned = computeWorkoutKcal(wkType, params, duration, weight);
      }
      logEntries.push(entry);
      save(); render(); toast('Séance enregistrée ✓');
    };
  }

  if(activeTab==='weight'){
    const saveW = document.getElementById('saveWeight');
    if(saveW) saveW.onclick = ()=>{
      const date = document.getElementById('wDate').value || todayStr();
      const weight = parseFloat(document.getElementById('wWeight').value);
      if(!weight || weight<=0){ toast('Indique un poids valide'); return; }
      weightEntries.push({
        id:uid(), date, weight,
        bodyFat: parseFloat(document.getElementById('wFat').value)||null,
        muscleMass: parseFloat(document.getElementById('wMuscle').value)||null,
        note: document.getElementById('wNote').value.trim()||null
      });
      save(); render(); toast('Pesée enregistrée ✓');
    };
    document.querySelectorAll('[data-delw]').forEach(b=>b.onclick=()=>{
      weightEntries = weightEntries.filter(e=>e.id!==b.dataset.delw); save(); render();
    });
    document.querySelectorAll('#pSexSeg button').forEach(b=>b.onclick=()=>{ profile.sex=b.dataset.sex; render(); });
    document.querySelectorAll('#pActSeg button').forEach(b=>b.onclick=()=>{ profile.activity=b.dataset.act; render(); });
    const saveProfile = document.getElementById('saveProfile');
    if(saveProfile) saveProfile.onclick = ()=>{
      profile.age = document.getElementById('pAge').value;
      profile.height = document.getElementById('pHeight').value;
      profile.goalWeight = document.getElementById('pGoalWeight').value;
      profile.rate = document.getElementById('pRate').value;
      save(); render(); toast('Profil et objectif enregistrés ✓');
    };
    const applyBtn = document.getElementById('applyGoals');
    if(applyBtn) applyBtn.onclick = ()=>{
      const latest = [...weightEntries].sort((a,b)=>b.date.localeCompare(a.date))[0];
      const goals = latest && computeGoals(profile, latest.weight);
      if(!goals) return;
      settings.calorieGoal = goals.targetKcal;
      settings.proteinGoal = goals.proteinG;
      settings.carbGoal = goals.carbG;
      settings.fatGoal = goals.fatG;
      save(); render(); toast('Objectifs quotidiens mis à jour ✓');
    };
  }

  if(activeTab==='notes'){
    const saveNoteBtn = document.getElementById('saveNote');
    if(saveNoteBtn) saveNoteBtn.onclick = ()=>{
      const text = document.getElementById('noteText').value.trim();
      if(!text){ toast('Écris quelque chose d\'abord'); return; }
      logEntries.push({id:uid(), date:currentDate, type:'note', text, time:new Date().toTimeString().slice(0,5)});
      save(); render(); toast('Note ajoutée ✓');
    };
  }

  if(activeTab==='todos'){
    const addTodo = ()=>{
      const input=document.getElementById('todoInput'); const text=input?.value.trim();
      if(!text){toast('Écris une tâche d’abord'); return;}
      todos.push({id:uid(), text, daily:!!document.getElementById('todoDaily')?.checked, done:false, completedDate:null});
      save(); render(); toast('Tâche ajoutée ✓');
    };
    document.getElementById('todoAdd')?.addEventListener('click',addTodo);
    document.getElementById('todoInput')?.addEventListener('keydown',e=>{if(e.key==='Enter') addTodo();});
    document.querySelectorAll('[data-todo-toggle]').forEach(b=>b.onchange=()=>{
      const t=todos.find(x=>x.id===b.dataset.todoToggle); if(!t)return;
      t.done=b.checked; t.completedDate=t.done?todayStr():null; save(); render();
    });
    document.querySelectorAll('[data-todo-delete]').forEach(b=>b.onclick=()=>{todos=todos.filter(t=>t.id!==b.dataset.todoDelete);save();render();toast('Tâche supprimée');});
    document.querySelectorAll('[data-todo-edit]').forEach(b=>b.onclick=()=>{
      const t=todos.find(x=>x.id===b.dataset.todoEdit); if(!t)return;
      const text=prompt('Modifier la tâche',t.text); if(text===null)return;
      const clean=text.trim(); if(!clean){toast('La tâche ne peut pas être vide');return;} t.text=clean; save(); render();
    });
  }

  if(activeTab==='history'){
    document.querySelectorAll('[data-hist]').forEach(h=>h.onclick=()=>{
      openHistDay = openHistDay===h.dataset.hist ? null : h.dataset.hist; render();
    });
  }

  if(activeTab==='settings'){
    document.getElementById('saveGoals').onclick=()=>{
      settings.calorieGoal = parseFloat(document.getElementById('goalKcal').value)||settings.calorieGoal;
      settings.proteinGoal = parseFloat(document.getElementById('goalP').value)||0;
      settings.carbGoal = parseFloat(document.getElementById('goalC').value)||0;
      settings.fatGoal = parseFloat(document.getElementById('goalF').value)||0;
      save(); toast('Objectifs enregistrés ✓');
    };
    const addBtn2 = document.getElementById('addCustomFoodBtn2');
    if(addBtn2) addBtn2.onclick = openCustomFoodModal;
    document.querySelectorAll('[data-delfood]').forEach(b=>b.onclick=()=>{
      customFoods = customFoods.filter(f=>f.id!==b.dataset.delfood); save(); render();
    });
    document.querySelectorAll('[data-editfood]').forEach(b=>b.onclick=()=>{
      const f = customFoods.find(x=>x.id===b.replace('-', '_').dataset.editfood); if(f) openEditFoodModal(f);
    });
    document.querySelectorAll('[data-delpreset]').forEach(b=>b.onclick=()=>{
      workoutPresets = workoutPresets.filter(p=>p.id!==b.dataset.delpreset); save(); render();
    });
    document.getElementById('exportBtn').onclick = ()=>{
      const blob = new Blob([JSON.stringify({settings,customFoods,foodOverrides,favorites,weightEntries,profile,workoutPresets,logEntries,todos},null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download = `carnet-sauvegarde-${todayStr()}.json`; a.click();
      URL.revokeObjectURL(url);
    };
    document.getElementById('importFile').onchange = (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          if(data.settings) settings = data.settings;
          if(data.customFoods) customFoods = data.customFoods;
          if(data.foodOverrides) foodOverrides = data.foodOverrides;
          if(data.favorites) favorites = data.favorites;
          if(data.weightEntries) weightEntries = data.weightEntries;
          if(data.profile) profile = data.profile;
          if(data.workoutPresets) workoutPresets = data.workoutPresets;
          if(data.logEntries) logEntries = data.logEntries;
          if(data.todos) todos = data.todos;
          save(); render(); toast('Import réussi ✓');
        }catch(err){ toast('Fichier invalide'); }
      };
      reader.readAsText(file);
    };
    document.getElementById('resetBtn').onclick = ()=>{
      if(confirm('Tout supprimer ? Cette action est irréversible.')){
        settings = {calorieGoal:2200, proteinGoal:150, carbGoal:220, fatGoal:70};
        customFoods = []; foodOverrides = {}; favorites = []; weightEntries = [];
        profile = {sex:'H', age:'', height:'', activity:'modere', goalWeight:'', rate:'-0.5'};
        workoutPresets = [];
        logEntries = []; todos = []; save(); render(); toast('Données réinitialisées');
      }
    };
  }
}

document.getElementById('tabs').addEventListener('click', e=>{
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  activeTab = b.dataset.tab; render();
});

function applyTheme(){
  const theme = LS.get('ct_theme', 'light');
  document.body.classList.toggle('dark', theme==='dark');
}