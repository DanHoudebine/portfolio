import type { ReactNode } from 'react';

interface SectionHeaderProps {
  num: string;        // e.g. "01"
  label: string;      // e.g. "WORK" — the section eyebrow
  heading: ReactNode; // big title
}

/**
 * Reusable futuristic section header with section number,
 * decorative connector line, and large title beneath.
 *
 *   ┌──── 01 / WORK ──────────────────────────────
 *   │
 *   │  Every environment tells a story
 *   └─
 */
export default function SectionHeader({ num, label, heading }: SectionHeaderProps) {
  return (
    <div className="reveal-item" style={{ marginBottom: '60px' }}>
      {/* Number + label + line */}
      <div className="flex items-center gap-4 mb-6">
        <span
          className="font-mono"
          style={{
            fontSize: '13px',
            color: '#3b82f6',
            letterSpacing: '0.15em',
            fontWeight: 600,
            textShadow: '0 0 10px rgba(59,130,246,0.4)',
          }}
        >
          {num}
        </span>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'rgba(180,200,230,0.55)',
          }}
        >
          / {label}
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background:
              'linear-gradient(to right, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.1) 60%, transparent 100%)',
            maxWidth: '380px',
          }}
        />
      </div>

      {/* Heading */}
      <h2
        className="font-heading font-bold text-white"
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          maxWidth: '720px',
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
        }}
      >
        {heading}
      </h2>
    </div>
  );
}
