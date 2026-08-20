class Event {
  constructor({ id, name, description, location, eventDate, eventTime, price, imageUrl, availableTickets, bookedTickets }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.eventDate = eventDate;
    this.eventTime = eventTime;
    this.price = price;
    this.imageUrl = imageUrl;
    this.availableTickets = availableTickets;
    this.bookedTickets = bookedTickets;
  }
}

module.exports = Event;
