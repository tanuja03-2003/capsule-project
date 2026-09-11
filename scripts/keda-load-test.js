const Redis = require('../backend/node_modules/ioredis');

const count = Number(process.argv[2] || 100);
const batchSize = Number(process.argv[3] || 500);
const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT || 6379);
const stream = process.env.NOTIFICATION_STREAM || 'notifications';

if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error('Usage: node scripts/keda-load-test.js <event-count> [batch-size]');
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

    // Pipeline finite batches to create a real, short-lived stream burst.
    // This only adds valid TICKET_BOOKED events; it never deletes or resets Redis data.
    for (let start = 1; start <= count; start += batchSize) {
        const pipeline = redis.pipeline();
        const end = Math.min(start + batchSize - 1, count);

        for (let index = start; index <= end; index += 1) {
            const event = {
                type: 'TICKET_BOOKED',
                bookingId: `keda-test-${Date.now()}-${index}`,
                eventId: 'keda-demo-event',
                email: `keda-test-${index}@example.com`,
                message: `KEDA test notification ${index}`
            };

            pipeline.xadd(
                stream,
                'MAXLEN',
                '~',
                10000,
                '*',
                'payload',
                JSON.stringify(event)
            );
        }

        await pipeline.exec();
    }

    console.log(`Published ${count} TICKET_BOOKED events to ${stream} in batches of ${batchSize}`);
}

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => redis.disconnect());