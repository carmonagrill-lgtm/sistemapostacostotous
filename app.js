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
  if (name==='cat')    renderCatalogo();
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
function closeM(id){
  document.getElementById(id).classList.remove('open');
  // Re-enable rec-tipo if it was locked
  if (id === 'mReceta') {
    const tipoSel = document.getElementById('rec-tipo');
    if (tipoSel) { tipoSel.disabled=false; tipoSel.style.opacity='1'; tipoSel.title=''; }
  }
}

document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');});});


/* -- Inicializacion -- */

/* ── Firebase Config ── */
const firebaseConfig = {
  apiKey: "AIzaSyCRJ3YV5gEbDeiKXMctjcc0koRyctQub5w",
  authDomain: "sistema-pos-tacos-totous.firebaseapp.com",
  projectId: "sistema-pos-tacos-totous",
  storageBucket: "sistema-pos-tacos-totous.firebasestorage.app",
  messagingSenderId: "510864516004",
  appId: "1:510864516004:web:1eacc8d928250736d25731"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ── Colecciones en Firestore ── */
// ventas       → txns[]
// compras      → compras[]
// prodLogs     → prodLogs[]
// inventario   → ingredientes[], produccion[]
// config       → biz, staff, menuCategorias, recetas, proveedores, empleados

/* ── Indicador de estado de sync ── */
function setSyncIndicator(estado) {
  // estado: 'syncing' | 'ok' | 'error' | 'offline'
  const pill = document.getElementById('clk');
  if (!pill) return;
  const dots = {syncing:'⟳', ok:'●', error:'✕', offline:'○'};
  const colors = {syncing:'#F0A000', ok:'#00C060', error:'#D4001E', offline:'#6B5040'};
  const dot = document.createElement('span');
  const existing = pill.querySelector('.sync-dot');
  if (existing) existing.remove();
  const span = document.createElement('span');
  span.className = 'sync-dot';
  span.textContent = ' ' + dots[estado];
  span.style.color = colors[estado];
  span.style.fontSize = '10px';
  pill.appendChild(span);
}

/* ══ GUARDAR EN FIRESTORE ══ */

async function fbSave(coleccion, id, data) {
  try {
    setSyncIndicator('syncing');
    await db.collection(coleccion).doc(String(id)).set(data);
    setSyncIndicator('ok');
  } catch(e) {
    setSyncIndicator('error');
    console.error('Firebase save error:', coleccion, e);
  }
}

async function fbDelete(coleccion, id) {
  try {
    await db.collection(coleccion).doc(String(id)).delete();
  } catch(e) {
    console.error('Firebase delete error:', e);
  }
}

/* ── Guardar venta ── */
const _origProcessPay = processPay;
function processPay() {
  _origProcessPay();
  // txns[0] es la venta recién creada
  if (txns.length > 0) {
    fbSave('ventas', txns[0].id, txns[0]);
  }
}

/* ── Guardar compra ── */
const _origSaveCompra = saveCompra;
function saveCompra() {
  _origSaveCompra();
  if (compras.length > 0) {
    fbSave('compras', compras[0].id, compras[0]);
  }
}

/* ── Guardar producción ── */
const _origSaveProdLog = saveProdLog;
function saveProdLog() {
  _origSaveProdLog();
  if (prodLogs.length > 0) {
    fbSave('prodLogs', prodLogs[0].id, prodLogs[0]);
  }
}

/* ── Guardar inventario (ingredientes) al ajustar stock ── */
const _origAdjIngr = adjIngr;
function adjIngr(id, d) {
  _origAdjIngr(id, d);
  const ing = ingredientes.find(i=>i.id===id);
  if (ing) fbSave('ingredientes', ing.id, ing);
}

/* ── Guardar inventario (producción) al ajustar ── */
const _origAdjProd2 = adjProd2;
function adjProd2(id, d) {
  _origAdjProd2(id, d);
  const p = produccion.find(x=>x.id===id);
  if (p) fbSave('produccion', p.id, p);
}

/* ── Guardar config / staff / recetas cuando cambian ── */
function fbSaveConfig() {
  fbSave('config', 'biz',             {data: biz});
  fbSave('config', 'staff',           {data: staff});
  fbSave('config', 'menuCategorias',  {data: menuCategorias});
  fbSave('config', 'recetas',         {data: recetas});
  fbSave('config', 'recetaCategorias',{data: recetaCategorias});
  fbSave('config', 'proveedores',     {data: proveedores});
  fbSave('config', 'empleados',       {data: empleados});
  fbSave('config', 'products',        {data: products});
}

// Guardar config al cerrar / cambiar pestaña
window.addEventListener('beforeunload', fbSaveConfig);
// Guardar config periódicamente cada 2 minutos
setInterval(fbSaveConfig, 120000);

/* ══ CARGAR DESDE FIRESTORE AL INICIAR ══ */
async function fbLoad() {
  setSyncIndicator('syncing');
  try {
    // Cargar config (biz, staff, recetas, productos, etc.)
    const configDocs = ['biz','staff','menuCategorias','recetas','recetaCategorias','proveedores','empleados','products'];
    for (const docId of configDocs) {
      const doc = await db.collection('config').doc(docId).get();
      if (doc.exists) {
        const data = doc.data().data;
        if (docId === 'biz')              biz = data;
        else if (docId === 'staff')       staff = data;
        else if (docId === 'menuCategorias') menuCategorias = data;
        else if (docId === 'recetas')     recetas = data;
        else if (docId === 'recetaCategorias') recetaCategorias = data;
        else if (docId === 'proveedores') proveedores = data;
        else if (docId === 'empleados')   empleados = data;
        else if (docId === 'products')    products = data;
      }
    }

    // Cargar ventas del día (filtramos en JS para evitar índice compuesto)
    const hoy = new Date().toLocaleDateString('es-MX');
    const ventasSnap = await db.collection('ventas').get();
    if (!ventasSnap.empty) {
      txns = ventasSnap.docs.map(d=>d.data())
        .filter(t=>t.date===hoy)
        .sort((a,b)=>b.id-a.id);
      salesTotal = txns.reduce((s,t)=>s+t.total, 0);
      txns.forEach(t=>{
        t.items?.forEach(it=>{ soldMap[it.id]=(soldMap[it.id]||0)+it.qty; });
        if (t.owner) ownerSales[t.owner] = (ownerSales[t.owner]||0) + t.total;
        if (t.servicio) servicioCount[t.servicio] = (servicioCount[t.servicio]||0) + 1;
      });
    }

    // Cargar compras (todas, filtramos en JS)
    const comprasSnap = await db.collection('compras').get();
    if (!comprasSnap.empty) {
      compras = comprasSnap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);
    }

    // Cargar registros de producción
    const prodSnap = await db.collection('prodLogs').get();
    if (!prodSnap.empty) {
      prodLogs = prodSnap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);
    }

    // Cargar stock de ingredientes
    const ingrSnap = await db.collection('ingredientes').get();
    if (!ingrSnap.empty) {
      ingrSnap.docs.forEach(doc=>{
        const saved = doc.data();
        const local = ingredientes.find(i=>i.id===saved.id);
        if (local) local.stock = saved.stock;
      });
    }

    // Cargar stock de producción
    const prodStockSnap = await db.collection('produccion').get();
    if (!prodStockSnap.empty) {
      prodStockSnap.docs.forEach(doc=>{
        const saved = doc.data();
        const local = produccion.find(p=>p.id===saved.id);
        if (local) local.stock = saved.stock;
      });
    }

    setSyncIndicator('ok');
    console.log('Firebase: datos cargados correctamente');
  } catch(e) {
    setSyncIndicator('error');
    console.error('Firebase load error:', e);
  }

  // Inicializar UI con datos cargados
  initLogin();
  renderCats();
  renderProds();
}

/* ── Detectar si hay conexión ── */
window.addEventListener('online',  ()=>{ setSyncIndicator('ok');      fbSaveConfig(); });
window.addEventListener('offline', ()=>{ setSyncIndicator('offline'); });

/* ── Arrancar ── */
fbLoad();