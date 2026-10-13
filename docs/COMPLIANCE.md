# We Roll Up: California cannabis advertising compliance for the redesign

> **NOT LEGAL ADVICE.** This is a working summary written to constrain the design, imagery and copy lanes. It was
> compiled on 2026-10-13 from official sources read the same day. Every interpretation here is an operator and client
> question, and the client's counsel decides. Under 4 CCR 15040(f), anything an advertising contractor does "shall in
> every case be deemed the act, omission, or failure of the licensee". The client therefore has to sign off before
> anything is published.
> Routing: section D lists the questions for the operator and the client.

## Sources (official only; read 2026-10-13)

| Source | URL | How it was read |
|---|---|---|
| Business and Professions Code, Division 10, Chapter 15 "Advertising and Marketing Restrictions" (§§ 26150–26156) | https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=10.&title=&part=&chapter=15.&article= | Plain fetches got Cloudflare's HTTP 403, so one guarded headless Chrome was used (tools/cdp.mjs, `SR_CHROME_ALLOW=leginfo.legislature.ca.gov,challenges.cloudflare.com`). The text was saved to `tmp/understand/compliance/web/bpc-ch15.txt` (§ 26152 as amended by AB 8, effective 2026-01-01). |
| DCC regulations, 4 CCR Division 19, *Medicinal & Adult Use Cannabis Regulations* (July 2026 compilation, in effect July 1, 2026) | https://cdn.cannabis.ca.gov/wp-content/uploads/sites/2/2026/08/dcc_regulations_20260701.pdf | Downloaded (HTTP 200) and converted with pdftotext to `tmp/understand/compliance/web/dcc.txt`. Article 4 "Posting and Advertising" is §§ 15039–15041.7. |
| DCC compliance hub: "Cannabis products that are attractive to children are prohibited" | https://www.cannabis.ca.gov/licensees/cannaconnect-compliance-hub/cannabis-products-attractive-to-children-prohibited/ | Fetched (HTTP 200); quotes checked against the saved text `web/dcc-attractive.txt`. This is guidance, not regulation. |

Not consulted, all UNVERIFIED: local rules (City of Los Angeles, Culver City, LA County), Proposition 65, federal or FTC
rules, ad-platform policies, the DCC licence search, and the California accessibility case law that bears on the
UserWay decision.

## A. The rules

