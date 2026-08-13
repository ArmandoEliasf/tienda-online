import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProductos } from '../services/productos.js'
import { listCategorias } from '../services/categorias.js'
import ProductCard from '../components/product/ProductCard.jsx'
import ProductFilters from '../components/product/ProductFilters.jsx'
import { useCart } from '../context/CartContext.jsx'

const VALIDOS = ['q', 'categoria', 'precioMin', 'precioMax', 'disponible']

function Productos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const { addItem, error, clearError } = useCart()

  const filtros = useMemo(() => {
    const out = {}
    for (const k of VALIDOS) {
      const v = searchParams.get(k)
      if (v) out[k] = v
    }
    return out
  }, [searchParams])

  useEffect(() => {
    listCategorias().then(setCategorias)
  }, [])

  useEffect(() => {
    setCargando(true)
    listProductos(filtros)
      .then(setProductos)
      .catch((err) => setProductos([]))
      .finally(() => setCargando(false))
  }, [filtros])

  const aplicarFiltros = (nuevos) => {
    const params = {}
    for (const k of VALIDOS) {
      if (nuevos[k]) params[k] = nuevos[k]
    }
    setSearchParams(params)
  }

  const limpiarFiltros = () => setSearchParams({})

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Catálogo de productos</h1>
        <div className="row">
          <div className="col-lg-3 mb-4">
            <ProductFilters
              categorias={categorias}
              filtros={filtros}
              onChange={aplicarFiltros}
              onClear={limpiarFiltros}
            />
          </div>
          <div className="col-lg-9">
            {error && (
              <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button className="btn-close" onClick={clearError} aria-label="Cerrar"></button>
              </div>
            )}
            {cargando ? (
              <p className="text-muted">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No se encontraron productos con esos filtros.</p>
                <button className="btn btn-outline-primary" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <p className="text-muted small mb-3">{productos.length} producto(s) encontrados</p>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                  {productos.map((p) => (
                    <div className="col" key={p.id}>
                      <ProductCard producto={p} onAdd={() => addItem(p)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Productos
