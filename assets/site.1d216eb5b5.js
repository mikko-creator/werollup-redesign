/* site.js */
/* site.js - FOUNDATION behaviour (DESIGN-SPEC 6, 7; BUILD-CONTRACT 4.4, 4.5). One deferred script, no dependencies.
   Every feature runs in its own try/catch, so one failure never stops the others (and never a phase-2 file).
   Features: age gate (A6, D-15), store switcher and Order Now (4.5), location chooser (D-9), mega menu (D-10), menu
   sheet (6.5), header state and progress line (6.2, 7.3), reveals (7.2), depth planes (5.1), loops (7.5), reviews rail
   (D-25: no autoplay), accordions (6.13), ZIP finder (6.14). No infinite CSS animation; under reduced motion no scroll,
   wheel or resize listener is attached (D-13, R-26). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var run = function (name, fn) { try { fn(); } catch (e) { if (window.console) console.error('site.js ' + name + ': ', e); } };
  var reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  html.classList.add(reduced ? 'reduced-motion' : 'motion-ok');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var secure = location.protocol === 'https:' ? '; Secure' : '';
  var readCookie = function (k) { var m = new RegExp('(?:^|;\\s*)' + k + '=([^;]*)').exec(d.cookie); return m ? decodeURIComponent(m[1]) : null; };
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var focusables = function (root) { return $$(FOCUSABLE, root).filter(function (el) { return el.offsetParent !== null || el === d.activeElement; }); };

  /* ---------------------------------------------------------------- modal helpers: inert, scroll lock, focus trap */
  var inertStack = [];
  function setInert(keep, on) {
    if (on) {
      var changed = [];
      Array.prototype.forEach.call(body.children, function (el) {
        if (keep.indexOf(el) >= 0 || el.tagName === 'SCRIPT' || el.inert) return;
        el.inert = true; el.setAttribute('aria-hidden', 'true'); changed.push(el);
      });
      inertStack.push(changed);
    } else {
      var list = inertStack.pop() || [];
      list.forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
    }
  }
  function trap(container, e) {
    if (e.key !== 'Tab') return;
    var f = focusables(container);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (d.activeElement === first || !container.contains(d.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (d.activeElement === last || !container.contains(d.activeElement))) { e.preventDefault(); first.focus(); }
  }

  /* ---------------------------------------------------------------- 6.7 age gate (A6, D-15) */
  var KEY = 'agePass_v2';
  function gatePassed() {
    try { if (localStorage.getItem(KEY) === 'true') return true; } catch (e) { /* storage blocked */ }
    try { if (sessionStorage.getItem(KEY) === 'true') return true; } catch (e) { /* storage blocked */ }
    return readCookie(KEY) === 'true';
  }
  function setPass() {
    try { localStorage.setItem(KEY, 'true'); } catch (e) { /* storage blocked */ }
    d.cookie = KEY + '=true; max-age=31536000; path=/; SameSite=Lax' + secure;
  }
  run('gate', function () {
    var gate = $('#ageGateModal');
    if (!gate) return;
    if (gatePassed()) { html.classList.add('age-ok'); html.classList.remove('age-gate'); gate.classList.add('is-passed'); return; }
    html.classList.add('gate-open');
    body.classList.add('gate-open');
    setInert([gate], true);
    var yes = $('#ageGateYes', gate), no = $('#ageGateNo', gate), btns = $('[data-gate-btns]', gate), q = $('[data-gate-q]', gate);
    var denied = $('[data-gate-denied]', gate), list = $('#locationGateWrapper', gate);
    gate.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); return; } // the source: keyboard:false
      trap(gate, e);
    });
    yes.addEventListener('click', function () {
      list.hidden = false; btns.classList.add('is-yes'); no.hidden = true; yes.setAttribute('aria-disabled', 'true');
      var first = $('.gate__store', list); if (first) first.focus();
    });
    no.addEventListener('click', function () {
      q.hidden = true; btns.hidden = true; denied.hidden = false; denied.focus();
    });
    $$('.gate__store', gate).forEach(function (a) {
      a.addEventListener('click', function () {
        setPass();
        html.classList.add('age-ok'); html.classList.remove('age-gate', 'gate-open'); body.classList.remove('gate-open');
        gate.classList.add('is-passed'); setInert([gate], false);
      });
    });
    (yes || gate).focus();
  });

  /* ---------------------------------------------------------------- 4.5 store switcher and Order Now */
  var STORE_COOKIE = 'selected_location';
  var pathStore = function () { var m = /^\/werollup-redesign\/location\/(culver-city|san-pedro)(\/|$)/.exec(location.pathname); return m ? m[1] : null; };
  var cookiesOn = (function () { try { return navigator.cookieEnabled !== false; } catch (e) { return false; } })();
  function currentStore() { return pathStore() || readCookie(STORE_COOKIE) || null; }
  function optionFor(slug) { return $$('#currently-shopping option').filter(function (o) { return o.getAttribute('data-slug') === slug; })[0] || null; }
  function storeUrl(el, slug) {
    var lax = el.getAttribute('data-lax-url'), sp = el.getAttribute('data-sanpedro-url');
    if (lax || sp) return slug === 'culver-city' ? lax : sp;
    var o = optionFor(slug); return o ? o.getAttribute('data-menu-url') : null;
  }
  function applyStore(slug) {
    html.classList.remove('store-culver-city', 'store-san-pedro', 'has-store');
    if (slug !== 'culver-city' && slug !== 'san-pedro') return;
    html.classList.add('has-store', 'store-' + slug);
    var sel = $('#currently-shopping'), o = optionFor(slug);
    if (sel && o) sel.value = o.value;
    $$('.active-location-menu').forEach(function (a) { var u = storeUrl(a, slug); if (u) a.setAttribute('href', u); });
  }
  run('switcher', function () {
    if (!cookiesOn) html.classList.add('no-cookies');
    applyStore(currentStore());
    var sel = $('#currently-shopping');
    if (sel) sel.addEventListener('change', function () {
      var o = sel.options[sel.selectedIndex], slug = o && o.getAttribute('data-slug');
      if (!slug) return;
      d.cookie = STORE_COOKIE + '=' + slug + '; max-age=2592000; path=/; SameSite=Lax' + secure;
      applyStore(slug);
      if (o.value) location.href = o.value; // navigates to the store page (4.5)
    });
  });

  /* ---------------------------------------------------------------- 6.8 location chooser (D-9) */
  var chooser = $('#locationChooserModal'), chooserTrigger = null;
  function closeChooser() {
    if (!chooser || chooser.hidden) return;
    chooser.hidden = true; body.classList.remove('location-chooser-open'); setInert([chooser], false);
    if (chooserTrigger) chooserTrigger.focus();
  }
  function openChooser(trigger) {
    if (!chooser) return false;
    chooserTrigger = trigger || null;
    var lax = trigger && trigger.getAttribute('data-lax-url'), sp = trigger && trigger.getAttribute('data-sanpedro-url');
    $$('[data-location-chooser-card]', chooser).forEach(function (c) {
      var k = c.getAttribute('data-location-chooser-card');
      if (k === 'lax' && lax) c.setAttribute('href', lax);
      if (k === 'sanpedro' && sp) c.setAttribute('href', sp);
    });
    closeMega(); closeSheet(true);
    chooser.hidden = false; body.classList.add('location-chooser-open'); setInert([chooser], true);
    var f = $('[data-location-chooser-card]', chooser) || $('.dialog__close', chooser); if (f) f.focus();
    return true;
  }
  run('chooser', function () {
    if (!chooser) return;
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.js-location-chooser');
      if (t) { if (openChooser(t)) e.preventDefault(); return; }
      var o = e.target.closest && e.target.closest('.js-selected-location-menu');
      if (o) {
        var slug = currentStore();
        if (slug) { var u = storeUrl(o, slug); if (u) o.setAttribute('href', u); return; } // follows the store's URL
        if (openChooser(o)) e.preventDefault();
      }
    });
    $$('[data-dialog-close]', chooser).forEach(function (b) { b.addEventListener('click', closeChooser); });
    chooser.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeChooser(); } else trap(chooser, e); });
    $$('[data-location-chooser-card]', chooser).forEach(function (c) {
      c.addEventListener('click', function () {
        var slug = c.getAttribute('data-location-chooser-card') === 'lax' ? 'culver-city' : 'san-pedro';
        d.cookie = STORE_COOKIE + '=' + slug + '; max-age=2592000; path=/; SameSite=Lax' + secure;
      });
    });
  });

  /* ---------------------------------------------------------------- 6.4 mega menu (D-10, R-18) */
  var megaBtn = $('#megaBtn'), mega = $('#megaPanel'), megaBy = '', megaHoverT = 0;
  function closeMega(returnFocus) {
    if (!mega || mega.hidden) return;
    clearTimeout(megaHoverT); megaBy = '';
    mega.hidden = true; megaBtn.setAttribute('aria-expanded', 'false');
    var li = megaBtn.closest('.mainnav__mega'); if (li) li.classList.remove('is-hover-open');
    if (returnFocus) megaBtn.focus();
  }
  function openMega(by) {
    if (!mega || !mega.hidden) return;
    megaBy = by; mega.hidden = false; megaBtn.setAttribute('aria-expanded', 'true');
    var li = megaBtn.closest('.mainnav__mega'); if (li && by === 'hover') li.classList.add('is-hover-open');
  }
  run('mega', function () {
    if (!megaBtn || !mega) return;
    megaBtn.addEventListener('click', function (e) {
      // revision 1 (operator 2026-10-14): a panel the mouse already opened by hovering stays open on a click (pinned)
      if (!mega.hidden) { if (megaBy === 'hover') { megaBy = 'click'; return; } closeMega(false); return; }
      openMega('click');
      // a keyboard open (Enter / Space: click with detail 0) moves focus to the first card; a mouse open does not
      if (e.detail === 0) { var first = $('.mcard', mega) || $('a', mega); if (first) first.focus(); }
    });
    // revision 1: open on mouse hover (fine pointers only), after 70 ms of intent; leaving closes after 260 ms, and
    // re-entering the button or the panel (both inside li.mainnav__mega) cancels the close. Touch and keyboard unchanged.
    var megaLi = megaBtn.closest('.mainnav__mega');
    var fine = window.matchMedia ? matchMedia('(hover: hover) and (pointer: fine)') : null;
    if (megaLi) {
      megaLi.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || (fine && !fine.matches)) return;
        clearTimeout(megaHoverT);
        if (mega.hidden) megaHoverT = setTimeout(function () { openMega('hover'); }, 70);
      });
      megaLi.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(megaHoverT);
        if (megaBy !== 'hover') return;
        megaHoverT = setTimeout(function () { if (megaBy === 'hover') closeMega(false); }, 260);
      });
    }
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mega.hidden && (mega.contains(d.activeElement) || d.activeElement === megaBtn)) { e.preventDefault(); closeMega(true); } });
    d.addEventListener('pointerdown', function (e) { if (!mega.hidden && !mega.contains(e.target) && !megaBtn.contains(e.target)) closeMega(false); });
    mega.addEventListener('focusout', function (e) { var to = e.relatedTarget; if (to && !mega.contains(to) && to !== megaBtn) closeMega(false); });
    if (window.matchMedia) { var mq = matchMedia('(max-width: 1023px)'); var onMq = function () { if (mq.matches) closeMega(false); }; if (mq.addEventListener) mq.addEventListener('change', onMq); }
  });

  /* ---------------------------------------------------------------- 6.5 menu sheet */
  var sheet = $('#defaultOffcanvas'), scrim = $('.sheet-scrim'), sheetTrigger = null;
  function closeSheet(silent) {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true; if (scrim) scrim.hidden = true; body.classList.remove('sheet-open'); html.classList.remove('sheet-open');
    setInert([sheet, scrim], false);
    $$('.menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!silent && sheetTrigger) sheetTrigger.focus();
  }
  run('sheet', function () {
    if (!sheet) return;
    $$('.menu-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        sheetTrigger = b; closeMega(false);
        sheet.hidden = false; if (scrim) scrim.hidden = false; body.classList.add('sheet-open'); html.classList.add('sheet-open');
        setInert([sheet, scrim], true); b.setAttribute('aria-expanded', 'true');
        var c = $('.sheet__close', sheet); if (c) c.focus();
      });
    });
    $$('[data-sheet-close]').forEach(function (b) { b.addEventListener('click', function () { closeSheet(false); }); });
    sheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeSheet(false); } else trap(sheet, e); });
    $$('.sgroup__btn', sheet).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = d.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true'); if (p) p.hidden = open;
      });
    });
  });

  /* ---------------------------------------------------------------- 6.13 accordions */
  run('accordion', function () {
    $$('[data-accordion]').forEach(function (acc) {
      var btns = $$('.acc__btn', acc);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var open = b.getAttribute('aria-expanded') === 'true';
          btns.forEach(function (o) { // one panel open at a time (6.13)
            var p = d.getElementById(o.getAttribute('aria-controls')), item = o.closest('.acc__item');
            var on = o === b ? !open : false;
            o.setAttribute('aria-expanded', on ? 'true' : 'false'); if (p) p.hidden = !on; if (item) item.classList.toggle('is-open', on);
          });
        });
      });
    });
  });

  /* ---------------------------------------------------------------- 6.15 reviews rail: Previous / Next, never autoplay */
  run('rail', function () {
    $$('[data-rail]').forEach(function (rail) {
      var root = rail.closest('.reviews') || rail.parentNode;
      var prev = $('[data-rail-prev]', root), next = $('[data-rail-next]', root);
      var items = $$('.review', rail);
      if (!items.length) return;
      var step = function () { var a = items[0].getBoundingClientRect(), b = items[1] ? items[1].getBoundingClientRect() : null; return b ? b.left - a.left : a.width; };
      var go = function (dir) { rail.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' }); };
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      if ('IntersectionObserver' in window && prev && next) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var full = e.intersectionRatio > 0.9;
            if (e.target === items[0]) prev.disabled = full;
            if (e.target === items[items.length - 1]) next.disabled = full;
          });
        }, { root: rail, threshold: [0, 0.9, 1] });
        io.observe(items[0]); io.observe(items[items.length - 1]);
      }
    });
  });

  /* ---------------------------------------------------------------- 6.14 ZIP finder (strings and arrays verbatim) */
  run('zip', function () {
    $$('[data-zip]').forEach(function (zip) {
      var dataEl = $('#zipFinderData', zip); if (!dataEl) return;
      var data = JSON.parse(dataEl.textContent);
      var form = $('[data-zip-form]', zip), input = $('input', form), msg = $('.zip__msg', zip);
      var steps = { start: $('[data-zip-step="start"]', zip), empty: $('[data-zip-step="empty"]', zip), results: $('[data-zip-step="results"]', zip) };
      var show = function (name, rowId) {
        steps.start.hidden = name !== 'start'; form.hidden = name !== 'start';
        steps.empty.hidden = name !== 'empty'; steps.results.hidden = name !== 'results';
        $$('[data-zip-row]', zip).forEach(function (r) { r.hidden = r.getAttribute('data-zip-row') !== rowId; });
      };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = String(input.value || '').trim();
        if (v.length < (data.minLength || 5) || !/^\d+$/.test(v)) { msg.textContent = (data.strings && data.strings.invalid) || ''; input.focus(); return; }
        msg.textContent = '';
        var order = data.order || ['sanPedro', 'culverCity'], hit = null;
        for (var i = 0; i < order.length; i++) { var list = data[order[i]] || []; if (list.indexOf(v) >= 0) { hit = order[i]; break; } } // first match wins
        if (hit) { show('results', data.rows[hit]); var row = d.getElementById(data.rows[hit]); var a = row && $('a', row); if (a) a.focus(); }
        else { show('empty'); var t = $('.zip__title', steps.empty); if (t) { t.setAttribute('tabindex', '-1'); t.focus(); } }
      });
      $$('[data-zip-again]', zip).forEach(function (b) { b.addEventListener('click', function () { show('start'); input.value = ''; input.focus(); }); });
    });
  });

  /* ---------------------------------------------------------------- 7.5 loops: play only when 25 % visible, the tab is
     visible and motion is allowed; a pause control remembered for the session; posters only under reduced motion */
  run('loops', function () {
    var KEYL = 'wru-motion-paused';
    var userPaused = false; try { userPaused = sessionStorage.getItem(KEYL) === '1'; } catch (e) { /* storage blocked */ }
    $$('[data-loop]').forEach(function (w) {
      var v = $('video', w), btn = $('.loop__toggle', w); if (!v) return;
      v.muted = true; v.pause();
      if (reduced) return;
      var visible = false;
      var update = function () {
        w.classList.toggle('is-paused', userPaused);
        if (btn) btn.setAttribute('aria-label', userPaused ? (btn.getAttribute('data-label-play') || '') : (btn.getAttribute('data-label-pause') || ''));
        if (!userPaused && visible && !d.hidden) { var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay refused */ }); } else v.pause();
      };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.intersectionRatio >= 0.25; }); update(); }, { threshold: [0, 0.25, 0.5, 1] }).observe(w);
      d.addEventListener('visibilitychange', update);
      if (btn) btn.addEventListener('click', function () { userPaused = !userPaused; try { sessionStorage.setItem(KEYL, userPaused ? '1' : '0'); } catch (e) { /* storage blocked */ } update(); });
      update();
    });
  });

  /* ---------------------------------------------------------------- 6.2 header state: an IntersectionObserver sentinel
     (no scroll listener) sets .is-scrolled after 8 px; the G2 glass applies only then */
  run('header', function () {
    if (!('IntersectionObserver' in window)) return;
    var s = d.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:8px;left:0;width:1px;height:1px;pointer-events:none;';
    body.insertBefore(s, body.firstChild);
    new IntersectionObserver(function (es) { es.forEach(function (e) { html.classList.toggle('is-scrolled', !e.isIntersecting); }); }).observe(s);
  });

  /* ---------------------------------------------------------------- 7.2 reveals (the traps, as rules) */
  var waiting = [];
  function reveal(el, now) {
    if (!el.classList.contains('is-wait')) return;
    el.classList.remove('is-wait'); el.classList.add(now ? 'is-now' : 'is-in');
    var i = waiting.indexOf(el); if (i >= 0) waiting.splice(i, 1);
  }
  run('reveal', function () {
    if (reduced) return; // reduced motion: nothing is ever hidden
    var ih = window.innerHeight;
    $$('[data-reveal]').forEach(function (el) {
      if (el.closest('.site-footer, .promo, .shopstrip')) return; // never animated in (7.2 rule 6)
      if (el.getBoundingClientRect().top >= ih) { el.classList.add('is-wait'); waiting.push(el); } // only fully below the first screen
    });
    if (!waiting.length) return;
    if (!('IntersectionObserver' in window)) { waiting.slice().forEach(function (el) { reveal(el, true); }); return; }
    var delivered = false;
    var io = new IntersectionObserver(function (es) {
      delivered = true;
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target, false); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px' });
    waiting.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!delivered) waiting.slice().forEach(function (el) { reveal(el, true); }); }, 3000); // dead observer only
    d.addEventListener('focusin', function (e) { var w = e.target.closest && e.target.closest('[data-reveal].is-wait'); if (w) reveal(w, true); });
  });

  /* ---------------------------------------------------------------- 5.1 / 7.3 depth planes, progress line, the
     catch-up reveal check: ONE passive rAF-throttled listener, never under reduced motion */
  run('scroll', function () {
    if (reduced) return;
    var line = $('.scroll-line span');
    var wide = window.matchMedia ? matchMedia('(min-width: 761px)') : { matches: true };
    var planes = $$('[data-depth]');
    var ticking = false;
    var frame = function () {
      ticking = false;
      var ih = window.innerHeight, sh = d.documentElement.scrollHeight - ih;
      if (line) line.style.setProperty('--sp', sh > 0 ? clamp(window.scrollY / sh, 0, 1).toFixed(4) : '0');
      if (wide.matches) planes.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > ih + 200) return;
        var p = clamp((r.top + r.height / 2 - ih / 2) / ((ih + r.height) / 2), -1, 1);
        el.style.setProperty('--p', p.toFixed(3));
      });
      for (var i = waiting.length - 1; i >= 0; i--) { if (waiting[i].getBoundingClientRect().top < ih * 0.94) reveal(waiting[i], false); }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
  });
})();

