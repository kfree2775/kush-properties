import logger from '../logger.js';

/**
 * requireAdmin — session-based auth middleware.
 * Checks req.session.adminUser exists, returns 401 if not.
 */
export function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUser) {
    return next();
  }
  logger.warn(`Unauthorized admin access attempt: ${req.method} ${req.originalUrl}`);
  return res.status(401).json({ error: 'Authentication required' });
}
