import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Thin ember reading-progress bar pinned under the header.
 * scaleX is driven directly by ScrollTrigger so it tracks Lenis smoothly
 * and never triggers layout (transform-only). Hidden from assistive tech.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });

    return () => st.kill();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[65] h-[2px] w-full"
    >
      <div
        ref={barRef}
        className="h-full w-full"
        style={{ background: 'linear-gradient(to right, var(--ember-deep), var(--ember), var(--ember-soft))' }}
      />
    </div>
  );
}
