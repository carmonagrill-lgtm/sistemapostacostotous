# Tacos Totous — Sistema POS

## Estructura de archivos

```
/
├── index.html        — HTML principal (estructura + estilos)
├── productos.js      — Catálogo de productos, ingredientes y menú
├── usuarios.js       — Login, roles, clave maestra, personal
├── ventas.js         — Carrito, cobro, recibos, tipo de servicio
├── inventario.js     — Stock, compras, proveedores, producciones
├── recetas.js        — Recetas, subrecetas y cálculo de costos
├── dashboard.js      — Panel de estadísticas y agente IA
├── cocina.js         — Pantalla KDS de cocina
├── personal.js       — Gestión de staff y empleados/nómina
├── config.js         — Configuración y Google Sheets
├── app.js            — Inicialización, navegación y utilidades
└── servidor.py       — Servidor local para ejecutar la app
```

## Cómo ejecutar

### Opción A — Con Python (recomendado)
1. Abre una terminal en esta carpeta
2. Ejecuta: `python3 servidor.py`
3. Se abre automáticamente en tu navegador en http://localhost:8080

### Opción B — Con Node.js
1. Instala: `npm install -g serve`
2. Ejecuta: `serve .`
3. Abre: http://localhost:3000

### ⚠️ Importante
Los archivos JS separados NO funcionan abriéndolos directamente
con doble clic. Necesitas el servidor local (servidor.py).

## Accesos del sistema
- PIN de todos los usuarios: 1111
- Dueños con acceso total: Alex, Beto
- Clave maestra para gestionar personal: 3453

## Para editar con IA
Dile a la IA qué archivo contiene lo que quieres cambiar:
- Cambiar precios → productos.js
- Modificar el carrito → ventas.js  
- Agregar ingredientes → inventario.js
- Editar recetas → recetas.js
- Cambiar roles → usuarios.js
- Modificar estadísticas → dashboard.js
