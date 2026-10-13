// templates-b.mjs - TEMPLATES-B (WF3b phase 2; BUILD-CONTRACT 5.1). Kinds: location (the two store pages), shop (the
// two shop pages and the 8 San Pedro menu paths), lax-menu, service-area-hub, service-area-town.
// Spec: DESIGN-SPEC 6.16 (banner), 6.18.5 (/lax-menu), 6.18.6 (store pages), 6.18.8 (shop pages), 6.18.11 (service area),
// 5.4 T1 / T4 (the postcard protrusions), 6.11 (the Delivery card). Contract: docs/THEME.md.
// Parity rules kept (docs/THEME.md 3, docs/PIPELINE-CONTENT.md 8): every block of every section is rendered, in model
// order, through the FOUNDATION block renderers; no visible word is added (decorative images are alt="" +
// data-decorative, accessible names stay attributes); every model href exactly once; nothing outside <main>; the vendor
// embed goes through B.embed untouched inside a container with no transform, filter, glass or overlay on its chain.
// Fail closed: a page whose model does not have the shape these templates were written for throws, so a THEME_STRICT=1
// build stops instead of silently dropping or reordering words.

/** the store's postcard (DESIGN-SPEC 10.2: store cards, chooser, gate rows, T1, T4) */
const POSTCARD_KEY = { 'san-pedro': 'postcardSanPedro', 'culver-city': 'postcardLax' };
/** T1 group: the 5 pages under /service-area/san-pedro/ take the San Pedro postcard, every other town page the LAX one */
const isSanPedroGroup = (path) => /^\/service-area\/san-pedro\//.test(path || '');

export function render(page, ctx, api) {
  switch (page.kind) {
    case 'location': return storePage(page, ctx, api);
    case 'shop':
    case 'lax-menu': return shopPage(page, ctx, api);
    case 'service-area-hub':
    case 'service-area-town': return serviceAreaPage(page, ctx, api);
    default: return null;
  }
}

/* ================================================================== store pages (6.18.6) */
function storePage(page, ctx, api) {
  const { parts: P } = api;
  if (!POSTCARD_KEY[page.store]) throw new Error('templates-b: store page ' + page.path + ' has no known store (' + page.store + ')');
  const out = [];
  // band tones in source order: the hero is the place plate; light bands alternate cream / haze; the source's dark
  // bands (sourceBg black/dark) stay night-calm, so the rhythm follows the live page
  let light = 0;
  const nextLight = () => ['cream', 'haze'][light++ % 2];
  for (const s of page.sections) {
    if (s.kind === 'hero-tile') { out.push(storeHero(page, ctx, api, s)); light = 0; continue; }
    const night = s.sourceBg === 'black' || s.sourceBg === 'dark';
    const tone = night ? 'night-calm' : nextLight();
    if (s.kind === 'card-carousel' || s.kind === 'deals' || s.kind === 'logo-carousel') {
      out.push(P.band({ tone, id: s.id, cls: 'store-sec store-sec--' + s.kind, inner: P.wrap(storeSectionBlocks(page, ctx, api, s, night)) }));
    } else {
      // any other section kind: the FOUNDATION default, so a model change never drops words
      out.push(api.defaultSection(page, ctx, s, page.sections.indexOf(s), { light, heroDone: true }));
    }
  }
  return { main: out.join('\n'), bodyClass: 'tpl-store tpl-store--' + page.store };
}

/** the hero: the place plate full-bleed, the G1 pane with the promoted h1 (A16), the lead, the CTAs; on the right the
 *  store's postcard in a light box (T4, crossing the frame's top-right edge). The later hero tiles (the source's
 *  "Delivery" tile) become the forest Delivery card (6.11) in the band that follows, in model order. */
