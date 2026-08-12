const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
const USERS_KEY = 'tlj_usuarios'
const SESSION_KEY = 'tlj_sesion'

const usuariosDemo = [
  { nombre: 'Adriana López', email: 'admin@tienditajoyas.mx', telefono: '3312345678', password: 'Clave123!', rol: 'administrador' },
  { nombre: 'Jorge Torres', email: 'comprador1@tienditajoyas.mx', telefono: '4421234567', password: 'Clave123!', rol: 'comprador' },
  { nombre: 'Lucía Morales', email: 'comprador2@tienditajoyas.mx', telefono: '5556781234', password: 'Clave123!', rol: 'comprador' },
]

function loadUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function saveUsuarios(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

export async function register({ nombre, email, telefono, password }) {
  await delay()
  const todos = [...usuariosDemo, ...loadUsuarios()]
  if (todos.some((u) => u.email === email)) {
    throw new Error('El correo ya está registrado')
  }
  const nuevo = { nombre, email, telefono, password, rol: 'comprador' }
  saveUsuarios([...loadUsuarios(), nuevo])
  const sesion = { token: `mock-token-${Date.now()}`, nombre, email, rol: 'comprador' }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
  return sesion
}

export async function login({ email, password }) {
  await delay()
  const usuario = [...usuariosDemo, ...loadUsuarios()].find((u) => u.email === email)
  if (!usuario || usuario.password !== password) {
    throw new Error('Correo o contraseña incorrectos')
  }
  const sesion = {
    token: `mock-token-${Date.now()}`,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
  return sesion
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
