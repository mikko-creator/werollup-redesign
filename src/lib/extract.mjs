#!/usr/bin/env node
// extract.mjs - audit/raw/*.html -> src/content/** (PIPELINE). Node builtins only. Deterministic and offline.
//   node src/lib/extract.mjs            writes src/content/pages/<slug>.json (54), pages/_index.json, chrome.json,
//                                       routes.json, changes.json, parity-exceptions.json
//   node src/lib/extract.mjs --check    exits 1 if any written file would change (the content is in sync)
// Block vocabulary, page shape and the changes ledger: docs/PIPELINE-CONTENT.md.
// Fail closed: an unknown image URL, a menu family that differs between pages, or a page without a <main> throws.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, ORIGIN, readJSON, readText, writeIfChanged, json, cmp, LICENCE } from './site.mjs';
import { parse, findFirst, findAll, isEl, cls, hasCls, elChildren, textOf, squash, inlineHtml, htmlText, decode, isSrOnlyEl, byId, outer } from './html-util.mjs';
import { loadRouteTable, normalizeHref, isInternal, slugOf, A8_LINK_FIXES, pathOfUrl, splitUrl } from './routes.mjs';
import { fileForUrl, fileInfo } from './images.mjs';

const OUT = path.join(ROOT, 'src', 'content');
const PAGES_DIR = path.join(OUT, 'pages');

/* ======================================================================== helpers */
const HEAD_LOOK = /^(h[1-6]|h-ultra)$/;
const lookOf = (n) => cls(n).find((c) => HEAD_LOOK.test(c)) || null;
const BLOCK_TAGS = new Set(['div', 'p', 'section', 'article', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form', 'table', 'iframe', 'nav', 'header', 'footer', 'aside', 'figure', 'blockquote', 'hr', 'main', 'button', 'select', 'img', 'script', 'label', 'input', 'textarea']);
const INLINE_TAGS = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'small', 'br', 'sup', 'sub', 'code', 'mark', 'abbr', 'time', 'cite', 'q']);
const isIcon = (n) => isEl(n) && n.tag === 'i' && /\bfa[srlbd]?\b|\bfa-/.test(n.attrs.class || '') && !squash(textOf(n));
const iconName = (n) => { const c = cls(n).find((x) => x.startsWith('fa-')); return c ? c.slice(3) : null; };
const hasBlockDesc = (n) => !!findFirst({ children: n.children, tag: '#frag', attrs: {} }, (x) => BLOCK_TAGS.has(x.tag) && x.tag !== 'br');
const isBtn = (n) => isEl(n) && n.tag === 'a' && hasCls(n, 'btn');
const bgUrl = (s) => { const m = /url\(\s*(['"]?)([^'")]+)\1\s*\)/.exec(String(s || '')); return m ? m[2] : null; };
const overlayOf = (s) => { const m = /(linear-gradient\([^)]*\([^)]*\)[^)]*\([^)]*\)\))/.exec(String(s || '')); return m ? m[1] : null; };

/* ======================================================================== per-page context */
class PageCtx {
  constructor(pathname, rawFile, html, changes) {
    this.path = pathname; this.rawFile = rawFile; this.html = html; this.changes = changes;
    this.images = []; this.counts = { linksFixed: 0 };
  }
  change(entry) { this.changes.push({ page: this.path, ...entry, evidence: entry.evidence || this.rawFile }); }
  /** href mapper: normalise + A8 corrections (+ A7 wp-admin link removal is handled by the caller) */
  link(href, where) {
    const n = normalizeHref(href);
    const fix = A8_LINK_FIXES.find((f) => f.from === n);
    if (fix) {
      this.change({ rule: 'A8', id: fix.id, region: where || 'main', before: href, after: fix.to, why: fix.why });
      return fix.to;
    }
    return n;
  }
  image(url, alt, role) {
    if (!url) return null;
    const file = fileForUrl(url);
    if (!file) throw new Error(this.path + ': image URL not in the harvest: ' + url);
    const m = fileInfo(file);
    const r = { ref: file, src: url, alt: alt == null ? null : alt, width: m.width, height: m.height, role: role || null };
    this.images.push(r);
    return r;
  }
}

/** inline html of nodes with hrefs mapped; the A7 wp-admin edit link is unwrapped (its text kept) */
function inl(nodes, P, where) {
  const prepped = nodes.map((n) => unwrapAdminLinks(n, P));
  return inlineHtml(prepped, { link: (a) => ({ href: P.link(a.href, where) }) });
}
function unwrapAdminLinks(n, P) {
  if (!isEl(n)) return n;
  const clone = (x) => {
    if (!isEl(x)) return x;
    if (x.tag === 'a' && /\/wp-admin\//.test(x.attrs.href || '')) {
      P.change({ rule: 'A7', id: 'A7-wp-admin-link', region: 'main', before: '<a href="' + x.attrs.href + '" aria-label="' + (x.attrs['aria-label'] || '') + '">' + squash(textOf(x)) + '</a>', after: squash(textOf(x)), why: 'A pasted old-CMS admin edit link (robots-blocked, behind a login). The link is removed; its anchor text stays (OPEN-DECISIONS A7).' });
      return { tag: 'span', attrs: {}, children: x.children, parent: x.parent, s: x.s, e: x.e };
    }
    return { ...x, children: (x.children || []).map(clone) };
  };
  return clone(n);
}

/* ======================================================================== flow converter */
function flow(container, P) {
  const blocks = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const html = inl(run, P);
    const text = htmlText(html);
    if (text) blocks.push({ type: 'paragraph', html, text, bare: true });
    run = [];
  };
  const push = (b) => {
    for (const x of [].concat(b)) {
      if (!x) continue;
      const last = blocks[blocks.length - 1];
      if (x.type === 'buttons' && last && last.type === 'buttons' && !x.wrapper && !last.wrapper) last.items.push(...x.items);
      else blocks.push(x);
    }
  };
  for (const c of container.children || []) {
    if (c.tag === '#comment') continue;
    if (c.tag === '#text') { if (!c.raw && c.text.trim()) run.push(c); else if (!c.raw && run.length) run.push(c); continue; }
    const comp = component(c, P);
    if (comp) { flush(); push(comp); continue; }
    if (isIcon(c)) continue;
    if (INLINE_TAGS.has(c.tag) && !isBtn(c) && !lookOf(c) && !hasBlockDesc(c)) { run.push(c); continue; }
    flush();
    push(element(c, P));
  }
  flush();
  return blocks;
}

function headingBlock(n, level, P) {
  let html = inl(n.children, P);
  let text = htmlText(html);
  // A7: a heading whose text is the same string twice, glued ("Your Westside Service HubYour Westside Service Hub")
  const half = text.length / 2;
  if (text.length >= 8 && Number.isInteger(half) && text.slice(0, half) === text.slice(half) && html === text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')) {
    P.change({ rule: 'A7', id: 'A7-doubled-heading', region: 'main', before: '<' + n.tag + '>' + text + '</' + n.tag + '>', after: '<' + n.tag + '>' + text.slice(0, half) + '</' + n.tag + '>', why: 'The heading text was pasted twice with no space; a mechanical defect, not wording (OPEN-DECISIONS A7).' });
    text = text.slice(0, half);
    html = html.slice(0, html.length / 2);
  }
  return { type: 'heading', level, look: lookOf(n), tag: n.tag, html, text };
}

function buttonOf(a, P, where) {
  const c = cls(a);
  const variant = (c.find((x) => /^btn-(primary|secondary|light|accent|dark|outline-[a-z]+)$/.test(x)) || '').replace(/^btn-/, '') || null;
  const icon = (a.children || []).filter(isIcon).map(iconName)[0] || null;
  const html = inl(a.children, P, where);
  const b = { label: html, text: htmlText(html), href: P.link(a.attrs.href || '', where), variant };
  if (c.includes('btn-sm')) b.size = 'sm';
  if (c.includes('transparent')) b.transparent = true;
  if (c.includes('js-location-chooser')) b.chooser = true;
  if (c.includes('active-location-menu')) b.activeLocation = true;
  if (a.attrs['data-lax-url']) b.laxUrl = P.link(a.attrs['data-lax-url'], where);
  if (a.attrs['data-sanpedro-url']) b.sanpedroUrl = P.link(a.attrs['data-sanpedro-url'], where);
  if (a.attrs.target) b.target = a.attrs.target;
  if (a.attrs.rel) b.rel = a.attrs.rel;
  if (icon) b.icon = icon;
  return b;
}

