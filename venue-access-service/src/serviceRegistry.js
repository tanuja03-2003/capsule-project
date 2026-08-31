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
                    serviceName: 'venue-access-service',
                    host: 'localhost',
                    port: 3001
                })
            }
        );

        const data = await response.json();

        console.log(
            'Venue Access Service registered:',
            data
        );

    } catch (error) {

        console.error(
            'Failed to register Venue Access Service:',
            error.message
        );

    }

};

module.exports = registerService;