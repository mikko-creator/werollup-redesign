# Designer B: "Green Aura" (night-side calm)

Prototype: `index.html` (home) and `flower.html` (/products/flower), built by `src/build.mjs` from one set of chrome
partials (`node tmp/panel/b/src/build.mjs`). Styles in `css/aura.css`, behaviour in `js/aura.js`, assets in `img/`,
`fonts/`, generated masters and the ledger in `gen/` (`gen/SPEND.md`). Session: 2026-10-13, 11:19 to about 12:40 CST.

## Concept

We Roll Up after dark, lit from inside. The site is a run of deep forest bands lit by a soft, monochrome leaf-green
glow, with frosted-glass light boxes floating in a green mist. Inside the boxes sit the client's own photographs, and
the client's own objects break out of the glass. Calm comes from restraint: the bands alternate between night and cream
(dark atmospheric, then light and plain), and every paragraph sits on an opaque card or a plain ground. Character
comes from three things:
- a confident display scale with weight contrast in one headline: a hairline 300 "Shop Our" over an 800 "Weed
  Products", with "Weed" glowing leaf green;
- macro dreamscapes: a cured bud with trichome light in green smoke, and a trichome forest;
- the real street-level props: the LA cap, the We Roll Up lighter photo, the storefront with the classic car, and the
  two postcards.

## Signature move: the light-box stack

Each feature image is a glass light box made of three translucent plates, stacked in depth: the frame, then plate 2
offset 22/20 px, then plate 3 offset 44/40 px with a leaf glow. A real cut-out breaks out of the frame:
- the CBD tincture bottle on the night band;
- the We Roll Up LOS ANGELES cap on the cream band.

On scroll, the plates separate in z. Each plate moves at its own rate (`--d`), driven by one scroll variable `--p` per
section:
- the back plates drift slower;
- the cut-out moves faster than the frame;
- the stack fans out as it enters, aligns at the centre of the viewport, and fans out again as it leaves.

On hover, the plates fan further apart. The same plate language is used on the age gate, where two glass plates sit
behind the verification card.

## Palette (brand colours only; no hue outside the greens except the postcard tints)

| Token | Hex | Role |
|---|---|---|
| forest-950 | #101811 | night ground: top bar, hero, night band, ZIP band, footer |
| forest-900 / forest | #162117 / #203022 | opaque cards on night (copy card, accordions, ZIP card, Hits cards); body text on light; forest buttons |
| forest-700 / 650 / 600 | #274129 / #304833 / #344f38 | Delivery card gradient, gate surface (theme 165deg gradient), forest-button hover layer |
| leaf | #5dbc5d | accent, leaf pill buttons (label forest #203022, 5.85:1, ruling A5), glow word, focus ring on dark |
| leaf-300 | #81cb81 | leaf hover layer, small headings on night |
| leaf-ink | #427d42 | green text and icons on light grounds (stars, eyebrows, "Around Cannabis", h3s): 4.95 on white |
| cream / haze-100 / haze-200 / haze-300 | #f5f4f1 / #eff2eb / #e9f0e5 / #ddebd9 | light bands (service, community, reviews, long-form), card borders |
| white | #ffffff | store cards, review cards, long-form reading card, text on night |
| glow | rgba(93,188,93,.12 / .2 / .35 / .65) | light-box edges, button halos, accordion edge, header scroll line |
| mint / peach | #aaccbb / #ffccaa | top wash of the San Pedro card (mint) and the LAX card (peach), taken from the postcards |
| charcoal | #2c2c2c | kept in the token set; not needed on these two pages |

## Type system

- **Libre Franklin** (variable 100-900, SIL OFL; kit woff2): body, nav, buttons, labels, top bar. Buttons and nav are
  700, UPPERCASE through CSS (authored in Title Case), tracking .07em.
- **Bricolage Grotesque** (variable: opsz 12-96, wdth 75-100, wght 200-800). SIL OFL 1.1, "Copyright 2022 The
  Bricolage Grotesque Project Authors". Downloaded from github.com/google/fonts (ofl/bricolagegrotesque); the TTF and
  `fonts/OFL-BricolageGrotesque.txt` ship locally. It is used **only for headline statements**: the hero title, section
  statements, card titles, the banner "Flower", "Hits Different", accordion titles and footer store names.
