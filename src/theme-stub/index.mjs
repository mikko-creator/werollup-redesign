// theme-stub/index.mjs - plain semantic HTML for every block type and all chrome (PIPELINE). BUILD-CONTRACT 3.2.
// No JavaScript is required: accordions are <details>, the dialogs (age gate, location chooser) and the off-canvas
// menu are rendered closed (`hidden`), hidden-until-interaction text stays in the DOM. The real theme replaces this
// module (src/theme/index.mjs) with the same signature; docs/PIPELINE-CONTENT.md and docs/PIPELINE-SITE.md are the
// interface it implements.
//
// Text-parity regions: every chrome region and <main> carries data-parity="<region>" so tools/text-parity.mjs can
// compare each with the same region of the source page (topbar, header, subheader, offcanvas, main, reviews, footer,
// chooser, agegate). Inside a region the words must keep the source order.

export const styles = ['stub.css'];      // concatenated in this order from stylesDir
export const scripts = [];               // none: the stub needs no JavaScript
export const stylesDir = 'src/theme-stub';
export const scriptsDir = 'src/theme-stub';

const e = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const a = (s) => e(s).replace(/"/g, '&quot;');
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== false).map(([k, v]) => (v === true ? ' ' + k : ' ' + k + '="' + a(v) + '"')).join('');

/* ------------------------------------------------------------------ blocks */
function heading(b) {
  const tag = b.level ? 'h' + b.level : (b.tag === 'span' ? 'p' : b.tag === 'div' ? 'div' : 'p');
  return '<' + tag + attrs({ class: 'hd' + (b.look ? ' look-' + b.look : '') }) + '>' + b.html + '</' + tag + '>';
}
function button(x) {
  return '<a' + attrs({
    href: x.href, class: 'btn' + (x.variant ? ' btn-' + x.variant : '') + (x.size ? ' btn-' + x.size : '') + (x.chooser ? ' js-location-chooser' : '') + (x.activeLocation ? ' active-location-menu' : ''),
    'data-lax-url': x.laxUrl, 'data-sanpedro-url': x.sanpedroUrl, target: x.target, rel: x.rel,
  }) + '>' + x.label + '</a>';
}
function buttons(b) {
  const inner = b.items.map(button).join(' ');
  return b.wrapper ? '<' + b.wrapper + ' class="btn-row">' + inner + '</' + b.wrapper + '>' : '<p class="btn-row">' + inner + '</p>';
}
function list(b) {
  const tag = b.ordered ? 'ol' : 'ul';
  return '<' + tag + '>' + b.items.map((it) => '<li>' + it.html + (it.children ? it.children.map(list).join('') : '') + '</li>').join('') + '</' + tag + '>';
}
const dec = (ctx, img, opts) => (img ? ctx.img(img.ref, { alt: '', attrs: { 'data-decorative': '' }, ...opts }) : '');

