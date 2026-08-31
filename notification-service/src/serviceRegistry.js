const registerService = async () => {

    try {

        const response = await fetch(
            'http://localhost:3005/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceName: 'notification-service',
                    host: 'localhost',
                    port: 3003
                })
            }
        );

        const data = await response.json();

        console.log(
            'Notification Service registered:',
            data
        );

    } catch (error) {

        console.error(
            'Failed to register Notification Service:',
            error.message
        );

    }

};

module.exports = registerService;