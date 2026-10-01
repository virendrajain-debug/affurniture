import { API_BASE } from './config'

// Shared GET cache: dedupes identical in-flight requests and reuses the
// response for a short TTL so stable data (settings, categories, social,
// about, homepage, store locations, ...) is not refetched on every mount.
// Errors are never cached. Product/search requests should NOT use this.

const DEFAULT_TTL = 30000

const cache = new Map()
const inflight = new Map()

export function getJson(path, { ttl = DEFAULT_TTL } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const hit = cache.get(url)
  if (hit && hit.expires > Date.now()) {
    return Promise.resolve(hit.data)
  }

  const pending = inflight.get(url)
  if (pending) return pending

  const request = fetch(url, { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      inflight.delete(url)
      if (ttl > 0) cache.set(url, { data, expires: Date.now() + ttl })
      return data
    })
    .catch((err) => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, request)
  return request
}
