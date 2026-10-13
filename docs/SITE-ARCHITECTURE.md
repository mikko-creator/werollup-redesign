# werollup.com: site architecture (source of record for the rebuild)

ARCH lane, WF1 Understand, 2026-10-13. Built from files on disk only: `audit/*.json`, `audit/raw/*.html`, `assets/js/*.js`. No request was made to any client or vendor host. The machine-readable twin of this document is `docs/data/site-map.json`, which holds every per-page record, the full menu trees with their exact percent-encoded hrefs, and the per-variant shop proof. The scripts that produced it are `tmp/understand/arch/analyze.mjs` and `tmp/understand/arch/build-sitemap.mjs`, and they can be re-run from the workspace root.

Conventions: **UNVERIFIED** marks anything this lane could not prove from the files. Quoted copy is verbatim from the raw HTML. Line numbers refer to `audit/raw/index.html` unless another file is named.

## 1. Platform and inventory at a glance

| Fact | Value | Evidence |
|---|---|---|
| CMS | WordPress 7.1.3 (`<meta name="generator">`), theme `basebuildv3` (Sage/Blade, "Range page builder" partials), Bootstrap 5, jQuery 3.7.1 + migrate 3.4.1 | `audit/raw/index.html` line 63; `audit/source-cms.json`; `audit/script-inventory.json` |
| Plugins visible in markup | Gravity Forms 2.10.5, Jane Menu plugin 1.4.7 (`<meta name="jane:version">`), OMGF (self-hosted Google Fonts), Spellbook | `audit/stylesheets.json`; `audit/raw/location-san-pedro-shop.html` line 231 |
| Crawl records | 92 = 91 pages with status 200 + 1 dead link (`/products/edibles-gummies` 404) | `audit/site-inventory.json` counts |
| Aliases | 14 redirecting URLs, folded into the pages they land on (section 3) | `audit/site-inventory.json` `pages[].aliases`, `counts.aliasesCollapsed` |
| Shop routes | 2 base shop pages + 45 variants (18 Culver City query strings, 19 San Pedro query strings, 8 San Pedro `/shop/menu/<cat>` paths) | section 4 |
| Correction to the brief | The brief says "54 records are query-string or /shop/menu/<cat> variants". The 54 is `architecture.json pageTypes.commerce`, which also includes `/products` and the 6 `/products/*` education pages. The shop records number 47 (2 bases + 45 variants). | `audit/architecture.json`; `tmp/understand/arch/shop.json` |
| Sitemaps | robots.txt lists `/wp-sitemap.xml` and `/media/jane-menu/sitemap.xml`. Fetched: page, location, reviews, location-pagetype and users sitemaps, plus a Jane `sitemap.xml.gz` on iheartjane.com. 45 pages are sitemap seeds; for the home page sitemap membership is UNVERIFIED (it is also the crawl target, and the sitemap XML was not saved). | `audit/robots.txt`; `audit/site-inventory.json` discovery |
| Not harvested | `/wp-content/themes/basebuildv3/resources/overrides.css` and `overrides.js` are referenced on every page (preload style plus deferred script) but are not on disk, so their rules and behaviour are **UNVERIFIED** | `audit/raw/index.html` lines 94, 917; `audit/script-inventory.json` (6 scripts), `audit/stylesheets.json` (9 sheets) |

## 2. Routes: every page record

**URL form.** Every non-root page answers 301 from the no-slash form to the trailing-slash form, with the query string kept. The canonical links and the menus use the trailing-slash form. The rebuild must serve both (`/x` and `/x/`) or redirect the first to the second. Evidence: `redirectChain` on every non-root 200 record in `audit/site-inventory.json`.

**Columns.** Template is the body class: `page-template-*`, `single-<type>`, or an archive class. "In" counts the distinct internal pages that link to this page, from `audit/link-graph.json` with self-links excluded and links through aliases resolved. "Orphan" is `audit/architecture.json orphanPages`. That list ignores alias links, so `/service-area/culver-city/culver-city-delivery-and-pickup` is flagged as an orphan although `/service-area/culver-city` links to it through the alias `/culver-city/culver-city-delivery-and-pickup`. "Parent" is the nearest existing ancestor in the URL path. No page has a meta description and every page has robots `max-image-preview:large`, so those two columns are left out.

