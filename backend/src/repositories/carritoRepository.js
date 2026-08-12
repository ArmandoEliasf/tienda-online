import { query } from '../config/db.js';

const CARRITO_SELECT = `
  SELECT c.id AS carrito_id, c.estado AS carrito_estado,
         dc.id AS linea_id, dc.cantidad, dc.precio_unitario,
         p.id AS id_producto, p.nombre, p.existencia, p.estado AS producto_estado,
         img.url AS imagen_url
  FROM carrito c
  JOIN detalle_carrito dc ON dc.id_carrito = c.id
  JOIN productos p ON p.id = dc.id_producto
  LEFT JOIN imagenes img ON img.id_producto = p.id AND img.es_principal = TRUE
`;

export async function findActivoByUsuario(idUsuario) {
  const { rows } = await query(
    `SELECT id FROM carrito WHERE id_usuario = $1 AND estado = 'activo'`,
    [idUsuario],
  );
  return rows[0] || null;
}

export async function createActivo(idUsuario) {
  const { rows } = await query(
    `INSERT INTO carrito (id_usuario) VALUES ($1) RETURNING id`,
    [idUsuario],
  );
  return rows[0];
}

export async function getLines(idCarrito) {
  const { rows } = await query(`${CARRITO_SELECT} WHERE c.id = $1`, [idCarrito]);
  return rows.map((r) => ({
    id: r.linea_id,
    id_producto: r.id_producto,
    nombre: r.nombre,
    precio: Number(r.precio_unitario),
    cantidad: r.cantidad,
    existencia: r.existencia,
    imagen_url: r.imagen_url,
    subtotal: Number(r.precio_unitario) * r.cantidad,
  }));
}

export async function findLine(idCarrito, idProducto) {
  const { rows } = await query(
    `SELECT id, cantidad FROM detalle_carrito
     WHERE id_carrito = $1 AND id_producto = $2`,
    [idCarrito, idProducto],
  );
  return rows[0] || null;
}

export async function findLineById(idLinea, idCarrito) {
  const { rows } = await query(
    `SELECT id, cantidad, id_producto FROM detalle_carrito
     WHERE id = $1 AND id_carrito = $2`,
    [idLinea, idCarrito],
  );
  return rows[0] || null;
}

export async function addLine(idCarrito, idProducto, cantidad, precio) {
  const { rows } = await query(
    `INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [idCarrito, idProducto, cantidad, precio],
  );
  return rows[0];
}

export async function updateLine(idLinea, idCarrito, cantidad) {
  await query(
    `UPDATE detalle_carrito SET cantidad = $1 WHERE id = $2 AND id_carrito = $3`,
    [cantidad, idLinea, idCarrito],
  );
}

export async function removeLine(idLinea, idCarrito) {
  await query(
    `DELETE FROM detalle_carrito WHERE id = $1 AND id_carrito = $2`,
    [idLinea, idCarrito],
  );
}

export async function clearLines(idCarrito) {
  await query(`DELETE FROM detalle_carrito WHERE id_carrito = $1`, [idCarrito]);
}

export async function markConverted(idCarrito) {
  await query(`UPDATE carrito SET estado = 'convertido' WHERE id = $1`, [idCarrito]);
}
