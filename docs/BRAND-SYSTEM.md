# We Roll Up: brand system (measured)

UNDERSTAND phase, BRAND lane. Written 2026-10-13. Machine-readable twin: `docs/data/brand.json`.

**What this is.** The brand the redesign must keep, measured from **computed style** on the live site
(`audit/capture/baseline.<slug>.<width>.style.json`, 25 template pages x 1440 and 390 = 50 captures), plus the voice from
19 pages of crawled copy. Source CSS (`audit/css/...main.css`) is used only for states that a rest-state capture cannot
see (hover, focus, the age-gate modal), and each such value is labelled **source CSS**. Anything not verified is
marked **UNVERIFIED** with the reason. Section 7 holds **PROPOSALS**, not source facts.

**How the colours were counted** (`tmp/understand/brand/analyze.mjs`). The harvest records only visible elements with a
non-zero box. It omits `none`, `normal`, `auto`, `0px` and `rgba(0, 0, 0, 0)`, so a recorded `background-color` is a
painted fill. Carousel clones that sit fully outside the viewport are excluded. The roles are:
- text: an element with leaf text;
- link: an `<a>` with text;
- button fill or button text: a `button`, `a.btn`, `a.cta-item` or Gravity Forms button;
- border: each side whose width is above 0 and whose style is not `none`;
- shadow: a `box-shadow` colour;
- gradient stop: a colour inside a `background-image` gradient;
- icon: the colour of a Font Awesome `svg` or `path`.

Contrast pairs come from the paint stack. Each text element is matched to the nearest earlier painted container that
contains its box, and translucent fills are composited.

---

## 1. Colour

### 1.1 Core palette (verified, not assumed)

| Token | Hex | What it paints | Evidence (counts are 1440 + 390, all 25 pages) |
|---|---|---|---|
| forest | `#203022` | nav bar, dark sections, footer, location cards, `btn-primary`/`btn-accent`, body text on light | text 631, background 118, button fill 243, border 408, icon 1542; `:root --bs-black-rgb: 32,48,34` |
| leaf | `#5dbc5d` | top bar, nav CTA pill, `btn-secondary`, footer location names, deal titles, form submit | background 52, button fill 86, text 188, link 106; favicon leaf `#5dbc5e` |
| cream | `#f5f4f1` | `#site-topbar`, `btn-light`, light sections (`linear-gradient(145deg, #f5f4f1, #fff)`), desktop nav link colour | background 70, gradient stop 52, link 75; `:root --bs-light` |
| white | `#ffffff` | body ground; text on dark | text 396, link 600, button text 226 |
| charcoal | `#2c2c2c` | `#topLevelNav` wrapper behind the bars, `btn-light` text, review-name icons | background 54, button text 26, icon 306; `:root --bs-dark` |

The brief expected a very dark forest green, a bright leaf green, cream/off-white grounds, white and near-black text.
That holds, with one correction: **body text is forest `#203022`, not near-black.** `#2c2c2c` is used only on
`btn-light` labels and on wrappers. The `body` element computes `color: rgb(32, 48, 34)` on every page
(`dump.mjs index 1440`).

### 1.2 Neutrals and minor colours (computed)

| Hex | Role | Count |
|---|---|---|
| `#f2f5ee` | top-bar social icons (1440 only) | 200 |
| `#dee2e6` | Bootstrap default border: review cards, footer rule, top rule of light sections | 1102 |
| `#767676` | browser-default form-control border (store select, zip input, contact inputs). **Not a brand colour.** | 232 |
| `#000000` | slider-arrow glyphs; shadows at alpha .075 (336), .35 (50) and .15 | 106 |
| `#9a9a9a` | daily-deal fine print "Valid at ..." | 8 |
| `#6c757d` | breadcrumb current item | 4 |
| `#790000` | Gravity Forms required `*` | 6 |
| `#cccccc` | Splide pagination dots (location pages) | 3 |

These colours are one-offs that appear only in the San Pedro "Shop by Mood" cards (`/location/san-pedro`). Each card is
`#fff` with a translucent diagonal gradient on top (alpha .58 to .76):

| Mood | Gradient pair |
|---|---|
| Blissful | `a8cfa0` / `8fc185` |
| Creative | `c9b84a` / `b4a336` |
| Hungry | `e86f3c` / `e1551b` |
| Pain Free | `4db6ac` / `3f9b92` |
| Relaxed | `3f8f5f` / `4bab72` |
| Sleepy | `6e6aae` / `8884bc` |
| Energetic | `5dbc5d` / `46aa46` |

