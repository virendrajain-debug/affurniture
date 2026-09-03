const BACKEND_URL = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://backend.affurnishings.co.nz' : `http://localhost:${process.env.PORT || 4001}`);
export default BACKEND_URL;
