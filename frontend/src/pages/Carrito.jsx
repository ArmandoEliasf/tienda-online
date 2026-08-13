import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../utils/format.js'
import { ProductImage } from '../components/ui/ProductImage.jsx'

function Carrito() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount, error, clearError } = useCart()
  const { sesion } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Tu carrito está vacío</h1>
          <p className="text-muted mb-4">Explora el catálogo y agrega tus primeros productos.</p>
          <Link className="btn btn-primary" to="/productos">
            Ir al catálogo
          </Link>
        </div>
      </section>
    )
  }

  const envio = subtotal >= 1000 ? 0 : 150

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Carrito de compras</h1>
        {error && (
          <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button className="btn-close" onClick={clearError} aria-label="Cerrar"></button>
          </div>
        )}
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProductImage
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="rounded"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold">{item.nombre}</div>
                            <div className="small text-muted">
                              {formatPrice(item.precio)} c/u
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="input-group input-group-sm mx-auto" style={{ maxWidth: '110px' }}>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            −
                          </button>
                          <span className="input-group-text">{item.cantidad}</span>
                          <button
                            className="btn btn-outline-secondary"
                            disabled={item.cantidad >= (item.existencia ?? Infinity)}
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                        {item.cantidad >= (item.existencia ?? Infinity) && (
                          <div className="small text-warning mt-1">Límite de stock</div>
                        )}
                      </td>
                      <td className="text-end">{formatPrice(item.precio)}</td>
                      <td className="text-end fw-semibold">
                        {formatPrice(item.precio * item.cantidad)}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-link btn-sm mt-3" onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 fw-bold">Resumen</h2>
                <div className="d-flex justify-content-between small">
                  <span>Productos ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>Envío</span>
                  <span>{envio === 0 ? 'Gratis' : formatPrice(envio)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(subtotal + envio)}</span>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Envío gratis en compras mayores a $1,000 MXN. El pago se confirmará al generar el
                  pedido (simulado).
                </p>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => navigate(sesion ? '/checkout' : '/login')}
                >
                  {sesion ? 'Ir a pagar' : 'Inicia sesión para pagar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Carrito
