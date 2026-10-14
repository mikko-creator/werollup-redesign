#!/usr/bin/env node
// text-parity.mjs - word-sequence text parity: the BUILT pages in dist/ against the source HTML (audit/raw), per page
// and per region, in DOM order (BUILD-CONTRACT 4.2). Owner: PIPELINE. Node builtins only. It shares NO code with
// src/lib (own tokenizer, own visibility rule, own region finder), so an extractor bug cannot hide itself here.
//
//   node tools/text-parity.mjs [--dir dist] [--control] [--json <file>] [--page </path/>] [--verbose]
//   --page limits the run to one path; a --page that matches no record exits 1 (Git Bash rewrites a leading-slash
//   argument into C:/Program Files/Git/...: run MSYS_NO_PATHCONV=1 node tools/text-parity.mjs --page /about-us/ there).
//
// Records: all 91 page records of audit/site-inventory.json (status 200). Each record's raw file is compared with the
// served file of its path (a query-string variant is served by its base path's file).
// Regions (source selector -> built [data-parity=<name>]):
//   topbar #headless-top-bar | header nav#site-navigation | subheader #site-topbar | offcanvas #defaultOffcanvas |
//   main <main> | reviews .rpb-customer-reviews | footer .site-footer | chooser #locationChooserModal |
//   agegate #ageGateModal
// Words: every text node in DOM order (hidden-until-interaction text included: accordion bodies, ZIP-finder steps,
// modal text, screen-reader-only text), plus the placeholder of inputs/textareas and the value of submit/button inputs.
// Dropped: script, style, noscript, template, svg, iframe (its content is raw text the browser never renders), title,
// textarea content, comments, attributes other than placeholder/value. Block elements and links (<a>) are word
// boundaries (adjacent buttons such as "Order Now""See Deals" carry no space in the source; a link edge is never
// wording); other inline elements are not ("Shop Now<span class=sr-only>Blissful</span>" stays one word). Text that main.js copies into the DOM (the top-bar data-address and data-hours of each store
// option) is chrome text: it is inserted at #activeLocationDetails in the source (4.2).
// Exceptions: src/content/parity-exceptions.json (generated) plus src/content/operator-additions.json (the copy the operator
// asked for, revision 5 on; written by tools/operator-additions.mjs) (each with its rule and evidence): replace, remove-source,
// remove-built, set-order (review slides compared as a set, in the fixed order of audit/raw/index.html, A2),
// must-not-render (text that must not appear anywhere in the built page), link-only (a removed link whose text stays).
// An exception that does not apply where it says it does is itself a failure (stale exceptions never pass silently).
// Controls (--control, in memory, on a copy of one built page): one changed word, two swapped sentences and one
// dropped sentence in <main>, one changed word in the footer, one dropped review and one visible word outside every
// region must each FAIL. Every region must appear exactly once and no visible word may sit outside the regions.
// Exit 0 when every record matches in every region and every control fires; 1 otherwise.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ tokenizer (own implementation) */
const VOIDS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAWTEXT = new Set(['script', 'style', 'textarea', 'title', 'iframe', 'noscript', 'xmp', 'noembed', 'noframes']);
const AUTO_CLOSE_P = new Set(['address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul', 'details']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', times: '×', copy: '©', reg: '®', trade: '™', bull: '•', middot: '·', eacute: 'é', ntilde: 'ñ', thinsp: ' ', ensp: ' ', emsp: ' ', shy: '', zwj: '', zwnj: '' };
function ent(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);?/gi, (m, g) => {
    if (g[0] === '#') { const n = g[1] === 'x' || g[1] === 'X' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10); return Number.isFinite(n) && n > 0 ? String.fromCodePoint(n) : m; }
    return Object.prototype.hasOwnProperty.call(ENT, g) ? ENT[g] : m;
  });
}
function attrsOf(s) {
  const o = {};
  const re = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(s))) { const k = m[1].toLowerCase(); if (!(k in o)) o[k] = ent(m[2] ?? m[3] ?? m[4] ?? ''); }
  return o;
}
export function tree(html) {
  const root = { t: '#root', a: {}, c: [], p: null };
  const st = [root];
  const top = () => st[st.length - 1];
  let i = 0;
  const n = html.length;
  const closeTo = (name) => { for (let k = st.length - 1; k > 0; k--) if (st[k].t === name) { st.length = k; return; } };
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { top().c.push({ t: '#text', v: html.slice(i) }); break; }
    if (lt > i) top().c.push({ t: '#text', v: html.slice(i, lt) });
    if (html.startsWith('<!--', lt)) { const e = html.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') { const e = html.indexOf('>', lt); i = e < 0 ? n : e + 1; continue; }
    if (html[lt + 1] === '/') {
      const m = /^<\/([a-zA-Z][\w:-]*)[^>]*>/.exec(html.slice(lt, lt + 120));
      if (!m) { top().c.push({ t: '#text', v: '<' }); i = lt + 1; continue; }
      closeTo(m[1].toLowerCase()); i = lt + m[0].length; continue;
    }
    const m = /^<([a-zA-Z][\w:-]*)/.exec(html.slice(lt, lt + 80));
    if (!m) { top().c.push({ t: '#text', v: '<' }); i = lt + 1; continue; }
    let j = lt + m[0].length, q = null;
    while (j < n) { const ch = html[j]; if (q) { if (ch === q) q = null; } else if (ch === '"' || ch === "'") q = ch; else if (ch === '>') break; j++; }
    const name = m[1].toLowerCase();
    const node = { t: name, a: attrsOf(html.slice(lt + m[0].length, j)), c: [], p: null };
    if (AUTO_CLOSE_P.has(name) && top().t === 'p') st.pop();
    if (name === 'li') { for (let k = st.length - 1; k > 0; k--) { const t = st[k].t; if (t === 'li') { st.length = k; break; } if (t === 'ul' || t === 'ol' || t === 'div' || t === 'nav') break; } }
    if (name === 'option' && top().t === 'option') st.pop();
    node.p = top();
    top().c.push(node);
    i = j + 1;
    if (RAWTEXT.has(name)) {
      const re = new RegExp('</' + name + '\\s*>', 'gi');
      re.lastIndex = i;
      const r = re.exec(html);
      node.raw = html.slice(i, r ? r.index : n);
      i = r ? r.index + r[0].length : n;
      continue;
    }
    if (VOIDS.has(name) || /\/\s*$/.test(html.slice(lt, j))) continue;
    st.push(node);
  }
  return root;
}
const classes = (x) => (x.a && x.a.class ? x.a.class.split(/\s+/) : []);
function find(x, pred) { if (x.t !== '#text' && pred(x)) return x; for (const k of x.c || []) { const r = find(k, pred); if (r) return r; } return null; }
function findAll(x, pred, out = []) { if (x.t !== '#text' && pred(x)) out.push(x); for (const k of x.c || []) findAll(k, pred, out); return out; }

