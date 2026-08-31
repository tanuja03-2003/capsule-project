const db = require('../config/database');

const createAccessTicket = async ({
    ticketId,
    eventId,
    customerName
}) => {

    const [result] = await db.execute(
        `INSERT INTO access_tickets
        (ticket_id, event_id, customer_name, access_status)
        VALUES (?, ?, ?, 'VALID')`,
        [ticketId, eventId, customerName]
    );

    return {
        id: result.insertId,
        ticketId,
        eventId,
        customerName,
        accessStatus: 'VALID'
    };
};
const verifyTicket = async (ticketId) => {

    const [rows] = await db.execute(
        `SELECT ticket_id, event_id, customer_name, access_status
         FROM access_tickets
         WHERE ticket_id = ?`,
        [ticketId]
    );

    if (rows.length === 0) {
        return {
            status: 404,
            data: {
                success: false,
                message: 'Ticket not found',
                ticketId: ticketId,
                accessGranted: false
            }
        };
    }

    const ticket = rows[0];

    if (ticket.access_status !== 'VALID') {
        return {
            status: 403,
            data: {
                success: false,
                message: 'Ticket is not valid for entry',
                ticketId: ticketId,
                accessGranted: false
            }
        };
    }

    return {
        status: 200,
        data: {
            success: true,
            message: 'Ticket verified successfully',
            ticketId: ticket.ticket_id,
            eventId: ticket.event_id,
            customerName: ticket.customer_name,
            accessGranted: true
        }
    };
};
module.exports = {
    createAccessTicket,
    verifyTicket
};