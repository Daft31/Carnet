document.getElementById('tabs').addEventListener('click', e=>{
  const moreBtn = e.target.closest('#moreToggle');
  if(moreBtn){
    document.getElementById('moreMenu').classList.toggle('open');
    moreBtn.blur();
    return;
  }
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  activeTab = b.dataset.tab; render();
  // La position de scroll ne se réinitialise pas toute seule au changement d'onglet
  // (remplacer main.innerHTML ne touche pas au scroll de la fenêtre) : sans ce reset,
  // on atterrit sur le nouvel onglet à la position laissée par le précédent, ce qui,
  // sur un onglet plus court, donne l'impression d'être bloqué en bas de page.
  window.scrollTo(0, 0);
  document.getElementById('main').scrollTop = 0;
  document.getElementById('moreMenu').classList.remove('open');
  b.blur();
});
document.addEventListener('click', e=>{
  const wrap = document.getElementById('moreWrap');
  if(wrap && !wrap.contains(e.target)) document.getElementById('moreMenu').classList.remove('open');
});

function applyTheme(){
  const theme = LS.get('ct_theme', 'light');
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
