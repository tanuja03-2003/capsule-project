const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const NOTIFICATION_STREAM = process.env.NOTIFICATION_STREAM || 'notifications';

async function publishNotification(event) {

    const redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        connectTimeout: 1000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null
    });

    redis.on('error', () => {});

    try {

        const messageId = await redis.xadd(
            NOTIFICATION_STREAM,
            'MAXLEN',
            '~',
            10000,
            '*',
            'payload',
            JSON.stringify(event)
        );

        return {
            status: 'QUEUED',
            messageId
        };

    } finally {

        redis.disconnect();
    }
}

async function sendNotification(email, message, details = {}) {

    return publishNotification({
        type: 'TICKET_BOOKED',
        bookingId: details.bookingId,
        eventId: details.eventId,
        email,
        message
    });
}

module.exports = {
    sendNotification
};