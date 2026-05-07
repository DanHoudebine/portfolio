// ============================================
// CURSEUR CUSTOM
// ============================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
});

function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.transform = `translate(${followerX - 15}px, ${followerY - 15}px)`;
    requestAnimationFrame(animateFollower);
}
animateFollower();

// Effet hover sur liens
document.querySelectorAll('a, button, .skill-card, .projet-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform += ' scale(2)';
        follower.style.width = '50px';
        follower.style.height = '50px';
    });
    el.addEventListener('mouseleave', () => {
        follower.style.width = '30px';
        follower.style.height = '30px';
    });
});

// ============================================
// NAVBAR — SCROLL EFFECT
// ============================================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Active nav link selon section
    updateActiveNav();
    
    // Révéler les éléments
    revealElements();
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        
        if (window.scrollY >= top && window.scrollY < bottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// REVEAL ON SCROLL
// ============================================
function revealElements() {
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add('visible');
        }
    });
}

// ============================================
// COMPTEURS HERO (animés au chargement)
// ============================================
function animateHeroCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 16);
    });
}

// ============================================
// PARTICLES HERO
// ============================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 2 + 1}px;
            height: ${Math.random() * 2 + 1}px;
            background: rgba(0, 245, 255, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * -10}s;
        `;
        container.appendChild(particle);
    }
}

// CSS dynamique pour particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% { transform: translateY(0px) translateX(0px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// FORMULAIRE CONTACT
// ============================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn');
        btn.textContent = 'Envoyé ✓';
        btn.style.background = '#64ff64';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.textContent = 'Envoyer';
            btn.style.background = '';
            btn.style.color = '';
            contactForm.reset();
        }, 3000);
    });
}

// ============================================
// NAVIGATION MOBILE
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });
    });
}


// ============================================
// INIT
// ============================================
window.addEventListener('load', () => {
    createParticles();
    setTimeout(animateHeroCounters, 1500);
    revealElements();
});
// ============================================
// COPY EMAIL ANTI-SPAM
// L'adresse réelle n'est jamais écrite en clair
// dans le HTML → les bots ne peuvent pas la lire
// ============================================
function copyEmail() {
    // On reconstruit l'adresse uniquement au moment du clic
    const user   = 'Danhoudebine';
    const domain = 'gmail.com';
    const email  = `${user}@${domain}`;
    
    navigator.clipboard.writeText(email).then(() => {
        const confirm = document.getElementById('copy-confirm');
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 3000);
    });
}

// ============================================
// DICTIONNAIRE i18n
// ============================================
const i18n = {
  fr: {
    'nav.home':        'Accueil',
    'nav.portfolio':   'Portfolio',
    'nav.skills':      'Skills',
    'nav.contact':     'Contact',
    'hero.scroll':     'SCROLL',
    'portfolio.eyebrow': '// Mes Réalisations',
    'portfolio.title':   'Portfolio',
    'portfolio.all':     'Tous',
    'portfolio.env':     'Environnements',
    'portfolio.props':   'Props',
    'skills.eyebrow':  '// Mon Arsenal',
    'skills.title':    'Compétences',
    'skills.loading':  'Chargement des compétences...',
    'contact.eyebrow': '// Me joindre',
    'contact.title':   'Contact',
    'contact.email':   'Email',
    'contact.cv':      'Télécharger mon CV',
    'lightbox.btn':    '🎨 Voir sur ArtStation',
    'footer.title':    'Dan Houdebine · Environment Artist Senior',
  },
  en: {
    'nav.home':        'Home',
    'nav.portfolio':   'Portfolio',
    'nav.skills':      'Skills',
    'nav.contact':     'Contact',
    'hero.scroll':     'SCROLL',
    'portfolio.eyebrow': '// My Work',
    'portfolio.title':   'Portfolio',
    'portfolio.all':     'All',
    'portfolio.env':     'Environments',
    'portfolio.props':   'Props',
    'skills.eyebrow':  '// My Arsenal',
    'skills.title':    'Skills',
    'skills.loading':  'Loading skills...',
    'contact.eyebrow': '// Get in touch',
    'contact.title':   'Contact',
    'contact.email':   'Email',
    'contact.cv':      'Download my CV',
    'lightbox.btn':    '🎨 View on ArtStation',
    'footer.title':    'Dan Houdebine · Senior Environment Artist',
  }
};

// ============================================
// i18n — CHANGEMENT DE LANGUE
// ============================================
let currentLang = 'fr';

function setLang(lang) {
  currentLang = lang;

  // Boutons actifs
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
  });

  // Traduire tous les éléments data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // CV : changer fichier selon langue
  const btnCV = document.querySelector('.btn-cv');
  if (btnCV) {
    btnCV.href = lang === 'en'
      ? 'assets/CV_Dan_HoudebineEN.pdf'
      : 'assets/CV_Dan_HoudebineFR.pdf';
  }
}