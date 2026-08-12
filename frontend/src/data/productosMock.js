export const categoriasMock = [
  { id: 1, nombre: 'Electrónica' },
  { id: 2, nombre: 'Computación' },
  { id: 3, nombre: 'Telefonía' },
  { id: 4, nombre: 'Hogar' },
  { id: 5, nombre: 'Ropa' },
  { id: 6, nombre: 'Deportes' },
  { id: 7, nombre: 'Videojuegos' },
  { id: 8, nombre: 'Automóviles' },
  { id: 9, nombre: 'Libros' },
  { id: 10, nombre: 'Otros' },
]

export const productosMock = [
  { id: 1, nombre: 'Laptop Lenovo IdeaPad 3', descripcion: 'Laptop de 15.6" con procesador AMD Ryzen 5, 16 GB de RAM y SSD de 512 GB. Ideal para trabajo y estudio.', precio: 14999.0, existencia: 12, estado: 'activo', id_categoria: 1, categoria: 'Electrónica', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/laptop/500/350', imagen_id: 'drive-electronica-laptop-001' },
  { id: 2, nombre: 'Mouse Logitech M280', descripcion: 'Mouse inalámbrico con rueda de desplazamiento precisa y duración de batería de hasta 18 meses.', precio: 449.0, existencia: 35, estado: 'activo', id_categoria: 1, categoria: 'Electrónica', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/mouse/500/350', imagen_id: 'drive-electronica-mouse-001' },
  { id: 3, nombre: 'Licuadora Oster 10 velocidades', descripcion: 'Licuadora con vaso de vidrio de 1.5 L, cuchilla de acero inoxidable y 10 velocidades.', precio: 899.0, existencia: 20, estado: 'activo', id_categoria: 4, categoria: 'Hogar', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/licuadora/500/350', imagen_id: 'drive-hogar-licuadora-001' },
  { id: 4, nombre: 'Ventilador de torre Lasko', descripcion: 'Ventilador de torre de 3 velocidades con temporizador y control remoto.', precio: 1299.0, existencia: 8, estado: 'activo', id_categoria: 4, categoria: 'Hogar', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/ventilador/500/350', imagen_id: 'drive-hogar-ventilador-001' },
  { id: 5, nombre: 'Camisa de algodón premium', descripcion: 'Camisa de manga larga en algodón pima, hecha en México. Tallas S a XL.', precio: 349.0, existencia: 50, estado: 'activo', id_categoria: 5, categoria: 'Ropa', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/camisa/500/350', imagen_id: 'drive-ropa-camisa-001' },
  { id: 6, nombre: 'Tenis deportivos urbanos', descripcion: 'Tenis con suela amortiguada y diseño casual, disponibles del 24 al 30.', precio: 1099.0, existencia: 25, estado: 'activo', id_categoria: 5, categoria: 'Ropa', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/tenis/500/350', imagen_id: 'drive-ropa-tenis-001' },
  { id: 7, nombre: 'Smartphone Xiaomi Redmi Note', descripcion: 'Pantalla de 6.67", 128 GB de almacenamiento, cámara de 50 MP y batería de 5000 mAh.', precio: 4299.0, existencia: 15, estado: 'activo', id_categoria: 3, categoria: 'Telefonía', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/smartphone/500/350', imagen_id: 'drive-telefonia-smartphone-001' },
  { id: 8, nombre: 'Teclado mecánico RGB', descripcion: 'Teclado mecánico con switches red, retroiluminación RGB y diseño compacto.', precio: 999.0, existencia: 18, estado: 'activo', id_categoria: 2, categoria: 'Computación', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/teclado/500/350', imagen_id: 'drive-computacion-teclado-001' },
  { id: 9, nombre: 'Balón de fútbol profesional', descripcion: 'Balón tamaño 5 con costura térmica, apto para canchas de pasto natural y sintético.', precio: 549.0, existencia: 40, estado: 'activo', id_categoria: 6, categoria: 'Deportes', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/balon/500/350', imagen_id: 'drive-deportes-balon-001' },
  { id: 10, nombre: 'Consola portátil retro', descripcion: 'Consola portátil con más de 300 juegos retro integrados y salida HDMI.', precio: 2999.0, existencia: 10, estado: 'activo', id_categoria: 7, categoria: 'Videojuegos', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/consola/500/350', imagen_id: 'drive-videojuegos-consola-001' },
  { id: 11, nombre: 'Novela mexicana tapa dura', descripcion: 'Novela de autor mexicano, edición de colección en tapa dura.', precio: 249.0, existencia: 30, estado: 'activo', id_categoria: 9, categoria: 'Libros', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/novela/500/350', imagen_id: 'drive-libros-novela-001' },
  { id: 12, nombre: 'Cargador de auto USB-C', descripcion: 'Cargador para automóvil con puerto USB-C de 30 W, carga rápida.', precio: 399.0, existencia: 0, estado: 'activo', id_categoria: 8, categoria: 'Automóviles', id_vendedor: 3, vendedor: 'María Fernández', imagen_url: 'https://picsum.photos/seed/cargador/500/350', imagen_id: 'drive-autos-cargador-001' },
  { id: 13, nombre: 'Auriculares Bluetooth', descripcion: 'Auriculares inalámbricos con cancelación de ruido y estuche de carga.', precio: 799.0, existencia: 0, estado: 'inactivo', id_categoria: 1, categoria: 'Electrónica', id_vendedor: 2, vendedor: 'Carlos Ramírez', imagen_url: 'https://picsum.photos/seed/audifonos/500/350', imagen_id: 'drive-electronica-audifonos-001' },
]
