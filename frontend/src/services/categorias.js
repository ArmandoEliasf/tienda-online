import { categoriasMock } from '../data/productosMock.js'

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listCategorias() {
  await delay()
  return categoriasMock
}
