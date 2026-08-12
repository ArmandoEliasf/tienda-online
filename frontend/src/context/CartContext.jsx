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
      const existente = prev.find((i) => i.id === producto.id)
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
        )
      }
      return [
        ...prev,
        { id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen_url: producto.imagen_url, cantidad },
      ]
    })
  }

  const updateQuantity = (id, cantidad) => {
    if (cantidad < 1) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)))
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
