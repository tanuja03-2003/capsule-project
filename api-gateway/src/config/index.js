require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    event: process.env.EVENT_SERVICE_URL || 'http://localhost:3000',
    booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3000',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002',
    venueAccess: process.env.VENUE_ACCESS_SERVICE_URL || 'http://localhost:3001',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },
  timeoutMs: parseInt(process.env.GATEWAY_TIMEOUT_MS, 10) || 10000
};

module.exports = config;