- Scale:
  - hero `min(6.4vw, 13.2svh)`, clamped 52-104 px, line-height .9, tracking -.035em;
  - display-2 36-66 px; banner "Flower" 96-230 px; "Hits" statement 64-156 px;
  - body 18/1.65 (phone 17); long-form 18.5/1.75 in a 760 px column.
- Both faces use `font-display: block` and are preloaded (local), so text does not reflow once painted.
- The wordmark is `logo-white-x-400x71.png`, used only on dark grounds:
  - header 186 CSS px (phone 132), footer 240, gate 220 (phone 132);
  - always at or under 266 px, and at or under 133 px on DPR 3 phones (sharp check 1.01).
- The forest recolour was made and verified (the alpha plane sha256 `49a1657e…6915aa4` is identical to the source, and
  100% of visible pixels are #203022). No wordmark sits on a light ground in this design, so it is not shipped.

## Depth planes

| Plane | What | Where |
|---|---|---|
| 0 atmosphere | generated macro and mist stills, radial leaf glows | hero bud, `mist-ribbons` behind the night light box and the Hits band, aura glows on the Delivery card, ZIP band and footer |
| 1 glass | frosted planes with blur and a 1 px light edge | header, hero pane, mega menu, drawer, gate, light-box plates and frames |
| 2 content | opaque cards and plain grounds | every paragraph |
| 3 foreground | real cut-outs and framed photos crossing hard seams | the protrusions below |

## Protrusions (all `data-protrude`; qa-probe protrude: 0 text overlaps at every size)

Sizes are measured by `getBoundingClientRect` at load. The light-box cut-outs carry their scroll offset at that moment
(the night section starts at p=+1), so the at-rest overlaps differ by up to the plane depth (bottle 56 px, cap 60 px).

| # | Object | Source | Seam crossed | 1280x585 | 1600x662 | 390x844 |
|---|---|---|---|---|---|---|
| H1 | San Pedro - Palos Verdes postcard | real `postcard-san-pedro-600.webp` (torn-paper alpha) | top edge of its store card | 203x183, crosses by 60 | 222x200, by 61 | 191x171, by 57 |
| H2 | LAX - Culver City postcard | real `postcard-lax-culver-city-600.webp` | top edge of its store card | 201x192, by 54 | 220x210, by 54 | 189x180, by 52 |
| H3 | We Roll Up CBD tincture bottle | real `assets/source/e181cbbf-8.webp`, birefnet Matting cut-out | bottom and left edges of the night light-box frame | 156x352, bottom +123 / left +58 | 156x352, same | 101x227, bottom +37 / left +38 |
| H4 | We Roll Up LOS ANGELES cap | real `assets/source/7ed18521-1-1.webp`, birefnet cut-out | top and right edges of the community light-box frame | 275x248, top +23 / right +86 | 275x248, same | 163x148, top +58 / right +41 |
| F1 | cured bud (generated `g5`, cut out) | `bud-cut-760.webp` | bottom seam of the Flower banner into the intro band | 243x276, crosses by 119 | 280x318, by 117 | 118x134, by 122 |
| F2 | grinders photo in a white frame (2.5 deg) | real `flower-grinders-1280.webp` (the live /products/flower banner) | bottom seam of the dark "Hits Different" band into the "Find the Flower" band | 393x233, by 188 | 450x266, by 189 | 311x184, by 117 |

- Home has 4 protrusions and the inner page has 2.
- None crosses the hero pane, and none sits over body text. The probe's box test passed, and the phone eyebrow was
  cleared of the bud's shadow by spacing.

## Motion

| Trigger | What moves | Reduced motion |
|---|---|---|
| Load: first screen | nothing waits; first-screen blocks are never hidden | same |
| Scroll: entrance reveals | blocks below the fold (`[data-reveal]` wrappers) rise 34 px and fade in, staggered 90 ms. A rAF scroll check reveals any block whose top passes 94% of the viewport, including blocks a jump scrolled past, so a full-page capture never strands one (proved: 0 waiting after an 8-step scroll on both pages) | never hidden |
| Focus | keyboard focus inside a waiting block reveals it at once | n/a |
| Scroll-linked: depth planes | per `[data-depth]` section, `--p` runs from +1 (entering) to -1 (leaving). Each plane translates `-p x d` px: hero image 70, hero haze 30, mist 90/70, light-box plates 46/26/8 (bottle -56, cap -60), banner image 60, bud -40, grinders frame -30. Desktop only (761 px and up) | off: `transform: none` |
| Scroll-linked: header | the top bar slides up out of view (translateY) after 8 px; a 2 px leaf line under the nav scales with page progress | the line still scales; no transition |
| Ambient | two soft haze glows drift in the hero (18 s and 22 s, transform only) | off |
| Open: mega / drawer / gate | fade and 10-40 px slide | instant |

Every transition and animation is on transform or opacity (the individual `translate`/`rotate` properties count as
transform). Button fills change through a pseudo layer's opacity, not `background-color`. The qa-probe motion check
under reduce gave 0 running animations and 0 stranded text.

## Hover and focus (every hover has a `:focus-visible` twin)

- **Buttons:** lift 2 px, a leaf halo (pseudo, opacity and scale), the fill layer fades in, the arrow nudges 4 px;
  press scales to .97.
- **Nav links:** a leaf underline sweeps in (scaleX), with glow. The Products button keeps it while open and flips its
  chevron.
- **Mega cards:** lift 6 px, the image zooms 1.08, a leaf ring and glow appear, and an arrow chip slides in. Keyboard
  focus is identical.
- **Store cards:** lift 6 px, the postcard straightens from -4/+3 deg and rises.
- **Delivery card:** lift; the aura glow drifts.
- **Light boxes:** the plates fan further apart.
- **Accordion rows:** the title slides 6 px; the plus turns into a minus; the leaf edge grows.
- **Review cards and Hits cards:** lift with a leaf ring.
- **Photo frame (ZIP band):** a slow 1.04 zoom.
- **Top-bar, footer and long-form links:** a leaf underline sweep.
- **Gate rows:** slide 4 px with a leaf ring.
- **Focus rings:** 3 px leaf on dark, leaf-ink on light.

## States (query flag, read by `js/aura.js`)

- **`?state=gate`:** the age gate, step one. It shows the wordmark, "Verify Your Age", "Are you over the age of 21?",
  and "Yes, I'm 21+" / "No, I'm Under 21".
  - Yes reveals "Choose your location" and the two store rows, dims Yes to .33 and hides No.
  - No shows "We're sorry, but you do not meet the required age to enter this website."
  - A store row sets `localStorage.agePass_v2` and the cookie, then closes the gate. The prototype does not navigate.
- **`?state=mega`:** the Products mega menu.
  - Six image cards. Labels and hrefs come from the Education product items of `menu-primary-navigation`.
  - The San Pedro and LAX link columns are verbatim. The San Pedro vape link uses the ruling A8 target.
- **`?state=menu`:** the phone drawer. Locations, Products (the same six image cards plus both store lists, open),
  Education, About, Daily Deals and Contact, the socials, and a sticky Order Now.
- **No flag:** nothing is open.

## Real images used

| File | Source | Role |
|---|---|---|
| storefront-car-side-1920 | kit | age-gate background (its source role), blurred under the forest veil |
| sour-kush-jar-gallery-1200 | kit | night light-box photo (its source section, "We Are Here to Serve…") |
| red-lighter-cards-1200 | kit | community light-box photo (its source section) |
| storefront-car-rear-1200 | kit | ZIP band photo frame (its source section) |
| postcard-san-pedro-600, postcard-lax-culver-city-600 | kit | store-card protrusions (source role: the store cards) |
| mason-jars-1920 | kit | Flower mega card (400x500 crop); full-bleed editorial band on /products/flower |
| concentrate-macro-1920 | kit | Concentrates mega card crop |
| topicals-leaves-1920 | kit | Topicals mega card crop |
| flower-grinders-1280 | kit | framed protrusion F2 on /products/flower |
| cap (7ed18521), CBD bottle (e181cbbf) | assets/source | cut-outs H4, H3 |

Not used (as the brief requires): the champagne bar, Kiva chews, the In-N-Out tubes, the gummies card, the edibles neon
wall, vape-leaves (it shows a hand), and both book-cover flat-lays.

## Generated images (flux-pro v1.1 ultra; every master was viewed, and print-capable surfaces were zoomed)

| Name | Prompt (abridged; full text in `gen/<name>.jpg.json`) | Verdict |
|---|---|---|
| g1-hero-bud | extreme macro of one cured bud, frosted trichomes, right third, leaf-green rim light, pale green mist and smoke ribbons, dark forest left half, shallow DOF, no text/logo/people/hands | ACCEPTED: home hero. Viewed at 73%: no text or marks. Graded to saturation .84 to keep it calm, not acid |
| g2-trichome-field | abstract macro of trichomes like a soft-focus crystal forest, cool white and pale leaf-green light, forest shadows | ACCEPTED: Flower banner. The hue was pulled 18 deg from teal toward leaf green (the brief allows no hue shift beyond the greens) |
| g3-cartridge | plain unbranded clear glass cartridge with amber oil, faint vapour wisp, forest bokeh, no label/print | ACCEPTED: Vapes mega card. Zoomed at 100% on the cartridge: no print or mark |
| g4-leaf-dew | serrated fan-leaf edge with dew, backlit leaf green, pale mist | ACCEPTED: Edibles mega card. **Deliberately non-depictive.** A9 forbids generated edibles imagery, and every real edibles photo is flagged |
| g5-bud-studio | single dense cured bud with pistils on plain charcoal, centred | ACCEPTED: cut out with birefnet as protrusion F1 |
| g6-mist-ribbons | wide drifting smoke ribbons and mist in pale leaf green and cream on forest-black, abstract | ACCEPTED: atmosphere plane (night band, Hits band); masked radially, never behind body text |
| g7-preroll | single white unbranded pre-roll resting on frosted glass, green rim light | **REJECTED:** it rendered the pre-roll standing in a rocks-glass tumbler (an alcohol cue under A9), and the cone reads as a white crayon. It is kept in `gen/` |
| g8-preroll-flat | hand-rolled pre-roll cone, twisted tip, ground flower at the open end, lying on pale frosted stone, no glass/cup/smoke | ACCEPTED: Pre-Rolls mega card |

- Every prompt says "no text, no logo, no people", and none shows candy, alcohol, party, luxury, iridescence or neon.
- Masters g1, g2, g4 and g6 were viewed in contact sheets and at near-native size. They are organic subjects with no
  surface that could carry print.
- The cartridge (g3) was zoomed at 100%.
- Every shipped generated WebP carries the IPTC trainedAlgorithmicMedia XMP (see `gen/SPEND.md`).

## Spend

8 flux calls (limit 10) and 3 birefnet calls (limit 6), about **$0.54**. Flux costs $0.48 at the brief's $0.06 rate;
the birefnet price is unverified and is estimated at about $0.06. The per-call ledger is in `gen/SPEND.md`.

## QA (final run 12:14-12:20; `shots/qa-home.json`, `shots/qa-flower.json`, `shots/qa-home-motion.json`)

`tools/qa-probe.mjs --checks sharp,header,overflow,contrast,protrude,errors` at 1280x585@1.5, 1600x662@1.2 and
390x844@3: **PASS at all six page-sizes.**

- **Sharp** (first-screen file px per device px):
  - home: hero 1.109 / 1.107 / 1.089 (phone crop);
  - flower: banner 1.265 / 1.262 / 1.197, bud 2.08 / 2.26 / 2.15;
  - wordmark 1.43 / 1.79 / 1.01.
- **Header:** 0 hero-copy overlap (the header bottom is at 112 px, 108 on the phone).
- **Overflow:** scrollWidth equals clientWidth at every size, with the real 15 px scrollbar on desktop.
- **Contrast** (text on glass or image): minimum p05 is 4.58 on home and 4.76 on flower.
- **Protrude:** 0 hits. **Errors:** 0.
- **Motion** (reduce, 1280): 0 running, 0 stranded.

Fixed during QA:
- The `[hidden]` attribute lost to `display:grid`, which put the gate up without a flag.
- The phone top bar overflowed: the page zoomed to 423 px.
- The wordmark was too wide on phones (0.966).
- Pill corners and rings were inside the measured label box. Every `.btn` label is now its own span.
- The bud overlapped the "Flower" h1 box. The h1 is now inline-block.
- The underline background-image counted as "text on image". It is now a text-decoration.
- The reviews heading never revealed after a jump scroll. The observer was replaced by a scroll-position check.

One probe artefact was found and handled:
- On the phone, the flower eyebrow failed contrast (p05 1.65).
- A capture made the probe's way showed the sticky header and the skip link painted into the clip (a quirk of
  `captureBeyondViewport` with sticky and fixed elements). Hit-testing at that scroll position found nothing over the
  eyebrow.