/* ------------------------------------------------------------------ words */
const BLOCK = new Set(['a', 'address', 'article', 'aside', 'blockquote', 'br', 'button', 'caption', 'dd', 'details', 'summary', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'label', 'legend', 'li', 'main', 'nav', 'ol', 'option', 'p', 'pre', 'section', 'select', 'table', 'td', 'th', 'tr', 'ul', 'input', 'img', 'textarea']);
const DROP = new Set(['script', 'style', 'noscript', 'template', 'svg', 'iframe', 'title', 'head', 'textarea']);
/** the words of a subtree in DOM order; opts.inject(node) -> [strings] adds runtime-copied text after a node */
export function words(node, opts = {}) {
  const parts = [];
  const rec = (x) => {
    if (x.t === '#text') { parts.push(ent(x.v)); return; }
    if (x.t === 'input' || x.t === 'textarea') {
      const ty = (x.a.type || 'text').toLowerCase();
      if (x.a.placeholder) parts.push(' ', x.a.placeholder, ' ');
      if ((ty === 'submit' || ty === 'button') && x.a.value) parts.push(' ', x.a.value, ' ');
      return;
    }
    if (DROP.has(x.t)) return;
    const b = BLOCK.has(x.t);
    if (b) parts.push(' ');
    for (const k of x.c || []) rec(k);
    if (b) parts.push(' ');
    if (opts.inject) { const add = opts.inject(x); if (add && add.length) parts.push(' ', add.join(' '), ' '); }
  };
  rec(node);
  return parts.join('').normalize('NFC').replace(/[\s ​﻿]+/g, ' ').trim().split(' ').filter(Boolean);
}