| Path | St | Template / post type (WP id) | Title | H1 | Canonical | Sitemap | In | Orphan | Parent | Aliases in |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | template-homepage / page (page-id-61809) | We Roll Up | Shop Our Weed Products | self | unverified | 90 |  | - | /home |
| /about-us | 200 | template-flexible / page (page-id-60815) | About Us – We Roll Up | About Us | self | yes | 90 |  | / |  |
| /about-us/daily-deals | 200 | template-flexible / page (page-id-60816) | Daily Deals – We Roll Up | Daily Deals | self | yes | 90 |  | /about-us | /daily-deals |
| /accessibility-statement | 200 | default / page (page-id-58875) | Accessibility Statement – We Roll Up | Accessibility Statement + Accessibility conformance status | self | yes | 0 | yes | / |  |
| /author/werollupadmin | 200 | author / author-archive (author-1) | admin – We Roll Up | Author: admin | (none) | yes | 0 | yes | / |  |
| /contact | 200 | template-flexible / page (page-id-61629) | Contact – We Roll Up | Contact | self | yes | 90 |  | / |  |
| /education | 200 | default / page (page-id-61775) | Education – We Roll Up | Education | self | yes | 0 | yes | / |  |
| /education/cannabis-101 | 200 | template-flexible / page (page-id-60823) | Cannabis 101 – We Roll Up | Cannabis 101 | self | yes | 90 |  | /education |  |
| /education/recreational-medicinal | 200 | template-flexible / page (page-id-60824) | Recreational & Medicinal – We Roll Up | Recreational & Medicinal | self | yes | 90 |  | /education |  |
| /lax-menu | 200 | template-flexible / page (page-id-61558) | Shop LAX – We Roll Up | Shop LAX | self | yes | 1 |  | / |  |
| /location-pagetype/cannabis-menu-page | 200 | taxonomy-location-pagetype archive (term-49) | Cannabis Menu Page – We Roll Up | Page Type: Cannabis Menu Page | (none) | yes | 0 | yes | / |  |
| /location-pagetype/primary-location | 200 | taxonomy-location-pagetype archive (term-58) | Primary Location – We Roll Up | (none) | (none) | yes | 0 | yes | / |  |
| /location/culver-city | 200 | single-location / location (postid-61546) | LAX – Culver City – We Roll Up | (none; hero uses class .h1) | self | yes | 90 |  | / |  |
| /location/culver-city/shop | 200 | single-location / location (postid-61854) | Shop LAX – Culver City – We Roll Up | Shop LAX - Culver City | self | yes | 90 |  | /location/culver-city | /shop-playa-vista?filters[root_types][]=vape, /shop |
| /location/san-pedro | 200 | single-location / location (postid-58921) | San Pedro – Palos Verdes – We Roll Up | (none; hero uses class .h1) | self | yes | 90 |  | / | /san-pedro |
| /location/san-pedro/shop | 200 | page with no page-template-* class (page-id-61855, WP parent = location 58921) | Shop San Pedro – Palos Verdes – We Roll Up | Shop San Pedro - Palos Verdes | self | yes | 90 |  | /location/san-pedro |  |
| /privacy-policy | 200 | default / page (page-id-58506) | Privacy Policy – We Roll Up | Privacy Policy + Welcome to our Privacy Policy | self | yes | 90 |  | / |  |
| /products | 200 | default / page (page-id-61757) | Products – We Roll Up | Products | self | yes | 5 |  | / |  |
| /products/concentrates | 200 | template-flexible / page (page-id-60821) | Concentrates – We Roll Up | Concentrates | self | yes | 90 |  | /products | /concentrates |
| /products/edibles | 200 | template-flexible / page (page-id-60820) | Edibles – We Roll Up | Edibles | self | yes | 90 |  | /products | /edibles-gummies |
| /products/edibles-gummies | 404 | - | - | - | - | no | 1 |  | /products |  |
| /products/flower | 200 | template-flexible / page (page-id-60817) | Flower – We Roll Up | Flower | self | yes | 90 |  | /products | /flower |
| /products/pre-rolls | 200 | template-flexible / page (page-id-60818) | Pre-Rolls – We Roll Up | Pre-Rolls | self | yes | 90 |  | /products | /pre-rolls |
| /products/topicals | 200 | template-flexible / page (page-id-60822) | Topicals – We Roll Up | Topicals | self | yes | 90 |  | /products | /topicals |
| /products/vaporizers-cartridges | 200 | template-flexible / page (page-id-60819) | Vaporizers & Cartridges – We Roll Up | Vaporizers & Cartridges | self | yes | 90 |  | /products | /vaporizers-cartridges |
| /reviews/greg-s | 200 | single-reviews / reviews (postid-61054) | Greg S – We Roll Up | Greg S | self | yes | 0 | yes | / |  |
| /reviews/james | 200 | single-reviews / reviews (postid-60956) | James – We Roll Up | James | self | yes | 0 | yes | / |  |
| /reviews/jennifer | 200 | single-reviews / reviews (postid-61052) | Jennifer – We Roll Up | Jennifer | self | yes | 0 | yes | / |  |
| /reviews/patricia-h | 200 | single-reviews / reviews (postid-61051) | Patricia H – We Roll Up | Patricia H | self | yes | 0 | yes | / |  |
| /reviews/thomas-h | 200 | single-reviews / reviews (postid-61053) | Thomas H – We Roll Up | Thomas H | self | yes | 0 | yes | / |  |
| /service-area | 200 | default / page (page-id-61758) | Service Area – We Roll Up | Service Area | self | yes | 2 |  | / |  |
| /service-area/culver-city | 200 | template-flexible / page (page-id-61623) | Culver City – We Roll Up | Culver City | self | yes | 2 |  | /service-area | /culver-city |
| /service-area/culver-city/culver-city-delivery-and-pickup | 200 | default / page (page-id-61729) | Culver City Delivery and Pickup – We Roll Up | Culver City Delivery and Pickup | self | yes | 1 (via alias) | yes | /service-area/culver-city | /culver-city/culver-city-delivery-and-pickup |
| /service-area/lax | 200 | default / page (page-id-61721) | LAX – We Roll Up | LAX | self | yes | 9 |  | /service-area | /lax |
| /service-area/lax/lax-weed-delivery | 200 | default / page (page-id-61733) | LAX Weed Delivery – We Roll Up | LAX Weed Delivery | self | yes | 0 | yes | /service-area/lax |  |
| /service-area/marina-del-rey-ca | 200 | default / page (page-id-61768) | Marina del Rey, CA – We Roll Up | Marina del Rey, CA | self | yes | 2 |  | /service-area |  |
| /service-area/marina-del-rey-ca/marina-del-rey-weed-delivery | 200 | default / page (page-id-61731) | Marina del Rey Weed Delivery – We Roll Up | Marina del Rey Weed Delivery | self | yes | 0 | yes | /service-area/marina-del-rey-ca |  |
| /service-area/playa-vista-ca | 200 | default / page (page-id-61784) | Playa Vista, CA – We Roll Up | Playa Vista, CA | self | yes | 2 |  | /service-area |  |
| /service-area/playa-vista-ca/playa-vista-weed-delivery | 200 | default / page (page-id-61727) | Playa Vista Weed Delivery – We Roll Up | Playa Vista Weed Delivery | self | yes | 1 |  | /service-area/playa-vista-ca |  |
| /service-area/san-pedro | 200 | template-flexible / page (page-id-60812) | San Pedro – We Roll Up | San Pedro | self | yes | 15 |  | /service-area |  |
| /service-area/san-pedro/carson-ca | 200 | default / page (page-id-62497) | Carson, CA – We Roll Up | Carson, CA | self | yes | 0 | yes | /service-area/san-pedro |  |
| /service-area/san-pedro/rancho-palos-verdes-ca | 200 | default / page (page-id-62498) | Rancho Palos Verdes, CA – We Roll Up | Rancho Palos Verdes, CA | self | yes | 0 | yes | /service-area/san-pedro |  |
| /service-area/san-pedro/san-pedro-weed-delivery | 200 | default / page (page-id-61772) | San Pedro – Palos Verdes Weed Delivery – We Roll Up | San Pedro - Palos Verdes Weed Delivery | self | yes | 0 | yes | /service-area/san-pedro |  |
| /service-area/san-pedro/wilmington-ca | 200 | default / page (page-id-62496) | Wilmington, CA – We Roll Up | Wilmington, CA | self | yes | 0 | yes | /service-area/san-pedro |  |
| /service-area/westchester-ca | 200 | default / page (page-id-61771) | Westchester, CA – We Roll Up | Westchester, CA | self | yes | 2 |  | /service-area |  |
| /service-area/westchester-ca/westchester-weed-delivery | 200 | default / page (page-id-61735) | Westchester Weed Delivery – We Roll Up | Westchester Weed Delivery | self | yes | 0 | yes | /service-area/westchester-ca |  |
| /weed-delivery | 200 | template-flexible / page (page-id-61759) | Weed Delivery – We Roll Up | Weed Delivery | self | yes | 90 |  | / |  |

