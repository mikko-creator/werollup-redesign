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

## PUBLISHED 2026-10-14 (operator: "give me a public git repo and a public git preview link")

- **Repo (public):** https://github.com/mikko-creator/werollup-redesign
  - Branch `main`: ONE clean commit exported from this workspace's HEAD.
  - Local copy: `publish/repo/`, its own git repo, ignored by the workspace.
- **Preview (public, noindex):** https://mikko-creator.github.io/werollup-redesign/
  - Branch `gh-pages`, pushed from `preview/`, its own git repo.
  - Pages switched itself on when gh-pages was pushed, and built in about 10 s.

**Never push this workspace repository itself.** Its history holds three kinds of file that must not go public:
- the old site's COMMERCIAL fonts (Helvetica Neue Condensed, Agrandir), the lightGallery icon font and the agency theme
  JavaScript (`assets/js`);
- the full harvest evidence;
- Jane's vendor tokens.

Publish only through the export.

**The repo export recipe** (re-run it for an update, then push one new commit on top of `main`):
1. `git archive HEAD | tar -x -C publish/repo`, keeping its `.git`.
2. Remove `audit/capture`, `audit/screens`, `assets/js`, `tools/sr-local`, `assets/fonts/{Agrandir-Tight,HelveticaNeue-Condensed,lg_}*`,
   and `docs/RESUME.md`, which is the operator-internal handoff (session ids, local paths, key notes; kept out since
   revision 5).
3. Keep `publish/repo/README.md`.
4. `node tools/redact-vendor-secrets.mjs --dir publish/repo`. It replaces every value in Jane's `#jane-app-secrets`
   and fails if any AIza or Mapbox-style token is left.
5. `node tools/secret-scan.mjs --dir publish/repo --keys <fal.key> --keys <hf.key>` must report 0 hits (11 patterns,
   Mapbox included since 2026-10-14). Then commit and push.

**Why the redaction exists.** GitHub push protection rejected the first push. It found a "Mapbox Secret Access Token"
(`mapboxAccessToken` in `#jane-app-secrets`) that the scanner had no pattern for at the time. It was NOT bypassed: a
public repo must not republish a vendor's token. Locally, `dist/` keeps the block byte-identical; the build-check embed
gate and the hash-scoped allowlist cover that.

**The preview recipe:**
1. `MSYS_NO_PATHCONV=1 node tools/make-pages-preview.mjs --prefix /werollup-redesign --out preview`.
2. `node tools/redact-vendor-secrets.mjs --dir preview`.
3. The secret scan, which must report 0 hits.
4. Commit inside `preview/`, then `git push origin gh-pages`.

`make-pages-preview` also rewrites measured root-anchored regexes (`regexAnchors` in `tools/preview-literals.json`: the
theme's store detection `/^\/location\/.../`). Any other root-anchored regex stops it.

**Verified live, 2026-10-14:**
- the home page returns 200 and is byte-identical to `preview/index.html`;
- `tools/noindex-live-check.mjs`: 69/69 pages carry exactly one `noindex, nofollow`, and the styled 404 is noindex;
- `tools/crawl-preview.mjs` (2 concurrent, 300 ms apart): 106/106 pages 200, 325 assets checked, 0 references outside
  the prefix, and 1 expected 404, the A12 placeholder form action.

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
