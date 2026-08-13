# 05 — API REST y frontend conectado

> Fase 5. Reemplaza la capa de datos mock del frontend por endpoints reales del backend.
> Backend en `backend/`, frontend en `frontend/`.

## 1. Qué se construyó

En la Fase 4 el frontend funcionaba sobre datos simulados (`productosMock.js`). En esta fase se construyó la API REST completa y el frontend pasó a consumirla:

- **Backend por capas**: `rutas → controladores → servicios → repositorios` + middleware de autenticación, validación y errores.
- **Servicios reales en el frontend**: `services/{productos,categorias,auth,carrito,direcciones,pedidos,admin}.js` con `fetch` vía un wrapper (`services/api.js`) que inyecta el token JWT.
- **Flujo de compra completo**: carrito persistido en BD → dirección de envío → pedido con descuento de stock atómico → seguimiento de estados.
- **Panel de administración**: pedidos (cambio de estado con bitácora), productos, categorías y usuarios.

## 2. Arquitectura del backend

```
Request
  → routes/*.js          (define método + ruta + middlewares de validación/auth)
  → controllers/*.js     (extrae req, delega al servicio, responde JSON)
  → services/*.js        (reglas de negocio + ApiError con status HTTP)
  → repositories/*.js    (SQL parametrizado con pg)
  → PostgreSQL
```

Errores unificados: `ApiError(status, mensaje, detalles)`; el `errorHandler` devuelve
`{ message, details? }` y nunca filtra datos internos (status ≥ 500 se oculta).

### Middlewares propios

| Middleware | Función |
|---|---|
| `auth.js` `requireAuth` | Valida el `Bearer` JWT y deja `req.user = { id, rol, email }`. |
| `auth.js` `requireRole(...roles)` | Restringe a ciertos roles (p. ej. solo `administrador`). |
| `validate.js` `validar({campo: [reglas]})` | Valida `req.body` por campo y responde 400 con `details`. |
| `errorHandler.js` | `notFound` + `errorHandler` para respuestas JSON consistentes. |

Reglas de validación disponibles: `requerido`, `email`, `telefonoMx` (10 dígitos),
`codigoPostal` (5 dígitos), `minimo` (numérico), `minLongitud` (strings), `en` (lista blanca).

### Endpoints

| Módulo | Método y ruta | Acceso | Descripción |
|---|---|---|---|
| Auth | `POST /api/auth/registro` | Público | Crea comprador y devuelve sesión (login implícito). |
| Auth | `POST /api/auth/login` | Público | Devuelve `{ token, usuario }`. |
| Auth | `GET /api/auth/me` | Autenticado | Revalida la sesión. |
| Productos | `GET /api/productos` | Público | Catálogo con filtros `q, categoria, precioMin, precioMax, disponible`. |
| Productos | `GET /api/productos/destacados` | Público | 8 productos al azar. |
| Productos | `GET /api/productos/:id` | Público | Detalle + lista de imágenes. |
| Productos | `POST /api/productos` | vendedor/admin | Crea producto (con imagen principal opcional). |
| Productos | `PUT /api/productos/:id` | vendedor/admin | Edita producto. |
| Productos | `PATCH /api/productos/:id/estado` | vendedor/admin | Baja/alta lógica. |
| Productos | `GET /api/productos/admin/categorias` | admin | Categorías (incluidas inactivas). |
| Categorías | `GET /api/categorias` | Público | Categorías activas. |
| Categorías | `POST / PUT / PATCH :estado` | admin | CRUD de categorías. |
| Carrito | `GET/POST/PATCH/DELETE /api/carrito*` | Autenticado | Ver, agregar, actualizar, eliminar, vaciar. |
| Direcciones | `GET/POST/DELETE /api/direcciones*` | Autenticado | Direcciones del usuario. |
| Direcciones | `GET /api/direcciones/codigo-postal/:cp` | Autenticado | Consulta el CP en la API de **Postalia** y devuelve estado, municipio y colonias. |
| Pedidos | `POST /api/pedidos` | Autenticado | Convierte el carrito en pedido (descuenta stock). |
| Pedidos | `GET /api/pedidos/mios` y `/api/pedidos/:id` | Autenticado | Pedidos del propio usuario. |
| Pedidos | `GET /api/pedidos/admin*` | admin | Listar (con filtro por estado) y ver detalle. |
| Pedidos | `PATCH /api/pedidos/admin/:id/estado` | admin | Cambia estado y registra en `historial_pedido`. |
| Usuarios | `GET /api/usuarios` | admin | Lista usuarios (sin hashes de contraseña). |
| Sistema | `GET /api/health` | Público | Estado de la API y la conexión a BD. |

## 3. Reglas de negocio implementadas

### Número de pedido legible

Secuencia `seq_numero_pedido` + formato `TLJ-YYYY-######`:

```sql
SELECT 'TLJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('seq_numero_pedido')::text, 6, '0')
```

El seed sincroniza la secuencia con `setval` para no colisionar con los pedidos de prueba.

### Creación de pedido atómica (transacción + lock)

1. `BEGIN`.
2. `SELECT ... FOR UPDATE` sobre los productos del carrito (bloquea filas y evita sobreventa).
3. Validaciones: producto activo, stock suficiente, **no incluir productos propios**.
4. Insertar `pedidos` + `detalle_pedido` (subtotal es columna `GENERATED`).
5. Descontar stock (`existencia = existencia - cantidad`).
6. Marcar el carrito como `convertido`.
7. `COMMIT` (o `ROLLBACK` en cualquier error).

### Autocompletado de dirección por código postal (Postalia)

