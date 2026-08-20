class Contact {
  constructor({ id, name, email, subject, message, submittedAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.subject = subject;
    this.message = message;
    this.submittedAt = submittedAt;
  }
}

module.exports = Contact;