WordPress hierarchy (body class `parent-pageid-N`): `/about-us/daily-deals` is under page 60815 (`/about-us`); `/education/*` under 61775; `/products/*` under 61757; `/service-area/<area>` under 61758; and each `/service-area/<area>/<child>` under its area page. `/location/san-pedro/shop` is a PAGE whose parent is the location post 58921. `/location/culver-city/shop` is a child post in the location CPT (postid 61854, term `cannabis-menu-page`). Evidence: body classes in `audit/raw/*.html`, listed in `tmp/understand/arch/bodyclasses.txt`.

## 3. Aliases (redirects)

Where they are stored: `audit/site-inventory.json`, `pages[<landing page>].aliases`. The crawler keys a page by the URL it lands on and keeps the requested spelling in `aliases` (`tools/sr-local/sr-crawl.mjs` lines 340-366). It does not record the redirect status of an alias, so each alias's status code is **UNVERIFIED** (WordPress normally answers 301).

| Alias (from) | Lands on (to) | Internal pages linking to the alias |
|---|---|---|
| /home | / | 91 (footer licence line) |
| /daily-deals | /about-us/daily-deals | 1 (/service-area/culver-city/culver-city-delivery-and-pickup) |
| /shop-playa-vista?filters[root_types][]=vape | /location/culver-city/shop (**query string dropped**) | 40 (global header and off-canvas menu: Products > San Pedro > "Order Vaporizers & Cartridges") |
| /shop | /location/culver-city/shop | 8 (home buttons, product pages, /education/recreational-medicinal) |
| /san-pedro | /location/san-pedro | 2 |
| /concentrates | /products/concentrates | 1 |
| /edibles-gummies | /products/edibles | 1 |
| /flower | /products/flower | 2 |
| /pre-rolls | /products/pre-rolls | 2 |
| /topicals | /products/topicals | 1 |
| /vaporizers-cartridges | /products/vaporizers-cartridges | 2 |
| /culver-city | /service-area/culver-city | 1 |
| /culver-city/culver-city-delivery-and-pickup | /service-area/culver-city/culver-city-delivery-and-pickup | 1 |
| /lax | /service-area/lax | 1 |

Rebuild rule: emit a redirect (or an identical page) for all 14 aliases. In addition, the trailing-slash redirect applies to every route.

## 4. Shop routes

The two shop pages render a vendor menu on the client. Every variant URL is the same server page.

| Base | What it is | Embed | Variants |
|---|---|---|---|
| `/location/san-pedro/shop` | WP page 61855, child of location post 58921 | Jane Boost frameless "partner-hosted" embed. `window.___JANE___` runtimeConfig: `embedConfigId 989`, `isFramelessEmbedMode true`, `showAgeGate false`, `storeId 4281`, `partnerHostedPath "/location/san-pedro/shop"`. Module script `https://boost-assets.iheartjane.com/assets/index-D8IbwKpn.js`, two JSON blocks (`#jane-app-settings`, `#jane-app-secrets` with vendor client tokens: carry them over as they are, never copy them into docs), and the mount `<div id="app" class="app"></div>` inside `main`. | 27: `/shop/menu/{edible,extract,flower,gear,jane-gold,pre-roll,topical,vape}`, `?filters[brand][]=` 710 Labs / Alien Labs / PlugPlay / ST IDES / WYLD, `?filters[feelings][]=` Blissful / Creative / Energetic / Hungry / Pain+Free / Relaxed / Sleepy, `?filters[root_types][]=` best_selling / edible / extract / flower / pre-roll / topical / vape |
| `/location/culver-city/shop` | location CPT post 61854 | Weedmaps WM Store: `<div style="min-height:100vh"><script src="https://werolluplax.wm.store/static/js/embed.js"></script></div>` after an empty `<article>`. The embed reads `store_path`, `store_query` and `locationId=10599` (UNVERIFIED: the embed source is not on disk). The same embed is on `/lax-menu`. | 18: `?store_path=/&store_query=` with category filters (accessories, concentrates x2, edibles x2, flower, pre-rolls x2, topicals, vape-pens x2), brand filters (710-labs, dime, elusive, teds-budz, traditional, wizard-trees), and `page=1&sortBy=most_popular&locationId=10599` |

**Proof that the variants are the base page.** For each variant, the raw HTML was normalised by removing the canonical tag, the `overrides.css?v=` timestamp, the menu-state classes (`current-menu-item`, `current-menu-ancestor`, `current-menu-parent`, `active`, `aria-current`) and the hero `data-bgimage`, and by sorting the lines to neutralise the per-request review shuffle. The sha256 of the result was then compared with the base page's.
Result: **18/18 Culver City and 27/27 San Pedro variants hash identical to their base, and all 45 have identical main-region text.**
Positive control: before the menu-state classes were normalised, the 14 variants that are themselves menu targets hashed different, so the comparison can fire.
`shopRouteOf` is recorded per record in `site-map.json`, with the per-variant verdicts under `shopRouteProof.perVariant`.

