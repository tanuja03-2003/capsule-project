const express = require('express');
const config = require('../config');
const createProxyHandler = require('../utils/proxyForwarder');

const router = express.Router();

// ==========================================================
// Health Check Endpoints (Phase 7)
// ==========================================================

// Liveness / Gateway Health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Detailed Dependency Health Checks
router.get('/health/services', async (req, res) => {
  const serviceChecks = [
    { name: 'events', url: `${config.services.event}/health` },
    { name: 'bookings', url: `${config.services.booking}/health` },
    { name: 'payments', url: `${config.services.payment}/health` },
    { name: 'venueAccess', url: `${config.services.venueAccess}/health` },
    { name: 'notifications', url: `${config.services.notification}/health` }
  ];

  const results = {};
  let allHealthy = true;

  await Promise.all(
    serviceChecks.map(async ({ name, url }) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        results[name] = resp.ok ? 'UP' : `DOWN (${resp.status})`;
        if (!resp.ok) allHealthy = false;
      } catch (err) {
        results[name] = `DOWN (${err.code || err.message})`;
        allHealthy = false;
      }
    })
  );

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    status: allHealthy ? 'UP' : 'DEGRADED',
    gateway: 'UP',
    services: results,
    timestamp: new Date().toISOString()
  });
});

// ==========================================================
// Downstream Service Routing (Phase 2)
// ==========================================================

// 1. Events -> Event Service (backed by backend:3000)
const eventProxy = createProxyHandler('event-service', config.services.event);
router.use('/api/events', eventProxy);

// 2. Bookings -> Booking Service (backed by backend:3000)
const bookingProxy = createProxyHandler('booking-service', config.services.booking);
router.use('/api/bookings', bookingProxy);

// 3. Contacts -> Event/Backend Service (backed by backend:3000)
const contactProxy = createProxyHandler('contact-service', config.services.event);
router.use('/api/contacts', contactProxy);

// 4. Payments -> Payment Service (port 3002)
const paymentProxy = createProxyHandler('payment-service', config.services.payment);
router.use('/api/payments', paymentProxy);

// 5. Venue Access -> Venue Access Service (port 3001)
const accessProxy = createProxyHandler('venue-access-service', config.services.venueAccess);
router.use('/api/access', accessProxy);

// 6. Notifications -> Notification Service (port 3003)
// Constraint 4: Exact path transformation /api/notifications/send -> /api/send
const notificationProxy = createProxyHandler(
  'notification-service',
  config.services.notification,
  (path) => path.replace(/^\/api\/notifications/, '/api')
);

router.use('/api/notifications', notificationProxy);

module.exports = router;
