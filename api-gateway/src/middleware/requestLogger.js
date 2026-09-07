const crypto = require('crypto');

function sanitizeData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'cardnumber', 'cvv', 'creditcard'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
}

function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Generate or propagate request ID
  const requestId = req.headers['x-request-id'] || `req-${crypto.randomBytes(8).toString('hex')}`;
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Once response finishes, log details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const targetService = req.targetService || 'gateway';
    const statusCode = res.statusCode;

    // Format log entry
    const logInfo = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      targetService,
      status: statusCode,
      durationMs: duration,
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
    };

    if (statusCode >= 500) {
      console.error(`[API-GATEWAY] [${requestId}] ${req.method} ${req.originalUrl} -> ${targetService} | ${statusCode} (${duration}ms) - ERROR`);
    } else if (statusCode >= 400) {
      console.warn(`[API-GATEWAY] [${requestId}] ${req.method} ${req.originalUrl} -> ${targetService} | ${statusCode} (${duration}ms) - WARN`);
    } else {
      console.log(`[API-GATEWAY] [${requestId}] ${req.method} ${req.originalUrl} -> ${targetService} | ${statusCode} (${duration}ms)`);
    }
  });

  next();
}

module.exports = {
  requestLogger,
  sanitizeData
};
