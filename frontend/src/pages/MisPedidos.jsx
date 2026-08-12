import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as pedidoService from '../services/pedidos.js'
import { formatPrice } from '../utils/format.js'
import { ClaseEstado, EtiquetaEstado } from '../utils/estadoPedido.js'

function MisPedidos() {
  const { sesion } = useAuth()
  const token = sesion?.token
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setCargando(false)
      return
    }
    pedidoService
      .listMisPedidos(token)
      .then(setPedidos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [token])

  if (!sesion) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Inicia sesión para ver tus pedidos</h1>
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Mis pedidos</h1>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {cargando ? (
          <p className="text-muted">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">Todavía no tienes pedidos.</p>
            <Link className="btn btn-primary" to="/productos">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="row row-cols-1 g-3">
            {pedidos.map((p) => (
              <div className="col" key={p.id}>
                <div className="card shadow-sm">
                  <div className="card-body d-flex flex-wrap align-items-center gap-2">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{p.numero_pedido}</div>
                      <div className="small text-muted">
                        {new Date(p.fecha_pedido).toLocaleDateString('es-MX')} · {formatPrice(p.total)}
                      </div>
                    </div>
                    <span className={`badge ${ClaseEstado(p.estado)}`}>
                      {EtiquetaEstado(p.estado)}
                    </span>
                    <Link className="btn btn-sm btn-outline-primary" to={`/pedidos/${p.id}`}>
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default MisPedidos
