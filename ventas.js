/* -- POS - Carrito y Cobro -- */

const allItems = () => packages.flatMap(p=>p.items);

function addPkg() {
  packages.push({pkgIdx:nextPkg++, label:'Plato '+(packages.length+1), items:[]});
  renderCart(); updateBadge();
}

function removeP(pkgIdx) {
  packages = packages.filter(p=>p.pkgIdx!==pkgIdx);
  packages.forEach((p,i)=>{p.label='Plato '+(i+1);});
  renderCart(); updateBadge(); updateOwnerIndicator();
}

function vaciar() {
  if (!packages.length) return;
  openM('mVaciar');
}

function doVaciar() {
  closeM('mVaciar');
  packages = []; nextPkg = 0; disc = 0;
  document.getElementById('dinput').value = '';
  document.getElementById('discLine').style.display = 'none';
  const ind = document.getElementById('owner-indicator');
  if (ind) ind.style.display = 'none';
  if (ivaOn) toggleIva();
  renderCart(); updateBadge(); updTotals();
}

function addToCart(pid) {
  const p = products.find(x=>x.id===pid);
  if (!p) return;
  // Calcular cantidad actual en el carrito para este producto
  const currentQty = allItems().filter(it=>it.id===pid).reduce((s,it)=>s+it.qty,0);
  const totalQty = currentQty + 1;
  // Validar stock del producto
  if (p.stock < totalQty) {
    alert(`Stock insuficiente de ${p.name}`);
    return;
  }
  // Validar stock de ingredientes para productos con receta
  const rec = recetas.find(r=>r.nombre === p.name);
  if (rec) {
    for (const ingr of rec.ingredientes) {
      const ing = ingredientes.find(i=>i.nombre === ingr.nombre);
      if (ing && ing.stock < ingr.cant * totalQty) {
        alert(`Stock insuficiente de ${ing.nombre} para ${totalQty} unidades de ${p.name}`);
        return;
      }
    }
  }
  if (!packages.length) { packages.push({pkgIdx:nextPkg++, label:'Plato 1', items:[]}); renderCart(); }
  pendPkgIdx = packages[packages.length-1].pkgIdx;
  if (p.cat==='Tacos') {
    pendTPid = pid; selTortilla = null;
    document.getElementById('tEmoji').textContent = p.emoji;
    document.getElementById('tName').textContent = p.name;
    ['maiz','harina'].forEach(t=>{
      document.getElementById('to-'+t).classList.remove('on');
      document.getElementById('tc-'+t).textContent = '';
    });
    document.getElementById('btnTacoAdd').disabled = true;
    openM('mTort');
  } else {
    commitAdd(pid, null);
  }
}

function selTort(type) {
  selTortilla = type;
  ['maiz','harina'].forEach(t=>{
    document.getElementById('to-'+t).classList.toggle('on', t===type);
    document.getElementById('tc-'+t).textContent = t===type ? '✓' : '';
  });
  document.getElementById('btnTacoAdd').disabled = false;
}

function confirmTort() {
  if (!selTortilla || !pendTPid) return;
  const pid = pendTPid, tor = selTortilla;
  pendTPid = null; selTortilla = null;
  closeM('mTort');
  commitAdd(pid, tor);
}

function commitAdd(pid, tort) {
  const p = products.find(x=>x.id===pid);
  const pkg = packages.find(pk=>pk.pkgIdx===pendPkgIdx);
  if (!p || !pkg) return;
  const tl = tort==='maiz' ? '🌽 Maíz' : tort==='harina' ? '🫓 Harina' : null;
  const ex = pkg.items.find(i=>i.id===pid && i.tort===tort);
  if (ex) { ex.qty++; }
  else { pkg.items.push({ci:nextCI++, id:pid, name:p.name, emoji:p.emoji, cat:p.cat, price:p.price, tort, tl, qty:1, note:'', showNote:false}); }
  renderCart(); updateBadge(); updateOwnerIndicator(); updTotals();
  if (!isTab() && allItems().length===1) showP('cart', document.getElementById('st-cart'));
}

