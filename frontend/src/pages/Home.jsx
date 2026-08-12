import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDestacados } from '../services/productos.js'
import { listCategorias } from '../services/categorias.js'
import ProductCard from '../components/product/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'

function Home() {
  const [destacados, setDestacados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getDestacados(), listCategorias()])
      .then(([destacadosData, categoriasData]) => {
        setDestacados(destacadosData)
        setCategorias(categoriasData)
      })
      .finally(() => setCargando(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = e.target.busqueda.value.trim()
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  return (
    <>
      <section className="bg-dark text-light py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Tiendita las joyas</h1>
          <p className="lead mb-4">
            Compra y vende productos dentro de México con precios en pesos mexicanos
          </p>
          <form className="row g-2 justify-content-center" onSubmit={handleSearch}>
            <div className="col-lg-6 col-md-8">
              <input
                name="busqueda"
                type="search"
                className="form-control form-control-lg"
                placeholder="¿Qué estás buscando? Ej. laptop, tenis..."
                aria-label="Buscar productos"
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary btn-lg w-100" type="submit">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <h2 className="h5 fw-bold mb-3">Categorías</h2>
          <div className="d-flex flex-wrap gap-2 mb-4">
            {categorias.map((c) => (
              <Link
                key={c.id}
                to={`/productos?categoria=${c.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <h2 className="h5 fw-bold mb-3">Productos destacados</h2>
          {cargando ? (
            <p className="text-muted">Cargando productos...</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {destacados.map((p) => (
                <div className="col" key={p.id}>
                  <ProductCard producto={p} onAdd={() => addItem(p)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <h2 className="h5 fw-bold text-center mb-4">¿Cómo funciona?</h2>
          <div className="row g-3 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <h3 className="fs-5">1. Explora</h3>
                <p className="text-muted small mb-0">
                  Busca y filtra productos por categoría, precio y disponibilidad.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <h3 className="fs-5">2. Arma tu carrito</h3>
                <p className="text-muted small mb-0">
                  Agrega productos y ajusta las cantidades.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <h3 className="fs-5">3. Genera tu pedido</h3>
                <p className="text-muted small mb-0">
                  Confirma con una dirección mexicana y sigue el estado.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <h3 className="fs-5">4. Recibe</h3>
                <p className="text-muted small mb-0">
                  Da seguimiento desde Pendiente hasta Entregado.
                </p>
              </div>
            </div>
          </div>
          <p className="text-muted small text-center mt-4 mb-0">
            Pago simulado · Envíos dentro de México · Moneda MXN
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
