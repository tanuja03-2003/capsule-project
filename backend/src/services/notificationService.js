const NOTIFICATION_SERVICE_URL = 'http://localhost:3003';

async function sendNotification(email, message) {

    console.log('Calling Notification Microservice...');
    console.log(
        `URL: ${NOTIFICATION_SERVICE_URL}/api/notifications/send`
    );

    const response = await fetch(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/send`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                message
            })
        }
    );

    const data = await response.json();

    console.log(
        'Response from Notification Microservice:',
        data
    );

    return {
        status: response.status,
        data
    };
}

module.exports = {
    sendNotification
};