export function renderBlock(b, ctx, page) {
  switch (b.type) {
    case 'heading': return heading(b);
    case 'paragraph': return b.bare ? '<div class="p">' + b.html + '</div>' : '<p' + attrs({ class: b.look ? 'look-' + b.look : null }) + '>' + b.html + '</p>';
    case 'list': return list(b);
    case 'buttons': return buttons(b);
    case 'image': return '<figure class="img">' + ctx.img(b.image.ref, { alt: b.image.alt || '', sizes: '(min-width: 960px) 50vw, 100vw' }) + '</figure>';
    case 'rule': return '<hr>';
    case 'page-header':
      return '<header class="page-header">' + (b.image ? dec(ctx, b.image, { cls: 'page-header__img', sizes: '100vw', loading: 'eager', fetchpriority: 'high' }) : '') + (b.heading ? heading(b.heading) : '') + '</header>';
    case 'hero-tile':
      return '<div class="hero-tile">' + dec(ctx, b.image, { cls: 'hero-tile__img', sizes: '(min-width: 1400px) 66vw, 100vw', loading: 'eager' }) + '<div class="hero-tile__body">' + blocks(b.blocks, ctx, page) + '</div></div>';
    case 'location-cards':
      return '<div class="location-cards">' + b.cards.map((c) => '<div class="card">' + dec(ctx, c.image, { cls: 'card__img', sizes: '(min-width: 768px) 25vw, 100vw' }) + blocks(c.blocks, ctx, page) + '</div>').join('') + '</div>';
    case 'split':
      return '<div class="split split--img-' + a(b.imageSide) + '"><div class="split__body">' + blocks(b.blocks, ctx, page) + '</div>' + (b.image ? '<div class="split__img">' + ctx.img(b.image.ref, { alt: b.image.alt || b.imageLabel || '', sizes: '(min-width: 992px) 50vw, 100vw' }) + '</div>' : '') + '</div>';
    case 'accordion':
      return '<div class="accordion">' + b.items.map((it) => '<details' + attrs({ open: it.open, id: it.id }) + '><summary>' + (it.level ? '<h' + it.level + '>' + it.title + '</h' + it.level + '>' : it.title) + '</summary>' + blocks(it.blocks, ctx, page) + '</details>').join('') + '</div>';
    case 'card-grid':
      return '<div class="card-grid">' + blocks(b.intro, ctx, page) + '<div class="card-grid__cards">' + b.cards.map((c) => '<div' + attrs({ class: 'card' + (c.tone ? ' tone-' + c.tone : '') }) + '>' + blocks(c.blocks, ctx, page) + '</div>').join('') + '</div>' + blocks(b.outro, ctx, page) + '</div>';
    case 'card-carousel':
      return '<div class="card-row card-row--' + a(b.variant) + '">' + b.cards.map((c) => '<div' + attrs({ class: 'card' + (c.tone ? ' tone-' + c.tone : '') }) + '>' + (c.image ? ctx.img(c.image.ref, { alt: c.image.alt || '', cls: 'card__img', sizes: '172px', widths: [172, 344] }) : '') + blocks(c.blocks, ctx, page) + '</div>').join('') + '</div>';
    case 'logo-carousel':
      return '<ul class="logo-row">' + b.logos.map((l) => '<li><a' + attrs({ href: l.href, rel: l.rel }) + '>' + ctx.img(l.image.ref, { alt: l.image.alt || '', sizes: '200px' }) + '</a></li>').join('') + '</ul>';
    case 'deals':
      return '<ul class="deals">' + b.items.map((d) => '<li><a' + attrs({ href: d.href }) + '>' + blocks(d.blocks, ctx, page) + '</a></li>').join('') + '</ul>';
    case 'link-card':
      return '<a class="link-card"' + attrs({ href: b.href }) + '>' + blocks(b.blocks, ctx, page) + '</a>';
    case 'icon-link':
      return '<a class="icon-link"' + attrs({ href: b.href, 'aria-label': b.label || null }) + '><span aria-hidden="true" class="icon icon-external-link"></span></a>';
    case 'notice':
      return '<p class="notice notice--' + a(b.tone) + '">' + b.html + '</p>';
    case 'post-list':
      return '<ul class="posts">' + b.posts.map((p) => '<li class="post"><p class="post__date"><span>' + e(p.date.month) + '</span> <span class="post__day">' + e(p.date.day) + '</span> <span>' + e(p.date.year) + '</span></p>' + (p.image ? ctx.img(p.image.ref, { alt: p.image.alt || '', sizes: '300px' }) : '') + (p.iconLink ? '<a class="icon-link"' + attrs({ href: p.iconLink.href, 'aria-label': p.text }) + '><span aria-hidden="true" class="icon icon-external-link"></span></a>' : '') + '<p class="post__title"><a' + attrs({ href: p.href }) + '>' + p.title + '</a></p></li>').join('') + '</ul>';
    case 'search-form':
      return '<form class="search-form"' + attrs({ role: 'search', method: b.method, action: b.action }) + '><label><span class="sr-only">' + e(b.label) + '</span><input' + attrs({ type: 'search', name: b.name, placeholder: b.placeholder, required: true }) + '></label> <button type="submit">' + e(b.button) + '</button></form>';
    case 'zip-finder': return zipFinder(b);
    case 'form': return contactForm(b);
    case 'map': return '<div class="map">' + b.html + '</div>';
    case 'embed':
      if (b.provider === 'jane') return '<div class="shop-embed shop-embed--jane">' + (page.embed && page.embed.provider === 'jane' ? page.embed.body : '') + '</div>';
      if (b.provider === 'weedmaps') return '<div class="shop-embed shop-embed--weedmaps">' + b.html + '</div>';
      throw new Error('unknown embed provider: ' + b.provider);
    default:
      throw new Error('unknown block type: ' + b.type + ' on ' + (page && page.path));
  }
}
function blocks(list, ctx, page) { return (list || []).map((b) => renderBlock(b, ctx, page)).join('\n'); }

