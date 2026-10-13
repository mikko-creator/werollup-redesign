# THEME: the interfaces the phase-2 lanes code against

FOUNDATION (WF3b phase 1), 2026-10-13. Binding order: `docs/BUILD-CONTRACT.md` > `docs/DESIGN-SPEC.md` > this file. This
file states what FOUNDATION built and measured; anything not measured is marked UNVERIFIED.

## 1. Files and owners

| file | owner | what |
|---|---|---|
| `src/theme/index.mjs` | FOUNDATION | `styles`, `scripts`, `renderPage`, `render404`; robust loading; dispatch; the default renderer |
| `src/theme/shell.mjs` | FOUNDATION | `renderDocument()`, `head()`, the first-paint pre-check (gate state, store class) |
| `src/theme/chrome.mjs` | FOUNDATION | top bar, header + mega menu, promo / shopping strip, menu sheet, reviews, footer, chooser, age gate |
| `src/theme/parts.mjs` | FOUNDATION | shared primitives (buttons, banner, reading card, light box, band, card shell, chip, loop, images) |
| `src/theme/blocks.mjs` | FOUNDATION | one renderer per block type of `docs/PIPELINE-CONTENT.md` section 4 |
| `src/styles/{tokens,base,glass,depth,motion,chrome,blocks,forms}.css` | FOUNDATION | the design system |
| `src/scripts/site.js` | FOUNDATION | all shared behaviour |
| `assets/brand/logo-forest-x.png` | FOUNDATION | A4 forest wordmark for light grounds (section 9) |
| `src/theme/home.mjs`, `src/styles/home.css`, `src/scripts/home.js` | HOME | placeholders (return `null` / empty) |
| `src/theme/templates-a.mjs`, `src/styles/pages-a.css`, `src/scripts/pages-a.js` | TEMPLATES-A | placeholders; kinds: page, products-hub, product-category, education, legal, contact, delivery, archive-author, archive-taxonomy, review, and the 404 |
| `src/theme/templates-b.mjs`, `src/styles/pages-b.css`, `src/scripts/pages-b.js` | TEMPLATES-B | placeholders; kinds: location, shop, lax-menu, service-area-hub, service-area-town |

Bundle order (fixed in `index.mjs`): styles `tokens, base, glass, depth, motion, chrome, blocks, forms, home, pages-a,
pages-b`; scripts `site, home, pages-a, pages-b`. Phase-2 CSS therefore wins ties against the foundation at equal
specificity.

## 2. The phase-2 module contract

```js
// src/theme/home.mjs | templates-a.mjs | templates-b.mjs
export function render(page, ctx, api) {
  return null;                 // use the FOUNDATION default renderer for this page
  // or a string: the HTML that goes inside <main> (the shell adds every chrome region)
  // or { main, bodyClass?, promo?, staticChrome?, headExtra? }   (section 3, renderDocument options)
}
export function render404(ctx, api) { return null; }   // templates-a.mjs only; same return shapes
```

- `index.mjs` dispatches on `page.kind` (`KIND_OWNER` in `index.mjs`). A kind with no owner, or a module that returns
  `null`, gets the default renderer.
- **Robust loading.** The three modules are loaded with dynamic `import()` in try/catch. A failure prints
  `THEME MODULE <name> FAILED: <error>` and the default renderer is used. A `render()` that throws is logged the same
  way (`THEME MODULE <name> FAILED: render <path>: <error> (default renderer used)`).
- **THEME_STRICT=1** makes a load failure, a render failure, or any fallback fatal (the build exits 1). Use it for every
  build you report. Measured: a strict build of the placeholders exits 0 (section 10).
- A module must export `render`; a module without it counts as a load failure.
- Write your JS (`home.js`, `pages-*.js`) as one IIFE with its own try/catch: the bundle is one file, and a top-level
  throw in your file would stop the files after it. `site.js` runs first.

`api` (passed to `render`):

