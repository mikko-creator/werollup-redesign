// chrome.mjs - FOUNDATION site chrome (DESIGN-SPEC 6.1-6.8, 6.15): top bar and store switcher, header with the Products
// mega menu, promo strip / "You're shopping" strip, menu sheet, reviews rail, footer, location chooser, age gate.
// Each region is ONE element carrying data-parity="<region>" (tools/text-parity.mjs, tools/build-check.mjs): inside it
// the words and the <a href> multiset equal the source region's. So the menu tree is rendered in SOURCE ORDER: the mega
// panel shows the Products and Education subtrees, the other top-level items stay in the header region hidden (the
// sheet carries them, as its own region does in the source). Store-switcher data-* values are kept verbatim (4.5).
import * as P from './parts.mjs';

const { esc, escAttr, attrs, cx, icon } = P;

/* ------------------------------------------------------------------ shared */
export const navOf = (ctx, page) => ({ primary: ctx.nav.primary, 'lax-culver-city': ctx.nav.laxCulverCity, 'san-pedro': ctx.nav.sanPedro })[page.menuFamily] || ctx.nav.primary;
const lc = (s) => String(s || '').toLowerCase();
/** the product category of a menu item (label or href), or null */
export function categoryOf(item) {
  const s = lc(item.label) + ' ' + lc(item.href);
  if (/best.?sell/.test(s)) return null;
  if (/pre-?roll/.test(s)) return 'prerolls';
  if (/vape|vapori/.test(s)) return 'vape';
  if (/edible/.test(s)) return 'edibles';
  if (/concentrate|extract/.test(s)) return 'concentrates';
  if (/topical/.test(s)) return 'topicals';
  if (/flower/.test(s)) return 'flower';
  return null;
}
/** card images (DESIGN-SPEC 6.4; real photos where the spec names them, image-plan slots otherwise). Revision 6 (operator
 *  2026-10-14, the hash and rosin focus): the Concentrates card (mega menu on every page, /products/ hub) shows the rosin
 *  still's subject-centred phone crop instead of the source's concentrate photo */
export const CARD_ART = {
  flower: P.REAL.masonJars, prerolls: 'S-CARD-PREROLL', vape: 'S-CARD-VAPE', edibles: 'S-CARD-EDIBLES',
  concentrates: 'assets/generated/s-rosin-banner-phone.jpg', topicals: P.REAL.topicals,
};
const linkA = (ctx, it, cls, extra = {}) => '<a' + attrs({ class: cls, href: P.href(ctx, it.href), ...extra }) + '>' + esc(it.label) + '</a>';
/** a plain nested list in source order (used for the hidden parts of the header tree) */
function plainTree(ctx, items, cls = 'tree') {
  return '<ul class="' + cls + '">' + items.map((i) => '<li>' + (i.href ? linkA(ctx, i, 'tree__link') : '<span class="tree__group">' + esc(i.label) + '</span>') + (i.children ? plainTree(ctx, i.children, 'tree tree--sub') : '') + '</li>').join('') + '</ul>';
}
/** a menu image card: 4:5 image + label + arrow chip; hover = :focus-visible (R-17) */
function menuCard(ctx, it, { cls = 'mcard', sizes = '(min-width: 1240px) 150px, 200px' } = {}) {
  const art = CARD_ART[categoryOf(it)];
  return '<a' + attrs({ class: cls, href: P.href(ctx, it.href) }) + '><span class="' + cls + '__media" aria-hidden="true">'
    + (art ? P.decorative(ctx, art, { sizes, cls: cls + '__img', widths: [160, 240, 320, 480] }) : '') + '</span>'
    + '<span class="' + cls + '__label">' + esc(it.label) + '</span>' + icon('arrow', cls + '__arrow') + '</a>';
}
/** children in source order: consecutive card-eligible items become one card list, the others link lists */
function runs(items, isCard) {
  const out = [];
  for (const it of items) { const c = isCard(it); const last = out[out.length - 1]; if (last && last.card === c) last.items.push(it); else out.push({ card: c, items: [it] }); }
  return out;
}

