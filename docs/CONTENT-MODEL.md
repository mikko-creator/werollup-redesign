# werollup.com — CONTENT MODEL (UNDERSTAND / CONTENT lane)

Generated 2026-10-13T02:45:07.506Z from the files on disk only (no request to any client or vendor host). Machine-readable twin: `docs/data/content-blocks.json` (every section carries its verbatim `lines[]`, images and CTAs, so the build can carry every word and prove parity).

**Evidence.** Raw HTML `audit/raw/*.html` (91 pages), `audit/site-inventory.json`, extraction scripts `tmp/understand/content/{lib-html,extract,analyze,build-output,build-md}.mjs`, screenshots `audit/screens/source/*.{1440,390}.png` (spot-check notes in `tmp/understand/content/screen-notes.md`).

**Method.** Main content = &lt;main&gt; children + the shared reviews block (.rpb-customer-reviews, outside main). Chrome excluded: #topLevelNav (incl. #site-topbar), #defaultOffcanvas, .site-footer, #locationChooserModal, #ageGateModal. Sections: one per main child block; prose/split/hero blocks split at every heading (h1-h6 or div/p/span.hN); accordions one section per item; heading-only rows merged into the following block. lines[] are verbatim DOM text lines ("# " = section heading, "## " = sub-heading), screen-reader-only text excluded from lines and listed in hidden[]. Control: for every page sum(section.words) == words(text(main) minus sr-only) - 91/91 pages match; stronger control tmp/understand/content/control.mjs: the concatenated section lines reproduce the main text word-for-word in DOM order on 91/91 pages, and its positive controls (one word changed, two lines swapped) are both detected.

**Reading the tables.** `kind` = hero | card grid | split image+text | accordion | carousel | list | form | embed | prose | notice. `tag` is the element that carries the heading (`h3.h1` = an `<h3>` styled as h1; `p.h1`/`div.h2`/`span.h1` = NOT a heading element, only styled like one; `button > h2` = accordion trigger). `anchor` = the first 10 words of the section body after the heading (verbatim). CTA = link/button styled as a button (`label → href`, verbatim); inline links are in the JSON (`inlineLinks`). ⓛ marks a link with class `js-location-chooser` (it opens the store chooser).

## 1. Headline facts

- 91 pages crawled; 14 content templates (section 2). Total main-content words across all 91 pages: 22085 (shop variants repeat their banner). The shared reviews block adds 209 words to every page.
- The only content outside `<main>` that is not chrome is the reviews carousel (`.rpb-customer-reviews`, before the footer) — found on all 91 pages by `tmp/understand/content/outside.mjs`.
- The home page blocks "Convenient Ways to Get Your Cannabis", "Shop Cannabis In-Store or Order Online for Pickup & Delivery", the ZIP finder and the two location cards are **home-only** (grep over `audit/raw` finds them only in `index.html`); they are not shared blocks.
- Service-area and product pages are **not** templated copy: 0–3 sentences per page repeat elsewhere in the group (section 6). Only the layout is shared.
- All 7 render-risk pages are server-rendered (section 8). Only the 47 shop URLs and `/lax-menu` are client-side menu shells (by design: Weedmaps / Jane embeds).
- The home paragraph under "We Are Here to Serve Your Cannabis Needs" is truncated **in the source HTML** (`…delicious gummies and</p>`), not by CSS (section 7).

## 2. Templates and the ordered sections of every page

