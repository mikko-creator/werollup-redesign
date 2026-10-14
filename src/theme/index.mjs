// index.mjs - the THEME module (BUILD-CONTRACT 3.2, 5.2). FOUNDATION owns this file.
//   styles / scripts: the bundle order (foundation first, then the phase-2 files).
//   renderPage(page, ctx): dispatch on page.kind to the owning phase-2 module (home.mjs, templates-a.mjs, templates-b.mjs);
//     a module returns null to use the FOUNDATION default renderer below.
//   render404(ctx): templates-a.mjs render404, else the default 404.
// ROBUST LOADING (5.2): the three phase-2 modules are loaded with dynamic import() inside try/catch. A failure logs
// "THEME MODULE <name> FAILED: <error>" and the default renderer is used, so one lane's half-finished file never breaks
// another lane's build. With THEME_STRICT=1 a load failure, a render failure or any fallback is fatal (the build exits 1).
// The interface every phase-2 lane codes against is docs/THEME.md.
import * as P from './parts.mjs';
import * as B from './blocks.mjs';
import * as C from './chrome.mjs';
import * as S from './shell.mjs';

export const styles = ['tokens.css', 'base.css', 'glass.css', 'depth.css', 'motion.css', 'chrome.css', 'blocks.css', 'forms.css', 'home.css', 'pages-a.css', 'pages-b.css', 'rosin.css'];
export const scripts = ['site.js', 'home.js', 'pages-a.js', 'pages-b.js'];
export const stylesDir = 'src/styles';
export const scriptsDir = 'src/scripts';

const STRICT = process.env.THEME_STRICT === '1';

/* ------------------------------------------------------------------ robust loading */
const MODULE_FILES = { home: './home.mjs', 'templates-a': './templates-a.mjs', 'templates-b': './templates-b.mjs' };
const modules = {};
const failed = [];
for (const [name, rel] of Object.entries(MODULE_FILES)) {
  try {
    const m = await import(new URL(rel, import.meta.url).href);
    if (typeof m.render !== 'function') throw new Error('it exports no render(page, ctx, api) function');
    modules[name] = m;
  } catch (e) {
    failed.push(name);
    console.log('THEME MODULE ' + name + ' FAILED: ' + (e && e.message ? e.message : e));
  }
}
if (STRICT && failed.length) throw new Error('THEME_STRICT=1: theme module(s) failed to load: ' + failed.join(', ') + ' (a fallback to the default renderer is fatal under THEME_STRICT=1)');

/** page.kind -> the phase-2 module that owns it (BUILD-CONTRACT 5.1) */
export const KIND_OWNER = {
  home: 'home',
  page: 'templates-a', 'products-hub': 'templates-a', 'product-category': 'templates-a', education: 'templates-a', legal: 'templates-a',
  contact: 'templates-a', delivery: 'templates-a', 'archive-author': 'templates-a', 'archive-taxonomy': 'templates-a', review: 'templates-a',
  location: 'templates-b', shop: 'templates-b', 'lax-menu': 'templates-b', 'service-area-hub': 'templates-b', 'service-area-town': 'templates-b',
};

/* ------------------------------------------------------------------ the FOUNDATION default renderer */
const NIGHT_BG = new Set(['black', 'dark']);
/** one section of the default renderer. state carries the light-band alternation. */
export function defaultSection(page, ctx, s, i, state = { light: 0, heroDone: false }) {
  const id = s.id;
  const kinds = new Set(s.blocks.map((b) => b.type));
  // 6.16 page banner (the page's h1); compact on shop, /lax-menu and review pages
  if (s.kind === 'page-header' || kinds.has('page-header')) {
    const compact = ['shop', 'lax-menu', 'review'].includes(page.kind);
    const inner = s.blocks.map((b) => (b.type === 'page-header' ? B.pageHeader(b, ctx, page, { size: compact ? 'compact' : 'auto', veil: page.path === '/products/flower/' ? 'deep' : 'default' }) : B.renderBlock(b, ctx, page, { tone: 'night' }))).join('');
    return '<section' + P.attrs({ id, class: 'banner-band on-night' }) + '>' + inner + '</section>';
  }
  // 4.6 / 6.18.8 the embed container: calm, full width, static; nothing transformed, filtered or overlaid on its chain
  if (s.kind === 'embed' || kinds.has('embed')) {
    return '<section' + P.attrs({ id, class: 'embed-band' }) + '>' + B.renderBlocks(s.blocks, ctx, page, { tone: 'light' }) + '</section>';
  }
  // hero tiles (home, store pages): the first tile is the night hero with the G1 pane
  if (s.kind === 'hero-tile') {
    const tiles = s.blocks.map((b) => {
      if (b.type !== 'hero-tile') return B.renderBlock(b, ctx, page, { tone: 'night' });
      const first = !state.heroDone;
      state.heroDone = true;
      return B.heroTile(b, ctx, page, { first });
    }).join('');
    return P.band({ tone: 'night', atmosphere: true, id, cls: 'hero-band', inner: P.wrap(tiles, 'wide', 'hero-band__in') });
  }
  const night = NIGHT_BG.has(s.sourceBg) && s.kind !== 'accordion' && s.kind !== 'content';
  const tone = night ? 'night-calm' : (s.kind === 'accordion' ? 'haze' : ['cream', 'haze'][state.light++ % 2]);
  const t = night ? 'night' : 'light';
  if (s.kind === 'content') {
    // long form (6.19): one reading card on a calm band
    return P.band({ tone, id, cls: 'band--reading', inner: P.wrap(P.reveal(P.readingCard(B.renderBlocks(s.blocks, ctx, page, { tone: 'light', inReading: true }))), 'narrow') });
  }
  if (s.kind === 'accordion') {
    return P.band({ tone, id, cls: 'band--acc', inner: P.wrap(P.reveal(B.renderBlocks(s.blocks, ctx, page, { tone: 'light' })), 'narrow') });
  }
  return P.band({ tone, id, cls: 'band--' + s.kind, inner: P.wrap(B.renderBlocks(s.blocks, ctx, page, { tone: t })) });
}
/** the default <main> body for any page kind: banner + reading card + blocks (+ the embed container on shop pages) */
export function defaultMain(page, ctx) {
  const state = { light: 0, heroDone: false };
  return page.sections.map((s, i) => defaultSection(page, ctx, s, i, state)).join('\n');
}
/** default document options per kind */
export function defaultOptions(page) {
  return {
    promo: page.kind === 'home' ? 'after-main' : 'top', // R-7: the promo strip never enters the home first screen
    staticChrome: page.kind === 'shop' || page.kind === 'lax-menu',
  };
}

