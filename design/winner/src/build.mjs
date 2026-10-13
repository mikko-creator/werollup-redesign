// build.mjs — writes tmp/panel/b/index.html and tmp/panel/b/flower.html from one set of chrome partials.
//   node tmp/panel/b/src/build.mjs
// Copy is verbatim (see content.mjs). Links keep the live site's paths, root-relative; data-proto-href lets the
// prototype's JS point Home and Flower at the two local files so a reviewer can click between them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productsTree, categories, education, social, reviews, zip } from './content.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const reviewCtas = JSON.parse(fs.readFileSync(path.join(HERE, 'review-ctas.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- icons (original, simple line glyphs) ----
const I = {
  store: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  pin: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.4" fill="currentColor"/></svg>',
  clock: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  chev: '<svg class="ico ico--chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg class="ico ico--arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  star: '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 6 6.5.6-4.9 4.3 1.5 6.4L12 16.8 6.1 20.1l1.5-6.4L2.7 9.4l6.5-.6z" fill="currentColor"/></svg>',
  user: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21a8 8 0 0 1 16 0z" fill="currentColor"/></svg>',
  phone: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5l3 .5 1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5.5 3c0 1-1 2-2 2C11 19.5 4.5 13 4.5 5.5c0-1 1-2 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  edit: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  truck: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a1.8 1.8 0 1 0 0-.1M17 19a1.8 1.8 0 1 0 0-.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  check: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const logo = (variant = 'white', w = 186, cls = '') => {
  const h = Math.round((w * 71) / 400);
  return `<img class="wordmark ${cls}" src="img/logo-${variant}.png" width="${w}" height="${h}" alt="We Roll Up Logo">`;
};

const linkList = (items, cls = '') => items.map(([l, h, proto]) => `<li><a class="${cls}" href="${esc(h)}"${proto ? ` data-proto-href="${proto}"` : ''}>${esc(l)}</a></li>`).join('\n');

const catCards = (cls, sizes) => categories.map((c, i) => `
          <li class="${cls}__item">
            <a class="${cls}" href="${esc(c.href)}"${c.proto ? ` data-proto-href="${c.proto}"` : ''} style="--i:${i}">
              <span class="${cls}__media"><img src="${c.img}" width="400" height="500" alt="" loading="${sizes === 'eager' ? 'eager' : 'lazy'}" decoding="async"></span>
              <span class="${cls}__label">${esc(c.label)}${I.arrow}</span>
            </a>
          </li>`).join('');

// ---------------------------------------------------------------- chrome
function head(title, desc, preload) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<link rel="preload" href="fonts/libre-franklin-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/BricolageGrotesque-var.ttf" as="font" type="font/ttf" crossorigin>
${preload}
<link rel="stylesheet" href="css/aura.css">
<script>document.documentElement.classList.replace('no-js','js');</script>
</head>`;
}

function header() {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-head" id="siteHead" data-qa="header">
  <div class="topbar">
    <div class="wrap topbar__in">
      <div class="topbar__store">
        ${I.store}
        <label class="vh" for="currently-shopping">Choose your store</label>
        <span class="select">
          <select name="currently-shopping" id="currently-shopping">
            <option value="">Select a Location</option>
            <option value="/location/culver-city/" data-slug="culver-city" data-address="11834 Jefferson Boulevard" data-hours="Open: 10:00 AM - 10:00 PM" data-menu-url="/location/culver-city/shop/">LAX - Culver City</option>
            <option value="/location/san-pedro/" data-slug="san-pedro" data-address="1705 S Gaffey Street" data-hours="Open: 10:00 AM - 10:00 PM" data-menu-url="/location/san-pedro/shop" selected>San Pedro - Palos Verdes</option>
          </select>
          ${I.chev}
        </span>
      </div>
      <div class="topbar__details" id="activeLocationDetails">
        <span class="topbar__addr">${I.pin}<span id="locationAddress">1705 S Gaffey Street</span></span>
        <span class="topbar__hours">${I.clock}<span id="locationHours">Open: 10:00 AM - 10:00 PM</span></span>
      </div>
      <ul class="topbar__social">
        ${social.map(([l, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener">${l}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
  <div class="navbar">
    <div class="wrap navbar__in">
      <a class="navbar__brand" href="https://werollup.com" data-proto-href="index.html">${logo('white', 186)}</a>
      <nav class="navbar__nav" aria-label="Main">
        <ul class="navbar__links">
          <li><button class="navbar__link navbar__mega-btn" type="button" aria-expanded="false" aria-controls="mega" id="megaBtn">Products ${I.chev}</button></li>
          <li><a class="navbar__link" href="https://werollup.com/about-us/daily-deals/">Daily Deals</a></li>
          <li><a class="navbar__link" href="https://werollup.com/weed-delivery/">Delivery</a></li>
          <li><a class="navbar__link" href="https://werollup.com/contact/">Contact</a></li>
        </ul>
      </nav>
      <div class="navbar__actions">
        <button class="navbar__menu" type="button" aria-expanded="false" aria-controls="drawer" id="menuBtn" aria-label="Open menu">${I.menu}<span class="navbar__menu-label" aria-hidden="true">Menu</span></button>
        <a class="btn btn--leaf btn--sm active-location-menu" href="/location/san-pedro/shop" data-lax-url="https://werollup.com/location/culver-city/shop/" data-sanpedro-url="https://werollup.com/location/san-pedro/shop/">Order Now</a>
      </div>
    </div>
    <div class="scroll-line" aria-hidden="true"><span></span></div>
  </div>
  <div class="mega" id="mega" hidden>
    <div class="wrap mega__in">
      <ul class="mega__cards" role="list">${catCards('mcard', 'lazy')}
      </ul>
      <div class="mega__stores">
        <div class="mega__col">
          <p class="mega__head">San Pedro</p>
          <ul>${linkList(productsTree.sanPedro, 'mega__link')}</ul>
        </div>
        <div class="mega__col">
          <p class="mega__head">LAX</p>
          <ul>${linkList(productsTree.lax, 'mega__link')}</ul>
        </div>
      </div>
    </div>
  </div>
</header>`;
}

