document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#ticketRoot");
  const booking = JSON.parse(localStorage.getItem("lastBooking") || "null");

  if (!booking) {
    root.innerHTML = `
      <div class="empty">
        <h3>No recent ticket found</h3>
        <p style="margin:8px 0 18px">Book an event first to see your digital ticket here.</p>
        <a class="btn btn-primary" href="events.html">Browse Events</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="ticket">
      <div class="ticket-head">
        <div style="font-size:13px;opacity:.85">EVENTHUB DIGITAL TICKET</div>
        <h1 style="margin-top:5px">${booking.event.title}</h1>
        <p>${formatDate(booking.event.date)} • ${booking.event.time}</p>
      </div>
      <div class="ticket-body">
        <div class="ticket-grid">
          <div>
            <p><strong>Booking ID</strong><br>${booking.bookingId}</p>
            <p style="margin-top:15px"><strong>Venue</strong><br>${booking.event.venue}, ${booking.event.city}</p>
            <p style="margin-top:15px"><strong>Seats</strong><br>${booking.seats.join(", ")}</p>
            <p style="margin-top:15px"><strong>Customer</strong><br>${booking.customerName}</p>
            <p style="margin-top:15px"><strong>Amount Paid</strong><br>₹${booking.amount}</p>
          </div>
          <div>
            <div class="qr"></div>
            <small style="display:block;text-align:center;color:#777;margin-top:8px">Scan at venue entry</small>
          </div>
        </div>
        <div class="alert alert-success" style="margin-top:22px">
          ✓ Ticket is confirmed. Show this screen at the venue entrance for access validation.
        </div>
        <button class="btn btn-dark" onclick="window.print()">Print Ticket</button>
      </div>
    </div>`;
});
