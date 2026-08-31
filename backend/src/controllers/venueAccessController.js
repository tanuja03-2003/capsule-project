const venueAccessService = require('../services/venueAccessService');

const verifyTicket = async (req, res) => {
    try {
        const ticketId = req.body.ticketId;

        console.log('Calling Venue Access Microservice...');
        console.log('Ticket ID:', ticketId);

        const result = await venueAccessService.verifyTicket(ticketId);

        console.log(
            'Response from Venue Access Microservice:',
            result.data
        );

        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error(
            'Error calling Venue Access Microservice:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Venue Access Microservice is unavailable'
        });
    }
};

module.exports = {
    verifyTicket
};