### 1.3 Theme tints already in the source CSS (source CSS, states not captured)

These values come from the theme itself, so the redesign can use them as on-brand tints without inventing any:

| Hex | Where it comes from |
|---|---|
| `#344f38` | `.btn-primary:hover` and `.btn-accent:hover` |
| `#81cb81` | `.btn-secondary:hover` and the age-gate location-link hover |
| `#3c913c` | end stop of the leaf gradient |
| `#010201` | end stop of the forest gradient |
| `#d5d1c4` | end stop of the cream gradient |
| `#304833` | middle stop of the age-gate surface gradient |
| `#162117` | text of the "Yes" age-gate button on hover |
| `#dff2df` | background of the "Yes" age-gate button on hover |
| `#7ac87a` | link hover in the age-gate modal |

### 1.4 WCAG contrast (paint-stack pairs, computed)

| Text | Ground | Ratio | Runs (pages) | Verdict | Where |
|---|---|---|---|---|---|
| `#ffffff` | `#203022` | 13.93 | 915 (25) | AA | dark sections, footer, location cards |
| `#203022` | `#ffffff` | 13.93 | 442 (25) | AA | body and headings on white |
| `#203022` | `#f5f4f1` | 12.67 | 189 (25) | AA | cream gradient sections |
| `#f5f4f1` | `#203022` | 12.67 | 75 (25) | AA | desktop nav links |
| `#2c2c2c` | `#f5f4f1` | 12.70 | 20 (4) | AA | `btn-light` on photos |
| `#5dbc5d` | `#203022` | 5.85 | 112 (25) | AA | footer location names, footer icons |
| **`#ffffff`** | **`#5dbc5d`** | **2.38** | **135 (25)** | **FAIL** | top-bar address and hours; every leaf CTA (nav pill, "Shop now", "Order Now", form submit) |
| **`#5dbc5d`** | **`#ffffff`** | **2.38** | **170 (17)** | **FAIL, even large** | deal titles ("Early Bird Specials" 28.4px), inline links |
| `#5dbc5d` | `#f5f4f1` | 2.17 | 10 (4) | FAIL | breadcrumb links 10.5px |
| `#f2f5ee` | `#5dbc5d` | 2.16 | icons | FAIL (non-text 3:1) | top-bar social icons |
| `#6c757d` | `#f5f4f1` | 4.26 | 4 (4) | FAIL (small text) | breadcrumb current item |
| `#9a9a9a` | `#ffffff` | 2.81 | 8 (1) | FAIL | deal fine print |
| white | mood-card tints | 1.48 to 2.85 | 16 (1): 12 at 1440, 4 at 390 | FAIL | Blissful 1.48, Creative 1.63, Hungry 2.29, Pain Free 1.89, Relaxed 1.79, Sleepy 1.92, Energetic 1.85 (worst stop each) |
| `#203022` | `#5dbc5d` | **5.85** | 0 | AA | **not used today.** This is the AA fix for leaf fills that keeps both brand colours. |

White display type on photos (hero tiles with `linear-gradient(rgba(0,0,0,.15) x2)`, banners with `rgba(0,0,0,.35)`)
cannot be scored from computed style. **UNVERIFIED:** it needs a pixel sample of each photo.

Two pairs are measurement artefacts and were excluded:
- `privacy-policy@390`, `#203022` on `#203022`: the sticky header's box overlaps the H1. The H1 really sits on the white
  body.
- `location-san-pedro`, white on white: the translucent mood gradients, which are handled in the mood row of the table.

---

## 2. Type

### 2.1 Families: loaded vs declared

| Family | Loaded? (`document.fonts`, 50 captures) | Files | Licence (font name table) | Role |
|---|---|---|---|---|
| **Libre Franklin** | **Yes.** 400 and 700 normal on 50/50; 600 on 27; 800 on 20; 900 on 21; italics 400/600/700 on 20 to 25 | `assets/fonts/libre-franklin-{normal,italic}-latin{,-ext}.woff2` (name table family "Libre Franklin Thin", consistent with a variable font; fvar not checked) | **SIL OFL**: "Copyright 2020 The Libre Franklin Project Authors", licence URL openfontlicense.org | **Paints every role**: headings, body, nav, buttons, top bar, footer |
| Helvetica Neue Condensed | **No, never loadable** | `HelveticaNeue-Condensed.woff/.woff2` | **Commercial**: "Copyright (c) 1990 Adobe Systems Incorporated. All Rights Reserved. Helvetica is a trademark of Linotype AG". No licence field. **Treat as NOT redistributable.** | Declared only |
| Agrandir Tight | **No, never loadable** | `Agrandir-Tight.woff/.woff2` | **Commercial**: "Copyright © 2018 by Alexander Slobzheninov. All rights reserved." No licence field. **Treat as NOT redistributable.** | Declared only |
| Source Sans Pro | **No.** @font-face present on 50/50 captures, loaded on 0/50 | 24 OMGF woff2 files | SIL OFL (Reserved Font Name "Source") | Unused download |

**Why Helvetica and Agrandir never load.** The theme declares `@font-face{font-family:HelveticaNeue,Condensed;...}` and
`font-family:Agrandir,Condensed` (`audit/css/...main.css`). A list is not a valid value for the `font-family`
descriptor, so the browser drops it. The CSSOM shows all six rules with **no family** on 50/50 captures
(`fontFaces[]`). So `font-family: HelveticaNeue, Libre Franklin, sans-serif` falls through to Libre Franklin. That
stack is declared 16 times, including on `#site-topbar` and in the age-gate body.

**UNVERIFIED:** Safari on macOS and iOS may match a locally installed Helvetica Neue by its PostScript name
`HelveticaNeue`. Apple visitors could therefore see regular-width Helvetica Neue in the top bar. The capture ran
Chrome on Windows.

**Operator decision (licence).** Ship Libre Franklin (OFL), which is what visitors see today. If the ethereal headline
layer wants a narrower or tighter display voice like the one the theme intended, use an open-licence substitute in the
same character and confirm it as an operator decision. Candidates (not tested here):
- Libre Franklin itself at 800 to 900 with negative tracking (no new family);
- Archivo / Archivo Narrow (OFL);
- Barlow Condensed / Barlow Semi Condensed (OFL);
- Instrument Sans (OFL);
- Familjen Grotesk (OFL).

Helvetica Neue Condensed and Agrandir Tight must not ship.

### 2.2 Roles (computed; `tmp/understand/brand/type-summary.json`)

All roles are Libre Franklin. The scale is a **perfect fourth (16 x 1.333^n)**: 21.328 / 28.432 / 37.904 / 50.512,
plus a 64px display size. At 390 every heading drops one step.

| Role | 1440 | 390 | Notes |
|---|---|---|---|
| Display `.h-ultra` (home hero H1/H2) | 64px / 80px, 700, ls 0.16px | 44.8px / 56px | white on photo |
| H1 (page banners) | 50.512 / 60.6144, 700 | 37.904 / 45.4848 | 22 pages; white on banner photo |
| H2 | 37.904 / 45.4848, 700 | 28.432 / 34.1184 | `.h2` class is UPPERCASE ("Welcome to We Roll Up") |
| H3 | 28.432 / 34.1184, 700 | 21.328 / 25.5936 | `.h3` class is UPPERCASE ("We speak Spanish!") |
| H4 | 21.328 / 25.5936, 700 | 16 / 19.2 | mood names UPPERCASE |
| H5/H6 | not painted as visible text in the captures | | h6 exists in the markup (store names); **UNVERIFIED** size |
| Body `p` | 18 / 24, 400 (accordion 18 / 28.8) | 16 / 24 (accordion 14 / 22.4) | forest on light, white on dark |
| Lead `.fs-4` | 24 / 24, 400 | 21.57 / 24 | hero subline |
| Small | 15.75 / 24 | 14 / 24 | addresses, fine print |
| Nav links | 18 / 24, **700, UPPERCASE**, `#f5f4f1`, padding 8px 16px | hidden behind the toggler | hover (source CSS): `#fff`, opacity .9 |
| Buttons | 16 / 24, **700, UPPERCASE**, padding 12px 24px | same | small: 14 / 21, padding 7.2px 16px; zip submit 600 |
| Top bar | address 14/14 400 and hours 14/14 700 UPPERCASE, white on leaf; `#site-topbar` 16/20 ls 0.5px; links 14 700 UPPERCASE; breadcrumb 10.5 600/700 UPPERCASE | address/hours 14 | |
| Footer | headings 28.432 700 (leaf store names, white "Quick Links"); links 15.75 700 white; address 15.75 400; copyright 13.7812 700 | 21.328 / 14 / 14 / 12.25 | |

Letter-spacing is `normal` everywhere except `.h-ultra` (0.16px) and `#site-topbar` (0.5px). In source CSS, the
age-gate title uses -.02em and its buttons .02em. The type character is **bold (700) Franklin Gothic-style grotesque,
UPPERCASE for actions and navigation, sentence or title case for headings, tight leading on headings (1.2)**.

