// templates-a.mjs - TEMPLATES-A (WF3b phase 2; BUILD-CONTRACT 5.1). Owner: TEMPLATES-A.
// Kinds: page (/about-us, /about-us/daily-deals), products-hub, product-category (the 6 categories; /products/flower is
// its own composition), education, legal, contact, delivery, archive-author, archive-taxonomy, review, and the 404.
// Spec: DESIGN-SPEC 6.16 (banner), 6.17 (category pages, the flower page: D-14 inline "Hits Different" items, D-20
// deeper veil, F1 / F2), 6.18 (the other templates: T2 pre-rolls, T3 delivery), 6.19 (the reading card), 5.3-5.4
// (protrusion rules and counts), 7 (reveals on wrappers, hover on the card inside: D-12).
// Contract (docs/THEME.md): render(page, ctx, api) returns { main, bodyClass }; render404(ctx, api) the same.
// Parity (docs/THEME.md 3, PIPELINE-CONTENT 8), kept by construction:
//   - every block of every section is rendered exactly once, in model order (the section splits below only cut a block
//     list into consecutive runs, never reorder it);
//   - no visible word is added: the only markup added around model text is <strong> (D-14), <span> (the 300/800
//     statement split) and wrappers; images added here are decorative (alt="" + data-decorative, aria-hidden wrappers);
//   - no href is added; model buttons keep their hooks through P.button (kind is the only override).
// Pure: no clock, no randomness (the build is byte-stable).

/* ------------------------------------------------------------------ small helpers */
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean);
const isHeading = (b) => b && b.type === 'heading';
const hasTags = (html) => /<[a-z!/]/i.test(String(html || ''));

/** cut a block list into units: each heading starts a unit; blocks before the first heading form a unit with no head */
function units(blocks) {
  const out = [];
  let cur = null;
  for (const b of blocks) {
    if (isHeading(b)) { cur = { head: b, body: [] }; out.push(cur); continue; }
    if (!cur) { cur = { head: null, body: [] }; out.push(cur); }
    cur.body.push(b);
  }
  return out;
}
const unitBlocks = (u) => (u.head ? [u.head] : []).concat(u.body);
/** a first-screen image from a primitive that renders loading="lazy": load it eagerly (R-41) */
const eager = (html) => String(html).replace(' loading="lazy"', ' loading="eager"');

/** a statement heading set as B's 300/800 weight contrast (D-24): the first half of its words light, the rest heavy.
 *  Only for headings whose html is plain text (no inline tags), so the words stay byte-identical. */
function splitStatementHtml(b) {
  if (hasTags(b.html)) return b.html;
  const w = words(b.html);
  if (w.length < 2) return b.html;
  const k = Math.floor(w.length / 2);
  return '<span class="ta-split__a">' + w.slice(0, k).join(' ') + '</span> <span class="ta-split__b">' + w.slice(k).join(' ') + '</span>';
}

/** D-14: a "Label – text" item as ONE paragraph: the label bold, then " – ", then the text (no orphan dash). The words
 *  are untouched: only <strong> wraps the label. Items without the " – " separator stay as they are. */
function inlineLabelHtml(html) {
  const s = String(html || '');
  const i = s.indexOf(' – ');
  if (i <= 0 || hasTags(s.slice(0, i))) return s;
  return '<strong class="ta-hcard__t">' + s.slice(0, i) + '</strong>' + s.slice(i);
}

/* ------------------------------------------------------------------ shared section renderers */
/** the 6.16 banner band (the page's single h1). o: size, veil, art, after (protrusion), cut (true when a protrusion
 *  crosses its bottom seam: the band then paints above the next band), loop (an atmosphere loop inside the art) */
function bannerBand(page, ctx, api, s, o = {}) {
  const { parts: P, blocks: B } = api;
  const after = (o.loop || '') + (o.after || '');
  const inner = s.blocks.map((b) => (b.type === 'page-header'
    ? B.pageHeader(b, ctx, page, { size: o.size || 'auto', veil: o.veil || 'default', art: o.art, after, cls: o.cls || null })
    : B.renderBlock(b, ctx, page, { tone: 'night' }))).join('');
  return '<section' + P.attrs({ id: s.id, class: P.cx('banner-band on-night ta-banner', o.cut && 'ta-banner--cut', o.bandCls) }) + '>' + inner + '</section>';
}

