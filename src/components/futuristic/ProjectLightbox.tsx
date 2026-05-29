import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectMeta {
  title: string;
  tags: string;
  year: string;
}

interface ProjectLightboxProps {
  open: boolean;
  index: number;          // current project index (0-based)
  images: string[];       // full URLs of all project images
  projects: ProjectMeta[]; // metadata per project (same length as images)
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Sci-fi lightbox modal for the Work gallery.
 *  • Click backdrop or × button to close
 *  • ← / → arrows or buttons to navigate
 *  • Esc to close
 *  • Image scaled to fit viewport (object-contain) with frame corners
 *  • Index counter, title, tags, year displayed in HUD style
 *  • Body scroll locked while open
 */
export default function ProjectLightbox({
  open,
  index,
  images,
  projects,
  onClose,
  onPrev,
  onNext,
}: ProjectLightboxProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowLeft') onPrev();
    else if (e.key === 'ArrowRight') onNext();
  }, [open, onClose, onPrev, onNext]);

  // Mount/unmount keyboard + body scroll lock
  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onKeyDown]);

  if (!open || index < 0 || index >= images.length) return null;

  const project = projects[index];
  const total = images.length;
  const num = String(index + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        // close when clicking the backdrop (not children)
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(2, 4, 10, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 4vw, 60px) clamp(12px, 5vw, 80px)',
        animation: 'lb-fade-in 0.25s ease-out',
      }}
    >
      {/* ─── HUD Top Bar ─────────────────────────────────────────────────────── */}
      <div
        className="font-mono uppercase"
        style={{
          position: 'absolute',
          top: 'clamp(14px, 3vw, 28px)',
          left: 'clamp(14px, 4vw, 32px)',
          right: 'clamp(14px, 4vw, 32px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'clamp(9px, 1.6vw, 11px)',
          letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            color: '#3b82f6', fontWeight: 600, fontSize: '14px',
            textShadow: '0 0 10px rgba(59,130,246,0.5)',
          }}>{num}</span>
          <span style={{ color: 'rgba(180,200,230,0.4)' }}>/ {totalStr}</span>
          <span style={{ margin: '0 8px', color: 'rgba(180,200,230,0.3)' }}>·</span>
          <span>SELECTED WORK</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: '44px', height: '44px',
            display: 'grid', placeItems: 'center',
            border: '1px solid rgba(59,130,246,0.4)',
            background: 'rgba(59,130,246,0.06)',
            color: '#e5edff',
            cursor: 'pointer',
            fontSize: '20px',
            flexShrink: 0,
            fontFamily: 'JetBrains Mono, monospace',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.color = '#04060d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
            e.currentTarget.style.color = '#e5edff';
          }}
        >
          ×
        </button>
      </div>

      {/* ─── Prev Button ─────────────────────────────────────────────────────── */}
      <button
        onClick={onPrev}
        aria-label="Previous"
        style={{
          position: 'absolute',
          left: 'clamp(8px, 2vw, 24px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(44px, 5vw, 52px)',
          height: 'clamp(44px, 5vw, 52px)',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid rgba(59,130,246,0.4)',
          background: 'rgba(59,130,246,0.06)',
          color: '#e5edff',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          fontSize: '20px',
          fontFamily: 'JetBrains Mono, monospace',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3b82f6';
          e.currentTarget.style.color = '#04060d';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
          e.currentTarget.style.color = '#e5edff';
          e.currentTarget.style.transform = 'translateY(-50%)';
        }}
      >
        ‹
      </button>

      {/* ─── Next Button ─────────────────────────────────────────────────────── */}
      <button
        onClick={onNext}
        aria-label="Next"
        style={{
          position: 'absolute',
          right: 'clamp(8px, 2vw, 24px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(44px, 5vw, 52px)',
          height: 'clamp(44px, 5vw, 52px)',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid rgba(59,130,246,0.4)',
          background: 'rgba(59,130,246,0.06)',
          color: '#e5edff',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          fontSize: '20px',
          fontFamily: 'JetBrains Mono, monospace',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3b82f6';
          e.currentTarget.style.color = '#04060d';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
          e.currentTarget.style.color = '#e5edff';
          e.currentTarget.style.transform = 'translateY(-50%)';
        }}
      >
        ›
      </button>

      {/* ─── Image + Metadata Container ──────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '95%',
          maxHeight: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          animation: 'lb-scale-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Image wrapper with corner brackets */}
        <div style={{ position: 'relative', maxHeight: 'calc(85vh - 100px)' }}>
          <img
            key={index /* force fade-in on swap */}
            src={images[index]}
            alt={project.title}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(85vh - 100px)',
              objectFit: 'contain',
              display: 'block',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.18)',
              animation: 'lb-image-fade 0.35s ease-out',
            }}
          />
          {/* Corner brackets */}
          {[
            { top: -10, left: -10, b: 'tl' },
            { top: -10, right: -10, b: 'tr' },
            { bottom: -10, left: -10, b: 'bl' },
            { bottom: -10, right: -10, b: 'br' },
          ].map((c, i) => {
            const s: React.CSSProperties = {
              position: 'absolute',
              width: '18px', height: '18px',
              borderColor: '#3b82f6',
              pointerEvents: 'none',
            };
            if (c.top !== undefined) s.top = c.top;
            if (c.bottom !== undefined) s.bottom = c.bottom;
            if (c.left !== undefined) s.left = c.left;
            if (c.right !== undefined) s.right = c.right;
            if (c.b === 'tl') { s.borderTop = '1px solid'; s.borderLeft = '1px solid'; }
            if (c.b === 'tr') { s.borderTop = '1px solid'; s.borderRight = '1px solid'; }
            if (c.b === 'bl') { s.borderBottom = '1px solid'; s.borderLeft = '1px solid'; }
            if (c.b === 'br') { s.borderBottom = '1px solid'; s.borderRight = '1px solid'; }
            return <div key={i} style={s} />;
          })}
        </div>

        {/* Metadata strip below image */}
        <div
          className="font-body"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            width: '100%',
            maxWidth: '900px',
            paddingTop: '4px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              className="font-heading font-semibold text-white"
              style={{ fontSize: '22px', lineHeight: 1.2, letterSpacing: '-0.01em' }}
            >
              {project.title}
            </h3>
            <p
              className="font-mono uppercase mt-2"
              style={{
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: '#60a5fa',
              }}
            >
              {project.tags}
            </p>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: '14px',
              letterSpacing: '0.15em',
              color: 'rgba(210,210,210,0.85)',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {project.year}
          </div>
        </div>

        {/* Helper hint */}
        <div
          className="font-mono uppercase"
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            color: 'rgba(180,200,230,0.35)',
            marginTop: '4px',
          }}
        >
          ← → NAVIGATE · ESC TO CLOSE
        </div>
      </div>

      <style>{`
        @keyframes lb-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lb-scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes lb-image-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      {/* t() ref to satisfy linter when not used; reserved for future i18n */}
      <span style={{ display: 'none' }}>{t('work.viewProject')}</span>
    </div>
  );
}
