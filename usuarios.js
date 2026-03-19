/* -- Usuarios y Login -- */

const MASTER_KEY = '3453'; // Clave exclusiva del administrador del sistema
let staff = [
  {id:1, name:'Carlos Mendoza', user:'carlos', pass:'1111', role:'admin',   status:'activo'},
  {id:2, name:'Alex',            user:'alex',   pass:'1111', role:'dueno',   status:'activo'},
  {id:3, name:'Beto',            user:'beto',   pass:'1111', role:'dueno',   status:'activo'},
  {id:4, name:'Ana Ruiz',        user:'ana',    pass:'1111', role:'cajero',  status:'activo'},
  {id:5, name:'Pedro López',     user:'pedro',  pass:'1111', role:'cocina',  status:'activo'},
];
let editStaffId = null;
let perUnlocked = false;

/* Productos asignados a Beto automáticamente */
const BETO_CATS = ['Almuerzos','Bebidas Preparadas'];
const BETO_IDS  = [22, 24]; // Agua Natural, Lipton (embotelladas de Beto)

function getAutoOwner(items) {
  if (!items || items.length === 0) return 'alex';
  // Si TODOS son de Beto → Beto
  const allBeto = items.every(i => BETO_CATS.includes(i.cat) || BETO_IDS.includes(i.id));
  if (allBeto) return 'beto';
  // Si hay mezcla, el que tenga más monto
  let alexAmt = 0, betoAmt = 0;
  items.forEach(i => {
    if (BETO_CATS.includes(i.cat) || BETO_IDS.includes(i.id)) betoAmt += i.price * i.qty;
    else alexAmt += i.price * i.qty;
  });
  return betoAmt > alexAmt ? 'beto' : 'alex';
}

function updateOwnerIndicator() {
  const items = allItems();
  const ind = document.getElementById('owner-indicator');
  const nm  = document.getElementById('owner-name');
  if (!ind || !nm) return;
  if (items.length === 0) { ind.style.display = 'none'; return; }
  const owner = getAutoOwner(items);
  salesOwner = owner;
  ind.style.display = 'block';
  nm.textContent = owner === 'beto' ? 'Beto' : 'Alex';
  nm.style.color = owner === 'beto' ? 'var(--c-bl)' : 'var(--c-or)';
}

/* ══ USUARIO ACTIVO ══ */
let currentUser = null;
let selectedLoginUser = null;

/* ══ CONFIG ══ */
let biz = {name:'Tacos Totous', phone:'(55) 0000-0000', address:''};
let sheetsUrl = '';
let slogData = [];

/* ══ ESTADO ORDEN ══ */
let packages = [], nextPkg = 0, nextCI = 0;
let disc = 0, payM = 'efectivo', salesOwner = 'alex', editPId = null;
let ivaOn = false;
let tipoServicio = 'aqui';
let servicioCount = {aqui:0, llevar:0, domicilio:0};
let txns = [], salesTotal = 0, soldMap = {};
let ownerSales = {alex:0, beto:0};
let aCat = 'Todos', invCat = 'Todos';
let invIngrCat = 'Todos', invProdCat = 'Todos';

