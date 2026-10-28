import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeading from '../components/site/SectionHeading';
import Lightbox from '../components/site/Lightbox';
import DistortImage from '../components/site/DistortImage';
import useReveal from '../lib/useReveal';
import { renders, renderSrc, type Render } from '../data/renders';

/** Realistic product renders — a rubric outside the game-art work. */
export default function Renders() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [lightbox, setLightbox] = useState(-1);

  useReveal(sectionRef);

  return (
    <section
      id="renders"
      ref={sectionRef}
      style={{ background: 'var(--bg)', padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)' }}
    >
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          num="02" label={t('renders.label')}
          titleA={t('renders.titleA')} titleB={t('renders.titleB')}
        />
        <div data-reveal className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <p className="font-body max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {t('renders.intro')}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1, color: 'var(--ember)' }}>
              {renders.length}
            </span>
            <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
              {t('renders.counter')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {renders.map((r, i) => (
            <article
              key={r.img}
              data-reveal
              data-cursor="view"
              className="group cursor-pointer"
              onClick={() => setLightbox(i)}
            >
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '4/5', border: '1px solid var(--line)' }}
              >
                <DistortImage
                  src={renderSrc(r)}
                  alt={r.title}
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-80"
                  style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.85), transparent)' }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'rgba(255,122,47,0.05)', border: '1px solid rgba(255,122,47,0.3)', boxSizing: 'border-box' }}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h3
                    className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--ember)]"
                    style={{ color: 'var(--text)' }}
                  >
                    {r.title}
                  </h3>
                  <div className="font-mono mt-1 text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                    {r.tags}
                  </div>
                </div>
                <span className="font-mono shrink-0 text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  {r.year}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Credit — Destours XXO bottle shape */}
        <p
          data-reveal
          className="font-mono mt-10 text-[10px] leading-relaxed tracking-[0.2em]"
          style={{ color: 'var(--text-faint)' }}
        >
          {t('renders.creditPrefix')}{' '}
          <a
            href="https://poulpebordeaux.com/"
            target="_blank" rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-[var(--ember)]"
            style={{ color: 'var(--text-dim)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            PHILIPPE BOUVET · POULPE BORDEAUX
          </a>
        </p>
      </div>

      <Lightbox
        index={lightbox}
        onClose={() => setLightbox(-1)}
        onNavigate={setLightbox}
        items={renders}
        srcOf={(i) => renderSrc(i as Render)}
      />
    </section>
  );
}
