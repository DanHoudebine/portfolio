import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import Lightbox from '../components/site/Lightbox';
import useReveal from '../lib/useReveal';
import { projects, projectSrc, type Project } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

const featured = projects.filter((p) => p.featured);
const archive = projects.filter((p) => !p.featured);
const globalIndex = (p: Project) => projects.indexOf(p);

export default function Work() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [lightbox, setLightbox] = useState(-1);

  useReveal(sectionRef);

  // Parallax drift inside each featured frame
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>('.feature-img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      style={{ padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)', background: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading num="01" label={t('work.label')} titleA={t('work.titleA')} titleB={t('work.titleB')} />

        {/* Intro + counter */}
        <div data-reveal className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <p className="font-body max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {t('work.intro')}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1, color: 'var(--ember)' }}>
              {projects.length}
            </span>
            <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
              {t('work.counter')}
            </span>
          </div>
        </div>

        {/* ——— Featured environments — editorial rows ——— */}
        <div className="flex flex-col" style={{ gap: 'clamp(70px, 9vw, 130px)' }}>
          {featured.map((project, i) => {
            const flipped = i % 2 === 1;
            return (
              <article
                key={project.img}
                data-reveal
                className={`group grid cursor-pointer grid-cols-1 items-end gap-6 lg:grid-cols-12 ${flipped ? '' : ''}`}
                data-cursor="hover"
                onClick={() => setLightbox(globalIndex(project))}
              >
                {/* Image frame */}
                <div
                  className={`relative overflow-hidden lg:col-span-8 ${flipped ? 'lg:order-2' : ''}`}
                  style={{ aspectRatio: '16/9', border: '1px solid var(--line)' }}
                >
                  <img
                    src={projectSrc(project)}
                    alt={project.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="feature-img absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    style={{ scale: '1.18' }}
                    draggable={false}
                  />
                  {/* Hover veil + OPEN tag */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'rgba(10,9,7,0.35)' }}
                  >
                    <span
                      className="font-mono text-[11px] tracking-[0.4em]"
                      style={{ color: 'var(--text)', border: '1px solid var(--ember)', padding: '12px 22px', background: 'rgba(10,9,7,0.55)' }}
                    >
                      {t('work.viewProject')} ↗
                    </span>
                  </div>
                  {/* Frame index chip */}
                  <span
                    className="font-mono absolute left-4 top-4 text-[10px] tracking-[0.3em]"
                    style={{ color: 'var(--text)', background: 'rgba(10,9,7,0.6)', padding: '6px 10px', border: '1px solid var(--line)' }}
                  >
                    ENV_{String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Caption column */}
                <div className={`lg:col-span-4 ${flipped ? 'lg:order-1 lg:text-right' : ''}`}>
                  <div
                    className="font-display text-hollow select-none"
                    style={{ fontSize: 'clamp(3.4rem, 7vw, 6rem)', lineHeight: 0.9 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3
                    className="font-display mt-3 transition-colors duration-300 group-hover:text-[var(--ember)]"
                    style={{ fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', lineHeight: 0.95, color: 'var(--text)' }}
                  >
                    {project.title}
                  </h3>
                  <div className="font-mono mt-3 text-[10px] tracking-[0.25em]" style={{ color: 'var(--ember)' }}>
                    {project.tags}
                  </div>
                  <div className="font-mono mt-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {project.year}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ——— Props & studies — archive grid ——— */}
        <div className="mt-28">
          <div data-reveal className="mb-10 flex items-center gap-4">
            <span className="eyebrow">+</span>
            <span className="eyebrow" style={{ color: 'var(--text-dim)' }}>{t('work.archiveLabel')}</span>
            <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((project) => (
              <article
                key={project.img}
                data-reveal
                data-cursor="hover"
                className="group cursor-pointer"
                onClick={() => setLightbox(globalIndex(project))}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/10', border: '1px solid var(--line)' }}>
                  <img
                    src={projectSrc(project)}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ filter: 'saturate(0.85)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'saturate(1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'saturate(0.85)'; }}
                    draggable={false}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2 opacity-80"
                    style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.85), transparent)' }}
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--ember)]" style={{ color: 'var(--text)' }}>
                      {project.title}
                    </h3>
                    <div className="font-mono mt-1 text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      {project.tags}
                    </div>
                  </div>
                  <span className="font-mono shrink-0 text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    {project.year}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <Lightbox index={lightbox} onClose={() => setLightbox(-1)} onNavigate={setLightbox} />
    </section>
  );
}
