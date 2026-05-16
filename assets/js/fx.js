/* ─── FX — Glitch + Audio (Web Audio API, no external files) ── */
(function () {

  /* ── AUDIO ENGINE ─────────────────────────────────────────── */
  const Audio = {
    ctx: null,
    enabled: false,
    master: null,

    unlock() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
      this.enabled = true;
    },

    /* Tone: freq Hz, delay s, duration s, gain 0-1, wave type */
    tone(freq, delay, duration, gain = 1, type = 'square') {
      if (!this.enabled || !this.ctx) return;
      const osc  = this.ctx.createOscillator();
      const env  = this.ctx.createGain();
      osc.connect(env);
      env.connect(this.master);
      osc.type = type;
      osc.frequency.value = freq;
      const t = this.ctx.currentTime + delay;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(gain, t + 0.008);
      env.gain.setValueAtTime(gain, t + duration - 0.01);
      env.gain.linearRampToValueAtTime(0, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    },

    /* Sci-fi boot sequence */
    playBoot() {
      this.tone(220,  0.00, 0.06, 0.6, 'square');
      this.tone(440,  0.10, 0.06, 0.5, 'square');
      this.tone(330,  0.20, 0.06, 0.5, 'square');
      this.tone(660,  0.32, 0.10, 0.7, 'square');
      this.tone(880,  0.45, 0.05, 0.4, 'square');
      this.tone(1320, 0.52, 0.18, 0.8, 'sine');
    },

    /* Short UI click */
    playClick() {
      if (!this.enabled) return;
      this.tone(900, 0, 0.025, 0.9, 'square');
      this.tone(600, 0.02, 0.02, 0.4, 'square');
    },

    /* Subtle hover blip */
    playHover() {
      if (!this.enabled) return;
      this.tone(1100, 0, 0.015, 0.4, 'sine');
    },

    /* Power-off when toggling sound off */
    playOff() {
      this.tone(440, 0,    0.04, 0.5, 'square');
      this.tone(220, 0.05, 0.08, 0.6, 'square');
      this.tone(110, 0.12, 0.12, 0.4, 'square');
    },
  };

  /* ── SOUND TOGGLE BUTTON ──────────────────────────────────── */
  function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!Audio.enabled) {
        Audio.unlock();
        Audio.playBoot();
        btn.classList.add('is-on');
        btn.setAttribute('aria-label', 'Désactiver le son');
      } else {
        Audio.playOff();
        setTimeout(() => { Audio.enabled = false; }, 300);
        btn.classList.remove('is-on');
        btn.setAttribute('aria-label', 'Activer le son');
      }
    });

    /* UI sounds on interactive elements */
    document.addEventListener('click', e => {
      if (!Audio.enabled) return;
      const el = e.target.closest('a, button, .project-item, .cat-card');
      if (el && el.id !== 'sound-toggle') Audio.playClick();
    });

    document.addEventListener('mouseover', e => {
      if (!Audio.enabled) return;
      const el = e.target.closest('.nav-link, .btn, .contact-item');
      if (el) Audio.playHover();
    }, { passive: true });
  }

  /* ── GLITCH EFFECT ────────────────────────────────────────── */
  function initGlitch() {
    const lines = Array.from(document.querySelectorAll('.hero-title-line'));
    if (!lines.length) return;

    function fire() {
      lines.forEach(line => {
        line.classList.add('is-glitching');
        setTimeout(() => line.classList.remove('is-glitching'), 180);
      });
      /* Double flash for realism */
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

    /* First glitch after preloader */
    setTimeout(schedule, 2600);
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initSoundToggle();
    initGlitch();
  });

})();
