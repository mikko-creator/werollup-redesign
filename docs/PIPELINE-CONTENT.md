# PIPELINE-CONTENT: the content model as implemented

PIPELINE lane (WF3a), 2026-10-13. This file and `docs/PIPELINE-SITE.md` are the interface the THEME lane implements
against (BUILD-CONTRACT 3.3). Every shape below is what `src/lib/extract.mjs` writes today; the numbers were measured on
the files it wrote (commands in section 8). Where this file and BUILD-CONTRACT disagree, the contract wins; the known
differences are listed in section 9.

## 1. Files

| file | what | written by |
|---|---|---|
| `src/content/pages/<slug>.json` | one page model per served path (54). `slug` = the path with `/` turned into `-` (`/` = `index`); it equals the raw file name of the base record | `node src/lib/extract.mjs` |
| `src/content/pages/_index.json` | `{ schema, count, pages: [{ path, slug, kind, title, h1, store, menuFamily, subheader, rawFile, variants }] }` in path order | same |
| `src/content/chrome.json` | the site chrome, verbatim (section 4) | same |
| `src/content/routes.json` | paths, query variants, aliases, slash redirects, menu paths, 404 (PIPELINE-SITE.md section 3) | same |
| `src/content/changes.json` | the changes ledger (section 6) | same |
| `src/content/parity-exceptions.json` | the declared parity exceptions read by `tools/text-parity.mjs` (section 7) | same |
| `src/content/image-plan.json` | image-plan slots: stills `{ file, alt, role, pages }` and loops (`kind: "video"`, `video: { mp4, webm, mp4Phone?, webmPhone?, poster? }`) (IMAGERY owns it; optional; shape and rules in PIPELINE-SITE.md sections 5 and 5.1) | IMAGERY |

`node src/lib/extract.mjs --check` exits 1 when any of these files (all but `image-plan.json`) differs from a fresh
extraction, or when `src/content/pages/` holds a file extraction would not write. The build runs the same comparison
through the same code (`contentFiles()` / `staleContent()` in `src/lib/extract.mjs`) and fails on stale content
(PIPELINE-SITE.md section 1).

Source of every page: the base record's raw file `audit/raw/<savedAs>` (`page.rawFile`). Query-string variants are
recorded in `page.variants` and are served by the same file. Extraction is offline, deterministic (fixed iteration
order, no clock, no randomness) and fail-closed: an image URL that is not in the harvest, a menu family that differs
between two pages, an off-canvas menu that differs from the header menu, or a page without `<main>` throws.

## 2. The page model

```js
{
  schema: 'werollup/page@1',
  kind,            // home | page | contact | legal | education | lax-menu | location | shop | products-hub |
                   //   product-category | review | service-area-hub | service-area-town | delivery |
                   //   archive-author | archive-taxonomy            (crosswalk: section 2.1)
  path,            // output path, leading + trailing slash ('/' = home); equals the source path
  slug,            // file slug (see section 1)
  sourceUrl,       // the live URL of the base record
  rawFile,         // 'audit/raw/<file>.html'
  wpTemplate,      // the WordPress body class it came from ('page-template-template-flexible', 'single-location', ...) or null
  store,           // 'culver-city' | 'san-pedro' | null    (from the menu family: 21+30 store pages vs 40 global)
  menuFamily,      // 'primary' | 'lax-culver-city' | 'san-pedro'  (which of chrome.nav to render)
  subheader,       // 'marquee' (40 global pages) | 'shopping-strip' (51 store pages)
  title,           // the source <title>, entities decoded ('About Us – We Roll Up')
  metaDescription, // A17: a verbatim excerpt (<= 155 chars, cut at a sentence end if >= 70 chars, else a word boundary)
                   //   of the first <p> paragraph with >= 8 words (else >= 5 words, else a bare text run >= 5 words,
                   //   else the first list item, the notice, any paragraph, and last the h1 text)
  metaDescriptionFrom, // 'paragraph' (35 pages) | 'notice' (1) | 'h1' (18: pages whose main holds no paragraph)
  canonical,       // the source canonical (absolute live URL); self when the source has none (3 archives, A17)
  canonicalFrom,   // 'source' | 'self (A17: the source has none)'
  robots,          // the source robots meta ('max-image-preview:large' on every page)
  lang,            // 'en-US'
  og,              // null in the JSON; the build sets { title, type, url, siteName, image, imageWidth, imageHeight, imageFrom }
  h1,              // the text of the page's single level-1 heading (A16)
  breadcrumbs,     // [{ label, href | null, current }] verbatim from #site-topbar (store pages only; [] elsewhere).
                   //   The "Locations" crumb links to the current store or shop, as the source does (a source defect).
  sections,        // [Section] in DOM order (section 3)
  embed,           // null | { provider: 'jane', head, body, removed, repointed, sourceSpan } | { provider: 'weedmaps', head: '', body }
  form,            // null | { id: 'contact', section: '<section id>' }   (the block itself is in sections)
  maps,            // [{ src, width, height }]   (the map blocks themselves are in sections)
  headerArt,       // null | { ref, src, source: 'page' | 'default' }   the live page-header image ('default' = one of the
                   //   two rotating defaults, fixed by the crawl: A2). null on pages without a page header.
  generated,       // { hero: slotId | null, art: [slotId], video: [slotId] }; { hero: null, art: [] } in the JSON, filled by
                   //   the build from image-plan.json: hero/art by the slot's role (any kind), video = the page's slots of
                   //   kind "video" (render them with ctx.video; PIPELINE-SITE.md 5.1)
  variants,        // [{ query, sourceUrl, rawFile, canonical }]  query-string records served by this path (37 in all)
  aliases,         // ['/home/'] ... alias paths that land here (14 in all)
  imagesUsed,      // ['assets/source/...'] every image file the page's blocks reference (sorted)
}
```

