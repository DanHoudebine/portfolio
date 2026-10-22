import { useEffect, useRef } from 'react';

/**
 * Animated film-grain overlay using an SVG feTurbulence filter.
 * The noise seed cycles every 3 frames (~20 fps updates) so the grain
 * actually shifts rather than sitting static — far more cinematic.
 */
export default function Grain() {
  const filterRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let seed = 0;
    let frame = 0;
    let raf = 0;

    const tick = () => {
      frame++;
      if (frame % 3 === 0) {
        seed = (seed + 1) % 256;
        el.setAttribute('seed', String(seed));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="animated-grain" x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="sRGB">
            <feTurbulence
              ref={filterRef}
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              seed="0"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[80]"
        style={{
          filter: 'url(#animated-grain)',
          opacity: 0.048,
          mixBlendMode: 'overlay',
          willChange: 'filter',
        }}
      />
    </>
  );
}
