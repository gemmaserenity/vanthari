import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/customer-service.js';

const endpoint = 'https://vanthari.example/api/customer-service';

function requestWith(overrides = {}) {
  return new Request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://vanthari.example' },
    body: JSON.stringify({
      name: 'Amina',
      email: 'amina@example.com',
      topic: 'Membership',
      message: 'Bonjour, je voudrais rejoindre la communauté.',
      website: '',
      startedAt: Date.now() - 2_000,
      ...overrides
    })
  });
}

function environment() {
  return {
    AI: {
      async run() {
        return { response: 'LANGUAGE: French\nTRANSLATION:\nHello, I would like to join the community.' };
      }
    },
    RESEND_API_KEY: 'test-key'
  };
}

test('translates, sends through Resend, and returns the visible translation', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  let sent;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.match(options.headers.Authorization, /^Bearer /);
    assert.ok(options.headers['Idempotency-Key']);
    sent = JSON.parse(options.body);
    return Response.json({ id: 'email_123' });
  };

  const response = await onRequestPost({ request: requestWith(), env: environment() });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload, {
    ok: true,
    detectedLanguage: 'French',
    translation: 'Hello, I would like to join the community.'
  });
  assert.equal(sent.to[0], 'support@gns-success.com');
  assert.equal(sent.reply_to, 'amina@example.com');
  assert.match(sent.text, /Bonjour/);
  assert.match(sent.text, /Hello/);
});

test('rejects incomplete submissions before translation or email', async () => {
  const response = await onRequestPost({ request: requestWith({ email: 'not-an-email' }), env: environment() });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).ok, false);
});

test('rejects cross-origin submissions', async () => {
  const request = requestWith();
  request.headers.set('Origin', 'https://attacker.example');
  const response = await onRequestPost({ request, env: environment() });
  assert.equal(response.status, 403);
});

test('returns method not allowed for a direct GET', async () => {
  const response = onRequestGet();
  assert.equal(response.status, 405);
});
