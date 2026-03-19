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
  closeM('mProd'); renderInv(); renderProds(); renderCats();
}
function delProd(id) {
  const p=products.find(x=>x.id===id); if(!p||!confirm(`¿Borrar "${p.name}"?`)) return;
  products=products.filter(x=>x.id!==id);
  packages.forEach(pkg=>{pkg.items=pkg.items.filter(i=>i.id!==id);});
  renderInv(); renderProds(); renderCart(); renderCats(); updateBadge();
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
  document.getElementById('pl-hoy-s').textContent = todayLogs.filter(l=>l.tipo==='salsa'||l.cat==='Salsas').length;
  const plHoyP = document.getElementById('pl-hoy-p');
  if(plHoyP) plHoyP.textContent = todayLogs.filter(l=>l.tipo==='porcionado').length;
  document.getElementById('pl-hoy-g').textContent = todayLogs.filter(l=>l.tipo==='guiso'||l.cat==='Guisos').length;

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
          <div class="plog-item-det">${l.tipo||l.cat}${l.porcionado?' · desde '+l.porcionado.ingrNombre+' ('+l.porcionado.cantIngr+' '+l.porcionado.unitIngr+')':''}${l.quien?' · '+l.quien:''}</div>
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

let plTipoActual = 'guiso';
let plPorcIngrId = null;

function setProdTipo(tipo, btn) {
  plTipoActual = tipo;
  document.querySelectorAll('.pl-tipo-btn').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  // Show/hide porcionado section
  const porcWrap = document.getElementById('pl-porc-wrap');
  if (porcWrap) porcWrap.style.display = tipo==='porcionado' ? 'block' : 'none';
  // Update labels
  const labelProd = document.getElementById('pl-label-prod');
  const labelCant = document.getElementById('pl-label-cant');
  if (labelProd) labelProd.textContent = tipo==='porcionado' ? 'Nombre de la porcion (resultado)' : 'Producto elaborado';
  if (labelCant) labelCant.textContent = tipo==='porcionado' ? 'Porciones obtenidas' : 'Cantidad producida';
  // Update titulo
  const titulos = {guiso:'Registrar Guiso',salsa:'Registrar Salsa',porcionado:'Registrar Porcionado',bebida:'Registrar Bebida preparada',otro:'Registrar Elaborado'};
  const tituloEl = document.getElementById('pl-titulo');
  if (tituloEl) tituloEl.textContent = titulos[tipo]||'Registrar Produccion';
  // Default units
  const unitSel = document.getElementById('pl-unit');
  if (unitSel) {
    if (tipo==='salsa'||tipo==='bebida') unitSel.value = 'Lt';
    else if (tipo==='guiso') unitSel.value = 'Kg';
    else if (tipo==='porcionado') unitSel.value = 'Pz';
  }
}

function filterPorcSearch() {
  const q = (document.getElementById('pl-porc-search').value||'').toLowerCase().trim();
  const res = document.getElementById('pl-porc-results');
  const matches = q
    ? ingredientes.filter(i=>i.nombre.toLowerCase().includes(q))
    : ingredientes;
  if (!matches.length) { res.style.display='none'; return; }
  res.style.display = 'block';
  res.innerHTML = matches.slice(0,8).map(i=>
    `<div onclick="selectPorcIngr(${i.id})"
      style="padding:9px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--c-bord);font-size:13px;font-weight:700;color:var(--c-tx);"
      onmouseover="this.style.background='var(--c-surf2)'" onmouseout="this.style.background=''">
      <span>${i.nombre}</span>
      <span style="font-size:10px;color:var(--c-tx3);font-weight:600;">${i.cat} · ${i.stock} ${i.unidad}</span>
    </div>`
  ).join('');
}

function selectPorcIngr(id) {
  const ing = ingredientes.find(i=>i.id===id); if(!ing) return;
  plPorcIngrId = id;
  document.getElementById('pl-porc-search').value = ing.nombre;
  document.getElementById('pl-porc-results').style.display = 'none';
  document.getElementById('pl-porc-chip').style.display = 'flex';
  document.getElementById('pl-porc-chip-name').textContent = ing.nombre + ' · ' + ing.cat;
  document.getElementById('pl-porc-stock').textContent = ing.stock + ' ' + ing.unidad;
  // Set default unit matching ingredient
  const unitSel = document.getElementById('pl-porc-unit-ingr');
  if (unitSel) unitSel.value = ing.unidad.startsWith('Kg')||ing.unidad==='Kg' ? 'Kg' : ing.unidad.startsWith('Pieza')||ing.unidad==='Pieza' ? 'Pieza' : ing.unidad;
  updatePlRendimiento();
}

function clearPorcSearch() {
  plPorcIngrId = null;
  document.getElementById('pl-porc-search').value = '';
  document.getElementById('pl-porc-chip').style.display = 'none';
  document.getElementById('pl-porc-stock').textContent = '—';
  document.getElementById('pl-rendimiento').style.display = 'none';
}

function updatePlRendimiento() {
  if (plTipoActual !== 'porcionado') return;
  const porciones = parseFloat(document.getElementById('pl-cant').value)||0;
  const cantIngr  = parseFloat(document.getElementById('pl-porc-cant-ingr').value)||0;
  const unitIngr  = document.getElementById('pl-porc-unit-ingr')?.value||'';
  const unitPorc  = document.getElementById('pl-unit')?.value||'Pz';
  const rendEl    = document.getElementById('pl-rendimiento');
  const rendVal   = document.getElementById('pl-rend-val');
  const rendIngr  = document.getElementById('pl-rend-ingr');
  if (!rendEl) return;
  if (porciones > 0 && cantIngr > 0 && plPorcIngrId) {
    rendEl.style.display = 'block';
    if (rendVal) rendVal.textContent = porciones + ' ' + unitPorc;
    if (rendIngr) rendIngr.textContent = '- ' + cantIngr + ' ' + unitIngr;
  } else {
    rendEl.style.display = 'none';
  }
}

function openAddProdLog() {
  plSelectedId = null;
  plPorcIngrId = null;
  plTipoActual = 'guiso';
  // Reset all fields
  ['pl-search','pl-cant','pl-quien','pl-notas','pl-porc-search','pl-porc-cant-ingr'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value='';
  });
  ['pl-results','pl-chip','pl-receta-info','pl-rendimiento'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.style.display='none';
  });
  document.getElementById('pl-porc-chip').style.display = 'none';
  document.getElementById('pl-porc-stock').textContent = '—';
  document.getElementById('pl-sync').checked = true;
  document.getElementById('pl-unit').value = 'Kg';
  document.getElementById('pl-porc-wrap').style.display = 'none';
  document.getElementById('pl-titulo').textContent = 'Registrar Guiso';
  // Reset tipo buttons
  document.querySelectorAll('.pl-tipo-btn').forEach(b=>b.classList.remove('on'));
  const firstBtn = document.querySelector('.pl-tipo-btn[data-tipo="guiso"]');
  if (firstBtn) firstBtn.classList.add('on');
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
  if (!plSelectedId) { alert('Selecciona el producto elaborado.'); return; }
  const cant = parseFloat(document.getElementById('pl-cant').value)||0;
  if (cant<=0) { alert('La cantidad debe ser mayor a 0.'); return; }

  // Porcionado: validar ingrediente fuente
  if (plTipoActual === 'porcionado') {
    if (!plPorcIngrId) { alert('Selecciona el ingrediente a porcionar.'); return; }
    const cantIngr = parseFloat(document.getElementById('pl-porc-cant-ingr').value)||0;
    if (cantIngr<=0) { alert('Indica cuánto ingrediente se usó.'); return; }
  }

  const p      = produccion.find(x=>x.id===plSelectedId);
  const unidad = document.getElementById('pl-unit').value;
  const quien  = document.getElementById('pl-quien').value.trim();
  const notas  = document.getElementById('pl-notas').value.trim();
  const sync   = document.getElementById('pl-sync').checked;
  const rec    = recetas.find(r=>r.nombre.toLowerCase()===(p?.nombre||'').toLowerCase());

  // Porcionado data
  let porcData = null;
  if (plTipoActual === 'porcionado') {
    const ing = ingredientes.find(i=>i.id===plPorcIngrId);
    porcData = {
      ingrId: plPorcIngrId,
      ingrNombre: ing?.nombre||'?',
      cantIngr: parseFloat(document.getElementById('pl-porc-cant-ingr').value)||0,
      unitIngr: document.getElementById('pl-porc-unit-ingr').value,
    };
    // Descontar ingrediente crudo del inventario
    if (ing) {
      const factor = getConvFactor(ing.unidad, porcData.unitIngr);
      const cantToDeduct = porcData.cantIngr * factor;
      ing.stock = Math.max(0, Math.round((ing.stock - cantToDeduct)*1000)/1000);
      if (ing.stock <= ing.min) {
        setTimeout(()=>showStockAlert([{nombre:ing.nombre, stock:ing.stock, min:ing.min, unidad:ing.unidad}]), 600);
      }
    }
  }

  const nid = prodLogs.length ? Math.max(...prodLogs.map(l=>l.id))+1 : 1;
  const log = {
    id:nid, fecha:todayISO(),
    tipo: plTipoActual,
    productoId:plSelectedId, nombre:p?.nombre||'?', cat:p?.cat||'',
    cant, unidad, quien, notas,
    recetaId: rec?.id||null,
    porcionado: porcData,
    sincronizado:false,
  };
  prodLogs.unshift(log);
  if (sync) syncProdLog(nid, true);
  closeM('mProdLog');
  renderProdLogs();
  renderProdCards();
  renderIngrCards();
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

