import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import * as carritoService from '../services/carrito.js'

const CartContext = createContext(null)
const CART_KEY = 'tlj_carrito'

const formaLineas = (lineas) =>
  lineas.map((l) => ({
    id: l.id_producto,
    linea_id: l.id,
    nombre: l.nombre,
    precio: l.precio,
    cantidad: l.cantidad,
    existencia: l.existencia,
    imagen_url: l.imagen_url,
  }))

function leerLocal() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CART_KEY))
    if (guardado && Array.isArray(guardado.items)) return guardado
  } catch {
    /* noop */
  }
  return { uid: null, items: [] }
}

export function CartProvider({ children }) {
  const { sesion } = useAuth()
  const token = sesion?.token || null
  const [items, setItems] = useState(() => leerLocal().items)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      localStorage.setItem(CART_KEY, JSON.stringify({ uid: null, items }))
    }
  }, [items, token])

  useEffect(() => {
    let activo = true
    if (!token) {
      setItems(leerLocal().items)
      return () => {
        activo = false
      }
    }
    setCargando(true)
    ;(async () => {
      try {
        const local = leerLocal()
        const mismoUsuario = local.uid != null && local.uid === sesion.id
        if (mismoUsuario && local.items.length > 0) {
          for (const item of local.items) {
            await carritoService.addProducto(item.id, item.cantidad, token).catch(() => {})
          }
        }
        localStorage.removeItem(CART_KEY)
        const carrito = await carritoService.getCarrito(token)
        if (activo) setItems(formaLineas(carrito.lineas))
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [token, sesion?.id])

  const applyCarrito = (carrito) => setItems(formaLineas(carrito.lineas))

  const addItem = async (producto, cantidad = 1) => {
    if (token) {
      setError(null)
      setCargando(true)
      try {
        applyCarrito(await carritoService.addProducto(producto.id, cantidad, token))
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setCargando(false)
      }
      return
    }
    setItems((prev) => {
      const limite = producto.existencia
      const cantidadCap = Math.min(cantidad, limite)
      const existente = prev.find((i) => i.id === producto.id)
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidadCap, limite), existencia: limite }
            : i,
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen_url: producto.imagen_url,
          existencia: limite,
          cantidad: cantidadCap,
        },
      ]
    })
  }

  const updateQuantity = async (id, cantidad) => {
    if (token) {
      const item = items.find((i) => i.id === id)
      if (!item || item.linea_id == null) return
      setError(null)
      setCargando(true)
      try {
        applyCarrito(await carritoService.updateCantidad(item.linea_id, cantidad, token))
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setCargando(false)
      }
      return
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const max = i.existencia ?? Number.POSITIVE_INFINITY
        return { ...i, cantidad: Math.min(Math.max(cantidad, 1), max) }
      }),
    )
  }

  const removeItem = async (id) => {
    if (token) {
      const item = items.find((i) => i.id === id)
      if (!item || item.linea_id == null) return
      setError(null)
      setCargando(true)
      try {
        applyCarrito(await carritoService.removeProducto(item.linea_id, token))
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setCargando(false)
      }
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = async () => {
    if (token) {
      setError(null)
      setCargando(true)
      try {
        await carritoService.clearCarrito(token)
        setItems([])
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setCargando(false)
      }
      return
    }
    setItems([])
  }

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items],
  )
  const itemCount = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items])

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount, cargando, error }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
