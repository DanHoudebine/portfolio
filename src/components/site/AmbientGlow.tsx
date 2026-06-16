import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Four ambient ember orbs:
 * - Two that drift slowly on GSAP yoyo loops
 * - One that follows the mouse with heavy lag (depth feel)
 * - One that drifts relative to scroll position
 */
export default function AmbientGlow() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Orb A — drifts upper-left → lower-right
      gsap.to(aRef.current, {
        xPercent: 24, yPercent: 20, scale: 1.22,
        duration: 19, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });
      // Orb B — drifts lower-right → upper-left
      gsap.to(bRef.current, {
        xPercent: -22, yPercent: -16, scale: 1.15,
        duration: 23, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });
      // Orb D — scroll-driven drift
      gsap.to(scrollRef.current, {
        yPercent: -30, opacity: 0.6,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 3 },
      });
    });

    // Mouse-follow orb (C) — very heavy lag for depth
    const mouseOrb = mouseRef.current;
    if (!mouseOrb) return;

    const qX = gsap.quickTo(mouseOrb, 'x', { duration: 3.5, ease: 'power1.out' });
    const qY = gsap.quickTo(mouseOrb, 'y', { duration: 3.5, ease: 'power1.out' });

    const onMove = (e: MouseEvent) => {
      qX(e.clientX - window.innerWidth * 0.5);
      qY(e.clientY - window.innerHeight * 0.5);
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* A — top-left ember */}
      <div
        ref={aRef}
        className="absolute"
        style={{
          top: '5%', left: '-8%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(255,122,47,0.11), transparent 68%)',
          filter: 'blur(40px)',
        }}
      />
      {/* B — bottom-right deep red */}
      <div
        ref={bRef}
        className="absolute"
        style={{
          bottom: '2%', right: '-10%', width: '56vw', height: '56vw',
          background: 'radial-gradient(circle, rgba(179,74,18,0.13), transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
      {/* C — follows mouse */}
      <div
        ref={mouseRef}
        className="absolute"
        style={{
          top: '50%', left: '50%', width: '38vw', height: '38vw',
          marginLeft: '-19vw', marginTop: '-19vw',
          background: 'radial-gradient(circle, rgba(255,122,47,0.07), transparent 65%)',
          filter: 'blur(32px)',
        }}
      />
      {/* D — scroll-driven mid orb */}
      <div
        ref={scrollRef}
        className="absolute"
        style={{
          top: '30%', left: '30%', width: '30vw', height: '30vw',
          background: 'radial-gradient(circle, rgba(255,180,80,0.06), transparent 60%)',
          filter: 'blur(28px)',
          opacity: 0.8,
        }}
      />
    </div>
  );
}
