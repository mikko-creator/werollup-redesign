# UNDERSTAND phase: critic review (werollup.com reforge)

Critic lane, WF1. Written 2026-10-13, from 10:46 to 11:07 (time box 50 minutes). Scratch work is in `tmp/understand/critic/`.

**Method.** I re-ran the evidence myself and did not rely on any lane's prose or scripts. Every number below comes from
my own scripts over the files on disk:
- `coverage.mjs`, which writes `coverage.json`;
- `paths.mjs`, which writes `paths.json`;
- `spot.mjs` and `spot2.mjs`, which write `spot.json` and `spot2.json`;
- ffprobe, sha256 and pdftotext.

**Network.** Nothing was requested from werollup.com or from any vendor host. For the compliance checks I made these
requests, all to official hosts:
- **DCC compliance-hub page** on cannabis.ca.gov, fetched with WebFetch and again raw with curl.
- **DCC "laws and regulations" page**, fetched with WebFetch to look for a copy of the statute. It links only to
  leginfo.
- **DCC regulations PDF** from cdn.cannabis.ca.gov, fetched with curl.
- **Bus. & Prof. Code 26152.1** on leginfo.legislature.ca.gov. It answered HTTP 403 to both WebFetch and curl.

**Scope.** I edited no lane document.

**Verdict in one line.** Coverage holds: all 5 required checks pass, and every positive control fires. I re-checked 63
spot claims (counted from the tables in section 2):
- 55 confirmed, 2 of them with a nuance noted;
- 3 confirmed, but with an incomplete scope or only in part;
- 4 refuted: one material, one minor path error, one mis-framed conflict and one incomplete page list;
- 1 that could not be verified independently (the official host returned HTTP 403).

One of the refuted claims matters for the build:
- **Top-bar hours.** CONTENT says the top-bar hours are runtime text that is not in `audit/raw`. They are in the raw
  HTML, as the `data-hours` attribute on all 91 pages.

There are also two real contradictions between lanes that a build lane would act on:
- **Source Sans Pro.** BRAND says remove it; COMMERCE says keep it for the Jane menu.
- **Generated images.** Three of the IMAGES lane's planned fal images (iridescent, prismatic, neon) go against what
  COMPLIANCE says to avoid.

---

## 1. Coverage (mechanical, each with a positive control)

Normalisation: HTML entities decoded and whitespace collapsed, nothing else. A second tier, which treats tags as
whitespace, is reported separately and never counted as a strict pass.

| # | Check | Found | Missing | Control fired | Notes |
|---|---|---|---|---|---|
| C1 | Every record in `audit/site-inventory.json` (by URL path and query) is in `docs/data/site-map.json` `pages[]` | 92 / 92 | 0 | yes | 91 pages plus the 404 `/products/edibles-gummies`. All 14 aliases are in `site-map.json` `aliases[]`. Three controls were caught: a planted page, a planted alias, and `/contact` dropped from a scratch copy of the site map. |
| C2 | Every file in `assets/source/` is in `docs/data/images.json` `images[].file` | 40 / 40 | 0 | yes | Two controls were caught: a planted `critic-planted-0000.webp`, and the logo record dropped from a scratch copy. The reverse check finds 8 records with no file. They are exactly the 8 `MISSING-FROM-HARVEST` header URLs (champagne-bar, cannabis-buds-mason-jars, cannabis-13, kiva-lost-farm, cannabis-grinders-flower-flatlay, preroll-tubes-in-n-out-cup, cannabis-1, cannabis-16). |
| C3 | Every `primaryNav` label in `audit/architecture.json` appears in `docs/SITE-ARCHITECTURE.md` | 24 / 24 | 0 | yes | All 24 are also present byte-exact. The control caught a planted label. |
| C4 | Every `reviews[].text` in `docs/data/content-blocks.json` is in `audit/raw` | 5 / 5 | 0 | yes | 4 texts match whole and strict in 91 files. Jennifer's text has a `\n`, and each of its two lines matches strict in 91 files; the whole text matches only in the tag tier, because the line break is markup. The control caught a planted review. |
| C5 | Every `"quote"` value in `facts/client-facts.json` is in `audit/raw` | 34 / 34 found; 27 strict + 7 across tag boundaries | 0 absent | yes | Detail in the four notes below this table. |
| C5b | Extension: the `asShown`, `notFound` and `ageGate.*` strings in the facts file | 9 / 9 found; 8 strict + 1 across tags | 0 | (same code as C5) | The ZIP-finder `notFound` message spans tags. |
| C6 | Extra: every site path written into the lane JSONs is a crawled page, an alias or the known 404 | 68 of 90 distinct path strings resolve | 22 do not resolve. I triaged them by hand: 21 are not page paths (7 `/wp-content/…` asset paths, `/wp-admin/…`, `/api/v1`-style strings inside the Jane snippet, prefixes such as `/location` and `/reviews`, `…/index` file targets, and the deliberate example `…/menu/does-not-exist`). 1 is a wrong page path. | yes (planted `/critic-planted-path/` caught, 0 false positives on known paths) | `/location/pagetype/primary-location` in `images.json` (`headerRotation.pagesWithNoHeaderBanner` and `images[38].notes`), also in IMAGE-INVENTORY.md L9 and L461. The crawled URL is `/location-pagetype/primary-location`. |

