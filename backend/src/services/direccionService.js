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

export async function consultarCodigoPostal(cp) {
  if (!/^\d{5}$/.test(cp)) {
    throw new ApiError(400, 'El código postal debe tener 5 dígitos');
  }

  const token = process.env.POSTALIA_TOKEN;
  if (!token) {
    throw new ApiError(503, 'El servicio de códigos postales no está configurado');
  }

  const res = await fetch(`https://postalia.com.mx/api/codigos-postales/${cp}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });

  const data = await res.json().catch(() => null);
  if (!data) {
    throw new ApiError(502, 'No se pudo consultar el código postal');
  }

  if (!data.estado) {
    throw new ApiError(404, data.mensaje || 'No se encontró el código postal');
  }
  if (!res.ok) {
    throw new ApiError(502, data.mensaje || 'No se pudo consultar el código postal');
  }

  return data;
}
