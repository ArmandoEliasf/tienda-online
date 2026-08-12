import { api } from './api.js'

const SESSION_KEY = 'tlj_sesion'

function saveSession(sesion) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
}

export async function register(datos) {
  await api.post('/auth/registro', datos)
  return login({ email: datos.email, password: datos.password })
}

export async function login({ email, password }) {
  const { token, usuario } = await api.post('/auth/login', { email, password })
  const sesion = { token, ...usuario }
  saveSession(sesion)
  return sesion
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export async function refreshSession() {
  const actual = getSession()
  if (!actual?.token) return null
  try {
    const { usuario } = await api.get('/auth/me', actual.token)
    const sesion = { token: actual.token, ...usuario }
    saveSession(sesion)
    return sesion
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