/** blocks inside a reading card (6.19): headings keep their level; buttons become leaf pills (6.17, 6.18.4); a list whose
 *  items all open with a bold label is the strain callout (6.19); headings named in o.thumbs get a decorative
 *  thumbnail (6.18.9); o.callout styles the last heading as the leaf-100 chip-callout (6.18.1, /about-us) */
function readingBlocks(page, ctx, api, blocks, o = {}) {
  const { blocks: B } = api;
  const lastHead = o.callout ? [...blocks].reverse().find(isHeading) : null;
  return blocks.map((b) => {
    if (b.type === 'buttons') return B.buttons(b, ctx, page, { kind: 'leaf', cls: 'ta-cta-row' });
    if (b.type === 'list' && b.items.length && b.items.every((it) => /^<strong>/.test(it.html))) return B.list(b, ctx, page, { cls: 'ta-strains' });
    if (isHeading(b) && b === lastHead && b.level) return B.heading(b, ctx, page, { cls: 'ta-callout' });
    if (isHeading(b) && o.thumbs) {
      const t = o.thumbs(b);
      if (t) return '<div class="ta-cathead">' + t + B.heading(b, ctx, page) + '</div>';
    }
    return B.renderBlock(b, ctx, page, { tone: 'light', inReading: true });
  }).join('\n');
}

/** a calm band holding one reading card (6.19) */
function readingBand(page, ctx, api, s, o = {}) {
  const { parts: P } = api;
  const card = P.readingCard(readingBlocks(page, ctx, api, o.blocks || s.blocks, o), { cls: 'ta-rcard' });
  return P.band({ tone: o.tone || 'haze', id: o.id || s.id, cls: P.cx('band--reading ta-read', o.cls), inner: P.wrap(P.reveal(card), 'narrow', 'ta-read__wrap') });
}

/** the products hub: each category heading may carry its mega-card image as an 88 px decorative thumbnail (6.18.9) */
const CAT_OF_HEADING = [[/^Flower\b/, 'flower'], [/^Pre-Rolls\b/, 'prerolls'], [/^Vaporizers\b/, 'vape'], [/^Edibles\b/, 'edibles'], [/^Concentrates\b/, 'concentrates'], [/^Topicals\b/, 'topicals']];
function hubThumbs(ctx, api) {
  const { parts: P, chrome: C } = api;
  const art = (C && C.CARD_ART) || {};
  return (b) => {
    if (!/:/.test(b.text || '')) return null;
    const hit = CAT_OF_HEADING.find(([re]) => re.test(b.text));
    const ref = hit && art[hit[1]];
    if (!ref || P.isDenied(ref) || !P.slotReady(ctx, ref)) return null;
    // a cover crop in an 88 px square paints the image at 88 x max(1, w/h) CSS px: sizes says so (R-41)
    const probe = P.decorative(ctx, ref, { sizes: '88px', cls: 'ta-cathead__img', widths: [160, 320, 480, 640] });
    const m = / width="(\d+)" height="(\d+)"/.exec(probe);
    const painted = m ? Math.round(88 * Math.max(1, Number(m[1]) / Number(m[2]))) : 88;
    return '<span class="ta-cathead__media" aria-hidden="true">' + P.decorative(ctx, ref, { sizes: painted + 'px', cls: 'ta-cathead__img', widths: [160, 320, 480, 640] }) + '</span>';
  };
}

/* ------------------------------------------------------------------ the kinds */
/** standard pages: /about-us (banner + reading card with the chip-callout), /about-us/daily-deals (banner + deal cards) */
function renderPageKind(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  return page.sections.map((s) => {
    if (s.kind === 'page-header') return bannerBand(page, ctx, api, s);
    if (s.kind === 'deals') return P.band({ tone: 'haze', id: s.id, cls: 'ta-deals', inner: P.wrap(B.renderBlocks(s.blocks, ctx, page, { tone: 'light' })) });
    if (s.kind === 'content') return readingBand(page, ctx, api, s, { callout: page.path === '/about-us/' });
    return api.defaultSection(page, ctx, s, 0, { light: 0, heroDone: true });
  }).join('\n');
}

