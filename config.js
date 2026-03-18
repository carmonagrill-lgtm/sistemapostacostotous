/* -- Configuracion -- */

function saveBiz() {
  biz.name=document.getElementById('cname').value.trim()||'Tacos Totous';
  biz.phone=document.getElementById('cphone').value.trim()||'';
  biz.address=document.getElementById('caddr').value.trim()||'';
  // ── FIREBASE: guardar configuración ──
  if (window._fbPatchSaveBiz) window._fbPatchSaveBiz();
  alert('✅ Datos guardados.');
}

function saveUrl() { sheetsUrl=document.getElementById('curl').value.trim(); if(!sheetsUrl){alert('Ingresa la URL.');return;} alert('✅ URL guardada.'); }

async function testSheets() {
  const url=document.getElementById('curl').value.trim(); if(!url){alert('Ingresa la URL primero.');return;}
  setSyncSt(0,'⏳ Probando…');
  try { const r=await fetch(url,{method:'POST',body:JSON.stringify({rows:[['TEST','test','0','Test','Prueba',0,0,0,0,'prueba','']]})}); const j=await r.json();
    if(j.ok){setSyncSt(1,'✅ Conexión exitosa');addSLog(true,'Prueba exitosa');sheetsUrl=url;}
    else throw new Error(j.error||'Error');
  } catch(e) { setSyncSt(2,'❌ Error: '+e.message); addSLog(false,'Error: '+e.message); }
}

async function syncSheets(tx) {
  if (!sheetsUrl) return;/* -- Configuracion -- */

function saveBiz() {
  biz.name=document.getElementById('cname').value.trim()||'Tacos Totous';
  biz.phone=document.getElementById('cphone').value.trim()||'';
  biz.address=document.getElementById('caddr').value.trim()||'';
  // ── FIREBASE: guardar configuración ──
  if (window._fbPatchSaveBiz) window._fbPatchSaveBiz();
  alert('✅ Datos guardados.');
}

function saveUrl() { sheetsUrl=document.getElementById('curl').value.trim(); if(!sheetsUrl){alert('Ingresa la URL.');return;} alert('✅ URL guardada.'); }

async function testSheets() {
  const url=document.getElementById('curl').value.trim(); if(!url){alert('Ingresa la URL primero.');return;}
  setSyncSt(0,'⏳ Probando…');
  try { const r=await fetch(url,{method:'POST',body:JSON.stringify({rows:[['TEST','test','0','Test','Prueba',0,0,0,0,'prueba','']]})}); const j=await r.json();
    if(j.ok){setSyncSt(1,'✅ Conexión exitosa');addSLog(true,'Prueba exitosa');sheetsUrl=url;}
    else throw new Error(j.error||'Error');
  } catch(e) { setSyncSt(2,'❌ Error: '+e.message); addSLog(false,'Error: '+e.message); }
}

async function syncSheets(tx) {
  if (!sheetsUrl) return;
  const rows=[]; tx.packages.forEach(pkg=>{pkg.items.forEach(it=>{const t=it.tl?' ('+it.tl+')':'';rows.push([tx.date,tx.time,'Orden #'+tx.id,pkg.label,it.emoji+' '+it.name+t,it.qty,it.price.toFixed(2),(it.price*it.qty).toFixed(2),tx.total.toFixed(2),tx.payM,it.note||'']);});});
  try { const r=await fetch(sheetsUrl,{method:'POST',body:JSON.stringify({rows})}); const j=await r.json(); if(j.ok){addSLog(true,'Orden #'+tx.id+' ('+rows.length+' filas)');setSyncSt(1,'✅ Orden #'+tx.id+' sincronizada');}else throw new Error(j.error); }
  catch(e) { addSLog(false,'Orden #'+tx.id+': '+e.message); setSyncSt(2,'❌ Error al sincronizar'); }
}

function setSyncSt(t,m){const e=document.getElementById('syncSt');if(!e)return;e.className='syst '+(t===1?'sy1':t===2?'sy2':'sy0');e.textContent=m;}
function addSLog(ok,msg){const t=new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});slogData.unshift({ok,msg,t});if(slogData.length>20)slogData.pop();const logEl=document.getElementById('slog');if(logEl)logEl.innerHTML=slogData.map(e=>`<div class="sli"><span class="${e.ok?'slok':'sler'}">${e.ok?'✅':'❌'} ${e.msg}</span><span class="slt">${e.t}</span></div>`).join('');}

/* ══ COCINA ══ */
