import { query } from '../config/db.js';

export async function listByUsuario(idUsuario) {
  const { rows } = await query(
    `SELECT id, nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais, es_principal
     FROM direcciones
     WHERE id_usuario = $1
     ORDER BY es_principal DESC, id`,
    [idUsuario],
  );
  return rows;
}

export async function findOwnedById(id, idUsuario) {
  const { rows } = await query(
    `SELECT id, nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais, es_principal
     FROM direcciones
     WHERE id = $1 AND id_usuario = $2`,
    [id, idUsuario],
  );
  return rows[0] || null;
}

export async function create({ idUsuario, datos }) {
  const { nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais, es_principal } = datos;
  const { rows } = await query(
    `INSERT INTO direcciones
       (id_usuario, nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais, es_principal)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [idUsuario, nombre, calle, numero, colonia, codigo_postal, municipio, estado, pais || 'México', es_principal || false],
  );
  return rows[0];
}

export async function remove(id) {
  await query(`DELETE FROM direcciones WHERE id = $1`, [id]);
}