---

## 3. Logo and brand assets

| File | Size | Alpha | Colours (measured) | Use |
|---|---|---|---|---|
| `assets/source/8f87827f-logo-white-x.png` | 400 x 71, PNG pal8 | yes: 62.3% transparent, 9.0% anti-aliased edge, 28.7% opaque | white (86.8% of visible pixels exactly `#ffffff`, the rest a grey anti-alias ramp) | **The only wordmark.** Header `a.navbar-brand` (about 259 x 46 at 1440); age-gate modal; og:image (malformed URL, see PLAN) |
| `2fac1c34-cropped-favicon-1-300x300.png` | 300 x 300 rgba | yes (73.4% transparent) | `#5dbc5e` | green 7-point fan leaf with stem. Visibly stair-stepped at 300px (an upscaled raster) with a light fringe: **favicon sizes only** |
| `8bd84cc3-cropped-favicon-1-150x150.png` | 150 x 150 rgba | yes | `#5dbc5e` | favicon |
| `5ac91359-favicon.png` | 150 x 150 pal8 | binary only | `#5dbc5e` | favicon |
| `dd2e2c2b-LAX_-Culver-City-2.webp` | 600 x 569 WebP | yes (3.6%: deckled edge) | peach `#ffccaa` / `#ffbb99`, pink | location illustration |
| `f06599a5-San-Pedro_-Palos-Verdes-1.webp` | 600 x 531 WebP | yes (1.7% edge) | mint-teal `#aaccbb`, orange `#ffbb77` | location illustration |

**How the wordmark is built** (viewed in `tmp/understand/brand/sheet-brandmarks.png`):
- the words "We Roll Up." set on one line, with a **trailing full stop** and a small superscript **TM** after it;
- a heavy, regular-width (not condensed) grotesque with very tight tracking and tight word spaces;
- no leaf in the wordmark.

**UNVERIFIED:** the typeface of the wordmark, which was not identified and must not be guessed.

**There is no dark-on-light version** (no other logo file and no SVG). The method for one is an **alpha-preserving
recolour, never a redraw**:

`ffmpeg -i logo-white-x.png -vf "format=rgba,geq=r=32:g=48:b=34:a=alpha(X\,Y)" logo-forest-x.png`

Tested on a scratch copy (`tmp/understand/brand/logo-forest-test.png`):
- the output is 400 x 71 rgba;
- the alpha plane's sha256 is `49a1657e…6915aa4`, **identical** to the source;
- 100% of visible pixels are exactly `#203022`.

The build lane makes the real file and re-runs the same hash check. A vector master from the client is better, if one
exists (operator question).

**Lockups seen only in photos** (described here, **never used as a logo source**):
- the **stacked three-line "We / Roll / Up."** with a small green leaf after the full stop: window decals, jar lids, the
  Trop Cherry bag (with TM), the red lighter;
- a one-line closed-up **"WeRollUp."** on the pre-roll tube;
- the all-caps **"WE ROLL UP" + green leaf** roof sign, in dark letters on the white facade;
- an embroidered **script "We Roll Up"** on caps in the display case.

**Location illustrations.**
- LAX - Culver City: a painterly postcard with the LAX Theme Building arches, palms, a vertical CULVER CITY sign and a
  round "Heart of Screenland" sign, in a pink-peach sunset with mist in the hills.
- San Pedro - Palos Verdes: a retro travel-poster view of the Vincent Thomas Bridge, with orange and blue light trails
  and layered hazy hills.

Both have a torn-paper edge. Their warm-dusk haze is the closest thing in the source to "ethereal".

---

## 4. Components as they look now (computed rest state; hover is source CSS)

**Header.** It is sticky: `#topLevelNav` (`#2c2c2c`) wraps three bars.
1. `#headless-top-bar` (leaf, 58px tall at 1440 and 94px at 390): the store `<select>` "currently shopping", the
   address, the hours, and Instagram / Google / Yelp / Weedmaps icons.
2. `nav#site-navigation` (forest, 96px tall at 1440, padding 24px 75px, shadow `rgba(0,0,0,.35) 0 7px 15px -15px`): the
   logo on the left, the links on the right, and a **leaf CTA pill** (176 x 48 at 1440, full width 340 x 48 at 390).
3. `#site-topbar` (cream, 32px): breadcrumb, "Directions" links and promo text.