function drawer() {
  const group = (id, label, inner, open = false) => `
      <li class="dgroup">
        <button class="dgroup__btn" type="button" aria-expanded="${open}" aria-controls="${id}">${esc(label)}${I.chev}</button>
        <div class="dgroup__panel" id="${id}"${open ? '' : ' hidden'}>${inner}</div>
      </li>`;
  return `
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation" hidden>
  <div class="drawer__scrim" data-close></div>
  <div class="drawer__panel">
    <div class="drawer__head">
      <a href="https://werollup.com" data-proto-href="index.html">${logo('white', 150)}</a>
      <button class="drawer__close" type="button" aria-label="Close menu" data-close>${I.close}</button>
    </div>
    <nav class="drawer__nav" aria-label="Mobile navigation">
      <ul class="drawer__list">${group('dg-loc', 'Locations', `<ul class="dlinks">${linkList([['LAX - Culver City', '/location/culver-city'], ['San Pedro - Palos Verdes', '/location/san-pedro']])}</ul>`)}${group('dg-prod', 'Products', `
          <ul class="dcards" role="list">${catCards('dcard', 'lazy')}
          </ul>
          <p class="dlinks__head">San Pedro</p>
          <ul class="dlinks">${linkList(productsTree.sanPedro)}</ul>
          <p class="dlinks__head">LAX</p>
          <ul class="dlinks">${linkList(productsTree.lax)}</ul>`, true)}${group('dg-edu', 'Education', `<ul class="dlinks">${linkList(education)}</ul>`)}
        <li><a class="drawer__top" href="https://werollup.com/about-us/">About</a></li>
        <li><a class="drawer__top" href="https://werollup.com/about-us/daily-deals/">Daily Deals</a></li>
        <li><a class="drawer__top" href="https://werollup.com/contact/">Contact</a></li>
      </ul>
      <ul class="drawer__social">${social.map(([l, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener">${l}</a></li>`).join('')}</ul>
    </nav>
    <div class="drawer__cta">
      <a class="btn btn--leaf btn--block active-location-menu" href="/location/san-pedro/shop" aria-label="Order Now">${I.store}Order Now</a>
    </div>
  </div>
</div>`;
}

function reviewsBand() {
  return `
