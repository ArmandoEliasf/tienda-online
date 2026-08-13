# 07 — Pruebas del sistema

> Fase 7. Pruebas manuales de extremo a extremo de la plataforma, corrección de bugs detectados
> y una carencia funcional detectada durante las pruebas: los vendedores no podían publicar productos.

## 1. Qué se hizo

Con la app completa (Fases 1–6), se probó la plataforma de forma manual simulando los tres perfiles
(administrador, vendedor, comprador). Las pruebas detectaron:

1. **Bug:** al avanzar el estado de un pedido con una observación escrita, el texto se descartaba y
   se guardaba siempre el mensaje automático.
2. **Bug:** el botón *Avanzar estado* en el panel de pedidos no hacía nada al hacer clic.
3. **Bug:** las imágenes subidas a Google Drive no se mostraban en el catálogo (navegador bloqueaba
   la carga directa por hotlink).
4. **Carencia funcional:** los vendedores no tenían ninguna pantalla para publicar productos; el
   formulario solo existía en `/admin`, exclusivo del rol `administrador`.

## 2. Bugs corregidos

### 2.1 Observación de pedido descartada

`frontend/src/components/admin/PedidosAdmin.jsx` — el método `avanzar()` usaba siempre el texto
`'Actualización automática del administrador'` e ignoraba la observación escrita en el detalle del pedido.

El backend siempre estuvo bien: `PATCH /api/pedidos/admin/:id/estado` persiste la observación en la
bitácora `historial_pedido`. El bug era del frontend.

```
Antes:  cambiarEstado(id, siguiente, 'Actualización automática del administrador')
Después: cambiarEstado(id, siguiente, observacion || 'Actualización automática del administrador')
```

La observación escrita se usa tal cual; solo si está vacía se usa el texto automático.

### 2.2 Botón *Avanzar estado* sin efecto

Causa raíz: un `ReferenceError`. El componente padre (`PedidosAdmin`) llamaba al callback del hijo
con `onAvanzar={() => avanzar(detalle)}` y `avanzar()` referenciaba a `observacion`, un estado interno
del hijo `DetallePedido`. Al hacer clic, `observacion` no existía en el ámbito del padre y el error se
tragaba silenciosamente — "no pasaba nada".

Corrección: el dato fluye del hijo al padre como argumento, nunca por referencia cruzada de estados.

```
Padre:  onAvanzar={(obs) => avanzar(detalle, obs)}      // recibe la observación como argumento
Hijo:   <button onClick={() => onAvanzar(observacion)}>  // la envía en el callback
```

### 2.3 Imágenes de Google Drive no visibles (proxy)

Las URLs de Drive (`https://drive.google.com/uc?export=view&id=...`) se mostraban bien en el
formulario pero el navegador **bloqueaba la carga** al renderizar el catálogo: cuando el navegador
envía `Sec-Fetch-Dest: image` a `drive.google.com`, Google responde con un HTML de rechazo (protección
anti-hotlink).

Solución: **proxy propio** en el backend que descarga la imagen por el lado del servidor y la sirve
desde el dominio de la app, donde las imágenes se cargan sin restricción:

- `GET /api/archivos/imagen/:id` → `googleDriveService.descargarArchivo(id)` descarga `?alt=media`
  con el token OAuth y responde con el `Content-Type` original y caché de 1 año
  (`Cache-Control: public, max-age=31536000, immutable`).
- `frontend/src/utils/imagen.js` → `normalizarUrlImagen()` reescribe las URLs de Drive a la del proxy
  (`/api/archivos/imagen/<google_drive_id>`).
- La normalización se aplica en `ProductImage.jsx` (catálogo, detalle, paneles) y en la vista previa
  del formulario.

Esto además oculta la URL real de Drive: el `google_drive_id` no es sensible, pero el proxy centraliza
el acceso y permite en el futuro invalidar/cachear imágenes en un solo lugar.

## 3. Carencia funcional: panel *Mis productos* del vendedor

### Problema

En el análisis (Fase 1) la publicación de productos era tarea del administrador, pero el backend ya
aceptaba vendedores en los endpoints de productos (`requireRole('vendedor', 'administrador')`). En la
práctica el vendedor no tenía cómo publicar: la única pantalla de CRUD estaba dentro de `/admin`,
bloqueada para `rol !== 'administrador'`, y el menú no mostraba ningún enlace.

### Solución: panel propio del vendedor (solo sus productos)

