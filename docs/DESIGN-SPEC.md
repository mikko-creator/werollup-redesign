# DESIGN SPEC: We Roll Up redesign, "Green Aura" (dusk edit), the design contract

Written by the WF2 synthesizer on 2026-10-13, 13:28-14:40 CST.
- **Reference prototype:** `tmp/panel/winner/`, a byte copy of `tmp/panel/b/` (designer B, "Green Aura"). Proof:
  `node tools/hashdir.mjs tmp/panel/b tmp/panel/winner --control` gives aggregate `2f625fdb261a…fe00d6a`, 101 files,
  IDENTICAL, and the control fired. The prototype is unmodified.
- **Synthesizer scratch:** `tmp/panel/synth/` (contact sheets, the storefront-hero test in `hero-test/`, its shots and
  `qa-v2.json`, the contrast scripts, the font test).

**Precedence.**
- `docs/BUILD-CONTRACT.md` wins over this spec. `docs/OPEN-DECISIONS.md` section A is binding.
- This spec wins over the prototype. The prototype shows the look and feel; where it differs from this spec, follow the
  spec. Every difference is listed in section 1.3.
- `docs/BRAND-SYSTEM.md`, `docs/COMPLIANCE.md`, `docs/COMMERCE.md` and `docs/SITE-ARCHITECTURE.md` stay binding where this
  spec is silent. Report every conflict you find in your structured output.

**Evidence labels.**
- *(B)*: designer B's own measurement (`tmp/panel/b/NOTES.md`, `tmp/panel/b/shots/qa-*.json`).
- *(J-brand)*, *(J-craft)*, *(J-ux)*: a judge's re-measurement. The harness refused the judges' REPORT.md writes, so their
  reports exist only as the structured results the orchestrator passed to this synthesizer. Their working evidence is in
  `tmp/panel/judge-brand/`, `tmp/panel/judge-craft/` (notes.md, probe/, sheets/) and `tmp/panel/judge-ux/`
  (VIEW-NOTES.md, probe/, sheets/).
- *(S)*: measured by the synthesizer this session, in `tmp/panel/synth/`.
- **UNVERIFIED**: nobody measured it.

---

## 1. Decision

### 1.1 The vote

| Judge (lens) | Picked | A / B / C totals | Maximum |
|---|---|---|---|
| judge-brand (brand fidelity, character, operator taste) | C | 98 / 104 / 105 | 130 (13 criteria) |
| judge-craft (ethereal, depth, protrusions, motion, hover, polish, cost) | **B** | 45 / **51** / 45 | 70 (7 criteria) |
| judge-ux (shopping paths, gate, legibility, a11y, compliance, build) | A | 45 / 41 / 42 | 60 (6 criteria) |

- Each direction got one vote, so the rule's tie-break applies: **the higher summed score across the three lenses.**
- **Summed: A 188, B 196, C 192. B wins.** (S) I re-added every per-criterion score from the three structured results;
  all nine totals match the judges' own.
- The result does not depend on the lenses' different scales. Normalised to each lens's maximum and summed: A 2.147,
  **B 2.212**, C 2.151. (S)

### 1.2 Why Green Aura

- **It is the most complete system** (J-craft 51/70, the only lens whose winner it was). Depth, protrusions, motion and
  hover share one idea, the light-box stack, from the bands to the gate. It also has the cleanest motion engineering.
- **Several of its parts are the best on the panel:**
  - the mega menu: six tall image cards, and identical hover and real-Tab focus states (lift 6 px, image 1.08) (J-brand,
    J-craft);
  - the most readable protrusions: the tilted postcards over the store-card tops (J-craft, J-ux);
  - the long-form reading card at 62-75 characters per line (J-ux);
  - the age gate closest to the source's state changes (J-ux, J-brand);
  - the lightest images: 398 KB at load (J-craft).
- **Its weaknesses can be fixed with grafts from A and C:**
  - a generated hero that is not the client's own (J-brand, J-ux);
  - a night-heavy rhythm, with 5 of 8 home bands dark (J-ux, J-craft, J-brand);
  - no location chooser and no per-category store choice (J-ux);
  - a CBD tincture protrusion with legible label claims (J-craft, J-ux);
  - glass that does not read as glass at 1600 and on phones (J-craft).

  Section 1.3 makes each fix mandatory.

### 1.3 Required deltas from prototype B

These are mandatory. Each names its source and the section that specifies it in full.

