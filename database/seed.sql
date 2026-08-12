-- =============================================================
-- Tiendita las joyas - Datos de prueba
-- Fase 3
-- Contraseña de todos los usuarios de prueba: Clave123!
-- (almacenada con hash bcrypt, NUNCA en texto plano)
-- =============================================================

SET client_encoding = 'UTF8';

-- Limpia las tablas (orden seguro con CASCADE) para poder re-ejecutar
TRUNCATE TABLE roles, usuarios, direcciones, categorias, productos,
    imagenes, carrito, detalle_carrito, pedidos, detalle_pedido,
    historial_pedido
RESTART IDENTITY CASCADE;

-- =============================================================
-- ROLES
-- =============================================================
INSERT INTO roles (id, nombre, descripcion) VALUES
    (1, 'administrador', 'Gestiona la plataforma: productos, categorías, usuarios y pedidos'),
    (2, 'vendedor',      'Publica y administra sus propios productos'),
    (3, 'comprador',     'Consulta el catálogo y realiza pedidos');

-- =============================================================
-- USUARIOS
-- =============================================================
INSERT INTO usuarios (id, id_rol, nombre, email, telefono, password_hash, estado) VALUES
    (1, 1, 'Adriana López',     'admin@tienditajoyas.mx',   '3312345678', '$2a$10$lNOMkurFiAkBehLCTmnR0uIav5/yHNAC35MwgwtcyKtxMCeWTZQ66', 'activo'),
    (2, 2, 'Carlos Ramírez',    'vendedor1@tienditajoyas.mx', '5512345678', '$2a$10$lNOMkurFiAkBehLCTmnR0uIav5/yHNAC35MwgwtcyKtxMCeWTZQ66', 'activo'),
    (3, 2, 'María Fernández',   'vendedor2@tienditajoyas.mx', '8182345678', '$2a$10$lNOMkurFiAkBehLCTmnR0uIav5/yHNAC35MwgwtcyKtxMCeWTZQ66', 'activo'),
    (4, 3, 'Jorge Torres',      'comprador1@tienditajoyas.mx', '4421234567', '$2a$10$lNOMkurFiAkBehLCTmnR0uIav5/yHNAC35MwgwtcyKtxMCeWTZQ66', 'activo'),
    (5, 3, 'Lucía Morales',     'comprador2@tienditajoyas.mx', '5556781234', '$2a$10$lNOMkurFiAkBehLCTmnR0uIav5/yHNAC35MwgwtcyKtxMCeWTZQ66', 'activo');

-- =============================================================
-- DIRECCIONES (datos de México)
-- =============================================================
INSERT INTO direcciones (id, id_usuario, nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais, es_principal) VALUES
    (1, 4, 'Jorge Torres',  'Calle Morelos', '45',  'Centro',        '76000', 'Querétaro',   'Querétaro', 'México', TRUE),
    (2, 4, 'Jorge Torres',  'Av. Zaragoza', '120', 'Independencia', '45200', 'Zapopan',     'Jalisco',   'México', FALSE),
    (3, 5, 'Lucía Morales', 'Calle Tlaxcala', '8', 'Roma Norte',    '06700', 'Cuauhtémoc',  'Ciudad de México', 'México', TRUE);

-- =============================================================
-- CATEGORÍAS
-- =============================================================
INSERT INTO categorias (id, nombre, descripcion, estado) VALUES
    (1,  'Electrónica', 'Equipos y accesorios electrónicos', 'activo'),
    (2,  'Computación', 'Equipos de cómputo y periféricos',  'activo'),
    (3,  'Telefonía',   'Teléfonos móviles y accesorios',    'activo'),
    (4,  'Hogar',       'Artículos para el hogar',           'activo'),
    (5,  'Ropa',        'Prendas de vestir',                 'activo'),
    (6,  'Deportes',    'Artículos deportivos',              'activo'),
    (7,  'Videojuegos', 'Consolas y videojuegos',            'activo'),
    (8,  'Automóviles', 'Accesorios y refacciones de auto',  'activo'),
    (9,  'Libros',      'Libros y publicaciones',            'activo'),
    (10, 'Otros',       'Productos de otras categorías',     'activo');

