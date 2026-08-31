const bookingDao = require('../dao/bookingDao');
const eventService = require('./eventService');
const venueAccessService = require('./venueAccessService');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');

async function bookTickets(booking) {

    // 1. Validate event ID
    if (
        !booking ||
        !Number.isInteger(booking.eventId) ||
        booking.eventId <= 0
    ) {
        const error = new Error('Valid eventId is required');
        error.statusCode = 400;
        throw error;
    }

    // 2. Get number of tickets
    const requestedTickets = Number(
        booking.numberOfTickets ??
        booking.ticketsCount ??
        0
    );

    // 3. Get customer name
    const personName = (
        booking.personName ??
        booking.customerName ??
        ''
    ).toString().trim();

    // 4. Get customer email
    const email = (
        booking.email ??
        booking.customerEmail ??
        ''
    ).toString().trim();

    // 5. Validate customer name
    if (!personName) {
        const error = new Error(
            'customerName or personName is required and cannot be empty'
        );
        error.statusCode = 400;
        throw error;
    }

    // 6. Validate number of tickets
    if (
        !Number.isInteger(requestedTickets) ||
        requestedTickets <= 0
    ) {
        const error = new Error(
            'numberOfTickets must be a positive integer'
        );
        error.statusCode = 400;
        throw error;
    }

    // 7. Validate email
    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        const error = new Error('Email format is invalid');
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------------
    // 8. Get event
    // ------------------------------------------------

    const event = await eventService.getEventById(
        booking.eventId
    );

    if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
    }

    // ------------------------------------------------
    // 9. Check ticket availability
    // ------------------------------------------------

    const available = Number(
        event.availableTickets ?? 0
    );

    if (available < requestedTickets) {
        const error = new Error(
            'Not enough tickets available'
        );
        error.statusCode = 409;
        throw error;
    }

    // ------------------------------------------------
    // 10. Calculate total amount
    // ------------------------------------------------

    const price = Number(event.price ?? 0);

    const totalAmount = Number(
        booking.totalAmount ??
        price * requestedTickets
    );

    // ------------------------------------------------
    // 11. Prepare booking data
    // ------------------------------------------------

    const normalizedBooking = {
        eventId: booking.eventId,
        personName: personName,
        email: email,
        numberOfTickets: requestedTickets,
        totalAmount: totalAmount,
        bookingDate: new Date(),
        status: booking.status || 'CONFIRMED'
    };

    // ------------------------------------------------
    // 12. Create booking in MONOLITHIC DATABASE
    // ------------------------------------------------

    const bookingId = await bookingDao.createBooking(
        normalizedBooking,
        available - requestedTickets
    );

    console.log(
        'Booking created successfully:',
        bookingId
    );

    // 6. Call Payment Microservice

try {

    const paymentResponse =
        await paymentService.createPayment(
            bookingId,
            totalAmount
        );

    console.log(
        'Payment successful:',
        paymentResponse.data
    );

} catch (error) {

    console.error(
        'Payment Microservice failed:',
        error.message
    );
}

    // ------------------------------------------------
    // 13. Call VENUE ACCESS MICROSERVICE
    // ------------------------------------------------

    try {

        await venueAccessService.createAccessTicket({

            ticketId: bookingId,

            eventId: booking.eventId,

            customerName: personName

        });

        console.log(
            'Access ticket created successfully:',
            bookingId
        );

    } catch (error) {

        console.error(
            'Venue Access Microservice failed:',
            error.message
        );

        // Important:
        // Booking still succeeds even if
        // Venue Access Microservice is unavailable.
    }

    // ------------------------------------------------
    // 14. Call NOTIFICATION MICROSERVICE
    // ------------------------------------------------

    if (email) {

        try {

            await notificationService.sendNotification(

                email,

                `Your booking has been confirmed successfully. Booking ID: ${bookingId}`

            );

            console.log(
                'Notification sent successfully'
            );

        } catch (error) {

            console.error(
                'Notification Microservice failed:',
                error.message
            );

            // Important:
            // Booking still succeeds even if
            // Notification Microservice is unavailable.
        }
    }

    // ------------------------------------------------
    // 15. Return booking response
    // ------------------------------------------------

    return {

        id: bookingId,

        eventId: booking.eventId,

        personName: personName,

        email: email,

        numberOfTickets: requestedTickets,

        totalAmount: totalAmount,

        status: normalizedBooking.status

    };
}


// ------------------------------------------------
// Get all bookings
// ------------------------------------------------

async function getAllBookings() {

    return bookingDao.findAll();

}


// ------------------------------------------------
// Get booking by ID
// ------------------------------------------------

async function getBookingById(id) {

    return bookingDao.findById(id);

}


// ------------------------------------------------
// Export functions
// ------------------------------------------------

module.exports = {

    bookTickets,

    getAllBookings,

    getBookingById

};