#!/usr/bin/env node
// route-check.mjs - the route table of BUILD-CONTRACT 4.1 holds in a built tree (PIPELINE). Offline, Node builtins.
// Reads the EVIDENCE (audit/site-inventory.json), not the pipeline's own routes.json, so a pipeline bug cannot hide:
//   - every one of the 91 page records (status 200) resolves to a served file <out>/<path>/index.html (a query string
//     needs no file), and the distinct paths number 54;
//   - every alias in pages[].aliases (14) has a redirect stub <out>/<alias>/index.html (meta refresh 0 to the target,
//     a canonical to the live target URL, a link) AND _redirects lines (slashless and slash forms, 301);
//   - every served path except "/" has its slashless form 301 to the trailing-slash form in _redirects;
//   - the 8 San Pedro /shop/menu/<cat>/ paths are served copies of the San Pedro shop page (Jane mount + module);
//   - 404.html exists and boots the Jane embed under /location/san-pedro/shop/menu/ (prefix test, same-origin fetch of
//     the San Pedro shop page, its Jane head inserted, static mount);
//   - the crawl's dead URL (/products/edibles-gummies) is not served.
// Positive controls (in memory): the same checks against a view of the tree with one page, one alias stub, one alias
// redirect line, one slash redirect line, one menu path and 404.html removed must report each loss.
//   node tools/route-check.mjs [--dir dist] [--json <file>]      exit 1 on any failure or a control that does not fire
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://werollup.com';
const MENU_PREFIX = '/location/san-pedro/shop/menu/';
const JANE_MOUNT = '<div id="app" class="app"></div>';
const JANE_MODULE = 'https://boost-assets.iheartjane.com/assets/index-D8IbwKpn.js';

const pathOf = (u) => {
  let p = String(u).replace(/^https?:\/\/(www\.)?werollup\.com/i, '').split('#')[0].split('?')[0] || '/';
  if (!p.startsWith('/')) p = '/' + p;
  return p.endsWith('/') ? p : p + '/';
};
const fileOf = (p) => (p === '/' ? 'index.html' : p.slice(1) + 'index.html');

export function checkRoutes(view, inv) {
  const fails = [];
  const ok = inv.pages.filter((r) => r.status === 200);
  const dead = inv.pages.filter((r) => r.status !== 200);
  const paths = new Set(ok.map((r) => pathOf(r.url)));
  let recordsResolved = 0;
  for (const r of ok) { if (view.exists(fileOf(pathOf(r.url)))) recordsResolved++; else fails.push({ kind: 'record-unresolved', url: r.url, file: fileOf(pathOf(r.url)) }); }
  let pathsServed = 0;
  for (const p of [...paths].sort()) { if (view.exists(fileOf(p))) pathsServed++; else fails.push({ kind: 'path-missing', path: p }); }
  const redirects = view.exists('_redirects') ? view.read('_redirects').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : null;
  if (!redirects) fails.push({ kind: '_redirects-missing' });
  const hasLine = (from, to) => !!redirects && redirects.some((l) => { const [f, t, c] = l.split(/\s+/); return f === from && t === to && c === '301'; });
  const aliases = [];
  for (const r of ok) for (const a of r.aliases || []) aliases.push({ from: pathOf(a), to: pathOf(r.url), raw: a });
  let stubs = 0, aliasLines = 0;
  for (const a of aliases) {
    const f = fileOf(a.from);
    if (!view.exists(f)) fails.push({ kind: 'alias-stub-missing', alias: a.from });
    else {
      const h = view.read(f);
      const refresh = new RegExp('<meta http-equiv="refresh" content="0; url=' + a.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '">');
      const canon = h.includes('<link rel="canonical" href="' + ORIGIN + a.to + '">');
      const link = h.includes('href="' + a.to + '"');
      if (refresh.test(h) && canon && link) stubs++; else fails.push({ kind: 'alias-stub-wrong', alias: a.from, refresh: refresh.test(h), canonical: canon, link });
    }
    const slashless = a.from.replace(/\/$/, '');
    if (hasLine(slashless, a.to) && hasLine(a.from, a.to)) aliasLines++; else fails.push({ kind: 'alias-redirect-missing', alias: a.from });
  }
  let slashLines = 0;
  for (const p of [...paths].sort()) { if (p === '/') continue; if (hasLine(p.replace(/\/$/, ''), p)) slashLines++; else fails.push({ kind: 'slash-redirect-missing', path: p }); }
  const menu = [...paths].filter((p) => p.startsWith(MENU_PREFIX)).sort();
  let menuOk = 0;
  for (const p of menu) {
    if (!view.exists(fileOf(p))) { fails.push({ kind: 'menu-path-missing', path: p }); continue; }
    const h = view.read(fileOf(p));
    if (h.includes(JANE_MOUNT) && h.includes(JANE_MODULE)) menuOk++; else fails.push({ kind: 'menu-path-not-jane', path: p });
  }
  let notFound = false;
  if (!view.exists('404.html')) fails.push({ kind: '404-missing' });
  else {
    const h = view.read('404.html');
    // the boot: the prefix test, a same-origin fetch of the San Pedro shop page and its Jane head markers, the mount
    notFound = h.includes(JSON.stringify(MENU_PREFIX)) && h.includes('fetch("/location/san-pedro/shop/"') && h.includes('Jane Menu Plugin Header') && h.includes(JANE_MOUNT);
    if (!notFound) fails.push({ kind: '404-no-jane-boot' });
  }
  for (const d of dead) if (view.exists(fileOf(pathOf(d.url)))) fails.push({ kind: 'dead-url-served', url: d.url });
  return {
    records: ok.length, recordsResolved, paths: paths.size, pathsServed, aliases: aliases.length, aliasStubs: stubs, aliasRedirectPairs: aliasLines,
    slashRedirects: slashLines, slashRedirectsExpected: paths.size - (paths.has('/') ? 1 : 0), menuPaths: menu.length, menuPathsServed: menuOk, notFound, deadNotServed: dead.length, fails,
  };
}

