import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Mount Lenis smooth scroll for the whole document.
 * Returns nothing — usage:  useSmoothScroll();
 *
 * Cooperates with GSAP ScrollTrigger by calling ScrollTrigger.update()
 * on each Lenis tick (if ScrollTrigger is loaded).
 */
export default function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Inform GSAP ScrollTrigger of Lenis scroll updates, if loaded
    type STModule = { update: () => void };
    type STGlobal = { ScrollTrigger?: STModule };
    const st = (window as unknown as STGlobal).ScrollTrigger;
    if (st) lenis.on('scroll', () => st.update());

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}
