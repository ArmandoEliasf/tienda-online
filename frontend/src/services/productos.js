import { productosMock } from '../data/productosMock.js'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const activos = () => productosMock.filter((p) => p.estado === 'activo')

export async function listProductos({ q, categoria, precioMin, precioMax, disponible } = {}) {
  await delay()
  let result = activos()

  if (q) {
    const term = q.toLowerCase()
    result = result.filter(
      (p) => p.nombre.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term),
    )
  }
  if (categoria) {
    result = result.filter((p) => p.id_categoria === Number(categoria))
  }
  if (precioMin) {
    result = result.filter((p) => p.precio >= Number(precioMin))
  }
  if (precioMax) {
    result = result.filter((p) => p.precio <= Number(precioMax))
  }
  if (disponible) {
    result = result.filter((p) => p.existencia > 0)
  }

  return result
}

export async function getProducto(id) {
  await delay()
  const producto = productosMock.find((p) => p.id === Number(id))
  if (!producto) {
    throw new Error('Producto no encontrado')
  }
  return { ...producto }
}

export async function getDestacados() {
  await delay()
  return [...activos()].sort(() => Math.random() - 0.5).slice(0, 8)
}
