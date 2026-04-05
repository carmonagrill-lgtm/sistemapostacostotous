/* -- Variables Globales -- */

/* ══ PRODUCTOS ══ */


/* -- Navegacion -- */

function go(name, btn) {
  // Lock personal section when leaving it
  if (name !== 'per' && perUnlocked) lockPer();
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.getElementById('v-'+name).classList.add('on');
  document.querySelectorAll('.tnav,.bnt').forEach(b=>b.classList.remove('on'));
  if (btn) { btn.classList.add('on'); btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}); }
  if (name==='inv')   renderInvFull();
  if (name==='coc')   renderKDS();
  if (name==='per')   { /* lock screen shows by default */ }
  if (name==='dash')  renderDash();
  if (name==='cfg')    { renderEmpleados(); renderProvList(); }
  if (name==='comp')   renderCompras();
  if (name==='prod')   renderProdLogs();
  if (name==='rec')    renderRecetasView();
}

function showP(which, btn) {
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  if (!isTab()) {
    document.getElementById('p-menu').style.display = which==='menu' ? 'flex' : 'none';
    document.getElementById('p-cart').style.display = which==='cart' ? 'grid' : 'none';
  }
}

function applyLayout() {
  if (isTab()) {
    document.getElementById('p-menu').style.display = 'flex';
    document.getElementById('p-cart').style.display = 'grid';
  }
}
window.addEventListener('resize', applyLayout); applyLayout();

/* ══ CATEGORÍAS ══ */


/* -- Modales y Utilidades -- */

function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');});});

/* ══ INIT ══ */
initLogin();


/* -- Inicializacion -- */

renderCats();
renderProds();