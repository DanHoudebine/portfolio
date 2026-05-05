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
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(5,5,16,0.98)';
        navLinks.style.padding = '20px';
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
