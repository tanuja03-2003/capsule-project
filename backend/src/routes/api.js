const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');
const bookingController = require('../controllers/bookingController');
const contactController = require('../controllers/contactController');

const router = express.Router();

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  return next();
}

router.get('/events', eventController.getAllEvents);
router.get('/events/:id', [param('id').isInt().withMessage('Event id must be an integer')], validateRequest, eventController.getEventById);

router.get('/bookings', bookingController.getAllBookings);
router.get('/bookings/:id', [param('id').isInt().withMessage('Booking id must be an integer')], validateRequest, bookingController.getBookingById);
router.post('/bookings', [
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('Event id must be a positive integer'),

  body('personName')
    .trim()
    .notEmpty()
    .withMessage('personName is required and cannot be empty'),

  body('numberOfTickets')
    .isInt({ min: 1 })
    .withMessage('numberOfTickets must be at least 1')
], validateRequest, bookingController.createBooking);

router.get('/contacts', contactController.getAllMessages);
router.post('/contacts', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().trim().withMessage('Message is required')
], validateRequest, contactController.submitContact);

module.exports = router;
