/* -- Personal -- */

function renderStaff() {
  const rl={admin:'⚙️ Admin',cajero:'💳 Cajero',cocinero:'👨‍🍳 Cocinero',mesero:'🛎 Mesero',cocina:'📺 Cocina KDS'};
  const ac={admin:'sav-admin',cajero:'sav-cajero',cocinero:'sav-cocinero',mesero:'sav-mesero',cocina:'sav-cocina'};
  const rc={admin:'sr-admin',cajero:'sr-cajero',cocinero:'sr-cocinero',mesero:'sr-mesero',cocina:'sr-cocina'};
  document.getElementById('staffList').innerHTML = staff.length
    ? staff.map(s=>`<div class="scard"><div class="sav ${ac[s.role]||'sav-cajero'}">${s.name.charAt(0).toUpperCase()}</div><div class="sinf"><div class="sname">${s.name}</div><div class="srole ${rc[s.role]||'sr-cajero'}">${rl[s.role]||s.role}</div><div class="susr">@${s.user}</div><span class="sst ${s.status==='activo'?'ston':'stoff'}">${s.status==='activo'?'● Activo':'○ Inactivo'}</span></div><div class="sacts"><button class="ied" onclick="editStaff(${s.id})">✏️ Editar</button><button class="idl" onclick="delStaff(${s.id})">🗑️ Borrar</button></div></div>`).join('')
    : '<div style="text-align:center;color:var(--c-tx3);padding:40px 0;font-size:14px;font-weight:700;">Sin personal registrado</div>';
}

/* ══ LOGIN EDITOR ══ */
let loginEditId = null;

function openLoginEditor() {
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep3').style.display = 'block';
  document.getElementById('masterLoginInput').value = '';
  document.getElementById('masterLoginError').textContent = '';
  setTimeout(()=>document.getElementById('masterLoginInput').focus(), 100);
}

function checkMasterLogin() {
  const val = document.getElementById('masterLoginInput').value.trim();
  if (val === MASTER_KEY) {
    document.getElementById('loginStep3').style.display = 'none';
    document.getElementById('loginStep4').style.display = 'block';
    renderLoginEditor();
  } else {
    document.getElementById('masterLoginError').textContent = '❌ Clave incorrecta';
    document.getElementById('masterLoginInput').value = '';
    document.getElementById('masterLoginInput').focus();
  }
}

function renderLoginEditor() {
  const roleColors = {admin:'#6B31D6', dueno:'#E85500', cajero:'#FF7A1A', cocinero:'#B05000', mesero:'#0066BB', cocina:'#008040'};
  const roleLabels = {admin:'⚙️ Admin', dueno:'👑 Dueño', cajero:'💳 Cajero', cocinero:'👨‍🍳 Cocinero', mesero:'🛎 Mesero', cocina:'📺 Cocina KDS'};
  const el = document.getElementById('loginEditorList');
  el.innerHTML = staff.map(s => `
    <div style="background:#1A0800;border:1.5px solid #3A2000;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;">
      <div style="width:38px;height:38px;border-radius:50%;background:${roleColors[s.role]||'#E85500'};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;">${s.name.charAt(0).toUpperCase()}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:800;color:#FFF5E8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
        <div style="font-size:11px;color:${roleColors[s.role]||'#E85500'};font-weight:700;margin-top:1px;">${roleLabels[s.role]||s.role} · @${s.user}</div>
        <div style="font-size:10px;color:${s.status==='activo'?'#00A050':'#6B5040'};font-weight:800;margin-top:2px;">${s.status==='activo'?'● Activo':'○ Inactivo'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;">
        <button onclick="openLoginEditUser(${s.id})" style="padding:6px 10px;border-radius:7px;font-size:11px;font-weight:800;border:1.5px solid #3A2000;background:#250E00;color:#BF8850;cursor:pointer;font-family:'Nunito',sans-serif;">✏️ Editar</button>
        <button onclick="deleteLoginUser(${s.id})" style="padding:6px 10px;border-radius:7px;font-size:11px;font-weight:800;border:1.5px solid rgba(212,0,30,.3);background:rgba(212,0,30,.08);color:#D4001E;cursor:pointer;font-family:'Nunito',sans-serif;">🗑️ Borrar</button>
      </div>
    </div>`).join('') || '<div style="color:#6B5040;font-size:13px;font-weight:700;text-align:center;padding:20px 0;">Sin usuarios registrados</div>';
}