### 2.1 kind crosswalk

| kind | paths | WordPress template (SITE-ARCHITECTURE section 11) |
|---|---|---|
| home | `/` | template-homepage |
| page | `/about-us/`, `/about-us/daily-deals/` | template-flexible |
| contact | `/contact/` | template-flexible (form + maps) |
| legal | `/accessibility-statement/`, `/privacy-policy/` | default |
| education | `/education/`, `/education/cannabis-101/`, `/education/recreational-medicinal/` | default / flexible |
| lax-menu | `/lax-menu/` | template-flexible (Weedmaps embed) |
| location | `/location/culver-city/`, `/location/san-pedro/` | single-location |
| shop | `/location/culver-city/shop/`, `/location/san-pedro/shop/`, the 8 `/location/san-pedro/shop/menu/<cat>/` | location child / Jane page |
| products-hub | `/products/` | default |
| product-category | the 6 `/products/<cat>/` | template-flexible |
| review | the 5 `/reviews/<name>/` | single-reviews |
| service-area-hub | `/service-area/` | default |
| service-area-town | the 15 `/service-area/<...>/` | default / flexible |
| delivery | `/weed-delivery/` | template-flexible |
| archive-author | `/author/werollupadmin/` | author archive |
| archive-taxonomy | the 2 `/location-pagetype/<term>/` | location-pagetype archive |

## 3. Sections

```js
{ id: 's1', kind, heading, level, sourceBg, blocks: [Block] }
```

- One section per top-level component of `<main>`, in DOM order. A source row that holds only headings is merged into
  the section that follows it ("Shop by Category" + its carousel are one section).
- `kind`: the block type when the section holds one kind of non-heading block (`page-header`, `hero-tile`, `split`,
  `accordion`, `card-grid`, `card-carousel`, `logo-carousel`, `deals`, `location-cards`, `post-list`, `notice`,
  `search-form`, `embed`), else `content`. Counts over the 54 pages: page-header 51, content 32, embed 11, split 4,
  hero-tile 3, card-carousel 3, deals 3, accordion 2, card-grid 2, logo-carousel 2, post-list 2, location-cards 1,
  notice 1, search-form 1.
- `heading` / `level`: a convenience copy of the first heading found in the section (text and level, level may be
  null). The heading itself is a block inside `blocks`: render the blocks, not this field.
- `sourceBg`: the source wrapper's background class (`black`, `dark`, `light`, `secondary`, `white`) or null. A hint
  only; the design decides.
- `id 's0'` is used once: the page header added from the `<title>` on `/location-pagetype/primary-location/` (A16).

## 4. Block vocabulary