/* ------------------------------------------------------------------ regions */
const SOURCE_REGIONS = {
  topbar: (r) => find(r, (x) => x.a.id === 'headless-top-bar'),
  header: (r) => find(r, (x) => x.t === 'nav' && x.a.id === 'site-navigation'),
  subheader: (r) => find(r, (x) => x.a.id === 'site-topbar'),
  offcanvas: (r) => find(r, (x) => x.a.id === 'defaultOffcanvas'),
  main: (r) => find(r, (x) => x.t === 'main'),
  reviews: (r) => find(r, (x) => classes(x).includes('rpb-customer-reviews')),
  footer: (r) => find(r, (x) => classes(x).includes('site-footer')),
  chooser: (r) => find(r, (x) => x.a.id === 'locationChooserModal'),
  agegate: (r) => find(r, (x) => x.a.id === 'ageGateModal'),
};
export const REGIONS = Object.keys(SOURCE_REGIONS);
const builtRegion = (r, name) => find(r, (x) => x.a['data-parity'] === name);
/** the region NODES of a parsed source page / built page ({ <region>: node | null }); used by tools/build-check.mjs */
export function sourceRegionNodes(root) { return Object.fromEntries(REGIONS.map((k) => [k, SOURCE_REGIONS[k](root)])); }
export function builtRegionNodes(root) { return Object.fromEntries(REGIONS.map((k) => [k, builtRegion(root, k)])); }
export { find as findNode, findAll as findNodes };

function topbarInject(region) {
  const opts = findAll(region, (x) => x.t === 'option' && x.a['data-slug']);
  return (x) => (x.a && x.a.id === 'activeLocationDetails' ? opts.flatMap((o) => [o.a['data-address'] || '', o.a['data-hours'] || '']).filter(Boolean) : null);
}

/** source words per region; reviews also returns slides for the set-order rule */
export function sourceRegions(html) {
  const r = tree(html);
  const out = {};
  for (const [k, f] of Object.entries(SOURCE_REGIONS)) {
    const node = f(r);
    if (!node) { out[k] = null; continue; }
    out[k] = words(node, k === 'topbar' ? { inject: topbarInject(node) } : {});
    if (k === 'reviews') {
      const slides = findAll(node, (x) => classes(x).includes('splide__slide')).map((s) => words(s));
      out.reviewSlides = slides;
    }
  }
  return out;
}
export function builtRegions(html) {
  const r = tree(html);
  const out = {};
  for (const k of REGIONS) { const node = builtRegion(r, k); out[k] = node ? words(node) : null; }
  out.__all = words(r);
  out.__hrefs = findAll(r, (x) => x.t === 'a').map((a) => a.a.href || '');
  // every region exactly once, and no visible word outside the regions (nothing invented around them)
  out.__dupes = REGIONS.filter((k) => findAll(r, (x) => x.a['data-parity'] === k).length > 1);
  const body = find(r, (x) => x.t === 'body');
  const prune = (x) => ({ ...x, c: (x.c || []).filter((k) => k.t === '#text' || !(k.a && k.a['data-parity'])).map((k) => (k.t === '#text' ? k : prune(k))) });
  out.__outside = body ? words(prune(body)) : [];
  return out;
}

/* ------------------------------------------------------------------ exceptions */
const seqIndex = (hay, needle, from = 0) => {
  outer: for (let i = from; i + needle.length <= hay.length; i++) { for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer; return i; }
  return -1;
};
const toks = (s) => String(s).normalize('NFC').replace(/[\s ]+/g, ' ').trim().split(' ').filter(Boolean);
function applies(ex, pagePath, region) { return (ex.page === '*' || ex.page === pagePath) && ex.region === region; }

