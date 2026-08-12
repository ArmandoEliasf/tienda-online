import * as repo from '../repositories/categoriaRepository.js';
import { query } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function list() {
  return repo.listActivas();
}

export async function listAdmin() {
  const { rows } = await query(
    `SELECT id, nombre, descripcion, estado FROM categorias ORDER BY nombre`,
  );
  return rows;
}

export async function create({ nombre, descripcion }) {
  const existe = await repo.findByName(nombre);
  if (existe) throw new ApiError(409, 'Ya existe una categoría con ese nombre');
  return repo.create({ nombre, descripcion });
}

export async function update(id, { nombre, descripcion }) {
  const actualizada = await repo.update(id, { nombre, descripcion });
  if (!actualizada) throw new ApiError(404, 'Categoría no encontrada');
  return actualizada;
}

export async function setEstado(id, estado) {
  const actualizada = await repo.setEstado(id, estado);
  if (!actualizada) throw new ApiError(404, 'Categoría no encontrada');
  return repo.findById(id);
}