function openLoginAddUser() {
  loginEditId = null;
  document.getElementById('loginFormTitle').textContent = '➕ Nuevo Usuario';
  ['lf-name','lf-user','lf-pass'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('lf-role').value = 'cajero';
  document.getElementById('lf-status').value = 'activo';
  document.getElementById('loginFormError').textContent = '';
  document.getElementById('loginStep4').style.display = 'none';
  document.getElementById('loginStep5').style.display = 'block';
}

function openLoginEditUser(id) {
  const s = staff.find(x=>x.id===id); if (!s) return;
  loginEditId = id;
  document.getElementById('loginFormTitle').textContent = '✏️ Editar Usuario';
  document.getElementById('lf-name').value = s.name;
  document.getElementById('lf-user').value = s.user;
  document.getElementById('lf-pass').value = s.pass;
  document.getElementById('lf-role').value = s.role;
  document.getElementById('lf-status').value = s.status;
  document.getElementById('loginFormError').textContent = '';
  document.getElementById('loginStep4').style.display = 'none';
  document.getElementById('loginStep5').style.display = 'block';
}

function saveLoginUser() {
  const name = document.getElementById('lf-name').value.trim();
  const user = document.getElementById('lf-user').value.trim().toLowerCase().replace(/\s+/g,'');
  const pass = document.getElementById('lf-pass').value.trim();
  const role = document.getElementById('lf-role').value;
  const status = document.getElementById('lf-status').value;
  const errEl = document.getElementById('loginFormError');
  if (!name || !user || !pass) { errEl.textContent = '❌ Completa todos los campos'; return; }
  if (pass.length < 4) { errEl.textContent = '❌ PIN mínimo 4 dígitos'; return; }
  if (staff.find(s=>s.user===user && s.id!==loginEditId)) { errEl.textContent = `❌ El usuario "@${user}" ya existe`; return; }
  if (loginEditId) {
    const i = staff.findIndex(s=>s.id===loginEditId);
    staff[i] = {...staff[i], name, user, pass, role, status};
  } else {
    const nid = staff.length > 0 ? Math.max(...staff.map(s=>s.id))+1 : 1;
    staff.push({id:nid, name, user, pass, role, status});
  }
  // ── FIREBASE ──
  const loginGuardar = loginEditId ? staff.find(s=>s.id===loginEditId) : staff[staff.length-1];
  if (window._fbPatchSaveStaff) window._fbPatchSaveStaff(loginGuardar);
  backToEditor();
}

function deleteLoginUser(id) {
  const s = staff.find(x=>x.id===id);
  if (!s || !confirm(`¿Borrar a "${s.name}"?`)) return;
  staff = staff.filter(x=>x.id!==id);
  // ── FIREBASE ──
  if (window._fbPatchDelStaff) window._fbPatchDelStaff(id);
  renderLoginEditor();
}

function backToEditor() {
  document.getElementById('loginStep4').style.display = 'block';
  document.getElementById('loginStep5').style.display = 'none';
  renderLoginEditor();
}

function askMaster() {
  document.getElementById('masterInput').value='';
  document.getElementById('masterError').textContent='';
  openM('mMaster');
  setTimeout(()=>document.getElementById('masterInput').focus(),100);
}
function checkMaster() {
  const val = document.getElementById('masterInput').value.trim();
  if (val === MASTER_KEY) {
    closeM('mMaster');
    perUnlocked = true;
    document.getElementById('per-lock').style.display = 'none';
    document.getElementById('per-content').style.display = 'flex';
    renderStaff();
  } else {
    document.getElementById('masterError').textContent = '❌ Clave incorrecta';
    document.getElementById('masterInput').value='';
    document.getElementById('masterInput').focus();
  }
}
function lockPer() {
  perUnlocked = false;
  document.getElementById('per-lock').style.display = 'flex';
  document.getElementById('per-content').style.display = 'none';
}
function openAddStaff() {
  editStaffId=null; document.getElementById('mStaffTitle').textContent='Agregar Personal';
  ['fs-name','fs-user','fs-pass'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('fs-role').value='cajero'; document.getElementById('fs-status').value='activo'; openM('mStaff');
}
function editStaff(id) {
  const s=staff.find(x=>x.id===id); if(!s) return;
  editStaffId=id; document.getElementById('mStaffTitle').textContent='Editar Personal';
  document.getElementById('fs-name').value=s.name; document.getElementById('fs-user').value=s.user;
  document.getElementById('fs-pass').value=s.pass; document.getElementById('fs-role').value=s.role;
  document.getElementById('fs-status').value=s.status; openM('mStaff');
}
function saveStaff() {
  const name=document.getElementById('fs-name').value.trim();
  const user=document.getElementById('fs-user').value.trim().toLowerCase();
  const pass=document.getElementById('fs-pass').value.trim();
  const role=document.getElementById('fs-role').value;
  const status=document.getElementById('fs-status').value;
  if (!name||!user||!pass) { alert('Completa todos los campos.'); return; }
  if (pass.length<4) { alert('PIN mínimo 4 dígitos.'); return; }
  if (staff.find(s=>s.user===user&&s.id!==editStaffId)) { alert(`El usuario "@${user}" ya existe.`); return; }
  if (editStaffId) { const i=staff.findIndex(s=>s.id===editStaffId); staff[i]={...staff[i],name,user,pass,role,status}; }
  else { const nid=staff.length>0?Math.max(...staff.map(s=>s.id))+1:1; staff.push({id:nid,name,user,pass,role,status}); }
  // ── FIREBASE ──
  const staffGuardar = editStaffId ? staff.find(s=>s.id===editStaffId) : staff[staff.length-1];
  if (window._fbPatchSaveStaff) window._fbPatchSaveStaff(staffGuardar);
  closeM('mStaff'); renderStaff();
}
function delStaff(id) {
  const s=staff.find(x=>x.id===id); if(!s||!confirm(`¿Borrar a "${s.name}"?`)) return;
  staff=staff.filter(x=>x.id!==id);
  // ── FIREBASE ──
  if (window._fbPatchDelStaff) window._fbPatchDelStaff(id);
  renderStaff();
}

/* ══ CONFIG ══ */
/* ══ PRODUCCIONES ══ */
let prodLogs = [];
let prodFilter = 'hoy';
let plSelectedId = null;

const CAT_EMOJIS_PROD = {
  'Salsas':'🫙','Guisos':'🥩','Almuerzos':'🍽',
  'Bebidas':'🥤','Bebidas Prep':'☕','Porciones':'🍽'
};
const CAT_COLORS_PROD = {
  'Salsas':'#008040','Guisos':'#E85500','Almuerzos':'#F0A000',
  'Bebidas':'#0066BB','Bebidas Prep':'#0066BB','Porciones':'#6B31D6'
};

/* -- Empleados -- */

function renderEmpleados() {
  const activos = empleados.filter(e=>e.status==='activo');
  const bajas   = empleados.filter(e=>e.status!=='activo');
  const roleColors = {dueno:'#E85500',admin:'#6B31D6',cajero:'#FF7A1A',cocinero:'#B05000',mesero:'#0066BB',cocina:'#008040'};
  const freqLbl = {semanal:'semana',quincenal:'quincena',mensual:'mes',diario:'día'};

  const empCard = (e) => {
    const color = roleColors[e.rol?.toLowerCase()] || '#E85500';
    const activo = e.status === 'activo';
    return `<div class="ecard ${activo?'':'inactivo'}">
      <div class="ecard-av" style="background:${color}">${e.nombre.charAt(0).toUpperCase()}</div>
      <div class="ecard-inf">
        <div class="ecard-name">${e.nombre}</div>
        <div class="ecard-role">${e.rol||'—'}</div>
        <div class="ecard-dates">
          <span class="edate edate-in">📅 Entrada: ${fmtDate(e.fechaIn)}</span>
          ${e.fechaOut ? `<span class="edate edate-out">🚪 Salida: ${fmtDate(e.fechaOut)} · ${e.motivo||''}</span>` : `<span class="edate edate-in" style="background:rgba(232,85,0,.08);color:var(--c-or);">⏱ ${antiguedad(e.fechaIn)}</span>`}
        </div>
        <div class="ecard-nom">
          <span class="enom-lbl">Nómina</span>
          <span class="enom-val">$${parseFloat(e.nomina||0).toLocaleString('es-MX',{minimumFractionDigits:2})}</span>
          <span class="enom-per">/ ${freqLbl[e.freq]||e.freq}</span>
          ${e.notas ? `<span style="font-size:10px;color:var(--c-tx3);font-style:italic;width:100%;margin-top:2px;">📝 ${e.notas}</span>` : ''}
        </div>
      </div>
      <div class="ecard-acts">
        <button class="ied" onclick="editEmp(${e.id})" style="font-size:11px;padding:6px 8px;">✏️ Editar</button>
        ${activo
          ? `<button class="ebaja" onclick="openBaja(${e.id})">🚪 Baja</button>`
          : `<button class="ereact" onclick="reactivarEmp(${e.id})">↩ Reactivar</button>`}
      </div>
    </div>`;
  };

  document.getElementById('empActivos').innerHTML = activos.length
    ? activos.map(empCard).join('')
    : '<div style="color:var(--c-tx3);font-size:13px;font-weight:700;text-align:center;padding:16px 0;">Sin empleados activos</div>';

  document.getElementById('empBajas').innerHTML = bajas.length
    ? bajas.map(empCard).join('')
    : '<div style="color:var(--c-tx3);font-size:13px;font-weight:700;text-align:center;padding:16px 0;">Sin registros de baja</div>';
}

function openAddEmp() {
  editEmpId = null;
  document.getElementById('mEmpTitle').textContent = 'Agregar Empleado';
  ['emp-name','emp-rol','emp-nom','emp-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('emp-fin').value = todayStr();
  document.getElementById('emp-freq').value = 'semanal';
  document.getElementById('emp-fout-wrap').style.display = 'none';
  document.getElementById('emp-fout').value = '';
  openM('mEmp');
}

function editEmp(id) {
  const e = empleados.find(x=>x.id===id); if(!e) return;
  editEmpId = id;
  document.getElementById('mEmpTitle').textContent = 'Editar Empleado';
  document.getElementById('emp-name').value  = e.nombre;
  document.getElementById('emp-rol').value   = e.rol||'';
  document.getElementById('emp-nom').value   = e.nomina||'';
  document.getElementById('emp-freq').value  = e.freq||'semanal';
  document.getElementById('emp-fin').value   = e.fechaIn||'';
  document.getElementById('emp-notes').value = e.notas||'';
  const wrap = document.getElementById('emp-fout-wrap');
  if (e.status !== 'activo') {
    wrap.style.display = 'flex';
    document.getElementById('emp-fout').value = e.fechaOut||'';
  } else {
    wrap.style.display = 'none';
  }
  openM('mEmp');
}

function saveEmp() {
  const nombre = document.getElementById('emp-name').value.trim();
  if (!nombre) { alert('El nombre es obligatorio.'); return; }
  const data = {
    nombre,
    rol:     document.getElementById('emp-rol').value.trim(),
    nomina:  parseFloat(document.getElementById('emp-nom').value)||0,
    freq:    document.getElementById('emp-freq').value,
    fechaIn: document.getElementById('emp-fin').value,
    fechaOut:document.getElementById('emp-fout').value||null,
    notas:   document.getElementById('emp-notes').value.trim(),
    status:  'activo',
  };
  if (editEmpId) {
    const i = empleados.findIndex(e=>e.id===editEmpId);
    empleados[i] = {...empleados[i], ...data};
  } else {
    const nid = empleados.length ? Math.max(...empleados.map(e=>e.id))+1 : 1;
    empleados.push({id:nid, ...data});
  }
  // ── FIREBASE ──
  const empGuardar = editEmpId ? empleados.find(e=>e.id===editEmpId) : empleados[empleados.length-1];
  if (window._fbPatchSaveEmp) window._fbPatchSaveEmp(empGuardar);
  closeM('mEmp'); renderEmpleados();
}

function openBaja(id) {
  const e = empleados.find(x=>x.id===id); if(!e) return;
  bajaEmpId = id;
  document.getElementById('mBajaName').textContent = e.nombre;
  document.getElementById('bajaMotivo').value = 'renuncia';
  openM('mBaja');
}

function confirmBaja() {
  const e = empleados.find(x=>x.id===bajaEmpId); if(!e) return;
  const motivoMap = {renuncia:'Renuncia',despido:'Despido','fin-contrato':'Fin contrato',otro:'Otro'};
  e.status  = 'inactivo';
  e.fechaOut = todayStr();
  e.motivo  = motivoMap[document.getElementById('bajaMotivo').value]||'Baja';
  // ── FIREBASE ──
  if (window._fbPatchSaveEmp) window._fbPatchSaveEmp(e);
  closeM('mBaja'); renderEmpleados();
}

function reactivarEmp(id) {
  const e = empleados.find(x=>x.id===id); if(!e) return;
  e.status   = 'activo';
  e.fechaOut = null;
  e.motivo   = null;
  e.fechaIn  = todayStr();
  // ── FIREBASE ──
  if (window._fbPatchSaveEmp) window._fbPatchSaveEmp(e);
  renderEmpleados();
}

function cerrarSesion() {
  currentUser = null;
  document.getElementById('userPill').style.display = 'none';
  document.getElementById('userPillName').textContent = '—';
  document.querySelectorAll('.owner-only').forEach(el => el.classList.remove('vis'));
  const locked = document.getElementById('kpi-locked');
  if (locked) locked.style.display = 'block';
  showLogin();
}
