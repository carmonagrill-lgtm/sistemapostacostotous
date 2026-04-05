/* -- Cocina KDS -- */

function sendToKitchen(tx) {
  const o = {id:tx.id, packages:tx.packages.map(pkg=>({label:pkg.label, items:pkg.items.map(i=>({emoji:i.emoji,name:i.name+(i.tl?' · '+i.tl:''),qty:i.qty,note:i.note||''}))})), time:tx.time, status:'new', startMs:Date.now(), elapsed:0, timerId:null};
  o.timerId = setInterval(()=>{
    o.elapsed = Math.floor((Date.now()-o.startMs)/1000);
    const e = document.getElementById('kt-'+o.id);
    if (e) { const m=Math.floor(o.elapsed/60),s=o.elapsed%60; e.textContent=m+':'+String(s).padStart(2,'0'); e.classList.toggle('urg',o.elapsed>=600&&o.status!=='done'); }
    updKStats();
  }, 1000);
  kOrders.unshift(o); renderKDS();
}
function updKStats(){document.getElementById('kn').textContent=kOrders.filter(o=>o.status==='new').length;document.getElementById('kp').textContent=kOrders.filter(o=>o.status==='prep').length;document.getElementById('kd').textContent=kOrders.filter(o=>o.status==='done').length;}
function kSetSt(id,st){const o=kOrders.find(x=>x.id===id);if(!o)return;if(st==='done'&&o.timerId){clearInterval(o.timerId);o.timerId=null;}o.status=st;renderKDS();}
function kRem(id){const o=kOrders.find(x=>x.id===id);if(o&&o.timerId)clearInterval(o.timerId);kOrders=kOrders.filter(x=>x.id!==id);renderKDS();}
function renderKDS() {
  updKStats();
  const all = [...kOrders.filter(o=>o.status!=='done'), ...kOrders.filter(o=>o.status==='done')];
  const emEl=document.getElementById('k-empty'), scEl=document.getElementById('kscroll');
  if (!all.length) { emEl.style.display='flex'; scEl.style.display='none'; return; }
  emEl.style.display='none'; scEl.style.display='flex';
  const lb={new:'🔴 Nuevo',prep:'🟡 Preparando',done:'✅ Listo'};
  scEl.innerHTML = all.map(o=>{
    const m=Math.floor(o.elapsed/60),s=o.elapsed%60,t=m+':'+String(s).padStart(2,'0'),u=o.elapsed>=600&&o.status!=='done';
    const pkgs = o.packages.map(pkg=>`<div><div class="kds-pkg-hdr"><span class="kds-pkg-l">🍽 ${pkg.label}</span></div><div class="kds-pkg-bd">${pkg.items.map(it=>`<div class="kds-item"><div class="kds-iq">${it.qty}×</div><div><div class="kds-in">${it.emoji} ${it.name}</div>${it.note?`<div class="kds-inote">⚠️ ${it.note}</div>`:''}</div></div>`).join('')}</div></div>`).join('');
    const btns = o.status==='new'?`<button class="kbtn kbprep" onclick="kSetSt(${o.id},'prep')">🍳 Preparando</button><button class="kbtn kbsec" onclick="kRem(${o.id})">✕ Cancelar</button>`:o.status==='prep'?`<button class="kbtn kbdone" onclick="kSetSt(${o.id},'done')">✅ ¡Listo!</button><button class="kbtn kbsec" onclick="kSetSt(${o.id},'new')">↩ Regresar</button>`:`<button class="kbtn kbsec" onclick="kSetSt(${o.id},'prep')">↩ Reabrir</button><button class="kbtn kbsec" onclick="kRem(${o.id})">🗑 Quitar</button>`;
    return `<div class="kds-card s${o.status}"><div class="kds-card-hdr"><div><div class="kds-on">Orden #${o.id}</div><div class="kds-om">${o.time} · ${lb[o.status]}</div></div><div class="kds-tmr${u?' urg':''}" id="kt-${o.id}">${t}</div></div><div class="kds-bd">${pkgs}</div><div class="kds-ft">${btns}</div></div>`;
  }).join('');
}

