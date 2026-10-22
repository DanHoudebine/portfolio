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
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef     = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox]   = useState(-1);
  const [slideIdx, setSlideIdx]   = useState(0);

  useReveal(sectionRef);

  /* ── desktop: pinned horizontal scroll ── */
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const pin   = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;

      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - pin.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          pin: true,
          start: 'top top',
          end: () => `+=${track.scrollWidth - pin.offsetWidth}`,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(st) {
            setSlideIdx(Math.min(featured.length - 1, Math.round(st.progress * (featured.length - 1))));
          },
        },
      });

      /* per-slide image reveal + parallax */
      track.querySelectorAll<HTMLElement>('.work-slide-img').forEach((img, i) => {
        /* clip-path wipe reveal */
        gsap.fromTo(
          img,
          { clipPath: 'inset(0 100% 0 0)', scale: 1.1 },
          {
            clipPath: 'inset(0 0% 0 0%)',
            scale: 1,
            ease: 'power4.inOut',
            duration: 1,
            scrollTrigger: {
              trigger: img,
              containerAnimation: tween,
              start: 'left 82%',
              once: true,
            },
          },
        );

        /* subtle horizontal parallax */
        gsap.fromTo(
          img,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('.work-slide'),
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );

        void i; /* suppress unused-var lint */
      });

      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });

    /* ── mobile: vertical parallax on feature images ── */
    mm.add('(max-width: 1023px)', () => {
      sectionRef.current?.querySelectorAll<HTMLElement>('.feature-img-mob').forEach((img) => {
        gsap.fromTo(img, { yPercent: -8 }, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });

    return () => mm.revert();
  }, []);

  /* ── archive card 3D tilt ── */
  useEffect(() => {
    const el = archiveRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const cleanups: (() => void)[] = [];

    el.querySelectorAll<HTMLElement>('.archive-card').forEach((card) => {
      const wrap = card.querySelector<HTMLElement>('.archive-img-wrap');
      if (!wrap) return;
      const rx = gsap.quickTo(wrap, 'rotateX', { duration: 0.5, ease: 'power2.out' });
      const ry = gsap.quickTo(wrap, 'rotateY', { duration: 0.5, ease: 'power2.out' });
      const onM = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        rx(-((e.clientY - r.top)  / r.height - 0.5) * 12);
        ry( ((e.clientX - r.left) / r.width  - 0.5) * 12);
      };
      const onL = () => { rx(0); ry(0); };
      card.addEventListener('mousemove', onM);
      card.addEventListener('mouseleave', onL);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onM);
        card.removeEventListener('mouseleave', onL);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section id="work" ref={sectionRef} style={{ background: 'var(--bg)' }}>

      {/* ═══════════════════════════════════════════
          DESKTOP — pinned horizontal scroll
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* intro header — sits above the pin container, scrolls normally */}
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

        {/* pin container */}
        <div
          ref={pinRef}
          style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
        >
          {/* horizontal track */}
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              width: `${featured.length * 100}vw`,
              height: '100%',
            }}
          >
            {featured.map((project, i) => {
              const imgLeft = i % 2 === 0;
              return (
                <div
                  key={project.img}
                  className="work-slide group relative"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    flexShrink: 0,
                    display: 'grid',
                    gridTemplateColumns: imgLeft ? '58% 42%' : '42% 58%',
                    cursor: 'pointer',
                    borderTop: '1px solid var(--line)',
                  }}
                  data-cursor="view"
                  onClick={() => setLightbox(globalIndex(project))}
                >
                  {/* image block */}
                  <div
                    className={`relative overflow-hidden ${imgLeft ? 'order-1' : 'order-2'}`}
                  >
                    <img
                      src={projectSrc(project)}
                      alt={project.title}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="work-slide-img absolute inset-0 h-full w-full object-cover"
                      style={{
                        clipPath: 'inset(0 100% 0 0)',
                        filter: 'saturate(0.88)',
                      }}
                      draggable={false}
                    />
                    {/* cyan radial hover overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.07), transparent 70%)' }}
                    />
                  </div>

                  {/* info block */}
                  <div
                    className={`relative flex flex-col justify-center ${imgLeft ? 'order-2' : 'order-1'}`}
                    style={{
                      padding: 'clamp(48px, 7vw, 96px) clamp(32px, 4vw, 64px)',
                      background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-panel)',
                      borderLeft:  imgLeft ? '1px solid var(--line)' : 'none',
                      borderRight: imgLeft ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    {/* giant hollow background number */}
                    <span
                      className="font-display text-hollow-cyan pointer-events-none absolute select-none"
                      style={{
                        fontSize: 'clamp(10rem, 18vw, 16rem)',
                        lineHeight: 1,
                        opacity: 0.06,
                        bottom: '-0.1em',
                        right: imgLeft ? '0.05em' : 'auto',
                        left: imgLeft ? 'auto' : '0.05em',
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
                        style={{
                          fontSize: 'clamp(2rem, 3.8vw, 3.8rem)',
                          lineHeight: 0.92,
                          color: 'var(--text)',
                          maxWidth: '90%',
                        }}
                      >
                        {project.title}
                      </h3>
                      <div className="mt-6 flex items-center gap-6">
                        <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
                          {project.year}
                        </span>
                        <span
                          className="btn-shine font-mono translate-y-2 text-[10px] tracking-[0.3em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                          style={{
                            color: 'var(--cyan)',
                            border: '1px solid rgba(0,229,255,0.35)',
                            padding: '9px 20px',
                          }}
                        >
                          OPEN ↗
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* overlay: slide counter (top-right) */}
          <div
            className="pointer-events-none absolute top-6 right-8 flex items-baseline gap-1"
            style={{ zIndex: 10 }}
          >
            <span className="font-mono text-[13px]" style={{ color: 'var(--cyan)' }}>
              {String(slideIdx + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
              &nbsp;/&nbsp;{String(featured.length).padStart(2, '0')}
            </span>
          </div>

          {/* overlay: dot progress (bottom-center) */}
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 flex items-center gap-[6px]"
            style={{ transform: 'translateX(-50%)', zIndex: 10 }}
          >
            {featured.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === slideIdx ? 32 : 16,
                  height: 2,
                  background: i === slideIdx ? 'var(--cyan)' : 'var(--line-strong)',
                  borderRadius: 1,
                  transition: 'width 0.35s ease, background 0.35s ease',
                }}
              />
            ))}
          </div>

          {/* overlay: scroll hint (bottom-right) */}
          <div
            className="pointer-events-none absolute bottom-6 right-8"
            style={{ zIndex: 10 }}
          >
            <span className="font-mono text-[9px] tracking-[0.35em]" style={{ color: 'var(--text-faint)' }}>
              SCROLL ↓
            </span>
          </div>
        </div>
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
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-center justify-center"
                    style={{ background: 'rgba(8,13,26,0.4)' }}
                  >
                    <span
                      className="font-mono text-[10px] tracking-[0.4em]"
                      style={{ color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.4)', padding: '11px 20px', background: 'rgba(8,13,26,0.6)' }}
                    >
                      {t('work.viewProject')} ↗
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--cyan)' }}>
                    ENV_{String(i + 1).padStart(2, '0')} · {project.tags}
                  </div>
                  <h3
                    className="font-display mt-2 transition-colors duration-300 group-hover:text-[var(--ember-soft)]"
                    style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 0.95, color: 'var(--text)' }}
                  >
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
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                    style={{ background: 'linear-gradient(to top, rgba(8,13,26,0.9), transparent)' }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    style={{ border: '1px solid rgba(0,229,255,0.25)', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="font-body text-[13px] font-semibold transition-colors duration-300 group-hover:text-[var(--cyan)]"
                      style={{ color: 'var(--text)' }}
                    >
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
