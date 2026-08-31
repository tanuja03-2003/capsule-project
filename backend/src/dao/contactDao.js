const { getPool, readDatabase, writeDatabase } = require('../config/database');
const Contact = require('../models/contact');

async function saveContact(contact) {
  const pool = getPool();
  if (!pool) {
    const error = new Error('MySQL is not available');
    error.statusCode = 500;
    throw error;
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, subject, message, submitted_at) VALUES (?, ?, ?, ?, ?)',
      [contact.name, contact.email, contact.subject || '', contact.message, new Date().toISOString()]
    );
    return result.insertId;
  } catch (error) {
    const wrappedError = new Error('Contact message could not be saved in MySQL');
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
      SELECT id, name, email, subject, message, submitted_at
      FROM contacts
      ORDER BY id ASC
    `);

    return rows.map((row) => new Contact({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      submittedAt: row.submitted_at
    }));
  } catch (error) {
    const wrappedError = new Error('Contacts could not be loaded from MySQL');
    wrappedError.statusCode = 500;
    wrappedError.cause = error;
    throw wrappedError;
  }
}

module.exports = {
  saveContact,
  findAll
};