/* ══ DASHBOARD ══ */
const histDays = [
  {fecha:'Día 1',total:1180,nomina:300,punto:59,tacos:36,beb:5,alm:3,cmd:10,alex:{v:800,n:222.46,p:43.75},beto:{v:305,n:77.54,p:15.25},guisos:['Chicharrón Verde 12','Barbacoa 7','Carne Asada 6']},
  {fecha:'Día 2',total:1925,nomina:300,punto:96.25,tacos:62,beb:5,alm:6,cmd:13,alex:{v:1410,n:219.74,p:70.50},beto:{v:515,n:80.26,p:25.75},guisos:['Carne Asada 14','Barbacoa 14','Chicharrón Verde 9']},
  {fecha:'Día 3',total:855,nomina:300,punto:42.75,tacos:25,beb:4,alm:3,cmd:7,alex:{v:560,n:196.49,p:28},beto:{v:295,n:103.51,p:14.75},guisos:['Chicharrón Verde 6','Barbacoa 6','Deshebrada 3']},
  {fecha:'Día 4',total:2080,nomina:250,punto:104,tacos:91,beb:7,alm:2,cmd:13,alex:{v:1970,n:236.78,p:98.50},beto:{v:110,n:13.22,p:5.50},guisos:['Barbacoa 30','Carne Asada 22','Chicharrón Rojo 11']},
  {fecha:'Día 5',total:1440,nomina:300,punto:72,tacos:44,beb:6,alm:5,cmd:11,alex:{v:1015,n:211.46,p:50.75},beto:{v:425,n:88.54,p:21.25},guisos:['Barbacoa 14','Carne Asada 11','Agua Sabor 3']},
  {fecha:'Día 6',total:2230,nomina:300,punto:111.50,tacos:91,beb:17,alm:0,cmd:9,alex:{v:2230,n:300,p:111.50},beto:{v:0,n:0,p:0},guisos:['Barbacoa 36','Chicharrón Verde 12','Chicharrón Rojo 11']},
  {fecha:'Día 7',total:300,nomina:300,punto:15,tacos:15,beb:0,alm:0,cmd:3,alex:{v:300,n:300,p:15},beto:{v:0,n:0,p:0},guisos:['Deshebrada 5','Huevo en Salsa 5','Picadillo 3']},
];

function calcH() {
  return histDays.reduce((a,d)=>({
    total:a.total+d.total, nom:a.nom+d.nomina, punto:a.punto+d.punto,
    tacos:a.tacos+d.tacos, beb:a.beb+d.beb, alm:a.alm+d.alm, cmd:a.cmd+d.cmd,
    ax:{v:a.ax.v+d.alex.v,n:a.ax.n+d.alex.n,p:a.ax.p+d.alex.p},
    bx:{v:a.bx.v+d.beto.v,n:a.bx.n+d.beto.n,p:a.bx.p+d.beto.p}
  }), {total:0,nom:0,punto:0,tacos:0,beb:0,alm:0,cmd:0,ax:{v:0,n:0,p:0},bx:{v:0,n:0,p:0}});
}

function sessStats() {
  const items = txns.flatMap(t=>t.items);
  const platos = txns.reduce((s,t)=>s+t.packages.length, 0);
  const tMaiz   = items.filter(i=>i.tort==='maiz').reduce((s,i)=>s+i.qty,0);
  const tHarina = items.filter(i=>i.tort==='harina').reduce((s,i)=>s+i.qty,0);
  return {
    total:salesTotal,
    tacos:items.filter(i=>i.cat==='Tacos').reduce((s,i)=>s+i.qty,0),
    beb:items.filter(i=>i.cat==='Bebidas').reduce((s,i)=>s+i.qty,0),
    alm:items.filter(i=>i.cat==='Almuerzos').reduce((s,i)=>s+i.qty,0),
    platos, tMaiz, tHarina
  };
}