export const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://backend.affurnishings.co.nz')
export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://affurnishings.co.nz')
