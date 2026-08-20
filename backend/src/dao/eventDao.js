const { getPool, readDatabase } = require('../config/database');
const Event = require('../models/event');

function getBookedTicketsForEvent(data, eventId) {
  return (data.bookings || [])
    .filter((row) => row.event_id === Number(eventId))
    .reduce((total, row) => total + Number(row.number_of_tickets ?? row.tickets_count ?? 0), 0);
}

async function findAll() {
  const pool = getPool();
  if (pool) {
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
      console.warn('MySQL event query failed, falling back to JSON storage:', error.message);
    }
  }

  const data = readDatabase();
  return (data.events || []).map((row) => new Event({
    id: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    eventTime: row.event_time,
    price: row.price,
    imageUrl: row.image_url,
    availableTickets: row.available_tickets ?? row.availableTickets ?? 100,
    bookedTickets: getBookedTicketsForEvent(data, row.id)
  }));
}

async function findById(id) {
  const pool = getPool();
  if (pool) {
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
      console.warn('MySQL event lookup failed, falling back to JSON storage:', error.message);
    }
  }

  const data = readDatabase();
  const row = (data.events || []).find((event) => event.id === Number(id));
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
    availableTickets: row.available_tickets ?? row.availableTickets ?? 100,
    bookedTickets: getBookedTicketsForEvent(data, row.id)
  });
}

module.exports = {
  findAll,
  findById
};
