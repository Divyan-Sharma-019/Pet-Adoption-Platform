/* PawHaven — shared behaviour: nav, reveal, favourites, cursor, parallax */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- safe storage ---- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---- favourites (shared with adopt / profile pages) ---- */
  var Fav = {
    all: function () { return store.get('pawhaven-favs', []); },
    has: function (id) { return Fav.all().indexOf(id) > -1; },
    toggle: function (id) {
      var f = Fav.all(), i = f.indexOf(id);
      if (i > -1) f.splice(i, 1); else f.push(id);
      store.set('pawhaven-favs', f);
      return i === -1;
    },
    sync: function (scope) {
      (scope || doc).querySelectorAll('.fav-btn[data-id]').forEach(function (b) {
        var on = Fav.has(b.dataset.id);
        b.setAttribute('aria-pressed', on);
        b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + (b.dataset.name || 'pet') + (on ? ' from favourites' : ' to favourites'));
      });
    }
  };
  window.PawHaven = { Fav: Fav, store: store };

  doc.addEventListener('click', function (e) {
    var b = e.target.closest('.fav-btn[data-id]');
    if (!b) return;
    e.preventDefault();
    Fav.toggle(b.dataset.id);
    Fav.sync();
    doc.dispatchEvent(new CustomEvent('favs-changed'));
  });
  Fav.sync();

  /* ---- mobile navigation ---- */
  var header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav-toggle');
  if (header && toggle) {
    var setNav = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setNav(!header.classList.contains('nav-open')); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setNav(false); } });
    header.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    doc.addEventListener('click', function (e) { if (!header.contains(e.target)) setNav(false); });
  }

  /* ---- scroll: header style + gentle parallax ---- */
  var branches = doc.querySelectorAll('.branch--tl, .branch--tr');
  var heroMedia = doc.querySelector('[data-parallax]');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 24);
      if (!reduce) {
        branches.forEach(function (b) { b.style.setProperty('--py', Math.min(y * 0.12, 90) + 'px'); });
        if (heroMedia && y < 900) heroMedia.style.transform = 'translateY(' + (y * -0.05) + 'px)';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- reveal on scroll ---- */
  var items = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.setProperty('--delay', ((i % 4) * 0.08) + 's');
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- graceful image fallback (never show a broken image) ---- */
  doc.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.failed) {
      t.dataset.failed = '1';
      t.src = (root.dataset.base || '') + 'images/placeholder.svg';
    }
  }, true);

  /* ---- hero video: respect reduced motion ---- */
  doc.querySelectorAll('video[data-bg]').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); }
  });

  /* ---- footer year ---- */
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- blossom cursor: glow + petal trail (the blossom itself is a native CSS cursor, see style.css) ---- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var glow = doc.createElement('div'); glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(glow);
    var mx = -200, my = -200, gx = -200, gy = -200, lastX = -999, lastY = -999, trails = 0, seen = false;
    var hoverSel = 'a, button, summary, select, label, .pet-card, .feature, .quote, .value, .info, [role="button"]';
    var textSel = 'input[type="text"], input[type="email"], input[type="tel"], input[type="search"], textarea';

    function petal() {
      var p = doc.createElement('span'), done = false;
      p.className = 'trail';
      p.style.setProperty('--x', mx + 'px'); p.style.setProperty('--y', my + 'px');
      p.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
      p.style.setProperty('--dy', (14 + Math.random() * 26) + 'px');
      p.style.setProperty('--r', (Math.random() * 240 - 120) + 'deg');
      var end = function () { if (done) return; done = true; trails--; p.remove(); };
      p.addEventListener('animationend', end);
      setTimeout(end, 1200);
      trails++;
      doc.body.appendChild(p);
    }
    function onMove(e) {
      if (e.pointerType === 'touch') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; gx = mx; gy = my; }
      glow.classList.add('on');
      var t = e.target, h = !!(t && t.closest && t.closest(hoverSel)), x = !!(t && t.closest && t.closest(textSel));
      glow.classList.toggle('hover', h); glow.classList.toggle('text', x);
      var dx = mx - lastX, dy = my - lastY;
      if (dx * dx + dy * dy > 1100 && trails < 8) { lastX = mx; lastY = my; petal(); }
    }
    doc.addEventListener('pointermove', onMove, { passive: true });
    doc.addEventListener('mousemove', onMove, { passive: true });
    doc.documentElement.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
    window.addEventListener('blur', function () { glow.classList.remove('on'); });

    (function follow() {
      gx += (mx - gx) * 0.22; gy += (my - gy) * 0.22;
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      requestAnimationFrame(follow);
    })();
  }
})();
