import { useEffect, useState } from 'react'
import * as adminService from '../../services/admin.js'
import { formatPrice } from '../../utils/format.js'
import { ClaseEstado, EtiquetaEstado } from '../../utils/estadoPedido.js'

const ORDEN_FLUJO = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado']
const SIGUIENTE = {
  pendiente: 'confirmado',
  confirmado: 'preparando',
  preparando: 'enviado',
  enviado: 'entregado',
}

function PedidosAdmin({ token }) {
  const [pedidos, setPedidos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [avisos, setAvisos] = useState({})

  const cargar = () => {
    setCargando(true)
    adminService
      .listPedidosAdmin(token, filtro)
      .then((r) => setPedidos(r.pedidos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [token, filtro])

  const verDetalle = (id) => {
    adminService
      .getPedidoAdmin(id, token)
      .then((r) => setDetalle(r.pedido))
      .catch((err) => setError(err.message))
  }

  const cambiarEstado = (id, estado, observacion) => {
    adminService
      .setPedidoEstado(id, estado, observacion, token)
      .then(() => {
        setAvisos((prev) => ({ ...prev, [id]: 'Estado actualizado' }))
        setDetalle(null)
        cargar()
      })
      .catch((err) => setError(err.message))
  }

  const avanzar = (pedido) => {
    if (pedido.estado === 'cancelado' || pedido.estado === 'entregado') return
    const siguiente = SIGUIENTE[pedido.estado]
    if (!siguiente) return
    cambiarEstado(pedido.id, siguiente, 'Actualización automática del administrador')
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['', ...ORDEN_FLUJO, 'cancelado'].map((e) => (
          <button
            key={e || 'todos'}
            className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => {
              setFiltro(e)
              setDetalle(null)
            }}
          >
            {e ? EtiquetaEstado(e) : 'Todos'}
          </button>
        ))}
      </div>

      {detalle ? (
        <DetallePedido
          pedido={detalle}
          onAtras={() => setDetalle(null)}
          onCambiarEstado={(estado, obs) => cambiarEstado(detalle.id, estado, obs)}
          onAvanzar={() => avanzar(detalle)}
        />
      ) : cargando ? (
        <p className="text-muted">Cargando pedidos...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.numero_pedido}</td>
                  <td>
                    {p.cliente}
                    <div className="small text-muted">{p.email_cliente}</div>
                  </td>
                  <td className="small">{new Date(p.fecha_pedido).toLocaleString('es-MX')}</td>
                  <td>{formatPrice(p.total)}</td>
                  <td>
                    <span className={`badge ${ClaseEstado(p.estado)}`}>{EtiquetaEstado(p.estado)}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => verDetalle(p.id)}>
                      Ver
                    </button>
                    {p.estado !== 'cancelado' && p.estado !== 'entregado' && (
                      <button className="btn btn-sm btn-outline-success ms-1" onClick={() => avanzar(p)}>
                        Avanzar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pedidos.length === 0 && <p className="text-muted small">Sin pedidos para este filtro.</p>}
        </div>
      )}
      {avisos && Object.values(avisos).filter(Boolean).length > 0 && (
        <div className="alert alert-success py-2 small mt-3">
          {Object.values(avisos).filter(Boolean).join(' · ')}
        </div>
      )}
    </div>
  )
}

function DetallePedido({ pedido, onAtras, onCambiarEstado, onAvanzar }) {
  const [observacion, setObservacion] = useState('')

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <button className="btn btn-sm btn-link ps-0 mb-2" onClick={onAtras}>
          ← Volver a la lista
        </button>
        <div className="d-flex align-items-center gap-2 mb-3">
          <h3 className="h6 mb-0">{pedido.numero_pedido}</h3>
          <span className={`badge ${ClaseEstado(pedido.estado)}`}>{EtiquetaEstado(pedido.estado)}</span>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="small text-muted mb-1">Cliente</div>
            <div className="fw-semibold">{pedido.cliente.nombre}</div>
            <div className="small text-muted">
              {pedido.direccion.calle} {pedido.direccion.numero}, {pedido.direccion.colonia},{' '}
              {pedido.direccion.municipio}, {pedido.direccion.estado} · C.P.{' '}
              {pedido.direccion.codigo_postal}
            </div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted mb-1">Historial</div>
            {pedido.historial.map((h, i) => (
              <div key={i} className="small">
                <span className={`badge ${ClaseEstado(h.estado_nuevo)} me-1`}>
                  {EtiquetaEstado(h.estado_nuevo)}
                </span>
                {h.observacion}
                <span className="text-muted">
                  {' '}· {new Date(h.fecha_cambio).toLocaleString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <table className="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-end">Precio</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.lineas.map((l) => (
              <tr key={l.id}>
                <td>{l.producto}</td>
                <td className="text-center">{l.cantidad}</td>
                <td className="text-end">{formatPrice(l.precio_unitario)}</td>
                <td className="text-end">{formatPrice(l.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(pedido.total)}</span>
        </div>

        {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
          <div className="row g-2 mt-3">
            <div className="col-md-4">
              <select className="form-select form-select-sm" value="" onChange={(e) => e.target.value && onCambiarEstado(e.target.value, observacion)}>
                <option value="">Cambiar estado...</option>
                {ORDEN_FLUJO.filter((e) => e !== pedido.estado)
                  .concat(pedido.estado !== 'cancelado' ? ['cancelado'] : [])
                  .map((e) => (
                    <option key={e} value={e}>
                      {EtiquetaEstado(e)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="Observación"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-sm btn-success w-100" onClick={onAvanzar}>
                Avanzar estado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PedidosAdmin
