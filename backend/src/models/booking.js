class Booking {
  constructor({ id, eventId, personName, customerName, email, ticketsCount, totalAmount, bookingDate, status, numberOfTickets }) {
    this.id = id;
    this.eventId = eventId;
    this.personName = personName ?? customerName ?? null;
    this.customerName = personName ?? customerName ?? null;
    this.email = email;
    this.ticketsCount = ticketsCount ?? numberOfTickets ?? null;
    this.numberOfTickets = numberOfTickets ?? ticketsCount ?? null;
    this.totalAmount = totalAmount;
    this.bookingDate = bookingDate;
    this.status = status;
  }
}

module.exports = Booking;
