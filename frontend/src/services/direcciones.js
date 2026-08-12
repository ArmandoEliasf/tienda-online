import { api } from './api.js'

export async function listDirecciones(token) {
  const { direcciones } = await api.get('/direcciones', token)
  return direcciones
}

export async function crearDireccion(datos, token) {
  const { direccion } = await api.post('/direcciones', datos, token)
  return direccion
}

export async function eliminarDireccion(id, token) {
  return api.delete(`/direcciones/${id}`, token)
}
