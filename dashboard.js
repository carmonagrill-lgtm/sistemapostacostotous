/* -- Dashboard -- */

function renderDash() {
  const h=calcH(), ss=sessStats();
  const total=h.total+ss.total, tacos=h.tacos+ss.tacos, beb=h.beb+ss.beb, alm=h.alm+ss.alm;
  const totalOrdenes = h.cmd + txns.length;
  const totalPlatos  = txns.reduce((s,t)=>s+t.packages.length,0);

  document.getElementById('d-total').textContent   = '$'+total.toLocaleString('es-MX');
  document.getElementById('d-cmd').textContent     = totalOrdenes+' órdenes totales';
  document.getElementById('d-tacos').textContent   = tacos;
  document.getElementById('d-beb').textContent     = beb;
  document.getElementById('d-ordenes').textContent = totalOrdenes;
  document.getElementById('d-platos').textContent  = totalPlatos;
  document.getElementById('d-tmaiz').textContent   = ss.tMaiz;
  document.getElementById('d-tharina').textContent = ss.tHarina;
  document.getElementById('d-nom').textContent     = '$'+h.nom.toLocaleString('es-MX');
  document.getElementById('d-punto').textContent   = '$'+(h.punto+ss.total*0.05).toFixed(2);

  // Tipo de servicio
  const svTot = servicioCount.aqui + servicioCount.llevar + servicioCount.domicilio || 1;
  const svData = [
    {l:'🪑 Comer aquí', n:servicioCount.aqui,      c:'#E85500'},
    {l:'🛍 Para llevar', n:servicioCount.llevar,    c:'#0066BB'},
    {l:'🛵 Domicilio',   n:servicioCount.domicilio, c:'#008040'},
  ];
  document.getElementById('d-servicio').innerHTML = txns.length===0
    ? '<div style="color:var(--c-tx3);font-size:12px;font-weight:700;text-align:center;padding:8px 0;">Sin datos de sesión aún</div>'
    : svData.map(sv=>`
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:13px;font-weight:800;color:var(--c-tx);flex:1;">${sv.l}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:${sv.c};">${sv.n}</div>
          <div style="width:80px;height:7px;background:var(--c-surf2);border-radius:4px;overflow:hidden;">
            <div style="width:${sv.n/svTot*100}%;height:100%;background:${sv.c};border-radius:4px;"></div>
          </div>
          <div style="font-size:11px;color:var(--c-tx3);font-weight:700;min-width:34px;text-align:right;">${(sv.n/svTot*100).toFixed(0)}%</div>
        </div>`).join('');

  drawPie(tacos,beb,alm);

  // Top guisos
  const gmap={};
  histDays.forEach(d=>d.guisos.forEach(g=>{const m=g.match(/^(.+)\s(\d+)$/);if(m){const n=m[1].trim();gmap[n]=(gmap[n]||0)+parseInt(m[2]);}}));
  Object.entries(soldMap).forEach(([id,q])=>{const p=products.find(x=>x.id==id);if(p&&(p.cat==='Tacos'||p.cat==='Almuerzos')) gmap[p.name]=(gmap[p.name]||0)+q;});
  const topG=Object.entries(gmap).sort((a,b)=>b[1]-a[1]).slice(0,8), mxG=topG[0]?.[1]||1;
  document.getElementById('dTopList').innerHTML = topG.map(([n,q])=>{const p=products.find(x=>x.name===n);return `<div class="topbar-item"><span class="tbi-ico">${p?p.emoji:'🌮'}</span><div class="tbi-inf"><div class="tbi-name">${n}</div><div class="tbi-bar"><div class="tbi-fill" style="width:${q/mxG*100}%"></div></div></div><span class="tbi-n">${q}</span></div>`;}).join('') || '<div style="color:var(--c-tx3);font-size:12px;text-align:center;padding:12px;">Sin datos</div>';

  // Top 3 MENOS vendidos — platillos
  const foodProds = products.filter(p=>['Tacos','Almuerzos'].includes(p.cat));
  const drinkProds = products.filter(p=>p.cat==='Bebidas');
  const foodSold  = foodProds.map(p=>({p, q:(soldMap[p.id]||0)})).sort((a,b)=>a.q-b.q).slice(0,3);
  const drinkSold = drinkProds.map(p=>({p, q:(soldMap[p.id]||0)})).sort((a,b)=>a.q-b.q).slice(0,3);

  const botRow = ({p,q})=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--c-bord);">
    <span style="font-size:16px;">${p.emoji}</span>
    <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:800;color:var(--c-tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div></div>
    <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--c-re);flex-shrink:0;">${q}</span>
  </div>`;
  document.getElementById('dBotFood').innerHTML  = foodSold.map(botRow).join('')  || '<div style="color:var(--c-tx3);font-size:12px;padding:8px 0;">Sin datos</div>';
  document.getElementById('dBotDrink').innerHTML = drinkSold.map(botRow).join('') || '<div style="color:var(--c-tx3);font-size:12px;padding:8px 0;">Sin datos</div>';

  // Cajeros (sesión actual + historial)
  const alexTotal = h.ax.v + (ownerSales.alex||0);
  const betoTotal = h.bx.v + (ownerSales.beto||0);
  const grandTotal = h.total + ss.total || 1;
  document.getElementById('e-alex-v').textContent = '$'+alexTotal.toLocaleString('es-MX');
  document.getElementById('e-alex-n').textContent = '$'+h.ax.n.toFixed(2);
  document.getElementById('e-alex-p').textContent = '$'+h.ax.p.toFixed(2);
  document.getElementById('e-alex-pct').textContent = (alexTotal/grandTotal*100).toFixed(1)+'%';
  document.getElementById('e-beto-v').textContent = '$'+betoTotal.toLocaleString('es-MX');
  document.getElementById('e-beto-n').textContent = '$'+h.bx.n.toFixed(2);
  document.getElementById('e-beto-p').textContent = '$'+h.bx.p.toFixed(2);
  document.getElementById('e-beto-pct').textContent = (betoTotal/grandTotal*100).toFixed(1)+'%';
  // Historial
  document.getElementById('dDays').innerHTML = histDays.map(d=>`<div class="dday"><div class="dday-d">${d.fecha}</div><span class="dday-b">${d.cmd} cmd</span><div class="dday-t">$${d.total.toLocaleString('es-MX')}</div></div>`).join('');
}

function drawPie(tacos,beb,alm) {
  const cv=document.getElementById('pieChart'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const data=[{l:'Tacos',v:tacos,c:'#E85500'},{l:'Bebidas',v:beb,c:'#0066BB'},{l:'Almuerzos',v:alm,c:'#008040'}].filter(d=>d.v>0);
  const tot=data.reduce((s,d)=>s+d.v,0);
  ctx.clearRect(0,0,200,200);
  if (!tot) {
    ctx.beginPath();ctx.arc(100,100,90,0,Math.PI*2);ctx.fillStyle='#F0D4B0';ctx.fill();
    ctx.fillStyle='#BF8850';ctx.font='13px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('Sin datos',100,105);
    document.getElementById('pieLeg').innerHTML='<div style="color:var(--c-tx3);font-size:12px;font-weight:700;text-align:center;">Realiza ventas para ver la gráfica</div>';
    return;
  }
  let ang=-Math.PI/2;
  data.forEach(d=>{const sl=d.v/tot*Math.PI*2;ctx.beginPath();ctx.moveTo(100,100);ctx.arc(100,100,90,ang,ang+sl);ctx.closePath();ctx.fillStyle=d.c;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ang+=sl;});
  ctx.beginPath();ctx.arc(100,100,52,0,Math.PI*2);ctx.fillStyle='#FFFFFF';ctx.fill();
  ctx.fillStyle='#1A0800';ctx.font='bold 14px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText(tot+' pzas',100,97);
  ctx.font='11px Nunito,sans-serif';ctx.fillStyle='#BF8850';ctx.fillText('total',100,113);
  document.getElementById('pieLeg').innerHTML=data.map(d=>`<div class="pie-li"><div class="pie-dot" style="background:${d.c}"></div><span>${d.l}</span><span class="pie-val">${d.v} (${(d.v/tot*100).toFixed(1)}%)</span></div>`).join('');
}

/* ══ AGENTE IA ══ */


/* -- Agente IA -- */

function sendMsg(){
  const i=document.getElementById('ainput');
  const m=i.value.trim();
  if(!m) return;
  i.value='';
  ask(m);
}

function ask(q){
  addMsg('usr', q);
  const tid = addTyping();
  // Simula un pequeño delay para que se vea natural
  setTimeout(()=>{
    remTyping(tid);
    try {
      addMsg('bot', localAgent(q));
    } catch(e) {
      addMsg('bot', '⚠️ Ocurrió un error interno. Intenta de nuevo.');
      console.error('localAgent error:', e);
    }
  }, 420);
}

/* ══ MOTOR LOCAL DEL AGENTE ══ */
function localAgent(q) {
  const h = calcH(), ss = sessStats();
  const totalVentas  = h.total + ss.total;
  const totalOrdenes = h.cmd + txns.length;
  const totalTacos   = h.tacos + ss.tacos;
  const totalBeb     = h.beb + ss.beb;
  const totalAlm     = h.alm + ss.alm;
  const totalPlatos  = txns.reduce((s,t)=>s+t.packages.length, 0);
  const nomina       = h.nom;
  const punto        = h.punto + ss.total * 0.05;
  const alexV        = h.ax.v + (ownerSales.alex||0);
  const betoV        = h.bx.v + (ownerSales.beto||0);
  const mejorDia     = [...histDays].sort((a,b)=>b.total-a.total)[0];
  const peorDia      = [...histDays].sort((a,b)=>a.total-b.total)[0];

  // Top guisos
  const gmap={};
  histDays.forEach(d=>d.guisos.forEach(g=>{
    const m=g.match(/^(.+)\s(\d+)$/);
    if(m){const n=m[1].trim();gmap[n]=(gmap[n]||0)+parseInt(m[2]);}
  }));
  Object.entries(soldMap).forEach(([id,qty])=>{
    const p=products.find(x=>x.id==id);
    if(p&&['Tacos','Almuerzos'].includes(p.cat)) gmap[p.name]=(gmap[p.name]||0)+qty;
  });
  const topG = Object.entries(gmap).sort((a,b)=>b[1]-a[1]);
  const top1 = topG[0], top3 = topG.slice(0,3).map(([n,q])=>`${n} (${q})`).join(', ');

  const txt = q.toLowerCase()
    .normalize('NFD').replace(/\u0300-\u036f/g,'').replace(/[^a-z0-9 ?!.,]/g,' '); // quitar acentos

  const $= n => '$'+n.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2});

  // ── VENTAS TOTALES ──
  if (/total.*venta|venta.*total|cuanto.*vendido|vendimos|ingreso|recaud/.test(txt))
    return `💰 El total acumulado de ventas es <b>${$(totalVentas)}</b>.