What the server does vary per request (it matters for parity checks):
- The canonical differs. San Pedro variants are self-canonical, including the query string or the `/menu/` path. Culver City variants canonicalise to the base.
- `overrides.css?v=<timestamp>` differs.
- The hero image of the shop pages is chosen **at random per request**: `werollup-products-champagne-bar-display-hero.webp` or `werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp`, 26/21 across the 47 shop records.
- The **order of the review slides is shuffled per request**.

Who links to the variants (link graph):
- Menu-target variants: the San Pedro `root_types` filters have 69 inbound (global menu on 40 pages + San Pedro menu on 30, minus self), except `vape` with 29, because the global menu sends vape to the `/shop-playa-vista` alias. The 7 Culver City menu URLs have 60 inbound (global menu + Culver City menu).
- Every other variant has 1 inbound: the store page `/location/san-pedro` (category cards, feelings slider, brand logo slider, See Deals → `/shop/menu/jane-gold`) or `/location/culver-city` (category cards, brand logos).

Rebuild rule (PLAN D4): serve the base shop HTML at the base path, at every `/location/san-pedro/shop/menu/<cat>` path, and at any query string on either base. The embeds route on the client.

## 5. Navigation, verbatim

### 5.1 Top bar (`section#topLevelNav.sticky-top > div#headless-top-bar`, identical on all 91 pages; lines 105-142)

- Store icon `fa-store`, then `<select name="currently-shopping" id="currently-shopping">`:

| Option label | value | data-slug | data-address | data-hours | data-menu-url | data-directions-url |
|---|---|---|---|---|---|---|
| Select a Location | "" | - | - | - | - | - |
| LAX - Culver City | https://werollup.com/location/culver-city/ | culver-city | 11834 Jefferson Boulevard | Open: 10:00 AM - 10:00 PM | https://werollup.com/location/culver-city/shop/ | https://www.google.com/maps?cid=376465196010288395 |
| San Pedro - Palos Verdes | https://werollup.com/location/san-pedro/ | san-pedro | 1705 S Gaffey Street | Open: 10:00 AM - 10:00 PM | https://werollup.com/location/san-pedro/shop (no trailing slash) | https://www.google.com/maps?cid=5006542390870460260 |

- `#activeLocationDetails`: `span#locationAddress` and `span#locationHours`. Both are empty in the HTML and filled by JS (section 6.1). The hours line is the `data-hours` string above, which is the only hours data on the page. Whether it matches the stores' real hours is UNVERIFIED.
- Social (hidden below md; visually-hidden labels): Instagram `https://www.instagram.com/we.roll.up/?hl=en`, Google `https://www.google.com/maps?cid=5006542390870460260` (the San Pedro CID on every page), Yelp `https://www.yelp.com/biz/we-roll-up-los-angeles-4`, Weedmaps `https://weedmaps.com/dispensaries/the-green-co-dispensary-inc`.

### 5.2 Header (`nav#site-navigation`, lines 145-247)

- Logo `/media/logo-white-x.png`, 150x71, alt "We Roll Up Logo", linking to `https://werollup.com`.
- Quick menu (`#menu-quick-menu`, shown at xl and up only; identical on all 91 pages): Daily Deals → /about-us/daily-deals/ · Delivery → /weed-delivery/ · Contact → /contact/.
- Primary menu. **Three variants, chosen by page** (dropdown parents have `href="#"` and are Bootstrap dropdown toggles). Hrefs below are shown percent-decoded once; the exact hrefs are in `site-map.json nav.main.primaryMenus`.

**`menu-primary-navigation`: 40 pages (every non-location page)**
- Locations → `#`
  - LAX - Culver City → `/location/culver-city`
  - San Pedro - Palos Verdes → `/location/san-pedro`
- Products → `#`
  - San Pedro → `#`
    - Best Selling → `/location/san-pedro/shop/?filters[root_types][]=best_selling`
    - Order Flower → `…?filters[root_types][]=flower`
    - Order Pre-Rolls → `…=pre-roll`
    - Order Vaporizers & Cartridges → `/shop-playa-vista/?filters[root_types][]=vape` (**defect**: lands on the Culver City shop with the filter dropped)
    - Order Edibles & Gummies → `…=edible`
    - Order Concentrates → `…=extract`
    - Order Topicals → `…=topical`
  - LAX → `#`
    - Best Selling → `/location/culver-city/shop/?store_path=/&store_query=page=1&sortBy=most_popular&locationId=10599`
    - Order Flower / Order Pre-Rolls / Order Vaporizers & Cartridges / Order Edibles & Gummies / Order Concentrates / Order Topicals → `/location/culver-city/shop/?store_path=/&store_query=filter%5BanyClientCategories%5D%5B%5D=<flower|pre-rolls|vape-pens|edibles|concentrates|topicals>-category-pages&sortBy=most_popular&page=1&locationId=10599`
- Education → `#`: Flower, Pre-Rolls, Vaporizers & Cartridges, Edibles, Concentrates, Topicals → `/products/<slug>/`; Cannabis 101 → `/education/cannabis-101/`; Recreational & Medicinal → `/education/recreational-medicinal/`
- About → `/about-us/`
- Daily Deals → `/about-us/daily-deals/`
- Contact → `/contact/`

**`menu-lax-culver-city-menu`: 21 pages** (`/location/culver-city`, `/location/culver-city/shop` + 18 variants, `/location-pagetype/cannabis-menu-page`). Same top level, except:
- Products is flat: the 7 LAX items above.
- The Education order is Concentrates, Edibles, Flower, Pre-Rolls, Topicals, Vaporizers & Cartridges, Cannabis 101, Recreational & Medicinal.
- The label is **"About Us"** (not "About").

