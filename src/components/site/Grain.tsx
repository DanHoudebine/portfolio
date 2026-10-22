/**
 * Fixed film-grain overlay (SVG fractal noise) — gives every section
 * a subtle cinematic texture without any runtime cost.
 */
export default function Grain() {
  const noise =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{ backgroundImage: noise, opacity: 0.05, mixBlendMode: 'overlay' }}
    />
  );
}
