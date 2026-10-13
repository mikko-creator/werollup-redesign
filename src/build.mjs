#!/usr/bin/env node
// build.mjs - src/content/** + a theme module -> a static site (PIPELINE). BUILD-CONTRACT 3.1. Node builtins only;
// cwebp (and webpmux for generated images) on PATH. Offline and deterministic: two builds are byte-identical
// (tools/hashdir.mjs proves it).
//
//   node src/build.mjs [--out <dir>] [--cache <dir>] [--theme stub|real]
//     --out    output directory (default dist/). It is deleted and rewritten (refused for the workspace root,
//              src/, assets/, audit/, docs/, tools/ or any parent of the workspace).
//     --cache  WebP variant cache (default assets/optimized/); a verifier passes its own tmp dir.
//     --theme  stub = src/theme-stub/index.mjs; real = src/theme/index.mjs. Default: real when src/theme/index.mjs
//              exists, else stub.
// Exit 1 (nothing half-reported) on: a dead internal link or asset, an unknown block type, a duplicate output path,
// a page without exactly one <h1>, platform or tracking residue (src/lib/policy.mjs), a failed image variant, an image
// ref that does not resolve, a platform UI image (refused in resolve() and publish(), and found by content in the
// output), content out of date with audit/raw (the extract.mjs --check comparison, every file it writes), a font
// that must never ship, a display face without its licence text, a malformed video slot in image-plan.json, a loop
// file without the AI label, or (THEME_STRICT=1 only) a partly generated video slot.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ROOT, ORIGIN, SITE_NAME, BUILD_DATE, LICENCE, readJSON, readText, exists, writeIfChanged, cmp } from './lib/site.mjs';
import { ImagePipeline, makeImg, makeImgSrc, makeVideo, platformUiSources } from './lib/images.mjs';
import { scanResidue, NEVER_SHIP } from './lib/policy.mjs';
import { seoHead, ogFor, robotsTxt, sitemapXml } from './lib/seo.mjs';
import { staleContent } from './lib/extract.mjs';

/* ------------------------------------------------------------------ args */
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const OUT = path.resolve(ROOT, arg('--out', 'dist'));
const CACHE = path.resolve(ROOT, arg('--cache', path.join('assets', 'optimized')));
const THEME = arg('--theme', exists('src/theme/index.mjs') ? 'real' : 'stub');
const errors = [];
const fail = (msg) => errors.push(msg);
const log = (...m) => console.log(...m);

function guardOut(dir) {
  const r = path.resolve(dir);
  const bad = [ROOT, ...['src', 'assets', 'audit', 'docs', 'tools', 'facts', 'presets', 'tmp'].map((d) => path.join(ROOT, d))];
  if (bad.includes(r) || ROOT.startsWith(r + path.sep) || r === path.parse(r).root) throw new Error('refusing to use --out ' + r);
  if (r.startsWith(path.join(ROOT, 'src') + path.sep) || r.startsWith(path.join(ROOT, 'assets') + path.sep) || r.startsWith(path.join(ROOT, 'audit') + path.sep)) throw new Error('refusing to write into ' + r);
}

/* ------------------------------------------------------------------ block vocabulary (docs/PIPELINE-CONTENT.md) */
export const BLOCK_TYPES = new Set(['heading', 'paragraph', 'list', 'buttons', 'image', 'rule', 'page-header', 'hero-tile', 'location-cards', 'split', 'accordion', 'card-grid', 'card-carousel', 'logo-carousel', 'deals', 'link-card', 'icon-link', 'notice', 'post-list', 'search-form', 'zip-finder', 'form', 'map', 'embed']);
function checkBlocks(blocks, where) {
  for (const b of blocks || []) {
    if (!b || !BLOCK_TYPES.has(b.type)) { fail('unknown block type "' + (b && b.type) + '" in ' + where); continue; }
    for (const k of ['blocks', 'intro', 'outro']) if (Array.isArray(b[k])) checkBlocks(b[k], where);
    for (const k of ['cards', 'items']) if (Array.isArray(b[k])) for (const x of b[k]) if (x && Array.isArray(x.blocks)) checkBlocks(x.blocks, where);
  }
}

