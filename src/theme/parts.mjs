// parts.mjs - FOUNDATION shared primitives (BUILD-CONTRACT 5.2; DESIGN-SPEC 5.2, 6.16, 6.19, 6.20). Every template draws
// buttons, banners, reading cards, light boxes, bands, card shells, chips and loops through these functions, so the
// look stays one system. Pure functions: (data) -> HTML string. No clock, no randomness (the build is byte-stable).
// Text rule (docs/PIPELINE-CONTENT.md 8): never add a visible word. Labels come from the page model or ctx; accessible
// names go in attributes; glyphs are inline SVG (text-parity drops <svg> content).

export const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
/** attribute string from an object; null/undefined/false are dropped, true renders a bare attribute */
export function attrs(o) {
  let out = '';
  for (const [k, v] of Object.entries(o || {})) {
    if (v === null || v === undefined || v === false) continue;
    out += v === true ? ' ' + k : ' ' + k + '="' + escAttr(v) + '"';
  }
  return out;
}
export const cx = (...names) => names.flat().filter(Boolean).join(' ');
/** internal hrefs go through ctx.url (one place for a sub-path preview); tel:, mailto:, #, external stay as given */
export const href = (ctx, h) => (typeof h === 'string' && h.startsWith('/') && !h.startsWith('//') ? ctx.url(h) : h);

/* ------------------------------------------------------------------ icons (24 grid, 2 px stroke, aria-hidden) */
const P = {
  arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  store: '<path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-5h6v5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  fire: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.4 2.4-5.2 3.6-8.4.4 1.9 1.4 3 2.6 3.6.2-2.6 1.5-4.8 3.5-6.6-.3 3.3 3.3 5.2 3.3 10.4 0 4.1-2.8 7.1-6.5 7.1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  leaf: '<path d="M5 19c0-8 5.5-13.5 14-14 0 8.5-5.5 14-14 14zM5 19l7-7"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  mail: '<path d="M3.5 6.5h17v11h-17z"/><path d="M4 7l8 6 8-6"/>',
};
/** an inline SVG icon; name from the set above (unknown names fall back to "link") */
export function icon(name, cls = '') {
  const body = P[name] || P.link;
  return '<svg class="' + escAttr(cx('ico', 'ico--' + (P[name] ? name : 'link'), cls)) + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
}
/** source icon names (Font Awesome names in the model) mapped to the set */
export const iconFor = (name) => ({ 'map-marker-alt': 'pin', 'map-marker': 'pin', star: 'star', truck: 'truck', store: 'store', fire: 'fire', phone: 'phone', 'external-link': 'external', 'shopping-bag': 'store', 'shopping-cart': 'store' })[name] || null;

/* ------------------------------------------------------------------ images */
const isSlotId = (ref) => typeof ref === 'string' && !ref.includes('/') && !/\.(webp|png|jpe?g|svg|gif|avif)$/i.test(ref);
const warned = new Set();
/** ctx.img with one safety net: an image-plan SLOT id that is not declared yet (IMAGERY works in parallel) renders the
 *  same styled frame as a declared-but-ungenerated slot, with a one-time build log line. A file ref never gets the net:
 *  a typo or a missing file still fails the build. */
export function img(ctx, ref, opts = {}) {
  if (!ref) return '';
  if (!isSlotId(ref)) return ctx.img(ref, opts);
  try { return ctx.img(ref, opts); } catch (e) {
    if (!warned.has(ref)) { warned.add(ref); console.log('theme: slot ' + ref + ' not declared in image-plan.json (' + e.message.slice(0, 80) + '): frame rendered'); }
    return '<div' + attrs({ class: cx('img-slot', opts.cls), 'data-slot': ref, role: 'img', 'aria-label': opts.alt || null, 'aria-hidden': opts.alt ? null : 'true' }) + '></div>';
  }
}
/** a decorative image: alt="" plus the data-decorative marker tools/build-check.mjs requires */
export function decorative(ctx, ref, opts = {}) {
  return img(ctx, ref, { ...opts, alt: '', attrs: { 'data-decorative': '', ...(opts.attrs || {}) } });
}
/** true when a slot id resolves to a real file (declared and generated) */
export function slotReady(ctx, ref) {
  if (!isSlotId(ref)) return true;
  try { return ctx.imgSrc(ref, 160) != null; } catch { return false; }
}