function chQty(ci, d) {
  for (const pkg of packages) {
    const i = pkg.items.findIndex(x=>x.ci===ci);
    if (i>=0) { pkg.items[i].qty+=d; if(pkg.items[i].qty<=0) pkg.items.splice(i,1); renderCart(); updateBadge(); updateOwnerIndicator(); updTotals(); return; }
  }
}
function remItem(ci) {
  for (const pkg of packages) { const i=pkg.items.findIndex(x=>x.ci===ci); if(i>=0){pkg.items.splice(i,1);break;} }
  renderCart(); updateBadge(); updateOwnerIndicator(); updTotals();
}
function updateBadge() {
  const n = allItems().reduce((s,i)=>s+i.qty,0);
  const b = document.getElementById('cbadge'); b.textContent=n; b.style.display=n>0?'inline-block':'none';
}
function togNote(ci) {
  for (const pkg of packages) { const it=pkg.items.find(x=>x.ci===ci); if(it){it.showNote=!it.showNote;renderCart();if(it.showNote)setTimeout(()=>{const e=document.getElementById('nt-'+ci);if(e)e.focus();},50);return;} }
}
function updNote(ci, v) { for (const pkg of packages) { const it=pkg.items.find(x=>x.ci===ci); if(it){it.note=v;return;} } }

function pkgHtml(pkg) {
  const cnt = pkg.items.reduce((s,i)=>s+i.qty, 0);
  const body = pkg.items.length>0
    ? pkg.items.map(it=>{
        const idx=it.ci, hn=it.note&&it.note.trim()!=='';
        return `<div class="pitem">
          <div class="pitem-row">
            <span class="pitem-ico">${it.emoji}</span>
            <div class="pitem-inf">
              <div class="pitem-name">${it.name}${it.tl?`<span class="tort-tag">${it.tl}</span>`:''}</div>
              <div class="pitem-sub">$${it.price.toFixed(2)} c/u</div>
            </div>
            <div class="qctrl">
              <button class="qbtn" onclick="chQty(${idx},-1)">−</button>
              <span class="qnum">${it.qty}</span>
              <button class="qbtn" onclick="chQty(${idx},1)">+</button>
              <button class="xbtn" onclick="remItem(${idx})">✕</button>
            </div>
          </div>
          <button class="ntbtn ${hn?'has':''}" onclick="togNote(${idx})">📝 ${it.showNote?'Ocultar nota':hn?'Ver nota':'Agregar nota'}</button>
          ${it.showNote?`<textarea class="ntarea" id="nt-${idx}" rows="2" placeholder="Sin cebolla, extra salsa..." oninput="updNote(${idx},this.value)">${it.note}</textarea>`:''}
          ${hn&&!it.showNote?`<div class="ntshow">📝 ${it.note}</div>`:''}
        </div>`;
      }).join('')
    : `<div class="pkg-nil" onclick="if(!isTab())showP('menu',document.getElementById('st-menu'))">👆 Ir al Menú para agregar productos</div>`;

  return `<div class="pkg">
    <div class="pkg-hdr">
      <div><span class="pkg-lbl">${pkg.label}</span>${cnt>0?`<span class="pkg-cnt">${cnt} prod.</span>`:''}</div>
      <button class="pkg-x" onclick="removeP(${pkg.pkgIdx})">✕</button>
    </div>
    <div class="pkg-bdy">${body}</div>
  </div>`;
}

function renderCart() {
  const el = document.getElementById('citems');
  el.innerHTML = packages.length===0
    ? `<div class="cempty"><span class="cempty-ico">🌮</span>Toca <strong>+ Plato</strong> para empezar,<br>luego agrega productos del Menú</div>`
    : packages.map(p=>pkgHtml(p)).join('');
  updTotals();
}


function applyDisc() {
  const v = document.getElementById('dinput').value.trim(), pct = parseFloat(v);
  if (v==='TACO20') { disc=20; alert('¡Cupón TACO20: 20% de descuento! 🌮'); }
  else if (!isNaN(pct)&&pct>0&&pct<=100) { disc=pct; }
  else { disc=0; alert('Ingresa un % (1-100) o el cupón TACO20'); }
  updTotals();
}

