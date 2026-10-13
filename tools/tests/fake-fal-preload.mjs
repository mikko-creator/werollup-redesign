// Preload for tools/tests/test-fal-one.mjs: replaces global fetch with a fake fal queue. No network, no spend.
// FAKE_FAL_CASE: 'filtered' (1024x768, 10 KB), 'ok' (2752x1536, 500 KB), 'nsfw' (full size, has_nsfw_concepts [true]).
// The submitted body is written to FAKE_FAL_LOG so the test can assert the defaults that were sent.
import fs from 'node:fs';
const CASE = process.env.FAKE_FAL_CASE || 'ok';
const LOG = process.env.FAKE_FAL_LOG;
// FAKE_FAL_BIG_FILE: serve a real image's bytes as the full-size result (needed where the caller decodes or labels it).
const big = process.env.FAKE_FAL_BIG_FILE ? fs.readFileSync(process.env.FAKE_FAL_BIG_FILE) : Buffer.alloc(500000, 7);
const tiny = Buffer.alloc(10372, 0);
const json = (o) => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://queue.fal.run/') && opts.method === 'POST') {
    if (LOG) fs.appendFileSync(LOG, JSON.stringify({ url: u, body: JSON.parse(opts.body) }) + '\n');
    return json({ request_id: 'fake-req-1', status_url: 'https://fake.status/1', response_url: 'https://fake.response/1' });
  }
  if (u === 'https://fake.status/1') return json({ status: 'COMPLETED' });
  if (u === 'https://fake.response/1') {
    if (CASE === 'filtered') return json({ images: [{ url: 'https://fake.img/tiny.jpg', width: 1024, height: 768, content_type: 'image/jpeg' }], seed: 1, has_nsfw_concepts: [false] });
    if (CASE === 'nsfw') return json({ images: [{ url: 'https://fake.img/big.jpg', width: 2752, height: 1536, content_type: 'image/jpeg' }], seed: 1, has_nsfw_concepts: [true] });
    return json({ images: [{ url: 'https://fake.img/big.jpg', width: 2752, height: 1536, content_type: 'image/jpeg' }], seed: 1, has_nsfw_concepts: [false] });
  }
  if (u === 'https://fake.img/tiny.jpg') return new Response(tiny, { status: 200 });
  if (u === 'https://fake.img/big.jpg') return new Response(big, { status: 200 });
  throw new Error('fake fetch: unexpected URL ' + u);
};
