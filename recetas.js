/* -- Recetas y Costos -- */

function renderRecetasView() {
  const kpiT = document.getElementById('rec-kpi-total');
  const kpiS = document.getElementById('rec-kpi-sub');
  const kpiR = document.getElementById('rec-kpi-rec');
  if (kpiT) kpiT.textContent = recetas.length;
  if (kpiS) kpiS.textContent = recetas.filter(r=>r.tipo==='subreceta').length;
  if (kpiR) kpiR.textContent = recetas.filter(r=>r.tipo==='receta').length;

  const tabsEl = document.getElementById('rtabs-v');
  if (tabsEl) {
    tabsEl.innerHTML = ['Todas','Subrecetas','Recetas'].map(c=>
      `<button class="ictab ${c===recCatFilter?'on':''}" onclick="recCatFilter='${c}';renderRecetasView()">${c}</button>`
    ).join('');
  }

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

let recIngrRows = [];

function openAddReceta() {
  editRecetaId = null;
  document.getElementById('mRecetaTtl').textContent = 'Nueva Receta';
  document.getElementById('rec-name').value = '';
  document.getElementById('rec-tipo').value = 'receta';
  document.getElementById('rec-rinde').value = '1';
  document.getElementById('rec-rinde-unit').value = 'platillos';
  document.getElementById('rec-notas').value = '';
  recIngrRows = [];
  renderRecIngrRows();
  updateRecCostPreview();
  openM('mReceta');
}

function editReceta(id) {
  const r = recetas.find(x=>x.id===id); if(!r) return;
  editRecetaId = id;
  document.getElementById('mRecetaTtl').textContent = 'Editar Receta';
  document.getElementById('rec-name').value  = r.nombre;
  document.getElementById('rec-tipo').value  = r.tipo;
  document.getElementById('rec-rinde').value = r.rinde;
  document.getElementById('rec-rinde-unit').value = r.rindeUnit||'platillos';
  document.getElementById('rec-notas').value = r.notas||'';
  recIngrRows = r.ingredientes.map(i=>({...i}));
  renderRecIngrRows();
  updateRecCostPreview();
  openM('mReceta');
}

function delReceta(id) {
  recetas = recetas.filter(x=>x.id!==id);
  // ── FIREBASE ──
  if (window._fbPatchDelReceta) window._fbPatchDelReceta(id);
  renderRecetas();
}

function addRecetaIngr() {
  recIngrRows.push({tipo:'ingr', refId:ingredientes[0]?.id||0, nombre:ingredientes[0]?.nombre||'', cant:0, unidad:'Gr'});
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

function renderRecIngrRows() {
  const ingrOpts = ingredientes.map(i=>`<option value="ingr:${i.id}">${i.nombre} (${i.unidad})</option>`).join('');
  const subOpts  = recetas.filter(r=>r.tipo==='subreceta').map(r=>`<option value="sub:${r.id}">🔗 ${r.nombre} (Orden)</option>`).join('');

  document.getElementById('rec-ingr-list').innerHTML = recIngrRows.map((row, idx) => {
    const selVal = row.tipo+':'+row.refId;
    let unitOpts = '';
    if (row.tipo==='ingr') {
      const ing = ingredientes.find(i=>i.id===row.refId);
      const units = ing ? getUnitsForIngr(ing.unidad) : ['Pz'];
      unitOpts = [...new Set(units)].map(u=>`<option value="${u}" ${u===row.unidad?'selected':''}>${u}</option>`).join('');
    } else {
      unitOpts = `<option value="Orden">Orden</option>`;
    }

    return `<div class="ri-row" style="margin-bottom:4px;">
      <select class="ri-sel" onchange="updateRecIngrRef(${idx},this.value)">
        <optgroup label="Ingredientes">${ingrOpts}</optgroup>
        ${subOpts?`<optgroup label="Subrecetas">${subOpts}</optgroup>`:''}
      </select>
      <input class="ri-num" type="number" inputmode="decimal" value="${row.cant||''}" placeholder="Cant." oninput="updateRecIngrCant(${idx},this.value)">
      <select class="ri-unit" onchange="updateRecIngrUnit(${idx},this.value)">${unitOpts}</select>
      <button class="ri-del" onclick="removeRecIngrRow(${idx})">✕</button>
    </div>`;
  }).join('');

  recIngrRows.forEach((row,idx)=>{
    const sel = document.getElementById('rec-ingr-list')?.querySelectorAll('.ri-sel')[idx];
    if(sel) sel.value = row.tipo+':'+row.refId;
  });
}

function updateRecIngrRef(idx, val) {
  const [tipo, id] = val.split(':');
  const refId = parseInt(id);
  recIngrRows[idx].tipo  = tipo;
  recIngrRows[idx].refId = refId;
  if (tipo==='ingr') {
    const ing = ingredientes.find(i=>i.id===refId);
    recIngrRows[idx].nombre = ing?.nombre||'';
    const units = ing ? getUnitsForIngr(ing.unidad) : ['Pz'];
    recIngrRows[idx].unidad = units[0];
  } else {
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
  // ── FIREBASE ──
  const recGuardar = editRecetaId ? recetas.find(r=>r.id===editRecetaId) : recetas[recetas.length-1];
  if (window._fbPatchSaveReceta) window._fbPatchSaveReceta(recGuardar);
  closeM('mReceta');
  renderRecetas();
  renderRecetasView();
}

  renderRecetas();
  renderRecetasView();
}
