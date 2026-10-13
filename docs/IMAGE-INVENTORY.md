# We Roll Up: image inventory (UNDERSTAND lane: images)

Generated 2026-10-13T02:38:44.476Z from `docs/data/images.json` (machine-readable twin of this file). Lane scratch, contact sheets, crops and scripts: `tmp/understand/images/`. No request was made to werollup.com or any vendor host; everything below comes from files on disk.

## What the build lanes need to know first

1. **40 files on disk, 39 distinct images.** `01de0d97-…classic-car-side-hero.webp` and `25e314b3-…classic-car-side-hero-1.webp` are byte-identical (sha256 `2ff18fc2104d…`, 229,900 B). `af620928` (sour kush gallery, 1200x1600) is the same frame as `77caae00` (sour kush hero, 1920x2560): mean grey difference 0.96/255, against 71.5 for a control pair. Keep one file each.
2. **8 painted images were never harvested.** Every inner-page header banner except the trop-cherry one is missing from `assets/source/` and from `audit/image-inventory.json`. They are referenced as `data-bgimage="linear-gradient(...),url(&#039;…&#039;)"` and the harvester did not decode `&#039;`. Evidence: `audit/raw/contact.html` (page-header div); 7 of the 8 are painted in the captures as a 1440x353 cover box (`audit/capture/baseline.*.1440.style.json`). The missing set includes the default header `werollup-products-champagne-bar-display-hero.webp`, which the raw crawl shows on 44 page headers. **Open question for the operator:** a targeted fetch of these 8 `/media/` files under PLAN D9.
3. **The default header rotates.** Pages without their own header get one of two images (champagne-bar or trop cherry), and the choice differs between page loads. The raw crawl and the later style capture disagree on 6 of the 15 captured default-header pages. The mechanism is UNVERIFIED. Pages with their own header: the 2 education sub-pages and the 6 product category pages. No header banner: `/`, `/location/culver-city`, `/location/san-pedro`, `/location/pagetype/primary-location`.
4. **Only five distinct photos are wide enough for a full-bleed hero in the 1280x585 @1.5 window** (1920 file px needed): the storefront side view (`25e314b3` = `01de0d97`), trop cherry `085a05d4`, sour kush hero `77caae00`, edibles neon wall `7a4352fe` (all 1.00), and the flatlay `8b360abb` (0.93, a slight upsample). The 1200-wide photos (`a28ecfaf`, `8bd7f345`, `af620928`) reach 0.63: half-width panels on desktop, but full-width on a 390 phone (1.03). `75fcd114` (800 px) is already upsampled on the live site (painted 944 CSS px at 1024, 0.85 file px per CSS px).
5. **The wordmark exists only as `logo-white-x.png`, 400x71.** It is painted 259x46 in the header and 400x71 (1440) or 340x60 (390) in the footer. That is 0.67 file px per device px at DPR 1.5 and 0.39 in the phone footer at DPR 3: soft. KEEP-AS-IS, never redrawn. A vector or larger master has to come from the client (open question).
6. **Ready-made depth pieces.** The two store-picker illustrations (`dd2e2c2b` LAX - Culver City, `f06599a5` San Pedro) already have transparent torn-paper right edges. The white-ground product shots `e181cbbf` (CBD bottle, object 634x1434 px) and `7ed18521` (cap, 887x825 px) are clean cut-outs. Photo objects worth cutting out: the classic car (`25e314b3`, front cut by the frame, so it must bleed off a page edge), the white We Roll Up bag (`085a05d4`), the red lighter (`8bd7f345`) and the Sour Kush jar (`77caae00`, lid soft). Sizes are in the cut-out table below.
7. **Compliance flags for the compliance lane** (no judgement made here). Sugared gummies next to a Kiva bar on the Edibles card (`a3d38155`) read as candy-like. THC percentages are legible on jars and bags (`75fcd114` "30.49%", `085a05d4` "THC: 29.62…"). Label claims on the CBD bottle ("HIGH-POTENCY", "1500 MG"). Third-party marks are legible: Kiva / Lost Farm, Camino, Raw Garden, Weedmaps, book covers, a Chevrolet badge, and a legible California plate "1959" on `a28ecfaf`.
8. **Corrections to `audit/image-inventory.json`.** Its `usedOn` undercounts: trop cherry is a header on 35 pages, not 1, and `01de0d97` is the home hero plus a preload on 91 pages, not a REMOVE. `75fcd114` is a product photo, not LOGO/BRAND. The Weedmaps image is a footer link logo with an 8x pixel surplus, not a low-res BACKGROUND. The LAX and San Pedro files are store-picker illustrations at 235-278 CSS px; their LOW-RES-FOR-ROLE flag holds only for a hero use.
9. **People:** none of the 39 distinct images or the 7 viewed header bands shows a person or a face. The storefront chrome holds tiny unidentifiable reflections. The pre-rolls header (`werollup-preroll-tubes-ashtray-in-n-out-cup-alt-hero…`) was NOT viewed: its page is not among the 25 captured templates and the file is not on disk.

## Method and definitions