/* ------------------------------------------------------------------ main */
async function main() {
  guardOut(OUT);
  // 1. content: in sync with audit/raw. The same comparison as `extract.mjs --check` (the same serialisation, every file
  //    extract writes: the page models, _index.json, chrome.json, routes.json, changes.json, parity-exceptions.json, and
  //    no stale page file); a mismatch means src/content is stale or was edited by hand.
  const stale = staleContent();
  if (stale.length) fail('src/content is out of date with audit/raw (' + stale.length + ': ' + stale.slice(0, 6).join(', ') + '): run node src/lib/extract.mjs');
  const idx = readJSON('src/content/pages/_index.json');
  const pages = idx.pages.map((p) => readJSON('src/content/pages/' + p.slug + '.json'));
  const chrome = readJSON('src/content/chrome.json');
  const routes = readJSON('src/content/routes.json');
  const imagePlan = exists('src/content/image-plan.json') ? (readJSON('src/content/image-plan.json').slots || {}) : {};

  // 2. structural checks before rendering
  const outPaths = new Map();
  for (const p of pages) {
    const o = p.path === '/' ? 'index.html' : p.path.slice(1) + 'index.html';
    if (outPaths.has(o)) fail('duplicate output path ' + o + ' (' + outPaths.get(o) + ', ' + p.path + ')');
    outPaths.set(o, p.path);
    for (const s of p.sections) checkBlocks(s.blocks, p.path + ' ' + s.id);
  }
  for (const a of routes.aliases) {
    if (outPaths.has(a.stub)) fail('duplicate output path ' + a.stub + ' (alias ' + a.from + ' collides with a page)');
    outPaths.set(a.stub, 'alias ' + a.from);
  }
  if (errors.length) return finish();

  // 3. theme
  const themeFile = THEME === 'real' ? path.join(ROOT, 'src', 'theme', 'index.mjs') : path.join(ROOT, 'src', 'theme-stub', 'index.mjs');
  if (!fs.existsSync(themeFile)) { fail('theme module not found: ' + themeFile); return finish(); }
  const theme = await import(pathToFileURL(themeFile).href);
  for (const k of ['renderPage', 'render404']) if (typeof theme[k] !== 'function') fail('theme module lacks ' + k + '()');
  if (errors.length) return finish();

  // 4. output dir
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const files = new Map(); // relative path -> Buffer|string
  const put = (rel, data) => { if (files.has(rel)) fail('duplicate output path ' + rel); files.set(rel, data); };

  // 5. bundles (fingerprinted) from the theme's styles/scripts lists
  const stylesDir = path.join(ROOT, theme.stylesDir || 'src/styles');
  const scriptsDir = path.join(ROOT, theme.scriptsDir || 'src/scripts');
  const cat = (dir, list) => (list || []).map((f) => { const p = path.join(dir, f); if (!fs.existsSync(p)) { fail('theme asset missing: ' + path.relative(ROOT, p)); return ''; } return '/* ' + f + ' */\n' + fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); }).join('\n');
  const css = cat(stylesDir, theme.styles);
  const js = cat(scriptsDir, theme.scripts);
  const h10 = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
  const assets = {};
  assets['site.css'] = '/assets/site.' + h10(css) + '.css';
  put(assets['site.css'].slice(1), css);
  if (js.trim()) { assets['site.js'] = '/assets/site.' + h10(js) + '.js'; put(assets['site.js'].slice(1), js); }

  // 6. fonts (4.11): Libre Franklin, Source Sans Pro (the Jane block) and the display face DESIGN-SPEC 3.2 names
  //    (Bricolage Grotesque, D-8: a Latin woff2 made by tools/font-woff2.mjs, axes pinned wdth=100,opsz=96), woff2 only.
  //    The display face ships with its licence text (SIL OFL 1.1 condition 2; the subset's name table keeps the
  //    copyright, not the licence). @font-face sheets: the harvested OMGF sheets, and one written here for Bricolage.
  const FONT_OK = /^(libre-franklin|source-sans-pro|bricolage-grotesque)-[a-z0-9-]+\.woff2$/;
  const FONT_NEVER = /helvetica|agrandir/i;
  const fontDir = path.join(ROOT, 'assets', 'fonts');
  const shippedFonts = [];
  for (const f of fs.readdirSync(fontDir).sort(cmp)) {
    if (FONT_NEVER.test(f) || !FONT_OK.test(f)) continue;
    put('assets/fonts/' + f, fs.readFileSync(path.join(fontDir, f)));
    shippedFonts.push(f);
    assets['fonts/' + f] = '/assets/fonts/' + f;
    if (/^bricolage-grotesque-/.test(f)) {
      const lic = f.replace(/\.woff2$/, '.LICENSE.txt');
      if (!fs.existsSync(path.join(fontDir, lic))) fail('display face ' + f + ' ships without its licence text assets/fonts/' + lic);
      else put('assets/fonts/' + lic, fs.readFileSync(path.join(fontDir, lic)));
    }
  }
  const bricolage = shippedFonts.filter((f) => /^bricolage-grotesque-/.test(f));
  if (!bricolage.length) fail('the display face is missing: no assets/fonts/bricolage-grotesque-*.woff2 (DESIGN-SPEC D-8)');
  else {
    // the Latin range tools/font-woff2.mjs subsets to by default (the Google Fonts "latin" range)
    const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
    put('assets/fonts/bricolage-grotesque.css', '/* Bricolage Grotesque: SIL OFL 1.1, Copyright 2022 The Bricolage Grotesque Project Authors; the licence text ships next to each file (.LICENSE.txt). Latin subset, axes pinned wdth=100, opsz=96 (DESIGN-SPEC D-8); wght 200-800 stays variable. */\n'
      + bricolage.map((f) => "@font-face {\n  font-family: 'Bricolage Grotesque';\n  font-style: normal;\n  font-weight: 200 800;\n  font-display: block;\n  src: url('/assets/fonts/" + f + "') format('woff2');\n" + (/-latin\.woff2$/.test(f) ? '  unicode-range: ' + LATIN + ';\n' : '') + '}\n').join(''));
    assets['fonts/bricolage-grotesque.css'] = '/assets/fonts/bricolage-grotesque.css';
  }
  const fontSheet = (src, family) => {
    let t = readText(src).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    t = t.replace(/url\('\/\/werollup\.com\/wp-content\/uploads\/omgf\/omgf-stylesheet-\d+\/([a-z0-9-]+\.woff2)\?ver=\d+'\)/g, (m, f) => { if (!fs.existsSync(path.join(ROOT, 'assets', 'fonts', f))) fail('font file missing: ' + f); return "url('/assets/fonts/" + f + "')"; });
    if (!t.includes("font-family: '" + family + "'")) fail('font sheet ' + src + ' does not declare ' + family);
    return t.replace(/\}@font-face/g, '}\n@font-face') + '\n';
  };
  put('assets/fonts/libre-franklin.css', fontSheet('audit/css/wp-content-uploads-omgf-omgf-stylesheet-138-omgf-stylesheet-138.css-ver-1667243715.css', 'Libre Franklin'));
  put('assets/fonts/source-sans-pro.css', fontSheet('audit/css/wp-content-uploads-omgf-omgf-stylesheet-155-omgf-stylesheet-155.css-ver-1667243715.css', 'Source Sans Pro'));
  assets['fonts/libre-franklin.css'] = '/assets/fonts/libre-franklin.css';
  assets['fonts/source-sans-pro.css'] = '/assets/fonts/source-sans-pro.css';
  put('assets/favicon.png', fs.readFileSync(path.join(ROOT, 'assets/source/8bd84cc3-cropped-favicon-1-150x150.png')));
  assets['favicon.png'] = '/assets/favicon.png';

  // 7. ctx
  const pipeline = new ImagePipeline({ cacheDir: CACHE, outDir: OUT, imagePlan });
  const img = makeImg(pipeline);
  const imgSrc = makeImgSrc(pipeline);
  // video slots (image-plan kind "video"): a malformed declaration fails the build; a partly generated slot is a warning
  // (ctx.video returns null), fatal under THEME_STRICT=1 (the integrator's and every final build); an unlabelled loop
  // file fails the build when it is served (ctx.video -> videoUrl)
  const STRICT = process.env.THEME_STRICT === '1';
  const videoState = { declared: 0, ready: 0, absent: 0, partial: 0 };
  const warned = new Set();
  for (const id of Object.keys(imagePlan).sort(cmp)) {
    if (!imagePlan[id] || imagePlan[id].kind !== 'video') continue;
    videoState.declared++;
    const r = pipeline.resolveVideo(id);
    if (r.error) fail('image-plan: ' + r.error);
    else if (r.absent) videoState.absent++;
    else if (r.partial) {
      videoState.partial++;
      const msg = 'video slot "' + id + '" is partly generated (missing: ' + r.partial.join(', ') + ')';
      if (STRICT) fail('image-plan: ' + msg + ' (THEME_STRICT=1)'); else { warned.add(id); log('build: WARNING ' + msg + ': ctx.video returns null'); }
    } else videoState.ready++;
  }
  const video = makeVideo(pipeline, { strict: STRICT, warn: (m) => log(m), warned });
  const imgVariant = (ref, maxW) => { const r = pipeline.resolve(ref); if (r.missing) throw new Error('og:image: ' + r.missing); const vs = pipeline.variants(r.file); let v = vs[0]; for (const x of vs) if (x.w <= maxW) v = x; return v; };
  const pagesByPath = Object.fromEntries(pages.map((p) => [p.path, p]));
  const janePage = pages.find((p) => p.path === '/location/san-pedro/shop/');
  const ctx = {
    site: {
      name: SITE_NAME, origin: ORIGIN, licence: LICENCE,
      stores: storesOf(chrome),
      socials: chrome.topBar.socials.map((s) => ({ label: s.label, href: s.href })),
    },
    nav: chrome.nav, header: chrome.header, topBar: chrome.topBar, marquee: chrome.marquee, shoppingStrip: chrome.shoppingStrip,
    offcanvas: chrome.offcanvas, footer: chrome.footer, ageGate: chrome.ageGate, locationChooser: chrome.locationChooser,
    reviews: chrome.reviews, zipFinder: chrome.zipFinder,
    url: (p) => p, img, imgSrc, video, asset: (name) => { if (!(name in assets)) { if (name === 'site.js') return null; throw new Error('ctx.asset: unknown asset ' + name); } return assets[name]; },
    buildDate: BUILD_DATE, pagesByPath, seoHead,
    notFound: {
      janeBootPrefix: routes.notFound.janeBootPrefix,
      janeShopPath: janePage.path,
      janeBody: janePage.embed.body,
      bootScript: jane404Boot(routes.notFound.janeBootPrefix, janePage.path),
    },
  };

  // 8. pages (page.generated: the image-plan slots IMAGERY assigns to this path; slot ids go through ctx.img, and the
  //    ids of kind "video" are also listed in page.generated.video for ctx.video)
  if (errors.length) return finish();
  for (const p of pages) {
    p.generated.video = [];
    for (const [id, slot] of Object.entries(imagePlan).sort((x, y) => cmp(x[0], y[0]))) {
      if (!slot || !Array.isArray(slot.pages) || !slot.pages.includes(p.path)) continue;
      if (slot.role === 'hero' && !p.generated.hero) p.generated.hero = id; else p.generated.art.push(id);
      if (slot.kind === 'video') p.generated.video.push(id);
    }
    try { p.og = ogFor(p, imgVariant); } catch (e) { fail(p.path + ': ' + e.message); continue; }
    let html;
    try { html = theme.renderPage(p, ctx); } catch (e) { fail('render ' + p.path + ': ' + e.message); continue; }
    const h1 = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1 !== 1) fail(p.path + ': ' + h1 + ' <h1> elements (exactly one required)');
    if (!html.includes(LICENCE)) fail(p.path + ': the licence line is missing');
    put(p.path === '/' ? 'index.html' : p.path.slice(1) + 'index.html', html);
  }
  // 9. 404, alias stubs, _redirects, robots, sitemap
  try { put('404.html', theme.render404(ctx)); } catch (e) { fail('render404: ' + e.message); }
  for (const a of routes.aliases) put(a.stub, aliasStub(a));
  put('_redirects', redirects(routes));
  put('robots.txt', robotsTxt());
  put('sitemap.xml', sitemapXml(routes.paths.map((r) => r.path)));
  if (errors.length) return finish();

  // 10. images: run cwebp for every planned variant, copy into <out>/assets/img/
  const st = await pipeline.run();
  if (st.failed.length) for (const f of st.failed) fail('image variant failed: ' + f.src + ' @' + f.width + ' ' + f.err);
  for (const [rel, data] of [...files].sort((a, b) => cmp(a[0], b[0]))) writeIfChanged(path.join(OUT, rel), data);
  const pub = pipeline.publish();
  if (pub.missing.length) fail('image variants or videos missing: ' + pub.missing.slice(0, 5).join(', '));
  for (const r of pub.refused) fail('platform UI image refused at publish: ' + r);

  // 11. post-build gates over the written tree
  const all = listFiles(OUT);
  // platform UI images (4.10), by CONTENT: output image names are content hashes (<sha12>-<w>.webp, <sha12>.svg), so a
  // name test can never match; compare the sha12 name prefix and the full bytes with every NEVER_SHIP source file
  const platform = platformUiSources();
  for (const rel of all) {
    const base = rel.split('/').pop();
    const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(OUT, rel))).digest('hex');
    for (const s of platform) {
      if (base.startsWith(s.sha256.slice(0, 12) + '-') || base.startsWith(s.sha256.slice(0, 12) + '.')) fail('platform UI image shipped (a variant of ' + s.file + '): ' + rel);
      else if (sha === s.sha256) fail('platform UI image shipped (byte-identical to ' + s.file + '): ' + rel);
    }
    if (NEVER_SHIP.test(rel)) fail('platform UI image shipped (by name): ' + rel);
    if (/helvetica|agrandir/i.test(rel)) fail('a never-ship font shipped: ' + rel);
    if (!/\.(html|css|js|txt|xml|json|svg)$|^_redirects$/.test(rel)) continue;
    const text = fs.readFileSync(path.join(OUT, rel), 'utf8');
    for (const h of scanResidue(text)) fail('residue ' + h.id + ' in ' + rel + ': ' + h.excerpt);
  }
  const dead = deadLinks(OUT, all);
  for (const d of dead.slice(0, 50)) fail('dead internal link in ' + d.file + ': ' + d.url);
  if (dead.length > 50) fail('... ' + (dead.length - 50) + ' more dead links');
  log('build: theme=' + THEME + ' pages=' + pages.length + ' aliases=' + routes.aliases.length + ' files=' + all.length + ' images planned=' + st.planned + ' made=' + st.made + ' cached=' + st.cached + ' videos served=' + pub.videos.length + ' (video slots declared ' + videoState.declared + ': ready ' + videoState.ready + ', not generated ' + videoState.absent + ', partial ' + videoState.partial + ') fonts=' + shippedFonts.length + ' -> ' + path.relative(ROOT, OUT));
  return finish();
}