**Buttons.** Pill-shaped: `border-radius: 30px`, 16px 700 UPPERCASE, padding 12px 24px, `transition: all .3s`.

| Variant | Rest | Hover (source CSS) |
|---|---|---|
| leaf (`btn-secondary`; nav `a.cta-item` is `btn btn-secondary`) | `#5dbc5d` / white text (2.38:1) | `#81cb81`, `scale(.96)` |
| contact submit (`input.gform_button.button`, value "Send"; not a `.btn`) | `#5dbc5d` / white | UNVERIFIED (the `.btn` rules do not apply) |
| forest (`btn-primary`, `btn-accent`) | `#203022` / white | `#344f38`, `scale(.96)` |
| light (`btn-light`, on photos and mood cards) | `#f5f4f1` / `#2c2c2c` | `#fff` / `#2c2c2c`, `scale(.96)` |
| outline `.btn.btn-accent.transparent` (`#submitzip`, alternating review CTAs) | transparent, 3px solid `#203022`, forest text | `#203022` fill, white text, `scale(.96)` |
| slider arrows | 36px circle (32px at 390), forest, shadow `0 2px 4px rgba(0,0,0,.075)` | opacity .9 |
| age gate "Yes" / "No" (source CSS) | pill 999px: white / forest; "No": transparent with a 2px border at white .35 | "Yes": `#dff2df` / `#162117` + 2px ring `rgba(93,188,93,.65)`; "No": `rgba(93,188,93,.12)` + leaf border |

Every `.btn` shrinks on hover (`.btn:hover{transform:scale(.96)!important}`). No `rpb-btn-*` hover variant is active,
because `index.html` carries no such class.

**Cards.**
- *Hero tiles* (home): photo with `linear-gradient(rgba(0,0,0,.15) x2)`, radius 9px (8px at 390), white display type and
  cream pills.
- *Location card*: forest, radius 9px, padding 24px, a 1px leaf bottom rule. The postcard illustration (235.59 x 184.97,
  square corners) sits beside the store name (21.328px 700 white), the address (15.75px) and a small leaf pill "Shop
  now".
- *Review card*: 1px solid `#dee2e6`, radius 9px, padding 36px, shadow `0 2px 4px rgba(0,0,0,.075)`, 274.5 x 514 at 1440.
  Five forest `fa-star` (20 x 18) on top, text 18/24 forest, a name row with an `fa-user` icon. It runs in a Splide
  carousel.
- *Deal card*: white, radius 9px, padding 24px, soft shadow, a leaf rule on one side. Title 28.432px 700 leaf with
  `fa-fire-alt`, "Valid at ..." in `#9a9a9a`. Hover (source CSS): forest fill, white text, and the button appears.
- *Mood card* (San Pedro): radius 9px, a translucent gradient tint, shadow `0 8px 16px rgba(0,0,0,.15)`, "I’m feeling" +
  an UPPERCASE mood name in white, and a cream pill.
- *Accordion*: forest rows, heading 37.904px white, 1px cream bottom rule; hover and active stay forest (source CSS).

**Inputs.** The store `<select>` has a white .65 fill, 1px `#767676` border, radius 9px and UPPERCASE text. The zip
input and the Gravity Forms inputs are **browser defaults** (2px inset `#767676`, radius 0). Labels are 18px 700 forest,
and the required `*` is `#790000`.

**Icons.** Font Awesome SVG via i2svg: star, user, map-marker-alt, store, instagram, google, yelp, edit, mobile-alt,
cannabis, chevron-left/right, fire-alt. Weedmaps is a raster PNG. **UNVERIFIED:** the Font Awesome version and licence.

**Dividers.** 1px `#dee2e6` (footer, light sections), 1px `#f5f4f1` (accordion on dark), 1px `#5dbc5d` (location card),
and `rgba(93,188,93,.35)` in the age gate (source CSS).

**Age gate and store picker** (source CSS; the captures passed the gate, so it is not in them):
- backdrop `rgba(32,48,34,.88)` with `backdrop-filter: blur(8px)`;
- surface `linear-gradient(165deg, #203022, #304833 55%, #203022)` with radius 1rem;
- the logo with `drop-shadow(0 4px 12px rgba(0,0,0,.25))`;
- glass location rows: white .06 fill, 1px white .1 border, radius .65rem, and a leaf-tinted border and ring on hover;
- a leaf divider at .35.

**This modal is already the most "ethereal" surface on the site** and is a ready-made, on-brand precedent.

---

## 5. Imagery style (viewed: `tmp/understand/brand/sheet-photos.png`, nine photos on disk)

- **The real photos** are phone or prosumer shots: saturated, high-key daylight, hard sun with dappled shade.
  - Recurring props: **cut-crystal trays**, a **gold ribbed lighter sleeve**, coffee-table books, white marble.
  - The packaging is black or white with the stacked lockup.
  - Accent colours: the **red lighter**, gold and amber pressed glass, foliage green bokeh.
- **The storefront**: a white stucco facade under blue sky, with a palm trunk. A pale blue-grey vintage Chevrolet Impala
  (chrome, batwing fins, orange antenna ball) is parked in front of the black window decals.
- **The edibles display**: glass cases with cool-white LED shelf strips and branded caps. A blue neon sign belongs to a
  third party and is unreadable.
- **The mood** is local, sunny, product-proud and a little retro (the classic car, the novels, the postcard
  illustrations). It is neither clinical nor luxury.
- **The postcard illustrations** add a warm dusk palette (peach, pink, orange, mint-teal) and atmospheric haze.
- **Not viewed:** several banner photos referenced only as CSS backgrounds (for example
  `werollup-products-champagne-bar-display-hero.webp`, `cannabis-buds-mason-jars.webp`, `cannabis-13.webp`,
  `kiva-lost-farm-...-hero.webp`) are not in `assets/source` (`assets/media` is empty). Their style is UNVERIFIED here;
  the images lane owns them.

---

## 6. Voice and tone (19 pages read; statistics from `tmp/understand/brand/voice.mjs`)

Pages read: `/`, `/about-us`, `/about-us/daily-deals`, `/weed-delivery`, `/contact`, `/education`,
`/education/cannabis-101`, `/education/recreational-medicinal`, `/products`, `/products/flower`, `/products/edibles`,
`/service-area`, `/service-area/san-pedro`, `/service-area/san-pedro/wilmington-ca`, `/service-area/playa-vista-ca`,
`/service-area/lax/lax-weed-delivery`, `/location/san-pedro`, `/location/culver-city`, `/reviews/james`.

**Traits.**
- **Register.** Warm, welcoming and plain-spoken.
  - Long SEO pages are formal and keyword-led: 26 to 29 words per sentence, with phrases like "best weed products near
    me".
  - Short UI copy is punchy.
  - CTAs are imperative and render UPPERCASE through CSS (they are authored in Title Case).
- **Person.** Second person throughout (you/your: 1.2 to 5.2 per 100 words), paired with "we/our" (0.7 to 5.8 per 100).
- **Vocabulary.** "Weed" is said out loud (H1 "Shop Our Weed Products"), along with "bud", "Hits Different" and
  "Munchie Monday". The name is a pun. Light exclamations appear only in short lines.
- **Community and place.** Harbor towns are named, there is a discount for longshoremen, and the "first licensed"
  pioneer claim recurs.
- **Inclusive.** "anyone and everyone from all walks of life", "built around acceptance".
- **Responsible on product pages.** "Start low and go slow." and 21+ with a valid ID.
- **Bilingual service.** "we always have a Spanish-speaking member of our team onsite" (home) and "We speak Spanish!"
  (About, rendered UPPERCASE).
- **The slang belongs to the customers.** "rad", "Super chill spot with a cool vibe" and "Stoked" come from the review
  carousel (Greg S), which repeats on several pages. Quote it as customer voice and never adopt it as brand copy.

**Verbatim examples.**

| # | Quote | Page |
|---|---|---|
| 1 | "Shop Our Weed Products" | `/` |
| 2 | "Full menu for your selected store, plus fresh daily deals. Browse everything in stock — and check rotating specials before you shop." | `/` |
| 3 | "Get your order how and where it works for you." | `/` |
| 4 | "Our friendly staff is here to help, and we always have a Spanish-speaking member of our team onsite." | `/` |
| 5 | "Awesome! We deliver to you. Fast!" | `/` (zip result) |
| 6 | "Recreational users, medical patients, novices or connoisseurs, all are warmly welcome!" | `/about-us` |
| 7 | "We speak Spanish!" | `/about-us` |
| 8 | "10% Off - Seniors, Military Members, & Longshoremen" | `/about-us/daily-deals` |
| 9 | "Munchie Monday - 10% off Edibles" | `/about-us/daily-deals` |
| 10 | "Getting your favorite cannabis products should be convenient, straightforward, and stress-free." | `/weed-delivery` |
| 11 | "Use this contact form to reach out to our team. We’ll get back to you as quickly as we can, thank you!" | `/contact` |
| 12 | "Step inside We Roll Up and you’ll notice the strains are categorized as indica, sativa, and hybrid." | `/education/cannabis-101` |
| 13 | "We Roll Up is built around acceptance." | `/education/recreational-medicinal` |
| 14 | "Our Flower Hits Different" | `/products/flower` |
| 15 | "Start low and go slow." | `/products/edibles` |
| 16 | "Wilmington sits at the working heart of the Los Angeles Harbor, a neighborhood shaped by refineries, port traffic, and tight-knit residential streets…" | `/service-area/san-pedro/wilmington-ca` |
| 17 | "Our commitment to providing a safe, secure, and welcoming environment extends far beyond our dispensary doors." | `/service-area` |
| 18 | "I’m feeling Blissful" | `/location/san-pedro` |
| 19 | "Great staff. They inform you on deals and are very friendly and efficient. Love this place." (customer) | `/reviews/james` |

