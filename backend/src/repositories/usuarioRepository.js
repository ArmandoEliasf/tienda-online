import { query } from '../config/db.js';

export async function findByEmail(email) {
  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email, u.telefono, u.password_hash, u.estado, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.id_rol
     WHERE u.email = $1`,
    [email],
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email, u.telefono, u.estado, u.fecha_registro, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.id_rol
     WHERE u.id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function create({ nombre, email, telefono, passwordHash, rol }) {
  const { rows } = await query(
    `INSERT INTO usuarios (id_rol, nombre, email, telefono, password_hash)
     VALUES ((SELECT id FROM roles WHERE nombre = $1), $2, $3, $4, $5)
     RETURNING id, nombre, email, telefono, fecha_registro`,
    [rol, nombre, email, telefono, passwordHash],
  );
  return rows[0];
}

export async function list() {
  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email, u.telefono, u.estado, u.fecha_registro, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.id_rol
     ORDER BY u.id`,
  );
  return rows;
}
