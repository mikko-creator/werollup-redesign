// rosin.mjs - revision 5 (operator 2026-10-14: "pivot the focus of the site to hash and rosin ... highlight their hash and
// rosin products ... update the site imagery too to display rosin and hash products preferrably something that can be found
// in their menu"). The Hash & Rosin band: real products from the two live menus (src/content/hash-rosin.json, a dated
// snapshot of the Jane and Weedmaps menus; their own product photos in assets/menu/), on the home page (both stores) and
// on each store page (that store), right under the hero.
// Text rule: this is the one place the build ADDS copy. Every added element carries data-r5, and
// tools/operator-additions.mjs declares its words and links for tools/text-parity.mjs and tools/build-check.mjs
// (src/content/operator-additions.json), so the parity gates stay exact everywhere else.
import fs from 'node:fs';

const DATA = JSON.parse(fs.readFileSync(new URL('../content/hash-rosin.json', import.meta.url), 'utf8'));
/** the band's copy, the hero additions and the store table (labels, menu links) */
export const COPY = DATA.copy;
export const STORES = DATA.stores;

const byId = new Map(DATA.products.map((p) => [p.id, p]));
/** the products a band shows: the home list (both stores, in DATA.home order) or one store's list (DATA.storeOrder) */
function productsFor(store) {
  const ids = store ? (DATA.storeOrder[store] || []) : DATA.home;
  return ids.map((id) => {
    const p = byId.get(id);
    if (!p) throw new Error('rosin.mjs: product ' + id + ' is listed but not in hash-rosin.json products');
    return p;
  });
}

const money = (n) => (n == null ? '' : '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2)));

/** one product card: the menu photo, type, name (the link), brand, size and price, and on the home band its store */
function card(ctx, P, p, { showStore, i }) {
  const st = STORES[p.store];
  if (!st) throw new Error('rosin.mjs: product ' + p.id + ' has an unknown store ' + p.store);
  const price = p.salePrice != null && p.price != null && p.salePrice < p.price
    ? '<s class="hr-card__was">' + money(p.price) + '</s> ' + money(p.salePrice)
    : money(p.salePrice != null ? p.salePrice : p.price);
  const meta = [p.weight ? P.esc(p.weight) : '', price].filter(Boolean).join(' <span class="hr-card__dot" aria-hidden="true">·</span> ');
  const img = P.decorative(ctx, p.image, { sizes: '(max-width: 700px) 62vw, (max-width: 1100px) 30vw, 260px', cls: 'hr-card__img', widths: [240, 320, 480, 640] });
  return P.reveal('<article class="hr-card">'
    + '<div class="hr-card__media' + (p.fit === 'cover' ? ' hr-card__media--cover' : '') + '">' + img + '</div>'
    + '<div class="hr-card__body">'
    + '<p class="hr-card__type">' + P.esc(p.type) + '</p>'
    + '<h3 class="hr-card__name"><a class="hr-card__link" href="' + P.escAttr(P.href(ctx, st.menuHref)) + '">' + P.esc(p.name) + '</a></h3>'
    + '<p class="hr-card__brand">' + P.esc(p.brand) + '</p>'
    + (meta ? '<p class="hr-card__meta">' + meta + '</p>' : '')
    + (showStore ? '<p class="hr-card__store">' + P.esc(st.label) + '</p>' : '')
    + '</div></article>', { tag: 'li', cls: 'hr-grid__item', step: i % 4 });
}

/** the band. store: 'san-pedro' | 'culver-city' (a store page) or null (the home page) */
export function hashRosinBand(ctx, api, { store = null } = {}) {
  const { parts: P } = api;
  const items = productsFor(store);
  if (!items.length) return '';
  const c = store ? COPY.store : COPY.home;
  const st = store ? STORES[store] : null;
  const lead = st ? c.lead.replace('{store}', st.label) : c.lead;
  const btns = (store ? [store] : Object.keys(STORES)).map((k, i) => P.pill(ctx, { label: P.esc(store ? c.button : STORES[k].menuLabel), href: STORES[k].menuHref, kind: i === 0 ? 'rosin' : 'line', arrow: i === 0 }));
  const head = '<div class="hr-head">'
    + '<div class="hr-head__copy">'
    + '<p class="eyebrow hr-eyebrow">' + P.esc(st ? c.eyebrow.replace('{store}', st.label) : c.eyebrow) + '</p>'
    + '<h2 class="hd hr-title" id="hr-title"><span class="hr-title__ink">' + P.esc(COPY.titleInk) + '</span> ' + P.esc(COPY.titleRest) + '</h2>'
    + '<p class="hr-lead">' + P.esc(lead) + '</p>'
    + '</div>'
    + '<div class="btn-row hr-head__btns">' + btns.join('') + '</div>'
    + '</div>';
  const grid = '<ul class="hr-grid" role="list">' + items.map((p, i) => card(ctx, P, p, { showStore: !store, i })).join('') + '</ul>';
  const note = '<p class="hr-note">' + P.esc(COPY.note.replace('{date}', DATA.capturedLabel)) + '</p>';
  return P.band({ tone: 'night', id: 'hash-rosin', cls: 'hr-band' + (store ? ' hr-band--store' : ' hr-band--home'), labelledby: 'hr-title',
    attrs: { 'data-r5': store ? 'store-band' : 'home-band' },
    inner: '<div class="hr-band__glow" aria-hidden="true"></div>' + P.wrap(head + grid + note) });
}

/** the hero eyebrow added above a store hero's h1 (data-r5) */
export const heroEyebrow = (P) => '<p class="eyebrow hr-hero-eyebrow" data-r5="hero-eyebrow">' + P.esc(COPY.heroEyebrow) + '</p>';
/** the hero call to action added in front of the hero's buttons (data-r5): a jump to the band below */
export const heroCta = (ctx, P) => P.pill(ctx, { label: P.esc(COPY.heroCta), href: '#hash-rosin', kind: 'rosin', arrow: true, attrs: { 'data-r5': 'hero-cta' } });
/** put the hero call to action first in a rendered button row (the row's own buttons stay as they are) */
export function withHeroCta(ctx, P, rowHtml) {
  const m = /^(<div class="btn-row[^"]*">)/.exec(rowHtml);
  if (!m) throw new Error('rosin.mjs: the hero buttons did not render as a .btn-row (' + rowHtml.slice(0, 60) + ')');
  return m[1] + heroCta(ctx, P) + rowHtml.slice(m[1].length);
}
