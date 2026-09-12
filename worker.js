import { onRequestGet, onRequestPost } from './functions/api/customer-service.js';

function methodNotAllowed() {
  return Response.json(
    { ok: false, error: 'Method not allowed' },
    {
      status: 405,
      headers: {
        'Allow': 'GET, POST',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/customer-service') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      if (request.method === 'GET') return onRequestGet();
      return methodNotAllowed();
    }

    return env.ASSETS.fetch(request);
  }
};
