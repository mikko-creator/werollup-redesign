#!/usr/bin/env node
// operator-additions.mjs - declare the copy and links the OPERATOR asked for (revision 5 on) for the two parity gates.
// Node builtins only, plus the tokenizer of tools/text-parity.mjs (so the declared words are exactly the words the gate
// reads).
//
//   node tools/operator-additions.mjs [--dir dist]      (run after the build; writes src/content/operator-additions.json)
//
// Every element the theme adds at the operator's request carries data-r5="<name>" (src/theme/rosin.mjs, home.mjs,
// templates-b.mjs). For each such element in a built page, outermost first, in DOM order, this writes:
//   - a text-parity exception { kind: "remove-built", text: its words }, so the gate removes exactly those words, in that
//     order, from the built region before comparing it with the source; any OTHER added or changed word still fails;
//   - its links as build-check addedHrefs { href, count }, so the href multiset gate accepts exactly those links.
// Source copy the pivot drops (the old home h1 and the second hero line) cannot be read from the output, so it is listed
// by hand below as "remove-source" exceptions. A declared entry that no longer applies is itself a gate failure (both
// gates report stale exceptions), so this file must be re-run after any change to the added copy or the menu data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as tp from './text-parity.mjs';

const WS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const DIST = path.resolve(WS, argv.includes('--dir') ? argv[argv.indexOf('--dir') + 1] : 'dist');
const OUT = path.join(WS, 'src/content/operator-additions.json');
const WHY = 'Revision 5 (operator 2026-10-14: "pivot the focus of the site to hash and rosin ... highlight their hash and rosin products"): added copy.';

/** source copy the revision drops: { id, page, region, text, reason } */
const REMOVED = [
  { id: 'R5-home-h1-source', page: '/', region: 'main', text: 'Shop Our Weed Products', reason: 'The home h1 becomes "Curated Hash & Rosin" (revision 5).' },
  { id: 'R5-home-line-2', page: '/', region: 'main', text: 'Browse everything in stock — and check rotating specials before you shop.', reason: 'The second hero line gives way to the hash and rosin lead (revision 5).' },
];

function builtPages(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'assets') walk(p); } else if (e.name === 'index.html') out.push(p);
    }
  };
  walk(dir);
  return out.map((f) => ({ file: f, page: '/' + path.relative(dir, path.dirname(f)).split(path.sep).filter(Boolean).map((s) => s + '/').join('') }));
}
/** the outermost data-r5 elements under a node, in DOM order */
function marked(node, out = []) {
  for (const k of node.c || []) {
    if (k.t === '#text') continue;
    if (k.a && k.a['data-r5'] != null) out.push(k); else marked(k, out);
  }
  return out;
}
const slug = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-'));

export function collect(dir) {
  const exceptions = REMOVED.map((r) => ({ id: r.id, rule: 'R5', page: r.page, region: r.region, kind: 'remove-source', text: r.text, reason: r.reason, evidence: 'audit/raw/index.html (the home hero)' }));
  const addedHrefs = [];
  for (const { file, page } of builtPages(dir)) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('data-r5')) continue;
    const regions = tp.builtRegionNodes(tp.tree(html));
    for (const region of tp.REGIONS) {
      const node = regions[region];
      if (!node) continue;
      const seen = new Map();
      for (const m of marked(node)) {
        const name = m.a['data-r5'] || 'block';
        const n = (seen.get(name) || 0) + 1;
        seen.set(name, n);
        const id = 'R5-' + name + '-' + slug(page) + (n > 1 ? '-' + n : '');
        const words = tp.words(m);
        if (words.length) exceptions.push({ id, rule: 'R5', page, region, kind: 'remove-built', text: words.join(' '), reason: WHY + ' The [data-r5="' + name + '"] element.', evidence: 'src/theme/rosin.mjs; ' + path.relative(WS, file).split(path.sep).join('/') });
        const counts = new Map();
        for (const a of tp.findNodes(m, (x) => x.t === 'a' && 'href' in x.a)) { const h = a.a.href; if (h !== '#') counts.set(h, (counts.get(h) || 0) + 1); }
        for (const [href, count] of [...counts].sort((x, y) => (x[0] < y[0] ? -1 : 1))) addedHrefs.push({ id, page, region, href, count });
      }
    }
  }
  return { exceptions, addedHrefs };
}

const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (IS_MAIN) {
  const { exceptions, addedHrefs } = collect(DIST);
  const doc = {
    schema: 'werollup/operator-additions@1',
    note: 'The copy and links the operator asked for (revision 5 on), declared for tools/text-parity.mjs (exceptions, the parity-exceptions.json entry format) and tools/build-check.mjs (addedHrefs). Written by tools/operator-additions.mjs from the built [data-r5] elements plus its hand list of dropped source copy; re-run it after any change to the added copy or src/content/hash-rosin.json.',
    exceptions,
    addedHrefs,
  };
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
  const pages = new Set(exceptions.map((e) => e.page));
  console.log('operator-additions: ' + exceptions.length + ' exceptions (' + REMOVED.length + ' remove-source, ' + (exceptions.length - REMOVED.length) + ' remove-built) on ' + pages.size + ' page(s), ' + addedHrefs.reduce((s, a) => s + a.count, 0) + ' added link(s) -> ' + path.relative(WS, OUT));
}