/* ------------------------------------------------------------------ buttons (6.20) */
/** model Button -> design pill kind. tone 'night' remaps forest/line to the night outline (CSS does the rest) */
export function pillKind(b) {
  if (b.variant === 'primary' || b.variant === 'accent') return 'leaf';
  if (b.variant === 'secondary') return 'forest';
  if (b.variant === 'light' || b.transparent) return 'line';
  return 'leaf';
}
/** a pill link. label is HTML from the model (already escaped). */
export function pill(ctx, { label, href: h, kind = 'leaf', size = null, arrow = false, iconName = null, cls = null, attrs: extra = {} }) {
  return '<a' + attrs({ class: cx('btn', 'btn--' + kind, size === 'sm' && 'btn--sm', cls), href: href(ctx, h), ...extra }) + '>'
    + (iconName ? icon(iconName) : '') + '<span class="btn__t">' + label + '</span>' + (arrow ? icon('arrow') : '') + '</a>';
}
/** the model's Button object -> <a class="btn ..."> keeping every behaviour hook (BUILD-CONTRACT 4.5):
 *  chooser -> .js-location-chooser + data-lax-url/data-sanpedro-url; activeLocation -> .active-location-menu */
export function button(ctx, b, opts = {}) {
  const kind = opts.kind || pillKind(b);
  const ic = b.icon ? iconFor(b.icon) : null;
  return pill(ctx, {
    label: b.label, href: b.href, kind, size: opts.size || b.size || null, arrow: opts.arrow ?? (kind === 'leaf' && !ic),
    iconName: ic,
    cls: cx(b.chooser && 'js-location-chooser', b.activeLocation && 'active-location-menu', opts.cls),
    attrs: { 'data-lax-url': b.laxUrl, 'data-sanpedro-url': b.sanpedroUrl, target: b.target, rel: b.rel, 'aria-haspopup': b.chooser ? 'dialog' : null },
  });
}
export function buttonRow(ctx, items, opts = {}) {
  const inner = (items || []).map((b, i) => button(ctx, b, typeof opts.each === 'function' ? opts.each(b, i) : opts)).join('');
  const tag = opts.tag || 'div';
  return '<' + tag + ' class="' + cx('btn-row', opts.cls) + '">' + inner + '</' + tag + '>';
}

/* ------------------------------------------------------------------ layout */
/** the page container: 'wide' 1200 (default), 'narrow' 630 (reading measure), 'full' no max */
export const wrap = (inner, size = 'wide', cls = '') => '<div class="' + cx('wrap', size !== 'wide' && 'wrap--' + size, cls) + '">' + inner + '</div>';
/** a section band. tone: night | night-calm | cream | haze | white | dusk; atmosphere adds the leaf/dusk glows (static) */
export function band({ tone = 'cream', atmosphere = false, id = null, cls = null, attrs: extra = {}, inner = '', depth = false, label = null, labelledby = null }) {
  const night = tone === 'night' || tone === 'night-calm';
  return '<section' + attrs({ id, class: cx('band', 'band--' + tone, night ? 'on-night' : 'on-light', atmosphere && 'band--atmos', cls), 'data-depth': depth ? '' : null, 'aria-label': label, 'aria-labelledby': labelledby, ...extra }) + '>'
    + (atmosphere ? '<div class="band__ground" aria-hidden="true" data-plane="atmos"></div>' : '')
    + inner + '</section>';
}
/** the long-form reading card (6.19): white, 630 px, on a cream or haze band */
export const readingCard = (inner, { cls = null, attrs: extra = {} } = {}) => '<div' + attrs({ class: cx('rcard', cls), ...extra }) + '>' + inner + '</div>';
/** a reveal wrapper (7.2): the wrapper moves, the card inside keeps its own hover transform (D-12) */
export const reveal = (inner, { tag = 'div', cls = null, step = null } = {}) => '<' + tag + attrs({ class: cls, 'data-reveal': '', style: step != null ? '--i:' + step : null }) + '>' + inner + '</' + tag + '>';
/** a card shell: opaque card with the hover/focus lift (7.4: :hover and :has(:focus-visible) share one rule) */
export const cardShell = (inner, { tag = 'div', cls = null, tone = 'white', attrs: extra = {} } = {}) => '<' + tag + attrs({ class: cx('card', 'card--' + tone, cls), ...extra }) + '>' + inner + '</' + tag + '>';
/** a chip (leaf-100, forest label) */
export const chip = (ctx, { label, href: h = null, cls = null, attrs: extra = {} }) => (h
  ? '<a' + attrs({ class: cx('chip', cls), href: href(ctx, h), ...extra }) + '>' + label + '</a>'
  : '<span' + attrs({ class: cx('chip', cls), ...extra }) + '>' + label + '</span>');

