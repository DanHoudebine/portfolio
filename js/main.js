// ============================================
// PARTICLES HERO
// ============================================
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random()*2+1}px;
      height:${Math.random()*2+1}px;
      background:rgba(0,212,255,${Math.random()*0.5+0.1});
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation:floatParticle ${Math.random()*10+10}s linear infinite;
      animation-delay:${Math.random()*-10}s;
    `;
    container.appendChild(p);
  }
}

const _pStyle = document.createElement('style');
_pStyle.textContent = `
  @keyframes floatParticle {
    0%   { transform:translateY(0) translateX(0); opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:1; }
    100% { transform:translateY(-100vh) translateX(50px); opacity:0; }
  }
`;
document.head.appendChild(_pStyle);

// ============================================
// COMPTEURS HERO
// ============================================
function animateHeroCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / (2000 / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

// ============================================
// REVEAL ON SCROLL
// ============================================
function revealElements() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', revealElements);

// ============================================
// INIT
// ============================================
window.addEventListener('load', () => {
  createParticles();
  setTimeout(animateHeroCounters, 1500);
  revealElements();
});
