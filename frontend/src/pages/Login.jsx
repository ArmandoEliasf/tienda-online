import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function validar(email, password) {
  const errores = {}
  if (!email.trim()) {
    errores.email = 'El correo es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errores.email = 'Formato de correo inválido'
  }
  if (!password) {
    errores.password = 'La contraseña es obligatoria'
  } else if (password.length < 6) {
    errores.password = 'Debe tener al menos 6 caracteres'
  }
  return errores
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const nuevosErrores = validar(form.email, form.password)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setCargando(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: '440px' }}>
        <h1 className="h3 text-center mb-4">Iniciar sesión</h1>
        <form className="card shadow-sm p-4" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errores.email && <div className="invalid-feedback">{errores.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${errores.password ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            {errores.password && <div className="invalid-feedback">{errores.password}</div>}
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center small mt-3 mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/registro">Regístrate gratis</Link>
          </p>
          <p className="text-center text-muted small mt-2 mb-0">
            Demo: comprador1@tienditajoyas.mx / Clave123!
          </p>
        </form>
      </div>
    </section>
  )
}

export default Login