function zipFinder(b) {
  const t = (x, tag = 'p') => (x ? '<' + tag + ' class="hd look-' + a(x.look) + '">' + x.html + '</' + tag + '>' : '');
  const rows = b.results.rows.map((r) => '<div class="zip-row"' + attrs({ id: r.id, hidden: true }) + '><p class="look-h3"><strong>' + e(r.label) + '</strong> <a' + attrs({ href: r.href }) + '>' + e(r.name) + '</a></p>' + r.checks.map((c) => '<p class="zip-check">' + e(c) + '</p>').join('') + '<p>' + r.buttons.map(button).join(' ') + '</p><p class="zip-again">' + e(r.again) + '</p></div>').join('');
  return '<div class="zip-finder">'
    + '<div class="zip-step" id="zcs1">' + t(b.title, 'div') + '</div>'
    + '<div class="zip-step" id="zcs-empty" hidden>' + t(b.empty.title, 'div') + b.empty.paragraphs.map((p) => '<p>' + p.html + '</p>').join('') + '</div>'
    + '<div class="zip-step zip-results" hidden>' + t(b.results.title, 'div') + b.results.paragraphs.map((p) => '<p>' + p.html + '</p>').join('') + rows + '</div>'
    + '<form class="zip-form"' + attrs({ id: b.form.id, name: b.form.name }) + '><label' + attrs({ for: 'zipcode', class: b.form.labelHidden ? 'sr-only' : null }) + '>' + e(b.form.label) + '</label><input' + attrs({ type: b.form.input.type, id: 'zipcode', name: b.form.input.name, placeholder: b.form.input.placeholder, required: b.form.input.required }) + '> <button type="submit">' + e(b.form.button) + '</button></form>'
    + '</div>';
}

function contactForm(b) {
  const f = b.fields.map((x, i) => {
    const id = 'contact-' + (i + 1);
    const lab = '<label' + attrs({ for: id }) + '>' + e(x.label) + (x.required ? '<span class="req">' + e(x.requiredMark) + '</span>' : '') + '</label>';
    const ctl = x.type === 'textarea'
      ? '<textarea' + attrs({ id, name: x.name, rows: x.rows, placeholder: x.placeholder, required: x.required }) + '></textarea>'
      : '<input' + attrs({ id, type: x.type, name: x.name, placeholder: x.placeholder, required: x.required }) + '>';
    return '<div class="field">' + lab + ctl + '</div>';
  }).join('');
  return '<form class="contact-form"' + attrs({ method: b.method, action: b.action, enctype: b.enctype }) + '>' + f + '<p class="form-submit"><button type="submit" disabled aria-describedby="contact-note">' + e(b.submit.label) + '</button> <span id="contact-note" class="form-note">' + e(b.note) + '</span></p></form>';
}

