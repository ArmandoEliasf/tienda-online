import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Productos from './pages/Productos.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import MisPedidos from './pages/MisPedidos.jsx'
import PedidoDetalle from './pages/PedidoDetalle.jsx'
import Admin from './pages/Admin.jsx'
import MisProductos from './pages/MisProductos.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/:id" element={<ProductoDetalle />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pedidos" element={<MisPedidos />} />
              <Route path="/pedidos/:id" element={<PedidoDetalle />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/mis-productos" element={<MisProductos />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
