/* ─── FX — Glitch + Tron Grid + Decrypt ─────────────────────── */
(function () {

  /* ── GLITCH HERO TITLE ────────────────────────────────────── */
  function initGlitch() {
    const lines = Array.from(document.querySelectorAll('.hero-title-line'));
    if (!lines.length) return;

    function fire() {
      lines.forEach(line => {
        line.classList.add('is-glitching');
        setTimeout(() => line.classList.remove('is-glitching'), 180);
      });
      setTimeout(() => {
        lines.forEach(line => {
          line.classList.add('is-glitching');
          setTimeout(() => line.classList.remove('is-glitching'), 100);
        });
      }, 250);
      schedule();
    }

    function schedule() {
      setTimeout(fire, 3500 + Math.random() * 6000);
    }

    setTimeout(schedule, 2600);
  }

  /* ── DECRYPT TEXT EFFECT ──────────────────────────────────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/\\|[]{}';

  function decrypt(el) {
    const original = el.textContent;
    if (!original.trim()) return;
    const steps = 18;
    let step = 0;

    const id = setInterval(() => {
      step++;
      const progress = step / steps;
      el.textContent = original.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i / original.length < progress) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');

      if (step >= steps) {
        clearInterval(id);
        el.textContent = original;
      }
    }, 40);
  }

  function initDecrypt() {
    const targets = document.querySelectorAll('.section-title, .hero-eyebrow, .skills-col-title span');

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        setTimeout(() => decrypt(entry.target), 100);
      });
    }, { threshold: 0.6 });

    targets.forEach(el => io.observe(el));
  }

  /* ── AMBIENT BG GLOW ─────────────────────────────────────── */
  const SECTION_STOPS = [
    { id: 'hero',      x: 50,  y:  0, r:   0, g: 210, b: 220 },
    { id: 'about',     x: 15,  y: 40, r:   0, g: 160, b: 255 },
    { id: 'portfolio', x: 85,  y: 50, r:   0, g: 180, b: 200 },
    { id: 'skills',    x: 20,  y: 60, r: 110,  g: 60, b: 240 },
    { id: 'contact',   x: 50,  y:100, r:   0, g: 210, b: 220 },
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function initBgGlow() {
    const el = document.getElementById('bg-glow');
    if (!el) return;

    const stops = SECTION_STOPS
      .map(s => ({ ...s, el: document.getElementById(s.id) }))
      .filter(s => s.el);

    const cur = { x: 50, y: 0, r: 0, g: 210, b: 220 };

    function getTarget() {
      const mid = window.scrollY + window.innerHeight * 0.5;
      for (let i = stops.length - 1; i >= 0; i--) {
        if (mid >= stops[i].el.offsetTop) {
          const a = stops[i], b = stops[i + 1];
          if (!b) return a;
          const t = Math.min((mid - a.el.offsetTop) / (b.el.offsetTop - a.el.offsetTop), 1);
          return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
        }
      }
      return stops[0];
    }

    function tick() {
      const tgt = getTarget();
      const sp = 0.04;
      cur.x = lerp(cur.x, tgt.x, sp);
      cur.y = lerp(cur.y, tgt.y, sp);
      cur.r = lerp(cur.r, tgt.r, sp);
      cur.g = lerp(cur.g, tgt.g, sp);
      cur.b = lerp(cur.b, tgt.b, sp);
      el.style.setProperty('--gx', cur.x.toFixed(2) + '%');
      el.style.setProperty('--gy', cur.y.toFixed(2) + '%');
      el.style.setProperty('--gr', Math.round(cur.r));
      el.style.setProperty('--gg', Math.round(cur.g));
      el.style.setProperty('--gb', Math.round(cur.b));
      requestAnimationFrame(tick);
    }

    tick();
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initGlitch();
    initDecrypt();
    initBgGlow();
  });

})();