/* ------------------------------------------------------------------ light box (5.2) */
/** the light-box stack: an opaque photo frame with 1 or 2 static translucent plates behind it (no backdrop-filter, D-7).
 *  tone 'night' | 'light' picks the plate recipe (D-6). cut: an optional protruding cut-out (5.3, decorative). */
export function lightBox(ctx, { ref = null, inner = null, alt = '', sizes = '(min-width: 1024px) 40vw, 90vw', loading = 'lazy', fetchpriority = null, plates = 2, tone = 'night', cls = null, ratio = null, cut = null, widths = null }) {
  const media = inner != null ? inner : (alt ? img(ctx, ref, { alt, sizes, loading, fetchpriority, cls: 'lbox__img', widths: widths || undefined }) : decorative(ctx, ref, { sizes, loading, fetchpriority, cls: 'lbox__img', widths: widths || undefined }));
  const pl = (n) => '<span class="lbox__plate lbox__plate--' + n + '" aria-hidden="true" data-plane="glass"></span>';
  return '<div' + attrs({ class: cx('lbox', 'lbox--' + tone, plates === 1 && 'lbox--one', cls), style: ratio ? '--ratio:' + ratio : null }) + '>'
    + (plates >= 2 ? pl(2) : '') + (plates >= 1 ? pl(1) : '')
    + '<div class="lbox__frame">' + media + '</div>'
    + (cut ? protrusion(ctx, cut) : '') + '</div>';
}
/** a protruding cut-out (5.3): decorative, pointer-events none, data-protrude for the probes */
export function protrusion(ctx, { ref, sizes = '240px', cls = null, widths = null }) {
  return '<div' + attrs({ class: cx('cut', cls), 'aria-hidden': 'true', 'data-protrude': '', 'data-plane': 'cut' }) + '>'
    + decorative(ctx, ref, { sizes, cls: 'cut__img', widths: widths || undefined }) + '</div>';
}

/* ------------------------------------------------------------------ banner (6.16) */
const SHORT_MAX = 12;
/** banner art per DESIGN-SPEC 6.16-6.18 and 10.2/10.4 (never the deny-listed source header art, A10/R-36).
 *  Returns a ref (a real photo path or an image-plan slot id) or null (gradient ground). */
export const REAL = {
  masonJars: 'assets/source/refetch-cannabis-buds-mason-jars.webp',
  concentrate: 'assets/source/refetch-cannabis-13.webp',
  topicals: 'assets/source/refetch-cannabis-1.webp',
  storefrontSide: 'assets/source/25e314b3-werollup-san-pedro-storefront-classic-car-side-hero-1.webp',
  storefrontRear: 'assets/source/a28ecfaf-werollup-san-pedro-storefront-classic-car-rear-gallery.webp',
  postcardLax: 'assets/source/dd2e2c2b-LAX_-Culver-City-2.webp',
  postcardSanPedro: 'assets/source/f06599a5-San-Pedro_-Palos-Verdes-1.webp',
  cap: 'assets/source/7ed18521-1-1.webp',
  redLighter: 'assets/source/8bd7f345-werollup-red-lighter-preroll-ashtray-playing-cards-gallery.webp',
  sourKush: 'assets/source/77caae00-werollup-sour-kush-jar-preroll-crystal-tray-hero.webp',
  grinders: 'assets/source/refetch-cannabis-grinders-flower-flatlay.webp',
};
/** DESIGN-SPEC 10.3: never promoted to a hero, banner, cut-out or menu-card role (they stay only where the source shows
 *  them, at content size). Matched on the assets/source file name. */
