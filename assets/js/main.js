/* ============================================================
   DAN HOUDEBINE — PORTFOLIO JS
   Modules: Preloader, Canvas Particles, Cursor, Nav,
            Hero Animations, Portfolio Filter, Lightbox,
            Skill Bars, Scroll Reveals, Contact Form
   ============================================================ */

'use strict';

/* ─── UTILS ─────────────────────────────────────────────── */

function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── CANVAS PARTICLES ───────────────────────────────────── */
function initParticles() {
  const canvas = qs('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 70;
  const CYAN = '0, 210, 220';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    };
  }

  function init() {
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function drawConnections() {
    const MAX_DIST = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CYAN}, ${p.alpha})`;
      ctx.fill();
    });

    drawConnections();
    requestAnimationFrame(tick);
  }

  resize();
  init();
  tick();
  window.addEventListener('resize', () => { resize(); });
}

/* ─── PRELOADER ──────────────────────────────────────────── */
function initPreloader() {
  const loader = qs('#preloader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 2200);
  });

  document.body.style.overflow = 'hidden';
}

/* ─── CURSEUR ────────────────────────────────────────────── */
function initCursor() {
  const dot = qs('#cursor');
  const ring = qs('#cursor-ring');
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animateRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  qsa('a, button, .project-item, .filter-btn, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
  });
}

/* ─── NAVIGATION ─────────────────────────────────────────── */
function initNav() {
  const nav = qs('#nav');
  const burger = qs('#nav-burger');
  const links = qs('.nav-links');
  if (!nav) return;

  /* Scrolled state */
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link on scroll */
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));

  /* Mobile burger */
  if (burger) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });

    links.addEventListener('click', e => {
      if (e.target.matches('.nav-link')) links.classList.remove('is-open');
    });
  }
}

/* ─── I18N ───────────────────────────────────────────────── */
const TRANSLATIONS = {
  fr: {
    'nav.home':            'Accueil',
    'nav.about':           'À propos',
    'nav.portfolio':       'Portfolio',
    'nav.skills':          'Compétences',
    'nav.contact':         'Contact',
    'nav.hire':            'Hire me',
    'hero.subtitle-prefix':'Création d\'environnements',
    'hero.btn-portfolio':  'Voir le portfolio',
    'hero.btn-contact':    'Me contacter',
    'hero.stat-projects':  'Projets réalisés',
    'hero.stat-experience':'Ans d\'expérience',
    'hero.stat-tools':     'Outils maîtrisés',
    'section.about':       'À propos',
    'section.portfolio':   'Portfolio',
    'section.skills':      'Compétences',
    'section.contact':     'Contact',
    'about.badge':         'Spécialiste jeux vidéo',
    'about.intro':         'Artiste d\'environnement passionné, spécialisé dans la création de mondes immersifs et détaillés, j\'allie narration visuelle et performance technique pour donner vie à des univers de jeux vidéo convaincants.',
    'about.body':          'Mon expertise couvre l\'ensemble du pipeline : modélisation (3ds Max, Blender, ZBrush), texturing PBR (Substance 3D), photogrammétrie (RealityCapture), éclairage temps réel et optimisation sur Unreal Engine 5 et Unity HDRP. Formateur 3D Unreal depuis 2025, j\'ai également reçu le prix du meilleur jeu au GameJam — jury Ubisoft Montréal.',
    'xp.3is':              'Formateur Environment Artist 3D Unreal',
    'xp.rebound':          'Environment Artist / Lead 3D',
    'xp.jhh':              'Artiste 3D VR',
    'xp.freelance':        'Artiste 3D Freelance',
    'about.btn-work':      'Voir mes travaux',
    'about.btn-cv':        'CV',
    'about.btn-cv-aria':   'Télécharger le CV',
    'filter.all':          'Tous',
    'skills.main-tools':   'Outils principaux',
    'skills.full-toolkit': 'Toolkit complet',
    'contact.heading':     'Travaillons ensemble',
    'contact.description': 'Disponible pour des missions freelance, des postes en studio, ou des collaborations sur des projets passionnants. N\'hésitez pas à m\'écrire.',
    'contact.portfolio-link': 'Portfolio en ligne',
    'form.name':           'Nom',
    'form.email':          'Email',
    'form.subject':        'Sujet',
    'form.message':        'Message',
    'form.ph-name':        'Votre nom',
    'form.ph-email':       'votre@email.com',
    'form.ph-subject':     'Proposition de mission, collaboration…',
    'form.ph-message':     'Décrivez votre projet…',
    'form.btn-send':       'Envoyer le message',
    'form.btn-sending':    'Envoi en cours…',
    'form.success':        'Message envoyé ! Je vous réponds sous 48h.',
    'form.error':          'Erreur d\'envoi. Écrivez-moi directement : Danhoudebine@gmail.com',
    'footer.rights':       'Tous droits réservés.',
    'typed.words':         'immersifs pour le jeu vidéo|sci-fi de haute qualité|fantasy épiques|post-apocalyptiques|urbains ultra-réalistes',
  },
  en: {
    'nav.home':            'Home',
    'nav.about':           'About',
    'nav.portfolio':       'Portfolio',
    'nav.skills':          'Skills',
    'nav.contact':         'Contact',
    'nav.hire':            'Hire me',
    'hero.subtitle-prefix':'Creating environments',
    'hero.btn-portfolio':  'View portfolio',
    'hero.btn-contact':    'Contact me',
    'hero.stat-projects':  'Projects completed',
    'hero.stat-experience':'Years experience',
    'hero.stat-tools':     'Tools mastered',
    'section.about':       'About',
    'section.portfolio':   'Portfolio',
    'section.skills':      'Skills',
    'section.contact':     'Contact',
    'about.badge':         'Game Industry Specialist',
    'about.intro':         'Passionate Environment Artist, specialized in creating immersive and detailed worlds, I combine visual storytelling and technical performance to bring compelling video game universes to life.',
    'about.body':          'My expertise covers the full pipeline: modelling (3ds Max, Blender, ZBrush), PBR texturing (Substance 3D), photogrammetry (RealityCapture), real-time lighting and optimization on Unreal Engine 5 and Unity HDRP. 3D Unreal instructor since 2025, I also received the Best Game Award at GameJam — jury from Ubisoft Montreal.',
    'xp.3is':              '3D Unreal Environment Artist Instructor',
    'xp.rebound':          'Environment Artist / Lead 3D',
    'xp.jhh':              '3D VR Artist',
    'xp.freelance':        'Freelance 3D Artist',
    'about.btn-work':      'View my work',
    'about.btn-cv':        'Resume',
    'about.btn-cv-aria':   'Download Resume',
    'filter.all':          'All',
    'skills.main-tools':   'Main tools',
    'skills.full-toolkit': 'Full toolkit',
    'contact.heading':     'Let\'s work together',
    'contact.description': 'Available for freelance projects, studio positions, or collaborations on exciting games. Feel free to reach out.',
    'contact.portfolio-link': 'Online Portfolio',
    'form.name':           'Name',
    'form.email':          'Email',
    'form.subject':        'Subject',
    'form.message':        'Message',
    'form.ph-name':        'Your name',
    'form.ph-email':       'your@email.com',
    'form.ph-subject':     'Project proposal, collaboration…',
    'form.ph-message':     'Describe your project…',
    'form.btn-send':       'Send message',
    'form.btn-sending':    'Sending…',
    'form.success':        'Message sent! I\'ll get back to you within 48h.',
    'form.error':          'Send error. Email me directly: Danhoudebine@gmail.com',
    'footer.rights':       'All rights reserved.',
    'typed.words':         'immersive game worlds|high-quality sci-fi|epic fantasy|post-apocalyptic|ultra-realistic urban',
  }
};

let currentLang = 'fr';
let typewriterWords = TRANSLATIONS.fr['typed.words'].split('|');

function t(key) {
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS.fr[key] || key;
}

function applyTranslations() {
  /* Texte */
  qsa('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  /* Placeholders */
  qsa('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  /* aria-label */
  qsa('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  /* HTML lang */
  document.documentElement.lang = currentLang;
}

function initLangToggle() {
  const btn = qs('#lang-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    btn.textContent = currentLang === 'fr' ? 'EN' : 'FR';
    btn.setAttribute('aria-label', currentLang === 'fr' ? 'Switch to English' : 'Passer en français');
    typewriterWords = t('typed.words').split('|');
    applyTranslations();
    updateCvLink();
  });
}

function updateCvLink() {
  const cvBtn = qs('#cv-download-btn');
  if (!cvBtn) return;
  cvBtn.href = currentLang === 'fr'
    ? 'assets/cv/CV_Dan_HoudebineFR_2026.pdf'
    : 'assets/cv/CV_Dan_HoudebineUS_2026.pdf';
}

/* ─── HERO TYPEWRITER ────────────────────────────────────── */
function initTypewriter() {
  const el = qs('#typed-text');
  if (!el) return;

  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = typewriterWords[wi % typewriterWords.length];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);

    if (!deleting && ci > word.length) {
      deleting = true;
      setTimeout(tick, 1800);
      return;
    }
    if (deleting && ci < 0) {
      deleting = false;
      wi = (wi + 1) % typewriterWords.length;
      ci = 0;
      setTimeout(tick, 400);
      return;
    }

    setTimeout(tick, deleting ? 40 : 70);
  }

  tick();
}

/* ─── HERO COUNTER HUD ───────────────────────────────────── */
function initHudCounter() {
  const el = qs('#hud-counter');
  if (!el) return;

  let n = 0;
  const interval = setInterval(() => {
    n = (n + 1) % 1000;
    el.textContent = String(n).padStart(3, '0');
  }, 80);

  /* Arrêter quand on quitte le hero */
  const hero = qs('#hero');
  if (hero) {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) clearInterval(interval);
    }).observe(hero);
  }
}

/* ─── HERO STAT COUNTERS ─────────────────────────────────── */
function initStatCounters() {
  const items = qsa('.stat-num');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = Math.ceil(target / 40);
      const id = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(id);
      }, 40);
    });
  }, { threshold: 0.5 });

  items.forEach(el => io.observe(el));
}

/* ─── PORTFOLIO FILTER ───────────────────────────────────── */
function initPortfolioFilter() {
  const btns = qsa('.filter-btn');
  const items = qsa('.project-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });
}

/* ─── LIGHTBOX ───────────────────────────────────────────── */
function initLightbox() {
  const lightbox = qs('#lightbox');
  const lbImg = qs('#lightbox-img');
  const lbCat = qs('#lightbox-cat');
  const lbTitle = qs('#lightbox-title');
  const lbTools = qs('#lightbox-tools');
  const lbCounter = qs('#lightbox-counter');
  const lbClose = qs('#lightbox-close');
  const lbPrev = qs('#lightbox-prev');
  const lbNext = qs('#lightbox-next');
  const lbBackdrop = qs('#lightbox-backdrop');

  if (!lightbox) return;

  let currentIndex = 0;
  let visibleItems = [];

  function getVisible() {
    return qsa('.project-item:not(.is-hidden)');
  }

  function open(index) {
    visibleItems = getVisible();
    currentIndex = index;
    show(currentIndex);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function show(index) {
    const item = visibleItems[index];
    if (!item) return;
    const img = item.querySelector('img');
    const cat = item.querySelector('.project-cat');
    const title = item.querySelector('h3');
    const tools = item.querySelector('p');

    lbImg.src = img ? img.src : '';
    lbImg.alt = img ? img.alt : '';
    lbCat.textContent = cat ? cat.textContent : '';
    lbTitle.textContent = title ? title.textContent : '';
    lbTools.textContent = tools ? tools.textContent : '';
    lbCounter.textContent = `${index + 1} / ${visibleItems.length}`;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    show(currentIndex);
  }

  function next() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    show(currentIndex);
  }

  /* Déclencheurs d'ouverture */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.project-expand');
    if (!btn) return;
    const item = btn.closest('.project-item');
    visibleItems = getVisible();
    const idx = visibleItems.indexOf(item);
    open(idx >= 0 ? idx : 0);
  });

  /* Double-clic sur la card aussi */
  document.addEventListener('dblclick', e => {
    const item = e.target.closest('.project-item');
    if (!item) return;
    visibleItems = getVisible();
    const idx = visibleItems.indexOf(item);
    open(idx >= 0 ? idx : 0);
  });

  lbClose.addEventListener('click', close);
  lbBackdrop.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}

/* ─── SKILL BARS ─────────────────────────────────────────── */
function initSkillBars() {
  const fills = qsa('.skill-bar-fill');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target;
      const pct = el.dataset.pct;
      /* Délai staggeré selon position */
      const delay = Array.from(fills).indexOf(el) * 80;
      setTimeout(() => { el.style.width = pct + '%'; }, delay);
    });
  }, { threshold: 0.3 });

  fills.forEach(el => io.observe(el));
}

/* ─── SCROLL REVEALS ─────────────────────────────────────── */
function initReveal() {
  /* Ajoute la classe .reveal à tous les éléments à animer */
  const targets = qsa(
    '.about-visual, .about-content, .project-item, ' +
    '.skill-bar-item, .expertise-card, .contact-info, .contact-form, ' +
    '.section-header'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => io.observe(el));
}

/* ─── CONTACT FORM — envoi réel via FormSubmit ───────────── */
function initContactForm() {
  const form = qs('#contact-form');
  const success = qs('#form-success');
  if (!form || !success) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const btnSpan = btn.querySelector('span[data-i18n]') || btn.querySelector('span');
    btn.disabled = true;
    if (btnSpan) btnSpan.textContent = t('form.btn-sending');

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('https://formsubmit.co/ajax/Danhoudebine@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data._subject || data.subject,
          message: data.message,
          _subject: 'Nouveau message — Portfolio Dan Houdebine',
          _captcha: 'false'
        })
      });

      if (res.ok) {
        form.reset();
        success.textContent = t('form.success');
        success.removeAttribute('hidden');
        setTimeout(() => success.setAttribute('hidden', ''), 6000);
      } else {
        throw new Error('server');
      }
    } catch {
      success.textContent = t('form.error');
      success.removeAttribute('hidden');
      success.style.borderColor = 'rgba(255,80,80,0.4)';
    } finally {
      btn.disabled = false;
      if (btnSpan) btnSpan.textContent = t('form.btn-send');
    }
  });
}

/* ─── HERO GRID PARALLAX (léger) ─────────────────────────── */
function initHeroParallax() {
  const hero = qs('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('mousemove', e => {
    const xFrac = (e.clientX / window.innerWidth - 0.5) * 0.015;
    const yFrac = (e.clientY / window.innerHeight - 0.5) * 0.015;
    hero.style.backgroundPosition = `${50 + xFrac * 100}% ${50 + yFrac * 100}%`;
  }, { passive: true });
}

/* ─── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initParticles();
  initCursor();
  initNav();
  initLangToggle();
  applyTranslations();
  initTypewriter();
  initHudCounter();
  initStatCounters();
  initPortfolioFilter();
  initLightbox();
  initSkillBars();
  initReveal();
  initContactForm();
  initHeroParallax();
});
