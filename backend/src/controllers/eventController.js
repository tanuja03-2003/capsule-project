const eventService = require('../services/eventService');

async function getAllEvents(req, res, next) {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.json(event);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEvents,
  getEventById
};
