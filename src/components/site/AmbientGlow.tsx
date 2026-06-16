import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Two large, blurred ember orbs that drift slowly behind the page content.
 * Pure transform/opacity animation on a fixed, pointer-none layer — adds
 * depth and warmth without touching layout. Paused under reduced-motion.
 */
export default function AmbientGlow() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const ctx = gsap.context(() => {
      gsap.to(a, { xPercent: 22, yPercent: 18, scale: 1.18, duration: 17, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(b, { xPercent: -20, yPercent: -14, scale: 1.12, duration: 21, ease: 'sine.inOut', repeat: -1, yoyo: true });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={aRef}
        className="absolute"
        style={{
          top: '8%', left: '-6%', width: '46vw', height: '46vw',
          background: 'radial-gradient(circle, rgba(255,122,47,0.10), transparent 68%)',
          filter: 'blur(36px)',
        }}
      />
      <div
        ref={bRef}
        className="absolute"
        style={{
          bottom: '4%', right: '-8%', width: '52vw', height: '52vw',
          background: 'radial-gradient(circle, rgba(179,74,18,0.12), transparent 70%)',
          filter: 'blur(44px)',
        }}
      />
    </div>
  );
}