| key | what |
|---|---|
| `api.parts` | `parts.mjs` (section 4) |
| `api.blocks` | `blocks.mjs`: `renderBlock(b, ctx, page, opts)`, `renderBlocks(list, ctx, page, opts)`, and every named renderer (section 5) |
| `api.chrome` | `chrome.mjs` (you should not need it: the shell renders the chrome) |
| `api.shell` | `shell.mjs` |
| `api.defaultMain(page, ctx)` | the whole default `<main>` body |
| `api.defaultSection(page, ctx, section, index, state)` | one section the default way (`state = { light: 0, heroDone: false }`, shared across calls) |
| `api.defaultOptions(page)` | `{ promo, staticChrome }` the default uses for this kind |
| `api.renderDocument` | the shell (rarely needed: return `{ main, ... }` instead) |
| `api.PAGE_404` | the synthetic page object of the 404 |

Typical lane code:

```js
export function render(page, ctx, api) {
  const { parts: P, blocks: B } = api;
  const state = { light: 0, heroDone: false };
  const main = page.sections.map((s, i) => (s.kind === 'split' ? myServeBand(s, ctx, page, api) : api.defaultSection(page, ctx, s, i, state))).join('\n');
  return { main, promo: 'after-main' };
}
```

## 3. The document and the text-parity regions (do not break these)

`renderDocument(page, ctx, { main, bodyClass, promo, staticChrome, headExtra })` emits, in this order:

```
<html lang class="no-js">  <head> seoHead, preloads, fonts, site.css, the first-paint pre-check, site.js (defer), page.embed.head
<body class="kind-<kind> family-<menuFamily> [is-static-chrome] [bodyClass]">
  a.skip (aria-label "Skip to content", no text node)
  <header class="site-head">  [data-parity=topbar]  [data-parity=header] (navbar + mega)  </header>
  [data-parity=subheader]          promo strip (marquee pages) or "You're shopping" strip (store pages)   (promo: 'top')
  <main id="mainContent" data-parity="main">  ...your main...  </main>
  [data-parity=subheader]          (promo: 'after-main' puts it here instead)
  [data-parity=reviews]  <footer data-parity=footer>
  .sheet-scrim + [data-parity=offcanvas] (#defaultOffcanvas)   [data-parity=chooser]   [data-parity=agegate]
```

Rules every template keeps (tools/text-parity.mjs, tools/build-check.mjs, docs/PIPELINE-CONTENT.md 8):

1. Each region exactly once, never nested in another region. Nothing you render goes outside `<main>`.
2. Inside `<main>`, the model's words in model order: render every block of every section, in order. Hidden text
   counts (accordion bodies, ZIP steps): keep it in the DOM with `hidden`, never omit it.
3. Never add a visible word (no "Read more", no numerals, no glyph characters as text). Accessible names go in
   attributes; glyphs are SVG (`P.icon`). A visible label that repeats a verbatim label from ANOTHER region may be drawn
   with CSS `content: attr(data-label)` (the footer socials do this); ask before using it in `<main>`.
4. Every model `<a href>` exactly once, href as given; add none. A button that is not a link is a `<button>`.
5. Exactly one `<h1>` per page: the page-header heading or the hero tile heading (A16). Other headings keep their level.
6. A plain paragraph renders as a bare `<p>` (no attribute): text-parity's controls plant faults in a bare `<p>`
   (`B.paragraph` does this).