-- =============================================================
-- PRODUCTOS
-- =============================================================
INSERT INTO productos (id, id_vendedor, id_categoria, nombre, descripcion, precio, existencia, estado) VALUES
    (1,  2, 1, 'Laptop Lenovo IdeaPad 3',        'Laptop de 15.6" con procesador AMD Ryzen 5, 16 GB de RAM y SSD de 512 GB. Ideal para trabajo y estudio.', 14999.00, 12, 'activo'),
    (2,  2, 1, 'Mouse Logitech M280',            'Mouse inalámbrico con rueda de desplazamiento precisa y duración de batería de hasta 18 meses.', 449.00, 35, 'activo'),
    (3,  2, 4, 'Licuadora Oster 10 velocidades', 'Licuadora con vaso de vidrio de 1.5 L, cuchilla de acero inoxidable y 10 velocidades.', 899.00, 20, 'activo'),
    (4,  2, 4, 'Ventilador de torre Lasko',      'Ventilador de torre de 3 velocidades con temporizador y control remoto.', 1299.00, 8, 'activo'),
    (5,  3, 5, 'Camisa de algodón premium',      'Camisa de manga larga en algodón pima, hecha en México. Tallas S a XL.', 349.00, 50, 'activo'),
    (6,  3, 5, 'Tenis deportivos urbanos',       'Tenis con suela amortiguada y diseño casual, disponibles del 24 al 30.', 1099.00, 25, 'activo'),
    (7,  3, 3, 'Smartphone Xiaomi Redmi Note',   'Pantalla de 6.67", 128 GB de almacenamiento, cámara de 50 MP y batería de 5000 mAh.', 4299.00, 15, 'activo'),
    (8,  2, 2, 'Teclado mecánico RGB',           'Teclado mecánico con switches red, retroiluminación RGB y diseño compacto.', 999.00, 18, 'activo'),
    (9,  3, 6, 'Balón de fútbol profesional',    'Balón tamaño 5 con costura térmica, apto para canchas de pasto natural y sintético.', 549.00, 40, 'activo'),
    (10, 3, 7, 'Consola portátil retro',         'Consola portátil con más de 300 juegos retro integrados y salida HDMI.', 2999.00, 10, 'activo'),
    (11, 2, 9, 'Novela mexicana tapa dura',      'Novela de autor mexicano, edición de colección en tapa dura.', 249.00, 30, 'activo'),
    (12, 3, 8, 'Cargador de auto USB-C',         'Cargador para automóvil con puerto USB-C de 30 W, carga rápida.', 399.00, 0, 'activo'),
    (13, 2, 1, 'Auriculares Bluetooth',          'Auriculares inalámbricos con cancelación de ruido y estuche de carga.', 799.00, 0, 'inactivo');

-- =============================================================
-- IMÁGENES (referencias a Google Drive)
-- La imagen NO se almacena en PostgreSQL: solo su ubicación en Drive
-- =============================================================
INSERT INTO imagenes (id, id_producto, google_drive_id, url, nombre_archivo, es_principal) VALUES
    (1,  1,  'drive-electronica-laptop-001',  'https://drive.google.com/uc?id=drive-electronica-laptop-001&export=view',  'laptop.jpg',   TRUE),
    (2,  1,  'drive-electronica-laptop-002',  'https://drive.google.com/uc?id=drive-electronica-laptop-002&export=view',  'laptop-2.jpg', FALSE),
    (3,  2,  'drive-electronica-mouse-001',   'https://drive.google.com/uc?id=drive-electronica-mouse-001&export=view',   'mouse.jpg',    TRUE),
    (4,  3,  'drive-hogar-licuadora-001',     'https://drive.google.com/uc?id=drive-hogar-licuadora-001&export=view',     'licuadora.jpg', TRUE),
    (5,  4,  'drive-hogar-ventilador-001',    'https://drive.google.com/uc?id=drive-hogar-ventilador-001&export=view',    'ventilador.jpg', TRUE),
    (6,  5,  'drive-ropa-camisa-001',         'https://drive.google.com/uc?id=drive-ropa-camisa-001&export=view',         'camisa.jpg',   TRUE),
    (7,  6,  'drive-ropa-tenis-001',          'https://drive.google.com/uc?id=drive-ropa-tenis-001&export=view',          'tenis.jpg',    TRUE),
    (8,  7,  'drive-telefonia-smartphone-001','https://drive.google.com/uc?id=drive-telefonia-smartphone-001&export=view', 'smartphone.jpg', TRUE),
    (9,  8,  'drive-computacion-teclado-001', 'https://drive.google.com/uc?id=drive-computacion-teclado-001&export=view', 'teclado.jpg',  TRUE),
    (10, 9,  'drive-deportes-balon-001',      'https://drive.google.com/uc?id=drive-deportes-balon-001&export=view',      'balon.jpg',    TRUE),
    (11, 10, 'drive-videojuegos-consola-001', 'https://drive.google.com/uc?id=drive-videojuegos-consola-001&export=view', 'consola.jpg',  TRUE),
    (12, 11, 'drive-libros-novela-001',       'https://drive.google.com/uc?id=drive-libros-novela-001&export=view',       'novela.jpg',   TRUE),
    (13, 12, 'drive-autos-cargador-001',      'https://drive.google.com/uc?id=drive-autos-cargador-001&export=view',      'cargador.jpg', TRUE),
    (14, 13, 'drive-electronica-audifonos-001','https://drive.google.com/uc?id=drive-electronica-audifonos-001&export=view', 'audifonos.jpg', TRUE);

