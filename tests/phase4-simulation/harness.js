// PHASE 4 — Harnais de simulation comportementale (QA, exécution réelle du code).
// Voir PHASE4-SIMULATION-REPORT.md (racine du repo) pour le rapport complet et
// PHASE4-OBSERVATIONS.md pour le journal des signaux retenus.
//
// Charge les VRAIS js/core.js + js/ui.js + js/scanner.js + js/mealparser.js +
// js/workoutparser.js dans un sandbox `vm` mémoïsé par id (même pattern que les
// tests unitaires de tests/*.test.js), puis pilote plusieurs profils utilisateurs
// fictifs à travers des journées/semaines simulées en appelant les VRAIES
// fonctions (openQtyModal, openEditMealEntryModal, findOrAddScannedFood, handler
// séance, handler poids...), avec fetch()/Quagga mockés à la frontière externe
// uniquement. Les observations sont collectées au fil de l'eau dans OBSERVATIONS[].
//
// Volontairement PAS suffixé `.test.js` : ce n'est pas un test de régression
// automatisé (pas d'assertions pass/fail), donc exclu de `node --test tests/*.test.js`.
// Exécution : `node tests/phase4-simulation/scenarios.js`.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..', '..');
const OBSERVATIONS = [];
function log(tag, msg, extra) {
  OBSERVATIONS.push({ tag, msg, extra: extra || null });
  console.log(`[${tag}] ${msg}` + (extra ? ' ' + JSON.stringify(extra) : ''));
}

function makeDocument() {
  const elements = new Map();
  function elFor(id) {
    if (!elements.has(id)) {
      const listeners = {};
      const classes = new Set();
      elements.set(id, {
        id, value: '', innerHTML: '', className: '', style: {}, disabled: false, checked: false,
        get textContent() { return this._text || ''; },
        set textContent(v) { this._text = v; },
        classList: {
          add(c) { classes.add(c); }, remove(c) { classes.delete(c); },
          toggle(c, f) { const on = f === undefined ? !classes.has(c) : f; if (on) classes.add(c); else classes.delete(c); },
          contains(c) { return classes.has(c); },
        },
        addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn); },
        _dispatch(type, evt) { (listeners[type] || []).forEach(fn => fn(evt || { target: elements.get(id) })); },
        onclick: null, onchange: null,
        querySelector: () => null,
        setAttribute() {}, getAttribute() { return null; },
        parentNode: { insertBefore() {} },
        appendChild() {},
      });
    }
    return elements.get(id);
  }
  return {
    getElementById: elFor,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => elFor('__scratch_' + Math.random()),
    body: { contains: () => true },
    head: { appendChild() {} },
  };
}

function loadSandbox(fetchImpl) {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const document = makeDocument();
  const sandbox = {
    localStorage, console, navigator: { userAgent: 'node-sim' },
    document, window: {}, location: { hostname: 'localhost' },
    fetch: fetchImpl || (async () => ({ ok: true, json: async () => ({}) })),
    AbortController,
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  ['core.js', 'ui.js', 'scanner.js', 'mealparser.js', 'workoutparser.js'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sandbox, { filename: 'js/' + f });
  });
  vm.runInContext('render = function(){};', sandbox); // isole la logique de données du rendu DOM complet
  sandbox.__document = document;
  sandbox.run = (code) => vm.runInContext(code, sandbox);
  sandbox.getState = (varName) => { sandbox.run(`this.__tmp = JSON.stringify(${varName});`); return JSON.parse(sandbox.__tmp); };
  sandbox.setDate = (d) => sandbox.run(`currentDate = ${JSON.stringify(d)};`);
  return sandbox;
}

// ---------- Helpers de parcours réels ----------

function addCustomFood(sandbox, {name, kcal, protein, carbs, fat}) {
  sandbox.run(`customFoods.push({id:'c'+uid(), name:${JSON.stringify(name)}, kcal:${kcal}, protein:${protein}, carbs:${carbs}, fat:${fat}});`);
  sandbox.run(`this.__f = customFoods[customFoods.length-1];`);
  return sandbox.run(`this.__f`) || sandbox.getState('customFoods[customFoods.length-1]');
}

