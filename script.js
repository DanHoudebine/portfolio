/* ===== SKILLS AVANCÉ ===== */

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initSkillsFilter();
  observeSkillsAnimation();
  initStaggerAnimation();
  setupResizeListener();
});

// ===== FILTRAGE AVANCÉ =====
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillItems = document.querySelectorAll('.skill-item');

  // Active le premier filtre par défaut
  if (filterBtns.length > 0) {
    filterBtns[0].classList.add('active');
  }

  filterBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Animation du bouton actif
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.animation = 'none';
      });

      setTimeout(() => {
        btn.classList.add('active');
        btn.style.animation = 'pulse 0.6s ease-out';
      }, 10);

      const filter = btn.dataset.filter;

      // Filtre avec stagger
      skillItems.forEach((item, itemIndex) => {
        const category = item.dataset.category;
        const delay = itemIndex * 40; // 40ms entre chaque

        if (filter === 'all' || category === filter) {
          setTimeout(() => {
            item.classList.remove('hidden');
            item.style.animation = 'none';
            item.offsetHeight; // Trigger reflow
            item.style.animation = `skillItemFadeIn 0.6s ease-out`;

            // Relance l'animation de la barre
            const fillBar = item.querySelector('.skill-fill');
            if (fillBar) {
              const width = fillBar.dataset.width;
              fillBar.style.width = '0%';
              item.classList.remove('animate');

              setTimeout(() => {
                item.style.setProperty('--fill-width', width + '%');
                item.classList.add('animate');
              }, 50);
            }
          }, delay);
        } else {
          setTimeout(() => {
            item.classList.add('hidden');
            item.style.animation = 'none';
          }, delay);
        }
      });
    });
  });
}

// ===== STAGGER ANIMATION (au chargement) =====
function initStaggerAnimation() {
  const skillItems = document.querySelectorAll('.skill-item');

  skillItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.08}s`;
  });
}

// ===== INTERSECTION OBSERVER (détecte au scroll) =====
function observeSkillsAnimation() {
  const skillItems = document.querySelectorAll('.skill-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const item = entry.target;
        const fillBar = item.querySelector('.skill-fill');

        if (fillBar) {
          const fillWidth = fillBar.dataset.width;

          // Ajoute une classe pour marquer comme animée
          item.classList.add('animated');

          // Petit délai avant de remplir
          setTimeout(() => {
            item.style.setProperty('--fill-width', fillWidth + '%');
            item.classList.add('animate');

            // Pulse effect sur la barre
            fillBar.style.animation = 'fillPulse 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
          }, 100);
        }

        // Stop l'observation après animation
        observer.unobserve(item);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -80px 0px'
  });

  skillItems.forEach(item => {
    observer.observe(item);
  });
}

// ===== SETUP RESIZE LISTENER =====
function setupResizeListener() {
  let resizeTimeout;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Réinit les observers si viewport change
      const skillItems = document.querySelectorAll('.skill-item');
      skillItems.forEach(item => {
        item.classList.remove('animate', 'animated');
        const fillBar = item.querySelector('.skill-fill');
        if (fillBar) {
          fillBar.style.width = '0%';
        }
      });

      // Relance l'observation
      observeSkillsAnimation();
    }, 250);
  });
}

// ===== ANIMATIONS UTILITAIRES =====
function createKeyframes() {
  if (document.getElementById('skill-keyframes')) return;

  const style = document.createElement('style');
  style.id = 'skill-keyframes';
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes fillPulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 1; }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 10px rgba(232, 160, 0, 0.3); }
      50% { box-shadow: 0 0 20px rgba(232, 160, 0, 0.6); }
    }
  `;
  document.head.appendChild(style);
}

createKeyframes();

// ===== SMOOTH SCROLL EFFECT =====
function smoothScroll(element) {
  const topOffset = element.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({
    top: topOffset,
    behavior: 'smooth'
  });
}

// ===== ANALYTICS / TRACKING =====
function trackFilterClick(category) {
  if (window.gtag) {
    gtag('event', 'filter_clicked', {
      'filter_category': category
    });
  }
}

// Ajoute tracking aux boutons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    trackFilterClick(btn.dataset.filter);
  });
});

// ===== PERFORMANCE: LAZY LOAD IMAGES =====
function lazyLoadSkillImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

lazyLoadSkillImages();

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const activeBtn = document.querySelector('.filter-btn.active');
  let activeIndex = Array.from(filterBtns).indexOf(activeBtn);

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % filterBtns.length;
    filterBtns[activeIndex].click();
    smoothScroll(filterBtns[activeIndex]);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + filterBtns.length) % filterBtns.length;
    filterBtns[activeIndex].click();
    smoothScroll(filterBtns[activeIndex]);
  }
});

// ===== ACCESSIBILITY =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', btn.classList.contains('active'));
});

// Update aria-selected quand filtre change
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.setAttribute('aria-selected', false);
    });
    btn.setAttribute('aria-selected', true);
  });
});

// ===== SKILL ITEM DETAILS =====
document.querySelectorAll('.skill-item').forEach(item => {
  item.setAttribute('role', 'article');

  // Affiche le niveau en aria-label
  const levelBadge = item.querySelector('.skill-level');
  const skillName = item.querySelector('.skill-name');
  const level = levelBadge?.textContent || 'Unknown';

  item.setAttribute('aria-label', `${skillName?.textContent} - ${level}`);
});

// ===== DÉTECTION DE THÈME PRÉFÉRÉ =====
function detectPreferredTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.style.colorScheme = 'dark';
  }
}

detectPreferredTheme();

// ===== CONSOLE DEBUG (dev only) =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('%c🎯 Skills System Loaded', 'font-size: 16px; color: #e8a000; font-weight: bold;');
  console.log('%cFilters:', 'color: #50c878; font-weight: bold;', 
    Array.from(document.querySelectorAll('.filter-btn')).map(b => b.dataset.filter));
  console.log('%cSkills Count:', 'color: #64a0ff; font-weight: bold;', 
    document.querySelectorAll('.skill-item').length);
}
