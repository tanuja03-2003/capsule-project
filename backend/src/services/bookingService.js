const bookingDao = require('../dao/bookingDao');
const eventService = require('./eventService');

async function bookTickets(booking) {
  const requestedTickets = Number(booking?.numberOfTickets ?? booking?.ticketsCount);
  const personName = (booking?.personName ?? booking?.customerName ?? '').toString().trim();

  if (!booking || !Number.isInteger(booking.eventId) || booking.eventId <= 0) {
    const error = new Error('Valid eventId is required');
    error.statusCode = 400;
    throw error;
  }

  if (!personName) {
    const error = new Error('personName is required and cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(requestedTickets) || requestedTickets <= 0) {
    const error = new Error('numberOfTickets must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const event = await eventService.getEventById(booking.eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const available = Number(event.availableTickets ?? 0);
  if (available < requestedTickets) {
    const error = new Error('Not enough tickets available');
    error.statusCode = 409;
    throw error;
  }

  const price = Number(event.price ?? 0);
const totalAmount = price * requestedTickets;

const normalizedBooking = {
  eventId: booking.eventId,
  personName,
  numberOfTickets: requestedTickets,
  totalAmount,
  bookingDate: new Date()
};

  const bookingId = await bookingDao.createBooking(normalizedBooking, available - requestedTickets);
  return {
  id: bookingId,
  eventId: booking.eventId,
  personName,
  numberOfTickets: requestedTickets,
  totalAmount
};
}

async function getAllBookings() {
  return bookingDao.findAll();
}

async function getBookingById(id) {
  return bookingDao.findById(id);
}

module.exports = {
  bookTickets,
  getAllBookings,
  getBookingById
};
