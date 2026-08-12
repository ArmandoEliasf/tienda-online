import { query } from '../config/db.js';

export async function listActivas() {
  const { rows } = await query(
    `SELECT id, nombre, descripcion
     FROM categorias
     WHERE estado = 'activo'
     ORDER BY nombre`,
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT id, nombre, descripcion, estado
     FROM categorias
     WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function findByName(nombre) {
  const { rows } = await query(
    `SELECT id FROM categorias WHERE nombre = $1`,
    [nombre],
  );
  return rows[0] || null;
}

export async function create({ nombre, descripcion }) {
  const { rows } = await query(
    `INSERT INTO categorias (nombre, descripcion)
     VALUES ($1, $2)
     RETURNING id, nombre, descripcion, estado`,
    [nombre, descripcion],
  );
  return rows[0];
}

export async function update(id, { nombre, descripcion }) {
  const { rows } = await query(
    `UPDATE categorias SET nombre = $1, descripcion = $2
     WHERE id = $3
     RETURNING id, nombre, descripcion, estado`,
    [nombre, descripcion, id],
  );
  return rows[0] || null;
}

export async function setEstado(id, estado) {
  const { rows } = await query(
    `UPDATE categorias SET estado = $1 WHERE id = $2 RETURNING id`,
    [estado, id],
  );
  return rows[0] || null;
}
