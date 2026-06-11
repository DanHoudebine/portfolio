import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals every `[data-reveal]` child when the section scrolls into view.
 * Uses a clip-path wipe + translateY rise for an Awwwards-grade entrance.
 */
export default function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const items = section.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' });
      return;
    }

    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 48, clipPath: 'inset(0 0 100% 0)' },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.05,
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref]);
}
