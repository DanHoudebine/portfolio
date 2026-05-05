/* ===== SKILLS SYSTEM AVANCÉ ===== */

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  initSkillsFilter();
  observeSkillsAnimation();
  initStaggerAnimation();
  setupResizeListener();
  setupKeyboardNavigation();
  setupAccessibility();
  debugLog();
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
      // Désactive tous les boutons
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.animation = 'none';
      });

      // Réactive le bouton cliqué avec animation
      setTimeout(() => {
        btn.classList.add('active');
        btn.style.animation = 'pulse 0.6s ease-out';
      }, 10);

      const filter = btn.dataset.filter;

      // Filtre avec stagger
      skillItems.forEach((item, itemIndex) => {
        const category = item.dataset.category;
        const delay = itemIndex * 40;

        if (filter === 'all' || category === filter) {
          setTimeout(() => {
            item.classList.remove('hidden');
            item.style.animation = 'none';
            item.offsetHeight; // Force reflow
            item.style.animation = `skillItemFadeIn 0.6s ease-out`;

            // Relance l'animation de la barre de progression
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

    // Initialise la largeur des barres depuis data-width
    const fillBar = item.querySelector('.skill-fill');
    if (fillBar) {
      const width = fillBar.dataset.width;
      item.style.setProperty('--fill-width', width + '%');
      
      // Lance l'animation avec délai
      setTimeout(() => {
        item.classList.add('animate');
      }, 100 + index * 60);
    }
  });
}

// ===== INTERSECTION OBSERVER (détecte au scroll) =====
function observeSkillsAnimation() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          const fillBar = entry.target.querySelector('.skill-fill');
          
          if (fillBar && !entry.target.classList.contains('animate')) {
            setTimeout(() => {
              entry.target.classList.add('animate');
            }, 100);
          }
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  skillItems.forEach(item => observer.observe(item));
}

// ===== RESIZE LISTENER =====
function setupResizeListener() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Réinitialise les animations au redimensionnement
      const skillItems = document.querySelectorAll('.skill-item');
      skillItems.forEach(item => {
        item.classList.remove('animate');
        const fillBar = item.querySelector('.skill-fill');
        if (fillBar) {
          fillBar.style.width = '0%';
        }
      });

      // Relance après un délai
      setTimeout(initStaggerAnimation, 100);
    }, 250);
  });
}

// ===== KEYBOARD NAVIGATION =====
function setupKeyboardNavigation() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  let currentIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + filterBtns.length) % filterBtns.length;
      filterBtns[currentIndex].focus();
      filterBtns[currentIndex].click();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % filterBtns.length;
      filterBtns[currentIndex].focus();
      filterBtns[currentIndex].click();
    }
  });
}

// ===== ACCESSIBILITY =====
function setupAccessibility() {
  // Buttons as tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', btn.classList.contains('active'));
  });

  // Update aria-selected lors du click
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.setAttribute('aria-selected', false);
      });
      btn.setAttribute('aria-selected', true);
    });
  });

  // Skill items aria-labels
  document.querySelectorAll('.skill-item').forEach(item => {
    item.setAttribute('role', 'article
