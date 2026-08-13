import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProductosAdmin from '../components/admin/ProductosAdmin.jsx'

function MisProductos() {
  const { sesion } = useAuth()

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

  if (sesion.rol !== 'vendedor' && sesion.rol !== 'administrador') {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="h4 mb-3">Acceso restringido</h1>
          <p className="text-muted mb-4">Esta sección es exclusiva para vendedores.</p>
          <Link className="btn btn-outline-primary" to="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4">
      <div className="container">
        <h1 className="h4 mb-4">Mis productos</h1>
        <ProductosAdmin token={sesion.token} soloMios />
      </div>
    </section>
  )
}

export default MisProductos