export const DENY_PROMOTED = ['champagne-bar', 'kiva-lost-farm', 'in-n-out', 'assets/source/a3d38155-', 'assets/source/7a4352fe-', 'assets/source/085a05d4-', 'assets/source/8b360abb-', 'assets/source/e181cbbf-'];
export const isDenied = (ref) => typeof ref === 'string' && DENY_PROMOTED.some((s) => ref.includes(s));
export function bannerArtFor(page) {
  const p = page.path || '';
  const sanPedroGroup = /^\/service-area\/san-pedro\//.test(p) || /^\/location\/san-pedro\//.test(p) || p === '/location-pagetype/primary-location/';
  if (page.generated && page.generated.hero) return page.generated.hero;
  // revision 5 (operator 2026-10-14, the hash and rosin pivot): /products/ and /products/concentrates/ show the rosin still
  // and its loop (V-ROSIN) instead of the bud (S-BUD-BANNER) and the concentrate look-alike
  const map = {
    '/products/': 'S-ROSIN-BANNER', '/products/flower/': 'S-TRICHOME', '/products/concentrates/': 'S-ROSIN-BANNER',
    '/products/topicals/': REAL.topicals, '/products/edibles/': 'S-CARD-EDIBLES', '/products/pre-rolls/': 'G-PREROLL-BANNER',
    '/products/vaporizers-cartridges/': 'G-VAPE-BANNER', '/about-us/': 'S-DUSK-PALMS', '/contact/': 'S-DUSK-PALMS',
    '/weed-delivery/': 'S-DUSK-PALMS', '/service-area/': 'S-DUSK-PALMS', '/about-us/daily-deals/': 'S-MIST',
    '/location-pagetype/cannabis-menu-page/': 'G-LAX-DUSK', '/location-pagetype/primary-location/': 'G-HARBOR-HAZE', '/lax-menu/': 'G-LAX-DUSK',
  };
  if (map[p]) return map[p];
  if (page.kind === 'education') return REAL.masonJars;
  if (page.kind === 'service-area-town' || page.kind === 'shop' || page.kind === 'location') return sanPedroGroup ? 'G-HARBOR-HAZE' : 'G-LAX-DUSK';
  return 'S-MIST'; // legal, archives, reviews, 404
}
/** revision 4 (operator 2026-10-14: "add looping videos to the inner pages too"): the loop that replaces each banner art,
 *  keyed by the ref bannerArtFor returns. Each loop is made from that same still; the real source photos get a generated
 *  look-alike still instead, so no real photo is ever animated (the rule the store heroes follow). Most loops are
 *  Higgsfield clips; V-PREROLL, V-EDU and V-TOPICAL are a slow camera drift over the still (tools/still-loop.mjs), because
 *  the provider refused the pre-roll and jars stills (status nsfw) and barely moved the topicals one. */
export const BANNER_LOOP = {
  'S-MIST': 'V-MIST', 'S-DUSK-PALMS': 'V-DUSK', 'G-LAX-DUSK': 'V-LAX', 'G-HARBOR-HAZE': 'V-HARBOR', 'S-BUD-BANNER': 'V-HERO',
  'S-TRICHOME': 'V-TRICHOME', 'G-PREROLL-BANNER': 'V-PREROLL', 'G-VAPE-BANNER': 'V-VAPE', 'S-CARD-EDIBLES': 'V-EDIBLES', 'S-EDIBLES-BANNER': 'V-EDIBLES',
  [REAL.concentrate]: 'V-CONCENTRATE', [REAL.topicals]: 'V-TOPICAL', [REAL.masonJars]: 'V-EDU',
  'S-ROSIN-BANNER': 'V-ROSIN', // revision 5
};
/** the page banner: art (cover) + veil + the h1 (the page-header heading block, rendered by the caller's heading fn).
 *  size: 'auto' picks short (one word, <= 12 chars) or long; 'compact' for shop, review and 404 banners. */
