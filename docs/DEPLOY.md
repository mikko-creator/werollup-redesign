# Deploy and preview: werollup.com redesign

Orchestrator, 2026-10-13. This draft is extended at handoff.

## Production (werollup.com)

The host is undecided (OPEN-DECISIONS B12). `dist/` is a static site built for a domain root, with root-absolute paths.
It needs:
- **Redirects:**
  - `dist/_redirects` (Netlify and Cloudflare Pages syntax) carries the 14 source aliases and the slash-less-to-slash
    301s;
  - static redirect stubs (meta refresh plus canonical) exist for every alias, so a host without rewrites still works.
- **404:** `404.html` at the root. It boots the Jane menu for any `/location/san-pedro/shop/menu/*` path the build did
  not pre-render.
- **Shop pages:** no Content-Security-Policy and no sandbox (Jane and its payment hosts, Weedmaps; BUILD-CONTRACT 4.6).
  Menu rendering can only be proven on werollup.com, at cutover (B13).
- **Contact form:** it posts to the placeholder `/__form-endpoint-not-configured__`, with its submit disabled (A12).
  Wire a backend (B9), then change the action and enable the button.

## Review preview (GitHub Pages project subpath), only with the operator's approval (PLAN D8)

```
MSYS_NO_PATHCONV=1 node tools/make-pages-preview.mjs --prefix /werollup-redesign --out preview
```

`tools/make-pages-preview.mjs` copies `dist/` and makes these changes:
- prefixes every root-absolute reference (attributes, srcset, meta refresh, CSS `url()`, and the measured JS literals
  in `tools/preview-literals.json`);
- leaves JSON script blocks verbatim;
- marks every page `noindex, nofollow`;
- writes a disallow-all `robots.txt`;
- drops `_redirects`;
- adds `.nojekyll`.

It then re-scans its own output and fails on any reference left outside the prefix (exit 4). It also fails on any
unlisted root-absolute JS literal (exit 3); measure each such literal before you list it.

Two cautions:
- **Git Bash:** always set `MSYS_NO_PATHCONV=1`, or `/werollup-redesign` arrives as a Windows path and the prefix check
  refuses it.
- **Jane on the preview only:** the Jane `partnerHostedPath` is prefixed in the preview copy only. `dist/` stays
  byte-identical, and build-check gates that. Whether Jane renders anywhere other than werollup.com is UNVERIFIED.

**Verify locally before any push.** Serve the parent folder so the preview sits under the prefix, then crawl what the
server returns:

```
node tools/serve.mjs --root <parent> --port 8898 --not-found werollup-redesign/404.html --no-open &
MSYS_NO_PATHCONV=1 node tools/crawl-preview.mjs --base http://127.0.0.1:8898/werollup-redesign/ --pages-from <parent>/werollup-redesign --concurrency 4
```

Measured on the stub-theme build (4a43f879, 2026-10-13):
- 106/106 pages 200, 234 assets checked, 0 references outside the prefix;
- 1 expected 404: the A12 placeholder form action;
- the `--control` re-scan fired on a planted href.

**Before every push:** run `node tools/secret-scan.mjs --dir preview --keys <fal.key> --keys <hf.key>` (and
`--control`).

**After a push:** Pages caches CSS for 10 minutes (`max-age=600`), so tell the reviewer to press Ctrl+F5 after a
republish.