Eso incluye ${totalOrdenes} órdenes y ${totalPlatos} platos servidos en esta sesión.`;

  // ── COMANDAS / ÓRDENES ──
  if (/comanda|orden|pedido|cuantas.*venta/.test(txt))
    return `📋 Se han registrado <b>${totalOrdenes} órdenes</b> en total.
En la sesión actual: <b>${txns.length}</b> órdenes con <b>${totalPlatos}</b> platos.`;

  // ── TACOS ──
  if (/taco/.test(txt) && !/bebida|almuerzo|guiso|vendido|top|menos/.test(txt))
    return `🌮 Se han vendido <b>${totalTacos} tacos</b> en total.

El guiso más pedido es <b>${top1 ? top1[0]+' con '+top1[1]+' piezas' : 'sin datos aún'}</b>.`;

  // ── BEBIDAS ──
  if (/bebida/.test(txt) && !/taco|almuerzo|menos|top/.test(txt))
    return `🥤 Se han vendido <b>${totalBeb} bebidas</b> en total.`;

  // ── ALMUERZOS ──
  if (/almuerzo|desayuno/.test(txt))
    return `🍽 Se han vendido <b>${totalAlm} almuerzos</b> en total.`;

  // ── PUNTO / GANANCIA ──
  if (/punto|ganancia|utilidad|profit/.test(txt))
    return `⭐ El punto acumulado es <b>${$(punto)}</b>.