**CTA census** (`content-inventory` ctas + buttons, 91 pages):

| Label | Count |
|---|---|
| Contact | 273 |
| Order Flower / Order Pre-Rolls / Order Edibles & Gummies / Order Concentrates / Order Topicals (menu) | 262 each |
| **Order Now** | 188 (all 91 pages) |
| Shop here | 182 |
| Shop LAX - Culver City | 92 |
| Shop San Pedro - Palos Verdes | 91 |
| Call Now | 51 |
| **SHOP NOW** (category tiles) | 14 |
| Shop Now | 8 |
| Get Directions | 2 |
| **See Deals** | home hero (capture) |

**Gate and zip microcopy already on the site** (reuse it as is):
- "Verify Your Age"
- "Are you over the age of 21?"
- "Yes, I'm 21+" and "No, I'm Under 21"
- "Choose Your Location"
- "Where would you like to shop?"
- "Select a store to continue to the right menu, deals, or delivery page."
- "Enter Your Zip Code", "Find my Location", "No Locations Found" and "Search Again"

**Microcopy for anything new (labels, aria text).**

*Do:*
- Reuse the site's own verbs and labels: Order Now, Shop Now, See Deals, Shop here, Call Now, Get Directions, Find my
  Location, Select Location.
- Author labels in Title Case and uppercase them with CSS.
- Keep the store names exactly: "LAX - Culver City" and "San Pedro - Palos Verdes".
- Make aria text specific and plain, for example "Order now at San Pedro - Palos Verdes", "Next review", "Open menu" and
  "Choose your store".
- Keep sentences short, warm and in the second person, with one exclamation at most.
- Keep the age language exact ("21+", "valid ID").
- Give decorative or generated images an empty alt.

*Don't:*
- Add claims, numbers, prices, hours, ratings or superlatives that are not in the crawl or in `facts/client-facts.json`.
- Make health or medical promises.
- Voice the brand in new slang ("dank", "lit").
- Write anything that appeals to minors (see `docs/COMPLIANCE.md`).
- Type ALL-CAPS into the HTML, or put emoji in UI chrome.
- Silently "fix" source copy (rule D2).

**Copy defects to log for the operator** (verbatim rule D2; flagged, not fixed):
- "Marina Del Ray" (`/education`, `/products`);
- "San Pedro ‘s" with a space and a left quote (`/education`, `/products`, `/service-area`, Playa Vista);
- "We Roll Up ," with a space before the comma (`/weed-delivery`, `/education`, `/products`, Playa Vista);
- "with a smile ?" (`/about-us`; probably an emoji that was lost);
- "Culver City, CA 11834" (home location card and footer). The ZIP repeats the street number, but the correct ZIP is
  UNVERIFIED;
- LAX hours on `/contact` read "Coming soon" and "Coming Soon PM".

---

## 7. Keep vs change

**MUST keep:**
- `logo-white-x.png` unchanged, including the trailing full stop and the TM. No redraw and no re-typesetting.
- Forest `#203022` as the dominant dark, leaf `#5dbc5d` as the accent, cream `#f5f4f1` and white as grounds, and
  charcoal `#2c2c2c`.
- Libre Franklin, with bold 700 headings and UPPERCASE CTAs and nav.
- Pill buttons and the 9px card radius family.
- The leaf as the symbol.
- The two postcard illustrations as the location identity.
- Every word of copy, including reviews with names as shown.
- The CTA vocabulary, the bilingual note and the 21+ language.
- The age gate and store-picker flow (D3).

