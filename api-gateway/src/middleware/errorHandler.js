function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl || req.url}`,
      statusCode: 404,
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
    }
  });
}

function globalErrorHandler(err, req, res, next) {
  const requestId = req.requestId || 'unknown';
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_GATEWAY_ERROR';
  let message = err.message || 'An unexpected error occurred at the gateway';

  // Map common network / downstream errors
  if (err.name === 'AbortError' || err.code === 'ETIMEDOUT' || err.code === 'TIMEOUT') {
    statusCode = 504;
    code = 'GATEWAY_TIMEOUT';
    message = 'The downstream service timed out while processing your request';
  } else if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND' ||
    err.code === 'EHOSTUNREACH' ||
    err.code === 'DOWNSTREAM_UNAVAILABLE'
  ) {
    statusCode = 503;
    code = 'SERVICE_UNAVAILABLE';
    message = `Target service (${req.targetService || 'downstream'}) is currently unavailable`;
  }

  // Log error with requestId
  console.error(`[API-GATEWAY] [${requestId}] Error [${code}] ${statusCode}: ${err.message}`);

  // Never leak internal stack traces to the client
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode,
      path: req.originalUrl || req.url,
      requestId,
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
