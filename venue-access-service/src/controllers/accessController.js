const accessService = require('../services/accessService');

const verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.body;

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        const result = await accessService.verifyTicket(ticketId);

        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Venue Access Controller Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



const createAccessTicket = async (req, res) => {
    try {
        const {
            ticketId,
            eventId,
            customerName
        } = req.body;

        if (!ticketId || !eventId || !customerName) {
            return res.status(400).json({
                success: false,
                message: 'ticketId, eventId and customerName are required'
            });
        }

        const ticket = await accessService.createAccessTicket({
            ticketId,
            eventId,
            customerName
        });

        return res.status(201).json({
            success: true,
            message: 'Access ticket created successfully',
            ticket
        });

    } catch (error) {
        console.error('Create Access Ticket Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create access ticket'
        });
    }
};

module.exports = {
    createAccessTicket,
    verifyTicket
};