function diskView(dir) { return { exists: (rel) => fs.existsSync(path.join(dir, rel)), read: (rel) => fs.readFileSync(path.join(dir, rel), 'utf8') }; }

export function runControls(dir, inv) {
  const base = diskView(dir);
  const removed = new Set(['about-us/index.html', 'shop/index.html', 'location/san-pedro/shop/menu/gear/index.html', '404.html']);
  const view = {
    exists: (rel) => !removed.has(rel) && base.exists(rel),
    read: (rel) => {
      const t = base.read(rel);
      if (rel !== '_redirects') return t;
      return t.split('\n').filter((l) => !/^\/flower \/products\/flower\/ 301$/.test(l.trim()) && !/^\/contact \/contact\/ 301$/.test(l.trim())).join('\n');
    },
  };
  const r = checkRoutes(view, inv);
  const has = (k, pred) => r.fails.some((f) => f.kind === k && pred(f));
  const c = {
    pageRemoved: has('path-missing', (f) => f.path === '/about-us/') && has('record-unresolved', (f) => /\/about-us$/.test(f.url)),
    aliasStubRemoved: has('alias-stub-missing', (f) => f.alias === '/shop/'),
    aliasRedirectRemoved: has('alias-redirect-missing', (f) => f.alias === '/flower/'),
    slashRedirectRemoved: has('slash-redirect-missing', (f) => f.path === '/contact/'),
    menuPathRemoved: has('menu-path-missing', (f) => f.path === '/location/san-pedro/shop/menu/gear/'),
    notFoundRemoved: has('404-missing', () => true),
  };
  c.fired = Object.values(c).every(Boolean);
  return c;
}

const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (IS_MAIN) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? null : process.argv[i + 1]; };
  const dir = path.resolve(arg('--dir') || path.join(ROOT, 'dist'));
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/site-inventory.json'), 'utf8'));
  const r = checkRoutes(diskView(dir), inv);
  const c = runControls(dir, inv);
  console.log('route-check ' + dir);
  console.log('records ' + r.recordsResolved + '/' + r.records + ' resolve | paths ' + r.pathsServed + '/' + r.paths + ' served | alias stubs ' + r.aliasStubs + '/' + r.aliases + ' | alias _redirects pairs ' + r.aliasRedirectPairs + '/' + r.aliases + ' | slash 301s ' + r.slashRedirects + '/' + r.slashRedirectsExpected + ' | menu paths ' + r.menuPathsServed + '/' + r.menuPaths + ' (Jane mount + module) | 404 Jane boot ' + (r.notFound ? 'yes' : 'NO') + ' | dead crawl URLs not served ' + r.deadNotServed);
  for (const f of r.fails.slice(0, 30)) console.log('  FAIL ' + JSON.stringify(f));
  console.log('control: ' + (c.fired ? 'fired (removed page, alias stub, alias redirect, slash redirect, menu path and 404 each reported)' : 'DID NOT FIRE ' + JSON.stringify(c)));
  if (arg('--json')) fs.writeFileSync(path.resolve(arg('--json')), JSON.stringify({ result: r, control: c }, null, 1));
  const complete = !r.fails.length && r.paths === 54 && r.records === 91 && r.aliases === 14 && r.menuPaths === 8;
  process.exitCode = complete && c.fired ? 0 : 1;
}
