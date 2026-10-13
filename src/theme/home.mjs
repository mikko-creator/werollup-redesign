// home.mjs - HOME lane (WF3b phase 2; BUILD-CONTRACT 5.1). The home page: DESIGN-SPEC 6.9-6.15 and 5.4 (H1-H4), with
// deltas D-1 to D-5, D-14, D-21, D-24, D-25. Contract: docs/THEME.md section 2: render(page, ctx, api) returns
// { main, promo, bodyClass, headExtra }.
// Parity (docs/THEME.md 3; docs/PIPELINE-CONTENT.md 8): every block of every section renders in model order, every model
// href exactly once, and no visible word is added. The statement splits (D-24) only wrap the model's own words in spans.
// Band map (6.10), in source order:
//   1 hero, night, atmospheric        s1 tile 1: the storefront light box (D-1) and the G1 glass pane; h1 split (D-24)
//   2 Delivery + stores, calm light   s1 tile 2 as the 6.11 Delivery card, s2 as the store cards; postcards H1 / H2
//   3 Serve, night, atmospheric       s3: S-MIST through V-MIST; light box with the cap cut-out H3; forest copy card
//   4 accordions, calm haze           s4 (D-3)
//   5 Community, dusk, atmospheric    s5: S-DUSK-PALMS through V-DUSK; pale light box with the lighter cut-out H4 (D-5)
//   6 ZIP, night, calm                s6: the storefront-rear light box and the forest ZIP card (6.14)
// The promo strip renders after </main> (promo 'after-main'): a parity region may not sit inside main (docs/THEME.md 3).
// A loop slot that is declared but not generated renders its still (P.loop returns ''), so the build never breaks.

const STRICT = process.env.THEME_STRICT === '1';
const EXPECT = 'hero-tile,location-cards,split,accordion,split,split';

/** null when the home model has the shape this module draws, else the reason (the module then fails closed) */
function shapeError(page) {
  const s = page.sections || [];
  const kinds = s.map((x) => x.kind).join(',');
  if (kinds !== EXPECT) return 'section kinds ' + kinds;
  if (s[0].blocks.length !== 2 || s[0].blocks.some((b) => b.type !== 'hero-tile')) return 's1 is not two hero tiles';
  if (!s[0].blocks[0].blocks.some((b) => b.type === 'heading' && b.level === 1)) return 's1 tile 1 holds no h1';
  for (const i of [1, 2, 3, 4, 5]) if (s[i].blocks.length !== 1) return 'section ' + s[i].id + ' holds ' + s[i].blocks.length + ' blocks';
  if (s[1].blocks[0].type !== 'location-cards' || s[1].blocks[0].cards.length !== 2) return 's2 is not two location cards';
  for (const i of [2, 4, 5]) if (s[i].blocks[0].type !== 'split' || !s[i].blocks[0].image) return 'section ' + s[i].id + ' is not a split with an image';
  if (s[3].blocks[0].type !== 'accordion') return 's4 is not an accordion';
  if (!s[5].blocks[0].blocks.some((b) => b.type === 'zip-finder')) return 's6 holds no zip finder';
  return null;
}

/* ------------------------------------------------------------------ statements (D-24): the model's words, wrapped */
const plain = (html) => typeof html === 'string' && !/[<>]/.test(html);
/** the first n words light (300), the rest heavy (800); glow: the first heavy word in the leaf glow (hero h1 only) */
function weightSplit(html, n, glow = false) {
  if (!plain(html)) return html;
  const w = html.trim().split(/\s+/);
  if (w.length <= n) return html;
  const heavy = w.slice(n);
  const h = glow ? '<span class="hm-glow">' + heavy[0] + '</span>' + (heavy.length > 1 ? ' ' + heavy.slice(1).join(' ') : '') : heavy.join(' ');
  return '<span class="hm-w300">' + w.slice(0, n).join(' ') + '</span> <span class="hm-w800">' + h + '</span>';
}
/** one leaf-ink word: the last word of the statement */
function inkLast(html) {
  if (!plain(html)) return html;
  const w = html.trim().split(/\s+/);
  if (w.length < 2) return html;
  return w.slice(0, -1).join(' ') + ' <span class="hm-ink">' + w[w.length - 1] + '</span>';
}

