# 01 — Análisis y planificación

> Fase 1 · Video 1 (Análisis y planificación).

## 1. Problema planteado

Una empresa mexicana quiere una plataforma digital para comercializar productos dentro de México. Los vendedores publican productos y los compradores consultan el catálogo, buscan, filtran, ven detalles, arman un carrito y generan una solicitud de compra/pedido. El pago es **simulado**.

La plataforma no es un clon de Mercado Libre: tiene identidad visual propia, nombre, logotipo, navegación y diseño propios. Está orientada exclusivamente al mercado mexicano.

## 2. Objetivo del proyecto

Construir una aplicación web funcional que:

1. Administre y consulte un catálogo de productos.
2. Simule el proceso básico de compra (carrito → pedido).
3. Permita a un administrador gestionar productos, categorías, usuarios y pedidos.
4. Use PostgreSQL, Google Drive (imágenes) y Git/GitHub, con despliegue local.

## 3. Funcionalidades

### Página principal
- Nombre de la plataforma y logotipo.
- Menú de navegación.
- Buscador.
- Categorías.
- Productos destacados.
- Información general de la plataforma.
- Acceso/registro de usuarios.

### Módulo de usuarios
- **Comprador:** registro, login, consultar/buscar/filtrar productos, ver detalle, carrito (agregar, modificar cantidades, eliminar), generar pedido, consultar sus pedidos.
- **Administrador:** login, registrar/modificar/desactivar productos, administrar categorías, consultar usuarios, consultar pedidos, cambiar estado de pedidos.

### Módulo de productos
- Campos mínimos: id, nombre, descripción, precio, categoría, existencia, imagen, estado, fecha de registro.
- Operaciones: crear, consultar, modificar, desactivar (baja lógica).

### Búsqueda y filtrado
- Búsqueda por texto (nombre/descripción).
- Filtros combinables: categoría, precio mínimo, precio máximo, disponibilidad.

### Carrito
- Agregar productos, modificar cantidades, eliminar, calcular subtotal y total, confirmar pedido.

### Pedidos
- Número de pedido, usuario, fecha, productos, cantidades, total, estado.
- Estados: Pendiente, Confirmado, Preparando, Enviado, Entregado, Cancelado.
- Pago simulado (sin pasarela real).

### Consideraciones México
- Moneda MXN (pesos mexicanos).
- Estados de la República Mexicana.
- Códigos postales mediante la API **Postalia** (https://postalia.com.mx/).
- Teléfonos con formato mexicano (10 dígitos, prefijo +52).
- Dirección: nombre, calle, número, colonia, código postal, municipio, estado, país (México).

## 4. Tecnologías seleccionadas

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React + Vite + Bootstrap | Componentes reutilizables, ecosistema maduro, Bootstrap para UI rápida y responsiva. |
| Backend | Node.js + Express | Mismo lenguaje que el frontend, API REST ligera, curva de aprendizaje adecuada. |
| BD | PostgreSQL | Obligatorio. Relacional, íntegro, soporta índices y restricciones avanzadas. |
| Autenticación | JWT + bcrypt | Sesiones sin estado (stateless) en el cliente + hash seguro de contraseñas. |
| Imágenes | Google Drive institucional | Obligatorio. Se guarda en PostgreSQL solo la referencia/URL. |
| Git | Git + GitHub | Control de versiones, commits por avance real. |
| Código postal | API Postalia | Códigos postales y colonias de México. |

## 5. Arquitectura propuesta

Monolito backend (API REST) + SPA frontend:

```
Frontend React ──HTTP/JSON (JWT)──► API Express ──pg──► PostgreSQL
                                        │
                                        └──► Google Drive (imágenes, por referencia)
```

- **Frontend:** SPA con React Router. Consume la API, guarda el token JWT y maneja roles.
- **Backend:** capas *ruta → controlador → servicio → repositorio*. Middleware para auth, validación y errores.
- **BD:** pool de conexiones con `pg` y consultas parametrizadas.
- **Imágenes:** se suben a Google Drive; en PostgreSQL se guarda el ID/URL de Google Drive.

### Patrones de diseño
- Arquitectura en capas (separación de responsabilidades).
- Repository pattern para el acceso a datos (facilita consultas parametrizadas y mantenimiento).
- DTOs en los límites de la API (validación y control de lo que se expone).

## 6. Diseño general (identidad)

- **Nombre:** Tiendita las joyas.
- **Logotipo:** pendiente de diseñar (se recomienda un ícono de kiosco/tienda + tipografía sólida).
- **Paleta sugerida:** tonos rojo/verde con acento neutro (se define con el logotipo final).
- **Moneda:** MXN, formato `$1,499.00`.

## 7. Estructura de la base de datos (vista general)

El detalle completo está en `docs/02-diseno-base-de-datos.md`. Resumen:

- `roles`, `usuarios`, `direcciones`
- `categorias`, `productos`, `imagenes`
- `carrito`, `detalle_carrito`
- `pedidos`, `detalle_pedido`

## 8. Decisiones de diseño relevantes

- **Baja lógica:** los productos y usuarios se desactivan, no se eliminan físicamente (preserva integridad de pedidos históricos).
- **Varias imágenes por producto:** tabla `imagenes` separada (la imagen principal es la del catálogo).
- **Número de pedido legible:** formato `TLJ-YYYY-####` (humano y auditable) además del id numérico.
- **Precios:** tipo `NUMERIC(12,2)` en MXN (evita errores de punto flotante).
- **Estados de pedido:** restricción CHECK en BD + validación en backend.
- **Google Drive:** en PostgreSQL solo `google_drive_id` + `url` de referencia (la imagen vive en Drive).
