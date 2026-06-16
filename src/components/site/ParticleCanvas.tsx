import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number; maxLife: number;
  hue: number;
}

/**
 * Canvas 2D ember particles that float upward in the hero.
 * Mouse repulsion pushes nearby particles away.
 * Uses screen blend mode so it layers over the video.
 */
export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles: Particle[] = [];
    let mouse = { x: W / 2, y: H / 2, active: false };
    let frame = 0;
    let raf = 0;

    const spawn = () => {
      if (particles.length >= 65) return;
      const maxLife = 200 + Math.random() * 160;
      particles.push({
        x: 0.1 * W + Math.random() * 0.8 * W,
        y: H + 10 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.55 + Math.random() * 1.1),
        size: 0.8 + Math.random() * 2.8,
        life: 0, maxLife,
        hue: 16 + Math.random() * 22,
      });
    };

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      if (frame % 3 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14400) { // 120px radius
            const d = Math.sqrt(d2);
            const f = ((120 - d) / 120) * 0.5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // Slight turbulence
        p.vx += (Math.random() - 0.5) * 0.03;
        p.vx *= 0.99;
        p.vy *= 0.998;

        p.x += p.vx;
        p.y += p.vy;

        const t = p.life / p.maxLife;
        // Fade in fast, hold, fade out from 70%
        const alpha = t < 0.12 ? t / 0.12 : t > 0.72 ? (1 - t) / 0.28 : 1;

        const r = p.size * (1 - t * 0.4);

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 68%, ${alpha * 0.85})`;
        ctx.fill();

        // Inner glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grd.addColorStop(0, `hsla(${p.hue}, 100%, 72%, ${alpha * 0.18})`);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -20) {
          particles.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => { mouse.active = false; };

    const section = canvas.closest('section') ?? canvas.parentElement;
    section?.addEventListener('mousemove', onMove);
    section?.addEventListener('mouseleave', onLeave);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      section?.removeEventListener('mousemove', onMove);
      section?.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'screen', opacity: 0.75, zIndex: 2 }}
    />
  );
}
