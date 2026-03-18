/* -- Datos y Catálogo -- */

let products = [
  {id:1,  name:'Barbacoa',           emoji:'🥩', cat:'Tacos',    price:20,cost:8, stock:50,min:10},
  {id:2,  name:'Carne Asada',        emoji:'🥩', cat:'Tacos',    price:20,cost:8, stock:50,min:10},
  {id:3,  name:'Chicharrón Verde',   emoji:'🫙', cat:'Tacos',    price:20,cost:7, stock:50,min:10},
  {id:4,  name:'Chicharrón Rojo',    emoji:'🫙', cat:'Tacos',    price:20,cost:7, stock:50,min:10},
  {id:5,  name:'Deshebrada',         emoji:'🥩', cat:'Tacos',    price:20,cost:7, stock:40,min:8},
  {id:6,  name:'Picadillo',          emoji:'🥩', cat:'Tacos',    price:20,cost:6, stock:40,min:8},
  {id:7,  name:'Huevo con Chorizo',  emoji:'🥚', cat:'Tacos',    price:20,cost:6, stock:30,min:8},
  {id:8,  name:'Huevo con Papa',     emoji:'🥚', cat:'Tacos',    price:20,cost:6, stock:30,min:8},
  {id:9,  name:'Huevo en Salsa',     emoji:'🥚', cat:'Tacos',    price:20,cost:6, stock:30,min:8},
  {id:10, name:'Chile de Queso',     emoji:'🌶', cat:'Tacos',    price:20,cost:6, stock:20,min:5},
  {id:11, name:'Chile de Carne',     emoji:'🌶', cat:'Tacos',    price:20,cost:7, stock:20,min:5},
  {id:12, name:'Papas con Chorizo',  emoji:'🥔', cat:'Tacos',    price:20,cost:6, stock:20,min:5},
  {id:13, name:'Queso en Rajas',     emoji:'🧀', cat:'Tacos',    price:20,cost:6, stock:20,min:5},
  {id:14, name:'Frijoles',           emoji:'🫘', cat:'Tacos',    price:18,cost:4, stock:30,min:8},
  {id:15, name:'Quesadilla',         emoji:'🫓', cat:'Tacos',    price:45,cost:15,stock:25,min:8},
  {id:16, name:'Pepsi Regular',      emoji:'🥤', cat:'Bebidas', price:25,cost:10,stock:48,min:12},
  {id:17, name:'Pepsi Light',        emoji:'🥤', cat:'Bebidas', price:25,cost:10,stock:30,min:8},
  {id:18, name:'7up',                emoji:'🥤', cat:'Bebidas', price:25,cost:10,stock:24,min:8},
  {id:19, name:'Manzanita',          emoji:'🍎', cat:'Bebidas', price:25,cost:10,stock:20,min:6},
  {id:20, name:'Durazno',            emoji:'🍑', cat:'Bebidas', price:25,cost:10,stock:20,min:6},
  {id:21, name:'Agua Sabor',         emoji:'💧', cat:'Bebidas', price:20,cost:5, stock:30,min:8},
  {id:22, name:'Agua Natural',       emoji:'💧', cat:'Bebidas', price:15,cost:3, stock:36,min:10},
  {id:23, name:'Café',               emoji:'☕', cat:'Bebidas', price:25,cost:8, stock:20,min:5},
  {id:24, name:'Lipton',             emoji:'🍵', cat:'Bebidas', price:25,cost:8, stock:20,min:5},
  {id:25, name:'Ponche',             emoji:'🍹', cat:'Bebidas', price:25,cost:8, stock:15,min:5},
  {id:26, name:'Chilaquiles Verdes P',emoji:'🟢',cat:'Almuerzos',price:85,cost:28,stock:15,min:4},
  {id:27, name:'Chilaquiles Rojos P', emoji:'🔴',cat:'Almuerzos',price:85,cost:28,stock:15,min:4},
  {id:28, name:'Chilaquiles Verdes H',emoji:'🟢',cat:'Almuerzos',price:85,cost:28,stock:15,min:4},
  {id:29, name:'Chilaquiles Rojos H', emoji:'🔴',cat:'Almuerzos',price:85,cost:28,stock:15,min:4},
  {id:30, name:'Huevos con Tocino',   emoji:'🥓',cat:'Almuerzos',price:85,cost:28,stock:12,min:4},
  {id:31, name:'Huevos con Chorizo',  emoji:'🥓',cat:'Almuerzos',price:85,cost:28,stock:12,min:4},
  {id:32, name:'Huevos Estrellados',  emoji:'🍽',cat:'Almuerzos',price:85,cost:25,stock:12,min:4},
  {id:33, name:'Huevos Mexicana',     emoji:'🍽',cat:'Almuerzos',price:85,cost:25,stock:12,min:4},
  {id:34, name:'Huevos Revueltos',    emoji:'🍽',cat:'Almuerzos',price:85,cost:25,stock:12,min:4},
  {id:35, name:'Huevos Machacado',    emoji:'🍽',cat:'Almuerzos',price:85,cost:25,stock:12,min:4},
  {id:36, name:'Tortillas de Maíz',   emoji:'🫓',cat:'Misceláneos',price:0,cost:2,stock:200,min:50},
  {id:37, name:'Tortillas de Harina', emoji:'🫓',cat:'Misceláneos',price:0,cost:3,stock:200,min:50},
  {id:38, name:'Salsa Verde',         emoji:'🫙',cat:'Misceláneos',price:0,cost:5,stock:20,min:5},
  {id:39, name:'Salsa Roja',          emoji:'🫙',cat:'Misceláneos',price:0,cost:5,stock:20,min:5},
  {id:40, name:'Vasos Desechables',   emoji:'🥤',cat:'Desechables',price:0,cost:1,stock:200,min:50},
  {id:41, name:'Platos Desechables',  emoji:'🍽',cat:'Desechables',price:0,cost:2,stock:150,min:40},
  {id:42, name:'Servilletas',         emoji:'🧻',cat:'Desechables',price:0,cost:1,stock:300,min:100},
  {id:43, name:'Bolsas de Papel',     emoji:'🛍',cat:'Desechables',price:0,cost:2,stock:100,min:30},
  {id:44, name:'Jabón de Manos',      emoji:'🧼',cat:'Limpieza',  price:0,cost:30,stock:5,min:2},
  {id:45, name:'Cloro',               emoji:'🧴',cat:'Limpieza',  price:0,cost:25,stock:4,min:2},
  {id:46, name:'Escoba',              emoji:'🧹',cat:'Limpieza',  price:0,cost:80,stock:2,min:1},
];