/* ------------------------------------------------------------------ the 404 */
export const PAGE_404 = { title: 'Page not found – We Roll Up', metaDescription: null, robots: 'noindex', canonical: null, og: { title: 'Page not found' }, menuFamily: 'primary', subheader: 'marquee', breadcrumbs: [], embed: null, lang: 'en-US', path: '/404.html', kind: 'not-found', sections: [], generated: { hero: null, art: [] } };
export function default404Main(ctx) {
  const nf = ctx.notFound;
  const home = (ctx.footer.quickLinks || []).find((q) => q.href === '/') || { label: 'Home', href: '/' };
  const on = ctx.header.orderNow;
  const btns = '<div class="btn-row banner__btns">' + P.pill(ctx, { label: P.esc(home.label), href: home.href, kind: 'ghost' })
    + P.pill(ctx, { label: P.esc(on.label), href: on.href, kind: 'leaf', arrow: true, cls: 'active-location-menu js-selected-location-menu', attrs: { 'data-lax-url': on.laxUrl, 'data-sanpedro-url': on.sanpedroUrl } }) + '</div>';
  return '<section class="banner-band on-night not-found">' + P.banner(ctx, PAGE_404, { headingHtml: '<h1 class="hd banner__title">Page not found</h1>', headingText: 'Page not found', art: 'S-ROSIN-BANNER', size: 'compact', body: btns }) + '</section>\n'
    + '<section class="embed-band jane-fallback"><div class="embed embed--jane">' + nf.janeBody + '</div></section>';
}

/* ------------------------------------------------------------------ dispatch */
export const api = { parts: P, blocks: B, chrome: C, shell: S, defaultMain, defaultSection, defaultOptions, renderDocument: S.renderDocument, PAGE_404 };

function viaModule(name, fn, args, label) {
  const m = modules[name];
  if (!m) {
    if (STRICT) throw new Error('THEME_STRICT=1: module ' + name + ' is not loaded; refusing the default renderer for ' + label);
    return null;
  }
  if (typeof m[fn] !== 'function') return null;
  try { return m[fn](...args); } catch (e) {
    if (STRICT) throw new Error('THEME MODULE ' + name + ' FAILED: ' + fn + ' ' + label + ': ' + (e && e.message ? e.message : e));
    console.log('THEME MODULE ' + name + ' FAILED: ' + fn + ' ' + label + ': ' + (e && e.message ? e.message : e) + ' (default renderer used)');
    return null;
  }
}
/** a module result -> document options: null (default), a string (the <main> body) or { main, ...options } */
function normalise(r) {
  if (r == null) return null;
  if (typeof r === 'string') return { main: r };
  if (typeof r === 'object' && typeof r.main === 'string') return r;
  throw new Error('a theme module returned neither null, a string nor { main }');
}

export function renderPage(page, ctx) {
  const owner = KIND_OWNER[page.kind];
  const r = owner ? normalise(viaModule(owner, 'render', [page, ctx, api], page.path)) : null;
  const opts = { ...defaultOptions(page), ...(r || { main: defaultMain(page, ctx) }) };
  // revision 4: a banner loop paints first on an inner page: preload its poster, as the home hero does (R-41)
  const posterM = /rel="preload" as="image"/.test(opts.headExtra || '') ? null : /class="loop banner__loop"[^>]*><video[^>]*? poster="([^"]+)"/.exec(opts.main);
  if (posterM) opts.headExtra = (opts.headExtra || '') + '<link rel="preload" as="image" href="' + posterM[1] + '" fetchpriority="high">\n';
  return S.renderDocument(page, ctx, opts);
}

export function render404(ctx) {
  const r = normalise(viaModule('templates-a', 'render404', [ctx, api], '404'));
  const page = { ...PAGE_404 };
  const opts = { promo: 'top', ...(r || { main: default404Main(ctx) }) };
  // the Jane boot (A14, BUILD-CONTRACT 4.1) always goes in the 404 <head>, whoever renders the body; the body must
  // still hold ctx.notFound.janeBody (the mount) once
  opts.headExtra = (opts.headExtra || '') + ctx.notFound.bootScript + '\n';
  return S.renderDocument(page, ctx, opts);
}
