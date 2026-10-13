# We Roll Up: website redesign concept ("Green Aura")

A redesign concept of [werollup.com](https://werollup.com), prepared as a proposal. It is not the official We Roll Up
website.

**Preview:** https://mikko-creator.github.io/werollup-redesign/

The preview is `noindex`. Pass the 21+ age gate, then choose a store.

## What it is

- **All 54 pages** of the current site, rebuilt as a static site at the same URLs. The old URLs are kept as redirects.
- **The site's own copy, carried verbatim.** Deliberate differences from the live site are listed in
  `docs/CHANGE-LOG.md`.
- **A new visual design,** "Green Aura, dusk edit" (`docs/DESIGN-SPEC.md`). It keeps the We Roll Up wordmark, the
  forest and leaf greens, and the voice, and adds:
  - layered depth, with real product cut-outs crossing section edges;
  - an image-led Products menu;
  - scroll-in motion and hover states;
  - two ambient video loops, each with a pause control.
- **Behaviour kept from the live site:**
  - the age gate and store picker;
  - the store switcher, which updates the Order Now targets;
  - the ZIP-code delivery finder;
  - the reviews rail.

## Run it locally

```
node tools/serve.mjs --root dist --port 8790 --not-found 404.html
```

Then open http://127.0.0.1:8790/. The site uses root-absolute paths, so serve it rather than opening the files
directly.

## Layout

| folder | contents |
|---|---|
| `dist/` | the built site |
| `src/` | the build: `src/build.mjs`, content models in `src/content/`, the theme in `src/theme/`, `src/styles/` and `src/scripts/` |
| `docs/` | design spec, site architecture, content model, brand system, compliance notes, imagery record, deploy notes |
| `design/` | the winning prototype from the design panel, and previews of the three directions that were judged |
| `assets/` | client photography (`source/`), AI-generated imagery (`generated/`), brand assets, open-licence fonts (SIL OFL) |
| `tools/` | the build checks (links, routes, text parity, secret scan) and preview tooling |

## Notes

- **Ownership:** all copy, photography, logos and partner-brand marks belong to We Roll Up and their owners.
- **AI imagery:** generated images and loops are illustrative only, never photos of the store, staff or products.
  Each carries an IPTC `trainedAlgorithmicMedia` label; see `docs/IMAGERY.md`.
- **Shop menus:** the menus on the shop pages are the client's vendor embeds (Jane, Weedmaps). They are designed to
  render on werollup.com and may not load on the preview.
- **Redacted vendor tokens:** in this public copy, the values in Jane's embed configuration (`#jane-app-secrets`: their
  client tokens and keys) are replaced with `REDACTED`. The working build keeps them as the live site publishes them.
- **Contact form:** it is not connected to a backend in this concept, so its submit button is disabled.
- **Rebuilding:** a rebuild from source needs the site-harvest evidence (`audit/raw`), which is not included here.
  `dist/` is ready to serve.
