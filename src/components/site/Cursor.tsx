import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Single-element morphing cursor.
 * Default: 10px ember dot, zero-lag follow.
 * Hover links / [data-cursor="hover"]: swells to 80px filled circle
 *   with contextual label ("VIEW ↗", "OPEN", etc.) inside.
 * Click: elastic burst.
 * Only on fine-pointer devices (desktop).
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label) return;

    const qx = gsap.quickTo(cursor, 'x', { duration: 0.05, ease: 'power2.out' });
    const qy = gsap.quickTo(cursor, 'y', { duration: 0.05, ease: 'power2.out' });

    const onMove = (e: MouseEvent) => {
      cursor.style.visibility = 'visible';
      qx(e.clientX);
      qy(e.clientY);
    };

    const getLabel = (el: Element | null): string | null => {
      if (!el) return null;
      if (el.closest('[data-cursor="hover"]')) return 'OPEN ↗';
      if (el.closest('button')) return 'CLICK';
      if (el.closest('a')) return 'VIEW ↗';
      return null;
    };

    const expand = (lbl: string) => {
      label.textContent = lbl;
      gsap.to(cursor, { width: 80, height: 80, marginLeft: -40, marginTop: -40, duration: 0.45, ease: 'power3.out' });
      gsap.to(label, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out', delay: 0.08 });
    };

    const collapse = () => {
      gsap.to(label, { opacity: 0, scale: 0.5, duration: 0.18, ease: 'power2.in' });
      gsap.to(cursor, { width: 10, height: 10, marginLeft: -5, marginTop: -5, duration: 0.38, ease: 'power3.out' });
    };

    const onOver = (e: MouseEvent) => {
      const lbl = getLabel(e.target as Element);
      if (lbl) expand(lbl);
    };
    const onOut = (e: MouseEvent) => {
      if (getLabel(e.target as Element)) collapse();
    };
    const onClick = () => {
      gsap.timeline()
        .to(cursor, { scale: 0.75, duration: 0.07 })
        .to(cursor, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('click', onClick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[99] flex items-center justify-center"
      style={{
        width: 10,
        height: 10,
        marginLeft: -5,
        marginTop: -5,
        borderRadius: '50%',
        background: 'var(--ember)',
        visibility: 'hidden',
      }}
    >
      <span
        ref={labelRef}
        className="font-mono select-none text-[9px] tracking-[0.18em]"
        style={{ color: '#0a0907', opacity: 0, transform: 'scale(0.5)', whiteSpace: 'nowrap' }}
      >
        OPEN ↗
      </span>
    </div>
  );
}
