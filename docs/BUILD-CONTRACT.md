# BUILD CONTRACT: We Roll Up redesign

Orchestrator, 2026-10-13. **DRAFT 1**, written while the design panel (WF2) runs. Section 5 (theme) is completed from
`docs/DESIGN-SPEC.md` once WF2 picks a direction.

Every build agent reads this file first. It fixes:
- who owns which file;
- the interface between the data pipeline and the theme;
- the decisions already taken.

When this file and another doc disagree, this file wins. Report the conflict in your structured output. The rulings
behind section 4 are in `docs/OPEN-DECISIONS.md` (section A), and they are binding.

## 1. Inputs (frozen unless named as yours)

| input | what it is | who may change it |
|---|---|---|
| `audit/raw/*.html`, `audit/*.json`, `audit/capture/*`, `audit/screens/source/*`, `audit/refetch-2026-10-13.json` | the crawl and the live capture (the evidence) | nobody |
| `docs/PLAN.md`, `docs/OPEN-DECISIONS.md`, `docs/SITE-ARCHITECTURE.md`, `docs/CONTENT-MODEL.md`, `docs/BRAND-SYSTEM.md`, `docs/IMAGE-INVENTORY.md`, `docs/COMPLIANCE.md`, `docs/COMMERCE.md`, `docs/FACTS-EVIDENCE.md`, `docs/data/*.json`, `facts/client-facts.json` | the understanding of the source | orchestrator only |
| `docs/DESIGN-SPEC.md`, `tmp/panel/winner/` | the chosen design and its reference prototype (after WF2) | nobody (read) |
| `assets/source/*` | the client's own images, as harvested | nobody |

## 2. Ownership (one writer per file)

| owner | files |
|---|---|
| PIPELINE | `src/build.mjs`; `src/lib/**`; `src/theme-stub/**`; `src/content/**` except `image-plan.json`; `tools/link-check.mjs`, `tools/build-check.mjs`, `tools/text-parity.mjs`, `tools/route-check.mjs`; `dist/**` (generated only); `assets/optimized/**` (the image cache); `assets/fonts/**` (open-licence faces only); `docs/PIPELINE-CONTENT.md`, `docs/PIPELINE-SITE.md` |
| THEME (after WF2) | `src/theme/**`, `src/styles/**`, `src/scripts/**`, `assets/brand/**` |
| IMAGERY (after WF2) | `assets/generated/**`, `audit/generated-images.json`, `src/content/image-plan.json`, `docs/IMAGERY.md` |
| VERIFIERS | their own `tmp/<role>/` only |
| ORCHESTRATOR | `docs/BUILD-CONTRACT.md`, `docs/OPEN-DECISIONS.md`, `docs/PLAN.md`, `docs/CHANGE-LOG.md` (rendered by `tools/render-changelog.mjs` from `src/content/changes.json`), `tools/secret-scan.mjs`, `tools/secret-allow.json`, `tools/render-changelog.mjs` |

- Scratch work goes under `tmp/<your-role>/`.
- No git commits, no publishing, no memory writes (lessons go in your structured output).
- Network: none at all. Never request werollup.com or any vendor host.

## 3. Interfaces

### 3.1 Build

- `node src/build.mjs` (run from the workspace root) writes `dist/` and exits 0. It accepts:
  - `--out <dir>` to build elsewhere;
  - `--cache <dir>` to move the image cache, so a verifier never writes PIPELINE's `assets/optimized/`. (Lesson: on
    Academy Vision a hard-wired cache path stopped every verifier from building.)
  - `--theme stub|real`: the default is `real` when `src/theme/index.mjs` exists, otherwise `stub`.
- Two consecutive builds are byte-identical: no timestamps and no random ids. The build date is a constant in
  `src/lib/site.mjs`. `tools/hashdir.mjs` proves it.
