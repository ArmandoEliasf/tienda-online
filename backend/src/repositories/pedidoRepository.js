import { pool, query } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function createFromCarrito({ numeroPedido, idUsuario, idDireccion, carritoId, lineas }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = lineas.map((l) => l.idProducto);
    const { rows: bloqueados } = await client.query(
      `SELECT id, precio, existencia, estado, id_vendedor FROM productos WHERE id = ANY($1::int[]) FOR UPDATE`,
      [ids],
    );
    const mapa = new Map(bloqueados.map((p) => [p.id, p]));

    let subtotal = 0;
    for (const linea of lineas) {
      const producto = mapa.get(linea.idProducto);
      if (!producto || producto.estado !== 'activo') {
        throw new ApiError(400, 'Uno o más productos ya no están disponibles');
      }
      if (producto.id_vendedor === idUsuario) {
        throw new ApiError(400, 'Un pedido no puede incluir productos tuyos');
      }
      if (linea.cantidad > producto.existencia) {
        throw new ApiError(400, `Stock insuficiente: de ${linea.idProducto} quedan ${producto.existencia}`);
      }
      subtotal += Number(producto.precio) * linea.cantidad;
    }

    const { rows: [pedido] } = await client.query(
      `INSERT INTO pedidos (numero_pedido, id_usuario, id_direccion, subtotal, total)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING id, numero_pedido, fecha_pedido, estado, subtotal, total`,
      [numeroPedido, idUsuario, idDireccion, subtotal],
    );

    for (const linea of lineas) {
      const producto = mapa.get(linea.idProducto);
      await client.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, linea.idProducto, linea.cantidad, producto.precio],
      );
      await client.query(
        `UPDATE productos SET existencia = existencia - $1 WHERE id = $2`,
        [linea.cantidad, linea.idProducto],
      );
    }

    await client.query(`UPDATE carrito SET estado = 'convertido' WHERE id = $1`, [carritoId]);
    await client.query('COMMIT');
    return pedido;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findByUsuario(idUsuario) {
  const { rows } = await query(
    `SELECT pe.id, pe.numero_pedido, pe.fecha_pedido, pe.subtotal, pe.total, pe.estado
     FROM pedidos pe
     WHERE pe.id_usuario = $1
     ORDER BY pe.fecha_pedido DESC`,
    [idUsuario],
  );
  return rows.map((r) => ({ ...r, subtotal: Number(r.subtotal), total: Number(r.total) }));
}

export async function findAll({ estado } = {}) {
  const params = [];
  let where = '';
  if (estado) {
    params.push(estado);
    where = `WHERE pe.estado = $1`;
  }
  const { rows } = await query(
    `SELECT pe.id, pe.numero_pedido, pe.fecha_pedido, pe.subtotal, pe.total, pe.estado,
            u.nombre AS cliente, u.email AS email_cliente,
            d.nombre AS destinatario, d.estado AS estado_direccion, d.municipio, d.codigo_postal
     FROM pedidos pe
     JOIN usuarios u ON u.id = pe.id_usuario
     JOIN direcciones d ON d.id = pe.id_direccion
     ${where}
     ORDER BY pe.fecha_pedido DESC`,
    params,
  );
  return rows.map((r) => ({ ...r, subtotal: Number(r.subtotal), total: Number(r.total) }));
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT pe.id, pe.numero_pedido, pe.fecha_pedido, pe.subtotal, pe.total, pe.estado,
            u.id AS id_usuario, u.nombre AS cliente,
            d.id AS id_direccion, d.nombre AS destinatario, d.calle, d.numero, d.colonia,
            d.codigo_postal, d.municipio, d.estado AS estado_direccion, d.pais
     FROM pedidos pe
     JOIN usuarios u ON u.id = pe.id_usuario
     JOIN direcciones d ON d.id = pe.id_direccion
     WHERE pe.id = $1`,
    [id],
  );
  const pedido = rows[0];
  if (!pedido) return null;

  const { rows: lineas } = await query(
    `SELECT dp.id, dp.cantidad, dp.precio_unitario, dp.subtotal,
            p.nombre AS producto, p.id AS id_producto, img.url AS imagen_url
     FROM detalle_pedido dp
     JOIN productos p ON p.id = dp.id_producto
     LEFT JOIN imagenes img ON img.id_producto = p.id AND img.es_principal = TRUE
     WHERE dp.id_pedido = $1
     ORDER BY dp.id`,
    [id],
  );

  const { rows: historial } = await query(
    `SELECT hp.estado_anterior, hp.estado_nuevo, hp.observacion, hp.fecha_cambio
     FROM historial_pedido hp
     WHERE hp.id_pedido = $1
     ORDER BY hp.fecha_cambio, hp.id`,
    [id],
  );

  return {
    id: pedido.id,
    numero_pedido: pedido.numero_pedido,
    fecha_pedido: pedido.fecha_pedido,
    subtotal: Number(pedido.subtotal),
    total: Number(pedido.total),
    estado: pedido.estado,
    cliente: { id: pedido.id_usuario, nombre: pedido.cliente },
    direccion: {
      id: pedido.id_direccion,
      nombre: pedido.destinatario,
      calle: pedido.calle,
      numero: pedido.numero,
      colonia: pedido.colonia,
      codigo_postal: pedido.codigo_postal,
      municipio: pedido.municipio,
      estado: pedido.estado_direccion,
      pais: pedido.pais,
    },
    lineas: lineas.map((l) => ({
      id: l.id,
      id_producto: l.id_producto,
      producto: l.producto,
      cantidad: l.cantidad,
      precio_unitario: Number(l.precio_unitario),
      subtotal: Number(l.subtotal),
      imagen_url: l.imagen_url,
    })),
    historial,
  };
}

export async function updateEstado(id, estado, idUsuario, observacion) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [anterior] } = await client.query(
      `SELECT estado FROM pedidos WHERE id = $1 FOR UPDATE`,
      [id],
    );
    if (!anterior) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query(`UPDATE pedidos SET estado = $1 WHERE id = $2`, [estado, id]);
    await client.query(
      `INSERT INTO historial_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario, observacion)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, anterior.estado, estado, idUsuario, observacion],
    );
    await client.query('COMMIT');
    return { estado };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
