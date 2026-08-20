const test = require('node:test');
const assert = require('node:assert');

const bookingService = require('../src/services/bookingService');

test('should reject booking when numberOfTickets is 0', async () => {
  await assert.rejects(
    bookingService.bookTickets({
      eventId: 1,
      personName: 'Tanuja',
      numberOfTickets: 0
    }),
    {
      message: 'numberOfTickets must be a positive integer'
    }
  );
});