// Bouton + flottant (accès rapide, inchangé par la refonte dashboard-first —
// juste réintégré dans la barre au lieu de flotter au-dessus, cf. css/style.css).
document.getElementById('fabAdd').addEventListener('click', e=>{
  openFabMenu();
  e.currentTarget.blur();
});

// En-tête : bouton retour vers le dashboard ("today") et accès Réglages, tous deux
// statiques dans index.html (jamais détruits par render(), donc liés une seule
// fois ici — contrairement aux blocs du dashboard, liés à chaque render() dans
// bindTabEvents() puisqu'ils vivent dans #main). switchTab() (js/core.js) fait le
// render() + reset de scroll — voir sa note pour pourquoi ce reset est nécessaire
// et pourquoi il ne doit pas vivre dans render().
document.getElementById('backBtn').addEventListener('click', e=>{
  switchTab('today');
  e.currentTarget.blur();
});
document.getElementById('settingsBtn').addEventListener('click', e=>{
  switchTab('settings');
  e.currentTarget.blur();
});

function applyTheme(){
  const theme = LS.get('ct_theme', 'dark');
  document.body.classList.toggle('dark', theme==='dark');
}
applyTheme();
normalizeTodos();
applyTheme();
render();

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