| template | pages | WP evidence / shape |
|---|---|---|
| home | 1 | WP template-homepage (body class page-template-template-homepage). |
| standard page | 3 | WP template-flexible (Range page builder rows): /about-us, /about-us/daily-deals, /contact. |
| legal page | 2 | WP default template (page-template-default): one page-container of rich text. |
| author/taxonomy archive | 3 | WP archive templates (author, tax-location-pagetype): page-title banner + post cards; near-empty. |
| education page | 3 | /education = default template (rich text); /education/cannabis-101 and /education/recreational-medicinal = template-flexible single column-content row. |
| lax-menu | 1 | template-flexible: page-title banner + &lt;p&gt; holding the Weedmaps wm.store embed script. |
| location page | 2 | single-location (CPT "location"): empty &lt;article&gt;, hero tiles, Shop by Category carousel, Daily Deals, [Shop by Mood: San Pedro only], Our Featured Brands. |
| shop page | 47 | Menu embeds. /location/culver-city/shop (+18 query variants) = single-location "Cannabis Menu Page" with the Weedmaps wm.store embed script; /location/san-pedro/shop (+8 /shop/menu/* and 19 filter variants) = page 61855 with the Jane (iheartjane boost) #app root. Main text = banner H1 only; the menu is client-rendered. |
| products hub | 1 | WP default template (rich text with H2 per category). |
| product category page | 6 | template-flexible: one centred column-content row (H2/H3 + paragraphs + Shop Now) - flower adds a second page-container rich-text block. |
| review single | 5 | CPT "reviews" single: page-title banner with the reviewer name ONLY (no review text in main). |
| service-area hub | 1 | WP default template (rich text). |
| service-area town page | 15 | Mostly WP default template (page-container rich text); /service-area/culver-city and /service-area/san-pedro are template-flexible. |
| delivery page | 1 | template-flexible: split image+text, 3-step card grid, 5-item accordion. |

Excluded as chrome (documented by the ARCH lane): top bar, header/nav, `#site-topbar` (on location and shop pages it carries the breadcrumb, "You're shopping [store]" and Directions / Review Us / Call Now; on 40 other pages the ticker "Welcome to We Roll Up… We Roll Up Rosin Club + Buy any 5 rosin products + Get 25% Off"), off-canvas menu, footer, age gate, location chooser. Their text is listed in section 4 where it is hidden until interaction.

### home

**`/`** — 601 words, 8 sections, 7 images, 13 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop Our Weed Products" (h1.h-ultra) | Full menu for your selected store, plus fresh daily deals. | werollup-san-pedro-storefront-classic-car-side-hero.webp | ⓛ "Order Now" → /location/culver-city/shop/; ⓛ "See Deals" → /about-us/daily-deals/ |
| 2 | hero | "Delivery" (h2.h-ultra) | Get your order how and where it works for you. | werollup-branded-tray-preroll-flower-marble-table-card.webp | ⓛ "Delivery" → /weed-delivery/ |
| 3 | card grid | — | San Pedro - Palos Verdes 1705 S Gaffey Street San Sub: "San Pedro - Palos Verdes", "LAX - Culver City". | San-Pedro_-Palos-Verdes-1.webp, LAX_-Culver-City-2.webp | "Shop now" → https://werollup.com/location/san-pedro/shop; "Shop now" → https://werollup.com/location/culver-city/shop |
| 4 | split image+text | "We Are Here to Serve Your Cannabis Needs" (h3.h1) | Let us welcome you, share insight into our extensive menu | werollup-sour-kush-jar-preroll-crystal-tray-gallery.webp | ⓛ "Order Now" → /shop |
| 5 | accordion | "Convenient Ways to Get Your Cannabis" (button &gt; h2) | Finding your perfect strain is our mission. We just love |  |  |
| 6 | accordion | "Shop Cannabis In-Store or Order Online for Pickup & Delivery" (button &gt; h2) | Shop Cannabis In-Store or Order Online for Pickup & Delivery Collapsed by default. |  |  |
| 7 | split image+text | "A Community Built Around Cannabis" (h3.h1) | For recreational and medicinal marijuana, We Roll Up is where | werollup-red-lighter-preroll-ashtray-playing-cards-gallery.webp | ⓛ "Shop Now" → /shop |
| 8 | form | "Your Delivery Location" (div.h2) | Find my Location Order Now Sub: "No Locations Found", "Awesome! We deliver to you. Fast!", "Location: San Pedro", "Location: Playa Vista". Hidden lines: 12. | werollup-san-pedro-storefront-classic-car-rear-gallery.webp | "Delivery Menu" → /location/san-pedro/shop/; "Search Again" → (p.mb-0.mt-4.fw-bold); "Delivery Menu" → /location/culver-city/shop/; "Search Again" → (p.mb-0.mt-4.fw-bold); "Find my Location" → (button[type=submit].btn.btn-accent.transparent); ⓛ "Order Now" → … |

### standard page

**`/about-us`** — 122 words, 4 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "About Us" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Welcome to We Roll Up" (h2.h2) | As San Pedro’s first licensed Cannabis dispensary, We Roll Up |  |  |
| 3 | prose | "Our Team" (div.h2) | We are proud of our diverse and very knowledgeable team. |  |  |
| 4 | prose | "We speak Spanish!" (h3.h3) |  |  |  |

**`/about-us/daily-deals`** — 43 words, 2 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Daily Deals" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | list | — | 10% Off - Seniors, Military Members, & Longshoremen Valid at Sub: "10% Off - Seniors, Military Members, & …", "Munchie Monday - 10% off Edibles", "Early Bird Specials", "Spin the Wheel for Prizes". |  |  |

**`/contact`** — 82 words, 3 sections, 3 images, 3 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Contact" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | card grid | — | San Pedro - Palos Verdes 1705 S Gaffey Street San Sub: "San Pedro - Palos Verdes", "Hours", "LAX - Culver City", "Hours". | embed (map iframe), embed (map iframe) | "Get Directions" → https://www.google.com/maps?cid=5006542390870460260; "Get Directions" → https://www.google.com/maps/dir//we+roll+up+culver+city/@37.6822603,-111.5227734,5z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80c2b1001766f101:0x5397919e67db50b!2m2!1d-118.4021085!… |
| 3 | form | "Contact Us Online" (h3.h3) | Use this contact form to reach out to our team. |  | "Send" → (input[type=submit].gform_button.button) |

### legal page

**`/accessibility-statement`** — 213 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Accessibility Statement" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Date: January 10, 2022" (h2) |  |  |  |
| 3 | prose | "Accessibility conformance status" (h1) | We Roll Up is committed to accessibility and strives to |  |  |
| 4 | prose | "Accessibility feedback" (h2) | Accessibility is powered by your willingness to share your experience |  |  |
| 5 | prose | "Technical specifications" (h3) | The accessibility of We Roll Up relies on the following |  |  |
| 6 | prose | "Accessibility features" (h3) | We Roll Up reaches beyond compliance, providing usability improvements that |  |  |

**`/privacy-policy`** — 1464 words, 15 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Privacy Policy" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Welcome to our Privacy Policy" (h1) |  |  |  |
| 3 | prose | "Your privacy is critically important to us." (h3) | We Roll Up is located at: We Roll Up 1705 |  |  |
| 4 | prose | "Website Visitors" (h2) | Like most website operators, We Roll Up collects non-personally-identifying inf… |  |  |
| 5 | prose | "Gathering of Personally-Identifying Information" (h2) | Certain visitors to We Roll Up‘s websites choose to interact |  |  |
| 6 | prose | "Security" (h2) | The security of your Personal Information is important to us, |  |  |
| 7 | prose | "Advertisements" (h2) | Ads appearing on our website may be delivered to users |  |  |
| 8 | prose | "Links To External Sites" (h2) | Our Service may contain links to external sites that are |  |  |
| 9 | prose | "We Roll Up uses Google AdWords for remarketing" (h2) | We Roll Up uses the remarketing services to advertise on |  |  |
| 10 | prose | "Protection of Certain Personally-Identifying Information" (h2) | We Roll Up discloses potentially personally-identifying and personally-identify… |  |  |
| 11 | prose | "Aggregated Statistics" (h2) | We Roll Up may collect statistics about the behavior of |  |  |
| 12 | prose | "Cookies" (h2) | To enrich and perfect your online experience, We Roll Up |  |  |
| 13 | prose | "E-commerce" (h2) | Those who engage in transactions with We Roll Up – |  |  |
| 14 | prose | "Privacy Policy Changes" (h2) | Although most changes are likely to be minor, We Roll |  |  |
| 15 | prose | "At We Roll Up, your privacy is our top priority." (h3) |  |  |  |

### author/taxonomy archive

**`/author/werollupadmin`** — 7 words, 3 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Author: admin" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | notice | — | Sorry, no results were found. |  |  |
| 3 | form | — |  |  | "Search" → (input[type=submit].btn.btn-primary) |

**`/location-pagetype/cannabis-menu-page`** — 12 words, 2 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Page Type: Cannabis Menu Page" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | list | — | Apr 3 2026 Shop LAX - Culver City Sub: "3", "Shop LAX - Culver City". |  |  |

**`/location-pagetype/primary-location`** — 7 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | list | — | Jan 19 2022 San Pedro - Palos Verdes Sub: "19", "San Pedro - Palos Verdes". | San-Pedro_-Palos-Verdes-1.webp |  |

### education page

**`/education`** — 903 words, 7 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Education" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Cannabis Education at We Roll Up" (h2) | At We Roll Up, we believe that informed consumers make |  |  |
| 3 | prose | "Understanding the Cannabis Plant" (h2) | Cannabis is a complex plant containing over four hundred chemical |  |  |
| 4 | prose | "Navigating Product Categories" (h2) | One of the most common areas where customers seek guidance |  |  |
| 5 | prose | "Key Topics We Cover In-Store" (h3) | When you visit us, our team is prepared to discuss |  |  |
| 6 | prose | "Industry Trends and the Future of Cannabis Knowledge" (h2) | The cannabis industry in the United States is evolving rapidly. |  |  |
| 7 | prose | "Visit Us and Learn Something New" (h3) | Cannabis education is not a one-time event. It is an |  |  |

**`/education/cannabis-101`** — 377 words, 5 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Cannabis 101" (h1.h1) |  | cannabis-buds-mason-jars.webp |  |
| 2 | prose | "Cannabis Education at We Roll Up" (h2.h2) | Step inside We Roll Up and you’ll notice the strains |  |  |
| 3 | prose | "Questions About Cannabis?" (h2.h2) | Once you’re more experienced with cannabis, learning about chemical profiles, |  |  |
| 4 | prose | "We’re Here to Help!" (h3.h2) | Terpenes are aromatic compounds produced by a variety of plants |  |  |
| 5 | prose | "Our helpful, knowledgeable staff is ready to help!" (h3.h3) |  |  |  |

**`/education/recreational-medicinal`** — 239 words, 5 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Recreational & Medicinal" (h1.h1) |  | cannabis-buds-mason-jars.webp |  |
| 2 | prose | "Recreational Weed vs Medical Weed" (h2.h2) | The differences between medical and recreational cannabis are subtle. Just |  |  |
| 3 | prose | "Get Medical Cannabis from Us" (h2.h2) | To shop We Roll Up as a medicinal cannabis patient, |  |  |
| 4 | prose | "Recreational Cannabis from We Roll Up" (h3.h2) | We Roll Up is built around acceptance. We welcome all |  |  |
| 5 | prose | "Our cannabis selection is sure to suit your medicinal & recreational needs!" (h3.h3) | Shop Now |  | "Shop Now" → /shop |

### lax-menu

**`/lax-menu`** — 2 words, 2 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop LAX" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | embed | — |  |  |  |

### location page

**`/location/culver-city`** — 90 words, 5 sections, 16 images, 10 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop LAX – Culver City" (p.h1) | Full menu for your selected store, plus fresh daily deals. | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp | "Order Now" → /location/culver-city/shop/; "See Deals" → /location/culver-city/shop/ |
| 2 | hero | "Delivery" (p.h1) | Get your order how and where it works for you. | werollup-sour-kush-jar-preroll-crystal-tray-hero.webp | "Delivery" → /location/culver-city/shop/ |
| 3 | carousel | "Shop by Category" (span.h1) | Flower SHOP NOW Pre-Rolls SHOP NOW Edibles SHOP NOW Vapes Sub: "Flower", "Pre-Rolls", "Edibles", "Vapes", "Extract", "CBD", "Accessories". | 5-e1666212610628.png, 4-e1666212655306.png, 3-e1666212672735.png, 2-e1666212690610.png, 1-e1666212708428.png, 8.webp, 1… | "SHOP NOW" → /location/culver-city/shop/?store_path=%2F&store_query=filter%255BanyClientCategories%255D%255B%255D%3Dflower-category-pages%26sortBy%3Dmost_popular%26page%3D1&locationId=10599; "SHOP NOW" → /location/culver-city/shop/?store_path=%2F&store_query=… |
| 4 | list | "Daily Deals" (div.h1) | Early Bird Specials Spin the Wheel for Prizes Sub: "Early Bird Specials", "Spin the Wheel for Prizes". |  |  |
| 5 | carousel | "Our Featured Brands" (div.h1) |  | st-ides-logo.webp, wizard-trees-logo.webp, traditional-logo.webp, teds-budz-logo.webp, elusive-logo.webp, dime-think-hi… |  |

**`/location/san-pedro`** — 133 words, 6 sections, 14 images, 17 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop San Pedro – Palos Verdes" (p.h1) | Full menu for your selected store, plus fresh daily deals. | werollup-prerolls-book-keychain-lighter-flatlay-hero-scaled.webp | "Order Now" → /location/san-pedro/shop/; "See Deals" → /location/san-pedro/shop/menu/jane-gold |
| 2 | hero | "Delivery" (p.h1) | Get your order how and where it works for you. | werollup-store-edibles-display-neon-sign-hero.webp | "Delivery" → /location/san-pedro/shop/ |
| 3 | carousel | "Shop by Category" (span.h1) | Flower SHOP NOW Pre-Rolls SHOP NOW Edibles SHOP NOW Vapes Sub: "Flower", "Pre-Rolls", "Edibles", "Vapes", "Extract", "CBD", "Accessories". | 5-e1666212610628.png, 4-e1666212655306.png, 3-e1666212672735.png, 2-e1666212690610.png, 1-e1666212708428.png, 8.webp, 1… | "SHOP NOW" → /location/san-pedro/shop/menu/flower; "SHOP NOW" → /location/san-pedro/shop/menu/pre-roll; "SHOP NOW" → /location/san-pedro/shop/menu/edible; "SHOP NOW" → /location/san-pedro/shop/menu/vape; "SHOP NOW" → /location/san-pedro/shop/menu/extract; "SH… |
| 4 | list | "Daily Deals" (div.h1) | 10% Off - Seniors, Military Members, & Longshoremen Munchie Monday Sub: "10% Off - Seniors, Military Members, & …", "Munchie Monday - 10% off Edibles". |  |  |
| 5 | carousel | "Shop by Mood" (span.h1) | I’m feeling Blissful Shop Now I’m feeling Creative Shop Now Sub: "Blissful", "Creative", "Hungry", "Pain Free", "Relaxed", "Sleepy", "Energetic". |  | "Shop Now" → /location/san-pedro/shop/?filters%5Bfeelings%5D%5B%5D=Blissful; "Shop Now" → /location/san-pedro/shop/?filters%5Bfeelings%5D%5B%5D=Creative; "Shop Now" → /location/san-pedro/shop/?filters%5Bfeelings%5D%5B%5D=Hungry; "Shop Now" → /location/san-ped… |
| 6 | carousel | "Our Featured Brands" (div.h1) |  | st-ides-logo.webp, 710-labs-logo.webp, alien-labs-6a2325f719171.webp, plugplay.webp, wyld.webp |  |

### shop page

Pages with main text identical to a listed page (only the URL/query differs): 45 — e.g. `/location/culver-city/shop?store_path=%2F&store_query=filter%255BanyC…` = `/location/culver-city/shop`; `/location/culver-city/shop?store_path=%2F&store_query=filter%255BanyC…` = `/location/culver-city/shop`; `/location/culver-city/shop?store_path=%2F&store_query=filter%255BanyC…` = `/location/culver-city/shop`. Full map in JSON `templates["shop page"].identicalMainContent`.

**`/location/culver-city/shop`** — 4 words, 2 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop LAX - Culver City" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | embed | — |  |  |  |

**`/location/san-pedro/shop`** — 5 words, 2 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Shop San Pedro - Palos Verdes" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | embed | — |  |  |  |

### products hub

**`/products`** — 1300 words, 9 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Products" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Cannabis Products for Every Preference and Need" (h2) | At We Roll Up, we carry a comprehensive selection of |  |  |
| 3 | prose | "Flower: The Foundation of Cannabis" (h2) | Smokable Flower remains the most popular cannabis product category in |  |  |
| 4 | prose | "Pre-Rolls: Convenience Without Compromise" (h2) | Pre-rolls have surged in popularity over the past several years, |  |  |
| 5 | prose | "Vaporizers: Modern and Discreet Consumption" (h2) | Vaporizers represent one of the most rapidly evolving categories in |  |  |
| 6 | prose | "Edibles: Delicious and Long-Lasting Effects" (h2) | Edibles have transformed the way people consume cannabis, offering a |  |  |
| 7 | prose | "Concentrates: Potency and Purity" (h2) | Concentrates are designed for consumers seeking maximum potency and efficiency. |  |  |
| 8 | prose | "Topicals: Targeted Relief Without Psychoactive Effects" (h3) | Topicals represent a unique category of cannabis products that are |  |  |
| 9 | prose | "How We Help You Choose" (h3) | With so many cannabis products available, finding the right option |  |  |

### product category page

**`/products/concentrates`** — 236 words, 5 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Concentrates" (h1.h1) |  | cannabis-13.webp |  |
| 2 | prose | "Weed Concentrates at We Roll Up" (h2.h2) | Whether you’re brand new to the world of concentrates or |  |  |
| 3 | prose | "Premium cannabis Dabs for Days" (h2.h2) | With such a wide variety of consistencies, flavors, and potency, |  |  |
| 4 | prose | "Carefully Curated Concentrates" (h3.h2) | The first step into the world of concentrates can be |  |  |
| 5 | prose | "Check out our concentrate selection today!" (h3.h3) | Shop Now |  | "Shop Now" → /shop |

**`/products/edibles`** — 251 words, 5 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Edibles" (h1.h1) |  | kiva-lost-farm-cannabis-edibles-playing-cards-hero-e1778532668119.webp |  |
| 2 | prose | "Edibles Offered At We Roll Up" (h2.h2) | Chocolate chip, sour cherry, blue raspberry, milk chocolate, strawberry-cheesec… |  |  |
| 3 | prose | "Cannabis Edibles from We Roll Up" (h2.h2) | When consuming edibles, the digestive system and liver metabolizes the |  |  |
| 4 | prose | "Enjoy Our Edibles Today" (h3.h2) | Stepping inside We Roll Up opens up a wonderful world |  |  |
| 5 | prose | "Our selection of edibles is sure to satisfy your sweet tooth!" (h3.h3) | Shop Now |  | "Shop Now" → /shop |

**`/products/flower`** — 1070 words, 10 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Flower" (h1.h1) |  | cannabis-grinders-flower-flatlay.webp |  |
| 2 | prose | "Why are we so especially proud of our selection of flower?" (h2.h3) |  |  |  |
| 3 | prose | "Weed Flower at We Roll Up" (h2) | Smoking remains the most popular cannabis consumption method. It’s also |  |  |
| 4 | prose | "Our Flower Hits Different" (h2.h2) | Flavor – We offer the results of painstaking and sophisticated |  |  |
| 5 | prose | "Find the Flower You’re Looking for At We Roll Up" (h3.h2) | We Roll Up offers a welcoming, comfortable and casual atmosphere |  | "Shop Now" → /shop |
| 6 | prose | "Cannabis Flower: The Heart of the Plant" (h2) | If you have ever stood at a dispensary counter wondering |  |  |
| 7 | prose | "From Harvest to Shelf: How Flower Is Prepared" (h3) | The journey of a quality bud begins long before it |  |  |
| 8 | prose | "Understanding Strain Types and Effects" (h2) | Choosing flower is rarely about THC percentage alone. The interplay |  |  |
| 9 | prose | "Ways to Enjoy Flower" (h3) | One reason flower endures is its sheer flexibility. You can |  |  |
| 10 | prose | "Why San Pedro Chooses We Roll Up for Flower" (h2) | We are proud to function as part of the local |  |  |

**`/products/pre-rolls`** — 215 words, 5 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Pre-Rolls" (h1.h1) |  | werollup-preroll-tubes-ashtray-in-n-out-cup-alt-hero-e1778532512785.webp |  |
| 2 | prose | "Pre-Rolls At We Roll Up" (h2) | How skilled are you at rolling a joint? Unless you’ve |  |  |
| 3 | prose | "Convenient, Tasty Pre-Rolls" (h2.h2) | We Roll Up answers the demand for ready-made smokeables with |  |  |
| 4 | prose | "Cannabis Pre-Rolls From We Roll Up" (h3.h2) | As the first legal and licensed cannabis dispensary in San |  |  |
| 5 | prose | "Give our pre-rolls a try today!" (h3.h3) | Shop Now |  | "Shop Now" → /shop |

**`/products/topicals`** — 230 words, 6 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Topicals" (h1.h1) |  | cannabis-1.webp |  |
| 2 | prose | — | Relatively new on the market, cannabis-infused topicals are safe, efficient |  |  |
| 3 | prose | "Topicals from We Roll Up" (h2.h2) | There are natural cannabinoid CB1 and CB2 receptors in the |  |  |
| 4 | prose | "Find Relief with Our Cannabis Topicals" (div.h2) | Topicals are easy, discreet and smell lovely. Visit We Roll |  |  |
| 5 | prose | "Our topicals are the ultimate addition to your bath & body collection" (h3.h3) |  |  |  |
| 6 | prose | "Shop Now" (h3) |  |  | "Shop Now" → /shop |

**`/products/vaporizers-cartridges`** — 242 words, 5 sections, 1 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Vaporizers & Cartridges" (h1.h1) |  | cannabis-16.webp |  |
| 2 | prose | "Vape Pens at We Roll Up" (h2.h2) | Cannabis vapes offer unique advantages. Easy, discreet, and portable, concentra… |  |  |
| 3 | prose | "Get the Vapes and Cartridges You Love from We Roll Up" (h2.h2) | If you’re interested in getting into vaping, We Roll Up |  |  |
| 4 | prose | "Taste the Terpenes in Our Vapes" (h3.h2) | Shop our actual or virtual shelves for an incredible variety |  |  |
| 5 | prose | "Our knowledgeable staff is ready to help you choose your vape!" (h3.h3) | Shop Now |  | "Shop Now" → /shop |

### review single

**`/reviews/greg-s`** — 2 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Greg S" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |

**`/reviews/james`** — 1 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "James" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |

**`/reviews/jennifer`** — 1 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Jennifer" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |

**`/reviews/patricia-h`** — 2 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Patricia H" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |

**`/reviews/thomas-h`** — 2 words, 1 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Thomas H" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |

### service-area hub

**`/service-area`** — 1146 words, 7 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Service Area" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Our California Service Area" (h2) | As San Pedro‘s first licensed cannabis dispensary, We Roll Up |  |  |
| 3 | prose | "Communities We Proudly Serve" (h2) | Our central location allows us to serve an impressive range |  |  |
| 4 | prose | "What Makes Our Service Area Unique" (h2) | The South Bay cannabis market has evolved significantly in recent |  |  |
| 5 | prose | "Convenience Across Our Service Area" (h2) | Understanding that our customers lead busy lives, we have implemented |  |  |
| 6 | prose | "Our Product Selection Across the Region" (h3) | No matter which community you call home within our service |  |  |
| 7 | prose | "Growing With Our Communities" (h3) | As the cannabis industry continues to mature in California, We |  |  |

### service-area town page

**`/service-area/culver-city`** — 310 words, 5 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Culver City" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "San Pedro’s First Licensed Cannabis Dispensary, Now Serving the LAX Area" (h2) | Building on our legacy as San Pedro’s first licensed cannabis |  |  |
| 3 | prose | "Premium Cannabis Products Near LAX and Culver City" (h2) | Our LAX location features a hand‑picked selection of premium cannabis |  |  |
| 4 | prose | "Knowledgeable Team and Convenient Cannabis Services" (h3) | Seven days a week, our knowledgeable multilingual team guides you |  |  |
| 5 | prose | "LAX Community Hub" (h3) | At We Roll Up LA, we’re more than a delivery |  |  |

**`/service-area/culver-city/culver-city-delivery-and-pickup`** — 273 words, 6 sections, 2 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Culver City Delivery and Pickup" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Your Westside Service HubYour Westside Service Hub" (h2) | At We Roll Up LAX, we offer fast local delivery |  |  |
| 3 | prose | "Service Areas" (h2) | Fox Hills (near Westfield Culver City mall) Culver Steps area |  |  |
| 4 | prose | "Directions for Pickup" (h3) | From Downtown Culver City: Travel west on Culver Blvd; at |  | "Shop now!" → https://werollup.com/lax-menu/ |
| 5 | prose | "Order Now – Culver City Delivery" (h2) |  |  |  |
| 6 | embed | "Map" (h3) |  | embed (map iframe) |  |

**`/service-area/lax`** — 758 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "LAX" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Why LAX Travelers Pay Attention to Cannabis Access" (h2) | Los Angeles International Airport sits at the center of one |  |  |
| 3 | prose | "Understanding the Rules Before You Travel" (h2) | Cannabis remains federally regulated, which means it cannot legally be |  |  |
| 4 | prose | "How the Buying Process Works With Us" (h3) | We designed our shopping experience to be quick and welcoming, |  |  |
| 5 | prose | "Products That Suit Travelers and Locals Alike" (h3) | Our hand-picked selection reflects the variety of people we serve |  |  |
| 6 | prose | "Serving the Airport-Adjacent Communities" (h3) | The areas surrounding LAX represent a diverse mix of residents, |  |  |

**`/service-area/lax/lax-weed-delivery`** — 761 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "LAX Weed Delivery" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | — | A thirty-minute window. That is roughly how long it takes |  |  |
| 3 | prose | "What Makes the LAX Area Unique for Delivery" (h2) | The area around LAX is a patchwork of hotels, residential |  |  |
| 4 | prose | "How the Ordering and Delivery Process Works" (h2) | Placing an order is straightforward. You browse our online menu, |  |  |
| 5 | prose | "Products Suited to Travelers and Residents" (h3) | Our menu is hand-picked to suit every kind of customer |  |  |
| 6 | prose | "Why Customers Across the Region Choose Us" (h3) | We function as part of the local society, proudly serving |  |  |

**`/service-area/marina-del-rey-ca`** — 908 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Marina del Rey, CA" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Weed Dispensary and Cannabis Delivery Serving Marina del Rey, CA" (h2) | Welcome to We Roll Up. As San Pedro‘s first licensed |  |  |
| 3 | prose | "Why Marina del Rey Residents Choose Us as Their Weed Shop" (h2) | Finding a trustworthy weed shop near Marina del Rey, CA |  |  |
| 4 | prose | "Exploring Our Product Selection for Weed Delivery and In-Store Visits" (h2) | Our menu is designed to satisfy every preference and purpose. |  |  |
| 5 | prose | "Cannabis Delivery Options for Marina del Rey, CA" (h3) | The cannabis delivery landscape across Los Angeles County continues to |  |  |
| 6 | prose | "Serving the Marina del Rey Community and Beyond" (h3) | Marina del Rey occupies a unique position within the Los |  |  |

**`/service-area/marina-del-rey-ca/marina-del-rey-weed-delivery`** — 739 words, 7 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Marina del Rey Weed Delivery" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | — | A canal-lined neighborhood with waterfront condos, marina slips, and beach-adja… |  |  |
| 3 | prose | "Stage One: Browsing and Building Your Order" (h2) | Everything starts with the menu. When you open our online |  |  |
| 4 | prose | "Stage Two: Verification and Order Confirmation" (h2) | California law requires age verification for every cannabis purchase, and |  |  |
| 5 | prose | "Stage Three: What You Can Have Delivered" (h3) | Our hand-picked selection covers the full spectrum of cannabis formats, |  |  |
| 6 | prose | "Stage Four: Receiving and Enjoying Your Delivery" (h3) | When the driver arrives, the handoff is quick and straightforward. |  |  |
| 7 | prose | "Who Relies on Marina del Rey Delivery" (h3) | Delivery solves real problems. A medical patient managing chronic discomfort |  |  |

**`/service-area/playa-vista-ca`** — 968 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Playa Vista, CA" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Cannabis Delivery and Dispensary Services for Playa Vista, CA" (h2) | Welcome to We Roll Up, where we bring a carefully |  |  |
| 3 | prose | "Why Playa Vista Residents Choose Us for Cannabis Delivery" (h2) | The cannabis delivery landscape in Los Angeles has grown exponentially |  |  |
| 4 | prose | "Exploring Our Extensive Product Menu" (h2) | Finding your perfect strain is our mission. Our product lineup |  |  |
| 5 | prose | "Serving the Playa Vista Community with Expertise and Care" (h3) | Playa Vista’s demographic is uniquely diverse, blending young professionals wor… |  |  |
| 6 | prose | "Your Next Step Toward Premium Cannabis in Playa Vista" (h3) | The cannabis industry continues to mature rapidly across Los Angeles, |  |  |

**`/service-area/playa-vista-ca/playa-vista-weed-delivery`** — 779 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Playa Vista Weed Delivery" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | — | Tucked between Marina del Rey and Westchester, Playa Vista has |  |  |
| 3 | prose | "Bringing Legal Cannabis Straight to Playa Vista Doorsteps" (h2) | Delivery in Playa Vista works best when it is built |  |  |
| 4 | prose | "How the Delivery Process Actually Works" (h2) | We designed our ordering system to be straightforward enough for |  |  |
| 5 | prose | "A Product Menu Worth Exploring" (h3) | Our hand-picked selection reflects years of learning what customers genuinely |  |  |
| 6 | prose | "Serving Playa Vista and the Surrounding Westside" (h3) | We function as part of the local society, and while |  |  |

**`/service-area/san-pedro`** — 1009 words, 10 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "San Pedro" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | — | Technically an area of Los Angeles, San Pedro is a |  |  |
| 3 | prose | "Come Visit Us in San Pedro" (h2.h2) | Whether you’re visiting San Pedro for the sunshine and amazing |  |  |
| 4 | prose | "We Roll Up Has the Strains You Love" (h2.h2) | Step inside our doors and discover a friendly, casual, inclusive |  |  |
| 5 | prose | "We are proud to serve the Palos Verdes Peninsula and surrounding areas!" (h3.h3) |  |  |  |
| 6 | prose | — | Picture the stretch of coastline that connects San Pedro to |  |  |
| 7 | prose | "A Dispensary Rooted Between San Pedro and Palos Verdes" (h2) | As San Pedro’s first licensed cannabis dispensary, We Roll Up |  |  |
| 8 | prose | "How We Guide You Through the Menu" (h2) | Walking into a dispensary for the first time can feel |  |  |
| 9 | prose | "The Range of Products on Our Shelves" (h3) | Our hand-picked selection spans the full spectrum of what modern |  |  |
| 10 | prose | "Serving the Wider Coastal Community" (h3) | While San Pedro and Palos Verdes are central to who |  |  |

**`/service-area/san-pedro/carson-ca`** — 898 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Carson, CA" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Carson Shoppers Looking for a Trusted Cannabis Source" (h2) | Maybe you live near the Carson Street corridor, work a |  |  |
| 3 | prose | "Why Carson Customers Make the Drive to San Pedro" (h2) | Carson sits in a convenient position relative to our storefront, |  |  |
| 4 | prose | "How the In-Store Experience Works" (h2) | If you have never visited a licensed dispensary before, the |  |  |
| 5 | prose | "The Range of Products on Our Shelves" (h3) | One of the biggest advantages of shopping with a fully |  |  |
| 6 | prose | "Serving Carson and the Broader Community" (h3) | As the first legal, licensed cannabis dispensary in San Pedro, |  |  |

**`/service-area/san-pedro/rancho-palos-verdes-ca`** — 906 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Rancho Palos Verdes, CA" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Cannabis Access for Rancho Palos Verdes Residents" (h2) | A weekend drive along the Palos Verdes Peninsula tends to |  |  |
| 3 | prose | "What Sets Our Selection Apart" (h2) | The shelves at We Roll Up are organized around variety |  |  |
| 4 | prose | "How the Visit Comes Together" (h2) | Shopping with us is designed to be straightforward whether it’s |  |  |
| 5 | prose | "A Welcoming Team and Environment" (h3) | We’re proud of a diverse and knowledgeable team, and that |  |  |
| 6 | prose | "Serving the Broader Coastal Community" (h3) | While Rancho Palos Verdes is our focus here, our location |  |  |

**`/service-area/san-pedro/san-pedro-weed-delivery`** — 868 words, 5 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "San Pedro - Palos Verdes Weed Delivery" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "San Pedro Weed Delivery" (h2) | Finding a reliable cannabis delivery service in San Pedro should |  |  |
| 3 | prose | "How Our Weed Delivery Process Works" (h3) | Ordering weed delivery from We Roll Up is straightforward and |  |  |
| 4 | prose | "What You Can Order for Delivery in San Pedro" (h2) | Our cannabis delivery menu mirrors the hand-picked selection of the |  |  |
| 5 | prose | "Serving San Pedro and Surrounding Areas" (h3) | As a weed shop in San Pedro, we function as |  |  |

**`/service-area/san-pedro/wilmington-ca`** — 905 words, 7 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Wilmington, CA" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | "Cannabis for the Wilmington Community" (h2) | Wilmington sits at the working heart of the Los Angeles |  |  |
| 3 | prose | "What You Can Expect on Our Menu" (h2) | The variety we carry is meant to suit both newcomers |  |  |
| 4 | prose | "Here is a snapshot of the categories we keep stocked for shoppers traveling in …" (h3) | Smokable flower: a rotating lineup of strains spanning indica, sativa, |  |  |
| 5 | prose | "How Shopping With Us Works" (h2) | We have tried to make the path from browsing to |  |  |
| 6 | prose | "The basic flow looks like this:" (h3) | Browse the menu: view live inventory online or in person, |  |  |
| 7 | prose | "Why Wilmington Residents Choose We Roll Up" (h3) | Being the first licensed dispensary in San Pedro carries a |  |  |

**`/service-area/westchester-ca`** — 928 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Westchester, CA" (h1.h1) |  | werollup-trop-cherry-bag-prerolls-coffee-table-book-hero.webp |  |
| 2 | prose | "Weed Dispensary and Cannabis Delivery Serving Westchester, Los Angeles, CA" (h2) | Westchester is a vibrant neighborhood nestled in the western corridor |  |  |
| 3 | prose | "Why Westchester Residents Choose We Roll Up" (h2) | Westchester occupies a unique position in the Los Angeles landscape. |  |  |
| 4 | prose | "Exploring Our Extensive Product Selection" (h2) | When you search for weed near me in Westchester, Los |  |  |
| 5 | prose | "Cannabis Delivery and Convenient Ordering for Westchester" (h3) | The modern cannabis consumer values convenience just as much as |  |  |
| 6 | prose | "Building Community Through Cannabis" (h3) | At our core, we believe cannabis has the power to |  |  |

**`/service-area/westchester-ca/westchester-weed-delivery`** — 788 words, 6 sections, 1 images, 0 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Westchester Weed Delivery" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | prose | — | Cannabis arriving at your Westchester door starts with a licensed, |  |  |
| 3 | prose | "What Westchester Delivery Looks Like Step by Step" (h2) | We designed our delivery flow to remove friction while keeping |  |  |
| 4 | prose | "The Range of Products We Bring to You" (h2) | Our hand-picked selection reflects years of curating cannabis that performs |  |  |
| 5 | prose | "Situations Where Delivery Makes the Most Sense" (h3) | Delivery solves practical problems that a counter visit cannot always |  |  |
| 6 | prose | "Why Westchester Customers Choose Us" (h3) | We function as part of the local society, and that |  |  |

### delivery page

**`/weed-delivery`** — 1078 words, 8 sections, 2 images, 1 CTAs

| # | kind | heading (tag) | anchor | images | CTAs |
|---|---|---|---|---|---|
| 1 | hero | "Weed Delivery" (h1.h1) |  | werollup-products-champagne-bar-display-hero.webp |  |
| 2 | split image+text | "Convenient delivery to your door in San Pedro and Surrounding Communities" (h2) | Getting your favorite cannabis products should be convenient, straightforward, … | werollup-san-pedro-storefront-classic-car-rear-gallery.webp | ⓛ "Order Now" → /location/culver-city/shop/ |
| 3 | card grid | "How Our Delivery Process Works" (h2.h1) | Step 1: Browse & Order Explore our extensive online menu Sub: "Step 1: Browse & Order", "Step 2: Verification & Fulfillment", "Step 3: Receive Your Delivery". |  |  |
| 4 | accordion | "What You Can Order for Delivery" (button &gt; h2) | Our delivery menu mirrors the comprehensive selection available at our |  |  |
| 5 | accordion | "Serving a Wide Range of Communities" (button &gt; h2) | One of the aspects that sets our delivery service apart Collapsed by default. |  |  |
| 6 | accordion | "Why Licensed Delivery Matters" (button &gt; h2) | California’s regulated cannabis market exists to protect consumers, and choosing Collapsed by default. |  |  |
| 7 | accordion | "Tips for a Great Delivery Experience" (button &gt; h2) | To make the most of your weed delivery order, we Collapsed by default. |  |  |
| 8 | accordion | "A Delivery Service Built on Community Values" (button &gt; h2) | At We Roll Up, we are more than a dispensary. Collapsed by default. |  |  |

## 3. Shared blocks

`identical` = normalised text hash equal on every listed page (sha256, 16 hex). Hashes and per-page hashes are in JSON `sharedBlocks`.

| id | heading | pages | identical | hash | note |
|---|---|---|---|---|---|
| reviews-carousel | Our Reviews / What our customers are saying | 91 | true | 95d420014080b4ba | Outside &lt;main&gt;, directly before the footer, on all 91 pages. The SET of 5 reviews is identical everywhere (hash of sorted name+text); the slide ORDER rotates per page (first slide counts: {"Jennifer":18,"Patricia H":19,"Thomas H":17,"Greg S":18,"James":19}). 4 CTAs: Explore All Reviews / Leave a Review (San Pedro Google), Explore All Reviews - LAX / Leave a Review - LAX. |
| page-title-banner | (H1 = page title, varies) | 87 | false | — | div.page-header.h-banner--old: H1 over a background image (data-bgimage). Text differs per page by design. Pages without their own banner image get one of two defaults, and the SAME page alternates between them across its URL variants (19 Culver City shop URLs: champagne-bar 10 / trop-cherry 9; 28 San Pedro shop URLs: 16 / 12) - looks randomised per request (mechanism UNVERIFIED). Banner image use: {"https://werollu… |
| hero-tile-shop | Shop Our Weed Products \| Shop LAX – Culver City \| Shop San … | 3 (/, /location/culver-city, /location/san-pedro) | true | c9e7163cc278e7ab | Body copy (2 lines + Order Now / See Deals) compared WITHOUT the heading, which differs per page. CTA hrefs differ per page (see templates). |
| hero-tile-delivery | Delivery | 3 (/, /location/culver-city, /location/san-pedro) | true | 8f1addccdd566b29 | CTA "Delivery" -&gt; /weed-delivery/ on home, -&gt; /location/&lt;store&gt;/shop/ on the location pages. |
| shop-by-category-carousel | Shop by Category | 2 (/location/culver-city, /location/san-pedro) | true | 6a6c7fe4405f9129 | 7 category cards (Flower, Pre-Rolls, Edibles, Vapes, Extract, CBD, Accessories) + SHOP NOW; same labels and images, different hrefs (Jane /shop/menu/* for San Pedro, Weedmaps store_query for Culver City). |
| daily-deals-list | Daily Deals | 3 (/about-us/daily-deals, /location/culver-city, /location/san-pedro) | false | — | /about-us/daily-deals lists all 4 deals with "Valid at &lt;store&gt;" lines; each location page lists its own 2 deals without the "Valid at" line. |
| featured-brands-logos | Our Featured Brands | 2 (/location/culver-city, /location/san-pedro) | false | — | Logo carousel; hash compares the logo image lists (text is only the heading). Heading identical; logos differ by store. |
| shop-embed-weedmaps-lax | (none; banner H1 "Shop LAX - Culver City" / "Shop LAX") | 20 | true | 877579f3a9609b90 | script src https://werolluplax.wm.store/static/js/embed.js inside main; no server text. |
| shop-embed-jane-san-pedro | (none; banner H1 "Shop San Pedro - Palos Verdes") | 28 | true | fff0c30cdf3411dc | div#app.app root for the Jane (boost-assets.iheartjane.com) menu; no server text. |
| closing-shop-now-band | (varies: "Our selection of ... is sure to ...!") | 6 | false | — | Last section of the flexible product/education pages: an H3 slogan + "Shop Now" -&gt; /shop (a js-free link; /shop is an alias of /location/culver-city/shop). Headings: "Our cannabis selection is sure to suit your medicinal & recreational needs!", "Check out our concentrate selection today!", "Our selection of edibles is sure to satisfy your sweet tooth!", "Give our pre-rolls a try today!", "Shop Now", "Our knowledgeab… |
| age-gate-modal | Verify Your Age | 91 | true | f3f51af6cb4fef6a | CHROME (ARCH lane owns the flow). Listed because its text must survive: see hidden[]. |
| location-chooser-modal | Where would you like to shop? | 91 | true | 62014f230cf2b3a4 | CHROME. Opened by every .js-location-chooser link (Order Now / See Deals / Delivery / Shop Now buttons marked opensLocationChooser). |
| accordion-convenient-ways | Convenient Ways to Get Your Cannabis | 1 (/) | n/a | 017a1908e60bdfb4 | NOT shared: appears on the home page only (grep over audit/raw finds the heading / class in index.html only). Listed because the brief expected it to repeat. |
| accordion-shop-in-store-or-online | Shop Cannabis In-Store or Order Online for Pickup & Delivery | 1 (/) | n/a | 2d6ddb726c58766e | NOT shared: appears on the home page only (grep over audit/raw finds the heading / class in index.html only). Listed because the brief expected it to repeat. |
| zip-finder | Your Delivery Location | 1 (/) | n/a | 47c8fc7af9c9d70f | NOT shared: appears on the home page only (grep over audit/raw finds the heading / class in index.html only). Listed because the brief expected it to repeat. |
| location-cards | (San Pedro - Palos Verdes / LAX - Culver City) | 1 (/) | n/a | 4dc5d2ea37ed1912 | NOT shared: appears on the home page only (grep over audit/raw finds the heading / class in index.html only). Listed because the brief expected it to repeat. |

Store facts repeat in five formats (not one block): home location cards, /contact location cards, the location chooser modal, the age-gate store list and the footer. They agree on "1705 S Gaffey Street", "San Pedro, CA 90731", "424 264 5423", "11834 Jefferson Boulevard", "888-777-6655", and all repeat the "Culver City, CA 11834" ZIP error (section 7).

## 4. Hidden-until-interaction content (must stay reachable and counted)

Text below is verbatim; cells longer than 330 characters end in "…" here and are complete in JSON `hidden[]` (52 entries). Screen-reader-only text is listed as its own row, not inside the slide text.

| page | where | text (verbatim, " / " = line break) |
|---|---|---|
| / | accordion body, collapsed by default, under "Shop Cannabis In-Store or Order Online for Pickup & Delivery" | Shop Cannabis In-Store or Order Online for Pickup & Delivery / As the first legal, licensed cannabis dispensary in San Pedro, We Roll Up continues to pioneer change for the better — and that includes bringing the dispensary experience directly to your door with our convenient, discreet, and reliable delivery service. We believe… |
| / | ZIP finder step hidden until a ZIP is submitted (.zcs-hidden-step#zcs-empty) | No Locations Found / We’re sorry! We couldn’t find any locations matching the zip code you entered. Please try another search, and to be safe feel free to call us at 424 264 5423 to confirm if we have options for your area or not. |
| / | ZIP finder step hidden until a ZIP is submitted (.zcs-hidden-step) | Awesome! We deliver to you. Fast! / Please order from this menu: / Location: San Pedro / Delivery / Delivery Menu / Search Again / Location: Playa Vista / Delivery / Delivery Menu / Search Again |
| / | screen-reader-only text (.visually-hidden) inside block | Enter Your Zip Code |
| ALL 91 pages (shared reviews block; slide order rotates per… | shared reviews block: carousel slide 2/5 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{… | I went in for the first time today. Perfect. Every tender was so nice and the guy that helped me pick out my stuff was so helpful and made sure I was really taken care of. I love that this new local place opened up and is awesome. I will definitely be making this my new first stop shop. / Patricia H |
| ALL 91 pages (shared reviews block; slide order rotates per… | shared reviews block: carousel slide 3/5 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{… | This place is amazing! Awesome service, the guys here take care of me!! Real blessing to this town! Awesome to see a legal dispensary in San Pedro! Come see David he’ll take care of you! / Thomas H |
| ALL 91 pages (shared reviews block; slide order rotates per… | shared reviews block: carousel slide 4/5 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{… | Great staff. They inform you on deals and are very friendly and efficient. Love this place. / James |
| ALL 91 pages (shared reviews block; slide order rotates per… | shared reviews block: carousel slide 5/5 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{… | I finally made it in here and man its rad! Super chill spot with a cool vibe, good product and budtenders who know their stuff. Stoked that there is a legal shop in Pedro now. Will for sure be going back. / Greg S |
| /author/werollupadmin | screen-reader-only text (.screen-reader-text) inside block | Search for: |
| /location/culver-city | carousel slide 2/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Pre-Rolls / SHOP NOW |
| /location/culver-city | carousel slide 3/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Edibles / SHOP NOW |
| /location/culver-city | carousel slide 4/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Vapes / SHOP NOW |
| /location/culver-city | carousel slide 5/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Extract / SHOP NOW |
| /location/culver-city | carousel slide 6/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | CBD / SHOP NOW |
| /location/culver-city | carousel slide 7/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Accessories / SHOP NOW |
| /location/culver-city | carousel slide 2/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 2 https://werollup.com/media/wizard-trees-logo.webp |
| /location/culver-city | carousel slide 3/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 3 https://werollup.com/media/traditional-logo.webp |
| /location/culver-city | carousel slide 4/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 4 https://werollup.com/media/teds-budz-logo.webp |
| /location/culver-city | carousel slide 5/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 5 https://werollup.com/media/elusive-logo.webp |
| /location/culver-city | carousel slide 6/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 6 https://werollup.com/media/dime-think-higher-logo.webp |
| /location/culver-city | carousel slide 7/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 7 https://werollup.com/media/710-labs-logo.webp |
| /location/san-pedro | carousel slide 2/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Pre-Rolls / SHOP NOW |
| /location/san-pedro | carousel slide 3/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Edibles / SHOP NOW |
| /location/san-pedro | carousel slide 4/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Vapes / SHOP NOW |
| /location/san-pedro | carousel slide 5/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Extract / SHOP NOW |
| /location/san-pedro | carousel slide 6/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | CBD / SHOP NOW |
| /location/san-pedro | carousel slide 7/7 (type loop, perPage 4, autoplay, breakpoints {"575":{"perPage":1,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | Accessories / SHOP NOW |
| /location/san-pedro | carousel slide 2/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Creative / Shop Now |
| /location/san-pedro | carousel slide 3/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Hungry / Shop Now |
| /location/san-pedro | carousel slide 4/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Pain Free / Shop Now |
| /location/san-pedro | carousel slide 5/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Relaxed / Shop Now |
| /location/san-pedro | carousel slide 6/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Sleepy / Shop Now |
| /location/san-pedro | carousel slide 7/7 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":3},"1199":{"perPage":4}}) | I’m feeling / Energetic / Shop Now |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Blissful |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Creative |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Hungry |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Pain free |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Relaxed |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Sleepy |
| /location/san-pedro | screen-reader-only text (.visually-hidden) inside link "Shop Now" | Energetic |
| /location/san-pedro | carousel slide 2/5 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 2 https://werollup.com/media/710-labs-logo.webp |
| /location/san-pedro | carousel slide 3/5 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 3 https://werollup.com/media/alien-labs-6a2325f719171.webp |
| /location/san-pedro | carousel slide 4/5 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 4 https://werollup.com/media/plugplay.webp |
| /location/san-pedro | carousel slide 5/5 (type loop, perPage 4, breakpoints {"575":{"perPage":2,"padding":"0"},"767":{"perPage":2},"991":{"perPage":2},"1199":{"perPage":3}}) | [image only] Company Logo 5 https://werollup.com/media/wyld.webp |
| /weed-delivery | accordion body, collapsed by default, under "Serving a Wide Range of Communities" | One of the aspects that sets our delivery service apart is the geographic reach we provide across the South Bay and greater Los Angeles area. Residents searching for weed products near me or dispensary deals near me throughout Torrance, Harbor City, Lomita, and Wilmington can count on reliable service from a licensed, community… |
| /weed-delivery | accordion body, collapsed by default, under "Why Licensed Delivery Matters" | California’s regulated cannabis market exists to protect consumers, and choosing a licensed delivery service is one of the most important decisions you can make as a buyer. Licensed dispensaries like We Roll Up are required to source products that have undergone rigorous third-party laboratory testing for potency, pesticides, h… |
| /weed-delivery | accordion body, collapsed by default, under "Tips for a Great Delivery Experience" | To make the most of your weed delivery order, we recommend taking a few simple steps before placing your request. First, have your valid identification ready so the verification process is quick and effortless when your driver arrives. Second, take time to read product descriptions carefully. Our team has included strain-specif… |
| /weed-delivery | accordion body, collapsed by default, under "A Delivery Service Built on Community Values" | At We Roll Up, we are more than a dispensary. We are a community hub that brings people together through quality cannabis products and genuine human connection. We speak Spanish and always have a Spanish-speaking member of our team onsite and available to assist with delivery inquiries. Our doors are open seven days per week, a… |
| ALL pages carrying #ageGateModal (see modalIdentity) | age gate modal #ageGateModal (shown on first visit until Yes + store choice; chrome documented by ARCH) | Verify Your Age / Are you over the age of 21? / We're sorry, but you do not meet the required age to enter this website. / Yes, I'm 21+ / No, I'm Under 21 / Choose your location / LAX - Culver City / 11834 Jefferson Boulevard / Shop here / San Pedro - Palos Verdes / 1705 S Gaffey Street / Shop here |
| ALL pages carrying #ageGateModal | age gate DENIED body (.age-gate-denied-body, style display:none until "No, I'm Under 21") | We're sorry, but you do not meet the required age to enter this website. |
| ALL pages carrying #locationChooserModal | location chooser modal #locationChooserModal (opened by any .js-location-chooser link) | × / Choose Your Location / Where would you like to shop? / Select a store to continue to the right menu, deals, or delivery page. / LAX - Culver City / 11834 Jefferson Boulevard, Culver City, CA 11834 / Select Location / San Pedro - Palos Verdes / 1705 S Gaffey Street, San Pedro, CA 90731 / Select Location |
| / | ZIP finder validation error injected by inline jQuery when the ZIP has fewer than 5 characters | Please enter a valid zip code. |

Responsive hiding (not interaction): home location-card images are `d-none d-md-block` (no image below 768); the location breadcrumb is `d-none d-xl-flex`. No tabs exist on the site (grep "tab-pane" = 0 files).

## 5. Reviews

Carousel headings: "Our Reviews" (div.h1) and "What our customers are saying" (div.h3). Rating: five &lt;i class="fas fa-star"&gt; icons per card (Font Awesome solid), no numeric rating, no schema. Arrows: two icon-only splide arrow buttons (no text, no aria-label).

| name (as shown) | text (verbatim) | rating | store |
|---|---|---|---|
| Jennifer | Awesome staff, friendly and knowledgeable. Welcomed from the moment you check in. Need more stars! Recommend to everyone. / First time discount! Head here for quality products and FANTASTIC service. | 5 of 5 star icons filled (i.fas.fa-star) | not indicated |
| Patricia H | I went in for the first time today. Perfect. Every tender was so nice and the guy that helped me pick out my stuff was so helpful and made sure I was really taken care of. I love that this new local place opened up and is awesome. I will definitely be making this my new first stop shop. | 5 of 5 star icons filled (i.fas.fa-star) | not indicated |
| Thomas H | This place is amazing! Awesome service, the guys here take care of me!! Real blessing to this town! Awesome to see a legal dispensary in San Pedro! Come see David he’ll take care of you! | 5 of 5 star icons filled (i.fas.fa-star) | not marked; text says "Awesome to see a legal dispensary in San Pedro!" |
| James | Great staff. They inform you on deals and are very friendly and efficient. Love this place. | 5 of 5 star icons filled (i.fas.fa-star) | not indicated |
| Greg S | I finally made it in here and man its rad! Super chill spot with a cool vibe, good product and budtenders who know their stuff. Stoked that there is a legal shop in Pedro now. Will for sure be going back. | 5 of 5 star icons filled (i.fas.fa-star) | not marked; text says "Stoked that there is a legal shop in Pedro now." |

CTAs (same on every page):

- "Explore All Reviews" → `https://www.google.com/search?hl=en-US&gl=us&q=We+Roll+Up,+1705+S+Gaffey+St,+San+Pedro,+CA+90731&ludocid=5006542390870460260&lsig=AB86z5W0PW8o5oD0v0X_fMdgOIro`
- "Leave a Review" → `https://www.google.com/search?hl=en-US&gl=us&q=We+Roll+Up,+1705+S+Gaffey+St,+San+Pedro,+CA+90731&ludocid=5006542390870460260&lsig=AB86z5W0PW8o5oD0v0X_fMdgOIro#lrd=0x80dd371d9ba6c7d7:0x457acfc758c4c764,3`
- "Explore All Reviews - LAX" → `https://www.google.com/search?q=werollup+lax&num=10&sca_esv=27b04becbc364c98&biw=1440&bih=729&sxsrf=ANbL-n7mnamK3oXg5x_Domzt9E0V05cx-A%3A1776100748156&ei=jCXdacKWCb7Z5NoPw_Pl2QQ&ved=0ahUKEwjCjLfxquuTAxW-LFkFHcN5OUsQ4dUDCBE&uact=5&oq=werollup+lax&gs_lp=Egxnd3Mtd2l6LXNlcnAiDHdlcm9sbHVwIGxheDINEC4YgAQYDRjHARivATILEAAYgAQYigUYhgMyCBAAGIAEGKIEMggQABiJBRiiBDIFEAAY7wUyCBAAGIAEGKIEMhwQLhiABBgNGMcBGK8BGJcFGNwEGN4EGOAE2AEBSJ4GUJwCWIQFcAF4AZABAJgBgQGgAdYDqgEDMS4zuAEDyAEA-AEBmAIEoALeAsICChAAGEcY1gQYsAPCAgcQABiABBgNwgIJEAAYgAQYDRgKmAMAiAYBkAYIugYGCAEQARgUkgcDMS4zoAfUGbIHAzAuM7gH3ALCBwMwLjTIBwaACAE&sclient=gws-wiz-serp#lrd=0x80c2b1001766f101:0x5397919e67db50b,1,,,,`
- "Leave a Review - LAX" → `https://search.google.com/local/writereview?placeid=ChIJAfFmFwCxwoARC7V95hl5OQU`

Review single pages: `/reviews/greg-s` (H1 "Greg S"), `/reviews/james` (H1 "James"), `/reviews/jennifer` (H1 "Jennifer"), `/reviews/patricia-h` (H1 "Patricia H"), `/reviews/thomas-h` (H1 "Thomas H") — main holds only the H1 name; no review text, no meta description. Slide order rotates per page (first-slide counts {"Jennifer":18,"Patricia H":19,"Thomas H":17,"Greg S":18,"James":19}).

## 6. Service-area and product pages: templated vs unique

Count note: the brief says 18 service-area pages; the crawl has **16** URLs under /service-area (1 hub + 15 town pages) — `audit/site-inventory.json`. Product categories: 6 (+ the /products hub).

Sentence-level: identical = same sentence on >=2 pages of the group; templatedWithSwap = same after masking place names (service-area) or category words (products); unique = neither. uniqueFacts = unique sentences with digits or street/landmark words.

### Service-area pages

| page | sentences | identical in group | templated (swap) | unique |
|---|---|---|---|---|
| `/service-area` | 52 | 2 | 0 | 50 |
| `/service-area/culver-city` | 16 | 0 | 0 | 16 |
| `/service-area/culver-city/culver-city-delivery-and-pickup` | 19 | 0 | 0 | 19 |
| `/service-area/lax` | 41 | 1 | 0 | 40 |
| `/service-area/lax/lax-weed-delivery` | 37 | 0 | 0 | 37 |
| `/service-area/marina-del-rey-ca` | 46 | 3 | 2 | 41 |
| `/service-area/marina-del-rey-ca/marina-del-rey-weed-delivery` | 47 | 0 | 1 | 46 |
| `/service-area/playa-vista-ca` | 46 | 2 | 0 | 44 |
| `/service-area/playa-vista-ca/playa-vista-weed-delivery` | 40 | 0 | 1 | 39 |
| `/service-area/san-pedro` | 58 | 1 | 0 | 57 |
| `/service-area/san-pedro/carson-ca` | 49 | 3 | 0 | 46 |
| `/service-area/san-pedro/rancho-palos-verdes-ca` | 49 | 1 | 1 | 47 |
| `/service-area/san-pedro/san-pedro-weed-delivery` | 43 | 1 | 1 | 41 |
| `/service-area/san-pedro/wilmington-ca` | 46 | 0 | 1 | 45 |
| `/service-area/westchester-ca` | 43 | 0 | 2 | 41 |
| `/service-area/westchester-ca/westchester-weed-delivery` | 40 | 0 | 0 | 40 |

Sentences shared inside the group (verbatim):

- "Our doors are open seven days per week to anyone and everyone from all walks of life." — /service-area, /service-area/san-pedro/carson-ca
- "Finding your perfect strain is our mission." — /service-area, /service-area/marina-del-rey-ca, /service-area/playa-vista-ca
- "For recreational and medicinal marijuana alike, We Roll Up is where potential and opportunity meet." — /service-area/lax, /service-area/san-pedro/rancho-palos-verdes-ca
- "We bring communities together through a supportive atmosphere and quality products that enrich socialization, bring medicinal relief, and provide a variety of options to suit all needs." — /service-area/marina-del-rey-ca, /service-area/playa-vista-ca, /service-area/san-pedro/san-pedro-weed-delivery
- "As the first legal, licensed cannabis dispensary in San Pedro, We Roll Up continues to pioneer change for the better." — /service-area/marina-del-rey-ca, /service-area/san-pedro/carson-ca
- "The Range of Products on Our Shelves" — /service-area/san-pedro, /service-area/san-pedro/carson-ca

Unique facts per page (verbatim sentences with numbers, streets or landmarks):

- `/service-area`:
  - "From our home base in San Pedro, we extend our reach to Culver City, Rancho Palos Verdes, Lomita, Wilmington, Harbor City, Torrance, Rolling Hills, Rolling Hills Estates, and Palos Verdes Estates."
  - "Meanwhile, customers from Torrance, Lomita, Harbor City, and Wilmington appreciate the short drive to our location, where our diverse and knowledgeable team is ready to assist with everything from selecting the perfect flower strain to recommending the ideal edible dosage for a first-time user."
  - "This is especially important given the rich cultural diversity of the communities we serve, including Wilmington, San Pedro, and Harbor City, where bilingual service is not just appreciated but essential."
- `/service-area/culver-city`:
  - "Building on our legacy as San Pedro’s first licensed cannabis dispensary werollup.com, We Roll Up LA proudly brings its top‑tier service to the LAX area, serving Culver City, Westchester, Playa Vista, El Segundo and the neighborhoods around Los Angeles International Airport (LAX) werollup.com."
  - "We elevate your quality of life with online ordering, curbside pickup and fast, discreet weed delivery near Los Angeles International Airport werollup.com."
- `/service-area/culver-city/culver-city-delivery-and-pickup`:
  - "Our storefront on West Jefferson Blvd is just minutes from Downtown Culver and the Culver Steps, making it easy for you to stop by or receive your order at home."
  - "Culver Steps area and downtown Culver City"
  - "Carlson Park and residential neighborhoods north of Culver Blvd"
  - "We also reach neighboring pockets of Playa Vista, Marina del Rey, Westchester and LAX."
  - "From Downtown Culver City: Travel west on Culver Blvd; at the intersection with Overland Ave, continue straight onto Jefferson Blvd."
  - "We’re located on the right just past Centinela Ave."
  - "From Fox Hills: Drive east on Slauson Ave, merge onto the 405 Freeway southbound, exit at Jefferson Blvd, then head east; our shop is on the left before Lincoln Blvd."
  - "Quick pickup: Parking is available onsite for easy in‑and‑out service."
- `/service-area/lax`:
  - "Los Angeles International Airport sits at the center of one of the busiest travel corridors in the country, and the neighborhoods that surround it have become a natural stopping point for people arriving, departing, or simply passing through."
  - "We Roll Up is positioned to serve customers across the communities ringing the airport, including Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX."
  - "Serving the Airport-Adjacent Communities"
- `/service-area/lax/lax-weed-delivery`:
  - "The neighborhoods that ring Los Angeles International Airport carry a constant flow of travelers, flight crews, and locals who keep odd hours, and that rhythm demands a delivery service tuned to convenience, legality, and reliability."
  - "Beyond LAX, our delivery and dispensary services reach communities throughout Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX, bringing the same quality and consistency to each one."
- `/service-area/marina-del-rey-ca`:
  - "Marina del Rey sits just a short distance from our doors, and residents of this beautiful coastal neighborhood represent some of our most loyal and enthusiastic customers."
  - "Whether you are searching for a weed dispensary, marijuana near me, or reliable cannabis delivery, we are here to serve Marina del Rey with the same warmth and expertise that has defined our operation since day one."
  - "Marina del Rey is one of the most vibrant waterfront communities in all of Los Angeles County."
  - "Recreational users, medical patients, novices, and connoisseurs are all warmly welcome at We Roll Up, and we take pride in curating a selection of products that meets the refined expectations of the Marina del Rey community."
  - "Why Marina del Rey Residents Choose Us as Their Weed Shop"
  - "Finding a trustworthy weed shop near Marina del Rey, CA can feel overwhelming given the number of options scattered across the greater Los Angeles area."
  - "Whether you are a first-time visitor curious about edibles or a long-time aficionado seeking a specific concentrate, our goal is to provide you with the best service possible and send you home happy and with a smile."
  - "We function as part of the local society and proudly serve San Pedro and the surrounding areas, including Marina del Rey, with a hand-picked selection of the finest cannabis products at affordable prices."
  - … 8 more in JSON
- `/service-area/marina-del-rey-ca/marina-del-rey-weed-delivery`:
  - "Marina del Rey residents range from boat owners and weekend visitors to long-term renters and remote workers, and the way they shop reflects that variety."
  - "As San Pedro’s first licensed cannabis dispensary, We Roll Up brings that same vetted selection to Marina del Rey through delivery."
  - "After you place your order, we confirm that you are at least 21 for recreational purchases or hold valid medical documentation."
  - "Who Relies on Marina del Rey Delivery"
  - "We proudly serve Marina del Rey and the surrounding communities across California, extending the same welcoming, knowledgeable service that defines our storefront."
- `/service-area/playa-vista-ca`:
  - "Playa Vista’s demographic is uniquely diverse, blending young professionals working in Silicon Beach tech firms with families, retirees, and creatives who call this neighborhood home."
- `/service-area/playa-vista-ca/playa-vista-weed-delivery`:
  - "Tucked between Marina del Rey and Westchester, Playa Vista has grown into one of the most dynamic neighborhoods on the Westside, home to tech offices, modern apartment complexes, and residents who value convenience above almost everything else."
  - "Customers throughout communities such as Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX have come to rely on our consistency, our knowledgeable staff, and the welcoming atmosphere we bring to every interaction."
- `/service-area/san-pedro`:
  - "Open seven days per week, our location at 1705 S Gaffey Street welcomes California MMJ cardholders and recreational enthusiasts 21+ from across the country."
  - "Serving the Wider Coastal Community"
  - "People come to us from Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX and from much farther away, drawn by the chance to shop in a secure, comfortable, and genuinely accepting space."
- `/service-area/san-pedro/carson-ca`:
  - "Maybe you live near the Carson Street corridor, work a shift at one of the industrial parks off the 405, or you are heading home after a day at the StubHub Center area and want to pick up something for the evening."
  - "Why Carson Customers Make the Drive to San Pedro"
  - "Our goal is simple: send you home happy and with a smile."
  - "Bring valid identification: You must be 21 or older for recreational purchases, or hold a valid medical recommendation, and we verify ID at the door."
- `/service-area/san-pedro/rancho-palos-verdes-ca`:
  - "The drive from most parts of Rancho Palos Verdes takes only a handful of minutes, and the payoff is access to a curated, hand-picked selection rather than a guessing game."
  - "The goal is simple: send you home happy and with a smile."
  - "Serving the Broader Coastal Community"
  - "The harbor area and the peninsula share a coastal character, and We Roll Up has positioned itself to serve that wider stretch of Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX with consistency and care."
- `/service-area/san-pedro/san-pedro-weed-delivery`:
  - "Every delivery requires valid government-issued identification confirming you are 21 years of age or older for recreational purchases, or that you hold a valid medical marijuana recommendation for medicinal orders."
- `/service-area/san-pedro/wilmington-ca`:
  - "Wilmington sits at the working heart of the Los Angeles Harbor, a neighborhood shaped by refineries, port traffic, and tight-knit residential streets that have grown around them for generations."
- `/service-area/westchester-ca`:
  - "Westchester is a vibrant neighborhood nestled in the western corridor of Los Angeles, situated directly adjacent to Los Angeles International Airport."
  - "With a population of roughly 40,000 residents, the neighborhood blends suburban charm with urban convenience."
  - "Westchester is a neighborhood built on connection, from its local parks and schools to its bustling commercial districts along Sepulveda Boulevard and Lincoln Boulevard."
- `/service-area/westchester-ca/westchester-weed-delivery`:
  - "Verify your age: Adults 21 and over and qualified medical patients submit valid identification before an order is accepted."
  - "Serving Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX and the broader area, we apply the same diverse, knowledgeable approach that has defined our storefront from day one."
  - "Our goal is consistent whether you visit in person or order for delivery: send you home happy and with a smile."

### Product category pages

| page | sentences | identical in group | templated (swap) | unique |
|---|---|---|---|---|
| `/products/concentrates` | 15 | 0 | 1 | 14 |
| `/products/edibles` | 17 | 0 | 0 | 17 |
| `/products/flower` | 63 | 0 | 1 | 62 |
| `/products/pre-rolls` | 17 | 0 | 0 | 17 |
| `/products/topicals` | 16 | 0 | 0 | 16 |
| `/products/vaporizers-cartridges` | 16 | 0 | 0 | 16 |

Unique facts per page (verbatim sentences with numbers, streets or landmarks):

- `/products/concentrates`:
  - "Higher THC levels and longer-lasting effects mean that a gram of concentrate goes further than an 1/8th of dried flower."
- `/products/edibles`:
  - "Because it can take anywhere from 30 to 90 minutes for the effects to fully set in, we advise beginning with the minimum dose to appreciate potency and wait for effects to be realized before taking more."
- `/products/flower`:
  - "Ways to Enjoy Flower"
  - "Beyond San Pedro, we proudly serve the surrounding California, bringing affordable, lab-verified flower to neighbors throughout Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX."
  - "Stop by and let our knowledgeable staff guide you through an extensive menu, share insight into the strains we carry, and help you leave with a smile."
- `/products/pre-rolls`: none matched the fact filter (all prose unique).
- `/products/topicals`:
  - "There are natural cannabinoid CB1 and CB2 receptors in the skin that interact with the active compounds in cannabis."
  - "We are your original San Pedro and LAX dispensary and welcome in-state MMJ cardholders and adult 21+ recreational customers from anywhere across the country."
- `/products/vaporizers-cartridges`: none matched the fact filter (all prose unique).

### Sentences reused across the whole site (>= 8 words, on 2+ distinct pages, any template)

These must be carried on EVERY page that has them (no de-duplication in the rebuild). 12 sentences; full list in JSON `crossPageSentences`.

- (4) "We bring communities together through a supportive atmosphere and quality products that enrich socialization, bring medicinal relief, and provide a variety of options to suit all needs." — /, /service-area/marina-del-rey-ca, /service-area/playa-vista-ca, /service-area/san-pedro/san-pedro-weed-delivery
- (3) "Full menu for your selected store, plus fresh daily deals." — /, /location/culver-city, /location/san-pedro
- (3) "Browse everything in stock — and check rotating specials before you shop." — /, /location/culver-city, /location/san-pedro
- (3) "Get your order how and where it works for you." — /, /location/culver-city, /location/san-pedro
- (3) "Pickup, delivery, and flexible options—so you never have to miss what you want." — /, /location/culver-city, /location/san-pedro
- (2) "We just love elevating the quality of life and are more than happy to smooth your path with conveniences such as online ordering, in-store pickup, and curbside pickup." — /, /service-area/marina-del-rey-ca
- (2) "For recreational and medicinal marijuana, We Roll Up is where potential and opportunity meet." — /, /service-area/san-pedro/carson-ca
- (2) "10% Off - Seniors, Military Members, & Longshoremen" — /about-us/daily-deals, /location/san-pedro
- (2) "Our doors are open seven days per week to anyone and everyone from all walks of life." — /service-area, /service-area/san-pedro/carson-ca
- (2) "For recreational and medicinal marijuana alike, We Roll Up is where potential and opportunity meet." — /service-area/lax, /service-area/san-pedro/rancho-palos-verdes-ca
- (2) "As the first legal, licensed cannabis dispensary in San Pedro, We Roll Up continues to pioneer change for the better." — /service-area/marina-del-rey-ca, /service-area/san-pedro/carson-ca
- (2) "Recreational users, medical patients, novices, and connoisseurs are all warmly welcome." — /service-area/playa-vista-ca, /weed-delivery

What IS templated: layout only — page-title banner (H1 = town / category) + one rich-text block; the delivery sub-pages follow the pattern "[Town] Weed Delivery". A long community list recurs nearly verbatim in many pages ("Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX"), embedded in otherwise different sentences.

## 7. Copy findings (for the operator; copy is kept verbatim until approved — D2)

| page | issue | evidence |
|---|---|---|
| / | Truncated paragraph in the SOURCE (not CSS) | audit/raw/index.html: the paragraph under "We Are Here to Serve Your Cannabis Needs" ends "...a wide variety of vapes, delicious gummies and&lt;/p&gt;". No line-clamp rule in audit/css/* or the page; no read-more element. Visible cut at 1440 and 390 (audit/screens/source/index.*.png). |
| / | Accordion heading repeated as the first line of its own body | Accordion item 2 button h2 "Shop Cannabis In-Store or Order Online for Pickup & Delivery" is followed inside .accordion-body by an h3 with the same text. |
| /, /contact, location chooser modal (all pages), footer (chrome) | ZIP shows the street number | "11834 Jefferson Boulevard" / "Culver City, CA 11834" (home location card, /contact card); modal: "11834 Jefferson Boulevard, Culver City, CA 11834". The correct ZIP is not stated anywhere in the crawl (UNVERIFIED) - operator must supply it. |
| /contact | Placeholder hours for LAX - Culver City | "Sunday-Thursday" / "Coming soon" and "Friday-Saturday" / "Coming Soon PM" (stray PM, inconsistent case). The live top bar showed "OPEN: 10:00 AM - 10:00 PM" for LAX in the 1440/390 captures, a runtime string not present in audit/raw (UNVERIFIED source) - conflicting hours. |
| / | Store naming inconsistency in the ZIP finder result | Hidden result row #location2: "Location: Playa Vista" linking to https://werollup.com/location/culver-city/ - the store is called "LAX - Culver City" everywhere else. |
| /service-area/culver-city/culver-city-delivery-and-pickup | Heading text duplicated in the source | &lt;h2&gt;Your Westside Service HubYour Westside Service Hub&lt;/h2&gt; |
| /service-area/culver-city/culver-city-delivery-and-pickup | Designer instruction left inside the map &lt;iframe&gt; (never rendered) | "Delivery Radius GraphicInclude a simple circular graphic showing a five‑mile radius around your location. This helps visitors see exactly how far into Culver City and beyond y..." - iframe fallback text; must NOT become visible copy in the rebuild. |
| /service-area/culver-city/culver-city-delivery-and-pickup | Map under "Map" shows the San Pedro store | iframe src carries place id 0x457acfc758c4c764 and coordinates 33.7287,-118.2965 - the same place id as the San Pedro map on /contact. |
| /service-area/culver-city/culver-city-delivery-and-pickup | Heading written as body text; odd wording; list as &lt;br&gt; lines | "Highlights for Culver City Customers" sits as a plain line inside the Directions paragraph; "check our Daily Deals product for current offers"; "Service Areas" is one &lt;p&gt; of &lt;br&gt;-separated lines without punctuation. |
| /service-area/culver-city | Citation residue "werollup.com" pasted into sentences (8x) | "Building on our legacy as San Pedro’s first licensed cannabis dispensary werollup.com, We Roll Up LA proudly brings ..."; "...near Los Angeles International Airport werollup.com." |
| 9 pages (see evidence) | Misspelling "Marina Del Ray" (elsewhere "Marina del Rey") | /education(2), /products(2), /products/flower, /service-area/lax, /service-area/lax/lax-weed-delivery, /service-area/playa-vista-ca/playa-vista-weed-delivery, /service-area/san-pedro, /service-area/san-pedro/rancho-palos-verdes-ca, /service-area/westchester-ca/westchester-weed-delivery - in the repeated community list "... Playa Vista, Marina Del Ray, Fox Hills, ..." |
| /products/flower, /products/edibles, /products/pre-rolls, /education/recreational-medicinal | Stale "delivery coming soon" copy contradicts the delivery service | "Watch for delivery coming soon!" (flower); "Watch for the availability of delivery coming soon!" (edibles); "Check back for delivery coming soon!" (pre-rolls); "...watch for delivery services coming soon!" (recreational-medicinal). /weed-delivery and the hero "Delivery" tiles offer delivery now. |
| /products/flower, /service-area/san-pedro/carson-ca, /service-area/san-pedro/wilmington-ca | Broken phrase "the surrounding California" | "Beyond San Pedro, we proudly serve the surrounding California, ..."; "...come from neighborhoods throughout the surrounding California."; "...actually care about the surrounding California rather than just moving product." |
| /about-us | Heading with no body | The page ends with h3 "We speak Spanish!" and nothing after it. |
| /reviews/greg-s, /reviews/james, /reviews/jennifer, /reviews/patricia-h, /reviews/thomas-h | Review single pages carry no review text | main = page-title banner with the H1 name only (e.g. "Greg S"); no meta description; the review text exists only in the shared carousel. Title "Greg S &#8211; We Roll Up". |
| /service-area/san-pedro/san-pedro-weed-delivery | Dead link | "Edibles and Gummies" -&gt; https://werollup.com/products/edibles-gummies/ (404 in audit/failures.json). /products links "Edibles" -&gt; https://werollup.com/edibles-gummies/ which is an alias of /products/edibles (site-inventory aliases). |
| /location/culver-city | Brand logo links to the wrong brand | In "Our Featured Brands" the first logo st-ides-logo.webp links to ...filter%255BbrandSlugs%255D%255B%255D%3Dwizard-trees%26page%3D1 - the same href as the next logo, wizard-trees-logo.webp (audit/raw/location-culver-city.html, section#logo-banner). |
| /location/culver-city, /location/san-pedro | Logo links have no brand name | Featured-brand links contain only &lt;img alt="Company Logo 1"&gt; ... "Company Logo 7". |
| /location-pagetype/cannabis-menu-page, /location-pagetype/primary-location | Icon-only links with no text | a.circle-link with only &lt;i class="fas fa-external-link-alt"&gt; (href /location/culver-city/shop/ and /location/san-pedro/). |
| /location/culver-city, /location/san-pedro, /location-pagetype/primary-location | No H1 element | Hero title is &lt;p class="h1"&gt; ("Shop San Pedro – Palos Verdes"); content-inventory h1[] is empty. /accessibility-statement and /privacy-policy have 2 H1s (content-inventory). |
| /products/topicals, /education/cannabis-101 | Closing band markup differs from the sibling pages | /products/topicals: the "Shop Now" button sits inside an &lt;h3&gt; (the extractor reads an h3 heading "Shop Now"), after the h3 "Our topicals are the ultimate addition to your bath & body collection"; /education/cannabis-101 ends with h3 "Our helpful, knowledgeable staff is ready to help!" and has no Shop Now button. |
| /location/san-pedro | Screen-reader text case mismatch (trivial) | Mood card "Pain Free" has visually-hidden text "Pain free". |
| /privacy-policy | Spacing/punctuation in the address line | "90731– CA , United States" |
| / (inline script, all pages) | ZIP finder data quirks | location1zips (San Pedro) contains an empty string and repeats 90502/90501; 90254 and 90503 appear in BOTH lists (first match wins -&gt; San Pedro). Error text "Please enter a valid zip code." is injected by jQuery. |
| /service-area/westchester-ca | Numeric claim in source copy (keep verbatim; flag for COMPLIANCE/facts) | "With a population of roughly 40,000 residents, the neighborhood blends suburban charm with urban convenience." |
| shared reviews (all pages) | Customer-quote typos (keep verbatim per D2) | "man its rad!" (Greg S); "Every tender was so nice" (Patricia H). |

**The home "We Are Here to Serve Your Cannabis Needs" cut.** Source truncation. `audit/raw/index.html` contains `delicious gummies and</p>`; `grep line-clamp audit/css/*` = no match; no read-more element in the block; the 1440 and 390 screenshots show the same cut. The rebuild must carry the text as it is ("…delicious gummies and") unless the operator supplies the missing end.

## 8. Render-risk pages: server-rendered proof

| page | raw file | main words | distinctive sentence (verbatim, from the raw file) | found in raw HTML |
|---|---|---|---|---|
| `/accessibility-statement` | `audit/raw/accessibility-statement.html` | 213 | "Accessibility is powered by your willingness to share your experience on our site. If you have any specific questions, concerns, or general feedback about the accessibility of any of the content on o…" | true |
| `/education/recreational-medicinal` | `audit/raw/education-recreational-medicinal.html` | 239 | "We Roll Up is built around acceptance. We welcome all walks of life, appreciate your individual concerns, and strive to create a perfectly comfortable, enjoyable, and secure atmosphere. Our staff is …" | true |
| `/location/san-pedro` | `audit/raw/location-san-pedro.html` | 133 | "Pickup, delivery, and flexible options—so you never have to miss what you want." | true |
| `/products/concentrates` | `audit/raw/products-concentrates.html` | 236 | "Whether you’re brand new to the world of concentrates or a seasoned connoisseur, looking for recreational enjoyment or medicinal benefits, you’ll be delighted with the selection and quality you’ll fi…" | true |
| `/products/edibles` | `audit/raw/products-edibles.html` | 251 | "Stepping inside We Roll Up opens up a wonderful world of cannabis edibles. Our broad range of options fulfills every need, preference, tolerance level and objective. The combination of our welcoming …" | true |
| `/products/topicals` | `audit/raw/products-topicals.html` | 230 | "Topicals are easy, discreet and smell lovely. Visit We Roll Up for a no-pressure, relaxed and rewarding shopping experience. Browse our website at your leisure for online ordering and the ease of cur…" | true |
| `/products/vaporizers-cartridges` | `audit/raw/products-vaporizers-cartridges.html` | 242 | "If you’re interested in getting into vaping, We Roll Up is the right place to start. Our array of cartridges, specialty pods, and disposables cater to cannabis newcomers, expert connoisseurs, medicin…" | true |

All 7 are server-rendered: the text is in the static HTML and the 1440/390 screenshots of /products/edibles, /education/recreational-medicinal and /location/san-pedro show the same text. The medium risk flag came from the script/text ratio ("script bytes 8x/9x body text", `audit/content-inventory.json` renderRisk.reasons), not from an empty shell; each sentence above was also found with a direct grep of its raw file (1 hit each). The real client-side shells are the menu pages: `/location/san-pedro/shop*` (Jane `div#app`) and `/location/culver-city/shop*` + `/lax-menu` (Weedmaps `wm.store` embed script).

## 9. Per-page metrics

`words` = main content incl. banner H1, excl. the shared reviews block (209 words) and chrome. `images` = distinct image URLs in main (img, data-bgimage, inline style, map iframes). `ctas` = button-styled links/buttons in main.

| path | template | words | sections | images | ctas | inline links |
|---|---|---|---|---|---|---|
| `/` | home | 601 | 8 | 7 | 13 | 3 |
| `/about-us` | standard page | 122 | 4 | 1 | 0 | 0 |
| `/about-us/daily-deals` | standard page | 43 | 2 | 1 | 0 | 4 |
| `/accessibility-statement` | legal page | 213 | 6 | 1 | 0 | 1 |
| `/author/werollupadmin` | author/taxonomy archive | 7 | 3 | 1 | 1 | 0 |
| `/contact` | standard page | 82 | 3 | 3 | 3 | 0 |
| `/education` | education page | 903 | 7 | 1 | 0 | 8 |
| `/education/cannabis-101` | education page | 377 | 5 | 1 | 0 | 2 |
| `/education/recreational-medicinal` | education page | 239 | 5 | 1 | 1 | 2 |
| `/lax-menu` | lax-menu | 2 | 2 | 1 | 0 | 0 |
| `/location-pagetype/cannabis-menu-page` | author/taxonomy archive | 12 | 2 | 1 | 0 | 2 |
| `/location-pagetype/primary-location` | author/taxonomy archive | 7 | 1 | 1 | 0 | 2 |
| `/location/culver-city` | location page | 90 | 5 | 16 | 10 | 9 |
| `/location/culver-city/shop` (+ 18 query/menu variants with identical main text (one text hash) and identical metrics) | shop page | 4 | 2 | 1 | 0 | 0 |
| `/location/san-pedro` | location page | 133 | 6 | 14 | 17 | 7 |
| `/location/san-pedro/shop` (+ 27 query/menu variants with identical main text (one text hash) and identical metrics) | shop page | 5 | 2 | 1 | 0 | 0 |
| `/privacy-policy` | legal page | 1464 | 15 | 1 | 0 | 1 |
| `/products` | products hub | 1300 | 9 | 1 | 0 | 8 |
| `/products/concentrates` | product category page | 236 | 5 | 1 | 1 | 3 |
| `/products/edibles` | product category page | 251 | 5 | 1 | 1 | 2 |
| `/products/flower` | product category page | 1070 | 10 | 1 | 1 | 4 |
| `/products/pre-rolls` | product category page | 215 | 5 | 1 | 1 | 3 |
| `/products/topicals` | product category page | 230 | 6 | 1 | 1 | 3 |
| `/products/vaporizers-cartridges` | product category page | 242 | 5 | 1 | 1 | 3 |
| `/reviews/greg-s` | review single | 2 | 1 | 1 | 0 | 0 |
| `/reviews/james` | review single | 1 | 1 | 1 | 0 | 0 |
| `/reviews/jennifer` | review single | 1 | 1 | 1 | 0 | 0 |
| `/reviews/patricia-h` | review single | 2 | 1 | 1 | 0 | 0 |
| `/reviews/thomas-h` | review single | 2 | 1 | 1 | 0 | 0 |
| `/service-area` | service-area hub | 1146 | 7 | 1 | 0 | 7 |
| `/service-area/culver-city` | service-area town page | 310 | 5 | 1 | 0 | 5 |
| `/service-area/culver-city/culver-city-delivery-and-pickup` | service-area town page | 273 | 6 | 2 | 1 | 7 |
| `/service-area/lax` | service-area town page | 758 | 6 | 1 | 0 | 2 |
| `/service-area/lax/lax-weed-delivery` | service-area town page | 761 | 6 | 1 | 0 | 6 |
| `/service-area/marina-del-rey-ca` | service-area town page | 908 | 6 | 1 | 0 | 8 |
| `/service-area/marina-del-rey-ca/marina-del-rey-weed-delivery` | service-area town page | 739 | 7 | 1 | 0 | 8 |
| `/service-area/playa-vista-ca` | service-area town page | 968 | 6 | 1 | 0 | 8 |
| `/service-area/playa-vista-ca/playa-vista-weed-delivery` | service-area town page | 779 | 6 | 1 | 0 | 7 |
| `/service-area/san-pedro` | service-area town page | 1009 | 10 | 1 | 0 | 8 |
| `/service-area/san-pedro/carson-ca` | service-area town page | 898 | 6 | 1 | 0 | 8 |
| `/service-area/san-pedro/rancho-palos-verdes-ca` | service-area town page | 906 | 6 | 1 | 0 | 8 |
| `/service-area/san-pedro/san-pedro-weed-delivery` | service-area town page | 868 | 5 | 1 | 0 | 8 |
| `/service-area/san-pedro/wilmington-ca` | service-area town page | 905 | 7 | 1 | 0 | 8 |
| `/service-area/westchester-ca` | service-area town page | 928 | 6 | 1 | 0 | 9 |
| `/service-area/westchester-ca/westchester-weed-delivery` | service-area town page | 788 | 6 | 1 | 0 | 4 |
| `/weed-delivery` | delivery page | 1078 | 8 | 2 | 1 | 9 |

Every variant row is in JSON `pageMetrics` (91 rows).

## 10. Screenshot spot-checks (1440 and 390)

Home, /products/edibles, /service-area/lax, /location/san-pedro and /education/recreational-medicinal were checked at 1440 and 390 with contact sheets (`tmp/understand/content/sheet-*.png`). Section order, headings and CTAs match the extraction on all five. Notes: `tmp/understand/content/screen-notes.md`. Observations that matter for the build:

- Headings on product/education pages are uppercased by CSS (`text-transform`); the source case differs per heading (Title Case and sentence case) — keep the source case in the DOM.
- Carousels show 4 cards at 1440 and 1 (reviews, categories) or 2 (moods, brands) at 390; the rest are hidden until advanced (section 4).
- The top bar showed "OPEN: 10:00 AM - 10:00 PM" for both stores at capture; that string is not in `audit/raw` (runtime) — UNVERIFIED source, conflicts with /contact "Coming soon" for LAX.

## 11. Unverified / limits

- The correct Culver City ZIP: not present in the crawl (only the ZIP-finder JS lists contain Culver City-area ZIPs) — UNVERIFIED.
- Store hours shown in the top bar at capture are runtime text, not in the raw HTML — UNVERIFIED source.
- The section splitter is heuristic (headings = h1–h6 or div/p/span with an hN class). The control (sum of section words = main words, 91/91 pages) proves no text was dropped or double-counted; it does not prove the visual grouping is how a designer would group it.
- Copy findings are limited to automated checks (repeated words, duplicated headings, unterminated paragraphs, placeholders, empty links, glued words at inline boundaries, iframe text) plus targeted searches; there was no full spell-check pass over the 22085 main-content words (no dictionary on the machine).
- `/education/recreational-medicinal` 390 was checked; `/products/edibles` 390 stands in for the product template at 390; other templates were not screenshot-checked.