**C5 detail.**
- **Quotes that need the tag tier.** These 7 quotes cross element boundaries: they are joined across `<p>`, `<br>` or
  inline tags, so they match only when tags are treated as whitespace.
  - `addresses[0].evidence[1]` and `[2]`;
  - `addresses[1].evidence[1]`;
  - `testimonials[0]`, Jennifer: her line break;
  - `languages[2]`;
  - `claims[0].variants[2]`;
  - `claims[2].variants[0]`.
- **Per-page check.** I checked 33 of the 34 quotes on every page they cite, expanding `ALL_91`, `NON_LOCATION_40` and
  the explicit paths: **0 mismatches**. The one I could not check per page uses a descriptive page reference ("30
  pages: …").
- **My own failed control.** My first per-page control was invalid. I planted "Welcome to We Roll Up" as cited for
  `/contact`, but that string IS on `/contact`, in the promo marquee. I replaced it with "Munchie Monday - 10% off
  Edibles" cited for `/contact`, and the check caught it.

---

## 2. Spot re-verification (re-derived independently)

C = CONFIRMED, R = REFUTED, U = UNVERIFIABLE. Every count is over the 91 files in `audit/raw` unless the row says
otherwise.

### ARCH (SITE-ARCHITECTURE.md, site-map.json)

| Claim | Verdict | My evidence |
|---|---|---|
| 14 aliases (/home, /daily-deals, /shop-playa-vista?…vape, /shop, /san-pedro, 6 category slugs, /culver-city, /culver-city/culver-city-delivery-and-pickup, /lax) | C | `site-inventory.json` `pages[].aliases` flattened: 14, the same list. |
| Header menus: `menu-primary-navigation` 40, `menu-lax-culver-city-menu` 21, `menu-san-pedro-menu` 30 | C | Pages containing `id="<menu>"`: 40 / 21 / 30. |
| Shop routes: 2 bases + 45 variants (Culver City 18; San Pedro 27 = 8 `/shop/menu/*` + 19 `?filters`) | C | Inventory URLs: Culver City 19 = 1 + 18; San Pedro 28 = 1 + 8 + 19. The 8 menu paths: edible, extract, flower, gear, jane-gold, pre-roll, topical, vape. |
| San Pedro > "Order Vaporizers & Cartridges" links to `/shop-playa-vista/?filters…=vape`, on 40 pages | C | 40 pages, 80 anchors (header plus off-canvas). In `index.html` it follows the San Pedro "Order Pre-Rolls" item. |
| No JSON-LD; BreadcrumbList microdata on 51 pages; no meta description anywhere | C | `application/ld+json` 0, `schema.org/BreadcrumbList` 51, `<meta name="description">` 0, `og:description` 0. |
| og:title / og:url / og:image are site-wide constants; og:image is malformed | C | All 91 pages: `og:title` "We Roll Up", `og:url` "https://werollup.com", `og:image` "https://werollup.comhttps://werollup.com/media/logo-white-x.png". |
| San Pedro variants canonicalise to themselves; Culver City variants canonicalise to the base | C | San Pedro self 27/27; Culver City base 18/18. |
| Third-party scripts: GA4 G-148QKPF1CL and GTM-T4RHQDB on 91, StackAdapt 28, UserWay 91, Jane 28, Weedmaps embed 20 | C | 91 / 91 / 28 / 91 / 28 / 20. |
| Both store pages lack a real `<h1>` | C | 0 `<h1>` elements in `location-culver-city.html` and in `location-san-pedro.html`. |
| Age gate: `agePass_v2` plus a cookie with max-age 31536000 and SameSite=Lax | C | All three strings are on 91/91 pages. |
| Contact form: POST /contact/, not AJAX, fields and the "Send" submit | C | `<form method='post' … id='gform_1' action='/contact/'>`. Labels: "Your Name*", "Your Phone", "Your Email Address*", "Message*", "CAPTCHA". `input.gform_button.button value='Send'`; reCAPTCHA present; no `gform_ajax`. |
| ZIP finder arrays have 22 and 54 entries; 90254 and 90503 are in both | C | Raw literals 22 and 54. The first holds an empty string `''` plus duplicates 90502 and 90501, so 19 distinct real ZIPs; the second has 47 distinct. Shared: 90254, 90503. `zip.length < 5` rejects empty input before matching. |
| `.js-location-chooser`: 6 on /, 1 on /weed-delivery | C | 6 and 1. |
| Shop hero is random per request, 26/21 | C, scope incomplete | On the shop pages: champagne 26 (Culver City 10 + San Pedro 16), trop-cherry 21 (9 + 12). The same rotation also happens on non-shop default-header pages (see contradiction X8). |

### CONTENT (CONTENT-MODEL.md, content-blocks.json)

| Claim | Verdict | My evidence |
|---|---|---|
| Reviews carousel on all 91 pages, the same 5 names | C | `.rpb-customer-reviews` on 91; each of Jennifer, Patricia H, Thomas H, James, Greg S on 91. |
| Home paragraph is cut off in the source ("delicious gummies and</p>"); no line-clamp | C | The string is only in `index.html`; no `line-clamp` in any file in `audit/css`. |
| 16 service-area pages (1 hub + 15) | C | 16 inventory paths under `/service-area`. |
| "werollup.com" pasted 8 times into `/service-area/culver-city` | C | 8 in the `<main>` text, none part of a URL. |
| "Marina Del Ray" on 9 pages | C | 9 pages, in the visible text. |
| Doubled h2 "Your Westside Service HubYour Westside Service Hub" | C | `<h2>Your Westside Service HubYour Westside Service Hub` on `/service-area/culver-city/culver-city-delivery-and-pickup`. |
| Stale "delivery coming soon" on 4 pages | C, partial | Exact "delivery coming soon!" is on 3 pages: /products/edibles, /products/flower and /products/pre-rolls. /education/recreational-medicinal has "delivery services coming soon!". The list misses /products/vaporizers-cartridges ("in the very near future"), which the facts file does list (X3). |
| Home-only blocks ("Convenient Ways to Get Your Cannabis", "Shop Cannabis In-Store or Order Online for Pickup …") | C | Only in `index.html`. |
| `/reviews/<name>` pages hold only the H1 name | C | `reviews-jennifer.html` `<main>` text = "Jennifer". |
| Home section order (8 sections) | C | In the tag-stripped text of `index.html`, the anchors of the 8 sections appear at strictly increasing offsets (35889 → 39527). |
| "OPEN: 10:00 AM - 10:00 PM" … "a runtime string not present in audit/raw" (CONTENT-MODEL.md L807, L908; content-blocks.json copyFindings) | **R** | `data-hours="Open: 10:00 AM - 10:00 PM"` is in the raw HTML of 91/91 pages, twice per page (once per store option). main.js copies it into the top bar (`s=t.getAttribute("data-hours")||"Hours Not Available"`, then `n.textContent=s`) and CSS uppercases it. The source is the store selector's attribute, not unknown runtime text. The fallback "Hours Not Available" exists only in the JS. |

### BRAND (BRAND-SYSTEM.md, brand.json)

| Claim | Verdict | My evidence |
|---|---|---|
| Body text is forest rgb(32,48,34) on 50/50 captures | C | `body` computed `color` is rgb(32, 48, 34) in 50 of the 50 1440 and 390 captures. |
| Libre Franklin is the only family loaded; 400 and 700 on 50/50 | C | `loadedFonts` across the 50 captures: only "Libre Franklin"; 400 on 50, 700 on 50. |
| Six `@font-face` rules with comma-list families are dropped | C | main.css has 3 × `font-family:HelveticaNeue,Condensed` and 3 × `font-family:Agrandir,Condensed`; 6 fontFaces with no family on 50/50 captures. |
| Contrast: white on #5dbc5d 2.38; #203022 on #5dbc5d 5.85; #5dbc5d on #f5f4f1 2.17; #6c757d on #f5f4f1 4.26; #9a9a9a on #fff 2.81 | C | My own WCAG computation: 2.382 / 5.849 / 2.166 / 4.263 / 2.814. |
| h1 50.512px, h2 37.904px at 1440 | C | h1: 24 × 50.512px + 1 × 64px; h2: 56 × 37.904px (plus one each at 64px and 50.512px). |
| logo-white-x.png is 400x71, pal8 | C | ffprobe: `png,400,71,pal8`; 4,570 bytes. |
| `.btn:hover` scales to .96; hover fills #344f38 / #81cb81 | C | `.btn:hover,…{color:#fff;…transform:scale(.96)!important}`; 4 hover rules use #344f38 and 3 use #81cb81. |
| CTA census: Order Now 188, Shop here 182, Call Now 51, SHOP NOW 14 | C | Exact anchor text: 188 / 182 / 51 / 14. Also present: "Shop Now" 8, "See Deals" 3, "Shop now" 2. |

### IMAGES (IMAGE-INVENTORY.md, images.json)

| Claim | Verdict | My evidence |
|---|---|---|
| 01de0d97 and 25e314b3 are byte-identical, 229,900 B | C | Both sha256 `2ff18fc2104d0688…833168b`, 229,900 B each. |
| Intrinsic sizes: 77caae00 1920x2560, af620928 1200x1600, 75fcd114 800 wide, a28ecfaf 1200 wide, illustrations with alpha | C | ffprobe: 1920x2560; 1200x1600; 800x1066; 1200x1599; dd2e2c2b 600x569 `yuva420p`. |
| Raw header banners: champagne 44, trop-cherry 35, page-specific 8, none 4 | C | From `page-header` `data-bgimage`: 44 / 35 / 2+1+1+1+1+1+1 / 4. |
| Missing-harvest root cause: `&#039;` inside `data-bgimage` | C | The raw files themselves act as a control. Each of the 8 missing files appears in `audit/raw` only as `url(&#039;…&#039;)`, 52 references in all, and never in any other form. The default-header image that WAS harvested, trop-cherry, has 35 `&#039;` references plus one `url('…')` with literal quotes on `/location/culver-city`. I did not re-run the harvester itself. |
| Raw crawl and capture disagree on 6 of 15 captured default-header pages | C | The same six: accessibility-statement, contact, lax-menu, privacy-policy, service-area, weed-delivery. |
| Partner logos by page | C | 710 Labs and ST IDES on both location pages; Dime, Elusive, Ted's Budz, Traditional and Wizard Trees on Culver City; Alien Labs, PlugPlay and WYLD on San Pedro. |
| No EXIF, XMP or text metadata in any raster | C | Byte scan of all rasters for the EXIF, XMP, eXIf, tEXt, iTXt, zTXt and iCCP/ICCP chunk tags: 0 hits. |
| Page path `/location/pagetype/primary-location` | **R** (minor) | No such crawled URL; the crawled page is `/location-pagetype/primary-location` (coverage C6). |

### COMPLIANCE (COMPLIANCE.md, FACTS-EVIDENCE.md, client-facts.json)

| Claim | Verdict | My evidence |
|---|---|---|
| "Cannabis License: C10-0000854-LIC" on all 91 pages | C | 91 / 91. |
| 14 pages call vapes "disposable(s)"; /products/pre-rolls uses the word for pre-rolls | C | 15 pages contain the word. Removing pre-rolls ("portable, discreet, disposable, easy to consume") leaves 14, the same list as F-VAPE-1. |
| 0 pages carry the hazardous-waste disposal statements | C | "hazardous waste" in visible text: 0 pages. |
| 4 CCR 15000.1(a) requires a licence "for each separate premises" | C (official) | The DCC regulations PDF, fetched 2026-10-13 (sha256 `0054236e…e1e92f`, identical to the lane's copy), says: "shall obtain and maintain a valid license from the Department for each separate premises at which commercial cannabis activity is conducted." |
| DCC guidance lists "Bright colors, holographic finishes, or flashy designs" and "Imagery suggesting luxury lifestyles, parties, or group enjoyment" | C (official) | I fetched the cannabis.ca.gov compliance-hub page twice: once with WebFetch, and once raw with curl (HTTP 200, saved as `tmp/understand/critic/web/dcc-attractive.html`). A fixed-string grep of the raw page finds both phrases exactly. |
| "DCC's cartoon definition includes 'animation'" | C, with nuance | The DCC page quotes Merriam-Webster: "a simplified or exaggerated illustration or sequence of images used for humor, satire, storytelling, or animation". This is guidance quoting a dictionary, not a regulatory definition. |
| 4 CCR 15040(a)(2) is the basis of the "no people" rule | C, with nuance | The text says: "Shall not use any depictions or images of minors or anyone under 21 years of age". "No people at all" is a stricter house rule built on top of it; the rule itself does not ban adults. |
| Age affirmation before direct communication and mailing lists, 4 CCR 15041(a), (d) | C (official) | §15041(a): "Prior to any advertising or marketing … involving direct, individualized communication or dialogue, the licensee shall use age affirmation …"; (d) covers mailing lists. |
| Bus. & Prof. Code 26152.1: the disposal statements and the "disposable" ban | U | leginfo returned 403 to WebFetch and to curl. The lane's saved copy (`tmp/understand/compliance/web/bpc-ch15.txt` L122–L128) has the quoted wording, but I could not re-fetch it independently. |
| Accessibility statement dated January 10, 2022, with "[email]", the listed features and no mention of UserWay | C | Date and `mailto:[email]` present. Lists "Keyboard accessibility", "Sufficient color contrast" and "Alternative text"; "userway" does not appear in its text. |
| 0 "$" amounts; "first/original … licensed" on 27 pages; Spanish on 24 pages | C | 0 / 27 / 24. |
| Conflict C8: on Culver City pages, Explore All Reviews and Leave a Review go only to the San Pedro listing | **R** (as framed) | The carousel on all 91 pages carries both stores' links: San Pedro "Explore All Reviews" / "Leave a Review" (ludocid 5006542390870460260), plus "Explore All Reviews - LAX" (a Google search for "werollup lax") and "Leave a Review - LAX" (writereview placeid ChIJAfFmFwCxwoARC7V95hl5OQU). CONTENT has this right. |
| Conflict C3 lists the stale-delivery pages | **R** (incomplete) | It names /products/pre-rolls, /products/vaporizers-cartridges and /education/recreational-medicinal, and omits /products/flower and /products/edibles, which carry "delivery coming soon!" (X3). |

### COMMERCE (COMMERCE.md, commerce.json)

| Claim | Verdict | My evidence |
|---|---|---|
| Jane runtime config: storeId 4281, embedConfigId 989, partnerHostedPath "/location/san-pedro/shop", showAgeGate false | C | Parsed from `#jane_frameless_embed_runtime_config`, on 28 pages, 1 distinct hash. |
| The Jane block is byte-identical on all 28 pages | C | The span from the config to the end of `jane-app-secrets` has 1 distinct sha256 across 28 pages. The span contains the StackAdapt script, which must be stripped. |
| Line citations: SP shop L108 / L220 / L224 / L227 / L510; CC shop L365; lax-menu L348 | C | grep -n gives the same line numbers. |
| Weedmaps WM Store embed on 20 pages (lax-menu + 19 Culver City shop records) | C | 20 files contain `werolluplax.wm.store/static/js/embed.js`. |
| Weedmaps profile link, 3 per page on 91 pages | C | Exactly 3 anchors per page on all 91. |
| Cookie `selected_location` for 30 days; no localStorage | C | main.js contains `selected_location",e,30`; no localStorage near it. |
| Neither menu rendered in the harvest's headless Chrome; `#app` height 0 | C | San Pedro shop captures at 1024 and 1440: `#app` box `h: 0`. |
| 47 shop records | C | 19 + 28. |
| "Five redirects must be kept" | C, scope incomplete | The 5 are correct, but ARCH has 14 aliases plus 90 trailing-slash 301s (X9). |

---

## 3. Contradictions between the documents

| # | Topic | Doc A | Doc B | What the evidence says |
|---|---|---|---|---|
| X1 | Top-bar hours | CONTENT-MODEL.md L807/L908: runtime, not in `audit/raw`, UNVERIFIED source | client-facts.json `hoursAsShown` / COMPLIANCE: in the `data-hours` attributes, filled by main.js | B is right: 91/91 raw pages carry `data-hours="Open: 10:00 AM - 10:00 PM"` for both stores. |
| X2 | ZIP list sizes | SITE-ARCHITECTURE: 22 and 54 entries | COMPLIANCE / facts: 19 and 47 | Both are right: one counts raw entries, the other distinct non-empty ZIPs. The San Pedro array holds an empty `''` and two duplicates. A rebuild that copies the arrays keeps the behaviour either way. |
| X3 | Pages with stale delivery copy | CONTENT: flower, edibles, pre-rolls, recreational-medicinal | facts C3: pre-rolls, vaporizers-cartridges, recreational-medicinal | Each list is incomplete; together they make 5 pages. |
| X4 | Review links on Culver City pages (C8) | facts / FACTS-EVIDENCE: Culver City pages get only San Pedro review links in the carousel | CONTENT: the carousel has both SP and "- LAX" CTAs | CONTENT is right on all 91 pages. |
| X5 | Source Sans Pro | BRAND-SYSTEM.md L430: "Remove … the unused Source Sans Pro files" | COMMERCE.md L65: keep the Jane block's Source Sans Pro stylesheet link (L213), repointed to the rebuild font path | Both cannot be done. Jane's own UI may use it; BRAND measured only the captures, where Jane never rendered. |
| X6 | The ethereal palette for generated media | COMPLIANCE.md B2: "Avoid iridescent or holographic foil, rainbow prisms and neon candy palettes"; no "champagne or VIP looks" | images.json `generatedPlan`: G03 "glassy and iridescent"; G09 "Prismatic caustics"; G17 "pink and blue neon glow … near shop and edibles content"; G04 "complements … the champagne-bar header pool" | These slots must be reworded or dropped before WF3 spends budget. |
| X7 | Image decisions inside one record | images.json `recommendation` (IMAGES) | images.json `inventoryDecision` (harvest) | They oppose each other for 01de0d97 (KEEP vs REMOVE), 3329990b Weedmaps logo (KEEP-AS-IS vs REPLACE) and both store illustrations dd2e2c2b and f06599a5 (KEEP-SMALL vs REPLACE). IMAGES explains why the harvest field is wrong, but a script that reads `inventoryDecision` will act on the wrong value. |
| X8 | Scope of the header rotation | SITE-ARCHITECTURE.md L118: random hero on "the shop pages" | IMAGE-INVENTORY.md: all default-header pages | IMAGES is right: 6 of 15 captured non-shop default-header pages changed image between crawl and capture. The rule covers 79 pages, not 47. |
| X9 | Redirect scope | commerce.json `redirectsToKeep`: 5 entries | site-map.json: 14 aliases plus the trailing-slash rule (90 pages) | Not wrong, but the commerce list is a subset. The build must take the redirect list from site-map.json. |
| X10 | Page type vs shop | SITE-ARCHITECTURE text: 47 shop records | site-map.json `pages[].type` = "commerce" on 54 records, including the 7 `/products` pages | Filtering by `type=commerce` to find shop pages picks up 7 content pages. Use `shopRouteOf` or the template instead. |
| X11 | Template taxonomies | site-map.json: 10 templates (WordPress template) | content-blocks.json: 14 templates (content structure) | Different axes. No crosswalk is written down; the build has to derive one. |
| X12 | The GA id | PLAN.md D5: "GTM G-148QKPF1CL" | SITE-ARCHITECTURE: GA4 G-148QKPF1CL plus GTM-T4RHQDB | ARCH is right: both ids are on 91/91 pages. |
| X13 | `/shop-playa-vista?…vape` | facts C6: "not crawled" | site-inventory / site-map: an alias of `/location/culver-city/shop` | It was requested and redirected, not skipped. |
| X14 | Who rules on compliance-flagged existing photos | COMPLIANCE.md L144: existing photos "belong to the images lane" | IMAGE-INVENTORY.md item 7: "Compliance flags for the compliance lane (no judgement made here)" | A circular hand-off. Nobody has ruled on a3d38155, 75fcd114, 085a05d4, e181cbbf or the champagne-bar header. |
| X15 | Missing decisions file | PLAN D5, COMPLIANCE L159 and SITE-ARCHITECTURE L310 point to `docs/OPEN-DECISIONS.md` | — | The file does not exist. |

**No conflict found:**
- **Phones.** Only `424 264 5423` and `888-777-6655` appear in any doc; only the formats vary.
- **Shop counts.** 47 shop records, the Jane pages (28) and the Weedmaps pages (20) agree across ARCH, CONTENT and
  COMMERCE.
- **Header split.** The 26/21 split matches the per-store 10/9 and 16/12.
- **Hours.** No doc invents hours; every mention traces back to one of the two source strings.

---

## 4. Gaps the build lanes will hit (concrete questions)

1. **Missing header images.** By the raw assignment, 52 pages paint a header image that is not on disk: the
   champagne-bar default on 44, plus 8 page-specific headers. Will the operator approve the 8-file `/media/` fetch
   (images.json `openQuestions[0]`, PLAN D9)? If not, what replaces them on the 6 product pages and the 2 education
   pages?
2. **Per-request randomness in a static build.** The default header (79 pages) and the review-slide order (91 pages)
   are random per request. Should each page get a fixed choice, or should client-side JS randomise? IMAGES asks this
   for the header only.
3. **Contact form backend.** Gravity Forms posts to `/contact/` with a reCAPTCHA widget. reCAPTCHA site keys are
   normally registered to specific domains; which domains this one allows is UNVERIFIED. On a static rebuild, where
   does the form submit, what confirmation text does it show (UNVERIFIED in ARCH), and how is the age affirmation of
   4 CCR 15041(a) handled before it? No document answers this.
4. **Host behaviour.** Which host format should the build emit:
   - the 14 alias redirects;
   - the slash 301s;
   - the San Pedro `/shop/menu/*` catch-all (COMMERCE option A or B);
   - a real 404 for `/products/edibles-gummies`?

   PLAN D8 keeps everything local, so the target host is undecided.
5. **Proving the shop works.** The embeds rendered nothing in headless Chrome even on the live site, and they may be
   bound to the werollup.com origin. What counts as "shop works" in WF4, and on which host?
6. **Display typeface.** "Bold grotesque type character" could mean:
   - Libre Franklin 700, which is what renders;
   - the condensed faces the theme declares, which are commercial, never load and must not ship;
   - an OFL substitute, proposed but untested.

   This must be decided before the design panel.
7. **Wordmark.** May the tested forest recolour of the white raster wordmark be used on light ethereal surfaces without
   client approval? What is its maximum display width, given that the master is 400x71?
8. **Age-gate implementation.** Script 1 accepts a localStorage, sessionStorage or cookie pass; script 2 checks
   localStorage only (ARCH, UNVERIFIED in a browser). Which rule does the rebuilt single flow (PLAN D3) implement?
9. **Compliance ruling on existing photos (X14).** Questions:
   - Is the candy-like gummies card (a3d38155) acceptable?
   - Are the legible THC percentages acceptable? They appear on 75fcd114, and on 085a05d4, which is both a cut-out
     candidate and the default header on 35 pages.
   - Are the CBD label claims on e181cbbf acceptable?
   - Is the In-N-Out cup acceptable? It is named in the missing pre-rolls header's file name only; that image was never
     seen.
   - Does the champagne-bar default header, on 44 pages, conflict with the DCC "luxury lifestyles, parties" factor?
10. **Generated-media plan.** Rework slots G03, G09, G17 and G04 (X6). There is also no per-slot cost estimate against
    the $15 cap (PLAN D6): `generatedPlan` has no cost field.
11. **Text-parity exclusions.** Which mechanism tells the gate to exclude:
    - the iframe-wrapped content brief on `/service-area/culver-city/culver-city-delivery-and-pickup` (facts S5);
    - the hidden-until-interaction text (CONTENT, 52 entries)?

    And to include the `data-hours` and address text that main.js copies into the top bar? No document names the gate
    configuration.
12. **Unharvested theme files.** `overrides.css` and `overrides.js`, referenced on every page, were never harvested
    (ARCH). Fetch them, or accept that their rules and behaviour are unknown?
13. **Source motion.** The promo marquee is the only carrier of the "Rosin Club" promotion: it appears exactly once on
    each of the 40 pages that carry it, in the marquee. Its speed,
    pause behaviour and reduced-motion handling, and the existing scroll-reveal and AOS behaviour, are not documented
    by any lane. ARCH and CONTENT defer this; BRAND covers hover only.
14. **Defects in links and embeds.** PLAN D2 covers copy. Does "verbatim" also bind the wrong-store links and embeds?
    - the San Pedro vape menu item that lands on the Culver City shop;
    - the San Pedro map on the Culver City delivery page;
    - the 404 link;
    - "Playa Vista" in the ZIP finder.

    Or may the rebuild fix them with a logged approval?
15. **UserWay decision.** It has no record: `docs/OPEN-DECISIONS.md` is missing (X15).
16. **Second store's licence.** Which licence number goes beside which store (facts C5)? The footer currently shows one
    number for two stores, and the redesign will likely give each store its own block.

---

## 5. What I did not do

- I did not re-check the CONTENT section split for all 237 sections; I re-derived only the home page order.
- I did not recount BRAND's colour-by-role tallies beyond body colour, fonts, the type scale and contrast.
- I did not re-measure the IMAGES cut-out object sizes (634x1434 and so on); I checked intrinsic sizes only.
- I did not re-fetch Bus. & Prof. Code 26152.1 independently (HTTP 403).
- I viewed no screenshots and ran no browser.
- I did not re-run any lane's scripts. All of my checks are new code in `tmp/understand/critic/`.
