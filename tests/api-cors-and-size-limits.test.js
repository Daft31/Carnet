// Test ciblé — AI-P2-2 (audit Phase 2.3.1) : les 3 fonctions serverless IA répondaient
// `Access-Control-Allow-Origin: *` inconditionnellement, sans aucune vérification
// d'origine ni limite de taille d'entrée — un tiers connaissant l'URL Vercel pouvait
// appeler les endpoints à volonté, consommant le quota Mammouth de l'utilisateur.
//
// Correctif : liste blanche d'origines (`daft31.github.io` + tout `*.vercel.app`),
// vérifiée AVANT tout traitement (donc avant tout appel Mammouth) quand un en-tête Origin
// est présent, et une limite de longueur sur les champs texte utilisateur. Protection
// assumée comme PARTIELLE (voir commentaires dans les fichiers api/parse-*.js) : CORS ne
// filtre que les requêtes de navigateur envoyant un en-tête Origin — un appel direct
// (curl, script, serveur à serveur) sans cet en-tête n'est PAS bloqué par ce mécanisme, ce
// que ce fichier de test vérifie aussi explicitement (pour ne jamais prétendre à un
// rate-limiting global qui n'existe pas).
//
// api/*.js utilisent la syntaxe ESM (`export default async function handler`), invalide
// dans un script `vm` classique — on retire uniquement ce préfixe avant `vm.runInContext`
// (même stratégie que tests/import-validation.test.js, qui extrait/rejoue de la logique
// réelle plutôt que de dupliquer le code), pour charger la VRAIE logique métier de chaque
// fichier sans dépendance supplémentaire ni compilation.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadHandler(relPath, extraGlobals = {}) {
  const src = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  const scriptSrc = src.replace(/^export default /m, '');
  const sandbox = {
    console,
    process: { env: {} },
    fetch: async () => { throw new Error('fetch ne doit pas être appelé dans ce test'); },
    ...extraGlobals,
  };
  vm.createContext(sandbox);
  vm.runInContext(scriptSrc, sandbox, { filename: relPath });
  return sandbox.handler;
}

function mockReq({ method = 'POST', origin, body = {} } = {}) {
  return { method, headers: origin !== undefined ? { origin } : {}, body };
}
function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    _body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this._body = payload; return this; },
    end() { return this; },
  };
  return res;
}

let passed = 0, failed = 0;
function test(name, fn) {
  const run = async () => {
    try { await fn(); passed++; console.log(`  ok  ${name}`); }
    catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
  };
  tests.push(run);
}
const tests = [];

// ===================== api/parse-meal.js =====================

test('parse-meal — origine autorisée (GitHub Pages) : pas bloquée, atteint la logique métier (repas catalogue, aucun réseau)', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { mealDescription: 'big mac' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200, 'un repas catalogue (big mac) doit réussir sans jamais appeler Mammouth');
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'https://daft31.github.io');
});

test('parse-meal — sous-domaine Vercel autorisé (preview deploy) : pas bloquée', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://carnet-self.vercel.app', body: { mealDescription: 'big mac' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
});

test('parse-meal — origine tierce non autorisée : requête refusée en 403 AVANT tout traitement métier', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://evil.example.com', body: { mealDescription: 'big mac' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 403);
  assert.ok(!res.headers['Access-Control-Allow-Origin'], 'aucun ACAO ne doit être renvoyé pour une origine refusée');
});

test('parse-meal — aucun en-tête Origin (appel non-navigateur, ex. curl) : NON bloqué par ce mécanisme — limite assumée, pas un rate limiting serveur', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: undefined, body: { mealDescription: 'big mac' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200, "un appel direct sans en-tête Origin n'est pas filtré par un contrôle CORS (limitation structurelle documentée, pas une régression)");
});

test('parse-meal — méthode GET : 405, comportement inchangé', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ method: 'GET', origin: 'https://daft31.github.io' });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 405);
});

test('parse-meal — OPTIONS (preflight) : 204, comportement inchangé', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ method: 'OPTIONS', origin: 'https://daft31.github.io' });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 204);
});

test('parse-meal — mealDescription absente : 400, comportement inchangé', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: {} });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-meal — mealDescription dépassant la limite de longueur : 400, jamais transmise à Mammouth', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { mealDescription: 'x'.repeat(3000) } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-meal — mealDescription juste sous la limite (repas catalogue) : acceptée normalement', async () => {
  const handler = loadHandler('api/parse-meal.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { mealDescription: 'whopper' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
});

// ===================== api/parse-recipe.js =====================

test('parse-recipe — origine tierce non autorisée : 403 avant tout traitement (aucun appel oEmbed/Mammouth)', async () => {
  const handler = loadHandler('api/parse-recipe.js');
  const req = mockReq({ origin: 'https://evil.example.com', body: { tiktokUrl: 'https://www.tiktok.com/@x/video/1' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 403);
});

test('parse-recipe — origine autorisée, tiktokUrl absente : 400, comportement inchangé', async () => {
  const handler = loadHandler('api/parse-recipe.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: {} });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-recipe — tiktokUrl dépassant la limite de longueur : 400, jamais appelée', async () => {
  const handler = loadHandler('api/parse-recipe.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { tiktokUrl: 'https://www.tiktok.com/@x/video/' + '1'.repeat(600) } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-recipe — lien non-TikTok, origine autorisée : 400 (validation de domaine inchangée)', async () => {
  const handler = loadHandler('api/parse-recipe.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { tiktokUrl: 'https://evil.example.com/video' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

// ===================== api/parse-workout.js =====================

test('parse-workout — origine tierce non autorisée : 403 avant tout traitement', async () => {
  const handler = loadHandler('api/parse-workout.js');
  const req = mockReq({ origin: 'https://evil.example.com', body: { programText: 'Squat 4x8' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 403);
});

test('parse-workout — programText absent : 400, comportement inchangé', async () => {
  const handler = loadHandler('api/parse-workout.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: {} });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-workout — programText dépassant la limite de longueur : 400, jamais transmis à Mammouth', async () => {
  const handler = loadHandler('api/parse-workout.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { programText: 'Squat 4x8\n'.repeat(1000) } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('parse-workout — sans CARNET_API_KEY (origine autorisée, texte valide sous la limite) : atteint la logique métier normale (500 clé manquante, pas 403/400)', async () => {
  const handler = loadHandler('api/parse-workout.js');
  const req = mockReq({ origin: 'https://daft31.github.io', body: { programText: 'Squat 4x8 tempo 2/2/X/1 repos 90s' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 500, 'doit passer les contrôles origine/taille/body et échouer seulement sur la clé API manquante en environnement de test');
  assert.ok(/CARNET_API_KEY/.test(res._body.error));
});

(async () => {
  for (const t of tests) await t();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