function element(n, P) {
  const t = n.tag;
  if (/^h[1-6]$/.test(t)) {
    const kids = elChildren(n).filter((x) => !isIcon(x));
    if (kids.length && kids.every(isBtn) && !squash((n.children || []).filter((x) => x.tag === '#text').map((x) => decode(x.text)).join(''))) {
      return { type: 'buttons', wrapper: t, items: kids.map((a) => buttonOf(a, P)) };
    }
    return headingBlock(n, Number(t[1]), P);
  }
  if ((t === 'p' || t === 'div' || t === 'span') && lookOf(n) && !hasBlockDesc(n)) {
    const html = inl(n.children, P);
    if (!htmlText(html)) return [];
    return { type: 'heading', level: null, look: lookOf(n), tag: t, html, text: htmlText(html) };
  }
  if (t === 'p') {
    const kids = elChildren(n).filter((x) => !isIcon(x));
    const looseText = (n.children || []).some((x) => x.tag === '#text' && !x.raw && decode(x.text).replace(/ /g, ' ').trim());
    if (kids.length === 1 && lookOf(kids[0]) && !looseText && !hasBlockDesc(kids[0])) return element(kids[0], P);
    if (kids.some((x) => BLOCK_TAGS.has(x.tag) && x.tag !== 'br') || kids.some((x) => component(x, P, true))) return flow(n, P);
    const loose = (n.children || []).filter((x) => x.tag === '#text' && !x.raw && decode(x.text).replace(/ /g, ' ').trim());
    if (kids.length && kids.every(isBtn) && !loose.length) return { type: 'buttons', items: kids.map((a) => buttonOf(a, P)) };
    const html = inl(n.children, P);
    const text = htmlText(html);
    if (!text) return [];
    const b = { type: 'paragraph', html, text };
    const look = cls(n).find((c) => /^fs-\d$|^small$|^lead$/.test(c));
    if (look) b.look = look;
    return b;
  }
  if (t === 'ul' || t === 'ol') return listBlock(n, P);
  if (isBtn(n)) return { type: 'buttons', items: [buttonOf(n, P)] };
  if (t === 'img') {
    const src = n.attrs.src || n.attrs['data-src'];
    if (!src) return [];
    return { type: 'image', image: P.image(src, n.attrs.alt == null ? null : n.attrs.alt, 'content') };
  }
  if (t === 'hr') return { type: 'rule' };
  if (t === 'br' || t === 'script' || t === 'style' || t === 'noscript' || t === 'template' || t === 'svg' || t === 'input' || t === 'meta' || t === 'link') return [];
  if (t === 'a') {
    // a link wrapping blocks (no btn class): a link card
    const blocks = flow(n, P);
    if (!blocks.length) return [];
    return { type: 'link-card', href: P.link(n.attrs.href || ''), blocks };
  }
  if (t === 'button') {
    const html = inl(n.children, P);
    return htmlText(html) ? { type: 'paragraph', html, text: htmlText(html), bare: true, from: 'button' } : [];
  }
  return flow(n, P);
}

function listBlock(n, P) {
  const items = [];
  for (const li of elChildren(n)) {
    if (li.tag !== 'li') continue;
    const nested = elChildren(li).filter((x) => x.tag === 'ul' || x.tag === 'ol');
    const rest = (li.children || []).filter((x) => !nested.includes(x));
    const html = inl(rest, P);
    const item = { html, text: htmlText(html) };
    if (nested.length) item.children = nested.map((x) => listBlock(x, P));
    items.push(item);
  }
  return { type: 'list', ordered: n.tag === 'ol', items };
}

/* ======================================================================== components */
function component(n, P, probe = false) {
  if (!isEl(n)) return null;
  const c = cls(n);
  const id = n.attrs.id || '';
  const yes = (fn) => (probe ? true : fn());
  if (c.includes('page-header')) return yes(() => pageHeader(n, P));
  if (n.attrs['data-bgimage'] && c.includes('rounded') && findFirst(n, (x) => hasCls(x, 'column-content'))) return yes(() => heroTile(n, P));
  if (c.includes('get-locations')) return yes(() => locationCards(n, P));
  if (c.includes('rpb-simple-content')) return yes(() => split(n, P));
  if (c.includes('accordion') && c.includes('rpb-accordion')) return yes(() => accordion(n, P));
  if (c.includes('bootstrap-cards-slider')) return yes(() => cardCarousel(n, P));
  if (c.includes('rpb-logo-slider')) return yes(() => logoCarousel(n, P));
  if (c.includes('daily-deals-list')) return yes(() => deals(n, P));
  if (c.includes('zip-code-search-box')) return yes(() => zipFinder(n, P));
  if (id === 'gform_wrapper_1') return yes(() => contactForm(n, P));
  if (n.tag === 'form' && c.includes('search-form')) return yes(() => searchForm(n, P));
  if (c.includes('alert')) return yes(() => ({ type: 'notice', tone: (c.find((x) => /^alert-/.test(x)) || 'alert-info').slice(6), html: inl(n.children, P), text: squash(textOf(n)) }));
  if (c.includes('blog-post-content')) return yes(() => postList(n, P));
  if (n.tag === 'div' && c.includes('row') && cardCols(n).cards >= 2) return yes(() => cardGrid(n, P));
  if (id === 'app' && c.includes('app')) return yes(() => ({ type: 'embed', provider: 'jane' }));
  if ((n.tag === 'div' || n.tag === 'p') && elChildren(n).length === 1 && elChildren(n)[0].tag === 'script' && /wm\.store\/static\/js\/embed\.js/.test(elChildren(n)[0].attrs.src || '')) return yes(() => ({ type: 'embed', provider: 'weedmaps', html: outer(P.html, n) }));
  if (n.tag === 'iframe') return yes(() => mapBlock(n, P));
  if (n.tag === 'a' && !squash(textOf(n)) && elChildren(n).length && elChildren(n).every(isIcon)) return yes(() => ({ type: 'icon-link', href: P.link(n.attrs.href || ''), icon: iconName(elChildren(n)[0]), label: null }));
  return null;
}

function pageHeader(n, P) {
  const h = findFirst(n, (x) => /^h[1-6]$/.test(x.tag)) || findFirst(n, (x) => !!lookOf(x));
  const bg = n.attrs['data-bgimage'] || '';
  const url = bgUrl(bg);
  const heading = h ? headingBlock(h, /^h[1-6]$/.test(h.tag) ? Number(h.tag[1]) : null, P) : null;
  return { type: 'page-header', heading, image: url ? P.image(url, '', 'page-header') : null, overlay: overlayOf(bg), source: 'page' };
}

function heroTile(n, P) {
  const bg = n.attrs['data-bgimage'] || '';
  const url = bgUrl(bg);
  const inner = findFirst(n, (x) => hasCls(x, 'column-content') && hasCls(x, 'p-4')) || findFirst(n, (x) => hasCls(x, 'column-content'));
  return { type: 'hero-tile', image: url ? P.image(url, '', 'hero-tile') : null, overlay: overlayOf(bg), blocks: flow(inner, P) };
}

function locationCards(n, P) {
  const cards = [];
  for (const card of findAll(n, (x) => hasCls(x, 'col-12') && hasCls(x, 'col-md-6'))) {
    const imgDiv = findFirst(card, (x) => hasCls(x, 'location-image'));
    const url = imgDiv ? bgUrl(imgDiv.attrs.style) : null;
    const body = findFirst(card, (x) => hasCls(x, 'py-2'));
    cards.push({ image: url ? P.image(url, '', 'location-card') : null, blocks: flow(body || card, P) });
  }
  return { type: 'location-cards', cards };
}

function split(n, P) {
  const content = findFirst(n, (x) => hasCls(x, 'hc-half-content'));
  const imgDiv = findFirst(n, (x) => hasCls(x, 'hc-half-content-image'));
  const url = imgDiv ? bgUrl(imgDiv.attrs['data-bgimage']) : null;
  const cols = findAll(n, (x) => x.tag === 'div' && cls(x).some((k) => /^col-lg-6$/.test(k)));
  const contentCol = cols.find((x) => findFirst(x, (y) => y === content) || x === content);
  const imageCol = cols.find((x) => x !== contentCol);
  const order = (col) => { const k = cls(col || {}).find((z) => /^order-lg-\d$/.test(z)); return k ? Number(k.slice(-1)) : null; };
  let imageSide = 'right';
  if (order(imageCol) != null && order(contentCol) != null) imageSide = order(imageCol) < order(contentCol) ? 'left' : 'right';
  else if (cols.indexOf(imageCol) < cols.indexOf(contentCol)) imageSide = 'left';
  const label = imgDiv ? imgDiv.attrs['aria-label'] || null : null;
  return { type: 'split', imageSide, image: url ? P.image(url, label || '', 'split') : null, imageLabel: label, blocks: flow(content, P) };
}

function accordion(n, P) {
  const items = [];
  for (const it of findAll(n, (x) => hasCls(x, 'accordion-item'))) {
    const btn = findFirst(it, (x) => x.tag === 'button' && hasCls(x, 'accordion-button'));
    const h = btn ? findFirst(btn, (x) => /^h[1-6]$/.test(x.tag)) : null;
    const collapse = findFirst(it, (x) => hasCls(x, 'accordion-collapse'));
    const body = findFirst(it, (x) => hasCls(x, 'accordion-body'));
    const html = inl((h || btn).children, P);
    items.push({ id: (collapse && collapse.attrs.id) || null, title: html, text: htmlText(html), level: h ? Number(h.tag[1]) : null, open: !!(collapse && hasCls(collapse, 'show')), blocks: body ? flow(body, P) : [] });
  }
  return { type: 'accordion', items };
}

function splideOf(n) { try { return JSON.parse(n.attrs['data-splide'] || 'null'); } catch { return null; } }

