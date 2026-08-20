const contactDao = require('../dao/contactDao');

async function submitContact(contact) {
  if (!contact || !contact.name || !contact.name.trim()) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!contact || !contact.email || !contact.email.trim()) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  if (!contact || !contact.message || !contact.message.trim()) {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  return contactDao.saveContact(contact);
}

async function getAllMessages() {
  return contactDao.findAll();
}

module.exports = {
  submitContact,
  getAllMessages
};
