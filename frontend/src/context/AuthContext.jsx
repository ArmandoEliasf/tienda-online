import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => authService.getSession())

  useEffect(() => {
    let activo = true
    authService.refreshSession().then((actualizada) => {
      if (activo) setSesion(actualizada)
    })
    return () => {
      activo = false
    }
  }, [])

  const login = async (datos) => setSesion(await authService.login(datos))
  const register = async (datos) => setSesion(await authService.register(datos))

  const logout = () => {
    authService.logout()
    setSesion(null)
  }

  return (
    <AuthContext.Provider value={{ sesion, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
