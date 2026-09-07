const config = require('../config');

/**
 * Creates an Express route handler that proxies incoming requests to a downstream service.
 * 
 * @param {string} serviceName - Logical name of the downstream service (for logging & error reporting)
 * @param {string} targetBaseUrl - Base URL of the target service (e.g. http://backend:3000)
 * @param {function} [pathTransform] - Optional function to rewrite the target path
 */
function createProxyHandler(serviceName, targetBaseUrl, pathTransform) {
  return async function proxyHandler(req, res, next) {
    req.targetService = serviceName;

    // Determine target path
    const targetPath = pathTransform ? pathTransform(req.originalUrl || req.url) : req.originalUrl || req.url;
    const targetUrl = `${targetBaseUrl.replace(/\/$/, '')}${targetPath}`;

    // Filter and prepare headers to forward
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;
    delete forwardHeaders['content-length'];

    // Ensure correlation / tracing headers
    if (req.requestId) {
      forwardHeaders['x-request-id'] = req.requestId;
    }
    forwardHeaders['x-forwarded-for'] = (
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      req.ip ||
      ''
    );
    forwardHeaders['x-forwarded-host'] = req.get('host') || '';
    forwardHeaders['x-forwarded-proto'] = req.protocol || 'http';

    // Propagate authenticated identity if present
    if (req.user) {
      if (req.user.id) forwardHeaders['x-user-id'] = String(req.user.id);
      if (req.user.email) forwardHeaders['x-user-email'] = String(req.user.email);
      if (req.user.role) forwardHeaders['x-user-role'] = String(req.user.role);
    }

    // Prepare body
    const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase()) && req.body;
    let bodyPayload = undefined;

    if (hasBody) {
      if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        bodyPayload = JSON.stringify(req.body);
        forwardHeaders['content-type'] = 'application/json';
      } else if (typeof req.body === 'string') {
        bodyPayload = req.body;
      }
    }

    // Set up timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, config.timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: bodyPayload,
        signal: controller.signal
      });

      clearTimeout(timeout);

      // Forward response headers
      for (const [key, value] of response.headers.entries()) {
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      res.status(response.status);

      // Stream / send response body
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        return res.json(jsonData);
      } else {
        const textData = await response.text();
        return res.send(textData);
      }
    } catch (err) {
      clearTimeout(timeout);
      return next(err);
    }
  };
}

module.exports = createProxyHandler;
