/*
  EventHub API layer.
  Start with demo data so the UI works even before the backend is connected.
  When your Spring Boot backend is ready:
    1. Change USE_DEMO_DATA to false.
    2. Change API_BASE_URL to your backend URL.
    3. Update endpoint paths if your controllers use different routes.
*/

const API_BASE_URL = "http://localhost:3000/api";
const USE_DEMO_DATA = false;

const demoEvents = [
  {id:1,title:"Sunburn Arena",category:"Music",date:"2026-09-12",time:"7:00 PM",venue:"Phoenix Arena",city:"Bengaluru",price:999,rating:4.7,emoji:"🎵",description:"A high-energy live music experience with popular artists, lights and an unforgettable crowd."},
  {id:2,title:"Bengaluru Tech Summit",category:"Conference",date:"2026-09-18",time:"10:00 AM",venue:"KTPO Convention Centre",city:"Bengaluru",price:499,rating:4.6,emoji:"💻",description:"Technology leaders, startups and developers come together for talks, networking and demos."},
  {id:3,title:"Stand-Up Night",category:"Comedy",date:"2026-09-05",time:"8:00 PM",venue:"Laugh Lounge",city:"Bengaluru",price:399,rating:4.5,emoji:"😂",description:"A fun evening of stand-up comedy featuring fresh performers and crowd favourites."},
  {id:4,title:"Food & Music Fest",category:"Festival",date:"2026-09-20",time:"5:00 PM",venue:"Central Grounds",city:"Bengaluru",price:299,rating:4.4,emoji:"🍔",description:"Street food, live performances and activities for a relaxed weekend with friends."},
  {id:5,title:"Indie Live Sessions",category:"Music",date:"2026-09-26",time:"6:30 PM",venue:"The Courtyard",city:"Bengaluru",price:599,rating:4.8,emoji:"🎸",description:"Discover independent artists and enjoy an intimate live music session."},
  {id:6,title:"Startup Meetup",category:"Business",date:"2026-10-03",time:"11:00 AM",venue:"Innovation Hub",city:"Bengaluru",price:199,rating:4.3,emoji:"🚀",description:"Meet founders, builders and investors and exchange ideas around new businesses."},
  {id:7,title:"Art & Culture Expo",category:"Arts",date:"2026-10-10",time:"10:00 AM",venue:"City Exhibition Hall",city:"Bengaluru",price:249,rating:4.2,emoji:"🎨",description:"An exhibition celebrating local artists, crafts and contemporary culture."},
  {id:8,title:"Football Fan Fest",category:"Sports",date:"2026-10-17",time:"4:00 PM",venue:"Sports Village",city:"Bengaluru",price:349,rating:4.6,emoji:"⚽",description:"Games, screenings and fan activities for football lovers."}
];

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {"Content-Type":"application/json", ...(options.headers || {})},
    ...options
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function getEvents() {
    if (USE_DEMO_DATA) return demoEvents;

    const events = await apiRequest("/events");

    return events.map(event => ({
        id: event.id,
        title: event.name,
        description: event.description,
        category: "Event",
        date: event.eventDate ? event.eventDate.substring(0, 10) : "",
        time: event.eventTime || "",
        venue: event.location,
        city: event.location,
        price: Number(event.price),
        rating: 4.5,
        emoji: "🎟️",
        imageUrl: event.imageUrl,
        availableTickets: event.availableTickets,
        bookedTickets: event.bookedTickets
    }));
}

async function getEventById(id) {
    if (USE_DEMO_DATA) {
        return demoEvents.find(e => Number(e.id) === Number(id));
    }

    const event = await apiRequest(`/events/${id}`);

    return {
        id: event.id,
        title: event.name,
        description: event.description,
        category: "Event",
        date: event.eventDate ? event.eventDate.substring(0, 10) : "",
        time: event.eventTime || "",
        venue: event.location,
        city: event.location,
        price: Number(event.price),
        rating: 4.5,
        emoji: "🎟️",
        imageUrl: event.imageUrl,
        availableTickets: event.availableTickets,
        bookedTickets: event.bookedTickets
    };
}

async function createBooking(booking) {
  if (USE_DEMO_DATA) {
    return {
      bookingId: "EVT" + Date.now().toString().slice(-8),
      status: "CONFIRMED",
      ...booking
    };
  }
  return apiRequest("/bookings", {method:"POST", body:JSON.stringify(booking)});
}