/** legal, education, products hub: banner + one reading card per content section */
function renderReadingKind(page, ctx, api) {
  const thumbs = page.kind === 'products-hub' ? hubThumbs(ctx, api) : null;
  return page.sections.map((s) => {
    if (s.kind === 'page-header') return bannerBand(page, ctx, api, s);
    if (s.kind === 'content') return readingBand(page, ctx, api, s, { thumbs });
    return api.defaultSection(page, ctx, s, 0, { light: 0, heroDone: true });
  }).join('\n');
}

/** the six category pages (not flower): banner (short or long title), the intro on white, the remaining units as white
 *  cards on haze, the closing CTA unit on a night band with a leaf pill. /products/pre-rolls carries T2 (5.4). */
function renderCategory(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  const preRolls = page.path === '/products/pre-rolls/';
  const t2 = preRolls && P.slotReady(ctx, 'CUT-LIGHTER')
    ? eager(P.protrusion(ctx, { ref: 'CUT-LIGHTER', sizes: '(max-width: 700px) 92px, clamp(160px, 14vw, 200px)', cls: 'ta-t2', widths: [160, 320, 480] }))
    : '';
  return page.sections.map((s) => {
    if (s.kind === 'page-header') return bannerBand(page, ctx, api, s, { after: t2, cut: !!t2 });
    if (s.kind !== 'content') return api.defaultSection(page, ctx, s, 0, { light: 0, heroDone: true });
    const us = units(s.blocks);
    // the intro: the leading head-less unit (if any) plus the first unit with a heading
    let i = 0;
    const intro = [];
    while (i < us.length) { intro.push(us[i]); i++; if (intro[intro.length - 1].head) break; }
    // the closing CTA: the last unit when it holds the buttons
    const last = us.length - 1;
    const cta = last >= i && us[last].body.some((b) => b.type === 'buttons') ? us[last] : null;
    const mid = us.slice(i, cta ? last : us.length);
    const introHtml = intro.map((u) => (u.head ? B.heading(u.head, ctx, page, { cls: 'ta-statement' }) : '') + B.renderBlocks(u.body, ctx, page, { tone: 'light', cls: undefined })).join('\n');
    let out = P.band({ tone: 'white', id: s.id, cls: P.cx('ta-intro', t2 && 'ta-intro--cut ta-intro--t2'), inner: P.wrap(P.reveal('<div class="ta-intro__copy">' + introHtml + '</div>')) });
    if (mid.length) {
      const cards = mid.map((u, k) => P.reveal(P.cardShell((u.head ? B.heading(u.head, ctx, page, { cls: 'ta-fcard__t' }) : '') + B.renderBlocks(u.body, ctx, page, { tone: 'light', kind: 'leaf' }), { cls: 'ta-fcard' }), { tag: 'li', step: k % 4 })).join('');
      out += '\n' + P.band({ tone: 'haze', id: s.id + '-more', cls: 'ta-feature', inner: P.wrap('<ul class="ta-fcards' + (mid.length === 1 ? ' ta-fcards--one' : '') + '" role="list">' + cards + '</ul>') });
    }
    if (cta) {
      const ctaHtml = (cta.head ? B.heading(cta.head, ctx, page, { cls: 'ta-cta__t' }) : '') + cta.body.map((b) => (b.type === 'buttons' ? B.buttons(b, ctx, page, { kind: 'leaf', cls: 'ta-cta-row' }) : B.renderBlock(b, ctx, page, { tone: 'night' }))).join('\n');
      out += '\n' + P.band({ tone: 'night', atmosphere: true, id: s.id + '-cta', cls: 'ta-cta', inner: P.wrap(P.reveal('<div class="ta-cta__in">' + ctaHtml + '</div>')) });
    }
    return out;
  }).join('\n');
}

/** /products/flower (6.17): banner with the deeper veil (D-20) and F1; the intro on white; "Our Flower / Hits
 *  Different" on a night band with the mist loop and five one-paragraph cards (D-14); F2 across that band's bottom seam;
 *  "Find the Flower…" on white with a leaf pill; the mason-jars editorial band; the long-form reading card overlapping
 *  the band's bottom edge (B) */
