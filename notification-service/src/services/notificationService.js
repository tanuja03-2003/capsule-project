const sendNotification = async ({ email, message }) => {

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