Eso es la ganancia después de restar nómina y costos estimados.`;

  // ── NÓMINA ──
  if (/nomina|nomina|salario|pago.*personal|personal.*pago/.test(txt))
    return `👥 La nómina pagada acumulada es <b>${$(nomina)}</b>.

• Alex: <b>${$(h.ax.n)}</b>
• Beto: <b>${$(h.bx.n)}</b>`;

  // ── CAJEROS / DESGLOSE ──
  if (/alex|beto|dueno|dueno|quien.*mas|mas.*vendio|desglose/.test(txt)) {
    const lider = alexV >= betoV ? 'Alex' : 'Beto';
    const pctAlex = totalVentas > 0 ? (alexV/totalVentas*100).toFixed(1) : 0;
    const pctBeto = totalVentas > 0 ? (betoV/totalVentas*100).toFixed(1) : 0;
    return `👑 Desglose por dueño:

• <b>Alex</b>: ${$(alexV)} (${pctAlex}%)
• <b>Beto</b>: ${$(betoV)} (${pctBeto}%)

🏆 <b>${lider}</b> lleva la delantera.`;
  }

  // ── TOP GUISOS ──
  if (/top|mas.*vendido|vendido.*mas|popular|favorito|guiso/.test(txt) && !/menos/.test(txt)) {
    if (!topG.length) return '🌮 Aún no hay datos de guisos vendidos en esta sesión.';
    return `🏆 Top guisos más vendidos:

${topG.slice(0,5).map(([n,q],i)=>`${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} <b>${n}</b>: ${q} pzas.`).join('<br>')}`;
  }

  // ── MENOS VENDIDOS ──
  if (/menos.*vendido|vendido.*menos|bajo|lento/.test(txt)) {
    const bot = topG.slice(-3).reverse();
    if (!bot.length) return '📉 Aún no hay suficientes datos para mostrar los menos vendidos.';
    return `📉 Los menos vendidos:

${bot.map(([n,q],i)=>`${i+1}. <b>${n}</b>: ${q} pzas.`).join('<br>')}`;
  }

  // ── MEJOR DÍA ──
  if (/mejor.*dia|dia.*mejor|mas.*vendio.*dia|record/.test(txt))
    return `📅 El mejor día fue <b>${mejorDia.fecha}</b> con <b>${$(mejorDia.total)}</b> en ventas (${mejorDia.cmd} órdenes).`;

  // ── PEOR DÍA ──
  if (/peor.*dia|dia.*peor|menos.*vendio.*dia|flojo/.test(txt))
    return `📅 El día más bajo fue <b>${peorDia.fecha}</b> con <b>${$(peorDia.total)}</b> en ventas.`;

  // ── HISTORIAL ──
  if (/historial|dias|resumen.*dias|por.*dia/.test(txt))
    return `📅 Resumen por día:

${histDays.map(d=>`• <b>${d.fecha}</b>: ${$(d.total)} · ${d.cmd} órdenes · punto ${$(d.punto)}`).join('<br>')}`;

  // ── TORTILLAS ──
  if (/tortilla|maiz|harina/.test(txt))
    return `🌽 Tortillas vendidas en sesión actual:

• <b>Maíz</b>: ${ss.tMaiz} pzas.
• <b>Harina</b>: ${ss.tHarina} pzas.`;

  // ── TIPO DE SERVICIO ──
  if (/servicio|domicilio|llevar|aqui|mesa/.test(txt)) {
    const tot = servicioCount.aqui + servicioCount.llevar + servicioCount.domicilio || 1;
    return `🛵 Tipo de servicio (sesión actual):