export function banner(ctx, page, { headingHtml, headingText = '', art = undefined, size = 'auto', veil = 'default', cls = null, after = '', body = '', eyebrow = '' }) {
  const ref = art === undefined ? bannerArtFor(page) : art;
  const short = size === 'auto' ? (!/\s/.test(String(headingText).trim()) && String(headingText).trim().length <= SHORT_MAX) : size === 'short';
  const kind = size === 'compact' ? 'compact' : (short ? 'short' : 'long');
  const opts = { cls: 'banner__img', loading: 'eager', fetchpriority: 'high', widths: [640, 960, 1280, 1600, 1920, 2400] };
  // revision 4: the art's loop when its files exist (its poster is the still); else the still, as before
  const loopHtml = ref && BANNER_LOOP[ref] ? loop(ctx, BANNER_LOOP[ref], { cls: 'banner__loop', sizes: '100vw' }) : '';
  let artHtml = ref && !loopHtml ? decorative(ctx, ref, { ...opts, sizes: '100vw' }) : '';
  let phoneH = null;
  const dim = / width="(\d+)" height="(\d+)"/.exec(artHtml);
  if (dim) {
    // a cover crop paints the art at max(100vw, band height x aspect): phones 300 px (compact 220), desktop up to 440 px
    const aspect = Number(dim[1]) / Number(dim[2]);
    // R-2 on phones: never paint the art taller than its file height / 3 (DPR 3), e.g. the 1920x640 topicals strip -> 210 px
    phoneH = Math.min(kind === 'compact' ? 220 : 300, Math.floor(Number(dim[2]) / 3 / 10) * 10);
    const phone = Math.round(phoneH * aspect);
    const desk = Math.round((kind === 'compact' ? 260 : 440) * aspect);
    artHtml = decorative(ctx, ref, { ...opts, sizes: '(max-width: 700px) max(100vw, ' + phone + 'px), max(100vw, ' + desk + 'px)' });
  }
  const style = [kind === 'short' ? '--chars:' + Math.max(4, String(headingText).trim().length) : null, phoneH && phoneH < (kind === 'compact' ? 220 : 300) ? '--banner-phone-h:' + phoneH + 'px' : null].filter(Boolean).join(';') || null;
  // a loop is a direct child of the banner (not inside the aria-hidden art layer): its pause control must stay focusable
  // and paint above the title (blocks.css "revision 4")
  return '<div' + attrs({ class: cx('banner', 'banner--' + kind, 'banner--veil-' + veil, !ref && 'banner--plain', loopHtml && 'banner--video', cls), style }) + '>'
    + (loopHtml ? '' : '<div class="banner__art" aria-hidden="true">' + artHtml + '</div>') + '<div class="banner__veil" aria-hidden="true"></div>'
    + '<div class="wrap banner__in">' + eyebrow + headingHtml + body + '</div>' + loopHtml + after + '</div>';
}

/* ------------------------------------------------------------------ misc */
export const eyebrow = (html, cls = '') => '<p class="' + cx('eyebrow', cls) + '">' + html + '</p>';
/** five stars as one decorative SVG group with an accessible name (no text node) */
export function stars(n = 5, cls = '') {
  let s = '';
  for (let i = 0; i < n; i++) s += '<svg class="ico ico--star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + P.star + '</svg>';
  return '<span class="' + cx('stars', cls) + '" role="img" aria-label="' + n + ' stars">' + s + '</span>';
}
/** an atmosphere loop (7.5) for an image-plan video slot: <video muted playsinline loop preload="none" poster> plus the
 *  44 px pause control. Returns '' while the slot has no files (ctx.video returns null) or the build has no video API.
 *  site.js plays it only when 25 % visible, the tab is visible and motion is allowed; reduced motion shows the poster. */
export function loop(ctx, slotId, { cls = null, sizes = '100vw' } = {}) {
  if (typeof ctx.video !== 'function' || !slotId) return '';
  let v = null;
  try { v = ctx.video(slotId); } catch (e) { if (process.env.THEME_STRICT === '1') throw e; console.log('theme: loop ' + slotId + ' skipped: ' + e.message.slice(0, 100)); return ''; }
  if (!v) return '';
  const src = (u, type, media) => (u ? '<source' + attrs({ src: u, type, media }) + '>' : '');
  return '<div' + attrs({ class: cx('loop', cls), 'data-loop': '' }) + '>'
    + '<video' + attrs({ class: 'loop__video', muted: true, playsinline: true, loop: true, preload: 'none', poster: v.poster, 'aria-hidden': 'true', tabindex: '-1', width: v.width, height: v.height, 'data-sizes': sizes }) + '>'
    + src(v.webmPhone, 'video/webm', '(max-width: 700px)') + src(v.mp4Phone, 'video/mp4', '(max-width: 700px)') + src(v.webm, 'video/webm') + src(v.mp4, 'video/mp4') + '</video>'
    + '<button type="button" class="loop__toggle" aria-label="Pause motion" data-label-play="Play motion" data-label-pause="Pause motion">' + icon('pause', 'loop__ico-pause') + icon('play', 'loop__ico-play') + '</button></div>';
}
