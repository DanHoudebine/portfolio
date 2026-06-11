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
const archive = projects.filter((p) => !p.featured);
const globalIndex = (p: Project) => projects.indexOf(p);

export default function Work() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const hSectionRef = useRef<HTMLDivElement>(null);
  const hTrackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(-1);
  const [activeSlide, setActiveSlide] = useState(0);

  useReveal(sectionRef);

  // Desktop horizontal scroll
  useEffect(() => {
    const hSection = hSectionRef.current;
    const hTrack = hTrackRef.current;
    if (!hSection || !hTrack) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const getTravel = () => hTrack.scrollWidth - window.innerWidth;

      // Animate the track horizontally while the section is pinned
      const tween = gsap.to(hTrack, {
        x: () => -getTravel(),
        ease: 'none',
        scrollTrigger: {
          trigger: hSection,
          start: 'top top',
          end: () => `+=${getTravel()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActiveSlide(Math.round(self.progress * featured.length));
          },
        },
      });

      // Parallax inside each slide (moves image within its container)
      hTrack.querySelectorAll<HTMLElement>('.slide-img').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -12 },
          {
            xPercent: 12,
            ease: 'none',
            scrollTrigger: {
              containerAnimation: tween,
              trigger: img.closest('.h-slide'),
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });
    });

    return () => mm.revert();
  }, []);

  // Mobile vertical parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add('(max-width: 1023px)', () => {
      const ctx = gsap.context(() => {
        section.querySelectorAll<HTMLElement>('.feature-img').forEach((img) => {
          gsap.fromTo(img, { yPercent: -8 }, {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      }, section);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} style={{ background: 'var(--bg)' }}>

      {/* ——————————————————————————————————————————
          DESKTOP: horizontal-scroll cinematic reel
      —————————————————————————————————————————— */}
      <div
        ref={hSectionRef}
        className="hidden lg:block"
        style={{ height: '100svh', background: 'var(--bg)' }}
      >
        {/* Track */}
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div
            ref={hTrackRef}
            className="flex h-full"
            style={{ width: 'max-content', willChange: 'transform' }}
          >
            {/* ——— Intro slide ——— */}
            <div
              className="h-slide relative flex h-full shrink-0 flex-col items-start justify-end"
              style={{ width: '100vw', padding: 'clamp(48px, 7vw, 88px) clamp(40px, 5vw, 72px)' }}
            >
              {/* Giant hollow "W" */}
              <span
                className="font-display text-hollow pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 select-none"
                style={{ fontSize: 'clamp(18rem, 32vw, 28rem)', lineHeight: 1, opacity: 0.07 }}
              >
                W
              </span>

              <div className="relative z-10 max-w-[600px]">
                <SectionHeading
                  num="01"
                  label={t('work.label')}
                  titleA={t('work.titleA')}
                  titleB={t('work.titleB')}
                />
                <p className="font-body mb-8 max-w-[420px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
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

              {/* Scroll hint */}
              <div className="relative z-10 mt-10 flex items-center gap-5">
                <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: 'var(--text-dim)' }}>
                  DRAG →
                </span>
                <span className="h-px w-20 origin-left" style={{ background: 'linear-gradient(to right, var(--ember), transparent)' }} />
              </div>
            </div>

            {/* ——— Project slides ——— */}
            {featured.map((project, i) => (
              <div
                key={project.img}
                className="h-slide group relative flex h-full shrink-0 cursor-pointer items-end overflow-hidden"
                style={{ width: '100vw' }}
                onClick={() => setLightbox(globalIndex(project))}
                data-cursor="hover"
              >
                {/* Full-bleed image */}
                <img
                  src={projectSrc(project)}
                  alt={project.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="slide-img pointer-events-none absolute"
                  style={{ inset: '-12%', width: '124%', height: '124%', objectFit: 'cover', filter: 'saturate(0.88)' }}
                  draggable={false}
                />

                {/* Gradient overlay */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-700 group-hover:opacity-90"
                  style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.97) 0%, rgba(10,9,7,0.45) 38%, rgba(10,9,7,0.08) 68%, rgba(10,9,7,0.45) 100%)' }}
                />

                {/* Hover ember wash */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(255,122,47,0.07), transparent 65%)' }}
                />

                {/* Top bar */}
                <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-8">
                  <span
                    className="font-mono text-[10px] tracking-[0.3em]"
                    style={{ color: 'var(--text-dim)', border: '1px solid var(--line)', padding: '6px 12px', background: 'rgba(10,9,7,0.55)', backdropFilter: 'blur(4px)' }}
                  >
                    ENV_{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'var(--text-faint)' }}>
                    {String(i + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Giant background number */}
                <span
                  className="font-display text-hollow pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 select-none"
                  style={{ fontSize: 'clamp(16rem, 28vw, 24rem)', lineHeight: 1, opacity: 0.1 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Bottom content */}
                <div className="relative z-10 w-full p-8 pb-14">
                  <div className="font-mono mb-3 text-[10px] tracking-[0.28em]" style={{ color: 'var(--ember)' }}>
                    {project.tags}
                  </div>
                  <h3
                    className="font-display transition-colors duration-500 group-hover:text-[var(--ember-soft)]"
                    style={{ fontSize: 'clamp(2.2rem, 4.8vw, 4.4rem)', lineHeight: 0.9, color: 'var(--text)', maxWidth: '75%' }}
                  >
                    {project.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-6">
                    <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>{project.year}</span>
                    <span
                      className="font-mono translate-y-1 text-[10px] tracking-[0.3em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                      style={{ color: 'var(--ember)', border: '1px solid rgba(255,122,47,0.5)', padding: '8px 18px' }}
                    >
                      {t('work.viewProject')} ↗
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide progress pills */}
        <div className="pointer-events-none absolute right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-[6px]" style={{ transform: 'translateY(-50%)' }}>
          {featured.map((_, i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: activeSlide === i + 1 ? 36 : 14,
                background: activeSlide === i + 1 ? 'var(--ember)' : 'rgba(236,230,218,0.18)',
                transition: 'height 0.45s cubic-bezier(0.16,1,0.3,1), background 0.45s ease',
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* ——————————————————————————————————
          MOBILE: vertical editorial layout
      —————————————————————————————————— */}
      <div
        className="block lg:hidden"
        style={{ padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)' }}
      >
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading num="01" label={t('work.label')} titleA={t('work.titleA')} titleB={t('work.titleB')} />

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

          <div className="flex flex-col" style={{ gap: 'clamp(70px, 9vw, 130px)' }}>
            {featured.map((project, i) => (
              <article
                key={project.img}
                data-reveal
                className={`group grid cursor-pointer grid-cols-1 items-end gap-6 lg:grid-cols-12`}
                data-cursor="hover"
                onClick={() => setLightbox(globalIndex(project))}
              >
                <div
                  className="relative overflow-hidden lg:col-span-8"
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
                  <span
                    className="font-mono absolute left-4 top-4 text-[10px] tracking-[0.3em]"
                    style={{ color: 'var(--text)', background: 'rgba(10,9,7,0.6)', padding: '6px 10px', border: '1px solid var(--line)' }}
                  >
                    ENV_{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <div className="font-display text-hollow select-none" style={{ fontSize: 'clamp(3.4rem, 7vw, 6rem)', lineHeight: 0.9 }}>
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
            ))}
          </div>
        </div>
      </div>

      {/* ——————————————————————————
          ARCHIVE grid (all sizes)
      —————————————————————————— */}
      <div style={{ padding: '0 clamp(20px, 4vw, 48px) clamp(90px, 12vw, 160px)' }}>
        <div className="mx-auto mt-28 max-w-[1500px]">
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
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '16/10', border: '1px solid var(--line)' }}
                >
                  <DistortImage
                    src={projectSrc(project)}
                    alt={project.title}
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-80"
                    style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.85), transparent)' }}
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--ember)]"
                      style={{ color: 'var(--text)' }}
                    >
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
