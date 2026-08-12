const CLASES = {
  pendiente: 'bg-secondary',
  confirmado: 'bg-info',
  preparando: 'bg-warning text-dark',
  enviado: 'bg-primary',
  entregado: 'bg-success',
  cancelado: 'bg-danger',
}

export function ClaseEstado(estado) {
  return CLASES[estado] || 'bg-secondary'
}

export function EtiquetaEstado(estado) {
  const etiquetas = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    preparando: 'En preparación',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }
  return etiquetas[estado] || estado
}