/* ------------------------------------------------------------------ painted sizes (R-1, R-2, R-16, R-41) */
// hero storefront (R-1, R-41): sizes = the painted width. At 1024 px and up the box runs from 40 % of the wrap to the window
// edge: 50vw + 120px once the wrap is 1200 px (1327 px and up), else 59.2vw - 2px (gutter 4.2vw, 15 px scrollbar);
// measured 756 / 920 / 604 / 803 CSS px at 1280 / 1600 / 1024 / 1366. On phones the band is clamp(380px, 102vw, 400px)
// tall and the 4:3 photo is painted at 1.334 x that height. The variant set skips 1280, so the exact sizes still picks
// the 1600 file at both desktop windows (1.41 / 1.45, R-1 asks 1.3).
// A tall window (1024x768) makes the crop height-bound: the box is 0.84 x (100vh - 112px) + 48 px tall, painted x 1.334,
// so each desktop branch takes the larger of the two widths.
const HERO_SIZES = '(min-width: 1327px) max(calc(50vw + 120px), calc(112vh - 62px)), (min-width: 1024px) max(calc(59.2vw - 2px), calc(112vh - 62px)), (min-width: 701px) 100vw, clamp(507px, 136vw, 534px)';
const HERO_WIDTHS = [640, 960, 1600, 1920];
// split light boxes: the photo is the box minus its 14 px mount (measured: 455 / 466 / 348 / 294 CSS px at 1280 / 1600 / 1024 / 390)
const SPLIT_SIZES = '(min-width: 1240px) 466px, (min-width: 1024px) 35vw, (min-width: 861px) 34vw, (min-width: 701px) 392px, calc(100vw - 96px)';
const POST_SIZES = '(max-width: 700px) 190px, (max-width: 1162px) 186px, (max-width: 1387px) 16vw, 222px';
const CAP_SIZES = '(max-width: 700px) 150px, (min-width: 1400px) 260px, 240px';
// the lighter is painted at its photo twin's scale: 0.4358 x the photo width (198 / 203 / 152 / 128 CSS px at 1280 / 1600 / 1024 / 390)
const LIGHTER_SIZES = '(max-width: 700px) calc(43.6vw - 42px), (max-width: 860px) 171px, (max-width: 1239px) 15vw, 203px';

