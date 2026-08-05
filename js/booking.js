// ===============================
// Event Data
// ===============================

const events = {

    music: {

        title: "Music Concert",

        venue: "Bangalore",

        date: "15 September 2026",

        price: 999,

        image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900",

        description:
            "Enjoy a live music concert featuring popular artists, amazing lighting, and an unforgettable experience."

    },

    tech: {

        title: "Tech Conference",

        venue: "Hyderabad",

        date: "25 September 2026",

        price: 799,

        image:
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900",

        description:
            "Meet industry experts, attend technical sessions and explore the latest innovations."

    },

    food: {

        title: "Food Festival",

        venue: "Chennai",

        date: "12 October 2026",

        price: 499,

        image:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",

        description:
            "Taste delicious dishes from famous chefs and restaurants across India."

    }

};


// ===============================
// Read URL
// ===============================

const params = new URLSearchParams(window.location.search);

const eventKey = params.get("event");

const currentEvent = events[eventKey] || events.music;


// ===============================
// HTML Elements
// ===============================

const eventTitle = document.getElementById("eventTitle");
const eventVenue = document.getElementById("eventVenue");
const eventDate = document.getElementById("eventDate");
const eventDescription = document.getElementById("eventDescription");
const eventImage = document.getElementById("eventImage");

const ticketPrice = document.getElementById("ticketPrice");

const quantity = document.getElementById("quantity");

const totalPrice = document.getElementById("totalPrice");

const summaryEvent = document.getElementById("summaryEvent");
const summaryVenue = document.getElementById("summaryVenue");
const summaryTickets = document.getElementById("summaryTickets");
const summaryPrice = document.getElementById("summaryPrice");
const summaryTotal = document.getElementById("summaryTotal");


// ===============================
// Load Event
// ===============================

function loadEvent() {

    eventTitle.innerText = currentEvent.title;

    eventVenue.innerText = currentEvent.venue;

    eventDate.innerText = currentEvent.date;

    eventDescription.innerText = currentEvent.description;

    eventImage.src = currentEvent.image;

    ticketPrice.innerText = currentEvent.price;

    summaryEvent.innerText = currentEvent.title;

    summaryVenue.innerText = currentEvent.venue;

    summaryPrice.innerText = currentEvent.price;

}

loadEvent();


// ===============================
// Quantity
// ===============================

let count = 1;

const plusBtn = document.getElementById("plusBtn");

const minusBtn = document.getElementById("minusBtn");

function updateBooking() {

    quantity.value = count;

    summaryTickets.innerText = count;

    const total = count * currentEvent.price;

    totalPrice.innerText = total;

    summaryTotal.innerText = total;

}

updateBooking();


// ===============================
// Increase
// ===============================

plusBtn.addEventListener("click", () => {

    count++;

    updateBooking();

});


// ===============================
// Decrease
// ===============================

minusBtn.addEventListener("click", () => {

    if (count > 1) {

        count--;

        updateBooking();

    }

});


// ===============================
// Booking
// ===============================

const bookBtn = document.getElementById("bookNowBtn");

bookBtn.addEventListener("click", () => {

    const total = count * currentEvent.price;

    const bookingId = "EVT" + Math.floor(Math.random() * 900000 + 100000);

    alert(

`Booking Successful!

Booking ID : ${bookingId}

Event : ${currentEvent.title}

Tickets : ${count}

Total Amount : ₹${total}

Thank you for booking with EventHub.`

    );

});