/* ------------------------------------------------------------------ 6.1 top bar + store switcher */
export function topBar(ctx) {
  const t = ctx.topBar;
  const opts = t.select.options.map((o) => '<option' + attrs({ value: o.value, 'data-slug': o.slug, 'data-address': o.address, 'data-hours': o.hours, 'data-menu-url': o.menuUrl, 'data-directions-url': o.directionsUrl }) + '>' + esc(o.label) + '</option>').join('');
  const details = t.select.options.filter((o) => o.slug).map((o) => '<p' + attrs({ class: 'topbar__loc', 'data-store': o.slug }) + '>'
    + '<span class="topbar__addr">' + icon('pin') + '<span>' + esc(o.address) + '</span></span> <span class="topbar__hours">' + icon('clock') + '<span>' + esc(o.hours) + '</span></span></p>').join('');
  const soc = t.socials.map((s) => '<li><a' + attrs({ class: 'topbar__social-link', href: s.href, target: s.target, rel: s.rel || (s.target === '_blank' ? 'noopener' : null), 'aria-label': s.ariaLabel }) + '>' + esc(s.label) + '</a></li>').join('');
  return '<div class="topbar on-night" data-parity="topbar"><div class="wrap topbar__in">'
    + '<div class="topbar__store">' + icon('store', 'topbar__store-ico') + '<span class="select"><select' + attrs({ name: t.select.name, id: t.select.id, 'aria-label': 'Choose your store' }) + '>' + opts + '</select>' + icon('chev', 'select__chev') + '</span></div>'
    + '<div class="topbar__details" id="activeLocationDetails">' + details + '</div>'
    + '<ul class="topbar__social">' + soc + '</ul></div></div>';
}

/* ------------------------------------------------------------------ 6.2 + 6.4 header and mega menu */
function megaPanel(ctx, page, productsItem, educationItem) {
  const primary = page.menuFamily === 'primary';
  let stores = '';
  let cards = '';
  // the Products subtree
  const kids = productsItem.children || [];
  if (kids.some((k) => k.children)) {
    // primary family: store groups ("San Pedro", "LAX"), each with Best Selling and the six Order items
    stores = '<div class="mega__stores">' + kids.map((g) => '<div class="mstore"><div class="mstore__head">' + esc(g.label) + '</div>'
      + (g.children ? '<ul class="mstore__list">' + g.children.map((it) => '<li>' + linkA(ctx, it, 'mlink') + '</li>').join('') + '</ul>' : '') + '</div>').join('') + '</div>';
  } else {
    // store families: a flat list; the Order items are the image cards (label and href from the same item)
    stores = runs(kids, (it) => !!categoryOf(it)).map((r) => (r.card
      ? '<ul class="mega__cards" role="list">' + r.items.map((it) => '<li class="mcard__item">' + menuCard(ctx, it) + '</li>').join('') + '</ul>'
      : '<ul class="mega__solo">' + r.items.map((it) => '<li>' + linkA(ctx, it, 'mlink mlink--solo') + '</li>').join('') + '</ul>')).join('');
  }
  // the Education subtree (primary: the six product guides are the image cards)
  if (educationItem) {
    const ek = educationItem.children || [];
    cards = '<div class="mega__edu"><div class="mega__eyebrow">' + esc(educationItem.label) + '</div>'
      + runs(ek, (it) => primary && !!categoryOf(it) && /^\/products\//.test(it.href || '')).map((r) => (r.card
        ? '<ul class="mega__cards" role="list">' + r.items.map((it) => '<li class="mcard__item">' + menuCard(ctx, it) + '</li>').join('') + '</ul>'
        : '<ul class="mega__more">' + r.items.map((it) => '<li>' + linkA(ctx, it, 'mlink') + '</li>').join('') + '</ul>')).join('') + '</div>';
  }
  return '<div class="mega on-night" id="megaPanel" role="region" aria-labelledby="megaBtn" hidden><div class="wrap mega__in' + (primary ? ' mega__in--primary' : ' mega__in--store') + '">' + stores + cards + '</div></div>';
}
export function header(ctx, page) {
  const h = ctx.header;
  const tree = navOf(ctx, page);
  const pi = tree.findIndex((i) => lc(i.label) === 'products');
  const before = pi > 0 ? tree.slice(0, pi) : (pi < 0 ? tree : []);
  const productsItem = pi >= 0 ? tree[pi] : null;
  const edu = productsItem && tree[pi + 1] && lc(tree[pi + 1].label) === 'education' ? tree[pi + 1] : null;
  const after = pi >= 0 ? tree.slice(pi + 1 + (edu ? 1 : 0)) : [];
  const quick = h.quickMenu.map((q) => '<li class="mainnav__quick">' + linkA(ctx, q, 'navlink') + '</li>').join('');
  const hiddenItems = (items) => items.map((i) => '<li class="mainnav__rest" hidden>' + (i.href ? linkA(ctx, i, 'navlink') : '<span class="tree__group">' + esc(i.label) + '</span>' + (i.children ? plainTree(ctx, i.children) : '')) + '</li>').join('');
  const mega = productsItem
    ? '<li class="mainnav__mega"><button type="button" class="navlink navlink--mega" id="megaBtn" aria-expanded="false" aria-controls="megaPanel"><span>' + esc(productsItem.label) + '</span>' + icon('chev', 'navlink__chev') + '</button>' + megaPanel(ctx, page, productsItem, edu) + '</li>'
    : '';
  const logo = h.logo.image;
  return '<div class="navbar on-night" data-parity="header"><div class="wrap navbar__in">'
    + '<a class="brand" href="' + escAttr(P.href(ctx, h.logo.href)) + '">' + ctx.img(logo.ref, { alt: logo.alt, sizes: '(min-width: 1024px) 186px, 132px', widths: [132, 186, 264, 400], loading: 'eager', cls: 'brand__logo' }) + '</a>'
    + '<nav class="mainnav" aria-label="Main"><ul class="mainnav__list">' + quick + hiddenItems(before) + mega + hiddenItems(after) + '</ul></nav>'
    + '<div class="navbar__actions"><button type="button" class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="defaultOffcanvas">' + icon('menu') + '</button>'
    + '<a' + attrs({ class: 'btn btn--leaf btn--sm order-now active-location-menu js-selected-location-menu', href: P.href(ctx, h.orderNow.href), 'data-lax-url': h.orderNow.laxUrl, 'data-sanpedro-url': h.orderNow.sanpedroUrl }) + '>' + icon('store') + '<span class="btn__t">' + esc(h.orderNow.label) + '</span></a></div>'
    + '</div><div class="scroll-line" aria-hidden="true"><span></span></div></div>';
}

/* ------------------------------------------------------------------ 6.3 promo strip, 6.18.7 "You're shopping" strip */
export function subheader(ctx, page) {
  if (page.subheader === 'marquee') {
    return '<div class="promo" data-parity="subheader"><div class="wrap promo__in"><p class="promo__line">'
      + ctx.marquee.items.map((m) => '<span class="promo__item">' + icon(P.iconFor(m.icon) || 'leaf', 'promo__ico') + '<span>' + esc(m.text) + '</span></span>').join(' ') + '</p></div></div>';
  }
  const s = ctx.shoppingStrip[page.store];
  if (!s) throw new Error('shopping strip: no store for ' + page.path);
  const crumbs = page.breadcrumbs && page.breadcrumbs.length
    ? '<nav class="crumbs" aria-label="Breadcrumb"><ol itemscope itemtype="https://schema.org/BreadcrumbList">' + page.breadcrumbs.map((c, i) => '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">'
      + (c.href && !c.current ? '<a' + attrs({ itemprop: 'item', href: P.href(ctx, c.href) }) + '><span itemprop="name">' + esc(c.label) + '</span></a>' : '<span itemprop="name" aria-current="page">' + esc(c.label) + '</span>')
      + '<meta itemprop="position" content="' + (i + 1) + '"></li>').join('') + '</ol></nav>'
    : '';
  const icons = ['pin', 'star', 'phone'];
  return '<div class="shopstrip" data-parity="subheader"><div class="wrap shopstrip__in">' + crumbs
    + '<p class="shopstrip__lead">' + esc(s.lead) + ' <strong class="chip chip--store">' + esc(s.store) + '</strong></p>'
    + '<div class="btn-row shopstrip__btns">' + s.buttons.map((b, i) => P.pill(ctx, { label: b.label, href: b.href, kind: 'line', size: 'sm', iconName: icons[i] || null, attrs: { target: b.target, rel: b.rel } })).join('') + '</div></div></div>';
}

/* ------------------------------------------------------------------ 6.5 menu sheet (#defaultOffcanvas) */
function sheetGroup(ctx, page, item, idx, open) {
  const id = 'sheet-g' + idx;
  const primary = page.menuFamily === 'primary';
  const label = lc(item.label);
  let inner = '';
  const kids = item.children || [];
  if (label === 'products' && kids.some((k) => k.children)) {
    inner = kids.map((g) => '<div class="slinks"><div class="slinks__head">' + esc(g.label) + '</div>' + (g.children ? '<ul>' + g.children.map((it) => '<li>' + linkA(ctx, it, 'slink') + '</li>').join('') + '</ul>' : '') + '</div>').join('');
  } else {
    const cardRule = label === 'products' ? (it) => !!categoryOf(it) : (label === 'education' && primary ? (it) => !!categoryOf(it) && /^\/products\//.test(it.href || '') : () => false);
    inner = runs(kids, cardRule).map((r) => (r.card
      ? '<ul class="dcards" role="list">' + r.items.map((it) => '<li>' + menuCard(ctx, it, { cls: 'dcard', sizes: '(min-width: 701px) 120px, 30vw' }) + '</li>').join('') + '</ul>'
      : '<ul class="slinks__list">' + r.items.map((it) => '<li>' + (it.href ? linkA(ctx, it, 'slink') : '<span class="slinks__head">' + esc(it.label) + '</span>' + (it.children ? plainTree(ctx, it.children, 'slinks__list') : '')) + '</li>').join('') + '</ul>')).join('');
  }
  return '<li class="sgroup"><button type="button" class="sgroup__btn"' + attrs({ 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id }) + '><span>' + esc(item.label) + '</span>' + icon('chev', 'sgroup__chev') + '</button>'
    + '<div' + attrs({ class: 'sgroup__panel', id, hidden: !open }) + '>' + inner + '</div></li>';
}
export function offcanvas(ctx, page) {
  const o = ctx.offcanvas;
  const tree = navOf(ctx, page);
  const items = tree.map((it, i) => (it.children ? sheetGroup(ctx, page, it, i, lc(it.label) === 'products') : '<li class="sgroup sgroup--link">' + linkA(ctx, it, 'sgroup__link') + '</li>')).join('');
  const soc = o.socials.map((s) => '<li><a' + attrs({ class: 'sheet__social-link', href: s.href, target: s.target, rel: s.rel || (s.target === '_blank' ? 'noopener' : null), 'aria-label': s.ariaLabel }) + '>' + esc(s.label) + '</a></li>').join('');
  return '<div class="sheet-scrim" data-sheet-close hidden></div>'
    + '<div class="sheet on-night" id="defaultOffcanvas" data-parity="offcanvas" role="dialog" aria-modal="true"' + attrs({ 'aria-label': o.ariaLabel }) + ' hidden>'
    + '<div class="sheet__head"><a class="brand brand--sheet" href="' + escAttr(P.href(ctx, o.logo.href)) + '">' + ctx.img(o.logo.image.ref, { alt: o.logo.image.alt, sizes: '132px', widths: [132, 264, 400], cls: 'brand__logo' }) + '</a>'
    + '<button type="button" class="sheet__close" data-sheet-close' + attrs({ 'aria-label': o.closeLabel }) + '>' + icon('close') + '</button></div>'
    + '<div class="sheet__body"><ul class="sheet__social">' + soc + '</ul>'
    + '<nav class="sheet__nav"' + attrs({ 'aria-label': o.navLabel }) + '><ul class="sheet__list">' + items + '</ul></nav></div>'
    + '<div class="sheet__cta"><a' + attrs({ class: 'btn btn--leaf btn--block active-location-menu js-selected-location-menu', href: P.href(ctx, o.orderNow.href), 'data-lax-url': o.orderNow.laxUrl, 'data-sanpedro-url': o.orderNow.sanpedroUrl, 'aria-label': o.orderNow.ariaLabel }) + '>' + icon('store') + '<span class="btn__t">' + esc(o.orderNow.label) + '</span></a></div></div>';
}

/* ------------------------------------------------------------------ 6.15 reviews rail */
export function reviews(ctx) {
  const r = ctx.reviews;
  const cards = r.items.map((x) => '<li class="review"><div class="review__card">' + P.stars(Number(x.stars) || 5, 'review__stars')
    + '<blockquote class="review__text"><p>' + x.html + '</p></blockquote><p class="review__name">' + icon('user') + '<span>' + esc(x.name) + '</span></p></div></li>').join('');
  return '<section class="reviews band band--cream on-light" data-parity="reviews" aria-labelledby="reviews-title"><div class="wrap">'
    + '<div class="reviews__head"><div><h2 class="hd reviews__title" id="reviews-title">' + esc(r.heading) + '</h2><p class="reviews__sub">' + esc(r.subheading) + '</p></div>'
    + '<div class="reviews__nav"><button type="button" class="rail-btn" data-rail-prev aria-label="Previous review" aria-controls="reviewsRail">' + icon('arrow', 'ico--flip') + '</button>'
    + '<button type="button" class="rail-btn" data-rail-next aria-label="Next review" aria-controls="reviewsRail">' + icon('arrow') + '</button></div></div>'
    + '<ul class="reviews__rail" id="reviewsRail" role="list" data-rail tabindex="0" aria-label="' + escAttr(r.heading) + '">' + cards + '</ul>'
    + '<div class="btn-row reviews__ctas">' + r.ctas.map((b, i) => P.button(ctx, b, { kind: i % 2 ? 'line' : 'forest', arrow: false })).join('') + '</div></div></section>';
}

/* ------------------------------------------------------------------ 6.6 footer */
export function footer(ctx) {
  const f = ctx.footer;
  const labelByHref = Object.fromEntries((ctx.topBar.socials || []).map((s) => [s.href, s.label]));
  const stores = f.stores.map((s) => '<div class="fstore"><h2 class="fstore__name">' + esc(s.name) + '</h2><p class="fstore__addr">' + esc(s.address) + '</p>'
    + (s.phone ? '<p class="fstore__tel"><a' + attrs({ href: s.phone.href }) + '>' + icon('phone') + '<span>' + esc(s.phone.display) + '</span></a></p>' : '') + '</div>').join('');
  // footer socials: the source links carry no text (icons + aria-label); the visible label is the verbatim top-bar
  // label for the same href, drawn by CSS from data-label (no text node, so no word is added to the region)
  const soc = f.socials.map((s) => '<li><a' + attrs({ class: 'fsocial', href: s.href, target: s.target, rel: s.rel || (s.target === '_blank' ? 'noopener' : null), 'aria-label': s.ariaLabel || labelByHref[s.href] || (s.image && s.image.alt) || null, 'data-label': labelByHref[s.href] || null }) + '></a></li>').join('');
  // the licence line is the last Quick Links item in the model (rendered once, there; D-17, R-34)
  const isLic = (q) => f.licence && q.label === f.licence.label;
  const ql = f.quickLinks.map((q) => (isLic(q)
    ? '<li class="flinks__licence"><a' + attrs({ class: 'licence', href: P.href(ctx, q.href) }) + '>' + esc(q.label) + '</a></li>'
    : '<li><a' + attrs({ class: cx('flink', q.activeLocation && 'active-location-menu'), href: P.href(ctx, q.href) }) + '>' + esc(q.label) + '</a></li>')).join('')
    + (f.licence && !f.quickLinks.some(isLic) ? '<li class="flinks__licence"><a' + attrs({ class: 'licence', href: P.href(ctx, f.licence.href) }) + '>' + esc(f.licence.label) + '</a></li>' : '');
  const logo = f.logo.image;
  return '<footer class="site-footer on-night" data-parity="footer"><div class="footer__aura" aria-hidden="true"></div><div class="wrap footer__in">'
    + '<div class="footer__brand">' + ctx.img(logo.ref, { alt: logo.alt, sizes: '(min-width: 1024px) 240px, 132px', widths: [132, 240, 400], cls: 'footer__logo' }) + '<ul class="footer__social">' + soc + '</ul></div>'
    + '<div class="footer__stores">' + stores + '</div>'
    + '<nav class="flinks" aria-label="Footer"><h2 class="flinks__title">' + esc(f.quickLinksTitle) + '</h2><ul class="flinks__list">' + ql + '</ul></nav></div>'
    + '<div class="wrap footer__legal"><p>' + esc(f.copyright) + (f.separator ? ' <span class="footer__sep">' + esc(f.separator) + '</span> ' : ' ')
    + (f.privacy ? '<a' + attrs({ href: P.href(ctx, f.privacy.href), title: f.privacy.title }) + '>' + esc(f.privacy.label) + '</a>' : '') + '</p></div></footer>';
}

/* ------------------------------------------------------------------ 6.8 location chooser */
export function chooser(ctx) {
  const c = ctx.locationChooser;
  const cards = c.cards.map((k) => '<li><a' + attrs({ class: 'chooser__card', href: P.href(ctx, k.href), 'data-location-chooser-card': k.key }) + '>'
    + '<div class="chooser__media" aria-hidden="true"><span class="lbox__plate lbox__plate--1"></span>' + P.decorative(ctx, k.image.ref, { sizes: '200px', widths: [200, 300, 400, 600], cls: 'chooser__img' }) + '</div>'
    + '<div class="chooser__name">' + esc(k.name) + '</div><div class="chooser__addr">' + esc(k.address) + '</div>'
    + '<div class="btn btn--leaf btn--sm chooser__cta"><span class="btn__t">' + esc(k.cta) + '</span></div></a></li>').join('');
  return '<div class="dialog chooser" id="locationChooserModal" data-parity="chooser" role="dialog" aria-modal="true" aria-labelledby="locationChooserTitle" hidden>'
    + '<div class="dialog__backdrop" data-dialog-close></div><div class="dialog__card chooser__card-wrap on-night">'
    + '<button type="button" class="dialog__close" data-dialog-close' + attrs({ 'aria-label': c.closeLabel }) + '><span aria-hidden="true">' + esc(c.closeGlyph) + '</span></button>'
    + '<p class="eyebrow eyebrow--night">' + esc(c.eyebrow) + '</p><h2 class="hd chooser__title" id="locationChooserTitle">' + esc(c.title) + '</h2><p class="chooser__desc">' + esc(c.description) + '</p>'
    + '<ul class="chooser__cards" role="list">' + cards + '</ul></div></div>';
}

/* ------------------------------------------------------------------ 6.7 age gate and store picker */
export function ageGate(ctx) {
  const g = ctx.ageGate;
  const post = (name) => (/culver|lax/i.test(name) ? P.REAL.postcardLax : P.REAL.postcardSanPedro);
  const logo = ctx.header.logo.image;
  const stores = g.stores.map((s) => '<li><a' + attrs({ class: 'gate__store location-select-btn', href: P.href(ctx, s.href) }) + '>'
    + P.decorative(ctx, post(s.name), { sizes: '64px', widths: [64, 128, 200], cls: 'gate__thumb' })
    + '<div class="gate__store-text"><div class="gate__store-name">' + esc(s.name) + '</div><div class="gate__store-addr">' + esc(s.address) + '</div></div>'
    + '<div class="btn btn--leaf btn--sm gate__shop"><span class="btn__t">' + esc(s.cta) + '</span></div></a></li>').join('');
  return '<div class="gate" id="ageGateModal" data-parity="agegate" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle"' + attrs({ 'aria-describedby': 'ageGateQuestion' }) + '>'
    + '<div class="gate__bg" aria-hidden="true">' + P.decorative(ctx, g.background.ref, { sizes: '100vw', widths: [640, 960, 1280], cls: 'gate__bg-img', loading: 'lazy' }) + '</div><div class="gate__backdrop" aria-hidden="true"></div>'
    + '<div class="gate__stack"><span class="gate__plate gate__plate--2" aria-hidden="true"></span><span class="gate__plate gate__plate--1" aria-hidden="true"></span>'
    + '<div class="gate__card on-night">' + ctx.img(logo.ref, { alt: logo.alt, sizes: '(min-width: 701px) 200px, 132px', widths: [132, 200, 400], cls: 'gate__logo', loading: 'lazy' })
    + '<h2 class="hd gate__title" id="ageGateTitle">' + esc(g.title) + '</h2>'
    + '<p class="gate__q" id="ageGateQuestion" data-gate-q>' + esc(g.question) + '</p>'
    + '<p class="gate__denied" data-gate-denied tabindex="-1" hidden>' + esc(g.denied) + '</p>'
    + '<div class="gate__btns" data-gate-btns><button type="button" class="btn btn--white" id="ageGateYes"><span class="btn__t">' + esc(g.yes) + '</span></button>'
    + '<button type="button" class="btn btn--gate-no" id="ageGateNo"><span class="btn__t">' + esc(g.no) + '</span></button></div>'
    + '<div class="gate__stores" id="locationGateWrapper" hidden><p class="gate__stores-h">' + esc(g.storeHeading) + '</p><ul class="gate__list" id="locationGate" role="list">' + stores + '</ul></div>'
    + '<noscript><p class="gate__noscript">Please turn on JavaScript to verify your age.</p></noscript>'
    + '</div></div></div>';
}
