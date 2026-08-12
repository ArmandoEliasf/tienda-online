import * as carritoService from '../services/carritoService.js';

export async function get(req, res, next) {
  try {
    const carrito = await carritoService.getCarrito(req.user.id);
    res.json(carrito);
  } catch (err) {
    next(err);
  }
}

export async function add(req, res, next) {
  try {
    const carrito = await carritoService.addProducto(req.user.id, req.body);
    res.json(carrito);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const carrito = await carritoService.updateCantidad(req.user.id, req.params.idLinea, req.body.cantidad);
    res.json(carrito);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const carrito = await carritoService.removeProducto(req.user.id, req.params.idLinea);
    res.json(carrito);
  } catch (err) {
    next(err);
  }
}

export async function clear(req, res, next) {
  try {
    const carrito = await carritoService.clearCarrito(req.user.id);
    res.json(carrito);
  } catch (err) {
    next(err);
  }
}
