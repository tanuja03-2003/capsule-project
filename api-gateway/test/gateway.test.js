const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');
const createRateLimiter = require('../src/middleware/rateLimiter');
const express = require('express');

// Helper to perform simple HTTP requests against an Express app
function request(app) {
  const server = http.createServer(app);
  return {
    async get(path, headers = {}) {
      return new Promise((resolve, reject) => {
        server.listen(0, () => {
          const port = server.address().port;
          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path,
            method: 'GET',
            headers
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              server.close();
              try {
                resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode, headers: res.headers, text: data });
              }
            });
          });
          req.on('error', (err) => { server.close(); reject(err); });
          req.end();
        });
      });
    },
    async post(path, body = {}, headers = {}) {
      return new Promise((resolve, reject) => {
        server.listen(0, () => {
          const port = server.address().port;
          const payload = JSON.stringify(body);
          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
              ...headers
            }
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              server.close();
              try {
                resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode, headers: res.headers, text: data });
              }
            });
          });
          req.on('error', (err) => { server.close(); reject(err); });
          req.write(payload);
          req.end();
        });
      });
    }
  };
}

test('API Gateway - GET /health returns 200 and UP status', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, 'UP');
  assert.equal(res.body.service, 'api-gateway');
  assert.ok(res.headers['x-request-id']);
});

test('API Gateway - Unknown route returns standardized 404 JSON', async () => {
  const res = await request(app).get('/api/non-existent-endpoint');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
  assert.equal(res.body.error.statusCode, 404);
});

test('API Gateway - Downstream unavailable returns standardized 503 JSON', async () => {
  // Requesting payments while payment service on 3002 is not running
  const res = await request(app).post('/api/payments', { bookingId: 1, amount: 100 });
  assert.equal(res.status, 503);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'SERVICE_UNAVAILABLE');
  assert.equal(res.body.error.statusCode, 503);
  assert.ok(res.body.error.requestId);
});

test('API Gateway - Rate limiter blocks requests exceeding quota (429)', async () => {
  const testApp = express();
  testApp.use(createRateLimiter({ windowMs: 10000, maxRequests: 2 }));
  testApp.get('/test', (req, res) => res.json({ ok: true }));

  const client = request(testApp);
  const r1 = await client.get('/test');
  assert.equal(r1.status, 200);
  const r2 = await client.get('/test');
  assert.equal(r2.status, 200);

  const r3 = await client.get('/test');
  assert.equal(r3.status, 429);
  assert.equal(r3.body.success, false);
  assert.equal(r3.body.error.code, 'RATE_LIMIT_EXCEEDED');
  assert.ok(r3.headers['retry-after']);
});

test('API Gateway - Proxy correctly forwards request to downstream mock server', async () => {
  // Create a lightweight downstream mock server
  const downstreamApp = express();
  downstreamApp.use(express.json());
  downstreamApp.get('/api/events', (req, res) => {
    res.json({
      events: [{ id: 1, name: 'Sample Fest' }],
      receivedRequestId: req.headers['x-request-id']
    });
  });

  const mockServer = http.createServer(downstreamApp);
  await new Promise(resolve => mockServer.listen(0, resolve));
  const downstreamPort = mockServer.address().port;

  // Configure a test gateway pointing to this mock
  process.env.EVENT_SERVICE_URL = `http://127.0.0.1:${downstreamPort}`;
  delete require.cache[require.resolve('../src/config')];
  delete require.cache[require.resolve('../src/routes/gatewayRoutes')];
  delete require.cache[require.resolve('../src/app')];
  const freshApp = require('../src/app');

  const res = await request(freshApp).get('/api/events');
  mockServer.close();

  assert.equal(res.status, 200);
  assert.equal(res.body.events[0].name, 'Sample Fest');
  assert.ok(res.body.receivedRequestId, 'X-Request-Id must be forwarded downstream');
});
