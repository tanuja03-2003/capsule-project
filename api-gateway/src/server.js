const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 API Gateway running on port ${config.port}`);
  console.log(`   Routing Targets:`);
  console.log(`   - Events:        ${config.services.event}`);
  console.log(`   - Bookings:      ${config.services.booking}`);
  console.log(`   - Payments:      ${config.services.payment}`);
  console.log(`   - Venue Access:  ${config.services.venueAccess}`);
  console.log(`   - Notifications: ${config.services.notification}`);
  console.log(`=======================================================`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down API Gateway gracefully...`);
  server.close(() => {
    console.log('API Gateway closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