-- =============================================================
-- CARRITO (activo) y detalle
-- =============================================================
INSERT INTO carrito (id, id_usuario, estado) VALUES
    (1, 4, 'activo'),
    (2, 5, 'convertido');

INSERT INTO detalle_carrito (id, id_carrito, id_producto, cantidad, precio_unitario) VALUES
    (1, 1, 2, 2, 449.00),
    (2, 1, 8, 1, 999.00),
    (3, 2, 7, 1, 4299.00);

-- =============================================================
-- PEDIDOS y detalle
-- El trigger registra automáticamente el estado inicial en historial_pedido
-- =============================================================
INSERT INTO pedidos (id, numero_pedido, id_usuario, id_direccion, subtotal, total, estado, fecha_pedido) VALUES
    (1, 'TLJ-2026-000001', 4, 1, 1897.00, 1897.00, 'entregado',  CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (2, 'TLJ-2026-000002', 4, 2, 14999.00, 14999.00, 'pendiente', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (3, 'TLJ-2026-000003', 5, 3, 5397.00, 5397.00, 'enviado',    CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario) VALUES
    (1, 1, 2, 2, 449.00),
    (2, 1, 8, 1, 999.00),
    (3, 2, 1, 1, 14999.00),
    (4, 3, 7, 1, 4299.00),
    (5, 3, 9, 2, 549.00);

-- =============================================================
-- HISTORIAL de estados (bitácora)
-- El trigger registró el estado inicial "pendiente" de cada pedido.
-- Aquí añadimos el recorrido de estados del pedido 1 (ya entregado).
-- =============================================================
INSERT INTO historial_pedido (id, id_pedido, estado_anterior, estado_nuevo, id_usuario, observacion, fecha_cambio) VALUES
    (4, 1, 'pendiente', 'confirmado', 1, 'Pago simulado aprobado',    CURRENT_TIMESTAMP - INTERVAL '9 days'),
    (5, 1, 'confirmado','preparando', 1, 'En preparación en almacén', CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (6, 1, 'preparando','enviado',    1, 'Enviado a Querétaro',       CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (7, 1, 'enviado',   'entregado',  1, 'Entregado al cliente',      CURRENT_TIMESTAMP - INTERVAL '4 days');

-- =============================================================
-- Ajuste de secuencias para evitar conflictos con los ids explícitos
-- =============================================================
SELECT setval(pg_get_serial_sequence('roles', 'id'),            (SELECT MAX(id) FROM roles));
SELECT setval(pg_get_serial_sequence('usuarios', 'id'),         (SELECT MAX(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('direcciones', 'id'),      (SELECT MAX(id) FROM direcciones));
SELECT setval(pg_get_serial_sequence('categorias', 'id'),       (SELECT MAX(id) FROM categorias));
SELECT setval(pg_get_serial_sequence('productos', 'id'),        (SELECT MAX(id) FROM productos));
SELECT setval(pg_get_serial_sequence('imagenes', 'id'),         (SELECT MAX(id) FROM imagenes));
SELECT setval(pg_get_serial_sequence('carrito', 'id'),          (SELECT MAX(id) FROM carrito));
SELECT setval(pg_get_serial_sequence('detalle_carrito', 'id'),  (SELECT MAX(id) FROM detalle_carrito));
SELECT setval(pg_get_serial_sequence('pedidos', 'id'),          (SELECT MAX(id) FROM pedidos));
SELECT setval(pg_get_serial_sequence('detalle_pedido', 'id'),   (SELECT MAX(id) FROM detalle_pedido));
SELECT setval(pg_get_serial_sequence('historial_pedido', 'id'), (SELECT MAX(id) FROM historial_pedido));