Intrinsic px, alpha, sha256 read from file headers (tmp/understand/images/headers.mjs) and cross-checked with ffprobe (alpha.mjs: all 38 rasters agree). Painted sizes from the 100 computed-style captures audit/capture/baseline.<slug>.<390|768|1024|1440>.style.json (DPR 1): CSS backgrounds by url() in computed background-image, <img> boxes matched to the raw HTML <img> list by key class + order (the capture records no src); partner logos on /location/san-pedro re-mapped by aspect ratio because the Splide carousel clones slides. Painted width for background-size:cover = intrinsic width x max(boxW/w, boxH/h). Roles from audit/raw/*.html with HTML entities decoded (roles.mjs). Every image was viewed: contact sheets sheet-photos.png and sheet-logos.png, 1:1 crops crops-a.png and crops-b.png, header bands sheet-headers.png cropped from audit/screens/source/<page>.1440.png (y 186, 1440x353). ratioAt1280x1_5 = file px / 1920 (full-bleed in the 1280x585 window at DPR 1.5); ratioAt390x3 = file px / 1170 (full-width 390 phone at DPR 3). A ratio below 1.0 means the file is upsampled at that use.

- **max painted CSS W**: the largest rendered image width over the 100 captures, including cover overflow. Example: a portrait photo in a 1440x353 header is painted 1440 wide and 1920 tall, with only a 353 px slice visible.
- **r1280** = file width / 1920; **r390** = file width / 1170. Below 1.00 the file is upsampled at that use. The second operator window (1600x662 @1.2) also needs 1920 device px for a full-bleed image, so r1280 applies to it too. A full-HEIGHT cover hero on a 390x844 phone at DPR 3 needs about 2532 px of file height: only the 2560-tall portraits (085a05d4, 77caae00, 7a4352fe, 8b360abb) qualify.
- **sharp CSS W** = the widest CSS size at which the file still gives 1 file px per device px, at DPR 1.5 / 2 / 3.
- Recommendations: KEEP (hero-capable), KEEP-SMALL (not full-bleed on desktop; see sharp CSS W), KEEP-AS-IS (logos and partner logos, never edited), UPSCALE-CANDIDATE (decorative use only, never to fake detail of the real store), CUT-OUT-CANDIDATE, REMOVE (platform UI), MISSING-FROM-HARVEST (painted on the live site, not on disk).

## Photos and illustrations

| file | px | bytes | alpha | max painted CSS W | r1280 | r390 | sharp CSS W @1.5/2/3 | recommendation | subject |
|---|---|---|---|---|---|---|---|---|---|
| `01de0d97-werollup-san-pedro-storefront-classic-car-side-hero.webp` | 1920x1439 | 229900 | no | 944 | 1.00 | 1.64 | 1280 / 960 / 640 | **KEEP** + DUPLICATE: store once | Same photo as 25e314b3 (byte-identical): San Pedro storefront with the classic finned car. |
| `085a05d4-werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp` | 1920x2560 | 357382 | no | 1440 | 1.00 | 1.64 | 1280 / 960 / 640 | **KEEP** + CUT-OUT-CANDIDATE | Dark top-down flatlay: hardcover art book (floral and vintage soda-bottle illustration; publisher imprint read at sheet size as G...KO PRESS, spelling UNVERIFIED), a white We Roll Up mylar bag 'Trop Cherry', a gold metal lighter, a pre-roll. |
| `25e314b3-werollup-san-pedro-storefront-classic-car-side-hero-1.webp` | 1920x1439 | 229900 | no | 944 | 1.00 | 1.64 | 1280 / 960 / 640 | **KEEP** + CUT-OUT-CANDIDATE | San Pedro storefront exterior, landscape 4:3: white facade with black 'WE ROLL UP' letters and a green leaf on the roofline, black window panels with white 'We Roll Up.' type, a palm trunk, a classic finned light-blue car with chrome at the curb, blue sky, hard daylight. |
| `75fcd114-werollup-branded-tray-preroll-flower-marble-table-card.webp` | 800x1066 | 75046 | no | 944 | 0.42 | 0.68 | 533 / 400 / 267 | **KEEP-SMALL** + UPSCALE-CANDIDATE (decorative use only) | Marble table outdoors, glass tray with a black 'WeRollUp.' pre-roll tube, a black We Roll Up jar, gold ribbed lighter, pre-roll, dish of ground flower; leaf shadows; darkened rounded corners (vignette). |
| `77caae00-werollup-sour-kush-jar-preroll-crystal-tray-hero.webp` | 1920x2560 | 173370 | no | 944 | 1.00 | 1.64 | 1280 / 960 / 640 | **KEEP** + CUT-OUT-CANDIDATE | Outdoor marble table, cut-glass crystal tray with a black We Roll Up 'Sour Kush' jar, gold ribbed lighter, pre-roll, small glass dish of ground flower/kief; green foliage bokeh and dappled sun. |
| `7a4352fe-werollup-store-edibles-display-neon-sign-hero.webp` | 1920x2560 | 302558 | no | 944 | 1.00 | 1.64 | 1280 / 960 / 640 | **KEEP** | In-store display wall: pink neon script 'Edibles' above two glass-door cabinets of packaged edibles; We Roll Up caps (some 'SAN PEDRO') and black tees on the lower shelves; blue neon reflection at right. |
| `8b360abb-werollup-prerolls-book-keychain-lighter-flatlay-hero-scaled.webp` | 1790x2560 | 311672 | no | 944 | 0.93 | 1.53 | 1193 / 895 / 597 | **KEEP** | Top-down on a cream/yellow ground: hardcover whose title reads 'THE LAST K... OF CALIFORNIA' (partly occluded; full title inferred) with cover art of a burning silver trailer in a desert, two crossed pre-rolls, a white vape battery, a gold lighter, keys on a keychain with a green braided tassel and a brass band. |
| `8bd7f345-werollup-red-lighter-preroll-ashtray-playing-cards-gallery.webp` | 1200x1600 | 160726 | no | 688 | 0.63 | 1.03 | 800 / 600 / 400 | **KEEP-SMALL** + CUT-OUT-CANDIDATE | Top-down on a yellow surface: red lighter with white 'We Roll Up.' branding, cut-glass ashtray holding a pre-roll with ash on its tip and ground flower, playing cards (Joker, King of hearts). |
| `a28ecfaf-werollup-san-pedro-storefront-classic-car-rear-gallery.webp` | 1200x1599 | 184006 | no | 688 | 0.63 | 1.03 | 800 / 600 / 400 | **KEEP-SMALL** + CUT-OUT-CANDIDATE | Same storefront, portrait 3:4, from behind the car: tail fin, chrome bumper, yellow California plate, 'WE ROLL UP' sign with leaf, window panels, palm trunk. |
| `af620928-werollup-sour-kush-jar-preroll-crystal-tray-gallery.webp` | 1200x1600 | 96352 | no | 688 | 0.63 | 1.03 | 800 / 600 / 400 | **KEEP-SMALL** + NEAR-DUPLICATE: prefer 77caae00 | Same frame as 77caae00 (Sour Kush jar on a crystal tray, marble, foliage) at 62.5% scale. |
| `dd2e2c2b-LAX_-Culver-City-2.webp` | 600x569 | 56078 | yes: 3.6% fully transparent, 0.7% partial | 259.1 | 0.31 | 0.51 | 400 / 300 / 200 | **KEEP-SMALL** + UPSCALE-CANDIDATE (illustration, decorative) | Painterly illustration: the LAX Theme Building arches, a vertical 'CULVER CITY' sign with a round 'THE HEART OF SCREENLAND' emblem (film-camera icon), palms, sunset sky, water, a street lamp; torn-paper transparent right edge. |
| `f06599a5-San-Pedro_-Palos-Verdes-1.webp` | 600x531 | 38804 | yes: 1.7% fully transparent, 0.2% partial | 277.7 | 0.31 | 0.51 | 400 / 300 / 200 | **KEEP-SMALL** + UPSCALE-CANDIDATE (illustration, decorative) | Flat retro-poster illustration of a green suspension bridge (Vincent Thomas Bridge look) at sunset with light trails over water; torn-paper transparent right edge. |

## Category card images (location pages: Flower, Pre-Rolls, Edibles, Vapes, Extract, CBD, Accessories)

| file | px | bytes | alpha | max painted CSS W | r1280 | r390 | sharp CSS W @1.5/2/3 | recommendation | subject |
|---|---|---|---|---|---|---|---|---|---|
| `3e9d1609-2-e1666212690610.png` | 235x283 | 33343 | channel present but fully opaque | 171.9 | 0.12 | 0.20 | 157 / 118 / 78 | **KEEP-SMALL** | A white vape battery and a pen-style cartridge, on white. |
| `7ed18521-1-1.webp` | 1920x1920 | 31076 | no | 171.9 | 1.00 | 1.64 | 1280 / 960 / 640 | **CUT-OUT-CANDIDATE** + KEEP (category card) | Cream snapback cap with a black brim, embroidered 'LOS ANGELES' and 'We Roll Up' script, on white. |
| `a3d38155-3-e1666212672735.png` | 221x285 | 60939 | channel present but fully opaque | 171.9 | 0.12 | 0.19 | 147 / 111 / 74 | **KEEP-SMALL** | A KIVA chocolate bar and package with three red sugared gummies, on white. |
| `b33235c2-4-e1666212655306.png` | 253x280 | 42492 | channel present but fully opaque | 171.9 | 0.13 | 0.22 | 169 / 127 / 84 | **KEEP-SMALL** | Three pre-roll cones on white. |
| `dc361d95-5-e1666212610628.png` | 175x175 | 29011 | channel present but fully opaque | 171.9 | 0.09 | 0.15 | 117 / 88 / 58 | **KEEP-SMALL** | A single cured cannabis bud on white with a soft shadow. |
| `e181cbbf-8.webp` | 1920x1920 | 33890 | no | 171.9 | 1.00 | 1.64 | 1280 / 960 / 640 | **CUT-OUT-CANDIDATE** + KEEP (category card) | Amber dropper bottle, We Roll Up 'CBD TINCTURE', on white with a soft shadow. |
| `f603d5c0-1-e1666212708428.png` | 199x286 | 39478 | no | 171.9 | 0.10 | 0.17 | 133 / 100 / 66 | **KEEP-SMALL** | Amber cannabis concentrate drooping from a metal dab tool, on white. |

## Brand marks, favicons and partner logos

| file | px | bytes | alpha | max painted CSS W | r1280 | r390 | sharp CSS W @1.5/2/3 | recommendation | subject |
|---|---|---|---|---|---|---|---|---|---|
| `2fac1c34-cropped-favicon-1-300x300.png` | 300x300 | 37380 | yes: 73.4% fully transparent, 3.7% partial | not painted in captures | 0.16 | 0.26 | 200 / 150 / 100 | **KEEP-AS-IS** | Same green leaf favicon at 300 px. |
| `31f45ba8-teds-budz-logo.webp` | 200x200 | 7334 | yes: 69.6% fully transparent, 5.1% partial | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | Ted's Budz logo: yellow bubble lettering 'TEDS BUDZ' with a purple outline, on transparent. |
| `3329990b-weedmaps-white-e1666707377331.png` | 273x149 | 11041 | yes: 62.9% fully transparent, 5.2% partial | 33 | 0.14 | 0.23 | 182 / 137 / 91 | **KEEP-AS-IS** | White Weedmaps 'wm' logo with a smile mark and TM, on transparent. |
| `385c9a3b-alien-labs-6a2325f719171.webp` | 400x231 | 18048 | yes: 43.7% fully transparent, 2.5% partial | 212 | 0.21 | 0.34 | 267 / 200 / 133 | **KEEP-AS-IS** | Alien Labs logo: green brush script with a black outline, on transparent. |
| `4cbc0f1e-st-ides-logo.webp` | 200x200 | 3658 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | ST IDES logo: white/red/blue 'ST IDES' on black. |
| `5ac91359-favicon.png` | 150x150 | 5918 | yes: 75.3% fully transparent, 0% partial | not painted in captures | 0.08 | 0.13 | 100 / 75 / 50 | **KEEP-AS-IS** | Green cannabis leaf icon on transparent (favicon). |
| `7138f6a9-wizard-trees-logo.webp` | 200x200 | 11544 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | Wizard Trees logo: white script on a purple lightning/galaxy ground. |
| `790c9731-traditional-logo.webp` | 200x200 | 1928 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | Traditional logo: white serif 'TRADITIONAL' on a black gradient. |
| `8bd84cc3-cropped-favicon-1-150x150.png` | 150x150 | 14400 | yes: 72.2% fully transparent, 6% partial | not painted in captures | 0.08 | 0.13 | 100 / 75 / 50 | **KEEP-AS-IS** | Same green leaf favicon (WordPress site-icon crop). |
| `8f87827f-logo-white-x.png` | 400x71 | 4570 | yes: 62.3% fully transparent, 9% partial | 400 | 0.21 | 0.34 | 267 / 200 / 133 | **KEEP-AS-IS** | The We Roll Up wordmark: white 'We Roll Up.' in a rounded geometric sans with a period and a small TM, on transparent. |
| `a8dbdaaa-elusive-logo.webp` | 200x200 | 4456 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | Elusive logo: black 'ELUSIVE' over grey smoke. |
| `aca9905e-dime-think-higher-logo.webp` | 200x200 | 8886 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | Dime logo: 'DIME' with 'Think Higher' script in white/gold on black marble with gold veins. |
| `bbe694a7-710-labs-logo.webp` | 200x200 | 3334 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | 710 Labs logo: black line-art '710' and '710LABS' on a white square. |
| `c6755eb3-wyld.webp` | 200x200 | 1934 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | WYLD logo: black antlers and 'WYLD' on white. |
| `c958f54c-plugplay.webp` | 200x194 | 2138 | no | 200 | 0.10 | 0.17 | 133 / 100 / 67 | **KEEP-AS-IS** | PlugPlay logo: teal 'P' mark and 'PLUGPLAY TM' on black. |

## Platform UI (not part of the design)

| file | px | bytes | alpha | max painted CSS W | r1280 | r390 | sharp CSS W @1.5/2/3 | recommendation | subject |
|---|---|---|---|---|---|---|---|---|---|
| `3b7d3e45-gf-creditcards-check.svg` | 13x10 | 281 | vector (transparent canvas) | not painted in captures | n/a | n/a | vector | **REMOVE** | Gravity Forms green check (#34A853) (read as SVG text). |
| `54bac697-spinner.svg` | 16x16 | 416 | vector (transparent canvas) | not painted in captures | n/a | n/a | vector | **REMOVE** | Gravity Forms spinner: a rotating arc, #a7a9c1 (read as SVG text). |
| `7a461f12-loading_fcba57cd.gif` | 32x32 | 4178 | yes: 63.2% fully transparent, 0% partial | not painted in captures | 0.02 | 0.03 | 21 / 16 / 11 | **REMOVE** | Grey radial loading spinner (theme lazy-load placeholder). |
| `95383467-chosen-sprite-2x.png` | 104x74 | 738 | yes: 88.7% fully transparent, 5.6% partial | not painted in captures | 0.05 | 0.09 | 69 / 52 / 35 | **REMOVE** | Gravity Forms legacy 'chosen' select sprite @2x. |
| `c7f27c9f-chosen-sprite.png` | 52x37 | 538 | yes: 86.2% fully transparent, 10.1% partial | not painted in captures | 0.03 | 0.04 | 35 / 26 / 17 | **REMOVE** | Gravity Forms legacy 'chosen' select sprite (arrows, close x, search glass). |
| `d7e17eba-gf-creditcards.svg` | 439x33 | 12707 | vector (transparent canvas) | not painted in captures | n/a | n/a | vector | **REMOVE** | Gravity Forms credit-card brand icon strip (read as SVG text). |

## Painted on the live site but NOT on disk (MISSING-FROM-HARVEST)

| file (https://werollup.com/media/…) | used on | captured box at 1440 | what it shows (from `tmp/understand/images/sheet-headers.png`) | marks |
|---|---|---|---|---|
| `werollup-products-champagne-bar-display-hero.webp` | 44 page headers (raw crawl) | 1440 x 353 (cover) | Seen only painted under the 35% black overlay and title: black and white We Roll Up mylar bags ('PINCH HERE', pinch/slide/pull icons, large 'We Roll' type) and clear glassware or a bong at centre. | Client bags. |
| `cannabis-buds-mason-jars.webp` | /education/cannabis-101, /education/recreational-medicinal | 1440 x 353 (cover) | Rows of glass jars full of cured green flower with metal lids, low-key light; a handwritten label edge. | None seen. |
| `cannabis-13.webp` | /products/concentrates | 1440 x 353 (cover) | Macro of an amber shatter/rosin chunk on black. | None. |
| `kiva-lost-farm-cannabis-edibles-playing-cards-hero-e1778532668119.webp` | /products/edibles | 1440 x 353 (cover) | Pink KIVA 'LOST FARM' fruit-chew packs with the CA cannabis triangle symbol, a teal/pink card, on grey fabric. | Third-party brand (Kiva / Lost Farm) legible. |
| `cannabis-grinders-flower-flatlay.webp` | /products/flower | 1440 x 353 (cover) | Flatlay of red metal grinders, a bowl of ground flower, a dark bowl of buds, and paper on dark wood. | None seen. |
| `werollup-preroll-tubes-ashtray-in-n-out-cup-alt-hero-e1778532512785.webp` | /products/pre-rolls | not captured | NOT VIEWED: /products/pre-rolls is not among the 25 captured templates and the file is not on disk. The file name says pre-roll tubes, an ashtray and an In-N-Out cup. | UNVERIFIED. The file name implies an In-N-Out cup (third-party mark): check before use. |
| `cannabis-1.webp` | /products/topicals | 1440 x 353 (cover) | Cannabis fan leaves, an amber dropper bottle, an oil dish and a glass bottle on cream. | None seen. |
| `cannabis-16.webp` | /products/vaporizers-cartridges | 1440 x 353 (cover) | A vape cartridge pen on a diagonal over blurred green leaves, with an orange glow at the bottom. | None seen. |

## Per-image detail

### `01de0d97-werollup-san-pedro-storefront-classic-car-side-hero.webp`

- URL: https://werollup.com/media/werollup-san-pedro-storefront-classic-car-side-hero.webp | sha256 `2ff18fc2104d068887626518ce68ff5f41207ee7ce1fde3d5d464280c833168b` | 1920x1439, 229900 B, webp VP8 (lossy) (yuv420p)
- Used on: ALL 91 pages (head link rel=preload); / (home hero card background (div.color-white.rounded, cover))
- Painted: max index@1024: box 944x296, painted 944x708 (cover), 2.034 file px per CSS px | 1440 index@1440: box 852x448, painted 852x639 (cover), 2.254 file px per CSS px | 390 index@390: box 340x540, painted 721x540 (cover), 2.665 file px per CSS px
- People: None seen (see 25e314b3). | Text: See 25e314b3. | Marks: See 25e314b3.
- Quality: Identical file (sha256 2ff18fc2104d...).
- Recommendation: **KEEP** + DUPLICATE: store once | Cut-out: See 25e314b3.
- Notes: Home page left hero card (div.color-white.rounded, gradient rgba(0,0,0,.15) + cover) and the <link rel=preload as=image> on all 91 pages use this URL (no '-1'). It is the same bytes as 25e314b3. Keep one physical file and point both URLs at it. audit/image-inventory.json marks this record REMOVE/DUPLICATE and lists usedOn as 1 page, but it is the home hero.
- Evidence: tmp/understand/images/headers.json duplicates; audit/raw/index.html (preload + data-bgimage)

### `085a05d4-werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp`

- URL: https://werollup.com/media/werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp | sha256 `1032c571e4fea1f55dca848f5d826855b17cf87ef758929d8815f859af5c1a6d` | 1920x2560, 357382 B, webp VP8 (lossy) (yuv420p)
- Used on: /about-us (inner-page header banner (h-banner--old)); /accessibility-statement (inner-page header banner (h-banner--old)); /education (inner-page header banner (h-banner--old)); /location/culver-city/shop?store_path=%2F&store_query=filter%255BanyClientCategories%255D%255B%255D%3Dflower-category-pages%26sortBy%3Dmost_popular%26page%3D1&locationId=10599 (inner-page header banner (h-banner--old)); /location/culver-city/shop?store_path=%2F&store_query=filter%255BanyClientCategories%255D%255B%255D%3Dvape-pens-category-pages%26page%3D1 (inner-page header banner (h-banner--old)); /location/culver-city/shop?store_path=%2F&store_query=filter%255BanyClientCategories%255D%255B%255D%3Dedibles-category-pages%26page%3D1 (inner-page header banner (h-banner--old)); … 36 entries in images.json
- Painted: max about-us@1440: box 1440x353, painted 1440x1920 (cover), 1.333 file px per CSS px | 1440 about-us@1440: box 1440x353, painted 1440x1920 (cover), 1.333 file px per CSS px | 390 about-us@390: box 390x241, painted 390x520 (cover), 4.923 file px per CSS px
- People: None. | Text: 'We Roll Up.', 'Trop Cherry', 'THC: 29.62...' (partly cut), 'SMALLS' stamp, black leaf + TM, a publisher imprint (G...KO PRESS) and book-title fragments. | Marks: Client mylar bag. 'SMALLS' stamp (product-line or third-party mark, UNVERIFIED). Third-party book cover art.
- Quality: Sharp and clean at 1:1 (bag print crisp); 357,382 B.
- Recommendation: **KEEP** + CUT-OUT-CANDIDATE | Cut-out: The white We Roll Up mylar bag, rotated, about 1300x1450 px bounding box (estimate from the sheet). Its right side reaches the frame edge. Crisp print, so it stays sharp up to about 860 CSS px at DPR 1.5. The gold lighter (about 250x700 px, estimate) is a second option.
- Notes: Default inner-page header pool image (with the champagne-bar image, which was never downloaded). The raw crawl shows it on 35 page headers. The default header differs between page loads (see headerRotation). Also the Culver City location feature card (852x421 at 1440). The inventory lists usedOn as 1 page, which undercounts.
- Evidence: tmp/understand/images/sheet-photos.png tile 3; tmp/understand/images/crops-a.png tile 7

### `25e314b3-werollup-san-pedro-storefront-classic-car-side-hero-1.webp`

- URL: https://werollup.com/media/werollup-san-pedro-storefront-classic-car-side-hero-1.webp | sha256 `2ff18fc2104d068887626518ce68ff5f41207ee7ce1fde3d5d464280c833168b` | 1920x1439, 229900 B, webp VP8 (lossy) (yuv420p)
- Used on: ALL 91 pages (age-gate modal background)
- Painted: captured via the byte-identical 01de0d97 URL (/ hero card); age gate (this URL) inferred >= viewport width, UNVERIFIED | not painted in any of the 100 captures
- People: None seen (contact sheet + 1:1 window crops). Glass and chrome show only tree and sky reflections. No one who could read as under 21. | Text: 'WE ROLL UP' roofline sign; 'We Roll Up.' window panels; tiny '76' on the car's orange antenna balls. | Marks: We Roll Up storefront sign and window graphics (client). '76' antenna balls (third-party mark, a few px).
- Quality: Good exposure; moderately sharp at 1:1 with mild WebP smoothing on flat wall areas; 229,900 B lossy.
- Recommendation: **KEEP** + CUT-OUT-CANDIDATE | Cut-out: The classic car: about 1900x700 px (estimate from sheet-photos.png), front cut off by the LEFT frame edge, so a cut-out must bleed off a page edge. Strong contrast against the white wall and asphalt. Sharp up to about 1270 CSS px wide at DPR 1.5 or 950 at DPR 2. Real store photo: cut it out, never regenerate it.
- Notes: Byte-identical to 01de0d97 (sha256 2ff18fc2...). This '-1' URL is the age-gate modal background on all 91 pages (inline style 'background:url(...); background-size:cover; background-position:center;'). The age gate is hidden in the captures, so its painted size is inferred, not captured: a full-viewport cover means at least the viewport width (1440 CSS px in the 1440 capture). Real store: never generated or imitated.
- Evidence: tmp/understand/images/sheet-photos.png tile 1; tmp/understand/images/crops-a.png tiles 1-2; tmp/understand/images/crops-b.png tile 7; audit/raw/index.html (#ageGateModal style)

### `2fac1c34-cropped-favicon-1-300x300.png`

- URL: https://werollup.com/media/cropped-favicon-1-300x300.png | sha256 `111d8a9d4b63b488f349545e150c49a97a6c93279aebdfe7b9166a286ead4313` | 300x300, 37380 B, png (rgba)
- Used on: ALL 91 pages (head link rel=icon); ALL 91 pages (head link rel=apple-touch-icon); ALL 91 pages (head meta msapplication-TileImage)
- Painted: not painted in any of the 100 captures
- People: None. | Text: None. | Marks: Client icon.
- Quality: 300x300 RGBA.
- Recommendation: **KEEP-AS-IS**
- Notes: <link rel=icon>, apple-touch-icon and msapplication-TileImage on all 91 pages.
- Evidence: tmp/understand/images/sheet-logos.png tile 5

### `31f45ba8-teds-budz-logo.webp`

- URL: https://werollup.com/media/teds-budz-logo.webp | sha256 `4cf2c95b0a3f337ef9149357f8b5d1596d62f59a80de2c312da443af1f4ff01d` | 200x200, 7334 B, webp VP8 (lossy) (yuva420p)
- Used on: /location/culver-city (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'TEDS BUDZ' | Marks: Third-party partner brand. Cartoon-style lettering: show it only where the source shows it, never enlarged as decoration.
- Quality: 200x200 with real alpha.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 4').
- Evidence: tmp/understand/images/sheet-logos.png tile 12

### `3329990b-weedmaps-white-e1666707377331.png`

- URL: https://werollup.com/media/weedmaps-white-e1666707377331.png | sha256 `5c5a64aa974c34f2174da814fcc26fb7633ec362eec6070ed3422d81720ca9dd` | 273x149, 11041 B, png (rgba)
- Used on: ALL 91 pages (footer Weedmaps link logo (img.wp-image-61211, 18px tall))
- Painted: max about-us-daily-deals@1024: box 33x18, painted 33x18 (object-fit:fill), 8.28 file px per CSS px | 1440 about-us-daily-deals@1440: box 33x18, painted 33x18 (object-fit:fill), 8.28 file px per CSS px | 390 about-us-daily-deals@390: box 33x18, painted 33x18 (object-fit:fill), 8.28 file px per CSS px
- People: None. | Text: 'wm' TM | Marks: Third-party (Weedmaps).
- Quality: 273x149; painted 33x18 (8.3 file px per CSS px).
- Recommendation: **KEEP-AS-IS**
- Notes: Footer Weedmaps link image (img.wp-image-61211, inline style height 18px) on all 91 pages. The inventory's BACKGROUND/REPLACE/LOW-RES label is wrong: it is a link logo with an 8x surplus.
- Evidence: tmp/understand/images/sheet-logos.png tile 2

### `385c9a3b-alien-labs-6a2325f719171.webp`

- URL: https://werollup.com/media/alien-labs-6a2325f719171.webp | sha256 `fc02a20a1b47e056d9733d3b59c804c50ada1b46a7ad89c31151d77637827b0c` | 400x231, 18048 B, webp VP8 (lossy) (yuva420p)
- Used on: /location/san-pedro (partner brand logo strip)
- Painted: 208.5x120.4 CSS at /location/san-pedro @1440 (aspect 1.73 box; @768 212x122); 38 px wide at 390
- People: None. | Text: 'Alien Labs' | Marks: Third-party partner brand.
- Quality: 400x231 with real alpha (43.7% transparent); painted 208x120 at 1440, 212x122 at 768 (about 1.9 file px per CSS px).
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/san-pedro ('Company Logo 3').
- Evidence: tmp/understand/images/sheet-logos.png tile 7

### `3e9d1609-2-e1666212690610.png`

- URL: https://werollup.com/media/2-e1666212690610.png | sha256 `adffad9be3d9c7b88770bb3de2c49a1455962246a222b1fe712994d4f6d1abc7` | 235x283, 33343 B, png (rgba)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 1.367 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 1.367 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 1.521 file px per CSS px
- People: None. | Text: 'RAW GARDEN' on the pen; a wordmark on the battery (reads 'LITTO', UNVERIFIED). | Marks: Third-party brands (Raw Garden; battery brand UNVERIFIED).
- Quality: 235x283 RGBA (alpha fully opaque).
- Recommendation: **KEEP-SMALL**
- Notes: Category card 'Vapes' on both location pages.
- Evidence: tmp/understand/images/sheet-photos.png tile 17

### `4cbc0f1e-st-ides-logo.webp`

- URL: https://werollup.com/media/st-ides-logo.webp | sha256 `c3b46ed0f0efd5c2e8e1c17ee5195f85cc26946bd717448cab917ab3dfffa284` | 200x200, 3658 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip); /location/san-pedro (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-san-pedro@1440: box 208x120, painted 209x120 (object-fit:fill), 0.959 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'ST IDES' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city and /location/san-pedro ('Company Logo 1' on both).
- Evidence: tmp/understand/images/sheet-logos.png tile 11

### `5ac91359-favicon.png`

- URL: https://werollup.com/media/favicon.png | sha256 `de0cbb991e969e3ca6323357e6ae3f5eb71522a77aee19fc4ad05bec954ebdd7` | 150x150, 5918 B, png (pal8)
- Used on: ALL 91 pages (head link rel=icon)
- Painted: not painted in any of the 100 captures
- People: None. | Text: None. | Marks: Client icon (the leaf from the wordmark sign).
- Quality: 150x150 palette PNG + tRNS.
- Recommendation: **KEEP-AS-IS**
- Notes: <link rel=icon> on all 91 pages (/media/favicon.png).
- Evidence: tmp/understand/images/sheet-logos.png tile 3

### `7138f6a9-wizard-trees-logo.webp`

- URL: https://werollup.com/media/wizard-trees-logo.webp | sha256 `fa4fca59ff876c76d593638812d1e3a991625493d97184e31f8fc943b56cc02d` | 200x200, 11544 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'Wizard Trees' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 2').
- Evidence: tmp/understand/images/sheet-logos.png tile 14

### `75fcd114-werollup-branded-tray-preroll-flower-marble-table-card.webp`

- URL: https://werollup.com/media/werollup-branded-tray-preroll-flower-marble-table-card.webp | sha256 `ee40f464b9084a23effdd0ed7d29a27becf34828bb6f3f30e7dc1e3e1fef16d5` | 800x1066, 75046 B, webp VP8 (lossy) (yuv420p)
- Used on: / (home hero card background (div.color-white.rounded, cover))
- Painted: max index@1024: box 944x296, painted 944x1258 (cover), 0.847 file px per CSS px | 1440 index@1440: box 414x448, painted 414x552 (cover), 1.932 file px per CSS px | 390 index@390: box 340x344, painted 340x453 (cover), 2.353 file px per CSS px
- People: None. | Text: 'WeRollUp.' on the tube; jar lid 'We Roll Up.', '30.49%', 'TOTAL THC', 'Sour Kush Hybrid'. | Marks: Client tube and jar.
- Quality: Only 800 px wide, moderately soft at 1:1. On the live site it is UPSAMPLED at 1024 (painted 944 CSS px, 0.85 file px per CSS px).
- Recommendation: **KEEP-SMALL** + UPSCALE-CANDIDATE (decorative use only) | Cut-out: The black WeRollUp tube, about 330x90 px (estimate): too small for a protrusion.
- Notes: Home page right hero card (414x448 at 1440). audit/image-inventory.json calls it LOGO/BRAND, but it is a product photo. Sharp only up to about 533 CSS px at DPR 1.5.
- Evidence: tmp/understand/images/sheet-photos.png tile 9; tmp/understand/images/crops-b.png tile 2

### `77caae00-werollup-sour-kush-jar-preroll-crystal-tray-hero.webp`

- URL: https://werollup.com/media/werollup-sour-kush-jar-preroll-crystal-tray-hero.webp | sha256 `f7ec7a364a897fecee311d18c4e2ea4fb6b00a36dd00cfb5f18a9d61edce7a2f` | 1920x2560, 173370 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (location page feature card background (div.color-white.rounded, cover))
- Painted: max location-culver-city@1024: box 944x277, painted 944x1259 (cover), 2.034 file px per CSS px | 1440 location-culver-city@1440: box 414x421, painted 414x552 (cover), 4.638 file px per CSS px | 390 location-culver-city@390: box 340x333, painted 340x453 (cover), 5.647 file px per CSS px
- People: None. | Text: 'We Roll Up', 'Sour Kush', 'TOTAL THC', a percentage on the lid (partly legible). | Marks: Client jar label.
- Quality: Shallow depth of field: the lid top is soft by design, the jar body and tray are reasonably sharp; 173,370 B is lean for 1920x2560 (some smoothing).
- Recommendation: **KEEP** + CUT-OUT-CANDIDATE | Cut-out: The black Sour Kush jar, about 390x535 px (estimate from the sheet). Sharp up to about 260 CSS px wide at DPR 1.5 (lid soft). The crystal tray is see-through glass, a hard cut-out: not recommended.
- Notes: Master of the near-duplicate af620928 (same frame). Culver City location feature card (414x421 at 1440, 944x277 at 1024).
- Evidence: tmp/understand/images/sheet-photos.png tile 4; tmp/understand/images/crops-a.png tile 5

### `790c9731-traditional-logo.webp`

- URL: https://werollup.com/media/traditional-logo.webp | sha256 `0ba6910c6263daa3e519684c9c3fe72cb5a3ab84099181b91c3f27898932381d` | 200x200, 1928 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'TRADITIONAL' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 3').
- Evidence: tmp/understand/images/sheet-logos.png tile 13

### `7a4352fe-werollup-store-edibles-display-neon-sign-hero.webp`

- URL: https://werollup.com/media/werollup-store-edibles-display-neon-sign-hero.webp | sha256 `bf307b6f56fe6f827af767e31f2fc03a73cce659ab35d592db78e8f8c45ca595` | 1920x2560, 302558 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/san-pedro (location page feature card background (div.color-white.rounded, cover))
- Painted: max location-san-pedro@1024: box 944x277, painted 944x1259 (cover), 2.034 file px per CSS px | 1440 location-san-pedro@1440: box 414x421, painted 414x552 (cover), 4.638 file px per CSS px | 390 location-san-pedro@390: box 340x333, painted 340x453 (cover), 5.647 file px per CSS px
- People: None. | Text: 'Edibles' (neon); legible at 1:1: 'LOST FARM', 'LIVE RESIN', 'CAMINO SOURS'; caps 'SAN PEDRO' + We Roll Up script. | Marks: Third-party edible brands (Kiva Lost Farm, Camino) legible at 1:1; client merch caps.
- Quality: Moderate sharpness at 1:1; 302,558 B.
- Recommendation: **KEEP**
- Notes: Real store interior: show it as-is, never generate a look-alike. San Pedro location feature card (414x421 at 1440). Packaged gummies are visible: show this only where the source shows it.
- Evidence: tmp/understand/images/sheet-photos.png tile 6; tmp/understand/images/crops-a.png tile 6

### `7ed18521-1-1.webp`

- URL: https://werollup.com/media/1-1.webp | sha256 `62cd00e8f1916007d9ee82e0d5c1c7f04605027a988d3f4b5fe3a031c547beaf` | 1920x1920, 31076 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 11.172 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 11.172 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 12.425 file px per CSS px
- People: None. | Text: 'LOS ANGELES', 'We Roll Up'. | Marks: Client merch.
- Quality: Crisp embroidery texture at 1:1; 31,076 B.
- Recommendation: **CUT-OUT-CANDIDATE** + KEEP (category card) | Cut-out: The cap: object box 887x825 px at x534 y550 (923x871 with shadow). Plain white ground. Sharp up to about 590 CSS px wide at DPR 1.5.
- Notes: Category card 'Accessories' on both location pages.
- Evidence: tmp/understand/images/sheet-photos.png tile 13; tmp/understand/images/crops-b.png tile 4; tmp/understand/images/bbox.json

### `8b360abb-werollup-prerolls-book-keychain-lighter-flatlay-hero-scaled.webp`

- URL: https://werollup.com/media/werollup-prerolls-book-keychain-lighter-flatlay-hero-scaled.webp | sha256 `4c7e618095db7ef560d4fc7e1d2ea8eb1beb01b1c56acb69ac1454648f146efe` | 1790x2560, 311672 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/san-pedro (location page feature card background (div.color-white.rounded, cover))
- Painted: max location-san-pedro@1024: box 944x277, painted 944x1350 (cover), 1.896 file px per CSS px | 1440 location-san-pedro@1440: box 852x421, painted 852x1219 (cover), 2.101 file px per CSS px | 390 location-san-pedro@390: box 340x508, painted 356x508 (cover), 5.035 file px per CSS px
- People: None. | Text: Book title, author fragment '...N HARPER', a blurb credited 'S. A. Cosby'; brass band engraved '...EAU MA...' (partial). | Marks: Third-party book cover artwork dominates the frame. The brass band engraving may be a venue mark (UNVERIFIED).
- Quality: Pre-rolls and keychain soft at 1:1; acceptable at reduced size; 311,672 B ('-scaled' = WordPress big-image downscale).
- Recommendation: **KEEP** | Cut-out: Not recommended: the pre-rolls and keychain are soft at 1:1.
- Notes: 1790 px gives 0.93 at 1280@1.5, a slight upsample if full-bleed. San Pedro location feature card (852x421 at 1440).
- Evidence: tmp/understand/images/sheet-photos.png tile 7; tmp/understand/images/crops-a.png tile 8; tmp/understand/images/crops-b.png tile 8

### `8bd7f345-werollup-red-lighter-preroll-ashtray-playing-cards-gallery.webp`

- URL: https://werollup.com/media/werollup-red-lighter-preroll-ashtray-playing-cards-gallery.webp | sha256 `85f1682a890af70f22dd1998729a0db7035e7be69de57b932eb4dc8d6a235455` | 1200x1600, 160726 B, webp VP8 (lossy) (yuv420p)
- Used on: / (half-width content image (hc-half-content-image))
- Painted: max index@768: box 688x274, painted 688x917 (cover), 1.744 file px per CSS px | 1440 index@1440: box 633x537, painted 633x844 (cover), 1.896 file px per CSS px | 390 index@390: box 340x274, painted 340x453 (cover), 3.529 file px per CSS px
- People: None. | Text: 'We Roll Up.' on the lighter; card indices. | Marks: Client lighter.
- Quality: Reasonably sharp at 1:1; strong warm yellow cast; 160,726 B.
- Recommendation: **KEEP-SMALL** + CUT-OUT-CANDIDATE | Cut-out: The red We Roll Up lighter, about 240x640 px diagonal (estimate). Clean silhouette; sharp up to about 160x430 CSS px at DPR 1.5.
- Notes: Home page half-width content image (633x537 at 1440). 1200 px is too narrow for a desktop full-bleed (0.625).
- Evidence: tmp/understand/images/sheet-photos.png tile 8; tmp/understand/images/crops-b.png tile 1

### `8bd84cc3-cropped-favicon-1-150x150.png`

- URL: https://werollup.com/media/cropped-favicon-1-150x150.png | sha256 `c0bad93e36194a3316c4cc0e1431e7843e6e3a6b6ab055e0eb6c9bf686a03b66` | 150x150, 14400 B, png (rgba)
- Used on: ALL 91 pages (head link rel=icon)
- Painted: not painted in any of the 100 captures
- People: None. | Text: None. | Marks: Client icon.
- Quality: 150x150 RGBA.
- Recommendation: **KEEP-AS-IS**
- Notes: <link rel=icon> on all 91 pages.
- Evidence: tmp/understand/images/sheet-logos.png tile 4

### `8f87827f-logo-white-x.png`

- URL: https://werollup.com/media/logo-white-x.png | sha256 `8095e4658d0ab5fcb11a3b6c39d236401b75d5b2849e265b164d2c7586279367` | 400x71, 4570 B, png (pal8)
- Used on: ALL 91 pages (head meta og:image); ALL 91 pages (site logo)
- Painted: max about-us-daily-deals@1024: box 400x71, painted 400x71 (object-fit:fill), 1 file px per CSS px | 1440 about-us-daily-deals@1440: box 400x71, painted 400x71 (object-fit:fill), 1 file px per CSS px | 390 about-us-daily-deals@390: box 340x60, painted 340x60 (object-fit:fill), 1.177 file px per CSS px
- People: None. | Text: 'We Roll Up.' TM | Marks: Client wordmark.
- Quality: 400x71 palette PNG with tRNS. Painted 259x46 in the header (all widths), 400x71 in the footer at 1440 and 340x60 at 390. At DPR 1.5 a 400 CSS footer logo is 0.67 file px per device px, and on a 390 phone at DPR 3 the 340 CSS footer logo is 0.39: visibly soft.
- Recommendation: **KEEP-AS-IS**
- Notes: Header (#main-logo), off-canvas menu and footer on all 91 pages. og:image is malformed: https://werollup.comhttps://werollup.com/media/logo-white-x.png (the inventory's failed record). Never redraw it. A vector or larger master must come from the client (open question). Sharp widths: 267 CSS px at DPR 1.5, 200 at DPR 2, 133 at DPR 3.
- Evidence: tmp/understand/images/sheet-logos.png tile 1; audit/raw/index.html

### `a28ecfaf-werollup-san-pedro-storefront-classic-car-rear-gallery.webp`

- URL: https://werollup.com/media/werollup-san-pedro-storefront-classic-car-rear-gallery.webp | sha256 `b58946e14c2b613213ce20a46ba2c0ece4910594a16ddbdee9b8eebcc30a846c` | 1200x1599, 184006 B, webp VP8 (lossy) (yuv420p)
- Used on: / (half-width content image (hc-half-content-image)); /weed-delivery (half-width content image (hc-half-content-image))
- Painted: max index@768: box 688x274, painted 688x917 (cover), 1.744 file px per CSS px | 1440 index@1440: box 633x557, painted 633x844 (cover), 1.896 file px per CSS px | 390 index@390: box 340x274, painted 340x453 (cover), 3.529 file px per CSS px
- People: None. Chrome holds tiny unidentifiable reflections (a possible standing figure, no face). | Text: 'WE ROLL UP' sign; 'We Roll Up.' window panels; plate reading '1959' (legible at 1:1); trunk script badge read at 1:1 as 'Chevrolet'. | Marks: Client sign and windows. 'Chevrolet' badge (third-party automaker mark, small). License plate legible.
- Quality: Sharp at 1:1 on the sign, window type and chrome; 184,006 B.
- Recommendation: **KEEP-SMALL** + CUT-OUT-CANDIDATE | Cut-out: Car rear quarter (tail fin + bumper), cut by the left and bottom frame edges. About 1000x700 px (estimate). Usable as an edge-bleeding protrusion up to about 660 CSS px at DPR 1.5.
- Notes: Too narrow for a desktop full-bleed (1200 px gives 0.625 at 1280@1.5); full-width on a phone is fine (1.03 at 390@3). Half-width panel on / and /weed-delivery (hc-half-content-image, cover). Legible plate: soften or avoid at hero size if the operator prefers.
- Evidence: tmp/understand/images/sheet-photos.png tile 2; tmp/understand/images/crops-a.png tiles 3-4

### `a3d38155-3-e1666212672735.png`

- URL: https://werollup.com/media/3-e1666212672735.png | sha256 `435df9aaa2e0841e3a69676816a5125bd22016668fbda014571df9e8053eba84` | 221x285, 60939 B, png (rgba)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 1.286 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 1.286 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 1.43 file px per CSS px
- People: None. | Text: 'KIVA', '100' on the package. | Marks: Third-party brand (Kiva).
- Quality: 221x285 RGBA (alpha fully opaque). Object 172x221 px.
- Recommendation: **KEEP-SMALL**
- Notes: Category card 'Edibles' on both location pages. Sugared gummies read as candy-like: flagged for the compliance lane. Show only where the source shows it; never reuse it as a decorative protrusion.
- Evidence: tmp/understand/images/sheet-photos.png tile 16

### `a8dbdaaa-elusive-logo.webp`

- URL: https://werollup.com/media/elusive-logo.webp | sha256 `5844e58a392510544d6dc7aacfe72a50aeff24cea1febc421516a5b90428a69e` | 200x200, 4456 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'ELUSIVE' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 5').
- Evidence: tmp/understand/images/sheet-logos.png tile 9

### `aca9905e-dime-think-higher-logo.webp`

- URL: https://werollup.com/media/dime-think-higher-logo.webp | sha256 `5250628aab70df6a2b6f7d10c6026ebfa3499dec8dcf10d70c9744b48723342c` | 200x200, 8886 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'DIME', 'Think Higher' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 6').
- Evidence: tmp/understand/images/sheet-logos.png tile 8

### `af620928-werollup-sour-kush-jar-preroll-crystal-tray-gallery.webp`

- URL: https://werollup.com/media/werollup-sour-kush-jar-preroll-crystal-tray-gallery.webp | sha256 `8ae1aaac2eac04096fb10c78c425f3dffdf15e7c9a234a17e1d003492b3f4e6f` | 1200x1600, 96352 B, webp VP8 (lossy) (yuv420p)
- Used on: / (half-width content image (hc-half-content-image))
- Painted: max index@768: box 688x274, painted 688x917 (cover), 1.744 file px per CSS px | 1440 index@1440: box 633x598, painted 633x844 (cover), 1.896 file px per CSS px | 390 index@390: box 340x274, painted 340x453 (cover), 3.529 file px per CSS px
- People: None. | Text: As 77caae00. | Marks: Client jar label.
- Quality: Downscaled copy: mean absolute grey difference against 77caae00 is 0.96/255 at 300x400 (a control pair of different photos gives 71.5).
- Recommendation: **KEEP-SMALL** + NEAR-DUPLICATE: prefer 77caae00
- Notes: Home page half-width content image (hc-half-content-image, 633x598 at 1440). The build can serve the 77caae00 master here.
- Evidence: tmp/understand/images/sheet-photos.png tile 5; near-duplicate diff run 2026-10-13 10:22

### `b33235c2-4-e1666212655306.png`

- URL: https://werollup.com/media/4-e1666212655306.png | sha256 `f6575bd152e39e60a5dc13d118de0df834630451f3fee1d5a28ef3c251306a24` | 253x280, 42492 B, png (rgba)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 1.472 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 1.472 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 1.637 file px per CSS px
- People: None. | Text: None. | Marks: None.
- Quality: 253x280 RGBA (alpha fully opaque). Object 136x259 px with shadow.
- Recommendation: **KEEP-SMALL** | Cut-out: Pre-rolls 136x259 px: up to about 90x170 CSS px at DPR 1.5 only.
- Notes: Category card 'Pre-Rolls' on both location pages.
- Evidence: tmp/understand/images/sheet-photos.png tile 15; tmp/understand/images/bbox.json

### `bbe694a7-710-labs-logo.webp`

- URL: https://werollup.com/media/710-labs-logo.webp | sha256 `6795ab29862e2e5bc4f6ade8f34ada64becc9c16dfe5c9ea7db4c9f8618bcea1` | 200x200, 3334 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (partner brand logo strip); /location/san-pedro (partner brand logo strip)
- Painted: max location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-culver-city@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-culver-city@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: '710LABS' | Marks: Third-party partner brand.
- Quality: 200x200 opaque; painted 200x200 at 1440 (1.0), 38x38 at 390.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/culver-city ('Company Logo 7') and /location/san-pedro ('Company Logo 2').
- Evidence: tmp/understand/images/sheet-logos.png tile 6

### `c6755eb3-wyld.webp`

- URL: https://werollup.com/media/wyld.webp | sha256 `17122a17299b36d73239daa404c9b9e29084d1c617db870cfcf248ca5a583b64` | 200x200, 1934 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/san-pedro (partner brand logo strip)
- Painted: max location-san-pedro@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 1440 location-san-pedro@1440: box 200x200, painted 200x200 (object-fit:fill), 1 file px per CSS px | 390 location-san-pedro@390: box 38x38, painted 38x38 (object-fit:fill), 5.263 file px per CSS px
- People: None. | Text: 'WYLD' | Marks: Third-party partner brand.
- Quality: 200x200 opaque.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/san-pedro ('Company Logo 5').
- Evidence: tmp/understand/images/sheet-logos.png tile 15

### `c958f54c-plugplay.webp`

- URL: https://werollup.com/media/plugplay.webp | sha256 `64134c0ffa6614c27c5dece476d3c9b53298dbc05d9f918708e1414cf2559f00` | 200x194, 2138 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/san-pedro (partner brand logo strip)
- Painted: 200x194 CSS at /location/san-pedro @1440; 38 px wide at 390
- People: None. | Text: 'PLUGPLAY' | Marks: Third-party partner brand.
- Quality: 200x194 opaque; painted 200x194.
- Recommendation: **KEEP-AS-IS**
- Notes: Partner logo strip on /location/san-pedro ('Company Logo 4').
- Evidence: tmp/understand/images/sheet-logos.png tile 10

### `dc361d95-5-e1666212610628.png`

- URL: https://werollup.com/media/5-e1666212610628.png | sha256 `c42c1cc8431968a91e5a4e08fc81a9e47f9035052ab351f2d7517c93fae58091` | 175x175, 29011 B, png (rgba)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 1.018 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 1.018 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 1.132 file px per CSS px
- People: None. | Text: None. | Marks: None.
- Quality: 175x175 RGBA (alpha fully opaque, white ground). Bud only 134x95 px.
- Recommendation: **KEEP-SMALL** | Cut-out: Bud 134x95 px: sharp only up to about 90 CSS px at DPR 1.5, too small for a protrusion. A generated flower macro covers that role (generatedPlan G02).
- Notes: Category card 'Flower' on both location pages (172x150 CSS, about 1.0 file px per CSS px: already soft at DPR 1.5).
- Evidence: tmp/understand/images/sheet-photos.png tile 14; tmp/understand/images/bbox.json

### `dd2e2c2b-LAX_-Culver-City-2.webp`

- URL: https://werollup.com/media/LAX_-Culver-City-2.webp | sha256 `1ecdabf235194e15594e63367af12edfadebc5ef10a6cda01d51fb2e02aee77b` | 600x569, 56078 B, webp VP8 (lossy) (yuva420p)
- Used on: ALL 91 pages (location chooser modal card image (hidden until opened)); / (location card image (store picker))
- Painted: max index@768: box 115x246, painted 259x246 (cover), 2.315 file px per CSS px | 1440 index@1440: box 236x185, painted 236x223 (cover), 2.547 file px per CSS px | 390 not visible
- People: None. | Text: 'CULVER CITY', 'THE HEART OF SCREENLAND'. | Marks: Culver City civic sign and slogan; depiction of the LAX Theme Building landmark. No commercial brand marks.
- Quality: 600x569, soft but clean; 3.6% fully transparent pixels (torn right edge). Who made it, and whether it is AI-generated, is UNVERIFIED.
- Recommendation: **KEEP-SMALL** + UPSCALE-CANDIDATE (illustration, decorative) | Cut-out: Already has a transparent torn edge: it can overlap a section edge as-is at up to about 400 CSS px wide at DPR 1.5.
- Notes: Store picker image for LAX - Culver City: the location chooser modal on all 91 pages (hidden in captures) and the home store-picker card (235x185 at 1440, hidden at 390 by d-none d-md-block). The inventory flags LOW-RES-FOR-ROLE.
- Evidence: tmp/understand/images/sheet-photos.png tile 10; tmp/understand/images/crops-b.png tile 5; tmp/understand/images/alpha.json

### `e181cbbf-8.webp`

- URL: https://werollup.com/media/8.webp | sha256 `05a515ca46e06aa68f2cff4c9dae230da86b7160c00d2cba1ec41adfc617cfdc` | 1920x1920, 33890 B, webp VP8 (lossy) (yuv420p)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 11.172 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 11.172 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 12.425 file px per CSS px
- People: None. | Text: 'We Roll Up.', 'MILD SPEARMINT', 'CBD TINCTURE', 'HIGH-POTENCY', '1500 MG', 'Serving size - 25mg', '2Fl OZ - 60ML'. | Marks: Client-branded product label.
- Quality: Crisp label graphics; 33,890 B (flat white compresses well). Looks like a rendered product mockup, not a photo (UNVERIFIED).
- Recommendation: **CUT-OUT-CANDIDATE** + KEEP (category card) | Cut-out: The bottle with dropper: object box 634x1434 px at x708 y195 (pixels darker than grey 150; 772x1462 with shadow). Plain white ground, so background removal is trivial. Sharp up to about 420x955 CSS px at DPR 1.5.
- Notes: Category card 'CBD' on /location/culver-city and /location/san-pedro (rendered as a cover background in a 172x150 box; the inner <img> has opacity 0). Label claims ('HIGH-POTENCY', '1500 MG') go to the compliance lane before any large use.
- Evidence: tmp/understand/images/sheet-photos.png tile 12; tmp/understand/images/crops-b.png tile 3; tmp/understand/images/bbox.json

### `f06599a5-San-Pedro_-Palos-Verdes-1.webp`

- URL: https://werollup.com/media/San-Pedro_-Palos-Verdes-1.webp | sha256 `094889f644a987ca89091353bb71f4fdebf2b0b2294fdeda89910f544e1992d7` | 600x531, 38804 B, webp VP8 (lossy) (yuva420p)
- Used on: ALL 91 pages (location chooser modal card image (hidden until opened)); / (location card image (store picker)); /location-pagetype/primary-location (inline <img> in page body)
- Painted: max index@768: box 115x246, painted 278x246 (cover), 2.161 file px per CSS px | 1440 index@1440: box 236x185, painted 236x209 (cover), 2.547 file px per CSS px | 390 not visible
- People: None. | Text: None seen. | Marks: Landmark depiction only.
- Quality: 600x531, clean flat colour; 1.7% fully transparent pixels (torn edge).
- Recommendation: **KEEP-SMALL** + UPSCALE-CANDIDATE (illustration, decorative) | Cut-out: Transparent torn edge: can overlap a section edge as-is at up to about 400 CSS px wide at DPR 1.5.
- Notes: Store picker image for San Pedro - Palos Verdes: the location chooser modal on all 91 pages, the home store-picker card, and an <img> on /location/pagetype/primary-location.
- Evidence: tmp/understand/images/sheet-photos.png tile 11; tmp/understand/images/crops-b.png tile 6

### `f603d5c0-1-e1666212708428.png`

- URL: https://werollup.com/media/1-e1666212708428.png | sha256 `e8c8bb0e044c71e2b341d2672067b2aad8416892eb65ca1dad6943f276e67c41` | 199x286, 39478 B, png (rgb24)
- Used on: /location/culver-city (category card image); /location/san-pedro (category card image); /location/culver-city (category card <img> (opacity 0, inside the bg div)); /location/san-pedro (category card <img> (opacity 0, inside the bg div))
- Painted: max location-culver-city@1024: box 172x150, painted 172x150 (object-fit:fill), 1.158 file px per CSS px | 1440 location-culver-city@1440: box 172x150, painted 172x150 (object-fit:fill), 1.158 file px per CSS px | 390 location-culver-city@390: box 155x150, painted 155x150 (object-fit:fill), 1.288 file px per CSS px
- People: None. | Text: None. | Marks: None.
- Quality: 199x286 RGB (no alpha). Object 166x221 px with shadow.
- Recommendation: **KEEP-SMALL** | Cut-out: Concentrate: about 110x150 CSS px at DPR 1.5 at most. Too small for a protrusion; generatedPlan G10 covers that role.
- Notes: Category card 'Extract' on both location pages.
- Evidence: tmp/understand/images/sheet-photos.png tile 18

## Cut-out candidates (for protrusions across section edges)

| source | object | object px | stays sharp up to (CSS, DPR 1.5) | caveat |
|---|---|---|---|---|
| `e181cbbf-8.webp` | We Roll Up CBD tincture bottle | 634x1434 (measured, bbox.json) | about 420x955 | white ground, trivial removal; label claims go to compliance |
| `7ed18521-1-1.webp` | We Roll Up "LOS ANGELES" snapback | 887x825 (measured) | about 590x550 | white ground |
| `25e314b3` / `01de0d97` storefront | classic finned car | about 1900x700 (estimate) | about 1270 wide | front cut by the left frame edge: bleed it off a page edge; real store photo |
| `085a05d4` trop cherry | white We Roll Up "Trop Cherry" mylar bag | about 1300x1450 rotated bbox (estimate) | about 860 wide | right side reaches the frame edge |
| `8bd7f345` red lighter | red We Roll Up lighter | about 240x640 diagonal (estimate) | about 160x430 | warm cast from the yellow ground |
| `77caae00` sour kush hero | black Sour Kush jar | about 390x535 (estimate) | about 260 wide | lid soft (shallow depth of field); the glass tray is not cut-able |
| `a28ecfaf` storefront rear | car rear quarter (fin + bumper) | about 1000x700 (estimate) | about 660 wide | cut by the left and bottom edges; legible plate |
| `dd2e2c2b`, `f06599a5` | whole illustration (torn transparent edge) | 600x569, 600x531 | about 400 wide | already transparent on the right edge |
| `dc361d95`, `b33235c2`, `f603d5c0` | bud, 3 pre-rolls, concentrate | 134x95, 136x259, 166x221 (measured) | about 90-110 wide | too small: generated slots G02, G12 and G10 cover these roles |

## Partner brand logos (KEEP-AS-IS, shown only where the source shows them)

| brand | file | px | shown on | shop filter pages crawled |
|---|---|---|---|---|
| 710 Labs | `bbe694a7-710-labs-logo.webp` | 200x200 | /location/culver-city (Company Logo 7); /location/san-pedro (Company Logo 2) | Shop filter pages for this brand exist (Culver City brandSlugs=710-labs; San Pedro filters[brand][]=710 Labs) |
| Alien Labs | `385c9a3b-alien-labs-6a2325f719171.webp` | 400x231 | /location/san-pedro (Company Logo 3) | San Pedro filters[brand][]=Alien Labs |
| Dime (Think Higher) | `aca9905e-dime-think-higher-logo.webp` | 200x200 | /location/culver-city (Company Logo 6) | Culver City brandSlugs=dime |
| Elusive | `a8dbdaaa-elusive-logo.webp` | 200x200 | /location/culver-city (Company Logo 5) | Culver City brandSlugs=elusive |
| PlugPlay | `c958f54c-plugplay.webp` | 200x194 | /location/san-pedro (Company Logo 4) | San Pedro filters[brand][]=PlugPlay |
| ST IDES | `4cbc0f1e-st-ides-logo.webp` | 200x200 | /location/culver-city (Company Logo 1); /location/san-pedro (Company Logo 1) | San Pedro filters[brand][]=ST IDES |
| Ted's Budz | `31f45ba8-teds-budz-logo.webp` | 200x200 | /location/culver-city (Company Logo 4) | Culver City brandSlugs=teds-budz |
| Traditional | `790c9731-traditional-logo.webp` | 200x200 | /location/culver-city (Company Logo 3) | Culver City brandSlugs=traditional |
| Wizard Trees | `7138f6a9-wizard-trees-logo.webp` | 200x200 | /location/culver-city (Company Logo 2) | Culver City brandSlugs=wizard-trees |
| WYLD | `c6755eb3-wyld.webp` | 200x200 | /location/san-pedro (Company Logo 5) | San Pedro filters[brand][]=WYLD |

Partner logos are painted 200x200 CSS at 1440 (Alien Labs 208x120 and PlugPlay 200x194: the aspect is kept by `h-auto`), and only 38 px wide at 390. The San Pedro strip is a Splide carousel with cloned slides.

## Duplicates

- Byte-identical (229900 B, sha256 2ff18fc2104d (full hash in images[].sha256)): `01de0d97-werollup-san-pedro-storefront-classic-car-side-hero.webp` = `25e314b3-werollup-san-pedro-storefront-classic-car-side-hero-1.webp`. URLs: https://werollup.com/media/werollup-san-pedro-storefront-classic-car-side-hero.webp (home hero card + preload on 91 pages) / https://werollup.com/media/werollup-san-pedro-storefront-classic-car-side-hero-1.webp (age-gate modal background on 91 pages). Action: Store one file; both uses point to it.
- Near-duplicate: `77caae00-werollup-sour-kush-jar-preroll-crystal-tray-hero.webp` ~ `af620928-werollup-sour-kush-jar-preroll-crystal-tray-gallery.webp`. Same frame: mean absolute grey difference 0.96/255 at 300x400 (control pair 71.5/255). Action: Use 77caae00 (1920x2560) as the master for both uses.

## Header banner by page

Counts from the raw crawl: `werollup-products-champagne-bar-display-hero.webp` 44, `werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp` 35, `cannabis-buds-mason-jars.webp` 2, `(none)` 4, `cannabis-13.webp` 1, `kiva-lost-farm-cannabis-edibles-playing-cards-hero-e1778532668119.webp` 1, `cannabis-grinders-flower-flatlay.webp` 1, `werollup-preroll-tubes-ashtray-in-n-out-cup-alt-hero-e1778532512785.webp` 1, `cannabis-1.webp` 1, `cannabis-16.webp` 1. The full page-to-image map is `headerBannerByPage` in images.json. Pages without their own header image get the default banner from a pool of two images, and the choice differs between page loads: werollup-products-champagne-bar-display-hero.webp and werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp. The raw crawl (audit/raw, 01:44-01:46Z) and the style capture (01:50Z+) disagree on 6 of the 15 captured default-header pages: /accessibility-statement, /contact, /lax-menu, /privacy-policy, /service-area, /weed-delivery. All four widths of one capture agree. Raw counts: champagne 44 pages, trop cherry 35. The mechanism (server-side random per request, or something else) is not proven; the evidence shows only that the choice differs between loads.

## Generated media: PROVISIONAL plan (the design panel finalises it)

Rules for every slot:
- No text, letters, numbers, signage, labels or packaging print of any kind.
- No logos or brand marks; never a We Roll Up mark or anything resembling it (the green leaf favicon, the wordmark, branded jars, bags, lighters, tubes, caps).
- No recognisable third-party characters, artwork, book covers, vehicles' badges or products.
- No people. If a hand ever proves unavoidable, it must read as clearly adult and show no face. The default is no people at all.
- Nothing attractive to children: no cartoons, mascots, candy, gummies, sweets, toys or candy-like colour play.
- Never a depiction of the client's actual store, storefront, interior, staff, customers, car or branded products. Real store photos stay real.
- Industry-relevant: cannabis botany, cured flower macro, trichomes, smoke and haze, LA golden-hour light, palms, coastal San Pedro light, the LAX / Culver City sky.
- Ethereal treatment: mist, light leaks, glow, soft focus, translucent layers; colour anchored to the brand green family with warm gold light.
- Compliance: follow docs/COMPLIANCE.md (California cannabis advertising rules); label AI media with XMP or a metadata comment and disclose it (docs/PLAN.md section 4).
- Budget: count against the $15 cap (docs/PLAN.md D6) and book every call in audit/generated-images.json.

| slot | kind | subject | purpose | aspect | complements | extra rules |
|---|---|---|---|---|---|---|
| G01 | fal still | Golden-hour Los Angeles haze: layered silhouettes of tall palms dissolving into warm mist, light leaks, no buildings or signs | home hero background layer behind the real storefront photo (depth plate) | 16:9 (plus a 9:16 phone variant) | 25e314b3 / 01de0d97 storefront (the real photo stays in front) | all; no recognisable street or storefront |
| G02 | fal still | Macro of a single cured cannabis bud, frosted trichomes, soft rim light, on a plain dark neutral ground for clean background removal | protruding cut-out object crossing a section edge | 1:1, at least 2048 px | dc361d95 Flower card (bud only 134x95 px, too small to protrude) | all; plain ground, no jar or label |
| G03 | fal still | Extreme macro of trichome heads, glassy and iridescent, deep bokeh | atmospheric texture band (Flower / Products) | 21:9 | missing header cannabis-grinders-flower-flatlay.webp | all |
| G04 | fal still | Translucent wisps of white smoke on pure black | screen-blend overlay layer between sections (haze depth) | 16:9 | 085a05d4 trop cherry and the champagne-bar header pool | all; pure black ground so it can be screen-blended |
| G05 | fal still | Pastel dusk sky over west Los Angeles with a soft jet contrail and long clouds; no buildings, landmarks or signs | Culver City / LAX location band background | 21:9 | dd2e2c2b LAX - Culver City illustration | all; no aircraft livery, no LAX Theme Building copy |
| G06 | fal still | Coastal morning haze over Pacific water with soft golden light and distant blurred harbour silhouettes | San Pedro location band background | 21:9 | f06599a5 San Pedro - Palos Verdes illustration | all; no ships' names, no bridge replica |
| G07 | fal still | Palm-frond shadows moving across warm white stucco, dappled sun | light-section background texture | 3:2 | the storefront's white facade (25e314b3) and the leaf shadows in 75fcd114 / 77caae00 | all; no windows, signs or architecture details of the store |
| G08 | fal still | A single cannabis fan leaf backlit in fog, translucent emerald glow, on a plain ground | parallax layer and protruding cut-out object | 4:5 | the brand green family (it must not imitate the leaf in the logo or favicon) | all |
| G09 | fal still | Prismatic caustics from cut crystal glass falling on white marble, no objects in frame | texture band behind product and menu cards | 16:9 | the crystal trays in 77caae00 / 8bd7f345 / 75fcd114 | all |
| G10 | fal still | Macro of glossy amber cannabis rosin with warm backlight on a dark ground | Concentrates menu card and protruding cut-out | 4:5 | f603d5c0 Extract card (199x286) and missing cannabis-13.webp | all; no dab tool brand |
| G11 | fal still | Cured cannabis flower inside an unlabeled clear glass jar, soft side light, mist | Flower / Education menu card | 4:5 | missing cannabis-buds-mason-jars.webp | all; jar must be blank, no lid print |
| G12 | fal still | A single unbranded pre-roll resting on marble with a thin curl of smoke, golden light | Pre-Rolls menu card and protruding cut-out | 3:4 | b33235c2 Pre-Rolls card (253x280) and the missing pre-rolls header | all; plain paper, no tips with print |
| G13 | fal still | Cannabis plant canopy with morning dew in soft mist, emerald and gold | Education / Cannabis 101 atmospheric band | 21:9 | missing cannabis-buds-mason-jars.webp header | all |
| G14 | fal still | Botanical oil drops and a blank amber dropper silhouette with leaf shadows on linen | Topicals / CBD menu card | 4:5 | e181cbbf CBD tincture and missing cannabis-1.webp | all; no label, no bottle print |
| G15 | fal still | A soft vapour curl rising over a blank glass cartridge silhouette against green bokeh | Vapes menu card | 4:5 | 3e9d1609 Vapes card and missing cannabis-16.webp | all; no device brand, no logo |
| G16 | fal still | Abstract ethereal mist gradient, deep emerald to mint to warm cream, fine film grain | global background texture and section transitions | 16:9, tileable edges | brand green family | all |
| G17 | fal still | Abstract pink and blue neon glow reflected in rain-wet glass, bokeh, no letters or tubes forming words | night-mood atmospheric band near shop and edibles content | 21:9 | 7a4352fe edibles neon wall (real store, never imitated) | all; no readable neon shapes, no store interior |
| V01 | Higgsfield loop | Slow drifting smoke and haze on pure black, seamless | hero overlay motion layer (screen blend) | 16:9, 5-6 s seamless loop | 25e314b3 storefront hero | all; must loop without a visible seam; respect prefers-reduced-motion |
| V02 | Higgsfield loop | Golden-hour palm silhouettes swaying gently with drifting light leaks | hero background motion behind the real storefront and car cut-out | 16:9 and 9:16 | 25e314b3 storefront and the car cut-out | all; no buildings or signage |
| V03 | Higgsfield loop | Slow macro rack-focus across frosted trichomes | Products / Flower band motion | 4:5 or 1:1 | dc361d95 Flower card and G02/G03 | all |
| V04 | Higgsfield loop | Coastal haze drifting over calm water at golden hour | San Pedro location band motion | 21:9 | f06599a5 San Pedro illustration | all |

No generated edibles imagery is planned: candy-like visuals carry a children-appeal risk, and the real `7a4352fe` and `a3d38155` photos already cover edibles.

## Open questions for the operator

- 8 page-header images are painted on the live site but were never downloaded: champagne-bar (default header pool, 44 pages), cannabis-buds-mason-jars (2), cannabis-13, kiva-lost-farm, cannabis-grinders-flower-flatlay, preroll-tubes-in-n-out-cup, cannabis-1, cannabis-16. Approve a targeted fetch of these 8 /media/ files (8 image GETs, no page requests) under PLAN D9? Stated reason: the harvester did not decode &#039; inside data-bgimage. Without them the rebuild cannot keep these headers.
- The wordmark exists only as a 400x71 PNG. It is soft on HiDPI (0.39 file px per device px in the phone footer). Can the client supply a vector or a larger master? It must not be redrawn without approval.
- Should the default header keep the two-image rotation (champagne-bar / trop cherry), or should each page get a fixed image?
- Legible California plate '1959' on a28ecfaf: acceptable at hero size?

## UNVERIFIED (stated plainly)

- The 8 missing header files: intrinsic size, bytes, quality and alpha are unknown. The pre-rolls header was not seen at all.
- Object sizes marked "estimate" were read off the contact sheet (about ±10%). Only the white-ground objects were measured (bbox.json).
- The age-gate and location-chooser modals were hidden in every capture, so their painted sizes are inferred from the markup (full-viewport cover modal), not measured.
- Who made the two store-picker illustrations, and whether they are AI-generated, is unknown. Whether `e181cbbf` is a rendered mockup is unknown.
- Brand readings at small size: the battery wordmark on `3e9d1609` ("LITTO"?), the "SMALLS" stamp on `085a05d4`, and the "…EAU MA…" brass band on `8b360abb`.
- The header rotation mechanism.