- The build fails (exit 1) on:
  - a dead internal link or asset;
  - an unknown block type;
  - a duplicate output path;
  - a page without exactly one `<h1>`;
  - platform or tracking residue in the output. That means `wp-content`, `wp-includes`, `wp-json`, `wp-admin`,
    `wp-emoji`, `gform`, `gravityforms`, `basebuildv3`, `rangemarketing`, `googletagmanager`, `G-148QKPF1CL`,
    `GTM-T4RHQDB`, `stackadapt`, `userway`, and Webflow-looking classes (`w-row`, `w-container`, `w-col`, `w-nav`,
    `w-slider`). The only exceptions are vendor-embed strings allowlisted in `src/lib/policy.mjs` with a reason each.

### 3.2 Theme module (`src/theme/index.mjs`)

```js
export const styles = ['tokens.css', 'base.css' /* ... */];   // src/styles files, concatenated in this order
export const scripts = ['site.js' /* ... */];                  // src/scripts files, concatenated in this order
export function renderPage(page, ctx) { /* -> complete HTML document string */ }
export function render404(ctx) { /* -> complete HTML document string */ }
```

Until `src/theme/index.mjs` exists, the pipeline renders with `src/theme-stub/index.mjs`. The stub is plain semantic
HTML with the same signature, so both tracks can work at once.

### 3.3 `page` and `ctx`

This is the orchestrator's draft. PIPELINE refines it and documents the final shapes in `docs/PIPELINE-CONTENT.md` and
`docs/PIPELINE-SITE.md`, which the theme reads as the source of truth.

`page`, built by the pipeline (one per output path):

```js
{
  kind,            // template: home, page, products-hub, product-category, education, service-area-hub,
                   //   service-area-town, delivery, location, shop, lax-menu, review, legal, contact,
                   //   archive-author, archive-taxonomy (CONTENT-MODEL.md templates; ARCH templates crosswalked)
  path,            // output path with leading and trailing slash ('/' = home), equal to the source path
  sourceUrl,       // the live URL it came from
  store,           // 'culver-city' | 'san-pedro' | null (store context; drives the menu family and strips)
  menuFamily,      // 'primary' | 'lax-culver-city' | 'san-pedro' (SITE-ARCHITECTURE.md: three header menus)
  subheader,       // 'marquee' | 'shopping-strip' (the 40 global pages vs the 51 store pages)
  title, metaDescription, canonical, robots, og: { ... },   // section 4.9
  h1,              // the single H1 text (A16: store pages promote their visible title)
  breadcrumbs: [{ label, href }],        // verbatim where the source has them
  sections: [ { id, kind, heading, level, blocks: [ /* block types: docs/PIPELINE-CONTENT.md */ ] } ],
  embed,           // { provider: 'jane' | 'weedmaps', head, body } on shop pages and /lax-menu, else null (4.6)
  form,            // the contact form model (4.7), else null
  maps: [ ... ],   // Google Maps iframes kept as the source has them (4.8)
  headerArt,       // { ref, source: 'page' | 'default' } = the live page-header image (the theme may replace it)
  generated,       // { hero?, art?: [] } image-plan slots for this page (IMAGERY fills these after WF2)
}
```

`ctx`, built once by the pipeline:

```js
{
  site: {
    name: 'We Roll Up', origin: 'https://werollup.com',
    licence: 'Cannabis License: C10-0000854-LIC',
    stores: [ { id, name, addressLines, phone: { display, href }, hoursLine, storePath, shopPath, reviewLinks } ],
    socials: [ ... ],                    // verbatim, from facts/client-facts.json and the raw chrome
  },
  nav: { primary, laxCulverCity, sanPedro },   // the three menu trees, labels and hrefs verbatim (A8 corrections applied)
  topBar, marquee, shoppingStrip, footer,
  ageGate, locationChooser,              // verbatim strings (A6)
  reviews: [ ... ],                      // the 5 reviews, verbatim, in a fixed order (A2)
  zipFinder: { sanPedro: [], culverCity: [], strings: { ... } },   // the arrays exactly as the source has them
  url(path), img(ref, opts), imgSrc(ref, width), asset(name),
  buildDate, pagesByPath,
}
```