function updTotals() {
  const items = allItems();
  const sub = items.reduce((s,i)=>s+i.price*i.qty, 0);
  const dv = sub*(disc/100), after = sub-dv;
  const tax = ivaOn ? after*0.16 : 0;
  const total = after + tax;
  document.getElementById('cSub').textContent = '$'+sub.toFixed(2);
  const taxEl = document.getElementById('cTax');
  taxEl.textContent = ivaOn ? '$'+tax.toFixed(2) : '$0.00';
  taxEl.style.color = ivaOn ? 'var(--c-gr)' : 'var(--c-tx3)';
  document.getElementById('cTotal').textContent = '$'+total.toFixed(2);
  document.getElementById('btnCobrar').textContent = 'COBRAR $'+total.toFixed(2);
  document.getElementById('btnCobrar').disabled = items.length===0;
  if (disc>0&&items.length>0) { document.getElementById('discLine').style.display='flex'; document.getElementById('discVal').textContent='-$'+dv.toFixed(2); }
  else document.getElementById('discLine').style.display = 'none';
}

function toggleIva() {
  ivaOn = !ivaOn;
  const btn = document.getElementById('ivaToggle');
  const lbl = document.getElementById('ivaLabel');
  if (ivaOn) {
    btn.style.background = 'rgba(0,128,64,.12)';
    btn.style.color = 'var(--c-gr)';
    btn.style.borderColor = 'rgba(0,128,64,.3)';
    btn.textContent = '✓ IVA';
    lbl.textContent = 'IVA 16% — activado';
    lbl.style.color = 'var(--c-gr)';
  } else {
    btn.style.background = 'var(--c-surf2)';
    btn.style.color = 'var(--c-tx3)';
    btn.style.borderColor = 'var(--c-bord)';
    btn.textContent = '+ IVA';
    lbl.textContent = 'IVA 16% — desactivado';
    lbl.style.color = 'var(--c-tx3)';
  }
  updTotals();
}

function selServicio(s) {
  tipoServicio = s;
  ['aqui','llevar','domicilio'].forEach(x=>{
    const el=document.getElementById('sv-'+x);
    if(el) el.classList.toggle('on', x===s);
  });
}

function selPay(m) {
  payM = m;
  document.querySelectorAll('.pmbn').forEach(b=>b.classList.remove('on'));
  document.getElementById('pm-'+{efectivo:'efe',tarjeta:'tar',transferencia:'tra'}[m]).classList.add('on');
}

function processPay() {
  console.log('🔵 Botón COBRAR clickeado');
  const items = allItems(); 
  if (!items.length) { alert('Agrega productos al carrito primero'); return; }
  // Verificar stock de productos e ingredientes
  for (const it of items) {
    const p = products.find(x=>x.id===it.id);
    if (p) {
      // Verificar stock del producto
      if (p.stock < it.qty) {
        alert(`Stock insuficiente de ${p.name}`);
        return;
      }
      // Verificar stock de ingredientes si tiene receta
      const rec = recetas.find(r=>r.nombre === p.name);
      if (rec) {
        for (const ingr of rec.ingredientes) {
          const ing = ingredientes.find(i=>i.nombre === ingr.nombre);
          if (ing) {
            const cantNecesaria = ingr.cant * it.qty;
            if (ing.stock < cantNecesaria) {
              alert(`Stock insuficiente de ${ing.nombre} para ${p.name}`);
              return;
            }
          }
        }
      }
    }
  }
  const sub = items.reduce((s,i)=>s+i.price*i.qty, 0);
  const dv = sub*(disc/100), after = sub-dv;
  const tax = ivaOn ? after*0.16 : 0;
  const total = after + tax;
  // Validar que tipoServicio y payM estén definidos
  if (!tipoServicio) tipoServicio = 'aqui';
  if (!payM) payM = 'efectivo';
  // Descontar stock de productos
  items.forEach(it=>{ const p=products.find(x=>x.id===it.id); if(p) p.stock=Math.max(0,p.stock-it.qty); soldMap[it.id]=(soldMap[it.id]||0)+it.qty; });
  // Descontar stock de ingredientes para productos con receta
  for (const it of items) {
    const p = products.find(x=>x.id===it.id);
    if (p) {
      const rec = recetas.find(r=>r.nombre === p.name);
      if (rec) {
        for (const ingr of rec.ingredientes) {
          const ing = ingredientes.find(i=>i.nombre === ingr.nombre);
          if (ing) {
            ing.stock -= ingr.cant * it.qty;
          }
        }
      }
    }
  }
  salesOwner = getAutoOwner(items);
  ownerSales[salesOwner] = (ownerSales[salesOwner]||0) + total;
  const tx = {
    id:txns.length+1,
    packages:packages.map(p=>({label:p.label, items:p.items.map(i=>({...i}))})),
    items:items.map(i=>({...i})),
    sub, dv, tax, total, payM, disc, owner:salesOwner, servicio:tipoServicio,
    time:new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
    date:new Date().toLocaleDateString('es-MX')
  };
  txns.unshift(tx); salesTotal += total;
  try { saveTransactions(); } catch(e) { console.error('Error saving transactions:', e); }
  servicioCount[tipoServicio] = (servicioCount[tipoServicio]||0) + 1;
  console.log('✅ Venta procesada:', tx);
  sendToKitchen(tx);
  if (sheetsUrl) syncSheets(tx);
  showReceipt(tx); renderProds();
}

