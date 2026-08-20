const bookingService = require('../services/bookingService');

async function getAllBookings(req, res, next) {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.bookTickets(req.body);
    res.status(201).json({
      success: true,
      message: 'Booking successful',
      booking
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBookings,
  createBooking,
  getBookingById
};