// Hide prod dropdowns on outside click
document.addEventListener('click', (e)=>{
  const res = document.getElementById('pl-results');
  if (res && !e.target.closest('#pl-search') && !e.target.closest('#pl-results'))
    res.style.display = 'none';
  const pres = document.getElementById('pl-porc-results');
  if (pres && !e.target.closest('#pl-porc-search') && !e.target.closest('#pl-porc-results'))
    pres.style.display = 'none';
});

/* ══ CATÁLOGO DE VENTAS ══ */
let catFilter = 'Todos';
let editProductId = null;
let editCatId = null;

function renderCatalogo() {
  const platillos = products.filter(p=>p.tipo==='platillo');
  const reventa   = products.filter(p=>p.tipo==='reventa');
  const sinReceta = platillos.filter(p=>!p.recetaNombre);

  const kpiP  = document.getElementById('cat-kpi-p');
  const kpiR  = document.getElementById('cat-kpi-r');
  const kpiNR = document.getElementById('cat-kpi-nr');
  if(kpiP)  kpiP.textContent  = platillos.length;
  if(kpiR)  kpiR.textContent  = reventa.length;
  if(kpiNR) kpiNR.textContent = sinReceta.length;

  // Categorías pills
  const catsEl = document.getElementById('cat-cats-list');
  if (catsEl) {
    catsEl.innerHTML = menuCategorias.map(c=>`
      <div style="display:flex;align-items:center;gap:5px;background:var(--c-surf2);border:1.5px solid var(--c-bord);
        border-radius:20px;padding:5px 12px;font-size:11px;font-weight:800;color:var(--c-tx2);">
        <span>${c.emoji}</span><span>${c.nombre}</span>
        <button onclick="delCat(${c.id})" style="background:none;border:none;color:var(--c-re);font-size:12px;cursor:pointer;padding:0 0 0 4px;">✕</button>
      </div>`).join('');
  }

  // Tabs
  const tabsEl = document.getElementById('cat-tabs');
  if (tabsEl) {
    const allCats = ['Todos','Platillos','Reventa',...menuCategorias.map(c=>c.nombre)];
    tabsEl.innerHTML = [...new Set(allCats)].map(c=>
      `<button class="ictab ${c===catFilter?'on':''}" onclick="catFilter='${c}';renderCatalogo()">${c}</button>`
    ).join('');
  }

  // Product list
  let list = products;
  if (catFilter==='Platillos') list = products.filter(p=>p.tipo==='platillo');
  else if (catFilter==='Reventa') list = products.filter(p=>p.tipo==='reventa');
  else if (catFilter!=='Todos') list = products.filter(p=>p.cat===catFilter);

  const listEl = document.getElementById('cat-prod-list');
  if (!listEl) return;

  listEl.innerHTML = list.map(p => {
    const catDef = menuCategorias.find(c=>c.nombre===p.cat);
    const color = catDef?.color || '#E85500';
    const rec = p.recetaNombre ? recetas.find(r=>r.nombre===p.recetaNombre) : null;
    const costos = rec ? calcCostoReceta(rec) : null;
    const margin = p.price > 0 ? ((p.price-(costos?costos.porcion:p.cost))/p.price*100).toFixed(0) : 0;
    const lo = p.stock <= p.min;
    return `<div class="pvcard" style="border-left:4px solid ${color};">
      <div class="pvcard-ico">${p.emoji||'🍽'}</div>
      <div class="pvcard-inf">
        <div class="pvcard-name">${p.name}</div>
        <div class="pvcard-meta">
          <span class="pvcard-tipo ${p.tipo==='platillo'?'ptipo-platillo':'ptipo-reventa'}">${p.tipo==='platillo'?'Platillo':'Reventa'}</span>
          <span style="font-size:10px;color:${color};font-weight:700;">${p.cat}</span>
          ${rec ? `<span class="pvcard-rec">📋 ${rec.nombre}</span>` : p.tipo==='platillo' ? `<span class="pvcard-norec">Sin receta</span>` : ''}
        </div>
        <div style="display:flex;gap:10px;margin-top:5px;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--c-tx2);font-weight:600;">Stock: <b style="color:${lo?'var(--c-re)':'var(--c-gr)'}">${p.stock}</b>${lo?' ⚠':''}</span>
          ${costos ? `<span style="font-size:11px;color:var(--c-tx3);font-weight:600;">Costo receta: $${costos.porcion.toFixed(2)}</span>` : ''}
          <span style="font-size:11px;color:var(--c-gr);font-weight:700;">Margen: ${margin}%</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <div class="pvcard-price">$${p.price.toFixed(2)}</div>
        <div style="display:flex;gap:5px;">
          <button class="ied" style="padding:5px 8px;font-size:11px;" onclick="editProduct(${p.id})">✏️</button>
          <button class="idl" style="padding:5px 8px;font-size:11px;" onclick="delProduct(${p.id})">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join('') || '<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin productos en esta categoría</div>';
}

function openAddProduct() {
  editProductId = null;
  document.getElementById('mProductTtl').textContent = 'Agregar Producto';
  ['pv-name','pv-emoji','pv-price','pv-cost','pv-stock','pv-min'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pv-tipo').value = 'platillo';
  fillProductCatSelect(); fillProductRecetaSelect();
  onPvTipoChange();
  openM('mProduct');
}

function editProduct(id) {
  const p = products.find(x=>x.id===id); if(!p) return;
  editProductId = id;
  document.getElementById('mProductTtl').textContent = 'Editar Producto';
  document.getElementById('pv-name').value  = p.name;
  document.getElementById('pv-emoji').value = p.emoji||'';
  document.getElementById('pv-price').value = p.price;
  document.getElementById('pv-cost').value  = p.cost;
  document.getElementById('pv-stock').value = p.stock;
  document.getElementById('pv-min').value   = p.min;
  document.getElementById('pv-tipo').value  = p.tipo||'platillo';
  fillProductCatSelect(); fillProductRecetaSelect();
  document.getElementById('pv-cat').value    = p.cat;
  document.getElementById('pv-receta').value = p.recetaNombre||'';
  onPvTipoChange();
  openM('mProduct');
}

function fillProductCatSelect() {
  const sel = document.getElementById('pv-cat');
  sel.innerHTML = menuCategorias.map(c=>`<option value="${c.nombre}">${c.emoji} ${c.nombre}</option>`).join('');
}

function fillProductRecetaSelect() {
  const sel = document.getElementById('pv-receta');
  sel.innerHTML = '<option value="">— Sin receta —</option>' +
    recetas.map(r=>`<option value="${r.nombre}">${r.tipo==='subreceta'?'🔗':'📋'} ${r.nombre}</option>`).join('');
}

function onPvTipoChange() {
  const tipo = document.getElementById('pv-tipo').value;
  const wrap = document.getElementById('pv-receta-wrap');
  if (wrap) wrap.style.display = tipo==='platillo' ? 'flex' : 'none';
}

function saveProduct() {
  const name = document.getElementById('pv-name').value.trim();
  if (!name) { alert('El nombre es obligatorio.'); return; }
  const data = {
    name,
    emoji:  document.getElementById('pv-emoji').value.trim()||'🍽',
    cat:    document.getElementById('pv-cat').value,
    tipo:   document.getElementById('pv-tipo').value,
    recetaNombre: document.getElementById('pv-receta').value||null,
    price:  parseFloat(document.getElementById('pv-price').value)||0,
    cost:   parseFloat(document.getElementById('pv-cost').value)||0,
    stock:  parseInt(document.getElementById('pv-stock').value)||0,
    min:    parseInt(document.getElementById('pv-min').value)||0,
  };
  if (editProductId) {
    const i = products.findIndex(p=>p.id===editProductId);
    products[i] = {...products[i], ...data};
  } else {
    const nid = products.length ? Math.max(...products.map(p=>p.id))+1 : 1;
    products.push({id:nid, ...data});
  }
  closeM('mProduct');
  renderCatalogo(); renderCats(); renderProds();
}

function delProduct(id) {
  products = products.filter(p=>p.id!==id);
  renderCatalogo(); renderCats(); renderProds();
}

/* ── Categorías ── */
function openAddCat() {
  editCatId = null;
  document.getElementById('mCatTtl').textContent = 'Nueva Categoría';
  ['mc-nombre','mc-emoji'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('mc-color').value = '#E85500';
  openM('mCat');
}

function saveCat() {
  const nombre = document.getElementById('mc-nombre').value.trim();
  if (!nombre) { alert('El nombre es obligatorio.'); return; }
  const data = {nombre, emoji:document.getElementById('mc-emoji').value.trim()||'📂', color:document.getElementById('mc-color').value};
  const nid = menuCategorias.length ? Math.max(...menuCategorias.map(c=>c.id))+1 : 1;
  menuCategorias.push({id:nid,...data});
  closeM('mCat');
  renderCatalogo(); renderCats(); renderProds();
}

function delCat(id) {
  menuCategorias = menuCategorias.filter(c=>c.id!==id);
  renderCatalogo(); renderCats();
}

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