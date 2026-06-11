import { useCallback, useEffect } from 'react';
import { projects, projectSrc } from '../../data/projects';

interface LightboxProps {
  index: number; // -1 = closed
  onClose: () => void;
  onNavigate: (next: number) => void;
}

/**
 * Full-screen project viewer with keyboard navigation
 * (Esc to close, ←/→ to move between the 15 pieces).
 */
export default function Lightbox({ index, onClose, onNavigate }: LightboxProps) {
  const open = index >= 0;
  const count = projects.length;

  const prev = useCallback(
    () => onNavigate((index - 1 + count) % count),
    [index, count, onNavigate],
  );
  const next = useCallback(
    () => onNavigate((index + 1) % count),
    [index, count, onNavigate],
  );

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

  if (!open) return null;
  const project = projects[index];

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col"
      style={{ background: 'rgba(8, 7, 5, 0.96)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 'clamp(16px, 3vw, 28px) clamp(20px, 4vw, 48px)' }}
      >
        <span className="font-mono text-[11px] tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
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
          src={projectSrc(project)}
          alt={project.title}
          className="max-h-full max-w-full object-contain"
          style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Prev / Next */}
        <button
          aria-label="Previous"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="font-display absolute left-0 top-1/2 -translate-y-1/2 px-3 transition-colors duration-300 hover:text-[var(--ember)] sm:px-6"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dim)' }}
        >
          ←
        </button>
        <button
          aria-label="Next"
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="font-display absolute right-0 top-1/2 -translate-y-1/2 px-3 transition-colors duration-300 hover:text-[var(--ember)] sm:px-6"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-dim)' }}
        >
          →
        </button>
      </div>

      {/* Caption */}
      <div
        className="flex flex-wrap items-end justify-between gap-3"
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
  );
}
