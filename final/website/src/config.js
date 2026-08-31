export const API_BASE = window.location.hostname === 'localhost' ? '' : 'https://backend.affurnishings.co.nz'

export function getAssetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}
