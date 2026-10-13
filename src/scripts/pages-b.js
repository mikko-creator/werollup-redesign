/* pages-b.js (TEMPLATES-B). The "Shop by Category" loop.
   Revision 1 (operator 2026-10-14): an infinite loop of floating product cut-outs.
   Revision 3 (operator 2026-10-14): "an ability to manually scroll through shop by category section on top of it
   automatically scrolling". The movement is now driven here through scrollLeft (no CSS track animation), so every native
   way of scrolling also works: mouse drag, touch swipe, trackpad, keyboard focus, plus two arrow buttons. Three copies of
   the items ([clones][originals][clones]; clones aria-hidden, inert, out of the tab order) keep both directions seamless:
   the view is held inside the middle copy. Automatic movement pauses while the pointer is over the row, while it holds
   focus, while it is off-screen or the tab is hidden, after the pause button, and for 2.6 s after any manual scroll; it
   never runs under prefers-reduced-motion (manual scrolling and the arrows still work). The static HTML keeps each card
   once, so text and link parity are untouched. */
(function () {
  var d = document, w = window;
  var boxes = d.querySelectorAll('[data-pcat]');
  if (!boxes.length) return;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  var now = function () { return w.performance && performance.now ? performance.now() : Date.now(); };

  each(boxes, function (box) {
    var vp = box.querySelector('.pcat__viewport'), track = box.querySelector('.pcat__track');
    if (!vp || !track || track.children.length < 3 || box.classList.contains('is-looping')) return;
    var originals = Array.prototype.slice.call(track.children), n = originals.length;
    var mkClone = function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('inert', '');
      c.classList.add('pcat__item--clone');
      each(c.querySelectorAll('a, button, [tabindex]'), function (el) { el.setAttribute('tabindex', '-1'); });
      return c;
    };
    originals.forEach(function (li) { track.insertBefore(mkClone(li), originals[0]); }); // leading copy
    originals.forEach(function (li) { track.appendChild(mkClone(li)); });                // trailing copy
    box.classList.add('is-looping');

    var setW = 0, step = 0;
    function measure() {
      var a = track.children[n], a2 = track.children[n + 1], b = track.children[2 * n];
      setW = b.getBoundingClientRect().left - a.getBoundingClientRect().left;  // one full copy, gap included
      step = a2.getBoundingClientRect().left - a.getBoundingClientRect().left; // one item, gap included
    }
    function norm(x) { if (setW <= 0) return x; while (x < setW * 0.5) x += setW; while (x > setW * 1.5) x -= setW; return x; }
    measure();
    var pos = setW;            // the float source of truth (scrollLeft may round)
    vp.scrollLeft = pos;

    var paused = false, hovered = false, focused = false, offscreen = false, dragging = false, tween = null, lastUser = -1e9;
    var speed = function () { return w.innerWidth <= 700 ? 28 : 42; };   // px per second
    var mark = function () { lastUser = now(); };

    // native scrolling (touch, trackpad, keyboard focus): follow it, keep the view inside the middle copy
    vp.addEventListener('scroll', function () {
      if (tween || dragging) return;
      var sl = vp.scrollLeft;
      if (Math.abs(sl - pos) < 2) return;      // our own write (rounded); not a visitor scroll
      var ns = norm(sl);
      if (ns !== sl) vp.scrollLeft = ns;
      pos = ns;
      mark();
    }, { passive: true });
    ['wheel', 'touchstart', 'touchmove'].forEach(function (t) { vp.addEventListener(t, mark, { passive: true }); });

    // mouse drag to scroll; a drag never activates the link it started on
    var downX = 0, downSL = 0, pressed = false, moved = false, suppress = false;
    vp.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pressed = true; moved = false; downX = e.clientX; downSL = vp.scrollLeft; tween = null; mark();
    });
    vp.addEventListener('pointermove', function (e) {
      if (!pressed) return;
      var dx = e.clientX - downX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true; dragging = true; box.classList.add('is-dragging');
        try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      if (!moved) return;
      var target = downSL - dx, nt = norm(target);
      if (nt !== target) downSL += nt - target;
      vp.scrollLeft = nt; pos = nt; mark();
    });
    var endDrag = function () {
      if (!pressed) return;
      pressed = false;
      if (moved) { suppress = true; setTimeout(function () { suppress = false; }, 0); }
      dragging = false; box.classList.remove('is-dragging'); mark();
    };
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('click', function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; } }, true);
    vp.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // arrow buttons: one item per press, eased; the wrap is applied on every frame of the tween
    var mkNav = function (cls, label, dir) {
      var b = d.createElement('button');
      b.type = 'button';
      b.className = 'pcat__nav pcat__nav--' + cls;
      b.setAttribute('aria-label', label);
      b.innerHTML = '<span class="pcat__nav-ico" aria-hidden="true"></span>';
      b.addEventListener('click', function () { mark(); tween = { from: vp.scrollLeft, dist: dir * step, t0: now(), dur: 460 }; });
      box.appendChild(b);
    };
    mkNav('prev', 'Previous categories', -1);
    mkNav('next', 'Next categories', 1);

    // pause control for the automatic movement (WCAG 2.2.2); manual scrolling always works
    if (!reduce) {
      var toggle = d.createElement('button');
      toggle.type = 'button';
      toggle.className = 'pcat__toggle';
      toggle.setAttribute('aria-pressed', 'false');
      toggle.setAttribute('aria-label', 'Pause the category carousel');
      toggle.innerHTML = '<span class="pcat__toggle-ico" aria-hidden="true"></span>';
      toggle.addEventListener('click', function () {
        paused = !paused;
        box.classList.toggle('is-paused', paused);
        toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
        toggle.setAttribute('aria-label', paused ? 'Play the category carousel' : 'Pause the category carousel');
      });
      box.appendChild(toggle);
    }

    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovered = true; });
    box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hovered = false; });
    box.addEventListener('focusin', function () { focused = true; });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) focused = false; });
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { offscreen = !en.isIntersecting; box.classList.toggle('is-offscreen', offscreen); });
      }, { threshold: 0 }).observe(box);
    }

    var last = now();
    function tick(t) {
      var dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
      if (tween) {
        var k = Math.min(1, (now() - tween.t0) / tween.dur), e = 1 - Math.pow(1 - k, 3);
        var target = tween.from + tween.dist * e, nt = norm(target);
        if (nt !== target) tween.from += nt - target;
        vp.scrollLeft = nt; pos = nt;
        if (k >= 1) tween = null;
      } else if (!reduce && !paused && !hovered && !focused && !offscreen && !dragging && !d.hidden && now() - lastUser > 2600) {
        pos = norm(pos + speed() * dt);
        vp.scrollLeft = pos;
      }
      w.requestAnimationFrame(tick);
    }
    w.requestAnimationFrame(tick);

    var rt = 0;
    w.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { var frac = setW ? (pos - setW) / setW : 0; measure(); pos = norm(setW + frac * setW); vp.scrollLeft = pos; }, 150);
    });
  });
})();
