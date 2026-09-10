const sendNotification = async ({ email, message }) => {

    const testDelayMs = Number(
        process.env.NOTIFICATION_TEST_DELAY_MS || 0
    );

    if (testDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, testDelayMs));
    }

    console.log('Sending notification...');
    console.log('To:', email);
    console.log('Message:', message);

    // For now we are only simulating notification sending.
    // Later we can connect email/SMS/etc.

    return {
        email,
        message,
        status: 'SENT'
    };
};

module.exports = {
    sendNotification
};