function showReceipt(tx) {
  document.getElementById('rBiz').textContent = biz.name;
  document.getElementById('rInfo').textContent = biz.phone+(biz.address?' · '+biz.address:'');
  document.getElementById('rTy').textContent = 'Gracias por visitar '+biz.name+' 🔥';
  document.getElementById('rItems').innerHTML = tx.packages.map(pkg=>{
    const rows = pkg.items.map(i=>{ const t=i.tl?` (${i.tl})`:''; return `<div class="rcpt-line" style="padding-left:8px;"><span>${i.emoji} ${i.name}${t} ×${i.qty}</span><span>$${(i.price*i.qty).toFixed(2)}</span></div>${i.note?`<div class="rcpt-note" style="padding-left:8px;">📝 ${i.note}</div>`:''}`; }).join('');
    return `<div style="font-size:11px;font-weight:900;color:var(--c-or);padding:5px 0 2px;text-transform:uppercase;">${pkg.label}</div>${rows}`;
  }).join('');
  document.getElementById('r-sub').textContent = '$'+tx.sub.toFixed(2);
  document.getElementById('r-tax').textContent = '$'+tx.tax.toFixed(2);
  document.getElementById('r-taxline').style.display = tx.tax > 0 ? 'flex' : 'none';
  document.getElementById('r-total').textContent = '$'+tx.total.toFixed(2);
  if (tx.disc>0) { document.getElementById('r-dline').style.display='flex'; document.getElementById('r-disc').textContent='-$'+tx.dv.toFixed(2); }
  else document.getElementById('r-dline').style.display = 'none';
  document.getElementById('r-mth').textContent = {efectivo:'💵 Efectivo',tarjeta:'💳 Tarjeta',transferencia:'📲 Transferencia'}[tx.payM];
  openM('mRcpt');
}

function newSale() {
  closeM('mRcpt'); packages=[]; nextPkg=0; disc=0; salesOwner='alex'; tipoServicio='aqui';
  if (ivaOn) toggleIva(); // reset IVA to off for next sale
  selServicio('aqui');
  const ind=document.getElementById('owner-indicator'); if(ind) ind.style.display='none';
  document.getElementById('dinput').value=''; document.getElementById('discLine').style.display='none';
  renderCart(); updateBadge();
  if (!isTab()) showP('menu', document.getElementById('st-menu'));
}

/* ══ INVENTARIO v2 — INGREDIENTES + PRODUCCIÓN ══ */

function showInvTab(tab, btn) {
  document.getElementById('inv-compras').style.display    = tab==='compras'    ? 'flex' : 'none';
  document.getElementById('inv-produccion').style.display = tab==='produccion' ? 'flex' : 'none';
  document.getElementById('inv-recetas').style.display    = tab==='recetas'    ? 'flex' : 'none';
  document.querySelectorAll('#itab-comp,#itab-prod,#itab-rec').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  if(tab==='recetas') renderRecetas();
}

