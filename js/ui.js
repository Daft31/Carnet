function openModal(html){
  document.getElementById('modal-root').innerHTML = `<div class="modal-bg" id="modalBg"><div class="modal modal-wrap">
    <button class="close" id="modalClose">✕</button>${html}</div></div>`;
  document.getElementById('modalBg').addEventListener('click', e=>{ if(e.target.id==='modalBg') closeModal(); });
  document.getElementById('modalClose').addEventListener('click', closeModal);
}
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }

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
  openModal(`
    <h3>${escapeHtml(food.name)}</h3>
    <div class="hint">Valeurs pour 100 g : ${food.kcal} kcal · P${food.protein} G${food.carbs} L${food.fat}</div>
    <label>Quantité</label>
    <div class="seg"><button type="button" id="qtyGrams" class="active">Grammes</button><button type="button" id="qtyPortions">Portions (${escapeHtml(food.serving_label||((food.serving_g||100)+" g"))})</button></div>
    <input id="qtyInput" type="number" inputmode="numeric" value="100" autofocus>
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
      time:new Date().toTimeString().slice(0,5)
    });
    save(); closeModal(); mealSearchQ=''; render(); toast('Ajouté ✓');
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
    else if(wkType==='renfo') params = {intensite:wkParams.intensite};
    workoutPresets.unshift({
      id:'wp'+uid(), name, type:wkType, params,
      defaultDurationMin: wkDuration || null,
      notes: wkType==='renfo' ? wkText : null
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

/* ===================== ÉVÉNEMENTS ===================== */
function bindTabEvents(){
  const ttBtn = document.getElementById('themeToggle');
  if(ttBtn) ttBtn.onclick = ()=>{
    const dark=!document.body.classList.contains('dark');
    document.body.classList.toggle('dark',dark); LS.set('ct_theme',dark?'dark':'light');
    toast(dark?'Mode sombre activé 🌙':'Mode clair ☀️','success'); render();
  };
  document.querySelectorAll('[data-act="prevday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,-1); render(); });
  document.querySelectorAll('[data-act="nextday"]').forEach(b=>b.onclick=()=>{ currentDate=shiftDate(currentDate,1); render(); });
  const todayLogToggle = document.querySelector('[data-toggle="todayLog"]');
  if(todayLogToggle) todayLogToggle.onclick = ()=>{ openTodayLog = !openTodayLog; render(); };

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

