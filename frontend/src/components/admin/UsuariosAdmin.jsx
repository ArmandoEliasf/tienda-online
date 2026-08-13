import { useEffect, useState } from 'react'
import * as adminService from '../../services/admin.js'
import { useAuth } from '../../context/AuthContext.jsx'

function UsuariosAdmin({ token }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const { sesion } = useAuth()

  const cargar = () => {
    adminService
      .listUsuarios(token)
      .then((r) => setUsuarios(r.usuarios))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [token])

  const alternar = (u) => {
    adminService
      .setUsuarioEstado(u.id, u.estado === 'activo' ? 'inactivo' : 'activo', token)
      .then(() => {
        setError(null)
        cargar()
      })
      .catch((err) => setError(err.message))
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {cargando ? (
        <p className="text-muted">Cargando usuarios...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.nombre}</td>
                  <td>{u.email}</td>
                  <td className="small">{u.telefono}</td>
                  <td>
                    <span className={`badge ${u.rol === 'administrador' ? 'bg-warning text-dark' : u.rol === 'vendedor' ? 'bg-info' : 'bg-light text-dark'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="text-end">
                    {sesion?.id === u.id ? (
                      <span className="text-muted small">Eres tú</span>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => alternar(u)}>
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
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

export default UsuariosAdmin
