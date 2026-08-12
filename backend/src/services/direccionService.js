import * as repo from '../repositories/direccionRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function list(idUsuario) {
  return repo.listByUsuario(idUsuario);
}

export async function create(idUsuario, datos) {
  return repo.create({ idUsuario, datos });
}

export async function remove(idUsuario, id) {
  const direccion = await repo.findOwnedById(id, idUsuario);
  if (!direccion) throw new ApiError(404, 'Dirección no encontrada');
  await repo.remove(id);
  return { ok: true };
}
