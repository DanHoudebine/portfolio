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

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initGlitch();
    initDecrypt();
  });

})();
