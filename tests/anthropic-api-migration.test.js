// Tests ciblés — migration fournisseur IA Mammouth -> Anthropic Claude API
// (voir CLAUDE.md règles 2/3). Les trois fonctions serverless (api/parse-meal.js,
// api/parse-workout.js, api/parse-recipe.js) appelaient Mammouth (format
// OpenAI-compatible : Authorization Bearer, messages avec role:'system',
// choices[0].message.content) ; elles appellent maintenant l'API Anthropic
// officielle (x-api-key, anthropic-version, system séparé des messages,
// content[] en blocs). Ce fichier vérifie que l'adaptation respecte le
// contrat frontend existant (même shape de réponse JSON {success,data} /
// {error,details}), sans jamais appeler le réseau réel.
//
// Même stratégie que tests/api-cors-and-size-limits.test.js : on retire le
// `export default` ESM et on charge la vraie logique métier via `vm`, fetch
// toujours stubbé (aucun appel réseau réel dans ce fichier).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadHandler(relPath, fetchImpl) {
  const src = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  const scriptSrc = src.replace(/^export default /m, '');
  const sandbox = {
    console,
    process: { env: { CARNET_API_KEY: 'sk-ant-test-key' } },
    fetch: fetchImpl,
    URL, // api/parse-recipe.js utilise `new URL(...)` dans isTikTokUrl() — absent par défaut d'un contexte vm.
  };
  vm.createContext(sandbox);
  vm.runInContext(scriptSrc, sandbox, { filename: relPath });
  return sandbox.handler;
}

function mockReq({ method = 'POST', origin = 'https://daft31.github.io', body = {} } = {}) {
  return { method, headers: { origin }, body };
}
function mockRes() {
  const res = {
    statusCode: null, headers: {}, _body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this._body = payload; return this; },
    end() { return this; },
  };
  return res;
}

function anthropicSuccess(text, usage) {
  return {
    ok: true,
    json: async () => ({
      id: 'msg_test', type: 'message', role: 'assistant',
      content: [{ type: 'text', text }],
      model: 'claude-haiku-4-5',
      stop_reason: 'end_turn',
      usage: usage || { input_tokens: 123, output_tokens: 45 },
    }),
  };
}

function anthropicError(status, body) {
  return { ok: false, status, text: async () => body };
}

let passed = 0, failed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

// ===================== api/parse-meal.js =====================

test('parse-meal — repas non catalogué : la requête part vers l\'endpoint Anthropic avec x-api-key/anthropic-version et un system prompt séparé des messages', async () => {
  let capturedUrl, capturedOpts;
  const fetchImpl = async (url, opts) => {
    capturedUrl = url; capturedOpts = opts;
    return anthropicSuccess(JSON.stringify({ name: 'Soupe maison', calories: 180, protein: 6, carbs: 22, fat: 6, fiber: 3, ingredients: ['legumes'] }));
  };
  const handler = loadHandler('api/parse-meal.js', fetchImpl);
  const req = mockReq({ body: { mealDescription: 'soupe de légumes maison' } });
  const res = mockRes();
  await handler(req, res);

  assert.strictEqual(capturedUrl, 'https://api.anthropic.com/v1/messages');
  assert.strictEqual(capturedOpts.headers['x-api-key'], 'sk-ant-test-key');
  assert.strictEqual(capturedOpts.headers['anthropic-version'], '2023-06-01');
  assert.ok(!capturedOpts.headers.Authorization, 'aucun header Authorization Bearer (format Mammouth/OpenAI) ne doit subsister');
  const body = JSON.parse(capturedOpts.body);
  assert.strictEqual(body.model, 'claude-haiku-4-5');
  assert.strictEqual(typeof body.system, 'string', 'le system prompt doit être un champ séparé, pas un message');
  assert.ok(body.system.length > 0);
  assert.ok(body.messages.every(m => m.role !== 'system'), 'aucun message de rôle "system" ne doit rester dans `messages` (format Anthropic)');
  assert.strictEqual(body.messages[0].role, 'user', 'le premier message (après extraction du system prompt) doit être "user"');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res._body.success, true);
  assert.strictEqual(res._body.data.name, 'Soupe maison');
  assert.strictEqual(res._body.data.calories, 180);
  assert.strictEqual(res._body.data.confidence, 'ai', 'contrat confidence inchangé : repas non reconnu par le catalogue -> ai');
});

test('parse-meal — réponse Anthropic avec plusieurs blocs de contenu : le bloc de type "text" est bien retrouvé (pas juste content[0])', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({
      content: [
        { type: 'tool_use', id: 'x', name: 'noop', input: {} },
        { type: 'text', text: JSON.stringify({ name: 'Plat test', calories: 300, protein: 10, carbs: 30, fat: 10, fiber: 2, ingredients: ['x'] }) },
      ],
      usage: { input_tokens: 1, output_tokens: 1 },
    }),
  });
  const handler = loadHandler('api/parse-meal.js', fetchImpl);
  const req = mockReq({ body: { mealDescription: 'plat non catalogué xyz' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res._body.data.name, 'Plat test');
});

test('parse-meal — erreur Anthropic (ex. 401 clé invalide) : 502 "Erreur API Anthropic", même contrat {error,details} qu\'avant la migration', async () => {
  const fetchImpl = async () => anthropicError(401, JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }));
  const handler = loadHandler('api/parse-meal.js', fetchImpl);
  const req = mockReq({ body: { mealDescription: 'plat non catalogué xyz' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res._body.error, 'Erreur API Anthropic');
  assert.ok(res._body.details.includes('401'));
});

