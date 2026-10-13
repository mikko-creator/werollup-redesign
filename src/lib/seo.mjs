// seo.mjs - head tags, robots.txt and sitemap.xml (PIPELINE). BUILD-CONTRACT 4.9 (A16, A17).
//  - title: the source <title> as it is;
//  - meta description: page.metaDescription (a verbatim excerpt of the page's own first content paragraph, <= ~155
//    characters, cut at a word boundary; extracted by src/lib/extract.mjs, which records where it came from);
//  - canonical: the source canonical (San Pedro shop variants self-canonical: recorded per variant in routes.json;
//    a static file serves only the base path, so the base canonical is emitted); archives get self-canonicals;
//  - robots: the source robots meta (max-image-preview:large on every page; no noindex anywhere);
//  - og:image: a valid absolute URL of a real image on that page (its header art or its first image), else the home
//    hero image; og:title, og:url, og:type, og:site_name, og:image:width/height. No JSON-LD (B1/B3 open).
import { ORIGIN, SITE_NAME, BUILD_DATE } from './site.mjs';

const escA = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escT = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const HOME_HERO = 'assets/source/01de0d97-werollup-san-pedro-storefront-classic-car-side-hero.webp';

/** the first real image ref on a page: header art, else the first image found in the block tree */
export function firstImageRef(page) {
  if (page.headerArt && page.headerArt.ref) return page.headerArt.ref;
  let hit = null;
  const visit = (v) => {
    if (hit || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) { for (const x of v) visit(x); return; }
    if (v.ref && typeof v.ref === 'string' && /^assets\//.test(v.ref) && v.role !== 'logo') { hit = v.ref; return; }
    for (const k of Object.keys(v)) visit(v[k]);
  };
  visit(page.sections);
  return hit;
}

/** og fields for a page; imgVariant(ref, maxW) -> { url, w, h } of a built variant */
export function ogFor(page, imgVariant) {
  const ref = firstImageRef(page) || HOME_HERO;
  const v = imgVariant(ref, 1200);
  return {
    title: page.title, type: page.path === '/' ? 'website' : 'article', url: page.canonical, siteName: SITE_NAME,
    image: ORIGIN + v.url, imageWidth: v.w, imageHeight: v.h, imageFrom: firstImageRef(page) ? 'page' : 'home-hero',
  };
}

/** the standard SEO head tags for a page (themes call ctx.seoHead(page) so both themes emit the same head) */
export function seoHead(page) {
  const o = page.og || {};
  const t = [];
  t.push('<title>' + escT(page.title) + '</title>');
  if (page.metaDescription) t.push('<meta name="description" content="' + escA(page.metaDescription) + '">');
  if (page.robots) t.push('<meta name="robots" content="' + escA(page.robots) + '">');
  if (page.canonical) t.push('<link rel="canonical" href="' + escA(page.canonical) + '">');
  t.push('<meta property="og:type" content="' + escA(o.type || 'website') + '">');
  t.push('<meta property="og:site_name" content="' + escA(o.siteName || SITE_NAME) + '">');
  t.push('<meta property="og:title" content="' + escA(o.title || page.title) + '">');
  if (page.metaDescription) t.push('<meta property="og:description" content="' + escA(page.metaDescription) + '">');
  if (o.url || page.canonical) t.push('<meta property="og:url" content="' + escA(o.url || page.canonical) + '">');
  if (o.image) {
    t.push('<meta property="og:image" content="' + escA(o.image) + '">');
    t.push('<meta property="og:image:width" content="' + o.imageWidth + '">');
    t.push('<meta property="og:image:height" content="' + o.imageHeight + '">');
  }
  return t.join('\n');
}

export function robotsTxt() {
  return 'User-agent: *\nAllow: /\n\nSitemap: ' + ORIGIN + '/sitemap.xml\n';
}

/** sitemap.xml of the served paths (54), live URLs, lastmod = the constant build date */
export function sitemapXml(paths) {
  const rows = paths.map((p) => '  <url><loc>' + escT(ORIGIN + p) + '</loc><lastmod>' + BUILD_DATE + '</lastmod></url>');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows.join('\n') + '\n</urlset>\n';
}
