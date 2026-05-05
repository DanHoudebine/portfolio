/* ===== SKILLS ===== */

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  initSkillsFilter();
  observeSkillsAnimation();
});

// ===== FILTRAGE =====
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillItems = document.querySelectorAll('.skill-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Retire active de tous les boutons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Ajoute active au bouton cliqué
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      skillItems.forEach(item => {
        const category = item.dataset.category;

        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
          // Relance l'animation
          item.classList.remove('animate');
          setTimeout(() => {
            item.classList.add('animate');
          }, 50);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

// ===== ANIMATION AU SCROLL =====
function observeSkillsAnimation() {
  const skillItems = document.querySelectorAll('.skill-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const fillWidth = item.querySelector('.skill-fill').dataset.width;

        // Set la variable CSS pour l'animation
        item.style.setProperty('--fill-width', fillWidth + '%');

        // Ajoute la classe animate
        item.classList.add('animate');

        // Stop l'observation
        observer.unobserve(item);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  skillItems.forEach(item => {
    observer.observe(item);
  });
}

// ===== FILTRE DYNAMIQUE AU SCROLL =====
window.addEventListener('scroll', () => {
  const skillItems = document.querySelectorAll('.skill-item:not(.hidden)');

  skillItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible && !item.classList.contains('animate')) {
      const fillWidth = item.querySelector('.skill-fill').dataset.width;
      item.style.setProperty('--fill-width', fillWidth + '%');
      item.classList.add('animate');
    }
  });
});
