import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PedidosAdmin from '../components/admin/PedidosAdmin.jsx'
import ProductosAdmin from '../components/admin/ProductosAdmin.jsx'
import CategoriasAdmin from '../components/admin/CategoriasAdmin.jsx'
import UsuariosAdmin from '../components/admin/UsuariosAdmin.jsx'

const PESTANAS = [
  { id: 'pedidos', nombre: 'Pedidos' },
  { id: 'productos', nombre: 'Productos' },
  { id: 'categorias', nombre: 'Categorías' },
  { id: 'usuarios', nombre: 'Usuarios' },
]

function Admin() {
  const { sesion } = useAuth()
  const [activa, setActiva] = useState('pedidos')

  if (!sesion) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Inicia sesión para acceder</h1>
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </section>
    )
  }

  if (sesion.rol !== 'administrador') {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Acceso restringido</h1>
          <p className="text-muted mb-4">Este panel es exclusivo para administradores.</p>
          <Link className="btn btn-outline-primary" to="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    )
  }

  const token = sesion.token

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Panel de administración</h1>
        <ul className="nav nav-tabs mb-4">
          {PESTANAS.map((p) => (
            <li className="nav-item" key={p.id}>
              <button
                className={`nav-link ${activa === p.id ? 'active' : ''}`}
                onClick={() => setActiva(p.id)}
              >
                {p.nombre}
              </button>
            </li>
          ))}
        </ul>
        {activa === 'pedidos' && <PedidosAdmin token={token} />}
        {activa === 'productos' && <ProductosAdmin token={token} />}
        {activa === 'categorias' && <CategoriasAdmin token={token} />}
        {activa === 'usuarios' && <UsuariosAdmin token={token} />}
      </div>
    </section>
  )
}

export default Admin
