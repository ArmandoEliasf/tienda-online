# 02 — Diseño de la base de datos (vista general)

> Fase 1 · Video 1. El esquema SQL definitivo (`database/schema.sql`) se implementa en la Fase 3.

## 1. Criterios de diseño

- Modelo relacional normalizado con claves primarias, foráneas, restricciones e índices justificados.
- El esquema es de **diseño propio** (no copia del enunciado).
- Identificadores en español por ser dominio mexicano y material evaluable en español.
- Precios en `NUMERIC(12,2)` (MXN).
- Baja lógica (campo `estado`) en entidades de negocio para preservar historial.

## 2. Entidades y propósito

| Entidad | Propósito |
|---|---|
| `roles` | Catálogo de roles (comprador, administrador). |
| `usuarios` | Usuarios de la plataforma (compradores y administradores). |
| `direcciones` | Direcciones mexicanas de cada usuario (país fijo: México). |
| `categorias` | Categorías de productos (Electrónica, Hogar, Ropa, etc.). |
| `productos` | Catálogo de productos (precio, existencia, estado, fecha). |
| `imagenes` | Referencias a imágenes en Google Drive por producto. |
| `carrito` | Sesión de carrito de un usuario. |
| `detalle_carrito` | Líneas del carrito (producto + cantidad). |
| `pedidos` | Cabecera de pedido (número, usuario, dirección, total, estado). |
| `detalle_pedido` | Líneas del pedido (producto + cantidad + precio congelado). |

## 3. Relaciones

```
roles 1──N usuarios
usuarios 1──N direcciones
categorias 1──N productos
productos 1──N imagenes
usuarios 1──1 carrito (por sesión de compra activa)
carrito 1──N detalle_carrito N──1 productos
usuarios 1──N pedidos N──1 direcciones
pedidos 1──N detalle_pedido N──1 productos
```

## 4. Claves foráneas principales

- `usuarios.id_rol → roles.id`
- `direcciones.id_usuario → usuarios.id`
- `productos.id_categoria → categorias.id`
- `imagenes.id_producto → productos.id`
- `detalle_carrito.id_carrito → carrito.id`
- `detalle_carrito.id_producto → productos.id`
- `pedidos.id_usuario → usuarios.id`
- `pedidos.id_direccion → direcciones.id`
- `detalle_pedido.id_pedido → pedidos.id`
- `detalle_pedido.id_producto → productos.id`

## 5. Restricciones e integridad

- `NOT NULL` en campos obligatorios.
- `UNIQUE` en `usuarios.email`, `roles.nombre`, `categorias.nombre`.
- `CHECK` en precios (`precio >= 0`), existencias (`existencia >= 0`), cantidades (`cantidad > 0`), estados de pedido y rol.
- `DEFAULT` en `estado` (activo/pendiente) y `fecha_registro` (`CURRENT_TIMESTAMP`).
- `ON DELETE RESTRICT` en foráneas de negocio (no se borra un producto con pedidos).
- Transacciones para operaciones compuestas (crear pedido = insertar cabecera + líneas).

## 6. Índices justificados

- `productos(nombre)` — búsqueda de catálogo.
- `productos(id_categoria)` — filtrado por categoría.
- `pedidos(id_usuario)` — consulta de "mis pedidos".
- `detalle_pedido(id_pedido)` — consulta de líneas de un pedido.

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
