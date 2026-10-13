// redact-vendor-secrets.mjs - for PUBLISHED copies only (the public repo export and the Pages preview): replace every
// value inside Jane's <script id="jane-app-secrets"> JSON with "REDACTED". The block holds about 20 vendor client tokens
// (Algolia, Mixpanel, Datadog, Braze, Mapbox, Google Places, reCAPTCHA...). They are published by Jane on werollup.com,
// but GitHub push protection classifies the Mapbox token as a secret (2026-10-14), and a public repo must not republish a
// third party's tokens. dist/ in the workspace keeps the block byte-identical (build-check embed gate); only copies
// leaving this machine are redacted. The Jane menu is not expected to render off werollup.com anyway (OPEN-DECISIONS B13).
// Handles the plain HTML block (built pages) and the JSON-escaped block inside page models (src/content/pages/*.json).
// After redacting, it fails (exit 1) if any AIza / Mapbox-style token is left in the folder, or if a plain block no
// longer parses as JSON.
//   node tools/redact-vendor-secrets.mjs --dir <folder>
import fs from 'node:fs';
import path from 'node:path';

const i = process.argv.indexOf('--dir');
const DIR = i > 0 ? path.resolve(process.argv[i + 1]) : null;
if (!DIR || !fs.existsSync(DIR)) { console.error('need --dir <existing folder>'); process.exit(2); }

const TOKEN = /AIza[0-9A-Za-z_-]{35}|\b(?:pk|sk|tk)\.ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g;
const PLAIN = /(<script\b[^>]*\bid="jane-app-secrets"[^>]*>)([\s\S]*?)(<\/script>)/g;
const ESCAPED = /(<script\b[^>]*\bid=\\"jane-app-secrets\\"[^>]*>)([\s\S]*?)(<\\?\/script>)/g;
let files = 0, blocks = 0, values = 0;
const bad = [];

function redactPlain(body) {
  return body.replace(/("[^"\\]+"\s*:\s*)"(?:[^"\\]|\\.)*"/g, (m, k) => { values++; return k + '"REDACTED"'; });
}
function redactEscaped(body) {
  return body.replace(/(\\"[^"\\]+\\"\s*:\s*)\\"(?:[^"\\]|\\[^"])*\\"/g, (m, k) => { values++; return k + '\\"REDACTED\\"'; });
}

(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== '.git') walk(p); continue; }
    if (!/\.(html|json)$/i.test(f)) continue;
    const s = fs.readFileSync(p, 'utf8');
    if (!s.includes('jane-app-secrets')) continue;
    let out = s.replace(PLAIN, (m, a, body, z) => { blocks++; const r = redactPlain(body); try { JSON.parse(r); } catch (e) { bad.push(path.relative(DIR, p) + ': redacted block does not parse: ' + e.message.slice(0, 80)); } return a + r + z; });
    out = out.replace(ESCAPED, (m, a, body, z) => { blocks++; return a + redactEscaped(body) + z; });
    if (out !== s) { fs.writeFileSync(p, out); files++; }
  }
}(DIR));

// whole-folder re-scan: no token of these shapes may remain anywhere (text files)
const left = [];
(function scan(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== '.git') scan(p); continue; }
    if (!/\.(html|json|js|css|md|txt|xml)$/i.test(f)) continue;
    const s = fs.readFileSync(p, 'utf8');
    TOKEN.lastIndex = 0;
    const n = (s.match(TOKEN) || []).length;
    if (n) left.push(path.relative(DIR, p) + ' (' + n + ')');
  }
}(DIR));
console.log('redact-vendor-secrets ' + DIR + ' | files changed ' + files + ' | blocks ' + blocks + ' | values redacted ' + values + ' | tokens left ' + left.length + ' | unparseable blocks ' + bad.length);
for (const x of left.slice(0, 10)) console.log('  LEFT ' + x);
for (const x of bad.slice(0, 10)) console.log('  BAD ' + x);
process.exitCode = left.length || bad.length ? 1 : 0;
