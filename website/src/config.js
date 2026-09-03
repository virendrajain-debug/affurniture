export const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4001' : 'https://backend.affurnishings.co.nz'

export function getAssetUrl(url) {
  if (!url) return ''
  if (/^https?:\/\/localhost:\d+/.test(url)) return url.replace(/^https?:\/\/localhost:\d+/, API_BASE)
  if (url.startsWith('http')) return url
  return `${API_BASE}${url}`
}
