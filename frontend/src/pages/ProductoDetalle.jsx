import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProducto } from '../services/productos.js'
import { ProductImage } from '../components/ui/ProductImage.jsx'
import { formatPrice } from '../utils/format.js'
import { useCart } from '../context/CartContext.jsx'

function ProductoDetalle() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [error, setError] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const { addItem, error: cartError, clearError } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getProducto(id)
      .then(setProducto)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <p className="text-muted">{error}</p>
          <Link className="btn btn-outline-primary" to="/productos">
            Volver al catálogo
          </Link>
        </div>
      </section>
    )
  }

  if (!producto) {
    return (
      <section className="py-5">
        <div className="container text-center text-muted">Cargando producto...</div>
      </section>
    )
  }

  const agotado = producto.existencia === 0

  const agregar = () => {
    addItem(producto, cantidad)
      .then(() => {
        setAgregado(true)
        setTimeout(() => setAgregado(false), 2500)
      })
      .catch(() => {})
  }

  return (
    <section className="py-4">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/productos">Catálogo</Link>
            </li>
            <li className="breadcrumb-item active">{producto.nombre}</li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <ProductImage
                src={producto.imagen_url}
                alt={producto.nombre}
                className="card-img-top rounded-3 producto-detalle-imagen"
              />
            </div>
          </div>
          <div className="col-md-6">
            <span className="badge bg-light text-dark mb-2">{producto.categoria}</span>
            <h1 className="h3">{producto.nombre}</h1>
            <p className="display-6 fw-bold text-primary">{formatPrice(producto.precio)}</p>

            <div className="mb-3">
              <span
                className={
                  agotado ? 'badge bg-secondary' : 'badge bg-success'
                }
              >
                {agotado ? 'Agotado' : `Disponible · ${producto.existencia} en existencia`}
              </span>
            </div>

            <p className="text-muted">{producto.descripcion}</p>

            {cartError && (
              <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center">
                <span>{cartError}</span>
                <button className="btn-close" onClick={clearError} aria-label="Cerrar"></button>
              </div>
            )}

            <div className="card mb-4 p-3 bg-light">
              <p className="small mb-0">
                <strong>Vendido por:</strong> {producto.vendedor}
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <label htmlFor="cantidad" className="form-label small mb-0">
                Cantidad
              </label>
              <input
                id="cantidad"
                type="number"
                min="1"
                max={producto.existencia || 1}
                className="form-control"
                style={{ maxWidth: '90px' }}
                value={cantidad}
                disabled={agotado}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    setCantidad(1)
                    return
                  }
                  const valor = Math.floor(Number(raw))
                  if (Number.isNaN(valor)) return
                  setCantidad(Math.min(Math.max(1, valor), producto.existencia))
                }}
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-lg" disabled={agotado} onClick={agregar}>
                {agotado ? 'Agotado' : 'Agregar al carrito'}
              </button>
              {agregado && (
                <button className="btn btn-success btn-lg" onClick={() => navigate('/carrito')}>
                  Ir al carrito
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductoDetalle
