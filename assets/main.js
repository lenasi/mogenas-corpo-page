/* ========= Mogenas — interactions ========= */
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
  let closeMobileNav = () => {};
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Mobile nav ----------
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (nav && navToggle && siteNav) {
    let navScrollY = 0;
    const mobileNavMq = window.matchMedia('(max-width: 900px)');
    const isMobileNav = () => mobileNavMq.matches;

    const lockScroll = () => {
      navScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${navScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, navScrollY);
    };

    const setNavOpen = (open) => {
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
      siteNav.hidden = !open && isMobileNav();
    };

    const closeNav = () => {
      const wasOpen = nav.classList.contains('is-open');
      setNavOpen(false);
      if (wasOpen && isMobileNav()) unlockScroll();
    };

    closeMobileNav = closeNav;

    const openNav = () => {
      setNavOpen(true);
      if (isMobileNav()) lockScroll();
    };

    navToggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    mobileNavMq.addEventListener('change', (e) => {
      if (!e.matches) closeNav();
      else siteNav.hidden = !nav.classList.contains('is-open');
    });

    siteNav.hidden = isMobileNav();
  }

  // ---------- Smooth in-page anchor scroll (sticky nav + mobile menu) ----------
  const getScrollOffset = () => {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10);
    return (Number.isFinite(navH) ? navH : 84) + 16;
  };

  const scrollToId = (id, { behavior = 'smooth', updateHistory = true } = {}) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const top = el.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
    if (updateHistory && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    return true;
  };

  const getHashId = () => {
    if (location.hash.length <= 1) return '';
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch {
      return '';
    }
  };

  const clearInvalidHash = (id) => {
    console.warn('[Mogenas] Anchor not found:', id);
    history.replaceState(null, '', location.pathname + location.search);
  };

  const scrollToHash = ({ behavior = 'smooth', updateHistory = true } = {}) => {
    const id = getHashId();
    if (!id) return false;
    return scrollToId(id, { behavior, updateHistory });
  };

  const scrollToHashWhenReady = (behavior = 'instant') => {
    const id = getHashId();
    if (!id) {
      if (location.hash.length > 1) clearInvalidHash(location.hash.slice(1));
      return;
    }

    const maxAttempts = 10;
    let attempts = 0;

    const tryScroll = () => scrollToId(id, { behavior, updateHistory: false });

    const finishOrRetry = () => {
      if (tryScroll()) return;

      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(finishOrRetry);
      } else if (document.readyState === 'complete') {
        if (!tryScroll()) clearInvalidHash(id);
      } else {
        window.addEventListener('load', () => {
          if (!tryScroll()) clearInvalidHash(id);
        }, { once: true });
      }
    };

    finishOrRetry();
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    if (!document.getElementById(id)) return;

    e.preventDefault();
    const navWasOpen = nav?.classList.contains('is-open');
    if (navWasOpen) closeMobileNav();
    const doScroll = () => scrollToId(id);
    if (navWasOpen) requestAnimationFrame(() => requestAnimationFrame(doScroll));
    else doScroll();
  });

  if (location.hash.length > 1) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    scrollToHashWhenReady('instant');
  }

  window.addEventListener('hashchange', () => {
    if (location.hash.length <= 1) return;
    if (!scrollToHash({ behavior: 'smooth', updateHistory: false })) {
      clearInvalidHash(getHashId() || location.hash.slice(1));
    }
  });

  // ---------- Year ----------
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

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

  // ---------- Journey scroll: keyboard focus only when horizontal (desktop) ----------
  const journeyScroll = document.querySelector('.figure-panel-journey .journey-scroll');
  if (journeyScroll) {
    const journeyScrollMq = window.matchMedia('(min-width: 901px)');
    const syncJourneyScrollTabIndex = () => {
      journeyScroll.tabIndex = journeyScrollMq.matches ? 0 : -1;
    };
    syncJourneyScrollTabIndex();
    journeyScrollMq.addEventListener('change', syncJourneyScrollTabIndex);
  }

  // ---------- Figure lightbox (Premica overview) ----------
  const figureLightboxTriggers = document.querySelectorAll('[data-figure-lightbox]');
  if (figureLightboxTriggers.length) {
    const lightbox = document.getElementById('figure-lightbox');
    const lightboxImg = lightbox?.querySelector('.figure-lightbox__img');
    const closeBtn = lightbox?.querySelector('.figure-lightbox__close');
    let lastFocus;

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    const openLightbox = (src, alt) => {
      if (!lightbox || !lightboxImg) return;
      lastFocus = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    };

    closeBtn?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox?.classList.contains('is-open')) closeLightbox();
    });

    figureLightboxTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const src = trigger.getAttribute('data-figure-lightbox');
        const alt = trigger.getAttribute('data-figure-lightbox-alt') || '';
        if (src) openLightbox(src, alt);
      });
    });
  }

  // ---------- Pogoji.si legal modal (AJAX) ----------
  const pogojiLinks = document.querySelectorAll('[data-pogoji-fetch]');
  if (pogojiLinks.length) {
    const cache = new Map();
    let dialog = document.getElementById('pogoji-dialog');
    let titleEl;
    let bodyEl;
    let statusEl;
    let contentEl;
    let lastFocus;

    const ensureDialog = () => {
      if (dialog) return;
      dialog = document.createElement('div');
      dialog.id = 'pogoji-dialog';
      dialog.className = 'pogoji-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-hidden', 'true');
      dialog.innerHTML = `
        <div class="pogoji-dialog__panel">
          <div class="pogoji-dialog__head">
            <h2 class="pogoji-dialog__title" id="pogoji-dialog-title"></h2>
            <button type="button" class="pogoji-dialog__close" aria-label="Zapri">×</button>
          </div>
          <div class="pogoji-dialog__body">
            <p class="pogoji-dialog__status">Nalagam …</p>
            <div class="pogoji-dialog__content" hidden></div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
      titleEl = dialog.querySelector('#pogoji-dialog-title');
      bodyEl = dialog.querySelector('.pogoji-dialog__body');
      statusEl = dialog.querySelector('.pogoji-dialog__status');
      contentEl = dialog.querySelector('.pogoji-dialog__content');
      const closeBtn = dialog.querySelector('.pogoji-dialog__close');

      const closeDialog = () => {
        dialog.classList.remove('is-open');
        dialog.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
      };

      closeBtn.addEventListener('click', closeDialog);
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeDialog();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dialog.classList.contains('is-open')) closeDialog();
      });
    };

    const renderPogojiHtml = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const root = doc.querySelector('.terms .box') || doc.querySelector('.terms');
      if (!root) return '';
      root.querySelectorAll('script, style').forEach((el) => el.remove());
      return root.innerHTML;
    };

    const openPogoji = async (url, title) => {
      ensureDialog();
      lastFocus = document.activeElement;
      titleEl.textContent = title;
      dialog.setAttribute('aria-labelledby', 'pogoji-dialog-title');
      dialog.classList.add('is-open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      statusEl.hidden = false;
      statusEl.textContent = 'Nalagam …';
      contentEl.hidden = true;
      contentEl.innerHTML = '';

      try {
        let html = cache.get(url);
        if (!html) {
          const res = await fetch(url, { credentials: 'omit' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          html = await res.text();
          cache.set(url, html);
        }
        const rendered = renderPogojiHtml(html);
        if (!rendered) throw new Error('Vsebina ni na voljo');
        contentEl.innerHTML = rendered;
        statusEl.hidden = true;
        contentEl.hidden = false;
      } catch (err) {
        statusEl.textContent = 'Vsebine ni mogoče naložiti. Poskusite znova ali odprite povezavo v novem zavihku.';
        statusEl.hidden = false;
        contentEl.hidden = true;
      }
    };

    pogojiLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');
        const title = link.dataset.pogojiTitle || link.textContent.trim();
        openPogoji(url, title);
      });
    });
  }

})();
