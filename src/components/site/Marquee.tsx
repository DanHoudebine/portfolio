interface MarqueeProps {
  items: string[];
  /** big = display-size footer band, small = mono tool strip */
  size?: 'small' | 'big';
}

/**
 * Infinite horizontal scroller. Content is rendered twice and the track
 * translates -50% in a loop, so the seam is invisible.
 */
export default function Marquee({ items, size = 'small' }: MarqueeProps) {
  const row = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
    >
      <div className="animate-marquee flex w-max items-center" style={{ willChange: 'transform' }}>
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
