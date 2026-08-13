const PROXY_PREFIX = '/api/archivos/imagen/'
const DRIVE_UC = /drive\.google\.com\/uc\?export=view&id=([^&]+)/
const DRIVE_DOWNLOAD = /drive\.usercontent\.google\.com\/download\?id=([^&]+)/
const DRIVE_THUMB = /drive\.google\.com\/thumbnail\?id=([^&]+)/

export function normalizarUrlImagen(url) {
  if (!url) return url
  const match = String(url).match(DRIVE_UC) || String(url).match(DRIVE_DOWNLOAD) || String(url).match(DRIVE_THUMB)
  return match ? `${PROXY_PREFIX}${match[1]}` : url
}