Every block has `type`. The build fails on any other type (`src/build.mjs` `BLOCK_TYPES`). Text fields come in pairs:
`html` (inline HTML: `a[href,target,rel,title,aria-label]`, `strong`, `em`, `u`, `s`, `small`, `sup`, `sub`, `mark`,
`code`, `br`, and `<span class="sr-only">` for source screen-reader-only text; already escaped, insert as is) and `text`
(plain, whitespace-squashed). Hrefs are already normalised (section 5). Counts are block occurrences over the 54 pages.

| type | fields | notes | n |
|---|---|---|---|
| `heading` | `level` (1-6 or **null**), `look` (`h1`..`h6`, `h-ultra` or null), `tag` (source tag), `html`, `text`; `demotedFrom`/`promotedFrom` when A16 changed the level | `level` null = the source element is NOT a heading element (`p.h1`, `div.h2`, `span.h1`): render a non-heading element styled by `look`. A level-1 heading appears exactly once per page | 208 |
| `paragraph` | `html`, `text`, `look?` (`fs-4`, `small`, `lead`), `bare?` | `bare: true` = text that sat directly in a container (not in a `<p>`), e.g. an address block with `<br>` | 294 |
| `list` | `ordered`, `items: [{ html, text, children?: [list] }]` | | 28 |
| `buttons` | `items: [Button]`, `wrapper?` (`h3` when the source put the button inside a heading) | adjacent button blocks are merged | 43 |
| `image` | `image: ImageRef` | content image (`alt` from the source) | 0 |
| `rule` | | `<hr>` | 0 |
| `page-header` | `heading` (a heading block, level 1), `image: ImageRef | null` (alt ''), `overlay` (the source CSS gradient or null), `source` (`page` | `title`) | the live title banner. `source: 'title'` only on `/location-pagetype/primary-location/` (A16) | 51 |
| `hero-tile` | `image: ImageRef` (alt ''), `overlay`, `blocks` | home + both store pages: two tiles each (heading, two paragraphs, buttons) | 6 |
| `location-cards` | `cards: [{ image: ImageRef, blocks }]` | home: the two store cards | 1 |
| `split` | `imageSide` (`left` | `right`), `image: ImageRef` (alt = `imageLabel`), `imageLabel` (the source aria-label "We Roll Up image"), `blocks` | half image, half content | 4 |
| `accordion` | `items: [{ id, title (html), text, level, open, blocks }]` | `open: true` on the item the source opens; every body is in the model (hidden-until-interaction text is carried) | 2 |
| `card-grid` | `intro: [blocks]`, `cards: [{ tone, blocks }]`, `outro: [blocks]` | `/weed-delivery/` steps, `/contact/` store cards (with the maps). `tone` = source background (`secondary`, `light`, `dark`) | 2 |
| `card-carousel` | `variant` (`category` | `mood`), `splide` (the source options object), `cards: [{ image?: ImageRef, imageAltFrom?, tone?, blocks }]` | store pages: "Shop by Category" (7 cards, image alt = the card title, because the source alt is the placeholder "background image"), "Shop by Mood" (7 cards, `tone` = `blissful`...) | 3 |
| `logo-carousel` | `splide`, `logos: [{ href, rel, image: ImageRef }]` | alt verbatim ("Company Logo 1"...) | 2 |
| `deals` | `items: [{ href, icon, blocks }]` | each item links to the store PAGE, as the source does | 3 |
| `link-card` | `href`, `blocks` | a link wrapping blocks (vocabulary; unused today) | 0 |
| `icon-link` | `href`, `icon`, `label` | an icon-only link (vocabulary; unused outside post-list today) | 0 |
| `notice` | `tone` (`warning`), `html`, `text` | author archive "Sorry, no results were found." | 1 |
| `post-list` | `posts: [{ date: { month, day, year }, image: ImageRef, imageAltFrom?, iconLink: { href, icon } | null, title (html), text, href, titleLook }]` | the two taxonomy archives. Image alt = the post title (the source img has none) | 2 |
| `search-form` | `action` ('/'), `method` ('get'), `label`, `labelHidden`, `name` ('s'), `placeholder`, `button` | author archive WordPress search, carried as the source has it (a static host ignores `?s=`) | 1 |
| `zip-finder` | `title`, `empty: { title, paragraphs }`, `results: { title, paragraphs, rows: [{ id, label, name, href, checks, buttons, again }] }`, `form: { id, name, label, labelHidden, input: { type, id, name, placeholder, required }, button }` | home only. Titles are `{ look, html, text }`. Behaviour data is `ctx.zipFinder` | 1 |
| `form` | `id` ('contact'), `method` ('post'), `action` ('/__form-endpoint-not-configured__'), `enctype`, `fields: [{ name, type, label, required, requiredMark, placeholder, rows? }]`, `submit: { label: 'Send', disabled: true }`, `note`, `dropped: [{ label, reason }]` | BUILD-CONTRACT 4.7. Render the submit `disabled` with `note` visible beside it | 1 |
| `map` | `provider` ('google-maps'), `src`, `width`, `height`, `html` | `html` = the source `<iframe ...>` start tag, byte for byte, + `</iframe>` (fallback content dropped). Insert `html` as is (4.8) | 3 |
| `embed` | `provider` (`jane` | `weedmaps`), `html` (weedmaps only) | `jane`: insert `page.embed.body` here; `weedmaps`: insert `html` here (the source tag byte for byte). Full width, no transform/filter/glass/overlay on it or its ancestors, no CSP/sandbox (4.6) | 11 |

