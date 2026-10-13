// blocks.mjs - FOUNDATION block renderers: EVERY block type of docs/PIPELINE-CONTENT.md section 4, rendered verbatim
// (BUILD-CONTRACT 5.2). Templates call renderBlocks(list, ctx, page, opts) or a named renderer; a lane that needs a
// variant adds a local class through opts.cls / its own CSS, or asks FOUNDATION.
// Parity rules kept here (docs/PIPELINE-CONTENT.md 8): the model's words in model order, no added visible word, every
// model href exactly once, hidden-until-interaction text kept in the DOM (hidden), glyphs as SVG.
import * as P from './parts.mjs';

const { esc, escAttr, attrs, cx, icon } = P;

/* ------------------------------------------------------------------ text blocks */
/** heading: level 1-6 -> <hN>; level null (the source used p.h1 / div.h2 / span.h1) -> a <div> styled by look, so no
 *  fake heading enters the outline and Bricolage never sets a <p> (R-42). opts.cls adds a class; opts.level overrides. */
export function heading(b, ctx, page, o = {}) {
  const lvl = o.level || b.level;
  const tag = lvl ? 'h' + lvl : 'div';
  return '<' + tag + attrs({ class: cx('hd', b.look && 'hd--' + b.look, !lvl && 'hd--plain', o.cls), id: o.id || null }) + '>' + b.html + '</' + tag + '>';
}
/** paragraph: a plain <p> (no attribute: tools/text-parity.mjs --control plants its faults in a bare <p>), a look class
 *  when the model has one, a <div class="p"> for bare text runs (an address block with <br>) */
export function paragraph(b, ctx, page, o = {}) {
  if (b.bare) return '<div class="' + cx('p', o.cls) + '">' + b.html + '</div>';
  const cls = cx(b.look && 'p--' + b.look, o.cls);
  return cls ? '<p class="' + escAttr(cls) + '">' + b.html + '</p>' : '<p>' + b.html + '</p>';
}
export function list(b, ctx, page, o = {}) {
  const tag = b.ordered ? 'ol' : 'ul';
  return '<' + tag + ' class="' + cx('list', o.cls) + '">' + b.items.map((it) => '<li>' + it.html + (it.children ? it.children.map((c) => list(c, ctx, page)).join('') : '') + '</li>').join('') + '</' + tag + '>';
}
export function buttons(b, ctx, page, o = {}) {
  if (o.inHero) return P.buttonRow(ctx, b.items, { cls: o.cls, each: (x, i) => ({ kind: i === 0 ? 'leaf' : 'ghost', arrow: i === 0 }) });
  return P.buttonRow(ctx, b.items, { cls: o.cls, kind: o.kind, size: o.size });
}
export function image(b, ctx) {
  const im = b.image;
  return '<figure class="figure">' + P.img(ctx, im.ref, { alt: im.alt || '', sizes: '(min-width: 1024px) 560px, 92vw', cls: 'figure__img', attrs: im.alt ? {} : { 'data-decorative': '' } }) + '</figure>';
}

/* ------------------------------------------------------------------ composite blocks */
/** page-header: the banner (6.16) with the page's single h1 */
export function pageHeader(b, ctx, page, o = {}) {
  return P.banner(ctx, page, { headingHtml: b.heading ? heading(b.heading, ctx, page, { cls: 'banner__title' }) : '', headingText: b.heading ? b.heading.text : '', art: o.art, size: o.size || 'auto', veil: o.veil || 'default', cls: o.cls, after: o.after || '' });
}
/** hero-tile: a night band with the tile photo in a light box and the copy on a pane. opts.first: the G1 glass pane
 *  (the one live blur the hero may carry); later tiles use an opaque forest card (glass budget R-13). */
export function heroTile(b, ctx, page, o = {}) {
  const pane = '<div class="' + cx('htile__pane', o.first ? 'glass-pane' : 'htile__pane--card') + '">' + renderBlocks(b.blocks, ctx, page, { tone: 'night', inHero: true }) + '</div>';
  // a deny-listed source photo (10.3) never takes a hero role: the first tile gets the page's place plate, later tiles
  // render without a photo
  const ref = P.isDenied(b.image.ref) ? (o.first ? P.bannerArtFor(page) : null) : b.image.ref;
  if (!ref) return '<div class="' + cx('htile', 'htile--nophoto', o.cls) + '">' + pane + '</div>';
  const box = P.lightBox(ctx, { ref, sizes: o.sizes || (o.first ? '(min-width: 1024px) 75vw, (min-width: 701px) 100vw, 140vw' : '(min-width: 1024px) 50vw, (min-width: 701px) 100vw, 140vw'), loading: o.first ? 'eager' : 'lazy', fetchpriority: o.first ? 'high' : null, plates: 1, tone: 'night', cls: 'htile__box', widths: [640, 960, 1280, 1600, 1920] });
  return '<div class="' + cx('htile', o.first && 'htile--first', o.cls) + '">' + box + pane + '</div>';
}
/** location-cards: the store cards (6.11): white card, a postcard image, the name, the address lines, the button */
export function locationCards(b, ctx, page, o = {}) {
  return '<ul class="' + cx('store-cards', o.cls) + '" role="list">' + b.cards.map((c, i) => {
    const wash = /san-pedro|San-Pedro/.test(c.image && c.image.ref) ? 'mint' : 'peach';
    return P.reveal(P.cardShell(
      '<div class="store-card__media" aria-hidden="true">' + (c.image ? P.decorative(ctx, c.image.ref, { sizes: '(min-width: 1024px) 220px, 190px', cls: 'store-card__img', widths: [200, 300, 400, 600] }) : '') + '</div>'
      + '<div class="store-card__body">' + renderBlocks(c.blocks, ctx, page, { tone: 'light', inCard: true }) + '</div>',
      { tag: 'div', cls: 'store-card store-card--' + wash }), { tag: 'li', step: i });
  }).join('') + '</ul>';
}
/** split: half image (a light box), half content. tone from the band */
export function split(b, ctx, page, o = {}) {
  const tone = o.tone || 'light';
  const box = b.image ? P.lightBox(ctx, { ref: b.image.ref, alt: b.image.alt || b.imageLabel || '', sizes: '(min-width: 1024px) 480px, 90vw', tone: tone === 'night' ? 'night' : 'light', cls: 'split__box', widths: [480, 640, 960, 1200] }) : '';
  const body = '<div class="split__body">' + renderBlocks(b.blocks, ctx, page, { tone, inSplit: true }) + '</div>';
  return '<div class="' + cx('split', 'split--img-' + (b.imageSide === 'right' ? 'right' : 'left'), o.cls) + '">'
    + P.reveal(box, { cls: 'split__media' }) + P.reveal(body, { cls: 'split__copy', step: 1 }) + '</div>';
}
/** accordion (6.13): h{level} > button[aria-expanded][aria-controls] + a region panel; the open item from the model;
 *  hidden bodies keep their full text in the DOM (parity counts them) */
export function accordion(b, ctx, page, o = {}) {
  return '<div class="' + cx('acc', o.cls) + '" data-accordion>' + b.items.map((it, i) => {
    const pid = it.id || ('acc-' + i);
    const bid = pid + '-btn';
    const tag = it.level ? 'h' + it.level : 'div';
    return '<div class="acc__item' + (it.open ? ' is-open' : '') + '">'
      + '<' + tag + ' class="acc__h"><button type="button" class="acc__btn"' + attrs({ id: bid, 'aria-expanded': it.open ? 'true' : 'false', 'aria-controls': pid }) + '><span class="acc__t">' + it.title + '</span>' + icon('plus', 'acc__ico') + '</button></' + tag + '>'
      + '<div' + attrs({ class: 'acc__panel', id: pid, role: 'region', 'aria-labelledby': bid, hidden: !it.open }) + '><div class="acc__body">' + renderBlocks(it.blocks, ctx, page, { tone: 'light' }) + '</div></div></div>';
  }).join('') + '</div>';
}
/** card-grid: intro blocks, white cards (the /weed-delivery steps, the /contact store cards with their maps), outro */
export function cardGrid(b, ctx, page, o = {}) {
  return '<div class="' + cx('cgrid', o.cls) + '">'
    + (b.intro && b.intro.length ? '<div class="cgrid__intro">' + renderBlocks(b.intro, ctx, page, { tone: o.tone || 'light' }) + '</div>' : '')
    + '<ul class="cgrid__cards" role="list">' + b.cards.map((c, i) => P.reveal(P.cardShell(renderBlocks(c.blocks, ctx, page, { tone: 'light', inCard: true }), { cls: cx('cgrid__card', c.tone && 'tone-' + c.tone) }), { tag: 'li', step: i % 4 })).join('') + '</ul>'
    + (b.outro && b.outro.length ? '<div class="cgrid__outro">' + renderBlocks(b.outro, ctx, page, { tone: o.tone || 'light' }) + '</div>' : '')
    + '</div>';
}
/** card-carousel: a scroll-snap rail of white cards (store pages: "Shop by Category" with the small source images at
 *  their sharp width; "Shop by Mood" with a 48 px tint wash at the top and the text on white) */
export function cardCarousel(b, ctx, page, o = {}) {
  const mood = b.variant === 'mood';
  return '<div class="' + cx('rail', 'rail--' + (b.variant || 'cards'), o.cls) + '"><ul class="rail__track" role="list">' + b.cards.map((c) => '<li class="rail__item">'
    + P.cardShell((c.image ? '<div class="ccard__media">' + P.img(ctx, c.image.ref, { alt: c.image.alt || '', sizes: '140px', cls: 'ccard__img', widths: [140, 210, 280] }) + '</div>' : '')
      + (mood ? '<span class="ccard__wash" aria-hidden="true"></span>' : '')
      + '<div class="ccard__body">' + renderBlocks(c.blocks, ctx, page, { tone: 'light', inCard: true }) + '</div>', { cls: cx('ccard', mood && 'ccard--mood', c.tone && 'tone-' + c.tone) })
    + '</li>').join('') + '</ul></div>';
}
/** logo-carousel: the partner logos, unaltered, on white chips in a static wrap grid (no autoplay) */
export function logoCarousel(b, ctx, page, o = {}) {
  return '<ul class="' + cx('logos', o.cls) + '" role="list">' + b.logos.map((l) => '<li class="logos__item"><a' + attrs({ class: 'logos__link', href: P.href(ctx, l.href), rel: l.rel }) + '>'
    + P.img(ctx, l.image.ref, { alt: l.image.alt || '', sizes: '120px', cls: 'logos__img', widths: [120, 240] }) + '</a></li>').join('') + '</ul>';
}
/** deals: white deal cards with a 4 px leaf rule, the title in forest with a leaf fire icon; each links to the store page */
export function deals(b, ctx, page, o = {}) {
  return '<ul class="' + cx('deals', o.cls) + '" role="list">' + b.items.map((d, i) => P.reveal('<a' + attrs({ class: 'deal', href: P.href(ctx, d.href) }) + '>' + icon('fire', 'deal__ico') + '<div class="deal__body">' + renderBlocks(d.blocks, ctx, page, { tone: 'light', inCard: true }) + '</div></a>', { tag: 'li', step: i % 4 })).join('') + '</ul>';
}
export function linkCard(b, ctx, page, o = {}) { return '<a' + attrs({ class: cx('card card--white link-card', o.cls), href: P.href(ctx, b.href) }) + '>' + renderBlocks(b.blocks, ctx, page, { tone: 'light', inCard: true }) + '</a>'; }
export function iconLink(b, ctx) { return '<a' + attrs({ class: 'icon-link', href: P.href(ctx, b.href), 'aria-label': b.label || null }) + '>' + icon(P.iconFor(b.icon) || 'external') + '</a>'; }
export function notice(b, ctx, page, o = {}) { return '<div class="' + cx('notice', 'notice--' + (b.tone || 'info'), o.cls) + '">' + icon('leaf', 'notice__ico') + '<p>' + b.html + '</p></div>'; }
/** post-list: the archive posts as white cards with the verbatim date and title */
export function postList(b, ctx, page, o = {}) {
  return '<ul class="' + cx('posts', o.cls) + '" role="list">' + b.posts.map((p, i) => P.reveal(P.cardShell(
    (p.image ? '<div class="post__media">' + P.img(ctx, p.image.ref, { alt: p.image.alt || '', sizes: '(min-width: 768px) 280px, 92vw', cls: 'post__img', widths: [280, 560] }) + '</div>' : '')
    + '<div class="post__body"><p class="post__date"><span>' + esc(p.date.month) + '</span> <span class="post__day">' + esc(p.date.day) + '</span> <span>' + esc(p.date.year) + '</span></p>'
    + (p.iconLink ? '<a' + attrs({ class: 'icon-link post__icon', href: P.href(ctx, p.iconLink.href), 'aria-label': p.text }) + '>' + icon('external') + '</a>' : '')
    + '<p class="post__title"><a' + attrs({ href: P.href(ctx, p.href) }) + '>' + p.title + '</a></p></div>', { cls: 'post' }), { tag: 'li', step: i % 4 })).join('') + '</ul>';
}
export function searchForm(b) {
  const id = 'search-' + (b.name || 's');
  return '<form class="search-form"' + attrs({ role: 'search', method: b.method, action: b.action }) + '><label' + attrs({ for: id, class: b.labelHidden ? 'sr-only' : 'search-form__label' }) + '>' + esc(b.label) + '</label>'
    + '<div class="search-form__row"><input' + attrs({ id, class: 'input', type: 'search', name: b.name, placeholder: b.placeholder, required: true }) + '><button type="submit" class="btn btn--forest"><span class="btn__t">' + esc(b.button) + '</span></button></div></form>';
}
/** zip-finder (6.14): the steps in model order (title, empty state, results, form); site.js runs the logic from
 *  ctx.zipFinder (embedded as JSON; script text is not visible text). Results show in a polite live region. */
export function zipFinder(b, ctx, page, o = {}) {
  const t = (x, extra = '') => (x ? '<div class="' + cx('hd', 'hd--' + (x.look || 'h2'), 'zip__title', extra) + '">' + x.html + '</div>' : '');
  const rows = b.results.rows.map((r) => '<div class="zip__row"' + attrs({ id: r.id, hidden: true, 'data-zip-row': r.id }) + '>'
    + '<p class="zip__loc"><strong>' + esc(r.label) + '</strong> <a' + attrs({ href: P.href(ctx, r.href) }) + '>' + esc(r.name) + '</a></p>'
    + r.checks.map((c) => '<p class="zip__check">' + icon('check') + '<span>' + esc(c) + '</span></p>').join('')
    + P.buttonRow(ctx, r.buttons, { kind: 'leaf' })
    + '<button type="button" class="zip__again btn btn--line btn--sm" data-zip-again><span class="btn__t">' + esc(r.again) + '</span></button></div>').join('');
  const zf = ctx.zipFinder || {};
  const data = JSON.stringify({ sanPedro: zf.sanPedro, culverCity: zf.culverCity, order: zf.order, rows: zf.rows, strings: zf.strings, minLength: zf.minLength }).replace(/</g, '\\u003c');
  const f = b.form;
  return '<div class="' + cx('zip', o.cls) + '" data-zip>'
    + '<div class="zip__step zip__start" data-zip-step="start">' + t(b.title) + '</div>'
    + '<div class="zip__step" data-zip-step="empty" hidden aria-live="polite">' + t(b.empty.title) + b.empty.paragraphs.map((p) => '<p>' + p.html + '</p>').join('') + '<button type="button" class="zip__again btn btn--line btn--sm" data-zip-again aria-label="' + escAttr(b.results.rows[0] ? b.results.rows[0].again : '') + '">' + icon('search') + '</button></div>'
    + '<div class="zip__step zip__results" data-zip-step="results" hidden>' + t(b.results.title) + b.results.paragraphs.map((p) => '<p>' + p.html + '</p>').join('') + rows + '</div>'
    + '<form class="zip__form"' + attrs({ id: f.id, name: f.name, 'data-zip-form': '', novalidate: true }) + '><label' + attrs({ for: 'zipcode', class: f.labelHidden ? 'sr-only' : 'zip__label' }) + '>' + esc(f.label) + '</label>'
    + '<div class="zip__row-in"><input' + attrs({ class: 'input input--zip', type: f.input.type, id: 'zipcode', name: f.input.name, placeholder: f.input.placeholder, required: f.input.required, inputmode: 'numeric', autocomplete: 'postal-code', 'aria-describedby': 'zipMsg' }) + '>'
    + '<button type="submit" class="btn btn--line"><span class="btn__t">' + esc(f.button) + '</span></button></div>'
    + '<p class="zip__msg" id="zipMsg" role="status" aria-live="polite"></p></form>'
    + '<script type="application/json" id="zipFinderData">' + data + '</script></div>';
}
/** the contact form (A12, BUILD-CONTRACT 4.7): verbatim labels and marks, method post to the placeholder endpoint,
 *  Send disabled with the note visible beside it */
export function contactForm(b, ctx, page, o = {}) {
  const fields = b.fields.map((x, i) => {
    const id = 'contact-' + (i + 1);
    const lab = '<label' + attrs({ for: id, class: 'field__label' }) + '>' + esc(x.label) + (x.required ? '<span class="field__req">' + esc(x.requiredMark) + '</span>' : '') + '</label>';
    const ctl = x.type === 'textarea'
      ? '<textarea' + attrs({ id, class: 'input input--area', name: x.name, rows: x.rows, placeholder: x.placeholder, required: x.required }) + '></textarea>'
      : '<input' + attrs({ id, class: 'input', type: x.type, name: x.name, placeholder: x.placeholder, required: x.required, autocomplete: x.type === 'email' ? 'email' : x.type === 'tel' ? 'tel' : x.name === 'name' ? 'name' : null }) + '>';
    return '<div class="' + cx('field', x.type === 'textarea' && 'field--wide') + '">' + lab + ctl + '</div>';
  }).join('');
  return '<form class="' + cx('cform', o.cls) + '"' + attrs({ method: b.method, action: b.action, enctype: b.enctype }) + '><div class="cform__fields">' + fields + '</div>'
    + '<div class="cform__submit"><p class="cform__note" id="contact-note">' + icon('leaf') + '<span>' + esc(b.note) + '</span></p>'
    + '<button type="submit" class="btn btn--leaf" disabled aria-describedby="contact-note"><span class="btn__t">' + esc(b.submit.label) + '</span></button></div></form>';
}
/** map: the source <iframe> start tag byte for byte (4.8), framed (radius --r-m, no overlay) */
export function map(b) { return '<div class="map">' + b.html + '</div>'; }
/** embed (4.6): the vendor block byte for byte inside the calm embed container; no transform, filter, glass or overlay
 *  on it or any ancestor (CSS: .embed and every ancestor stay static) */
export function embed(b, ctx, page) {
  if (b.provider === 'jane') return '<div class="embed embed--jane">' + (page.embed && page.embed.provider === 'jane' ? page.embed.body : '') + '</div>';
  if (b.provider === 'weedmaps') return '<div class="embed embed--weedmaps">' + b.html + '</div>';
  throw new Error('unknown embed provider: ' + b.provider);
}

/* ------------------------------------------------------------------ dispatch */
export const RENDERERS = {
  heading, paragraph, list, buttons, image, rule: () => '<hr class="rule">', 'page-header': pageHeader, 'hero-tile': heroTile,
  'location-cards': locationCards, split, accordion, 'card-grid': cardGrid, 'card-carousel': cardCarousel, 'logo-carousel': logoCarousel,
  deals, 'link-card': linkCard, 'icon-link': iconLink, notice, 'post-list': postList, 'search-form': searchForm, 'zip-finder': zipFinder,
  form: contactForm, map, embed,
};
/** one block; opts are passed through (tone: 'night' | 'light', cls, ...). Unknown types throw (the build fails). */
export function renderBlock(b, ctx, page, o = {}) {
  const f = RENDERERS[b.type];
  if (!f) throw new Error('unknown block type: ' + b.type + ' on ' + (page && page.path));
  return f(b, ctx, page, o);
}
export function renderBlocks(list, ctx, page, o = {}) { return (list || []).map((b) => renderBlock(b, ctx, page, o)).join('\n'); }