**`menu-san-pedro-menu`: 30 pages** (`/location/san-pedro`, `/location/san-pedro/shop` + 27 variants, `/location-pagetype/primary-location`). Products is flat:
- Best Selling, Order Flower, Order Pre-Rolls, **"Order Vapes & Cartridges"** → `/location/san-pedro/shop/?filters[root_types][]=vape` (correct store here)
- Order Edibles & Gummies, Order Concentrates, Order Topicals

Education order: Cannabis 101, Recreational & Medicinal, Concentrates, Edibles, Flower, Pre-Rolls, Topicals, Vaporizers & Cartridges. Label "About Us".

- Hamburger: `button.navbar-toggler`, aria-label "Toggle navigation", opens `#defaultOffcanvas`.
- **Order Now** CTA (all pages): `a.cta-item.active-location-menu.js-selected-location-menu.btn.btn-secondary` with the label "Order Now". Static href `https://werollup.com/location/culver-city/shop/`, plus `data-lax-url` (the Culver City shop) and `data-sanpedro-url="https://werollup.com/location/san-pedro/shop/"`. Its behaviour is in section 6.2.

### 5.3 Sub-header strip (`div#site-topbar`)
- **40 non-location pages: promo marquee.** `div#scroll-text.marquee-content > div.text-block` holds: map-marker icon, "Welcome to We Roll Up…", star icon, "We Roll Up Rosin Club + Buy any 5 rosin products + Get 25% Off" (lines 248-256). No script references it, so any motion is CSS (see `audit/motion-inventory.json`; not analysed by this lane).
- **51 location-template pages: location sub-header.**
  - Breadcrumbs: `nav[aria-label=breadcrumb]` with schema.org BreadcrumbList microdata. Example on `/location/culver-city/shop`: Home (`https://werollup.com`) › Locations (`/location/culver-city/shop/`) › LAX - Culver City (`/location/culver-city/`) › Shop LAX - Culver City (current). Defect: the "Locations" crumb links to the current store or shop.
  - "You're shopping <b>LAX - Culver City</b>" (or "San Pedro - Palos Verdes").
  - Buttons Directions (Google Maps CID, `rel=nofollow`), **Review Us** (Culver City: `https://search.google.com/local/writereview?placeid=ChIJAfFmFwCxwoARC7V95hl5OQU`; San Pedro: a Google search URL with `ludocid`), and **Call Now** (`tel:+18887776655` / `tel:+14242645423`).
  - A "View Other Locations" link is commented out in the source.
  - `data-aos` fade-up / fade-down. Evidence: `audit/raw/location-san-pedro.html`, `audit/raw/location-culver-city.html`.

### 5.4 Off-canvas (`div.offcanvas.offcanvas-start#defaultOffcanvas`, all pages; lines 258-328)
- Logo (alt "We Roll Up") and the 4 social icons. Close button with aria-label "Close menu".
- `nav.offcanvas-nav[aria-label="Mobile navigation"]` repeats **the same menu variant as the header**, with the id suffixed `-1` (`menu-primary-navigation-1`, `menu-lax-culver-city-menu-1`, `menu-san-pedro-menu-1`), with nested Bootstrap dropdowns.
- Sticky bottom button "Order Now" (`btn-primary`, `js-selected-location-menu`, the same data URLs).

### 5.5 Footer (`div.site-footer.background-black`, identical on all 91 pages; lines 735-830)
- Logo `/media/logo-white-x.png`, alt "We Roll UpLogo" (sic).
- **San Pedro - Palos Verdes**: "1705 S Gaffey Street, San Pedro, CA 90731"; phone "424 264 5423" (`tel:+1424 264 5423`).
- **LAX - Culver City**: "11834 Jefferson Boulevard,  Culver City,  CA 11834" (sic: the postcode repeats the street number); phone "888-777-6655" (`tel:+1888-777-6655`).
- Social: Instagram, Google, Yelp (aria-labels "Instagram Link", "Google Link", "Yelp Link") and a Weedmaps image link (`/media/weedmaps-white-e1666707377331.png`, alt "weedmaps logo").
- **Quick Links** (`#menu-footer-second-menu`):
  - Home → `https://werollup.com/`
  - Shop LAX - Culver City → `/location/culver-city/shop/` (li class `active-location-menu`)
  - Shop San Pedro - Palos Verdes → `/location/san-pedro/shop/`
  - Daily Deals → `/about-us/daily-deals/`
  - LAX - Culver City → `/location/culver-city/`
  - San Pedro - Palos Verdes → `/location/san-pedro/`
  - About Us → `/about-us/`
  - **Cannabis License: C10-0000854-LIC** → `/home`
- Copyright: "© 2026 We Roll Up All rights reserved." · "Designed by Range Marketing" (`https://rangemarketing.com/`, title "Website Designed by Range Marketing"; to be stripped per PLAN D5) · "Privacy Policy" → `/privacy-policy`.

Per-page differences: only the `current-menu-item` / `aria-current` state. Per selected store: nothing in the footer changes. The `active-location-menu` class sits on the footer `<li>`, not on the link, so the JS href rewrite has no effect there.

## 6. Mechanisms

### 6.1 Location switcher (main.js module 343; `assets/js/4c0935fa-main.js` offset ≈13829-16000)
- Guard: writes and deletes a `test_cookie`. If cookies are unavailable, the select is hidden (`display:none`).
- **On change**, when the option has a value:
  1. Set cookie `selected_location=<data-slug>` (30 days, `path=/`).
  2. Set `#locationAddress` to `data-address` and `#locationHours` to `data-hours`, or "Hours Not Available" when that is empty.
  3. Point every `.active-location-menu` element's href at `data-menu-url` + `data-deep-link` (if present) and show it. With no menu URL, hide it.
  4. Point every `.active-location-directions` element (none exist in the markup) at `data-directions-url`.
  5. Navigate to the option value (the store page).
- **On load:** select the option whose value path equals or prefixes `location.pathname`, which also sets the cookie (so any `/location/<store>/…` page selects its store). Otherwise select the option whose slug equals the `selected_location` cookie. Otherwise the top bar stays on "Select a Location" with empty details.
- No localStorage. The only storage key is the `selected_location` cookie.

