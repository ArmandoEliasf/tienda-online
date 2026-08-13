import { useState } from 'react'
import { normalizarUrlImagen } from '../../utils/imagen.js'

const FALLBACK = 'https://placehold.co/500x350/e9ecef/6c757d?text=Sin+imagen'

export function ProductImage({ src, alt, className, style }) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error || !src ? FALLBACK : normalizarUrlImagen(src)}
      alt={alt || 'Producto'}
      className={className}
      style={style}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
