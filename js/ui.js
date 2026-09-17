function openModal(html){
  document.getElementById('modal-root').innerHTML = `<div class="modal-bg" id="modalBg"><div class="modal modal-wrap">
    <button class="close" id="modalClose">✕</button>${html}</div></div>`;
  document.getElementById('modalBg').addEventListener('click', e=>{ if(e.target.id==='modalBg') closeModal(); });
  document.getElementById('modalClose').addEventListener('click', closeModal);
}
function closeModal(){
  const bg = document.getElementById('modalBg');
  if(!bg){ document.getElementById('modal-root').innerHTML=''; return; }
  bg.classList.add('closing');
  // Laisse l'animation de fermeture jouer avant de vider le DOM. Si une nouvelle
  // modale a entre-temps remplacé modalBg (ex. scanner : fermeture immédiatement
  // suivie d'une réouverture), la référence ne correspond plus et on ne touche à rien.
  setTimeout(()=>{
    if(document.getElementById('modalBg') === bg) document.getElementById('modal-root').innerHTML='';
  }, 180);
}

/* ===================== BOUTON + FLOTTANT (accès rapide, tous onglets) ===================== */
// Sheet de raccourcis vers les flux d'ajout déjà existants (repas/IA/scan/séance/
// pesée) : ne duplique aucune logique, se contente de fermer la sheet puis de
// rouvrir la modale existante ou de basculer vers l'onglet concerné — même pattern
// que le reste de l'appli (closeModal() avant de rouvrir/render, cf. scanner.js).
function openFabMenu(){
  openModal(`
    <h3>Ajouter</h3>
    <div class="fab-menu">
      <button class="fab-menu-item" id="fabMeal" type="button">
        <span class="fmi-ico">🍽️</span><span class="fmi-txt"><b>Repas</b><small>Chercher un aliment</small></span>
      </button>
      <button class="fab-menu-item" id="fabAi" type="button">
        <span class="fmi-ico">🤖</span><span class="fmi-txt"><b>Décrire un repas</b><small>Estimation par IA</small></span>
      </button>
      <button class="fab-menu-item" id="fabScan" type="button">
        <span class="fmi-ico">📷</span><span class="fmi-txt"><b>Scanner</b><small>Code-barres produit</small></span>
      </button>
      <button class="fab-menu-item" id="fabRecipeImport" type="button">
        <span class="fmi-ico">🎬</span><span class="fmi-txt"><b>Importer une recette</b><small>Depuis un lien TikTok</small></span>
      </button>
      <button class="fab-menu-item" id="fabWorkout" type="button">
        <span class="fmi-ico">🏃</span><span class="fmi-txt"><b>Séance</b><small>Tapis, vélo, sport…</small></span>
      </button>
      <button class="fab-menu-item" id="fabWeight" type="button">
        <span class="fmi-ico">⚖️</span><span class="fmi-txt"><b>Pesée</b><small>Poids du jour</small></span>
      </button>
    </div>
  `);
  document.getElementById('fabMeal').onclick = ()=>{
    closeModal(); switchTab('meals');
    setTimeout(()=>document.getElementById('foodsearch')?.focus(), 0);
  };
  document.getElementById('fabAi').onclick = ()=>{ closeModal(); openAIDescribeModal(); };
  document.getElementById('fabScan').onclick = ()=>{ closeModal(); openScannerModal(); };
  document.getElementById('fabRecipeImport').onclick = ()=>{ closeModal(); openRecipeImportModal(); };
  document.getElementById('fabWorkout').onclick = ()=>{ closeModal(); switchTab('workouts'); };
  document.getElementById('fabWeight').onclick = ()=>{
    closeModal(); switchTab('weight');
    setTimeout(()=>document.getElementById('wWeight')?.focus(), 0);
  };
}

// Survol des graphiques (onglet Poids) : crosshair + tooltip listant chaque série au point le plus proche.
function bindChartHover(wrapId, points, seriesDefs){
  const wrap = document.getElementById(wrapId);
  if(!wrap || !points || points.length<2) return;
  const svg = wrap.querySelector('svg');
  const hit = wrap.querySelector('.chart-hit');
  const cross = wrap.querySelector('.chart-crosshair');
  const tip = wrap.querySelector('.chart-tooltip');
  if(!svg || !hit || !cross || !tip) return;
  const n = points.length;
  const move = clientX=>{
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX-rect.left)/rect.width)*CHART_W;
    let idx=0, best=Infinity;
    for(let i=0;i<n;i++){ const d=Math.abs(chartXFor(i,n)-relX); if(d<best){best=d; idx=i;} }
    const x = chartXFor(idx,n).toFixed(1);
    cross.setAttribute('x1',x); cross.setAttribute('x2',x); cross.style.opacity='1';
    const p = points[idx];
    const rows = seriesDefs.map(s=> p[s.key]!=null ? `<div class="row"><span class="key"><i class="dot" style="background:${s.color}"></i>${s.label}</span><span class="val">${p[s.key]}${s.unit||''}</span></div>` : '').join('');
    tip.innerHTML = `<div class="date">${dateLabel(p.date)}</div>${rows}`;
    tip.style.display='block';
    const px = (chartXFor(idx,n)/CHART_W)*rect.width;
    const tipW = tip.offsetWidth||110;
    tip.style.left = Math.min(Math.max(px-tipW/2,4), rect.width-tipW-4)+'px';
  };
  hit.addEventListener('pointermove', e=>move(e.clientX));
  hit.addEventListener('pointerdown', e=>move(e.clientX));
  hit.addEventListener('pointerleave', ()=>{ tip.style.display='none'; cross.style.opacity='0'; });
}

