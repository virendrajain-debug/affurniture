// ============================================================
// JWT Authentication Middleware
// ============================================================
// This middleware protects API routes that require a logged-in user.
// It checks for a valid JWT token in the Authorization header.
//
// HOW IT WORKS:
//   1. Client sends request with header: Authorization: Bearer <token>
//   2. This middleware extracts and verifies the token
//   3. If valid, attaches user data to req.user and calls next()
//   4. If invalid/missing, returns 401/403 error
//
// USAGE in routes:
//   router.get('/protected-route', authenticateToken, (req, res) => {
//     // req.user contains: { id, email, role } from the token
//   });
// ============================================================

import jwt from 'jsonwebtoken';  // JWT library for token verification
import dotenv from 'dotenv';

dotenv.config(); // Load JWT_SECRET from .env

export const authenticateToken = (req, res, next) => {
  // Get the Authorization header (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract just the token part

  // No token provided - return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using our secret key
    // This also checks if the token has expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user data to the request object
    // Now any route handler can access req.user.id, req.user.email, etc.
    req.user = decoded;
    
    next(); // Token is valid - proceed to the next middleware/route handler
  } catch (error) {
    // Token is invalid or expired - return 403 Forbidden
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
