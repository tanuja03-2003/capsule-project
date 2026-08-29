document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const event = await getEventById(id);
  const root = document.querySelector("#eventDetails");

  if (!event) {
    root.innerHTML = `<div class="empty">Event not found. <a href="events.html" style="color:#f84464">Browse events</a></div>`;
    return;
  }

  root.innerHTML = `
    <div class="detail-grid">
      <div class="poster">${event.emoji || "🎟️"}</div>
      <div class="detail-info">
        <h1>${event.title}</h1>
        <div class="sub">${event.category} • ${event.rating} ★ rating</div>

        <div class="info-row">
          <div class="icon">📅</div>
          <div><strong>${formatDate(event.date)}</strong><span>${event.time}</span></div>
        </div>
        <div class="info-row">
          <div class="icon">📍</div>
          <div><strong>${event.venue}</strong><span>${event.city}</span></div>
        </div>
        <div class="info-row">
          <div class="icon">🎟️</div>
          <div><strong>Tickets from ₹${event.price}</strong><span>Secure digital ticket</span></div>
        </div>

        <div class="detail-box">
          <h3>About the event</h3>
          <p style="color:#666;margin-top:8px">${event.description}</p>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <a class="btn btn-primary" href="booking.html?id=${event.id}">Book Tickets</a>
          <a class="btn btn-outline" href="events.html">Back to Events</a>
        </div>
      </div>
    </div>`;
});