En el formulario de dirección, al salir del campo C.P. (5 dígitos) se consulta
`GET /direcciones/codigo-postal/:cp`, que **hace de proxy** hacia
`https://postalia.com.mx/api/codigos-postales/:cp` con el token guardado en
`POSTALIA_TOKEN` (`.env`, nunca en el frontend ni en git). El backend:

- valida que el CP tenga 5 dígitos (400);
- devuelve `{ codigo_postal, estado, municipio, ciudad, zona, colonias[] }` (200);
- devuelve 404 con mensaje si no hay resultados;
- usa `AbortSignal.timeout(5000)` para no colgar el pedido si Postalia no responde.

El frontend autocompleta municipio, estado (validado contra `ESTADOS_MEXICO`) y
colonia. Si el CP tiene varias colonias, muestra un `<select>` para elegir. Si la
API falla, el usuario puede capturar la dirección manualmente (sigue valiendo la
validación local de 5 dígitos al guardar).

### Un vendedor no puede comprar sus propios productos

Se valida en **dos puntos**:

- `carritoService.addProducto`: rechaza con `400 "No puedes comprar tus propios productos"`.
- `pedidoRepository.createFromCarrito` (dentro de la transacción): si un ítem del carrito es del propio usuario, se rechaza y se hace rollback. Esto protege también carritos creados antes de la regla.

### Bitácora de estados

- Al **insertar** un pedido, el trigger `trg_historial_pedido_insercion` registra el estado inicial.
- Al **cambiar** el estado (admin), se lee el estado anterior con `FOR UPDATE` **antes** del `UPDATE` y se inserta la fila en `historial_pedido` con usuario y observación.

Estados válidos: `pendiente → confirmado → preparando → enviado → entregado`, más `cancelado`.

### Autenticación y sesión

- `bcryptjs` hashea contraseñas (nunca se almacenan en texto plano).
- `jsonwebtoken` emite un token de 8 h con `{ id, rol, email }`.
- El frontend guarda la sesión en `localStorage` (`tlj_sesion`) y la **revalida con `GET /auth/me`** al montar la app; si el token expiró, la limpia.

## 4. Frontend: cambios sobre la Fase 4

| Antes (mock) | Ahora (API) |
|---|---|
| `data/productosMock.js` | `services/productos.js` → `GET /api/productos*` |
| `services/auth.js` con usuarios en localStorage | `services/auth.js` → `POST /auth/*` + JWT |
| Carrito solo en `localStorage` | Carrito en BD cuando hay sesión; localStorage con `{ uid, items }` si es anónimo |
| Sin checkout | `Checkout.jsx`: dirección (32 estados MX) + confirmación |
| Sin historial | `MisPedidos.jsx` + `PedidoDetalle.jsx` con línea de tiempo |
| Sin panel admin | `Admin.jsx` con pestañas Pedidos/Productos/Categorías/Usuarios |

### Carrito dual (modo backend / modo local)

`CartContext` decide según la sesión:

- **Con sesión**: cada operación (agregar, actualizar, eliminar, vaciar) llama a la API y actualiza el estado con la respuesta del servidor.
- **Sin sesión**: funciona offline en `localStorage`, guardando `{ uid: null, items }`.
- **Al iniciar sesión**: el carrito local se sube al backend **solo si el `uid` coincide** con el del usuario (evita que un usuario herede el carrito de otro) y luego se carga el carrito real de la BD.
- Los errores de la API (p. ej. stock insuficiente o "no puedes comprar tus propios productos") se muestran en un banner en Home, Catálogo, Detalle y Carrito.

### Panel de administración

`/admin` (acceso solo `administrador`), con pestañas:

- **Pedidos**: filtro por estado, detalle con líneas/dirección/historial, cambio de estado con observación y botón "Avanzar".
- **Productos**: listado con inactivos, crear/editar (incluye imagen de Google Drive por referencia) y activar/desactivar.
- **Categorías**: crear, editar, activar/desactivar.
- **Usuarios**: consulta (nombre, correo, teléfono, rol, estado).

## 5. Verificación realizada

Flujo comprador completo (vía proxy `http://localhost:5173/api`):

1. `POST /auth/login` → token JWT.
2. `POST /carrito/productos` → línea agregada, total calculado.
3. `POST /direcciones` → dirección con CP de 5 dígitos validado.
4. `POST /pedidos` → `TLJ-YYYY-######` creado, historial con estado inicial, stock descontado, carrito convertido.
5. `GET /pedidos/mios` y `/pedidos/:id` → listado y detalle con seguimiento.
6. `PATCH /pedidos/admin/:id/estado` → estado actualizado y fila nueva en historial con observación.

Flujo vendedor:

1. `POST /carrito/productos` con un producto propio → `400 No puedes comprar tus propios productos`.
2. Pedido con ítem propio en el carrito → `400 Un pedido no puede incluir productos tuyos` + rollback (el carrito sigue activo, no se descuenta stock).
3. Compra de un producto de otro vendedor → pedido creado con normalidad.

Casos negativos probados: CP inválido, contraseña corta, correo duplicado, credenciales incorrectas, token inexistente/expirado, stock insuficiente.

## 6. Cómo ejecutar

```bash
# 1) BD (PostgreSQL 16 local)
psql -U postgres -h localhost -d tiendita_joyas -f database/seed.sql

# 2) Backend (puerto 4000)
cd backend && npm install && npm run dev

# 3) Frontend (puerto 5173, proxy /api → 4000)
cd frontend && npm install && npm run dev
```

Usuarios de prueba (contraseña `Clave123!`):

| Rol | Correo |
|---|---|
| administrador | `admin@tienditajoyas.mx` |
| vendedor | `vendedor1@tienditajoyas.mx` / `vendedor2@tienditajoyas.mx` |
| comprador | `comprador1@tienditajoyas.mx` / `comprador2@tienditajoyas.mx` |
