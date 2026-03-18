/* ══════════════════════════════════════════════════════════════
   FIREBASE.JS — Tacos Totous POS
   Versión corregida — carga segura con window.load
   ══════════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyCRJ3YV5gEbDeiKXMctjcc0koRyctQub5w",
  authDomain: "sistema-pos-tacos-totous.firebaseapp.com",
  projectId: "sistema-pos-tacos-totous",
  storageBucket: "sistema-pos-tacos-totous.firebasestorage.app",
  messagingSenderId: "510864516004",
  appId: "1:510864516004:web:1eacc8d928250736d25731"
};

let db = null;
let firebaseReady = false;

const COL = {
  ventas:       'ventas',
  productos:    'productos',
  ingredientes: 'ingredientes',
  produccion:   'produccion',
  recetas:      'recetas',
  compras:      'compras',
  prodLogs:     'prodLogs',
  staff:        'staff',
  empleados:    'empleados',
  proveedores:  'proveedores',
  histDays:     'histDays',
  config:       'config',
};

function limpiarObj(obj) {
  return JSON.parse(JSON.stringify(obj, (key, val) => {
    if (key === '_fbId') return undefined;
    return val === undefined ? null : val;
  }));
}

function showFBStatus(tipo, msg) {
  const el = document.getElementById('syncSt');
  if (!el) return;
  el.className = 'syst ' + (tipo === 'ok' ? 'sy1' : tipo === 'error' ? 'sy2' : 'sy0');
  el.textContent = msg;
}

function addFBLog(ok, msg) {
  if (typeof slogData === 'undefined') return;
  const t = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  slogData.unshift({ ok, msg, t });
  if (slogData.length > 20) slogData.pop();
  const logEl = document.getElementById('slog');
  if (logEl) {
    logEl.innerHTML = slogData.map(e =>
      `<div class="sli"><span class="${e.ok ? 'slok' : 'sler'}">${e.ok ? '✅' : '❌'} ${e.msg}</span><span class="slt">${e.t}</span></div>`
    ).join('');
  }
}

/* ── INICIALIZAR ── */
function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      showFBStatus('error', '❌ Firebase SDK no encontrado');
      return;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseReady = true;
    console.log('✅ Firebase listo');
    showFBStatus('ok', '✅ Firebase conectado');
    cargarTodosDatos();
  } catch (e) {
    console.error('Error Firebase:', e);
    showFBStatus('error', '❌ ' + e.message);
  }
}

/* ── CARGA INICIAL ── */
async function cargarTodosDatos() {
  if (!firebaseReady) return;
  showFBStatus('loading', '⏳ Cargando datos...');
  try {
    await cargarProductos();
    await cargarIngredientes();
    await cargarProduccion();
    await cargarStaff();
    await cargarEmpleados();
    await cargarProveedores();
    await cargarCompras();
    await cargarProdLogs();
    await cargarHistDays();
    await cargarConfig();
    await cargarRecetasSafe();
    showFBStatus('ok', '✅ Todo cargado');
    addFBLog(true, 'Carga inicial completa');
    if (typeof renderCats === 'function') renderCats();
    if (typeof renderProds === 'function') renderProds();
    if (typeof renderInvFull === 'function') renderInvFull();
    if (typeof initLogin === 'function') initLogin();
  } catch (e) {
    console.error('Error carga:', e);
    showFBStatus('error', '❌ ' + e.message);
    addFBLog(false, 'Error: ' + e.message);
  }
}

