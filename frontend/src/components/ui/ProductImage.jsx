import { useState } from 'react'

const FALLBACK = 'https://placehold.co/500x350/e9ecef/6c757d?text=Sin+imagen'

export function ProductImage({ src, alt, className, style }) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error || !src ? FALLBACK : src}
      alt={alt || 'Producto'}
      className={className}
      style={style}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}
