import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as pedidoService from '../services/pedidos.js'
import { formatPrice } from '../utils/format.js'
import { ClaseEstado, EtiquetaEstado } from '../utils/estadoPedido.js'
import { ProductImage } from '../components/ui/ProductImage.jsx'

function PedidoDetalle() {
  const { id } = useParams()
  const { sesion } = useAuth()
  const token = sesion?.token
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setCargando(false)
      return
    }
    pedidoService
      .getPedido(id, token)
      .then(setPedido)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [id, token])

  if (!sesion) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Inicia sesión para ver tu pedido</h1>
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </section>
    )
  }

  if (cargando) {
    return (
      <section className="py-5">
        <div className="container text-center text-muted">Cargando pedido...</div>
      </section>
    )
  }

  if (error || !pedido) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <p className="text-muted">{error || 'Pedido no encontrado'}</p>
          <Link className="btn btn-outline-primary" to="/pedidos">
            Volver a mis pedidos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4">
      <div className="container">
        <nav className="mb-3">
          <Link to="/pedidos" className="small">
            ← Mis pedidos
          </Link>
        </nav>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
          <h1 className="h4 mb-0">{pedido.numero_pedido}</h1>
          <span className={`badge ${ClaseEstado(pedido.estado)}`}>{EtiquetaEstado(pedido.estado)}</span>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Productos</h2>
                {pedido.lineas.map((l) => (
                  <div className="d-flex align-items-center gap-2 mb-3" key={l.id}>
                    <ProductImage
                      src={l.imagen_url}
                      alt={l.producto}
                      className="rounded"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{l.producto}</div>
                      <div className="small text-muted">
                        {l.cantidad} × {formatPrice(l.precio_unitario)}
                      </div>
                    </div>
                    <div className="fw-semibold">{formatPrice(l.subtotal)}</div>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(pedido.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(pedido.total)}</span>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Seguimiento</h2>
                <ul className="list-unstyled mb-0">
                  {pedido.historial.map((h, i) => (
                    <li key={i} className="d-flex gap-3 mb-2">
                      <span className="text-muted">
                        {new Date(h.fecha_cambio).toLocaleString('es-MX')}
                      </span>
                      <div>
                        <span className={`badge ${ClaseEstado(h.estado_nuevo)}`}>
                          {EtiquetaEstado(h.estado_nuevo)}
                        </span>
                        {h.observacion && (
                          <div className="small text-muted">{h.observacion}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Dirección de envío</h2>
                <p className="mb-1 fw-semibold">{pedido.direccion.nombre}</p>
                <p className="text-muted small mb-0">
                  {pedido.direccion.calle} {pedido.direccion.numero}, {pedido.direccion.colonia}
                  <br />
                  {pedido.direccion.municipio}, {pedido.direccion.estado}, {pedido.direccion.pais}
                  <br />
                  C.P. {pedido.direccion.codigo_postal}
                </p>
                <p className="text-muted small mt-3 mb-0">
                  Pedido creado el {new Date(pedido.fecha_pedido).toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PedidoDetalle