`ctx.img(ref, { alt, sizes, cls, loading, fetchpriority, decoding, widths })` returns an `<img>` with:
- a WebP `srcset` (widths never above the intrinsic size);
- `width` and `height`.

`ref` is a local file under `assets/source/`, `assets/generated/` or `assets/brand/`, or an image-plan slot id. A
missing generated slot renders a styled empty frame with `data-slot`, never a broken `<img>`.

## 4. Decisions already taken (the A rulings, made operational)

### 4.1 Routes
- The crawl holds 91 page records with status 200. They resolve to **54 distinct paths**, because 37 records are
  query-string variants of the two shop pages and a query needs no file. Each of the 54 paths gets
  `dist/<path>/index.html` (measured 2026-10-13 from `audit/site-inventory.json`).
- The 54 include the 8 San Pedro `/shop/menu/<cat>/` paths. Each one is a served copy of the San Pedro shop page, with
  the same Jane block.
- `404.html` boots the Jane embed when the path starts with `/location/san-pedro/shop/menu/`; anywhere else it is a
  normal 404.
- The 14 aliases in `audit/site-inventory.json` (`pages[].aliases`) each get:
  - a redirect stub (`dist/<alias>/index.html`: meta refresh 0, canonical and a link);
  - a line in `dist/_redirects` (Netlify/Cloudflare syntax, 301).
- The slash-less forms 301 to the trailing-slash form in `_redirects`.
- `tools/route-check.mjs` proves:
  - 54/54 paths, and that all 91 page records resolve to a served file;
  - 14/14 alias stubs;
  - the 8 menu paths;
  - the 404.

### 4.2 Copy and parity
- Every visible word is carried verbatim. That covers the main content, the reviews carousel (outside `<main>` on all
  91 pages) and the chrome.
- `tools/text-parity.mjs` compares the BUILT pages in `dist/` with the source (word sequence in DOM order, per page,
  plus chrome). It runs with positive controls that must fail:
  - one word changed;
  - two sentences swapped;
  - a sentence dropped.
- Exceptions live in `src/content/parity-exceptions.json`, one entry each, with its evidence:
  - the designer brief inside an `<iframe>` on the Culver City delivery page (never rendered live);
  - the doubled h2 (A7);
  - the wp-admin edit link on /products (A7);
  - review order (A2, compared as a set).
- Text that only `main.js` copied into the DOM (the top-bar address and hours from `data-*` attributes) counts as
  chrome text.

### 4.3 Links
- The A8 corrections, logged in `docs/CHANGE-LOG.md` with the evidence:
  - the San Pedro "Order Vaporizers & Cartridges" item now points to
    `/location/san-pedro/shop/?filters[root_types][]=vape` (80 links on 40 pages);
  - "Edibles and Gummies" now points to `/products/edibles/`.
- Every other href stays as the source has it, external links included. Internal hrefs are normalised to the
  trailing-slash output path.

### 4.4 Age gate (A6)
- One script.
- **Passed** if any of these holds:
  - `localStorage agePass_v2 === 'true'`;
  - sessionStorage holds the same;
  - the cookie `agePass_v2=true` is set.
- **On pass:** set localStorage and the cookie (`max-age=31536000; path=/; SameSite=Lax`, plus `Secure` on https).
- **Flow:**
  - "Yes" reveals the store list;
  - choosing a store sets the pass and navigates to that store PAGE;
  - "No" shows the denied text.
- The gate shows on a first visit, cannot be dismissed with Escape or a backdrop click (as on the source), traps focus,
  and keeps the page `inert` behind it.
- Strings are verbatim.

### 4.5 Store switcher and Order Now
As on the source (`assets/js/4c0935fa-main.js` module 343):
- **Storage:** the cookie `selected_location` (`culver-city` | `san-pedro`, 30 days).
- **Changing the store:**
  - rewrites the top-bar address and hours;
  - rewrites the `.active-location-menu` hrefs to the selected store's menu URL;
  - navigates to the store page.