| # | Topic | Rule (brief quote) | Citation | Applies to the website? |
|---|---|---|---|---|
| A1 | Licence number | "All advertisements and marketing shall accurately and legibly identify the licensee responsible for its content, by adding, at a minimum, the licensee’s license number." | B&P 26151(a)(1) | Treated as yes (an interpretation): every page is advertising (26150(b): "any written or verbal statement, illustration, or depiction which is calculated to induce sales ... in any other media"). |
| A2 | Technology platforms | "A technology platform shall not display an advertisement by a licensee on an Internet Web page unless the advertisement displays the license number of the licensee." Goods offered through a platform "shall disclose, at a minimum, the licensed retailer's ... legal business name and license number." | B&P 26151(a)(2); 4 CCR 15415.1(b)(4)(A) | Yes for the embedded third-party menus (the /location/*/shop routes; this lane did not identify the vendor). UNVERIFIED whether the embeds show the legal name and licence; vendor hosts are not to be requested. |
| A3 | 21+ audience | Digital advertising "shall only be displayed where at least 71.6 percent of the audience is reasonably expected to be 21 years of age or older, as determined by reliable, up-to-date audience composition data." | B&P 26151(b); 4 CCR 15040(a)(1) | Interpretive: whether a licensee's own site counts as "digital communications" placement is UNVERIFIED. |
| A4 | Age affirmation | "Any advertising or marketing involving direct, individualized communication or dialogue controlled by the licensee shall utilize a method of age affirmation ... may include user confirmation, birth date disclosure, or other similar registration method." The regulation adds that it applies before a potential customer is "added to a mailing list, subscribe, or otherwise consent to receiving direct, individualized communication". | B&P 26151(c); 4 CCR 15041(a), (d) | Yes for the /contact form and for any sign-up. A general **site-wide** age gate is NOT expressly required by the provisions read (UNVERIFIED). The existing gate is a "user confirmation" method and sits in front of the contact form. |
| A5 | Encouraging minors | Shall not "advertise or market ... in a manner intended to encourage persons under 21 years of age to consume". | B&P 26152(e) | Yes |
| A6 | Attractive to children | Shall not "publish or disseminate advertising or marketing that is attractive to children." Digital advertising "shall not use any images that are attractive to children, including ... (A) Cartoons; (B) Any likeness to images, characters, or phrases that are popularly used to advertise to children; (C) Any imitation of candy packaging or labeling; or (D) The terms 'candy' or 'candies' or variants in spelling such as 'kandy' or 'kandeez.'" | B&P 26152(f); 4 CCR 15040(a)(3) | Yes |
| A7 | Minors in images | Digital advertising "shall not use any depictions or images of minors or anyone under 21 years of age". DCC guidance: no "images of any person or fictional character under 21". | 4 CCR 15040(a)(2); DCC hub | Yes |
| A8 | DCC "attractive to children" factors (guidance) | Factors that "may increase the likelihood" of appeal to children include "Candy-like shapes", "Bright colors, holographic finishes, or flashy designs", "Mascots, anthropomorphized animals, or fictional characters", "Imagery suggesting luxury lifestyles, parties, or group enjoyment". DCC defines a cartoon (citing Merriam-Webster) as "a simplified or exaggerated illustration or sequence of images used for humor, satire, storytelling, or animation". DCC judges "on a case-by-case basis" and does not pre-approve. | DCC hub | Guidance. The list is framed around "cannabis and cannabis products", but the page names advertising alongside them. Apply it to generated imagery as a precaution. |
| A9 | Health-related statements | A "health-related statement" is "any statement related to health, and includes statements of a curative or therapeutic nature that ... suggest a relationship between the consumption of cannabis ... and health benefits". A licensee shall not publish advertising "containing any health-related statement that is untrue in any particular manner or tends to create a misleading impression as to the effects on health". | B&P 26150(d), 26154 | Yes. For context only: the labelling standard in 4 CCR 17408(a)(3) requires health statements to be "supported by the totality of publicly available scientific evidence". |
| A10 | False or misleading | Shall not advertise "in a manner that is false or untrue in any material particular, or that ... tends to create a misleading impression". "All advertising shall be truthful and appropriately substantiated." | B&P 26152(a); 26151(d) | Yes: hours, delivery availability, promotions, "first licensed", statistics |
| A11 | Origin impressions | Shall not imply "that the cannabis ... originated in a particular place or region, unless the label ... bears an appellation of origin". | B&P 26152(c) | Yes. Do not pair place imagery or names with product claims. |
| A12 | Free cannabis and giveaways | "A licensee shall not give away any amount of cannabis or cannabis products, or any cannabis accessories, as part of a business promotion". Ads "shall not advertise free cannabis goods or cannabis accessories", including "(A) Buy one product, get one product free; ... (C) Contests, sweepstakes, or raffles." "A licensee shall not hold a raffle or sweepstakes as part of a business promotion." | B&P 26153(a); 4 CCR 15040(a)(4), 15040.2 | Yes |
| A13 | Vape disposal statements | Advertising of a cartridge "shall prominently provide in a clear and legible fashion: 'A spent cannabis cartridge shall be properly disposed of as hazardous waste at a household hazardous waste collection facility or other approved facility.'" There is a parallel sentence for integrated vaporizers. Ads "shall not indicate that a cannabis cartridge or an integrated cannabis vaporizer is disposable". Operative July 1, 2024. | B&P 26152.1(a), (b), (c) | Yes: /products/vaporizers-cartridges and every page advertising vapes |
| A14 | Alcohol | Do not market cannabis goods "labeled as beer, wine, liquor, spirits ... that may create a misleading impression that the product is an alcoholic beverage". | 4 CCR 15040.1 | Yes (imagery and copy) |
| A15 | Suspended or unlicensed | Shall not advertise "for unlicensed commercial cannabis activity or for licensed commercial cannabis activity while the licensee’s license is suspended". | B&P 26152(h) | Yes (bears on C5: two stores, one licence number) |
| A16 | Licence per premises | A licence is required "for each separate premises at which commercial cannabis activity is conducted". | 4 CCR 15000.1(a) | Context for C5 |
| A17 | Retail hours | Retailers sell and deliver "only between the hours of 6:00 a.m. Pacific Time and 10:00 p.m. Pacific Time." | 4 CCR 15403 | Context: no hours copy may suggest sales outside that window |
| A18 | Who may buy | Adult-use customers are "at least 21 years of age"; medicinal customers are "at least 18 years of age" with "a valid physician's recommendation". | 4 CCR 15404(a), (b) | Context for C7 |
| A19 | Noncommercial speech | "This chapter does not apply to any noncommercial speech." | B&P 26155(b) | Whether the education pages count as noncommercial on a licensee's selling site is UNVERIFIED. Treat them as advertising. |
| A20 | Required warnings or symbols on a website | In the sections read, the only mandatory advertising text is A13 (vapes) plus the licence number (A1). The government warning and universal symbol are labelling and packaging rules and were not read in full here; whether they apply to web ads is UNVERIFIED. Prop 65 is UNVERIFIED (not consulted). | B&P 26152.1; others UNVERIFIED | |
| A21 | Signs, billboards, highways | B&P 26152(d), (g) and 4 CCR 15040(b) govern signs, billboards and highways. | | Not applicable to the website |

## B. Applying this to the redesign

### B1. REQUIRED elements (build lanes)

1. **Licence number on every page, legible.** Keep "Cannabis License: C10-0000854-LIC" verbatim on all 91 URLs. Do not
   shrink it below body-text legibility, reduce its contrast, or hide it behind a toggle or an animation that starts with
   `opacity: 0`. It must be readable without scrolling effects running, and reduced motion must not hide it. Do NOT add
   a second licence number or assign this one to a store; that is open question Q1.
2. **Age gate in front of all content and the contact form.** Keep the 21+ gate and the store picker as one flow
   (PLAN D3): the same wording, the same `agePass_v2` keys, and content hidden until the gate is passed. It is the
   age-affirmation method for the contact form (A4). Any future newsletter or SMS sign-up needs age affirmation first
   (4 CCR 15041(d)).
3. **Vape disposal statements (A13).** The source shows neither statement on any page (0 of 91 contain "hazardous
   waste"), yet 14 pages describe vape products as "disposable(s)" (list under F-VAPE-1). Adding the statutory sentences is new copy, so it needs
   operator and client approval under PLAN D2. If approved, use the statutory text verbatim, placed prominently near the
   vape content on /products/vaporizers-cartridges and the vape menu routes.
4. **The embedded menus** must keep showing whatever licensee identification the vendor renders. Do not crop, overlay
   or restyle the vendor frame in a way that hides it (A2).

### B2. Generated media (fal, Higgsfield): forbidden and risky

**Forbidden (cited rule):**
- People who are, or could appear to be, under 21. Fictional characters of any age. Safest: no people at all
  (4 CCR 15040(a)(2); DCC hub). A no-people rule also satisfies PLAN rule 4 (no client staff or customers).
- Cartoons, mascots, anthropomorphic leaves, plants or animals, and illustrated characters. **Motion graphics count**:
  DCC's cartoon definition covers "animation". Higgsfield output must stay photographic or abstract (smoke-like light,
  fog, botanical macro, particles), never character animation (15040(a)(3)(A); DCC hub).
- Candy imagery, candy-like shapes, imitation candy or snack packaging, and gummy bears, lollipops, sprinkles or rainbow
  sweets (15040(a)(3)(C); DCC hub). No edibles shown as treats; avoid pictured gummies and chocolates entirely.
- Toys, video-game looks, and references to children's media (15040(a)(3)(B); DCC hub).
- Anything depicting "free" product, gift boxes, prize wheels, raffles or contests (26153; 15040(a)(4)).
- Alcohol cues: wine glasses, beer, cocktails, bottles (15040.1).
- Medical cues that imply a health benefit: pills, syringes, stethoscopes, white coats, medical crosses, before/after
  scenes (26154; 26152(a)).
- Text, logos or brand marks of any company, including other cannabis brands (PLAN rule 4; 26152(a)).
- Pairing place names or recognisable places with product imagery in a way that implies origin (26152(c)).

**Risky (DCC guidance factors; avoid):**
- **"Bright colors, holographic finishes, or flashy designs"**: this collides with a naive "ethereal" look. Avoid
  iridescent or holographic foil, rainbow prisms and neon candy palettes. Keep the ethereal effect in the brand green
  family plus translucent whites, haze, depth blur and soft light.
- **"Imagery suggesting luxury lifestyles, parties, or group enjoyment"**: no party scenes, crowds, yachts, champagne or
  VIP looks.
- Consumption scenes, smoking people, exhaled smoke from a person, and intoxication cues. These are not a cited
  prohibition but are best practice under 26152(e).

**Safe direction (consistent with the rules read):** macro botanicals (trichomes, leaf texture, buds without people),
abstract smoke or light volumes, fog and glass refractions in brand greens, architectural or atmospheric light,
coastline or sky atmosphere with no product claim attached. Each asset carries an AI label (PLAN rule 4).

### B3. Copy constraints for NEW UI microcopy (buttons, labels, alt text, aria labels, loaders)

- No health words: relief, heal, cure, treat or treatment, therapeutic, wellness, pain, anxiety, sleep or insomnia,
  calm (as a benefit), medicine or medicinal (except existing nav labels kept verbatim) (26154).
- No giveaway or contest words: free, giveaway, win, prize, contest, sweepstakes, raffle, spin, BOGO (26153; 15040(a)(4)).
- Never "candy", "candies", "kandy", "kandeez", "treats", "sweets" or "sugar rush" (15040(a)(3)(D)).
- No "disposable" for vape products (26152.1(b)).
- No claims beyond the source: no "best", "#1", "fastest", "lab-tested", "organic", "safe", minutes-to-door, prices,
  hours or delivery terms (26151(d); 26152(a); sr-fabrication).
- No youth-coded slang, emoji-as-mascot or game metaphors ("level up", "unlock", "power-up") (26152(e), (f)).
- Allowed and neutral: "Order Now", "Shop", "See Deals", "Choose your location" (source wording), "Menu", "Close", "Next", "Previous",
  "Back to top", "21+" (as in the source).
- Alt text for generated images describes what is visible (for example: macro of cannabis trichomes in green light). It
  never names an effect or a benefit.

### B4. Existing source content that may itself be risky (findings for the client; NOT edits)

The rebuild carries these verbatim (PLAN D2) unless the operator approves a change. They are listed so the client can decide.
In quotes, " / " marks a line break in the source.

| ID | Risk | Page(s) | Verbatim | Rule |
|---|---|---|---|---|
| F-VAPE-1 | HIGH | 14 pages: /products/vaporizers-cartridges, /products, /weed-delivery, /service-area, /service-area/lax/lax-weed-delivery, /service-area/marina-del-rey-ca, /service-area/marina-del-rey-ca/marina-del-rey-weed-delivery, /service-area/playa-vista-ca/playa-vista-weed-delivery, /service-area/san-pedro/carson-ca, /service-area/san-pedro/rancho-palos-verdes-ca, /service-area/san-pedro/san-pedro-weed-delivery, /service-area/san-pedro/wilmington-ca, /service-area/westchester-ca, /service-area/westchester-ca/westchester-weed-delivery (/products/pre-rolls says "disposable" about pre-rolls, not vapes) | "Our array of cartridges, specialty pods, and disposables cater to ..."; "Disposable pens, cartridges, and pod systems ..."; "Vape Cartridges and Disposables". No page carries the 26152.1(a) statements. | B&P 26152.1(a), (b) |
| F-PROMO-1 | HIGH | /about-us/daily-deals, /location/culver-city | "Spin the Wheel for Prizes" / "Valid at LAX - Culver City". Prizes are not described (UNVERIFIED). | B&P 26153; 4 CCR 15040(a)(4)(C), 15040.2 |
| F-LIC-1 | HIGH (open) | ALL_91 | "Cannabis License: C10-0000854-LIC", one number for two stores | B&P 26151(a)(1), 26152(h); 4 CCR 15000.1(a) |
| F-HEALTH-1 | HIGH | /education/cannabis-101 | "THC (tetrahydrocannabinol) is responsible for the psychoactive effects and is often used for treating symptoms of pain and nausea. CBD (cannabidiol) is non-intoxicating and shows great promise for alleviating pain, inflammation, anxiety, and numerous medical issues." | B&P 26150(d), 26154 |
| F-HEALTH-2 | HIGH | /education/recreational-medicinal | "While you might not be an MMJ cardholder, you can benefit from curative properties." | 26154 |
| F-HEALTH-3 | HIGH | /service-area/playa-vista-ca | "Medicinal patients seeking relief from chronic pain, anxiety, insomnia, or inflammation will find carefully selected products with verified lab testing and clearly labeled potency information." | 26154 |
| F-HEALTH-4 | MEDIUM | /products/topicals | "the cannabinoids are absorbed for localized treatment of soreness, inflammation, pain, and numerous skin issues."; "Find Relief with Our Cannabis Topicals" | 26154 |
| F-HEALTH-5 | MEDIUM | /products/edibles | "From intoxicating to curative properties, recreational to medicinal benefits" | 26154 |
| F-HEALTH-6 | MEDIUM | /service-area/westchester-ca; /service-area; /products | "designed for localized relief from pain, inflammation, and skin conditions without psychoactive effects"; "managing chronic pain, inflammation, and skin conditions."; "seeking relief from discomfort, inflammation, or skin conditions." | 26154 |
| F-HEALTH-7 | LOW–MEDIUM | / and other pages (relief-type wording on 22 pages in total) | "bring medicinal relief" | 26154 |
| F-MOOD-1 | MEDIUM | /location/san-pedro (and the filter URLs ?filters[feelings][]=Pain+Free / =Sleepy, which must keep working) | "I’m feeling / Pain Free / Shop Now Pain free"; "I’m feeling / Sleepy" | 26154 (an effect label presented as a health outcome) |
| F-CANDY-1 | MEDIUM | /products/edibles | "Our selection includes gummies, breath strips, drink mixes, candies, chocolates, baked goods, mints and more" | 4 CCR 15040(a)(3)(D) ("candies" is named) |
| F-CANDY-2 | LOW | /products, /weed-delivery, several service-area pages | edibles called "treats" (e.g. "other infused treats", "Precisely dosed treats") | DCC guidance (edibles resembling candy) |
| F-STAT-1 | LOW–MEDIUM | /weed-delivery; /education; /service-area/playa-vista-ca | "California collected over five billion dollars in cannabis tax revenue in the years following legalization"; "the legal cannabis market is projected to exceed fifty billion dollars in annual revenue"; "California’s legal cannabis market surpassed fourteen billion dollars in cumulative sales since adult-use legalization". All unsourced. | 26151(d), 26152(a) |
| F-FIRST-1 | LOW–MEDIUM | 27 pages | "As the first legal, licensed cannabis dispensary in San Pedro" and variants | 26151(d) (substantiation) |
| F-CLEAN-1 | LOW | /products/flower | "Cleanliness – You can be sure our bud is free of seeds and contaminants" | 26152(a) |
| F-DELIV-1 | LOW–MEDIUM | /products/pre-rolls, /products/vaporizers-cartridges, /education/recreational-medicinal versus / | "coming soon" versus "our delivery runs seven days a week" (C3) | 26152(a) |
| F-HOURS-1 | LOW–MEDIUM | ALL_91 versus /contact | "Open: 10:00 AM - 10:00 PM" versus "10:00 AM-8:00 PM" / "10:00 AM-9:00 PM", and "Coming soon" for LAX (C1, C2) | 26152(a) |
| F-PROMO-2 | LOW | NON_LOCATION_40 | "We Roll Up Rosin Club + Buy any 5 rosin products + Get 25% Off" (no dates, terms or store) | 26151(d), 26152(a) (a discount, not free goods) |
| F-PROMO-3 | LOW | ALL_91 (review) | "First time discount!" inside Jennifer's review; the site does not offer it | 26152(a) if no such discount exists |
| F-MED-1 | LOW | /education/recreational-medicinal | "you need a California MMJ card" (C7; 4 CCR 15404(b) speaks of a physician's recommendation) | 26152(a) |
| F-AGE-1 | LOW | ALL_91 | "Are you over the age of 21?" versus "Yes, I'm 21+" (C9) | wording only |
| F-LIC-2 | MEDIUM (open) | ALL_91 | the legal business name appears nowhere; platform listings must disclose it | 4 CCR 15415.1(b)(4)(A) |

Existing photographs were not reviewed by this lane; that belongs to the images lane, using B2 as the checklist.

### B5. Accessibility statement and UserWay (operator decision)

- **What /accessibility-statement claims, verbatim:** "Date: January 10, 2022"; the site "is designed with the goal of
  conforming to the principles of the World Wide Web Consortium’s Web Content Accessibility Guidelines (WCAG 2.1) 2.1
  Level AA."; the technologies "HTML / WAI-ARIA / CSS / JavaScript"; the features "Keyboard accessibility / Sufficient
  color contrast / Alternative text / Text-zoom"; and "We Roll Up reaches beyond compliance". Contact: "Email: [email]"
  (a placeholder, `mailto:[email]`) and "Physical address: 1705 S Gaffey Street". No phone is given.
- **UserWay:** `<script src="https://cdn.userway.org/widget.js" data-account="LUjnkmg1Ss">` is on all 91 pages. The
  statement does **not** name UserWay or any widget (its only "userway" and "widget" strings are that script tag).
- **Consequence:** removing the widget contradicts no named claim. The statement does promise keyboard access, sufficient
  contrast, alt text and text zoom at a WCAG 2.1 AA goal, so the rebuild itself must deliver those, especially with
  layered, protruding and animated imagery and text over images. If UserWay goes, the statement copy stays verbatim
  (D2), and the placeholder email is still a defect the client should fix. Decision owner: the operator
  (docs/OPEN-DECISIONS.md, PLAN D5). Not legal advice on ADA or Unruh exposure (UNVERIFIED, not researched).

## C. What this lane did not verify

- Whether C10-0000854-LIC is active, which premises it covers, and its A/M designation (the DCC licence search was not
  consulted).
- Whether the site-wide age gate is legally required, as opposed to good practice (A3, A4).
- Whether the Jane or other menu embeds display the legal business name and licence number (vendor host not requested).
- Local (City of LA, Culver City, LA County), Prop 65, federal and ad-platform rules.
- The prizes behind "Spin the Wheel for Prizes", and whether any promotion is still running.
- Whether the health statements are "untrue" or "misleading" (26154) is a scientific and legal judgement for the client.

## D. Open questions for the operator and client

1. **Q1 Licences.** Which premises does C10-0000854-LIC cover? Is LAX - Culver City licensed and open? If yes, what is
   its licence number, and should each number sit beside its store? (C5, F-LIC-1)
2. **Q2 Legal business name.** What is it, and should it appear in the footer next to the licence? (F-LIC-2)
3. **Q3 Hours.** Which schedule is current for each store? (C1, C2)
4. **Q4 Culver City ZIP and phone.** Is the ZIP really "11834"? Is 888-777-6655 the store's number? (C4)
5. **Q5 Delivery.** Is delivery live from both stores? Should the "coming soon" lines go? (C3)
6. **Q6 Promotions.** Which are current? What are the "Spin the Wheel" prizes, and should that promotion be withdrawn?
   (F-PROMO-1, F-PROMO-2)
7. **Q7 Vape copy.** Approve adding the 26152.1 statements, and decide on the word "disposables". (F-VAPE-1)
8. **Q8 Health copy.** Keep, substantiate or withdraw each of F-HEALTH-1 to 7 and F-MOOD-1. Keep "candies"? (F-CANDY-1)
9. **Q9 "Playa Vista".** Is it a former store or service-area name? (C6)
10. **Q10 UserWay.** Keep or remove it, and fix "Email: [email]"? (B5)
11. **Q11 Age gate.** Keep it site-wide (recommended and planned, D3)? Does the client want "21 or older" wording? (C9)
