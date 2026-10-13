# We Roll Up: facts and their evidence

Written 2026-10-13 by the WF1 compliance lane. It covers every business fact the rebuild may print, each with its verbatim
quote and the pages that carry it. The machine-readable twin is `facts/client-facts.json`.

**Sources.** Only the harvest of 2026-10-13 was used: `audit/raw/*.html` (91 pages) plus the rendered top bar in
`audit/capture/baseline.index.1440.style.json`. Nothing comes from the client, a third-party listing or memory.

**Verification.** `tmp/understand/compliance/verify-facts.mjs` checks every verbatim `quote`/`text` value in
client-facts.json against the visible text of each cited page, falling back to the raw HTML for values that live in
attributes or scripts. Descriptive notes are stored as `observation`, not `text`. Result: 87 checks, 0 failures.
Positive control: a non-verbatim annotation in an earlier draft ("(one number)") was caught as a failure and fixed.
`verify-doc-quotes.mjs` checks every quoted string in this file and in COMPLIANCE.md against the site text, the raw HTML
and the saved official sources. Its remaining misses fall into three groups. Some are regex pairings across two separate
quotes. Some use the " / " line-break convention; a targeted check passed for each. The last two are "©" (the `&copy;`
entity) and the S5 brief, whose word "you" is split by an empty TinyMCE bookmark span; both were checked against the
raw HTML.

**Quote convention.** Inside a quote, " / " marks a line break in the source. "©" renders from the `&copy;` entity in the HTML.

**Page keys.** ALL_91 means every crawled page. NON_LOCATION_40 means the 40 crawled pages whose path does not start
with `/location` or `/location-pagetype`. Paths are on werollup.com.

## 1. Identity

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 1.1 | Brand name | "We Roll Up" in "© 2026 We Roll Up All rights reserved." | ALL_91, footer | consistent |
| 1.2 | Brand variant | "We Roll Up LA" | /service-area/culver-city only | variant, one page |
| 1.3 | Legal business name | NOT STATED | none | Not on the site. The Weedmaps link slug `the-green-co-dispensary-inc` is a URL, not a statement. Client to supply. |
| 1.4 | Store names | "LAX - Culver City" and "San Pedro - Palos Verdes" (hyphen-minus). Headings use an en dash: "Shop LAX – Culver City", "Shop San Pedro – Palos Verdes". Short forms in the nav: "LAX", "San Pedro". The age-gate `h6` reads "San Pedro - Palos Verdes " with a trailing space. | ALL_91 (nav, modal, footer); en-dash headings on /location/culver-city and /location/san-pedro | as shown |
| 1.5 | Agency credit | "Designed by Range Marketing" | ALL_91, footer | PLAN D5 removes it |

