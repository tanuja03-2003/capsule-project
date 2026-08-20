const test = require('node:test');
const assert = require('node:assert/strict');

const eventDao = require('../src/dao/eventDao');
const { getPool } = require('../src/config/database');

test('Event DAO should retrieve events from the database', async () => {
  const events = await eventDao.findAll();

  assert.ok(Array.isArray(events));
  assert.ok(events.length > 0);

  assert.ok(events[0].id);
  assert.ok(events[0].name);
});

test.after(async () => {
  const pool = getPool();

  if (pool) {
    await pool.end();
  }
});