### 6.2 Order Now resolver and location chooser (main.js `Jl.init`, offset ≈310400-312600)
- **`.js-selected-location-menu` (header and off-canvas Order Now).** Click → `preventDefault`. The target is the selected option's `data-menu-url` (+ deep link). Otherwise the cookie decides: `culver-city`/`lax` → `data-lax-url`, `san-pedro`/`sanpedro` → `data-sanpedro-url`. If a target is resolved the browser navigates there; otherwise `#locationChooserModal` opens.
- **`.js-location-chooser`** (6 buttons on `/`, 1 on `/weed-delivery`) **always** opens the modal (`preventDefault`), with the card hrefs taken from the button's `data-lax-url` / `data-sanpedro-url`:
  - Hero "Order Now": the two shops.
  - "See Deals": both `/about-us/daily-deals/`.
  - "Delivery": both `/weed-delivery/`.
  - The body buttons "Order Now" / "Shop Now" / "Order Now" (`href="/shop"`): the two shops.
- **`#locationChooserModal`** (custom dialog, all pages; lines 833-907):
  - Copy: "Choose Your Location" / "Where would you like to shop?" / "Select a store to continue to the right menu, deals, or delivery page."
  - Two cards, each with "Select Location": LAX - Culver City, "11834 Jefferson Boulevard,  Culver City, CA 11834", image `/media/LAX_-Culver-City-2.webp`; San Pedro - Palos Verdes, "1705 S Gaffey Street, San Pedro, CA 90731", image `/media/San-Pedro_-Palos-Verdes-1.webp`.
  - Behaviour: focus trap, Escape and backdrop click close it, focus returns to the trigger, `body.location-chooser-open`, `.is-open`.

### 6.3 Age gate and store picker (inline, all 91 pages; lines 1008-1160; PLAN D3)
- **Before the check:**
  - `body.age-gate-active` is set.
  - `#mainContent` is `.hidden-content` (`visibility:hidden; opacity:0`, `aria-hidden="true"`).
  - The head style sets `body{overflow:hidden}`.
  - The modal `#ageGateModal` uses the background image `/media/werollup-san-pedro-storefront-classic-car-side-hero-1.webp`.
- **Copy:** "Verify Your Age" · "Are you over the age of 21?" · buttons "Yes, I'm 21+" / "No, I'm Under 21" · denied: "We're sorry, but you do not meet the required age to enter this website." · "Choose your location" · rows "LAX - Culver City / 11834 Jefferson Boulevard / Shop here" and "San Pedro - Palos Verdes / 1705 S Gaffey Street / Shop here".
- **Check** (two DOMContentLoaded scripts):
  - Script 1 passes if `localStorage.agePass_v2`, `sessionStorage.agePass_v2` or cookie `agePass_v2=true` is set. It then reveals the content: removes `age-gate-active`, adds `age-verified`, sets `aria-hidden="false"` and `overflow:auto`.
  - Script 2 hides `#locationGateWrapper`. If **localStorage** has the pass, it reveals the content and restores the cookie. Otherwise it opens the modal with `backdrop:'static', keyboard:false`.
- **Yes:** shows `#locationGateWrapper`, dims Yes to 0.33 and hides No. It does not store anything.
- **No:** hides the question and the buttons and shows the denied text. It does not redirect.
- **Store choice** (`.location-select-btn` inside `#locationGate`):
  1. `preventDefault`.
  2. `localStorage.agePass_v2 = 'true'`.
  3. Cookie `agePass_v2=true; path=/; max-age=31536000; SameSite=Lax` (`Secure` on https).
  4. Hide the modal.
  5. After 50 ms, navigate to the store PAGE (`/location/culver-city/` or `/location/san-pedro/`), which then sets `selected_location` through 6.1.
- **Edge case (UNVERIFIED in a browser):** with a pass held only in the cookie or sessionStorage, script 1 reveals the page but script 2 still opens the modal.
- The Jane embed's own age gate is off (`showAgeGate:false`).

### 6.4 Other mechanisms
- **Promo ticker:** static markup; motion is CSS only (5.3).
- **Home hero cards:** two rounded tiles with lazy backgrounds (lines 333-362).
  - "Shop Our Weed Products" (the page H1, class `h-ultra`): "Full menu for your selected store, plus fresh daily deals." / "Browse everything in stock — and check rotating specials before you shop." Buttons "Order Now" and "See Deals".
  - "Delivery" (H2): "Get your order how and where it works for you." / "Pickup, delivery, and flexible options—so you never have to miss what you want." Button "Delivery".
  - The hero image `/media/werollup-san-pedro-storefront-classic-car-side-hero.webp` is preloaded (`fetchpriority=high`).
- **Accordion** (`#rpb-accordion`, `/` with 2 items, `/weed-delivery` with 5): Bootstrap 5 collapse.
  - Markup: `button.accordion-button[data-bs-toggle=collapse][data-bs-target=#rpb-accordion-item-N-collapse][aria-expanded][aria-controls]` wraps an `<h2>`; the header element is `div.h2`.
  - Each panel is `.accordion-collapse.collapse[data-bs-parent=#rpb-accordion]`, so only one is open at a time. Item 0 starts open (`show`).
- **Reviews carousel** (`.rpb-customer-reviews`, below `main` on all 91 pages): "Our Reviews" / "What our customers are saying".
  - Splide options (from `data-splide`): `type loop, autoplay true, perPage 4 (≤1199: 3, ≤991: 2, ≤767: 2, ≤575: 1 with padding 0), perMove 1, gap 0, arrows (custom chevron buttons), pagination false, cover true, speed 500`.
  - Each slide has 5 star icons, the text and the name. The order is shuffled per request by the server.
