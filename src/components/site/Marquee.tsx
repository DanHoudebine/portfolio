import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MarqueeProps {
  items: string[];
  size?: 'small' | 'big';
  direction?: 'ltr' | 'rtl';
  accentColor?: string;
}

export default function Marquee({ items, size = 'small', direction = 'ltr', accentColor = 'var(--ember)' }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const row = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* RTL starts at -50% and moves to 0%; LTR starts at 0% and moves to -50% */
    if (direction === 'rtl') gsap.set(track, { xPercent: -50 });

    const loop = gsap.to(track, {
      xPercent: direction === 'rtl' ? 0 : -50,
      duration: size === 'big' ? 30 : 36,
      ease: 'none',
      repeat: -1,
    });
    /* Park deep so negative timeScale on upscroll never hits t=0 */
    loop.totalTime(loop.duration() * 500);

    const skewTo  = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power2.out' });
    const clampSk = gsap.utils.clamp(-12, 12);
    const clampTs = gsap.utils.clamp(-3, 4);
    /* RTL skew is mirrored (band moves right, so shear goes opposite) */
    const skewMul = direction === 'rtl' ? 0.7 : -0.7;

    let raf = 0;
    const tick = () => {
      const vel = parseFloat(document.documentElement.style.getPropertyValue('--sv') || '0');
      loop.timeScale(clampTs(1 + vel * 0.28));
      skewTo(clampSk(vel * skewMul));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      loop.kill();
    };
  }, [size, direction]);

  return (
    <div
      className="overflow-hidden"
      style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
    >
      <div ref={trackRef} className="flex w-max items-center" style={{ willChange: 'transform' }}>
        {row.map((item, i) =>
          size === 'big' ? (
            <span key={i} className="flex items-center" style={{ padding: '14px 0' }}>
              <span
                className={`font-display whitespace-nowrap px-8 ${i % 2 === 1 ? 'text-hollow-cyan' : ''}`}
                style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: 1, color: i % 2 === 1 ? undefined : 'var(--text)' }}
              >
                {item}
              </span>
              <span style={{ color: accentColor, fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>✦</span>
            </span>
          ) : (
            <span key={i} className="flex items-center" style={{ padding: '13px 0' }}>
              <span
                className="font-mono whitespace-nowrap px-7 text-[11px] tracking-[0.3em]"
                style={{ color: 'var(--text-dim)' }}
              >
                {item}
              </span>
              <span style={{ color: accentColor, fontSize: 9 }}>✦</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
