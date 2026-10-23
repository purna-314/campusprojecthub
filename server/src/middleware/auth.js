import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'campus_project_hub_dev_only_secret_do_not_use_in_prod';

/**
 * Middleware: Requires a valid JWT token
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    const user = await db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

/**
 * Middleware: Optional authentication (attaches user if present)
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
        const user = await db.getUserById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (e) {
        // Ignore token verification errors for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
}

/**
 * Middleware: Requires the authenticated user's email to be verified
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Email verification required. Please verify your email address.',
      unverified: true,
      email: req.user.email
    });
  }
  next();
}

/**
 * Middleware: Restricts access to specific user roles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
}