/** apply the exceptions to one region; returns { src, built, used: [ids], stale: [ids] } */
function applyExceptions(exs, pagePath, region, src, built, ctx) {
  const used = [], stale = [];
  let s = src ? [...src] : src, b = built ? [...built] : built;
  for (const ex of exs) {
    if (!applies(ex, pagePath, region)) continue;
    if (ex.kind === 'replace') {
      const from = toks(ex.from), to = toks(ex.to);
      const i = s ? seqIndex(s, from) : -1;
      if (i < 0) { stale.push(ex.id); continue; }
      s.splice(i, from.length, ...to); used.push(ex.id);
    } else if (ex.kind === 'remove-source') {
      const t = toks(ex.text);
      const i = s ? seqIndex(s, t) : -1;
      if (i < 0) { stale.push(ex.id); continue; }
      s.splice(i, t.length); used.push(ex.id);
    } else if (ex.kind === 'remove-built') {
      const t = toks(ex.text);
      const i = b ? seqIndex(b, t) : -1;
      if (i < 0) { stale.push(ex.id); continue; }
      b.splice(i, t.length); used.push(ex.id);
    } else if (ex.kind === 'must-not-render') {
      if (seqIndex(ctx.builtAll, toks(ex.text)) >= 0) stale.push(ex.id + ' (RENDERED)'); else used.push(ex.id);
    } else if (ex.kind === 'link-only') {
      if (ctx.builtHrefs.some((h) => /wp-admin/i.test(h))) stale.push(ex.id + ' (link still present)');
      else if (b && seqIndex(b, toks(ex.text)) < 0) stale.push(ex.id + ' (text missing)');
      else used.push(ex.id);
    } else if (ex.kind === 'set-order') {
      used.push(ex.id); // handled by reorderReviews before this call
    }
  }
  return { src: s, built: b, used, stale };
}

/** A2: reorder the source review slides into the canonical order and prove the set is identical */
function reorderReviews(src, slides, canon) {
  if (!src || !slides) return { src, ok: false, why: 'no reviews region' };
  const key = (w) => w.join(' ');
  const have = slides.map(key).sort();
  const want = canon.map(key).sort();
  if (have.length !== want.length || have.some((x, i) => x !== want[i])) return { src, ok: false, why: 'review set differs from audit/raw/index.html' };
  // the slides are contiguous in DOM order: replace the run of slide words with the canonical run
  const flat = slides.flat();
  const i = seqIndex(src, flat);
  if (i < 0) return { src, ok: false, why: 'slides not contiguous' };
  const out = [...src];
  out.splice(i, flat.length, ...canon.flat());
  return { src: out, ok: true };
}

/* ------------------------------------------------------------------ compare */
function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (i === a.length && i === b.length) return null;
  return { at: i, source: a.slice(Math.max(0, i - 6), i + 8).join(' '), built: b.slice(Math.max(0, i - 6), i + 8).join(' '), sourceLen: a.length, builtLen: b.length };
}
function lcsStats(a, b) {
  if (a.length * b.length > 9e6) return { missing: null, added: null };
  const m = a.length, n = b.length;
  let prev = new Uint32Array(n + 1), cur = new Uint32Array(n + 1);
  for (let i = 1; i <= m; i++) { for (let j = 1; j <= n; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); [prev, cur] = [cur, prev]; }
  const l = prev[n];
  return { missing: m - l, added: n - l, lcs: l };
}

export function comparePage(srcHtml, builtHtml, pagePath, exs, canonSlides) {
  const S = sourceRegions(srcHtml);
  const B = builtRegions(builtHtml);
  const res = { path: pagePath, regions: {}, used: [], stale: [], ok: true };
  for (const k of REGIONS) {
    let src = S[k];
    let built = B[k];
    if (src == null && built == null) { res.regions[k] = { ok: true, absent: true }; continue; }
    if (k === 'reviews') { const r = reorderReviews(src, S.reviewSlides, canonSlides); if (!r.ok) { res.regions[k] = { ok: false, why: r.why }; res.ok = false; continue; } src = r.src; }
    const ap = applyExceptions(exs, pagePath, k, src, built, { builtAll: B.__all, builtHrefs: B.__hrefs });
    res.used.push(...ap.used); res.stale.push(...ap.stale);
    if (ap.src == null || ap.built == null) { res.regions[k] = { ok: false, why: (ap.src == null ? 'source' : 'built') + ' region missing' }; res.ok = false; continue; }
    const d = firstDiff(ap.src, ap.built);
    res.regions[k] = d ? { ok: false, words: ap.src.length, diff: d, ...lcsStats(ap.src, ap.built) } : { ok: true, words: ap.src.length };
    if (d) res.ok = false;
  }
  if (B.__dupes.length) { res.regions.__layout = { ok: false, why: 'region(s) rendered more than once: ' + B.__dupes.join(', ') }; res.ok = false; }
  if (B.__outside.length) { res.regions.__outside = { ok: false, why: B.__outside.length + ' visible word(s) outside every data-parity region: ' + B.__outside.slice(0, 12).join(' ') }; res.ok = false; }
  if (res.stale.length) res.ok = false;
  return res;
}

