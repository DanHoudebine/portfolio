import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Custom cursor — ember dot + trailing ring. Desktop (fine pointer) only.
 * Elements marked [data-cursor="hover"] (and links/buttons) grow the ring.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      // stays invisible until the mouse actually moves, so it never
      // lingers at (0,0) on page load
      dot.style.visibility = 'visible';
      ring.style.visibility = 'visible';
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const isInteractive = (el: Element | null) =>
      !!el?.closest('a, button, [data-cursor="hover"]');

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target as Element)) {
        gsap.to(ring, { scale: 2.1, opacity: 0.9, duration: 0.3 });
        gsap.to(dot, { scale: 0.4, duration: 0.3 });
      }
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target as Element)) {
        gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px]"
        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', visibility: 'hidden' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[17px] -mt-[17px]"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid var(--ember)',
          opacity: 0.5,
          visibility: 'hidden',
        }}
      />
    </>
  );
}
