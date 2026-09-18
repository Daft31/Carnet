// Test ciblé — BUG-005 (audit Phase 2.1) : toast() interpolait `msg` sans
// échappement dans innerHTML (ex. nom de livre de recettes via js/ui.js:825).
// Correction centralisée dans toast() lui-même (js/core.js).
//
// Charge le VRAI js/core.js dans un bac à sable Node (`vm`) avec un stub minimal
// du DOM (#toast) pour observer le innerHTML réellement produit.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadKaloSandbox() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const toastEl = { className: '', innerHTML: '', classList: { add(){}, remove(){} } };
  const sandbox = {
    localStorage, console, window: {}, navigator: { userAgent: 'node-test' },
    document: { getElementById: (id) => (id === 'toast' ? toastEl : null) },
    requestAnimationFrame: (fn) => fn(),
    setTimeout, clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'core.js'), 'utf8'), sandbox, { filename: 'js/core.js' });
  sandbox.getToastHtml = () => toastEl.innerHTML;
  return sandbox;
}

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}`); console.log('      ' + (e && e.message ? e.message : e)); }
}

test('toast() échappe <, >, & et " dans le message', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`toast('Crée d\\'abord un autre livre pour pouvoir déplacer les recettes de "<script>alert(1)</script>"', 'warn')`, sandbox);
  const html = sandbox.getToastHtml();
  assert.ok(!/<script>/i.test(html), 'aucune balise <script> brute ne doit apparaître dans le HTML produit');
  assert.ok(html.includes('&lt;script&gt;'), 'le message doit être échappé');
  assert.ok(html.includes('&quot;'), 'les guillemets doivent être échappés');
});

test('toast() : messages normaux (sans HTML) inchangés à l\'affichage', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`toast('Ajouté ✓')`, sandbox);
  assert.ok(sandbox.getToastHtml().includes('Ajouté ✓'));
});

test('toast() : les icônes SVG internes (TOAST_ICONS) restent du vrai HTML, pas échappées', () => {
  const sandbox = loadKaloSandbox();
  vm.runInContext(`toast('ok', 'success')`, sandbox);
  assert.ok(sandbox.getToastHtml().includes('<svg'), 'les icônes internes ne doivent pas être touchées par ce correctif');
});

test('Régression — appel de toast() avec le nom de livre exact du call-site connu (js/ui.js:825)', () => {
  const sandbox = loadKaloSandbox();
  const bookName = '<img src=x onerror=alert(1)>';
  vm.runInContext(`toast(\`Crée d'abord un autre livre pour pouvoir déplacer les recettes de "${bookName.replace(/`/g, '\\`')}"\`, 'warn')`, sandbox);
  const html = sandbox.getToastHtml();
  assert.ok(!html.includes('<img src=x onerror'), 'le nom de livre malveillant ne doit jamais apparaître comme balise brute');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
