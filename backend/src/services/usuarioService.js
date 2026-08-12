import * as repo from '../repositories/usuarioRepository.js';
import { publicUser } from './authService.js';

export async function list() {
  const usuarios = await repo.list();
  return usuarios.map(publicUser);
}