/* ── Ingredientes ── */
function renderInvIngrCatTabs() {
  const cats = ['Todos',...new Set(ingredientes.map(i=>i.cat))];
  document.getElementById('ictabs-ingr').innerHTML = cats.map(c=>
    `<button class="ictab ${c===invIngrCat?'on':''}" onclick="invIngrCat='${c}';renderInvIngrCatTabs();renderIngrCards()">${c}</button>`
  ).join('');
}

function renderIngrCards() {
  const list = invIngrCat==='Todos' ? ingredientes : ingredientes.filter(i=>i.cat===invIngrCat);
  const catColors = {'Proteínas':'#E85500','Verduras':'#008040','Misceláneos':'#0066BB','Desechables':'#6B31D6','Limpieza':'#BF8850'};

  document.getElementById('icards-ingr').innerHTML = list.map(i=>{
    const lo = i.stock<=i.min, md = i.stock<=i.min*2 && !lo;
    const sc = lo?'slo':md?'smd':'sok';
    const color = catColors[i.cat]||'#E85500';
    return `<div class="icard">
      <div class="icard-ico" style="background:${color};width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;flex-shrink:0;">${i.cat.charAt(0)}</div>
      <div class="icard-inf">
        <div class="icard-name">${i.nombre}</div>
        <div class="icard-cat" style="color:${color}">${i.cat} · ${i.unidad}</div>
        <div class="icard-meta">
          <span class="spill ${sc}">${i.stock} ${i.unidad}</span>
          <span style="font-size:11px;color:var(--c-tx3);font-weight:600;">mín ${i.min}</span>
          ${i.precioCompra>0?`<span class="iprice">$${i.precioCompra.toFixed(2)}</span>`:''}
          ${i.proveedor?`<span style="font-size:10px;color:var(--c-bl);font-weight:700;background:rgba(0,102,187,.08);padding:2px 7px;border-radius:6px;">${i.proveedor}</span>`:''}
        </div>
        <div class="istk">
          <button class="isb" onclick="adjIngr(${i.id},-1)">−</button>
          <span class="isn">${i.stock}</span>
          <button class="isb" onclick="adjIngr(${i.id},1)">+</button>
          <span style="font-size:10px;color:var(--c-tx3);font-weight:600;">${i.unidad}</span>
        </div>
        ${i.notas?`<div style="font-size:10px;color:var(--c-tx3);font-style:italic;margin-top:3px;">📝 ${i.notas}</div>`:''}
      </div>
      <div class="iacts">
        <button class="ied" onclick="editIngr(${i.id})">✏️</button>
        <button class="idl" onclick="delIngr(${i.id})">🗑️</button>
      </div>
    </div>`;
  }).join('') || '<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin ingredientes</div>';

  // Tabla tablet
  if (document.getElementById('itbody-ingr')) {
    document.getElementById('itbody-ingr').innerHTML = list.map(i=>{
      const lo=i.stock<=i.min,md=i.stock<=i.min*2&&!lo;
      const sc=lo?'slo':md?'smd':'sok';
      return `<tr><td><strong>${i.nombre}</strong></td><td style="color:var(--c-tx2)">${i.cat}</td><td style="color:var(--c-tx3)">${i.unidad}</td><td><span class="spill ${sc}">${i.stock}</span></td><td style="font-family:'JetBrains Mono',monospace;color:var(--c-or)">${i.precioCompra>0?'$'+i.precioCompra.toFixed(2):'—'}</td><td style="color:var(--c-bl);font-size:12px">${i.proveedor||'—'}</td><td><div class="tba"><button class="tbe" onclick="editIngr(${i.id})">✏️</button><button class="tbd" onclick="delIngr(${i.id})">🗑️</button></div></td></tr>`;
    }).join('');
  }
}

function adjIngr(id,d){const i=ingredientes.find(x=>x.id===id);if(i){i.stock=Math.max(0,i.stock+d);renderIngrCards();}}

