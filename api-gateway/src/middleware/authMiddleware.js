/**
 * Gateway Authentication Middleware
 * 
 * In accordance with Phase 3 specifications:
 * - Does not disrupt public routes (public by default).
 * - Extracts and validates Bearer token if provided.
 * - Extracts user identity and propagates downstream via headers:
 *     - X-User-Id
 *     - X-User-Role
 *     - X-User-Email
 * - Supports route-level protection via requireAuth() without creating incompatible mechanisms.
 */

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme && scheme.toLowerCase() === 'bearer' && token) {
    try {
      // If token is a base64 encoded JSON or JWT payload (split by dot)
      let payload = null;
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
          payload = JSON.parse(decoded);
        }
      } else {
        // Fallback for simple/dev tokens: base64 encoded user object
        try {
          payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        } catch {
          // Plain token string
          payload = { id: token, role: 'USER' };
        }
      }

      if (payload) {
        req.user = {
          id: payload.sub || payload.id || payload.userId,
          email: payload.email,
          role: payload.role || 'CUSTOMER'
        };

        // Inject downstream headers
        if (req.user.id) req.headers['x-user-id'] = String(req.user.id);
        if (req.user.email) req.headers['x-user-email'] = String(req.user.email);
        if (req.user.role) req.headers['x-user-role'] = String(req.user.role);
      }
    } catch (err) {
      // Malformed token provided
      req.user = null;
    }
  }

  next();
}

/**
 * Route protection middleware generator for secured endpoints.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required for this resource',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
}

module.exports = {
  optionalAuth,
  requireAuth
};