function storeHero(page, ctx, api, s) {
  const { parts: P, blocks: B } = api;
  const tiles = s.blocks;
  if (!tiles.length || tiles.some((b) => b.type !== 'hero-tile')) throw new Error('templates-b: ' + page.path + ' ' + s.id + ': the hero section holds a block that is not a hero tile');
  const [first, ...rest] = tiles;
  const h1 = first.blocks.filter((b) => b.type === 'heading' && b.level === 1);
  if (h1.length !== 1) throw new Error('templates-b: ' + page.path + ': the first hero tile must hold the page h1 (A16), found ' + h1.length);
  // the hero tile photos are deny-listed source photos (DESIGN-SPEC 10.3: 8b360abb, 7a4352fe, 085a05d4) or a content
  // photo in a hero role; the spec's hero is the place plate (G-LAX-DUSK / G-HARBOR-HAZE), so no tile photo is drawn
  const plate = (page.generated && page.generated.hero) || P.bannerArtFor(page);
  const paneInner = first.blocks.map((b) => (b.type === 'heading' ? B.heading(b, ctx, page, { cls: 'store-hero__title' }) : B.renderBlock(b, ctx, page, { tone: 'night', inHero: true }))).join('\n');
  // revision 3 (operator 2026-10-14: the hero must be a looping video, "not a fan of the small hero image"; visitors land
  // on the store page after the age gate): the store's loop fills the hero behind the pane; the postcard light box is
  // gone. Until the loop's files exist (or for a store without a loop) the place plate still fills the band instead.
  const loop = STORE_LOOP[page.store] ? P.loop(ctx, STORE_LOOP[page.store], { cls: 'store-hero__loop', sizes: '100vw' }) : '';
  const art = loop || P.decorative(ctx, plate, { sizes: '100vw', loading: 'eager', fetchpriority: 'high', cls: 'store-hero__img', widths: [640, 960, 1280, 1600, 1920, 2400] });
  const hero = P.band({
    tone: 'night', id: s.id, cls: 'store-hero store-hero--video', depth: true,
    inner: '<div class="store-hero__art"' + (loop ? '' : ' aria-hidden="true"') + '>' + art + '</div><div class="store-hero__veil" aria-hidden="true"></div>'
      + P.wrap('<div class="store-hero__pane glass-pane">' + paneInner + '</div>', 'wide', 'store-hero__in'),
  });
  if (!rest.length) return hero;
  const cards = rest.map((t) => {
    // the Delivery tile -> the forest Delivery card: "Delivery" (Bricolage 800, cream), the two lines, a leaf pill
    const inner = t.blocks.map((b) => (b.type === 'heading' ? B.heading(b, ctx, page, { cls: 'store-dcard__title' }) : B.renderBlock(b, ctx, page, { tone: 'night', inHero: true }))).join('\n');
    return P.cardShell(inner, { cls: 'store-dcard on-night', tone: 'forest' });
  }).join('');
  return hero + '\n' + P.band({ tone: 'cream', cls: 'store-delivery', inner: P.wrap(cards) });
}

/** revision 3: the store hero loops (image-plan video slots; Higgsfield from the store's own place plate) */
const STORE_LOOP = { 'san-pedro': 'V-HARBOR', 'culver-city': 'V-LAX' };

/** a store section: its blocks in model order (headings, rails, deals, logos) */
function storeSectionBlocks(page, ctx, api, s, night) {
  const { parts: P, blocks: B } = api;
  const tone = night ? 'night' : 'light';
  return s.blocks.map((b) => {
    if (b.type === 'heading') return B.heading(b, ctx, page, { cls: 'store-sec__title' });
    if (b.type === 'card-carousel' && b.variant !== 'mood') return storeCategoryLoop(page, ctx, api, b);
    if (b.type === 'card-carousel') return P.reveal(storeRail(page, ctx, api, b), { cls: 'store-rail-wrap' });
    if (b.type === 'logo-carousel') return P.reveal(storeLogos(page, ctx, api, b), { cls: 'store-logos-wrap' });
    return B.renderBlock(b, ctx, page, { tone });
  }).join('\n');
}

/** "Shop by Category" (category) and "Shop by Mood" (mood) as scroll-snap rails of white cards.
 *  Category images paint at a fixed 112 px height, so each paints at its own width (sizes = that width) and never
 *  wider than its sharp width at DPR 1.5 (6.18.6: 117-169 CSS px; the 175 px flower at 112 px = 1.04 file px per
 *  device px). Mood cards: the source's mood gradient as a 48 px wash at the card top; text stays forest on white. */
