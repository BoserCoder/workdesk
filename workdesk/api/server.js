// Vercel adapter. All the real logic (login, cookies, /api/*, /go/*) lives in
// ../_worker.js and is shared with Cloudflare, so edit GAMES / USER / PASS there.
import worker from '../_worker.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  // vercel.json rewrites send the original path along as ?p=/api/login etc.
  const url = new URL(request.url);
  const p = url.searchParams.get('p');
  if (p) {
    url.pathname = p;
    url.searchParams.delete('p');
    const init = { method: request.method, headers: request.headers };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.arrayBuffer();
    }
    request = new Request(url.toString(), init);
  }
  // process.env gives the worker access to SESSION_SECRET if you set it.
  return worker.fetch(request, process.env);
}