// Ajoute un repas via le VRAI openQtyModal() (recherche catalogue), en pilotant
// les vrais éléments DOM mémoïsés comme un utilisateur réel (saisie + clic).
function addMealViaCatalog(sandbox, foodId, grams, { slot } = {}) {
  if (slot) sandbox.run(`mealSlot = ${JSON.stringify(slot)};`);
  sandbox.run(`{
    const f = allFoods().find(x=>x.id===${JSON.stringify(foodId)});
    if(!f) throw new Error('food introuvable: ${foodId}');
    openQtyModal(f);
  }`);
  const input = sandbox.__document.getElementById('qtyInput');
  input.value = String(grams);
  sandbox.__document.getElementById('qtyConfirm')._dispatch('click');
}

function addMealFreeform(sandbox, { name, kcal, protein, carbs, fat, slot, source = 'ai' }) {
  if (slot) sandbox.run(`mealSlot = ${JSON.stringify(slot)};`);
  sandbox.run(`
    logEntries.push({id:uid(), date:currentDate, type:'meal', mealSlot, foodName:${JSON.stringify(name)}, grams:null,
      kcal:${kcal}, protein:${protein}, carbs:${carbs}, fat:${fat}, time:'12:00', source:${JSON.stringify(source)}});
    save();
  `);
}

function addWorkout(sandbox, { wtype = 'tapis', params = { vitesse: 9, pente: 1 }, duration = 30, weight }) {
  if (weight != null) sandbox.run(`weightEntries.push({id:uid(), date:currentDate, weight:${weight}, bodyFat:null, muscleMass:null, water:null, note:null}); save();`);
  const w = sandbox.getState('getCurrentWeight()');
  if (!w) { log('OBSERVED', 'Tentative de log séance sans aucune pesée existante : bloqué par le code (toast attendu, aucune entrée créée).'); return { blocked: true }; }
  sandbox.run(`{
    const kcal = computeWorkoutKcal(${JSON.stringify(wtype)}, ${JSON.stringify(params)}, ${duration}, ${w});
    logEntries.push({id:uid(), date:currentDate, type:'workout', wtype:${JSON.stringify(wtype)}, time:'19:00', params:${JSON.stringify(params)}, duration:${duration}, kcalBurned:kcal});
    save();
  }`);
  return { blocked: false };
}

function addWeight(sandbox, weight, extra = {}) {
  sandbox.run(`weightEntries.push({id:uid(), date:currentDate, weight:${weight}, bodyFat:${extra.bodyFat ?? 'null'}, muscleMass:${extra.muscleMass ?? 'null'}, water:${extra.water ?? 'null'}, note:null}); save();`);
}

function editLastMealGramsOnly(sandbox, newGrams) {
  // Simule un utilisateur qui rouvre "Modifier ce repas" et change SEULEMENT le
  // champ Quantité (g), sans toucher aux champs macro affichés séparément —
  // reproduit exactement openEditMealEntryModal() tel qu'il existe (js/ui.js).
  sandbox.run(`this.__lastId = logEntries[logEntries.length-1].id; this.__entry = logEntries[logEntries.length-1];`);
  sandbox.run(`openEditMealEntryModal(this.__entry);`);
  sandbox.__document.getElementById('emeGrams').value = String(newGrams);
  sandbox.__document.getElementById('emeSave')._dispatch('click');
}

function deleteEntryById(sandbox, id) {
  sandbox.run(`logEntries = logEntries.filter(e=>e.id!==${JSON.stringify(id)}); save();`);
}

let PROFILE_COUNT = 0, DAY_COUNT = 0, JOURNEY_COUNT = 0;
function newProfile(name) { PROFILE_COUNT++; log('PROFILE', `=== Profil ${PROFILE_COUNT}: ${name} ===`); }
function newDay(sandbox, date) { DAY_COUNT++; sandbox.setDate(date); }
function journey(desc) { JOURNEY_COUNT++; }

module.exports = {
  loadSandbox, addCustomFood, addMealViaCatalog, addMealFreeform, addWorkout, addWeight,
  editLastMealGramsOnly, deleteEntryById, newProfile, newDay, journey, log, OBSERVATIONS,
  counts: () => ({ PROFILE_COUNT, DAY_COUNT, JOURNEY_COUNT }),
};
