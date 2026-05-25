import { useEffect, useState } from 'react';

interface HUDProps {
  activeSection: string;
}

const SECTIONS = [
  { id: 'hero',    num: '00', label: 'INTRO' },
  { id: 'work',    num: '01', label: 'WORK' },
  { id: 'skills',  num: '02', label: 'SKILLS' },
  { id: 'contact', num: '03', label: 'CONTACT' },
];

/**
 * Fixed sci-fi heads-up overlay. Renders above the 3D scene but below
 * the page content header. Shows: section number, scroll progress, time,
 * Paris coordinates, and a pulsing system-online indicator.
 */
export default function HUD({ activeSection }: HUDProps) {
  const [time, setTime] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, p)));
      document.documentElement.style.setProperty('--scroll-progress', String(p));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0];

  return (
    <>
      {/* ── Top-left: Section indicator ─────────────────────────────────── */}
      <div
        className="fixed font-mono uppercase pointer-events-none"
        style={{
          top: '92px', left: '32px', zIndex: 30,
          fontSize: '10px', letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{
            fontSize: '32px',
            color: '#3b82f6',
            fontWeight: 600,
            letterSpacing: '0',
            textShadow: '0 0 14px rgba(59,130,246,0.55)',
            lineHeight: 1,
          }}>
            {current.num}
          </span>
          <div>
            <div style={{ color: 'rgba(180,200,230,0.45)' }}>SECTION</div>
            <div style={{ color: '#e5edff', fontWeight: 500, marginTop: '2px' }}>{current.label}</div>
          </div>
        </div>
      </div>

      {/* ── Right edge: vertical scroll progress bar ────────────────────── */}
      <div
        className="fixed pointer-events-none hidden md:block"
        style={{
          right: '24px', top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {/* Track */}
          <div
            style={{
              position: 'relative',
              width: '2px',
              height: '180px',
              background: 'rgba(180,200,230,0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: `${progress * 100}%`,
                background: 'linear-gradient(to bottom, #60a5fa, #3b82f6)',
                boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                transition: 'height 0.1s linear',
              }}
            />
          </div>
          {/* Percentage */}
          <div
            className="font-mono"
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              color: 'rgba(180,200,230,0.7)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(Math.round(progress * 100)).padStart(2, '0')}%
          </div>
          {/* Section tick marks */}
          <div className="font-mono" style={{ fontSize: '9px', color: 'rgba(180,200,230,0.4)', textAlign: 'center' }}>
            SCROLL
          </div>
        </div>
      </div>

      {/* ── Bottom-left: System status + time ─────────────────────────────── */}
      <div
        className="fixed font-mono uppercase pointer-events-none hidden md:block"
        style={{
          bottom: '24px', left: '32px', zIndex: 30,
          fontSize: '10px', letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#3b82f6',
            boxShadow: '0 0 10px #3b82f6, 0 0 20px rgba(59,130,246,0.6)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          <span>SYSTEM ONLINE</span>
        </div>
        <div style={{ color: 'rgba(180,200,230,0.45)', marginTop: '6px', fontSize: '9px' }}>
          {time} <span style={{ color: '#3b82f6' }}>·</span> PARIS
        </div>
      </div>

      {/* ── Bottom-right: Coordinates ─────────────────────────────────────── */}
      <div
        className="fixed font-mono uppercase pointer-events-none hidden md:block"
        style={{
          bottom: '24px', right: '32px', zIndex: 30,
          fontSize: '9px', letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.5)',
          textAlign: 'right',
        }}
      >
        <div>LAT 48.8566° N</div>
        <div style={{ marginTop: '4px' }}>LON 2.3522° E</div>
        <div style={{ marginTop: '6px', color: 'rgba(180,200,230,0.3)' }}>EU/FR · UTC+1</div>
      </div>

      {/* ── Corner brackets — fixed on viewport ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-20 hidden md:block">
        {[
          { top: 22, left: 22, b: 't_l' },
          { top: 22, right: 22, b: 't_r' },
          { bottom: 22, left: 22, b: 'b_l' },
          { bottom: 22, right: 22, b: 'b_r' },
        ].map((c, i) => {
          const styleBase: React.CSSProperties = {
            position: 'absolute',
            width: '18px',
            height: '18px',
            borderColor: 'rgba(59,130,246,0.55)',
          };
          if (c.top !== undefined) styleBase.top = c.top;
          if (c.bottom !== undefined) styleBase.bottom = c.bottom;
          if (c.left !== undefined) styleBase.left = c.left;
          if (c.right !== undefined) styleBase.right = c.right;
          if (c.b === 't_l') { styleBase.borderTop = '1px solid'; styleBase.borderLeft = '1px solid'; }
          if (c.b === 't_r') { styleBase.borderTop = '1px solid'; styleBase.borderRight = '1px solid'; }
          if (c.b === 'b_l') { styleBase.borderBottom = '1px solid'; styleBase.borderLeft = '1px solid'; }
          if (c.b === 'b_r') { styleBase.borderBottom = '1px solid'; styleBase.borderRight = '1px solid'; }
          return <div key={i} style={styleBase} />;
        })}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
