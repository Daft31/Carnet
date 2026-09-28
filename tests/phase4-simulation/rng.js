// PHASE 4 V2 — PRNG déterministe (mulberry32) : toute campagne générative de
// tests/phase4-simulation/scenarios-v2.js utilise un `seed` explicite, journalisé
// dans le rapport, pour que toute anomalie détectée soit rejouable à l'identique
// (`node tests/phase4-simulation/scenarios-v2.js` est déterministe d'un run à
// l'autre, aucune dépendance à Math.random() ni à l'horloge système).
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const next = mulberry32(seed);
  return {
    seed,
    next,
    int(min, max) { return min + Math.floor(next() * (max - min + 1)); },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    chance(p) { return next() < p; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}
module.exports = { makeRng };