function cardCarousel(n, P) {
  const slides = findAll(n, (x) => hasCls(x, 'splide__slide'));
  const cards = slides.map((s) => {
    const card = findFirst(s, (x) => hasCls(x, 'card')) || s;
    const imgDiv = findFirst(card, (x) => hasCls(x, 'rpb-flex-card-image'));
    const url = imgDiv ? bgUrl(imgDiv.attrs['data-bgimage']) : null;
    const tone = (cls(card).find((x) => /^bg-/.test(x)) || '').slice(3) || null;
    const shell = { ...card, children: (card.children || []).filter((x) => x !== imgDiv) };
    const blocks = flow(shell, P);
    const title = firstHeading(blocks);
    return { image: url ? P.image(url, title ? title.text : '', 'category-card') : null, imageAltFrom: url ? 'card title (the source alt is the placeholder "background image")' : undefined, tone, blocks };
  });
  const variant = cards.some((x) => x.image) ? 'category' : 'mood';
  return { type: 'card-carousel', variant, splide: splideOf(n), cards };
}

function logoCarousel(n, P) {
  const logos = findAll(n, (x) => hasCls(x, 'logo-banner-single')).map((d) => {
    const a = findFirst(d, (x) => x.tag === 'a');
    const img = findFirst(d, (x) => x.tag === 'img');
    return { href: a ? P.link(a.attrs.href || '') : null, rel: a ? a.attrs.rel || null : null, image: img ? P.image(img.attrs.src || img.attrs['data-src'], img.attrs.alt == null ? null : img.attrs.alt, 'logo') : null };
  });
  return { type: 'logo-carousel', splide: splideOf(n), logos };
}

function deals(n, P) {
  const items = findAll(n, (x) => x.tag === 'a' && hasCls(x, 'single-deal')).map((a) => {
    const icon = findFirst(a, isIcon);
    const desc = findFirst(a, (x) => hasCls(x, 'single-deal-description'));
    return { href: P.link(a.attrs.href || ''), icon: icon ? iconName(icon) : null, blocks: flow(desc || a, P) };
  });
  return { type: 'deals', items };
}

function zipFinder(n, P) {
  const step = (id) => byId(n, id);
  const titleOf = (x) => { const t = x && findFirst(x, (y) => hasCls(y, 'zcs-title')); return t ? { look: lookOf(t), html: inl(t.children, P), text: squash(textOf(t)) } : null; };
  const s1 = step('zcs1');
  const empty = step('zcs-empty');
  const results = findFirst(n, (x) => hasCls(x, 'zcs-results'));
  const rows = findAll(n, (x) => hasCls(x, 'zcs-location-row')).map((r) => {
    const head = findFirst(r, (x) => x.tag === 'p' && hasCls(x, 'h3'));
    const strong = head && findFirst(head, (x) => x.tag === 'strong');
    const a = head && findFirst(head, (x) => x.tag === 'a');
    const checks = findAll(r, (x) => hasCls(x, 'zcs-location-checks')).flatMap((cc) => findAll(cc, (x) => x.tag === 'p').map((p) => squash(textOf(p))));
    const buttons = findAll(r, (x) => hasCls(x, 'zcs-location-buttons')).flatMap((bb) => findAll(bb, isBtn).map((b) => buttonOf(b, P)));
    const again = findFirst(r, (x) => hasCls(x, 'zcs-go-back'));
    return { id: r.attrs.id, label: strong ? squash(textOf(strong)) : null, name: a ? squash(textOf(a)) : null, href: a ? P.link(a.attrs.href || '') : null, checks, buttons, again: again ? squash(textOf(again)) : null };
  });
  const form = findFirst(n, (x) => x.tag === 'form');
  const label = form && findFirst(form, (x) => x.tag === 'label');
  const input = form && findFirst(form, (x) => x.tag === 'input');
  const button = form && findFirst(form, (x) => x.tag === 'button');
  const emptyP = empty ? findAll(empty, (x) => x.tag === 'p') : [];
  const resP = results ? elChildren(results).filter((x) => x.tag === 'p') : [];
  return {
    type: 'zip-finder',
    title: titleOf(s1),
    empty: { title: titleOf(empty), paragraphs: emptyP.map((p) => { const h = inl(p.children, P); return { html: h, text: htmlText(h) }; }) },
    results: { title: titleOf(results), paragraphs: resP.map((p) => { const h = inl(p.children, P); return { html: h, text: htmlText(h) }; }), rows },
    form: {
      id: form ? form.attrs.id : null, name: form ? form.attrs.name : null,
      label: label ? squash(textOf(label)) : null, labelHidden: !!(label && isSrOnlyEl(label)),
      input: input ? { type: input.attrs.type, id: input.attrs.id, name: input.attrs.name, placeholder: input.attrs.placeholder || null, required: 'required' in input.attrs } : null,
      button: button ? squash(textOf(button)) : null,
    },
  };
}

function contactForm(n, P) {
  const form = findFirst(n, (x) => x.tag === 'form');
  const fields = [];
  const dropped = [];
  for (const li of findAll(form, (x) => x.tag === 'li' && hasCls(x, 'gfield'))) {
    const label = findFirst(li, (x) => x.tag === 'label');
    const req = label ? findFirst(label, (x) => hasCls(x, 'gfield_required')) : null;
    const labelText = label ? squash(textOf(label, { skip: (x) => hasCls(x, 'gfield_required') })) : '';
    const control = findFirst(li, (x) => x.tag === 'input' || x.tag === 'textarea' || x.tag === 'select');
    if (cls(li).includes('gfield--type-captcha')) {
      dropped.push({ label: labelText, reason: 'reCAPTCHA is dropped with the old backend (BUILD-CONTRACT 4.7, OPEN-DECISIONS A12)' });
      P.change({ rule: 'A12', id: 'A12-recaptcha', region: 'main', before: labelText + ' (Google reCAPTCHA widget, public sitekey)', after: '(removed)', why: 'reCAPTCHA is dropped with the Gravity Forms backend (BUILD-CONTRACT 4.7).' });
      continue;
    }
    if (!control) continue;
    const type = control.tag === 'textarea' ? 'textarea' : control.attrs.type || 'text';
    const f = { name: control.attrs.name, type, label: labelText, required: !!req, requiredMark: req ? squash(textOf(req)) : null, placeholder: control.attrs.placeholder || null };
    if (control.tag === 'textarea') f.rows = Number(control.attrs.rows || 10);
    fields.push(f);
  }
  const submit = findFirst(form, (x) => x.tag === 'input' && (x.attrs.type === 'submit'));
  P.change({ rule: 'A12', id: 'A12-endpoint', region: 'main', before: 'method=post action=/contact/ (Gravity Forms postback, multipart/form-data)', after: 'method=post action=/__form-endpoint-not-configured__, submit disabled with a visible note', why: 'An unwired rebuilt form must post and start disabled (BUILD-CONTRACT 4.7).' });
  P.change({ rule: 'A12', id: 'A12-note', region: 'main', before: '(none)', after: FORM_NOTE, why: 'BUILD-CONTRACT 4.7 requires a visible note beside the disabled submit button. Added text, the only added sentence in the build; it states a fact about the build and makes no claim about the business.' });
  return {
    type: 'form', id: 'contact', method: 'post', action: '/__form-endpoint-not-configured__', enctype: 'multipart/form-data',
    fields, submit: { label: submit ? submit.attrs.value : null, disabled: true }, note: FORM_NOTE, dropped,
  };
}
export const FORM_NOTE = 'This form is not connected yet. Please call one of our stores.';

function searchForm(n, P) {
  const label = findFirst(n, (x) => x.tag === 'label');
  const sr = label && findFirst(label, (x) => isSrOnlyEl(x));
  const input = findFirst(n, (x) => x.tag === 'input' && x.attrs.type === 'search');
  const sub = findFirst(n, (x) => x.tag === 'input' && x.attrs.type === 'submit');
  return { type: 'search-form', action: P.link(n.attrs.action || '/'), method: (n.attrs.method || 'get').toLowerCase(), label: sr ? squash(textOf(sr)) : null, labelHidden: !!sr, name: input ? input.attrs.name : 's', placeholder: input ? input.attrs.placeholder || null : null, button: sub ? sub.attrs.value : null };
}

function postList(n, P) {
  const posts = findAll(n, (x) => hasCls(x, 'col-md-6')).map((col) => {
    const date = findFirst(col, (x) => hasCls(x, 'date-block'));
    const ps = date ? findAll(date, (x) => x.tag === 'p').map((p) => squash(textOf(p))) : [];
    const img = findFirst(col, (x) => x.tag === 'img');
    const titleP = findFirst(col, (x) => x.tag === 'p' && hasCls(x, 'h3') && !hasCls(x, 'mb-0'));
    const a = titleP && findFirst(titleP, (x) => x.tag === 'a');
    const iconA = findFirst(col, (x) => x.tag === 'a' && hasCls(x, 'circle-link'));
    return {
      date: { month: ps[0] || null, day: ps[1] || null, year: ps[2] || null },
      image: img ? P.image(img.attrs.src || img.attrs['data-src'], img.attrs.alt ? img.attrs.alt : (a ? squash(textOf(a)) : ''), 'post') : null,
      imageAltFrom: img && !img.attrs.alt ? 'post title (the source img has no alt)' : undefined,
      iconLink: iconA ? { href: P.link(iconA.attrs.href || ''), icon: iconName(findFirst(iconA, isIcon)) } : null,
      title: a ? inl(a.children, P) : null, text: a ? squash(textOf(a)) : null, href: a ? P.link(a.attrs.href || '') : null,
      titleLook: titleP ? lookOf(titleP) : null,
    };
  });
  return posts.length ? { type: 'post-list', posts } : [];
}

