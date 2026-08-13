import * as repo from '../repositories/productoRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function list({ q, categoria, precioMin, precioMax, disponible, incluirInactivos = false, idVendedor }) {
  return repo.search({ q, categoriaId: categoria, precioMin, precioMax, disponible, incluirInactivos, idVendedor });
}

export async function listDestacados(limit = 8) {
  return repo.search({ destacados: 'true', limit });
}

export async function getById(id) {
  const producto = await repo.findById(id);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  const imagenes = await repo.findImagesByProductId(id);
  return { ...producto, imagenes };
}

export async function create(idVendedor, datos, imagen) {
  const { id } = await repo.create({ idVendedor, datos });
  if (imagen) {
    await repo.setImagenPrincipal(id, imagen);
  }
  return getById(id);
}

async function verificarPropiedad(user, id) {
  if (user.rol === 'administrador') return;
  const producto = await repo.findById(id);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  if (producto.id_vendedor !== user.id) {
    throw new ApiError(403, 'Solo puedes editar tus propios productos');
  }
}

export async function update(user, id, datos, imagen) {
  await verificarPropiedad(user, id);
  const actualizado = await repo.update(id, datos);
  if (!actualizado) throw new ApiError(404, 'Producto no encontrado');
  if (imagen) {
    await repo.setImagenPrincipal(id, imagen);
  }
  return getById(id);
}

export async function setEstado(user, id, estado) {
  await verificarPropiedad(user, id);
  const actualizado = await repo.setEstado(id, estado);
  if (!actualizado) throw new ApiError(404, 'Producto no encontrado');
  return getById(id);
}