function renderFlower(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  // F1 sits in the first screen: eager, not lazy (R-41). P.protrusion has no loading option yet (requested), so its
  // output is switched here; the markup is otherwise the primitive's own
  const f1 = P.slotReady(ctx, 'S-CUT-BUD') ? eager(P.protrusion(ctx, { ref: 'S-CUT-BUD', sizes: '(max-width: 700px) 104px, clamp(200px, 19vw, 280px)', cls: 'ta-f1', widths: [160, 240, 320, 480, 640] })) : '';
  // revision 4: V-TRICHOME plays as the banner's own loop (P.banner, BANNER_LOOP), so no separate loop is passed here
  const out = [];
  let longDone = false;
  for (const s of page.sections) {
    if (s.kind === 'page-header') { out.push(bannerBand(page, ctx, api, s, { veil: 'deep', after: f1, cut: !!f1, bandCls: 'ta-banner--flower' })); continue; }
    if (s.kind !== 'content') { out.push(api.defaultSection(page, ctx, s, 0, { light: 0, heroDone: true })); continue; }
    const li = s.blocks.findIndex((b) => b.type === 'list');
    if (!longDone && li > 0 && isHeading(s.blocks[li - 1]) && s.blocks.slice(0, li - 1).some(isHeading)) {
      // the composed section: intro | hits | find, cut from the one model section in order
      const intro = s.blocks.slice(0, li - 1);
      const hitsHead = s.blocks[li - 1];
      const list = s.blocks[li];
      const find = s.blocks.slice(li + 1);
      // intro: a heading directly followed by another heading is the eyebrow (as authored, uppercased by CSS)
      const introHtml = intro.map((b, k) => {
        if (isHeading(b) && isHeading(intro[k + 1])) return B.heading(b, ctx, page, { cls: 'ta-eyebrow' });
        if (isHeading(b)) return B.heading(b, ctx, page, { cls: 'ta-statement' });
        return B.renderBlock(b, ctx, page, { tone: 'light' });
      }).join('\n');
      out.push(P.band({ tone: 'white', id: s.id, cls: P.cx('ta-intro ta-intro--flower', f1 && 'ta-intro--cut'), inner: P.wrap(P.reveal('<div class="ta-intro__copy">' + introHtml + '</div>')) }));
      // hits: night band, the mist loop (or its still) as a masked atmosphere, five opaque cards, F2 across the seam
      const mist = P.loop(ctx, 'V-MIST', { cls: 'ta-mist' }) || (P.slotReady(ctx, 'S-MIST-BAND') ? '<div class="ta-mist ta-mist--still" aria-hidden="true">' + P.decorative(ctx, 'S-MIST-BAND', { sizes: '100vw', cls: 'ta-mist__img' }) + '</div>' : '');
      const title = B.heading({ ...hitsHead, html: splitStatementHtml(hitsHead) }, ctx, page, { cls: 'ta-hits__title' });
      const cards = list.items.map((it, k) => P.reveal('<div class="ta-hcard"><p>' + inlineLabelHtml(it.html) + '</p>' + (it.children ? it.children.map((c) => B.list(c, ctx, page)).join('') : '') + '</div>', { tag: 'li', cls: 'ta-hits__item', step: k % 4 })).join('');
      const f2 = P.protrusion(ctx, { ref: P.REAL.grinders, sizes: '(max-width: 700px) 260px, clamp(280px, calc(31vw - 20px), 430px)', cls: 'ta-f2', widths: [480, 640, 960, 1280] });
      // the glow ground moves with the band's --p (5.1): it sits in its own clipped layer, so the offset never spills
      // past the band's edges (the band itself cannot clip: F2 crosses its bottom seam)
      const ground = '<div class="ta-hits__atmos" aria-hidden="true"><div class="band__ground" data-plane="atmos"></div></div>';
      out.push(P.band({ tone: 'night', depth: true, id: s.id + '-hits', cls: 'ta-hits', inner: ground + mist + P.wrap(P.reveal(title) + '<ul class="ta-hits__list" role="list">' + cards + '</ul>') + f2 }));
      // find: white band, the h3 statement, the paragraph, the leaf pill (verbatim label and href)
      const findHtml = find.map((b) => (b.type === 'buttons' ? B.buttons(b, ctx, page, { kind: 'leaf', cls: 'ta-cta-row' }) : isHeading(b) ? B.heading(b, ctx, page, { cls: 'ta-statement ta-statement--m' }) : B.renderBlock(b, ctx, page, { tone: 'light' }))).join('\n');
      out.push(P.band({ tone: 'white', id: s.id + '-find', cls: 'ta-find', inner: P.wrap(P.reveal('<div class="ta-find__copy">' + findHtml + '</div>')) }));
      longDone = true;
      continue;
    }
    // the long form: the mason-jars editorial band (real, decorative), then the reading card overlapping its bottom edge
    const jars = '<div class="ta-editorial" aria-hidden="true">' + P.decorative(ctx, P.REAL.masonJars, { sizes: 'max(100vw, 450px)', cls: 'ta-editorial__img', widths: [640, 960, 1280, 1600, 1920] }) + '</div>';
    out.push(jars + '\n' + readingBand(page, ctx, api, s, { tone: 'cream', cls: 'ta-read--lift' }));
  }
  return out.join('\n');
}

