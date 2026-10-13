// policy.mjs - platform and tracking residue rules (PIPELINE). BUILD-CONTRACT 3.1, 4.8, 4.14.
// Used by src/build.mjs (the build fails with exit 1 on any hit) and tools/build-check.mjs (re-scan of dist/).

/** the residue patterns of BUILD-CONTRACT 3.1 (case-insensitive substrings) */
export const RESIDUE = [
  { id: 'wp-content', re: /wp-content/i },
  { id: 'wp-includes', re: /wp-includes/i },
  { id: 'wp-json', re: /wp-json/i },
  { id: 'wp-admin', re: /wp-admin/i },
  { id: 'wp-emoji', re: /wp-emoji/i },
  { id: 'gform', re: /gform/i },
  { id: 'gravityforms', re: /gravityforms/i },
  { id: 'basebuildv3', re: /basebuildv3/i },
  { id: 'rangemarketing', re: /rangemarketing/i },
  { id: 'googletagmanager', re: /googletagmanager/i },
  { id: 'G-148QKPF1CL', re: /G-148QKPF1CL/i },
  { id: 'GTM-T4RHQDB', re: /GTM-T4RHQDB/i },
  { id: 'stackadapt', re: /stackadapt/i },
  { id: 'userway', re: /userway/i },
];
/**
 * Platform UI images that never ship (BUILD-CONTRACT 4.10): the Gravity Forms sprites/icons, the spinner and the
 * lazy-load gif. Tested on the SOURCE file name or URL (assets/source/<sha8>-<name>, measured: 6 files). Output names
 * are content hashes, so a check of the output must compare content (the sha12 name prefix and the bytes), never names:
 * src/lib/images.mjs refuses these files in resolve() (every entry point: ctx.img, ctx.imgSrc, og:image), src/build.mjs
 * and tools/build-check.mjs compare every output file with them by content.
 */
export const NEVER_SHIP = /gravityforms|chosen-sprite|gf-creditcards|spinner\.svg|loading_[0-9a-f]+\.gif/i;

/** Webflow-looking classes: a class token equal to one of these (or w-col-<n>) inside a class attribute */
export const WEBFLOW_CLASS = /^(w-row|w-container|w-col|w-col-\d+|w-nav|w-slider)$/;

/**
 * The allowlist: vendor-embed strings only, each with a reason. A hit is allowed only when the exact string occurs
 * inside the vendor embed span of the page (the Jane head/body or the Weedmaps tag carried byte-identical, 4.6).
 * As built on 2026-10-13 it is EMPTY: after the StackAdapt script is removed and the OMGF Source Sans Pro link is
 * repointed to /assets/fonts/source-sans-pro.css, the Jane block holds no residue pattern (measured by
 * tools/build-check.mjs over dist/). An entry is added here only with its exact string and reason.
 */
export const ALLOW = [
  // { pattern: 'wp-content', exact: '<the exact vendor string>', provider: 'jane', reason: '...' },
];

/** scan one output file's text; returns [{ id, index, excerpt }] (allowlisted hits removed) */
export function scanResidue(text, { embedSpans = [] } = {}) {
  const hits = [];
  for (const r of RESIDUE) {
    const re = new RegExp(r.re.source, 'gi');
    let m;
    while ((m = re.exec(text))) {
      const at = m.index;
      const allowed = ALLOW.some((a) => a.pattern === r.id && embedSpans.some(([s, e]) => at >= s && at < e && text.slice(s, e).includes(a.exact) && text.indexOf(a.exact, Math.max(s, at - a.exact.length)) <= at));
      if (!allowed) hits.push({ id: r.id, index: at, excerpt: text.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, ' ') });
    }
  }
  const clsRe = /\sclass\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = clsRe.exec(text))) {
    for (const tok of (m[2] ?? m[3] ?? '').split(/\s+/)) if (WEBFLOW_CLASS.test(tok)) hits.push({ id: 'webflow-class:' + tok, index: m.index, excerpt: m[0].slice(0, 120) });
  }
  return hits;
}

/** third-party hosts the output may reference (4.6, 4.8); anything else in a src= is reported by build-check */
export const ALLOWED_THIRD_PARTY_SRC = [
  { host: 'boost-assets.iheartjane.com', why: 'Jane Boost runtime module (San Pedro shop pages, 4.6)' },
  { host: 'werolluplax.wm.store', why: 'Weedmaps WM Store embed script (Culver City shop pages and /lax-menu/, 4.6)' },
  { host: 'www.google.com', why: 'Google Maps embed iframes kept as the source places them (4.8)' },
];
