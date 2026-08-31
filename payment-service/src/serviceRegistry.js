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
                    serviceName: 'payment-service',
                    host: 'localhost',
                    port: 3002
                })
            }
        );

        const data = await response.json();

        console.log(
            'Payment Service registered:',
            data
        );

    } catch (error) {

        console.error(
            'Failed to register Payment Service:',
            error.message
        );

    }

};

module.exports = registerService;