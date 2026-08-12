-- =============================================================
-- Tiendita las joyas - Esquema de base de datos
-- PostgreSQL 16
-- Fase 3: Creación de base de datos, tablas, relaciones y restricciones
-- =============================================================

SET client_encoding = 'UTF8';

-- Búsqueda con coincidencia parcial (LIKE acelerado con índices GIN)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================
-- CATÁLOGO DE ROLES
-- =============================================================
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(30)  NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    CONSTRAINT chk_rol_nombre CHECK (nombre IN ('administrador', 'vendedor', 'comprador'))
);

-- =============================================================
-- USUARIOS
-- =============================================================
CREATE TABLE usuarios (
    id             SERIAL PRIMARY KEY,
    id_rol         INT          NOT NULL REFERENCES roles (id),
    nombre         VARCHAR(80)  NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    telefono       VARCHAR(15)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Teléfono mexicano: 10 dígitos (sin LADA)
    CONSTRAINT chk_telefono_mx CHECK (telefono ~ '^[0-9]{10}$'),
    CONSTRAINT chk_usuario_estado CHECK (estado IN ('activo', 'inactivo'))
);

CREATE INDEX idx_usuarios_rol ON usuarios (id_rol);

-- =============================================================
-- DIRECCIONES (datos de México)
-- =============================================================
CREATE TABLE direcciones (
    id             SERIAL PRIMARY KEY,
    id_usuario     INT         NOT NULL REFERENCES usuarios (id),
    nombre         VARCHAR(80) NOT NULL,  -- nombre del destinatario
    calle          VARCHAR(120) NOT NULL,
    numero         VARCHAR(20) NOT NULL,
    colonia        VARCHAR(80) NOT NULL,
    codigo_postal  VARCHAR(5)  NOT NULL,
    municipio      VARCHAR(80) NOT NULL,
    estado         VARCHAR(40) NOT NULL,  -- estado de la República
    pais           VARCHAR(30) NOT NULL DEFAULT 'México',
    es_principal   BOOLEAN     NOT NULL DEFAULT FALSE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Código postal mexicano: 5 dígitos
    CONSTRAINT chk_codigo_postal_mx CHECK (codigo_postal ~ '^[0-9]{5}$')
);

CREATE INDEX idx_direcciones_usuario ON direcciones (id_usuario);

-- =============================================================
-- CATEGORÍAS
-- =============================================================
CREATE TABLE categorias (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(60)  NOT NULL UNIQUE,
    descripcion    VARCHAR(255),
    estado         VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_categoria_estado CHECK (estado IN ('activo', 'inactivo'))
);

-- =============================================================
-- PRODUCTOS
-- =============================================================
CREATE TABLE productos (
    id             SERIAL PRIMARY KEY,
    id_vendedor    INT           NOT NULL REFERENCES usuarios (id),
    id_categoria   INT           NOT NULL REFERENCES categorias (id),
    nombre         VARCHAR(120)  NOT NULL,
    descripcion    TEXT          NOT NULL,
    precio         NUMERIC(12,2) NOT NULL,
    existencia     INT           NOT NULL DEFAULT 0,
    estado         VARCHAR(20)   NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_existencia_no_negativa CHECK (existencia >= 0),
    CONSTRAINT chk_producto_estado CHECK (estado IN ('activo', 'inactivo'))
);

-- Índices para búsqueda y filtrado (Video 3: consultas)
CREATE INDEX idx_productos_nombre ON productos (nombre);
CREATE INDEX idx_productos_categoria ON productos (id_categoria);
CREATE INDEX idx_productos_vendedor ON productos (id_vendedor);
-- Búsqueda difusa por nombre con pg_trgm
CREATE INDEX idx_productos_nombre_trgm ON productos USING GIN (nombre gin_trgm_ops);

-- =============================================================
-- IMÁGENES (referencias a Google Drive, NO se guarda el binario)
-- =============================================================
CREATE TABLE imagenes (
    id             SERIAL PRIMARY KEY,
    id_producto    INT           NOT NULL REFERENCES productos (id),
    google_drive_id VARCHAR(255) NOT NULL,
    url            VARCHAR(500)  NOT NULL,
    nombre_archivo VARCHAR(255)  NOT NULL,
    es_principal   BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_registro TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_imagenes_producto ON imagenes (id_producto);

-- =============================================================
-- CARRITO (una sesión activa por usuario)
-- =============================================================
CREATE TABLE carrito (
    id             SERIAL PRIMARY KEY,
    id_usuario     INT         NOT NULL REFERENCES usuarios (id),
    estado         VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_carrito_estado CHECK (estado IN ('activo', 'convertido'))
);

-- Garantiza un único carrito activo por usuario
CREATE UNIQUE INDEX uq_carrito_activo_por_usuario
    ON carrito (id_usuario) WHERE estado = 'activo';

CREATE TABLE detalle_carrito (
    id             SERIAL PRIMARY KEY,
    id_carrito     INT           NOT NULL REFERENCES carrito (id) ON DELETE CASCADE,
    id_producto    INT           NOT NULL REFERENCES productos (id),
    cantidad       INT           NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_precio_unitario_positivo CHECK (precio_unitario >= 0),
    -- Un producto solo una vez por carrito
    CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto)
);

-- =============================================================
-- PEDIDOS
-- =============================================================
CREATE TABLE pedidos (
    id             SERIAL PRIMARY KEY,
    numero_pedido  VARCHAR(20)  NOT NULL UNIQUE,
    id_usuario     INT          NOT NULL REFERENCES usuarios (id),
    id_direccion   INT          NOT NULL REFERENCES direcciones (id),
    subtotal       NUMERIC(12,2) NOT NULL,
    total          NUMERIC(12,2) NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    fecha_pedido   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_subtotal_positivo CHECK (subtotal >= 0),
    CONSTRAINT chk_total_positivo CHECK (total >= 0),
    CONSTRAINT chk_pedido_estado CHECK (
        estado IN ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado')
    )
);

CREATE INDEX idx_pedidos_usuario ON pedidos (id_usuario);
CREATE INDEX idx_pedidos_estado ON pedidos (estado);

CREATE TABLE detalle_pedido (
    id              SERIAL PRIMARY KEY,
    id_pedido       INT           NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
    id_producto     INT           NOT NULL REFERENCES productos (id),
    cantidad        INT           NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0)
);

CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido (id_pedido);

-- =============================================================
-- HISTORIAL DE PEDIDOS (bitácora de estados)
-- =============================================================
CREATE TABLE historial_pedido (
    id             SERIAL PRIMARY KEY,
    id_pedido      INT          NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo   VARCHAR(20)  NOT NULL,
    id_usuario     INT          REFERENCES usuarios (id),
    observacion    VARCHAR(255),
    fecha_cambio   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_historial_estado CHECK (
        estado_nuevo IN ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado')
    )
);

CREATE INDEX idx_historial_pedido ON historial_pedido (id_pedido);

-- =============================================================
-- TRIGGER: registra automáticamente el estado inicial del pedido
-- =============================================================
CREATE OR REPLACE FUNCTION registrar_estado_inicial_pedido()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historial_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario, observacion)
    VALUES (NEW.id, NULL, NEW.estado, NEW.id_usuario, 'Pedido creado');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_pedido_insercion
    AFTER INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_estado_inicial_pedido();
