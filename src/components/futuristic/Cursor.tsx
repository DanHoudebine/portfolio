import { useEffect, useRef } from 'react';

/**
 * Custom cursor — a small dot follows the pointer 1:1, and a larger ring
 * trails it with damping. Ring expands when hovering over interactive elements.
 * Disabled on touch devices.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    let hovering = false;
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (ringRef.current) {
        const scale = hovering ? 1.6 : 1;
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${scale})`;
      }
    };
    raf = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest('a, button, input, textarea, [role="button"], [data-cursor="hover"]');
      hovering = !!interactive;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.body.classList.add('custom-cursor-active');

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '34px', height: '34px',
          border: '1px solid #3b82f6',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999,
          mixBlendMode: 'screen',
          transition: 'transform 0.08s linear, border-color 0.3s',
        }}
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '5px', height: '5px',
          background: '#3b82f6',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999,
          boxShadow: '0 0 10px rgba(59,130,246,0.8)',
        }}
      />
    </>
  );
}
