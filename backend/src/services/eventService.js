const eventDao = require('../dao/eventDao');

async function getAllEvents() {
  return eventDao.findAll();
}

async function getEventById(id) {
  return eventDao.findById(id);
}

module.exports = {
  getAllEvents,
  getEventById
};
