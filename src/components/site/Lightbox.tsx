import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { projects, projectSrc } from '../../data/projects';

interface LightboxProps {
  index: number; // -1 = closed
  onClose: () => void;
  onNavigate: (next: number) => void;
}

/**
 * Full-screen project viewer. Opens behind an ember wipe panel that
 * sweeps across the screen; navigation slides the image in from the
 * travel direction. Esc to close, ←/→ to move between pieces.
 */
export default function Lightbox({ index, onClose, onNavigate }: LightboxProps) {
  const open = index >= 0;
  const count = projects.length;

  const [display, setDisplay] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wasOpen = useRef(false);
  const pendingOpen = useRef(false);
  const pendingNavDir = useRef(0);
  const closing = useRef(false);

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const prev = useCallback(() => onNavigate((index - 1 + count) % count), [index, count, onNavigate]);
  const next = useCallback(() => onNavigate((index + 1) % count), [index, count, onNavigate]);

  // Orchestrate open / navigate / close
  useEffect(() => {
    if (index >= 0) {
      if (!wasOpen.current) {
        pendingOpen.current = true;
      } else if (index !== display) {
        // travel direction (wrap-aware for the common ±1 steps)
        const diff = index - display;
        pendingNavDir.current = diff === count - 1 ? -1 : diff === -(count - 1) ? 1 : Math.sign(diff);
      }
      closing.current = false;
      setDisplay(index);
    } else if (wasOpen.current && display >= 0 && !closing.current) {
      closing.current = true;
      const root = rootRef.current;
      if (!root || reduced()) {
        setDisplay(-1);
      } else {
        gsap.timeline({ onComplete: () => setDisplay(-1) })
          .to('.lb-anim', { opacity: 0, y: 16, duration: 0.28, stagger: 0.03, ease: 'power2.in' })
          .to(root, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.1');
      }
    }
    wasOpen.current = index >= 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Play entrance / navigation animations once the DOM exists
  useEffect(() => {
    if (display < 0) return;
    const root = rootRef.current;
    const wipe = wipeRef.current;
    if (!root) return;

    if (pendingOpen.current) {
      pendingOpen.current = false;
      if (reduced() || !wipe) { gsap.set(root, { opacity: 1 }); return; }

      const tl = gsap.timeline();
      tl.set(root, { opacity: 1 })
        .set('.lb-content', { opacity: 0 })
        // ember panel sweeps in from the left…
        .fromTo(wipe,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.5, ease: 'power4.inOut' },
        )
        // …content appears behind it…
        .set('.lb-content', { opacity: 1 })
        // …and the panel exits right, revealing everything
        .to(wipe, { scaleX: 0, transformOrigin: 'right center', duration: 0.55, ease: 'power4.inOut' })
        .fromTo('.lb-img',
          { scale: 1.08 },
          { scale: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.35',
        )
        .fromTo('.lb-anim',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 },
          '-=0.7',
        );
    } else if (pendingNavDir.current !== 0) {
      const dir = pendingNavDir.current;
      pendingNavDir.current = 0;
      if (reduced()) return;
      gsap.fromTo(imgRef.current,
        { opacity: 0, x: dir * 60, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
      );
    }
  }, [display]);

  // Keyboard + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose, prev, next]);

  if (display < 0) return null;
  const project = projects[display];

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[95] flex flex-col"
      style={{ background: 'rgba(8, 7, 5, 0.96)', backdropFilter: 'blur(8px)', opacity: 0 }}
      onClick={onClose}
    >
      {/* Ember wipe panel */}
      <div
        ref={wipeRef}
        className="pointer-events-none absolute inset-0 z-30"
        style={{ background: 'var(--ember)', transform: 'scaleX(0)' }}
      />

      <div className="lb-content flex min-h-0 flex-1 flex-col">
        {/* Top bar */}
        <div
          className="lb-anim flex items-center justify-between"
          style={{ padding: 'clamp(16px, 3vw, 28px) clamp(20px, 4vw, 48px)' }}
        >
          <span className="font-mono text-[11px] tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>
            {String(display + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-mono -my-3 py-3 text-[12px] tracking-[0.3em] transition-colors duration-300 hover:text-[var(--ember)]"
            style={{ color: 'var(--text)', minHeight: 44 }}
          >
            <span className="hidden sm:inline">[ ESC ] </span>CLOSE ✕
          </button>
        </div>

        {/* Image */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center"
          style={{ padding: '0 clamp(12px, 6vw, 90px)' }}
        >
          <img
            ref={imgRef}
            src={projectSrc(project)}
            alt={project.title}
            className="lb-img max-h-full max-w-full object-contain"
            style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.7)' }}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="lb-anim font-display absolute left-0 top-1/2 -translate-y-1/2 px-3 transition-colors duration-300 hover:text-[var(--ember)] sm:px-6"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dim)' }}
          >
            ←
          </button>
          <button
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="lb-anim font-display absolute right-0 top-1/2 -translate-y-1/2 px-3 transition-colors duration-300 hover:text-[var(--ember)] sm:px-6"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dim)' }}
          >
            →
          </button>
        </div>

        {/* Caption */}
        <div
          className="lb-anim flex flex-wrap items-end justify-between gap-3"
          style={{ padding: 'clamp(16px, 3vw, 28px) clamp(20px, 4vw, 48px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 1, color: 'var(--text)' }}>
              {project.title}
            </div>
            <div className="font-mono mt-2 text-[11px] tracking-[0.25em]" style={{ color: 'var(--ember)' }}>
              {project.tags}
            </div>
          </div>
          <span className="font-mono text-[12px]" style={{ color: 'var(--text-dim)' }}>
            {project.year}
          </span>
        </div>
      </div>
    </div>
  );
}
