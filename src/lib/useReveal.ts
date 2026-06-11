import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals every `[data-reveal]` child of the section when it scrolls
 * into view — slight rise + fade, staggered.
 */
export default function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const items = section.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
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
