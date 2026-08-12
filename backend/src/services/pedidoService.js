import * as pedidoRepo from '../repositories/pedidoRepository.js';
import * as carritoRepo from '../repositories/carritoRepository.js';
import * as direccionRepo from '../repositories/direccionRepository.js';
import { query } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

async function generarNumeroPedido() {
  const { rows } = await query(
    `SELECT 'TLJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('seq_numero_pedido')::text, 6, '0') AS numero`,
  );
  return rows[0].numero;
}

export async function create(idUsuario, { idDireccion }) {
  const direccion = await direccionRepo.findOwnedById(idDireccion, idUsuario);
  if (!direccion) throw new ApiError(404, 'Dirección no encontrada');

  const carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError(400, 'El carrito está vacío');
  const lineas = await carritoRepo.getLines(carrito.id);
  if (lineas.length === 0) throw new ApiError(400, 'El carrito está vacío');

  const numeroPedido = await generarNumeroPedido();
  const pedido = await pedidoRepo.createFromCarrito({
    numeroPedido,
    idUsuario,
    idDireccion,
    carritoId: carrito.id,
    lineas: lineas.map((l) => ({ idProducto: l.id_producto, cantidad: l.cantidad })),
  });
  return pedido;
}

export async function listMios(idUsuario) {
  return pedidoRepo.findByUsuario(idUsuario);
}

export async function getMio(idUsuario, id) {
  const pedido = await pedidoRepo.findById(id);
  if (!pedido) throw new ApiError(404, 'Pedido no encontrado');
  if (pedido.cliente.id !== idUsuario) throw new ApiError(403, 'Este pedido no te pertenece');
  return pedido;
}

export async function listAdmin({ estado } = {}) {
  return pedidoRepo.findAll({ estado });
}

export async function getAdmin(id) {
  const pedido = await pedidoRepo.findById(id);
  if (!pedido) throw new ApiError(404, 'Pedido no encontrado');
  return pedido;
}

export async function updateEstado(id, estado, idUsuario, observacion) {
  const pedido = await pedidoRepo.findById(id);
  if (!pedido) throw new ApiError(404, 'Pedido no encontrado');
  const actualizado = await pedidoRepo.updateEstado(id, estado, idUsuario, observacion);
  return pedidoRepo.findById(id);
}
