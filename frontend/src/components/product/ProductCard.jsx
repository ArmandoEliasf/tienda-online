import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format.js'
import { ProductImage } from '../ui/ProductImage.jsx'

function ProductCard({ producto, onAdd }) {
  const agotado = producto.existencia === 0

  return (
    <div className="card h-100 shadow-sm">
      <div className="position-relative">
        <Link to={`/productos/${producto.id}`}>
          <ProductImage src={producto.imagen_url} alt={producto.nombre} className="card-img-top" />
        </Link>
        {agotado && (
          <span className="badge bg-secondary position-absolute top-0 start-0 m-2">Agotado</span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <span className="badge bg-light text-dark align-self-start mb-2">{producto.categoria}</span>
        <Link to={`/productos/${producto.id}`} className="text-decoration-none text-dark">
          <h6 className="card-title">{producto.nombre}</h6>
        </Link>
        <p className="fs-5 fw-bold text-primary mb-2">{formatPrice(producto.precio)}</p>
        <p className="text-muted small mb-2">
          Vendido por {producto.vendedor}
        </p>
        <button
          className="btn btn-primary mt-auto"
          disabled={agotado}
          onClick={() => onAdd(producto)}
        >
          {agotado ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
