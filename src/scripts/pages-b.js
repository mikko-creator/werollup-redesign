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