const CAT_IMG_H = 112;
function storeRail(page, ctx, api, b) {
  const { parts: P, blocks: B } = api;
  const mood = b.variant === 'mood';
  const items = b.cards.map((c) => {
    let media = '';
    if (c.image && !mood) {
      const im = c.image;
      if (!im.width || !im.height) throw new Error('templates-b: ' + page.path + ': category image without intrinsic size: ' + im.ref);
      const w = Math.round(CAT_IMG_H * im.width / im.height);
      // the img is laid out at height 112 px and width auto (from its width/height attributes), so its box IS the
      // painted image: sizes = w
      media = '<div class="scard__media">' + P.img(ctx, im.ref, { alt: im.alt || '', sizes: w + 'px', cls: 'scard__img', widths: [w, Math.ceil(w * 1.2), Math.ceil(w * 1.5), w * 2, w * 3], attrs: im.alt ? {} : { 'data-decorative': '' } }) + '</div>';
    }
    // SHOP NOW: a small pill without the arrow, so it fits the 148 px card (leaf on category cards, outline on mood)
    const body = c.blocks.map((x) => (x.type === 'buttons'
      ? P.buttonRow(ctx, x.items, { cls: 'scard__btns', each: () => ({ kind: mood ? 'line' : 'leaf', size: 'sm', arrow: false }) })
      : B.renderBlock(x, ctx, page, { tone: 'light' }))).join('\n');
    return '<li class="rail__item">' + P.cardShell((mood ? '<span class="scard__wash" aria-hidden="true"></span>' : '') + media + '<div class="scard__body">' + body + '</div>',
      { cls: P.cx('scard', mood ? 'scard--mood' : 'scard--cat', c.tone && 'mood-' + c.tone) }) + '</li>';
  }).join('');
  return '<div class="' + P.cx('rail', 'store-rail', 'store-rail--' + (mood ? 'mood' : 'cat')) + '"><ul class="rail__track" role="list">' + items + '</ul></div>';
}

/** revision 1 (operator 2026-10-14): "Shop by Category" as floating high-resolution product cut-outs (no card frame) in
 *  an infinite loop. The static HTML holds each card ONCE (labels and SHOP NOW links verbatim, so text and href parity
 *  hold); src/scripts/pages-b.js clones the items (aria-hidden, inert) to make the loop seamless and adds the pause
 *  control. Without JS, or under reduced motion, it is a static scroll row. The images are unbranded generated cut-outs
 *  (A9) except Accessories, the client's real We Roll Up cap. */
const CAT_ART = { flower: 'S-CUT-BUD', 'pre-rolls': 'CAT-PREROLL', edibles: 'CAT-EDIBLES', vapes: 'CAT-VAPE', extract: 'CAT-EXTRACT', cbd: 'CAT-CBD', accessories: 'CUT-CAP' };
const catLabel = (c) => { const h = (c.blocks || []).find((x) => x && x.text && x.type !== 'buttons'); return h ? String(h.text).trim().toLowerCase() : ''; };
function storeCategoryLoop(page, ctx, api, b) {
  const { parts: P, blocks: B } = api;
  const items = b.cards.map((c) => {
    const slot = CAT_ART[catLabel(c)];
    let media = '';
    if (slot) media = P.img(ctx, slot, { alt: '', sizes: '(max-width: 700px) 150px, 230px', cls: 'pcat__img', widths: [160, 240, 320, 400, 520, 640], attrs: { 'data-decorative': '' } });
    else if (c.image) media = P.img(ctx, c.image.ref, { alt: c.image.alt || '', sizes: '160px', cls: 'pcat__img', widths: [160, 240, 320], attrs: c.image.alt ? {} : { 'data-decorative': '' } });
    const body = c.blocks.map((x) => (x.type === 'buttons'
      ? P.buttonRow(ctx, x.items, { cls: 'pcat__btns', each: () => ({ kind: 'leaf', size: 'sm', arrow: false }) })
      : B.renderBlock(x, ctx, page, { tone: 'light' }))).join('\n');
    return '<li class="pcat__item"><div class="pcat__media">' + media + '<span class="pcat__shadow" aria-hidden="true"></span></div><div class="pcat__body">' + body + '</div></li>';
  }).join('');
  return '<div class="pcat" data-pcat><div class="pcat__viewport"><ul class="pcat__track" role="list">' + items + '</ul></div></div>';
}

/** "Our Featured Brands" (revision 1, operator 2026-10-14): the partner logos, unaltered, bigger and floating: no chip,
 *  no border, a soft shadow and a hover lift. The logo box is 128 px (desktop: 7 logos fit one row at 1280); sizes = its
 *  painted width. */
