import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Boot screen with animated counter, horizontal scan line, and wipe-out.
 * A brief glitch flash fires at 100% before the panel exits.
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const panelRef   = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const scanRef    = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel   = panelRef.current;
    const counter = counterRef.current;
    const scan    = scanRef.current;
    const overlay = overlayRef.current;
    if (!panel || !counter || !scan || !overlay) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setGone(true); return; }

    const state = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setGone(true) });

    // Scan line loop
    gsap.to(scan, {
      yPercent: 110,
      duration: 1.6,
      ease: 'none',
      repeat: -1,
      onRepeat() { gsap.set(scan, { yPercent: -10 }); },
    });

    // Counter count-up
    tl.to(state, {
      v: 100,
      duration: 1.55,
      ease: 'power2.inOut',
      onUpdate() {
        const n = Math.round(state.v);
        counter.textContent = String(n).padStart(3, '0');
        // Color shift: white → ember at 100
        counter.style.color = n >= 99 ? 'var(--cyan)' : 'var(--text)';
      },
    });

    // Glitch flash at 100%
    tl.to(overlay, { opacity: 0.25, duration: 0.04 }, '+=0.05');
    tl.to(overlay, { opacity: 0, duration: 0.04 });
    tl.to(overlay, { opacity: 0.15, duration: 0.03 });
    tl.to(overlay, { opacity: 0, duration: 0.06 });

    // Panel wipe up
    tl.to(panel, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.08');

    const failsafe = setTimeout(() => setGone(true), 5500);
    return () => {
      clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden"
      style={{ background: 'var(--bg)', padding: 'clamp(20px, 4vw, 48px)' }}
    >
      {/* Noise scan line */}
      <div
        ref={scanRef}
        className="pointer-events-none absolute left-0 right-0"
        style={{
          height: 2,
          background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.55), transparent)',
          transform: 'translateY(-10%)',
          zIndex: 2,
        }}
      />

      {/* Glitch flash overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0"
        style={{ background: 'rgba(0,229,255,0.15)', opacity: 0, zIndex: 3 }}
      />

      {/* Horizontal grid lines */}
      {[25, 50, 75].map((pct) => (
        <div
          key={pct}
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: `${pct}%`,
            height: 1,
            background: 'var(--line)',
          }}
        />
      ))}
      {/* Vertical grid line */}
      <div
        className="pointer-events-none absolute bottom-0 top-0"
        style={{ left: '50%', width: 1, background: 'var(--line)' }}
      />

      {/* Top row */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--text-dim)' }}>
          DAN HOUDEBINE
        </span>
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--ember)' }}>
          LOADING WORLD
        </span>
      </div>

      {/* Bottom row — monumental counter */}
      <div className="relative z-10 flex items-end justify-between">
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
          ENVIRONMENT ART — PORTFOLIO
        </span>
        <div className="flex items-end gap-2">
          <span
            ref={counterRef}
            className="font-display transition-colors duration-150"
            style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', lineHeight: 0.8, color: 'var(--text)' }}
          >
            000
          </span>
          <span
            className="font-display"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', lineHeight: 1, color: 'var(--ember)' }}
          >
            %
          </span>
        </div>
      </div>
    </div>
  );
}