- **`mySlides` carousel:** an inline script on all 91 pages (1500 ms rotation) with **no `.mySlides` element anywhere**: dead code. The same applies to the `.top-popup` modal opener and to the `singleLocation` gallery and review/photo sliders (`#locationGallery`, `#locationReviews`, `#locationPhotos`), whose targets are absent everywhere.
- **ZIP-code delivery finder** (markup only on `/`, zip box lines 539-589, form at line 580; script printed on all 91 pages, lines 927-1005):
  - Purely client-side. It makes no request, triggers no redirect and reads no data file.
  - Input `type=number`, required, placeholder "Enter Your Zip Code"; button "Find my Location".
  - Fewer than 5 characters → "Please enter a valid zip code."
  - Otherwise it looks the value up in `location1zips` (22 entries, including an empty string and duplicates) → shows `#location1` "Location: San Pedro" (a link to `/location/san-pedro/`, "Delivery", "Delivery Menu" → `/location/san-pedro/shop/`).
  - If that fails, it shows "No Locations Found" and tries `location2zips` (54 entries, including duplicates) → `#location2` "Location: **Playa Vista**" (sic), which links to `/location/culver-city/` with "Delivery Menu" → `/location/culver-city/shop/`.
  - The first match wins: 90254 and 90503 are in both lists, so they resolve to San Pedro.
  - Success title: "Awesome! We deliver to you. Fast!" / "Please order from this menu:". Empty state: "We're sorry! We couldn't find any locations matching the zip code you entered. Please try another search, and to be safe feel free to call us at 424 264 5423 to confirm if we have options for your area or not." (link `tel:424 264 5423`). Reset: "Search Again".
  - Both ZIP arrays are copied verbatim in `site-map.json components[zip-delivery-finder].data`.
- **Store pages** (`/location/<store>`): hero `.h1` "Shop <store>" with buttons:
  - Order Now (`active-location-menu`).
  - See Deals: San Pedro `/location/san-pedro/shop/menu/jane-gold`; Culver City the shop.
  - Delivery: the shop.

  Then "Shop by Category" cards (Splide `bootstrap-cards-slider`, "SHOP NOW" per category), a daily-deals list, a feelings cards slider (San Pedro), and a brand-logo slider (`rpb-logo-slider`, logos loaded from `data-src` on intersection).
- **Daily deals list** (`/about-us/daily-deals` and both store pages): static markup; no script highlights the current day.
- **Header scroll:** `#topLevelNav` gets `trans-top` / `trans-scrolling` at scrollTop > 0; Bootstrap `sticky-top`.
- **AOS:** `{disable:'mobile', duration:750, once:true}` on 54 pages; critical CSS sets `[data-aos^=fade]{opacity:0}`.
- **Lazy media:** IntersectionObserver for `img.lazy` (`data-src`), `div.lazy`/`section.lazy` (`data-bgimage` etc.), `.lazy-background`, `video.lazy` and `iframe.lazy`.
- **Accessibility patch:** main.js sets `role=heading aria-level=1` on every `.h1`-`.h5` (a defect, so do not reproduce it).
- **No back-to-top control** exists on any page.
- **Speculation rules:** WordPress core prefetch on all pages, which excludes `/wp-*`, `/media/*` and query URLs.

## 7. Forms

| Page | Form | Fields (label · type · placeholder · required) | Action / method | Extras |
|---|---|---|---|---|
| /contact (under "Contact Us Online") | Gravity Forms 2.10.5, form 1 (`#gform_1`, legacy markup) | Your Name* · text · "Your Name" · yes; Your Phone · tel · "Your Phone" · no; Your Email Address* · email · "Your Email Address" · yes; Message* · textarea (10 rows) · "Message" · yes; CAPTCHA · Google reCAPTCHA widget (public sitekey, `api.js?render=explicit`) | `/contact/` · POST · `multipart/form-data` · `novalidate` · postback (not AJAX) | Submit "Send". Hidden: gform_submission_method=postback, gform_theme=legacy, gform_style_settings, is_submit_1, gform_submit, gform_currency, gform_unique_id, state_1, gform_target_page_number_1=0, gform_source_page_number_1=1, gform_field_values. No consent text. **Confirmation text UNVERIFIED** (server-side). Honeypot: a config hash is present but there is no field in the markup, so it is UNVERIFIED. **A static rebuild has no receiver for the postback: operator decision.** |
| / | `#zipSearchForm` | "Enter Your Zip Code" (visually hidden label) · number · "Enter Your Zip Code" · yes | none (intercepted by JS) | button "Find my Location"; see 6.4 |
| /author/werollupadmin | WordPress search | "Search for:" (screen-reader) · search · "Search …" · yes | `https://werollup.com/` · GET `?s=` | button "Search"; no static equivalent |

## 8. Third-party runtime

| Host | What | Pages | Recommendation |
|---|---|---|---|
| www.googletagmanager.com | GA4 `gtag/js?id=G-148QKPF1CL` + GTM `GTM-T4RHQDB` (inline loader + noscript iframe) | 91 | **strip** (D5) |
| cdn.userway.org | accessibility widget `widget.js` (account attribute on the tag) | 91 | **operator decision** (D5, OPEN-DECISIONS) |
| boost-assets.iheartjane.com | Jane Boost runtime + config + app JSON | 28 (San Pedro shop + variants) | **keep** (D4) |
| tags.srv.stackadapt.com | ad attribution pixel injected by an inline script inside the Jane header | 28 | **strip** that inline block (D5); keep the rest of the Jane header |
| remotepay.canpaydebit.com, gateway.moneris.com, web.squarecdn.com, bloom-assets.iheartjane.com | URLs inside `#jane-app-settings`, loaded by the Jane runtime when needed (payments and assets), not page tags | 28 | kept implicitly with the Jane embed |
| werolluplax.wm.store | Weedmaps WM Store embed | 20 (Culver City shop + 18 variants, /lax-menu) | **keep** (D4) |
| www.google.com | Maps embed iframes: `/contact` (2: the San Pedro place `0x457acfc758c4c764`, and a second "We Roll Up" place at 33.985, -118.402, presumably Culver City) and `/service-area/culver-city/culver-city-delivery-and-pickup` (1, **shows the San Pedro place**); reCAPTCHA `api.js` on `/contact` | 2 | keep the maps; reCAPTCHA follows the form decision |
| s.w.org | WordPress emoji loader | 91 | strip |
| rangemarketing.com | footer agency credit (a link, not runtime) | 91 | **strip** (D5) |

