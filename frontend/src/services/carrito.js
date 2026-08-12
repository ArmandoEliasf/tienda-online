import { api } from './api.js'

export async function getCarrito(token) {
  return api.get('/carrito', token)
}

export async function addProducto(idProducto, cantidad, token) {
  return api.post('/carrito/productos', { idProducto, cantidad }, token)
}

export async function updateCantidad(idLinea, cantidad, token) {
  return api.patch(`/carrito/lineas/${idLinea}`, { cantidad }, token)
}

export async function removeProducto(idLinea, token) {
  return api.delete(`/carrito/lineas/${idLinea}`, token)
}

export async function clearCarrito(token) {
  return api.delete('/carrito', token)
}
