document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const event = await getEventById(id);
  const title = document.querySelector("#bookingEvent");
  const date = document.querySelector("#bookingDate");
  const seatsInput = document.querySelector("#selectedSeats");
  const total = document.querySelector("#total");
  const seatGrid = document.querySelector("#seatGrid");
  const form = document.querySelector("#bookingForm");
  const result = document.querySelector("#bookingResult");

  if (!event) {
    document.querySelector("#bookingRoot").innerHTML = `<div class="empty">Event not found.</div>`;
    return;
  }

  title.textContent = event.title;
  date.textContent = `${formatDate(event.date)} • ${event.time} • ${event.venue}`;
  const seatPrice = event.price;
  const selected = [];

  const booked = new Set(["A3","B4","C6","D2","E7","F5","G4","H8"]);

  for (const row of "ABCDEFGH") {
    for (let n = 1; n <= 8; n++) {
      const code = `${row}${n}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seat" + (booked.has(code) ? " booked" : "");
      btn.textContent = code;
      btn.disabled = booked.has(code);

      btn.addEventListener("click", () => {
        const index = selected.indexOf(code);
        if (index >= 0) {
          selected.splice(index, 1);
          btn.classList.remove("selected");
        } else if (selected.length < 6) {
          selected.push(code);
          btn.classList.add("selected");
        } else {
          showToast("You can select up to 6 seats.");
        }
        updateSummary();
      });
      seatGrid.appendChild(btn);
    }
  }

  function updateSummary() {
    seatsInput.textContent = selected.length ? selected.join(", ") : "No seats selected";
    total.textContent = `₹${selected.length * seatPrice}`;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selected.length) {
      showToast("Please select at least one seat.");
      return;
    }

    const booking = await createBooking({
  eventId: event.id,
  eventName: event.title,
  seats: selected,
  customerName: document.querySelector("#customerName").value,
  customerEmail: document.querySelector("#customerEmail").value,
  amount: selected.length * seatPrice,
  numberOfTickets: selected.length
});

    localStorage.setItem("lastBooking", JSON.stringify({
      ...booking,
      event,
      seats:selected,
      customerName:document.querySelector("#customerName").value,
      customerEmail:document.querySelector("#customerEmail").value,
      amount:selected.length * seatPrice
    }));

    result.innerHTML = `
      <div class="alert alert-success">
        <strong>Booking confirmed!</strong><br>
        Booking ID: ${booking.bookingId}
      </div>
      <a class="btn btn-primary" href="my-tickets.html">View My Ticket</a>`;
    result.scrollIntoView({behavior:"smooth"});
  });

  updateSummary();
});
