require('dotenv').config();

const os = require('os');

const notificationService = require('./services/notificationService');
const {
    consumerGroup,
    createRedisClient,
    stream
} = require('./redis');

const consumerName = `${os.hostname()}-${process.pid}`;
const redis = createRedisClient();
const blockingRedis = createRedisClient();

async function ensureConsumerGroup() {

    try {
        await redis.xgroup('CREATE', stream, consumerGroup, '0', 'MKSTREAM');
    } catch (error) {
        if (!error.message.includes('BUSYGROUP')) {
            throw error;
        }
    }
}

function entriesFromResponse(response) {
    return response?.[0]?.[1] || [];
}

async function processEntry(messageId, fields) {

    const payloadIndex = fields.indexOf('payload');

    if (payloadIndex === -1 || !fields[payloadIndex + 1]) {
        throw new Error(`Notification ${messageId} has no payload`);
    }

    const notification = JSON.parse(fields[payloadIndex + 1]);

    await notificationService.sendNotification(notification);
    await redis.xack(stream, consumerGroup, messageId);

    console.log('Notification processed:', messageId);
}

async function processEntries(entries) {

    for (const [messageId, fields] of entries) {
        try {
            await processEntry(messageId, fields);
        } catch (error) {
            console.error(
                `Notification processing failed for ${messageId}:`,
                error.message
            );
        }
    }
}

async function reclaimPending() {

    const response = await redis.xautoclaim(
        stream,
        consumerGroup,
        consumerName,
        60000,
        '0-0',
        'COUNT',
        10
    );

    await processEntries(response[1] || []);
}

async function run() {

    await ensureConsumerGroup();
    console.log(
        `Notification worker ${consumerName} consuming ${stream}`
    );

    while (true) {
        await reclaimPending();

        const response = await blockingRedis.xreadgroup(
            'GROUP',
            consumerGroup,
            consumerName,
            'COUNT',
            10,
            'BLOCK',
            5000,
            'STREAMS',
            stream,
            '>'
        );

        await processEntries(entriesFromResponse(response));
    }
}

run().catch(async (error) => {
    console.error('Notification worker stopped:', error);
    redis.disconnect();
    blockingRedis.disconnect();
    process.exitCode = 1;
});