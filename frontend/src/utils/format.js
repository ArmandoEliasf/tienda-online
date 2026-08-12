const formatMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatPrice(value) {
  return formatMXN.format(value)
}
