import { api } from './api.js'

export const listProductosAdmin = (token) =>
  api.get('/productos?incluirInactivos=true&limit=500', token)

export const crearProducto = (datos, token) => api.post('/productos', datos, token)
export const actualizarProducto = (id, datos, token) => api.put(`/productos/${id}`, datos, token)
export const setProductoEstado = (id, estado, token) =>
  api.patch(`/productos/${id}/estado`, { estado }, token)

export const listCategoriasAdmin = (token) => api.get('/productos/admin/categorias', token)
export const crearCategoria = (datos, token) => api.post('/categorias', datos, token)
export const actualizarCategoria = (id, datos, token) => api.put(`/categorias/${id}`, datos, token)
export const setCategoriaEstado = (id, estado, token) =>
  api.patch(`/categorias/${id}/estado`, { estado }, token)

export const listPedidosAdmin = (token, estado = '') =>
  api.get(`/pedidos/admin${estado ? `?estado=${estado}` : ''}`, token)

export const getPedidoAdmin = (id, token) => api.get(`/pedidos/admin/${id}`, token)

export const setPedidoEstado = (id, estado, observacion, token) =>
  api.patch(`/pedidos/admin/${id}/estado`, { estado, observacion }, token)

export const listUsuarios = (token) => api.get('/usuarios', token)
