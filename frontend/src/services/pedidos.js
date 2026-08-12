import { api } from './api.js'

export async function crearPedido(idDireccion, token) {
  const { pedido } = await api.post('/pedidos', { idDireccion }, token)
  return pedido
}

export async function listMisPedidos(token) {
  const { pedidos } = await api.get('/pedidos/mios', token)
  return pedidos
}

export async function getPedido(id, token) {
  const { pedido } = await api.get(`/pedidos/${id}`, token)
  return pedido
}