• 🪑 Comer aquí: <b>${servicioCount.aqui}</b> (${(servicioCount.aqui/tot*100).toFixed(0)}%)
• 🛍 Para llevar: <b>${servicioCount.llevar}</b> (${(servicioCount.llevar/tot*100).toFixed(0)}%)
• 🛵 Domicilio: <b>${servicioCount.domicilio}</b> (${(servicioCount.domicilio/tot*100).toFixed(0)}%)`;
  }

  // ── PLATOS ──
  if (/plato|cuantos.*plato/.test(txt))
    return `🍽 Se han servido <b>${totalPlatos} platos</b> en la sesión actual, dentro de <b>${txns.length} órdenes</b>.`;

  // ── INVENTARIO / STOCK ──
  if (/stock|inventario|quedamos|quedan|bajo.*stock|agotad/.test(txt)) {
    const bajos = products.filter(p=>p.stock<=p.min && ['Tacos','Bebidas','Almuerzos'].includes(p.cat));
    if (!bajos.length) return '✅ Todo el inventario está en niveles normales.';
    return `⚠️ Productos con stock bajo:

${bajos.map(p=>`• ${p.emoji} <b>${p.name}</b>: ${p.stock} pzas. (mín. ${p.min})`).join('<br>')}`;
  }

  // ── RESUMEN GENERAL ──
  if (/resumen|como.*vamos|como.*va|reporte|estado/.test(txt))
    return `📊 <b>Resumen general</b>

💰 Ventas: <b>${$(totalVentas)}</b>
📋 Órdenes: <b>${totalOrdenes}</b>
🌮 Tacos: <b>${totalTacos}</b>
🥤 Bebidas: <b>${totalBeb}</b>
⭐ Punto: <b>${$(punto)}</b>
👥 Nómina: <b>${$(nomina)}</b>

🏆 Top guiso: <b>${top1 ? top1[0] : 'sin datos'}</b>`;

  // ── SALUDO ──
  if (/^(hola|buenas|hey|que tal|como estas|buen dia|buenos)/.test(txt.trim()))
    return `¡Hola! 👋 Soy tu asistente de <b>Tacos Totous</b>. Puedo decirte sobre:

• 💰 Ventas y totales
• 🌮 Tacos y guisos
• 👨‍🍳 Desglose por cajero
• ⭐ Punto y nómina
• 📅 Historial de días
• 📦 Stock bajo
• 🛵 Tipo de servicio

¿Qué quieres saber?`;

  // ── AYUDA ──
  if (/ayuda|que.*puedes|que.*sabes|opciones|comandos/.test(txt))
    return `🤖 Puedo responder sobre:

💰 Total de ventas
📋 Órdenes y platos
🌮 Tacos / bebidas / almuerzos
🏆 Guisos más y menos vendidos
👨‍🍳 Alex vs Beto
⭐ Punto (ganancia)
👥 Nómina
📅 Historial por día / mejor día
🌽 Tortillas maíz y harina
🛵 Tipo de servicio
📦 Stock bajo`;

  // ── DEFAULT ──
  return `🤔 No encontré datos exactos para esa pregunta. Intenta con:

• "¿Cuánto fue el total de ventas?"
• "¿Cuál es el guiso más vendido?"
• "¿Cuánto vendió Alex?"
• "¿Cómo va el inventario?"
• "Dame un resumen"`;
}
function addMsg(role,text){
  const chat=document.getElementById('achat');
  const div=document.createElement('div');
  div.className='amsg '+(role==='bot'?'bot':'usr');
  const html=text.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>').replace(/<br><br>/g,'<br>');
  div.innerHTML=`<div class="amsg-av">${role==='bot'?'🤖':'👤'}</div><div class="amsg-bbl">${html}</div>`;
  chat.appendChild(div); chat.scrollTop=chat.scrollHeight;
}
function addTyping(){const chat=document.getElementById('achat');const id='tp'+Date.now();const div=document.createElement('div');div.className='amsg bot';div.id=id;div.innerHTML=`<div class="amsg-av">🤖</div><div class="amsg-bbl"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>`;chat.appendChild(div);chat.scrollTop=chat.scrollHeight;return id;}
function remTyping(id){const e=document.getElementById(id);if(e)e.remove();}

/* ══ MODALES ══ */