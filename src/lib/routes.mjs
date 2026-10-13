// routes.mjs - paths, slugs, href normalisation and the route table (PIPELINE). Node builtins only.
// BUILD-CONTRACT 4.1 (routes) and 4.3 (links). Evidence: audit/site-inventory.json (92 records: 91 x 200 + 1 x 404).
import { ORIGIN, readJSON } from './site.mjs';

const HOST_RE = /^(?:https?:)?\/\/(?:www\.)?werollup\.com(?=[/?#]|$)/i;

/** split a URL or href into { path, query, hash } (query/hash keep their source spelling, leading ?/# included) */
export function splitUrl(u) {
  let s = String(u);
  let hash = '';
  const h = s.indexOf('#');
  if (h >= 0) { hash = s.slice(h); s = s.slice(0, h); }
  let query = '';
  const q = s.indexOf('?');
  if (q >= 0) { query = s.slice(q); s = s.slice(0, q); }
  return { path: s, query, hash };
}

/** a site path in output form: leading and trailing slash ('/' = home); a file path (has an extension) keeps no slash */
export function outPath(p) {
  let s = String(p || '/');
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/{2,}/g, '/');
  const last = s.split('/').pop();
  if (/\.[a-z0-9]{2,5}$/i.test(last)) return s;
  return s.endsWith('/') ? s : s + '/';
}

/** the page path of an absolute live URL (https://werollup.com/x/y?q -> /x/y/) */
export function pathOfUrl(u) { return outPath(splitUrl(String(u).replace(HOST_RE, '')).path || '/'); }
export function queryOfUrl(u) { return splitUrl(String(u).replace(HOST_RE, '')).query; }

/** slug of an output path: '/' -> 'index', '/a/b/' -> 'a-b' (equals the raw file name of the base record) */
export const slugOf = (p) => (p === '/' ? 'index' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

/** an internal href? (root-relative, protocol-relative or absolute on werollup.com) */
export function isInternal(href) {
  const s = String(href || '').trim();
  if (!s || s.startsWith('#')) return false;
  if (/^(mailto|tel|javascript|data|sms):/i.test(s)) return false;
  if (HOST_RE.test(s)) return true;
  return s.startsWith('/') && !s.startsWith('//');
}

/**
 * BUILD-CONTRACT 4.3: internal hrefs are normalised to the trailing-slash output path; query and fragment are kept as
 * the source spells them; every other href (external, tel:, mailto:, '#') stays as the source has it.
 */
export function normalizeHref(href) {
  const s = String(href == null ? '' : href).trim();
  if (!isInternal(s)) return s;
  const { path, query, hash } = splitUrl(s.replace(HOST_RE, ''));
  return outPath(path || '/') + query + hash;
}

/**
 * A8 link-target corrections (BUILD-CONTRACT 4.3, OPEN-DECISIONS A8). Keyed by the NORMALISED source href, so every
 * spelling of the same target is caught. Each application is recorded in src/content/changes.json by the extractor.
 */
export const A8_LINK_FIXES = [
  {
    id: 'A8-vape',
    from: '/shop-playa-vista/?filters%5Broot_types%5D%5B%5D=vape',
    to: '/location/san-pedro/shop/?filters%5Broot_types%5D%5B%5D=vape',
    why: 'San Pedro "Order Vaporizers & Cartridges" landed on the Culver City shop with the filter dropped (alias /shop-playa-vista); the San Pedro menu family already uses this target (COMMERCE.md D-1).',
  },
  {
    id: 'A8-edibles',
    from: '/products/edibles-gummies/',
    to: '/products/edibles/',
    why: '/products/edibles-gummies/ is a 404 (audit/failures.json); the /edibles-gummies alias lands on /products/edibles (SITE-ARCHITECTURE.md section 10).',
  },
];

/** the crawl's page records, grouped into served paths (54) with their query-string variants (37) */
export function loadRouteTable() {
  const inv = readJSON('audit/site-inventory.json');
  const ok = inv.pages.filter((p) => p.status === 200);
  const byPath = new Map();
  for (const rec of ok) {
    const p = pathOfUrl(rec.url);
    const q = queryOfUrl(rec.url);
    if (!byPath.has(p)) byPath.set(p, { path: p, base: null, variants: [], aliases: [] });
    const e = byPath.get(p);
    if (q) e.variants.push({ query: q, sourceUrl: rec.url, rawFile: 'audit/raw/' + rec.savedAs });
    else e.base = { sourceUrl: rec.url, rawFile: 'audit/raw/' + rec.savedAs, finalUrl: rec.finalUrl, redirectChain: rec.redirectChain || [] };
    for (const a of rec.aliases || []) e.aliases.push(a);
  }
  const paths = [...byPath.values()];
  for (const e of paths) {
    if (!e.base) throw new Error('route table: path ' + e.path + ' has query variants but no base record');
    e.variants.sort((a, b) => (a.query < b.query ? -1 : a.query > b.query ? 1 : 0));
  }
  paths.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const aliases = [];
  for (const e of paths) for (const a of e.aliases) aliases.push({ from: a, fromPath: pathOfUrl(a), fromQuery: queryOfUrl(a), to: e.path });
  aliases.sort((a, b) => (a.fromPath < b.fromPath ? -1 : a.fromPath > b.fromPath ? 1 : 0));
  const failed = inv.pages.filter((p) => p.status !== 200).map((p) => ({ url: p.url, path: pathOfUrl(p.url), status: p.status }));
  return { paths, aliases, failed, records: ok.length };
}

export { ORIGIN };
