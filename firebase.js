/* ══════════════════════════════════════════════════════════════
   FIREBASE.JS — Tacos Totous POS
   Integración completa con Cloud Firestore
   Reemplaza Google Sheets por Firebase como base de datos
   ══════════════════════════════════════════════════════════════ */

// ── 1. IMPORTAR FIREBASE (CDN via módulos ES) ──────────────────
// NOTA: index.html debe cargar este archivo con type="module"
// o usar los scripts de compatibilidad de Firebase.
// Usamos la versión CDN compatible (compat) para no romper
// la arquitectura actual de scripts separados.

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRJ3YV5gEbDeiKXMctjcc0koRyctQub5w",
  authDomain: "sistema-pos-tacos-totous.firebaseapp.com",
  projectId: "sistema-pos-tacos-totous",
  storageBucket: "sistema-pos-tacos-totous.firebasestorage.app",
  messagingSenderId: "510864516004",
  appId: "1:510864516004:web:1eacc8d928250736d25731"
};

// ── 2. INICIALIZAR FIREBASE ────────────────────────────────────
let db = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.warn('⚠️ Firebase SDK no cargado. Verifica los scripts en index.html.');
      showFBStatus('error', '❌ Firebase SDK no encontrado');
      return;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseReady = true;
    console.log('✅ Firebase conectado correctamente');
    showFBStatus('ok', '✅ Firebase conectado');
    // Cargar todos los datos al iniciar
    cargarTodosDatos();
  } catch (e) {
    console.error('❌ Error al inicializar Firebase:', e);
    showFBStatus('error', '❌ Error: ' + e.message);
  }
}

// ── 3. ESTADO DE CONEXIÓN (UI) ─────────────────────────────────
function showFBStatus(tipo, msg) {
  // Actualiza el indicador en Configuración si existe
  const el = document.getElementById('syncSt');
  if (!el) return;
  el.className = 'syst ' + (tipo === 'ok' ? 'sy1' : tipo === 'error' ? 'sy2' : 'sy0');
  el.textContent = msg;
}

function addFBLog(ok, msg) {
  const t = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  slogData.unshift({ ok, msg, t });
  if (slogData.length > 20) slogData.pop();
  const logEl = document.getElementById('slog');
  if (logEl) {
    logEl.innerHTML = slogData.map(e =>
      `<div class="sli">
        <span class="${e.ok ? 'slok' : 'sler'}">${e.ok ? '✅' : '❌'} ${e.msg}</span>
        <span class="slt">${e.t}</span>
      </div>`
    ).join('');
  }
}

// ── 4. COLECCIONES FIREBASE ────────────────────────────────────
// Nombres de las colecciones en Firestore
const COL = {
  ventas:       'ventas',        // Transacciones / órdenes cobradas
  productos:    'productos',     // Catálogo del menú
  ingredientes: 'ingredientes',  // Insumos de compra
  produccion:   'produccion',    // Elaborados / preparados
  recetas:      'recetas',       // Recetas y subrecetas
  compras:      'compras',       // Registro de compras
  prodLogs:     'prodLogs',      // Log de producciones
  staff:        'staff',         // Usuarios / personal con acceso
  empleados:    'empleados',     // Empleados con nómina
  proveedores:  'proveedores',   // Proveedores / tiendas
  histDays:     'histDays',      // Historial de días (dashboard)
  config:       'config',        // Configuración del negocio
};

// ── 5. CARGA INICIAL DE DATOS ──────────────────────────────────
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
    // Recetas al final — depende de que recetas.js ya cargó
    if (typeof recetas !== 'undefined') {
      await cargarRecetas();
    }
    showFBStatus('ok', '✅ Datos cargados desde Firebase');
    addFBLog(true, 'Carga inicial completa');
    renderCats && renderCats();
    renderProds && renderProds();
    renderInvFull && renderInvFull();
    initLogin && initLogin();
  } catch (e) {
    console.error('Error cargando datos:', e);
    showFBStatus('error', '❌ Error al cargar: ' + e.message);
    addFBLog(false, 'Error carga: ' + e.message);
   }
  }
   
    // Refrescar UI
    renderCats();
    renderProds();
    renderInvFull && renderInvFull();
    initLogin();
  } catch (e) {
    console.error('Error cargando datos:', e);
    showFBStatus('error', '❌ Error al cargar: ' + e.message);
    addFBLog(false, 'Error carga: ' + e.message);
  }
}

