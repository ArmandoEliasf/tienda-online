import { api } from './api.js'

export async function listProductos({ q, categoria, precioMin, precioMax, disponible } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoria) params.set('categoria', categoria)
  if (precioMin) params.set('precioMin', precioMin)
  if (precioMax) params.set('precioMax', precioMax)
  if (disponible) params.set('disponible', 'true')

  const query = params.toString()
  const { productos } = await api.get(`/productos${query ? `?${query}` : ''}`)
  return productos
}

export async function getProducto(id) {
  const { producto } = await api.get(`/productos/${id}`)
  return producto
}

export async function getDestacados(limit = 8) {
  const { productos } = await api.get(`/productos/destacados?limit=${limit}`)
  return productos
}
