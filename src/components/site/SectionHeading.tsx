interface SectionHeadingProps {
  num: string;
  label: string;
  titleA: string;
  titleB: string;
}

/**
 * Shared section header — mono eyebrow ("03 / EXPERTISE") above a
 * monumental Bebas line finished with an ember Fraunces italic.
 */
export default function SectionHeading({ num, label, titleA, titleB }: SectionHeadingProps) {
  return (
    <div style={{ marginBottom: 'clamp(40px, 6vw, 72px)' }}>
      <div data-reveal className="mb-5 flex items-center gap-4">
        <span className="eyebrow">{num}</span>
        <span className="h-px w-10" style={{ background: 'var(--ember)' }} />
        <span className="eyebrow" style={{ color: 'var(--text-dim)' }}>{label}</span>
      </div>
      <h2 data-reveal className="display-xl">
        {titleA}{' '}
        <span className="font-serif-i" style={{ color: 'var(--ember)', fontSize: '0.82em', letterSpacing: 0 }}>
          {titleB}
        </span>
      </h2>
    </div>
  );
}
