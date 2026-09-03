const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.')
);

export const API_BASE = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:4001' : 'https://backend.affurnishings.co.nz');

export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || (isLocal ? 'http://localhost:5174' : 'https://affurnishings.co.nz');

export const getAssetUrl = (path) => {
  if (!path) return '/aeryp.png';
  if (/^https?:\/\/localhost:\d+/.test(path)) return path.replace(/^https?:\/\/localhost:\d+/, API_BASE);
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