/** /contact (6.18.1): banner; the two store cards (name, address, Get Directions, Hours, the map as the source places
 *  it); "Contact Us Online" with the form (A12) in a white card */
function renderContact(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  return page.sections.map((s) => {
    if (s.kind === 'page-header') return bannerBand(page, ctx, api, s);
    if (s.kind === 'card-grid') {
      return P.band({ tone: 'haze', id: s.id, cls: 'ta-stores', inner: P.wrap(s.blocks.map((g) => {
        if (g.type !== 'card-grid') return B.renderBlock(g, ctx, page, { tone: 'light' });
        const intro = g.intro && g.intro.length ? '<div class="cgrid__intro">' + B.renderBlocks(g.intro, ctx, page, { tone: 'light' }) + '</div>' : '';
        const cards = g.cards.map((c, k) => {
          const name = c.blocks.find(isHeading);
          const wash = name && /san pedro/i.test(name.text) ? 'mint' : 'peach';
          const body = c.blocks.map((b) => {
            if (b === name) return B.heading(b, ctx, page, { cls: 'ta-store__name' });
            if (isHeading(b)) return B.heading(b, ctx, page, { cls: 'ta-store__label' });
            if (b.type === 'buttons') return B.buttons(b, ctx, page, { kind: 'line', size: 'sm', cls: 'ta-store__btns' });
            return B.renderBlock(b, ctx, page, { tone: 'light' });
          }).join('\n');
          return P.reveal('<div class="ta-store ta-store--' + wash + '">' + body + '</div>', { tag: 'li', step: k });
        }).join('');
        const outro = g.outro && g.outro.length ? '<div class="cgrid__outro">' + B.renderBlocks(g.outro, ctx, page, { tone: 'light' }) + '</div>' : '';
        return intro + '<ul class="ta-stores__list" role="list">' + cards + '</ul>' + outro;
      }).join('')) });
    }
    if (s.kind === 'content' && s.blocks.some((b) => b.type === 'form')) {
      const fi = s.blocks.findIndex((b) => b.type === 'form');
      const lead = s.blocks.slice(0, fi);
      const rest = s.blocks.slice(fi);
      const leadHtml = lead.map((b) => (isHeading(b) ? B.heading(b, ctx, page, { cls: 'ta-statement ta-statement--m' }) : B.renderBlock(b, ctx, page, { tone: 'light' }))).join('\n');
      const formHtml = B.renderBlocks(rest, ctx, page, { tone: 'light' });
      return P.band({ tone: 'white', id: s.id, cls: 'ta-form', inner: P.wrap('<div class="ta-form__grid">' + P.reveal('<div class="ta-form__lead">' + leadHtml + '</div>') + P.reveal('<div class="ta-form__card">' + formHtml + '</div>', { step: 1 }) + '</div>') });
    }
    return readingBand(page, ctx, api, s);
  }).join('\n');
}

/** /weed-delivery (6.18.12): banner; the split with the storefront-car-rear light box and T3 (the cap) beside the
 *  statement and Order Now (the chooser); the three step cards on a night band; the five accordions on haze */
