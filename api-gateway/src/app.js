const express = require('express');
const cors = require('cors');
const { requestLogger } = require('./middleware/requestLogger');
const createRateLimiter = require('./middleware/rateLimiter');
const { optionalAuth } = require('./middleware/authMiddleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const gatewayRoutes = require('./routes/gatewayRoutes');

const app = express();

// Trust proxy for NGINX ingress and Docker network
app.set('trust proxy', true);

// CORS configuration (compatible with Live Server and external NGINX)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Structured Request Logging with Sensitive Field Redaction (Phase 8)
app.use(requestLogger);

// Gateway Rate Limiting (Phase 4)
app.use(createRateLimiter());

// Gateway Authentication Middleware (Phase 3 - non-disruptive, propagates identity)
app.use(optionalAuth);

// Mount Gateway Routes (Phase 2 & 7)
app.use(gatewayRoutes);

// 404 Route Not Found Handler (Phase 9)
app.use(notFoundHandler);

// Centralized Gateway Error Handler (Phase 9)
app.use(globalErrorHandler);

module.exports = app;
