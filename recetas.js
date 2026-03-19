/* -- Recetas y Costos -- */

function renderRecetasView() {
  // Update KPIs
  const kpiT = document.getElementById('rec-kpi-total');
  const kpiS = document.getElementById('rec-kpi-sub');
  const kpiR = document.getElementById('rec-kpi-rec');
  if (kpiT) kpiT.textContent = recetas.length;
  if (kpiS) kpiS.textContent = recetas.filter(r=>r.tipo==='subreceta').length;
  if (kpiR) kpiR.textContent = recetas.filter(r=>r.tipo==='receta').length;

  // Category tabs — only 3 fixed options
  const tabsEl = document.getElementById('rtabs-v');
  if (tabsEl) {
    tabsEl.innerHTML = ['Todas','Subrecetas','Recetas'].map(c=>
      `<button class="ictab ${c===recCatFilter?'on':''}" onclick="recCatFilter='${c}';renderRecetasView();updateRecBtnLabel()">${c}</button>`
    ).join('');
  }

  // Filter list
  let list = recetas;
  if (recCatFilter==='Subrecetas') list = recetas.filter(r=>r.tipo==='subreceta');
  else if (recCatFilter==='Recetas') list = recetas.filter(r=>r.tipo==='receta');
  else if (recCatFilter!=='Todas') list = recetas.filter(r=>r.notas===recCatFilter);

  const listEl = document.getElementById('receta-list-v');
  if (!listEl) return;

  if (!list.length) {
    listEl.innerHTML = '<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin recetas. Toca <strong>+ Nueva</strong> para empezar.</div>';
    return;
  }

  listEl.innerHTML = list.map(r => {
    const costos = calcCostoReceta(r);
    const tipoLabel = r.tipo==='subreceta' ? 'Subreceta' : 'Receta';
    const tipoClass = r.tipo==='subreceta' ? 'rtipo-sub' : 'rtipo-rec';
    const ingrsPreview = r.ingredientes.slice(0,3).map(i=>i.nombre).join(', ')+(r.ingredientes.length>3?'…':'');
    return `<div class="rcard" onclick="verReceta(${r.id})">
      <div class="rcard-hdr">
        <div class="rcard-name">${r.nombre}</div>
        <span class="rcard-tipo ${tipoClass}">${tipoLabel}</span>
      </div>
      <div class="rcard-costos">
        <div class="rcosto"><span class="rcosto-lbl">Costo total</span><span class="rcosto-val">$${costos.total.toFixed(2)}</span></div>
        <div class="rcosto"><span class="rcosto-lbl">Por porción</span><span class="rcosto-val green">$${costos.porcion.toFixed(2)}</span></div>
        <div class="rcosto"><span class="rcosto-lbl">Rinde</span><span class="rcosto-val" style="color:var(--c-bl)">${r.rinde} ${r.rindeUnit||'porciones'}</span></div>
      </div>
      ${r.notas?`<div class="rcard-ingrs">📁 ${r.notas}</div>`:''}
      <div class="rcard-ingrs">🧂 ${ingrsPreview||'Sin ingredientes'}</div>
      <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px;">
        <button class="ied" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();editReceta(${r.id})">✏️ Editar</button>
        <button class="idl" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();delReceta(${r.id});renderRecetasView()">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function renderRecetas() {
  renderRecetasCatTabs();
  let list = recetas;
  if (recCatFilter === 'Subrecetas') list = recetas.filter(r=>r.tipo==='subreceta');
  else if (recCatFilter === 'Recetas') list = recetas.filter(r=>r.tipo==='receta');
  else if (recCatFilter !== 'Todas') list = recetas.filter(r=>r.notas===recCatFilter);

  if (!list.length) {
    document.getElementById('receta-list').innerHTML =
      '<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin recetas. Toca + Nueva receta para empezar.</div>';
    return;
  }

  document.getElementById('receta-list').innerHTML = list.map(r => {
    const costos = calcCostoReceta(r);
    const tipoLabel = r.tipo === 'subreceta' ? 'Subreceta' : 'Receta';
    const tipoClass = r.tipo === 'subreceta' ? 'rtipo-sub' : 'rtipo-rec';
    const ingrsPreview = r.ingredientes.slice(0,3).map(i=>i.nombre).join(', ') + (r.ingredientes.length>3?'…':'');
    return `<div class="rcard" onclick="verReceta(${r.id})">
      <div class="rcard-hdr">
        <div class="rcard-name">${r.nombre}</div>
        <span class="rcard-tipo ${tipoClass}">${tipoLabel}</span>
      </div>
      <div class="rcard-costos">
        <div class="rcosto"><span class="rcosto-lbl">Costo total</span><span class="rcosto-val">$${costos.total.toFixed(2)}</span></div>
        <div class="rcosto"><span class="rcosto-lbl">Por porción</span><span class="rcosto-val green">$${costos.porcion.toFixed(2)}</span></div>
        <div class="rcosto"><span class="rcosto-lbl">Rinde</span><span class="rcosto-val" style="color:var(--c-bl)">${r.rinde} ${r.rindeUnit||'porciones'}</span></div>
      </div>
      ${r.notas?`<div class="rcard-ingrs">📁 ${r.notas}</div>`:''}
      <div class="rcard-ingrs">🧂 ${ingrsPreview}</div>
      <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px;">
        <button class="ied" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();editReceta(${r.id})">✏️ Editar</button>
        <button class="idl" style="font-size:11px;padding:5px 10px;" onclick="event.stopPropagation();delReceta(${r.id})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

/* ── Ver detalle ── */
function verReceta(id) {
  const r = recetas.find(x=>x.id===id); if(!r) return;
  viewingRecetaId = id;
  const costos = calcCostoReceta(r);
  document.getElementById('mRVTtl').textContent = r.nombre;
  document.getElementById('mRVContent').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <span class="rcard-tipo ${r.tipo==='subreceta'?'rtipo-sub':'rtipo-rec'}">${r.tipo==='subreceta'?'Subreceta':'Receta final'}</span>
      ${r.notas?`<span style="font-size:11px;color:var(--c-tx3);font-weight:600;">📁 ${r.notas}</span>`:''}
      <span style="font-size:11px;color:var(--c-bl);font-weight:700;">Rinde: ${r.rinde} ${r.rindeUnit||'porciones'}</span>
    </div>
    <div style="font-size:10px;font-weight:900;color:var(--c-tx3);letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;">Ingredientes</div>
    <div style="display:flex;flex-direction:column;gap:0;border:1.5px solid var(--c-bord);border-radius:var(--rs);overflow:hidden;margin-bottom:14px;">
      ${r.ingredientes.map((ingr,idx)=>{
        const costo = calcCostoIngr(ingr);
        const bg = idx%2===0 ? 'var(--c-surf)' : 'var(--c-surf2)';
        return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:${bg};border-bottom:1px solid var(--c-bord);">
          <div style="flex:1;font-size:13px;font-weight:700;color:var(--c-tx);">${ingr.tipo==='sub'?'🔗':'🧂'} ${ingr.nombre}</div>
          <div style="font-size:12px;color:var(--c-tx2);font-weight:600;font-family:'JetBrains Mono',monospace;min-width:80px;text-align:right;">${ingr.cant} ${ingr.unidad}</div>
          <div style="font-size:12px;font-weight:700;color:var(--c-or);font-family:'JetBrains Mono',monospace;min-width:60px;text-align:right;">$${costo.toFixed(2)}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="background:var(--c-surf2);border:1.5px solid var(--c-bord);border-radius:var(--rs);padding:12px 14px;">
      <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--c-tx2);margin-bottom:6px;">
        <span>Costo total receta</span><span style="font-family:'JetBrains Mono',monospace;color:var(--c-or);">$${costos.total.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:var(--c-tx);">
        <span>Costo por ${r.rindeUnit?r.rindeUnit.replace('platillos','platillo').replace('porciones','porción'):' porción'}</span><span style="font-family:'JetBrains Mono',monospace;color:var(--c-gr);">$${costos.porcion.toFixed(2)}</span>
      </div>
    </div>`;
  openM('mRecetaVer');
}

function editRecetaFromView() {
  closeM('mRecetaVer');
  editReceta(viewingRecetaId);
}

/* ── Formulario de receta ── */
let recIngrRows = []; // {tipo, refId, nombre, cant, unidad}

function updateRecBtnLabel() {
  const btn = document.getElementById('btn-nueva-receta');
  if (!btn) return;
  if (recCatFilter === 'Subrecetas') {
    btn.textContent = '+ Nueva subreceta';
  } else if (recCatFilter === 'Recetas') {
    btn.textContent = '+ Nueva receta';
  } else {
    btn.textContent = '+ Nueva';
  }
}

function fillRecCatSelect(selectedVal) {
  const sel = document.getElementById('rec-notas');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Sin categoría —</option>' +
    recetaCategorias.map(c=>`<option value="${c}" ${c===selectedVal?'selected':''}>${c}</option>`).join('');
}

function openAddRecCat() {
  const nombre = prompt('Nueva categoría de receta:');
  if (!nombre || !nombre.trim()) return;
  const n = nombre.trim();
  if (!recetaCategorias.includes(n)) recetaCategorias.push(n);
  fillRecCatSelect(n);
  document.getElementById('rec-notas').value = n;
}

function openAddReceta() {
  editRecetaId = null;
  // Determine tipo and title from current filter
  const esSub = recCatFilter === 'Subrecetas';
  const esRec = recCatFilter === 'Recetas';
  const tipoDefault = esSub ? 'subreceta' : 'receta';

  document.getElementById('mRecetaTtl').textContent = esSub ? 'Nueva Subreceta' : 'Nueva Receta';
  document.getElementById('rec-name').value = '';
  document.getElementById('rec-rinde').value = '1';
  document.getElementById('rec-rinde-unit').value = 'platillos';
  fillRecCatSelect('');

  // Set tipo and lock it if filter is specific
  const tipoSel = document.getElementById('rec-tipo');
  tipoSel.value = tipoDefault;
  if (esSub || esRec) {
    // Lock the selector so user can't change it from context
    tipoSel.disabled = true;
    tipoSel.style.opacity = '0.6';
    tipoSel.title = esSub ? 'Creando desde sección Subrecetas' : 'Creando desde sección Recetas';
  } else {
    tipoSel.disabled = false;
    tipoSel.style.opacity = '1';
    tipoSel.title = '';
  }
  recIngrRows = [];
  renderRecIngrRows();
  updateRecCostPreview();
  openM('mReceta');
}

function editReceta(id) {
  const r = recetas.find(x=>x.id===id); if(!r) return;
  editRecetaId = id;
  const tipoSel2 = document.getElementById('rec-tipo');
  tipoSel2.disabled = false; tipoSel2.style.opacity = '1'; tipoSel2.title = '';
  document.getElementById('mRecetaTtl').textContent = r.tipo==='subreceta' ? 'Editar Subreceta' : 'Editar Receta';
  document.getElementById('rec-name').value  = r.nombre;
  tipoSel2.value = r.tipo;
  document.getElementById('rec-rinde').value = r.rinde;
  document.getElementById('rec-rinde-unit').value = r.rindeUnit||'platillos';
  fillRecCatSelect(r.notas||'');
  recIngrRows = r.ingredientes.map(i=>({...i}));
  renderRecIngrRows();
  updateRecCostPreview();
  openM('mReceta');
}

function delReceta(id) {
  recetas = recetas.filter(x=>x.id!==id);
  renderRecetas();
}

function addRecetaIngr() {
  const first = ingredientes[0];
  recIngrRows.push({
    tipo:'ingr',
    refId: first?.id||0,
    nombre: first?.nombre||'',
    cant:0, unidad:'Gr',
    _source:'ingr', _cat:'Todas'
  });
  renderRecIngrRows();
  updateRecCostPreview();
}

function removeRecIngrRow(idx) {
  recIngrRows.splice(idx,1);
  renderRecIngrRows();
  updateRecCostPreview();
}

function getUnitsForIngr(unidadCompra) {
  const uc = (unidadCompra||'').toLowerCase();
  if (uc==='kg')  return ['Kg','Gr'];
  if (uc==='lt')  return ['Lt','Ml'];
  if (uc==='tapa') return ['Pz','Pieza'];
  return [unidadCompra||'Pz','Pz','Pieza'];
}

function getIngrCats() {
  // All categories from ingredientes + produccion + subrecetas
  const cats = [
    ...new Set(ingredientes.map(i=>i.cat)),
  ];
  return cats;
}

function getProdCats() {
  return [...new Set(produccion.map(p=>p.cat))];
}

function buildIngrItemsForCat(source, cat) {
  if (source === 'ingr') {
    return ingredientes
      .filter(i => cat==='Todas' || i.cat===cat)
      .map(i => ({value:'ingr:'+i.id, label:i.nombre, unidad:i.unidad}));
  } else {
    // sub — category doesn't apply, show all subrecetas
    return recetas
      .filter(r => r.tipo==='subreceta')
      .map(r => ({value:'sub:'+r.id, label:r.nombre, unidad:'Orden'}));
  }
}

function renderRecIngrRows() {
  const listEl = document.getElementById('rec-ingr-list');
  if (!listEl) return;

  listEl.innerHTML = recIngrRows.map((row, idx) => {
    // Source selector
    const source = row._source || (row.tipo==='sub' ? 'sub' : row.tipo==='prod' ? 'prod' : 'ingr');

    // Category selector for current source
    let catOpts = '';
    if (source === 'ingr') {
      const cats = ['Todas', ...new Set(ingredientes.map(i=>i.cat))];
      catOpts = cats.map(c=>`<option value="${c}" ${c===(row._cat||'Todas')?'selected':''}>${c}</option>`).join('');
    } else if (source === 'prod') {
      const cats = ['Todas', ...new Set(produccion.map(p=>p.cat))];
      catOpts = cats.map(c=>`<option value="${c}" ${c===(row._cat||'Todas')?'selected':''}>${c}</option>`).join('');
    } else {
      catOpts = '<option value="Todas">Todas</option>';
    }

    // Item selector filtered by category
    const currentCat = row._cat || 'Todas';
    const items = buildIngrItemsForCat(source, currentCat);
    const currentVal = row.tipo+':'+(row.refId||0);
    const itemOpts = items.map(it=>`<option value="${it.value}" ${it.value===currentVal?'selected':''}>${it.label}</option>`).join('');

    // Unit options
    let unitOpts = '';
    if (row.tipo === 'ingr') {
      const ing = ingredientes.find(i=>i.id===row.refId);
      const units = ing ? getUnitsForIngr(ing.unidad) : ['Pz'];
      unitOpts = [...new Set(units)].map(u=>`<option value="${u}" ${u===row.unidad?'selected':''}>${u}</option>`).join('');
    } else {
      unitOpts = '<option value="Orden">Orden</option>';
    }

    return `<div style="background:var(--c-surf2);border:1.5px solid var(--c-bord);border-radius:var(--rs);padding:10px;margin-bottom:8px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
        <!-- Fuente -->
        <div>
          <div style="font-size:9px;font-weight:900;color:var(--c-tx3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">Fuente</div>
          <select class="ri-sel" onchange="updateRecIngrSource(${idx},this.value)">
            <option value="ingr" ${source==='ingr'?'selected':''}>Ingredientes</option>
            <option value="sub"  ${source==='sub' ?'selected':''}>Subreceta</option>
          </select>
        </div>
        <!-- Categoría — solo visible para Ingredientes -->
        <div style="${source==='sub'?'visibility:hidden':''}">
          <div style="font-size:9px;font-weight:900;color:var(--c-tx3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">Categoría</div>
          <select class="ri-sel" onchange="updateRecIngrCat(${idx},this.value)" ${source==='sub'?'disabled':''}>
            ${catOpts}
          </select>
        </div>
      </div>
      <!-- Ingrediente -->
      <div style="margin-bottom:6px;">
        <div style="font-size:9px;font-weight:900;color:var(--c-tx3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">Ingrediente / Producto</div>
        <select class="ri-sel ri-item-sel" style="width:100%;" onchange="updateRecIngrRef(${idx},this.value)">
          ${itemOpts || '<option value="">— Selecciona —</option>'}
        </select>
      </div>
      <!-- Cantidad y unidad -->
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center;">
        <div>
          <div style="font-size:9px;font-weight:900;color:var(--c-tx3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">Cantidad</div>
          <input class="ri-num" style="width:100%;" type="number" inputmode="decimal" value="${row.cant||''}" placeholder="0" oninput="updateRecIngrCant(${idx},this.value)">
        </div>
        <div>
          <div style="font-size:9px;font-weight:900;color:var(--c-tx3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">Unidad</div>
          <select class="ri-unit" style="width:100%;" onchange="updateRecIngrUnit(${idx},this.value)">${unitOpts}</select>
        </div>
        <button class="ri-del" onclick="removeRecIngrRow(${idx})" style="margin-top:18px;">✕</button>
      </div>
    </div>`;
  }).join('');
}

function updateRecIngrSource(idx, source) {
  recIngrRows[idx]._source = source;
  recIngrRows[idx]._cat = 'Todas';
  if (source === 'ingr') {
    const first = ingredientes[0];
    if (first) {
      recIngrRows[idx].tipo   = 'ingr';
      recIngrRows[idx].refId  = first.id;
      recIngrRows[idx].nombre = first.nombre;
      recIngrRows[idx].unidad = getUnitsForIngr(first.unidad)[0];
    }
  } else {
    // sub
    const first = recetas.find(r=>r.tipo==='subreceta');
    if (first) {
      recIngrRows[idx].tipo   = 'sub';
      recIngrRows[idx].refId  = first.id;
      recIngrRows[idx].nombre = first.nombre;
      recIngrRows[idx].unidad = 'Orden';
    }
  }
  renderRecIngrRows();
  updateRecCostPreview();
}

function updateRecIngrCat(idx, cat) {
  recIngrRows[idx]._cat = cat;
  const source = recIngrRows[idx]._source || 'ingr';
  const items = buildIngrItemsForCat(source, cat);
  if (items.length > 0) {
    const [tipo, id] = items[0].value.split(':');
    recIngrRows[idx].tipo  = tipo;
    recIngrRows[idx].refId = parseInt(id);
    recIngrRows[idx].nombre = items[0].label.replace('🔗 ','');
    recIngrRows[idx].unidad = items[0].unidad || 'Pz';
  }
  renderRecIngrRows();
  updateRecCostPreview();
}

function updateRecIngrRef(idx, val) {
  if (!val || !val.includes(':')) return;
  const [tipo, id] = val.split(':');
  const refId = parseInt(id);
  recIngrRows[idx].tipo  = tipo;
  recIngrRows[idx].refId = refId;
  if (tipo === 'ingr') {
    const ing = ingredientes.find(i=>i.id===refId);
    recIngrRows[idx].nombre = ing?.nombre||'';
    const units = ing ? getUnitsForIngr(ing.unidad) : ['Pz'];
    recIngrRows[idx].unidad = units[0];
  } else {
    // sub
    const sub = recetas.find(r=>r.id===refId);
    recIngrRows[idx].nombre = sub?.nombre||'';
    recIngrRows[idx].unidad = 'Orden';
  }
  renderRecIngrRows();
  updateRecCostPreview();
}

function updateRecIngrCant(idx, val) {
  recIngrRows[idx].cant = parseFloat(val)||0;
  updateRecCostPreview();
}

function updateRecIngrUnit(idx, val) {
  recIngrRows[idx].unidad = val;
  updateRecCostPreview();
}

function updateRecCostPreview() {
  const rinde = parseFloat(document.getElementById('rec-rinde')?.value)||1;
  const unit  = document.getElementById('rec-rinde-unit')?.value||'platillos';
  const total = recIngrRows.reduce((s,row)=>s+calcCostoIngr(row),0);
  const porc  = total/rinde;
  const ct = document.getElementById('rec-costo-total');
  const cp = document.getElementById('rec-costo-porc');
  if(ct) ct.textContent = '$'+total.toFixed(2);
  if(cp) cp.textContent = '$'+porc.toFixed(2)+' / '+unit.replace('platillos','platillo').replace('porciones','porción');
}

function saveReceta() {
  const nombre = document.getElementById('rec-name').value.trim();
  if (!nombre) { alert('El nombre es obligatorio.'); return; }
  const rinde = parseFloat(document.getElementById('rec-rinde').value)||1;
  const data = {
    nombre,
    tipo:  document.getElementById('rec-tipo').value,
    rinde,
    rindeUnit: document.getElementById('rec-rinde-unit').value,
    notas: document.getElementById('rec-notas').value.trim(),
    ingredientes: recIngrRows.filter(r=>r.refId&&r.cant>0).map(r=>({...r})),
  };
  if (editRecetaId) {
    const i = recetas.findIndex(r=>r.id===editRecetaId);
    recetas[i] = {...recetas[i], ...data};
  } else {
    const nid = recetas.length ? Math.max(...recetas.map(r=>r.id))+1 : 1;
    recetas.push({id:nid, ...data});
  }
  closeM('mReceta');
  renderRecetas();
  renderRecetasView();
}
