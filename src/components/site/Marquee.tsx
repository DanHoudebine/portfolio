import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MarqueeProps {
  items: string[];
  /** big = display-size footer band, small = mono tool strip */
  size?: 'small' | 'big';
}

/**
 * Infinite horizontal scroller, GSAP-driven so scroll velocity can
 * warp it: scrolling fast speeds the band up (or reverses it when
 * scrolling up) and shears the type with a skewX. Content is rendered
 * twice and the track translates -50% per loop, so the seam is invisible.
 */
export default function Marquee({ items, size = 'small' }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const row = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const loop = gsap.to(track, {
      xPercent: -50,
      duration: size === 'big' ? 30 : 36,
      ease: 'none',
      repeat: -1,
    });
    // park the playhead deep into the repeats so a negative timeScale
    // (scroll up ⇒ marquee reverses) never hits the clamp at t=0
    loop.totalTime(loop.duration() * 500);

    const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power2.out' });
    const clampSkew = gsap.utils.clamp(-12, 12);
    const clampTs = gsap.utils.clamp(-3, 4);

    let raf = 0;
    const tick = () => {
      const vel = parseFloat(document.documentElement.style.getPropertyValue('--sv') || '0');
      loop.timeScale(clampTs(1 + vel * 0.28));
      skewTo(clampSkew(vel * -0.7));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      loop.kill();
    };
  }, [size]);

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
                className={`font-display whitespace-nowrap px-8 ${i % 2 === 1 ? 'text-hollow' : ''}`}
                style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: 1, color: i % 2 === 1 ? undefined : 'var(--text)' }}
              >
                {item}
              </span>
              <span style={{ color: 'var(--ember)', fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>✦</span>
            </span>
          ) : (
            <span key={i} className="flex items-center" style={{ padding: '13px 0' }}>
              <span
                className="font-mono whitespace-nowrap px-7 text-[11px] tracking-[0.3em]"
                style={{ color: 'var(--text-dim)' }}
              >
                {item}
              </span>
              <span style={{ color: 'var(--ember)', fontSize: 9 }}>✦</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
