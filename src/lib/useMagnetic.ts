import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Magnetic hover — the element is gently pulled toward the cursor while
 * hovered, then springs back on leave. An optional inner [data-magnetic-text]
 * child moves further for a parallax feel.
 *
 * Disabled on coarse pointers and when prefers-reduced-motion is set.
 *
 * @param strength px the element travels at the pointer edge (default 0.35×)
 */
export default function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  strength = 0.35,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inner = el.querySelector<HTMLElement>('[data-magnetic-text]');

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.5)' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.5)' }) : null;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.5);
      iyTo?.(dy * strength * 0.5);
    };
    const onLeave = () => {
      xTo(0); yTo(0);
      ixTo?.(0); iyTo?.(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [ref, strength]);
}