const LOGO_BOX = 128;
function storeLogos(page, ctx, api, b) {
  const { parts: P } = api;
  return '<ul class="logos store-logos store-logos--float" role="list">' + b.logos.map((l) => {
    const im = l.image;
    const w = im.width && im.height ? Math.round(Math.min(LOGO_BOX, LOGO_BOX * im.width / im.height)) : LOGO_BOX;
    return '<li class="logos__item"><a' + P.attrs({ class: 'logos__link', href: P.href(ctx, l.href), rel: l.rel }) + '>'
      + P.img(ctx, im.ref, { alt: im.alt || '', sizes: w + 'px', cls: 'logos__img', widths: [w, Math.ceil(w * 1.2), Math.ceil(w * 1.5), w * 2, w * 3], attrs: im.alt ? {} : { 'data-decorative': '' } }) + '</a></li>';
  }).join('') + '</ul>';
}

/** a body class naming the banner art (plate-g-lax-dusk, plate-s-dusk-palms, ...), so CSS can raise the veil per plate */
function plateClass(page, api) {
  const ref = (page.generated && page.generated.hero) || api.parts.bannerArtFor(page) || 'none';
  return 'plate-' + String(ref).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

/* ================================================================== shop pages and /lax-menu (6.18.5, 6.18.8) */
// A compact banner with the place plate and the h1, then the embed container: full width, white, static, with no
// transform, filter, backdrop-filter, perspective, contain, will-change, opacity < 1, mask or clip-path on it or on any
// ancestor, and no reveal, protrusion or overlay (BUILD-CONTRACT 4.6, R-37). The vendor block is inserted untouched by
// B.embed through the default section. The header and top bar are static (staticChrome). The "You're shopping" strip is
// the shell's subheader region: it sits under the header (the source position), because a region inside <main> would
// nest regions (docs/THEME.md 3), so the order is strip, banner, embed rather than the spec's banner, strip, embed.
function shopPage(page, ctx, api) {
  const kinds = page.sections.map((s) => s.kind);
  if (!kinds.includes('embed')) throw new Error('templates-b: ' + page.path + ' (' + page.kind + ') has no embed section');
  const state = { light: 0, heroDone: false };
  const main = page.sections.map((s, i) => api.defaultSection(page, ctx, s, i, state)).join('\n');
  if (/data-reveal|data-protrude|data-depth|glass-pane/.test(main)) throw new Error('templates-b: ' + page.path + ': a reveal, protrusion, depth plane or glass would sit in the shop main (R-37)');
  return { main, staticChrome: true, bodyClass: 'tpl-shop ' + plateClass(page, api) };
}

/* ================================================================== service area (6.18.11) */
// Banner: the hub S-DUSK-PALMS; the San Pedro group G-HARBOR-HAZE; the 10 other town pages G-LAX-DUSK (the image plan's
// role "hero" slot, page.generated.hero, else the spec map in P.bannerArtFor). Then the reading card with every heading
// and paragraph in order (the template-flexible pages render their rows as reading-card sections). Town pages carry
// T1: the group's postcard crossing the banner's bottom edge on the right (a hard seam), decorative and static.
function serviceAreaPage(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  const town = page.kind === 'service-area-town';
  const state = { light: 0, heroDone: false };
  let banners = 0;
  const main = page.sections.map((s, i) => {
    if (s.kind !== 'page-header') return api.defaultSection(page, ctx, s, i, state);
    banners++;
    const inner = s.blocks.map((b) => (b.type === 'page-header' ? B.pageHeader(b, ctx, page, { size: 'auto', cls: 'sa-banner__banner' }) : B.renderBlock(b, ctx, page, { tone: 'night' }))).join('');
    const sp = isSanPedroGroup(page.path);
    const cut = town && banners === 1
      ? P.protrusion(ctx, { ref: P.REAL[sp ? 'postcardSanPedro' : 'postcardLax'], sizes: '(max-width: 700px) 132px, 220px', cls: 'sa-postcard sa-postcard--' + (sp ? 'sp' : 'lax'), widths: [132, 220, 400, 600] })
      : '';
    return '<section' + P.attrs({ id: s.id, class: P.cx('banner-band', 'on-night', 'sa-banner', cut && 'sa-banner--cut', cut && 'sa-banner--' + (sp ? 'sp' : 'lax')) }) + '>' + inner + cut + '</section>';
  }).join('\n');
  if (banners !== 1) throw new Error('templates-b: ' + page.path + ': expected one page header, found ' + banners);
  return { main, bodyClass: P.cx('tpl-sa', town ? 'tpl-sa--town' : 'tpl-sa--hub', town && (isSanPedroGroup(page.path) ? 'tpl-sa--sp' : 'tpl-sa--lax'), plateClass(page, api)) };
}
