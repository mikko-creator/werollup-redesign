# PIPELINE-SITE: build, routes, ctx, images, policy, SEO and checks

PIPELINE lane (WF3a), 2026-10-13; WF3b maintenance (PIPELINE-MAINT, 14:05-15:05: the display face, video slots, the
image-plan shape). Companion of `docs/PIPELINE-CONTENT.md` (the content model). Everything here is what the code does
today; every number was measured by the commands in section 7.

## 1. Commands

| command | does | exit 1 when |
|---|---|---|
| `node src/lib/extract.mjs` | `audit/raw` -> `src/content/**` (54 pages, chrome, routes, changes, parity exceptions) | the source breaks an assumption (unknown image URL, a menu family that differs between pages, no `<main>`, a page left without exactly one h1) |
| `node src/lib/extract.mjs --check` | compares a fresh extraction with `src/content/**` | any file is out of date |
| `node src/build.mjs [--out <dir>] [--cache <dir>] [--theme stub\|real]` | `src/content/**` + a theme -> a static site | see below |

Build options (BUILD-CONTRACT 3.1):
- `--out <dir>` (default `dist/`). The directory is deleted and rewritten. Refused for the workspace root, `src/`,
  `assets/`, `audit/`, `docs/`, `tools/`, `facts/`, `presets/`, `tmp/` themselves, anything inside `src/`, `assets/`,
  `audit/`, and any parent of the workspace.
- `--cache <dir>` (default `assets/optimized/`): the WebP variant cache. Verifiers pass their own `tmp/<role>/cache`.
  The cache is a pure speed-up: a build with an empty cache is byte-identical to a cached one (measured: section 7).
- `--theme stub|real`: `stub` = `src/theme-stub/index.mjs`, `real` = `src/theme/index.mjs`. Default `real` when that
  file exists, else `stub`.

The build exits 1 (and prints every reason) on: content out of date with `audit/raw` (the same comparison as
`extract.mjs --check`, through the same code, `staleContent()` in `src/lib/extract.mjs`: every file extraction writes,
byte for byte (the 54 page models, `_index.json`, `chrome.json`, `routes.json`, `changes.json`,
`parity-exceptions.json`), and no extra file in `src/content/pages/`); an unknown block type; a duplicate output path
(pages, alias stubs, assets); a theme that lacks `renderPage`/`render404` or throws; an image ref that does not
resolve or a platform UI image (`ctx.img`, `ctx.imgSrc` and the og:image lookup throw, section 5); a page whose HTML
does not hold exactly one `<h1`; a page without the licence line; a failed or missing image variant; a residue pattern in any
text output (section 6); a dead internal link or asset in any HTML output (href, src, poster, srcset, action, data-*-url,
own-origin meta content); a platform UI image in the output, found by CONTENT (an output name that starts with the
sha12 of one of the 6 platform source files, or an output file byte-identical to one; output image names are content
hashes, so a name test cannot work); a never-ship font in the output; no display face, or a display face without its
`.LICENSE.txt` (section 2); a malformed video slot in `image-plan.json`, a served loop file without the AI label, and,
under `THEME_STRICT=1` only, a partly generated video slot (section 5.1). It makes no network request.

Determinism: no clock, no randomness, fixed iteration orders, content-hashed asset names, `BUILD_DATE = '2026-10-13'`
in `src/lib/site.mjs`. `cwebp -metadata none` output is byte-stable (an empty-cache build matched a cached one).

## 2. Output (`dist/`, 291 files with the stub theme and no image plan; measured 2026-10-13 14:18)