/* ------------------------------------------------------------------ runner */
const pathOf = (u) => { let p = String(u).replace(/^https?:\/\/(www\.)?werollup\.com/i, '').split('#')[0].split('?')[0] || '/'; return p.endsWith('/') ? p : p + '/'; };
const fileOf = (p) => (p === '/' ? 'index.html' : p.slice(1) + 'index.html');

function loadAll(dir) {
  const inv = JSON.parse(fs.readFileSync(path.join(WS, 'audit/site-inventory.json'), 'utf8'));
  const exs = JSON.parse(fs.readFileSync(path.join(WS, 'src/content/parity-exceptions.json'), 'utf8')).exceptions;
  // the copy the operator asked for (revision 5 on): hand-declared in src/content/operator-additions.json, same entry format
  const addFile = path.join(WS, 'src/content/operator-additions.json');
  if (fs.existsSync(addFile)) exs.push(...JSON.parse(fs.readFileSync(addFile, 'utf8')).exceptions);
  const canonHtml = fs.readFileSync(path.join(WS, 'audit/raw/index.html'), 'utf8');
  const canonSlides = sourceRegions(canonHtml).reviewSlides;
  const records = inv.pages.filter((r) => r.status === 200).map((r) => ({ url: r.url, path: pathOf(r.url), raw: path.join(WS, 'audit/raw', r.savedAs), built: path.join(dir, fileOf(pathOf(r.url))) }));
  return { exs, canonSlides, records };
}

export function runAll(dir, only) {
  const { exs, canonSlides, records } = loadAll(dir);
  const results = [];
  const used = new Set();
  for (const rec of records) {
    if (only && rec.path !== only) continue;
    if (!fs.existsSync(rec.built)) { results.push({ url: rec.url, path: rec.path, ok: false, why: 'built file missing' }); continue; }
    const r = comparePage(fs.readFileSync(rec.raw, 'utf8'), fs.readFileSync(rec.built, 'utf8'), rec.path, exs, canonSlides);
    r.url = rec.url;
    for (const u of r.used) used.add(u.replace(/ .*/, ''));
    results.push(r);
  }
  const unused = only ? [] : exs.map((e) => e.id).filter((id) => !used.has(id));
  return { results, unused, exs, canonSlides, records };
}

/** controls: plant defects in a copy of one built page (in memory) and require each to fail */
export function runControls(dir) {
  const { exs, canonSlides } = loadAll(dir);
  const p = '/about-us/';
  const raw = fs.readFileSync(path.join(WS, 'audit/raw/about-us.html'), 'utf8');
  const built = fs.readFileSync(path.join(dir, fileOf(p)), 'utf8');
  const base = comparePage(raw, built, p, exs, canonSlides);
  // a <p> in the built <main> with at least two sentences and no tags inside
  const mainAt = built.indexOf('data-parity="main"');
  const re = /<p>([^<]{40,}?[.!?]) ([^<]{20,}?[.!?])(?=[ <])/g;
  re.lastIndex = mainAt;
  const m = re.exec(built);
  const out = { baselinePasses: base.ok };
  if (!m) { out.fired = false; out.why = 'no two-sentence paragraph found in ' + p; return out; }
  const [whole, s1, s2] = m;
  const at = m.index;
  const swapWord = (s) => s.replace(/\b([A-Za-z]{4,})\b/, 'Zebra');
  const plant = (from, to) => built.slice(0, at) + built.slice(at).replace(from, to);
  const cases = {
    changedWord: plant(whole, '<p>' + swapWord(s1) + ' ' + s2),
    swappedSentences: plant(whole, '<p>' + s2 + ' ' + s1),
    droppedSentence: plant(whole, '<p>' + s2),
  };
  const fa = built.indexOf('data-parity="footer"');
  const qi = built.indexOf('>Quick Links<', fa);
  cases.footerChangedWord = qi > 0 ? built.slice(0, qi) + '>Quack Links<' + built.slice(qi + '>Quick Links<'.length) : null;
  const rv = built.indexOf('data-parity="reviews"');
  const li = built.indexOf('<li class="review">', rv);
  const le = built.indexOf('</li>', li);
  cases.droppedReview = li > 0 && le > li ? built.slice(0, li) + built.slice(le + 5) : null;
  cases.wordOutsideRegions = built.replace('<main ', '<p>Invented words</p><main ');
  for (const [k, html] of Object.entries(cases)) {
    if (html == null || html === built) { out[k] = false; continue; }
    const r = comparePage(raw, html, p, exs, canonSlides);
    out[k] = !r.ok;
  }
  out.sample = { sentence1: s1.slice(0, 80), sentence2: s2.slice(0, 80) };
  out.fired = out.baselinePasses && ['changedWord', 'swappedSentences', 'droppedSentence', 'footerChangedWord', 'droppedReview', 'wordOutsideRegions'].every((k) => out[k] === true);
  return out;
}

