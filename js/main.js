/* Karnahl Elektrotechnik — „Stromlaufplan": Leiterbahn, Reveals, Bild-Slots */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Jahr im Footer */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Nav-Schatten beim Scrollen */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* Mobile-Menü */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  function closeMenu() {
    if (!links) return;
    links.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.js-close'), function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* Bild-Slots: liegt die Datei in img/, wird sie geladen — sonst bleibt der Platzhalter. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-img]'), function (slot) {
    var src = slot.getAttribute('data-img');
    if (!src) return;
    var probe = new Image();
    probe.onload = function () {
      var img = document.createElement('img');
      img.src = src;
      img.alt = slot.getAttribute('data-alt') || '';
      img.loading = 'lazy';
      slot.insertBefore(img, slot.firstChild);
      slot.classList.add('has-img');
      schedulePath();
    };
    probe.src = src;
  });

  /* Reveal on scroll */
  var revs = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
  }

  /* ---------- Leiterbahn: orthogonale Linie durch alle Knoten ---------- */
  var svg = document.getElementById('circuit');
  var path = document.getElementById('circuitPath');
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.cnode[data-node]'));
  var pathLen = 0, startY = 0, endY = 0, raf = null;

  function buildPath() {
    if (!svg || !path || nodes.length < 2) return;
    var docW = document.documentElement.scrollWidth;
    var docH = document.documentElement.scrollHeight;
    svg.setAttribute('width', docW);
    svg.setAttribute('height', docH);
    svg.setAttribute('viewBox', '0 0 ' + docW + ' ' + docH);
    var pts = nodes.map(function (n) {
      var r = n.getBoundingClientRect();
      return {
        x: Math.round(r.left + r.width / 2 + window.scrollX),
        y: Math.round(r.top + r.height / 2 + window.scrollY)
      };
    });
    /* Sammelschiene im linken Rand — läuft NIE durch Text; je Knoten eine Stichleitung */
    var minX = pts.reduce(function (m, p) { return Math.min(m, p.x); }, Infinity);
    var spineX = Math.max(14, minX - 44);
    var d = 'M ' + pts[0].x + ' ' + pts[0].y + ' L ' + spineX + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var b = pts[i];
      d += ' L ' + spineX + ' ' + b.y + ' L ' + b.x + ' ' + b.y;
      if (i < pts.length - 1) d += ' L ' + spineX + ' ' + b.y; /* zurück zur Schiene */
    }
    path.setAttribute('d', d);
    pathLen = path.getTotalLength();
    startY = pts[0].y;
    endY = pts[pts.length - 1].y;
    if (reduce) {
      path.style.strokeDasharray = 'none';
    } else {
      path.style.strokeDasharray = String(pathLen);
      drawProgress();
    }
  }

  function drawProgress() {
    if (!pathLen || reduce) return;
    var lead = window.scrollY + window.innerHeight * 0.72;
    var p = (lead - startY) / Math.max(1, endY - startY);
    p = Math.max(0, Math.min(1, p));
    path.style.strokeDashoffset = String(pathLen * (1 - p));
  }

  function schedulePath() {
    if (raf) return;
    raf = window.requestAnimationFrame(function () { raf = null; buildPath(); });
  }

  if (svg && path && nodes.length > 1) {
    buildPath();
    window.addEventListener('resize', schedulePath);
    window.addEventListener('scroll', function () {
      if (!reduce) window.requestAnimationFrame(drawProgress);
    }, { passive: true });
    /* Sicherungen auf-/zuklappen ändert die Dokumenthöhe */
    Array.prototype.forEach.call(document.querySelectorAll('details.fuse'), function (dt) {
      dt.addEventListener('toggle', schedulePath);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedulePath);
    window.addEventListener('load', schedulePath);
  }

  /* Kontaktformular — Demo-Handling (kein Backend im Entwurf) */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('vorname') || {}).value || '';
      note.textContent = 'Danke' + (name ? ', ' + name : '') + '! Diese Vorschau versendet noch nicht – zum Livegang binden wir das Formular an Ihr Postfach an.';
      note.style.color = 'var(--orange-deep)';
    });
  }
})();