export function render(page, ctx, api) {
  const why = shapeError(page);
  if (why) {
    if (STRICT) throw new Error('home.mjs: unexpected home model (' + why + ')');
    console.log('HOME: unexpected home model (' + why + '): default renderer used');
    return null;
  }
  const { parts: P, blocks: B } = api;
  const [s1, s2, s3, s4, s5, s6] = page.sections;
  const R = (b, o) => B.renderBlock(b, ctx, page, o);

  /* 1. hero (6.9; D-1, D-2, D-4): one visual (the storefront light box) and one pane, nothing else */
  const t1 = s1.blocks[0];
  const heroBody = t1.blocks.map((b) => (b.type === 'heading' && b.level === 1
    ? '<h1 class="hd hd--h-ultra hm-hero__title" id="hm-hero-title">' + weightSplit(b.html, 2, true) + '</h1>'
    : R(b, { tone: 'night', inHero: true }))).join('\n');
  const heroBox = P.lightBox(ctx, { ref: t1.image.ref, sizes: HERO_SIZES, loading: 'eager', fetchpriority: 'high', plates: 1, tone: 'night', cls: 'htile__box hm-hero__box', widths: HERO_WIDTHS });
  // D-2: on phones the mist plate lies under the lower half of the pane (CSS hides it from 701 px; lazy, so a hidden copy is never fetched)
  const heroMist = '<div class="hm-hero__mist" aria-hidden="true">' + P.decorative(ctx, 'assets/generated/s-mist-phone.jpg', { sizes: '100vw', loading: 'lazy', cls: 'hm-hero__mist-img', widths: [640, 960, 1170] }) + '</div>';
  const hero = P.band({ tone: 'night', atmosphere: true, id: s1.id, cls: 'hero-band hm-hero', depth: true, labelledby: 'hm-hero-title',
    inner: heroMist + P.wrap('<div class="htile htile--first hm-hero__tile">' + heroBox + '<div class="htile__pane glass-pane hm-hero__pane" data-qa="hero-copy">' + heroBody + '</div></div>', 'wide', 'hero-band__in') });

  /* 2. the Delivery card (6.11, from s1 tile 2) and the two store cards (s2) with the postcards crossing their tops (H1, H2) */
  const t2 = s1.blocks[1];
  const dBody = t2.blocks.map((b) => {
    if (b.type === 'heading') return B.heading(b, ctx, page, { cls: 'hm-dcard__title' });
    if (b.type === 'buttons') return B.buttons(b, ctx, page, { kind: 'leaf' });
    return R(b, { tone: 'night' });
  }).join('\n');
  const dcard = '<div class="hm-dcard on-night"><span class="hm-dcard__aura" aria-hidden="true"></span>' + dBody + '</div>';
  const scards = s2.blocks[0].cards.map((c, i) => {
    const sp = /san-pedro/i.test(c.image ? c.image.ref : '');
    const post = c.image ? P.protrusion(ctx, { ref: c.image.ref, sizes: POST_SIZES, cls: 'hm-post hm-post--' + (sp ? 'sp' : 'lax'), widths: [200, 300, 400, 600] }) : '';
    const body = c.blocks.map((b) => {
      if (b.type === 'heading') return B.heading(b, ctx, page, { cls: 'hm-scard__name' });
      if (b.type === 'buttons') return B.buttons(b, ctx, page, { kind: 'leaf', size: 'sm' });
      return R(b, { tone: 'light', inCard: true });
    }).join('\n');
    return P.reveal(P.cardShell(post + '<div class="hm-scard__body">' + body + '</div>', { cls: 'hm-scard hm-scard--' + (sp ? 'mint' : 'peach') }), { cls: 'hm-cell', step: i + 1 });
  }).join('');
  const service = P.band({ tone: 'cream', id: s2.id, cls: 'hm-service', label: null,
    inner: P.wrap('<div class="hm-service__grid">' + P.reveal(dcard, { cls: 'hm-cell', step: 0 }) + scards + '</div>') });

  /* the two atmospheric loops (7.5): V-MIST and V-DUSK through ctx.video; the still when a loop is not generated */
  const atmos = (slot, still, cls) => {
    const v = P.loop(ctx, slot, { cls: cls + '__loop' });
    if (v) return v;
    return still ? '<div class="' + cls + '__still" aria-hidden="true">' + P.decorative(ctx, still, { sizes: '100vw', loading: 'lazy', cls: cls + '__still-img', widths: [960, 1280, 1920] }) + '</div>' : '';
  };

  /* a split section: the light box (with an optional cut-out) and an opaque copy card */
  const splitBand = (sec, { tone, cls, box, card, heading, buttonKind, order, ground = '' }) => {
    const b = sec.blocks[0];
    const copy = b.blocks.map((x) => {
      if (x.type === 'heading') return '<' + (x.level ? 'h' + x.level : 'div') + ' class="' + ['hd', x.look ? 'hd--' + x.look : '', 'hm-statement'].filter(Boolean).join(' ') + '">' + heading(x.html) + '</' + (x.level ? 'h' + x.level : 'div') + '>';
      if (x.type === 'buttons') return B.buttons(x, ctx, page, { kind: buttonKind });
      return R(x, { tone: tone === 'night' ? 'night' : 'light' });
    }).join('\n');
    const media = P.reveal(P.lightBox(ctx, { ref: b.image.ref, alt: b.image.alt || b.imageLabel || '', sizes: SPLIT_SIZES, tone: tone === 'night' ? 'night' : 'light', plates: 2, cls: box.cls, widths: [480, 640, 960, 1200], cut: box.cut || null }), { cls: 'hm-split__media' });
    const text = P.reveal('<div class="' + card + '">' + copy + '</div>', { cls: 'hm-split__copy', step: 1 });
    return P.band({ tone: tone === 'night' ? 'night' : (tone === 'dusk' ? 'dusk' : tone), atmosphere: tone === 'night', id: sec.id, cls: cls, depth: true,
      inner: ground + P.wrap('<div class="hm-split hm-split--' + order + '">' + media + text + '</div>') });
  };

  /* 3. Serve (night, atmospheric; H3 the cap out of the frame's bottom-left) */
  const serve = splitBand(s3, { tone: 'night', cls: 'hm-serve', card: 'hm-copy hm-copy--night', buttonKind: 'leaf', order: 'img-left',
    heading: (h) => weightSplit(h, 3), ground: atmos('V-MIST', 'S-MIST-BAND', 'hm-serve'),
    box: { cls: 'hm-serve__box', cut: { ref: 'CUT-CAP', sizes: CAP_SIZES, cls: 'hm-cap', widths: [320, 480, 640, 943] } } });

  /* 4. the accordions (calm haze, flat; 6.13 on white cards) */
  const accs = P.band({ tone: 'haze', id: s4.id, cls: 'hm-acc', inner: P.wrap(P.reveal(B.accordion(s4.blocks[0], ctx, page, { cls: 'hm-acc__list' })), 'wide', 'hm-acc__wrap') });

  /* 5. Community (dusk, atmospheric; H4 the lighter rising out of the frame's top edge, aligned over its photo twin) */
  const community = splitBand(s5, { tone: 'dusk', cls: 'hm-comm', card: 'hm-copy hm-copy--light', buttonKind: 'leaf', order: s5.blocks[0].imageSide === 'left' ? 'img-left' : 'img-right',
    heading: (h) => inkLast(h), ground: '<div class="hm-comm__sky" aria-hidden="true">' + atmos('V-DUSK', 'S-DUSK-PALMS-BAND', 'hm-comm') + '<span class="hm-comm__veil"></span></div>',
    box: { cls: 'hm-comm__box', cut: { ref: 'CUT-LIGHTER', sizes: LIGHTER_SIZES, cls: 'hm-lighter', widths: [160, 240, 320, 480, 523] } } });

  /* 6. the ZIP finder (night, calm: one leaf aura and a dusk glow; the storefront-rear light box in its source role) */
  const z = s6.blocks[0];
  const zBody = z.blocks.map((b) => {
    if (b.type === 'zip-finder') {
      const html = R(b, { tone: 'night', cls: 'hm-zip__finder' });
      const t = b.title && b.title.html;
      const from = '<div class="hd hd--' + (b.title.look || 'h2') + ' zip__title">' + t + '</div>';
      return t && html.includes(from) ? html.replace(from, '<div class="hd hd--' + (b.title.look || 'h2') + ' zip__title hm-statement">' + weightSplit(t, 2) + '</div>') : html;
    }
    if (b.type === 'buttons') return B.buttons(b, ctx, page, { kind: 'leaf', cls: 'hm-zip__order' });
    return R(b, { tone: 'night' });
  }).join('\n');
  const zipBox = P.reveal(P.lightBox(ctx, { ref: z.image.ref, alt: z.image.alt || z.imageLabel || '', sizes: SPLIT_SIZES, tone: 'night', plates: 2, cls: 'hm-zip__box', widths: [480, 640, 960, 1200] }), { cls: 'hm-split__media' });
  const zip = P.band({ tone: 'night-calm', id: s6.id, cls: 'hm-zip',
    inner: '<div class="hm-zip__ground" aria-hidden="true"></div>' + P.wrap('<div class="hm-split hm-split--' + (z.imageSide === 'right' ? 'img-right' : 'img-left') + '">' + zipBox + P.reveal('<div class="hm-zipcard">' + zBody + '</div>', { cls: 'hm-split__copy', step: 1 }) + '</div>') });

  // R-41: the hero image is preloaded with the same srcset and sizes as the <img>
  const ss = /srcset="([^"]+)"/.exec(heroBox);
  const sz = /sizes="([^"]+)"/.exec(heroBox);
  const headExtra = ss && sz ? '<link rel="preload" as="image" imagesrcset="' + ss[1] + '" imagesizes="' + sz[1] + '" fetchpriority="high">\n' : '';

  return { main: [hero, service, serve, accs, community, zip].join('\n'), promo: 'after-main', bodyClass: 'home', headExtra };
}