| # | Delta | Source | Spec |
|---|---|---|---|
| D-1 | **The hero visual becomes the client's real storefront.** `storefront-car-side` (the source's own home-hero image) sits in a hero-scale light box. The box has a hard left edge at about 40% of the hero width, bleeds off the right edge, and has one back plate. The glass pane overlaps the box's left edge. The generated bud (`g1`) moves to the /products banner, and is the documented alternative hero (Q1). | J-brand (B's hero "a generated bud any dispensary could use", character 6); J-ux (no client-owned LA object above the fold); J-craft graft 2 (put image under the glass); B's own critique. **Feasibility measured (S)** on a scratch copy (`tmp/panel/synth/hero-test/v2.html`): storefront sharpness 1.686 / 1.682 / 1.021; pane glass range 0.394 / 0.298 at desktop; hero type contrast minimum 4.76 (large) | 6.9 |
| D-2 | **The hero glass reads as glass at all three windows.** On phones the pane fails today: 0.089 in the scratch test, 0.041 in J-craft's run of B. Put the photo and the mist plate under the pane, or make the pane an honest opaque card with no blur. | J-craft B-2; (S) | 4.1, 6.9, R-11 |
| D-3 | **Rebalance the rhythm toward light.** The accordion band becomes a calm light haze band. The Community band becomes a dusk band on A's generated dusk-palms plate. The home page goes from 5 dark bands to 4 (hero, Serve, ZIP, footer). | J-craft graft 1; J-brand ("night mood moves the brand off its warm daylight"); J-ux ("5 of 8 bands near-black", nightlife lean) | 6.10, R-44 |
| D-4 | **Dusk grade instead of acid green.** The hero ground gets a leaf glow at the top left and a peach `#ffccaa` dusk glow at the bottom left. The saturated green smoke leaves the first screen. Any green-tinted atmosphere is graded at saturation 0.84 or less. | J-brand graft 6 (A's peach warmth); J-craft (A's light end); B's critique ("close to acid") | 4.2, 6.9 |
| D-5 | **The CBD tincture protrusion is removed.** Its "HIGH-POTENCY" and "1500 MG" claims are legible at 352 CSS px, and A10 / IMAGE-INVENTORY route label claims to compliance. The LA-cap cut-out moves to the Serve light box (H3). A's real red-lighter cut-out rises out of the Community frame's top edge (H4). | J-craft B-5 and graft 3; J-brand graft 2; J-ux compliance | 5.4 |
| D-6 | **The light-box stack also reads on light grounds:** leaf-tinted plate edges, a soft shadow and a haze fill on cream and white bands. | J-craft B-7; B's critique; J-brand | 5.2 |
| D-7 | **Backdrop-filter budget.** Light-box plates use static, pre-blurred translucent fills with no `backdrop-filter`. Live blur is allowed only on the scrolled header, the hero pane, the mega panel, the chooser and gate backdrops, and the phone-sheet scrim. At most 3 visible at load. | J-craft B-3 (8 visible at load; style recalc 271 ms) | 4.1, R-13 |
| D-8 | **The display face ships as a Latin WOFF2** with the axes pinned `wdth=100,opsz=96` (`wght` stays variable). Use `tools/font-woff2.mjs`; fontTools is installed. Measured (S): **46,860 B**, against the prototype's 408,496 B TTF. | J-craft B-4; (S) `tmp/panel/synth/fonttest/` | 3.2, R-39 |
| D-9 | **Shopping paths follow the source.** Build the location chooser. Hero ORDER NOW, SEE DEALS, the Delivery card and the body Order Now / Shop Now buttons open it. Header Order Now resolves to the selected store, then the cookie, then the chooser. The select starts at "Select a Location", and changing it navigates. | J-ux (B 5/10: "hero ORDER NOW sends San Pedro shoppers to the LAX menu"); BUILD-CONTRACT 4.5; SITE-ARCHITECTURE 6.1-6.2 | 6.1, 6.8, R-20 |
| D-10 | **Mega menu.** Each card gets San Pedro and LAX chips to the verbatim store items; B's two verbatim store columns stay. A keyboard open moves focus to the first card, and the panel follows its trigger in the DOM. The card hover state keys on `:hover` and `:has(:focus-visible)`, never on programmatic focus. | J-ux (no per-category store choice; focus does not enter the panel); J-ux graft (A and C chips); J-brand must-fix on C (a pre-zoomed first card), applied here preventively | 6.4, R-17 to R-19 |
| D-11 | **Keyboard parity on every hover:** the store cards, the Delivery card and the review cards included. | J-craft B-1 and graft 6 | 7.4, R-29 |
| D-12 | **Reveal rules never reset hover transforms.** Reveals sit on wrappers; hovers use the individual `translate` / `scale` properties on the inner element. | J-craft graft 6 (C's refuted "never conflict" claim) | 7.2, R-25 |
| D-13 | **Motion hygiene.** No infinite CSS animation: the hero drifts are gone with the bud. No scroll listener under reduced motion. Section progress is clamped. Loops pause off-screen and carry a pause control. | J-craft B-8 and graft 5; J-ux (WCAG 2.2.2) | 7, R-26 to R-28 |
| D-14 | **No orphan dashes.** Each "Hits Different" item is set as one paragraph, as in the source: bold label, then " – ", then the text. | J-craft B-6; J-ux | 6.17 |
| D-15 | **The gate is production-grade (A6).** It runs a first-visit check with no query flag, makes main `inert`, locks body scroll, focuses the denied text after No and the first store row after Yes, and does not close on Escape or a backdrop click. | J-ux (focus drops to BODY after No; no body lock; "production gate, all three"); BUILD-CONTRACT 4.4 | 6.7, R-21, R-22 |
| D-16 | **Phone tap targets:** every non-inline control at least 24x24 CSS px, primary controls at least 44 px tall. | J-ux (B had 15 under 24 px: social text links 15 px tall, footer links 19 px) | 9, R-32 |
| D-17 | **Licence line:** 16 px or larger, as the last item of the footer Quick Links (its source place, link `/home`), AA on painted pixels. | J-ux (14 px in B); COMPLIANCE B1.1 | 6.6, R-34 |
| D-18 | **Phone top bar:** the address and hours sit on their own row at 14 px or larger (B's are tiny). | J-ux | 6.1 |
| D-19 | **Every `nav` landmark is labelled.** | J-ux (one unlabelled nav) | 9 |
| D-20 | **A calmer flower banner:** a deeper veil behind the title. | J-craft ("busy behind 'Flower'"); B's critique | 6.17 |
| D-21 | **The promo marquee is carried as a STATIC strip** (verbatim, no motion): under the header on the 39 other global pages, and after the hero on home, below the first screen. B omitted it, which breaks chrome parity. | J-ux (ticker: WCAG 2.2.2 and B6); BUILD-CONTRACT 4.2 (parity covers chrome); B6 | 6.3, R-7 |
| D-22 | **Build every template the prototype lacks:** store pages with the "You're shopping" strip, the chooser, shop embeds, contact, legal, archives, reviews, service area, delivery, 404. | brief; CONTENT-MODEL section 2 | 6 |
| D-23 | **AI labels on every served generated file.** WebP gets `webpmux -set xmp tools/ai-label.xmp`, checked by a byte grep with a real-photo control. JPEG, PNG, MP4 and WebM go through `tools/ai-label.mjs`. | J-ux graft (B's method); BUILD-CONTRACT 4.10 | 10.6, R-35 |
| D-24 | **One accent per statement at most.** The leaf glow word belongs to the hero h1 only. Other statements use B's 300/800 weight contrast or one leaf-ink word, never the same device in two adjacent sections. | J-craft graft 7 (A's restraint); J-brand (A's repeated serif word "becomes a formula") | 3.2 |
| D-25 | **The reviews rail never autoplays** (B's scroll-snap rail with Previous / Next). This deviates from the source's Splide autoplay, for WCAG 2.2.2. | B's notes; J-ux | 6.15, Q2 |
| D-26 | **Prototype-only behaviour is removed:** `?state=` flags, the preselected San Pedro store, `data-proto-href` rewrites. | B's notes ("prototype links") | R-49 |

### 1.4 Must-fixes and grafts NOT adopted, with reasons

- **C's classic-car cut-out** (J-craft graft 4, J-ux graft 1, J-brand's winning move). Not adopted as a cut-out, for
  three reasons:
  - home already carries the maximum of 4 protrusions (5.4);
  - the car is shown, whole and real, inside the D-1 hero photo, its source role;
  - C's cut-out carries the "IMPALA" script, a third-party mark, in a new prominent role (J-ux compliance note; A10).
- **J-ux's "fuller mega" rail** (Education and Locations inside the Products panel). Adopted only in part. Best Selling
  for each store is already in B's columns. Education, Locations and About stay in the Menu sheet, one click away, so
  the panel still fits 585 px (R-19).
- **J-brand's must-fixes written for C** (phone wordmark 180/220 px, sticky chrome 93 px, pre-zoomed first card, outline
  accent words, car framing, storefront headroom 1.009, "Weed" at 3.69). Each is covered here as a rule, not a fix:
  - wordmark at 133 px or less on DPR 3 (R-3);
  - sticky chrome at 72 px or less (R-4, section 8);
  - zoom keyed to real hover or focus (D-10);
  - no outline type anywhere (3.2);
  - storefront at 1.3 or more on desktop (R-1);
  - hero type measured on painted pixels (R-9: 3.0 or more for large text, 4.5 or more for body). The scratch hero
    reaches 4.76 large.
- **J-ux's must-fixes written for A.** Most are adopted as deltas or requirements:
  - the ticker (D-21);
  - mega glass legibility (G3 in 4.1, R-19);
  - mega keyboard order (D-10);
  - chips on one row (R-19);
  - the long-form measure (6.19, R-45);
  - the gate states and the production gate (D-15).

  The rest do not apply to B: the ribbon, the jar break-out, P4 and the re-shoot. Their principles are kept: no
  runtime-built decorative canvas, protrusions that cross by 20 px or more (R-14), and shots re-taken after the last
  code change (R-50).
- **J-brand graft 1 (Anton) and A's Instrument Serif.** Not adopted. A3 allows one extra display face, and B's
  Bricolage is the panel's "most designed type" (J-brand 8, J-craft).

---

## 2. Concept and signature moves

**Green Aura, at dusk: We Roll Up lit from inside as the LA evening comes down.**
- Deep forest bands carry a soft, monochrome leaf glow and a warm peach dusk light, both drawn from the brand's own
  colours and the two store postcards.
- These alternate with calm cream and haze bands, where content sits on opaque white cards.
- The client's own street-level objects hold the character: the storefront with the finned classic car, the LA cap, the
  red We Roll Up lighter, the jars and the two postcards. They sit in frosted light boxes, or step out of them.
- Ethereal comes from light, glass and haze, never from texture behind words.

**Signature moves.**
1. **The light-box stack.** A photo sits in a frame with one or two translucent plates stacked behind it (offsets 22/20
   and 44/40 px). On scroll the plates fan out in depth, align at the viewport centre, and fan out again as they leave. A
   real object breaks out of the frame. It appears at four scales:
   - the hero (the storefront, D-1);
   - the Serve and Community bands;
   - the gate;
   - the store-page heroes (the postcards).
2. **Weight-contrast statements.** Bricolage Grotesque, a hairline 300 line over an 800 line ("Shop Our" over "Weed
   Products"). The leaf glow word appears once, in the hero.
3. **Real objects crossing hard seams:** postcards over store-card tops, the cap and the lighter out of their frames, the
   bud across the flower banner seam, the grinders frame across a band seam.
4. **Dusk air:** a peach-and-leaf glow in the hero, a dusk-palms band, and mist ribbons in the night bands, always masked
   and never behind text.

---

## 3. Tokens

### 3.1 Colour: roles and measured contrast

Values are from BRAND-SYSTEM.md (measured or theme) and B's `:root`. One token is new: `--leaf-ink-deep`. All ratios
are (S) `tmp/panel/synth/contrast.mjs` and `contrast2.mjs`, which reproduce BRAND-SYSTEM's own figures (13.93, 12.67,
5.85, 4.95, 2.38).

| Token | Hex | Role |
|---|---|---|
| `--forest-950` | `#101811` | night ground: top bar, hero, Serve band, ZIP band, footer |
| `--forest-925` | `#131d14` | night ground variant (prototype) |
| `--forest-900` | `#162117` | opaque cards on night |
| `--forest` | `#203022` | body text on light, forest buttons, Delivery card, gate surface ends |
| `--forest-700` / `-650` / `-600` | `#274129` / `#304833` / `#344f38` | gradients; gate surface middle; forest-button hover layer |
| `--leaf` | `#5dbc5d` | primary CTA fill (label forest), the hero glow word, focus ring on dark |
| `--leaf-300` / `-400` | `#81cb81` / `#7ac87a` | leaf hover layer; small headings and links on night |
| `--leaf-100` | `#dff2df` | chips, Yes-button hover (theme) |
| `--leaf-ink` | `#427d42` | green text on **white or cream only** |
| `--leaf-ink-deep` (new) | `#3b723b` | green text on haze grounds |
| `--cream` | `#f5f4f1` | calm band; text on night |
| `--haze-100` / `-200` / `-300` | `#eff2eb` / `#e9f0e5` / `#ddebd9` | calm light bands, card borders |
| `--white` | `#ffffff` | content cards, reading card, review cards |
| `--peach` | `#ffccaa` | dusk glow, LAX card wash (from the postcard) |
| `--mint` | `#aaccbb` | San Pedro card wash (from the postcard) |
| `--ink-muted` (new) | `#55625a` | secondary text on light grounds (replaces the source's failing `#9a9a9a`) |
| `--charcoal` | `#2c2c2c` | kept; `btn-light` label only |
| `--glow-12/20/35/65` | `rgba(93,188,93,.12/.2/.35/.65)` | plate edges, halos, the accordion edge, the header progress line |

**Contrast pairs (S):**

| Text | Ground | Ratio | Use |
|---|---|---|---|
| `#203022` | `#ffffff` / `#f5f4f1` / `#eff2eb` / `#e9f0e5` / `#ddebd9` | 13.93 / 12.67 / 12.32 / 11.98 / 11.25 | body on every light ground |
| `#203022` | `#5dbc5d` | **5.85** | label on every leaf button (A5) |
| `#203022` | `#81cb81` (hover) / `#dff2df` | 7.16 / 11.88 | label on hover, chips |
| `#203022` | `#ffccaa` / `#aaccbb` | 9.60 / 8.00 | text on the postcard washes |
| `#ffffff` / `#f5f4f1` | `#101811` | 18.09 / 16.45 | text on night |
| `#f5f4f1` | `#162117` / `#203022` | 15.10 / 12.67 | text on night cards |
| cream at .82 / .72 alpha | `#101811` | 11.24 / 8.87 | secondary / muted text on night (floor .72) |
| `#5dbc5d` | `#101811` / `#203022` | 7.60 / 5.85 | leaf text or icons on night (footer store names) |
| `#81cb81` | `#101811` / `#203022` | 9.30 / 7.16 | leaf-300 headings and links on night |
| `#427d42` | `#ffffff` / `#f5f4f1` | 4.95 / 4.50 | leaf-ink text (AA) |
| `#427d42` | `#eff2eb` / `#e9f0e5` | **4.38 / 4.26: FAIL** | never: use `#3b723b` (4.94 on `#e9f0e5`, 4.64 on `#ddebd9`) or forest |
| `#55625a` | `#ffffff` / `#f5f4f1` / `#e9f0e5` | 6.40 / 5.82 / 5.50 | muted text |
| `#ffffff` | `#5dbc5d` | **2.38: FAIL** | never (A5) |
| `#5dbc5d` | `#ffffff` | **2.38: FAIL** | never as text on light |
| focus ring `#5dbc5d` | `#101811` | 7.60 | non-text 3:1 met |
| focus ring `#427d42` | `#ffffff` / `#e9f0e5` | 4.95 / 4.26 | non-text 3:1 met |

**Painted contrast in the hero (S, scratch D-1 test, qa-probe p05):**
- "Shop Our": 8.38 / 8.43 / 7.82;
- "Products": 4.84 / 4.76 / 5.11 (large text);
- "Weed": 5.99 / 5.98 / 4.84;
- lead line: 8.05 / 9.69 / 14.97;
- page minimum: "Around Cannabis" 4.66 / 4.67 / 4.58 (large).

### 3.2 Type

**Faces** (both local, preloaded, `font-display: block`):

| Face | Licence | Files | Role |
|---|---|---|---|
| **Libre Franklin**, variable 100-900, normal and italic | SIL OFL 1.1, "Copyright 2020 The Libre Franklin Project Authors" (BRAND-SYSTEM 2.1) | kit woff2: `libre-franklin-normal-latin.woff2` 29,292 B, `-latin-ext` 25,692 B (unicode-range), italic 32,856 B (load only if used) | the brand face: body, UI, nav, buttons, labels, top bar, footer, forms, small headings |
| **Bricolage Grotesque**, variable (opsz 12-96, wdth 75-100, wght 200-800) | SIL OFL 1.1, "Copyright 2022 The Bricolage Grotesque Project Authors"; from github.com/google/fonts `ofl/bricolagegrotesque`; licence text `tmp/panel/b/fonts/OFL-BricolageGrotesque.txt` | **ship** `assets/fonts/bricolage-grotesque-latin.woff2` made with `node tools/font-woff2.mjs --in <ttf> --out <woff2> --license <OFL.txt> --pin "wdth=100,opsz=96"`: 46,860 B (S) | **statements only**: hero h1, page-banner h1, section statements (h2), card and accordion titles, footer store names |

Rules:
- No other face ships. Helvetica Neue Condensed and Agrandir never ship (A3).
- No outline (stroke-only) type anywhere.
- No uppercase typed into the HTML: uppercase comes from CSS.
- Bricolage never sets a `p`, `li`, button, nav link or form label (R-42).

**Scale.**

| Role | 1440x900 | 390 | Face, weight | Leading, tracking |
|---|---|---|---|---|
| Hero h1 | `clamp(52px, min(6.4vw, 13.2svh), 104px)`: 92 px at 1440x900, 77 px at 1280x585 | `clamp(46px, 13.4vw, 60px)`: 52 px | Bricolage, line 1 at 300, line 2 at 800 | .9; -.035em (line 1 -.02em) |
| Banner h1, short (one word, ≤ 12 characters: "Flower", "Products", "Contact") | `clamp(96px, 16vw, 230px)` | `clamp(64px, 20vw, 96px)` | Bricolage 800 | .86; -.04em |
| Banner h1, long (store, town, legal titles) | `clamp(44px, 5.2vw, 80px)` | `clamp(34px, 9vw, 44px)` | Bricolage 800 | 1.0; -.03em |
| Statement h2 | `clamp(36px, 4.4vw, 66px)` | 34-40 px | Bricolage, 800 (an optional first line at 300) | 1.0; -.03em |
| Card / accordion title | 22-28 px | 20-22 px | Bricolage 700 | 1.15; -.015em |
| Long-form h2 / h3 | 30 / 22 px | 26 / 20 px | Bricolage 700 (h3 may be leaf-ink on white) | 1.15 |
| Lead | 20 px | 18 px | Libre Franklin 500 | 1.4 |
| Body | 18 px | 17 px | Libre Franklin 400 | 1.65 |
| Long-form body | 18.5 px in a 630 px card (62-75 characters per line, J-ux) | 17.5 px | Libre Franklin 400 | 1.75 |
| Small, addresses | 15 px | 15 px | Libre Franklin 400/600 | 1.5 |
| Eyebrow | 13 px UPPERCASE | 13 px | Libre Franklin 700 | .14em |
| Nav, buttons | 14-15 px UPPERCASE | 14 px | Libre Franklin 700 | .07em |
| Top bar | 14 px (hours 700 UPPERCASE) | 14 px | Libre Franklin | .02em |
| Licence line | 16 px or more | 16 px or more | Libre Franklin 700 | normal |

- The minimum text size anywhere is 14 px. The only exception is the breadcrumb at 13 px bold: it is navigation, and
  it is legible on a flat ground.
- **Accents** (D-24):
  - the hero's "Weed" in leaf `#5dbc5d` with a glow `text-shadow: 0 0 28px rgba(93,188,93,.35)`, on night only;
  - elsewhere, at most one accent per statement: either the 300/800 split, or one word in leaf-ink (light grounds) or
    leaf-300 (night);
  - adjacent sections never use the same device.

### 3.3 Spacing

- **Base:** a 4 px base step: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Section padding:**
  - desktop `clamp(72px, 9vw, 128px)` top and bottom;
  - phones 56-72 px;
  - a band that receives a protrusion adds the crossing depth to its padding, so the object never meets text.
- **Container:**
  - max 1200 px; long-form card 630 px;
  - gutter `clamp(20px, 4.2vw, 56px)` (prototype `--gutter`).
- **Gaps:** 18-28 px between cards (B's grids), and 12 px inside the mega card row.

### 3.4 Radii

| Token | Value | Use |
|---|---|---|
| `--r-s` | 9 px | the source's 9px card family: small cards, chips, inputs |
| `--r-m` | 18 px | content cards, review cards, store cards |
| `--r-l` | 27 px | light boxes, the hero pane, the gate card, the mega panel |
| pill | 999 px | every button (pill buttons and UPPERCASE CTAs, the source habit) |

### 3.5 Shadows

| Token | Value | Use |
|---|---|---|
| `--sh-1` | `0 2px 4px rgba(0,0,0,.075)` (measured) | resting cards on light |
| `--sh-2` | `0 8px 16px rgba(0,0,0,.15)` (measured) | raised cards |
| `--lift` | `0 30px 60px -28px rgba(16,24,17,.55), 0 10px 22px -12px rgba(16,24,17,.35)` (B) | hover lift, light boxes |
| `--sh-cut` | `drop-shadow(0 26px 24px rgba(0,0,0,.45))` (B) | cut-outs on night |
| `--sh-cut-light` | `drop-shadow(0 18px 18px rgba(16,24,17,.28))` | cut-outs on light grounds |
| `--glow` | `0 0 80px -20px rgba(93,188,93,.35)` | back plate halo |

### 3.6 Z-planes

| z | Layer |
|---|---|
| -3 to -1 | atmosphere inside a band (ground gradient, mist or dusk plate, glows) |
| 0 | light-box plates |
| 1 | frames, cards, the hero pane |
| 2 | protruding cut-outs (above their own frame and the next band's ground, below any text card they approach) |
| 10 | sticky header (top bar plus nav) |
| 20 | mega panel |
| 30 | menu-sheet scrim and sheet |
| 40 | location chooser |
| 50 | age gate |

---

## 4. Glass and atmosphere recipe

### 4.1 Where glass is allowed (closed list)

| Surface | Recipe | Fallback (`@supports not (backdrop-filter: blur(1px))`) |
|---|---|---|
| G1 hero pane | `linear-gradient(155deg, rgba(48,72,51,.5), rgba(16,24,17,.62) 60%, rgba(16,24,17,.7))`; `backdrop-filter: blur(16px) saturate(125%)`; 1 px `rgba(255,255,255,.13)` border; `inset 0 1px 0 rgba(255,255,255,.14), 0 40px 90px -40px rgba(0,0,0,.8)`; a leaf hairline on the top edge (B) | `rgba(16,24,17,.9)` |
| G2 header, scrolled only (`.is-scrolled`) | `rgba(16,24,17,.78)`, `blur(14px) saturate(120%)`, a 1 px glow line under it. **At scroll 0 the header is opaque `#101811` with no filter**, so the qa-probe glass check never meets flat glass. | `rgba(16,24,17,.96)` |
| G3 mega panel | `rgba(16,24,17,.97)`, `blur(18px)`. Near-opaque, so no hero glyph shows through it (J-ux ghosting on A and C). | `#101811` |
| G4 menu-sheet scrim | `rgba(16,24,17,.6)`, `blur(6px)`. The sheet itself is opaque: `linear-gradient(165deg,#203022,#304833 55%,#203022)`. | scrim `.8` |
| G5 chooser and gate backdrop | `rgba(32,48,34,.88)`, `blur(8px)` (source CSS). The surface is opaque: `linear-gradient(165deg,#203022,#304833 55%,#203022)`, radius `--r-l`. | the same backdrop at `.96` |

- No other element may have a `backdrop-filter`. Light-box plates are **static** translucent fills with no backdrop
  filter (D-7). The light-box frame is an opaque photo mount.
- **Backdrop rule.** Every element with a backdrop filter must have real variety behind it: a luminance range (p95 - p05)
  of 0.10 or more in the qa-probe glass check, at all three windows (R-11).
  - The hero pane meets it by overlapping the storefront light box: 0.394 and 0.298 at desktop (S).
  - On phones, the pane overlaps the photo by 120 px or more, and the mist plate S-MIST lies under its lower half. If the
    check still fails at 390, the phone pane drops its blur and becomes opaque `#162117` at .96. That is an honest card.
- **Text on glass** passes R-9 with and without the filter (R-12).
- **No nesting:** no element with a backdrop filter may have an ancestor with one (R-13).

### 4.2 Atmosphere layers

| Layer | Asset | Where | Rule |
|---|---|---|---|
| Leaf glow | `radial-gradient(40% 60% at 18% 30%, rgba(93,188,93,.16), transparent 70%)` | hero, night bands | static, no animation |
| Dusk glow | `radial-gradient(45% 60% at 10% 100%, rgba(255,204,170,.14), transparent 70%)` | hero (bottom left), ZIP band | static |
| Mist plate | S-MIST (B `g6` mist ribbons, graded to saturation 0.84 or less) | Serve band, flower "Hits Different" band, under the phone hero pane | masked radially (`mask-image: radial-gradient(…)`); never behind a text box unless an opaque card covers that box; optional loop V-MIST |
| Dusk-palms plate | S-DUSK-PALMS (A `haze-palms`) | Community band (home), the banners of the 4 pages in 6.17 | full-bleed under a cream veil (`linear-gradient(180deg, rgba(245,244,241,.85), rgba(245,244,241,.2) 40%, transparent 70%)`); text only on opaque cards; optional loop V-DUSK |
| Trichome plate | S-TRICHOME (B `g2`) | /products/flower banner | veil per 6.17; optional loop V-TRICHOME |

- **Never** a pattern, texture or photo behind running text.
- A section with an atmosphere layer is always followed by a calm section (R-44).

---

## 5. Depth system and protrusions

### 5.1 Planes and motion

| Plane | Content | Motion (desktop at 761 px and up; off under reduced motion) |
|---|---|---|
| 0 atmosphere | band grounds, glows, mist and dusk plates, optional loops | plates translateY `-p x 70-90` px; loops play only in view |
| 1 glass and frames | the hero pane, light-box frames and plates, cards | plates `-p x 46 / 26 / 8` px (fan out); the hero photo `-p x 24` px (vertical only, so sharpness holds) |
| 2 content | opaque cards, text | none (reveal once) |
| 3 foreground | cut-outs, postcards, framed protrusions | cut-outs `-p x -56 / -60` px (B); postcards static, hover straightens |
| UI | header, mega, sheet, chooser, gate | fade and slide on open |

`--p` is set per `[data-depth]` section by one rAF-throttled passive scroll handler. It runs from +1 (entering) to -1
(leaving), **clamped**. It is applied with the individual `translate` property.

### 5.2 The light-box stack (signature component)

- **Frame:** an opaque photo mount, padding 14 px, radius `--r-l`, the photo `object-fit: cover`, inner radius 17 px.
- **Plates:** two plates behind it at `translate 22px 20px` (opacity .8) and `44px 40px` (opacity .55, with `--glow`).
  The hero light box uses one plate, offset left (-26 px, +20 px), because it bleeds off the right edge.
- **On night:**
  - plate fill `linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02))`;
  - border `rgba(255,255,255,.12)`.
- **On light grounds (D-6):**
  - plate fill `linear-gradient(160deg, rgba(255,255,255,.92), rgba(233,240,229,.7))`;
  - border `1px solid rgba(66,125,66,.35)`;
  - shadow `0 20px 60px -30px rgba(32,48,34,.45)`.

  R-44's screenshot check confirms the plate edges are visible.
- **Hover and focus inside the box:** plates fan to `30px 27px` / `58px 52px` (.7 s ease-out), and the cut-out rises 6 px.
- **No backdrop filter on the plates** (D-7).

### 5.3 Protrusion rules (measurable: R-14 to R-16)

1. **Hard seams only.** A protrusion crosses a hard edge: a band edge with a tone change, a card edge or a frame edge.
   It never crosses a soft fade.
2. **Crossing depth.** At least 20 CSS px of the object's own opaque pixels (alpha above 128) lie on each side of the
   seam at 1280. At 390, at least 12 px.
3. **No overlap.** Opaque pixels intersect 0 CSS px² of any text box, interactive box, the hero pane or the hero copy, at
   1280x585@1.5, 1600x662@1.2, 1024x768 and 390x844@3. If an overlap appears at some width, move or shrink the object at
   that breakpoint.
4. **Count.**
   - Home: exactly 4.
   - /products/flower: 2.
   - Every other template: at most 1 (the default is the table in 5.4).
   - No protrusion in the hero, on shop pages, or on /lax-menu.
5. **Sharp.** Painted at 1.0 or more file px per device px at all three windows. Serve each cut-out at 1x to 2x its
   painted device width.
6. **Decorative.**
   - `alt=""` with `data-decorative`;
   - `aria-hidden="true"` on the wrapper;
   - `pointer-events: none`;
   - `data-protrude` for the probe.

   Clip overflow with `overflow-x: clip` on `body`, never on the section. A protrusion never raises `scrollWidth`.
7. **Scroll offset.** The scroll-linked offset is clamped, so the at-rest geometry at scroll 0 already satisfies rule 3.

### 5.4 Inventory

| # | Page | Object | Seam | Size (CSS) at 1280 / 1600 / 390 | Sharpness check | Source |
|---|---|---|---|---|---|---|
| H1 | home | San Pedro - Palos Verdes postcard (real, torn-paper alpha), -4° | top edge of its store card | 203x183 / 222x200 / 191x171; crosses by 60 / 61 / 57 | 600 px file: 1.97 / 2.25 / 1.05 | B |
| H2 | home | LAX - Culver City postcard, +3° | top edge of its store card | 201x192 / 220x210 / 189x180; crosses by 54 / 54 / 52 | 600 px file: 1.99 / 2.27 / 1.06 | B |
| H3 (moved) | home | We Roll Up LOS ANGELES cap: B's real-photo cut-out `cap-cut-900` (from `7ed18521`) | bottom and left edges of the **Serve** light-box frame (where the CBD bottle was) | about 240 / 260 / 150 wide | 900 px file: 2.5 / 2.9 / 2.0 (S, arithmetic) | B (moved, D-5) |
| H4 (graft) | home | red We Roll Up lighter: A's cleaned real-photo cut-out `cut-red-lighter.webp` 540x710 (from `8bd7f345`), aligned over its own photo twin | **top edge** of the Community light-box frame | 239x315 / 232x305 / 165x217 | 1.51 / 1.94 / 1.09 | A (P2); J-craft and J-brand graft |
| F1 | /products/flower | cured-bud cut-out, generated (B `g5`, `bud-cut-760`) | the banner's bottom seam into the intro band | 243x276 / 280x318 / 118x134 | 2.08 / 2.26 / 2.15 (B) | B |
| F2 | /products/flower | real `flower-grinders-1280` in a white frame, 2.5° | bottom seam of the night "Hits Different" band | 393x233 / 450x266 / 311x184 | 1280 px file: 2.17 / 2.37 / 1.37 | B |
| T1 | each of the 15 service-area pages | the postcard of its group (San Pedro group: the 5 `/service-area/san-pedro*` pages; every other town page: LAX - Culver City) | the banner's bottom edge, right side | 220 / 220 / 180 wide or less | 1.82 / 2.27 / 1.11 | new (C and B postcard language) |
| T2 | /products/pre-rolls | the red-lighter cut-out | the banner's bottom edge | 180 / 200 / 120 wide | 2.0 or more / 1.5 | new |
| T3 | /weed-delivery | the cap cut-out | the split section's light-box frame | 220 / 240 / 140 wide | 2.0 or more | new |
| T4 | both store pages | the store's postcard in the hero light box, crossing its top-right frame edge | frame edge | 300 / 340 / 190 wide or less | 600 px file: 1.33 / 1.47 / 1.05 | new |

- Every other template has none.
- **The CBD tincture (`e181cbbf`) is not promoted anywhere** (D-5). It stays only where the source shows it: the CBD
  category card on the store pages, at card size.

---

## 6. Components

The tables below give structure, states and measurements. All copy is verbatim from `docs/data/content-blocks.json`,
`docs/data/site-map.json` and `audit/raw/*.html`, delivered by the pipeline in `page` and `ctx`
(`docs/PIPELINE-CONTENT.md`, `docs/PIPELINE-SITE.md`).

### 6.1 Top bar and store switcher (`ctx.topBar`; SITE-ARCHITECTURE 5.1 and 6.1)

- **Ground and height:** forest-950, 40 px on desktop. On phones it is one row, or two when a store is selected.
- **Content, left to right:**
  - the store icon and `<select name="currently-shopping">` with the options "Select a Location", "LAX - Culver City" and
    "San Pedro - Palos Verdes" and their verbatim `data-*` attributes;
  - the address (`#locationAddress`) and the hours (`#locationHours`, "Open: 10:00 AM - 10:00 PM" from `data-hours`);
  - at 768 px and up, on the right, the socials as text links "Instagram", "Google", "Yelp", "Weedmaps", with the
    verbatim hrefs, each a target of at least 24x24 CSS px.
- **Behaviour** (BUILD-CONTRACT 4.5, D-9):
  - the select starts at "Select a Location" unless the path or the `selected_location` cookie selects a store;
  - on change it sets the cookie (30 days), fills the address and hours, rewrites the `.active-location-menu` hrefs and
    **navigates to the store page**;
  - with cookies unavailable the select is hidden (source).
- **Phones** (D-18): row 1 is the select (min-height 40 px, max-width 60%). Row 2, shown only when a store is selected,
  is the address and the hours at 14 px.
- **Scroll:** the top bar slides out of view (translateY) after 8 px of scroll. Only the nav stays sticky.
- **Select styling:** a pill, `rgba(255,255,255,.06)` fill, 1 px `rgba(255,255,255,.18)` border, cream text, a leaf
  focus ring.

### 6.2 Header (`nav#site-navigation` equivalent; SITE-ARCHITECTURE 5.2)

- **Desktop (1024 px and up), 72 px tall:**
  - the white wordmark (alt "We Roll Up Logo", verbatim), 186 CSS px or less, linking to `/`;
  - "Products" (the mega trigger: a `button` with `aria-expanded` and `aria-controls`);
  - the quick menu, verbatim: Daily Deals, Delivery, Contact;
  - the Menu button (opens the full menu sheet, 6.5; aria-label "Open menu");
  - **Order Now** (leaf pill, forest label, `.active-location-menu .js-selected-location-menu` with `data-lax-url` and
    `data-sanpedro-url`).
- **Menu families.** The menu family (`page.menuFamily`) decides what the mega and the sheet carry (6.4). The header row
  is the same on all 91 pages.
- **Phones and tablets (below 1024 px):** wordmark (132 CSS px), Menu icon button (44x44), Order Now pill (min-height 44).
- **State:**
  - at scroll 0, opaque `#101811`;
  - scrolled, G2 glass;
  - a 2 px leaf progress line under it, `scaleX` with page progress;
  - **sticky chrome after scrolling is 72 px or less at 1280x585 and 62 px or less at 390** (B measured 72 / 62; R-4).
- **Shop pages and /lax-menu:** the header and top bar are **static, not sticky**, and opaque (6.18.8).

### 6.3 Promo strip (`ctx.marquee`; the 40 global pages; D-21)

- The verbatim items, with their icons (map marker, star): "Welcome to We Roll Up…" and "We Roll Up Rosin Club + Buy any 5
  rosin products + Get 25% Off".
- A **static** single line on cream, 14 px, 700. It wraps on phones. **No motion, no marquee, no duplication.**
- **Position:**
  - on 39 pages, directly under the header (source position), not sticky;
  - **on home, directly after the hero**, so it is below the first screen at every window (R-7).
- B6 is open. If the operator withdraws the promotion, the strip is not rendered. That is a parity exception the
  orchestrator records.

### 6.4 Products mega menu (image cards; the operator's rule)

**Panel.**
- G3 glass, full width under the header, radius `--r-l` on the bottom corners.
- **Its bottom stays at least 8 px above the window bottom at 1280x585 and 1366x657** (R-19). The prototype's panel
  ends at about 435 of 585: (S), read off `tmp/panel/b/shots/mega.1280x585@1.5.png`, not probed.

**Primary family (40 pages).**
- **Cards:** a 6-card row, one per Education product item: Flower, Pre-Rolls, Vaporizers & Cartridges, Edibles,
  Concentrates, Topicals.
  - Labels and hrefs are verbatim: `/products/<slug>/`, with A8's `/products/edibles/`.
  - Each card has a 4:5 image, the label under it, and **two chips** labelled "San Pedro" and "LAX" (the verbatim group
    labels). Each chip's href is that store group's verbatim "Order <Cat>" item, with A8's San Pedro vape target.
  - Each chip's accessible name is the verbatim item label plus the group, for example "Order Flower, San Pedro".
  - The chips sit on one row at every width from 1280 to 1600 (R-19).
- **Columns:** B's two verbatim columns: "San Pedro" and "LAX", each with Best Selling and the 6 Order items, as links.

**Store families.**
- The LAX - Culver City family (21 pages) and the San Pedro family (30 pages) have a flat Products list of 7 items.
- Each of the 6 cards then shows that family's verbatim store item as its visible label ("Order Flower", "Order
  Pre-Rolls", and so on; the San Pedro family's vape label is "Order Vapes & Cartridges") and links to that item's
  verbatim href. A label and an href always come from the same menu item. There are no chips. One column lists the 7
  items, Best Selling included.

**Images (alt="", decorative)** (10.2):

| Card | Image | Kind |
|---|---|---|
| Flower | `mason-jars` crop | real |
| Pre-Rolls | S-CARD-PREROLL (B `g8`) | generated |
| Vaporizers & Cartridges | S-CARD-VAPE (B `g3`) | generated |
| Edibles | S-CARD-EDIBLES (B `g4` leaf-dew) | generated; deliberately non-depictive (A9) |
| Concentrates | `concentrate-macro` crop | real |
| Topicals | `topicals-leaves` crop | real |

**Hover and focus** (D-10, R-17):
- The card lifts 6 px, its image scales to 1.08, a leaf ring and glow appear, and an arrow chip slides in.
- Selectors: `.mcard:hover, .mcard:has(:focus-visible)`.
- The chips fill leaf with a forest label on hover and focus.

**Keyboard** (R-18):
- Enter or Space on Products opens the panel and **moves focus to the first card link**.
- The panel follows its trigger in DOM order.
- Escape closes it and returns focus to Products. A click outside closes it.
- A mouse open does not move focus, so the first card is at rest.
- A closed panel is `hidden` (no focusable descendants).

### 6.5 Menu sheet (phones; also the desktop Menu button) (SITE-ARCHITECTURE 5.4)

- **Shape:** a left sheet, opaque forest gradient, full height. Width 100% on phones, 420 px on desktop. G4 scrim.
- **Contents:**
  - the close button (aria-label "Close menu", verbatim, 44x44);
  - the family's verbatim tree as disclosure groups: Locations, Products, Education, About / "About Us", Daily Deals,
    Contact;
  - **Products opens by default and shows the same 6 image cards** in a 3x2 grid (B), then the store lists;
  - the socials as text links;
  - a sticky bottom **Order Now** (`js-selected-location-menu`, leaf pill, forest label).
- **Navigation landmark:** `nav aria-label="Mobile navigation"` (source).
- **Focus:** on open, focus goes to the close button. Escape closes and returns focus to the trigger. Focus is trapped
  while open. The body scroll is locked.

### 6.6 Footer (`ctx.footer`; SITE-ARCHITECTURE 5.5)

- **Ground:** forest-950 with one leaf aura at the top right.
- **Content:**
  - the white wordmark, alt "We Roll UpLogo" (verbatim, sic), 240 CSS px or less on desktop and 132 or less on phones;
  - **San Pedro - Palos Verdes**: address and phone "424 264 5423";
  - **LAX - Culver City**: address and phone "888-777-6655". Both phones are underlined `tel:` links (J-ux graft), each
    a target of at least 24 px;
  - the socials as text links, with the verbatim hrefs;
  - **Quick Links**, verbatim and in order, ending with **"Cannabis License: C10-0000854-LIC"** → `/home`. It is 16 px or
    larger, bold, leaf-300 or cream on forest, and never inside a reveal (D-17, R-34);
  - "© 2026 We Roll Up All rights reserved." and "Privacy Policy".
- **No agency credit** (A15).
- **Footer link rows** are at least 32 px tall on phones (D-16).

### 6.7 Age gate and store picker (A6; BUILD-CONTRACT 4.4; SITE-ARCHITECTURE 6.3)

**Look.**
- B's gate: the source's backdrop photo `storefront-car-side` (blurred under the G5 backdrop).
- The card has the opaque 165° forest surface, radius `--r-l`, and two static plates behind it.
- Inside: the white wordmark (220 px or less on desktop, 132 or less on phones), the title "Verify Your Age" as an
  **h2** (Bricolage 800; the page keeps its single h1, A16), and "Are you over the age of 21?".
- Buttons:
  - **"Yes, I'm 21+"**: a white pill, forest label; hover `#dff2df` / `#162117` with a `rgba(93,188,93,.65)` ring (theme);
  - **"No, I'm Under 21"**: a transparent pill with a 2 px border at white .35.

**Flow.**
- **First visit.** The gate opens when none of these holds: localStorage `agePass_v2 === 'true'`, sessionStorage
  `agePass_v2 === 'true'`, or the cookie `agePass_v2=true`. While it is open:
  - `main`, the header and the footer are `inert` and `aria-hidden="true"`;
  - the body does not scroll;
  - the dialog is `role="dialog" aria-modal="true" aria-labelledby` (the title);
  - focus starts on Yes and is trapped;
  - Escape and backdrop clicks do nothing (source `backdrop:'static', keyboard:false`).
- **Yes.** The store list appears ("Choose your location", with the rows "LAX - Culver City / 11834 Jefferson Boulevard /
  Shop here" and "San Pedro - Palos Verdes / 1705 S Gaffey Street / Shop here", each with its postcard thumbnail). Yes
  dims to .33, No is hidden, and **focus moves to the first "Shop here"**. Each row is at least 44 px tall.
- **No.** The question and both buttons hide. The denied text "We're sorry, but you do not meet the required age to enter
  this website." shows, with `tabindex="-1"`, and **receives focus**. There is no redirect.
- **Store choice.**
  - set localStorage `agePass_v2='true'`;
  - set the cookie `agePass_v2=true; path=/; max-age=31536000; SameSite=Lax`, plus `Secure` on https;
  - close the gate;
  - navigate to the store page (`/location/culver-city/` or `/location/san-pedro/`).
- **Fit.** The whole card, including the store list, fits 585 px tall at 1280x585 with no inner scroll (J-ux on A).
- **With JS off it fails closed**, as the source does: content stays hidden (COMPLIANCE B1.2), and a `<noscript>` line in
  the card reads "Please turn on JavaScript to verify your age." Q6 confirms.

### 6.8 Location chooser (`#locationChooserModal`; SITE-ARCHITECTURE 6.2; D-9)

**Opened by:**
- every `.js-location-chooser` button: on home, the hero Order Now, See Deals, the Delivery card button and the body
  Order Now / Shop Now buttons; on /weed-delivery, the Order Now;
- the header and sheet Order Now when no store resolves.

**Content:**
- "Choose Your Location", "Where would you like to shop?" and "Select a store to continue to the right menu, deals, or
  delivery page.";
- two cards (LAX - Culver City and San Pedro - Palos Verdes) with the verbatim addresses, the postcard (painted 200 CSS px
  or less) and a "Select Location" leaf pill.
- The card hrefs come from the opener's `data-lax-url` and `data-sanpedro-url` (for example See Deals: both
  `/about-us/daily-deals/`).

**Look:** the G5 backdrop, the opaque forest surface, and the cards as small light boxes (one static plate each).

**Behaviour:** a focus trap; Escape and backdrop clicks close it; focus returns to the trigger;
`body.location-chooser-open`.

### 6.9 Hero (home) (D-1, D-2, D-4)

**One striking visual plus one pane.** Nothing else inside the hero: no badges, no protrusions, no loop, no promo strip.

**Height:** `clamp(460px, calc(100svh - var(--head-h)), 860px)` on desktop, so the hero fills the first screen.

**Ground:** `#101811` with the leaf glow (top left) and the dusk glow (bottom left), as in 4.2.

**The storefront light box, at 1024 px and up:**
- the photo is `storefront-car-side` 1920x1439 (real, the source's home hero image);
- the box's left edge is at 40% of the hero width, and the box bleeds off the right edge;
- insets 8% top and bottom;
- radius `--r-l` on the left corners only;
- `inset 0 0 0 1px rgba(255,255,255,.14)` plus `--lift`;
- one static plate behind it at left -26 px / top +20 px, with a leaf-tinted edge;
- `object-position` tuned so that **the "We Roll Up." window decal and the car's tail fin and chrome read** at both
  desktop windows. The scratch value is `62% 82%`, a starting point; check it on the R-6 shots;
- **scroll: vertical drift only, 24 px or less.** The box is never wider than its column (sharpness R-1).

**Painted size and sharpness:**
- at 1280x585@1.5 about 759 CSS px wide: 1.686 (S);
- at 1600x662@1.2 about 951 px: 1.682 (S).

The rule: never paint the photo wider than 1280 CSS px at DPR 1.5 or 1600 at DPR 1.2.

**The pane (G1):**
- max-width 660;
- **it overlaps the light box's left edge by 72 px or more** (glass range 0.394 / 0.298 (S));
- content: the h1 "Shop Our" / "Weed Products", the lead "Full menu for your selected store, plus fresh daily deals.",
  the sub "Browse everything in stock — and check rotating specials before you shop.", then **ORDER NOW** (leaf pill with
  an arrow, `js-location-chooser`) and **SEE DEALS** (outline pill, cream border; `js-location-chooser` with the deals
  hrefs).

**From 701 to 1023 px:** the box covers the right 55%, and the pane overlaps it.

**Phones (700 px and below):**
- the photo band is full width, 400-430 CSS px tall, sharpness 1.0 or more (scratch 1.021 at 470 px);
- `object-position` shows the decal and at least the car's roofline and fin above the pane;
- the pane overlaps the photo bottom by 120 px or more, and S-MIST lies under its lower half (D-2);
- the CTAs sit side by side at widths of 360 px and up, so that **the h1, both lines and both CTAs end at or above
  836 px** in an 844 px window (R-5).

**Alternative (Q1):** the generated bud `g1` as the hero visual. That is a one-slot change in `image-plan.json`.

### 6.10 Home section map (order is the source's: CONTENT-MODEL "home")

| # | Section (verbatim heading) | Band and tone | Composition | Protrusion |
|---|---|---|---|---|
| 1 | "Shop Our Weed Products" (h1) | night, atmospheric | 6.9 | none |
| — | promo strip | cream, slim | 6.3 | — |
| 2 | "Delivery" card plus the two store cards | calm light: `linear-gradient(180deg,#f5f4f1,#e9f0e5)` | 3 columns at 1024 px and up (1.05fr 1fr 1fr), stacked on phones; 6.11 | H1, H2 |
| 3 | "We Are Here to Serve Your Cannabis Needs" | night, atmospheric (S-MIST, masked; optional V-MIST) | light box (`sour-kush-jar-tray`) and an opaque forest-900 copy card with a leaf rule; "Order Now" (`js-location-chooser`) | H3 cap |
| 4 | "Convenient Ways to Get Your Cannabis" and "Shop Cannabis In-Store or Order Online for Pickup & Delivery" (accordions) | **calm light** haze-100, flat (D-3) | 6.13 on white cards | none |
| 5 | "A Community Built Around Cannabis" | **dusk, atmospheric**: S-DUSK-PALMS full-bleed under the cream veil (optional V-DUSK) (D-3) | pale light box (`red-lighter-cards`) and an opaque white copy card; "Shop Now" (`js-location-chooser`) | H4 lighter |
| 6 | "Your Delivery Location" (ZIP) | night, calm (one leaf aura, a dusk glow) | light box (`storefront-car-rear`, its source role) and an opaque forest ZIP card; 6.14 | none |
| 7 | "Our Reviews" | calm cream | 6.15 | none |
| 8 | footer | night | 6.6 | none |

- The tones alternate band by band. There are 4 dark bands (1, 3, 6, 8) out of 8. Each atmospheric band (1, 3, 5) is
  followed by a calm one (R-44).
- Statement accents (D-24):
  - section 3: "We Are Here" 300 over "to Serve Your Cannabis Needs" 800, in cream on night;
  - section 5: one leaf-ink-deep or leaf-ink word ("Cannabis");
  - section 6: weight split;
  - section 7: none.

### 6.11 Delivery card and store cards

- **Delivery card.** A forest gradient (`--forest-700` to `--forest`), radius `--r-m`. Content: "Delivery" (Bricolage
  800, cream), "Get your order how and where it works for you." and "Pickup, delivery, and flexible options—so you never
  have to miss what you want.", and a **Delivery** leaf pill (`js-location-chooser`, both hrefs `/weed-delivery/`).
  Hover and focus: lift 6 px, `--lift`.
- **Store cards.** White, radius `--r-m`. The top 64 px carries a wash: San Pedro mint `rgba(170,204,187,.35)`, LAX peach
  `rgba(255,204,170,.35)`. Content:
  - the postcard protrusion (H1 / H2);
  - the store name as h3 (Bricolage 700);
  - the address lines, verbatim (including "Culver City, CA 11834", B1 open);
  - a "Shop now" leaf pill with the verbatim href.

  Hover **and** `:has(:focus-visible)`: lift 6 px, and the postcard straightens and rises 8 px (D-11).

### 6.12 Light box: see 5.2

### 6.13 Accordions (home: 2 items; /weed-delivery: 5)

- **Markup:** `h2 > button[aria-expanded][aria-controls]` (valid; the source nests h2 inside button) and a region panel.
  One panel is open at a time; item 0 starts open, as in the source.
- **Hidden bodies:** they carry their full verbatim text in the DOM (CONTENT-MODEL section 4), so parity counts them.
- **Look:** each item is a white card, radius `--r-m`, with a 1 px haze-300 border and a 4 px leaf edge on the left that
  grows (`scaleY`) when open. The title is Bricolage 700, 22-28 px, forest. The icon is a plus that rotates to a minus.
  Hover and focus: the title slides 6 px.

### 6.14 ZIP finder ("Your Delivery Location"; SITE-ARCHITECTURE 6.4)

- **Layout:** a forest-900 opaque card beside the `storefront-car-rear` light box. The rear photo shows the legible plate
  and a Chevrolet badge; that is its source role (B16).
- **Form:**
  - the `<label>` "Enter Your Zip Code" is visually hidden;
  - the input is `type=number`, placeholder "Enter Your Zip Code", min-height 48, with a cream fill and a forest label;
  - the button "Find my Location" is an outline pill that fills forest on hover. Next to it, "Order Now"
    (`js-location-chooser`).
- **Logic:** both ZIP arrays verbatim. The first match wins, as in the source.
- **Strings:** "Please enter a valid zip code.", "No Locations Found", "Awesome! We deliver to you. Fast!", "Please order
  from this menu:", "Location: San Pedro" / "Location: Playa Vista" (sic, B5), "Delivery Menu", "Search Again", and the
  empty-state paragraph with `tel:424 264 5423`.
- **Results** appear in a polite live region.

### 6.15 Reviews carousel (`ctx.reviews`; on all 91 pages, before the footer)

- **Header:** "Our Reviews" (Bricolage 800) and "What our customers are saying" (leaf-ink on cream, 4.50).
- **Rail:** the 5 verbatim reviews in their fixed order (A2), each a white card, radius `--r-m`, with:
  - **five stars** (leaf-ink icons with an accessible "5 stars" label, decorative SVG);
  - the text at 17 px;
  - the name with the user icon.

  It is a scroll-snap rail, 4 cards across at 1240 px and up, 3 at 992, 2 at 768, and 1 plus a peek on phones.
  Previous and Next buttons are 44 px circles, labelled "Previous review" and "Next review". **No autoplay** (D-25).
- **CTAs, verbatim and in order:** "Explore All Reviews", "Leave a Review", "Explore All Reviews - LAX", "Leave a Review -
  LAX", alternating forest fill and outline (source), each 44 px or taller. They stack on phones.
- **Hover and focus:** the card lifts 6 px with a leaf ring.

### 6.16 Page banner (every inner page except the shop pages; header art: 10.4)

- A full-bleed band, 340-420 px tall on desktop (`clamp(300px, 46svh, 440px)` at the operator windows) and 300-360 px on
  phones.
- **Layers:**
  - the art (10.4), `object-fit: cover`, sharpness 1.0 or more;
  - a veil `linear-gradient(90deg, rgba(16,24,17,.78) 0%, rgba(16,24,17,.45) 45%, rgba(16,24,17,.1) 75%)`;
  - the h1 (the banner sizes in 3.2) in cream at the bottom left;
  - the breadcrumbs, verbatim, where the page has them.
- **Painted contrast:** the title and the eyebrow reach 4.5 or more (3.0 or more for large text) on painted pixels
  (R-9). If the art is busy where the title sits, raise the veil. Never lighten the text.
- **Phone banner height and source height.** A banner is in the first screen, so R-2 applies. At DPR 3 the banner may
  be no taller than the source's height divided by 3. Measured (S, arithmetic):
  - `topicals-leaves` (1920x640) gives at most **210 CSS px** on phones. At 300 px it would paint at 0.71;
  - every other banner source (1305 px or more tall, or the 21:9 and 16:9 generated masters) clears 330 px.
- **Seam:** the banner's bottom edge is a hard seam, and the T-series protrusions cross it (5.4).

### 6.17 Product category pages (6) and the flower page

- **Banner** (6.16): the giant short-title variant ("Flower", "Pre-Rolls", "Edibles", "Topicals", "Concentrates").
  "Vaporizers & Cartridges" uses the long variant. **Flower** keeps the veil and adds
  `radial-gradient(60% 90% at 0% 70%, rgba(16,24,17,.7), transparent 70%)` behind the title (D-20).
- **Body, in source order:** the intro on white (eyebrow, h2, paragraph). For /products/flower the order is:
  - the intro: eyebrow "WHY ARE WE SO ESPECIALLY PROUD OF OUR SELECTION OF FLOWER?" (as authored, uppercased by CSS),
    h2 "Weed Flower at We Roll Up";
  - **"Our Flower / Hits Different"**: a night band with S-MIST. The 5 items are opaque forest-900 cards, each one
    paragraph: bold label, then " – ", then the text (D-14);
  - the F2 seam;
  - "Find the Flower You're Looking For At We Roll Up" on white, with a SHOP NOW pill (leaf, forest label);
  - the mason-jars full-bleed editorial band (real, 1920);
  - the long-form reading card (6.19), overlapping the band's bottom edge by 120 px (B).
- **Protrusions:** flower F1 and F2; pre-rolls T2; the others none.
- Category CTAs keep their verbatim labels and hrefs ("Shop Now" → /shop and so on).

### 6.18 The other templates

Each row names the template's sections in source order (CONTENT-MODEL section 2) and how they render.

1. **Standard pages** (/about-us, /about-us/daily-deals, /contact).
   - **/about-us:** banner (S-DUSK-PALMS), then a calm reading card with "Welcome to We Roll Up", "Our Team" and "We
     speak Spanish!". The last is an h3 set as a leaf-100 chip-callout, uppercased by CSS.
   - **/about-us/daily-deals:** banner (S-MIST), then the deals list as white deal cards:
     - a 4 px leaf rule on the left;
     - the title in **forest** Bricolage 700 with a leaf `fire` icon (the source's leaf title fails at 2.38);
     - "Valid at …" in `--ink-muted` (6.40);
     - hover and focus: the card fills forest with cream text.

     All 4 deals are verbatim, including "Spin the Wheel for Prizes" (F-PROMO-1, B6, carried as source).
   - **/contact:** banner (S-DUSK-PALMS), then two white store cards. Each has the store name, address, "Hours" (the
     verbatim /contact hours, B3 open), the Google Maps iframe exactly as the source places it (radius `--r-m`, no
     overlay), and "Get Directions" (verbatim hrefs). Then "Contact Us Online" (h3), the form (6.18.13), and the live
     tel and mailto CTAs.
2. **Legal pages** (/accessibility-statement, /privacy-policy). Banner (S-MIST, long title), then one reading card
   (6.19). The demoted second h1 renders as h2 (A16). "[email]" stays verbatim (B5). No protrusion.
3. **Author and taxonomy archives** (/author/werollupadmin, /location-pagetype/cannabis-menu-page,
   /location-pagetype/primary-location).
   - Banner (S-MIST; G-LAX-DUSK for the cannabis-menu page; G-HARBOR-HAZE for primary-location), then the post list as
     white cards with the verbatim dates and titles, or the notice "Sorry, no results were found." in a white card.
   - The search form renders with the base controls if the pipeline emits it.
   - The primary-location page's h1 is "Primary Location" (A16, PIPELINE-CONTENT).
4. **Education pages** (/education, /education/cannabis-101, /education/recreational-medicinal). Banner (the real
   `mason-jars`, the live education banner), then the reading card with every h2 and h3 in order. "Shop Now" → /shop
   becomes a leaf pill at the end (recreational-medicinal). No protrusion.
5. **/lax-menu.** A compact banner (G-LAX-DUSK) with h1 "Shop LAX", then the embed container (6.18.8).
6. **Location (store) pages** (/location/culver-city, /location/san-pedro).
   - **Sub-header:** the "You're shopping" strip (6.18.7).
   - **Hero:** the place plate (G-LAX-DUSK or G-HARBOR-HAZE) full-bleed, with the G1 pane holding the promoted h1
     ("Shop LAX – Culver City" / "Shop San Pedro – Palos Verdes", A16), "Full menu for your selected store, plus fresh
     daily deals." and the CTAs (Order Now, See Deals, with verbatim hrefs). On the right, the store's postcard sits in a
     light box (T4).
   - **Second card:** the forest Delivery card (6.11) with its verbatim href.
   - **"Shop by Category":** a scroll-snap rail of 7 white cards (Flower, Pre-Rolls, Edibles, Vapes, Extract, CBD,
     Accessories), each with SHOP NOW and the verbatim href. The source's small product images paint **at no more than
     their sharp width at DPR 1.5** (IMAGE-INVENTORY: 117-169 CSS px). On DPR-3 phones that is a known, documented
     softness below the fold.
   - **"Daily Deals":** the deal cards as on /about-us/daily-deals.
   - **San Pedro only, "Shop by Mood":** 7 white cards ("I'm feeling" plus the mood name, UPPERCASE through CSS, and
     "Shop Now"). The source's mood gradient becomes a 48 px wash at the card top. **Text never sits on the tint**, so it
     stays forest on white (the source's white on tint failed at 1.48-2.85). The "Pain Free" and "Sleepy" labels are
     carried verbatim (F-MOOD-1, B8).
   - **"Our Featured Brands":** the partner logos, unaltered, on white 120 px chips in a static wrap grid (no autoplay).
     They are shown only on these pages.
7. **"You're shopping" strip** (the 51 location-template pages; SITE-ARCHITECTURE 5.3).
   - A cream strip under the header, not sticky.
   - The breadcrumbs, verbatim, with the schema.org microdata kept. The "Locations" crumb keeps its source href.
   - "You're shopping" plus the store name in a leaf-100 chip (bold).
   - Three 40-44 px outline pills: **Directions** (`rel=nofollow`), **Review Us**, **Call Now** (`tel:`), with each
     store's verbatim hrefs.
   - On phones it takes two rows, and the pills wrap.
8. **Shop pages** and /lax-menu. The shop pages are 47 records: `/location/culver-city/shop` and its 18 query
   variants; `/location/san-pedro/shop`, its 19 filter variants and its 8 `/shop/menu/*` paths.
   - A compact banner, 220-260 px, with the place plate and the h1 ("Shop LAX - Culver City" / "Shop San Pedro - Palos
     Verdes"), then the "You're shopping" strip, then **the embed container**.
   - The container is full-width, with a white ground, `position: static`, and **no transform, filter, backdrop-filter,
     perspective, `contain`, `will-change`, opacity below 1, mask or clip-path on it or on any ancestor** (BUILD-CONTRACT
     4.6).
   - No reveal, protrusion, parallax or overlay intersects it. **The header and top bar are static on these pages.** The
     Jane and Weedmaps blocks are byte-identical to the source spans (A13). The vendor's licensee identification stays
     visible (COMPLIANCE B1.4).
9. **Products hub** (/products). Banner (S-BUD-BANNER, B `g1`), then the reading card with the 9 sections in order.
   Each category h2 may carry its mega-card image as an 88 px decorative thumbnail (`alt=""`). No protrusion.
10. **Review singles** (5). A compact banner (S-MIST) with the h1 = the reviewer's name (source: the name only; B14),
    then the reviews block (6.15) and the footer.
11. **Service-area hub and town pages** (1 + 15).
    - **Banner:** the hub uses S-DUSK-PALMS. The San Pedro group (5 pages under `/service-area/san-pedro`) uses
      G-HARBOR-HAZE. The 10 other town pages use G-LAX-DUSK.
    - Then the reading card with every heading and paragraph in order. The template-flexible pages
      (/service-area/culver-city, /service-area/san-pedro) render their rows in order as reading-card sections.
    - The Google Maps iframe on the Culver City delivery page is kept as the source places it. The brief inside the
      iframe element is not rendered (A7).
    - The A7 doubled h2 is fixed by the pipeline.
    - T1 postcard protrusion.
12. **Delivery page** (/weed-delivery).
    - Banner (S-DUSK-PALMS).
    - Split section: the `storefront-car-rear` light box with T3, beside the h2 "Convenient delivery to your door in San
      Pedro and Surrounding Communities", the text, and "Order Now" (`js-location-chooser`).
    - "How Our Delivery Process Works" (statement h2): 3 white step cards titled verbatim "Step 1: Browse & Order" and so
      on. The step number is part of the verbatim title; no numerals are added.
    - The 5 accordions (6.13) on a calm haze band.
13. **Contact form** (A12; BUILD-CONTRACT 4.7).
    - A white card with the fields, labels and required marks verbatim: Your Name*, Your Phone, Your Email Address*,
      Message*. Labels are visible, Libre Franklin 700 at 16 px. Inputs are 48 px, with a 1 px haze-300 border, radius
      `--r-s`, and a leaf-ink focus ring.
    - `method="post"`, `action="/__form-endpoint-not-configured__"`.
    - **Send** is a leaf pill with a forest label, `disabled` (opacity .55, `cursor: not-allowed`).
    - Above it, the visible note "This form is not connected yet. Please call one of our stores." (PIPELINE-CONTENT; the
      only added sentence).
14. **404** (`render404`).
    - A compact banner (S-MIST) with the h1 "Page not found" (PIPELINE-CONTENT), then the buttons **Home** → `/` (Quick
      Links label) and **Order Now** (`js-selected-location-menu`).
    - Under `/location/san-pedro/shop/menu/`, the Jane boot (`ctx.notFound`) renders in the 6.18.8 container instead.
    - The licence line is in the footer, as on every page.

### 6.19 Reading card (long form)

- A white card, 630 px wide, radius `--r-m`, padding `clamp(28px, 4vw, 56px)`, on a cream or haze band.
- **Body:** 18.5 / 1.75; paragraphs 62-75 characters per line at 1280 (R-45).
- **Headings:** h2 30 px, h3 22 px, Bricolage 700. An h3 may be leaf-ink on white.
- **Inline links:** leaf-ink with a 1 px underline at offset 3 px. Hover sweeps a 2 px leaf underline (a
  transform-only `::after`; never a background-image underline, J-craft).
- **Lists:** leaf dots; a strain callout gets a leaf rule on a haze-100 box (B), with text in forest.

### 6.20 Base controls

| Control | Rest | Hover = `:focus-visible` |
|---|---|---|
| **Leaf pill** (primary) | `#5dbc5d` fill, `#203022` label, 700 UPPERCASE .07em, min-height 48 (44 small), padding 0 24px, radius 999, label in its own `<span>` | lift 2 px, `#81cb81` fill layer (opacity), a leaf halo, the arrow nudges 4 px; press scale .97 |
| **Forest pill** | `#203022` fill, cream label | `#344f38` layer |
| **Outline pill**, light ground | transparent, 2 px forest border, forest label | fills forest, cream label |
| **Outline pill**, night | transparent, 1.5 px `rgba(245,244,241,.55)` border, cream label | fills `rgba(245,244,241,.1)` |
| **Chips** | leaf-100 fill, forest label, 32 px | leaf fill |
| **Text links on night** | leaf-300 | underline sweep |
| **Focus ring** | 3 px solid, offset 3 px: leaf on night, leaf-ink on light | — |

- **Icons:** open-licence line icons (24 px grid, 2 px stroke), `aria-hidden`. Social links are text, with no
  third-party brand glyphs (B; Q5).
- **Inputs:** 48 px tall, 16 px text (no iOS zoom), visible label, error text in forest with a leaf-ink icon (never
  colour alone).

---

## 7. Motion system

### 7.1 Durations and easing

| Motion | Duration | Easing |
|---|---|---|
| Hover | 220-320 ms | `cubic-bezier(.2,.7,.2,1)` (`--ease-out`) |
| Reveal | opacity .45 s, transform .7 s, rise 28-34 px, 90 ms stagger, at most 4 steps | |
| Menus, sheet, chooser, gate | fade and slide 10-40 px, 240-320 ms | |
| Plate fan | .7 s | |

Only `transform` and `opacity` animate, the individual `translate`, `scale` and `rotate` properties included. Never
animate layout, colour or filter.

### 7.2 Reveals (the traps, made into rules)

1. **What hides.** Only blocks entirely below the first screen hide. At load, JS marks a `[data-reveal]` wrapper as
   waiting only if its top is at or below `innerHeight`. **First-screen content is never hidden or half-revealed**, and
   no transition runs there at t=0 (R-24).
2. **Trigger.** `IntersectionObserver` with **threshold 0** and `rootMargin: "0px"` (no negative bottom margin). A rAF
   scroll-position check also reveals any waiting block whose top is above 0.94 x `innerHeight`. That catches jump
   scrolls, anchors and capture tools (B: 0 stranded after an 8-step scroll).
3. **Focus.** `focusin` inside a waiting block reveals it at once, with no transition.
4. **Fail-safe, only for a dead observer.** If the observer has delivered no entry 3 s after load, reveal everything.
   There is no blanket timer otherwise.
5. **Hover is never overridden** (D-12). Reveals live on wrappers. Hover transforms live on the inner card and use the
   individual properties. No `[data-reveal].is-in { transform: none }` rule may match an element that has a hover
   transform (R-25).
6. **Never animated in:** the licence line, the footer, the "You're shopping" strip and the promo strip (R-34).
7. **Reduced motion:** nothing is ever hidden.

### 7.3 Scroll-linked effects

- The depth planes (5.1) run at 761 px and up, through one passive rAF-throttled listener. `--p` is clamped to -1..1.
- At scroll 0 every plane is within its declared range (R-28).
- The top bar slides out after 8 px. The leaf progress line scales with page progress; it is feedback, not decoration,
  so it stays under reduced motion with no transition.
- **Under reduced motion no scroll, wheel or resize listener is attached for motion** (C's measured hygiene; R-26).

### 7.4 Hover and focus parity

- Every `:hover` rule has a `:focus-visible`, `:focus-within` or `:has(:focus-visible)` twin with the same declarations.
- Card lifts use `:has(:focus-visible)`, so the card lifts while its link has keyboard focus (D-11).
- Programmatic focus after a mouse action never shows the hover state (D-10).

### 7.5 Loops (section 10.5)

- `<video muted playsinline loop preload="none" poster="…">` with `aria-hidden="true"`, inside an atmospheric band only.
- **It plays only when:** `prefers-reduced-motion: no-preference`, at least 25% of it is visible, and the tab is visible.
  Otherwise it pauses.
- **A visible pause/play control** (44x44, bottom right of the band, aria-label "Pause motion" / "Play motion") stops it
  (WCAG 2.2.2). The choice is remembered for the session.
- Under reduced motion, only the poster shows.
- **The home hero never has a loop.**

### 7.6 Ambient

There are **no infinite CSS animations** on any page (R-27). B's hero drifts are removed.

---

## 8. Responsive rules

| Window | Rules |
|---|---|
| **1280x585 @1.5, 15 px scrollbar** (layout 1265) | the hero fills the first screen (header 112 at scroll 0); the h1 is 77 px; the h1, both lines and both CTAs show with the CTA bottom at least 8 px above 585; sticky chrome after scrolling is 72 px or less; the mega panel's bottom is 8 px or more above the window bottom; the storefront 1.3 or more (1.686 (S)) |
| **1600x662 @1.2, 15 px scrollbar** (layout 1585) | the same composition; the storefront box about 951 px (1.682 (S)); the mega chips on one row; the hero pane 660 px or less |
| **1366x657 @1, 1024x768 @1** | the hero copy clears the header at scroll 0 / 40 / 120 (R-4); at 1024-1239 the quick menu keeps Daily Deals, Delivery and Contact, and the mega cards go 3x2 if 6 across fall below 120 px each |
| **390x844 @3** | single column; header 62 px; wordmark 132 px or less; the hero per 6.9; every tap target 24 px or more, primary 44 px or more; the reviews show 1 card plus a peek; the mega content lives in the sheet |
| **Reflow** | no horizontal overflow at 320, 360, 375, 390, 414, 768, 820, 1024, 1240, 1280, 1366, 1440, 1600 and 1920 (R-8) |

- **Breakpoints:**
  - 1240 and up: full desktop;
  - 1024-1239: condensed desktop (Products, the quick menu, Menu, Order Now; the mega 3x2);
  - 701-1023: tablet (phone header, the hero box at 55%);
  - 700 and below: phone.
- **Parallax** runs at 761 px and up only.

---

## 9. Accessibility requirements

WCAG 2.1 AA, as the source's accessibility statement claims, plus WCAG 2.2's 2.5.8 target size.

- **Structure:**
  - one `header`, one `main`, one `footer`;
  - **every `nav` labelled** (D-19): "Main", "Products", "Mobile navigation" (source), "Footer", "Breadcrumb";
  - the skip link "Skip to content" is the first Tab stop;
  - exactly one h1 (A16), no skipped heading levels;
  - the source's `role=heading` patch on `.h1`-`.h5` is not reproduced (SITE-ARCHITECTURE 6.4).
- **Contrast:** AA on painted pixels for every text element (R-9), including text over glass and photos, with the
  filter disabled too (R-12). Leaf buttons carry forest labels (A5). Non-text contrast is 3:1 for focus rings, input
  borders and the carousel arrows.
- **Keyboard:**
  - every control is reachable;
  - the mega and the sheet are disclosures with Escape;
  - the dialogs (gate, chooser, sheet) trap focus and return it;
  - the gate does not close on Escape (source).
- **Focus:** a 3 px ring, always visible, never removed (6.20).
- **Targets:** non-inline controls 24x24 CSS px or more; primary controls 44 px or more (D-16).
- **Motion:**
  - `prefers-reduced-motion` honoured (7);
  - loops have a pause control (7.5);
  - no autoplay rail (D-25);
  - nothing flashes (`tools/make-loop.mjs` calmness measurement).
- **Images:**
  - real content images keep their source alt;
  - decorative and generated images use `alt=""` with `data-decorative`;
  - every `<img>` has width, height and `sizes` (BUILD-CONTRACT 4.10).
- **Forms:** visible labels, required marks, errors in text, the disabled-submit note visible (A12).
- **Zoom:** at 200% text zoom (a 640 px wide window at 1280) nothing clips or overlaps.
- **Language:** `lang="en"`.

---

## 10. Image direction and the image plan

### 10.1 Art direction

- **Real photos** stay real: no recolour, no retouching, no upscaling. Crops and frames may change. They paint at 1.0 or
  more file px per device px wherever they appear in a first screen (R-1, R-2).
- **Generated media** is atmospheric or botanical, in the brand greens, cream, and the postcards' dusk peach and mint,
  with soft daylight or dusk.
- **Every generated still and loop obeys A9:**
  - no people (no faces, hands or bodies);
  - no cartoons or animated characters;
  - no candy, edibles or sweets;
  - no alcohol, champagne, party, nightlife or luxury cues;
  - no iridescent, holographic, rainbow-prism or neon-candy palettes;
  - no text, logos or marks;
  - never the client's store, staff, customers or branded products.
- **Two provisional slots in IMAGE-INVENTORY are dropped** as non-compliant with A9: G09 "prismatic caustics" (a prism or
  iridescence cue) and G17 "pink and blue neon glow" (a neon cue).

### 10.2 Real photos per role (the allow-list for new prominent roles; A10)

| Role | Photo (kit name; assets/source file) | Painted size and check |
|---|---|---|
| Home hero light box | `storefront-car-side` (`25e314b3` = `01de0d97`): the source home hero; flags: only "'76' antenna balls, a few px" | about 759 / 951 / 390 px; 1.686 / 1.682 / 1.021 (S) |
| Serve light box (source role) | `sour-kush-jar-tray` 1920 (`77caae00`) | 3:4 at 500 px or less; 1920 file: 2.56 at 1.5 |
| Community light box (source role) | `red-lighter-cards` 1200 (`8bd7f345`) | 500 px or less; 1.6 |
| ZIP band, /weed-delivery split (source roles) | `storefront-car-rear` 1200 (`a28ecfaf`): plate and Chevrolet badge legible, source role only (B16) | 520 px or less; 1.5 or more |
| Store cards, chooser, gate rows, T1, T4 | the two postcards, 600 px | 222 px or less at 1.2; 200 or less at 3 |
| Gate backdrop (source role) | `storefront-car-side` 1280 variant, blurred | under the veil |
| Mega and sheet cards | `mason-jars`, `concentrate-macro`, `topicals-leaves` crops | 4:5, 160-200 px |
| Category banners | `concentrate-macro` 1920 (/products/concentrates), `topicals-leaves` 1920x640 (/products/topicals) | full-bleed: 1.012 at 1280@1.5 and 1.009 at 1600@1.2. The 640-tall topicals strip covers a 360 px banner on desktop, but **210 CSS px at most on phones** (6.16) |
| Education banners | `mason-jars` 1920 | full-bleed 1.0 or more |
| Flower page | `mason-jars` 1920 (editorial band), `flower-grinders` 1280 (F2) | 1.0 or more |
| Cut-outs | cap (`7ed18521`), red lighter (`8bd7f345`) | 5.4 |
| Category rail on store pages (source role) | the 7 small category images | at their sharp width, 6.18.6 |

### 10.3 Never promoted (deny-list for hero, banner, cut-out and menu-card roles)

- the champagne-bar display;
- the Kiva Lost Farm chews;
- the In-N-Out cup tubes;
- the candy-like gummies card (`a3d38155`);
- the edibles neon wall (`7a4352fe`);
- `vape-leaves` (a hand);
- the two book-cover flat-lays (`085a05d4` trop cherry, `8b360abb`);
- the CBD tincture (`e181cbbf`): label claims;
- any legible THC percentage at hero size.

They stay only where the source shows them (B16).

### 10.4 Generated slots

**Reused from the panel.** These are already accepted, paid and viewed. IMAGERY imports each into
`audit/generated-images.json` with its request id, labels every served variant, and re-views it at 100%.

| Slot id | Source (request id) | Purpose, pages | Aspect | Painted size, and source px needed | Cut-out |
|---|---|---|---|---|---|
| S-BUD-BANNER | B `g1-hero-bud` (01a1334b-b448-7251-8716-457dfc44bdbe), graded to saturation .84 | /products banner; the alternative home hero (Q1) | 16:9, 2752x1536 | full-bleed 1265 x 400 CSS at 1.5: needs 1898 px across (2400 variant: 1.26) | no |
| S-TRICHOME | B `g2-trichome-field` (01a1334b-b4b8-7793-80ff-493c13a24057) | /products/flower banner; poster of V-TRICHOME | 16:9 | 1898 px (2400: 1.265 (B)) | no |
| S-MIST | B `g6-mist-ribbons` (01a1334b-b6b0-7ed3-bac6-e10174534d46) | Serve band, Hits band, phone hero ground; banners of daily deals, legal, archives, reviews, 404 | 21:9, 3136x1344 | 1898 px (2400: 1.26) | no |
| S-DUSK-PALMS | A `haze-palms` (01a1334d-35e1-76b1-83c3-b9bceaa9794d) | home Community band; banners of /about-us, /contact, /weed-delivery, /service-area; poster of V-DUSK | 16:9, 2752x1536 | 1898 px (ship 2400 from the master: 1.26) | no |
| S-CARD-PREROLL | B `g8-preroll-flat` (01a13351-f7b6-7070-a2e0-2eb8dcf49842) | Pre-Rolls mega and sheet card | 3:4 | 200 px card: 300 px at 1.5 | no |
| S-CARD-VAPE | B `g3-cartridge` (01a1334b-b50f-7422-bfa0-5cc6ee1d1182) | Vaporizers & Cartridges card | 4:3 | 300 px | no |
| S-CARD-EDIBLES | B `g4-leaf-dew` (01a1334b-b587-7c31-a1c4-fd3004e4564d) | Edibles card; /products/edibles banner (a 21:9 crop of the 2368 px master: 1.25) | 4:3 | 300 px; banner 1898 px | no |
| S-CUT-BUD | B `g5-bud-studio` plus birefnet (01a1334b-b61d…, 01a1334b-e245…) | F1 | 1:1 | 280 px: 420 px (760 file) | yes |
| CUT-CAP (real) | B birefnet of `7ed18521` (01a1334b-b764-7920-bd07-7585cc7422e0) | H3, T3 | — | 5.4 | yes (not AI-labelled: a real photo) |
| CUT-LIGHTER (real) | A birefnet of `8bd7f345` (01a1334d-3bdd-7973-9970-e9f922a8fe2b), cleaned | H4, T2 | — | 5.4 | yes (not AI-labelled: a real photo; clean the light fringe on its right edge) |

**New stills.** fal `flux-pro/v1.1-ultra` through `tools/fal-gen.mjs` (which keeps the ledger). There are 2 attempts per
slot at most. Every prompt ends with the A9 negatives.

| Slot id | Purpose, pages | Aspect | Painted size, and source px needed | Prompt (core) | Cut-out | Estimate |
|---|---|---|---|---|---|---|
| G-LAX-DUSK | banners of the 10 Westside town pages, /location/culver-city hero, the Culver City shop banner (+18 variants), /lax-menu, /location-pagetype/cannabis-menu-page | 21:9 (3136x1344) | full-bleed 1265 x 360 CSS at 1.5 (1898 px: 1.65); phone 390 x 320 at 3 (1170 px) | "Pastel dusk sky over west Los Angeles, long soft clouds lit peach and pale mint, a faint high contrail, low distant silhouettes of slender palm trees along the bottom edge, soft haze, calm, photographic, wide; no buildings in focus, no landmarks, no aircraft, no signs, no text, no logos, no people" | no | $0.12 |
| G-HARBOR-HAZE | banners of the 5 San Pedro group pages, /location/san-pedro hero, the San Pedro shop banner (+27 variants, 8 menu paths), /location-pagetype/primary-location | 21:9 | as above | "Coastal morning haze over calm harbour water in soft golden light, layered pale hills dissolving into mist, gentle reflections, photographic, wide, calm; no bridge, no ships' names, no cranes with markings, no buildings in focus, no text, no logos, no people" | no | $0.12 |
| G-PREROLL-BANNER | /products/pre-rolls banner | 21:9 | 1898 px | A's proven wording: "cannabis pre-roll joint rolled in natural unbleached brown hemp paper, green ground cannabis flower visible at its open twisted end, lying on pale stone, soft golden side light, shallow depth of field; no glass, no cup, no smoke, no hands, no print on the paper, no text, no logos" | no | $0.12 |
| G-VAPE-BANNER | /products/vaporizers-cartridges banner | 21:9 | 1898 px | "a single unbranded clear glass oil cartridge with golden amber oil lying on pale cream stone, soft leaf shadows, a faint wisp of vapour, green bokeh, photographic; no device brand, no label, no print, no hands, no people, no text, no logos" | no | $0.12 |

Each new slot also ships a phone crop (1170 px) from the same master, at no extra cost.

### 10.5 Higgsfield loops (`kling-video/v3.0-turbo/image-to-video`, 5 s, 1080p)

**Price:** $0.70 each, the figure measured in A18. The brief says "about $0.60"; this plan uses the higher, measured
price.

| Loop | Input still (approved) | Purpose | Prompt (core) | Reduced-motion poster |
|---|---|---|---|---|
| V-MIST | S-MIST | the Serve night band behind the light box, and the flower "Hits Different" band; atmosphere only | "the smoke ribbons drift slowly sideways and thin out, gentle, continuous, no new objects, camera static" | S-MIST still (`make-loop` poster = frame 0) |
| V-DUSK | S-DUSK-PALMS | the home Community band | "the haze drifts slowly, the palm silhouettes sway very slightly, the light shimmers softly, camera static, no people, no vehicles, no birds" | S-DUSK-PALMS still |
| V-TRICHOME | S-TRICHOME | the /products/flower banner | "a very slow rack focus across the frosted trichomes, soft light drift, camera nearly static" | S-TRICHOME still |

**Each loop:**
- is made seamless by `tools/make-loop.mjs` (crossfade). Its calmness is measured: YDIF p95 in the low single digits,
  with 0 frames over 20;
- carries the AI label in its container tags;
- ships as MP4 plus WebM, with a phone crop;
- has `preload="none"`, and is excluded from the 1.5 MB first-screen budget (BUILD-CONTRACT 4.12). Its poster counts
  toward the budget.

**Reject and redo** a loop that adds objects, animates the palms like characters, or flickers.

### 10.6 Labelling and ledger

- **WebP** variants: `webpmux -set xmp tools/ai-label.xmp`. Verify with a byte grep for `trainedAlgorithmicMedia`: 1 or
  more per labelled file, and 0 on an unlabelled real-photo WebP (the control).
- **JPEG, PNG, MP4, WebM:** `node tools/ai-label.mjs embed` and then `verify --control`.
- **Real-photo cut-outs are not AI-labelled.** They are the client's photographs with the background removed.
- **Ledger:** every call goes in `audit/generated-images.json` (model, prompt, request id, seed, cost, verdict, the pages
  using it). That includes the reused panel stills.

### 10.7 Budget (A18 cap: $15)

| Item | Amount |
|---|---|
| Panel spend, summed from `tmp/panel/{a,b,c}/gen/SPEND.md` | A $0.48 (4 birefnet calls unbooked) + B $0.54 + C $0.39 = **$1.41 as booked**. Conservative re-estimate: 22 flux calls x $0.06 + 10 birefnet calls x $0.02 = **$1.52** (UNVERIFIED against an invoice) |
| This plan, new stills | 4 slots x 2 attempts x $0.06 = $0.48 |
| This plan, loops | 3 x $0.70 = $2.10 |
| This plan, birefnet re-cleans | 2 x $0.02 = $0.04 |
| Reserve for rejections | $2.00 |
| **Total ceiling** | $1.52 + $2.62 + $2.00 = **$6.14**, within the $15 cap ($8.86 headroom) |

---

## 11. Copy and microcopy

- **Verbatim, always.**
  - Every visible word of content and chrome comes from the crawl, through the pipeline (`page`, `ctx`), with the
    exceptions in `src/content/parity-exceptions.json` only (A2 review order, A7, A12, A16).
  - Defects stay as they are until the operator approves (B5): "Marina Del Ray", "San Pedro 's", "We Roll Up ,", "with
    a smile ?", "Culver City, CA 11834", "Location: Playa Vista", and the cut-off "…delicious gummies and".
  - Source casing is kept in the HTML. Uppercase comes from CSS only.
- **No new claims, numbers, hours, prices, ratings or superlatives.** No health words, no giveaway words, no "candy",
  "treats" or "disposable" in new microcopy (COMPLIANCE B3).
- **The UI strings this redesign adds** (the complete list; brand voice: short, warm, plain, second person, Title Case,
  uppercased by CSS where they are buttons):
  - aria labels: "Open menu" (the Menu button; it replaces the source's "Toggle navigation"), "Close menu" (source),
    "Products", "Main", "Footer", "Breadcrumb", "Mobile navigation" (source), "Previous review", "Next review",
    "Choose your store", "5 stars", "Pause motion", "Play motion";
  - composed chip names: "<verbatim item label>, San Pedro" / "<verbatim item label>, LAX" (for example "Order Flower,
    San Pedro");
  - "Skip to content";
  - the gate `<noscript>` line: "Please turn on JavaScript to verify your age." (Q6);
  - from the pipeline, not new here: the form note "This form is not connected yet. Please call one of our stores.",
    "Page not found", "Primary Location".
- **Alt text.** Real content images keep their source alt. Decorative and generated images take `alt=""`. Where a
  generated image must carry meaning (none planned), the alt describes what is visible and never an effect.

---

## 12. Acceptance requirements

**Windows.** The operator's windows are 1280x585 @1.5 and 1600x662 @1.2 (Windows Chrome with a real 15 px scrollbar,
which `tools/shots-dpr.mjs` and `tools/qa-probe.mjs` reproduce) and 390x844 @3. "All templates" means one page of each
of the 14 templates plus the 404, served from `dist/` by `tools/serve.mjs`.

**Gate state.** Measure with the gate pre-passed (`--init "localStorage.setItem('agePass_v2','true')"`) unless the
requirement is about the gate.

**The IDs are stable.** "(B: …)" gives the prototype's value; "fails today" marks a known gap the build must close.

- **R-1 [first screen]** The home hero storefront paints at **1.0 or more** file px per device px at all three windows,
  and **1.3 or more** at the two desktop windows. Method: `qa-probe --checks sharp`. Scratch: 1.686 / 1.682 / 1.021.
- **R-2 [first screen]** Every image painted in the first screen of every template reaches 1.0 or more at the three
  windows: banners, the hero, the wordmark, protrusions in view. Method: `qa-probe sharp`.
- **R-3 [brand]** The wordmark:
  - is `logo-white-x` 400x71 or its forest recolour, with the alpha plane sha256 equal to `49a1657e…6915aa4`;
  - is 266 CSS px or narrower on desktop and **133 or narrower at DPR 3** (header, sheet, footer, gate, chooser);
  - reaches 1.0 or more file px per device px;
  - has no CSS filter except `drop-shadow`.

  Method: DOM scan plus `qa-probe sharp` (B: 1.43 / 1.79 / 1.01).
- **R-4 [first screen]** Hero copy clears the sticky header:
  - **windows:** 1024x768, 1366x657, 1280x585, 1600x662 and 390x844;
  - **scroll positions:** 0, 40 and 120;
  - **condition:** 0 px of overlap.

  Sticky chrome after scrolling is 72 px or less at 1280 and 62 or less at 390. Method: `qa-probe header` plus a
  getBoundingClientRect probe.
- **R-5 [first screen]** At scroll 0, the h1, both hero lines and both CTAs lie fully inside the window at the five
  windows, with the CTA bottom at least 8 px above the window bottom. Method: a cdp probe.
- **R-6 [first screen]** The `shots-dpr` first screens at 1280x585@1.5 and 1600x662@1.2 show the storefront's "We Roll
  Up." window decal and the car's tail fin and chrome. At 390x844@3 the photo band shows the decal and the car's
  roofline or fin above the pane. Method: an eye check of the capture, logged with the shot path and a one-line note.
- **R-7 [first screen]** Nothing in the home hero but the visual and the pane.
  - No badge, rating, loop, protrusion or promo strip intersects the home first screen at any of the five windows.
  - The promo strip's top is at or below `innerHeight` at scroll 0.

  Method: a DOM probe.
- **R-8 [layout]** `scrollWidth` is at most `clientWidth`:
  - on all templates;
  - at 320, 360, 375, 390, 414, 768, 820, 1024, 1240, 1280, 1366, 1440, 1600 and 1920;
  - with the mega, the sheet, the chooser and the gate open as well as closed.

  Method: `tools/overflow.mjs` or `qa-probe overflow`.
- **R-9 [contrast]** Text over glass or an image reaches, at p05 of painted pixels, **4.5 or more for body text and 3.0
  or more for large text**. This covers:
  - all templates at 1280x585@1.5 and 390x844@3;
  - every first screen at 1600x662@1.2.

  Method: `qa-probe contrast --max-text 80`. Scratch hero minimum: 4.76 large.
- **R-10 [contrast tokens]** A computed-style scan of all templates finds:
  - 0 white or cream text on a leaf `#5dbc5d` fill;
  - 0 leaf `#5dbc5d` text on a light ground;
  - `#427d42` text only on white or cream;
  - `#3b723b` or forest on haze grounds.

  Method: a cdp computed-style walk with `contrast.mjs` pairs.
- **R-11 [glass]** For every element with a computed `backdrop-filter`, the qa-probe glass range is 0.10 or more at the
  three windows.
  - The header has no backdrop filter at scroll 0, and is checked scrolled.
  - Method: `qa-probe glass`, at scroll 0 and after scrolling 300 px.
  - Fails today: B's hero pane at 1600 (0.076) and 390 (0.041); the scratch D-1 phone pane at 0.089.
- **R-12 [glass]** With `backdrop-filter` removed by an init script, every R-9 sample still passes.
- **R-13 [glass]** Glass is limited:
  - **3 or fewer** visible elements with a computed `backdrop-filter` at load on any template at 1280;
  - 0 on light-box plates;
  - 0 nested;
  - every one in the 4.1 list.

  Method: a DOM scan. Fails today: B has 8.
- **R-14 [depth]** Protrusion counts are exactly as in 5.4:
  - home 4, flower 2, the T-series pages 1, everything else 0;
  - each crosses a hard seam with 20 or more CSS px of opaque pixels (alpha above 128) on each side at 1280, and 12 or
    more at 390.

  Method: an alpha-mask probe against the seam element's box.
- **R-15 [depth]** Protrusion opaque pixels intersect 0 CSS px² of text boxes (Range client rects), interactive boxes and
  the hero pane, at 1280x585@1.5, 1600x662@1.2, 1024x768 and 390x844@3, at scroll 0 and mid-section. Method:
  `qa-probe protrude` plus the alpha-mask probe.
- **R-16 [depth]** Every protrusion:
  - has `alt=""`, `data-decorative`, `aria-hidden` on its wrapper, `pointer-events: none` and `data-protrude`;
  - adds 0 to `scrollWidth`;
  - is served at 1x to 2x its painted device width.
- **R-17 [menu]** The mega content:
  - 6 image cards with verbatim labels and hrefs (A8 applied);
  - on the primary family, each card's "San Pedro" and "LAX" chip hrefs equal the verbatim store items;
  - the two store columns are present, verbatim, every item its own link;
  - images `alt=""`.

  Hover and keyboard focus (real Input events) give the same computed transform: card `translate: 0 -6px`, image scale
  1.08. A mouse open leaves every card at rest. Method: a cdp probe. The prototype already has hover and real-Tab parity
  (J-brand `probe-b.json`; J-craft `hover2.json`), but no chips.
- **R-18 [menu]** The keyboard flow:
  - Enter on Products opens the panel and puts focus on the first card link;
  - Escape closes it and returns focus to Products;
  - a closed panel has 0 focusable descendants in the tab order;
  - crossing the header at 1280 takes 12 Tab stops or fewer.

  Fails today: in B the next Tab after opening reaches "Daily Deals".
- **R-19 [menu]** At 1280x585 and 1366x657 the open panel's bottom is 8 px or more above the window bottom. The card
  chips sit on one row at 1280-1600. No hero glyph is visible through the panel (panel alpha .96 or more, plus an eye
  check of `shots-dpr` with the panel open).
- **R-20 [shopping path]** A cdp probe with the cookie states none, `culver-city` and `san-pedro` confirms:
  - hero ORDER NOW, SEE DEALS, the Delivery card button and the body Order Now / Shop Now open the chooser with the right
    card hrefs (SITE-ARCHITECTURE 6.2);
  - header Order Now goes to the selected store's menu URL, else the cookie's, else opens the chooser;
  - the select starts at "Select a Location" with no cookie and navigates on change.

  Fails today: B's hero ORDER NOW goes to LAX.
- **R-21 [gate]** A cdp probe over four storage states (none, localStorage, sessionStorage, cookie) confirms:
  - a first visit shows the gate, with main `inert` and `aria-hidden`, the body not scrollable, and Escape and backdrop
    clicks inert;
  - Tab is trapped;
  - Yes reveals the list, hides No, and focuses the first "Shop here";
  - No shows and focuses the denied text and hides the buttons;
  - a store choice sets `agePass_v2` in localStorage and the cookie (max-age 31536000, SameSite=Lax) and navigates to the
    store page;
  - each of the three pass sources skips the gate.

  Fails today: in B, focus drops to BODY after No, and the body is not locked.
- **R-22 [gate]** The gate strings are verbatim, it is `role=dialog aria-modal=true aria-labelledby`, and it fits
  1280x585 with no inner scroll.
- **R-23 [motion]** The reveal fail-safes:
  - with `IntersectionObserver` deleted by an init script, every element reaches opacity 1 within 3.5 s of load;
  - after a jump scroll to 25%, 50% and 75% of the page, every element in the viewport reaches opacity 1 within 1.5 s;
  - after a full stepped scroll, 0 text is stranded.
- **R-24 [motion]** **Reveal state at t=0 and t=5 s.** At DOMContentLoaded + 0 ms, + 100 ms and + 5 s, at scroll 0,
  every element inside the first screen has opacity 1 and no running transition, on every template at the five windows.
- **R-25 [motion]** **Hover on revealed elements.** After reveal, a real mouse hover on every card with a hover lift
  gives the specified transform (not `none`), and keyboard focus gives the same. Method: cdp `Input.dispatchMouseEvent`
  plus Tab, comparing computed `translate` and `transform`. Fails today in C, where `.js-motion [data-reveal].is-in`
  beat `.store:hover`; B's store and delivery cards fail on focus.
- **R-26 [motion]** **Reduced motion** (emulated):
  - 0 running animations from `document.getAnimations()` after load and after a full scroll;
  - 0 non-zero parallax translates;
  - all reveals at opacity 1 at load;
  - loops show their posters and do not play;
  - no motion scroll listener attached.
- **R-27 [motion]** There are 0 infinite CSS animations on any template. Every playing `<video>` has a visible 44 px
  pause control, pauses below 25% visibility and on a hidden tab, and never plays under reduced motion. Fails today: B
  has 2 infinite drifts.
- **R-28 [motion]** At scroll 0, every `[data-depth]` plane's translate is within its declared range. Parallax is
  inactive below 761 px.
- **R-29 [keyboard]**
  - **Static:** every `:hover` rule in the shipped CSS has a `:focus-visible`, `:focus-within` or `:has(:focus-visible)`
    twin with the same declarations.
  - **Runtime:** 10 sampled controls (store card, Delivery card, review card, mega card, chips, buttons) show equal
    computed transform and box-shadow under hover and keyboard focus.
- **R-30 [a11y]** One header, main and footer; every nav named; the skip link first; exactly one h1; no heading skips;
  every `<img>` has alt, with empty alt only alongside `data-decorative`. Method: `tools/build-check.mjs` plus a DOM probe.
- **R-31 [a11y]** The focus ring is visible on every focusable element, 3 px, with 3:1 or more against its ground (leaf
  7.60 on night, leaf-ink 4.95 on white).
- **R-32 [a11y]** At 390, every non-inline interactive element is 24x24 CSS px or larger, and every primary CTA 44 px or
  taller. Failure count 0 (fails today: B has 15).
- **R-33 [a11y]** At 640x585 (200% zoom equivalent), no text is clipped or overlapping on any template. Method: an eye
  check plus an overflow scan.
- **R-34 [compliance]** "Cannabis License: C10-0000854-LIC" is on every page and the 404:
  - 16 px or more;
  - painted contrast 4.5 or more;
  - opacity 1 at load and under reduced motion;
  - not inside any `[data-reveal]`.

  Method: `build-check` plus a DOM probe (fails today: B's is 14 px).
- **R-35 [compliance]** Generated media:
  - every served generated file is labelled (`ai-label.mjs verify --control`, plus the WebP byte grep with its control);
  - every slot is in `audit/generated-images.json` with its request id, cost and verdict;
  - every accepted still and loop has a recorded 100% visual review: no people, text, marks, candy, alcohol or neon.
- **R-36 [compliance]** Every image in a hero, banner, cut-out or menu-card role is on the 10.2 allow-list or the 10.4
  slot list. 0 deny-list (10.3) files appear in those roles. Method: a DOM scan of `currentSrc` against the lists.
- **R-37 [shop]** On the 2 shop base pages, one query variant of each, 2 menu paths and /lax-menu:
  - the embed container is full-width;
  - its ancestor chain has no transform, filter, backdrop-filter, perspective, contain, will-change, mask, clip-path or
    opacity below 1;
  - an `elementsFromPoint` grid of 20 points over the container finds only the container or its descendants on top;
  - the header is not sticky;
  - there is no reveal and no protrusion in main;
  - the embed bytes equal the source spans (`build-check`).
- **R-38 [performance]** Weight, by transfer bytes with a cold cache from the local server:
  - home before any scroll at 1280x585@1.5: **1,500 KB or less** (BUILD-CONTRACT 4.12; target 900 KB), posters included
    and loops excluded;
  - after a full scroll: 3,000 KB or less;
  - no decorative image above 250 KB;
  - cut-outs at 2x painted or less.

  Method: CDP Network.
- **R-39 [performance]** Fonts on home before scroll total **110 KB or less**: Libre Franklin normal latin 29,292 B plus
  Bricolage Latin pinned 46,860 B (S). WOFF2 only; these two preloaded. Fails today: B loads 428 KB (J-craft).
- **R-40 [performance]** CLS is 0 (under 0.005) over load and a full scroll on every template at 1280x585@1.5 and
  390x844@3 (BUILD-CONTRACT 4.12). Method: a PerformanceObserver `layout-shift` sum.
- **R-41 [images]** Every `<img>` has width, height, and `sizes` equal to its painted width. Below-the-fold images are
  `loading="lazy"`. The hero image is `fetchpriority="high"` and preloaded. 0 broken images in every `shots-dpr` report.
- **R-42 [type]** A computed-style scan finds Bricolage only on h1, statement h2, banner titles, card, accordion and
  long-form headings, and footer store names. It finds 0 Bricolage on `p`, `li`, buttons, nav links or labels. No
  outline text: 0 elements with `-webkit-text-stroke` and a transparent fill.
- **R-43 [copy]** `tools/text-parity.mjs` on `dist/` passes 91/91 records in every region, and its controls fire. A diff
  of every visible string not found in the source equals the 11 list plus the pipeline strings.
- **R-44 [composition]** The home band map equals 6.10:
  - adjacent bands differ in tone (median ground luminance on either side of each seam differs by 0.25 or more);
  - 4 dark bands or fewer;
  - each atmospheric band is followed by a calm one.

  The light-box plate edges are visible on the light bands (eye check of the full-page capture at 1280).
- **R-45 [long form]** In reading cards at 1280, the paragraph median is 60-75 characters per line and no line exceeds
  80. At 390, 30 or more. Method: Range line rects. B: 62-75.
- **R-46 [store]** On both store pages and their shop pages:
  - the "You're shopping" strip names the right store;
  - Directions, Review Us and Call Now carry their verbatim hrefs;
  - the h1 is the promoted store title (A16);
  - "Shop by Mood" text sits on white (painted contrast 4.5 or more).
- **R-47 [form]** The /contact form has `method="post"` and action `/__form-endpoint-not-configured__`. Send is
  `disabled`, with the note visible. Fields, labels and required marks are verbatim. The tel and mailto CTAs are live.
- **R-48 [chooser]** The chooser:
  - opens from every `.js-location-chooser` (6.8);
  - traps focus;
  - closes on Escape and backdrop, and returns focus to its trigger;
  - its two cards carry the opener's hrefs;
  - it fits 1280x585 with no inner scroll.
- **R-49 [prototype residue]** `dist/` holds 0 `?state=` handlers, 0 `data-proto-href`, and no preselected store in the
  markup (the select's `selected` attribute is absent with no cookie).
- **R-50 [evidence]** Every first-screen and full-page capture handed to the operator is taken **after** the last code
  change. Its `shots-dpr` report shows `broken 0` and scrollWidth equal to clientWidth.

---

## 13. Where the judges disagreed, and open questions

### 13.1 Disagreements and how this spec resolves them

| Topic | Judges | Resolution |
|---|---|---|
| The winner | brand C, craft B, ux A | The brief's tie-break: summed scores (B 196). Normalised sums agree (1.1). |
| The hero | J-brand: B's generated bud is generic and C's real sign and car are the most ownable. J-craft: B's composition is the cleanest. J-ux: no client object above the fold in B. | Keep B's composition (one visual plus one pane, weight-contrast type, a night glass pane). Swap the visual for the real storefront in a hero-scale light box (D-1), measured feasible in scratch (S). The bud remains an alternative (Q1). |
| Ethereal | J-craft: A the most ethereal, B the dark end, C a busy daylight photo. J-brand: B's night mood off-brand. | Dusk edit: the peach glow and the dusk-palms band from A, the accordion band made light, 4 dark bands (D-3, D-4). |
| The car signature | J-brand: C's rolling car is the best character move. J-ux and J-craft offered it as a graft. J-ux flagged its IMPALA script. | Shown real in the hero photo. No cut-out (1.4). |
| Type | J-brand: A's Franklin 900 is the most faithful, C's Anton shouts, B's Bricolage the most designed. J-craft: B's 300/800 the most cohesive. | Bricolage for statements (A3's one extra face), Franklin for everything else, one accent per statement (D-24). No outline type. |
| Mega content | J-ux: per-card store choice (A, C) and C's fuller rail. J-brand: B's model is the best. | B's model plus chips (D-10). Education and Locations stay in the Menu sheet so the panel fits 585 (1.4). |
| Protrusion of the CBD bottle | J-craft: B's protrusions are the best, but the bottle shows claims. J-ux: the largest compliance exposure. | Removed. Cap and lighter instead (D-5). |
| Reviews autoplay | The source autoplays; all three designers removed it. | No autoplay (D-25), confirmed by the operator in Q2. |

### 13.2 Open questions for the operator

- **Q1. Hero visual.** The spec puts the client's real storefront (with the finned car) in a light box in the first
  screen (D-1). The prototype's generated bud macro is the alternative, and switching is one slot. Which do you want?
- **Q2. Reviews.** The live carousel autoplays. The redesign uses a swipe rail with arrows and no autoplay (WCAG 2.2.2).
  OK?
- **Q3. Promo strip (B6).** "We Roll Up Rosin Club + Buy any 5 rosin products + Get 25% Off" is carried as a static
  strip, after the hero on home and under the header elsewhere. Keep it, or hide it until it is confirmed current?
- **Q4. Loops.** There are three slow atmosphere loops: the Serve band, the Community band, and the flower banner
  (about $2.10). The flower loop sits in that page's first screen. Keep all three, or only the two below the fold?
- **Q5. Social links.** Instagram, Google, Yelp and Weedmaps appear as text links (no brand icons). OK?
- **Q6. JavaScript off.** As on the live site, the age gate fails closed: content stays hidden, with a one-line
  "Please turn on JavaScript to verify your age." OK?
- **Q7. Store-page category images.** The live "Shop by Category" product shots are small (175-286 px) and soft on
  phones. Keep them at a small size (the default), or use the redesign's sharper category images there?
- **Carried from OPEN-DECISIONS B** (not re-asked): B1 ZIP, B2 phone, B3 hours, B4 licences, B5 copy fixes, B6
  promotions, B7 vape wording, B8 health statements, B9 form backend, B11 wordmark master, B14 SEO, B16 photos, B17 gate
  wording.

---

## 14. Evidence index

| Item | Path |
|---|---|
| Winner copy | `tmp/panel/winner/` (byte copy of `tmp/panel/b/`; hashdir `2f625fdb…`, 101 files, IDENTICAL, control fired) |
| Synthesizer sheets | `tmp/panel/synth/b-home-full-1280.png`, `b-flower-full-1280.png`, `b-desktop-states.png`, `b-phone-states.png` |
| D-1 scratch test | `tmp/panel/synth/hero-test/v1.html` (rejected: full-bleed under a night veil, which crops to the fins and muddies the left), `v2.html` (adopted: hero light box); shots `tmp/panel/synth/shots/v1.*`, `v2.*`; sheets `sheet-hero-desktop.png`, `sheet-hero-phone.png`; probe `tmp/panel/synth/qa-v2.json` (sharp, header, contrast, overflow PASS; glass: hero pane 0.394 / 0.298 / **0.089**, header flat at scroll 0) |
| Font measurement | `tmp/panel/synth/fonttest/bricolage-latin-pinned.woff2` 46,860 B; unpinned Latin 154,028 B |
| Contrast scripts | `tmp/panel/synth/contrast.mjs`, `contrast2.mjs` |
| Judges | the structured results passed by the orchestrator; working files in `tmp/panel/judge-brand/` (probe*.json, qa-*.json, sheets), `tmp/panel/judge-craft/` (notes.md, probe/, sheets/), `tmp/panel/judge-ux/` (VIEW-NOTES.md, probe/, sheets/) |
| Designers | `tmp/panel/{a,b,c}/NOTES.md`, `gen/SPEND.md`, `shots/qa-*.json` |

**What the synthesizer did not verify (stated plainly).**
- **D-1 was tested only as a CSS override** of the prototype's home first screen at the three windows. On the phone the
  pane's glass check fails (0.089), and the car sits mostly under the pane (`sheet-hero-phone.png`). The theme lane
  must tune the phone band to pass R-6 and R-11.
- **These deltas were not prototyped:** the mega chips (D-10), the chooser (D-9), the dusk Community band (D-3), the
  light-box-on-light fix (D-6), the cap move (H3), the lighter graft (H4), the static promo strip and every inner
  template. Their requirements in section 12 are the acceptance.
- **The flower page** was viewed as B's own full captures only. It was not re-probed this session.
- **The four new stills and the three loops** are not generated. Their costs are estimates: $0.06 per flux call
  (brief), and $0.70 per loop (A18, measured 11:45 with `--estimate`).
- **The panel spend** is not reconciled against invoices. The birefnet rate is UNVERIFIED ($0.01-0.02 assumed).
