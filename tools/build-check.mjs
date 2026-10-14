#!/usr/bin/env node
// build-check.mjs - post-build gates over a built tree (PIPELINE). BUILD-CONTRACT 3.1, 4.3, 4.6, 4.9, 4.10, 4.11, 4.13.
// Offline, Node builtins only. Re-scans the OUTPUT (it does not trust the build's own checks); the source-comparing
// gates read the EVIDENCE (audit/raw) and the declared changes (src/content/changes.json):
//   - residue: the platform/tracking patterns of src/lib/policy.mjs in every text file (html, css, js, txt, xml,
//     _redirects), Webflow-looking class tokens included; allowlist entries apply only inside vendor-embed spans;
//   - every page (<path>/index.html of a served page, not the alias stubs or 404.html) has exactly one <h1>;
//   - every <img> has width, height and a non-empty alt, unless it is marked decorative (data-decorative + alt="");
//     every <img srcset> has sizes;
//   - the licence line "Cannabis License: C10-0000854-LIC" is on every page (404 included);
//   - no third-party <script src> other than the allowlisted vendor embeds; no CSP meta on shop pages (4.6);
//   - fonts (4.11): no Helvetica Neue Condensed or Agrandir file; under assets/fonts/ only the allowed families
//     (libre-franklin, source-sans-pro, bricolage-grotesque) as woff2, their @font-face sheets, and the licence texts;
//     every display-face woff2 (bricolage-grotesque-*) ships with its .LICENSE.txt;
//   - videos (WF3b, image-plan kind "video"): every .mp4/.webm lives in assets/video/ as <sha12>-ai.<ext> and carries
//     the AI label (tools/ai-label.mjs checkFile: the byte grep AND the container tags via ffprobe); every <video> is
//     preload="none" without autoplay (DESIGN-SPEC 10.5, R-26, R-27: loops stay out of the 1.5 MB first-screen budget,
//     BUILD-CONTRACT 4.12), has a poster that is a labelled /assets/img/*-ai.webp (the poster counts toward the budget),
//     and takes its src / <source src> from /assets/video/ only;
//   - platform UI images (4.10) by CONTENT: no output file whose name starts with the sha12 of a NEVER_SHIP source file
//     (assets/source names matching policy.NEVER_SHIP; output names are <sha12>-<w>.webp / <sha12>.svg) and no output
//     file byte-identical to one;
//   - every served variant of a generated image (assets/img/*-ai.webp) carries the trainedAlgorithmicMedia XMP label;
//   - embeds (4.6, A13), per served page, from its audit/raw base record: where the source has the Jane body, the built
//     page holds the source Jane head span (minus its one StackAdapt script, its OMGF Source Sans Pro link repointed to
//     /assets/fonts/source-sans-pro.css) exactly once inside <head>, and the source Jane body span exactly once inside
//     [data-parity=main]; where the source main has the Weedmaps WM Store <script>, the built page holds that exact tag
//     exactly once inside main; pages without them in the source hold no Jane runtime and no wm.store tag;
//   - hrefs (4.3, A8), per served page and region (the nine data-parity regions): the multiset of <a href> values equals
//     the source region's, internal hrefs normalised to the trailing-slash path (query and fragment kept); the only
//     exceptions are the A8 corrections and the removed links declared in src/content/changes.json, and the links the
//     operator asked for (src/content/operator-additions.json addedHrefs, revision 5 on) (an exception that
//     does not apply is itself a finding); bare "#" (a dropdown toggle, no target) is not compared;
//   - meta description (4.9, A17): exactly one, equal to og:description, at most 160 characters, and its words are a
//     verbatim run of the page's own [data-parity=main] text (compared with all whitespace removed);
//   - store-switcher data-* (4.5; orchestrator edit 2026-10-13): per page, the multiset of data-address, data-hours,
//     data-menu-url, data-directions-url, data-lax-url and data-sanpedro-url values equals the source's (URLs
//     normalised like hrefs). Controls: a changed hours, a changed address, a re-pointed menu URL, a re-pointed
//     Order Now URL and a changed directions cid must each be reported.
// Positive controls (--control, in memory): a planted "wp-content" string, a planted Webflow class, a second <h1>, an
// <img alt=""> without data-decorative, a page without the licence line, a spinner shipped under its content-hash name,
// a spinner copy under a neutral name, a sprite variant name, one byte changed in the Jane head (storeId 4281 -> 4282),
// one byte changed in the Jane body, a changed and a doubled Weedmaps tag, the Jane head and the Weedmaps tag planted on
// a page whose source has neither, an A8 link reverted, an ordinary link
// re-pointed, invented words and a changed word in a meta description, an og:description that differs, an unknown font
// file, a display face without its licence, a served video stripped of its AI label (a copy, in a temp dir; synthesised
// with ffmpeg when the tree serves none), a <video> without preload="none", one with autoplay, one without a poster and
// one with a third-party source: each must be reported, and the clean pages (and a clean <video>) must pass.
//   node tools/build-check.mjs [--dir dist] [--control] [--json <file>]     exit 1 on any finding or a dead control
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LICENCE = 'Cannabis License: C10-0000854-LIC';
const policy = await import(pathToFileURL(path.join(WS, 'src/lib/policy.mjs')).href);
const tp = await import(pathToFileURL(path.join(WS, 'tools/text-parity.mjs')).href);
const ail = await import(pathToFileURL(path.join(WS, 'tools/ai-label.mjs')).href);
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function listFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}
const TAG_RE = /<[a-zA-Z](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const attrs = (tag) => { const o = {}; for (const m of tag.matchAll(/\s([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)) o[m[1].toLowerCase()] = m[2] ?? m[3] ?? ''; return o; };
const stripScripts = (html) => html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>').replace(/<!--[\s\S]*?-->/g, '');
const count = (hay, needle) => { let n = 0, i = -1; while ((i = hay.indexOf(needle, i + 1)) >= 0) n++; return n; };

/** checks on one html file; kind: 'page' | 'stub' | '404' */
export function checkHtml(rel, html, kind) {
  const f = [];
  const body = stripScripts(html);
  if (kind === 'page') {
    const h1 = (body.match(/<h1[\s>]/gi) || []).length;
    if (h1 !== 1) f.push({ check: 'one-h1', file: rel, detail: h1 + ' <h1>' });
  }
  if (kind !== 'stub' && !html.includes(LICENCE)) f.push({ check: 'licence-line', file: rel });
  for (const t of body.match(TAG_RE) || []) {
    const name = (/^<([a-zA-Z][\w:-]*)/.exec(t) || [])[1].toLowerCase();
    const a = attrs(t);
    if (name === 'img') {
      if (!a.width || !a.height) f.push({ check: 'img-dimensions', file: rel, detail: t.slice(0, 120) });
      if (a.alt === undefined) f.push({ check: 'img-alt-missing', file: rel, detail: t.slice(0, 120) });
      else if (a.alt.trim() === '' && !('data-decorative' in a)) f.push({ check: 'img-alt-empty', file: rel, detail: t.slice(0, 120) });
      if (a.srcset && !a.sizes) f.push({ check: 'img-sizes', file: rel, detail: t.slice(0, 120) });
    }
    if (name === 'script' && a.src && /^(https?:)?\/\//.test(a.src)) {
      let host = '';
      try { host = new URL(a.src.startsWith('//') ? 'https:' + a.src : a.src).host; } catch { /* none */ }
      if (!policy.ALLOWED_THIRD_PARTY_SRC.some((x) => x.host === host)) f.push({ check: 'third-party-script', file: rel, detail: a.src });
    }
    if (name === 'meta' && /content-security-policy/i.test(a['http-equiv'] || '') && /^location\/[^/]+\/shop\//.test(rel)) f.push({ check: 'csp-on-shop-page', file: rel });
    if (name === 'video') {
      if (a.preload !== 'none') f.push({ check: 'video-preload', file: rel, detail: 'preload="' + (a.preload ?? '') + '" (preload="none" required: loops stay out of the first-screen budget) ' + t.slice(0, 120) });
      if ('autoplay' in a) f.push({ check: 'video-autoplay', file: rel, detail: 'autoplay plays under reduced motion and loads at first screen (R-26, R-27) ' + t.slice(0, 120) });
      if (!a.poster || !VIDEO_POSTER.test(a.poster)) f.push({ check: 'video-poster', file: rel, detail: 'poster "' + (a.poster ?? '') + '" (a labelled /assets/img/<sha12>-<w>-ai.webp required) ' + t.slice(0, 120) });
      if (a.src && !VIDEO_SRC.test(a.src)) f.push({ check: 'video-src', file: rel, detail: a.src });
    }
    if (name === 'source' && a.src !== undefined && !VIDEO_SRC.test(a.src)) f.push({ check: 'video-src', file: rel, detail: '<source src="' + a.src + '"> (videos are served from /assets/video/ only)' });
  }
  if (/^location\/san-pedro\/shop\//.test(rel)) {
    if (/stackadapt/i.test(html)) f.push({ check: 'jane-stackadapt', file: rel });
    if (!html.includes('<link href="/assets/fonts/source-sans-pro.css" rel="stylesheet">')) f.push({ check: 'jane-font-link-local', file: rel });
  }
  return f;
}

/* ------------------------------------------------------------------ fonts (4.11) and videos (WF3b) */
const VIDEO_SRC = /^\/assets\/video\/[0-9a-f]{12}-ai\.(mp4|webm)$/;
const VIDEO_POSTER = /^\/assets\/img\/[0-9a-f]{12}-\d+-ai\.webp$/;
const FONT_FAMILIES = '(libre-franklin|source-sans-pro|bricolage-grotesque)';
const FONT_FILE = new RegExp('^' + FONT_FAMILIES + '-[a-z0-9-]+\\.woff2$');
const FONT_SHEET = new RegExp('^' + FONT_FAMILIES + '\\.css$');
const FONT_LICENCE = new RegExp('^' + FONT_FAMILIES + '-[a-z0-9-]+\\.LICENSE\\.txt$');
/** the font files of a tree (relative paths) against the allowlist; every display-face woff2 needs its licence text */
export function checkFonts(files) {
  const f = [];
  const set = new Set(files);
  for (const rel of files) {
    if (/helvetica|agrandir/i.test(rel)) f.push({ check: 'never-ship-font', file: rel });
    const m = /^assets\/fonts\/(.+)$/.exec(rel);
    if (!m) { if (/\.(woff2?|ttf|otf|eot)$/i.test(rel)) f.push({ check: 'font-location', file: rel, detail: 'font files live in assets/fonts/ only' }); continue; }
    const base = m[1];
    if (!/\.(woff2|css|txt)$/.test(base)) { f.push({ check: 'font-format', file: rel }); continue; }
    if (!(FONT_FILE.test(base) || FONT_SHEET.test(base) || FONT_LICENCE.test(base))) { f.push({ check: 'font-not-allowed', file: rel, detail: 'not an allowed family file, sheet or licence (libre-franklin, source-sans-pro, bricolage-grotesque)' }); continue; }
    if (/^bricolage-grotesque-.+\.woff2$/.test(base) && !set.has('assets/fonts/' + base.replace(/\.woff2$/, '.LICENSE.txt'))) f.push({ check: 'font-licence-missing', file: rel, detail: 'the display face ships without its .LICENSE.txt (SIL OFL 1.1, condition 2)' });
  }
  if (!files.some((x) => /^assets\/fonts\/bricolage-grotesque-.+\.woff2$/.test(x))) f.push({ check: 'font-display-face-missing', detail: 'no assets/fonts/bricolage-grotesque-*.woff2 (DESIGN-SPEC 3.2 and D-8, BUILD-CONTRACT 4.11)' });
  return f;
}
/** one served video file (absolute path) -> findings: its place and name, and the AI label (ai-label.mjs checkFile) */
export function checkVideo(rel, abs) {
  const f = [];
  if (!/^assets\/video\/[0-9a-f]{12}-ai\.(mp4|webm)$/.test(rel)) f.push({ check: 'video-location', file: rel, detail: 'videos are served as assets/video/<sha12>-ai.<mp4|webm> only' });
  let r;
  try { r = ail.checkFile(abs); } catch (e) { r = { ok: false, grep: 0, where: 'error: ' + String(e.message).slice(0, 120) }; }
  if (!r.ok) f.push({ check: 'video-ai-label', file: rel, detail: 'AI label missing (grep ' + r.grep + ', where ' + (r.where || '-') + '): run node tools/ai-label.mjs embed on the source file' });
  return f;
}

export function checkResidue(rel, text) {
  return policy.scanResidue(text).map((h) => ({ check: 'residue', file: rel, detail: h.id + ': ' + h.excerpt }));
}

/* ------------------------------------------------------------------ platform UI images, by content (4.10) */
export function platformSources() {
  const dir = path.join(WS, 'assets', 'source');
  return fs.readdirSync(dir).sort().filter((f) => policy.NEVER_SHIP.test(f)).map((f) => ({ file: 'assets/source/' + f, sha256: sha256(fs.readFileSync(path.join(dir, f))) }));
}
/** one output file (rel, bytes) against the platform sources */
export function checkPlatform(rel, buf, sources) {
  const f = [];
  const base = rel.split('/').pop();
  if (policy.NEVER_SHIP.test(rel)) f.push({ check: 'platform-ui-image', file: rel, detail: 'by name' });
  const h = sha256(buf);
  for (const s of sources) {
    const p12 = s.sha256.slice(0, 12);
    if (base.startsWith(p12 + '-') || base.startsWith(p12 + '.')) f.push({ check: 'platform-ui-image', file: rel, detail: 'a variant of ' + s.file + ' (sha12 name prefix)' });
    else if (h === s.sha256) f.push({ check: 'platform-ui-image', file: rel, detail: 'byte-identical to ' + s.file });
  }
  return f;
}

/* ------------------------------------------------------------------ embeds (4.6, A13) */
const JH0 = '<!-- Jane Menu Plugin Header -->', JH1 = '<!-- /Jane Menu Plugin Header -->';
const JB0 = '<!-- Jane Menu Plugin Body -->', JB1 = '<!-- /Jane Menu Plugin Body -->';
const JANE_FONT_LINK = '<link href="/assets/fonts/source-sans-pro.css" rel="stylesheet">';
const OMGF_LINK = /<link href="\/\/werollup\.com\/wp-content\/uploads\/omgf\/omgf-stylesheet-155\/omgf-stylesheet-155\.css\?ver=\d+" rel="stylesheet">/g;
const WM_TAG = /<script\b[^>]*\bsrc="https:\/\/werolluplax\.wm\.store\/[^"]*"[^>]*><\/script>/g;
const span = (s, a, b) => { const i = s.indexOf(a); const j = i < 0 ? -1 : s.indexOf(b, i); return i < 0 || j < 0 ? null : s.slice(i, j + b.length); };
/** the embed expectations derived from one source page (independently of src/lib/extract.mjs) */
export function embedExpect(raw) {
  const out = { jane: null, wm: [], problems: [] };
  const body = span(raw, JB0, JB1);
  if (body) {
    let head = span(raw, JH0, JH1);
    if (!head) out.problems.push('source has a Jane body but no Jane head span');
    else {
      const sa = [...head.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).filter((s) => /stackadapt/i.test(s));
      if (sa.length !== 1) out.problems.push('expected exactly 1 StackAdapt script in the source Jane head, found ' + sa.length);
      else head = head.replace(sa[0], '');
      const links = head.match(OMGF_LINK) || [];
      if (links.length !== 1) out.problems.push('expected exactly 1 OMGF Source Sans Pro link in the source Jane head, found ' + links.length);
      else head = head.replace(links[0], JANE_FONT_LINK);
      out.jane = { head, body };
    }
  }
  const mainAt = raw.search(/<main[\s>]/i), mainEnd = raw.lastIndexOf('</main>');
  if (mainAt >= 0) out.wm = (raw.slice(mainAt, mainEnd > mainAt ? mainEnd : raw.length).match(WM_TAG) || []);
  return out;
}
export function checkEmbeds(rel, html, exp) {
  const f = [];
  for (const p of exp.problems) f.push({ check: 'embed-source', file: rel, detail: p });
  const headEnd = html.indexOf('</head>');
  const mainAt = html.search(/\sdata-parity\s*=\s*["']?main["'\s>]/), mainEnd = html.lastIndexOf('</main>');
  const inMain = (i) => i > mainAt && mainAt >= 0 && i < mainEnd;
  if (exp.jane) {
    const nh = count(html, exp.jane.head), nb = count(html, exp.jane.body);
    if (nh !== 1) f.push({ check: 'embed-jane-head', file: rel, detail: 'the source Jane head span (minus StackAdapt, font link repointed) occurs ' + nh + 'x (exactly 1 required, byte-identical)' });
    else if (!(html.indexOf(exp.jane.head) < headEnd)) f.push({ check: 'embed-jane-head', file: rel, detail: 'the Jane head span is not inside <head>' });
    if (nb !== 1) f.push({ check: 'embed-jane-body', file: rel, detail: 'the source Jane body span occurs ' + nb + 'x (exactly 1 required, byte-identical)' });
    else if (!inMain(html.indexOf(exp.jane.body))) f.push({ check: 'embed-jane-body', file: rel, detail: 'the Jane body span is not inside [data-parity=main]' });
  } else if (/jane_frameless_embed_runtime|jane-app-secrets|boost-assets\.iheartjane\.com/.test(html)) f.push({ check: 'embed-jane-unexpected', file: rel, detail: 'Jane runtime on a page whose source has no Jane embed' });
  const builtWm = html.match(WM_TAG) || [];
  if (exp.wm.length) {
    for (const t of new Set(exp.wm)) {
      const n = count(html, t);
      if (n !== exp.wm.filter((x) => x === t).length) f.push({ check: 'embed-weedmaps', file: rel, detail: 'the source Weedmaps tag occurs ' + n + 'x (source ' + exp.wm.filter((x) => x === t).length + 'x, byte-identical): ' + t });
      else if (!inMain(html.indexOf(t))) f.push({ check: 'embed-weedmaps', file: rel, detail: 'the Weedmaps tag is not inside [data-parity=main]' });
    }
    if (builtWm.length !== exp.wm.length) f.push({ check: 'embed-weedmaps', file: rel, detail: builtWm.length + ' wm.store tags built vs ' + exp.wm.length + ' in the source' });
  } else if (builtWm.length) f.push({ check: 'embed-weedmaps-unexpected', file: rel, detail: builtWm.length + ' wm.store script tag(s) on a page whose source main has none' });
  return f;
}

/* ------------------------------------------------------------------ hrefs (4.3, A8) */
const HOST = /^(?:https?:)?\/\/(?:www\.)?werollup\.com(?=[/?#]|$)/i;
/** internal -> trailing-slash output path with the query and fragment as spelled; anything else unchanged */
export function normHref(h) {
  let s = String(h == null ? '' : h).trim();
  if (!(HOST.test(s) || (s.startsWith('/') && !s.startsWith('//')))) return s;
  s = s.replace(HOST, '');
  let hash = '', q = '';
  if (s.includes('#')) { hash = s.slice(s.indexOf('#')); s = s.slice(0, s.indexOf('#')); }
  if (s.includes('?')) { q = s.slice(s.indexOf('?')); s = s.slice(0, s.indexOf('?')); }
  if (!s) s = '/';
  if (!s.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(s)) s += '/';
  return s + q + hash;
}
const hrefsOf = (node) => (node ? tp.findNodes(node, (x) => x.t === 'a' && 'href' in x.a).map((a) => normHref(a.a.href)).filter((h) => h !== '#') : null);
const decodeAttr = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
/** the href exceptions of changes.json: A8 corrections { page, region, from, to, count } and removed links { page, region, href, count };
 *  plus the links the operator asked for (src/content/operator-additions.json addedHrefs { id, page, region, href, count }) */
export function hrefExceptions(changes, additions = null) {
  const fix = [], removed = [], added = [];
  for (const c of changes.changes) {
    if (c.rule === 'A8') { fix.push({ id: c.id, page: c.page, region: c.region, from: normHref(c.before), to: normHref(c.after), count: c.count }); continue; }
    const m = /\shref="([^"]*)"/.exec(String(c.before || ''));
    if (m && !/\shref="/.test(String(c.after || ''))) removed.push({ id: c.id, page: c.page, region: c.region, href: normHref(decodeAttr(m[1])), count: c.count });
  }
  for (const a of (additions && additions.addedHrefs) || []) added.push({ id: a.id, page: a.page, region: a.region, href: normHref(a.href), count: a.count });
  return { fix, removed, added };
}
const take = (arr, v, n) => { let k = 0; for (let i = 0; i < arr.length && k < n; i++) if (arr[i] === v) { arr.splice(i, 1); i--; k++; } return k; };
/** compare one page's href multisets per region (srcRoot/builtRoot: text-parity trees) */
export function checkHrefs(pagePath, rel, srcRoot, builtRoot, ex, stats = {}) {
  const f = [];
  const S = tp.sourceRegionNodes(srcRoot), B = tp.builtRegionNodes(builtRoot);
  const add = (k, n) => { stats[k] = (stats[k] || 0) + n; };
  for (const region of tp.REGIONS) {
    const src = hrefsOf(S[region]), built = hrefsOf(B[region]);
    if (src == null && built == null) continue;
    if (src == null || built == null) { f.push({ check: 'href-region', file: rel, detail: region + ': ' + (src == null ? 'no source region' : 'no built region') }); continue; }
    add('sourceHrefs', src.length); add('builtHrefs', built.length);
    for (const r of ex.removed.filter((x) => (x.page === '*' || x.page === pagePath) && x.region === region)) {
      const n = take(src, r.href, r.count);
      add('removed:' + r.id, n);
      if (n !== r.count) f.push({ check: 'href-exception-stale', file: rel, detail: r.id + ' ' + region + ': declared removed link ' + r.href + ' not in the source region' });
    }
    for (const x of ex.fix.filter((y) => y.page === pagePath && y.region === region)) {
      const n = take(src, x.from, x.count);
      add('corrected:' + x.id, n);
      if (n !== x.count) f.push({ check: 'href-exception-stale', file: rel, detail: x.id + ' ' + region + ': ' + x.from + ' found ' + n + 'x, declared ' + x.count + 'x' });
      for (let i = 0; i < n; i++) src.push(x.to);
    }
    // operator additions: the declared link joins the source multiset, so a declared link the build lacks shows as missing
    for (const a of (ex.added || []).filter((y) => y.page === pagePath && y.region === region)) {
      for (let i = 0; i < a.count; i++) src.push(a.href);
      add('added:' + a.id, a.count);
    }
    const bag = new Map();
    for (const h of src) bag.set(h, (bag.get(h) || 0) + 1);
    for (const h of built) bag.set(h, (bag.get(h) || 0) - 1);
    for (const [h, n] of [...bag].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      if (n > 0) f.push({ check: 'href-parity', file: rel, detail: region + ': missing ' + n + 'x ' + h });
      if (n < 0) f.push({ check: 'href-parity', file: rel, detail: region + ': not in the source ' + -n + 'x ' + h });
    }
  }
  return f;
}

/* ------------------------------------------------------------------ meta description (4.9, A17) */
const squash = (s) => String(s).normalize('NFC').replace(/[\s ​﻿]+/g, '');
export function checkMeta(rel, builtRoot) {
  const f = [];
  const metas = tp.findNodes(builtRoot, (x) => x.t === 'meta');
  const desc = metas.filter((m) => (m.a.name || '').toLowerCase() === 'description').map((m) => m.a.content || '');
  const ogd = metas.filter((m) => (m.a.property || '').toLowerCase() === 'og:description').map((m) => m.a.content || '');
  if (desc.length !== 1 || !desc[0].trim()) { f.push({ check: 'meta-description', file: rel, detail: desc.length + ' meta description(s) (exactly 1, non-empty, required)' }); return f; }
  const d = desc[0];
  if (ogd.length !== 1 || ogd[0] !== d) f.push({ check: 'meta-description', file: rel, detail: 'og:description differs from the meta description' });
  if (d.length > 160) f.push({ check: 'meta-description', file: rel, detail: d.length + ' characters (at most 160)' });
  const main = tp.builtRegionNodes(builtRoot).main;
  const mainText = main ? squash(tp.words(main).join('')) : '';
  if (!mainText.includes(squash(d))) f.push({ check: 'meta-description', file: rel, detail: 'not a verbatim run of the page\'s own main text: ' + d.slice(0, 100) });
  return f;
}

/* ------------------------------------------------------------------ store-switcher data-* attributes (4.5) */
// The store switcher and Order Now read these values at runtime (BUILD-CONTRACT 4.5), so the visible-text and href gates
// cannot see them (WF3a verifier 2: 5 plants passed every check). Orchestrator edit, 2026-10-13: per served page, the
// multiset of (attribute, value) pairs over the WHOLE document must equal the source's; URL-valued attributes are
// normalised like hrefs (normHref), the others whitespace-collapsed.
export const DATA_ATTRS = ['data-address', 'data-hours', 'data-menu-url', 'data-directions-url', 'data-lax-url', 'data-sanpedro-url'];
function dataPairs(root) {
  const out = [];
  for (const n of tp.findNodes(root, (x) => x.a && DATA_ATTRS.some((k) => k in x.a))) {
    for (const k of DATA_ATTRS) {
      if (!(k in n.a)) continue;
      const v = decodeAttr(n.a[k]);
      out.push(k + '=' + (k.endsWith('-url') ? normHref(v) : v.replace(/\s+/g, ' ').trim()));
    }
  }
  return out;
}
export function checkDataAttrs(rel, srcRoot, builtRoot) {
  const f = [];
  const bag = new Map();
  for (const p of dataPairs(srcRoot)) bag.set(p, (bag.get(p) || 0) + 1);
  for (const p of dataPairs(builtRoot)) bag.set(p, (bag.get(p) || 0) - 1);
  for (const [p, n] of [...bag].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (n > 0) f.push({ check: 'data-attr-parity', file: rel, detail: 'missing ' + n + 'x ' + p.slice(0, 160) });
    if (n < 0) f.push({ check: 'data-attr-parity', file: rel, detail: 'not in the source ' + -n + 'x ' + p.slice(0, 160) });
  }
  return f;
}

/* ------------------------------------------------------------------ the tree */
function loadSource() {
  const routes = JSON.parse(fs.readFileSync(path.join(WS, 'src/content/routes.json'), 'utf8'));
  const changes = JSON.parse(fs.readFileSync(path.join(WS, 'src/content/changes.json'), 'utf8'));
  const addFile = path.join(WS, 'src/content/operator-additions.json');
  const additions = fs.existsSync(addFile) ? JSON.parse(fs.readFileSync(addFile, 'utf8')) : null;
  return { routes, ex: hrefExceptions(changes, additions) };
}

export function checkDist(dir) {
  const files = listFiles(dir);
  const { routes, ex } = loadSource();
  const pageFiles = new Map(routes.paths.map((p) => [p.out, p]));
  const stubFiles = new Set(routes.aliases.map((a) => a.stub));
  const platform = platformSources();
  const findings = [];
  let pages = 0, imgs = 0, decorative = 0, ai = 0, hrefsCompared = 0, metas = 0, janePages = 0, wmPages = 0, dataPages = 0, videos = 0, videoTags = 0;
  const hrefStats = {};
  findings.push(...checkFonts(files));
  const fonts = files.filter((f) => /^assets\/fonts\/.+\.woff2$/.test(f)).length;
  for (const rel of files) {
    const buf = fs.readFileSync(path.join(dir, rel));
    findings.push(...checkPlatform(rel, buf, platform));
    if (/^assets\/img\/.*-ai\.webp$/.test(rel)) { ai++; if (!buf.includes('trainedAlgorithmicMedia')) findings.push({ check: 'ai-label-missing', file: rel }); }
    if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(rel)) { videos++; findings.push(...checkVideo(rel, path.join(dir, rel))); }
    if (!/\.(html|css|js|txt|xml|json|svg)$|^_redirects$/.test(rel)) continue;
    const text = buf.toString('utf8');
    findings.push(...checkResidue(rel, text));
    if (rel.endsWith('.html')) {
      const kind = pageFiles.has(rel) ? 'page' : stubFiles.has(rel) ? 'stub' : rel === '404.html' ? '404' : 'other';
      if (kind === 'other') findings.push({ check: 'unexpected-html', file: rel });
      findings.push(...checkHtml(rel, text, kind));
      imgs += (text.match(/<img\s/gi) || []).length;
      videoTags += (stripScripts(text).match(/<video[\s>]/gi) || []).length;
      decorative += (text.match(/<img[^>]*data-decorative/gi) || []).length;
      if (kind === 'page') {
        pages++;
        const rec = pageFiles.get(rel);
        const raw = fs.readFileSync(path.join(WS, rec.rawFile), 'utf8');
        const exp = embedExpect(raw);
        if (exp.jane) janePages++;
        if (exp.wm.length) wmPages++;
        findings.push(...checkEmbeds(rel, text, exp));
        const builtRoot = tp.tree(text);
        const srcRoot = tp.tree(raw);
        const hf = checkHrefs(rec.path, rel, srcRoot, builtRoot, ex, hrefStats);
        hrefsCompared++;
        findings.push(...hf);
        findings.push(...checkMeta(rel, builtRoot));
        metas++;
        findings.push(...checkDataAttrs(rel, srcRoot, builtRoot));
        dataPages++;
      }
    }
  }
  if (pages !== routes.paths.length) findings.push({ check: 'page-count', detail: pages + ' pages vs ' + routes.paths.length + ' paths' });
  return { dir, files: files.length, pages, imgs, decorativeImgs: decorative, aiVariants: ai, videos, videoTags, fonts, platformSources: platform.length, janePages, weedmapsPages: wmPages, hrefPages: hrefsCompared, hrefStats, metaPages: metas, dataAttrPages: dataPages, findings };
}

/**
 * the video planted-fault control: a served video of the tree (or, when it serves none, a clip synthesised with ffmpeg
 * from a flat colour and labelled with tools/ai-label.mjs embed) is copied to a temp dir; the labelled copy must pass
 * checkVideo, and a copy stripped of its metadata (ffmpeg -c copy -map_metadata -1) must be reported 'video-ai-label'.
 */
export function videoLabelControl(dir) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-video-control-'));
  try {
    const served = listFiles(dir).find((f) => /^assets\/video\/.+\.(mp4|webm)$/.test(f));
    const ext = served ? path.extname(served) : '.mp4';
    const labelled = path.join(tmp, 'labelled' + ext);
    if (served) fs.copyFileSync(path.join(dir, served), labelled);
    else {
      const r = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0x203022:s=64x36:r=10:d=0.5', '-c:v', 'mpeg4', '-pix_fmt', 'yuv420p', labelled], { encoding: 'utf8' });
      if (r.status !== 0) return { fired: false, why: 'ffmpeg could not synthesise the control clip: ' + String(r.stderr || r.error || '').slice(0, 160) };
      ail.embedFile(labelled);
    }
    const stripped = path.join(tmp, 'stripped' + ext);
    const s = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', '-i', labelled, '-map', '0', '-c', 'copy', '-map_metadata', '-1', '-fflags', '+bitexact', stripped], { encoding: 'utf8' });
    if (s.status !== 0) return { fired: false, why: 'ffmpeg could not strip the control clip: ' + String(s.stderr || s.error || '').slice(0, 160) };
    const name = 'assets/video/000000000000-ai' + ext;
    const labelledPasses = checkVideo(name, labelled).length === 0;
    const strippedReported = checkVideo(name, stripped).some((x) => x.check === 'video-ai-label');
    return { fired: labelledPasses && strippedReported, from: served || 'synthesised clip', labelledPasses, strippedReported };
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

export function runControls(dir) {
  const page = 'about-us/index.html';
  const html = fs.readFileSync(path.join(dir, page), 'utf8');
  const has = (fs_, check) => fs_.some((x) => x.check === check);
  const { routes, ex } = loadSource();
  const rec = (out) => routes.paths.find((p) => p.out === out);
  const raw = (out) => fs.readFileSync(path.join(WS, rec(out).rawFile), 'utf8');
  const built = (out) => fs.readFileSync(path.join(dir, out), 'utf8');
  const once = (s, a, b) => { const i = s.indexOf(a); return i < 0 ? null : s.slice(0, i) + b + s.slice(i + a.length); };
  // platform images
  const platform = platformSources();
  const spinner = platform.find((s) => /spinner\.svg$/.test(s.file));
  const sprite = platform.find((s) => /chosen-sprite\.png$/.test(s.file));
  const spinnerBuf = fs.readFileSync(path.join(WS, spinner.file));
  // embeds
  const jp = 'location/san-pedro/shop/index.html', jExp = embedExpect(raw(jp)), jHtml = built(jp);
  const wp = 'lax-menu/index.html', wExp = embedExpect(raw(wp)), wHtml = built(wp);
  const wTag = wExp.wm[0] || '';
  // hrefs
  const aRaw = tp.tree(raw(page));
  const A8_TO = '/location/san-pedro/shop/?filters%5Broot_types%5D%5B%5D=vape', A8_FROM = '/shop-playa-vista/?filters%5Broot_types%5D%5B%5D=vape';
  const hrefCase = (h) => (h == null ? false : has(checkHrefs('/about-us/', page, aRaw, tp.tree(h), ex), 'href-parity'));
  // meta
  const md = (/<meta name="description" content="([^"]*)">/.exec(html) || [])[1] || '';
  const metaCase = (h) => (h == null || h === html ? false : has(checkMeta(page, tp.tree(h)), 'meta-description'));
  // fonts and videos
  const all = listFiles(dir);
  const fontFiles = all.filter((f) => /^assets\/fonts\//.test(f));
  const disp = fontFiles.find((f) => /^assets\/fonts\/bricolage-grotesque-.+\.woff2$/.test(f)) || 'assets/fonts/bricolage-grotesque-latin.woff2';
  const fontsWithout = (rel) => [...fontFiles.filter((f) => f !== rel), ...(fontFiles.includes(disp) ? [] : [disp])];
  const V = '<video preload="none" muted loop playsinline poster="/assets/img/0123456789ab-1920-ai.webp"><source src="/assets/video/0123456789ab-ai.webm" type="video/webm"><source src="/assets/video/0123456789ab-ai.mp4" type="video/mp4"></video>';
  const vCase = (v, check) => has(checkHtml(page, html.replace('</main>', v + '</main>'), 'page'), check);
  const vl = videoLabelControl(dir);
  const c = {
    plantedWpContent: checkResidue(page, html.replace('</main>', '<p>/wp-content/uploads/x.png</p></main>')).some((x) => /wp-content/.test(x.detail)),
    plantedWebflowClass: checkResidue(page, html.replace('<main ', '<main class="w-container" ')).some((x) => /webflow-class/.test(x.detail)),
    secondH1: has(checkHtml(page, html.replace('</main>', '<h1>Second</h1></main>'), 'page'), 'one-h1'),
    emptyAltNotDecorative: has(checkHtml(page, html.replace('</main>', '<img src="/x.webp" width="1" height="1" alt=""></main>'), 'page'), 'img-alt-empty'),
    licenceRemoved: has(checkHtml(page, html.split(LICENCE).join('Cannabis License'), 'page'), 'licence-line'),
    spinnerUnderHashName: has(checkPlatform('assets/img/' + spinner.sha256.slice(0, 12) + '.svg', spinnerBuf, platform), 'platform-ui-image'),
    spinnerCopyNeutralName: has(checkPlatform('assets/img/000000000000.svg', spinnerBuf, platform), 'platform-ui-image'),
    spriteVariantName: has(checkPlatform('assets/img/' + sprite.sha256.slice(0, 12) + '-52.webp', Buffer.from('x'), platform), 'platform-ui-image'),
    janeHeadOneByte: jHtml.includes('"storeId":4281') && checkEmbeds(jp, once(jHtml, '"storeId":4281', '"storeId":4282'), jExp).some((x) => x.check === 'embed-jane-head'),
    janeBodyOneByte: !!jExp.jane && checkEmbeds(jp, once(jHtml, jExp.jane.body, jExp.jane.body.replace('id="app"', 'id="apq"')), jExp).some((x) => x.check === 'embed-jane-body'),
    weedmapsChanged: !!wTag && has(checkEmbeds(wp, once(wHtml, wTag, wTag.replace('embed.js', 'embed.jsx')), wExp), 'embed-weedmaps'),
    weedmapsDoubled: !!wTag && has(checkEmbeds(wp, once(wHtml, wTag, wTag + wTag), wExp), 'embed-weedmaps'),
    janeOnOtherPage: !!jExp.jane && has(checkEmbeds(page, html.replace('</head>', jExp.jane.head + '</head>'), embedExpect(raw(page))), 'embed-jane-unexpected'),
    weedmapsOnOtherPage: !!wTag && has(checkEmbeds(page, html.replace('</main>', wTag + '</main>'), embedExpect(raw(page))), 'embed-weedmaps-unexpected'),
    a8Reverted: html.includes(A8_TO) && hrefCase(once(html, A8_TO, A8_FROM)),
    linkRepointed: html.includes('href="/contact/"') && hrefCase(once(html, 'href="/contact/"', 'href="/about-us/"')),
    metaInventedWords: !!md && metaCase(once(html, '<meta name="description" content="' + md, '<meta name="description" content="Best weed in LA. ' + md)),
    metaChangedWord: md.includes('welcoming') && metaCase(once(html, '<meta name="description" content="' + md, '<meta name="description" content="' + md.replace('welcoming', 'inviting'))),
    ogDescriptionDiffers: !!md && metaCase(once(html, '<meta property="og:description" content="' + md, '<meta property="og:description" content="' + md.slice(0, -1))),
    // store-switcher data-* (4.5): each plant must be reported; verifier 2's five cases
    dataHoursChanged: html.includes('data-hours="Open: 10:00 AM - 10:00 PM"') && has(checkDataAttrs(page, aRaw, tp.tree(once(html, 'data-hours="Open: 10:00 AM - 10:00 PM"', 'data-hours="Open: 9:00 AM - 10:00 PM"'))), 'data-attr-parity'),
    dataAddressChanged: html.includes('data-address="1705 S Gaffey Street"') && has(checkDataAttrs(page, aRaw, tp.tree(once(html, 'data-address="1705 S Gaffey Street"', 'data-address="1706 S Gaffey Street"'))), 'data-attr-parity'),
    dataMenuUrlRepointed: html.includes('data-menu-url="/location/san-pedro/shop/"') && has(checkDataAttrs(page, aRaw, tp.tree(once(html, 'data-menu-url="/location/san-pedro/shop/"', 'data-menu-url="/location/culver-city/shop/"'))), 'data-attr-parity'),
    dataSanpedroUrlRepointed: html.includes('data-sanpedro-url="/location/san-pedro/shop/"') && has(checkDataAttrs(page, aRaw, tp.tree(once(html, 'data-sanpedro-url="/location/san-pedro/shop/"', 'data-sanpedro-url="/location/culver-city/shop/"'))), 'data-attr-parity'),
    dataDirectionsChanged: html.includes('cid=376465196010288395') && has(checkDataAttrs(page, aRaw, tp.tree(once(html, 'cid=376465196010288395', 'cid=376465196010288396'))), 'data-attr-parity'),
    cleanPagePasses: checkHtml(page, html, 'page').length === 0 && checkResidue(page, html).length === 0 && checkHrefs('/about-us/', page, aRaw, tp.tree(html), ex).length === 0 && checkMeta(page, tp.tree(html)).length === 0 && checkDataAttrs(page, aRaw, tp.tree(html)).length === 0,
    cleanShopPagesPass: checkEmbeds(jp, jHtml, jExp).length === 0 && checkEmbeds(wp, wHtml, wExp).length === 0,
    // fonts (4.11): an unknown family, a TTF, a display face without its licence; the tree's own font set passes
    fontUnknownFamily: has(checkFonts([...fontFiles, 'assets/fonts/anton-latin.woff2']), 'font-not-allowed'),
    fontTtf: has(checkFonts([...fontFiles, 'assets/fonts/BricolageGrotesque-var.ttf']), 'font-format'),
    fontLicenceMissing: has(checkFonts(fontsWithout(disp.replace(/\.woff2$/, '.LICENSE.txt'))), 'font-licence-missing'),
    fontDisplayFaceMissing: has(checkFonts(fontFiles.filter((f) => !/^assets\/fonts\/bricolage-grotesque-/.test(f))), 'font-display-face-missing'),
    cleanFontsPass: checkFonts(fontFiles).length === 0,
    // videos: the label gate on a stripped copy; the <video> markup rules; a clean <video> passes
    videoLabelStripped: vl.fired,
    videoNoPreloadNone: vCase(V.replace('preload="none" ', ''), 'video-preload'),
    videoAutoplay: vCase(V.replace('<video ', '<video autoplay '), 'video-autoplay'),
    videoNoPoster: vCase(V.replace(/ poster="[^"]*"/, ''), 'video-poster'),
    videoUnlabelledPoster: vCase(V.replace('-1920-ai.webp', '-1920.webp'), 'video-poster'),
    videoThirdPartySource: vCase(V.replace('/assets/video/0123456789ab-ai.mp4', 'https://cdn.example.com/loop.mp4'), 'video-src'),
    cleanVideoPasses: !checkHtml(page, html.replace('</main>', V + '</main>'), 'page').some((x) => /^video-/.test(x.check)),
  };
  c.videoControlDetail = vl;
  c.fired = Object.values(c).every(Boolean);
  return c;
}

const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (IS_MAIN) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? null : process.argv[i + 1]; };
  const dir = path.resolve(arg('--dir') || path.join(WS, 'dist'));
  const r = checkDist(dir);
  const by = r.findings.reduce((a, x) => { a[x.check] = (a[x.check] || 0) + 1; return a; }, {});
  console.log('build-check ' + dir);
  console.log('files ' + r.files + ' | pages ' + r.pages + ' | <img> ' + r.imgs + ' (decorative ' + r.decorativeImgs + ') | AI-labelled variants ' + r.aiVariants + ' | videos ' + r.videos + ' (<video> tags ' + r.videoTags + ') | font files ' + r.fonts + ' | platform sources ' + r.platformSources + ' | Jane pages ' + r.janePages + ' | Weedmaps pages ' + r.weedmapsPages + ' | href pages ' + r.hrefPages + ' | meta pages ' + r.metaPages + ' | findings ' + r.findings.length + ' ' + JSON.stringify(by));
  console.log('hrefs: ' + JSON.stringify(r.hrefStats));
  for (const x of r.findings.slice(0, 30)) console.log('  FINDING ' + x.check + ' ' + (x.file || '') + ' ' + (x.detail || ''));
  let c = { fired: true };
  if (process.argv.includes('--control')) {
    c = runControls(dir);
    console.log('control: ' + (c.fired ? 'fired (planted wp-content, Webflow class, second h1, empty alt, missing licence, spinner by hash name and by bytes, sprite variant name, one byte in the Jane head and body, a changed and a doubled Weedmaps tag, a reverted A8 link, a re-pointed link, invented and changed meta words, a differing og:description, a changed data-hours, data-address, re-pointed data-menu-url, re-pointed data-sanpedro-url and changed directions cid, an unknown font family, a TTF, a display face without its licence, a tree without the display face, a video stripped of its AI label (' + c.videoControlDetail.from + '), a <video> without preload="none", with autoplay, without a poster, with an unlabelled poster and with a third-party source each reported; the clean pages, the font set and a clean <video> pass)' : 'DID NOT FIRE ' + JSON.stringify(c)));
  }
  if (arg('--json')) fs.writeFileSync(path.resolve(arg('--json')), JSON.stringify({ ...r, control: c }, null, 1));
  process.exitCode = r.findings.length || !c.fired ? 1 : 0;
}
