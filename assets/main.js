/* ========= Mogenas — interactions & tweaks ========= */
(function () {
  'use strict';

  // ---------- Scroll reveal ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  // ---------- Sticky nav border ----------
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav ----------
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (nav && navToggle && siteNav) {
    const closeNav = () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Odpri meni');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
      document.body.style.overflow = open && window.innerWidth <= 900 ? 'hidden' : '';
    });
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  // ---------- Year ----------
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Animated 25× counter ----------
  const counterEl = document.getElementById('counter');
  if (counterEl) {
    let counted = false;
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !counted) {
          counted = true;
          const target = 25;
          let n = 0;
          const t0 = performance.now();
          const dur = 1400;
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.round(eased * target);
            counterEl.firstChild.nodeValue = v;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    cio.observe(counterEl);
  }

  // ---------- Stat counters (general) ----------
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let done = false;
    const obs = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting && !done) {
          done = true;
          const t0 = performance.now();
          const dur = 1600;
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toLocaleString('sl-SI') + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ============================================================
  // Tweaks panel
  // ============================================================
  const DEFAULTS = window.__TWEAK_DEFAULTS || { palette: 'paper', type: 'serif', density: 'comfortable' };
  let state = { ...DEFAULTS };

  const applyState = () => {
    document.documentElement.setAttribute('data-palette', state.palette);
    document.documentElement.setAttribute('data-type', state.type);
    document.documentElement.setAttribute('data-density', state.density);
    // sync UI
    document.querySelectorAll('#tweaks [data-key]').forEach(btn => {
      const k = btn.dataset.key; const v = btn.dataset.val;
      btn.classList.toggle('active', state[k] === v);
    });
  };

  const tweaksEl = document.getElementById('tweaks');

  function buildTweaks() {
    tweaksEl.innerHTML = `
      <h5>Tweaks <button class="close-btn" id="tw-close" aria-label="Zapri">×</button></h5>
      <div class="group">
        <div class="group-label">Paleta</div>
        <div class="swatches">
          <div class="swatch" data-key="palette" data-val="paper" title="Paper"
            style="background:linear-gradient(120deg,#f5f2ec 50%,#c8533a 50%)"></div>
          <div class="swatch" data-key="palette" data-val="linen" title="Linen"
            style="background:linear-gradient(120deg,#efe9dd 50%,#9a5e2a 50%)"></div>
          <div class="swatch" data-key="palette" data-val="graphite" title="Graphite"
            style="background:linear-gradient(120deg,#0e1116 50%,#d4a456 50%)"></div>
          <div class="swatch" data-key="palette" data-val="blueprint" title="Blueprint"
            style="background:linear-gradient(120deg,#f6f5f1 50%,#1c4dd6 50%)"></div>
        </div>
      </div>
      <div class="group">
        <div class="group-label">Tipografija</div>
        <div class="seg">
          <button data-key="type" data-val="serif">Modern</button>
          <button data-key="type" data-val="editorial">Editorial</button>
          <button data-key="type" data-val="mixed-mono">Mono</button>
        </div>
      </div>
      <div class="group">
        <div class="group-label">Gostota</div>
        <div class="seg" style="grid-template-columns:1fr 1fr">
          <button data-key="density" data-val="comfortable">Udobno</button>
          <button data-key="density" data-val="compact">Strnjeno</button>
        </div>
      </div>
    `;

    tweaksEl.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        const v = btn.dataset.val;
        state[k] = v;
        applyState();
        // persist via host
        try {
          window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
        } catch (e) {}
      });
    });

    document.getElementById('tw-close').addEventListener('click', () => {
      tweaksEl.classList.remove('show');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch(e) {}
    });
  }

  buildTweaks();
  applyState();

  // ---------- Pyramid segment focus (hover / keyboard / touch) ----------
  const pyramidCard = document.querySelector('.pyramid-card--nested');
  if (pyramidCard) {
    const triggers = pyramidCard.querySelectorAll('[data-py-segment]');
    const legendTabs = pyramidCard.querySelectorAll('.pyramid-legend-item[role="tab"]');
    let touchFocus = null;

    const setFocus = (id) => {
      if (id) {
        pyramidCard.setAttribute('data-py-focus', id);
        legendTabs.forEach((tab) => {
          tab.setAttribute('aria-selected', tab.dataset.pySegment === id ? 'true' : 'false');
        });
      } else {
        pyramidCard.removeAttribute('data-py-focus');
        legendTabs.forEach((tab) => tab.setAttribute('aria-selected', 'false'));
      }
    };

    triggers.forEach((el) => {
      const id = el.dataset.pySegment;
      if (!id) return;

      el.addEventListener('mouseenter', () => setFocus(id));
      el.addEventListener('focus', () => setFocus(id));

      el.addEventListener('click', () => {
        if (!window.matchMedia('(hover: none)').matches) return;
        touchFocus = touchFocus === id ? null : id;
        setFocus(touchFocus);
      });
    });

    pyramidCard.addEventListener('mouseleave', () => setFocus(null));

    pyramidCard.addEventListener('focusout', (e) => {
      if (!pyramidCard.contains(e.relatedTarget)) setFocus(null);
    });
  }

  // Edit mode protocol — listener FIRST, then announce.
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode')   tweaksEl.classList.add('show');
    if (d.type === '__deactivate_edit_mode') tweaksEl.classList.remove('show');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(e) {}

})();