/* ══ INGREDIENTES (insumos de compra) ══ */
let ingredientes = [
  // PROTEÍNAS
  {id:1,  nombre:'Chorizo',             cat:'Proteínas',   unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'Chorizería',       notas:'Ristra 8 piezas × 70g'},
  {id:2,  nombre:'Huevo',               cat:'Proteínas',   unidad:'Tapa',   stock:5,  min:2,  precioCompra:12,  proveedor:'Frutería Vallarta', notas:'Tapa 30 piezas'},
  {id:3,  nombre:'Machacado',           cat:'Proteínas',   unidad:'Bolsa',  stock:5,  min:2,  precioCompra:12,  proveedor:'Ramos',             notas:'Bolsa 100g'},
  {id:4,  nombre:'Pechuga de Pollo',    cat:'Proteínas',   unidad:'Pieza',  stock:5,  min:2,  precioCompra:75,  proveedor:'Ramos',             notas:'Con hueso'},
  {id:5,  nombre:'Pierna',              cat:'Proteínas',   unidad:'Pieza',  stock:5,  min:2,  precioCompra:12,  proveedor:'Merco',             notas:''},
  {id:6,  nombre:'Salchicha',           cat:'Proteínas',   unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:7,  nombre:'Tocino',              cat:'Proteínas',   unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  // VERDURAS
  {id:8,  nombre:'Ajo',                 cat:'Verduras',    unidad:'Pieza',  stock:10, min:3,  precioCompra:5,   proveedor:'',                  notas:''},
  {id:9,  nombre:'Cebolla Blanca',      cat:'Verduras',    unidad:'Pieza',  stock:10, min:3,  precioCompra:30,  proveedor:'',                  notas:''},
  {id:10, nombre:'Cebolla Morada',      cat:'Verduras',    unidad:'Pieza',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:11, nombre:'Chile Jalapeño',      cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:12, nombre:'Chile Jalapeño Rojo', cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:13, nombre:'Chile Morón',         cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:14, nombre:'Chile Poblano',       cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:15, nombre:'Chile Serrano',       cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:1,  precioCompra:40,  proveedor:'',                  notas:''},
  {id:16, nombre:'Cilantro',            cat:'Verduras',    unidad:'Manojo', stock:5,  min:2,  precioCompra:15,  proveedor:'',                  notas:''},
  {id:17, nombre:'Papa',                cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:18, nombre:'Perejil',             cat:'Verduras',    unidad:'Manojo', stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:19, nombre:'Repollo',             cat:'Verduras',    unidad:'Pieza',  stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:20, nombre:'Tomate Fresadilla',   cat:'Verduras',    unidad:'Bolsa',  stock:10, min:3,  precioCompra:55,  proveedor:'',                  notas:'Para chilaquiles'},
  {id:21, nombre:'Tomate Huaje',        cat:'Verduras',    unidad:'Bolsa',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:'Para salsas'},
  // MISCELÁNEOS
  {id:22, nombre:'Aceite',              cat:'Misceláneos', unidad:'Botella',stock:5,  min:2,  precioCompra:25,  proveedor:'',                  notas:''},
  {id:23, nombre:'Azúcar',              cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:24, nombre:'Consomé de Pollo',    cat:'Misceláneos', unidad:'Pieza',  stock:5,  min:2,  precioCompra:80,  proveedor:'',                  notas:''},
  {id:25, nombre:'Consomé de Tomate',   cat:'Misceláneos', unidad:'Pieza',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:26, nombre:'Crema',               cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:27, nombre:'Frijol',              cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:28, nombre:'Leche',               cat:'Misceláneos', unidad:'Botella',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:29, nombre:'Manteca',             cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:30, nombre:'Nescafé',             cat:'Misceláneos', unidad:'Frasco', stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:31, nombre:'Puré de Tomate',      cat:'Misceláneos', unidad:'Lata',   stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:32, nombre:'Queso Durangueño',    cat:'Misceláneos', unidad:'Pieza',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:33, nombre:'Sal',                 cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:34, nombre:'Tortillas',           cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:3,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:35, nombre:'Totopos',             cat:'Misceláneos', unidad:'Bolsa',  stock:5,  min:2,  precioCompra:35,  proveedor:'',                  notas:''},
  // DESECHABLES
  {id:36, nombre:'7×7',                 cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:37, nombre:'Bolsa Bollos',        cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:38, nombre:'Bolsa Camiseta Chica',cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:39, nombre:'Bolsa Rollo Kilo',    cat:'Desechables', unidad:'Rollo',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:40, nombre:'Bolsas Jumbo',        cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:41, nombre:'Cuchillo',            cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:42, nombre:'Papel Aluminio',      cat:'Desechables', unidad:'Rollo',  stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:43, nombre:'Plato Chico',         cat:'Desechables', unidad:'Paquete',stock:10, min:3,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:44, nombre:'Plato Grande',        cat:'Desechables', unidad:'Paquete',stock:10, min:3,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:45, nombre:'Servilletas',         cat:'Desechables', unidad:'Paquete',stock:10, min:3,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:46, nombre:'Tenedor',             cat:'Desechables', unidad:'Paquete',stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:47, nombre:'Vitafil',             cat:'Desechables', unidad:'Rollo',  stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  // LIMPIEZA
  {id:48, nombre:'Axion',               cat:'Limpieza',    unidad:'Pieza',  stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:49, nombre:'Cloro',               cat:'Limpieza',    unidad:'Botella',stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:50, nombre:'Esponja',             cat:'Limpieza',    unidad:'Pieza',  stock:5,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:51, nombre:'Fabuloso',            cat:'Limpieza',    unidad:'Botella',stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:52, nombre:'Microdim',            cat:'Limpieza',    unidad:'Botella',stock:3,  min:1,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:53, nombre:'Papel Higiénico',     cat:'Limpieza',    unidad:'Paquete',stock:4,  min:2,  precioCompra:12,  proveedor:'',                  notas:''},
  {id:54, nombre:'Trapos',              cat:'Limpieza',    unidad:'Pieza',  stock:10, min:3,  precioCompra:12,  proveedor:'',                  notas:''},
];

/* ══ PRODUCCIÓN (elaborados) ══ */
let produccion = [
  // SALSAS
  {id:1,  nombre:'Salsa Verde de Jalapeño',        cat:'Salsas',    unidad:'Lt',  stock:5,  min:1, notas:'Jalapeño verde, tomate fresadilla, cilantro, cebolla, ajo'},
  {id:2,  nombre:'Salsa Roja de Jalapeño',          cat:'Salsas',    unidad:'Lt',  stock:5,  min:1, notas:'Jalapeño rojo, tomate huaje, ajo, cebolla'},
  {id:3,  nombre:'Salsa de Tomatillo',              cat:'Salsas',    unidad:'Lt',  stock:3,  min:1, notas:'Tomatillo, chile serrano, cilantro'},
  {id:4,  nombre:'Fresadilla para Chilaquiles',     cat:'Salsas',    unidad:'Lt',  stock:3,  min:1, notas:'Tomate fresadilla, chile, especias'},
  {id:5,  nombre:'Salsa Tomate Guaje Chilaquiles',  cat:'Salsas',    unidad:'Lt',  stock:3,  min:1, notas:'Tomate huaje, chile jalapeño'},
  // GUISOS PREPARADOS
  {id:6,  nombre:'Barbacoa',                        cat:'Guisos',    unidad:'Kg',  stock:3,  min:1, notas:''},
  {id:7,  nombre:'Carne Asada',                     cat:'Guisos',    unidad:'Kg',  stock:3,  min:1, notas:''},
  {id:8,  nombre:'Chicharrón Verde',                cat:'Guisos',    unidad:'Kg',  stock:3,  min:1, notas:'Chicharrón + salsa verde jalapeño'},
  {id:9,  nombre:'Chicharrón Rojo',                 cat:'Guisos',    unidad:'Kg',  stock:3,  min:1, notas:'Chicharrón + salsa roja jalapeño'},
  {id:10, nombre:'Deshebrada',                      cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Pierna deshebrada'},
  {id:11, nombre:'Picadillo',                       cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:''},
  {id:12, nombre:'Huevo con Chorizo',               cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Huevo + chorizo'},
  {id:13, nombre:'Huevo con Papa',                  cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Huevo + papa'},
  {id:14, nombre:'Huevo en Salsa',                  cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Huevo + salsa roja'},
  {id:15, nombre:'Chile de Queso',                  cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Chile poblano + queso durangueño'},
  {id:16, nombre:'Chile de Carne',                  cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Chile + carne'},
  {id:17, nombre:'Papas con Chorizo',               cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:''},
  {id:18, nombre:'Queso en Rajas',                  cat:'Guisos',    unidad:'Kg',  stock:2,  min:1, notas:'Chile poblano + queso'},
  {id:19, nombre:'Frijoles Refritos',               cat:'Guisos',    unidad:'Kg',  stock:3,  min:1, notas:'Frijol + manteca + sal'},
  // ALMUERZOS PREPARADOS
  {id:20, nombre:'Chilaquiles Verdes Preparados',   cat:'Almuerzos', unidad:'Pz',  stock:10, min:3, notas:'Totopos + fresadilla verde'},
  {id:21, nombre:'Chilaquiles Rojos Preparados',    cat:'Almuerzos', unidad:'Pz',  stock:10, min:3, notas:'Totopos + salsa tomate guaje'},
  {id:22, nombre:'Huevos con Tocino',               cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:''},
  {id:23, nombre:'Huevos con Chorizo',              cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:''},
  {id:24, nombre:'Huevos Estrellados',              cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:''},
  {id:25, nombre:'Huevos Mexicana',                 cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:''},
  {id:26, nombre:'Huevos Revueltos',                cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:''},
  {id:27, nombre:'Huevos Machacado',                cat:'Almuerzos', unidad:'Pz',  stock:8,  min:3, notas:'Huevo + machacado'},
  // BEBIDAS PREPARADAS
  {id:28, nombre:'Limonada Natural',                cat:'Bebidas',   unidad:'Lt',  stock:5,  min:2, notas:'Limón, agua, azúcar'},
  {id:29, nombre:'Agua de Jamaica',                 cat:'Bebidas',   unidad:'Lt',  stock:5,  min:2, notas:'Jamaica, agua, azúcar'},
  {id:30, nombre:'Agua de Sabor',                   cat:'Bebidas',   unidad:'Lt',  stock:5,  min:2, notas:'Sabor del día'},
  {id:31, nombre:'Café Preparado',                  cat:'Bebidas',   unidad:'Lt',  stock:3,  min:1, notas:'Nescafé + leche + azúcar'},
  // PORCIONES LISTAS
  {id:32, nombre:'Por. Queso Durangueño',           cat:'Porciones', unidad:'Pz',  stock:20, min:5, notas:'~50g por porción'},
  {id:33, nombre:'Por. Pechuga de Pollo',           cat:'Porciones', unidad:'Pz',  stock:10, min:3, notas:'Porción cocida'},
  {id:34, nombre:'Por. Frijoles',                   cat:'Porciones', unidad:'Pz',  stock:20, min:5, notas:'~100g por porción'},
]
let kOrders = [];
let pendTPid = null, selTortilla = null, pendPkgIdx = null;
let agentHist = [];

const isTab = () => window.innerWidth >= 680;

/* ══ RELOJ ══ */
const tick = () => { document.getElementById('clk').textContent = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}); };
setInterval(tick, 1000); tick();

/* ══ LOGIN ══ */
function initLogin() {
  const ul = document.getElementById('userList');
  const roleColors = {admin:'#6B31D6', dueno:'#E85500', cajero:'#FF7A1A', cocina:'#008040'};
  const roleLabels = {admin:'⚙️ Admin', dueno:'👑 Dueño', cajero:'💳 Cajero', cocinero:'👨‍🍳 Cocinero', mesero:'🛎 Mesero', cocina:'📺 Cocina KDS'};
  ul.innerHTML = staff.filter(s=>s.status==='activo').map(s=>`
    <button class="user-btn" onclick="selectUser(${s.id})">
      <div class="user-av" style="background:${roleColors[s.role]||'#E85500'}">${s.name.charAt(0).toUpperCase()}</div>
      <div class="user-info">
        <div class="user-name">${s.name}</div>
        <div class="user-role-tag tag-${s.role}">${roleLabels[s.role]||s.role}</div>
      </div>
    </button>`).join('');
}

function selectUser(id) {
  selectedLoginUser = staff.find(s=>s.id===id);
  if (!selectedLoginUser) return;
  document.getElementById('pinWho').textContent = 'Hola, '+selectedLoginUser.name.split(' ')[0]+'! Ingresa tu PIN:';
  document.getElementById('pinInput').value = '';
  document.getElementById('pinError').textContent = '';
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep2').style.display = 'block';
  setTimeout(()=>document.getElementById('pinInput').focus(), 100);
}

function backToUsers() {
  document.getElementById('loginStep1').style.display = 'block';
  ['loginStep2','loginStep3','loginStep4','loginStep5'].forEach(id=>{
    document.getElementById(id).style.display = 'none';
  });
  selectedLoginUser = null;
  initLogin(); // refresh user list in case staff changed
}

function doLogin() {
  const pin = document.getElementById('pinInput').value.trim();
  if (!selectedLoginUser) return;
  if (pin === selectedLoginUser.pass) {
    currentUser = selectedLoginUser;
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('userPill').style.display = 'flex';
    document.getElementById('userPillName').textContent = currentUser.name.split(' ')[0];
    // Fill config session card
    const roleLabels = {admin:'⚙️ Admin', dueno:'👑 Dueño', cajero:'💳 Cajero', cocinero:'👨‍🍳 Cocinero', mesero:'🛎 Mesero', cocina:'📺 Cocina KDS'};
    const roleColors = {admin:'#6B31D6', dueno:'#E85500', cajero:'#FF7A1A', cocinero:'#B05000', mesero:'#0066BB', cocina:'#008040'};
    const av = document.getElementById('cfg-user-av');
    const nm = document.getElementById('cfg-user-name');
    const rl = document.getElementById('cfg-user-role');
    if (av) { av.textContent = currentUser.name.charAt(0).toUpperCase(); av.style.background = roleColors[currentUser.role] || '#E85500'; }
    if (nm) nm.textContent = currentUser.name;
    if (rl) { rl.textContent = roleLabels[currentUser.role] || currentUser.role; rl.style.color = roleColors[currentUser.role] || '#E87000'; }
    applyRoleUI();
  } else {
    document.getElementById('pinError').textContent = '❌ PIN incorrecto, intenta de nuevo';
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
  }
}

function showLogin() {
  initLogin();
  document.getElementById('loginStep1').style.display = 'block';
  document.getElementById('loginStep2').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
}

function applyRoleUI() {
  const isOwner = currentUser && (currentUser.role === 'admin' || currentUser.role === 'dueno');
  document.querySelectorAll('.owner-only').forEach(el=>{
    el.classList.toggle('vis', isOwner);
  });
  const locked = document.getElementById('kpi-locked');
  if (locked) locked.style.display = isOwner ? 'none' : 'block';
}

/* ══ NAVEGACIÓN ══ */