/* We Roll Up — Designer B "Green Aura" prototype behaviour.
   States: ?state=gate | mega | menu (nothing opens without a flag).
   Motion: entrance reveals (scroll-position check, rAF), scroll-linked depth planes (--p per [data-depth] section),
   header top-bar slide + scroll line. prefers-reduced-motion: no scroll-linked motion and every reveal is shown. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const state = params.get('state');

  /* prototype-only link map: the HTML keeps the live paths; locally Home and Flower open the two prototype files */
  $$('[data-proto-href]').forEach((a) => a.setAttribute('href', a.dataset.protoHref));

  /* ---------- store switcher (no navigation in the prototype) ---------- */
  const sel = $('#currently-shopping');
  if (sel) {
    sel.addEventListener('change', () => {
      const o = sel.options[sel.selectedIndex];
      const addr = $('#locationAddress'), hours = $('#locationHours');
      if (!o || !o.value) { addr.textContent = ''; hours.textContent = ''; return; }
      addr.textContent = o.dataset.address || '';
      hours.textContent = o.dataset.hours || 'Hours Not Available';
      $$('.active-location-menu').forEach((a) => { if (o.dataset.menuUrl) a.setAttribute('href', o.dataset.menuUrl); });
      try { document.cookie = 'selected_location=' + o.dataset.slug + '; path=/; max-age=2592000; SameSite=Lax'; } catch (e) { /* cookies off */ }
    });
  }

  /* ---------- header: top bar slides away, scroll line ---------- */
  const head = $('#siteHead');
  const line = $('.scroll-line span');

  /* ---------- mega menu ---------- */
  const megaBtn = $('#megaBtn'), mega = $('#mega');
  const setMega = (open, focusFirst) => {
    if (!mega || !megaBtn) return;
    mega.hidden = !open;
    megaBtn.setAttribute('aria-expanded', String(open));
    if (open && focusFirst) { const f = $('a', mega); if (f) f.focus(); }
  };
  if (megaBtn) {
    megaBtn.addEventListener('click', () => setMega(mega.hidden, false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mega.hidden) { setMega(false); megaBtn.focus(); } });
    document.addEventListener('click', (e) => { if (!mega.hidden && !mega.contains(e.target) && !megaBtn.contains(e.target)) setMega(false); });
    mega.addEventListener('focusout', (e) => { if (!mega.contains(e.relatedTarget) && e.relatedTarget !== megaBtn && e.relatedTarget) setMega(false); });
  }

  /* ---------- drawer (phone menu) ---------- */
  const drawer = $('#drawer'), menuBtn = $('#menuBtn');
  let lastFocus = null;
  const trap = (root) => (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', root).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  const drawerTrap = drawer ? trap(drawer) : null;
  const setDrawer = (open) => {
    if (!drawer) return;
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    doc.classList.toggle('is-locked', open);
    if (open) { lastFocus = document.activeElement; drawer.addEventListener('keydown', drawerTrap); const c = $('.drawer__close', drawer); if (c) c.focus({ preventScroll: true }); }
    else { drawer.removeEventListener('keydown', drawerTrap); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  };
  if (menuBtn) menuBtn.addEventListener('click', () => setDrawer(true));
  if (drawer) {
    $$('[data-close]', drawer).forEach((b) => b.addEventListener('click', () => setDrawer(false)));
    drawer.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
    $$('.dgroup__btn', drawer).forEach((b) => b.addEventListener('click', () => {
      const p = document.getElementById(b.getAttribute('aria-controls'));
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open)); p.hidden = !open;
    }));
  }

  /* ---------- accordion (one open at a time, like the source) ---------- */
  const accBtns = $$('.acc__btn');
  accBtns.forEach((b) => b.addEventListener('click', () => {
    const willOpen = b.getAttribute('aria-expanded') !== 'true';
    accBtns.forEach((o) => { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')).hidden = true; });
    if (willOpen) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.getAttribute('aria-controls')).hidden = false; }
  }));

  /* ---------- reviews rail ---------- */
  const track = $('#reviewTrack');
  $$('.reviews__ctrl .round-btn').forEach((b) => b.addEventListener('click', () => {
    if (!track) return;
    const card = $('.rcard', track); const step = card ? card.getBoundingClientRect().width + 22 : 320;
    track.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- ZIP finder (same client-side logic as the source) ---------- */
  const form = $('#zipSearchForm');
  if (form && window.__ZIP) {
    const z = window.__ZIP, input = $('#zipcode'), err = $('#zipError');
    const steps = { first: $('#zcs1'), empty: $('#zcs-empty'), results: $('.zcs-results'), l1: $('#location1'), l2: $('#location2') };
    const reset = () => { steps.first.hidden = false; steps.empty.hidden = true; steps.results.hidden = true; steps.l1.hidden = true; steps.l2.hidden = true; form.hidden = false; err.textContent = ''; };
    form.addEventListener('submit', (e) => {
      e.preventDefault(); err.textContent = '';
      const v = String(input.value || '').trim();
      if (v.length < 5) { reset(); err.textContent = 'Please enter a valid zip code.'; return; }
      steps.first.hidden = true; form.hidden = true;
      if (z.location1zips.includes(v)) { steps.results.hidden = false; steps.l1.hidden = false; return; }
      if (z.location2zips.includes(v)) { steps.results.hidden = false; steps.l2.hidden = false; return; }
      steps.empty.hidden = false; form.hidden = false;
    });
    $$('.zcs-go-back').forEach((b) => b.addEventListener('click', () => { reset(); input.value = ''; input.focus(); }));
  }

  /* ---------- age gate (Yes reveals the store list; No shows the denied text) ---------- */
  const gate = $('#ageGateModal');
  const gateTrap = gate ? trap(gate) : null;
  const openGate = () => {
    if (!gate) return;
    gate.hidden = false; doc.classList.add('is-locked'); gate.addEventListener('keydown', gateTrap);
    const y = $('#ageGateYes'); if (y) y.focus({ preventScroll: true });
  };
  if (gate) {
    const yes = $('#ageGateYes'), no = $('#ageGateNo'), wrap = $('#locationGateWrapper');
    yes.addEventListener('click', () => { wrap.hidden = false; $('.gate__buttons', gate).classList.add('is-yes'); no.hidden = true; const f = $('.location-select-btn', wrap); if (f) f.focus(); });
    no.addEventListener('click', () => { $('.gate__main', gate).hidden = true; $('.gate__buttons', gate).hidden = true; wrap.hidden = true; $('.gate__denied', gate).hidden = false; });
    $$('.location-select-btn', gate).forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      try { localStorage.setItem('agePass_v2', 'true'); } catch (x) { /* storage off */ }
      document.cookie = 'agePass_v2=true; path=/; max-age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
      gate.hidden = true; doc.classList.remove('is-locked'); gate.removeEventListener('keydown', gateTrap);
    }));
  }

  /* ---------- states ---------- */
  if (state === 'gate') openGate();
  if (state === 'mega') setMega(true, false);
  if (state === 'menu') setDrawer(true);

  /* ---------- reveals: never hide what is already in the first screen; focus reveals; hover lives on inner cards ---------- */
  const reveal = (el) => { el.classList.remove('rv-wait'); };
  let pending = [];
  if (!reduce) {
    const vh0 = window.innerHeight;
    $$('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh0 && r.bottom > 0) return; // already on screen at load: stays fully visible, never half-revealed
      el.classList.add('rv-wait'); pending.push(el);
    });
    // keyboard focus inside a waiting block reveals it at once
    document.addEventListener('focusin', (e) => { const w = e.target.closest && e.target.closest('.rv-wait'); if (w) { reveal(w); pending = pending.filter((p) => p !== w); } });
  }
  // a block is revealed once its top passes 94% of the viewport height, including blocks a jump scrolled past
  const checkReveals = () => {
    if (!pending.length) return;
    const lim = window.innerHeight * 0.94;
    pending = pending.filter((el) => { if (el.getBoundingClientRect().top < lim) { reveal(el); return false; } return true; });
  };

  /* ---------- scroll-linked depth ---------- */
  const scopes = $$('[data-depth]');
  let ticking = false;
  const update = () => {
    ticking = false;
    checkReveals();
    const vh = window.innerHeight, y = window.scrollY, max = Math.max(1, doc.scrollHeight - vh);
    if (head) head.classList.toggle('is-scrolled', y > 8);
    if (line) line.style.setProperty('--sp', Math.min(1, y / max).toFixed(4));
    if (reduce || window.innerWidth < 761) return;
    scopes.forEach((s) => {
      const r = s.getBoundingClientRect();
      const p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2); // +1 entering from below, 0 centred, -1 leaving above
      s.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(4));
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
