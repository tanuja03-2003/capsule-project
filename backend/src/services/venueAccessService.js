const VENUE_ACCESS_SERVICE_URL = process.env.VENUE_ACCESS_SERVICE_URL || 'http://localhost:3001';

async function verifyTicket(ticketId) {

    console.log('Calling Venue Access Microservice...');
    console.log(
        `URL: ${VENUE_ACCESS_SERVICE_URL}/api/access/verify`
    );
    console.log(`Ticket ID: ${ticketId}`);

    const response = await fetch(
        `${VENUE_ACCESS_SERVICE_URL}/api/access/verify`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticketId: ticketId
            })
        }
    );

    const data = await response.json();

    console.log(
        'Response received from Venue Access Microservice:',
        data
    );

    return {
        status: response.status,
        data: data
    };
}


async function createAccessTicket({
    ticketId,
    eventId,
    customerName
}) {

    console.log('Calling Venue Access Microservice to create ticket...');

    const response = await fetch(
        `${VENUE_ACCESS_SERVICE_URL}/api/access/tickets`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticketId,
                eventId,
                customerName
            })
        }
    );

    const data = await response.json();

    console.log(
        'Response received from Venue Access Microservice:',
        data
    );

    if (!response.ok) {
        const error = new Error(
            data.message || 'Failed to create access ticket'
        );
        error.statusCode = response.status;
        throw error;
    }

    return data;
}


module.exports = {
    verifyTicket,
    createAccessTicket
};