function openQtyModal(food){
  // Portion habituelle (brique 9A) : préremplissage discret uniquement — pas de
  // label ("quantité habituelle"), pas de badge. Une suggestion silencieuse,
  // pas une affirmation ; l'utilisateur modifie librement, et la confirmation
  // enregistre toujours source:'manual' (voir plus bas) — 'recurring' reste
  // réservé au flow Quick-add de repas récurrents, une portion suggérée ici
  // n'en fait pas une "vérité" différente d'une saisie manuelle normale.
  const typical = typicalGramsFor(food.id);
  const defaultGrams = typical!=null ? Math.round(typical) : 100;
  // Kalo Calibration — "portion reveal" (voir discussion produit) : la toute
  // première fois qu'une portion RÉELLEMENT personnalisée est proposée (jamais
  // sur le repli 100g), un mot explicite. Une seule fois pour cette capacité,
  // tous aliments confondus (pas par aliment) — marqué vu dès l'affichage, pas
  // à la confirmation, pour ne jamais le réafficher même si l'utilisateur
  // ferme sans valider.
  const showPortionReveal = typical!=null && !portionRevealSeen;
  if(showPortionReveal){ portionRevealSeen = true; save(); }
  openModal(`
    <h3>${escapeHtml(food.name)}</h3>
    <div class="hint">Valeurs pour 100 g : ${food.kcal} kcal · P${food.protein} G${food.carbs} L${food.fat}</div>
    <label>Quantité</label>
    <div class="seg"><button type="button" id="qtyGrams" class="active">Grammes</button><button type="button" id="qtyPortions">Portions (${escapeHtml(food.serving_label||((food.serving_g||100)+" g"))})</button></div>
    <input id="qtyInput" type="number" inputmode="numeric" value="${defaultGrams}" autofocus>
    ${showPortionReveal ? `<div class="portion-reveal">Kalo a appris ta quantité habituelle.<br>${defaultGrams} g proposés à partir de tes précédentes saisies.</div>` : ''}
    <div class="qty-preview" id="qtyPreview"></div>
    <button class="btn" id="qtyConfirm">Ajouter à ${mealSlot}</button>
  `);
  let qtyMode='g';
  document.getElementById('qtyGrams').onclick=()=>{qtyMode='g';document.getElementById('qtyGrams').classList.add('active');document.getElementById('qtyPortions').classList.remove('active');};
  document.getElementById('qtyPortions').onclick=()=>{qtyMode='portion';document.getElementById('qtyPortions').classList.add('active');document.getElementById('qtyGrams').classList.remove('active');};
  const updatePreview = ()=>{
    const g = (parseFloat(document.getElementById('qtyInput').value)||0) * (qtyMode==='portion'?(food.serving_g||100):1);
    const f = g/100;
    document.getElementById('qtyPreview').innerHTML = `
      <div class="item"><div class="n">${Math.round(food.kcal*f)}</div><div class="l">kcal</div></div>
      <div class="item"><div class="n">${Math.round(food.protein*f)}</div><div class="l">prot g</div></div>
      <div class="item"><div class="n">${Math.round(food.carbs*f)}</div><div class="l">gluc g</div></div>
      <div class="item"><div class="n">${Math.round(food.fat*f)}</div><div class="l">lip g</div></div>`;
  };
  document.getElementById('qtyInput').addEventListener('input', updatePreview);
  updatePreview();
  document.getElementById('qtyConfirm').addEventListener('click', ()=>{
    const g = (parseFloat(document.getElementById('qtyInput').value)||0) * (qtyMode==='portion'?(food.serving_g||100):1);
    if(g<=0){ toast('Entre une quantité valide'); return; }
    const f = g/100;
    logEntries.push({
      id:uid(), date:currentDate, type:'meal', mealSlot, foodId:food.id, foodName:food.name, grams:g,
      kcal:food.kcal*f, protein:food.protein*f, carbs:food.carbs*f, fat:food.fat*f,
      time:new Date().toTimeString().slice(0,5), source:'manual'
    });
    save(); closeModal(); mealSearchQ=''; render(); toast('Ajouté ✓');
  });
}