/* ══ PERSONAL ══ */


/* -- POS - Menu -- */

function renderCats() {
  const cats = ['Todos', ...new Set(products.filter(p=>['Tacos','Bebidas','Almuerzos'].includes(p.cat)).map(p=>p.cat))];
  document.getElementById('catbar').innerHTML = cats.map(c=>
    `<button class="cpill ${c===aCat?'on':''}" onclick="aCat='${c}';renderCats();renderProds()">${c}</button>`
  ).join('');
}

/* ══ PRODUCTOS ══ */
function renderProds() {
  const q = document.getElementById('sinput').value.toLowerCase();
  const menuCats = ['Tacos','Bebidas','Almuerzos'];
  const f = products.filter(p=>menuCats.includes(p.cat)&&(aCat==='Todos'||p.cat===aCat)&&p.name.toLowerCase().includes(q));
  const cc = {Tacos:'cat-tacos', Bebidas:'cat-bebidas', Almuerzos:'cat-almuerzos'};
  document.getElementById('pgrid').innerHTML = f.map(p=>{
    const lo = p.stock <= p.min;
    const cls = cc[p.cat]||'';
    return `<div class="pcard ${cls}" onclick="addToCart(${p.id})">
      <div class="pcard-body">
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-cat ${cls}">${p.cat}</div>
      </div>
      <span class="pcard-stock ${lo?'lo':''}">${lo?'⚠ ':''}${p.stock}</span>
      <div class="pcard-price">$${p.price.toFixed(2)}</div>
    </div>`;
  }).join('') || `<div style="text-align:center;color:var(--c-tx3);padding:40px 0;font-size:14px;font-weight:700">Sin resultados</div>`;
}

/* ══ PLATOS ══ */