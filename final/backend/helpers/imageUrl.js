// Helper to resolve relative /uploads/ paths to full backend URLs
// This ensures images work across different domains (frontend on affurnishings.co.nz, backend on backend.affurnishings.co.nz)

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';

export function resolveUrl(filePath) {
  if (!filePath) return filePath;
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('/uploads/')) return `${BACKEND_URL}${filePath}`;
  return filePath;
}

export function resolveImageArray(images) {
  if (!images) return images;
  if (Array.isArray(images)) return images.map(resolveUrl);
  return images;
}
