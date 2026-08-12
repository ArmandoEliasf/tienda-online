import { api } from './api.js'

export async function listCategorias() {
  const { categorias } = await api.get('/categorias')
  return categorias
}
