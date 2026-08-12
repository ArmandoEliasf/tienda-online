import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'tlj_carrito'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (producto, cantidad = 1) => {
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

  const updateQuantity = (id, cantidad) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const max = i.existencia ?? Number.POSITIVE_INFINITY
        return { ...i, cantidad: Math.min(Math.max(cantidad, 1), max) }
      }),
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items],
  )
  const itemCount = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