function cardCols(n) {
  let cards = 0;
  for (const col of elChildren(n)) if (findFirst(col, (x) => hasCls(x, 'column-content') && hasCls(x, 'rounded')) || hasCls(col, 'rounded')) cards++;
  return { cards };
}
function cardGrid(n, P) {
  const intro = [], cards = [], outro = [];
  for (const col of elChildren(n)) {
    const card = findFirst(col, (x) => hasCls(x, 'column-content') && hasCls(x, 'rounded'));
    if (card) {
      const tone = (cls(card).find((x) => /^background-/.test(x)) || '').replace(/^background-/, '') || null;
      cards.push({ tone, blocks: flow(col, P) });
    } else (cards.length ? outro : intro).push(...flow(col, P));
  }
  return { type: 'card-grid', intro, cards, outro };
}

function mapBlock(n, P) {
  const open = P.html.slice(n.s, P.html.indexOf('>', n.s) + 1);
  const inner = (n.children[0] && n.children[0].text) || '';
  if (squash(decode(inner.replace(/<[^>]+>/g, ' ')))) {
    P.change({ rule: 'A7', id: 'A7-iframe-brief', region: 'main', before: '<iframe ...>' + squash(decode(inner.replace(/<[^>]+>/g, ' '))).slice(0, 160) + '...</iframe>', after: '<iframe ...></iframe> (fallback content dropped)', why: 'A designer brief was pasted inside the map <iframe> element; browsers never render iframe content, so it never showed live and is not rendered (OPEN-DECISIONS A7; parity excludes it).' });
  }
  return { type: 'map', provider: 'google-maps', src: n.attrs.src, width: n.attrs.width || null, height: n.attrs.height || null, html: open + '</iframe>' };
}

/* ======================================================================== sections */
function sectionsOf(main, P) {
  const raw = [];
  for (const c of main.children) {
    if (c.tag === '#comment') continue;
    if (c.tag === '#text') { if (!c.raw && squash(decode(c.text))) raw.push({ blocks: [{ type: 'paragraph', html: inl([c], P), text: squash(decode(c.text)), bare: true }], node: null }); continue; }
    const blocks = [].concat(component(c, P) || element(c, P)).filter(Boolean);
    if (!blocks.length) continue;
    raw.push({ blocks, node: c });
  }
  // a section of headings only merges into the next section (CONTENT-MODEL: heading-only rows)
  const merged = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    if (s.blocks.every((b) => b.type === 'heading') && i + 1 < raw.length) { raw[i + 1].blocks.unshift(...s.blocks); raw[i + 1].bgFrom = raw[i + 1].bgFrom || s.node; continue; }
    merged.push(s);
  }
  return merged.map((s, i) => {
    const types = [...new Set(s.blocks.filter((b) => b.type !== 'heading').map((b) => b.type))];
    let kind = 'content';
    if (types.length === 1 && types[0] !== 'paragraph' && types[0] !== 'list' && types[0] !== 'buttons') kind = types[0];
    if (types.length === 0) kind = 'content';
    const h = firstHeading(s.blocks);
    const bg = s.node ? (cls(s.node).find((x) => /^background-(black|dark|light|secondary|white)$/.test(x)) || '').replace('background-', '') || null : null;
    return { id: 's' + (i + 1), kind, heading: h ? h.text : null, level: h ? h.level : null, sourceBg: bg, blocks: s.blocks };
  });
}

/** every heading-like object in a block tree, in DOM order: { ref (the object to edit), level, text } */
function headingsIn(blocks, out = []) {
  for (const b of blocks || []) {
    if (b.type === 'heading') out.push(b);
    if (b.type === 'page-header' && b.heading) out.push(b.heading);
    for (const k of ['blocks', 'intro', 'outro']) if (Array.isArray(b[k])) headingsIn(b[k], out);
    for (const k of ['cards', 'items']) if (Array.isArray(b[k])) for (const x of b[k]) if (x && x.blocks) headingsIn(x.blocks, out);
  }
  return out;
}
const firstHeading = (blocks) => headingsIn(blocks)[0] || null;

/* ======================================================================== chrome */
function menuTree(ul, P, where) {
  if (!ul) return null;
  const items = [];
  for (const li of elChildren(ul)) {
    if (li.tag !== 'li') continue;
    const a = elChildren(li).find((x) => x.tag === 'a');
    const sub = elChildren(li).find((x) => x.tag === 'ul');
    const raw = a ? a.attrs.href || '' : '';
    const item = { label: a ? squash(textOf(a)) : '', href: raw === '#' ? null : P.link(raw, where) };
    if (a && hasCls(li, 'active-location-menu')) item.activeLocation = true;
    if (sub) item.children = menuTree(sub, P, where);
    items.push(item);
  }
  return items;
}

function socialsOf(container) {
  if (!container) return [];
  return findAll(container, (x) => x.tag === 'a').map((a) => {
    const sr = findFirst(a, isSrOnlyEl);
    const img = findFirst(a, (x) => x.tag === 'img');
    const icon = findFirst(a, isIcon);
    return { label: sr ? squash(textOf(sr)) : null, ariaLabel: a.attrs['aria-label'] || null, href: a.attrs.href, target: a.attrs.target || null, rel: a.attrs.rel || null, icon: icon ? iconName(icon) : null, imageUrl: img ? img.attrs.src : null, imageAlt: img ? img.attrs.alt || null : null };
  });
}

