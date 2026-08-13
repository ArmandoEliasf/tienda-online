import * as carritoRepo from '../repositories/carritoRepository.js';
import * as productoRepo from '../repositories/productoRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function getCarrito(idUsuario) {
  const carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (!carrito) return { lineas: [], total: 0 };
  const lineas = await carritoRepo.getLines(carrito.id);
  const total = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);
  return { lineas, total };
}

export async function addProducto(idUsuario, { idProducto, cantidad }) {
  const producto = await productoRepo.findById(idProducto);
  if (!producto || producto.estado !== 'activo') throw new ApiError(404, 'Producto no encontrado');
  if (producto.id_vendedor === idUsuario) {
    throw new ApiError(400, 'No puedes comprar tus propios productos');
  }
  if (cantidad > producto.existencia) {
    throw new ApiError(400, `Solo hay ${producto.existencia} disponible(s)`);
  }

  let carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (!carrito) carrito = await carritoRepo.createActivo(idUsuario);

  const linea = await carritoRepo.findLine(carrito.id, idProducto);
  const nuevaCantidad = (linea?.cantidad || 0) + cantidad;
  if (nuevaCantidad > producto.existencia) {
    throw new ApiError(400, `Solo hay ${producto.existencia} disponible(s)`);
  }

  if (linea) {
    await carritoRepo.updateLine(linea.id, carrito.id, nuevaCantidad);
  } else {
    await carritoRepo.addLine(carrito.id, idProducto, cantidad, producto.precio);
  }
  return getCarrito(idUsuario);
}

export async function updateCantidad(idUsuario, idLinea, cantidad) {
  if (cantidad <= 0) throw new ApiError(400, 'La cantidad debe ser mayor a 0');
  const carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError(404, 'Carrito no encontrado');
  const linea = await carritoRepo.findLineById(idLinea, carrito.id);
  if (!linea) throw new ApiError(404, 'Línea no encontrada');

  const producto = await productoRepo.findById(linea.id_producto);
  if (cantidad > producto.existencia) {
    throw new ApiError(400, `Solo hay ${producto.existencia} disponible(s)`);
  }
  await carritoRepo.updateLine(idLinea, carrito.id, cantidad);
  return getCarrito(idUsuario);
}

export async function removeProducto(idUsuario, idLinea) {
  const carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (!carrito) throw new ApiError(404, 'Carrito no encontrado');
  await carritoRepo.removeLine(idLinea, carrito.id);
  return getCarrito(idUsuario);
}

export async function clearCarrito(idUsuario) {
  const carrito = await carritoRepo.findActivoByUsuario(idUsuario);
  if (carrito) await carritoRepo.clearLines(carrito.id);
  return { lineas: [], total: 0 };
}
