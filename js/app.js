document.getElementById('tabs').addEventListener('click', e=>{
  const moreBtn = e.target.closest('#moreToggle');
  if(moreBtn){
    document.getElementById('moreMenu').classList.toggle('open');
    moreBtn.blur();
    return;
  }
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  activeTab = b.dataset.tab; render();
  const main = document.getElementById('main');
  main.classList.remove('tab-enter');
  void main.offsetWidth; // force reflow pour rejouer l'animation à chaque changement d'onglet
  main.classList.add('tab-enter');
  // Détache la classe une fois l'animation finie : #main est le conteneur qui scroll
  // (overflow-y:auto), on ne veut jamais qu'une règle d'animation/transform y reste
  // accrochée indéfiniment (déjà vu casser le scroll tactile sur mobile).
  setTimeout(()=>main.classList.remove('tab-enter'), 250);
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
