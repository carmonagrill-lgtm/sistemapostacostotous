/* -- Inventario -- */

function renderInvFull(){
  renderInvIngrCatTabs(); renderIngrCards();
  renderInvProdCatTabs(); renderProdCards();
  // Recetas only render when tab is active (saves performance)
}

function adjS(id, d) { const p=products.find(x=>x.id===id); if(p){p.stock=Math.max(0,p.stock+d);renderInv();} }

function openAddProd() {
  editPId=null; document.getElementById('mProdTitle').textContent='Agregar Producto';
  ['fp-name','fp-emoji','fp-price','fp-cost','fp-stock','fp-min'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('fp-cat').value='Tacos'; openM('mProd');
}
function editProd(id) {
  const p=products.find(x=>x.id===id); if(!p) return;
  editPId=id; document.getElementById('mProdTitle').textContent='Editar Producto';
  document.getElementById('fp-name').value=p.name; document.getElementById('fp-emoji').value=p.emoji;
  document.getElementById('fp-price').value=p.price; document.getElementById('fp-cost').value=p.cost;
  document.getElementById('fp-stock').value=p.stock; document.getElementById('fp-min').value=p.min;
  document.getElementById('fp-cat').value=p.cat; openM('mProd');
}
function saveProd() {
  const name=document.getElementById('fp-name').value.trim();
  const emoji=document.getElementById('fp-emoji').value.trim()||'📦';
  const cat=document.getElementById('fp-cat').value;
  const price=parseFloat(document.getElementById('fp-price').value)||0;
  const cost=parseFloat(document.getElementById('fp-cost').value)||0;
  const stock=parseInt(document.getElementById('fp-stock').value)||0;
  const min=parseInt(document.getElementById('fp-min').value)||0;
  if (!name) { alert('El nombre es obligatorio.'); return; }
  if (editPId) { const i=products.findIndex(p=>p.id===editPId); products[i]={...products[i],name,emoji,cat,price,cost,stock,min}; }
  else { const nid=products.length>0?Math.max(...products.map(p=>p.id))+1:1; products.push({id:nid,name,emoji,cat,price,cost,stock,min}); }
  closeM('mProd'); renderInv(); renderProds(); renderCats(); saveProducts();
}
function delProd(id) {
  const p=products.find(x=>x.id===id); if(!p||!confirm(`¿Borrar "${p.name}"?`)) return;
  products=products.filter(x=>x.id!==id);
  packages.forEach(pkg=>{pkg.items=pkg.items.filter(i=>i.id!==id);});
  renderInv(); renderProds(); renderCart(); renderCats(); updateBadge(); saveProducts();
}

/* ══ PERSONAL ══ */


/* -- Compras -- */

function setCompFilter(f, btn) {
  compFilter = f;
  document.querySelectorAll('#comp-filter-tabs .ictab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderCompras();
}

function getFilteredCompras() {
  const today = todayISO();
  const dt = new Date(today);
  if (compFilter === 'hoy') return compras.filter(c=>c.fecha===today);
  if (compFilter === 'semana') {
    const weekAgo = new Date(dt); weekAgo.setDate(weekAgo.getDate()-7);
    const weekStr = weekAgo.toISOString().split('T')[0];
    return compras.filter(c=>c.fecha>=weekStr);
  }
  return compras;
}

function renderCompras() {
  const list = getFilteredCompras();

  // Update KPIs (always today)
  const todayComps = compras.filter(c=>c.fecha===todayISO());
  document.getElementById('comp-hoy-n').textContent = todayComps.length;
  document.getElementById('comp-hoy-t').textContent = '$'+todayComps.reduce((s,c)=>s+c.precio,0).toLocaleString('es-MX',{minimumFractionDigits:2});

  if (!list.length) {
    document.getElementById('comp-list').innerHTML =
      '<div class="comp-empty">Sin compras en este período.<br>Toca <strong>+ Registrar</strong> para empezar.</div>';
    return;
  }

  // Group by date
  const byDate = {};
  list.forEach(c => {
    if (!byDate[c.fecha]) byDate[c.fecha] = [];
    byDate[c.fecha].push(c);
  });

  const catColors = {'Proteínas':'#E85500','Verduras':'#008040','Misceláneos':'#0066BB',
    'Desechables':'#6B31D6','Limpieza':'#BF8850'};

  document.getElementById('comp-list').innerHTML = Object.keys(byDate)
    .sort((a,b)=>b.localeCompare(a))
    .map(fecha => {
      const items = byDate[fecha];
      const totalDia = items.reduce((s,c)=>s+c.precio,0);
      const rows = items.map(c => {
        const ing = ingredientes.find(i=>i.id===c.productoId);
        const color = catColors[ing?.cat]||'#E85500';
        return `<div class="comp-item">
          <div class="comp-item-ico" style="background:${color}">${(c.nombre||'?').charAt(0)}</div>
          <div class="comp-item-inf">
            <div class="comp-item-name">${c.nombre}</div>
            <div class="comp-item-det">${c.cant} ${c.unidad}${c.proveedor?' · '+c.proveedor:''}${c.notas?' · '+c.notas:''}</div>
          </div>
          <span class="comp-item-synced ${c.sincronizado?'synced-yes':'synced-no'}">${c.sincronizado?'✅ Inv.':'⏳ Pend.'}</span>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <div class="comp-item-precio">$${c.precio.toFixed(2)}</div>
            <div style="display:flex;gap:4px;">
              ${!c.sincronizado?`<button class="ied" style="padding:3px 8px;font-size:10px;" onclick="syncCompraInv(${c.id})">📦 Al inv.</button>`:''}
              <button class="idl" style="padding:3px 8px;font-size:10px;" onclick="delCompra(${c.id})">🗑️</button>
            </div>
          </div>
        </div>`;
      }).join('');

      return `<div class="comp-day">
        <div class="comp-day-hdr" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'flex':'none'">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="comp-day-fecha">${fmtDateShort(fecha)}</div>
            <span class="comp-day-badge">${items.length} productos</span>
          </div>
          <div class="comp-day-total">$${totalDia.toLocaleString('es-MX',{minimumFractionDigits:2})}</div>
        </div>
        <div class="comp-items" style="display:flex;">${rows}</div>
      </div>`;
    }).join('');
}

let compMode = 'existente';
let compSelectedId = null; // id of selected existing ingredient

function setCompMode(mode) {
  compMode = mode;
  const isExist = mode === 'existente';
  document.getElementById('comp-panel-exist').style.display = isExist ? 'block' : 'none';
  document.getElementById('comp-panel-nuevo').style.display = isExist ? 'none'  : 'block';
  // Button styles
  const btnE = document.getElementById('comp-mode-exist');
  const btnN = document.getElementById('comp-mode-nuevo');
  if (isExist) {
    btnE.style.cssText = 'flex:1;padding:9px;border-radius:10px;font-size:12px;font-weight:900;cursor:pointer;font-family:Nunito,sans-serif;touch-action:manipulation;border:2px solid var(--c-or);background:rgba(232,85,0,.08);color:var(--c-or);';
    btnN.style.cssText = 'flex:1;padding:9px;border-radius:10px;font-size:12px;font-weight:900;cursor:pointer;font-family:Nunito,sans-serif;touch-action:manipulation;border:2px solid var(--c-bord);background:var(--c-surf2);color:var(--c-tx2);';
  } else {
    btnN.style.cssText = 'flex:1;padding:9px;border-radius:10px;font-size:12px;font-weight:900;cursor:pointer;font-family:Nunito,sans-serif;touch-action:manipulation;border:2px solid var(--c-or);background:rgba(232,85,0,.08);color:var(--c-or);';
    btnE.style.cssText = 'flex:1;padding:9px;border-radius:10px;font-size:12px;font-weight:900;cursor:pointer;font-family:Nunito,sans-serif;touch-action:manipulation;border:2px solid var(--c-bord);background:var(--c-surf2);color:var(--c-tx2);';
  }
  if (!isExist) updateCompUnitFromBase();
}

function filterCompProd() {
  const q = document.getElementById('comp-search').value.toLowerCase().trim();
  const res = document.getElementById('comp-search-results');
  if (!q) { res.style.display='none'; return; }
  const matches = ingredientes.filter(i=>i.nombre.toLowerCase().includes(q)).slice(0,8);
  if (!matches.length) { res.style.display='none'; return; }
  res.style.display = 'block';
  res.innerHTML = matches.map(i=>
    `<div onclick="selectCompProd(${i.id})"
      style="padding:10px 14px;cursor:pointer;font-size:13px;font-weight:700;color:var(--c-tx);border-bottom:1px solid var(--c-bord);display:flex;justify-content:space-between;align-items:center;"
      onmouseover="this.style.background='var(--c-surf2)'" onmouseout="this.style.background=''">
      <span>${i.nombre}</span>
      <span style="font-size:10px;color:var(--c-tx3);font-weight:600;">${i.cat} · ${i.unidad}</span>
    </div>`
  ).join('');
}

function selectCompProd(id) {
  const ing = ingredientes.find(i=>i.id===id); if(!ing) return;
  compSelectedId = id;
  document.getElementById('comp-search').value = ing.nombre;
  document.getElementById('comp-search-results').style.display = 'none';
  // Show chip
  const chip = document.getElementById('comp-selected-chip');
  chip.style.display = 'flex';
  document.getElementById('comp-selected-name').textContent = ing.nombre + ' · ' + ing.cat;
  // Set units
  setUnitsForIngr(ing.unidad);
  // Pre-fill price
  if (ing.precioCompra) document.getElementById('comp-precio').value = ing.precioCompra;
  updatePrecioUnitComp();
}

function clearCompProd() {
  compSelectedId = null;
  document.getElementById('comp-search').value = '';
  document.getElementById('comp-selected-chip').style.display = 'none';
  document.getElementById('comp-unit').innerHTML = '<option>—</option>';
}

function setUnitsForIngr(unidadBase) {
  const uc = (unidadBase||'').toLowerCase();
  let units = [unidadBase];
  if (uc==='kg')  units = ['Kg','Gr'];
  if (uc==='lt')  units = ['Lt','Ml'];
  document.getElementById('comp-unit').innerHTML = units.map(u=>`<option value="${u}">${u}</option>`).join('');
}

function updateCompUnitFromBase() {
  const base = document.getElementById('comp-new-unit-base')?.value || 'Pieza';
  setUnitsForIngr(base);
}

function openAddCompra() {
  compMode = 'existente';
  compSelectedId = null;
  // Reset all fields
  document.getElementById('comp-search').value = '';
  document.getElementById('comp-search-results').style.display = 'none';
  document.getElementById('comp-selected-chip').style.display = 'none';
  document.getElementById('comp-new-name').value = '';
  document.getElementById('comp-new-cat').value = 'Misceláneos';
  document.getElementById('comp-new-unit-base').value = 'Kg';
  document.getElementById('comp-cant').value = '';
  document.getElementById('comp-precio').value = '';
  document.getElementById('comp-prov').value = '';
  document.getElementById('comp-notas').value = '';
  document.getElementById('comp-precio-unit').textContent = '$0.00';
  document.getElementById('comp-unit').innerHTML = '<option>—</option>';
  document.getElementById('comp-sync').checked = true;
  setCompMode('existente');
  openM('mCompra');
}

function updatePrecioUnitComp() {
  const cant = parseFloat(document.getElementById('comp-cant').value)||0;
  const precio = parseFloat(document.getElementById('comp-precio').value)||0;
  const unit = document.getElementById('comp-unit').value || '';
  const pu = cant>0 ? precio/cant : 0;
  document.getElementById('comp-precio-unit').textContent = '$'+pu.toFixed(2)+(unit?' / '+unit:'');
}

function saveCompra() {
  let prodId = null;
  let nombre = '';

  if (compMode === 'existente') {
    if (!compSelectedId) { alert('Busca y selecciona un producto del inventario.'); return; }
    prodId = compSelectedId;
    const ing = ingredientes.find(i=>i.id===prodId);
    nombre = ing?.nombre || '?';
  } else {
    // Nuevo producto manual
    nombre = document.getElementById('comp-new-name').value.trim();
    if (!nombre) { alert('Escribe el nombre del producto.'); return; }
    const cat   = document.getElementById('comp-new-cat').value;
    const unit  = document.getElementById('comp-new-unit-base').value;
    const precio = parseFloat(document.getElementById('comp-precio').value)||0;
    const cant   = parseFloat(document.getElementById('comp-cant').value)||0;
    // Create new ingredient
    const nid = ingredientes.length ? Math.max(...ingredientes.map(i=>i.id))+1 : 1;
    const newIngr = {
      id:nid, nombre, cat, unidad:unit,
      stock:0, min:1,
      precioCompra: cant>0 ? precio/cant : precio,
      proveedor: document.getElementById('comp-prov').value.trim(),
      notas: document.getElementById('comp-notas').value.trim(),
    };
    ingredientes.push(newIngr);
    prodId = nid;
  }

  const cant   = parseFloat(document.getElementById('comp-cant').value)||0;
  if (cant<=0) { alert('La cantidad debe ser mayor a 0.'); return; }
  const unidad = document.getElementById('comp-unit').value;
  const precio = parseFloat(document.getElementById('comp-precio').value)||0;
  const prov   = document.getElementById('comp-prov').value.trim();
  const notas  = document.getElementById('comp-notas').value.trim();
  const sync   = document.getElementById('comp-sync').checked;

  // Update precioCompra with latest price per unit
  const ing = ingredientes.find(i=>i.id===prodId);
  if (ing && precio>0 && cant>0) ing.precioCompra = precio/cant;
  if (ing && prov) ing.proveedor = prov;

  const nid = compras.length ? Math.max(...compras.map(c=>c.id))+1 : 1;
  const compra = {id:nid, fecha:todayISO(), productoId:prodId, nombre, cant, unidad, precio, proveedor:prov, notas, sincronizado:false};
  compras.unshift(compra);

  if (sync) syncCompraInv(nid, true);

  closeM('mCompra');
  renderCompras();
  renderIngrCards();
  renderInvIngrCatTabs();
}

function syncCompraInv(id, silent=false) {
  const c = compras.find(x=>x.id===id);
  if (!c || c.sincronizado) return;
  const ing = ingredientes.find(i=>i.id===c.productoId);
  if (!ing) { if(!silent) alert('Producto no encontrado en inventario.'); return; }

  // Convert units if needed
  const uc = ing.unidad.toLowerCase();
  const ur = c.unidad.toLowerCase();
  let cantToAdd = c.cant;
  if (uc==='kg' && ur==='gr') cantToAdd = c.cant/1000;
  if (uc==='lt' && ur==='ml') cantToAdd = c.cant/1000;
  if (uc==='gr' && ur==='kg') cantToAdd = c.cant*1000;
  if (uc==='ml' && ur==='lt') cantToAdd = c.cant*1000;

  ing.stock = Math.round((ing.stock + cantToAdd)*100)/100;
  c.sincronizado = true;
  renderCompras();
  renderIngrCards();
  if (!silent) {
    // Show brief confirmation inline — no alert
    renderCompras();
  }
}

function delCompra(id) {
  compras = compras.filter(x=>x.id!==id);
  renderCompras();
}

/* ══ EMPLEADOS ══ */
let empleados = [];
let editEmpId = null;
let bajaEmpId = null;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function fmtDate(d) {
  if (!d) return '—';
  const [y,m,dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}
function antiguedad(fin) {
  if (!fin) return '';
  const ms = Date.now() - new Date(fin).getTime();
  const dias = Math.floor(ms/86400000);
  if (dias < 30) return `${dias}d`;
  if (dias < 365) return `${Math.floor(dias/30)}m`;
  const y = Math.floor(dias/365), m = Math.floor((dias%365)/30);
  return m > 0 ? `${y}a ${m}m` : `${y}a`;
}


/* -- Proveedores -- */

function renderProvList() {
  const el = document.getElementById('prov-list');
  if (!el) return;
  if (!proveedores.length) {
    el.innerHTML = '<div style="color:var(--c-tx3);font-size:12px;font-weight:700;text-align:center;padding:12px 0;">Sin proveedores registrados</div>';
    return;
  }
  el.innerHTML = proveedores.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--c-bord);">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--c-surf2);border:1.5px solid var(--c-bord);
        display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">
        ${TIPO_ICONS[p.tipo]||'📍'}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:800;color:var(--c-tx);">${p.nombre}</div>
        <div style="font-size:10px;color:var(--c-tx3);font-weight:600;margin-top:1px;">${p.tipo}${p.telefono?' · '+p.telefono:''}${p.notas?' · '+p.notas:''}</div>
      </div>
      <div style="display:flex;gap:5px;flex-shrink:0;">
        <button class="ied" style="padding:5px 8px;font-size:11px;" onclick="editProv(${p.id})">✏️</button>
        <button class="idl" style="padding:5px 8px;font-size:11px;" onclick="delProv(${p.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function openAddProv() {
  editProvId = null;
  document.getElementById('mProvTtl').textContent = 'Agregar Proveedor';
  ['pv-nombre','pv-tel','pv-notas'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pv-tipo').value = 'Otro';
  openM('mProv');
}
function editProv(id) {
  const p = proveedores.find(x=>x.id===id); if(!p) return;
  editProvId = id;
  document.getElementById('mProvTtl').textContent = 'Editar Proveedor';
  document.getElementById('pv-nombre').value = p.nombre;
  document.getElementById('pv-tipo').value   = p.tipo;
  document.getElementById('pv-tel').value    = p.telefono;
  document.getElementById('pv-notas').value  = p.notas;
  openM('mProv');
}
function saveProv() {
  const nombre = document.getElementById('pv-nombre').value.trim();
  if (!nombre) { alert('El nombre es obligatorio.'); return; }
  const data = {nombre, tipo:document.getElementById('pv-tipo').value,
    telefono:document.getElementById('pv-tel').value.trim(),
    notas:document.getElementById('pv-notas').value.trim()};
  if (editProvId) {
    const i = proveedores.findIndex(p=>p.id===editProvId);
    proveedores[i] = {...proveedores[i], ...data};
  } else {
    const nid = proveedores.length ? Math.max(...proveedores.map(p=>p.id))+1 : 1;
    proveedores.push({id:nid, ...data});
  }
  closeM('mProv');
  renderProvList();
}
function delProv(id) {
  proveedores = proveedores.filter(p=>p.id!==id);
  renderProvList();
}

/* ── Proveedor search in compra modal ── */
function filterProvSearch() {
  const q = (document.getElementById('comp-prov').value||'').toLowerCase().trim();
  const res = document.getElementById('prov-results');

  // Always show all when focused and empty, filter when typing
  const matches = q
    ? proveedores.filter(p=>p.nombre.toLowerCase().includes(q))
    : proveedores;

  if (!matches.length) { res.style.display='none'; return; }

  res.style.display = 'block';
  res.innerHTML = matches.map(p =>
    `<div onclick="selectProv('${p.nombre.replace(/'/g,"\'")}',event)"
      style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--c-bord);"
      onmouseover="this.style.background='var(--c-surf2)'" onmouseout="this.style.background=''">
      <span style="font-size:16px;">${TIPO_ICONS[p.tipo]||'📍'}</span>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;color:var(--c-tx);">${p.nombre}</div>
        <div style="font-size:10px;color:var(--c-tx3);font-weight:600;">${p.tipo}</div>
      </div>
    </div>`
  ).join('') +
  // Add new option at bottom
  `<div onclick="addProvFromCompra(event)"
    style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;background:var(--c-surf2);"
    onmouseover="this.style.background='var(--c-surf3)'" onmouseout="this.style.background='var(--c-surf2)'">
    <span style="font-size:14px;">➕</span>
    <div style="font-size:12px;font-weight:800;color:var(--c-or);">Agregar "${document.getElementById('comp-prov').value.trim()}" como nuevo proveedor</div>
  </div>`;
}

function selectProv(nombre, event) {
  if (event) event.stopPropagation();
  document.getElementById('comp-prov').value = nombre;
  document.getElementById('prov-results').style.display = 'none';
}

function addProvFromCompra(event) {
  if (event) event.stopPropagation();
  const nombre = document.getElementById('comp-prov').value.trim();
  if (!nombre) return;
  // Add with basic info
  const nid = proveedores.length ? Math.max(...proveedores.map(p=>p.id))+1 : 1;
  proveedores.push({id:nid, nombre, tipo:'Otro', telefono:'', notas:''});
  document.getElementById('prov-results').style.display = 'none';
  renderProvList();
}

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  const res = document.getElementById('prov-results');
  if (res && !e.target.closest('#comp-prov') && !e.target.closest('#prov-results')) {
    res.style.display = 'none';
  }
});


/* -- Producciones -- */

function setProdFilter(f, btn) {
  prodFilter = f;
  document.querySelectorAll('#v-prod .ictab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderProdLogs();
}

function getFilteredProdLogs() {
  const today = todayISO();
  if (prodFilter==='hoy') return prodLogs.filter(l=>l.fecha===today);
  if (prodFilter==='semana') {
    const d = new Date(today); d.setDate(d.getDate()-7);
    const w = d.toISOString().split('T')[0];
    return prodLogs.filter(l=>l.fecha>=w);
  }
  return prodLogs;
}

function renderProdLogs() {
  const today = todayISO();
  const todayLogs = prodLogs.filter(l=>l.fecha===today);
  document.getElementById('pl-hoy-n').textContent = todayLogs.length;
  document.getElementById('pl-hoy-s').textContent = todayLogs.filter(l=>l.cat==='Salsas').length;
  document.getElementById('pl-hoy-g').textContent = todayLogs.filter(l=>l.cat==='Guisos').length;

  const list = getFilteredProdLogs();
  const el = document.getElementById('prod-log-list');
  if (!list.length) {
    el.innerHTML='<div class="comp-empty">Sin producciones en este período.<br>Toca <strong>+ Registrar</strong> para empezar.</div>';
    return;
  }
  // Group by date
  const byDate = {};
  list.forEach(l=>{ if(!byDate[l.fecha]) byDate[l.fecha]=[]; byDate[l.fecha].push(l); });

  el.innerHTML = Object.keys(byDate).sort((a,b)=>b.localeCompare(a)).map(fecha => {
    const items = byDate[fecha];
    const rows = items.map(l=>{
      const color = CAT_COLORS_PROD[l.cat]||'#008040';
      const ico   = CAT_EMOJIS_PROD[l.cat]||'🍳';
      return `<div class="plog-item">
        <div class="plog-item-ico" style="background:${color}18;border:1.5px solid ${color}40;">${ico}</div>
        <div class="plog-item-inf">
          <div class="plog-item-name">${l.nombre}</div>
          <div class="plog-item-det">${l.cat}${l.quien?' · '+l.quien:''}${l.notas?' · '+l.notas:''}</div>
        </div>
        <span class="plog-item-synced ${l.sincronizado?'synced-yes':'synced-no'}"
          style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;flex-shrink:0;">
          ${l.sincronizado?'✅ Inv.':'⏳ Pend.'}
        </span>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
          <div class="plog-item-cant">${l.cant} ${l.unidad}</div>
          <div style="display:flex;gap:4px;">
            ${!l.sincronizado?`<button class="ied" style="padding:3px 8px;font-size:10px;" onclick="syncProdLog(${l.id})">📦 Al inv.</button>`:''}
            <button class="idl" style="padding:3px 8px;font-size:10px;" onclick="delProdLog(${l.id})">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join('');
    return `<div class="plog-day">
      <div class="plog-day-hdr" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'flex':'none'">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="plog-day-fecha">${fmtDateShort(fecha)}</div>
          <span class="plog-day-badge">${items.length} lotes</span>
        </div>
      </div>
      <div class="plog-items" style="display:flex;">${rows}</div>
    </div>`;
  }).join('');
}

function openAddProdLog() {
  plSelectedId = null;
  document.getElementById('pl-search').value = '';
  document.getElementById('pl-results').style.display = 'none';
  document.getElementById('pl-chip').style.display = 'none';
  document.getElementById('pl-cant').value = '';
  document.getElementById('pl-quien').value = '';
  document.getElementById('pl-notas').value = '';
  document.getElementById('pl-receta-info').style.display = 'none';
  document.getElementById('pl-sync').checked = true;
  document.getElementById('pl-unit').value = 'Lt';
  openM('mProdLog');
}

function filterProdLog() {
  const q = (document.getElementById('pl-search').value||'').toLowerCase().trim();
  const res = document.getElementById('pl-results');
  const matches = q
    ? produccion.filter(p=>p.nombre.toLowerCase().includes(q))
    : produccion;
  if (!matches.length) { res.style.display='none'; return; }
  res.style.display = 'block';
  res.innerHTML = matches.slice(0,10).map(p=>{
    const color = CAT_COLORS_PROD[p.cat]||'#008040';
    const ico   = CAT_EMOJIS_PROD[p.cat]||'🍳';
    return `<div onclick="selectProdLog(${p.id})"
      style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--c-bord);"
      onmouseover="this.style.background='var(--c-surf2)'" onmouseout="this.style.background=''">
      <span style="font-size:18px;">${ico}</span>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;color:var(--c-tx);">${p.nombre}</div>
        <div style="font-size:10px;color:${color};font-weight:700;">${p.cat} · ${p.unidad}</div>
      </div>
      <span style="font-size:11px;font-weight:700;color:var(--c-tx3);">Stock: ${p.stock}</span>
    </div>`;
  }).join('');
}

function selectProdLog(id) {
  const p = produccion.find(x=>x.id===id); if(!p) return;
  plSelectedId = id;
  document.getElementById('pl-search').value = p.nombre;
  document.getElementById('pl-results').style.display = 'none';
  // Show chip
  const chip = document.getElementById('pl-chip');
  chip.style.display = 'flex';
  document.getElementById('pl-chip-name').textContent = p.nombre;
  document.getElementById('pl-chip-cat').textContent  = p.cat + ' · Stock actual: ' + p.stock + ' ' + p.unidad;
  // Set unit
  document.getElementById('pl-unit').value = p.unidad;
  // Check if has associated recipe
  const rec = recetas.find(r=>r.nombre.toLowerCase()===p.nombre.toLowerCase());
  if (rec) {
    const costos = calcCostoReceta(rec);
    document.getElementById('pl-receta-info').style.display = 'block';
    document.getElementById('pl-receta-nombre').textContent = rec.nombre + ' · rinde ' + rec.rinde + ' ' + (rec.rindeUnit||'porciones');
    document.getElementById('pl-receta-costo').textContent  = 'Costo total: $'+costos.total.toFixed(2)+' · Por porción: $'+costos.porcion.toFixed(2);
  } else {
    document.getElementById('pl-receta-info').style.display = 'none';
  }
}

function clearProdLog() {
  plSelectedId = null;
  document.getElementById('pl-search').value = '';
  document.getElementById('pl-chip').style.display = 'none';
  document.getElementById('pl-receta-info').style.display = 'none';
}

function saveProdLog() {
  if (!plSelectedId) { alert('Selecciona qué preparaste.'); return; }
  const cant = parseFloat(document.getElementById('pl-cant').value)||0;
  if (cant<=0) { alert('La cantidad debe ser mayor a 0.'); return; }
  const p     = produccion.find(x=>x.id===plSelectedId);
  const unidad= document.getElementById('pl-unit').value;
  const quien = document.getElementById('pl-quien').value.trim();
  const notas = document.getElementById('pl-notas').value.trim();
  const sync  = document.getElementById('pl-sync').checked;
  const rec   = recetas.find(r=>r.nombre.toLowerCase()===(p?.nombre||'').toLowerCase());

  const nid = prodLogs.length ? Math.max(...prodLogs.map(l=>l.id))+1 : 1;
  const log = {
    id:nid, fecha:todayISO(),
    productoId:plSelectedId, nombre:p?.nombre||'?', cat:p?.cat||'',
    cant, unidad, quien, notas,
    recetaId: rec?.id||null,
    sincronizado:false,
  };
  prodLogs.unshift(log);
  if (sync) syncProdLog(nid, true);
  closeM('mProdLog');
  renderProdLogs();
  renderProdCards();
}

function syncProdLog(id, silent=false) {
  const l = prodLogs.find(x=>x.id===id);
  if (!l || l.sincronizado) return;
  const p = produccion.find(x=>x.id===l.productoId);
  if (!p) { if(!silent) alert('Producto no encontrado en producción.'); return; }
  // Convert if needed
  const ub = (p.unidad||'').toLowerCase();
  const ul = (l.unidad||'').toLowerCase();
  let cant = l.cant;
  if (ub==='kg' && ul==='gr') cant = l.cant/1000;
  if (ub==='lt' && ul==='ml') cant = l.cant/1000;
  if (ub==='gr' && ul==='kg') cant = l.cant*1000;
  if (ub==='ml' && ul==='lt') cant = l.cant*1000;
  p.stock = Math.round((p.stock + cant)*100)/100;
  l.sincronizado = true;
  renderProdLogs();
  renderProdCards();
}

function delProdLog(id) {
  prodLogs = prodLogs.filter(x=>x.id!==id);
  renderProdLogs();
}

// Hide prod dropdown on outside click
document.addEventListener('click', (e)=>{
  const res = document.getElementById('pl-results');
  if (res && !e.target.closest('#pl-search') && !e.target.closest('#pl-results'))
    res.style.display = 'none';
});

/* ══ COMPRAS ══ */
/* ══ PROVEEDORES ══ */
let proveedores = [
  {id:1, nombre:'Chorizería',       tipo:'Especializado', telefono:'', notas:''},
  {id:2, nombre:'Frutería Vallarta', tipo:'Frutería',      telefono:'', notas:''},
  {id:3, nombre:'Ramos',             tipo:'Carnicería',    telefono:'', notas:''},
  {id:4, nombre:'Merco',             tipo:'Supermercado',  telefono:'', notas:''},
  {id:5, nombre:'Costco',            tipo:'Mayorista',     telefono:'', notas:''},
];

let compras = []; // [{id, fecha, productoId, nombre, cant, unidad, precio, proveedor, notas, sincronizado}]
let compFilter = 'hoy';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const dt = new Date(iso+'T12:00:00');
  return `${days[dt.getDay()]} ${d}/${m}/${y}`;
}

/* ── Proveedores ── */
let editProvId = null;

const TIPO_ICONS = {
  'Supermercado':'🏪','Mayorista':'🏭','Frutería':'🍊','Carnicería':'🥩',
  'Chorizería':'🌭','Lácteos':'🥛','Abarrotes':'📦','Especializado':'⭐','Otro':'📍'
};