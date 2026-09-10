const Redis = require('../backend/node_modules/ioredis');

const count = Number(process.argv[2] || 100);
const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT || 6379);
const stream = process.env.NOTIFICATION_STREAM || 'notifications';

if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Usage: node scripts/keda-load-test.js <positive-event-count>');
}

const redis = new Redis({
    host,
    port,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000
});

redis.on('error', (error) => {
    console.error('Redis producer error:', error.message);
});

async function run() {

    for (let index = 1; index <= count; index += 1) {
        const event = {
            type: 'TICKET_BOOKED',
            bookingId: `keda-test-${Date.now()}-${index}`,
            eventId: 'keda-demo-event',
            email: `keda-test-${index}@example.com`,
            message: `KEDA test notification ${index}`
        };

        await redis.xadd(
            stream,
            'MAXLEN',
            '~',
            10000,
            '*',
            'payload',
            JSON.stringify(event)
        );
    }

    console.log(`Published ${count} TICKET_BOOKED events to ${stream}`);
}

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => redis.disconnect());