import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Boot screen — a percentage counts up in monumental type,
 * then the whole panel wipes upward and unmounts.
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const counter = counterRef.current;
    if (!panel || !counter) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setGone(true);
      return;
    }

    const state = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setGone(true) });

    tl.to(state, {
      v: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        counter.textContent = String(Math.round(state.v)).padStart(3, '0');
      },
    });
    tl.to(panel, { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '+=0.15');

    // Failsafe: rAF is throttled in background tabs, which freezes GSAP —
    // never leave the loader covering the page longer than 5s of wall time.
    const failsafe = setTimeout(() => setGone(true), 5000);

    return () => {
      clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between"
      style={{ background: 'var(--bg)', padding: 'clamp(20px, 4vw, 48px)' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--text-dim)' }}>
          DAN HOUDEBINE
        </span>
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--ember)' }}>
          LOADING WORLD
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
          ENVIRONMENT ART — PORTFOLIO
        </span>
        <div className="flex items-end gap-2">
          <span
            ref={counterRef}
            className="font-display"
            style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', lineHeight: 0.8, color: 'var(--text)' }}
          >
            000
          </span>
          <span className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', lineHeight: 1, color: 'var(--ember)' }}>
            %
          </span>
        </div>
      </div>
    </div>
  );
}