// Quick-add : reprend un repas détecté comme récurrent (js/core.js:
// buildQuickAddDraft()) et propose de le reloguer en un geste. Volontairement
// une confirmation, pas un ajout automatique en un tap ("quick-add = rapide,
// pas automatique et opaque") : quantités éditables, totaux visibles avant
// validation. Chaque confirmation crée des entrées `logEntries` neuves et
// indépendantes (source:'recurring') — ne touche jamais aux entrées passées
// qui ont servi à détecter le pattern.
function openQuickAddModal(draft){
  const rows = draft.items.map((it,idx)=>`
    <div class="quickadd-item">
      <div class="qa-name">${escapeHtml(it.food.name)}</div>
      <div class="qa-qty"><input type="number" inputmode="numeric" class="qaGrams" data-qaidx="${idx}" value="${it.grams}"><span class="qa-unit">g</span></div>
    </div>`).join('');
  openModal(`
    <h3>Ajouter ce repas</h3>
    <div class="hint">Un repas que tu manges souvent (${escapeHtml(draft.mealSlot)}). Quantités modifiables avant ajout.</div>
    <div class="quickadd-list">${rows}</div>
    <div class="qty-preview" id="qaPreview"></div>
    <button class="btn" id="qaConfirm">Ajouter le repas</button>
  `);
  const updatePreview = ()=>{
    let kcal=0, protein=0, carbs=0, fat=0;
    document.querySelectorAll('.qaGrams').forEach(inp=>{
      const it = draft.items[+inp.dataset.qaidx];
      const g = Math.max(0, parseFloat(inp.value)||0);
      const f = g/100;
      kcal += it.food.kcal*f; protein += it.food.protein*f; carbs += it.food.carbs*f; fat += it.food.fat*f;
    });
    document.getElementById('qaPreview').innerHTML = `
      <div class="item"><div class="n">${Math.round(kcal)}</div><div class="l">kcal</div></div>
      <div class="item"><div class="n">${Math.round(protein)}</div><div class="l">prot g</div></div>
      <div class="item"><div class="n">${Math.round(carbs)}</div><div class="l">gluc g</div></div>
      <div class="item"><div class="n">${Math.round(fat)}</div><div class="l">lip g</div></div>`;
  };
  document.querySelectorAll('.qaGrams').forEach(inp=>inp.addEventListener('input', updatePreview));
  updatePreview();
  document.getElementById('qaConfirm').addEventListener('click', ()=>{
    const time = new Date().toTimeString().slice(0,5);
    let added = 0;
    document.querySelectorAll('.qaGrams').forEach(inp=>{
      const it = draft.items[+inp.dataset.qaidx];
      const g = parseFloat(inp.value)||0;
      if(g<=0) return;
      const f = g/100;
      logEntries.push({
        id:uid(), date:currentDate, type:'meal', mealSlot:draft.mealSlot, foodId:it.food.id, foodName:it.food.name, grams:g,
        kcal:it.food.kcal*f, protein:it.food.protein*f, carbs:it.food.carbs*f, fat:it.food.fat*f,
        time, source:'recurring'
      });
      added++;
    });
    if(!added){ toast('Entre au moins une quantité valide'); return; }
    save(); closeModal(); render(); toast('Repas ajouté ✓');
  });
}

function openCustomFoodModal(){
  let mode = '100';
  openModal(`
    <h3>Aliment personnalisé</h3>
    <div class="hint">Saisis les valeurs telles qu'affichées sur l'étiquette — pour 100 g ou pour une portion, l'appli convertit automatiquement en valeurs /100g.</div>
    <label>Nom</label><input id="cfName" type="text" placeholder="ex. Poke bowl maison">
    <label>Les valeurs saisies ci-dessous sont</label>
    <div class="seg" id="cfModeSeg">
      <button data-mode="100" class="active">Pour 100 g</button>
      <button data-mode="portion">Pour 1 portion</button>
    </div>
    <div id="cfPortionWrap" style="display:none;">
      <label>Taille de la portion (g)</label>
      <input id="cfPortionSize" type="number" placeholder="ex. 30">
    </div>
    <div class="row2">
      <div><label>Calories</label><input id="cfKcal" type="number"></div>
      <div><label>Protéines (g)</label><input id="cfP" type="number"></div>
    </div>
    <div class="row2">
      <div><label>Glucides (g)</label><input id="cfC" type="number"></div>
      <div><label>Lipides (g)</label><input id="cfF" type="number"></div>
    </div>
    <button class="btn" id="cfSave">Enregistrer l'aliment</button>
  `);
  document.querySelectorAll('#cfModeSeg button').forEach(b=>b.onclick=()=>{
    mode = b.dataset.mode;
    document.querySelectorAll('#cfModeSeg button').forEach(x=>x.classList.toggle('active', x===b));
    document.getElementById('cfPortionWrap').style.display = mode==='portion' ? 'block' : 'none';
  });
  document.getElementById('cfSave').onclick = ()=>{
    const name = document.getElementById('cfName').value.trim();
    if(!name){ toast('Donne un nom à l\'aliment'); return; }
    let kcal = parseFloat(document.getElementById('cfKcal').value)||0;
    let protein = parseFloat(document.getElementById('cfP').value)||0;
    let carbs = parseFloat(document.getElementById('cfC').value)||0;
    let fat = parseFloat(document.getElementById('cfF').value)||0;
    if(mode==='portion'){
      const portionG = parseFloat(document.getElementById('cfPortionSize').value)||0;
      if(portionG<=0){ toast('Indique la taille de la portion'); return; }
      const ratio = 100/portionG;
      kcal*=ratio; protein*=ratio; carbs*=ratio; fat*=ratio;
    }
    const f = { id:'c'+uid(), name, kcal:Math.round(kcal*10)/10, protein:Math.round(protein*10)/10, carbs:Math.round(carbs*10)/10, fat:Math.round(fat*10)/10 };
    customFoods.unshift(f); save(); closeModal(); render(); toast('Aliment ajouté ✓');
  };
}

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
    else if(wkType==='sport') params = {sport:wkParams.sport, sportIntensity:wkParams.sportIntensity};
    else if(wkType==='club') params = {sport:wkParams.sport, clubLevel:wkParams.clubLevel, clubMode:wkParams.clubMode, enduranceIntensity:wkParams.enduranceIntensity};
    workoutPresets.unshift({
      id:'wp'+uid(), name, type:wkType, params,
      defaultDurationMin: wkDuration || null,
      notes: null
    });
    save(); closeModal(); render(); toast('Préréglage enregistré ✓');
  };
}

