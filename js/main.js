/* Karnahl Elektrotechnik — Interaktion, Reveals, Parallax, Bild-Slots */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Jahr im Footer */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Nav-Hintergrund beim Scrollen */
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

  /* Bild-Slots: liegt die Datei in img/, wird sie geladen — sonst bleibt der Platzhalter.
     So können neue Bilder ohne Code-Änderung eingefügt werden. */
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

  /* Leichter Parallax auf dem Hero-Bild (sofern geladen) */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!reduce && layers.length) {
    var ticking = false;
    function apply() {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        var target = el.querySelector('img');
        if (target) target.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(apply); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', apply);
    apply();
  }

  /* Kontaktformular — Demo-Handling (kein Backend im Entwurf) */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('vorname') || {}).value || '';
      note.textContent = 'Danke' + (name ? ', ' + name : '') + '! Diese Vorschau versendet noch nicht – zum Livegang binden wir das Formular an Ihr Postfach an.';
      note.style.color = 'var(--green)';
    });
  }
})();
