const { getPool, readDatabase, writeDatabase } = require('../config/database');
const Booking = require('../models/booking');

async function createBooking(booking, updatedAvailableTickets) {
  const pool = getPool();

  if (!pool) {
    const error = new Error('MySQL is not available');
    error.statusCode = 500;
    throw error;
  }

  try {
    const normalizedName = (booking.personName || booking.customerName || 'Guest Customer').toString().trim();
    const normalizedEmail = (booking.email || '').toString().trim();

    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR name = ? LIMIT 1',
      [normalizedEmail || null, normalizedName]
    );

    let userId;
    if (userRows.length > 0) {
      userId = userRows[0].id;
    } else {
      const [insertUser] = await pool.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [normalizedName, normalizedEmail || null]
      );
      userId = insertUser.insertId;
    }

    const [eventRows] = await pool.query(
      'SELECT available_tickets, price FROM events WHERE id = ?',
      [booking.eventId]
    );

    if (eventRows.length === 0) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    const currentAvailable = Number(eventRows[0].available_tickets || 0);

    if (currentAvailable < Number(booking.numberOfTickets)) {
      throw new Error('Not enough tickets available');
    }

    const [result] = await pool.query(
      `INSERT INTO bookings
      (user_id, event_id, person_name, email, number_of_tickets, total_amount, booking_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        booking.eventId,
        normalizedName,
        normalizedEmail || null,
        booking.numberOfTickets,
        booking.totalAmount,
        booking.bookingDate || new Date(),
        booking.status || 'CONFIRMED'
      ]
    );

    await pool.query(
      'UPDATE events SET available_tickets = ? WHERE id = ?',
      [updatedAvailableTickets, booking.eventId]
    );

    return result.insertId;
  } catch (error) {
    if (error.message === 'Not enough tickets available' || error.statusCode === 404) {
      throw error;
    }

    const wrappedError = new Error('Booking could not be created in MySQL');
    wrappedError.statusCode = 500;
    wrappedError.cause = error;
    throw wrappedError;
  }
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
      SELECT
        b.id,
        b.user_id,
        b.event_id,
        u.name AS person_name,
        u.email,
        b.number_of_tickets,
        b.total_amount,
        b.booking_date,
        b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.id ASC
    `);

    return rows.map((row) => new Booking({
      id: row.id,
      eventId: row.event_id,
      personName: row.person_name,
      email: row.email,
      numberOfTickets: row.number_of_tickets,
      totalAmount: row.total_amount,
      bookingDate: row.booking_date,
      status: row.status
    }));
  } catch (error) {
    const wrappedError = new Error('Bookings could not be loaded from MySQL');
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
      SELECT
        b.id,
        b.user_id,
        b.event_id,
        u.name AS person_name,
        u.email,
        b.number_of_tickets,
        b.total_amount,
        b.booking_date,
        b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [id]);

    const row = rows[0];

    if (!row) {
      return null;
    }

    return new Booking({
      id: row.id,
      eventId: row.event_id,
      personName: row.person_name,
      email: row.email,
      numberOfTickets: row.number_of_tickets,
      totalAmount: row.total_amount,
      bookingDate: row.booking_date,
      status: row.status
    });
  } catch (error) {
    const wrappedError = new Error('Booking could not be loaded from MySQL');
    wrappedError.statusCode = 500;
    wrappedError.cause = error;
    throw wrappedError;
  }
}


module.exports = {
  createBooking,
  findAll,
  findById
};