`ImageRef` = `{ ref, src, alt, width, height, role }`: `ref` is the workspace-relative local file (pass it to
`ctx.img`), `src` the live URL it came from, `width`/`height` the intrinsic size, `role` one of `page-header`,
`hero-tile`, `location-card`, `split`, `category-card`, `logo`, `post`, `chooser`, `age-gate`, `footer-logo`, `content`.
Decorative roles (`page-header`, `hero-tile`, `location-card`, `chooser`, `age-gate`) carry `alt: ''`; render them with
`alt=""` AND the attribute `data-decorative` (tools/build-check.mjs requires the marker on every empty alt).

`Button` = `{ label (html), text, href, variant (primary|secondary|light|accent|null), size?: 'sm', transparent?,
chooser?: true (opens the location chooser, 4.5), activeLocation?: true (its href follows the selected store, 4.5),
laxUrl?, sanpedroUrl?, target?, rel?, icon? }`.

## 5. Links

- Internal hrefs (`/x`, `https://werollup.com/x`, `//werollup.com/x`) are normalised to the trailing-slash output path,
  with the query string and fragment kept as the source spells them (`/location/culver-city/shop/?store_path=%2F&...`).
  `tel:`, `mailto:`, `#` and external URLs stay exactly as the source has them (4.3).
- Alias targets are NOT rewritten: `/shop` becomes `/shop/`, which is served by its redirect stub (and `_redirects`).
- A8 corrections are applied during extraction and logged (section 6).
- A7: the pasted wp-admin edit link on `/products/` is unwrapped; its word "Flower" stays in the sentence.

## 6. The chrome (`src/content/chrome.json`, exposed as ctx fields)

All strings verbatim (entities decoded, whitespace squashed). Taken from `audit/raw/index.html` unless noted.

