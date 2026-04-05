# 🌮 Tacos Totous POS - Guía GitHub Pages

## URL de la Aplicación
**https://carmonagrill-lgtm.github.io/sistemapostacostotous**

## Cómo usar la app:

### 1. **Acceso**
- Abre directamente en tu navegador (Chrome, Edge, Firefox, Safari).
- No necesitas servidor local ni instalación.

### 2. **Login**
Usa cualquiera de estos usuarios (todos con PIN `1111`):
- **Carlos Mendoza** - Admin
- **Alex** - Dueño (Alex)
- **Beto** - Dueño (Beto)
- **Ana Ruiz** - Cajero
- **Pedro López** - Cocina

### 3. **Funcionalidades principales**
- **Menú**: Selecciona tacos, bebidas y almuerzos
- **Carrito**: Gestiona pedidos, aplica descuentos y IVA
- **Cobrar**: Procesa pagos en efectivo, tarjeta o transferencia
- **Inventario**: Gestiona productos e ingredientes
- **Recetas**: Crea y modifica recetas
- **Dashboard**: Ve estadísticas de ventas
- **Cocina**: Vista de órdenes para la cocina (KDS)
- **Personal**: Gestiona empleados

### 4. **Datos en Tiempo Real**
Todos los datos se guardan automáticamente en **Firebase Firestore**:
- Productos y stock
- Ingredientes
- Transacciones/ventas
- Recetas
- Órdenes de cocina

### 5. **Validaciones incluidas**
✅ Verifica stock de productos antes de agregar al carrito
✅ Verifica disponibilidad de ingredientes según recetas
✅ Deduce stock automáticamente al cobrar
✅ Muestra alertas si no hay suficiente inventario

## Características técnicas

- **Almacenamiento**: Firebase Firestore (base de datos en la nube)
- **Autenticación**: PIN local (puedes agregar Google Auth si lo necesitas)
- **Disponibilidad**: 24/7 desde cualquier dispositivo
- **Sin instalación**: Todo en el navegador
- **Offline**: Funciona con datos locales si no hay conexión

## Problemas comunes

### "Error conectando a Firebase"
1. Abre DevTools (F12 > Console)
2. Verifica que Firebase esté habilitado en tu proyecto
3. Comprueba que las reglas de Firestore permitan lectura/escritura (de momento en modo desarrollo)

### "No hay datos"
- La primera vez subirá los datos iniciales a Firebase automáticamente
- Si no ves datos después, recarga la página (F5)

### "La app se ve pequeña o grande"
- Es compatible con móviles, tablets y escritorio
- Redimensiona la ventana del navegador si es necesario

## Para administradores:

### Agregar nuevos usuarios
1. Ve a **Configuración > Personal**
2. Toca **+ Nuevo Empleado**
3. Completa nombre, usuario, PIN y rol

### Ver histórico de ventas
1. Ve a **Dashboard** para ver gráficos
2. Ve a **Inventario > Compras** para compras registradas

### Sincronizar con Google Sheets (opcional)
1. Crea una Web App en Google Apps Script
2. En **Configuración**, pega la URL en "Sincronizar con Sheets"

## Soporte

Si tienes problemas:
1. Abre la consola del navegador (F12)
2. Busca mensajes de error en rojo
3. Cópialos para reportar el problema

---

**¡Tu sistema POS está listo para usar!** 🎉