/* ── PRODUCTOS ── */
async function cargarProductos() {
  const snap = await db.collection(COL.productos).get();
  if (!snap.empty) {
    if (typeof products !== 'undefined') {
      products = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } else {
    await subirProductos();
  }
}
async function subirProductos() {
  if (typeof products === 'undefined') return;
  const batch = db.batch();
  products.forEach(p => batch.set(db.collection(COL.productos).doc(String(p.id)), limpiarObj(p)));
  await batch.commit();
  addFBLog(true, 'Productos subidos (' + products.length + ')');
}
async function guardarProducto(p) {
  if (!firebaseReady || !p) return;
  await db.collection(COL.productos).doc(String(p.id)).set(limpiarObj(p));
}
async function eliminarProducto(id) {
  if (!firebaseReady) return;
  await db.collection(COL.productos).doc(String(id)).delete();
}

/* ── VENTAS ── */
async function guardarVenta(tx) {
  if (!firebaseReady) return;
  try {
    showFBStatus('loading', '⏳ Guardando venta...');
    await db.collection(COL.ventas).doc(String(tx.id)).set({
      ...limpiarObj(tx),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    showFBStatus('ok', '✅ Venta #' + tx.id + ' guardada');
    addFBLog(true, 'Venta #' + tx.id + ' · $' + tx.total.toFixed(2));
  } catch (e) {
    showFBStatus('error', '❌ Error guardando venta');
    addFBLog(false, 'Error venta: ' + e.message);
  }
}

/* ── INGREDIENTES ── */
async function cargarIngredientes() {
  const snap = await db.collection(COL.ingredientes).get();
  if (!snap.empty) {
    if (typeof ingredientes !== 'undefined') {
      ingredientes = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } else {
    await subirIngredientes();
  }
}
async function subirIngredientes() {
  if (typeof ingredientes === 'undefined') return;
  const batch = db.batch();
  ingredientes.forEach(i => batch.set(db.collection(COL.ingredientes).doc(String(i.id)), limpiarObj(i)));
  await batch.commit();
  addFBLog(true, 'Ingredientes subidos (' + ingredientes.length + ')');
}
async function guardarIngrediente(i) {
  if (!firebaseReady || !i) return;
  await db.collection(COL.ingredientes).doc(String(i.id)).set(limpiarObj(i));
}
async function eliminarIngrediente(id) {
  if (!firebaseReady) return;
  await db.collection(COL.ingredientes).doc(String(id)).delete();
}

/* ── PRODUCCIÓN ── */
async function cargarProduccion() {
  const snap = await db.collection(COL.produccion).get();
  if (!snap.empty) {
    if (typeof produccion !== 'undefined') {
      produccion = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } else {
    await subirProduccion();
  }
}
async function subirProduccion() {
  if (typeof produccion === 'undefined') return;
  const batch = db.batch();
  produccion.forEach(p => batch.set(db.collection(COL.produccion).doc(String(p.id)), limpiarObj(p)));
  await batch.commit();
  addFBLog(true, 'Producción subida (' + produccion.length + ')');
}
async function guardarProduccionItem(item) {
  if (!firebaseReady || !item) return;
  await db.collection(COL.produccion).doc(String(item.id)).set(limpiarObj(item));
}
async function eliminarProduccionItem(id) {
  if (!firebaseReady) return;
  await db.collection(COL.produccion).doc(String(id)).delete();
}

/* ── RECETAS (carga segura) ── */
async function cargarRecetasSafe() {
  try {
    if (typeof recetas === 'undefined') {
      console.warn('recetas no definida, omitiendo carga');
      return;
    }
    const snap = await db.collection(COL.recetas).get();
    if (!snap.empty) {
      recetas = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
      addFBLog(true, 'Recetas cargadas (' + recetas.length + ')');
    } else {
      if (recetas.length) {
        const batch = db.batch();
        recetas.forEach(r => batch.set(db.collection(COL.recetas).doc(String(r.id)), limpiarObj(r)));
        await batch.commit();
        addFBLog(true, 'Recetas subidas (' + recetas.length + ')');
      }
    }
  } catch (e) {
    addFBLog(false, 'Error recetas: ' + e.message);
  }
}
async function guardarReceta(r) {
  if (!firebaseReady || !r) return;
  await db.collection(COL.recetas).doc(String(r.id)).set(limpiarObj(r));
  addFBLog(true, 'Receta guardada: ' + r.nombre);
}
async function eliminarReceta(id) {
  if (!firebaseReady) return;
  await db.collection(COL.recetas).doc(String(id)).delete();
}

/* ── COMPRAS ── */
async function cargarCompras() {
  try {
    const snap = await db.collection(COL.compras).orderBy('fecha', 'desc').limit(100).get();
    if (!snap.empty && typeof compras !== 'undefined') {
      compras = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } catch(e) { /* colección vacía, ok */ }
}
async function guardarCompra(c) {
  if (!firebaseReady || !c) return;
  await db.collection(COL.compras).doc(String(c.id)).set(limpiarObj(c));
}
async function actualizarCompra(c) {
  if (!firebaseReady || !c) return;
  await db.collection(COL.compras).doc(String(c.id)).set(limpiarObj(c));
}
async function eliminarCompra(id) {
  if (!firebaseReady) return;
  await db.collection(COL.compras).doc(String(id)).delete();
}

/* ── PROD LOGS ── */
async function cargarProdLogs() {
  try {
    const snap = await db.collection(COL.prodLogs).orderBy('fecha', 'desc').limit(100).get();
    if (!snap.empty && typeof prodLogs !== 'undefined') {
      prodLogs = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } catch(e) { /* ok */ }
}
async function guardarProdLog(l) {
  if (!firebaseReady || !l) return;
  await db.collection(COL.prodLogs).doc(String(l.id)).set(limpiarObj(l));
}
async function actualizarProdLog(l) {
  if (!firebaseReady || !l) return;
  await db.collection(COL.prodLogs).doc(String(l.id)).set(limpiarObj(l));
}
async function eliminarProdLog(id) {
  if (!firebaseReady) return;
  await db.collection(COL.prodLogs).doc(String(id)).delete();
}

/* ── STAFF ── */
async function cargarStaff() {
  const snap = await db.collection(COL.staff).get();
  if (!snap.empty) {
    if (typeof staff !== 'undefined') {
      staff = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } else {
    await subirStaff();
  }
}
async function subirStaff() {
  if (typeof staff === 'undefined') return;
  const batch = db.batch();
  staff.forEach(s => batch.set(db.collection(COL.staff).doc(String(s.id)), limpiarObj(s)));
  await batch.commit();
  addFBLog(true, 'Staff subido (' + staff.length + ' usuarios)');
}
async function guardarStaffMiembro(s) {
  if (!firebaseReady || !s) return;
  await db.collection(COL.staff).doc(String(s.id)).set(limpiarObj(s));
  addFBLog(true, 'Usuario guardado: ' + s.name);
}
async function eliminarStaffMiembro(id) {
  if (!firebaseReady) return;
  await db.collection(COL.staff).doc(String(id)).delete();
}

/* ── EMPLEADOS ── */
async function cargarEmpleados() {
  try {
    const snap = await db.collection(COL.empleados).get();
    if (!snap.empty && typeof empleados !== 'undefined') {
      empleados = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } catch(e) { /* ok */ }
}
async function guardarEmpleado(e) {
  if (!firebaseReady || !e) return;
  await db.collection(COL.empleados).doc(String(e.id)).set(limpiarObj(e));
}
async function eliminarEmpleado(id) {
  if (!firebaseReady) return;
  await db.collection(COL.empleados).doc(String(id)).delete();
}

/* ── PROVEEDORES ── */
async function cargarProveedores() {
  const snap = await db.collection(COL.proveedores).get();
  if (!snap.empty) {
    if (typeof proveedores !== 'undefined') {
      proveedores = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    }
  } else {
    await subirProveedores();
  }
}
async function subirProveedores() {
  if (typeof proveedores === 'undefined') return;
  const batch = db.batch();
  proveedores.forEach(p => batch.set(db.collection(COL.proveedores).doc(String(p.id)), limpiarObj(p)));
  await batch.commit();
  addFBLog(true, 'Proveedores subidos');
}
async function guardarProveedor(p) {
  if (!firebaseReady || !p) return;
  await db.collection(COL.proveedores).doc(String(p.id)).set(limpiarObj(p));
}
async function eliminarProveedor(id) {
  if (!firebaseReady) return;
  await db.collection(COL.proveedores).doc(String(id)).delete();
}

/* ── HISTORIAL DÍAS ── */
async function cargarHistDays() {
  try {
    const snap = await db.collection(COL.histDays).orderBy('fecha', 'desc').limit(60).get();
    if (!snap.empty && typeof histDays !== 'undefined') {
      histDays = snap.docs.map(d => d.data());
    }
  } catch(e) { /* ok */ }
}
async function guardarHistDay(dia) {
  if (!firebaseReady || !dia) return;
  await db.collection(COL.histDays).doc(dia.fecha).set(limpiarObj(dia));
}

/* ── CONFIG ── */
async function cargarConfig() {
  try {
    const doc = await db.collection(COL.config).doc('negocio').get();
    if (doc.exists && typeof biz !== 'undefined') {
      const data = doc.data();
      if (data.biz) {
        biz = data.biz;
        const cn = document.getElementById('cname');
        const cp = document.getElementById('cphone');
        const ca = document.getElementById('caddr');
        if (cn) cn.value = biz.name || 'Tacos Totous';
        if (cp) cp.value = biz.phone || '';
        if (ca) ca.value = biz.address || '';
      }
    }
  } catch(e) { /* ok */ }
}
async function guardarConfig() {
  if (!firebaseReady || typeof biz === 'undefined') return;
  await db.collection(COL.config).doc('negocio').set({ biz: limpiarObj(biz) });
  addFBLog(true, 'Configuración guardada');
}

/* ── SYNC TOTAL ── */
async function syncTodoFirebase() {
  if (!firebaseReady) { alert('Firebase no conectado.'); return; }
  showFBStatus('loading', '⏳ Sincronizando...');
  try {
    await subirProductos();
    await subirIngredientes();
    await subirProduccion();
    await subirStaff();
    await subirProveedores();
    if (typeof recetas !== 'undefined' && recetas.length) {
      const batch = db.batch();
      recetas.forEach(r => batch.set(db.collection(COL.recetas).doc(String(r.id)), limpiarObj(r)));
      await batch.commit();
      addFBLog(true, 'Recetas sincronizadas');
    }
    showFBStatus('ok', '✅ Todo sincronizado');
    addFBLog(true, 'Sync completo');
  } catch(e) {
    showFBStatus('error', '❌ Error sync');
    addFBLog(false, e.message);
  }
}

/* ── PARCHES A FUNCIONES EXISTENTES ── */
window._fbPatchVenta       = async (tx) => { await guardarVenta(tx); tx.items.forEach(async i => { const p = products?.find(x=>x.id===i.id); if(p) await guardarProducto(p); }); };
window._fbPatchSaveProd    = async (p)  => { await guardarProducto(p); };
window._fbPatchDelProd     = async (id) => { await eliminarProducto(id); };
window._fbPatchSaveIngr    = async (i)  => { await guardarIngrediente(i); };
window._fbPatchDelIngr     = async (id) => { await eliminarIngrediente(id); };
window._fbPatchAdjIngr     = async (id) => { const i = ingredientes?.find(x=>x.id===id); if(i) await guardarIngrediente(i); };
window._fbPatchSaveProd2   = async (p)  => { await guardarProduccionItem(p); };
window._fbPatchDelProd2    = async (id) => { await eliminarProduccionItem(id); };
window._fbPatchAdjProd2    = async (id) => { const p = produccion?.find(x=>x.id===id); if(p) await guardarProduccionItem(p); };
window._fbPatchSaveReceta  = async (r)  => { await guardarReceta(r); };
window._fbPatchDelReceta   = async (id) => { await eliminarReceta(id); };
window._fbPatchSaveCompra  = async (c)  => { await guardarCompra(c); };
window._fbPatchDelCompra   = async (id) => { await eliminarCompra(id); };
window._fbPatchSyncCompra  = async (c)  => { await actualizarCompra(c); const i = ingredientes?.find(x=>x.id===c.productoId); if(i) await guardarIngrediente(i); };
window._fbPatchSaveProdLog = async (l)  => { await guardarProdLog(l); };
window._fbPatchDelProdLog  = async (id) => { await eliminarProdLog(id); };
window._fbPatchSyncProdLog = async (l)  => { await actualizarProdLog(l); const p = produccion?.find(x=>x.id===l.productoId); if(p) await guardarProduccionItem(p); };
window._fbPatchSaveStaff   = async (s)  => { await guardarStaffMiembro(s); };
window._fbPatchDelStaff    = async (id) => { await eliminarStaffMiembro(id); };
window._fbPatchSaveEmp     = async (e)  => { await guardarEmpleado(e); };
window._fbPatchDelEmp      = async (id) => { await eliminarEmpleado(id); };
window._fbPatchSaveProv    = async (p)  => { await guardarProveedor(p); };
window._fbPatchDelProv     = async (id) => { await eliminarProveedor(id); };
window._fbPatchSaveBiz     = async ()   => { await guardarConfig(); };

/* ── INICIAR CUANDO TODO ESTÉ LISTO ── */
window.addEventListener('load', () => {
  initFirebase();
});
