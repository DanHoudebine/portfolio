import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TRAIL = 12;

/**
 * Awwwards-style cursor: dot + lagging ring + trailing particles + label.
 * State is detected via elementFromPoint on every mousemove — no stuck labels.
 * Only renders on fine-pointer (desktop) devices.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailsRef = useRef<(HTMLDivElement | null)[]>([]);
  const typeRef = useRef('default');

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.body.style.cursor = 'none';

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const trails = trailsRef.current.filter(Boolean) as HTMLDivElement[];

    const setDX = gsap.quickSetter(dot, 'x', 'px');
    const setDY = gsap.quickSetter(dot, 'y', 'px');
    const qRX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const qRY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });

    const qTX = trails.map((el, i) =>
      gsap.quickTo(el, 'x', { duration: 0.07 + i * 0.055, ease: 'power2.out' }),
    );
    const qTY = trails.map((el, i) =>
      gsap.quickTo(el, 'y', { duration: 0.07 + i * 0.055, ease: 'power2.out' }),
    );

    const setType = (type: string) => {
      if (type === typeRef.current) return;
      typeRef.current = type;
      switch (type) {
        case 'hover':
          gsap.to(ring, { scale: 2.2, opacity: 0.65, duration: 0.35, ease: 'power2.out' });
          gsap.to(dot, { scale: 0.4, duration: 0.25 });
          gsap.to(label, { opacity: 0, duration: 0.1 });
          break;
        case 'view':
          label.textContent = 'VIEW';
          gsap.to(ring, { scale: 3.8, opacity: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2 });
          gsap.fromTo(label,
            { opacity: 0, scale: 0.5, rotateZ: -8 },
            { opacity: 1, scale: 1, rotateZ: 0, duration: 0.35, ease: 'back.out(3)' },
          );
          break;
        case 'drag':
          label.textContent = 'DRAG';
          gsap.to(ring, { scale: 3.8, opacity: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2 });
          gsap.fromTo(label,
            { opacity: 0, scale: 0.5, rotateZ: 8 },
            { opacity: 1, scale: 1, rotateZ: 0, duration: 0.35, ease: 'back.out(3)' },
          );
          break;
        default:
          gsap.to(ring, { scale: 1, opacity: 0.38, duration: 0.45, ease: 'power2.out' });
          gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3 });
          gsap.to(label, {
            opacity: 0, duration: 0.12,
            onComplete: () => { label.textContent = ''; },
          });
      }
    };

    const onMove = (e: MouseEvent) => {
      setDX(e.clientX); setDY(e.clientY);
      qRX(e.clientX); qRY(e.clientY);
      qTX.forEach(fn => fn(e.clientX));
      qTY.forEach(fn => fn(e.clientY));

      // elementFromPoint is the only reliable way — mouseover/out can miss events
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cEl = el?.closest('[data-cursor]');
      setType(cEl?.getAttribute('data-cursor') ?? 'default');
    };

    const onLeave = () =>
      gsap.to([dot, ring, ...trails], { opacity: 0, duration: 0.25 });

    const onEnter = () => {
      gsap.to(dot, { opacity: 1, duration: 0.25 });
      gsap.to(ring, { opacity: typeRef.current === 'default' ? 0.38 : 1, duration: 0.25 });
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={el => { trailsRef.current[i] = el; }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: Math.max(1.5, 5 - i * 0.3),
            height: Math.max(1.5, 5 - i * 0.3),
            borderRadius: '50%',
            background: 'var(--ember)',
            opacity: (1 - i / TRAIL) * 0.3,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Dot — zero lag */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--ember)',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          zIndex: 2,
        }}
      />

      {/* Ring — spring lag, expands on hover/view/drag */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 40, height: 40, borderRadius: '50%',
          border: '1px solid rgba(255,122,47,0.38)',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <span
          ref={labelRef}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: '0.18em',
            color: 'var(--ember)', opacity: 0,
            whiteSpace: 'nowrap', userSelect: 'none',
          }}
        />
      </div>
    </div>
  );
}