Nueva pantalla `/mis-productos` (`frontend/src/pages/MisProductos.jsx`) que reutiliza el CRUD de
productos con una prop `soloMios`. La regla es clara: **el vendedor ve y gestiona únicamente sus
productos; el administrador conserva el panel completo.**

#### Backend

- `GET /api/productos/mios` — lista los productos del vendedor logueado (`id_vendedor = req.user.id`),
  incluyendo inactivos (igual que el panel admin), para que pueda reactivarlos.
  Registrada **antes** de `GET /:id` en `productoRoutes.js` (si estuviera después, `:id` capturaría la
  palabra `mios`).
- `productoRepository.search({ idVendedor })` — filtra `p.id_vendedor = $n`.
- **Validación de propiedad** en `update()` y `setEstado()` de `productoService`: si el rol no es
  `administrador`, se verifica que el producto pertenezca al vendedor (`findById` → comparar
  `id_vendedor`). Un vendedor no puede editar ni desactivar productos ajenos aunque adivine el id.
  Respuesta: `403 "Solo puedes editar tus propios productos"`.
- `GET /api/productos/admin/categorias` ampliado a `requireRole('vendedor', 'administrador')` — el
  formulario de producto necesita el desplegable de categorías.

#### Frontend

- `ProductosAdmin.jsx` acepta la prop `soloMios`; cuando está activa carga con
  `adminService.listMisProductos(token)` en vez de `listProductosAdmin`.
- `services/admin.js`: nuevo `listMisProductos`.
- `Navbar.jsx`: enlace **Mis productos** visible solo para el rol `vendedor`.
- `App.jsx`: ruta `/mis-productos`.
- `MisProductos.jsx`: pantalla con guardas (requiere sesión; solo `vendedor`/`administrador`).

El administrador sigue usando `/admin` con el CRUD completo; el vendedor usa `/mis-productos` y solo
ve su catálogo.

## 4. Otras mejoras detectadas en pruebas

- **Activar/desactivar usuarios** (`UsuariosAdmin.jsx`): el panel de usuarios ahora permite alternar el
  estado entre `activo` e `inactivo` con `PATCH /api/usuarios/:id/estado` (solo administrador). Un
  usuario `inactivo` no puede iniciar sesión (403 en login). **Auto-protección:** el admin no puede
  desactivar su propia cuenta (`400 "No puedes desactivar tu propia cuenta"`); en su fila aparece "Eres tú".

## 5. Verificación

Pruebas manuales ejecutadas con éxito:

1. **Vendedor publica:** login `vendedor1@tienditajoyas.mx` → menú *Mis productos* → crear producto
   (con imagen subida a Drive) → aparece solo en su lista y en el catálogo público.
2. **Vendedor solo ve lo suyo:** `GET /api/productos/mios` devuelve solo los 7 productos de `vendedor1`,
   no los de `vendedor2`.
3. **Aislamiento:** intento de `PUT /api/productos/:id` con id de un producto de otro vendedor → `403
   "Solo puedes editar tus propios productos"`.
4. **Observación:** avanzar un pedido escribiendo "Cliente confirmó por teléfono" → la bitácora
   `historial_pedido` guarda ese texto.
5. **Imágenes:** subir imagen → el catálogo, el detalle y el panel la muestran vía
   `/api/archivos/imagen/:id`.
6. **Desactivar usuario:** admin desactiva a un vendedor → ese vendedor recibe 403 al iniciar sesión;
   el admin no puede desactivarse a sí mismo.

## 6. Comandos útiles para probar la API

```bash
# Login como vendedor y listar solo sus productos
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"vendedor1@tienditajoyas.mx","password":"Clave123!"}'
curl http://localhost:4000/api/productos/mios -H "Authorization: Bearer <token>"

# Intentar editar un producto ajeno (debe responder 403)
curl -X PUT http://localhost:4000/api/productos/12 -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"nombre":"Hack"}'
```

Usuarios de prueba (todos con contraseña `Clave123!`):

| Email | Rol |
|---|---|
| `admin@tienditajoyas.mx` | administrador |
| `vendedor1@tienditajoyas.mx` / `vendedor2@tienditajoyas.mx` | vendedor |
| `comprador1@tienditajoyas.mx` / `comprador2@tienditajoyas.mx` | comprador |

## 7. Cómo ejecutar

```bash
# Backend (PostgreSQL levantado) → :4000
cd backend && npm run dev

# Frontend → :5173
cd frontend && npm run dev
```
