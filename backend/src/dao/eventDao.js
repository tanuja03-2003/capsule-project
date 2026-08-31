const { getPool, readDatabase } = require('../config/database');
const Event = require('../models/event');

function getBookedTicketsForEvent(data, eventId) {
  return (data.bookings || [])
    .filter((row) => row.event_id === Number(eventId))
    .reduce((total, row) => total + Number(row.number_of_tickets ?? row.tickets_count ?? 0), 0);
}

async function findAll() {
  const pool = getPool();
  if (!pool) {
    const error = new Error('MySQL is not available');
    error.statusCode = 500;
    throw error;
  }

  try {
    const [rows] = await pool.query(`
      SELECT e.*, COALESCE(SUM(b.number_of_tickets), 0) AS booked_tickets
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY e.id
      ORDER BY e.id ASC
    `);

    return rows.map((row) => new Event({
      id: row.id,
      name: row.name,
      description: row.description,
      location: row.location,
      eventDate: row.event_date,
      eventTime: row.event_time,
      price: row.price,
      imageUrl: row.image_url,
      availableTickets: Number(row.available_tickets ?? 0),
      bookedTickets: Number(row.booked_tickets ?? 0)
    }));
  } catch (error) {
    const wrappedError = new Error('Events could not be loaded from MySQL');
    wrappedError.statusCode = 500;
    wrappedError.cause = error;
    throw wrappedError;
  }
}

async function findById(id) {
  const pool = getPool();
  if (!pool) {
    const error = new Error('MySQL is not available');
    error.statusCode = 500;
    throw error;
  }

  try {
    const [rows] = await pool.query(`
      SELECT e.*, COALESCE(SUM(b.number_of_tickets), 0) AS booked_tickets
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return new Event({
      id: row.id,
      name: row.name,
      description: row.description,
      location: row.location,
      eventDate: row.event_date,
      eventTime: row.event_time,
      price: row.price,
      imageUrl: row.image_url,
      availableTickets: Number(row.available_tickets ?? 0),
      bookedTickets: Number(row.booked_tickets ?? 0)
    });
  } catch (error) {
    const wrappedError = new Error('Event could not be loaded from MySQL');
    wrappedError.statusCode = 500;
    wrappedError.cause = error;
    throw wrappedError;
  }
}

module.exports = {
  findAll,
  findById
};