The fonts are self-hosted through OMGF (`/wp-content/uploads/omgf/…`), so no Google Fonts host is involved. Full per-host page lists are in `tmp/understand/arch/thirdparty.json`, with the summary in `site-map.json thirdParty`.

## 9. SEO surface and anomalies
- **Per page:** title (table in section 2), canonical (self-referencing on 70 of the 91 pages, which include both shop bases and the 27 San Pedro variants; none on `/author/werollupadmin` and the two `/location-pagetype/*` archives; the 18 Culver City variants point to the base), robots `max-image-preview:large` on all pages (no noindex anywhere), `lang="en-US"`, no hreflang.
- **Open Graph:** site-wide constants on all 91 pages: `og:url` "https://werollup.com", `og:title` "We Roll Up", `og:image` **"https://werollup.comhttps://werollup.com/media/logo-white-x.png"** (malformed), 400x71. There is no `og:description`, no `og:type` and no Twitter tags.
- **Structured data:** no JSON-LD on any page (0 of 91 files contain `ld+json`). Microdata only: BreadcrumbList/ListItem on the 51 location-template pages and SiteNavigationElement on menu links.
- **Meta description:** missing on all 91 pages.
- **H1:** missing on `/location/culver-city`, `/location/san-pedro` and `/location-pagetype/primary-location`. There are 2 H1s on `/accessibility-statement` and `/privacy-policy`.
- **Titles:** the home title is "We Roll Up" alone. Shop variants repeat their base title.
- **Indexable thin or utility routes:** the author archive "admin – We Roll Up" (from the users sitemap), two taxonomy archives, five single-review pages and 45 shop variants.
- **Sitemaps:** WordPress core sitemaps plus the Jane menu sitemap; the rebuild needs an equivalent `sitemap.xml` (the operator decides whether shop variants are listed).

## 10. Dead links and source defects
1. `https://werollup.com/products/edibles-gummies/`: **404**. The anchor "Edibles and Gummies" is on `/service-area/san-pedro/san-pedro-weed-delivery` (1 page). The alias `/edibles-gummies` works; this one does not.
2. `/products` links to `https://werollup.com/wp-admin/post.php?post=60817&action=edit&classic-editor` with anchor "Flower" (aria-label "“Flower” (Edit)"). It is a pasted admin edit link, blocked by robots and behind a login. Post 60817 is `/products/flower`.
3. Products > San Pedro > "Order Vaporizers & Cartridges" → `/shop-playa-vista/?filters[root_types][]=vape` lands on the **Culver City** shop and drops the filter (40 pages).
4. Footer licence link → `/home` (alias redirect, 91 pages). `/shop` buttons and links → alias redirect (8 pages). There are 11 more body-copy links that work only through aliases (section 3).
5. No `http://` link on any page. `/privacy-policy` contains the literal text "http://We Roll Up" three times (WordPress boilerplate; not links).
6. Data and copy defects to carry verbatim and raise with the operator (PLAN D2: fixes need approval):
   - The Culver City postcode is "11834" (the street number) in the footer, the home card and the chooser modal; the real ZIP is not in the crawl (UNVERIFIED).
   - Culver City phone 888-777-6655: not verifiable here.
   - The tel: formats are inconsistent (`tel:+1424 264 5423`, `tel:424 264 5423`, `tel:+14242645423`, `tel:+1888-777-6655`, `tel:+18887776655`).
   - The ZIP finder labels the Culver City result "Playa Vista".
   - The Culver City delivery page embeds the San Pedro map.
   - The breadcrumb "Locations" crumb links to the current page.
   - The accordion `data-accordion-title` holds a double-escaped "&amp;amp;amp;".
   - The footer logo alt is "We Roll UpLogo".
   - The menu labels differ by variant: "About" vs "About Us", "Order Vaporizers & Cartridges" vs "Order Vapes & Cartridges".
7. Evidence gap: `overrides.css` and `overrides.js` were never harvested (UNVERIFIED rules and behaviour).

## 11. Templates for the rebuild

| Template | WP source | Representative | Pages |
|---|---|---|---|
| home | template-homepage | `/` | 1 |
| flexible-page | template-flexible (page-builder blocks) | `/about-us` | 15: /about-us, /about-us/daily-deals, /contact (form + maps), /education/cannabis-101, /education/recreational-medicinal, /lax-menu (WM embed), /products/{concentrates, edibles, flower, pre-rolls, topicals, vaporizers-cartridges}, /service-area/culver-city, /service-area/san-pedro, /weed-delivery (simple content + accordion) |
| default-page | page-template-default (page header, content, sidebar) | `/service-area/lax` | 18: /accessibility-statement, /education, /privacy-policy, /products, /service-area and its 13 descendants other than /service-area/culver-city and /service-area/san-pedro |
| location-hub | single-location | `/location/san-pedro` | 2 |
| shop-weedmaps | single-location child (cannabis-menu-page) | `/location/culver-city/shop` | 1 + 18 variants |
| shop-jane | page 61855 (no template class; Jane plugin) | `/location/san-pedro/shop` | 1 + 27 variants |
| review-single | single-reviews | `/reviews/james` | 5 |
| author-archive | author | `/author/werollupadmin` | 1 |
| taxonomy-archive | location-pagetype | `/location-pagetype/primary-location` | 2 |
| not-found | 404 (body not captured) | n/a | `/products/edibles-gummies` |

The chrome shared by every template: top bar (5.1), header with the per-page menu variant (5.2), sub-header (marquee or location strip, 5.3), off-canvas (5.4), the reviews carousel below `main`, the footer (5.5), the age gate (6.3) and the location chooser modal (6.2). The 51 location-template pages (the store pages, both shops with their variants and the two taxonomy archives) take a store menu and the location sub-header; the other 40 take the global menu and the marquee.