- `topBar`: `select { name, id, options: [{ label, value, slug, address, hours, menuUrl, directionsUrl }] }` (the first
  option "Select a Location" has empty data); `details { addressId: 'locationAddress', hoursId: 'locationHours' }`;
  `hoursFallback` "Hours Not Available" (a main.js-only string); `socials: [{ label, href, target, icon }]`
  (Instagram, Google, Yelp, Weedmaps; `label` is the source's visually-hidden text).
- `header`: `navLabel` "Primary menu", `logo { image: ImageRef (alt "We Roll Up Logo"), href '/', displayWidth 150,
  displayHeight 71 }`, `quickMenu [{ label, href }]` (Daily Deals, Delivery, Contact), `toggleLabel` "Toggle navigation",
  `orderNow { label "Order Now", href, laxUrl, sanpedroUrl, icon }`.
- `nav { primary, laxCulverCity, sanPedro }`: menu trees `[{ label, href | null, children? }]` (`href: null` = a dropdown
  parent, `#` in the source). Each family was proven identical on every page of the family and in its off-canvas copy
  (`navFamilyCounts`: primary 40 paths, laxCulverCity 3, sanPedro 11). A8 applied: primary > Products > San Pedro >
  "Order Vaporizers & Cartridges" -> `/location/san-pedro/shop/?filters%5Broot_types%5D%5B%5D=vape`.
- `marquee { items: [{ icon, text }] }`: "Welcome to We Roll Up…", "We Roll Up Rosin Club + Buy any 5 rosin products +
  Get 25% Off".
- `shoppingStrip { 'culver-city' | 'san-pedro': { lead "You're shopping", store, buttons: [Button] } }` (Directions,
  Review Us, Call Now), from `audit/raw/location-<store>.html`. The breadcrumbs are per page (`page.breadcrumbs`).
- `offcanvas { ariaLabel, logo { image (alt "We Roll Up"), href }, socials, closeLabel "Close menu", navLabel
  "Mobile navigation", orderNow { label, ariaLabel, href, laxUrl, sanpedroUrl } }`. Its menu is the page's family.
- `footer { logo { image (alt "We Roll UpLogo", sic) }, stores: [{ name, address, phone { display, href } }],
  socials: [{ ariaLabel | image }], quickLinksTitle "Quick Links", quickLinks [{ label, href, activeLocation? }],
  licence { label "Cannabis License: C10-0000854-LIC", href '/home/' }, copyright "© 2026 We Roll Up All rights
  reserved.", separator '|', privacy { label, href, title } }`. The licence line is the last Quick Links item (render
  it once, there). The Range Marketing credit is removed (A15).
- `locationChooser { closeLabel, closeGlyph "×", eyebrow, title, description, cards: [{ key ('lax' | 'sanpedro'), href,
  image: ImageRef, name, address, cta "Select Location" }] }`.
- `ageGate { ariaLabel, background: ImageRef, title, question, denied, yes, no, storeHeading, stores: [{ name, nameTag,
  address, href (the store PAGE), cta "Shop here" }], rule { storageKey 'agePass_v2', passIf [...], onPass, source } }`.
  Behaviour (4.4) is the theme script's job; markup renders closed.
- `reviews { heading "Our Reviews", headingLook, subheading, subheadingLook, splide, items: [{ name, html, text, stars }],
  ctas: [Button] }`: the 5 reviews in the fixed order of `audit/raw/index.html` (A2): Jennifer, Patricia H, Thomas H,
  James, Greg S. Jennifer's text holds a `<br>`.
- `zipFinder { sanPedro: [22 strings], culverCity: [54 strings], order ['sanPedro', 'culverCity'], rows { sanPedro:
  'location1', culverCity: 'location2' }, strings { invalid "Please enter a valid zip code." }, minLength 5, behaviour,
  evidence }`: the arrays exactly as the inline script has them (empty string and duplicates included).

## 7. The changes ledger (`src/content/changes.json`) and the parity exceptions

`changes.json`: `{ schema, note, counts: { <id>: n }, changes: [{ page, rule, id, region, before, after, why, evidence,
count }] }`. As extracted (measured: `counts`):

| id | rule | where | what |
|---|---|---|---|
| A8-vape | A8 | 40 pages x header + off-canvas = 80 links | `/shop-playa-vista/?filters%5Broot_types%5D%5B%5D=vape` -> `/location/san-pedro/shop/?filters%5Broot_types%5D%5B%5D=vape` |
| A8-edibles | A8 | `/service-area/san-pedro/san-pedro-weed-delivery/` (1) | `https://werollup.com/products/edibles-gummies/` -> `/products/edibles/` |
| A7-doubled-heading | A7 | `/service-area/culver-city/culver-city-delivery-and-pickup/` | h2 "Your Westside Service HubYour Westside Service Hub" -> "Your Westside Service Hub" |
| A7-wp-admin-link | A7 | `/products/` | the wp-admin edit link around "Flower" removed, the word kept |
| A7-iframe-brief | A7 | `/service-area/culver-city/culver-city-delivery-and-pickup/` | the designer brief inside the map `<iframe>` is not rendered |
| A12-recaptcha / A12-endpoint / A12-note | A12 | `/contact/` | CAPTCHA field dropped; post to the placeholder endpoint; disabled submit + note |
| A15-range-credit | A15 | footer, all pages | "Designed by Range Marketing" removed |
| A16-demote | A16 | `/accessibility-statement/`, `/privacy-policy/` | the second `<h1>` becomes `<h2>` (text unchanged) |
| A16-promote | A16 | `/location/culver-city/`, `/location/san-pedro/` | the store title `p.h1` becomes the `<h1>` (text unchanged) |
| A16-title-h1 | A16 | `/location-pagetype/primary-location/` | no h1 and no visible title: a page header with h1 "Primary Location" (its own `<title>` minus " – We Roll Up") |

The only added visible strings in the whole build: the form note "This form is not connected yet. Please call one of
our stores." (A12, required by 4.7) and "Primary Location" (A16, from the page's own title). The stub's 404 page also
says "Page not found" (there is no source 404 body); see PIPELINE-SITE.md section 3.

`parity-exceptions.json` (`{ schema, note, exceptions: [{ id, rule, page, region, kind, text | from + to, reason,
evidence }] }`): PX-A2-review-order (set-order), PX-A7-doubled-h2 (replace), PX-A7-wp-admin-link (link-only),
PX-A7-iframe-brief (must-not-render), PX-A15-range-credit (remove-source), PX-A12-captcha (remove-source),
PX-A12-form-note (remove-built), PX-A16-title-h1 (remove-built).

## 8. What the THEME must keep for text parity

`tools/text-parity.mjs` compares the built page with the source per region, word by word in DOM order. A theme passes
when, for every page:

1. Each region is wrapped in exactly one element carrying `data-parity="<region>"`: `topbar`, `header`,
   `subheader`, `offcanvas`, `main`, `reviews`, `footer`, `chooser`, `agegate`. No visible word may sit in `<body>`
   outside these nine elements (a skip link or a "Back to top" label would fail; give such controls an aria-label and
   no text, or ask the orchestrator for a declared exception).
2. Inside a region the words appear in the source order. Words = text nodes, plus `placeholder` and submit/button input
   `value`s. Hidden text counts (keep collapsed accordion bodies, ZIP-finder steps, dialogs and the off-canvas menu in
   the DOM: use `hidden`/`<details>`, never omit). Attributes (alt, aria-label, title) do not count, so icons and
   accessible names may be added freely as attributes.
3. Never add visible words inside a region (no "Read more", no glyph characters such as ★ or × as text: use CSS
   `::before` or SVG). Block elements and links are word boundaries; other inline elements are not: keep
   `Shop Now<span class="sr-only">Blissful</span>` as one run.
4. Topbar: after the store `<select>`, render each store option's `address` then `hours` (`ctx.topBar.select.options`,
   in option order) inside `#activeLocationDetails` (the source copies them there with main.js).
