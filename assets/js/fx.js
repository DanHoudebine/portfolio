/* ─── FX — Glitch visuel ─────────────────────────────────── */
(function () {

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

  document.addEventListener('DOMContentLoaded', initGlitch);

})();