function openEditFoodModal(food){
  const isBuiltin = food.id.startsWith('b');
  openModal(`
    <h3>Modifier les valeurs</h3>
    <div class="hint">Pour 100 g. ${isBuiltin? "Tes valeurs perso remplaceront celles par défaut, uniquement pour toi.":"C'est un aliment que tu as toi-même créé."}</div>
    <label>Nom</label><input id="efName" type="text" value="${escapeHtml(food.name)}">
    <div class="row2">
      <div><label>Calories</label><input id="efKcal" type="number" value="${food.kcal}"></div>
      <div><label>Protéines (g)</label><input id="efP" type="number" value="${food.protein}"></div>
    </div>
    <div class="row2">
      <div><label>Glucides (g)</label><input id="efC" type="number" value="${food.carbs}"></div>
      <div><label>Lipides (g)</label><input id="efF" type="number" value="${food.fat}"></div>
    </div>
    <button class="btn" id="efSave">Enregistrer</button>
    ${isBuiltin? `<button class="btn ghost" id="efReset">Réinitialiser aux valeurs par défaut</button>` : ''}
  `);
  document.getElementById('efSave').onclick = ()=>{
    const updated = {
      name: document.getElementById('efName').value.trim() || food.name,
      kcal: parseFloat(document.getElementById('efKcal').value)||0,
      protein: parseFloat(document.getElementById('efP').value)||0,
      carbs: parseFloat(document.getElementById('efC').value)||0,
      fat: parseFloat(document.getElementById('efF').value)||0,
    };
    if(isBuiltin){
      foodOverrides[food.id] = updated;
    }else{
      const idx = customFoods.findIndex(x=>x.id===food.id);
      if(idx>-1) customFoods[idx] = {...customFoods[idx], ...updated};
    }
    save(); closeModal(); render(); toast('Valeurs mises à jour ✓');
  };
  if(isBuiltin){
    document.getElementById('efReset').onclick = ()=>{
      delete foodOverrides[food.id]; save(); closeModal(); render(); toast('Valeurs par défaut restaurées');
    };
  }
}

/* Bind controls inside the meal search results without touching the search input. */
function bindMealResultEvents(){
  document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    const f = allFoods().find(x=>x.id===b.dataset.pick); if(f) openQtyModal(f);
  });
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=(e)=>{
    e.stopPropagation();
    const f = allFoods().find(x=>x.id===b.dataset.edit); if(f) openEditFoodModal(f);
  });
  document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=(e)=>{
    e.stopPropagation();
    toggleFavorite(b.dataset.fav); render();
  });
  const favToggle = document.querySelector('[data-toggle="favorites"]');
  if(favToggle) favToggle.onclick = ()=>{ openFavorites = !openFavorites; render(); };
}

// Aligne la semaine active du bandeau de dates (js/core.js: dateStrip()) sur le
// bord de son conteneur scrollable (scroll-snap-align:start côté CSS, voir
// .ds-week) — ne peut pas se faire en CSS pur au premier rendu. Appelé à chaque
// render() via bindTabEvents(), sans effet si le bandeau n'est pas dans la page
// courante.
function centerDateStrip(){
  const scrollEl = document.getElementById('dateStripScroll');
  if(!scrollEl) return;
  const weekEl = scrollEl.querySelector(`.ds-week[data-weekstart="${weekStart(currentDate)}"]`);
  if(!weekEl) return;
  scrollEl.scrollLeft = weekEl.offsetLeft;
}

