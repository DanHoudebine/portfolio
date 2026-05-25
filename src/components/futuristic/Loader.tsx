import { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete?: () => void;
}

/**
 * Sci-fi boot-up loader. Counts up to 100%, then fades out.
 * Mock progress (no real asset tracking) — pure presentation.
 */
export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        // Fade out shortly
        window.setTimeout(() => {
          setHide(true);
          onComplete?.();
        }, 280);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const pct = Math.round(progress * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: '#04060d',
        opacity: hide ? 0 : 1,
        pointerEvents: hide ? 'none' : 'auto',
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {/* Logo / mark */}
      <div
        className="font-heading font-bold tracking-[0.25em]"
        style={{
          fontSize: '14px',
          color: '#3b82f6',
          marginBottom: '40px',
          textShadow: '0 0 18px rgba(59,130,246,0.7)',
        }}
      >
        DH · PORTFOLIO
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '280px',
          height: '2px',
          background: 'rgba(180,200,230,0.12)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0,
            width: `${pct}%`,
            background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
            boxShadow: '0 0 12px rgba(59,130,246,0.7)',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Status */}
      <div
        className="font-mono uppercase mt-5"
        style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: 'rgba(180,200,230,0.7)',
          display: 'flex',
          gap: '24px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>BOOTING</span>
        <span style={{ color: '#3b82f6' }}>{String(pct).padStart(3, '0')}%</span>
        <span>SECURE</span>
      </div>

      {/* Subtle moving scanline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(59,130,246,0.04) 3px, rgba(59,130,246,0.04) 4px)',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}
