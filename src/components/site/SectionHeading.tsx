import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeadingProps {
  num: string;
  label: string;
  titleA: string;
  titleB: string;
}

/**
 * Section header: word-by-word clip reveal + brief RGB glitch flicker
 * after the words land. Manages its own GSAP animation.
 */
export default function SectionHeading({ num, label, titleA, titleB }: SectionHeadingProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { el.style.opacity = '1'; return; }

    const eyebrow = el.querySelector<HTMLElement>('.sh-eyebrow');
    const words   = el.querySelectorAll<HTMLElement>('.sh-word');
    const line    = el.querySelector<HTMLElement>('.sh-line');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });

    // Line sweep
    tl.fromTo(line,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power3.inOut' },
    );
    // Eyebrow slide
    tl.fromTo(eyebrow,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' },
      '-=0.3',
    );
    // Words rise
    tl.fromTo(words,
      { yPercent: 115, rotateZ: 1.5 },
      { yPercent: 0, rotateZ: 0, duration: 1.05, ease: 'power4.out', stagger: 0.055 },
      '-=0.25',
    );
    // RGB glitch flicker — fires once after the reveal lands
    tl.to(words, {
      textShadow: '-3px 0 rgba(255,80,40,0.75), 3px 0 rgba(0,220,255,0.55)',
      x: 3,
      duration: 0.04,
      ease: 'none',
      stagger: 0.015,
      repeat: 3,
      yoyo: true,
    }, '+=0.05');
    tl.set(words, { textShadow: 'none', x: 0 });

    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, [titleA, titleB]);

  const wordsA = titleA.split(' ');

  return (
    <div ref={wrapRef} style={{ marginBottom: 'clamp(40px, 6vw, 72px)' }}>
      <div className="mb-5 flex items-center gap-4">
        <span className="eyebrow">{num}</span>
        <span
          className="sh-line h-px w-10 origin-left"
          style={{ background: 'var(--ember)', transform: 'scaleX(0)' }}
        />
        <span className="sh-eyebrow eyebrow" style={{ color: 'var(--text-dim)', opacity: 0 }}>
          {label}
        </span>
      </div>

      <h2 className="display-xl" style={{ lineHeight: 0.92 }}>
        {wordsA.map((word, i) => (
          <span
            key={i}
            style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em', verticalAlign: 'bottom' }}
          >
            <span className="sh-word" style={{ display: 'inline-block', transform: 'translateY(115%)' }}>
              {word}
            </span>
          </span>
        ))}
        <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span
            className="sh-word font-serif-i"
            style={{
              display: 'inline-block',
              color: 'var(--ember)',
              fontSize: '0.82em',
              letterSpacing: 0,
              transform: 'translateY(115%)',
            }}
          >
            {titleB}
          </span>
        </span>
      </h2>
    </div>
  );
}