function renderDelivery(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  let t3Done = false;
  return page.sections.map((s) => {
    if (s.kind === 'page-header') return bannerBand(page, ctx, api, s);
    if (s.kind === 'split') {
      const inner = s.blocks.map((b) => {
        if (b.type !== 'split') return B.renderBlock(b, ctx, page, { tone: 'light' });
        const cut = !t3Done && P.slotReady(ctx, 'CUT-CAP') ? { ref: 'CUT-CAP', sizes: '(max-width: 700px) 132px, clamp(180px, 17vw, 240px)', cls: 'ta-t3', widths: [160, 240, 320, 480, 640] } : null;
        t3Done = t3Done || !!cut;
        const box = b.image ? P.lightBox(ctx, { ref: b.image.ref, alt: b.image.alt || b.imageLabel || '', sizes: '(max-width: 520px) calc(100vw - 96px), (max-width: 860px) 392px, (max-width: 1239px) calc(41vw - 30px), 472px', tone: 'light', cls: 'split__box ta-split__box', widths: [480, 640, 960, 1200], cut, loading: 'eager' }) : '';
        const copy = b.blocks.map((x) => (x.type === 'buttons' ? B.buttons(x, ctx, page, { kind: 'leaf', cls: 'ta-cta-row' }) : isHeading(x) ? B.heading(x, ctx, page, { cls: 'ta-statement ta-statement--m' }) : B.renderBlock(x, ctx, page, { tone: 'light' }))).join('\n');
        return '<div class="' + P.cx('split', 'split--img-' + (b.imageSide === 'right' ? 'right' : 'left'), 'ta-split') + '">'
          + P.reveal(box, { cls: 'split__media' }) + P.reveal('<div class="split__body">' + copy + '</div>', { cls: 'split__copy', step: 1 }) + '</div>';
      }).join('');
      return P.band({ tone: 'cream', id: s.id, cls: 'ta-split-band', inner: P.wrap(inner) });
    }
    if (s.kind === 'card-grid') {
      const inner = s.blocks.map((g) => {
        if (g.type !== 'card-grid') return B.renderBlock(g, ctx, page, { tone: 'night' });
        const intro = g.intro && g.intro.length ? '<div class="ta-steps__intro">' + g.intro.map((b) => (isHeading(b) ? P.reveal(B.heading(b, ctx, page, { cls: 'ta-statement' })) : B.renderBlock(b, ctx, page, { tone: 'night' }))).join('') + '</div>' : '';
        const cards = g.cards.map((c, k) => P.reveal(P.cardShell(c.blocks.map((b) => (isHeading(b) ? B.heading(b, ctx, page, { cls: 'ta-step__t' }) : B.renderBlock(b, ctx, page, { tone: 'light' }))).join('\n'), { cls: 'ta-step' }), { tag: 'li', step: k % 4 })).join('');
        const outro = g.outro && g.outro.length ? '<div class="ta-steps__outro">' + B.renderBlocks(g.outro, ctx, page, { tone: 'night' }) + '</div>' : '';
        return intro + '<ul class="ta-steps__list" role="list">' + cards + '</ul>' + outro;
      }).join('');
      return P.band({ tone: 'night', atmosphere: true, id: s.id, cls: 'ta-steps', inner: P.wrap(inner) });
    }
    if (s.kind === 'accordion') return P.band({ tone: 'haze', id: s.id, cls: 'band--acc ta-acc', inner: P.wrap(P.reveal(B.renderBlocks(s.blocks, ctx, page, { tone: 'light' })), 'narrow', 'ta-acc__wrap') });
    if (s.kind === 'content') return readingBand(page, ctx, api, s);
    return api.defaultSection(page, ctx, s, 0, { light: 0, heroDone: true });
  }).join('\n');
}

/** the archive post cards sit in the first screen (eager, R-41); on phones the card is a row with a 132 px square
 *  thumbnail, so the 600 px postcard paints at 132 x 600/531 = 149 CSS px (1.34 file px per device px at DPR 3, R-2).
 *  B.postList fixes loading and sizes, so its output is adjusted here (a variant is requested from FOUNDATION). */
const postsFor = (html) => eager(String(html)).split('sizes="(min-width: 768px) 280px, 92vw"').join('sizes="(min-width: 768px) 280px, 149px"');

