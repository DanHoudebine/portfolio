import { useEffect, useRef, useState } from 'react';

const GLYPHS = '01<>/\\[]=+*#%&ABCDEF';

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** ms between resolve steps */
  speed?: number;
  /** ms to wait after entering view before decoding (sync with fade-ins) */
  delay?: number;
}

/**
 * Decode/scramble reveal — the text resolves left-to-right out of random
 * mono glyphs the first time it enters the viewport. Re-runs if the text
 * changes (e.g. language switch). Falls back to the plain string under
 * reduced-motion. Render in a monospace context for a clean terminal feel.
 */
export default function ScrambleText({ text, className, style, speed = 28, delay = 0 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(delay > 0 ? '' : text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOut(text);
      return;
    }

    let frame = 0;
    let raf = 0;
    let lastStep = 0;
    let revealed = 0;
    let running = false;
    const total = text.length;

    const run = () => {
      running = true;
      const step = (now: number) => {
        if (now - lastStep >= speed) {
          lastStep = now;
          revealed = Math.min(total, revealed + 1);
          frame++;
        }
        let s = '';
        for (let i = 0; i < total; i++) {
          if (text[i] === ' ') { s += ' '; continue; }
          s += i < revealed ? text[i] : GLYPHS[(frame + i) % GLYPHS.length];
        }
        setOut(s);
        if (revealed < total) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    let delayTimer = 0;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !running) {
        io.disconnect();
        if (delay > 0) delayTimer = window.setTimeout(run, delay);
        else run();
      }
    }, { threshold: 0.6 });
    io.observe(el);

    return () => { cancelAnimationFrame(raf); clearTimeout(delayTimer); io.disconnect(); };
  }, [text, speed, delay]);

  return (
    <span ref={ref} className={className} style={style}>
      {out}
    </span>
  );
}
