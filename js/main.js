/* Cosmic Bridge: starfield, Deep Space mode, scroll reveal, menu, contact form */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Starfield ---------- */
  var cv = document.getElementById('sky');
  var ctx = cv.getContext('2d');
  var COLORS = [[200, 210, 255], [255, 236, 200], [242, 181, 99], [160, 165, 240], [255, 255, 255], [200, 190, 255]];
  var W = 0, H = 0, stars = [], shooters = [], trail = [];
  var mx = 0, my = 0, tmx = 0, tmy = 0, hasMouse = false;
  var frame = 0, lastShot = 0, rafId = 0;
  var deep = true;
  try { deep = localStorage.getItem('cb-deep') !== 'off'; } catch (e) {}

  function rand(a, b) { return a + Math.random() * (b - a); }

  function initStars() {
    var dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    // [count, min size, max size, parallax strength]
    var layers = [
      [Math.round(W * H / 9000), 0.4, 1.0, 0.012],
      [Math.round(W * H / 18000), 0.8, 1.5, 0.03],
      [Math.round(W * H / 45000), 1.2, 2.2, 0.06]
    ];
    layers.forEach(function (L, li) {
      for (var i = 0; i < L[0]; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          s: rand(L[1], L[2]), op: rand(0.3, 0.9),
          tw: rand(0, Math.PI * 2), tws: rand(0.01, 0.035),
          p: L[3], c: COLORS[Math.floor(Math.random() * COLORS.length)],
          big: li === 2
        });
      }
    });
    mx = tmx = W / 2;
    my = tmy = H / 2;
  }

  function drawStars() {
    var dx = mx - W / 2, dy = my - H / 2;
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      if (!reduceMotion) st.tw += st.tws;
      var a = st.op * (0.55 + 0.45 * Math.sin(st.tw));
      var x = ((st.x - dx * st.p) % W + W) % W;
      var y = ((st.y - dy * st.p) % H + H) % H;
      ctx.fillStyle = 'rgba(' + st.c[0] + ',' + st.c[1] + ',' + st.c[2] + ',' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, st.s, 0, Math.PI * 2); ctx.fill();
      if (st.big) {
        ctx.fillStyle = 'rgba(' + st.c[0] + ',' + st.c[1] + ',' + st.c[2] + ',' + (a * 0.15).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, st.s * 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawShooters() {
    if (frame - lastShot > 160 && Math.random() < 0.02) {
      lastShot = frame;
      var ang = rand(0.35, 0.7), sp = rand(7, 11);
      shooters.push({ x: rand(W * 0.1, W * 0.8), y: rand(-20, H * 0.35), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1 });
    }
    for (var k = shooters.length - 1; k >= 0; k--) {
      var sh = shooters[k];
      sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.018;
      if (sh.life <= 0 || sh.x > W + 50 || sh.y > H + 50) { shooters.splice(k, 1); continue; }
      var tx = sh.x - sh.vx * 12, ty = sh.y - sh.vy * 12;
      var g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      g.addColorStop(0, 'rgba(255,248,225,' + sh.life.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
  }

  function drawCursor() {
    if (!hasMouse) return;
    trail.push({ x: tmx, y: tmy, op: 1 });
    if (trail.length > 22) trail.shift();
    for (var t = 0; t < trail.length; t++) {
      var p = trail[t];
      p.op *= 0.9;
      var f = t / trail.length;
      ctx.fillStyle = 'rgba(242,181,99,' + (p.op * 0.35 * f).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1 + 2.2 * f, 0, Math.PI * 2); ctx.fill();
    }
    var cg = ctx.createRadialGradient(tmx, tmy, 0, tmx, tmy, 90);
    cg.addColorStop(0, 'rgba(154,160,240,0.08)');
    cg.addColorStop(1, 'rgba(154,160,240,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(tmx, tmy, 90, 0, Math.PI * 2); ctx.fill();
  }

  function loop() {
    frame++;
    ctx.clearRect(0, 0, W, H);
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    drawStars();
    if (deep) { drawShooters(); drawCursor(); }
    else { shooters.length = 0; trail.length = 0; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(rafId);
    if (reduceMotion) { ctx.clearRect(0, 0, W, H); drawStars(); }
    else rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', function (e) { tmx = e.clientX; tmy = e.clientY; hasMouse = true; });
  window.addEventListener('resize', function () { initStars(); if (reduceMotion) drawStars(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(rafId); else start();
  });
  initStars();
  start();

  /* ---------- Deep Space toggle ---------- */
  var dsm = document.getElementById('dsm-toggle');
  function paintToggle() {
    dsm.classList.toggle('is-on', deep);
    dsm.setAttribute('aria-pressed', deep ? 'true' : 'false');
    dsm.querySelector('span').textContent = deep ? 'Deep Space: On' : 'Deep Space: Off';
  }
  dsm.addEventListener('click', function () {
    deep = !deep;
    try { localStorage.setItem('cb-deep', deep ? 'on' : 'off'); } catch (e) {}
    paintToggle();
  });
  paintToggle();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Scroll reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contact form (Formspree) ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      status.className = 'form-status err';
      status.textContent = 'The form is not connected yet. Add your Formspree ID in index.html.';
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error();
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Thank you! We will get back to you soon.';
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Something went wrong. Please email us instead.';
      })
      .finally(function () { btn.disabled = false; });
  });
})();