// ── 6. PRODUCTOS ───────────────────────────────────────────────
async function cargarProductos() {
  const snap = await db.collection(COL.productos).get();
  if (!snap.empty) {
    products = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    // Primera vez: subir los productos predeterminados
    await subirProductos();
  }
}

async function subirProductos() {
  const batch = db.batch();
  products.forEach(p => {
    const ref = db.collection(COL.productos).doc(String(p.id));
    batch.set(ref, limpiarObj(p));
  });
  await batch.commit();
  addFBLog(true, 'Productos subidos (' + products.length + ')');
}

async function guardarProducto(producto) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.productos).doc(String(producto.id)).set(limpiarObj(producto));
    addFBLog(true, 'Producto guardado: ' + producto.name);
  } catch (e) {
    addFBLog(false, 'Error guardando producto: ' + e.message);
  }
}

async function eliminarProducto(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.productos).doc(String(id)).delete();
    addFBLog(true, 'Producto eliminado: ' + id);
  } catch (e) {
    addFBLog(false, 'Error eliminando producto: ' + e.message);
  }
}

// ── 7. VENTAS / TRANSACCIONES ──────────────────────────────────
async function guardarVenta(tx) {
  if (!firebaseReady) return;
  try {
    showFBStatus('loading', '⏳ Guardando venta...');
    const data = {
      ...limpiarObj(tx),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection(COL.ventas).doc(String(tx.id)).set(data);
    showFBStatus('ok', '✅ Venta #' + tx.id + ' guardada');
    addFBLog(true, 'Venta #' + tx.id + ' · $' + tx.total.toFixed(2));
  } catch (e) {
    showFBStatus('error', '❌ Error guardando venta');
    addFBLog(false, 'Error venta #' + tx.id + ': ' + e.message);
  }
}

async function cargarVentas() {
  if (!firebaseReady) return;
  try {
    const snap = await db.collection(COL.ventas).orderBy('timestamp', 'desc').limit(200).get();
    if (!snap.empty) {
      txns = snap.docs.map(d => d.data());
      // Recalcular salesTotal
      salesTotal = txns.reduce((s, t) => s + (t.total || 0), 0);
      // Recalcular soldMap
      soldMap = {};
      txns.forEach(t => {
        (t.items || []).forEach(i => {
          soldMap[i.id] = (soldMap[i.id] || 0) + i.qty;
        });
      });
      // Recalcular ownerSales
      ownerSales = { alex: 0, beto: 0 };
      txns.forEach(t => {
        if (t.owner === 'beto') ownerSales.beto += t.total || 0;
        else ownerSales.alex += t.total || 0;
      });
    }
  } catch (e) {
    addFBLog(false, 'Error cargando ventas: ' + e.message);
  }
}

// ── 8. INGREDIENTES ────────────────────────────────────────────
async function cargarIngredientes() {
  const snap = await db.collection(COL.ingredientes).get();
  if (!snap.empty) {
    ingredientes = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    await subirIngredientes();
  }
}

async function subirIngredientes() {
  const batch = db.batch();
  ingredientes.forEach(i => {
    const ref = db.collection(COL.ingredientes).doc(String(i.id));
    batch.set(ref, limpiarObj(i));
  });
  await batch.commit();
  addFBLog(true, 'Ingredientes subidos (' + ingredientes.length + ')');
}

async function guardarIngrediente(ingr) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.ingredientes).doc(String(ingr.id)).set(limpiarObj(ingr));
  } catch (e) {
    addFBLog(false, 'Error guardando ingrediente: ' + e.message);
  }
}

async function eliminarIngrediente(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.ingredientes).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando ingrediente: ' + e.message);
  }
}

// ── 9. PRODUCCIÓN (elaborados) ─────────────────────────────────
async function cargarProduccion() {
  const snap = await db.collection(COL.produccion).get();
  if (!snap.empty) {
    produccion = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    await subirProduccion();
  }
}

