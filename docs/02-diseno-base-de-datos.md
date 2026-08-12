# 02 — Diseño de la base de datos

> Fase 3. Esquema implementado en `database/schema.sql`; datos de prueba en `database/seed.sql`.

## 1. Criterios de diseño

- Modelo relacional normalizado con claves primarias, foráneas, restricciones e índices justificados.
- El esquema es de **diseño propio** (no copia del enunciado): 11 tablas, incluida una bitácora de estados de pedidos.
- Identificadores en español por ser dominio mexicano y material evaluable en español.
- Precios en `NUMERIC(12,2)` (MXN).
- Baja lógica (campo `estado`) en entidades de negocio para preservar historial.

## 2. Entidades y propósito

| Entidad | Propósito |
|---|---|
| `roles` | Catálogo de roles (administrador, vendedor, comprador). |
| `usuarios` | Usuarios de la plataforma. |
| `direcciones` | Direcciones mexicanas de cada usuario (país fijo: México). |
| `categorias` | Categorías de productos (Electrónica, Hogar, Ropa, etc.). |
| `productos` | Catálogo de productos (precio, existencia, estado, vendedor). |
| `imagenes` | Referencias a imágenes en Google Drive por producto (no el binario). |
| `carrito` | Sesión de carrito de un usuario (una activa por usuario). |
| `detalle_carrito` | Líneas del carrito (producto + cantidad). |
| `pedidos` | Cabecera de pedido (número, usuario, dirección, total, estado). |
| `detalle_pedido` | Líneas del pedido (cantidad + precio congelado; `subtotal` es columna generada). |
| `historial_pedido` | Bitácora de cambios de estado de cada pedido (auditoría). |

## 3. Relaciones

```
roles 1──N usuarios
usuarios 1──N direcciones
usuarios 1──N productos (vendedor)
categorias 1──N productos
productos 1──N imagenes
usuarios 1──1 carrito activo (índice único parcial)
carrito 1──N detalle_carrito N──1 productos
usuarios 1──N pedidos N──1 direcciones
pedidos 1──N detalle_pedido N──1 productos
pedidos 1──N historial_pedido
```

## 4. Claves foráneas principales

- `usuarios.id_rol → roles.id`
- `direcciones.id_usuario → usuarios.id`
- `productos.id_vendedor → usuarios.id`
- `productos.id_categoria → categorias.id`
- `imagenes.id_producto → productos.id`
- `detalle_carrito.id_carrito → carrito.id` (`ON DELETE CASCADE`)
- `detalle_carrito.id_producto → productos.id`
- `pedidos.id_usuario → usuarios.id`
- `pedidos.id_direccion → direcciones.id`
- `detalle_pedido.id_pedido → pedidos.id` (`ON DELETE CASCADE`)
- `detalle_pedido.id_producto → productos.id`
- `historial_pedido.id_pedido → pedidos.id` (`ON DELETE CASCADE`)
- `historial_pedido.id_usuario → usuarios.id`

## 5. Restricciones e integridad

- `NOT NULL` en campos obligatorios.
- `UNIQUE` en `usuarios.email`, `roles.nombre`, `categorias.nombre`, `pedidos.numero_pedido`, `detalle_carrito(carrito,producto)`.
- Índice único **parcial**: un solo carrito `activo` por usuario (`uq_carrito_activo_por_usuario`).
- `CHECK` en:
  - Precios y existencias no negativos; cantidades > 0.
  - Teléfono mexicano de 10 dígitos (`^[0-9]{10}$`).
  - Código postal de 5 dígitos (`^[0-9]{5}$`).
  - Estados de `productos`, `usuarios`, `categorias` (activo/inactivo).
  - Estados de pedido (pendiente, confirmado, preparando, enviado, entregado, cancelado).
- `DEFAULT`: `estado` (activo/pendiente), `pais='México'`, `fecha_registro/fecha_pedido/fecha_creacion` (`CURRENT_TIMESTAMP`).
- Columna **generada**: `detalle_pedido.subtotal = cantidad * precio_unitario` (calculada por PostgreSQL, no manipulable).
- `ON DELETE CASCADE` solo en líneas dependientes (detalles e historial); el resto usa `RESTRICT` implícito (no se borra un producto con pedidos).
- **Transacciones** para operaciones compuestas (crear pedido = cabecera + líneas).

## 6. Índices justificados

- `productos(nombre)` — búsqueda y orden por nombre.
- `productos(nombre) GIN (gin_trgm_ops)` — búsqueda difusa `ILIKE '%...%'` con pg_trgm.
- `productos(id_categoria)` — filtrado por categoría.
- `productos(id_vendedor)` — "mis productos" del vendedor.
- `pedidos(id_usuario)` — "mis pedidos".
- `pedidos(estado)` — filtrado administrativo por estado.
- `detalle_pedido(id_pedido)`, `historial_pedido(id_pedido)` — líneas y bitácora de un pedido.
- `imagenes(id_producto)`, `usuarios(id_rol)`, `direcciones(id_usuario)` — acceso por FK.

## 7. Google Drive e imágenes

- Las imágenes **no** se almacenan en PostgreSQL.
- En `imagenes` se guarda: `google_drive_id`, `url`, `nombre_archivo`, `es_principal` y referencia al producto.
- La aplicación resuelve la imagen desde Google Drive por su referencia guardada en BD.

## 8. Estructura de carpetas en Google Drive

```
Marketplace-Mexico/
├── electronica/   (laptop.jpg, mouse.jpg, ...)
├── hogar/         (licuadora.jpg, ventilador.jpg, ...)
└── ropa/          (camisa.jpg, zapatos.jpg, ...)
```

## 9. Consultas de verificación (Video 3)

```sql
-- Catálogo con categoría y vendedor
SELECT p.nombre, c.nombre AS categoria, p.precio, u.nombre AS vendedor
FROM productos p
JOIN categorias c ON c.id = p.id_categoria
JOIN usuarios u ON u.id = p.id_vendedor;

-- Pedido con sus líneas (subtotal es columna generada)
SELECT pe.numero_pedido, dp.cantidad, p.nombre AS producto,
       dp.precio_unitario, dp.subtotal
FROM pedidos pe
JOIN detalle_pedido dp ON dp.id_pedido = pe.id
JOIN productos p ON p.id = dp.id_producto;

-- Bitácora de estados de un pedido
SELECT estado_anterior, estado_nuevo, observacion, fecha_cambio
FROM historial_pedido WHERE id_pedido = 1;

-- Búsqueda difusa (usa el índice GIN trgm en tablas grandes)
SELECT nombre, precio FROM productos WHERE nombre ILIKE '%laptop%';
```