function finish() {
  if (errors.length) { console.error('BUILD FAILED (' + errors.length + ')'); for (const e of errors) console.error('  - ' + e); process.exitCode = 1; return; }
  log('build: OK');
}

function storesOf(chrome) {
  const opts = chrome.topBar.select.options.filter((o) => o.slug);
  return opts.map((o) => {
    const f = chrome.footer.stores.find((s) => s.name.replace(/\s+/g, ' ').trim() === o.label);
    const strip = chrome.shoppingStrip[o.slug];
    return {
      id: o.slug, name: o.label, addressLines: f ? [f.address] : [o.address], phone: f && f.phone ? { display: f.phone.display, href: f.phone.href } : null,
      hoursLine: o.hours, storePath: o.value, shopPath: o.menuUrl,
      reviewLinks: (strip ? strip.buttons : []).filter((b) => /review/i.test(b.text)).map((b) => b.href),
      directions: o.directionsUrl,
    };
  });
}

/**
 * 404.html boot (4.1, A14): under /location/san-pedro/shop/menu/ the page fetches the San Pedro shop page (same
 * origin), takes its Jane head block (between the plugin comments, so the vendor block stays byte-identical and the
 * Jane client keys stay on the shop pages only, 4.14) and inserts it with createContextualFragment so its scripts run.
 * The mount (<div id="app">) is static in 404.html. Elsewhere the page is a normal 404. UNVERIFIED in a browser.
 */