**May change:**
- Layout, layering and depth, motion and hover.
- Glass, haze, glow and gradient surfaces, as long as they are derived from the brand colours.
- The text colour on leaf fills (forest passes AA) and green text on light grounds (use the darker leaf tokens below).
- Form-control styling.
- The icon set (an open-licence equivalent).
- The scale extended with an expressive display size.
- Image crops, frames and protrusions. Real photos stay real and sharp.
- Remove the broken Helvetica and Agrandir @font-face rules and the unused Source Sans Pro files.

### PROPOSED ethereal extension (proposal, not source; every value is derived and ratios are computed)

| Token | Value | Derivation and contrast |
|---|---|---|
| `--wru-forest-950` | `#101811` | mix(forest, black, 50%) |
| `--wru-forest-900` | `#162117` | theme (age-gate hover text) |
| `--wru-forest-800` | `#203022` | measured core |
| `--wru-forest-700` | `#274129` | mix(forest, leaf, 12%); white text 11.22:1 |
| `--wru-forest-650` | `#304833` | theme (age-gate surface); white text 10.00:1 |
| `--wru-forest-600` | `#344f38` | theme (button hover); white text 9.05:1 |
| `--wru-forest-500` | `#2f5230` | mix(forest, leaf, 24%); white text 8.91:1 |
| `--wru-leaf-ink` | `#427d42` | mix(leaf, forest, 45%). Green text at **4.95 on white and 4.50 on cream (AA)**. **Fails on haze-100 (4.38)**: use forest there. |
| `--wru-leaf-ink-large` | `#53a654` | mix(leaf, forest, 16%). 3.02 on white, for headings of 24px and up only. Fails on cream (2.75). |
| `--wru-leaf-700` | `#3c913c` | theme gradient end; 3.96 on white (large text only) |
| `--wru-leaf-500` | `#5dbc5d` | measured core. **Text on it: `#203022` (5.85)** |
| `--wru-leaf-400` / `-300` | `#7ac87a` / `#81cb81` | theme hovers; 6.88 and 7.16 on forest |
| `--wru-leaf-100` | `#dff2df` | theme; forest text 11.88 |
| `--wru-cream-50` / `--wru-mist-50` | `#f5f4f1` / `#f2f5ee` | measured |
| `--wru-haze-100` / `-200` / `-300` | `#eff2eb` / `#e9f0e5` / `#ddebd9` | cream mixed with leaf at 4%, 8% and 16%; forest text 12.30, 11.94 and 11.25 |
| `--wru-cream-300` | `#d5d1c4` | theme light-gradient end |
| `--wru-glow-leaf-12` / `-35` / `-65` | `rgba(93,188,93,.12/.35/.65)` | theme age-gate alphas |
| `--wru-glass-forest` | `rgba(32,48,34,.88)` + `blur(8px)` | theme age-gate backdrop |
| `--wru-glass-white-06` / `-10` | `hsla(0,0%,100%,.06/.10)` | theme age-gate rows |
| `--wru-dusk-peach` / `--wru-dusk-mint` | `#ffccaa` / `#aaccbb` | dominant colours of the location illustrations; forest text 9.60 and 8.00 |
| `--wru-grad-forest-glass` | `linear-gradient(165deg,#203022,#304833 55%,#203022)` | theme |
| `--wru-grad-forest-deep` | `linear-gradient(145deg,#203022,#010201)` | theme |
| `--wru-grad-leaf` | `linear-gradient(145deg,#5dbc5d,#3c913c)` | theme |
| `--wru-grad-cream` | `linear-gradient(145deg,#f5f4f1,#ffffff)` | measured |
| `--wru-grad-haze` | `linear-gradient(180deg,#f5f4f1,#e9f0e5 60%,#ddebd9)` | proposed from the haze tints |
| `--wru-grad-dusk` | `linear-gradient(160deg,#ffccaa,#f5f4f1 45%,#aaccbb)` | proposed from the illustrations |
| `--wru-bloom-leaf` | `radial-gradient(closest-side,rgba(93,188,93,.35),transparent)` | proposed glow |
| shadows | `0 2px 4px rgba(0,0,0,.075)` (measured), `0 8px 16px rgba(0,0,0,.15)` (measured), `0 24px 48px -12px rgba(16,24,17,.45)` (proposed lift for protruding layers) | |
| radii | 9px card, 30px pill (measured); 1rem glass (theme) | |

**Operator decisions:**
- the display face (Libre Franklin only, or adding an open-licence condensed or tight face);
- approving the recoloured dark wordmark, or supplying a vector master;
- forest text on leaf CTAs (passes AA) versus keeping white (fails AA).