async function subirProduccion() {
  const batch = db.batch();
  produccion.forEach(p => {
    const ref = db.collection(COL.produccion).doc(String(p.id));
    batch.set(ref, limpiarObj(p));
  });
  await batch.commit();
  addFBLog(true, 'Producción subida (' + produccion.length + ')');
}

async function guardarProduccionItem(item) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.produccion).doc(String(item.id)).set(limpiarObj(item));
  } catch (e) {
    addFBLog(false, 'Error guardando elaborado: ' + e.message);
  }
}

async function eliminarProduccionItem(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.produccion).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando elaborado: ' + e.message);
  }
}

// ── 10. RECETAS ────────────────────────────────────────────────
async function cargarRecetas() {
  if (typeof recetas === 'undefined') return;
  const snap = await db.collection(COL.recetas).get();
  if (!snap.empty) {
    recetas = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    if (recetas.length) await subirRecetas();
  }
}

async function subirRecetas() {
  if (!recetas.length) return;
  const batch = db.batch();
  recetas.forEach(r => {
    const ref = db.collection(COL.recetas).doc(String(r.id));
    batch.set(ref, limpiarObj(r));
  });
  await batch.commit();
  addFBLog(true, 'Recetas subidas (' + recetas.length + ')');
}

async function guardarReceta(receta) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.recetas).doc(String(receta.id)).set(limpiarObj(receta));
    addFBLog(true, 'Receta guardada: ' + receta.nombre);
  } catch (e) {
    addFBLog(false, 'Error guardando receta: ' + e.message);
  }
}

async function eliminarReceta(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.recetas).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando receta: ' + e.message);
  }
}

// ── 11. COMPRAS ────────────────────────────────────────────────
async function cargarCompras() {
  const snap = await db.collection(COL.compras).orderBy('fecha', 'desc').limit(100).get();
  if (!snap.empty) {
    compras = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  }
}

async function guardarCompra(compra) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.compras).doc(String(compra.id)).set(limpiarObj(compra));
    addFBLog(true, 'Compra guardada: ' + compra.nombre);
  } catch (e) {
    addFBLog(false, 'Error guardando compra: ' + e.message);
  }
}

async function actualizarCompra(compra) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.compras).doc(String(compra.id)).set(limpiarObj(compra));
  } catch (e) {
    addFBLog(false, 'Error actualizando compra: ' + e.message);
  }
}

async function eliminarCompra(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.compras).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando compra: ' + e.message);
  }
}

// ── 12. LOGS DE PRODUCCIÓN ─────────────────────────────────────
async function cargarProdLogs() {
  const snap = await db.collection(COL.prodLogs).orderBy('fecha', 'desc').limit(100).get();
  if (!snap.empty) {
    prodLogs = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  }
}

async function guardarProdLog(log) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.prodLogs).doc(String(log.id)).set(limpiarObj(log));
    addFBLog(true, 'Producción guardada: ' + log.nombre);
  } catch (e) {
    addFBLog(false, 'Error guardando producción: ' + e.message);
  }
}

async function actualizarProdLog(log) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.prodLogs).doc(String(log.id)).set(limpiarObj(log));
  } catch (e) {
    addFBLog(false, 'Error actualizando log de producción: ' + e.message);
  }
}

async function eliminarProdLog(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.prodLogs).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando producción: ' + e.message);
  }
}

// ── 13. STAFF (usuarios con acceso al sistema) ─────────────────
async function cargarStaff() {
  const snap = await db.collection(COL.staff).get();
  if (!snap.empty) {
    staff = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    await subirStaff();
  }
}

async function subirStaff() {
  const batch = db.batch();
  staff.forEach(s => {
    const ref = db.collection(COL.staff).doc(String(s.id));
    batch.set(ref, limpiarObj(s));
  });
  await batch.commit();
  addFBLog(true, 'Staff subido (' + staff.length + ' usuarios)');
}

async function guardarStaffMiembro(miembro) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.staff).doc(String(miembro.id)).set(limpiarObj(miembro));
    addFBLog(true, 'Usuario guardado: ' + miembro.name);
  } catch (e) {
    addFBLog(false, 'Error guardando usuario: ' + e.message);
  }
}