## 2. Stores: addresses, phones, maps

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 2.1 | San Pedro address | "1705 S Gaffey Street, San Pedro, CA 90731" | ALL_91 (footer, "Choose Your Location" modal); /contact; / (delivery cards) | consistent |
| 2.2 | San Pedro address, privacy variant | "1705 S Gaffey Street, San Pedro / 90731– CA , United States" | /privacy-policy | odd order; same address |
| 2.3 | San Pedro address, accessibility variant | "Physical address: 1705 S Gaffey Street" | /accessibility-statement | partial |
| 2.4 | Culver City address | "11834 Jefferson Boulevard, Culver City, CA 11834" | ALL_91 (footer, modal); /contact; / | **CONFLICT C4**: the ZIP repeats the street number. Every ZIP in the site's own delivery list for this store starts with 90. `postalCode` is left unset in client-facts.json. |
| 2.5 | San Pedro phone | text "424 264 5423". Hrefs: `tel:+1424 264 5423` (footer, ALL_91), `tel:+14242645423` ("Call Now", 30 pages: /location/san-pedro*, /location-pagetype/primary-location), `tel:424 264 5423` (/ zip finder) | as listed | consistent number; three href formats |
| 2.6 | Culver City phone | text "888-777-6655". Hrefs: `tel:+1888-777-6655` (footer, ALL_91), `tel:+18887776655` ("Call Now", 21 pages: /location/culver-city*, /location-pagetype/cannabis-menu-page) | as listed | consistent on the site; UNVERIFIED that it reaches the store, because the same entry has the wrong ZIP and "Coming soon" hours. Client to confirm. |
| 2.7 | General fallback number | "feel free to call us at 424 264 5423" | / (zip finder, no-result message) | consistent |
| 2.8 | Email | NONE. The only email slot is "Email: [email]" with `mailto:[email]` | /accessibility-statement | placeholder (S1) |
| 2.9 | San Pedro map link | `https://www.google.com/maps?cid=5006542390870460260` | ALL_91 (`data-directions-url`, header "Google" icon); "Directions" / "Get Directions" | consistent |
| 2.10 | Culver City map link | `https://www.google.com/maps?cid=376465196010288395` | ALL_91 (`data-directions-url`); "Directions" on /location/culver-city*. /contact "Get Directions" uses a different Google directions URL with embedded coordinates (`!2d33.9854685`, `!1d-118.4021085`) | two URLs; coordinates appear only inside the URL, never as stated text |

## 3. Hours

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 3.1 | Top-bar hours, both stores | `data-hours="Open: 10:00 AM - 10:00 PM"` on both store options of `#currently-shopping`. `main.js` copies it into `#locationHours`, and CSS `text-uppercase` renders "OPEN: 10:00 AM - 10:00 PM". The rendered capture shows `#locationHours` text "Open: 10:00 AM - 10:00 PM". | ALL_91 (182 attributes = 91 x 2) | **CONFLICT C1, C2** |
| 3.2 | San Pedro, contact card | "Hours / Sunday-Thursday / 10:00 AM-8:00 PM / Friday-Saturday / 10:00 AM-9:00 PM" | /contact | **CONFLICT C1** with 3.1 |
| 3.3 | Culver City, contact card | "Hours / Sunday-Thursday / Coming soon / Friday-Saturday / Coming Soon PM" | /contact | **CONFLICT C2** with 3.1; "Coming Soon PM" is a template remnant (S2) |
| 3.4 | Days open | "Our doors are open and our delivery runs seven days a week" (/); "Open seven days per week, our location at 1705 S Gaffey Street" (/service-area/san-pedro); "We open seven days per week, so timing is rarely an obstacle." (/service-area/lax); "seven days" appears on 19 pages in total | as listed | days only, no times |

`hours` and `hoursSpec` are deliberately empty in client-facts.json. Each schedule may be printed verbatim where it already
appears. A merged schedule or structured `openingHours` needs the client first.

## 4. Licence

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 4.1 | Licence number | "Cannabis License: C10-0000854-LIC" | ALL_91, footer | **CONFLICT C5**: one number for two stores. No store attribution appears anywhere. 4 CCR 15000.1(a) requires a licence "for each separate premises". The DCC licence search was not consulted. |
| 4.2 | JSON-LD | none | 0 of 91 pages contain `application/ld+json`; `seo-inventory.json` jsonLd is empty on all 91 | no LocalBusiness data exists to compare with the visible text |