- **On load:** the store comes from the URL path first, then from the cookie.
- **Order Now** goes to the selected store, else the cookie's store, else opens the store chooser.
- **"Choose location" buttons** always open the chooser.

### 4.6 Shop embeds (A13)
- The Jane block (San Pedro, 28 pages) and the Weedmaps WM Store script (Culver City, 19 records, plus `/lax-menu`)
  are carried byte-identical to the source spans cited in `docs/COMMERCE.md`, minus the StackAdapt script.
- The Jane block's Source Sans Pro stylesheet link is repointed to a LOCAL stylesheet (Source Sans Pro is OFL and is
  in `assets/fonts/`).
- No CSP and no sandbox on shop pages.
- The embed container is full-width, with no transforms, filters, glass or overlays on it or its ancestors.

### 4.7 Contact form (A12)
- Fields, labels, required marks and the "Send" label are verbatim.
- `method="post"` to the placeholder action `/__form-endpoint-not-configured__` (documented in `docs/DEPLOY.md`
  later).
- The submit button starts `disabled`, with a visible note.
- reCAPTCHA is dropped.

### 4.8 Third-party runtime (A15, A11)
- Stripped: GA4, GTM, StackAdapt, the WordPress emoji loader, UserWay, and the Range Marketing credit.
- Kept as functional embeds: the two Google Maps iframes, exactly as the source places them.

### 4.9 SEO head (A16, A17)
- Every page:
  - keeps its title as the source has it;
  - has exactly one h1;
  - gets a meta description: a verbatim excerpt of its own first content paragraph, at most about 155 characters,
    cut at a word boundary.
- Canonicals:
  - stay as the source has them (San Pedro shop variants self-canonical, Culver City variants canonical to the base);
  - archives get self-canonicals.
- `og:image` is a valid absolute URL of a real image on that page (otherwise the home hero image).
- `robots.txt` and `sitemap.xml` are emitted. **Ruling (2026-10-13, commit d47352c 13:26):** the sitemap lists the **54 served
  paths**. The 37 query-string variants are not separate documents, and B14 decides their indexing.
- **Ruling on meta descriptions:** 19 pages have no content paragraph. 18 of them use their h1 as the verbatim
  description; the author archive uses its visible notice. This is accepted as documented in PIPELINE-CONTENT, and
  revisited when B14 decides whether those pages stay indexable.
- No JSON-LD hours or postal code while B1 and B3 are open.

### 4.10 Images
- Real photos are WebP-encoded with `cwebp -metadata none`, never upscaled. Every `<img>` has `width`, `height` and
  `sizes` matching its rendered width (for a cover crop, the painted width).
- Generated images carry the IPTC trainedAlgorithmicMedia XMP label (`tools/ai-label.mjs`) on EVERY served variant.
  No served file may be byte-identical to an unlabelled generated still.
- Platform UI images are not shipped: the Gravity Forms sprites, the spinner and the lazy-load gif.

### 4.11 Fonts
Local woff2 only. The kit's `fonts/` folder has the files for:
- Libre Franklin (variable);
- Source Sans Pro (for the Jane block);
- the display face DESIGN-SPEC names (open licence).

Helvetica Neue Condensed and Agrandir never ship (A3).

### 4.12 Performance
- Home at 1280x585 is at most 1.5 MB before any scroll, a hero loop excluded.
- CLS 0.
- No render-blocking third-party code.
- Scripts are deferred.
- Motion uses transform and opacity only.