<section class="reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="reviews__head" data-reveal>
      <h2 class="reviews__title display-2" id="reviews-title">Our Reviews</h2>
      <p class="reviews__sub">What our customers are saying</p>
    </div>
  </div>
  <div class="reviews__rail">
    <div class="reviews__track" id="reviewTrack" tabindex="0" aria-label="Our Reviews">
      ${reviews.map((r, i) => `<article class="rcard" style="--i:${i}">
        <div class="rcard__stars" role="img" aria-label="5 stars">${I.star.repeat(5)}</div>
        <p class="rcard__text">${r.html}</p>
        <p class="rcard__name">${I.user}${esc(r.name)}</p>
      </article>`).join('\n      ')}
    </div>
  </div>
  <div class="wrap reviews__foot">
    <div class="reviews__ctrl">
      <button class="round-btn" type="button" data-dir="-1" aria-label="Previous review"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="round-btn" type="button" data-dir="1" aria-label="Next review"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
    <div class="reviews__ctas">
      ${reviewCtas.map((c, i) => `<a class="btn ${i % 2 ? 'btn--line' : 'btn--forest'}" href="${esc(c.href)}" target="_blank" rel="noopener">${i % 2 ? I.edit : ''}${esc(c.label)}</a>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="site-foot">
  <div class="site-foot__aura" aria-hidden="true"></div>
  <div class="wrap site-foot__in">
    <div class="site-foot__brand">
      <a href="https://werollup.com" data-proto-href="index.html"><img class="wordmark" src="img/logo-white.png" width="240" height="43" alt="We Roll UpLogo" loading="lazy"></a>
      <ul class="site-foot__social">${social.map(([l, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener" aria-label="${l} Link">${l}</a></li>`).join('')}</ul>
    </div>
    <div class="site-foot__store">
      <h2 class="site-foot__h">San Pedro - Palos Verdes</h2>
      <p>1705 S Gaffey Street, San Pedro, CA 90731</p>
      <p><a class="ulink" href="tel:+1424 264 5423">${I.phone}424 264 5423</a></p>
    </div>
    <div class="site-foot__store">
      <h2 class="site-foot__h">LAX - Culver City</h2>
      <p>11834 Jefferson Boulevard,  Culver City,  CA 11834</p>
      <p><a class="ulink" href="tel:+1888-777-6655">${I.phone}888-777-6655</a></p>
    </div>
    <nav class="site-foot__links" aria-labelledby="ql-title">
      <h2 class="site-foot__h site-foot__h--white" id="ql-title">Quick Links</h2>
      <ul>
        <li><a class="ulink" href="https://werollup.com/" data-proto-href="index.html">Home</a></li>
        <li><a class="ulink" href="/location/culver-city/shop/">Shop LAX - Culver City</a></li>
        <li><a class="ulink" href="/location/san-pedro/shop/">Shop San Pedro - Palos Verdes</a></li>
        <li><a class="ulink" href="https://werollup.com/about-us/daily-deals/">Daily Deals</a></li>
        <li><a class="ulink" href="https://werollup.com/location/culver-city/">LAX - Culver City</a></li>
        <li><a class="ulink" href="https://werollup.com/location/san-pedro/">San Pedro - Palos Verdes</a></li>
        <li><a class="ulink" href="https://werollup.com/about-us/">About Us</a></li>
      </ul>
    </nav>
  </div>
  <div class="wrap site-foot__base">
    <a class="site-foot__licence ulink" href="/home" data-proto-href="index.html">Cannabis License: C10-0000854-LIC</a>
    <p class="site-foot__copy">© 2026 We Roll Up All rights reserved.</p>
    <a class="ulink" href="/privacy-policy">Privacy Policy</a>
  </div>
</footer>`;
}

function gate() {
  return `
<div class="gate" id="ageGateModal" role="dialog" aria-modal="true" aria-labelledby="gateTitle" hidden>
  <div class="gate__photo" aria-hidden="true"><img src="img/storefront-car-side-1920.webp" width="1920" height="1439" alt="" loading="lazy" decoding="async"></div>
  <div class="gate__veil" aria-hidden="true"></div>
  <div class="gate__card">
    <div class="gate__plate gate__plate--2" aria-hidden="true"></div>
    <div class="gate__plate gate__plate--1" aria-hidden="true"></div>
    <div class="gate__surface">
      <img class="wordmark gate__logo" src="img/logo-white.png" width="220" height="39" alt="We Roll Up Logo">
      <h2 class="gate__title" id="gateTitle">Verify Your Age</h2>
      <div class="gate__main"><p>Are you over the age of 21?</p></div>
      <div class="gate__denied" hidden><p>We're sorry, but you do not meet the required age to enter this website.</p></div>
      <div class="gate__buttons">
        <button type="button" class="btn btn--cream" id="ageGateYes">Yes, I'm 21+</button>
        <button type="button" class="btn btn--ghost" id="ageGateNo">No, I'm Under 21</button>
      </div>
      <div class="gate__stores" id="locationGateWrapper" hidden>
        <p class="gate__stores-head">Choose your location</p>
        <div class="gate__list" id="locationGate">
          <div class="gate__row">
            <div><h3 class="gate__store">LAX - Culver City</h3><p>11834 Jefferson Boulevard</p></div>
            <a href="https://werollup.com/location/culver-city/" class="gate__go location-select-btn">Shop here ${I.arrow}</a>
          </div>
          <div class="gate__row">
            <div><h3 class="gate__store">San Pedro - Palos Verdes </h3><p>1705 S Gaffey Street</p></div>
            <a href="https://werollup.com/location/san-pedro/" class="gate__go location-select-btn">Shop here ${I.arrow}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

const tail = `
<script>window.__ZIP = ${JSON.stringify(zip)};</script>
<script src="js/aura.js" defer></script>
</body>
</html>
`;