/** archives (6.18.3): banner, then the notice and the search form, or the post list, on one calm band */
function renderArchive(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  const out = [];
  let calm = null; // consecutive non-banner sections share one band (their ids stay on inner wrappers)
  const flush = () => { if (calm) { out.push(P.band({ tone: 'haze', id: calm.id, cls: 'ta-archive', inner: P.wrap(calm.html.join('\n'), calm.narrow ? 'narrow' : 'wide') })); calm = null; } };
  for (const s of page.sections) {
    if (s.kind === 'page-header') { flush(); out.push(bannerBand(page, ctx, api, s)); continue; }
    const html = s.blocks.map((b) => {
      if (b.type === 'notice') return P.reveal(B.notice(b, ctx, page, { cls: 'ta-notice' }));
      if (b.type === 'search-form') return P.reveal('<div class="ta-search">' + B.searchForm(b, ctx, page) + '</div>', { step: 1 });
      if (b.type === 'post-list') return postsFor(B.postList(b, ctx, page, { cls: 'ta-posts' }));
      return B.renderBlock(b, ctx, page, { tone: 'light' });
    }).join('\n');
    const narrow = s.blocks.every((b) => b.type === 'notice' || b.type === 'search-form');
    if (!calm) calm = { id: s.id, html: [], narrow };
    else calm.narrow = calm.narrow && narrow;
    calm.html.push(calm.html.length ? '<div id="' + s.id + '" class="ta-archive__part">' + html + '</div>' : html);
  }
  flush();
  return out.join('\n');
}

/** review singles (6.18.10): the compact banner with the reviewer's name; the reviews block and the footer follow
 *  (chrome) */
function renderReview(page, ctx, api) {
  return page.sections.map((s) => (s.kind === 'page-header'
    ? bannerBand(page, ctx, api, s, { size: 'compact', bandCls: 'ta-banner--review' })
    : readingBand(page, ctx, api, s))).join('\n');
}

const BY_KIND = {
  page: renderPageKind, legal: renderReadingKind, education: renderReadingKind, 'products-hub': renderReadingKind,
  'product-category': (page, ctx, api) => (page.path === '/products/flower/' ? renderFlower(page, ctx, api) : renderCategory(page, ctx, api)),
  contact: renderContact, delivery: renderDelivery, 'archive-author': renderArchive, 'archive-taxonomy': renderArchive, review: renderReview,
};

export function render(page, ctx, api) {
  const fn = BY_KIND[page.kind];
  if (!fn) return null;
  const slug = page.path === '/' ? 'index' : page.path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return { main: fn(page, ctx, api), bodyClass: 'ta ta-' + page.kind + ' ta-p-' + slug };
}

/** the 404 (6.18.14): the compact banner (S-MIST) with "Page not found" and the buttons Home (the Quick Links label) and
 *  Order Now (js-selected-location-menu, the header's data-* values); under /location/san-pedro/shop/menu/ the Jane
 *  boot (index.mjs puts ctx.notFound.bootScript in <head>) shows the mount in the 6.18.8 container instead */
export function render404(ctx, api) {
  const { parts: P } = api;
  const nf = ctx.notFound;
  const home = (ctx.footer.quickLinks || []).find((q) => q.href === '/') || { label: 'Home', href: '/' };
  const on = ctx.header.orderNow;
  const btns = '<div class="btn-row banner__btns ta-404__btns">'
    + P.pill(ctx, { label: P.esc(home.label), href: home.href, kind: 'ghost' })
    + P.pill(ctx, { label: P.esc(on.label), href: on.href, kind: 'leaf', arrow: true, cls: 'active-location-menu js-selected-location-menu', attrs: { 'data-lax-url': on.laxUrl, 'data-sanpedro-url': on.sanpedroUrl } })
    + '</div>';
  const main = '<section class="banner-band on-night ta-banner ta-banner--404 not-found">'
    + P.banner(ctx, api.PAGE_404, { headingHtml: '<h1 class="hd banner__title">Page not found</h1>', headingText: 'Page not found', art: P.slotReady(ctx, 'S-ROSIN-BANNER') ? 'S-ROSIN-BANNER' : (P.slotReady(ctx, 'S-MIST') ? 'S-MIST' : null), size: 'compact', body: btns }) // revision 6: the rosin
    + '</section>\n'
    + '<section class="embed-band jane-fallback"><div class="embed embed--jane">' + nf.janeBody + '</div></section>';
  return { main, bodyClass: 'ta ta-404' };
}