async function eliminarStaffMiembro(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.staff).doc(String(id)).delete();
    addFBLog(true, 'Usuario eliminado');
  } catch (e) {
    addFBLog(false, 'Error eliminando usuario: ' + e.message);
  }
}

// ── 14. EMPLEADOS (nómina) ─────────────────────────────────────
async function cargarEmpleados() {
  const snap = await db.collection(COL.empleados).get();
  if (!snap.empty) {
    empleados = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  }
}

async function guardarEmpleado(emp) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.empleados).doc(String(emp.id)).set(limpiarObj(emp));
    addFBLog(true, 'Empleado guardado: ' + emp.nombre);
  } catch (e) {
    addFBLog(false, 'Error guardando empleado: ' + e.message);
  }
}

async function eliminarEmpleado(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.empleados).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando empleado: ' + e.message);
  }
}

// ── 15. PROVEEDORES ────────────────────────────────────────────
async function cargarProveedores() {
  const snap = await db.collection(COL.proveedores).get();
  if (!snap.empty) {
    proveedores = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
  } else {
    await subirProveedores();
  }
}

async function subirProveedores() {
  const batch = db.batch();
  proveedores.forEach(p => {
    const ref = db.collection(COL.proveedores).doc(String(p.id));
    batch.set(ref, limpiarObj(p));
  });
  await batch.commit();
  addFBLog(true, 'Proveedores subidos');
}

async function guardarProveedor(prov) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.proveedores).doc(String(prov.id)).set(limpiarObj(prov));
  } catch (e) {
    addFBLog(false, 'Error guardando proveedor: ' + e.message);
  }
}

async function eliminarProveedor(id) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.proveedores).doc(String(id)).delete();
  } catch (e) {
    addFBLog(false, 'Error eliminando proveedor: ' + e.message);
  }
}

// ── 16. HISTORIAL DE DÍAS ──────────────────────────────────────
async function cargarHistDays() {
  const snap = await db.collection(COL.histDays).orderBy('fecha', 'desc').limit(60).get();
  if (!snap.empty) {
    histDays = snap.docs.map(d => d.data());
  }
}

async function guardarHistDay(dia) {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.histDays).doc(dia.fecha).set(limpiarObj(dia));
    addFBLog(true, 'Historial del día guardado: ' + dia.fecha);
  } catch (e) {
    addFBLog(false, 'Error guardando historial: ' + e.message);
  }
}

// ── 17. CONFIGURACIÓN DEL NEGOCIO ──────────────────────────────
async function cargarConfig() {
  try {
    const doc = await db.collection(COL.config).doc('negocio').get();
    if (doc.exists) {
      const data = doc.data();
      if (data.biz)  biz = data.biz;
      if (data.name) document.getElementById('cname') && (document.getElementById('cname').value = data.biz?.name || 'Tacos Totous');
      if (data.phone) document.getElementById('cphone') && (document.getElementById('cphone').value = data.biz?.phone || '');
      if (data.address) document.getElementById('caddr') && (document.getElementById('caddr').value = data.biz?.address || '');
    }
  } catch (e) {
    // Config no existe aún, se creará al guardar
  }
}

async function guardarConfig() {
  if (!firebaseReady) return;
  try {
    await db.collection(COL.config).doc('negocio').set({ biz: limpiarObj(biz) });
    addFBLog(true, 'Configuración guardada');
  } catch (e) {
    addFBLog(false, 'Error guardando configuración: ' + e.message);
  }
}

// ── 18. UTILIDADES ─────────────────────────────────────────────
// Elimina campos undefined que Firestore no acepta
function limpiarObj(obj) {
  return JSON.parse(JSON.stringify(obj, (key, val) => {
    if (key === '_fbId') return undefined; // no guardar el ID interno
    return val === undefined ? null : val;
  }));
}

// ── 19. PARCHES A FUNCIONES EXISTENTES ────────────────────────
// Estas funciones reemplazan el comportamiento de Google Sheets
// y conectan cada acción del sistema con Firebase automáticamente.