function extractChrome(docs, P0, changes) {
  const home = docs.get('/');
  const root = home.root;
  const P = P0;
  // --- top bar (#headless-top-bar)
  const tb = byId(root, 'headless-top-bar');
  const sel = byId(tb, 'currently-shopping');
  const options = findAll(sel, (x) => x.tag === 'option').map((o) => ({
    label: squash(textOf(o)), value: o.attrs.value ? P.link(o.attrs.value, 'topbar') : '', slug: o.attrs['data-slug'] || null,
    address: o.attrs['data-address'] || null, hours: o.attrs['data-hours'] || null,
    menuUrl: o.attrs['data-menu-url'] ? P.link(o.attrs['data-menu-url'], 'topbar') : null, directionsUrl: o.attrs['data-directions-url'] || null,
  }));
  const tbSocial = findFirst(tb, (x) => hasCls(x, 'd-md-flex'));
  const topBar = {
    select: { name: sel.attrs.name, id: sel.attrs.id, options },
    details: { addressId: 'locationAddress', hoursId: 'locationHours' },
    hoursFallback: 'Hours Not Available',
    hoursFallbackEvidence: 'assets/js/4c0935fa-main.js module 343: getAttribute("data-hours")||"Hours Not Available" (JS-only string; UNDERSTAND-REVIEW X1)',
    socials: socialsOf(tbSocial),
  };
  // --- header (nav#site-navigation)
  const nav = byId(root, 'site-navigation');
  const logo = byId(nav, 'main-logo');
  const quick = byId(nav, 'menu-quick-menu');
  const cta = findFirst(nav, (x) => x.tag === 'a' && hasCls(x, 'js-selected-location-menu'));
  const toggler = findFirst(nav, (x) => x.tag === 'button' && hasCls(x, 'navbar-toggler'));
  const header = {
    navLabel: nav.attrs['aria-label'] || null,
    logo: { image: P.image(logo.attrs.src, logo.attrs.alt, 'logo'), href: P.link(findFirst(nav, (x) => x.tag === 'a' && hasCls(x, 'navbar-brand')).attrs.href, 'header'), displayWidth: Number(logo.attrs.width) || null, displayHeight: Number(logo.attrs.height) || null },
    quickMenu: menuTree(quick, P, 'header'),
    toggleLabel: toggler ? toggler.attrs['aria-label'] : null,
    orderNow: { label: squash(textOf(cta)), href: P.link(cta.attrs.href, 'header'), laxUrl: P.link(cta.attrs['data-lax-url'], 'header'), sanpedroUrl: P.link(cta.attrs['data-sanpedro-url'], 'header'), icon: iconName(findFirst(cta, isIcon)) },
  };
  // --- the three menu families: taken from one page each, then proven identical on every page of the family
  const FAM = { primary: 'menu-primary-navigation', laxCulverCity: 'menu-lax-culver-city-menu', sanPedro: 'menu-san-pedro-menu' };
  const navTrees = {};
  const familyPages = { primary: [], laxCulverCity: [], sanPedro: [] };
  for (const [key, id] of Object.entries(FAM)) {
    for (const [p, d] of [...docs].sort((a, b) => cmp(a[0], b[0]))) {
      const ul = byId(d.root, id);
      if (!ul) continue;
      familyPages[key].push(p);
      const Pp = new PageCtx(p, d.rawFile, d.html, changes);
      const tree = menuTree(ul, Pp, 'header');
      const tree2 = menuTree(byId(d.root, id + '-1'), Pp, 'offcanvas');
      if (JSON.stringify(tree) !== JSON.stringify(tree2)) throw new Error('offcanvas menu differs from header menu on ' + p);
      if (!navTrees[key]) navTrees[key] = tree;
      else if (JSON.stringify(navTrees[key]) !== JSON.stringify(tree)) throw new Error('menu family ' + key + ' differs on ' + p);
    }
  }
  // --- marquee (40 pages) / shopping strip (51 pages)
  const sc = byId(root, 'scroll-text');
  const marqueeItems = [];
  const tbk = findFirst(sc, (x) => hasCls(x, 'text-block'));
  let cur = null;
  const walkM = (x) => {
    for (const k of x.children || []) {
      if (isIcon(k)) { cur = { icon: iconName(k), text: '' }; marqueeItems.push(cur); continue; }
      if (k.tag === '#text') { const t = decode(k.text); if (!cur && squash(t)) { cur = { icon: null, text: '' }; marqueeItems.push(cur); } if (cur) cur.text += t; continue; }
      if (isEl(k)) walkM(k);
    }
  };
  walkM(tbk);
  for (const m of marqueeItems) m.text = squash(m.text);
  const strips = {};
  for (const store of ['culver-city', 'san-pedro']) {
    const d = docs.get('/location/' + store + '/');
    const top = byId(d.root, 'site-topbar');
    const box = findFirst(top, (x) => hasCls(x, 'd-sm-flex'));
    const name = findFirst(box, (x) => x.tag === 'span');
    const lead = squash((box.children || []).filter((x) => x.tag === '#text').map((x) => decode(x.text)).join(' '));
    const Pp = new PageCtx(d.path, d.rawFile, d.html, changes);
    const buttons = findAll(findFirst(top, (x) => hasCls(x, 'small') && hasCls(x, 'mb-0')), isBtn).map((a) => buttonOf(a, Pp, 'subheader'));
    strips[store] = { lead, store: squash(textOf(name)), buttons };
  }
  // --- off-canvas
  const oc = byId(root, 'defaultOffcanvas');
  const ocLogo = findFirst(oc, (x) => x.tag === 'img');
  const ocClose = findFirst(oc, (x) => x.tag === 'button' && hasCls(x, 'offcanvas-close-button'));
  const ocNav = findFirst(oc, (x) => x.tag === 'nav');
  const ocCta = findFirst(oc, (x) => x.tag === 'a' && hasCls(x, 'js-selected-location-menu'));
  const offcanvas = {
    ariaLabel: oc.attrs['aria-label'] || null,
    logo: { image: P.image(ocLogo.attrs.src, ocLogo.attrs.alt, 'logo'), href: P.link(findFirst(oc, (x) => x.tag === 'a' && hasCls(x, 'offcanvas-logo')).attrs.href, 'offcanvas') },
    socials: socialsOf(findFirst(oc, (x) => hasCls(x, 'offcanvas-social'))),
    closeLabel: ocClose ? ocClose.attrs['aria-label'] : null,
    navLabel: ocNav ? ocNav.attrs['aria-label'] : null,
    orderNow: { label: squash(textOf(ocCta)), ariaLabel: ocCta.attrs['aria-label'] || null, href: P.link(ocCta.attrs.href, 'offcanvas'), laxUrl: P.link(ocCta.attrs['data-lax-url'], 'offcanvas'), sanpedroUrl: P.link(ocCta.attrs['data-sanpedro-url'], 'offcanvas') },
  };
  // --- footer
  const ft = findFirst(root, (x) => hasCls(x, 'site-footer'));
  const ftLogo = findFirst(ft, (x) => x.tag === 'img');
  const groups = findAll(ft, (x) => hasCls(x, 'footer-location-group')).map((g) => {
    const name = findFirst(g, (x) => x.tag === 'span');
    const contents = findAll(g, (x) => hasCls(x, 'footer-icon-content'));
    const tel = findFirst(g, (x) => x.tag === 'a');
    return { name: squash(textOf(name)), address: squash(textOf(contents[0])), phone: tel ? { display: squash(textOf(tel)), href: tel.attrs.href } : null };
  });
  const socialBox = findFirst(ft, (x) => x.tag === 'div' && hasCls(x, 'mt-3'));
  const fSocials = socialsOf(socialBox).map((s) => (s.imageUrl ? { ...s, image: P.image(s.imageUrl, s.imageAlt, 'footer-logo') } : s));
  const menuTitle = findFirst(ft, (x) => hasCls(x, 'menu-title'));
  const quickLinks = menuTree(byId(ft, 'menu-footer-second-menu'), P, 'footer');
  const copy = findFirst(ft, (x) => hasCls(x, 'footer-copyright'));
  const copyLinks = findAll(copy, (x) => x.tag === 'a');
  const range = copyLinks.find((a) => /rangemarketing/.test(a.attrs.href || ''));
  const priv = copyLinks.find((a) => !/rangemarketing/.test(a.attrs.href || ''));
  const copyText = squash((copy.children || []).filter((x) => x.tag === '#text').map((x) => decode(x.text)).join(' ').split('|')[0]);
  const sep = (copy.children || []).filter((x) => x.tag === '#text').map((x) => decode(x.text)).join('').includes('|') ? '|' : null;
  if (range) changes.push({ page: '*', rule: 'A15', id: 'A15-range-credit', region: 'footer', before: '<a href="' + range.attrs.href + '" title="' + (range.attrs.title || '') + '">' + squash(textOf(range)) + '</a>', after: '(removed)', why: 'The agency credit is stripped (OPEN-DECISIONS A15, PLAN D5).', evidence: 'audit/raw/*.html footer-copyright (91/91 pages)' });
  const licenceItem = quickLinks.find((q) => q.label === LICENCE);
  if (!licenceItem) throw new Error('licence line not found in the footer Quick Links');
  const footer = {
    logo: { image: P.image(ftLogo.attrs.src, ftLogo.attrs.alt, 'logo') },
    stores: groups,
    socials: fSocials,
    quickLinksTitle: squash(textOf(menuTitle)),
    quickLinks,
    licence: { label: licenceItem.label, href: licenceItem.href },
    copyright: copyText,
    separator: sep,
    privacy: priv ? { label: squash(textOf(priv)), href: P.link(priv.attrs.href, 'footer'), title: priv.attrs.title || null } : null,
  };
  // --- location chooser modal
  const lc = byId(root, 'locationChooserModal');
  const lcClose = findFirst(lc, (x) => x.tag === 'button');
  const locationChooser = {
    closeLabel: lcClose.attrs['aria-label'], closeGlyph: squash(textOf(lcClose)),
    eyebrow: squash(textOf(findFirst(lc, (x) => x.tag === 'p' && hasCls(x, 'small')))),
    title: squash(textOf(byId(lc, 'locationChooserTitle'))),
    description: squash(textOf(byId(lc, 'locationChooserDescription'))),
    cards: findAll(lc, (x) => x.tag === 'a' && hasCls(x, 'location-chooser-card')).map((a) => {
      const im = findFirst(a, (x) => hasCls(x, 'location-chooser-card__image'));
      return {
        key: a.attrs['data-location-chooser-card'], href: P.link(a.attrs.href, 'chooser'),
        image: im ? P.image(bgUrl(im.attrs['data-bgimage']), '', 'chooser') : null,
        name: squash(textOf(findFirst(a, (x) => hasCls(x, 'h4')))),
        address: squash(textOf(findFirst(a, (x) => hasCls(x, 'location-chooser-card__address')))),
        cta: squash(textOf(findFirst(a, (x) => hasCls(x, 'btn')))),
      };
    }),
  };
  // --- age gate
  const ag = byId(root, 'ageGateModal');
  const ageGate = {
    ariaLabel: ag.attrs['aria-label'] || null,
    background: P.image(bgUrl(ag.attrs.style), '', 'age-gate'),
    title: squash(textOf(findFirst(ag, (x) => hasCls(x, 'modal-title')))),
    question: squash(textOf(findFirst(ag, (x) => hasCls(x, 'age-gate-main-body')))),
    denied: squash(textOf(findFirst(ag, (x) => hasCls(x, 'age-gate-denied-body')))),
    yes: squash(textOf(byId(ag, 'ageGateYes'))),
    no: squash(textOf(byId(ag, 'ageGateNo'))),
    storeHeading: squash(textOf(findFirst(ag, (x) => hasCls(x, 'age-gate-location-heading')))),
    stores: findAll(ag, (x) => hasCls(x, 'age-gate-location-item')).map((it) => {
      const a = findFirst(it, (x) => x.tag === 'a');
      return { name: squash(textOf(findFirst(it, (x) => x.tag === 'h6'))), nameTag: 'h6', address: squash(textOf(findFirst(it, (x) => x.tag === 'p'))), href: P.link(a.attrs.href, 'agegate'), cta: squash(textOf(a)) };
    }),
    rule: { storageKey: 'agePass_v2', passValue: 'true', passIf: ['localStorage agePass_v2 === "true"', 'sessionStorage agePass_v2 === "true"', 'cookie agePass_v2=true'], onPass: 'localStorage agePass_v2=true + cookie "agePass_v2=true; max-age=31536000; path=/; SameSite=Lax" (+ "; Secure" on https)', source: 'BUILD-CONTRACT 4.4, OPEN-DECISIONS A6' },
  };
  // --- reviews (fixed order = audit/raw/index.html, A2)
  const rv = findFirst(root, (x) => hasCls(x, 'rpb-customer-reviews'));
  const rvHead = findFirst(rv, (x) => hasCls(x, 'customer-reviews-heading'));
  const rvSub = findFirst(rvHead, (x) => hasCls(x, 'h3'));
  const reviews = reviewItems(rv, P);
  const rvSlider = findFirst(rv, (x) => hasCls(x, 'customer-reviews-slider'));
  const ctas = findAll(findFirst(rv, (x) => hasCls(x, 'customer-reviews__ctas')), (x) => x.tag === 'a').map((a) => buttonOf(a, P, 'reviews'));
  const reviewsBlock = {
    heading: squash((rvHead.children || []).filter((x) => x.tag === '#text').map((x) => decode(x.text)).join(' ')),
    headingLook: lookOf(rvHead), subheading: squash(textOf(rvSub)), subheadingLook: lookOf(rvSub),
    splide: splideOf(rvSlider), items: reviews, ctas,
  };
  // --- ZIP finder data (inline script, printed on all 91 pages)
  const zipScript = findAll(root, (x) => x.tag === 'script' && /location1zips/.test((x.children[0] || {}).text || ''))[0];
  const js = zipScript.children[0].text;
  const arr = (name) => { const m = new RegExp('var ' + name + ' = (\\[[^\\]]*\\]);').exec(js); return JSON.parse(m[1].replace(/'/g, '"')); };
  const err = /<div class="zipcode-error[^"]*">([^<]*)<\/div>/.exec(js);
  const zipFinder = {
    sanPedro: arr('location1zips'), culverCity: arr('location2zips'),
    order: ['sanPedro', 'culverCity'], rows: { sanPedro: 'location1', culverCity: 'location2' },
    strings: { invalid: err ? err[1] : null },
    minLength: Number((/zip\.length < (\d+)/.exec(js) || [])[1] || 5),
    behaviour: 'zip.length < minLength -> show strings.invalid after the input; else the first array containing the value wins (sanPedro first: 90254 and 90503 are in both); a match shows that row inside the results step; no match shows the empty step. "Search Again" resets. No request, no redirect.',
    evidence: 'audit/raw/index.html inline script (lines 927-1005), printed on all 91 pages',
  };
  return { topBar, header, nav: navTrees, navFamilyPages: familyPages, marquee: { items: marqueeItems }, shoppingStrip: strips, offcanvas, footer, locationChooser, ageGate, reviews: reviewsBlock, zipFinder };
}

function reviewItems(rv, P) {
  return findAll(rv, (x) => hasCls(x, 'location-single-review')).map((r) => {
    const content = findFirst(r, (x) => hasCls(x, 'location-single-review-content'));
    const p = findFirst(content, (x) => x.tag === 'p') || content;
    const html = inl(p.children, P, 'reviews');
    const name = findFirst(r, (x) => hasCls(x, 'review-name'));
    const stars = findAll(r, (x) => isIcon(x) && hasCls(x, 'fa-star')).length;
    return { name: squash(textOf(name)), html, text: htmlText(html), stars };
  });
}

/* ======================================================================== pages */
function headInfo(root) {
  const head = findFirst(root, (x) => x.tag === 'head');
  const title = findFirst(head, (x) => x.tag === 'title');
  const can = findFirst(head, (x) => x.tag === 'link' && (x.attrs.rel || '') === 'canonical');
  const robots = findFirst(head, (x) => x.tag === 'meta' && x.attrs.name === 'robots');
  const desc = findFirst(head, (x) => x.tag === 'meta' && x.attrs.name === 'description');
  return { title: title ? decode(title.children[0] ? title.children[0].text : '').trim() : null, canonical: can ? can.attrs.href : null, robots: robots ? robots.attrs.content : null, description: desc ? desc.attrs.content : null, lang: (findFirst(root, (x) => x.tag === 'html') || { attrs: {} }).attrs.lang || null };
}

function breadcrumbsOf(root, P) {
  const nav = findFirst(root, (x) => x.tag === 'nav' && x.attrs['aria-label'] === 'breadcrumb');
  if (!nav) return [];
  return findAll(nav, (x) => x.tag === 'li').map((li) => {
    const a = findFirst(li, (x) => x.tag === 'a');
    const name = findFirst(li, (x) => x.attrs && x.attrs.itemprop === 'name');
    return { label: squash(textOf(name || li)), href: a ? P.link(a.attrs.href, 'subheader') : null, current: li.attrs['aria-current'] === 'page' };
  });
}

const KIND_BY_TEMPLATE = (p, bodyCls, famKey) => {
  if (p === '/') return 'home';
  if (/^\/location\/[^/]+\/shop\//.test(p)) return 'shop';
  if (/^\/location\/[^/]+\/$/.test(p)) return 'location';
  if (p === '/lax-menu/') return 'lax-menu';
  if (p.startsWith('/reviews/')) return 'review';
  if (p.startsWith('/author/')) return 'archive-author';
  if (p.startsWith('/location-pagetype/')) return 'archive-taxonomy';
  if (p === '/privacy-policy/' || p === '/accessibility-statement/') return 'legal';
  if (p === '/contact/') return 'contact';
  if (p === '/weed-delivery/') return 'delivery';
  if (p === '/products/') return 'products-hub';
  if (p.startsWith('/products/')) return 'product-category';
  if (p.startsWith('/education')) return 'education';
  if (p === '/service-area/') return 'service-area-hub';
  if (p.startsWith('/service-area/')) return 'service-area-town';
  return 'page';
};

function applyH1Rule(page, P, head) {
  const all = page.sections.flatMap((s) => headingsIn(s.blocks));
  const h1s = all.filter((h) => h.level === 1);
  if (h1s.length > 1) {
    for (const h of h1s.slice(1)) {
      P.change({ rule: 'A16', id: 'A16-demote', region: 'main', before: '<h1>' + h.text + '</h1>', after: '<h2>' + h.text + '</h2>', why: 'Exactly one h1 per page (BUILD-CONTRACT 4.9, A16). Text unchanged; the second h1 becomes an h2.' });
      h.level = 2; h.demotedFrom = 1;
    }
  }
  if (h1s.length === 0) {
    const promo = all.find((h) => h.level == null && h.look === 'h1');
    if (promo && page.kind === 'location') {
      P.change({ rule: 'A16', id: 'A16-promote', region: 'main', before: '<' + promo.tag + ' class="h1">' + promo.text + '</' + promo.tag + '>', after: '<h1>' + promo.text + '</h1>', why: 'The store page had no h1; its visible store title is promoted (OPEN-DECISIONS A16). Text unchanged.' });
      promo.level = 1; promo.promotedFrom = promo.tag;
    } else {
      const t = String(head.title || '').replace(/\s+[–-]\s+We Roll Up$/, '').trim();
      const heading = { type: 'heading', level: 1, look: 'h1', tag: 'h1', html: t.replace(/&/g, '&amp;').replace(/</g, '&lt;'), text: t, fromTitle: true };
      page.sections.unshift({ id: 's0', kind: 'page-header', heading: t, level: 1, sourceBg: null, blocks: [{ type: 'page-header', heading, image: null, overlay: null, source: 'title' }] });
      P.change({ rule: 'A16', id: 'A16-title-h1', region: 'main', before: '(no h1; no page header) <title>' + head.title + '</title>', after: '<h1>' + t + '</h1>', why: 'The page has no h1 and no visible title. The h1 text is its own <title> minus the site suffix, so no copy is invented (BUILD-CONTRACT 4.9, A16). Added visible text, declared in parity-exceptions.json.' });
    }
  }
  const final = page.sections.flatMap((s) => headingsIn(s.blocks)).filter((h) => h.level === 1);
  if (final.length !== 1) throw new Error(page.path + ': ' + final.length + ' h1 after the A16 rule');
  page.h1 = final[0].text;
}

/** the first content paragraph (A17), then fallbacks; returns { text, from } */
function firstParagraph(sections) {
  const walkB = (blocks, want) => {
    for (const b of blocks || []) {
      if (want(b)) return b;
      for (const k of ['blocks', 'intro', 'outro']) if (Array.isArray(b[k])) { const r = walkB(b[k], want); if (r) return r; }
      for (const k of ['cards', 'items']) if (Array.isArray(b[k])) for (const x of b[k]) if (x && x.blocks) { const r = walkB(x.blocks, want); if (r) return r; }
    }
    return null;
  };
  const all = sections.flatMap((s) => s.blocks);
  let b = walkB(all, (x) => x.type === 'paragraph' && !x.bare && x.text && x.text.split(' ').length >= 8);
  if (b) return { text: b.text, from: 'paragraph' };
  b = walkB(all, (x) => x.type === 'paragraph' && !x.bare && x.text && x.text.split(' ').length >= 5);
  if (b) return { text: b.text, from: 'paragraph' };
  b = walkB(all, (x) => x.type === 'paragraph' && x.text && x.text.split(' ').length >= 5);
  if (b) return { text: b.text, from: 'text-run' };
  b = walkB(all, (x) => x.type === 'list' && x.items.length);
  if (b) return { text: b.items[0].text, from: 'list-item' };
  b = walkB(all, (x) => x.type === 'notice');
  if (b) return { text: b.text, from: 'notice' };
  b = walkB(all, (x) => x.type === 'paragraph' && x.text);
  if (b) return { text: b.text, from: 'paragraph-short' };
  return null;
}
export function excerpt(text, max = 155) {
  const t = squash(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const sent = cut.slice(0, max).match(/^.*[.!?](?=\s)/);
  if (sent && sent[0].length >= 70) return sent[0];
  const i = cut.lastIndexOf(' ');
  return t.slice(0, i > 40 ? i : max).replace(/[\s,;:–—-]+$/, '');
}

function buildPage(entry, d, chromeFam, changes) {
  const P = new PageCtx(entry.path, d.rawFile, d.html, changes);
  const root = d.root;
  const head = headInfo(root);
  const main = findFirst(root, (x) => x.tag === 'main');
  if (!main) throw new Error(entry.path + ': no <main>');
  const famKey = Object.entries(chromeFam).find(([, ps]) => ps.includes(entry.path));
  const menuFamily = famKey ? { primary: 'primary', laxCulverCity: 'lax-culver-city', sanPedro: 'san-pedro' }[famKey[0]] : null;
  if (!menuFamily) throw new Error(entry.path + ': no menu family');
  const store = menuFamily === 'lax-culver-city' ? 'culver-city' : menuFamily === 'san-pedro' ? 'san-pedro' : null;
  const subheader = byId(root, 'scroll-text') ? 'marquee' : 'shopping-strip';
  const bodyCls = cls(findFirst(root, (x) => x.tag === 'body'));
  const page = {
    schema: 'werollup/page@1',
    kind: KIND_BY_TEMPLATE(entry.path, bodyCls),
    path: entry.path,
    slug: slugOf(entry.path),
    sourceUrl: entry.base.sourceUrl,
    rawFile: d.rawFile,
    wpTemplate: (bodyCls.find((c) => /^page-template-|^single-|^author$|^tax-/.test(c)) || null),
    store, menuFamily, subheader,
    title: head.title,
    metaDescription: null,
    metaDescriptionFrom: null,
    canonical: head.canonical || ORIGIN + (entry.path === '/' ? '/' : entry.path),
    canonicalFrom: head.canonical ? 'source' : 'self (A17: the source has none)',
    robots: head.robots,
    lang: head.lang,
    og: null,
    h1: null,
    breadcrumbs: breadcrumbsOf(root, P),
    sections: sectionsOf(main, P),
    embed: null,
    form: null,
    maps: [],
    headerArt: null,
    generated: { hero: null, art: [] },
    variants: entry.variants.map((v) => ({ query: v.query, sourceUrl: v.sourceUrl, rawFile: v.rawFile, canonical: null })),
    aliases: entry.aliases.map((a) => pathOfUrl(a) + (splitUrl(a).query || '')),
  };
  applyH1Rule(page, P, head);
  const fp = firstParagraph(page.sections);
  if (fp) { page.metaDescription = excerpt(fp.text); page.metaDescriptionFrom = fp.from; }
  else { page.metaDescription = excerpt(page.h1); page.metaDescriptionFrom = 'h1'; }
  // header art (the live page-header image)
  const ph = page.sections.flatMap((s) => s.blocks).find((b) => b.type === 'page-header');
  if (ph && ph.image) {
    const dflt = /werollup-products-champagne-bar-display-hero|werollup-trop-cherry-bag-prerolls-coffee-table-book-hero/.test(ph.image.src);
    page.headerArt = { ref: ph.image.ref, src: ph.image.src, source: dflt ? 'default' : 'page' };
  }
  // embeds, forms, maps (collected from the blocks)
  const blocksAll = [];
  const collect = (bs) => { for (const b of bs || []) { blocksAll.push(b); for (const k of ['blocks', 'intro', 'outro']) if (Array.isArray(b[k])) collect(b[k]); for (const k of ['cards', 'items']) if (Array.isArray(b[k])) for (const x of b[k]) if (x && x.blocks) collect(x.blocks); } };
  collect(page.sections.flatMap((s) => s.blocks));
  const emb = blocksAll.find((b) => b.type === 'embed');
  if (emb && emb.provider === 'jane') page.embed = { provider: 'jane', ...janeBlock(d.html, P) };
  else if (emb && emb.provider === 'weedmaps') page.embed = { provider: 'weedmaps', head: '', body: emb.html };
  const form = blocksAll.find((b) => b.type === 'form');
  if (form) page.form = { id: form.id, section: page.sections.find((s) => headingsIn(s.blocks).length >= 0 && JSON.stringify(s.blocks).includes('"type":"form"')).id };
  page.maps = blocksAll.filter((b) => b.type === 'map').map((m) => ({ src: m.src, width: m.width, height: m.height }));
  page.imagesUsed = [...new Set(P.images.map((i) => i.ref))].sort(cmp);
  return page;
}

/** the Jane block (BUILD-CONTRACT 4.6): head span minus StackAdapt, Source Sans Pro link repointed; body span verbatim */
export const JANE_FONT_CSS = '/assets/fonts/source-sans-pro.css';
function janeBlock(html, P) {
  const hs = html.indexOf('<!-- Jane Menu Plugin Header -->');
  const he = html.indexOf('<!-- /Jane Menu Plugin Header -->');
  const bs = html.indexOf('<!-- Jane Menu Plugin Body -->');
  const be = html.indexOf('<!-- /Jane Menu Plugin Body -->');
  if (hs < 0 || he < 0 || bs < 0 || be < 0) throw new Error(P.path + ': Jane block markers missing');
  let head = html.slice(hs, he + '<!-- /Jane Menu Plugin Header -->'.length);
  const body = html.slice(bs, be + '<!-- /Jane Menu Plugin Body -->'.length);
  // drop the StackAdapt <script> (the one inline script that mentions StackAdapt)
  const scripts = [...head.matchAll(/<script>[\s\S]*?<\/script>/g)];
  const sa = scripts.filter((m) => /stackadapt/i.test(m[0]));
  if (sa.length !== 1) throw new Error(P.path + ': expected exactly 1 StackAdapt script in the Jane head, found ' + sa.length);
  const saText = sa[0][0];
  head = head.replace(saText, '');
  const linkRe = /<link href="\/\/werollup\.com\/wp-content\/uploads\/omgf\/omgf-stylesheet-155\/omgf-stylesheet-155\.css\?ver=\d+" rel="stylesheet">/;
  const lm = linkRe.exec(head);
  if (!lm) throw new Error(P.path + ': Jane Source Sans Pro link not found');
  head = head.replace(lm[0], '<link href="' + JANE_FONT_CSS + '" rel="stylesheet">');
  if (/stackadapt/i.test(head)) throw new Error(P.path + ': StackAdapt residue in the Jane head');
  return {
    head, body,
    removed: [{ what: 'StackAdapt offsite-ad attribution script', bytes: saText.length, sha256: sha(saText) }],
    repointed: [{ from: lm[0], to: '<link href="' + JANE_FONT_CSS + '" rel="stylesheet">' }],
    sourceSpan: { headSha256: sha(html.slice(hs, he + 33)), bodySha256: sha(body) },
  };
}
import crypto from 'node:crypto';
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

/* ======================================================================== main */
export function extractAll() {
  const table = loadRouteTable();
  const changes = [];
  const docs = new Map();
  for (const e of table.paths) {
    const html = readText(e.base.rawFile);
    docs.set(e.path, { path: e.path, rawFile: e.base.rawFile, html, root: parse(html) });
  }
  const P0 = new PageCtx('*', 'audit/raw/index.html', docs.get('/').html, changes);
  const chrome = extractChrome(docs, P0, changes);
  // the chrome's A8 change entries were recorded per page while proving the families; keep one entry per page/region
  const pages = [];
  for (const e of table.paths) pages.push(buildPage(e, docs.get(e.path), chrome.navFamilyPages, changes));
  // per-variant canonicals (from each variant's own raw file)
  for (const p of pages) for (const v of p.variants) { const h = headInfo(parse(readText(v.rawFile))); v.canonical = h.canonical; }
  return { table, chrome, pages, changes };
}

function dedupeChanges(changes) {
  const seen = new Map();
  for (const c of changes) {
    const k = [c.page, c.rule, c.id, c.region, c.before, c.after].join('\u0001');
    if (seen.has(k)) seen.get(k).count++;
    else seen.set(k, { ...c, count: 1 });
  }
  return [...seen.values()].sort((a, b) => cmp(a.rule, b.rule) || cmp(a.id, b.id) || cmp(a.page, b.page) || cmp(a.region, b.region));
}

function parityExceptions(changes) {
  const list = [
    { id: 'PX-A2-review-order', rule: 'A2', page: '*', region: 'reviews', kind: 'set-order', reason: 'The live server shuffles the 5 review slides per request; the build uses one fixed order (audit/raw/index.html). Review slides are compared as a set: each source page is reordered to the fixed order before its word sequence is compared, after proving the set of slides is identical.', evidence: 'docs/CONTENT-MODEL.md section 3 (first-slide counts), OPEN-DECISIONS A2' },
    { id: 'PX-A7-doubled-h2', rule: 'A7', page: '/service-area/culver-city/culver-city-delivery-and-pickup/', region: 'main', kind: 'replace', from: 'Your Westside Service HubYour Westside Service Hub', to: 'Your Westside Service Hub', reason: 'Mechanical paste defect, not wording (OPEN-DECISIONS A7).', evidence: 'audit/raw/service-area-culver-city-culver-city-delivery-and-pickup.html line 351' },
    { id: 'PX-A7-wp-admin-link', rule: 'A7', page: '/products/', region: 'main', kind: 'link-only', text: 'Flower', reason: 'The pasted wp-admin edit link is removed; its anchor text "Flower" stays in the sentence, so the word sequence is unchanged. The check proves no wp-admin href survives.', evidence: 'audit/raw/products.html line 355' },
    { id: 'PX-A7-iframe-brief', rule: 'A7', page: '/service-area/culver-city/culver-city-delivery-and-pickup/', region: 'main', kind: 'must-not-render', text: 'Delivery Radius Graphic', reason: 'A designer brief inside the map <iframe> element. Browsers never render iframe content (the HTML parser treats it as raw text), so it is not source copy and must never become visible text.', evidence: 'audit/raw/service-area-culver-city-culver-city-delivery-and-pickup.html line 372' },
    { id: 'PX-A15-range-credit', rule: 'A15', page: '*', region: 'footer', kind: 'remove-source', text: 'Designed by Range Marketing', reason: 'The agency credit is stripped (OPEN-DECISIONS A15).', evidence: 'audit/raw/*.html footer-copyright' },
    { id: 'PX-A12-captcha', rule: 'A12', page: '/contact/', region: 'main', kind: 'remove-source', text: 'CAPTCHA', reason: 'The reCAPTCHA field and its label are dropped with the old backend (BUILD-CONTRACT 4.7).', evidence: 'audit/raw/contact.html #field_1_5' },
    { id: 'PX-A12-form-note', rule: 'A12', page: '/contact/', region: 'main', kind: 'remove-built', text: FORM_NOTE, reason: 'The visible note BUILD-CONTRACT 4.7 requires beside the disabled submit button (added text).', evidence: 'docs/BUILD-CONTRACT.md 4.7' },
  ];
  for (const c of changes.filter((x) => x.id === 'A16-title-h1')) {
    list.push({ id: 'PX-A16-title-h1', rule: 'A16', page: c.page, region: 'main', kind: 'remove-built', text: c.after.replace(/^<h1>|<\/h1>$/g, ''), reason: 'The page had no h1 and no visible title; its h1 is its own <title> text minus the site suffix (A16).', evidence: c.evidence });
  }
  return { schema: 'werollup/parity-exceptions@1', note: 'Read by tools/text-parity.mjs. Each entry: id, rule, page (output path or "*"), region (main|reviews|topbar|header|subheader|offcanvas|footer|chooser|agegate), kind (set-order|replace|remove-source|remove-built|must-not-render|link-only), text or from/to, reason, evidence. Generated by src/lib/extract.mjs.', exceptions: list };
}

function routesJson(table, pages) {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  return {
    schema: 'werollup/routes@1',
    origin: ORIGIN,
    counts: { records: table.records, paths: table.paths.length, variants: table.paths.reduce((n, e) => n + e.variants.length, 0), aliases: table.aliases.length, menuPaths: table.paths.filter((e) => /^\/location\/san-pedro\/shop\/menu\/[^/]+\/$/.test(e.path)).length },
    paths: table.paths.map((e) => ({ path: e.path, slug: slugOf(e.path), kind: byPath.get(e.path).kind, sourceUrl: e.base.sourceUrl, rawFile: e.base.rawFile, out: (e.path === '/' ? '' : e.path.slice(1)) + 'index.html', canonical: byPath.get(e.path).canonical, variants: e.variants.map((v) => ({ query: v.query, sourceUrl: v.sourceUrl, rawFile: v.rawFile, canonical: byPath.get(e.path).variants.find((x) => x.query === v.query).canonical })) })),
    menuPaths: table.paths.filter((e) => /^\/location\/san-pedro\/shop\/menu\/[^/]+\/$/.test(e.path)).map((e) => e.path),
    aliases: table.aliases.map((a) => ({ from: a.fromPath, fromQuery: a.fromQuery || null, sourceUrl: a.from, to: a.to, stub: a.fromPath.slice(1) + 'index.html' })),
    slashRedirects: table.paths.filter((e) => e.path !== '/').map((e) => ({ from: e.path.replace(/\/$/, ''), to: e.path })),
    notFound: { file: '404.html', janeBootPrefix: '/location/san-pedro/shop/menu/', knownDead: table.failed },
  };
}

/**
 * Every file extraction writes, serialised exactly as written: Map(absolute path -> text), plus a summary. Shared by
 * main() (write / --check) and src/build.mjs (staleContent), so the build runs the same comparison as --check.
 */
export function contentFiles() {
  const { table, chrome, pages, changes } = extractAll();
  const files = new Map();
  for (const p of pages) files.set(path.join(PAGES_DIR, p.slug + '.json'), json(p));
  files.set(path.join(PAGES_DIR, '_index.json'), json({ schema: 'werollup/page-index@1', count: pages.length, pages: pages.map((p) => ({ path: p.path, slug: p.slug, kind: p.kind, title: p.title, h1: p.h1, store: p.store, menuFamily: p.menuFamily, subheader: p.subheader, rawFile: p.rawFile, variants: p.variants.length })) }));
  const { navFamilyPages, ...chromeOut } = chrome;
  const crumbPages = pages.filter((p) => p.breadcrumbs.length);
  const breadcrumbs = {
    where: 'the shopping-strip pages only (subheader "shopping-strip": ' + crumbPages.length + ' paths); the 40 marquee pages have none',
    source: 'nav[aria-label=breadcrumb] inside #site-topbar (schema.org BreadcrumbList microdata in the source)',
    perPage: 'page.breadcrumbs = [{ label, href | null, current }], verbatim, in order',
    rule: ['Home -> /', 'Locations -> the current store page or its shop (source defect COMMERCE D-2, kept as the source has it)', '<store name> -> /location/<store>/ (only when the current page is below the store page)', '<current page title> (current: no link)'],
    paths: crumbPages.map((p) => p.path),
  };
  files.set(path.join(OUT, 'chrome.json'), json({ schema: 'werollup/chrome@1', source: 'audit/raw/index.html (global chrome); menu families proven identical on every page of the family; shopping strips from audit/raw/location-<store>.html', ...chromeOut, breadcrumbs, navFamilyCounts: { primary: navFamilyPages.primary.length, laxCulverCity: navFamilyPages.laxCulverCity.length, sanPedro: navFamilyPages.sanPedro.length } }));
  files.set(path.join(OUT, 'routes.json'), json(routesJson(table, pages)));
  const ch = dedupeChanges(changes);
  files.set(path.join(OUT, 'changes.json'), json({ schema: 'werollup/changes@1', note: 'Every applied change to source copy, links or structure. Rules: OPEN-DECISIONS A7 (mechanical defects), A8 (link targets), A12 (form), A15 (agency credit), A16 (one h1). Generated by src/lib/extract.mjs; count = occurrences of the identical change on that page.', counts: Object.fromEntries([...new Set(ch.map((c) => c.id))].sort(cmp).map((id) => [id, ch.filter((c) => c.id === id).reduce((n, c) => n + c.count, 0)])), changes: ch }));
  files.set(path.join(OUT, 'parity-exceptions.json'), json(parityExceptions(ch)));
  return { files, summary: pages.length + ' pages, ' + table.records + ' records, ' + table.aliases.length + ' aliases, ' + ch.length + ' change entries' };
}

/** the --check comparison: ['out of date: <rel>' | 'stale: <page file>'] (empty = src/content is in sync with audit/raw) */
export function staleContent(cf = contentFiles()) {
  const out = [];
  for (const [abs, data] of [...cf.files].sort((a, b) => cmp(a[0], b[0]))) if (!fs.existsSync(abs) || fs.readFileSync(abs, 'utf8') !== data) out.push('out of date: ' + path.relative(ROOT, abs).split(path.sep).join('/'));
  if (fs.existsSync(PAGES_DIR)) for (const f of fs.readdirSync(PAGES_DIR).sort(cmp)) if (!cf.files.has(path.join(PAGES_DIR, f))) out.push('stale: ' + f);
  return out;
}

function main() {
  const check = process.argv.includes('--check');
  const cf = contentFiles();
  let changed = 0;
  if (check) {
    const st = staleContent(cf);
    for (const s of st) console.log(s);
    changed = st.length;
  } else {
    for (const [abs, data] of [...cf.files].sort((a, b) => cmp(a[0], b[0]))) if (writeIfChanged(abs, data)) changed++;
    // stale page files
    if (fs.existsSync(PAGES_DIR)) for (const f of fs.readdirSync(PAGES_DIR)) if (!cf.files.has(path.join(PAGES_DIR, f))) fs.unlinkSync(path.join(PAGES_DIR, f));
  }
  console.log((check ? 'check: ' : 'extract: ') + cf.summary + '; ' + changed + (check ? ' out of date' : ' files written'));
  if (check && changed) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
