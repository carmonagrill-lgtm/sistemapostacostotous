/* -- Datos y Catálogo --
   tipo: 'platillo' = tiene receta, descuenta ingredientes al vender
   tipo: 'reventa'  = solo descuenta su propio stock
   recetaNombre: nombre exacto en recetas[] (solo para platillos)
*/
let menuCategorias = [
  {id:1, nombre:'Tacos',               color:'#E85500', emoji:'🌮'},
  {id:2, nombre:'Almuerzos',           color:'#F0A000', emoji:'🍽'},
  {id:3, nombre:'Bebidas Embotelladas',color:'#0066BB', emoji:'🥤'},
  {id:4, nombre:'Bebidas Preparadas',  color:'#008040', emoji:'☕'},
  {id:5, nombre:'Otros',               color:'#6B31D6', emoji:'🛍'},
];

let products = [
  // TACOS — platillos con receta (descuenta producción + ingredientes)
  {id:1,  name:'Barbacoa',            emoji:'🥩', cat:'Tacos',  tipo:'platillo', recetaNombre:'Barbacoa',           price:20, cost:8,  stock:50, min:10},
  {id:2,  name:'Carne Asada',         emoji:'🥩', cat:'Tacos',  tipo:'platillo', recetaNombre:'Carne Asada',        price:20, cost:8,  stock:50, min:10},
  {id:3,  name:'Chicharrón Verde',    emoji:'🫙', cat:'Tacos',  tipo:'platillo', recetaNombre:'Chicharrón Verde',   price:20, cost:7,  stock:50, min:10},
  {id:4,  name:'Chicharrón Rojo',     emoji:'🫙', cat:'Tacos',  tipo:'platillo', recetaNombre:'Chicharrón Rojo',    price:20, cost:7,  stock:50, min:10},
  {id:5,  name:'Deshebrada',          emoji:'🥩', cat:'Tacos',  tipo:'platillo', recetaNombre:'Deshebrada',         price:20, cost:7,  stock:40, min:8},
  {id:6,  name:'Picadillo',           emoji:'🥩', cat:'Tacos',  tipo:'platillo', recetaNombre:'Picadillo',          price:20, cost:6,  stock:40, min:8},
  {id:7,  name:'Huevo con Chorizo',   emoji:'🥚', cat:'Tacos',  tipo:'platillo', recetaNombre:'Huevo con Chorizo',  price:20, cost:6,  stock:30, min:8},
  {id:8,  name:'Huevo con Papa',      emoji:'🥚', cat:'Tacos',  tipo:'platillo', recetaNombre:'Huevo con Papa',     price:20, cost:6,  stock:30, min:8},
  {id:9,  name:'Huevo en Salsa',      emoji:'🥚', cat:'Tacos',  tipo:'platillo', recetaNombre:'Huevo en Salsa',     price:20, cost:6,  stock:30, min:8},
  {id:10, name:'Chile de Queso',      emoji:'🌶', cat:'Tacos',  tipo:'platillo', recetaNombre:'Chile de Queso',     price:20, cost:6,  stock:20, min:5},
  {id:11, name:'Chile de Carne',      emoji:'🌶', cat:'Tacos',  tipo:'platillo', recetaNombre:'Chile de Carne',     price:20, cost:7,  stock:20, min:5},
  {id:12, name:'Papas con Chorizo',   emoji:'🥔', cat:'Tacos',  tipo:'platillo', recetaNombre:'Papas con Chorizo',  price:20, cost:6,  stock:20, min:5},
  {id:13, name:'Queso en Rajas',      emoji:'🧀', cat:'Tacos',  tipo:'platillo', recetaNombre:'Queso en Rajas',     price:20, cost:6,  stock:20, min:5},
  {id:14, name:'Frijoles',            emoji:'🫘', cat:'Tacos',  tipo:'platillo', recetaNombre:'Frijoles Refritos',  price:18, cost:4,  stock:30, min:8},
  {id:15, name:'Quesadilla',          emoji:'🫓', cat:'Tacos',  tipo:'platillo', recetaNombre:null,                 price:45, cost:15, stock:25, min:8},
  // ALMUERZOS — platillos con receta
  {id:26, name:'Chilaquiles Verdes P',emoji:'🟢', cat:'Almuerzos', tipo:'platillo', recetaNombre:'Chilaquiles Verdes', price:85,cost:28,stock:15,min:4},
  {id:27, name:'Chilaquiles Rojos P', emoji:'🔴', cat:'Almuerzos', tipo:'platillo', recetaNombre:'Chilaquiles Rojos',  price:85,cost:28,stock:15,min:4},
  {id:28, name:'Chilaquiles Verdes H',emoji:'🟢', cat:'Almuerzos', tipo:'platillo', recetaNombre:'Chilaquiles Verdes', price:85,cost:28,stock:15,min:4},
  {id:29, name:'Chilaquiles Rojos H', emoji:'🔴', cat:'Almuerzos', tipo:'platillo', recetaNombre:'Chilaquiles Rojos',  price:85,cost:28,stock:15,min:4},
  {id:30, name:'Huevos con Tocino',   emoji:'🥓', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:28,stock:12,min:4},
  {id:31, name:'Huevos con Chorizo',  emoji:'🥓', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:28,stock:12,min:4},
  {id:32, name:'Huevos Estrellados',  emoji:'🍽', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:25,stock:12,min:4},
  {id:33, name:'Huevos Mexicana',     emoji:'🍽', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:25,stock:12,min:4},
  {id:34, name:'Huevos Revueltos',    emoji:'🍽', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:25,stock:12,min:4},
  {id:35, name:'Huevos Machacado',    emoji:'🍽', cat:'Almuerzos', tipo:'platillo', recetaNombre:null,                 price:85,cost:25,stock:12,min:4},
  // BEBIDAS EMBOTELLADAS — reventa pura
  {id:16, name:'Pepsi Regular',  emoji:'🥤', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:10,stock:48,min:12},
  {id:17, name:'Pepsi Light',    emoji:'🥤', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:10,stock:30,min:8},
  {id:18, name:'7up',            emoji:'🥤', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:10,stock:24,min:8},
  {id:19, name:'Manzanita',      emoji:'🍎', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:10,stock:20,min:6},
  {id:20, name:'Durazno',        emoji:'🍑', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:10,stock:20,min:6},
  {id:21, name:'Agua Sabor',     emoji:'💧', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:20,cost:5, stock:30,min:8},
  {id:22, name:'Agua Natural',   emoji:'💧', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:15,cost:3, stock:36,min:10},
  {id:24, name:'Lipton',         emoji:'🍵', cat:'Bebidas Embotelladas', tipo:'reventa', recetaNombre:null, price:25,cost:8, stock:20,min:5},
  // BEBIDAS PREPARADAS — platillos con receta de producción
  {id:23, name:'Café',           emoji:'☕', cat:'Bebidas Preparadas', tipo:'platillo', recetaNombre:'Café Preparado',  price:25,cost:8, stock:20,min:5},
  {id:25, name:'Limonada',       emoji:'🍋', cat:'Bebidas Preparadas', tipo:'platillo', recetaNombre:'Limonada Natural',price:25,cost:5, stock:15,min:5},
  {id:50, name:'Jamaica',        emoji:'🌺', cat:'Bebidas Preparadas', tipo:'platillo', recetaNombre:'Agua de Jamaica', price:20,cost:4, stock:15,min:5},
  {id:51, name:'Ponche',         emoji:'🍹', cat:'Bebidas Preparadas', tipo:'platillo', recetaNombre:null,              price:25,cost:8, stock:15,min:5},
  // OTROS
  {id:52, name:'Tortilla extra', emoji:'🫓', cat:'Otros', tipo:'reventa', recetaNombre:null, price:3, cost:1, stock:200,min:50},
];

