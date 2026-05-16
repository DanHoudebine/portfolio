document.addEventListener('mousemove', (e) => {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');

  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';

  follower.style.left = e.clientX + 'px';
  follower.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, .btn, .social-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.querySelector('.cursor').style.transform = 'scale(3)';
    document.querySelector('.cursor-follower').style.opacity = '0';
  });

  el.addEventListener('mouseleave', () => {
    document.querySelector('.cursor').style.transform = 'translate(-50%, -50%) scale(1)';
    document.querySelector('.cursor-follower').style.opacity = '0.4';
  });
});
