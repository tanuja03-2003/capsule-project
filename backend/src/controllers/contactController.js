const contactService = require('../services/contactService');

async function getAllMessages(req, res, next) {
  try {
    const contacts = await contactService.getAllMessages();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
}

async function submitContact(req, res, next) {
  try {
    const contactId = await contactService.submitContact(req.body);
    res.status(201).json({
      success: true,
      message: 'Contact message saved successfully',
      contactId
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getAllMessages,
  submitContact
};
