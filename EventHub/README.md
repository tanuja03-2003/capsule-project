# EventHub — New Frontend

A clean, medium-complexity event ticketing + venue access UI inspired by the general flow of modern ticket-booking platforms.

## Pages
- `index.html` — Home
- `events.html` — Search/filter events
- `event-details.html` — Event details
- `booking.html` — Seat selection + booking
- `my-tickets.html` — Digital ticket
- `features.html` — Project flow/features
- `about.html`
- `contact.html`

## Run
Because this is a static frontend, you can open `index.html` directly, but using VS Code Live Server is recommended.

## Connect your Spring Boot backend
Open `js/api.js`:
1. Set `USE_DEMO_DATA = false`
2. Set `API_BASE_URL` to your backend, for example `http://localhost:8080/api`
3. Match these functions to your real endpoints:
   - `GET /events`
   - `GET /events/{id}`
   - `POST /bookings`

If your backend uses different endpoints, only `js/api.js` needs to change for the basic UI flow.

## Important
The seat selection and ticket QR-looking block are frontend/demo behavior. For your final capsule integration, the backend should own:
- real seat availability
- booking persistence
- payment status
- ticket/QR generation
- venue access validation
- authentication/authorization