/* ===================== ÉVÉNEMENTS ===================== */
function bindTabEvents(){
  const ttBtn = document.getElementById('themeToggle');
  if(ttBtn) ttBtn.onclick = ()=>{
    const dark=!document.body.classList.contains('dark');
    document.body.classList.toggle('dark',dark); LS.set('ct_theme',dark?'dark':'light');
    toast(dark?'Mode sombre activé 🌙':'Mode clair ☀️','success'); render();
  };
  // Blocs cliquables du dashboard (js/core.js: dashCard()) : même mécanisme de
  // navigation que l'ancienne barre d'onglets, juste posé sur #main au lieu de
  // #tabs (ces boutons n'existent que sur la page "today").
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  document.querySelectorAll('[data-act="prevday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,-1); render(); });
  document.querySelectorAll('[data-act="nextday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,1); render(); });
  document.querySelectorAll('[data-jumpdate]').forEach(b=>b.onclick=()=>{ currentDate=b.dataset.jumpdate; render(); });
  centerDateStrip();
  // Libellé du bandeau de dates (ex. "Aujourd'hui") : ouvre le calendrier natif
  // pour sauter directement à une date lointaine, sans faire défiler le ruban.
  const dsLabel = document.getElementById('dateStripLabel');
  const dsPicker = document.getElementById('dateStripPicker');
  if(dsLabel && dsPicker){
    dsLabel.onclick = ()=>{
      try{ dsPicker.showPicker ? dsPicker.showPicker() : dsPicker.focus(); }
      catch{ dsPicker.focus(); }
    };
    dsPicker.onchange = ()=>{ if(dsPicker.value){ currentDate = dsPicker.value; render(); } };
  }

  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    logEntries = logEntries.filter(e=>e.id!==b.dataset.del); save(); render();
  });
  document.querySelectorAll('[data-quickadd]').forEach(b=>b.onclick=()=>{
    const insight = getInsightById(b.dataset.quickadd);
    const draft = insight ? buildQuickAddDraft(insight) : null;
    if(!draft){ toast('Plus assez de données pour ce repas'); return; }
    openQuickAddModal(draft);
  });
  const dismissCalibration = document.querySelector('[data-dismiss-calibration]');
  if(dismissCalibration) dismissCalibration.onclick = ()=>{ calibrationSeen = true; save(); render(); };

  // Badge "Point de départ" du dashboard (Brique 11) : va sur l'onglet Poids
  // et scrolle jusqu'à la carte "Objectif de poids" existante, sans nouvelle
  // modale ni formulaire dupliqué. setTimeout(0) après switchTab() car
  // switchTab() remet toujours le scroll à 0 juste après son propre render()
  // (voir commentaire sur switchTab) — même pattern que obGoToMeal ci-dessus.
  const goalBadgeLink = document.querySelector('[data-goal-badge-link]');
  if(goalBadgeLink) goalBadgeLink.onclick = ()=>{
    switchTab('weight');
    setTimeout(()=>document.getElementById('weightGoalCard')?.scrollIntoView({behavior:'smooth', block:'start'}), 0);
  };

  // Day 0 — onboarding minimal. Le toggle sexe ne déclenche PAS render() (contrairement
  // à son équivalent dans l'onglet Poids) : un render() ici regénérerait le formulaire
  // depuis viewOnboarding() et effacerait poids/âge/taille déjà tapés, qui ne sont pas
  // des variables live comme mealSearchQ — même pattern que qtyGrams/qtyPortions dans
  // openQtyModal() pour la même raison.
  const obSexSeg = document.getElementById('obSexSeg');
  if(obSexSeg) obSexSeg.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    obSexSeg.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
  const obSubmit = document.getElementById('obSubmit');
  if(obSubmit) obSubmit.onclick = ()=>{
    const weight = parseFloat(document.getElementById('obWeight').value);
    const age = document.getElementById('obAge').value;
    const height = document.getElementById('obHeight').value;
    const sex = document.querySelector('#obSexSeg button.active').dataset.sex;
    if(!weight || weight<=0){ toast('Indique un poids valide'); return; }
    // Valide sur un profil temporaire avant toute mutation réelle : un
    // formulaire invalide ne doit rien enregistrer (ni profil ni pesée ni
    // objectifs) — computeGoals() repris tel quel, aucune nouvelle règle.
    const goals = computeGoals({...profile, age, height, sex}, weight);
    if(!goals){ toast('Indique ton âge et ta taille'); return; }
    profile.age = age; profile.height = height; profile.sex = sex;
    weightEntries.push({ id:uid(), date:todayStr(), weight, bodyFat:null, muscleMass:null, water:null, note:null });
    settings.calorieGoal = goals.targetKcal;
    settings.proteinGoal = goals.proteinG;
    settings.carbGoal = goals.carbG;
    settings.fatGoal = goals.fatG;
    save();
    showOnboardingConfirm = true;
    render();
  };
  const obGoToMeal = document.getElementById('obGoToMeal');
  if(obGoToMeal) obGoToMeal.onclick = ()=>{
    showOnboardingConfirm = false;
    switchTab('meals');
    setTimeout(()=>document.getElementById('foodsearch')?.focus(), 0);
  };

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
      const foodRow = f => `
        <div class="food-row" data-pick="${f.id}">
          <div><div class="fn">${escapeHtml(f.name)}</div><div class="fm">/100g · ${f.kcal} kcal · P${f.protein} G${f.carbs} L${f.fat}</div></div>
          <button class="star ${isFavorite(f.id)?'active':''}" data-fav="${f.id}" title="Favori">${isFavorite(f.id)?'★':'☆'}</button>
          <button class="edit" data-edit="${f.id}" title="Modifier les valeurs">✎</button>
        </div>`;
      const resultsNode = document.querySelector('#main .search-results');
      if(!resultsNode) return;
      resultsNode.innerHTML = q.length===0
        ? (favoritesSection() || '<div class="empty">Cherche un aliment, ou marque tes aliments récurrents en favoris (★) pour les retrouver ici direct.</div>')
        : (results.length ? results.map(foodRow).join('') : `<div class="empty">Aucun résultat. Tu peux l'ajouter en aliment perso ci-dessous.</div>`);
      bindMealResultEvents();
    });
    document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{ mealSlot=b.dataset.slot; render(); });
    // Raccourci "Repas fréquent" (brique 9B) : distinct du CTA des Insights
    // dashboard (data-quickadd + getInsightById, soumis au cooldown 4j) — ici
    // recalculé à chaque rendu, jamais masqué par un cooldown, puisque c'est
    // un raccourci utilitaire permanent et non une observation ponctuelle.
    // Réutilise buildQuickAddDraft()/openQuickAddModal() sans modification.
    document.querySelectorAll('[data-quickaddslot]').forEach(b=>b.onclick=()=>{
      const pattern = frequentMealFor(b.dataset.quickaddslot);
      const draft = pattern ? buildQuickAddDraft(pattern) : null;
      if(!draft){ toast('Plus assez de données pour ce repas'); return; }
      openQuickAddModal(draft);
    });
    bindMealResultEvents();
    const addBtn = document.getElementById('addCustomFoodBtn');
    if(addBtn) addBtn.onclick = openCustomFoodModal;
    const scanBtn = document.getElementById('scanBarcodeBtn');
    if(scanBtn) scanBtn.onclick = openScannerModal;
    const aiBtn = document.getElementById('aiDescribeBtn');
    if(aiBtn) aiBtn.onclick = openAIDescribeModal;
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
      } else if(wkType==='sport'){
        wkParams.sport = document.getElementById('wkSport')?.value ?? wkParams.sport;
        wkDuration = document.getElementById('wkDuree')?.value ?? wkDuration;
      } else if(wkType==='club'){
        wkParams.sport = document.getElementById('wkSport')?.value ?? wkParams.sport;
        wkDuration = document.getElementById('wkDuree')?.value ?? wkDuration;
      }
    };

    document.querySelectorAll('#wkTypeSeg button').forEach(b=>b.onclick=()=>{
      if(b.dataset.type==='ia'){ openWorkoutImportModal(); return; }
      captureWorkoutForm();
      wkType = b.dataset.type;
      // Bloc favori : pré-remplit le sport/niveau associé, pour ne pas avoir à le
      // rechercher à nouveau dans le select à chaque séance.
      if(b.dataset.favKey){
        const fav = favSports.find(f=>favSportKey(f)===b.dataset.favKey);
        if(fav && fav.type==='sport') wkParams.sport = fav.sport;
        else if(fav && fav.type==='club'){ wkParams.sport = fav.sport; wkParams.clubLevel = fav.level; }
      }
      render();
    });
    const favToggleBtn = document.getElementById('wkFavToggle');
    if(favToggleBtn) favToggleBtn.onclick = ()=>{ captureWorkoutForm(); const fav = currentWkFav(); if(fav) toggleFavSport(fav); render(); };
    document.querySelectorAll('#wkTapisModeSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkTapisMode=b.dataset.mode; render(); });
    document.querySelectorAll('#wkVeloSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.effort=b.dataset.effort; render(); });
    document.querySelectorAll('#wkSportIntSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.sportIntensity=b.dataset.int; render(); });
    const clubLevelSel = document.getElementById('wkClubLevel');
    if(clubLevelSel) clubLevelSel.addEventListener('change', ()=>{ captureWorkoutForm(); wkParams.clubLevel=clubLevelSel.value; updateEstimate(); });
    document.querySelectorAll('#wkClubModeSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.clubMode=b.dataset.clubmode; render(); });
    document.querySelectorAll('#wkEnduranceIntSeg button').forEach(b=>b.onclick=()=>{ captureWorkoutForm(); wkParams.enduranceIntensity=b.dataset.eint; render(); });
    // En mode club, changer de sport doit re-render (pas juste recalculer) : les
    // libellés de niveau (#wkClubLevel) sont spécifiques à chaque discipline
    // (CLUB_LEVELS dans core.js) et doivent être regénérés pour le nouveau sport.
    if(wkType==='club'){
      const clubSportSel = document.getElementById('wkSport');
      if(clubSportSel) clubSportSel.addEventListener('change', ()=>{ captureWorkoutForm(); wkParams.sport=clubSportSel.value; render(); });
    }
    const updateEstimate = ()=>{
      try{
        captureWorkoutForm();
        const w = getCurrentWeight();
        const num = document.getElementById('wkEstimateNum');
        const wrap = document.getElementById('wkEstimate');
        if(!num||!wrap) return;
        let kcal = 0;
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
        } else if(wkType==='sport'){
          params.sport = wkParams.sport; params.intensity = wkParams.sportIntensity;
        } else if(wkType==='club'){
          params.sport = wkParams.sport; params.level = wkParams.clubLevel; params.mode = wkParams.clubMode; params.enduranceIntensity = wkParams.enduranceIntensity;
        }
        if(dur>0 && w) kcal = computeWorkoutKcal(wkType, params, dur, w);
        num.textContent = kcal>0 ? Math.round(kcal) + ' kcal' : '—';
        wrap.classList.toggle('pulse', false);
        void wrap.offsetWidth; wrap.classList.add('pulse');
        num.classList.toggle('over', kcal > settings.calorieGoal);
      }catch(e){}
    };
    // wkSport en mode club est câblé séparément ci-dessus (doit re-render, pas juste
    // recalculer, pour régénérer les libellés de niveau propres au sport choisi).
    ['wkVitesse','wkPente','wkDuree','wkPas', ...(wkType==='club' ? [] : ['wkSport'])].forEach(id=>{
      const el = document.getElementById(id);
      if(el){ el.addEventListener('input', updateEstimate); el.addEventListener('change', updateEstimate); }
    });
    updateEstimate();


    document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
      const p = workoutPresets.find(x=>x.id===b.dataset.preset); if(!p) return;
      wkType = p.type;
      wkParams = {...wkParams, ...p.params};
      wkDuration = p.defaultDurationMin || '';
      wkTapisMode = 'duree';
      wkSteps = '';
      render();
      toast('Préréglage chargé — confirme la durée');
    });

    const savePresetBtn = document.getElementById('savePresetBtn');
    if(savePresetBtn) savePresetBtn.onclick = ()=>{ captureWorkoutForm(); openPresetNameModal(); };

    const btn = document.getElementById('saveWorkout');
    if(btn) btn.onclick = ()=>{
      captureWorkoutForm();
      const weight = getCurrentWeight();
      if(!weight){ toast("Renseigne ton poids dans l'onglet Poids d'abord"); return; }
      const entry = {id:uid(), date:currentDate, type:'workout', wtype:wkType, time:new Date().toTimeString().slice(0,5)};
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
      } else if(wkType==='sport'){
        params = {sport: wkParams.sport, intensity: wkParams.sportIntensity};
      } else if(wkType==='club'){
        params = {sport: wkParams.sport, level: wkParams.clubLevel, mode: wkParams.clubMode, enduranceIntensity: wkParams.enduranceIntensity};
      }
      if(duration<=0){ toast('Indique la durée'); return; }
      entry.params = params;
      entry.duration = Math.round(duration);
      entry.kcalBurned = computeWorkoutKcal(wkType, params, duration, weight);
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
        water: parseFloat(document.getElementById('wWater').value)||null,
        note: document.getElementById('wNote').value.trim()||null
      });
      save(); render(); toast('Pesée enregistrée ✓');
    };
    document.querySelectorAll('[data-delw]').forEach(b=>b.onclick=()=>{
      weightEntries = weightEntries.filter(e=>e.id!==b.dataset.delw); save(); render();
    });
    bindChartHover('weightChartWrap', weightChartPoints, [
      {key:'weight', label:'Poids', color:'var(--green)', unit:' kg'}
    ]);
    bindChartHover('muscleChartWrap', weightChartPoints, [
      {key:'muscleMass', label:'Muscle', color:'var(--chart-muscle)', unit:' kg'}
    ]);
    bindChartHover('compChartWrap', weightChartPoints, [
      {key:'bodyFat', label:'Masse grasse', color:'var(--chart-fat)', unit:'%'},
      {key:'water', label:'Eau', color:'var(--chart-water)', unit:'%'}
    ]);
    document.querySelectorAll('#pSexSeg button').forEach(b=>b.onclick=()=>{ profile.sex=b.dataset.sex; render(); });
    document.querySelectorAll('#pActSeg button').forEach(b=>b.onclick=()=>{ profile.activity=b.dataset.act; render(); });
    // Connue et acceptée (Brique 11, audit) : "Enregistrer" écrit profile.*
    // mais ne touche jamais settings.calorieGoal/proteinGoal/carbGoal/fatGoal
    // (seul "Appliquer" ci-dessous le fait). Retirer un objectif de poids ici
    // ne fait donc pas revenir automatiquement les objectifs quotidiens à la
    // maintenance : ils restent sur la dernière valeur appliquée jusqu'à un
    // nouveau clic sur "Appliquer". Volontaire — protège des objectifs
    // ajustés à la main contre un écrasement silencieux — donc ne pas fusionner
    // les deux boutons. Couvert par test_goalrefinement.js (t6_removingGoal_*).
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

  if(activeTab==='shopping'){
    const addShopItem = ()=>{
      const nameInput = document.getElementById('shopName');
      const qtyInput = document.getElementById('shopQty');
      const name = nameInput?.value.trim();
      if(!name){ toast('Donne un nom à l\'article'); return; }
      shoppingList.push({id:uid(), name, qty:(qtyInput?.value||'').trim()||null, checked:false, source:null});
      save(); render(); toast('Article ajouté ✓');
    };
    document.getElementById('shopAdd')?.addEventListener('click', addShopItem);
    ['shopName','shopQty'].forEach(id=>{
      document.getElementById(id)?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addShopItem(); } });
    });
    document.querySelectorAll('[data-shop-toggle]').forEach(b=>b.onchange=()=>{
      const it = shoppingList.find(x=>x.id===b.dataset.shopToggle); if(!it) return;
      it.checked = b.checked; save(); render();
    });
    document.querySelectorAll('[data-shop-delete]').forEach(b=>b.onclick=()=>{
      shoppingList = shoppingList.filter(x=>x.id!==b.dataset.shopDelete); save(); render();
    });
    const clearCheckedBtn = document.getElementById('shopClearChecked');
    if(clearCheckedBtn) clearCheckedBtn.onclick = ()=>{
      shoppingList = shoppingList.filter(x=>!x.checked); save(); render(); toast('Articles cochés supprimés ✓');
    };
  }

  // Page dédiée "Recettes" (livres + recettes qu'ils contiennent) — voir
  // viewRecipes()/recipeBookCard()/recipeRow() dans core.js pour le rendu, et
  // openSaveRecipeModal()/openMoveBookRecipesModal() dans recipeimport.js pour les
  // modales de choix de livre (import) et de suppression d'un livre non-vide.
  if(activeTab==='recipes'){
    const addBook = ()=>{
      const input = document.getElementById('newBookName');
      const name = input?.value.trim();
      if(!name){ toast('Donne un nom au livre'); return; }
      createRecipeBook(name);
      render(); toast('Livre créé ✓');
    };
    document.getElementById('addBookBtn')?.addEventListener('click', addBook);
    document.getElementById('newBookName')?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addBook(); } });

    document.querySelectorAll('[data-book-toggle]').forEach(el=>el.onclick=()=>{
      const id = el.dataset.bookToggle;
      openRecipeBookId = openRecipeBookId===id ? null : id;
      render();
    });
    document.querySelectorAll('[data-book-rename]').forEach(b=>b.onclick=()=>{
      const book = recipeBooks.find(x=>x.id===b.dataset.bookRename); if(!book) return;
      const name = prompt('Renommer le livre', book.name); if(name===null) return;
      const clean = name.trim(); if(!clean){ toast('Le nom du livre ne peut pas être vide'); return; }
      renameRecipeBook(book.id, clean); render();
    });
    document.querySelectorAll('[data-book-delete]').forEach(b=>b.onclick=()=>{
      const book = recipeBooks.find(x=>x.id===b.dataset.bookDelete); if(!book) return;
      const bookRecipes = recipes.filter(r=>r.bookId===book.id);
      if(!bookRecipes.length){
        if(!confirm(`Supprimer le livre "${book.name}" ?`)) return;
        deleteRecipeBookEmpty(book.id); render(); toast('Livre supprimé');
        return;
      }
      const otherBooks = recipeBooks.filter(x=>x.id!==book.id);
      if(!otherBooks.length){
        toast(`Crée d'abord un autre livre pour pouvoir déplacer les recettes de "${book.name}"`, 'warn');
        return;
      }
      openMoveBookRecipesModal(book, bookRecipes, otherBooks);
    });

    document.querySelectorAll('[data-recipe-toggle]').forEach(el=>el.onclick=()=>{
      const id = el.dataset.recipeToggle;
      openRecipeId = openRecipeId===id ? null : id;
      render();
    });
    document.querySelectorAll('[data-recipe-delete]').forEach(b=>b.onclick=()=>{
      const id = b.dataset.recipeDelete;
      recipes = recipes.filter(r=>r.id!==id);
      if(openRecipeId===id) openRecipeId = null;
      save(); render(); toast('Recette supprimée');
    });
    document.querySelectorAll('[data-recipe-addshop]').forEach(b=>b.onclick=()=>{
      const r = recipes.find(x=>x.id===b.dataset.recipeAddshop); if(!r) return;
      const count = addIngredientsToShoppingList(r.ingredients, r.name);
      toast(count ? 'Ingrédients ajoutés à la liste de courses ✓' : 'Aucun ingrédient à ajouter');
    });
  }

  if(activeTab==='history'){
    document.querySelectorAll('[data-histweek]').forEach(h=>h.onclick=()=>{
      const wk = h.dataset.histweek;
      openHistWeek = openHistWeek===wk ? null : wk;
      openHistDay = null;
      render();
    });
    document.querySelectorAll('[data-histday]').forEach(h=>h.onclick=(ev)=>{
      ev.stopPropagation();
      openHistDay = openHistDay===h.dataset.histday ? null : h.dataset.histday; render();
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
      const f = customFoods.find(x=>x.id===b.dataset.editfood); if(f) openEditFoodModal(f);
    });
    const customFoodsToggle = document.querySelector('[data-toggle="customFoods"]');
    if(customFoodsToggle) customFoodsToggle.onclick = ()=>{ openCustomFoods = !openCustomFoods; render(); };
    document.querySelectorAll('[data-delpreset]').forEach(b=>b.onclick=()=>{
      workoutPresets = workoutPresets.filter(p=>p.id!==b.dataset.delpreset); save(); render();
    });
    document.getElementById('exportBtn').onclick = ()=>{
      const blob = new Blob([JSON.stringify({settings,customFoods,foodOverrides,favorites,weightEntries,profile,workoutPresets,logEntries,todos,shoppingList,recipes,recipeBooks,favSports},null,2)], {type:'application/json'});
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
          if(data.shoppingList) shoppingList = data.shoppingList;
          if(data.recipes) recipes = data.recipes;
          if(data.recipeBooks) recipeBooks = data.recipeBooks;
          if(data.favSports) favSports = data.favSports;
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
        logEntries = []; todos = []; shoppingList = []; recipes = []; recipeBooks = [];
        favSports = [{type:'tapis'}, {type:'velo'}];
        insightsSeen = {};
        calibrationSeen = false; portionRevealSeen = false;
        save(); render(); toast('Données réinitialisées');
      }
    };
  }
}