let editIngrId = null;
function openAddIngr(){
  editIngrId=null; document.getElementById('mIngrTitle').textContent='Agregar Ingrediente';
  ['in-name','in-prov','in-notas'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('in-stock').value='';document.getElementById('in-min').value='';
  document.getElementById('in-precio').value='';document.getElementById('in-cat').value='Proteínas';
  document.getElementById('in-unit').value='Kg'; openM('mIngr');
}
function editIngr(id){
  const i=ingredientes.find(x=>x.id===id);if(!i)return;
  editIngrId=id; document.getElementById('mIngrTitle').textContent='Editar Ingrediente';
  document.getElementById('in-name').value=i.nombre;document.getElementById('in-cat').value=i.cat;
  document.getElementById('in-unit').value=i.unidad;document.getElementById('in-stock').value=i.stock;
  document.getElementById('in-min').value=i.min;document.getElementById('in-precio').value=i.precioCompra;
  document.getElementById('in-prov').value=i.proveedor;document.getElementById('in-notas').value=i.notas;
  openM('mIngr');
}
function saveIngr(){
  const nombre=document.getElementById('in-name').value.trim();
  if(!nombre){alert('El nombre es obligatorio.');return;}
  const data={nombre,cat:document.getElementById('in-cat').value,unidad:document.getElementById('in-unit').value,
    stock:parseFloat(document.getElementById('in-stock').value)||0,
    min:parseFloat(document.getElementById('in-min').value)||0,
    precioCompra:parseFloat(document.getElementById('in-precio').value)||0,
    proveedor:document.getElementById('in-prov').value.trim(),
    notas:document.getElementById('in-notas').value.trim()};
  if(editIngrId){const i=ingredientes.findIndex(x=>x.id===editIngrId);ingredientes[i]={...ingredientes[i],...data};}
  else{const nid=ingredientes.length?Math.max(...ingredientes.map(x=>x.id))+1:1;ingredientes.push({id:nid,...data});}
  closeM('mIngr');renderIngrCards();renderInvIngrCatTabs(); saveIngredients();
}
function delIngr(id){
  const i=ingredientes.find(x=>x.id===id);
  if(!i)return;
  // Simple confirm via modal not available here — direct delete with no native confirm
  ingredientes=ingredientes.filter(x=>x.id!==id);renderIngrCards();renderInvIngrCatTabs(); saveIngredients();
}

/* ── Producción ── */
function renderInvProdCatTabs(){
  const cats=['Todos',...new Set(produccion.map(p=>p.cat))];
  document.getElementById('ictabs-prod').innerHTML=cats.map(c=>
    `<button class="ictab ${c===invProdCat?'on':''}" onclick="invProdCat='${c}';renderInvProdCatTabs();renderProdCards()">${c}</button>`
  ).join('');
}

function renderProdCards(){
  const list=invProdCat==='Todos'?produccion:produccion.filter(p=>p.cat===invProdCat);
  const catColors={'Salsas':'#008040','Guisos':'#E85500','Almuerzos':'#F0A000','Bebidas':'#0066BB','Bebidas Prep':'#0066BB','Porciones':'#6B31D6'};
  const catEmoji={'Salsas':'🫙','Guisos':'🥩','Almuerzos':'🍽','Bebidas':'🥤','Bebidas Prep':'☕','Porciones':'🍽'};
  document.getElementById('icards-prod').innerHTML=list.map(p=>{
    const lo=p.stock<=p.min,md=p.stock<=p.min*2&&!lo;
    const sc=lo?'slo':md?'smd':'sok';
    const color=catColors[p.cat]||'#E85500';
    const ico=catEmoji[p.cat]||'🍳';
    return `<div class="icard">
      <div class="icard-ico" style="font-size:26px;">${ico}</div>
      <div class="icard-inf">
        <div class="icard-name">${p.nombre}</div>
        <div class="icard-cat" style="color:${color}">${p.cat} · ${p.unidad}</div>
        <div class="icard-meta"><span class="spill ${sc}">${p.stock} ${p.unidad}</span><span style="font-size:11px;color:var(--c-tx3);font-weight:600;">mín ${p.min}</span></div>
        <div class="istk">
          <button class="isb" onclick="adjProd2(${p.id},-1)">−</button>
          <span class="isn">${p.stock}</span>
          <button class="isb" onclick="adjProd2(${p.id},1)">+</button>
          <span style="font-size:10px;color:var(--c-tx3);font-weight:600;">${p.unidad}</span>
        </div>
        ${p.notas?`<div style="font-size:10px;color:var(--c-tx3);font-style:italic;margin-top:3px;">📝 ${p.notas}</div>`:''}
      </div>
      <div class="iacts">
        <button class="ied" onclick="editProd2(${p.id})">✏️</button>
        <button class="idl" onclick="delProd2(${p.id})">🗑️</button>
      </div>
    </div>`;
  }).join('')||'<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin productos elaborados</div>';
}

function adjProd2(id,d){const p=produccion.find(x=>x.id===id);if(p){p.stock=Math.max(0,p.stock+d);renderProdCards();}}

let editProd2Id=null;
function openAddProd2(){
  editProd2Id=null;document.getElementById('mProd2Title').textContent='Agregar Elaborado';
  ['pr-name','pr-notas'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pr-stock').value='';document.getElementById('pr-min').value='';
  document.getElementById('pr-cat').value='Salsas';document.getElementById('pr-unit').value='Lt';
  openM('mProd2');
}
function editProd2(id){
  const p=produccion.find(x=>x.id===id);if(!p)return;
  editProd2Id=id;document.getElementById('mProd2Title').textContent='Editar Elaborado';
  document.getElementById('pr-name').value=p.nombre;document.getElementById('pr-cat').value=p.cat;
  document.getElementById('pr-unit').value=p.unidad;document.getElementById('pr-stock').value=p.stock;
  document.getElementById('pr-min').value=p.min;document.getElementById('pr-notas').value=p.notas||'';
  openM('mProd2');
}
function saveProd2(){
  const nombre=document.getElementById('pr-name').value.trim();if(!nombre){alert('El nombre es obligatorio.');return;}
  const data={nombre,cat:document.getElementById('pr-cat').value,unidad:document.getElementById('pr-unit').value,
    stock:parseFloat(document.getElementById('pr-stock').value)||0,
    min:parseFloat(document.getElementById('pr-min').value)||0,
    notas:document.getElementById('pr-notas').value.trim()};
  if(editProd2Id){const i=produccion.findIndex(x=>x.id===editProd2Id);produccion[i]={...produccion[i],...data};}
  else{const nid=produccion.length?Math.max(...produccion.map(x=>x.id))+1:1;produccion.push({id:nid,...data});}
  closeM('mProd2');renderProdCards();renderInvProdCatTabs();
}
function delProd2(id){produccion=produccion.filter(x=>x.id!==id);renderProdCards();renderInvProdCatTabs();}

/* ══ INVENTARIO ══ */
function renderInvCatTabs() {
  const cats = ['Todos', ...new Set(products.map(p=>p.cat))];
  document.getElementById('ictabs').innerHTML = cats.map(c=>
    `<button class="ictab ${c===invCat?'on':''}" onclick="invCat='${c}';renderInvCatTabs();renderInv()">${c}</button>`
  ).join('');
}

function renderInv() {
  renderInvCatTabs();
  const list = invCat==='Todos' ? products : products.filter(p=>p.cat===invCat);
  const rows = list.map(p=>{ const m=p.price>0?((p.price-p.cost)/p.price*100).toFixed(0):0; const sc=p.stock<=p.min?'slo':p.stock<=p.min*2?'smd':'sok'; return {p,m,sc}; });
  document.getElementById('icards').innerHTML = rows.map(({p,m,sc})=>
    `<div class="icard"><div class="icard-ico">${p.emoji}</div><div class="icard-inf"><div class="icard-name">${p.name}</div><div class="icard-cat">${p.cat}</div><div class="icard-meta">${p.price>0?`<span class="iprice">$${p.price.toFixed(2)}</span>`:''} ${p.price>0?`<span class="imargin">+${m}%</span>`:''} <span class="spill ${sc}">${p.stock} pzas.</span></div><div class="istk"><button class="isb" onclick="adjS(${p.id},-1)">−</button><span class="isn">${p.stock}</span><button class="isb" onclick="adjS(${p.id},1)">+</button><span style="font-size:10px;color:var(--c-tx3);font-weight:600;">stock</span></div></div><div class="iacts"><button class="ied" onclick="editProd(${p.id})">✏️ Editar</button><button class="idl" onclick="delProd(${p.id})">🗑️ Borrar</button></div></div>`
  ).join('') || '<div style="text-align:center;color:var(--c-tx3);padding:30px 0;font-size:13px;font-weight:700;">Sin productos en esta categoría</div>';

  document.getElementById('itbody').innerHTML = rows.map(({p,m,sc})=>
    `<tr><td>${p.emoji} <strong>${p.name}</strong></td><td style="color:var(--c-tx2)">${p.cat}</td><td style="font-family:'JetBrains Mono',monospace;color:var(--c-or);font-weight:700">${p.price>0?'$'+p.price.toFixed(2):'—'}</td><td style="font-family:'JetBrains Mono',monospace;color:var(--c-tx2)">${p.cost>0?'$'+p.cost.toFixed(2):'—'}</td><td><div style="display:flex;align-items:center;gap:6px;"><button class="tbe" style="padding:4px 8px;" onclick="adjS(${p.id},-1)">−</button><span class="spill ${sc}">${p.stock}</span><button class="tbe" style="padding:4px 8px;" onclick="adjS(${p.id},1)">+</button></div></td><td style="color:var(--c-gr);font-weight:800">${p.price>0?m+'%':'—'}</td><td><div class="tba"><button class="tbe" onclick="editProd(${p.id})">✏️</button><button class="tbd" onclick="delProd(${p.id})">🗑️</button></div></td></tr>`
  ).join('');
}

let editRecetaId = null;
let viewingRecetaId = null;
let recCat = 'Todas';

/* Tabla de conversión de unidades */
const UNIT_CONV = {
  // base unidad compra → factor para convertir cantidad receta a unidad compra
  // getConvFactor(unidadCompra, unidadReceta) → multiplier (cuántas unidades de compra usa)
};

function getConvFactor(unidadCompra, unidadReceta) {
  const uc = unidadCompra.toLowerCase();
  const ur = unidadReceta.toLowerCase();
  if (uc === ur) return 1;
  // Kg ↔ Gr
  if (uc === 'kg' && ur === 'gr') return 1/1000;
  if (uc === 'gr' && ur === 'kg') return 1000;
  // Lt ↔ Ml
  if (uc === 'lt' && ur === 'ml') return 1/1000;
  if (uc === 'ml' && ur === 'lt') return 1000;
  // Tapa → Pieza (1 tapa = 30 piezas)
  if (uc === 'tapa' && (ur === 'pz' || ur === 'pieza')) return 1/30;
  // Paquete → Pieza
  if (uc === 'paquete' && (ur === 'pz' || ur === 'pieza')) return 1/12; // default 12 pzas/paquete
  // Mismas dimensiones distintos nombres
  if ((uc === 'pz' || uc === 'pieza') && (ur === 'pz' || ur === 'pieza')) return 1;
  if ((uc === 'bolsa' || uc === 'botella' || uc === 'frasco' || uc === 'lata' || uc === 'rollo') &&
      (ur === 'pz' || ur === 'pieza')) return 1;
  return 1; // fallback: same unit
}

function calcCostoIngr(ingr) {
  /* ingr: {tipo, refId, cant, unidad}
     Retorna costo en $ */
  if (ingr.tipo === 'sub') {
    // Es una subreceta — buscar el costo por porción
    const sub = recetas.find(r=>r.id===ingr.refId);
    if (!sub) return 0;
    return calcCostoReceta(sub).porcion * ingr.cant;
  }
  // Es ingrediente de compra
  const ing = ingredientes.find(i=>i.id===ingr.refId);
  if (!ing || !ing.precioCompra) return 0;
  const factor = getConvFactor(ing.unidad, ingr.unidad);
  // precioCompra es por 1 unidad de compra
  // factor convierte cant_receta → cant_compra
  return ing.precioCompra * ingr.cant * factor;
}

function calcCostoReceta(receta) {
  const total = receta.ingredientes.reduce((s, i) => s + calcCostoIngr(i), 0);
  const rinde = receta.rinde || 1;
  return { total, porcion: total / rinde };
}

/* ── Render receta cards ── */
let recCatFilter = 'Todas';

function renderRecetasCatTabs() {
  document.getElementById('rtabs').innerHTML = ['Todas','Subrecetas','Recetas'].map(c=>
    `<button class="ictab ${c===recCatFilter?'on':''}" onclick="recCatFilter='${c}';renderRecetas()">${c}</button>`
  ).join('');
}