// ---------------------------------------------------------------- home
function home() {
  return `${head('We Roll Up | Shop Our Weed Products', 'Full menu for your selected store, plus fresh daily deals. Browse everything in stock — and check rotating specials before you shop.',
    '<link rel="preload" as="image" href="img/hero-bud-2400.webp" media="(min-width: 701px)" fetchpriority="high">\n<link rel="preload" as="image" href="img/hero-bud-phone.webp" media="(max-width: 700px)" fetchpriority="high">')}
<body class="page-home">
${header()}
${drawer()}
<main id="main">

  <!-- HERO: plane 0 macro still (generated), plane 1 haze, plane 2 the glass pane -->
  <section class="hero" data-depth aria-labelledby="hero-title">
    <div class="hero__media plane" style="--d:70">
      <picture>
        <source media="(max-width: 700px)" srcset="img/hero-bud-phone.webp" width="1300" height="1536">
        <img src="img/hero-bud-2400.webp" width="2400" height="1340" alt="" fetchpriority="high" decoding="async">
      </picture>
    </div>
    <div class="hero__haze plane" style="--d:30" aria-hidden="true"></div>
    <div class="wrap hero__in">
      <div class="hero__pane" data-qa="hero-copy">
        <h1 class="hero__title" id="hero-title"><span class="hero__l1">Shop Our</span> <span class="hero__l2"><span class="glow-word">Weed</span> Products</span></h1>
        <p class="hero__lead">Full menu for your selected store, plus fresh daily deals.</p>
        <p class="hero__sub">Browse everything in stock — and check rotating specials before you shop.</p>
        <div class="hero__ctas">
          <a href="/location/culver-city/shop/" class="btn btn--leaf js-location-chooser" data-lax-url="/location/culver-city/shop/" data-sanpedro-url="/location/san-pedro/shop/">Order Now ${I.arrow}</a>
          <a href="/about-us/daily-deals/" class="btn btn--ghost js-location-chooser" data-lax-url="/about-us/daily-deals/" data-sanpedro-url="/about-us/daily-deals/">See Deals</a>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICE BAND (calm, light): Delivery card + the two store cards; the postcards break out of the card tops -->
  <section class="service" aria-label="Delivery and stores">
    <div class="wrap service__grid">
      <div class="rv" data-reveal style="--i:0">
        <article class="dcardx">
          <div class="dcardx__aura" aria-hidden="true"></div>
          <h2 class="dcardx__title">Delivery</h2>
          <p class="dcardx__lead">Get your order how and where it works for you.</p>
          <p class="dcardx__sub">Pickup, delivery, and flexible options—so you never have to miss what you want.</p>
          <a href="/weed-delivery/" class="btn btn--leaf js-location-chooser" data-lax-url="/weed-delivery/" data-sanpedro-url="/weed-delivery/">${I.truck}Delivery</a>
        </article>
      </div>
      <div class="rv" data-reveal style="--i:1">
        <article class="scard scard--mint">
          <img class="scard__post" data-protrude src="img/postcard-san-pedro-600.webp" width="600" height="531" alt="Illustrated postcard of San Pedro - Palos Verdes" loading="lazy" decoding="async">
          <div class="scard__body">
            <p class="scard__name">San Pedro - Palos Verdes</p>
            <p class="scard__addr">1705 S Gaffey Street</p>
            <p class="scard__addr">San Pedro, CA 90731</p>
            <a class="btn btn--leaf btn--sm" href="https://werollup.com/location/san-pedro/shop">Shop now ${I.arrow}</a>
          </div>
        </article>
      </div>
      <div class="rv" data-reveal style="--i:2">
        <article class="scard scard--peach">
          <img class="scard__post" data-protrude src="img/postcard-lax-culver-city-600.webp" width="600" height="569" alt="Illustrated postcard of LAX - Culver City" loading="lazy" decoding="async">
          <div class="scard__body">
            <p class="scard__name">LAX - Culver City</p>
            <p class="scard__addr">11834 Jefferson Boulevard</p>
            <p class="scard__addr"> Culver City,  CA 11834 </p>
            <a class="btn btn--leaf btn--sm" href="https://werollup.com/location/culver-city/shop">Shop now ${I.arrow}</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- NIGHT BAND: the signature light box (stacked glass plates that separate on scroll) + accordions -->
  <section class="night" data-depth aria-labelledby="serve-title">
    <div class="night__atmo plane" style="--d:90" aria-hidden="true"><img src="img/mist-ribbons-2400.webp" width="2400" height="1028" alt="" loading="lazy" decoding="async"></div>
    <div class="wrap night__grid">
      <div class="lightbox" data-depth-host>
        <div class="lightbox__plate lightbox__plate--3 plane" style="--d:46" aria-hidden="true"></div>
        <div class="lightbox__plate lightbox__plate--2 plane" style="--d:26" aria-hidden="true"></div>
        <figure class="lightbox__frame plane" style="--d:8">
          <img src="img/sour-kush-jar-gallery-1200.webp" width="1200" height="1600" alt="We Roll Up image" loading="lazy" decoding="async">
        </figure>
        <img class="lightbox__cut plane" data-protrude style="--d:-56" src="img/cbd-bottle-cut-420.webp" width="420" height="1242" alt="We Roll Up CBD tincture bottle" loading="lazy" decoding="async">
      </div>
      <div class="rv" data-reveal>
        <article class="copycard">
          <h2 class="display-2" id="serve-title">We Are Here to Serve Your Cannabis Needs</h2>
          <p>Let us welcome you, share insight into our extensive menu of cannabis products and guide you through a positive and rewarding experience. Our friendly staff is here to help, and we always have a Spanish-speaking member of our team onsite. You’re going to enjoy exploring a wealth of options, including exceptional smokable flower, all types of pre-rolls, a wide variety of vapes, delicious gummies and</p>
          <p><a href="/shop" class="btn btn--leaf js-location-chooser" data-lax-url="/location/culver-city/shop/" data-sanpedro-url="/location/san-pedro/shop/">Order Now ${I.arrow}</a></p>
        </article>
      </div>
    </div>

    <div class="wrap accordion" id="rpb-accordion">
      <div class="acc rv" data-reveal>
        <h2 class="acc__h"><button class="acc__btn" type="button" aria-expanded="true" aria-controls="acc-0" id="acc-0-h"><span>Convenient Ways to Get Your Cannabis</span><span class="acc__icon" aria-hidden="true"></span></button></h2>
        <div class="acc__panel" id="acc-0" role="region" aria-labelledby="acc-0-h">
          <div class="acc__body">
            <p>Finding your perfect strain is our mission. We just love elevating the quality of life and are more than happy to smooth your path with conveniences such as online ordering, in-store pickup, and curbside pickup.</p>
          </div>
        </div>
      </div>
      <div class="acc rv" data-reveal>
        <h2 class="acc__h"><button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-1" id="acc-1-h"><span>Shop Cannabis In-Store or Order Online for Pickup &amp; Delivery</span><span class="acc__icon" aria-hidden="true"></span></button></h2>
        <div class="acc__panel" id="acc-1" role="region" aria-labelledby="acc-1-h" hidden>
          <div class="acc__body">
            <h3>Shop Cannabis In-Store or Order Online for Pickup &amp; Delivery</h3>
            <p>As the first legal, licensed cannabis dispensary in San Pedro, We Roll Up continues to pioneer change for the better — and that includes bringing the dispensary experience directly to your door with our convenient, discreet, and reliable delivery service. We believe access should never be a barrier, which is why we’ve made it easier than ever to get exactly what you need, whether you prefer to browse our welcoming in-store environment or place a delivery order from the comfort of home. Our doors are open and our delivery runs seven days a week, because your schedule matters and your comfort matters even more. We serve anyone and everyone from all walks of life — recreational novices trying cannabis for the first time, devoted enthusiasts who know their preferences inside and out, medicinal patients counting on consistency and care, locals who’ve made us part of their weekly routine, and visitors discovering everything San Pedro has to offer. If you’re 21 or older with a valid ID, getting what you need from We Roll Up has never been simpler — shop in store or place your delivery order and let us handle the rest. Our knowledgeable, passionate, and genuinely helpful staff members are committed to making every interaction exceptional, whether they’re guiding you through options at the counter or delivering your order straight to your doorstep with the efficiency, discretion, and care you deserve. However you choose to shop with us, the We Roll Up experience comes to you.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- COMMUNITY (calm, light): pale light box with the LA cap breaking out of the frame -->
  <section class="community" data-depth aria-labelledby="community-title">
    <div class="wrap community__grid">
      <div class="rv" data-reveal>
        <div class="community__copy">
          <h2 class="display-2" id="community-title">A Community Built <span class="ink-word">Around Cannabis</span></h2>
          <p>For recreational and medicinal marijuana, We Roll Up is where potential and opportunity meet. We bring communities together through a supportive atmosphere and quality products that enrich socialization, bring medicinal relief, and provide a variety of options to suit all needs. Stop by from anywhere across the country and discover the best of cannabinoids, terpenes and effects.</p>
          <p><a href="/shop" class="btn btn--forest js-location-chooser" data-lax-url="/location/culver-city/shop/" data-sanpedro-url="/location/san-pedro/shop/">Shop Now ${I.arrow}</a></p>
        </div>
      </div>
      <div class="lightbox lightbox--pale">
        <div class="lightbox__plate lightbox__plate--3 plane" style="--d:40" aria-hidden="true"></div>
        <div class="lightbox__plate lightbox__plate--2 plane" style="--d:22" aria-hidden="true"></div>
        <figure class="lightbox__frame plane" style="--d:6">
          <img src="img/red-lighter-cards-1200.webp" width="1200" height="1600" alt="We Roll Up image" loading="lazy" decoding="async">
        </figure>
        <img class="lightbox__cap plane" data-protrude style="--d:-60" src="img/cap-cut-900.webp" width="900" height="774" alt="We Roll Up Los Angeles cap" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

  <!-- DELIVERY LOCATION (night aura, calm) -->
  <section class="zipband" aria-labelledby="zcs-title">
    <div class="zipband__aura" aria-hidden="true"></div>
    <div class="wrap zipband__grid">
      <figure class="photo-frame rv" data-reveal>
        <img src="img/storefront-car-rear-1200.webp" width="1200" height="1599" alt="We Roll Up image" loading="lazy" decoding="async">
      </figure>
      <div class="rv" data-reveal style="--i:1">
        <div class="zipcard">
          <div class="zip-code-search-box">
            <div class="zcs-step" id="zcs1">
              <h2 class="zcs-title display-2" id="zcs-title">Your Delivery Location</h2>
            </div>
            <div class="zcs-step" id="zcs-empty" hidden>
              <p class="zcs-title zcs-title--sm">No Locations Found</p>
              <p>We’re sorry! We couldn’t find any locations matching the zip code you entered. Please try another search, and to be safe feel free to call us at <a class="ulink" href="tel:424 264 5423">424 264 5423</a> to confirm if we have options for your area or not.</p>
            </div>
            <div class="zcs-step zcs-results" hidden>
              <p class="zcs-title zcs-title--sm">Awesome! We deliver to you. Fast!</p>
              <p>Please order from this menu:</p>
              <div class="zcs-row" id="location1" hidden>
                <p class="zcs-loc"><strong>Location:</strong> <a class="ulink" href="https://werollup.com/location/san-pedro/">San Pedro</a></p>
                <p class="zcs-check">${I.check} Delivery</p>
                <p><a href="/location/san-pedro/shop/" class="btn btn--cream btn--sm">${I.truck} Delivery Menu</a></p>
                <p><button type="button" class="btn btn--ghost btn--sm zcs-go-back">Search Again</button></p>
              </div>
              <div class="zcs-row" id="location2" hidden>
                <p class="zcs-loc"><strong>Location:</strong> <a class="ulink" href="https://werollup.com/location/culver-city/">Playa Vista</a></p>
                <p class="zcs-check">${I.check} Delivery</p>
                <p><a href="/location/culver-city/shop/" class="btn btn--cream btn--sm">${I.truck} Delivery Menu</a></p>
                <p><button type="button" class="btn btn--ghost btn--sm zcs-go-back">Search Again</button></p>
              </div>
            </div>
            <form class="zcs-form" id="zipSearchForm" name="zipSearchForm" novalidate>
              <label class="vh" for="zipcode">Enter Your Zip Code</label>
              <input type="number" id="zipcode" name="zipcode" placeholder="Enter Your Zip Code" inputmode="numeric" required>
              <button type="submit" class="btn btn--leaf" id="submitzip">Find my Location</button>
              <p class="zcs-error" id="zipError" role="alert"></p>
            </form>
          </div>
        </div>
        <p class="zipband__order"><a href="/shop" class="btn btn--ghost js-location-chooser" data-lax-url="/location/culver-city/shop/" data-sanpedro-url="/location/san-pedro/shop/">Order Now ${I.arrow}</a></p>
      </div>
    </div>
  </section>
</main>
${reviewsBand()}
${footer()}
${gate()}
${tail}`;
}