## 5. Services, delivery, payment

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 5.1 | Pickup and ordering | "conveniences such as online ordering, in-store pickup, and curbside pickup." | / (repeated elsewhere) | consistent |
| 5.2 | Delivery offered | "bringing the dispensary experience directly to your door with our convenient, discreet, and reliable delivery service." | / ; /weed-delivery; service-area pages | **CONFLICT C3** |
| 5.3 | Delivery "coming soon" | "Check back for delivery coming soon" (/products/pre-rolls); "Check back for the convenience of delivery in the very near future." (/products/vaporizers-cartridges); "watch for delivery services coming soon!" (/education/recreational-medicinal) | as listed | **CONFLICT C3** with 5.2 |
| 5.4 | Zip finder result | "Awesome! We deliver to you. Fast!" with result rows "Location: San Pedro" and "Location: Playa Vista" | / | "Playa Vista" links to /location/culver-city/ (**CONFLICT C6**) |
| 5.5 | Delivery ZIPs (script data, not visible copy) | San Pedro: 19 ZIPs (90254 90277 90275 90732 90274 90505 90503 90501 90502 90745 90717 90710 90744 90731 90822 90813 90806 90755 90810). "Playa Vista" / Culver City: 47 ZIPs (full list in client-facts.json). 90254 and 90503 are in both lists; the San Pedro list is tested first. | inline script on / | functional data |
| 5.6 | Stated service area | "From our home base in San Pedro, we extend our reach to Culver City, Rancho Palos Verdes, Lomita, Wilmington, Harbor City, Torrance, Rolling Hills, Rolling Hills Estates, and Palos Verdes Estates." | /service-area | No page attributes areas to a store; only the URL hierarchy (/service-area/san-pedro/*) suggests it. |
| 5.7 | Delivery minimum, fee, hours | NOT STATED. The only related line is "Check delivery windows to select a time that works with your schedule". | /weed-delivery | absent; do not add |
| 5.8 | Payment methods | NOT STATED: no cash, debit, card or ATM wording on any page | none | absent; do not add |
| 5.9 | Prices | NOT STATED: 0 "$" amounts in the static HTML of all 91 pages | none | menu prices come from the third-party embeds at run time |

## 6. Promotions (every one possibly time-bound; none shows dates or terms)

| # | Promotion | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 6.1 | Rosin Club | "Welcome to We Roll Up… We Roll Up Rosin Club + Buy any 5 rosin products + Get 25% Off" | NON_LOCATION_40, scrolling top-bar marquee `#site-topbar #scroll-text`; absent from all 51 /location* pages | store not stated; possibly expired. COMPLIANCE F-PROMO-2 |
| 6.2 | Seniors etc. | "10% Off - Seniors, Military Members, & Longshoremen" / "Valid at San Pedro - Palos Verdes" | /about-us/daily-deals (with validity line); /location/san-pedro (without it) | possibly time-bound |
| 6.3 | Munchie Monday | "Munchie Monday - 10% off Edibles" / "Valid at San Pedro - Palos Verdes" | /about-us/daily-deals; /location/san-pedro | weekly |
| 6.4 | Early Bird | "Early Bird Specials" / "Valid at LAX - Culver City" | /about-us/daily-deals; /location/culver-city | no terms shown |
| 6.5 | Prize wheel | "Spin the Wheel for Prizes" / "Valid at LAX - Culver City" | /about-us/daily-deals; /location/culver-city | **HIGH RISK**, COMPLIANCE F-PROMO-1 |
| 6.6 | "First time discount!" | appears ONLY inside Jennifer's review: "...Recommend to everyone. First time discount! Head here for quality products and FANTASTIC service." | ALL_91 (review carousel) | Not a business offer. Never lift it into an offer or badge. |
| 6.7 | Generic deals copy | "Full menu for your selected store, plus fresh daily deals." / "Browse everything in stock — and check rotating specials before you shop." | /, /location/culver-city, /location/san-pedro | generic |

## 7. People, language and claims

| # | Fact | Verbatim as shown | Pages / where | Status |
|---|---|---|---|---|
| 7.1 | Spanish-speaking staff | "we always have a Spanish-speaking member of our team onsite" (/); "We speak Spanish!" (/about-us); "Bilingual service with Spanish-speaking team members always available" (/service-area/playa-vista-ca); 34 distinct matches | 24 pages | consistent; not attributed to one store |
| 7.2 | "First licensed" claim | "As the first legal, licensed cannabis dispensary in San Pedro" (/); "As San Pedro’s first licensed Cannabis dispensary" (/about-us); "We are San Pedro’s original licensed dispensary" (/products/concentrates); "first" or "original" licensed wording on 27 pages | as listed | client claim, UNVERIFIED (COMPLIANCE F-FIRST-1) |
| 7.3 | Since / years / founding | NOT STATED: no "since", "est." or founding year on any page | none | do not add |
| 7.4 | Audience and ID | "If you’re 21 or older with a valid ID" (/); "We invite adults 21+ years of age with valid government-issued ID" (/education/recreational-medicinal) | as listed | consistent |
| 7.5 | Medicinal customers | "To shop We Roll Up as a medicinal cannabis patient, you need a California MMJ card." (/education/recreational-medicinal) versus "You must be 21 or older for recreational purchases, or hold a valid medical recommendation, and we verify ID at the door." (/service-area/san-pedro/carson-ca) | as listed | **CONFLICT C7** |
| 7.6 | Staff named in a review | "Come see David he’ll take care of you!" (Thomas H review) | ALL_91 | review text, not a staff list |

## 8. Reviews

These appear in the "Our Reviews / What our customers are saying" carousel on all 91 pages. Each shows five star icons
(`fa-star` x 5); the stars are icons, not text. No platform, date or store is given for any review. Each reviewer also has
a page at /reviews/<slug> whose H1 is their name.

| Name as shown | Verbatim text |
|---|---|
| Jennifer | "Awesome staff, friendly and knowledgeable. Welcomed from the moment you check in. Need more stars! Recommend to everyone." (line break) "First time discount! Head here for quality products and FANTASTIC service." |
| Patricia H | "I went in for the first time today. Perfect. Every tender was so nice and the guy that helped me pick out my stuff was so helpful and made sure I was really taken care of. I love that this new local place opened up and is awesome. I will definitely be making this my new first stop shop." |
| Thomas H | "This place is amazing! Awesome service, the guys here take care of me!! Real blessing to this town! Awesome to see a legal dispensary in San Pedro! Come see David he’ll take care of you!" |
| James | "Great staff. They inform you on deals and are very friendly and efficient. Love this place." |
| Greg S | "I finally made it in here and man its rad! Super chill spot with a cool vibe, good product and budtenders who know their stuff. Stoked that there is a legal shop in Pedro now. Will for sure be going back." |

## 9. Social and review profiles (header and offcanvas icons, ALL_91)

| Label | URL | Store |
|---|---|---|
| Instagram | https://www.instagram.com/we.roll.up/?hl=en | not stated |
| Google | https://www.google.com/maps?cid=5006542390870460260 | the San Pedro listing (same cid as the San Pedro directions link) |
| Yelp | https://www.yelp.com/biz/we-roll-up-los-angeles-4 | not stated |
| Weedmaps | https://weedmaps.com/dispensaries/the-green-co-dispensary-inc | not stated |
| Review Us (San Pedro pages) | Google search link, ludocid=5006542390870460260 | San Pedro |
| Review Us (Culver City pages) | https://search.google.com/local/writereview?placeid=ChIJAfFmFwCxwoARC7V95hl5OQU | Culver City |
| Explore All Reviews / Leave a Review | the San Pedro Google listing, on every page including Culver City pages | **CONFLICT C8** (minor) |
| Explore All Reviews - LAX | a long Google search URL ("werollup lax") with session parameters | ALL_91 |

`sameAs` and `areaServed` are deliberately empty in client-facts.json. sr-seo copies both onto every LocalBusiness node,
which would tie the San Pedro Google listing to the Culver City store.

## 10. Age gate (ALL_91, verbatim)

"Verify Your Age", then "Are you over the age of 21?" with the buttons "Yes, I'm 21+" and "No, I'm Under 21". "No" shows
"We're sorry, but you do not meet the required age to enter this website." "Yes" reveals "Choose your location" with
both stores and "Shop here". Choosing a store sets `agePass_v2=true` in localStorage and a cookie (`max-age=31536000`,
one year). The gate is a static-backdrop Bootstrap modal, and `#mainContent` stays hidden until the gate is passed.
Wording nuance: "over the age of 21" versus "21+" (**C9**).

## 11. Conflicts (all routed to the client; none resolved here)

| ID | Topic | Side A | Side B |
|---|---|---|---|
| C1 | San Pedro hours | top bar "Open: 10:00 AM - 10:00 PM" (ALL_91) | /contact "Sunday-Thursday 10:00 AM-8:00 PM / Friday-Saturday 10:00 AM-9:00 PM" |
| C2 | Culver City hours | top bar "Open: 10:00 AM - 10:00 PM" (ALL_91) | /contact "Coming soon" / "Coming Soon PM" |
| C3 | Delivery | "our delivery runs seven days a week" (/) and the delivery and service-area pages | "coming soon" / "in the very near future" on three product and education pages |
| C4 | Culver City ZIP | "Culver City, CA 11834" (ALL_91) | the site's own Culver City delivery ZIPs are all 90xxx |
| C5 | Licence coverage | one number, "C10-0000854-LIC" (ALL_91) | two stores presented as open; one licence per premises (4 CCR 15000.1(a)) |
| C6 | "Playa Vista" | zip finder "Location: Playa Vista" links to /location/culver-city/; the nav links /shop-playa-vista?... on 40 pages (not crawled) | the store is "LAX - Culver City" everywhere else |
| C7 | Medicinal access | "you need a California MMJ card" | "or hold a valid medical recommendation" |
| C8 | Review links on Culver City pages | "Review Us" goes to the Culver City place ID | "Explore All Reviews" and "Leave a Review" go to the San Pedro listing |
| C9 | Age wording | "Are you over the age of 21?" | "Yes, I'm 21+" |
| C10 | Map on the Culver City delivery page | heading "Order Now – Culver City Delivery", then "Map" | the embedded Google map (`maps/embed?pb=...!1s0x0%3A0x457acfc758c4c764!2sWe%20Roll%20Up...`) is the San Pedro place (the same `0x457acfc758c4c764` as the San Pedro review link) |

## 12. Source defects (verbatim parity keeps them; fixing one needs operator approval, PLAN D2)

| ID | Text as shown | Page | Note |
|---|---|---|---|
| S1 | "Email: [email]" (`mailto:[email]`) | /accessibility-statement | placeholder |
| S2 | "Coming Soon PM" | /contact | template remnant |
| S3 | "Culver City, CA 11834" | ALL_91 | wrong ZIP (C4) |
| S4 | 8 stray "werollup.com" tokens inside sentences, e.g. "first licensed cannabis dispensary werollup.com, We Roll Up LA" | /service-area/culver-city | pasted citation residue |
| S5 | "Delivery Radius GraphicInclude a simple circular graphic showing a five‑mile radius around your location. This helps visitors see exactly how far into Culver City and beyond you deliver." | /service-area/culver-city/culver-city-delivery-and-pickup | An unedited content brief. In the HTML it sits **inside the `<iframe>` element** of the "Map" embed (between `<iframe ...>` and `</iframe>`), so browsers do NOT render it. This follows from iframe parsing; this page is not among the 25 captured templates, so no render was checked. `audit/content-inventory.json` bodyText DOES contain it, so text parity would wrongly expect it. Content lane and operator to decide. |
| S6 | "(WCAG 2.1) 2.1 Level AA" | /accessibility-statement | duplicated version |
| S7 | "send you home happy and with a smile ?" | /about-us | a literal "?" in the HTML, probably a lost emoji |
| S8 | "check our Daily Deals product for current offers." | /service-area/culver-city/culver-city-delivery-and-pickup | "product" where "page" seems meant (intent UNVERIFIED) |
| (PLAN) | dead link /products/edibles-gummies (404); malformed og:image | see docs/PLAN.md | already logged |