function jane404Boot(prefix, shopPath) {
  const H0 = '<!-- Jane Menu Plugin Header -->', H1 = '<!-- /Jane Menu Plugin Header -->';
  return '<script>(function(){var P=' + JSON.stringify(prefix) + ';if(location.pathname.indexOf(P)!==0)return;'
    + 'document.documentElement.classList.add("jane-boot");'
    + 'fetch(' + JSON.stringify(shopPath) + ',{credentials:"same-origin"}).then(function(r){return r.text();}).then(function(h){'
    + 'var a=h.indexOf(' + JSON.stringify(H0) + '),b=h.indexOf(' + JSON.stringify(H1) + ');if(a<0||b<0)return;'
    + 'document.head.appendChild(document.createRange().createContextualFragment(h.slice(a,b+' + H1.length + ')));});})();</script>';
}

function aliasStub(a) {
  const to = a.to;
  const abs = ORIGIN + to;
  const e = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return '<!doctype html>\n<html lang="en-US">\n<head>\n<meta charset="utf-8">\n<title>' + e(SITE_NAME) + '</title>\n<meta name="robots" content="noindex">\n<link rel="canonical" href="' + e(abs) + '">\n<meta http-equiv="refresh" content="0; url=' + e(to) + '">\n</head>\n<body>\n<p><a href="' + e(to) + '">' + e(abs) + '</a></p>\n</body>\n</html>\n';
}

