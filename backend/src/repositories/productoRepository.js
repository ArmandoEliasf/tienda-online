import { query } from '../config/db.js';

const PRODUCTO_SELECT = `
  SELECT p.id,
         p.nombre,
         p.descripcion,
         p.precio,
         p.existencia,
         p.estado,
         p.fecha_registro,
         p.id_categoria,
         c.nombre AS categoria,
         p.id_vendedor,
         v.nombre AS vendedor,
         img.url AS imagen_url,
         img.google_drive_id AS imagen_id
  FROM productos p
  JOIN categorias c ON c.id = p.id_categoria
  JOIN usuarios v ON v.id = p.id_vendedor
  LEFT JOIN imagenes img ON img.id_producto = p.id AND img.es_principal = TRUE
`;

export async function search({ q, categoriaId, precioMin, precioMax, disponible, destacados, limit, incluirInactivos }) {
  const where = [];
  const params = [];

  if (!incluirInactivos) {
    where.push(`p.estado = 'activo'`);
  }

  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`);
  }
  if (categoriaId) {
    params.push(categoriaId);
    where.push(`p.id_categoria = $${params.length}`);
  }
  if (precioMin !== undefined && precioMin !== '') {
    params.push(precioMin);
    where.push(`p.precio >= $${params.length}`);
  }
  if (precioMax !== undefined && precioMax !== '') {
    params.push(precioMax);
    where.push(`p.precio <= $${params.length}`);
  }
  if (disponible === 'true') {
    where.push('p.existencia > 0');
  }

  const sql =
    `${PRODUCTO_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ` +
    (destacados === 'true' ? 'ORDER BY RANDOM() ' : 'ORDER BY p.fecha_registro DESC, p.id DESC ') +
    `LIMIT ${Number(limit) || 100}`;

  const { rows } = await query(sql, params);
  return rows.map((r) => ({ ...r, precio: Number(r.precio) }));
}

export async function findById(id) {
  const { rows } = await query(`${PRODUCTO_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] ? { ...rows[0], precio: Number(rows[0].precio) } : null;
}

export async function findImagesByProductId(idProducto) {
  const { rows } = await query(
    `SELECT id, google_drive_id, url, nombre_archivo, es_principal
     FROM imagenes
     WHERE id_producto = $1
     ORDER BY es_principal DESC, id`,
    [idProducto],
  );
  return rows;
}

export async function create({ idVendedor, datos }) {
  const { nombre, descripcion, precio, existencia, idCategoria } = datos;
  const { rows } = await query(
    `INSERT INTO productos (id_vendedor, id_categoria, nombre, descripcion, precio, existencia)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [idVendedor, idCategoria, nombre, descripcion, precio, existencia],
  );
  return rows[0];
}

export async function update(id, datos) {
  const { nombre, descripcion, precio, existencia, idCategoria } = datos;
  const { rows } = await query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio = $3, existencia = $4, id_categoria = $5
     WHERE id = $6
     RETURNING id`,
    [nombre, descripcion, precio, existencia, idCategoria, id],
  );
  return rows[0] || null;
}

export async function setEstado(id, estado) {
  const { rows } = await query(
    `UPDATE productos SET estado = $1 WHERE id = $2 RETURNING id`,
    [estado, id],
  );
  return rows[0] || null;
}

export async function setImagenPrincipal(idProducto, imagen) {
  const { google_drive_id, url, nombre_archivo } = imagen;
  const { rows } = await query(
    `INSERT INTO imagenes (id_producto, google_drive_id, url, nombre_archivo, es_principal)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id`,
    [idProducto, google_drive_id, url, nombre_archivo],
  );
  return rows[0];
}