test('parse-meal — repas catalogué (ex. "big mac") : toujours aucun appel réseau (confidence catalog inchangée par la migration)', async () => {
  const fetchImpl = async () => { throw new Error('fetch ne doit pas être appelé pour un repas entièrement catalogué'); };
  const handler = loadHandler('api/parse-meal.js', fetchImpl);
  const req = mockReq({ body: { mealDescription: 'big mac' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res._body.data.confidence, 'catalog');
});

test('parse-meal — CARNET_API_KEY absente : 500, message inchangé (contrat préservé pour tests/api-cors-and-size-limits.test.js)', async () => {
  const handler = loadHandler('api/parse-meal.js', async () => { throw new Error('ne doit pas être appelé'); });
  const req = mockReq({ body: { mealDescription: 'plat non catalogué xyz' } });
  const res = mockRes();
  // Simule l'absence de clé en remplaçant process.env après le chargement du module.
  vm.createContext;
  const src = fs.readFileSync(path.join(__dirname, '..', 'api/parse-meal.js'), 'utf8').replace(/^export default /m, '');
  const sandbox = { console, process: { env: {} }, fetch: async () => { throw new Error('ne doit pas être appelé'); }, URL };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'api/parse-meal.js' });
  await sandbox.handler(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.ok(/CARNET_API_KEY/.test(res._body.error));
});

// ===================== api/parse-workout.js =====================

test('parse-workout — requête structurée : endpoint/headers Anthropic corrects, réponse JSON parsée normalement', async () => {
  let capturedOpts;
  const fetchImpl = async (url, opts) => {
    capturedOpts = opts;
    return anthropicSuccess(JSON.stringify({
      blocks: [{ name: 'Bloc 1', type: 'standard', durationMin: null, rounds: null, exercises: [{ name: 'Squat', sets: 4, reps: '8', tempo: null, restSec: 90 }] }],
      warnings: [],
    }));
  };
  const handler = loadHandler('api/parse-workout.js', fetchImpl);
  const req = mockReq({ body: { programText: 'Squat 4x8 repos 90s' } });
  const res = mockRes();
  await handler(req, res);

  assert.strictEqual(capturedOpts.headers['x-api-key'], 'sk-ant-test-key');
  const body = JSON.parse(capturedOpts.body);
  assert.strictEqual(typeof body.system, 'string');
  assert.ok(body.messages.every(m => m.role !== 'system'));

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res._body.success, true);
  assert.strictEqual(res._body.data.blocks[0].exercises[0].name, 'Squat');
  assert.ok(Number.isFinite(res._body.data.estimatedDurationMin), 'la durée reste calculée côté code, inchangée par la migration');
});

test('parse-workout — erreur Anthropic : 502 "Erreur API Anthropic"', async () => {
  const fetchImpl = async () => anthropicError(500, 'internal server error');
  const handler = loadHandler('api/parse-workout.js', fetchImpl);
  const req = mockReq({ body: { programText: 'Squat 4x8 repos 90s' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res._body.error, 'Erreur API Anthropic');
});

test('parse-workout — réponse insufficient_info : comportement 422 inchangé par la migration', async () => {
  const fetchImpl = async () => anthropicSuccess(JSON.stringify({ error: 'insufficient_info', message: 'pas assez d\'info' }));
  const handler = loadHandler('api/parse-workout.js', fetchImpl);
  const req = mockReq({ body: { programText: 'ceci n\'est pas un programme de sport' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 422);
});

// ===================== api/parse-recipe.js =====================

test('parse-recipe — deuxième appel (après oEmbed) part bien vers Anthropic avec le bon format, réponse JSON exploitée normalement', async () => {
  let anthropicOpts = null;
  const fetchImpl = async (url, opts) => {
    if (String(url).includes('tiktok.com/oembed')) {
      return { ok: true, json: async () => ({ title: 'Recette pâtes carbonara 200g pâtes, 100g lardons, 2 oeufs' }) };
    }
    anthropicOpts = opts;
    return anthropicSuccess(JSON.stringify({
      name: 'Pâtes carbonara',
      servings: 2,
      ingredients: [{ name: 'pâtes', qty: '200 g' }, { name: 'lardons', qty: '100 g' }, { name: 'oeufs', qty: '2' }],
      steps: ['Cuire les pâtes', 'Faire revenir les lardons', 'Mélanger avec les oeufs'],
    }));
  };
  const handler = loadHandler('api/parse-recipe.js', fetchImpl);
  const req = mockReq({ body: { tiktokUrl: 'https://www.tiktok.com/@chef/video/123' } });
  const res = mockRes();
  await handler(req, res);

  assert.ok(anthropicOpts, 'le second appel (Anthropic) doit avoir eu lieu après le succès oEmbed');
  assert.strictEqual(anthropicOpts.headers['x-api-key'], 'sk-ant-test-key');
  assert.ok(!anthropicOpts.headers.Authorization);
  const body = JSON.parse(anthropicOpts.body);
  assert.strictEqual(typeof body.system, 'string');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res._body.data.name, 'Pâtes carbonara');
  assert.strictEqual(res._body.data.ingredients.length, 3);
});

test('parse-recipe — erreur Anthropic après succès oEmbed : 502 "Erreur API Anthropic"', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('tiktok.com/oembed')) {
      return { ok: true, json: async () => ({ title: 'une légende exploitable de recette' }) };
    }
    return anthropicError(429, 'rate limited');
  };
  const handler = loadHandler('api/parse-recipe.js', fetchImpl);
  const req = mockReq({ body: { tiktokUrl: 'https://www.tiktok.com/@chef/video/123' } });
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(res._body.error, 'Erreur API Anthropic');
});

(async () => {
  for (const { name, fn } of tests) {
    try { await fn(); passed++; console.log(`  ok  ${name}`); }
    catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.stack ? e.stack : e)); }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