function redirects(routes) {
  const L = ['# _redirects (Netlify / Cloudflare Pages syntax). Generated by src/build.mjs; BUILD-CONTRACT 4.1.', '# 1. The 14 aliases (audit/site-inventory.json pages[].aliases), slashless and slash forms, 301.'];
  for (const a of routes.aliases) { const f = a.from.replace(/\/$/, ''); L.push(f + ' ' + a.to + ' 301'); L.push(a.from + ' ' + a.to + ' 301'); }
  L.push('# 2. The slashless form of every served path, 301 to the trailing-slash form (the live site does the same).');
  for (const r of routes.slashRedirects) L.push(r.from + ' ' + r.to + ' 301');
  return L.join('\n') + '\n';
}

function listFiles(dir) {
  const out = [];
  const rec = (d, pre) => { for (const f of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => cmp(x.name, y.name))) { if (f.isDirectory()) rec(path.join(d, f.name), pre + f.name + '/'); else out.push(pre + f.name); } };
  rec(dir, '');
  return out;
}

/** every internal href/src/srcset/og:image in the html files must resolve to a written file */
export function deadLinks(out, all) {
  const set = new Set(all);
  const resolves = (u) => {
    let p = u.split('#')[0].split('?')[0];
    if (!p || p === '') return true;
    try { p = decodeURIComponent(p); } catch { /* keep */ }
    if (p.endsWith('/')) return set.has((p + 'index.html').slice(1));
    return set.has(p.slice(1)) || set.has(p.slice(1) + '/index.html');
  };
  const dead = [];
  for (const rel of all.filter((f) => f.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(out, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]+))\s*\)/gi)) {
      const u = (m[1] ?? m[2] ?? m[3]).trim();
      if (u.startsWith('/') && !u.startsWith('//') && !resolves(u)) dead.push({ file: rel, url: u });
    }
  }
  for (const rel of all.filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(out, rel), 'utf8');
    const urls = [];
    const re = /\s(href|src|poster|action|content|data-lax-url|data-sanpedro-url|data-menu-url)\s*=\s*"([^"]*)"/gi;
    let m;
    while ((m = re.exec(html))) {
      const k = m[1].toLowerCase();
      let v = m[2].replace(/&amp;/g, '&');
      if (k === 'content') { if (!v.startsWith(ORIGIN + '/assets/')) continue; v = v.slice(ORIGIN.length); }
      if (k === 'action' && v === '/__form-endpoint-not-configured__') continue;
      urls.push(v);
    }
    const ss = /\ssrcset\s*=\s*"([^"]*)"/gi;
    while ((m = ss.exec(html))) for (const part of m[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
    for (const u of urls) {
      if (!u.startsWith('/') || u.startsWith('//')) continue;
      if (!resolves(u)) dead.push({ file: rel, url: u });
    }
  }
  return dead;
}

main().catch((e) => { console.error('BUILD FAILED: ' + (e && e.stack || e)); process.exitCode = 1; });