const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (IS_MAIN) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? null : process.argv[i + 1]; };
  const dir = path.resolve(arg('--dir') || path.join(WS, 'dist'));
  const only = arg('--page');
  const verbose = process.argv.includes('--verbose');
  const { results, unused } = runAll(dir, only);
  if (only && results.length === 0) {
    // a filter that selects nothing is a failure, never a green run (Git Bash rewrites a leading-slash argument such as
    // /about-us/ into C:/Program Files/Git/about-us/: run with MSYS_NO_PATHCONV=1 there)
    console.log('text-parity: --page ' + JSON.stringify(only) + ' matches no page record' + (/^[A-Za-z]:[\\/]/.test(only) ? ' (the shell rewrote the path: in Git Bash run with MSYS_NO_PATHCONV=1)' : '') + '; nothing was compared');
    process.exitCode = 1;
  } else {
  const bad = results.filter((r) => !r.ok);
  const totals = {};
  for (const r of results) for (const [k, v] of Object.entries(r.regions || {})) { totals[k] = totals[k] || { pages: 0, ok: 0, words: 0 }; if (v.absent) continue; totals[k].pages++; if (v.ok) totals[k].ok++; totals[k].words += v.words || 0; }
  console.log('text-parity ' + dir + (only ? ' (page ' + only + ')' : ''));
  console.log('records ' + (results.length - bad.length) + '/' + results.length + ' match in every region');
  for (const [k, v] of Object.entries(totals)) console.log('  ' + k.padEnd(10) + ' ' + v.ok + '/' + v.pages + ' pages, ' + v.words + ' source words compared');
  for (const r of bad.slice(0, verbose ? 200 : 12)) {
    console.log('  MISMATCH ' + r.url + (r.why ? ' ' + r.why : ''));
    for (const [k, v] of Object.entries(r.regions || {})) if (!v.ok) console.log('    ' + k + ': ' + (v.why || ('missing ' + v.missing + ' added ' + v.added + ' | at word ' + v.diff.at + '\n      source: ' + v.diff.source + '\n      built:  ' + v.diff.built)));
    if (r.stale && r.stale.length) console.log('    stale exceptions: ' + r.stale.join(', '));
  }
  if (unused.length) console.log('  exceptions that applied nowhere (stale): ' + unused.join(', '));
  let c = { fired: true };
  if (process.argv.includes('--control')) {
    c = runControls(dir);
    console.log('control: ' + (c.fired ? 'fired (baseline passes; changed word, swapped sentences, dropped sentence, footer changed word, dropped review and a word outside the regions each FAIL)' : 'DID NOT FIRE ' + JSON.stringify(c)));
    if (verbose) console.log('  control sample: ' + JSON.stringify(c.sample));
  }
  if (arg('--json')) fs.writeFileSync(path.resolve(arg('--json')), JSON.stringify({ results, unused, control: c }, null, 1));
  process.exitCode = bad.length || unused.length || !c.fired ? 1 : 0;
  }
}
