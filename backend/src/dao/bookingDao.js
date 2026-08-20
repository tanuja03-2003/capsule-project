const { getPool, readDatabase, writeDatabase } = require('../config/database');
const Booking = require('../models/booking');

async function createBooking(booking, updatedAvailableTickets) {
  const pool = getPool();

  if (pool) {
    try {
      // Find the user using the name received from the frontend
      const [userRows] = await pool.query(
        'SELECT id, name FROM users WHERE name = ?',
        [booking.personName]
      );

      if (userRows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const userId = userRows[0].id;

      // Check available tickets
      const [eventRows] = await pool.query(
        'SELECT available_tickets, price FROM events WHERE id = ?',
        [booking.eventId]
      );

      if (eventRows.length === 0) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }

      const currentAvailable = Number(
        eventRows[0].available_tickets
      );

      if (currentAvailable < Number(booking.numberOfTickets)) {
        throw new Error('Not enough tickets available');
      }

      // Insert booking using YOUR MySQL table structure
      const [result] = await pool.query(
        `INSERT INTO bookings
        (user_id, event_id, number_of_tickets, total_amount, booking_date, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          booking.eventId,
          booking.numberOfTickets,
          booking.totalAmount,
          booking.bookingDate || new Date(),
          'CONFIRMED'
        ]
      );

      // Reduce available tickets
      await pool.query(
        'UPDATE events SET available_tickets = ? WHERE id = ?',
        [updatedAvailableTickets, booking.eventId]
      );

      return result.insertId;

    } catch (error) {
      if (
        error.message === 'Not enough tickets available' ||
        error.statusCode === 404
      ) {
        throw error;
      }

      console.warn(
        'MySQL booking insert failed, falling back to JSON storage:',
        error.message
      );
    }
  }

  // JSON fallback
  const data = readDatabase();

  const newBooking = {
    id: (data.bookings || []).length + 1,
    event_id: booking.eventId,
    person_name: booking.personName || '',
    customer_name: booking.personName || '',
    number_of_tickets: booking.numberOfTickets,
    total_amount: booking.totalAmount,
    booking_date: booking.bookingDate || new Date().toISOString(),
    status: 'CONFIRMED'
  };

  data.bookings.push(newBooking);

  const eventIndex = (data.events || []).findIndex(
    (event) => event.id === booking.eventId
  );

  if (eventIndex >= 0) {
    data.events[eventIndex].available_tickets =
      updatedAvailableTickets;
  }

  writeDatabase(data);

  return newBooking.id;
}


async function findAll() {
  const pool = getPool();

  if (pool) {
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
      console.warn(
        'MySQL booking query failed, falling back to JSON storage:',
        error.message
      );
    }
  }

  const data = readDatabase();

  return (data.bookings || []).map((row) => new Booking({
    id: row.id,
    eventId: row.event_id,
    personName:
      row.person_name ||
      row.customer_name ||
      row.personName ||
      row.customerName ||
      null,
    numberOfTickets: row.number_of_tickets,
    totalAmount: row.total_amount,
    bookingDate: row.booking_date,
    status: row.status
  }));
}


async function findById(id) {
  const pool = getPool();

  if (pool) {
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
      console.warn(
        'MySQL booking lookup failed, falling back to JSON storage:',
        error.message
      );
    }
  }

  const data = readDatabase();

  const row = (data.bookings || []).find(
    (item) => item.id === Number(id)
  );

  if (!row) {
    return null;
  }

  return new Booking({
    id: row.id,
    eventId: row.event_id,
    personName:
      row.person_name ||
      row.customer_name ||
      row.personName ||
      row.customerName ||
      null,
    numberOfTickets: row.number_of_tickets,
    totalAmount: row.total_amount,
    bookingDate: row.booking_date,
    status: row.status
  });
}


module.exports = {
  createBooking,
  findAll,
  findById
};