5. Reviews: the 5 items in `ctx.reviews.items` order. Header/off-canvas: the page's own menu family.
6. Footer: render the licence line once (as the last Quick Links item), then copyright, `separator`, privacy link.
7. Links (4.3): inside each region keep every `<a href>` the model gives you, with the href exactly as given, and add
   none. `tools/build-check.mjs` compares the multiset of hrefs per page and region with `audit/raw` (the A8
   corrections and the removed links of `changes.json` are the only exceptions; a bare `#` toggle is not compared). An
   in-page link you add inside a region (`#top`) needs a declared exception from PIPELINE.

Run `node tools/text-parity.mjs --control` on your build (PIPELINE-SITE.md section 7).

## 9. Known differences from BUILD-CONTRACT 3.3 (reported, not silently changed)

- `page.store` is set from the menu family, so the two taxonomy archives carry a store (`culver-city` for
  `/location-pagetype/cannabis-menu-page/`, `san-pedro` for `/location-pagetype/primary-location/`): they use the store
  menu and the shopping strip in the source.
- `page.og` is computed by the build (it needs the built image URL), not by the extractor.
- `page.form` is a pointer (`{ id, section }`); the form model is the `form` block (4.7) so it renders in source order.
- `page.maps` lists the maps; the map blocks render in place.
- `page.headerArt` is null on the 3 pages without a page header (home and the two store pages, whose art is in their
  hero tiles) and on primary-location (no banner in the source).
- `ctx.topBar` etc. are also exposed under their contract names (`topBar, marquee, shoppingStrip, footer, ageGate,
  locationChooser, reviews, zipFinder`); `ctx.header` and `ctx.offcanvas` are additional.
- `page.generated` also carries `video: [slotId]`, and `ctx` has `video(slotId, opts)` (WF3b loops; PIPELINE-SITE.md 5.1),
  both additions to the contract's draft.
- `ctx.reviews` is an object, `{ heading, headingLook, subheading, subheadingLook, splide, items, ctas }` (section 6),
  not the array `reviews: [ ... ]` of BUILD-CONTRACT 3.3: the carousel's heading, subheading and buttons are verbatim
  text too (4.2). The 5 reviews of the contract's array are `ctx.reviews.items`, in the fixed order (A2).
