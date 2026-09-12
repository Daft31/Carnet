document.getElementById('tabs').addEventListener('click', e=>{
  const b = e.target.closest('button[data-tab]'); if(!b) return;
  activeTab = b.dataset.tab; render();
});

function applyTheme(){
  const theme = LS.get('ct_theme', 'light');
  document.body.classList.toggle('dark', theme==='dark');
}
applyTheme();
normalizeTodos();
applyTheme();
render();