- I made the intro ground solid white. The eyebrow's real contrast is #427d42 on #fff = 4.95, and the probe no longer
  classes it as text on an image.

Last edit after the final shots: `.scard` no longer transitions `box-shadow`. This is hover-only, so nothing changes at
rest; see the re-check note at the end.

## Known gaps and decisions for the panel

- **The promo strip is not designed.** The sub-header strip ("Welcome to We Roll Up…" / "We Roll Up Rosin Club + Buy
  any 5 rosin products + Get 25% Off") is omitted from both pages: the brief's chrome list leaves it out, and B6 asks
  which promotions are current.
- **The location chooser modal is not built.** In the source, the `js-location-chooser` buttons open a modal ("Choose
  Your Location" / "Where would you like to shop?"). Here they are plain links to the verbatim hrefs. The gate's store
  list uses the same visual language.
- **The top bar is shown with San Pedro - Palos Verdes pre-selected**, so the address and hours line can be judged.
  The live site starts at "Select a Location" until a cookie or path selects a store. Changing the select updates the
  address, hours and Order Now hrefs; it does not navigate in the prototype.
- **Social links are text labels** (Instagram, Google, Yelp, Weedmaps). No third-party brand glyphs were drawn.
- **Reviews:** the source's autoplay loop is replaced by a scroll-snap rail with Previous/Next buttons (WCAG 2.2.2).
  The order is fixed to the `audit/raw/index.html` order (A2).
- **CBD bottle label claims** ("HIGH-POTENCY", "1500 MG") are legible at about 352 CSS px tall. IMAGE-INVENTORY routes
  any large use to compliance review. If refused, the light box takes the red-lighter cut-out instead; one birefnet call
  is left in the budget.
- **Heading tags:** "We Are Here to Serve…" and "A Community Built Around Cannabis" are `h3.h1` in the source and h2
  here, for the outline.
- **Accordion markup:** the source nests `h2` inside `button` (invalid). Here it is `h2 > button` with aria-expanded.
  One panel is open at a time, as in the source.
- **The cut-off source sentence** "…delicious gummies and" is kept verbatim (B5).
- **Fonts:** Bricolage ships as a 408 KB variable TTF, not subset or woff2, because fontTools is not on this machine.
  The build should subset it to woff2.
- **The gate background photo** is below 1.0 file px per device px on phones (0.57). It is deliberately blurred under
  the 0.88 forest veil, so this is invisible. The source uses the same photo there.
- **Prototype links:** links keep the live paths (root-relative or the source's absolute URLs). JS points Home and
  Flower at the two local files (`data-proto-href`) so a reviewer can click between them.
- **Not built:** other pages, the Jane/Weedmaps embeds, the contact form, location pages, and a 404.

## Final re-check (12:25-12:31, after the last edits and the removal of unreferenced image copies)

- **Rebuild and shots:** home and flower at all three sizes, the gate, mega, menu and the scroll sequence. Every shot
  reports `broken 0`, and scrollWidth equals clientWidth.
- **qa-probe:** sharp, header, overflow, contrast, protrude and errors pass on 6 of 6 page-sizes (`shots/qa-home.json`,
  `shots/qa-flower.json`).
- **Text parity (verbatim check):** every source sentence of at least 13 characters is present in my page text.
  - Home: 46 of 46 (main plus the reviews). The one reported miss is the script cutting my source slice mid-tag after
    "Greg S", which is present.
  - Flower: 60 of 60 (main).
  - Positive control: one flower sentence altered in memory is reported missing (1 of 60), so the check can fire.
