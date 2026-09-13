document.getElementById('tabs').addEventListener('click', e=>{
  const moreBtn = e.target.closest('#moreToggle');
  if(moreBtn){
    document.getElementById('moreMenu').classList.toggle('open');
    moreBtn.blur();
    return;
  }
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  activeTab = b.dataset.tab; render();
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
