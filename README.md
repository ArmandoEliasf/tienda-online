# Tiendita las joyas

Marketplace mexicano para la compra y venta de productos dentro de México.

> **Nota:** nombre de marca provisional. La identidad visual (nombre, logotipo, colores) se define como parte de la Fase 1 y puede ajustarse.

## Descripción del problema

Una empresa mexicana necesita una plataforma digital para comercializar productos dentro de México: los vendedores publican productos y los compradores consultan el catálogo, buscan, filtran, agregan al carrito y generan una solicitud de compra. No es un clon de Mercado Libre: el proyecto construye su propia identidad, navegación y diseño.

## Objetivo

Desarrollar una aplicación web funcional que administre y consulte un catálogo de productos y simule el proceso básico de compra, orientada al mercado mexicano (moneda MXN, estados, códigos postales y direcciones de México).

## Funcionalidades

### Módulo de usuarios
- **Comprador:** registro, inicio de sesión, consulta y búsqueda de productos, filtros, detalle, carrito (agregar, modificar cantidades, eliminar), generar pedido, consultar sus pedidos.
- **Administrador:** inicio de sesión, CRUD de productos, administración de categorías, consulta de usuarios, consulta de pedidos y cambio de estado.

### Módulo de productos
- Cada producto: identificador, nombre, descripción, precio, categoría, existencia, imagen, estado y fecha de registro.
- Operaciones: crear, consultar, modificar y desactivar/eliminar (baja lógica).

### Catálogo y búsqueda
- Categorías para organizar productos.
- Búsqueda por texto y filtros combinables (categoría, precio mínimo/máximo, nombre, disponibilidad).

### Carrito y pedidos
- Carrito: agregar, modificar cantidades, eliminar, subtotal y total, confirmar pedido.
- Pedido: número, usuario, fecha, productos, cantidades, total y estado (Pendiente, Confirmado, Preparando, Enviado, Entregado, Cancelado). Pago simulado.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Bootstrap |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcrypt |
| Imágenes | Google Drive institucional (`@utdelacosta.edu.mx`) |
| Control de versiones | Git + GitHub |
| Código postal | API Postalia (https://postalia.com.mx/) |

## Arquitectura

Arquitectura en capas, monolítica por API:

```
┌───────────────────────────────┐
│      Frontend (React)         │
│  React Router + Bootstrap     │
└──────────────┬────────────────┘
               │  HTTP / JSON  (JWT)
┌──────────────▼────────────────┐
│      Backend (Express)        │
│  Rutas → Controladores →      │
│  Servicios → Repositorios     │
│  Middleware: auth, validación,│
│  manejo de errores            │
└──────────────┬────────────────┘
               │  pg (pool de conexiones, queries parametrizadas)
┌──────────────▼────────────────┐
│        PostgreSQL             │
└───────────────────────────────┘

Imágenes: Google Drive ──► URL/referencia guardada en PostgreSQL
```

## Estructura del repositorio

```
tienda-online/
├── backend/            # API Express
├── frontend/           # Aplicación React (Vite)
├── database/           # Scripts SQL (schema.sql, seed.sql)
├── docs/               # Documentación (análisis, diseño de BD, etc.)
└── README.md
```

> La estructura se completa y documenta en la Fase 2.

## Seguridad (resumen)

- Contraseñas con hash (bcrypt).
- Consultas parametrizadas/preparadas (sin SQL injection).
- Validación en frontend y backend.
- Control de acceso por rol (comprador/administrador) con JWT.
- Protección de operaciones administrativas.

## Instalación y ejecución

Documentación completa en la Fase 2 (configuración del entorno).

## Documentación del proyecto

- `docs/01-analisis-y-planificacion.md` — análisis, funcionalidades, arquitectura y decisiones.
- `docs/02-diseno-base-de-datos.md` — diseño general de la base de datos.
