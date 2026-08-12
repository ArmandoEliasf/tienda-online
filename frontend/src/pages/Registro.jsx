import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function validar(form) {
  const errores = {}
  if (!form.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio'
  } else if (form.nombre.trim().length < 3) {
    errores.nombre = 'Debe tener al menos 3 caracteres'
  }

  if (!form.email.trim()) {
    errores.email = 'El correo es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errores.email = 'Formato de correo inválido'
  }

  if (!form.telefono.trim()) {
    errores.telefono = 'El teléfono es obligatorio'
  } else if (!/^[0-9]{10}$/.test(form.telefono.trim())) {
    errores.telefono = 'Teléfono mexicano: 10 dígitos, ej. 5512345678'
  }

  if (!form.password) {
    errores.password = 'La contraseña es obligatoria'
  } else if (form.password.length < 8) {
    errores.password = 'Debe tener al menos 8 caracteres'
  } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    errores.password = 'Debe combinar letras y números'
  }

  if (form.confirmar !== form.password) {
    errores.confirmar = 'Las contraseñas no coinciden'
  }

  return errores
}

function Registro() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
  })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const nuevosErrores = validar(form)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setCargando(true)
    try {
      await register({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: '480px' }}>
        <h1 className="h3 text-center mb-4">Crear cuenta</h1>
        <form className="card shadow-sm p-4" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <div className="mb-3">
            <label className="form-label" htmlFor="nombre">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
            />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
          </div>

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
            <label className="form-label" htmlFor="telefono">
              Teléfono (10 dígitos)
            </label>
            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value.replace(/\D/g, ''))}
            />
            {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
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

          <div className="mb-3">
            <label className="form-label" htmlFor="confirmar">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              className={`form-control ${errores.confirmar ? 'is-invalid' : ''}`}
              value={form.confirmar}
              onChange={(e) => set('confirmar', e.target.value)}
            />
            {errores.confirmar && <div className="invalid-feedback">{errores.confirmar}</div>}
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Registrarme'}
          </button>

          <p className="text-center small mt-3 mb-0">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default Registro