/* home.js */

/* pages-a.js */

/* pages-b.js */
/* pages-b.js (TEMPLATES-B). Revision 1 (operator 2026-10-14): the "Shop by Category" infinite loop.
   The static HTML holds every category card once (verbatim labels and links). Here, when motion is allowed, the items
   are cloned once (aria-hidden, inert, links out of the tab order) so the track can move by exactly -50% with no seam
   (pages-b.css .pcat.is-looping). A pause/play button satisfies WCAG 2.2.2; hover and keyboard focus also pause it,
   and it pauses while off-screen. Under prefers-reduced-motion nothing runs: the row stays a static scroll row. */
(function () {
  var d = document;
  var boxes = d.querySelectorAll('[data-pcat]');
  if (!boxes.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  Array.prototype.forEach.call(boxes, function (box) {
    var track = box.querySelector('.pcat__track');
    if (!track || track.children.length < 3 || box.classList.contains('is-looping')) return;
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('inert', '');
      c.classList.add('pcat__item--clone');
      Array.prototype.forEach.call(c.querySelectorAll('a, button, [tabindex]'), function (el) { el.setAttribute('tabindex', '-1'); });
      track.appendChild(c);
    });
    box.style.setProperty('--pcat-dur', Math.max(28, originals.length * 6) + 's');
    var btn = d.createElement('button');
    btn.type = 'button';
    btn.className = 'pcat__toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Pause the category carousel');
    btn.innerHTML = '<span class="pcat__toggle-ico" aria-hidden="true"></span>';
    btn.addEventListener('click', function () {
      var paused = box.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.setAttribute('aria-label', paused ? 'Play the category carousel' : 'Pause the category carousel');
    });
    box.appendChild(btn);
    box.classList.add('is-looping');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { box.classList.toggle('is-offscreen', !e.isIntersecting); });
      }, { threshold: 0 }).observe(box);
    }
  });
})();
