import * as repo from '../repositories/usuarioRepository.js';
import { publicUser } from './authService.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function list() {
  const usuarios = await repo.list();
  return usuarios.map(publicUser);
}

export async function setEstado(id, estado, adminId) {
  if (Number(id) === Number(adminId)) {
    throw new ApiError(400, 'No puedes desactivar tu propia cuenta');
  }
  const usuario = await repo.setEstado(id, estado);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  return publicUser(usuario);
}
