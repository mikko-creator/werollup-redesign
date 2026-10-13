// shell.mjs - FOUNDATION document shell: <head> (SEO head from the pipeline, font preloads, the bundles through
// ctx.asset, the vendor head block), the skip link, the landmarks and the nine data-parity regions in a fixed order.
// renderDocument() is the only way a page becomes a document, so every template gets the same chrome and regions.
import * as P from './parts.mjs';
import * as C from './chrome.mjs';

const { escAttr, cx } = P;

/** ctx.asset that returns null for a name the pipeline does not publish (fonts arrive with PIPELINE-MAINT) */
export function assetOr(ctx, name) { try { return ctx.asset(name); } catch { return null; } }

/** first-paint state (A6, BUILD-CONTRACT 4.4 and 4.5): runs before the body paints, so a passed visitor never sees the
 *  gate, a new visitor never sees the page, and the store row of the top bar is known before layout (no CLS). The store
 *  comes from the URL path first, then the selected_location cookie (4.5). no-js stays on <html> without JavaScript: the gate fails closed (6.7). */
const GATE_PRECHECK = '<script>(function(d){var c=d.documentElement,k="agePass_v2",p=false;'
  + 'try{p=localStorage.getItem(k)==="true"}catch(e){}'
  + 'if(!p){try{p=sessionStorage.getItem(k)==="true"}catch(e){}}'
  + 'if(!p){try{p=/(?:^|;[ ]*)agePass_v2=true(?:;|$)/.test(d.cookie)}catch(e){}}'
  + 'var m=/^[/]location[/](culver-city|san-pedro)([/]|$)/.exec(location.pathname),st=m?m[1]:null;'
  + 'if(!st){try{var q=/(?:^|;[ ]*)selected_location=(culver-city|san-pedro)(?:;|$)/.exec(d.cookie);st=q?q[1]:null}catch(e){}}'
  + 'c.className=c.className.replace("no-js","js")+(p?" age-ok":" age-gate")+(st?" has-store store-"+st:"");})(document);</script>';

export function head(page, ctx, { extra = '' } = {}) {
  const css = ctx.asset('site.css');
  const js = assetOr(ctx, 'site.js');
  const lf = assetOr(ctx, 'fonts/libre-franklin-normal-latin.woff2') || '/assets/fonts/libre-franklin-normal-latin.woff2';
  const bgWoff = assetOr(ctx, 'fonts/bricolage-grotesque-latin.woff2');
  const bgCss = assetOr(ctx, 'fonts/bricolage-grotesque.css');
  const pre = (u) => '<link rel="preload" href="' + escAttr(u) + '" as="font" type="font/woff2" crossorigin>\n';
  return '<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + ctx.seoHead(page) + '\n'
    + '<meta name="theme-color" content="#101811">\n'
    + '<link rel="icon" href="' + escAttr(ctx.asset('favicon.png')) + '">\n'
    + pre(lf) + (bgWoff ? pre(bgWoff) : '')
    + '<link rel="stylesheet" href="' + escAttr(ctx.asset('fonts/libre-franklin.css')) + '">\n'
    + (bgCss ? '<link rel="stylesheet" href="' + escAttr(bgCss) + '">\n' : '')
    + '<link rel="stylesheet" href="' + escAttr(css) + '">\n'
    + GATE_PRECHECK + '\n'
    + (js ? '<script src="' + escAttr(js) + '" defer></script>\n' : '')
    + extra
    + (page.embed && page.embed.head ? page.embed.head + '\n' : '')
    + '</head>';
}

/**
 * A complete document around a <main> body.
 *   page: the page model (or a synthetic one for the 404)
 *   main: the HTML inside <main> (the template's sections)
 *   opts.bodyClass: extra classes on <body>
 *   opts.promo: where the subheader region goes: 'top' (under the header, the source position; default),
 *     'after-main' (after </main>, before the reviews: keeps the promo strip out of the home first screen without
 *     nesting regions), or 'none' (only for documents that are not text-parity records, e.g. the 404)
 *   opts.staticChrome: true on shop pages and /lax-menu (header and top bar static, not sticky; 6.2, 6.18.8)
 *   opts.headExtra: extra <head> tags (a hero preload, for example)
 *   opts.regions: false to omit reviews/offcanvas/chooser/gate (never on a text-parity record)
 */
export function renderDocument(page, ctx, { main, bodyClass = '', promo = 'top', staticChrome = false, headExtra = '', reviews = true, dialogs = true } = {}) {
  const sub = C.subheader(ctx, page);
  const shop = staticChrome || page.kind === 'shop' || page.kind === 'lax-menu';
  return '<!doctype html>\n<html lang="' + escAttr(page.lang || 'en-US') + '" class="no-js">\n' + head(page, ctx, { extra: headExtra }) + '\n'
    + '<body class="' + escAttr(cx('kind-' + (page.kind || 'page'), 'family-' + (page.menuFamily || 'primary'), shop && 'is-static-chrome', bodyClass)) + '">\n'
    + '<a class="skip" href="#mainContent" aria-label="Skip to content"></a>\n'
    + '<header class="site-head" id="siteHead">\n' + C.topBar(ctx, page) + '\n' + C.header(ctx, page) + '\n</header>\n'
    + (promo === 'top' ? sub + '\n' : '')
    + '<main id="mainContent" data-parity="main" tabindex="-1">\n' + main + '\n</main>\n'
    + (promo === 'after-main' ? sub + '\n' : '')
    + (reviews ? C.reviews(ctx, page) + '\n' : '')
    + C.footer(ctx, page) + '\n'
    + (dialogs ? C.offcanvas(ctx, page) + '\n' + C.chooser(ctx, page) + '\n' + C.ageGate(ctx, page) + '\n' : '')
    + '</body>\n</html>\n';
}