// === VENTAS ===
// Intercepta processPay() para guardar en Firebase
const _processPay_original = typeof processPay === 'function' ? processPay : null;
window._fbPatchVenta = async function(tx) {
  await guardarVenta(tx);
  // Guardar el stock actualizado de productos afectados
  tx.items.forEach(async item => {
    const p = products.find(x => x.id === item.id);
    if (p) await guardarProducto(p);
  });
};

// === PRODUCTOS ===
window._fbPatchSaveProd = async function(prod) {
  await guardarProducto(prod);
  renderInv && renderInv();
  renderProds && renderProds();
  renderCats && renderCats();
};
window._fbPatchDelProd = async function(id) {
  await eliminarProducto(id);
};

// === INGREDIENTES ===
window._fbPatchSaveIngr = async function(ingr) {
  await guardarIngrediente(ingr);
};
window._fbPatchDelIngr = async function(id) {
  await eliminarIngrediente(id);
};
window._fbPatchAdjIngr = async function(id) {
  const ingr = ingredientes.find(x => x.id === id);
  if (ingr) await guardarIngrediente(ingr);
};

// === PRODUCCIÓN ===
window._fbPatchSaveProd2 = async function(item) {
  await guardarProduccionItem(item);
};
window._fbPatchDelProd2 = async function(id) {
  await eliminarProduccionItem(id);
};
window._fbPatchAdjProd2 = async function(id) {
  const item = produccion.find(x => x.id === id);
  if (item) await guardarProduccionItem(item);
};

// === RECETAS ===
window._fbPatchSaveReceta = async function(receta) {
  await guardarReceta(receta);
};
window._fbPatchDelReceta = async function(id) {
  await eliminarReceta(id);
};

// === COMPRAS ===
window._fbPatchSaveCompra = async function(compra) {
  await guardarCompra(compra);
};
window._fbPatchDelCompra = async function(id) {
  await eliminarCompra(id);
};
window._fbPatchSyncCompra = async function(compra) {
  await actualizarCompra(compra);
  const ingr = ingredientes.find(i => i.id === compra.productoId);
  if (ingr) await guardarIngrediente(ingr);
};

// === PROD LOGS ===
window._fbPatchSaveProdLog = async function(log) {
  await guardarProdLog(log);
};
window._fbPatchDelProdLog = async function(id) {
  await eliminarProdLog(id);
};
window._fbPatchSyncProdLog = async function(log) {
  await actualizarProdLog(log);
  const item = produccion.find(x => x.id === log.productoId);
  if (item) await guardarProduccionItem(item);
};

// === STAFF ===
window._fbPatchSaveStaff = async function(miembro) {
  await guardarStaffMiembro(miembro);
};
window._fbPatchDelStaff = async function(id) {
  await eliminarStaffMiembro(id);
};

// === EMPLEADOS ===
window._fbPatchSaveEmp = async function(emp) {
  await guardarEmpleado(emp);
};
window._fbPatchDelEmp = async function(id) {
  await eliminarEmpleado(id);
};

// === PROVEEDORES ===
window._fbPatchSaveProv = async function(prov) {
  await guardarProveedor(prov);
};
window._fbPatchDelProv = async function(id) {
  await eliminarProveedor(id);
};

// === CONFIGURACIÓN ===
window._fbPatchSaveBiz = async function() {
  await guardarConfig();
};

// ── 20. FUNCIÓN DE SINCRONIZACIÓN MANUAL ──────────────────────
// Botón "Sincronizar Todo" en Configuración
async function syncTodoFirebase() {
  if (!firebaseReady) {
    alert('Firebase no está conectado.');
    return;
  }
  showFBStatus('loading', '⏳ Sincronizando todo...');
  try {
    await Promise.all([
      subirProductos(),
      subirIngredientes(),
      subirProduccion(),
      subirRecetas(),
      subirStaff(),
      subirProveedores(),
    ]);
    showFBStatus('ok', '✅ Todo sincronizado con Firebase');
    addFBLog(true, 'Sincronización completa exitosa');
  } catch (e) {
    showFBStatus('error', '❌ Error en sincronización');
    addFBLog(false, 'Error sync: ' + e.message);
  }
}

// ── 21. INICIAR FIREBASE AL CARGAR LA PÁGINA ──────────────────
// Se llama automáticamente cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebase);
} else {
  initFirebase();
}
