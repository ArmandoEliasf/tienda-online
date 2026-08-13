import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import * as direccionService from '../services/direcciones.js'
import * as pedidoService from '../services/pedidos.js'
import { ESTADOS_MEXICO } from '../data/estadosMexico.js'
import { formatPrice } from '../utils/format.js'

function Checkout() {
  const { sesion } = useAuth()
  const { items, subtotal, itemCount, clearCart } = useCart()
  const navigate = useNavigate()
  const token = sesion?.token

  const [direcciones, setDirecciones] = useState([])
  const [idSeleccionada, setIdSeleccionada] = useState(null)
  const [nueva, setNueva] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    calle: '',
    numero: '',
    colonia: '',
    codigo_postal: '',
    municipio: '',
    estado: '',
    pais: 'México',
  })
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [buscandoCp, setBuscandoCp] = useState(false)
  const [cpError, setCpError] = useState(null)
  const [colonias, setColonias] = useState([])

  useEffect(() => {
    if (!token) {
      setCargando(false)
      return
    }
    direccionService
      .listDirecciones(token)
      .then((lista) => {
        setDirecciones(lista)
        if (lista.length > 0) setIdSeleccionada(lista[0].id)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [token])

  if (!sesion) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Inicia sesión para pagar</h1>
          <p className="text-muted mb-4">Necesitas una cuenta para generar tu pedido.</p>
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </section>
    )
  }

  if (items.length === 0 && !cargando) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Tu carrito está vacío</h1>
          <Link className="btn btn-primary" to="/productos">
            Ir al catálogo
          </Link>
        </div>
      </section>
    )
  }

  const envio = subtotal >= 1000 ? 0 : 150
  const total = subtotal + envio

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'codigo_postal') {
      setCpError(null)
      setColonias([])
    }
  }

  const buscarCodigoPostal = async () => {
    const cp = form.codigo_postal.trim()
    setCpError(null)
    setColonias([])
    if (cp.length !== 5) {
      setCpError('El código postal debe tener 5 dígitos')
      return
    }
    setBuscandoCp(true)
    try {
      const info = await direccionService.consultarCodigoPostal(cp, token)
      setForm((prev) => ({
        ...prev,
        municipio: info.municipio,
        colonia: info.colonias.length === 1 ? info.colonias[0].nombre : prev.colonia,
      }))
      if (info.colonias.length > 1) setColonias(info.colonias)
      const estado = ESTADOS_MEXICO.find((e) => e.toLowerCase() === info.estado.toLowerCase())
      if (estado) {
        setForm((prev) => ({ ...prev, estado }))
      } else {
        setCpError(`"${info.estado}" no está en el catálogo, selecciona el estado manualmente`)
      }
    } catch (err) {
      setCpError(err.message)
    } finally {
      setBuscandoCp(false)
    }
  }

  const guardarDireccion = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const direccion = await direccionService.crearDireccion(form, token)
      setDirecciones((prev) => [...prev, direccion])
      setIdSeleccionada(direccion.id)
      setNueva(false)
      setForm({ nombre: '', calle: '', numero: '', colonia: '', codigo_postal: '', municipio: '', estado: '' })
      setCpError(null)
      setColonias([])
    } catch (err) {
      setError(err.message)
    }
  }

  const confirmarPedido = async () => {
    if (!idSeleccionada) {
      setError('Selecciona o registra una dirección de envío')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const pedido = await pedidoService.crearPedido(idSeleccionada, token)
      clearCart()
      navigate(`/pedidos/${pedido.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Confirmar pedido</h1>
        <div className="row">
          <div className="col-lg-7">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Dirección de envío</h2>
                {cargando ? (
                  <p className="text-muted small mb-0">Cargando direcciones...</p>
                ) : (
                  <>
                    {direcciones.length > 0 && (
                      <div className="mb-3">
                        {direcciones.map((d) => (
                          <div className="form-check mb-2" key={d.id}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="direccion"
                              id={`dir-${d.id}`}
                              checked={idSeleccionada === d.id}
                              onChange={() => setIdSeleccionada(d.id)}
                            />
                            <label className="form-check-label" htmlFor={`dir-${d.id}`}>
                              <strong>{d.nombre}</strong> — {d.calle} {d.numero}, {d.colonia},{' '}
                              {d.municipio}, {d.estado} C.P. {d.codigo_postal}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setNueva(!nueva)}
                    >
                      {nueva ? 'Cancelar' : 'Agregar nueva dirección'}
                    </button>
                  </>
                )}

                {nueva && (
                  <form className="row g-3 mt-2" onSubmit={guardarDireccion}>
                    <div className="col-md-6">
                      <label className="form-label small">Nombre de la dirección</label>
                      <input
                        name="nombre"
                        className="form-control form-control-sm"
                        required
                        value={form.nombre}
                        onChange={cambiar}
                        placeholder="Casa, Trabajo..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Calle</label>
                      <input
                        name="calle"
                        className="form-control form-control-sm"
                        required
                        value={form.calle}
                        onChange={cambiar}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Número</label>
                      <input
                        name="numero"
                        className="form-control form-control-sm"
                        value={form.numero}
                        onChange={cambiar}
                      />
                    </div>
                    <div className="col-md-9">
                      <label className="form-label small">Colonia</label>
                      {colonias.length > 1 ? (
                        <select
                          name="colonia"
                          className="form-select form-select-sm"
                          required
                          value={form.colonia}
                          onChange={cambiar}
                        >
                          <option value="">Selecciona...</option>
                          {colonias.map((c) => (
                            <option key={c.nombre} value={c.nombre}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name="colonia"
                          className="form-control form-control-sm"
                          required
                          value={form.colonia}
                          onChange={cambiar}
                        />
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">C.P.</label>
                      <input
                        name="codigo_postal"
                        className="form-control form-control-sm"
                        required
                        maxLength="5"
                        inputMode="numeric"
                        value={form.codigo_postal}
                        onChange={cambiar}
                        onBlur={buscarCodigoPostal}
                        disabled={buscandoCp}
                      />
                      {buscandoCp ? (
                        <div className="form-text small">Consultando código postal...</div>
                      ) : (
                        cpError && <div className="text-danger small">{cpError}</div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small">Municipio / Alcaldía</label>
                      <input
                        name="municipio"
                        className="form-control form-control-sm"
                        required
                        value={form.municipio}
                        onChange={cambiar}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Estado</label>
                      <select
                        name="estado"
                        className="form-select form-select-sm"
                        required
                        value={form.estado}
                        onChange={cambiar}
                      >
                        <option value="">Selecciona...</option>
                        {ESTADOS_MEXICO.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">País</label>
                      <input
                        name="pais"
                        className="form-control form-control-sm"
                        value={form.pais}
                        onChange={cambiar}
                      />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-sm btn-success" type="submit">
                        Guardar dirección
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Resumen</h2>
                {items.map((item) => (
                  <div className="d-flex justify-content-between small mb-2" key={item.id}>
                    <span>
                      {item.nombre} × {item.cantidad}
                    </span>
                    <span>{formatPrice(item.precio * item.cantidad)}</span>
                  </div>
                ))}
                <hr />
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
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={confirmarPedido}
                  disabled={enviando}
                >
                  {enviando ? 'Generando pedido...' : 'Confirmar pedido'}
                </button>
                <p className="text-muted small mt-2 mb-0">
                  El pago se simula y el stock se descuenta al confirmar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout
