const { getPool, readDatabase, writeDatabase } = require('../config/database');
const Contact = require('../models/contact');

async function saveContact(contact) {
  const pool = getPool();
  if (pool) {
    try {
      const [result] = await pool.query(
        'INSERT INTO contacts (name, email, subject, message, submitted_at) VALUES (?, ?, ?, ?, ?)',
        [contact.name, contact.email, contact.subject || '', contact.message, new Date().toISOString()]
      );
      return result.insertId;
    } catch (error) {
      console.warn('MySQL contact insert failed, falling back to JSON storage:', error.message);
    }
  }

  const data = readDatabase();
  const newContact = {
    id: (data.contacts || []).length + 1,
    name: contact.name,
    email: contact.email,
    subject: contact.subject || '',
    message: contact.message,
    submitted_at: new Date().toISOString()
  };

  data.contacts.push(newContact);
  writeDatabase(data);
  return newContact.id;
}

async function findAll() {
  const pool = getPool();
  if (pool) {
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
      console.warn('MySQL contacts query failed, falling back to JSON storage:', error.message);
    }
  }

  const data = readDatabase();
  return (data.contacts || []).map((row) => new Contact({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    submittedAt: row.submitted_at
  }));
}

module.exports = {
  saveContact,
  findAll
};
