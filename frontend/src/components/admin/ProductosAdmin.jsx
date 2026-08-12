import { useEffect, useState } from 'react'
import * as adminService from '../../services/admin.js'
import { formatPrice } from '../../utils/format.js'

const VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  existencia: '',
  idCategoria: '',
  imagen_google_drive_id: '',
  imagen_url: '',
  imagen_nombre_archivo: '',
}

function ProductosAdmin({ token }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [editandoId, setEditandoId] = useState(null)

  const cargar = () => {
    setCargando(true)
    Promise.all([adminService.listProductosAdmin(token), adminService.listCategoriasAdmin(token)])
      .then(([p, c]) => {
        setProductos(p.productos)
        setCategorias(c.categorias)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [token])

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const abrirNuevo = () => {
    setForm({ ...VACIO, idCategoria: categorias[0]?.id || '' })
    setEditandoId(null)
  }

  const abrirEdicion = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      existencia: p.existencia,
      idCategoria: p.id_categoria,
      imagen_google_drive_id: '',
      imagen_url: '',
      imagen_nombre_archivo: '',
    })
    setEditandoId(p.id)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      existencia: Number(form.existencia),
      idCategoria: Number(form.idCategoria),
    }
    if (form.imagen_google_drive_id && form.imagen_url) {
      datos.imagen = {
        google_drive_id: form.imagen_google_drive_id,
        url: form.imagen_url,
        nombre_archivo: form.imagen_nombre_archivo || 'imagen.png',
      }
    }
    try {
      if (editandoId) {
        await adminService.actualizarProducto(editandoId, datos, token)
      } else {
        await adminService.crearProducto(datos, token)
      }
      setForm(null)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  const alternar = (p) => {
    adminService
      .setProductoEstado(p.id, p.estado === 'activo' ? 'inactivo' : 'activo', token)
      .then(cargar)
      .catch((err) => setError(err.message))
  }

  if (form) {
    return (
      <form onSubmit={guardar} className="card shadow-sm">
        <div className="card-body">
          <h3 className="h6 fw-bold mb-3">{editandoId ? 'Editar producto' : 'Nuevo producto'}</h3>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">Nombre</label>
              <input name="nombre" className="form-control form-control-sm" required value={form.nombre} onChange={cambiar} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Categoría</label>
              <select name="idCategoria" className="form-select form-select-sm" required value={form.idCategoria} onChange={cambiar}>
                {categorias.filter((c) => c.estado === 'activo').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-12">
              <label className="form-label small">Descripción</label>
              <textarea name="descripcion" className="form-control form-control-sm" rows="2" value={form.descripcion} onChange={cambiar} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Precio (MXN)</label>
              <input name="precio" type="number" min="0" step="0.01" className="form-control form-control-sm" required value={form.precio} onChange={cambiar} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Existencia</label>
              <input name="existencia" type="number" min="0" className="form-control form-control-sm" required value={form.existencia} onChange={cambiar} />
            </div>
            <div className="col-12">
              <hr className="my-1" />
              <div className="small text-muted mb-2">Imagen principal (opcional)</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small">URL de la imagen</label>
              <input name="imagen_url" className="form-control form-control-sm" value={form.imagen_url} onChange={cambiar} placeholder="https://..." />
            </div>
            <div className="col-md-6">
              <label className="form-label small">ID de Google Drive</label>
              <input name="imagen_google_drive_id" className="form-control form-control-sm" value={form.imagen_google_drive_id} onChange={cambiar} />
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-sm btn-primary" type="submit">
                {editandoId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setForm(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <button className="btn btn-sm btn-primary mb-3" onClick={abrirNuevo}>
        + Nuevo producto
      </button>
      {cargando ? (
        <p className="text-muted">Cargando productos...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="text-end">Precio</th>
                <th className="text-center">Existencia</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td className="small">{p.categoria}</td>
                  <td className="text-end">{formatPrice(p.precio)}</td>
                  <td className="text-center">{p.existencia}</td>
                  <td>
                    <span className={`badge ${p.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirEdicion(p)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => alternar(p)}>
                      {p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProductosAdmin
