import { useEffect, useState } from 'react'
import * as adminService from '../../services/admin.js'

function CategoriasAdmin({ token }) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [editandoId, setEditandoId] = useState(null)

  const cargar = () => {
    setCargando(true)
    adminService
      .listCategoriasAdmin(token)
      .then((r) => setCategorias(r.categorias))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [token])

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (editandoId) {
        await adminService.actualizarCategoria(editandoId, form, token)
      } else {
        await adminService.crearCategoria(form, token)
      }
      setForm(null)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  const alternar = (c) => {
    adminService
      .setCategoriaEstado(c.id, c.estado === 'activo' ? 'inactivo' : 'activo', token)
      .then(cargar)
      .catch((err) => setError(err.message))
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {form ? (
        <form onSubmit={guardar} className="card shadow-sm">
          <div className="card-body">
            <h3 className="h6 fw-bold mb-3">{editandoId ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small">Nombre</label>
                <input
                  name="nombre"
                  className="form-control form-control-sm"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Descripción</label>
                <input
                  name="descripcion"
                  className="form-control form-control-sm"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-sm btn-primary" type="submit">
                  Guardar
                </button>
                <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setForm(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <>
          <button
            className="btn btn-sm btn-primary mb-3"
            onClick={() => {
              setForm({ nombre: '', descripcion: '' })
              setEditandoId(null)
            }}
          >
            + Nueva categoría
          </button>
          {cargando ? (
            <p className="text-muted">Cargando categorías...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.nombre}</td>
                      <td className="small text-muted">{c.descripcion}</td>
                      <td>
                        <span className={`badge ${c.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setForm({ nombre: c.nombre, descripcion: c.descripcion })
                            setEditandoId(c.id)
                          }}
                        >
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => alternar(c)}>
                          {c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CategoriasAdmin