/* ------------------------------------------------------------------ chrome */
function menu(items, cls) {
  return '<ul' + attrs({ class: cls }) + '>' + items.map((i) => '<li>' + (i.href ? '<a' + attrs({ href: i.href }) + '>' + e(i.label) + '</a>' : '<span class="menu-group">' + e(i.label) + '</span>') + (i.children ? menu(i.children, 'submenu') : '') + '</li>').join('') + '</ul>';
}
const navOf = (ctx, page) => ({ primary: ctx.nav.primary, 'lax-culver-city': ctx.nav.laxCulverCity, 'san-pedro': ctx.nav.sanPedro })[page.menuFamily] || ctx.nav.primary;
function socials(list) {
  return list.map((s) => '<a' + attrs({ href: s.href, target: s.target, rel: s.rel, 'aria-label': s.ariaLabel }) + '>' + (s.label ? '<span class="sr-only">' + e(s.label) + '</span>' : '') + '<span aria-hidden="true" class="icon icon-' + a(s.icon || 'link') + '"></span></a>').join(' ');
}

function topBar(ctx) {
  const t = ctx.topBar;
  const opts = t.select.options.map((o) => '<option' + attrs({ value: o.value, 'data-slug': o.slug, 'data-address': o.address, 'data-hours': o.hours, 'data-menu-url': o.menuUrl, 'data-directions-url': o.directionsUrl }) + '>' + e(o.label) + '</option>').join('');
  const details = t.select.options.filter((o) => o.slug).map((o) => '<p' + attrs({ 'data-store': o.slug }) + '><span class="tb-address">' + e(o.address) + '</span> <span class="tb-hours">' + e(o.hours) + '</span></p>').join('');
  return '<div class="topbar" data-parity="topbar"><select' + attrs({ name: t.select.name, id: t.select.id, 'aria-label': t.select.options[0].label }) + '>' + opts + '</select><div id="activeLocationDetails" class="tb-details">' + details + '</div><div class="tb-social">' + socials(t.socials) + '</div></div>';
}
function header(ctx, page) {
  const h = ctx.header;
  return '<header class="site-header" data-parity="header"><a class="brand"' + attrs({ href: h.logo.href }) + '>' + ctx.img(h.logo.image.ref, { alt: h.logo.image.alt, sizes: '150px', widths: [150, 300], loading: 'eager', cls: 'brand__logo' }) + '</a>'
    + '<div class="quick-menu">' + menu(h.quickMenu, 'menu') + '</div>'
    + '<nav class="main-menu"' + attrs({ 'aria-label': h.navLabel }) + '>' + menu(navOf(ctx, page), 'menu') + '</nav>'
    + '<a' + attrs({ class: 'btn btn-secondary order-now active-location-menu js-selected-location-menu', href: h.orderNow.href, 'data-lax-url': h.orderNow.laxUrl, 'data-sanpedro-url': h.orderNow.sanpedroUrl }) + '>' + e(h.orderNow.label) + '</a></header>';
}
function subheader(ctx, page) {
  if (page.subheader === 'marquee') return '<div class="marquee" data-parity="subheader"><p>' + ctx.marquee.items.map((m) => '<span class="marquee__item">' + e(m.text) + '</span>').join(' ') + '</p></div>';
  const s = ctx.shoppingStrip[page.store];
  const crumbs = page.breadcrumbs.length ? '<nav aria-label="breadcrumb" class="crumbs"><ol>' + page.breadcrumbs.map((c) => '<li>' + (c.href && !c.current ? '<a' + attrs({ href: c.href }) + '>' + e(c.label) + '</a>' : '<span aria-current="page">' + e(c.label) + '</span>') + '</li>').join('') + '</ol></nav>' : '';
  return '<div class="shopping-strip" data-parity="subheader">' + crumbs + '<p class="shopping-strip__lead">' + e(s.lead) + ' <strong>' + e(s.store) + '</strong></p><p class="btn-row">' + s.buttons.map(button).join(' ') + '</p></div>';
}
function offcanvas(ctx, page) {
  const o = ctx.offcanvas;
  return '<div class="offcanvas" id="defaultOffcanvas" hidden data-parity="offcanvas"' + attrs({ 'aria-label': o.ariaLabel }) + '><a' + attrs({ href: o.logo.href }) + '>' + ctx.img(o.logo.image.ref, { alt: o.logo.image.alt, sizes: '150px', widths: [150, 300] }) + '</a><div class="oc-social">' + socials(o.socials) + '</div><button type="button" class="oc-close"' + attrs({ 'aria-label': o.closeLabel }) + '></button>'
    + '<nav' + attrs({ 'aria-label': o.navLabel }) + '>' + menu(navOf(ctx, page), 'menu') + '</nav>'
    + '<a' + attrs({ class: 'btn btn-primary active-location-menu js-selected-location-menu', href: o.orderNow.href, 'data-lax-url': o.orderNow.laxUrl, 'data-sanpedro-url': o.orderNow.sanpedroUrl, 'aria-label': o.orderNow.ariaLabel }) + '>' + e(o.orderNow.label) + '</a></div>';
}
function reviews(ctx) {
  const r = ctx.reviews;
  return '<section class="reviews" data-parity="reviews" aria-labelledby="reviews-title"><p class="hd look-h1" id="reviews-title">' + e(r.heading) + '</p><p class="hd look-h3">' + e(r.subheading) + '</p>'
    + '<ul class="reviews__list">' + r.items.map((x) => '<li class="review"><p class="stars" aria-hidden="true" data-stars="' + x.stars + '"></p><blockquote><p>' + x.html + '</p></blockquote><p class="review__name">' + e(x.name) + '</p></li>').join('') + '</ul>'
    + '<p class="btn-row">' + r.ctas.map(button).join(' ') + '</p></section>';
}
function footer(ctx) {
  const f = ctx.footer;
  const stores = f.stores.map((s) => '<div class="f-store"><p class="hd look-h3">' + e(s.name) + '</p><p>' + e(s.address) + '</p>' + (s.phone ? '<p><a' + attrs({ href: s.phone.href }) + '>' + e(s.phone.display) + '</a></p>' : '') + '</div>').join('');
  const soc = f.socials.map((s) => '<a' + attrs({ href: s.href, target: s.target, rel: s.rel, 'aria-label': s.ariaLabel }) + '>' + (s.image ? ctx.img(s.image.ref, { alt: s.image.alt, sizes: '40px', widths: [40, 80, 160] }) : '<span aria-hidden="true" class="icon icon-' + a(s.icon) + '"></span>') + '</a>').join(' ');
  return '<footer class="site-footer" data-parity="footer">' + ctx.img(f.logo.image.ref, { alt: f.logo.image.alt, sizes: '266px', widths: [266, 400] }) + stores + '<p class="f-social">' + soc + '</p>'
    + '<nav aria-label="Quick Links"><p class="hd look-h3">' + e(f.quickLinksTitle) + '</p>' + menu(f.quickLinks, 'menu') + '</nav>'
    + '<p class="copyright">' + e(f.copyright) + (f.separator ? ' ' + e(f.separator) + ' ' : ' ') + (f.privacy ? '<a' + attrs({ href: f.privacy.href, title: f.privacy.title }) + '>' + e(f.privacy.label) + '</a>' : '') + '</p></footer>';
}
function chooser(ctx) {
  const c = ctx.locationChooser;
  return '<div class="dialog" id="locationChooserModal" role="dialog" aria-modal="true" aria-labelledby="locationChooserTitle" hidden data-parity="chooser"><button type="button"' + attrs({ 'aria-label': c.closeLabel }) + '><span aria-hidden="true">' + e(c.closeGlyph) + '</span></button>'
    + '<p class="eyebrow">' + e(c.eyebrow) + '</p><p class="hd look-h2" id="locationChooserTitle">' + e(c.title) + '</p><p>' + e(c.description) + '</p>'
    + c.cards.map((k) => '<a' + attrs({ class: 'chooser-card', href: k.href, 'data-location-chooser-card': k.key }) + '>' + dec(ctx, k.image, { sizes: '280px', widths: [280, 560] }) + '<span class="hd look-h4">' + e(k.name) + '</span> <span>' + e(k.address) + '</span> <span class="btn btn-secondary">' + e(k.cta) + '</span></a>').join('') + '</div>';
}
function ageGate(ctx) {
  const g = ctx.ageGate;
  return '<div class="dialog age-gate" id="ageGateModal" role="dialog" aria-modal="true"' + attrs({ 'aria-label': g.ariaLabel }) + ' hidden data-parity="agegate">'
    + '<p class="hd look-h1">' + e(g.title) + '</p><p class="age-gate__question">' + e(g.question) + '</p><p class="age-gate__denied" hidden>' + e(g.denied) + '</p>'
    + '<p class="btn-row"><button type="button" id="ageGateYes">' + e(g.yes) + '</button> <button type="button" id="ageGateNo">' + e(g.no) + '</button></p>'
    + '<div id="locationGateWrapper" hidden><p class="age-gate__stores">' + e(g.storeHeading) + '</p><ul id="locationGate">' + g.stores.map((s) => '<li><p class="hd">' + e(s.name) + '</p><p>' + e(s.address) + '</p><a' + attrs({ href: s.href, class: 'location-select-btn' }) + '>' + e(s.cta) + '</a></li>').join('') + '</ul></div></div>';
}

