const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

const request = require('supertest');
const { getPool } = require('../src/config/database');

test('GET /api/events returns events', async () => {
  const response = await request(app).get('/api/events');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('POST /api/contacts validates input', async () => {
  const response = await request(app).post('/api/contacts').send({ name: '', email: 'bad', message: '' });
  assert.equal(response.status, 400);
});

test('POST /api/bookings rejects zero tickets', async () => {
  const response = await request(app)
    .post('/api/bookings')
    .send({
      eventId: 1,
      personName: 'Test User',
      numberOfTickets: 0
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
test.after(async () => {
  const pool = getPool();

  if (pool) {
    await pool.end();
  }
});