### 4.13 Accessibility
WCAG 2.1 AA (the accessibility statement's own claims):
- keyboard access;
- visible focus;
- AA contrast on painted pixels;
- alt text;
- text zoom;
- `prefers-reduced-motion` honoured.

### 4.14 Secrets
`tools/secret-scan.mjs` runs on `dist/` and on every package or preview:
- with the fal and Higgsfield keys read from the session scratchpad;
- with a positive control.

Jane's public client keys inside `#jane-app-secrets` are allowlisted by exact match, on the San Pedro shop pages only.

**Implemented 2026-10-13 (commit d47352c, 13:26).** `tools/secret-allow.json` lists sha256 hashes, never the strings. A match is
allowed only when all of these hold:
- the hash matches;
- the path matches `^(dist/)?location/san-pedro/shop/` or `^src/content/pages/location-san-pedro-shop`;
- the match lies inside `<script id="jane-app-secrets">`.

`--control` proves the same key is still a hit outside the element, on another path, or as a different key. Results:
- `dist/`: 0 hits, 18 allowlisted matches.
- Publish set: 0 hits, 36 allowlisted matches.
- WF1's evidence copy in `docs/data/commerce.json` was redacted, so only hash prefixes remain.

### 4.15 Network
- The build and every check make no network requests.
- Browser checks run through `tools/cdp.mjs`, whose guard resolves only localhost.

## 5. Theme contract (WF3b; orchestrator, after WF2)

The design is `docs/DESIGN-SPEC.md`, "Green Aura, dusk edit": the prototype `tmp/panel/winner/` plus required deltas
D-1 to D-26, with acceptance requirements R-1 to R-50 in its section 12. The winner was chosen on a three-way judge
split by the summed-score tie-break (B 196, C 192, A 188). The operator may still redirect, so build what the spec says
and keep the lanes' work modular.

### 5.1 Lanes and ownership (one writer per file)

| lane | phase | files |
|---|---|---|
| FOUNDATION | 1 | `src/theme/index.mjs`, `src/theme/shell.mjs`, `src/theme/chrome.mjs`, `src/theme/parts.mjs`, `src/theme/blocks.mjs`; `src/styles/{tokens,base,glass,depth,motion,chrome,blocks,forms}.css`; `src/scripts/site.js`; `assets/brand/**`; `docs/THEME.md` |
| IMAGERY | 1 | `assets/generated/**`, `audit/generated-images.json`, `src/content/image-plan.json`, `docs/IMAGERY.md` |
| PIPELINE-MAINT | 1 | the PIPELINE files of section 2 (the display face, video serving, the image-plan shape) |
| HOME | 2 | `src/theme/home.mjs`, `src/styles/home.css`, `src/scripts/home.js` |
| TEMPLATES-A | 2 | `src/theme/templates-a.mjs`, `src/styles/pages-a.css`, `src/scripts/pages-a.js`. Kinds: page (about-us, daily deals and the other standard pages), products-hub, product-category, education, legal, contact, delivery, archive-author, archive-taxonomy, review, and the 404 |
| TEMPLATES-B | 2 | `src/theme/templates-b.mjs`, `src/styles/pages-b.css`, `src/scripts/pages-b.js`. Kinds: location (the store pages), shop, lax-menu, service-area-hub, service-area-town |
| INTEGRATOR | 3 | may edit any file, recording every cross-owner edit in `docs/THEME.md`, section "integration edits" |

FOUNDATION creates the phase-2 files as working placeholders (a module that returns `null`, so the default renderer is
used; empty CSS and JS), and ownership passes with them.

### 5.2 Interfaces (FOUNDATION defines them in `docs/THEME.md`; phase-2 lanes code against that doc)

- `index.mjs` exports `styles` and `scripts` in a fixed order. The phase-2 files come after the foundation files.
- `index.mjs` exports `renderPage(page, ctx)` and `render404(ctx)`. It dispatches on `page.kind` to the owning module.
- **Robust loading.** `index.mjs` loads `home.mjs`, `templates-a.mjs` and `templates-b.mjs` with dynamic `import()`
  inside try/catch. On failure it logs `THEME MODULE <name> FAILED: <error>` and falls back to the foundation default
  renderer, so one lane's half-finished file never breaks the other lanes' builds. With `THEME_STRICT=1` a load
  failure or a fallback is fatal; the integrator and every final build use it.
- Shared primitives (`parts.mjs`) and block renderers (`blocks.mjs`) are the only way templates draw common things:
  - buttons and CTAs, the page banner (6.16), the reading card (6.19), the light box (5.2), card shells, the section
    band with its ground (calm or atmosphere);
  - every block type in `docs/PIPELINE-CONTENT.md`.
  A lane that needs a variant asks through its structured output, or adds a local class in its own CSS.
- CSS uses the token names of DESIGN-SPEC section 3 only. No literal colours outside `tokens.css`; this keeps gate C13
  honest.
- The chrome keeps every source `data-*` value that the switcher and Order Now read (section 4.5 and the build-check
  data-attr gate), and every chrome text, label and href (the parity and href gates).

### 5.3 Builds while lanes work in parallel

- Each lane builds into its own folders:
  `node src/build.mjs --out tmp/<role>/dist --cache tmp/<role>/cache`. Seed the cache once with a copy of
  `assets/optimized/`.
- Each lane serves its own port: FOUNDATION 8841, HOME 8842, TEMPLATES-A 8843, TEMPLATES-B 8844, IMAGERY 8845,
  INTEGRATOR 8846.
- `dist/` is written only by the INTEGRATOR, and only with `THEME_STRICT=1`.

### 5.4 What every lane checks before it reports

- The full gate suite passes on its own build:
  - link-check, route-check, build-check and text-parity, each with `--control`;
  - the secret scan;
  - `THEME_STRICT=1` for its own modules.
- The spec R-tests that its templates own pass at the operator windows: 1280x585 @1.5 and 1600x662 @1.2 with a real
  15px scrollbar, and 390x844 @3. Use `tools/shots-dpr.mjs` and `tools/qa-probe.mjs`.
- It looks at its own first screens and full pages before it finishes.

## 5a. State after WF3a (pipeline), 2026-10-13 (commit d47352c, 13:26)

- The pipeline is built and verified twice: run wf_72dd7daf-789, a builder, verifier 1, a fixer, verifier 2.
  - `node src/build.mjs` (stub theme): 54 pages, 14 aliases, 288 files.
  - The build is deterministic: aggregate `4a43f879...` identical from an empty cache and a warm one.
  - link-check, route-check, build-check (now also gating the embed bytes, the href multiset, meta descriptions and
    platform images by content) and text-parity (91/91 in 9 regions) all pass, and every control fires.
  - The shapes, as built, are in `docs/PIPELINE-CONTENT.md` and `docs/PIPELINE-SITE.md`. THEME reads those.
- **PIPELINE MAINTENANCE work for WF3b** (the PIPELINE owner, or the integrator with the edit recorded):
  1. ~~Gate the store-switcher and Order Now `data-*` attributes against the source.~~ **DONE by the orchestrator**
     (cross-owner edit, recorded here). `tools/build-check.mjs` `checkDataAttrs` compares, per page, the multiset of
     `data-address`, `data-hours`, `data-menu-url`, `data-directions-url`, `data-lax-url` and `data-sanpedro-url`
     values with the source, normalising URLs like hrefs.
     - Result: 54/54 pages, 0 findings.
     - Controls: a changed data-hours, a changed data-address, a re-pointed data-menu-url, a re-pointed
       data-sanpedro-url and a changed directions cid are each reported.
     - THEME must keep these attributes with their source values wherever it renders the switcher and Order Now.
  2. Register the display face DESIGN-SPEC names: its woff2 goes in `assets/fonts/`, and its pattern in `FONT_OK`.
  3. Agree the `image-plan.json` shape with IMAGERY: the pipeline currently reads
     `{ slots: { id: { file, alt, role, pages } } }`.

## 6. Lane definition of done

- **PIPELINE (with the stub theme):**
  - the build exits 0, and a second build is byte-identical (`tools/hashdir.mjs`);
  - `tools/link-check.mjs` finds 0 dead links;
  - `tools/route-check.mjs` is complete;
  - text parity on `dist/` is 100% outside the declared exceptions, with every control firing;
  - the residue scan finds 0, with a planted control caught.
- **THEME and IMAGERY:** as DESIGN-SPEC section 12 (R-tests) defines.
