import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mount Lenis smooth scroll driven by GSAP ticker.
 * Lenis velocity is broadcast as a CSS variable (--sv) on <html>
 * for components that want velocity-based transforms.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    const clampVel = gsap.utils.clamp(-25, 25);

    lenis.on('scroll', (e: { velocity: number }) => {
      ScrollTrigger.update();
      // Broadcast velocity for scroll-velocity-skew consumers
      document.documentElement.style.setProperty('--sv', String(clampVel(e.velocity)));
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);
}
