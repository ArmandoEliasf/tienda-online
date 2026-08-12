import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'

function Navbar() {
  const { sesion, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = e.target.busqueda.value.trim()
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Tiendita las joyas
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <form className="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0" onSubmit={handleSearch}>
            <input
              name="busqueda"
              type="search"
              className="form-control me-2"
              placeholder="Buscar productos..."
              aria-label="Buscar"
            />
            <button className="btn btn-outline-light" type="submit">
              Buscar
            </button>
          </form>
          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/carrito">
                Carrito
                {itemCount > 0 && <span className="badge bg-primary ms-1">{itemCount}</span>}
              </Link>
            </li>
            {sesion ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/pedidos">
                    Mis pedidos
                  </Link>
                </li>
                {sesion.rol === 'administrador' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <span className="nav-link">
                    Hola, {sesion.nombre.split(' ')[0]}
                    {sesion.rol === 'administrador' && (
                      <span className="badge bg-warning text-dark ms-1">Admin</span>
                    )}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm ms-lg-2" to="/registro">
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
