import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import Lightbox from '../components/site/Lightbox';
import DistortImage from '../components/site/DistortImage';
import useReveal from '../lib/useReveal';
import { projects, projectSrc, type Project } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

const featured = projects.filter((p) => p.featured);
const archive  = projects.filter((p) => !p.featured);
const globalIndex = (p: Project) => projects.indexOf(p);

export default function Work() {
  const { t } = useTranslation();
  const sectionRef   = useRef<HTMLElement>(null);
  const archiveRef   = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(-1);

  useReveal(sectionRef);

  /* ── full-screen pinned project panels on desktop ── */
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.work-panel');
      const imgs   = gsap.utils.toArray<HTMLElement>('.work-panel-img');

      panels.forEach((panel, i) => {
        const img = imgs[i];
        if (!img) return;
        const fromLeft = i % 2 === 0;

        /* image clip-path wipe: alternates entering from left / right */
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.fromTo(img,
              { clipPath: fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
              { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, ease: 'power4.inOut' },
            );
            gsap.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.3, ease: 'power2.out' });
          },
        });

        /* image parallax on scroll */
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });

    return () => mm.revert();
  }, []);

  /* ── mobile vertical parallax ── */
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', () => {
      sectionRef.current?.querySelectorAll<HTMLElement>('.feature-img-mob').forEach((img) => {
        gsap.fromTo(img, { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  /* ── 3D tilt on archive cards ── */
  useEffect(() => {
    const el = archiveRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const fns: (() => void)[] = [];

    el.querySelectorAll<HTMLElement>('.archive-card').forEach((card) => {
      const wrap = card.querySelector<HTMLElement>('.archive-img-wrap');
      if (!wrap) return;
      const rx = gsap.quickTo(wrap, 'rotateX', { duration: 0.5, ease: 'power2.out' });
      const ry = gsap.quickTo(wrap, 'rotateY', { duration: 0.5, ease: 'power2.out' });
      const onM  = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        rx(-((e.clientY - r.top)  / r.height - 0.5) * 12);
        ry( ((e.clientX - r.left) / r.width  - 0.5) * 12);
      };
      const onL  = () => { rx(0); ry(0); };
      card.addEventListener('mousemove', onM);
      card.addEventListener('mouseleave', onL);
      fns.push(() => { card.removeEventListener('mousemove', onM); card.removeEventListener('mouseleave', onL); });
    });
    return () => fns.forEach(fn => fn());
  }, []);

  return (
    <section id="work" ref={sectionRef} style={{ background: 'var(--bg)' }}>

      {/* ═══════════════════════════════════════════
          DESKTOP — full-screen editorial panels
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* intro header */}
        <div style={{ padding: 'clamp(90px, 12vw, 160px) clamp(40px, 5vw, 72px) clamp(60px, 8vw, 100px)' }}>
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading num="01" label={t('work.label')} titleA={t('work.titleA')} titleB={t('work.titleB')} />
            <div className="flex items-end justify-between gap-8">
              <p className="font-body max-w-[480px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {t('work.intro')}
              </p>
              <div className="flex items-baseline gap-3 shrink-0">
                <span className="font-display" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: 'var(--cyan)', lineHeight: 1 }}>
                  {projects.length}
                </span>
                <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
                  {t('work.counter')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* project panels — full-width alternating */}
        {featured.map((project, i) => {
          const imgLeft = i % 2 === 0;
          return (
            <div
              key={project.img}
              className="work-panel group relative overflow-hidden"
              style={{
                minHeight: '90vh',
                display: 'grid',
                gridTemplateColumns: imgLeft ? '58% 42%' : '42% 58%',
                borderTop: '1px solid var(--line)',
              }}
              data-cursor="view"
              onClick={() => setLightbox(globalIndex(project))}
            >
              {/* image block */}
              <div
                className={`relative overflow-hidden ${imgLeft ? 'order-1' : 'order-2'}`}
                style={{ minHeight: '90vh' }}
              >
                <img
                  src={projectSrc(project)}
                  alt={project.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="work-panel-img absolute inset-0 h-full w-full object-cover"
                  style={{ clipPath: i % 2 === 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', filter: 'saturate(0.85)' }}
                  draggable={false}
                />
                {/* hover tint */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.06), transparent 70%)' }}
                />
              </div>

              {/* info block */}
              <div
                className={`relative flex flex-col justify-center ${imgLeft ? 'order-2' : 'order-1'}`}
                style={{
                  padding: 'clamp(48px, 7vw, 96px) clamp(32px, 4vw, 64px)',
                  background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-panel)',
                  borderLeft: imgLeft ? '1px solid var(--line)' : 'none',
                  borderRight: imgLeft ? 'none' : '1px solid var(--line)',
                }}
              >
                {/* background number */}
                <span
                  className="font-display text-hollow-cyan pointer-events-none absolute select-none"
                  style={{
                    fontSize: 'clamp(10rem, 18vw, 16rem)', lineHeight: 1,
                    opacity: 0.06,
                    bottom: '-0.1em', right: imgLeft ? '0.05em' : 'auto', left: imgLeft ? 'auto' : '0.05em',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10">
                  <div className="font-mono mb-2 text-[9px] tracking-[0.45em]" style={{ color: 'var(--cyan)' }}>
                    ENV_{String(i + 1).padStart(2, '0')} / {project.tags}
                  </div>
                  <h3
                    className="font-display transition-colors duration-400 group-hover:text-[var(--ember-soft)]"
                    style={{ fontSize: 'clamp(2rem, 3.8vw, 3.8rem)', lineHeight: 0.92, color: 'var(--text)', maxWidth: '90%' }}
                  >
                    {project.title}
                  </h3>
                  <div className="mt-6 flex items-center gap-6">
                    <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>{project.year}</span>
                    <span
                      className="btn-shine font-mono translate-y-2 text-[10px] tracking-[0.3em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                      style={{
                        color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.35)',
                        padding: '9px 20px',
                      }}
                    >
                      {t('work.viewProject')} ↗
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE — stacked editorial
      ═══════════════════════════════════════════ */}
      <div className="block lg:hidden" style={{ padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)' }}>
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading num="01" label={t('work.label')} titleA={t('work.titleA')} titleB={t('work.titleB')} />
          <div data-reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <p className="font-body max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('work.intro')}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-display" style={{ fontSize: '4rem', color: 'var(--cyan)', lineHeight: 1 }}>
                {projects.length}
              </span>
              <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
                {t('work.counter')}
              </span>
            </div>
          </div>
          <div className="flex flex-col" style={{ gap: 'clamp(64px, 8vw, 120px)' }}>
            {featured.map((project, i) => (
              <article
                key={project.img}
                data-reveal
                data-cursor="view"
                className="group cursor-pointer"
                onClick={() => setLightbox(globalIndex(project))}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', border: '1px solid var(--line)' }}>
                  <img
                    src={projectSrc(project)}
                    alt={project.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="feature-img-mob absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    draggable={false}
                  />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-center justify-center"
                    style={{ background: 'rgba(8,13,26,0.4)' }}>
                    <span className="font-mono text-[10px] tracking-[0.4em]"
                      style={{ color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.4)', padding: '11px 20px', background: 'rgba(8,13,26,0.6)' }}>
                      {t('work.viewProject')} ↗
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--cyan)' }}>
                    ENV_{String(i + 1).padStart(2, '0')} · {project.tags}
                  </div>
                  <h3 className="font-display mt-2 transition-colors duration-300 group-hover:text-[var(--ember-soft)]"
                    style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 0.95, color: 'var(--text)' }}>
                    {project.title}
                  </h3>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>{project.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ARCHIVE — 3-column grid
      ═══════════════════════════════════════════ */}
      <div style={{ padding: '0 clamp(20px, 4vw, 48px) clamp(90px, 12vw, 160px)' }}>
        <div ref={archiveRef} className="mx-auto mt-24 max-w-[1500px]">
          <div data-reveal className="mb-10 flex items-center gap-4">
            <span className="eyebrow">+</span>
            <span className="eyebrow" style={{ color: 'var(--text-faint)' }}>{t('work.archiveLabel')}</span>
            <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((project) => (
              <article
                key={project.img}
                data-reveal
                data-cursor="view"
                className="archive-card group cursor-pointer"
                onClick={() => setLightbox(globalIndex(project))}
              >
                <div
                  className="archive-img-wrap relative overflow-hidden"
                  style={{ aspectRatio: '16/10', border: '1px solid var(--line)', transformStyle: 'preserve-3d', perspective: 600 }}
                >
                  <DistortImage
                    src={projectSrc(project)}
                    alt={project.title}
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                    style={{ background: 'linear-gradient(to top, rgba(8,13,26,0.9), transparent)' }} />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    style={{ border: '1px solid rgba(0,229,255,0.25)', boxSizing: 'border-box' }} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-body text-[13px] font-semibold transition-colors duration-300 group-hover:text-[var(--cyan)]"
                      style={{ color: 'var(--text)' }}>
                      {project.title}
                    </h3>
                    <div className="font-mono mt-1 text-[9px] tracking-[0.22em]" style={{ color: 'var(--text-dim)' }}>
                      {project.tags}
                    </div>
                  </div>
                  <span className="font-mono shrink-0 text-[10px]" style={{ color: 'var(--text-faint)' }}>
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
