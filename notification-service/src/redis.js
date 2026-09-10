const Redis = require('ioredis');

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    connectTimeout: 5000,
    maxRetriesPerRequest: null
};

const stream = process.env.NOTIFICATION_STREAM || 'notifications';
const consumerGroup = process.env.NOTIFICATION_CONSUMER_GROUP || 'notification-workers';

function createRedisClient() {
    return new Redis(redisOptions);
}

module.exports = {
    consumerGroup,
    createRedisClient,
    stream
};