// ---------------------------------------------------------------- flower
function flower() {
  return `${head('Flower | We Roll Up', 'Smoking remains the most popular cannabis consumption method. It’s also one of the simplest. Whether you choose joints, pipes or bongs, all you need is the device,',
    '<link rel="preload" as="image" href="img/trichome-field-2400.webp" media="(min-width: 701px)" fetchpriority="high">\n<link rel="preload" as="image" href="img/trichome-field-phone.webp" media="(max-width: 700px)" fetchpriority="high">')}
<body class="page-flower">
${header()}
${drawer()}
<main id="main">
  <section class="banner" data-depth aria-labelledby="page-title">
    <div class="banner__media plane" style="--d:60">
      <picture>
        <source media="(max-width: 700px)" srcset="img/trichome-field-phone.webp" width="1400" height="1536">
        <img src="img/trichome-field-2400.webp" width="2400" height="1340" alt="" fetchpriority="high" decoding="async">
      </picture>
    </div>
    <div class="banner__veil" aria-hidden="true"></div>
    <div class="wrap banner__in">
      <h1 class="banner__title" id="page-title">Flower</h1>
    </div>
    <img class="banner__bud plane" data-protrude style="--d:-40" src="img/bud-cut-760.webp" width="760" height="864" alt="Macro of a cured cannabis bud" decoding="async">
  </section>

  <section class="intro">
    <div class="wrap intro__grid">
      <div class="intro__copy rv" data-reveal>
        <h2 class="eyebrow-h">Why are we so especially proud of our selection of flower?</h2>
        <h2 class="display-2">Weed Flower at We Roll Up</h2>
        <p class="lede">Smoking remains the most popular cannabis consumption method. It’s also one of the simplest. Whether you choose joints, pipes or bongs, all you need is the device, a lighter and premium bud from We Roll Up, and you’re set to enjoy an ideal experience. Shopping our shelves is a discovery of conscientiously cultivated and carefully curated flower. We carry the brands you’ve heard good things about and the new innovations everyone will soon be talking about.</p>
      </div>
    </div>
  </section>

  <section class="hits" data-depth aria-labelledby="hits-title">
    <div class="hits__atmo plane" style="--d:70" aria-hidden="true"><img src="img/mist-ribbons-2400.webp" width="2400" height="1028" alt="" loading="lazy" decoding="async"></div>
    <div class="wrap">
      <h2 class="hits__title rv" data-reveal id="hits-title"><span class="hits__our">Our Flower</span> <span class="hits__big">Hits <span class="glow-word">Different</span></span></h2>
      <ul class="hits__list">
        <li class="rv" data-reveal style="--i:0"><div class="hcard"><strong class="hcard__t">Flavor</strong><span class="hcard__b"><span class="hcard__dash">–</span> We offer the results of painstaking and sophisticated growing practices, evidenced by the rich and wonderful flavor of each strain.</span></div></li>
        <li class="rv" data-reveal style="--i:1"><div class="hcard"><strong class="hcard__t">Variety</strong><span class="hcard__b"><span class="hcard__dash">–</span> From our very own brand of hybrids to a wide selection of indicas and sativas, there’s certain to be the perfect potency and effects for your preference.</span></div></li>
        <li class="rv" data-reveal style="--i:2"><div class="hcard"><strong class="hcard__t">Quality</strong><span class="hcard__b"><span class="hcard__dash">–</span> From the gorgeous color and exceptional texture, to the plentiful pistils and trichomes, our flower looks, smells and tastes amazing.</span></div></li>
        <li class="rv" data-reveal style="--i:3"><div class="hcard"><strong class="hcard__t">Cleanliness</strong><span class="hcard__b"><span class="hcard__dash">–</span> You can be sure our bud is free of seeds and contaminants</span></div></li>
        <li class="rv" data-reveal style="--i:4"><div class="hcard"><strong class="hcard__t">Enjoyment</strong><span class="hcard__b"><span class="hcard__dash">–</span> Nothing is quite the same as lighting up a joint to socialize, share or simply kick back and appreciate.</span></div></li>
      </ul>
    </div>
    <figure class="hits__photo plane" data-protrude style="--d:-30"><img src="img/flower-grinders-1280.webp" width="1280" height="720" alt="Flower background image" loading="lazy" decoding="async"></figure>
  </section>

  <section class="find" aria-labelledby="find-title">
    <div class="wrap find__grid">
      <div class="find__copy rv" data-reveal>
        <h3 class="display-3" id="find-title">Find the Flower You’re Looking for At We Roll Up</h3>
        <p>We Roll Up offers a welcoming, comfortable and casual atmosphere for medicinal patients, recreational enthusiasts and all walks of life. Our friendly staff is knowledgeable in<a class="ulink" href="https://werollup.com/products/"> our products</a>, and we always have a Spanish-speaking employee available. As the first licensed marijuana dispensary in San Pedro, we set the bar that much higher. Browse our flower in-store or by way of our website. For a quicker turnaround, order online for in-store or curbside pickup. Watch for delivery coming soon!</p>
        <p><a href="/shop" class="btn btn--forest active-location-menu">Shop Now ${I.arrow}</a></p>
      </div>
    </div>
  </section>

  <section class="editorial" aria-hidden="true">
    <img src="img/mason-jars-1920.webp" width="1920" height="1280" alt="" loading="lazy" decoding="async">
  </section>

  <article class="longform">
    <div class="wrap longform__grid">
      <div class="longform__col">
        <div class="rv" data-reveal>
        <h2>Cannabis Flower: The Heart of the Plant</h2>
        <p>If you have ever stood at a dispensary counter wondering which jar holds the strain that matches your evening plans, you already understand why flower remains the centerpiece of cannabis culture. It is the most recognizable, most versatile, and arguably most honest form of the plant. At We Roll Up in <a class="ulink" href="https://werollup.com/service-area/lax/">LAX</a> and San Pedro, the first licensed cannabis <a class="ulink" href="https://werollup.com/service-area/san-pedro/">dispensary in San Pedro</a>, flower is where our passion truly shows. Every bud on our shelves has been chosen because it represents the quality, aroma, and effect that we want our community to experience.</p>
        <p>Flower refers to the dried, cured buds of the female cannabis plant. These buds carry the trichomes, the tiny resin glands that contain cannabinoids like THC and CBD, along with the terpenes responsible for scent and flavor. When you smoke or vaporize flower, you are experiencing the plant in its most complete and natural state, untouched by the additional processing that goes into concentrates or edibles.</p>
        </div>
        <div class="rv" data-reveal>
        <h3>From Harvest to Shelf: How Flower Is Prepared</h3>
        <p>The journey of a quality bud begins long before it reaches our menu. After cultivators harvest the plants, the flower must be trimmed, dried, and cured. Drying lowers the moisture content slowly, which prevents mold and preserves the delicate terpene profile. Curing then allows the buds to rest in controlled containers, smoothing out harshness and deepening flavor over a period of weeks.</p>
        <p>By the time flower arrives at We Roll Up, it has passed through state-mandated lab testing for potency and contaminants. We review these results so we know exactly what each strain offers. Proper storage continues in-store, where temperature and humidity are managed to keep buds fresh, fragrant, and ready for you to enjoy the moment you take them home.</p>
        </div>
        <div class="rv" data-reveal>
        <h2>Understanding Strain Types and Effects</h2>
        <p>Choosing flower is rarely about THC percentage alone. The interplay of cannabinoids and terpenes shapes how a strain actually feels, a phenomenon often called the entourage effect. Our team takes the time to walk you through the categories so you can match the experience to your needs.</p>
        <ul class="strains">
          <li><strong>Indica-leaning flower:</strong> Often associated with relaxation, body-heavy sensations, and evening or nighttime use when you want to unwind.</li>
          <li><strong>Sativa-leaning flower:</strong> Frequently chosen for daytime activity, creativity, and a more uplifting, mentally engaging experience.</li>
          <li><strong>Hybrid flower:</strong> Blended genetics that balance qualities of both, giving you flexibility for a range of moods and moments.</li>
          <li><strong>High-CBD flower:</strong> Lower in psychoactive intensity and popular among those seeking calm without a pronounced high.</li>
        </ul>
        <p>These categories are starting points rather than strict rules. Terpenes such as myrcene, limonene, and pinene play a major role in how a strain behaves, which is why two indicas can feel quite different. We encourage you to ask questions, smell the jars when available, and explore until you find your match.</p>
        </div>
        <div class="rv" data-reveal>
        <h3>Ways to Enjoy Flower</h3>
        <p>One reason flower endures is its sheer flexibility. You can grind it and roll it into a joint, pack it into a pipe or bong, or load it into a dry-herb vaporizer for a cleaner inhalation experience. Each method changes the pace and intensity of effects, giving you control over your session. For those who prefer convenience, we also stock pre-rolls made from quality flower, ready to enjoy without any preparation.</p>
        <p>Flower is equally useful for the home enthusiast who likes to craft. Many of our customers use it as the base for homemade infusions, butters, and oils. Whether you are a recreational novice trying your first eighth or a seasoned connoisseur seeking a specific terpene profile, our hand-picked selection is designed to fit your routine.</p>
        </div>
        <div class="rv" data-reveal>
        <h2>Why San Pedro Chooses We Roll Up for Flower</h2>
        <p>We are proud to function as part of the local society, serving recreational users, medical patients, novices, and aficionados alike. Our doors are open seven days a week, and we always have a Spanish-speaking member of our team onsite to make sure everyone feels welcome. We offer conveniences like online ordering, in-store pickup, and curbside pickup, so picking up your favorite flower fits easily into your day.</p>
        <p>Beyond San Pedro, we proudly serve the surrounding California, bringing affordable, lab-verified flower to neighbors throughout Carson, San Pedro, Wilmington, Westchester, Rancho Palos Verdes, Mar Vista, Del Rey, Lomita, Palos Verdes Estates, Playa Vista, Marina Del Ray, Fox Hills, Rolling Hills Estates, Rolling Hills, and LAX. Stop by and let our knowledgeable staff guide you through an extensive menu, share insight into the strains we carry, and help you leave with a smile. <a class="ulink" href="https://werollup.com/">At We Roll Up</a>, finding your perfect flower is more than a transaction. It is part of how we elevate quality of life and bring our community together, one bud at a time.</p>
        </div>
      </div>
    </div>
  </article>
</main>
${reviewsBand()}
${footer()}
${gate()}
${tail}`;
}

// wrap the text of every .btn in a span, so the label box (not the pill corners or the ring) is what contrast tools measure
const wrapBtn = (html) => html.replace(/(<(a|button)\b[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, inner, close) =>
  open + inner.replace(/(^|>)([^<]+)(?=<|$)/g, (mm, p, t) => (t.trim() ? p + '<span class="btn__t">' + t.trim() + '</span>' : mm)) + close);
fs.writeFileSync(path.join(OUT, 'index.html'), wrapBtn(home()));
fs.writeFileSync(path.join(OUT, 'flower.html'), wrapBtn(flower()));
console.log('wrote index.html and flower.html');
