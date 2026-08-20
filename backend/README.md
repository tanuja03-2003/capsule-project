# EventHub Node.js Backend

This backend replaces the original Spring Boot implementation with a Node.js + Express service while preserving the existing EventHub API contract for the frontend.

## Requirements
- Node.js 20+
- npm

## Setup
1. Copy `.env.example` to `.env` if you want to override defaults.
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. The API will be available at `http://localhost:3000`

## API
- `GET /health`
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/contacts`
- `POST /api/contacts`

## Frontend integration
The frontend JavaScript files were updated to call the new Node.js backend on port `3000`.

## Tests
Run `npm test` to verify the migrated endpoints and input validation.
