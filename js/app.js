document.getElementById('tabs').addEventListener('click', e=>{
  const fabBtn = e.target.closest('#fabAdd');
  if(fabBtn){
    openFabMenu();
    fabBtn.blur();
    return;
  }
  const moreBtn = e.target.closest('#moreToggle');
  if(moreBtn){
    document.getElementById('moreMenu').classList.toggle('open');
    moreBtn.blur();
    return;
  }
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  // switchTab() (js/core.js) fait le render() + reset de scroll — voir sa note pour
  // pourquoi ce reset est nécessaire et pourquoi il ne doit pas vivre dans render().
  switchTab(b.dataset.tab);
  b.blur();
});
document.addEventListener('click', e=>{
  const wrap = document.getElementById('moreWrap');
  if(wrap && !wrap.contains(e.target)) document.getElementById('moreMenu').classList.remove('open');
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