/* ══ PERSONAL ══ */


/* -- POS - Menu -- */

function renderCats() {
  const catNames = ['Todos', ...menuCategorias.map(c=>c.nombre)];
  document.getElementById('catbar').innerHTML = catNames.map(c=>
    `<button class="cpill ${c===aCat?'on':''}" onclick="aCat='${c}';renderCats();renderProds()">${c}</button>`
  ).join('');
}

/* ══ PRODUCTOS ══ */
function renderProds() {
  const q = document.getElementById('sinput').value.toLowerCase();
  const allMenuCats = menuCategorias.map(c=>c.nombre);
  const f = products.filter(p=>
    allMenuCats.includes(p.cat) &&
    (aCat==='Todos' || p.cat===aCat) &&
    p.name.toLowerCase().includes(q)
  );
  document.getElementById('pgrid').innerHTML = f.map(p=>{
    const lo = p.stock <= p.min;
    const catDef = menuCategorias.find(c=>c.nombre===p.cat);
    const color = catDef?.color || '#E85500';
    const hasRec = p.tipo==='platillo' && p.recetaNombre;
    const rec = hasRec ? recetas.find(r=>r.nombre===p.recetaNombre) : null;
    // Stock warning: check ingredients if has recipe
    const stockWarn = lo ? '⚠ Stock bajo' : '';
    return `<div class="pcard" style="border-left:4px solid ${color};" onclick="addToCart(${p.id})">
      <div class="pcard-body">
        <div class="pcard-name">${p.name}</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-top:2px;color:${color};">${p.cat}</div>
        ${rec ? `<div style="font-size:9px;color:var(--c-pu);font-weight:700;margin-top:2px;">📋 ${rec.nombre}</div>` : ''}
      </div>
      ${stockWarn ? `<span class="pcard-stock lo">⚠ ${p.stock}</span>` : `<span class="pcard-stock">${p.stock}</span>`}
      <div class="pcard-price">$${p.price.toFixed(2)}</div>
    </div>`;
  }).join('') || `<div style="text-align:center;color:var(--c-tx3);padding:40px 0;font-size:14px;font-weight:700">Sin resultados</div>`;
}

/* ══ PLATOS ══ */