| path | what |
|---|---|
| `<path>/index.html` | 54 pages (`index.html` for `/`) |
| `<alias>/index.html` | 14 redirect stubs: `<meta http-equiv="refresh" content="0; url=<target>">`, `<link rel="canonical" href="https://werollup.com<target>">`, `<meta name="robots" content="noindex">`, a link to the target |
| `404.html` | normal 404; boots the Jane embed under `/location/san-pedro/shop/menu/` (section 3) |
| `_redirects` | Netlify / Cloudflare Pages syntax: 14 aliases x 2 forms (slashless and slash) + 53 slash redirects, all 301 |
| `robots.txt`, `sitemap.xml` | section 6 |
| `assets/site.<sha10>.css`, `assets/site.<sha10>.js` | the theme's `styles` / `scripts` concatenated in list order (`/* <file> */` header per file); the js bundle only when scripts exist |
| `assets/img/<sha12>-<w>.webp` (`-ai.webp` for generated) | image variants (section 5) |
| `assets/video/<sha12>-ai.<mp4\|webm>` | the loop files of the video slots the theme renders through `ctx.video` (section 5.1), byte-identical copies of the labelled sources; none until IMAGERY declares and generates loops |
| `assets/fonts/*.woff2`, `assets/fonts/libre-franklin.css`, `assets/fonts/source-sans-pro.css` | Libre Franklin (4 files) and Source Sans Pro (24 files); the two `@font-face` sheets are the harvested OMGF sheets with their URLs pointed at `/assets/fonts/` |
| `assets/fonts/bricolage-grotesque-latin.woff2`, `.LICENSE.txt`, `assets/fonts/bricolage-grotesque.css` | the display face (DESIGN-SPEC 3.2, D-8): Bricolage Grotesque, Latin subset, axes pinned `wdth=100,opsz=96`, `wght` 200-800 variable, 46,868 B; its SIL OFL 1.1 text (the subset's name table keeps the copyright line, not the licence); and a sheet the pipeline writes: one `@font-face` (`'Bricolage Grotesque'`, `font-weight: 200 800`, `font-display: block`, the Latin `unicode-range`). Section 7, "Fonts" |
| `assets/favicon.png` | the site icon (150 px, from `assets/source/8bd84cc3-cropped-favicon-1-150x150.png`) |

## 3. Routes (BUILD-CONTRACT 4.1; data: `src/content/routes.json`)

- 91 page records (status 200) -> 54 distinct paths; 37 query-string records (18 Culver City, 19 San Pedro) need no file:
  the static host ignores the query and the vendor embed reads `location.search`.
- `routes.json`: `{ schema, origin, counts { records 91, paths 54, variants 37, aliases 14, menuPaths 8 }, paths: [{ path,
  slug, kind, sourceUrl, rawFile, out, canonical, variants: [{ query, sourceUrl, rawFile, canonical }] }], menuPaths: [8],
  aliases: [{ from, fromQuery, sourceUrl, to, stub }], slashRedirects: [{ from, to }], notFound: { file, janeBootPrefix,
  knownDead } }`. Per-variant canonicals are recorded as the source has them (San Pedro self, Culver City base); one
  static file can only emit its base canonical.
- The 8 San Pedro `/shop/menu/<cat>/` paths (edible, extract, flower, gear, jane-gold, pre-roll, topical, vape) are
  served copies of the San Pedro shop page (same Jane block; own canonical from the source).
- Aliases (stubs + `_redirects`): `/home/ -> /`, `/daily-deals/ -> /about-us/daily-deals/`, `/shop/` and
  `/shop-playa-vista/` (its source query is dropped, as live) `-> /location/culver-city/shop/`, `/san-pedro/`,
  `/concentrates/`, `/edibles-gummies/ -> /products/edibles/`, `/flower/`, `/pre-rolls/`, `/topicals/`,
  `/vaporizers-cartridges/`, `/culver-city/`, `/culver-city/culver-city-delivery-and-pickup/`, `/lax/`.
- `404.html`: under `/location/san-pedro/shop/menu/` an inline script fetches `/location/san-pedro/shop/` (same origin),
  inserts that page's Jane head block (between its plugin comments) with `createContextualFragment` so its scripts run,
  and marks `<html class="jane-boot">` (the stub hides its "Page not found" text then); the Jane mount is static in
  404.html. Elsewhere it is a normal 404. The Jane client keys therefore stay on the 9 San Pedro shop pages only (4.14).
  UNVERIFIED in a browser (no browser in this lane; Jane cannot be proven away from werollup.com, B13).
- `_redirects` caveat (UNVERIFIED, host question B12): Netlify matches rules with or without a trailing slash, so the
  slash rules (`/about-us /about-us/ 301`) may loop there; Cloudflare Pages already redirects `/x` to `/x/` for
  `x/index.html`. The rules follow BUILD-CONTRACT 4.1 as written; review them when the host is chosen.
- The crawl's dead URL `/products/edibles-gummies` is not served (live 404); its only link was corrected (A8).

## 4. The theme module and `ctx`

```js
// src/theme/index.mjs (THEME) - same signature as src/theme-stub/index.mjs
export const styles = ['tokens.css', ...];   // files in stylesDir, concatenated in this order
export const scripts = ['site.js', ...];     // files in scriptsDir, concatenated in this order (may be [])
export const stylesDir = 'src/styles';       // optional, default 'src/styles'
export const scriptsDir = 'src/scripts';     // optional, default 'src/scripts'
export function renderPage(page, ctx) {}     // -> complete HTML document string
export function render404(ctx) {}            // -> complete HTML document string
```

`ctx` (built once by `src/build.mjs`):

| field | value |
|---|---|
| `site` | `{ name 'We Roll Up', origin 'https://werollup.com', licence 'Cannabis License: C10-0000854-LIC', stores: [{ id, name, addressLines, phone { display, href }, hoursLine, storePath, shopPath, reviewLinks, directions }], socials: [{ label, href }] }` (stores in top-bar option order: culver-city, san-pedro; values verbatim from chrome) |
| `nav` | `{ primary, laxCulverCity, sanPedro }` menu trees (PIPELINE-CONTENT 6). Pick with `page.menuFamily`: `primary`, `lax-culver-city`, `san-pedro` |
| `header`, `topBar`, `marquee`, `shoppingStrip`, `offcanvas`, `footer`, `ageGate`, `locationChooser`, `reviews`, `zipFinder` | the chrome objects (PIPELINE-CONTENT 6) |
| `url(path)` | identity today (root-absolute paths); use it for every internal href you build so a sub-path preview can be added in one place |
| `img(ref, opts)` | section 5 |
| `imgSrc(ref, width)` | URL of the largest variant not wider than `width` (for CSS backgrounds). null only for a slot declared in `image-plan.json` whose file does not exist yet; any other unresolved ref (an undeclared slot id, a typo, a missing local file) throws, and so does a platform UI image |
| `video(slotId, { posterWidth = 1920 })` | for a slot of kind `"video"` (section 5.1): `{ slot, alt, mp4, webm, mp4Phone, webmPhone, poster, posterSrcset, width, height }`, or null while the loop is not generated. Throws for an undeclared slot, a still slot, a malformed declaration, an unlabelled loop file |
| `asset(name)` | `'site.css'`, `'site.js'` (null when there are no scripts), `'fonts/libre-franklin.css'`, `'fonts/source-sans-pro.css'`, `'fonts/bricolage-grotesque.css'`, `'fonts/<file>.woff2'` for every shipped woff2 (for `<link rel="preload" as="font" type="font/woff2" crossorigin>`: R-39 preloads `fonts/libre-franklin-normal-latin.woff2` and `fonts/bricolage-grotesque-latin.woff2`), `'favicon.png'`; any other name throws |
| `seoHead(page)` | the SEO head tags (section 6). Every page must include it |
| `buildDate` | `'2026-10-13'` |
| `pagesByPath` | `{ '/about-us/': page, ... }` (54) |
| `notFound` | `{ janeBootPrefix, janeShopPath, janeBody, bootScript }`: put `bootScript` in the 404 `<head>` and `janeBody` (the Jane mount span) in the 404 `<main>` |

`page.embed.head` (Jane) must be inserted in `<head>` of the San Pedro shop pages; `page.embed.body` where the `embed`
block sits (inside `[data-parity=main]`). The Weedmaps tag is the `embed` block's `html` (inside main). Each exactly
once and unmodified: `tools/build-check.mjs` compares them byte for byte with the `audit/raw` spans (section 7).

## 5. Images (BUILD-CONTRACT 3.3, 4.10)

- `ref`: a local file under `assets/source/`, `assets/generated/` or `assets/brand/`, or an image-plan slot id. Live
  URLs found in the source were already resolved to `assets/source/` files by the extractor (`ImageRef.ref`). The URL
  index is `docs/data/images.json` (url -> file) plus `audit/refetch-2026-10-13.json` (the 8 headers fetched by A1).
- `ctx.img(ref, { alt, sizes = '100vw', cls, loading = 'lazy', fetchpriority, decoding = 'async', widths, attrs })`
  returns `<img src srcset sizes width height alt class loading decoding [fetchpriority] [attrs]>`:
  - `srcset`: WebP variants at the candidate widths `[160, 320, 480, 640, 960, 1280, 1600, 1920]` (or `widths`) that
    are below the intrinsic width, plus the intrinsic width itself: never upscaled.
  - `width`/`height`: the intrinsic size (reserves the aspect ratio; set the rendered size in CSS). `sizes` must match
    the rendered width (for a cover crop, the painted width): pass it.
  - `alt` is required; pass `alt: ''` only for decorative images AND add `attrs: { 'data-decorative': '' }`
    (tools/build-check.mjs fails an empty alt without the marker).
  - A slot DECLARED in `image-plan.json` whose file does not exist yet renders `<div class="img-slot" data-slot="<id>"
    role="img" aria-label="<alt>"></div>`: style it as a frame; never a broken `<img>`. Any other ref that does not
    resolve throws and fails the build: an undeclared slot id, a typo or wrong-case prefix (`Assets/brand/x.png`), a
    missing local file.
- Variants: `cwebp -quiet -q 80 -alpha_q 90 -m 4 -metadata none [-resize <w> 0] <src> -o <cache>`; cached as
  `<sha12>-<w>-q80a90m4[-xmp<sha8>].webp`, published as `dist/assets/img/<sha12>-<w>[-ai].webp`.
- Generated images (`assets/generated/**`): every variant gets `tools/ai-label.xmp` attached with
  `webpmux -set xmp` after cwebp, and the variant is cached only when the bytes contain `trainedAlgorithmicMedia`; the
  output name ends in `-ai.webp`; tools/build-check.mjs re-checks every `-ai.webp` in dist, and
  `node tools/ai-label.mjs verify <dist>/assets/img/` reports them as "webp XMP chunk" (its `embed` mode handles
  JPEG/PNG/video, so WebP variants are labelled by webpmux with the same `tools/ai-label.xmp`). No generated image
  exists yet; the path was exercised in a scratch copy (section 7): 8/8 variants labelled, none byte-identical to the
  unlabelled still, a declared but ungenerated slot rendered as the `data-slot` frame.
- Never shipped: Gravity Forms sprites/icons, the spinner, the lazy-load gif (`NEVER_SHIP` in `src/lib/policy.mjs`,
  tested on the source name or URL: 6 files in `assets/source/`). Three layers: `resolve()` throws for them, so every
  entry point refuses them (`ctx.img`, `ctx.imgSrc`, the og:image lookup); `publish()` refuses to copy one; after the
  build, `src/build.mjs` and `tools/build-check.mjs` compare every output file with the 6 source files by content
  (sha12 name prefix, identical bytes).
- `src/content/image-plan.json` (IMAGERY; optional) is read as `{ slots: { <slotId>: Slot } }`. A still slot is
  `{ file, alt, role, pages: ['/path/'] }`; a loop slot adds `kind: "video"` and `video` (section 5.1). The build fills
  `page.generated.hero` (the first slot with `role: 'hero'` whose `pages` holds the path), `page.generated.art` (every
  other slot of the page, sorted by id) and `page.generated.video` (the ids of the page's `kind: "video"` slots, also
  listed under hero/art by their role). A slot id works with `ctx.img` and `ctx.imgSrc` whatever its kind: they render
  `file` (for a loop slot: its poster still; `video.poster` when `file` is absent), or the `data-slot` frame / null while
  that file does not exist. IMAGERY wrote the file at 14:26: 20 slots, 17 `kind: "image"` and 3 `kind: "video"`
  (V-MIST, V-DUSK, V-TRICHOME, with `.webp` posters). A build at 14:27 accepted every declaration and reported "video
  slots declared 3: ready 0, not generated 3". The served-loop path is proven in a scratch copy only (section 7). cwebp
  1.6.0 takes a WebP input with the pipeline's arguments (measured), so WebP posters go through the image pipeline.

### 5.1 Video slots (WF3b; DESIGN-SPEC 10.5)

```js
'V-MIST': { file: 'assets/generated/<still>.png',          // the poster still (also what ctx.img('V-MIST') renders)
            alt: '', role: 'art', pages: ['/'], kind: 'video',
            video: { mp4: 'assets/generated/<loop>.mp4', webm: 'assets/generated/<loop>.webm',      // required
                     mp4Phone: 'assets/generated/<crop>.mp4', webmPhone: 'assets/generated/<crop>.webm', // optional
                     poster: 'assets/generated/<frame0>.png' } }  // optional; default: file
```

- **Declaration rules** (checked for every video slot before any page renders; a breach fails the build): `video.mp4`
  and `video.webm` are declared; every video path is under `assets/generated/` and ends in its key's extension
  (`.mp4` for `mp4`/`mp4Phone`, `.webm` for `webm`/`webmPhone`); the poster (`video.poster`, else `file`) is under
  `assets/generated/`.
- **States.** None of the declared video files exists: the slot is *not generated*, `ctx.video` returns null (render
  the still or the frame). Some exist and some do not, or the poster is missing: *partly generated*, `ctx.video`
  returns null and the build prints `build: WARNING video slot "<id>" is partly generated (missing: ...)`; under
  `THEME_STRICT=1` (the integrator's and every final build) it fails the build. All exist: *ready*.
- **Serving.** `ctx.video` copies each declared loop file byte for byte (no re-encode) to
  `/assets/video/<sha12 of the file>-ai.<ext>`. A file whose bytes lack `trainedAlgorithmicMedia` fails the build
  (`node tools/ai-label.mjs embed <file>` labels MP4 and WebM in their container tags, DESIGN-SPEC 10.6). The poster goes
  through the image pipeline: `poster` is the largest labelled `-ai.webp` variant not wider than `posterWidth`
  (default 1920), `posterSrcset` lists all of them. `width`/`height` are the MP4's presentation size (its first track
  header with a non-zero size; null if unreadable). The phone fields are null when the slot declares no phone crop.
- **Markup the gates expect** (`tools/build-check.mjs`): `<video preload="none" ... poster="<ctx.video().poster>">`
  with no `autoplay` (the theme's script plays the loop in view and never under reduced motion, R-26, R-27), sources
  only from `/assets/video/`, e.g. `<source media="(max-width: 760px)" src="<webmPhone>" type="video/webm">`, then
  `<source src="<webm>" type="video/webm"><source src="<mp4>" type="video/mp4">`.
- **The 1.5 MB first-screen budget (BUILD-CONTRACT 4.12, R-38) excludes the loops and counts the posters:** loops are
  the only files under `/assets/video/` (exclude that prefix, or CDP resource type `Media`); posters are ordinary
  `/assets/img/*-ai.webp` requests. With `preload="none"` Chrome holds no loop data before playback (measured on the
  scratch build, section 7: `readyState` 0 and `networkState` 1, idle, after load; transfer bytes not measured).

## 6. Policy and SEO

Residue (BUILD-CONTRACT 3.1, `src/lib/policy.mjs`): `wp-content`, `wp-includes`, `wp-json`, `wp-admin`, `wp-emoji`,
`gform`, `gravityforms`, `basebuildv3`, `rangemarketing`, `googletagmanager`, `G-148QKPF1CL`, `GTM-T4RHQDB`,
`stackadapt`, `userway` (case-insensitive, any text output) and the class tokens `w-row`, `w-container`, `w-col`,
`w-col-<n>`, `w-nav`, `w-slider`. The build fails on any hit; `tools/build-check.mjs` re-scans the output.

Allowlist (vendor-embed strings only, `ALLOW` in `src/lib/policy.mjs`): **empty**. After the StackAdapt script is
removed and the OMGF link is repointed, the Jane block holds no residue pattern (measured: build-check 0 findings). An
entry may only be added with its exact string, provider and reason, and applies only inside that vendor's embed span.
Third-party script hosts allowed in output (`ALLOWED_THIRD_PARTY_SRC`): `boost-assets.iheartjane.com` (Jane runtime),
`werolluplax.wm.store` (Weedmaps), `www.google.com` (map iframes). Stripped: GA4, GTM, StackAdapt, the emoji loader,
UserWay, the Range Marketing credit (4.8). Kept: the 3 Google Maps iframes as the source places them.

SEO (BUILD-CONTRACT 4.9, `src/lib/seo.mjs`, `ctx.seoHead(page)` emits):
- `<title>` = the source title; `<meta name="description">` = `page.metaDescription` (also `og:description`);
  `<meta name="robots">` = the source robots (`max-image-preview:large`); `<link rel="canonical">` = `page.canonical`;
  `og:type` (website on `/`, article elsewhere), `og:site_name`, `og:title`, `og:url`, `og:image` + width/height.
- `og:image` = `https://werollup.com/assets/img/<variant <= 1200 px>` of the page's header art, else its first image,
  else the home hero (`imageFrom` says which). link-check proves every own-origin meta URL resolves in dist.
- Meta descriptions: 35 pages excerpt their first `<p>` paragraph, 1 its notice, 18 pages have no paragraph in their
  main (the 12 shop/menu pages, the 5 review singles, primary-location) and use their h1 text (verbatim, short).
  `tools/build-check.mjs` re-proves it on the built page: exactly one meta description, equal to `og:description`, at
  most 160 characters, and a verbatim run of that page's own `[data-parity=main]` words (compared with all whitespace
  removed): 54/54.
- No JSON-LD (B1/B3 open). Alias stubs carry `noindex`; 404.html carries `noindex` and no canonical.
- `robots.txt`: `User-agent: *`, `Allow: /`, the sitemap URL. `sitemap.xml`: the 54 served paths as live URLs with
  `lastmod 2026-10-13` (query variants and aliases are not listed: B14 is open).

## 7. Checks (all offline, Node builtins; each has a positive control that must fail)

| command | proves | control |
|---|---|---|
| `node tools/link-check.mjs [--dir dist] [--json f]` | every internal href/src/poster/srcset/action/data-*-url and own-origin meta URL resolves in the tree (a `<video poster>` and every `<source src>` included); directory links end in `/`; fragments exist; external URLs are listed per host, never fetched | missing page, dead fragment, missing srcset candidate, missing CSS url(), directory link without slash, missing own-origin og:image, missing `<video poster>`, missing `<source src>` video: each reported; valid refs (and a served video, when the tree has one) not |
| `node tools/route-check.mjs [--dir dist] [--json f]` | 91/91 records resolve, 54/54 paths, 14/14 alias stubs and their `_redirects` pairs, 53/53 slash 301s, 8/8 menu paths with the Jane mount + module, 404 Jane boot, the dead URL not served (reads `audit/site-inventory.json`, not routes.json) | a view of the tree with a page, an alias stub, an alias redirect line, a slash redirect line, a menu path and 404.html removed: each reported |
| `node tools/text-parity.mjs [--dir dist] --control [--json f] [--page /p/] [--verbose]` | 91 records x 9 regions: the built word sequence equals the source sequence after the declared exceptions (PIPELINE-CONTENT 7, 8); each region exactly once; no visible word outside the regions; unused or stale exceptions fail. `--page` limits the run to one path; a `--page` that matches no record exits 1 (in Git Bash a leading-slash argument is rewritten to `C:/Program Files/Git/...`: run `MSYS_NO_PATHCONV=1 node tools/text-parity.mjs --page /about-us/`) | on a copy of `/about-us/`: one changed word, two swapped sentences, one dropped sentence, a changed footer word, a dropped review, a word outside the regions: each FAILS; the unmodified page passes |
| `node tools/build-check.mjs [--dir dist] --control [--json f]` | residue in every text file, exactly one `<h1>` per page, img width/height/alt (empty alt only with `data-decorative`), sizes with srcset, the licence line on every page and the 404, third-party script hosts, no CSP on shop pages, Jane block clean, fonts, AI labels on `-ai.webp`; platform UI images by content (section 5); embeds (4.6): on the 9 pages whose source has the Jane body, the source Jane head span (minus its StackAdapt script, the OMGF link repointed) exactly once in `<head>` and the source Jane body span exactly once in main, byte-identical; on the 2 pages whose source main has the Weedmaps tag (`/location/culver-city/shop/`, `/lax-menu/`), that exact tag exactly once in main; no Jane runtime or wm.store tag elsewhere; hrefs (4.3): per page and region, the multiset of `<a href>` equals the source's (internal hrefs normalised to the trailing-slash path), the only exceptions being the A8 corrections and the removed links of `changes.json` (measured: 5,142 source hrefs, 81 corrected, 55 removed; bare `#` toggles not compared); meta descriptions (section 6); store-switcher `data-*` (BUILD-CONTRACT 5a); fonts: under `assets/fonts/` only `libre-franklin`, `source-sans-pro` and `bricolage-grotesque` woff2 files, their sheets and `.LICENSE.txt` files, every `bricolage-grotesque-*.woff2` with its licence, at least one such file (the display face ships), no font file elsewhere; videos: every `.mp4`/`.webm` is `assets/video/<sha12>-ai.<ext>` and passes `tools/ai-label.mjs` `checkFile` (the byte grep AND the container tags read by ffprobe); every `<video>` has `preload="none"`, no `autoplay`, a poster `/assets/img/<sha12>-<w>-ai.webp`, and `src`/`<source src>` under `/assets/video/` only | planted `wp-content`, planted `w-container` class, a second h1, an empty alt without the marker, the licence line removed, the spinner under its hash name and under a neutral name, a sprite variant name, one byte in the Jane head (storeId 4281 -> 4282) and in the Jane body, a changed and a doubled Weedmaps tag, the Jane head and the Weedmaps tag planted on `/about-us/`, a reverted A8 link, a re-pointed link, invented words and a changed word in the meta description, a differing og:description, five `data-*` plants, an unknown font family, a TTF, the display face without its licence, a tree without the display face, a video stripped of its AI label (a temp copy of a served video, or a clip synthesised with ffmpeg and labelled with `ai-label.mjs embed` when the tree serves none; ffmpeg must be on PATH), a `<video>` without `preload="none"`, with `autoplay`, without a poster, with an unlabelled poster, with a third-party source: each reported; the clean pages, the tree's font set and a clean `<video>` pass |
| `node tools/hashdir.mjs dist <other> [--control]` | two builds are byte-identical | one byte appended in memory changes the aggregate |

Typical verifier run (never writes PIPELINE's dist or cache):

```sh
node src/build.mjs --out tmp/<role>/dist --cache tmp/<role>/cache
node tools/link-check.mjs --dir tmp/<role>/dist
node tools/route-check.mjs --dir tmp/<role>/dist
node tools/text-parity.mjs --dir tmp/<role>/dist --control
node tools/build-check.mjs --dir tmp/<role>/dist --control
node tools/hashdir.mjs dist tmp/<role>/dist
```

Fail-closed proof of the build (scratch copy of the workspace, `tmp/pipeline/failclosed.mjs`): a theme that adds a
second `<h1>`, one that adds a `wp-content` string, one that adds a dead link, a page model with an unknown block type
and a page index with a duplicate path each made `src/build.mjs` exit 1 with that reason; the clean copy exited 0.
Second round (`tmp/pipeline-fix/fc.mjs`, 19/19 as expected): the spinner and a chosen sprite through `ctx.imgSrc`, the
spinner through `ctx.img` (by file and by its live URL), an undeclared slot id, a wrong-case `Assets/brand/x.png`, a
missing local file through `ctx.imgSrc`, and each of the six files extraction writes edited by hand (`chrome.json`
"Daily Deals" -> "Daily Steals", `routes.json`, `changes.json`, `parity-exceptions.json`, `_index.json`, a page model)
plus an extra page file: each exit 1 with that reason. With the `resolve()` and `publish()` guards removed from a
scratch `images.mjs`, the post-build content gate alone still failed the spinner (`assets/img/022952f31730.svg`) and
a sprite variant (`assets/img/8aa69ee6b237-52.webp`). A declared, ungenerated slot rendered its frame and
`ctx.imgSrc` returned null (exit 0); the clean copy exited 0 before and after.

Fonts: `libre-franklin-*.woff2`, `source-sans-pro-*.woff2` and `bricolage-grotesque-*.woff2` are copied (`FONT_OK` in
`src/build.mjs`), Helvetica and Agrandir never. The display face (DESIGN-SPEC 3.2, D-8) was made on 2026-10-13 with

```sh
SOURCE_DATE_EPOCH=1791849600 node tools/font-woff2.mjs --in design/winner/fonts/BricolageGrotesque-var.ttf \
  --out assets/fonts/bricolage-grotesque-latin.woff2 --license design/winner/fonts/OFL-BricolageGrotesque.txt \
  --pin "wdth=100,opsz=96"
```

- Result: 46,868 B, sha256 `50351226d154…`, axes left `wght` 200-800 (default 800), 234 code points (the Latin range),
  name ID 0 "Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)", no
  Reserved Font Name in the OFL text; `assets/fonts/bricolage-grotesque-latin.LICENSE.txt` is a byte copy of that text.
- `SOURCE_DATE_EPOCH` (2026-10-13 00:00 UTC) makes the file reproducible: without it fontTools writes the clock into
  `head.modified`, and two runs gave 46,816 B and 46,848 B with different hashes (the tool header's "deterministic"
  holds only with the variable set). With it, two runs 2 s apart were byte-identical.
- Every character of the 327 heading, accordion-title and footer store-name texts in `src/content` (9,623 characters)
  is in the subset (`tmp/pipeline-maint/headchars.mjs`: 0 missing).
- Chrome (headless, through `tools/cdp.mjs`) loads it from `assets/fonts/bricolage-grotesque.css`: status `loaded`,
  46,868 B transferred, weight 300 and 800 give different widths (419 / 446 CSS px for one line at 40 px), and both
  differ from the fallback (542 px).

`tools/secret-scan.mjs` (ORCHESTRATOR) on this tree, with the fal and Higgsfield keys: 0 hits, 18 allowlisted matches in
the 9 San Pedro shop pages (BUILD-CONTRACT 4.14); `--control` fires for all 10 patterns and the 5 allowlist cases.

State on 2026-10-13 14:27: the stub build in `tmp/pipeline-maint/dist` (291 files, aggregate `053cbee8…`, identical from
an empty cache and a warm one, and under `THEME_STRICT=1`) passes link-check, route-check, build-check and text-parity,
each with its controls firing, and the secret scan. The `dist/` written by WF3a (288 files) predates the display face:
build-check now reports `font-display-face-missing` on it until the integrator rebuilds it.

WF3b proof of the video path and the image-plan shape (`tmp/pipeline-maint/vt.mjs`, a scratch copy of the workspace
with synthetic labelled loops, 15/15 as expected): two builds byte-identical (306 files) and identical again after the
fault builds; 4 loops served byte-identical to their sources under their content-hash names; the poster a labelled
`-ai.webp`, not byte-identical to the unlabelled still; `width`/`height` 640x360 as ffprobe reports; a declared, not
generated still slot rendered its `data-slot` frame; a not generated loop slot gave null and its still rendered; a
partly generated slot gave null plus the warning (exit 0) and failed under `THEME_STRICT=1`; an unlabelled loop, an mp4
outside `assets/generated/`, an `mp4` key naming a `.webm`, a slot without `webm`, `ctx.video` on an undeclared id and on
a still slot, and the display face without its licence each exit 1 with that reason. On that build link-check,
route-check, build-check `--control` (its video control used a served WebM), text-parity `--control`, the secret scan
and `ai-label.mjs verify --control` all pass; build-check reported an unlabelled loop planted under a served name and a
loop placed in `assets/img/`. In Chrome the `<video>` was `readyState` 0 before play, then played the served WebM
(`currentTime` 0.91 s), its poster loaded, and every `<source>` answered 200 with `video/mp4` or `video/webm`. With
`<source media="(max-width: 760px)">` first, Chrome played the phone crop at 390 px (360x640) and the main file at
1280 px (640x360) (`tmp/pipeline-maint/probe-phone.mjs`).