7. The review cards stay `<li class="review">` exactly (text-parity's dropped-review control looks for it).
8. Store-switcher data (`data-address`, `data-hours`, `data-menu-url`, `data-directions-url`, `data-lax-url`,
   `data-sanpedro-url`): build-check compares their multiset per page with the source. Model buttons carry them via
   `P.button`; never add them to anything else.
9. The embed container: `B.embed` (or `api.defaultSection` on an embed section). No transform, filter, backdrop-filter,
   perspective, contain, will-change, opacity < 1, mask or clip-path on it or ANY ancestor; no reveal, protrusion or
   overlay over it (BUILD-CONTRACT 4.6, R-37). `staticChrome: true` (the default on shop and lax-menu) makes the header
   static.

`promo` option: `'top'` (default; the source position), `'after-main'` (default on home: keeps the strip out of the
home first screen, R-7, without nesting regions; placing it directly after the hero, as DESIGN-SPEC 6.10 draws it,
would put a region inside `<main>`: not possible with the current parity tool, see section 11).

## 4. `parts.mjs` (the only way to draw shared things)

| function | output |
|---|---|
| `P.esc(s)`, `P.escAttr(s)`, `P.attrs({...})`, `P.cx(...)`, `P.href(ctx, h)` | escaping and attributes; `href` runs internal paths through `ctx.url` |
| `P.icon(name, cls)` | inline SVG, `aria-hidden`: arrow, chev, menu, close, store, pin, clock, star, user, truck, phone, fire, plus, pause, play, search, external, check, leaf, link, mail. `P.iconFor(faName)` maps the model's Font Awesome names |
| `P.img(ctx, ref, opts)` | `ctx.img` with one safety net: an image-plan slot id not declared yet renders the slot frame (`.img-slot`) and logs once; a FILE ref never gets the net |
| `P.decorative(ctx, ref, opts)` | `alt=""` + `data-decorative` (build-check requires the marker) |
| `P.slotReady(ctx, id)` | true when a slot has its file |
| `P.button(ctx, modelButton, { kind, size, arrow, cls })` | the model's Button -> `a.btn`, keeping `.js-location-chooser`, `.active-location-menu`, `data-lax-url`, `data-sanpedro-url`, target, rel |
| `P.buttonRow(ctx, items, { kind, size, cls, each(b, i) })` | a `.btn-row`; `each` returns per-button options |
| `P.pill(ctx, { label(html), href, kind, size, arrow, iconName, cls, attrs })` | a pill from parts you already have (escape plain text with `P.esc`) |
| `P.band({ tone, atmosphere, id, cls, inner, depth, label, labelledby })` | `<section class="band band--<tone> on-night|on-light">`; tone `night`, `night-calm`, `cream`, `haze`, `white`, `dusk`; `atmosphere` adds the static leaf/dusk glow layer; `depth: true` adds `data-depth` (section 7) |
| `P.wrap(inner, 'wide' | 'narrow' | 'full', cls)` | the container: 1200 px / 630 px (reading measure) / full |
| `P.readingCard(inner, { cls })` | the 6.19 white reading card (630 px measure inside `wrap(..., 'narrow')`) |
| `P.reveal(inner, { tag, cls, step })` | a `[data-reveal]` WRAPPER (section 7); `step` 0-3 is the 90 ms stagger |
| `P.cardShell(inner, { tag, cls, tone })` | `.card` white card with the hover / `:has(:focus-visible)` lift |
| `P.chip(ctx, { label, href, cls })` | leaf-100 chip |
| `P.lightBox(ctx, { ref, alt, inner, sizes, loading, fetchpriority, plates: 1|2, tone: 'night'|'light', cls, ratio, cut, widths })` | the 5.2 light-box stack: opaque frame + static plates (no backdrop-filter); `cut: { ref, sizes, cls }` adds a protrusion |
| `P.protrusion(ctx, { ref, sizes, cls, widths })` | a 5.3 cut-out: `aria-hidden` wrapper, `data-protrude`, `data-plane="cut"`, `pointer-events: none`, decorative img. Position it in your CSS; respect the counts of DESIGN-SPEC 5.4 |
| `P.banner(ctx, page, { headingHtml, headingText, art, size: 'auto'|'short'|'long'|'compact', veil: 'default'|'deep', body, after, eyebrow, cls })` | the 6.16 banner; `art` defaults to `P.bannerArtFor(page)` (`page.generated.hero` first, then the spec's map; never the deny-listed source header art) |
| `P.bannerArtFor(page)`, `P.REAL` | the banner art rule and the real-photo refs the spec names (storefront side and rear, postcards, cap, red lighter, sour kush, grinders, mason jars, concentrate, topicals) |
| `P.isDenied(ref)`, `P.DENY_PROMOTED` | DESIGN-SPEC 10.3: true for the source photos that never take a hero, banner, cut-out or menu-card role (champagne bar, Kiva, In-N-Out, a3d38155, 7a4352fe, 085a05d4, 8b360abb, e181cbbf). `B.heroTile` swaps such a tile photo for the place plate (first tile) or drops it (later tiles) |

Banner sizing (R-2): `P.banner` reads the art's intrinsic size and sets `sizes` to the painted width of the cover crop,
and on phones caps the band at the file height / 3 (the 1920x640 topicals strip gets `--banner-phone-h: 210px`).
| `P.eyebrow(html)`, `P.stars(n)` | eyebrow line; five-star SVG group with `aria-label="5 stars"` (no text) |
| `P.loop(ctx, slotId, { cls })` | a 7.5 loop for an image-plan `video` slot via `ctx.video` (`<video muted playsinline loop preload="none" poster aria-hidden>` + the 44 px pause control). Returns `''` until the slot has files. Put it inside a positioned atmospheric band; `site.js` runs it |

## 5. `blocks.mjs`

`B.renderBlocks(list, ctx, page, opts)` renders any block list; unknown types throw (the build fails). Options pass
through: `tone: 'night' | 'light'`, `cls`, `inHero` (hero CTAs: first leaf with arrow, the rest night outline).
Named renderers (same signature `(block, ctx, page, opts)`): `heading` (level null -> a `div.hd`, never a fake
heading, never Bricolage on a `p`), `paragraph`, `list`, `buttons`, `image`, `pageHeader` (opts `art`, `size`, `veil`,
`after`), `heroTile` (opts `first`: the G1 glass pane), `locationCards`, `split`, `accordion` (6.13 markup:
`hN > button[aria-expanded][aria-controls]` + region; `site.js` keeps one open), `cardGrid`, `cardCarousel` (scroll-snap
rail; category images at 140 px; mood cards with the tint wash, text on white), `logoCarousel` (static wrap grid),
`deals`, `linkCard`, `iconLink`, `notice`, `postList`, `searchForm`, `zipFinder` (data from `ctx.zipFinder` as JSON;
`site.js` runs it), `contactForm` (A12: post to the placeholder, Send disabled, note visible), `map` (iframe byte for
byte), `embed`.

## 6. Class and token conventions

- Tokens: `src/styles/tokens.css` is the only file with literal colours (DESIGN-SPEC 3; gate C13). Use the names:
  `--forest-950 ... --leaf-ink-deep`, `--cream`, `--haze-100/200/300`, `--peach`, `--mint`, `--ink-muted`, the
  translucent roles (`--night-78`, `--white-12`, `--cream-82`...), `--f-text`, `--f-display`, `--fs-*`, `--s-1..10`,
  `--gutter`, `--container`, `--measure`, `--r-s/m/l/pill`, `--sh-1/2`, `--lift`, `--sh-cut(-light)`, `--glow`,
  `--z-*`, `--atmos-*`, `--veil-*`, `--surface-*`, `--plate-*`, `--ease-out`, `--t-*`. If you need a colour that is
  not there, ask FOUNDATION (or the integrator) to add a token; do not write `#hex` or `rgba()` in your CSS.
- Faces: Libre Franklin for everything; Bricolage (`--f-display`) only on h1, statement h2, banner titles, card,
  accordion and long-form headings, footer store names (R-42). `.hd` sets Bricolage.
- Ground awareness: `.on-night` / `.on-light` on bands, the header, dialogs. Buttons, links and focus rings adapt:
  `.btn--forest` and `.btn--line` become the night outline pill inside `.on-night`.
- Buttons: `.btn` + `.btn--leaf | --forest | --line | --ghost | --white`, `.btn--sm`, `.btn--block`; label in `.btn__t`.
- Hover = focus (7.4, R-29): every `:hover` rule gets a `:focus-visible` (the control itself) or `:has(:focus-visible)`
  (a card around a link) twin with the same declarations. Lifts use the individual `translate` property.
- Glass: only the closed list of DESIGN-SPEC 4.1 (`.glass-pane` is G1 and may be reused for the store-page hero pane).
  Never put `backdrop-filter` on a plate, a card or anything that contains another glass element.
- Breakpoints: 1240 (full desktop), 1024 (condensed desktop; below it the phone header), 701 (tablet / phone), 761
  (parallax on).

## 7. Motion hooks (DESIGN-SPEC 7)

- **Reveal:** wrap a block in `P.reveal(...)` (`[data-reveal]`, optional `--i` step). `site.js` hides a wrapper ONLY
  when its top is at or below `innerHeight` at load, reveals it with an IntersectionObserver (threshold 0, rootMargin 0),
  a rAF position check (top < 0.94 x innerHeight), at once on `focusin`, and reveals everything after 3 s only if the
  observer never delivered. Under reduced motion nothing is hidden. Never put a hover transform on the
  `[data-reveal]` element itself: put it on the card inside (D-12). The footer and both strips are never revealed.
- **Depth:** `P.band({ depth: true })` marks a section; inside it `[data-plane="atmos"]` (band ground), light-box plates
  and `[data-plane="cut"]` move with `--p` (-1 entering .. 1 .. -1 leaving, clamped), 761 px and up, never under reduced
  motion (`depth.css`). One passive rAF-throttled listener in `site.js` (not attached under reduced motion).
- **Loops:** `P.loop(ctx, 'V-MIST')` inside an atmospheric band (`position: relative`). Plays only at 25 % visible, tab
  visible, motion allowed; the pause/play control (aria-labels "Pause motion" / "Play motion") is remembered for the
  session; reduced motion shows the poster only.
- **Header:** `html.is-scrolled` (IntersectionObserver sentinel at 8 px, no scroll listener) turns on the G2 glass;
  the top bar scrolls away because the header sticks at `top: calc(-1 * var(--topbar-h))`. Progress line: `--sp` on
  `.scroll-line span` (not shown under reduced motion: a deviation from DESIGN-SPEC 7.3, chosen so that no scroll
  listener exists under reduced motion, R-26).
- No infinite CSS animation anywhere (R-27). Only `transform`/`opacity` (and the individual properties) animate.

## 8. Behaviour already in `site.js` (do not duplicate)

Age gate (A6, D-15: the first-paint pre-check in `<head>` reads localStorage / sessionStorage / cookie and sets
`html.age-ok` or `html.age-gate` before paint; without JS the gate shows and everything else is hidden), store switcher
and Order Now (4.5: `html.has-store store-<slug>` is set before paint from the path, then the `selected_location`
cookie; `.active-location-menu` hrefs are rewritten; Order Now with no store opens the chooser), the chooser (any
`.js-location-chooser` with `data-lax-url` / `data-sanpedro-url`), the mega menu, the sheet and its groups, accordions
(`[data-accordion]`), the reviews rail (`[data-rail]` with `[data-rail-prev]` / `[data-rail-next]`), the ZIP finder
(`[data-zip]`), loops (`[data-loop]`), reveals, depth, the header state.

## 9. Brand assets

`assets/brand/logo-forest-x.png`: the A4 alpha-preserving forest recolour of `assets/source/8f87827f-logo-white-x.png`
(400x71). Every pixel's RGB is `#203022`; the alpha plane is copied. Proof (`node tmp/foundation/recolour.mjs`): alpha
sha256 of source and output both `49a1657e17b99494af4ac648bb5a3190c3b705f16185ce806f525540a6915aa4` (the value
DESIGN-SPEC R-3 names), RGB set where alpha > 0 = {32,48,34}, and a one-byte alpha change alters the hash (control).
Use it on light grounds only: `ctx.img('assets/brand/logo-forest-x.png', { alt: <the verbatim logo alt>, ... })`. The
chrome itself is on night grounds and uses the white original. Wordmark widths: header 186 px desktop / 132 px below
1024 (min(132px, 30vw) at 420 and below); footer 240 / 132; gate 200 / 132; sheet 132.

## 10. Build and check commands (your own folders and port, BUILD-CONTRACT 5.3)

```sh
cp -r assets/optimized tmp/<role>/cache        # once
THEME_STRICT=1 node src/build.mjs --out tmp/<role>/dist --cache tmp/<role>/cache
node tools/link-check.mjs --dir tmp/<role>/dist
node tools/route-check.mjs --dir tmp/<role>/dist
node tools/build-check.mjs --dir tmp/<role>/dist --control
node tools/text-parity.mjs --dir tmp/<role>/dist --control
node tools/secret-scan.mjs --dir tmp/<role>/dist --keys <fal.key> --keys <hf.key>
# serve inside ONE Bash call and kill it there (ports: HOME 8842, TEMPLATES-A 8843, TEMPLATES-B 8844, INTEGRATOR 8846)
node tools/serve.mjs --root tmp/<role>/dist --port <port> --no-open & S=$!; sleep 1.5; ...; kill $S
node tools/shots-dpr.mjs --url http://127.0.0.1:<port>/ --out tmp/<role>/shots/home --sizes 1280x585@1.5,1600x662@1.2,390x844@3 --full --scroll-steps 8 --init "localStorage.setItem('agePass_v2','true')"
```

`--scroll-steps 8` matters for full-page captures: `shots-dpr --full` captures beyond the viewport without scrolling,
so content below the first screen is still waiting for its reveal unless the page was scrolled first.

FOUNDATION's own scratch probes (copy them if useful): `tmp/foundation/probe.mjs` (one Chrome, one page, a scenario
module) and the scenarios `sc-gate.mjs`, `sc-gate-no.mjs`, `sc-mega.mjs`, `sc-sheet.mjs`, `sc-chooser.mjs`,
`sc-chrome.mjs`, `sc-motion.mjs`, `sc-reveal.mjs`, `sc-overflow.mjs`.

## 11. Known gaps and deviations (FOUNDATION)

- **Mega chips (D-10, R-17) are not rendered.** The chips would repeat the 12 "Order <Cat>" links that the two store
  columns already carry; build-check compares the href multiset of the header region with the source and text-parity
  compares its word sequence, so a second copy of each link (or the chip labels "San Pedro" / "LAX" as text) fails both
  gates. The panel keeps the two verbatim store columns (every item its own link) and the six image cards; per-category
  store choice is in the columns. Enabling chips needs an orchestrator ruling (a declared exception for repeated chrome
  links). Requested in FOUNDATION's report.
- **Mega layout order.** The header region must follow the source order (quick menu, Locations, Products, Education,
  About, Daily Deals, Contact, Order Now), so the store columns (Products) come before the cards (Education) in the
  DOM, and the panel shows them on the left. "Products" sits after the quick menu in the header row, so the visual
  order equals the focus order. Locations, About, Daily Deals and Contact of the header tree are in the region but
  `hidden` (the sheet carries them).
- **Promo strip on home** is after `</main>` (before the reviews), not directly after the hero (section 3).
- **Progress line** hidden under reduced motion (section 7).
- **Default hero** (`B.heroTile`) is a generic night hero with the G1 pane (R-4 0 px at scroll 0/40/120 and R-5 measured
  at the five windows on the default home); the D-24 statement split ("Shop Our" 300 / "Weed Products" 800, the leaf
  glow word), the dusk glow tuning, the Delivery card of 6.11 and the R-6 eye check belong to HOME. On phones the
  default second hero tile (an 800 px source photo) peeks into the first screen at 0.68 file px per device px (R-2):
  HOME replaces it with the Delivery card.

## 12. Integration edits

(The INTEGRATOR records every cross-owner edit here: file, lane that owns it, what changed, why, evidence.)

| date | file | owner | change | why / evidence |
|---|---|---|---|---|
