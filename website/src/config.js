export const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4001' : 'https://backend.affurnishings.co.nz'

const BACKEND_URL = 'https://backend.affurnishings.co.nz'
export function getAssetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}