/* ------------------------------------------------------------------ documents */
function head(page, ctx) {
  const css = ctx.asset('site.css');
  const js = ctx.asset('site.js');
  return '<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + ctx.seoHead(page) + '\n'
    + '<link rel="icon" href="' + a(ctx.asset('favicon.png')) + '">\n'
    + '<link rel="stylesheet" href="' + a(ctx.asset('fonts/libre-franklin.css')) + '">\n'
    + '<link rel="stylesheet" href="' + a(css) + '">\n'
    + (js ? '<script src="' + a(js) + '" defer></script>\n' : '')
    + (page.embed && page.embed.head ? page.embed.head + '\n' : '')
    + '</head>';
}

export function renderPage(page, ctx) {
  const main = page.sections.map((s) => '<section' + attrs({ id: s.id, class: 'section section--' + s.kind + (s.sourceBg ? ' bg-' + s.sourceBg : '') }) + '>' + blocks(s.blocks, ctx, page) + '</section>').join('\n');
  return '<!doctype html>\n<html lang="' + a(page.lang || 'en-US') + '">\n' + head(page, ctx) + '\n<body class="kind-' + a(page.kind) + '">\n'
    + topBar(ctx) + '\n' + header(ctx, page) + '\n' + subheader(ctx, page) + '\n' + offcanvas(ctx, page) + '\n'
    + '<main id="mainContent" data-parity="main">\n' + main + '\n</main>\n'
    + reviews(ctx) + '\n' + footer(ctx) + '\n' + chooser(ctx) + '\n' + ageGate(ctx) + '\n</body>\n</html>\n';
}

/** 404.html: a normal 404, except under /location/san-pedro/shop/menu/ where it boots the Jane embed (4.1, A14) */
export function render404(ctx) {
  const nf = ctx.notFound;
  const page = { title: 'Page not found – We Roll Up', metaDescription: null, robots: 'noindex', canonical: null, og: { title: 'Page not found' }, menuFamily: 'primary', subheader: 'marquee', breadcrumbs: [], embed: null, lang: 'en-US', path: '/404.html', kind: 'not-found' };
  return '<!doctype html>\n<html lang="en-US">\n' + head(page, ctx).replace('</head>', nf.bootScript + '\n</head>') + '\n<body class="kind-not-found">\n'
    + topBar(ctx) + '\n' + header(ctx, page) + '\n' + subheader(ctx, page) + '\n'
    + '<main id="mainContent" data-parity="main">\n<section class="section not-found"><h1>Page not found</h1><p><a href="/">We Roll Up</a></p></section>\n'
    + '<section class="section section--embed jane-fallback"><div class="shop-embed shop-embed--jane">' + nf.janeBody + '</div></section>\n</main>\n' + footer(ctx) + '\n</body>\n</html>\n';
}
