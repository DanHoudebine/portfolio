import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import useReveal from '../lib/useReveal';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceItem { years: string; role: string; place: string }
interface Stat { value: string; label: string }

export default function About() {
  const { t } = useTranslation();
  const sectionRef  = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const base        = import.meta.env.BASE_URL;

  useReveal(sectionRef);

  const experience = t('about.experience', { returnObjects: true }) as ExperienceItem[];
  const stats      = t('about.stats',      { returnObjects: true }) as Stat[];

  /* portrait 3D tilt */
  useEffect(() => {
    const section = sectionRef.current;
    const card    = portraitRef.current;
    if (!section || !card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const rx = gsap.quickTo(card, 'rotateX', { duration: 0.65, ease: 'power2.out' });
    const ry = gsap.quickTo(card, 'rotateY', { duration: 0.65, ease: 'power2.out' });

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      rx(-((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 7);
      ry( ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 9);
    };
    const onLeave = () => { rx(0); ry(0); };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* stats counter */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>('.stat-value');
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 75%', once: true,
      onEnter: () => {
        targets.forEach((span) => {
          const raw   = span.getAttribute('data-target') || '';
          const match = raw.match(/^([\d.]+)(.*)/);
          if (!match) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: parseFloat(match[1]), duration: 1.6, ease: 'power2.out',
            onUpdate() { span.textContent = String(Math.round(obj.val)) + (match[2] || ''); },
          });
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* giant background "02" */}
      <div
        className="font-display text-hollow-cyan pointer-events-none absolute select-none"
        style={{ fontSize: 'clamp(14rem, 30vw, 26rem)', lineHeight: 1, opacity: 0.04, right: '-0.05em', bottom: '-0.1em' }}
        aria-hidden="true"
      >
        02
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <SectionHeading num="02" label={t('about.label')} titleA={t('about.titleA')} titleB={t('about.titleB')} />

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[320px_1fr] lg:gap-20">

          {/* portrait */}
          <div data-reveal>
            <div
              ref={portraitRef}
              className="group relative overflow-hidden"
              style={{ aspectRatio: '3/4', border: '1px solid var(--line-strong)', transformStyle: 'preserve-3d', perspective: 800 }}
            >
              <img
                src={`${base}dan.jpg`}
                alt="Dan Houdebine"
                className="h-full w-full object-cover transition-all duration-700"
                style={{ filter: 'grayscale(1) contrast(1.08)' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(0) contrast(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1) contrast(1.08)'; }}
              />
              <div className="pointer-events-none absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                style={{ background: 'linear-gradient(160deg, rgba(0,229,255,0.1), transparent 55%)', mixBlendMode: 'overlay' }} />
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(221,238,255,0.5) 2px, rgba(221,238,255,0.5) 3px)', mixBlendMode: 'overlay' }} />
              <span className="font-mono absolute bottom-4 left-4 text-[9px] tracking-[0.3em]"
                style={{ color: 'var(--text)', background: 'rgba(8,13,26,0.7)', padding: '6px 10px', border: '1px solid var(--line)' }}>
                PARIS · FR — EST. 2019
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="animate-pulse-dot inline-block"
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)' }} />
              <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-dim)' }}>
                {t('hero.status')}
              </span>
            </div>
            <p className="font-body mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              {t('about.availability')}
            </p>
          </div>

          {/* bio + stats + experience */}
          <div>
            <p data-reveal className="font-serif-i max-w-[760px]"
              style={{ fontSize: 'clamp(1.25rem, 2.3vw, 1.75rem)', lineHeight: 1.48, color: 'var(--text)' }}>
              {t('about.bio')}
            </p>
            <p data-reveal className="font-body mt-5 max-w-[700px] text-[14px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('about.bio2')}
            </p>

            {/* stats */}
            <div data-reveal ref={statsRef} className="mt-12 grid grid-cols-2 lg:grid-cols-4"
              style={{ border: '1px solid var(--line)' }}>
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col justify-between p-5"
                  style={{ borderRight: i % 2 === 0 ? '1px solid var(--line)' : undefined, borderBottom: i < 2 ? '1px solid var(--line)' : undefined, minHeight: 110 }}>
                  <span className="stat-value font-display" data-target={stat.value}
                    style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', lineHeight: 1, color: 'var(--cyan)' }}>
                    {stat.value}
                  </span>
                  <span className="font-mono mt-3 text-[9px] uppercase leading-relaxed tracking-[0.18em]" style={{ color: 'var(--text-dim)' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* experience */}
            <div className="mt-14">
              <div data-reveal className="mb-6 flex items-center gap-4">
                <span className="eyebrow">{t('about.experienceHeading')}</span>
                <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
              </div>
              {experience.map((exp, i) => (
                <div key={i} data-reveal className="group grid grid-cols-1 gap-1 py-5 sm:grid-cols-[150px_1fr_auto] sm:items-baseline sm:gap-6"
                  style={{ borderBottom: '1px solid var(--line)' }}>
                  <span className="font-mono text-[10px] tracking-[0.12em]" style={{ color: 'var(--cyan)', fontVariantNumeric: 'tabular-nums' }}>
                    {exp.years}
                  </span>
                  <span className="font-display transition-colors duration-300 group-hover:text-[var(--ember-soft)]"
                    style={{ fontSize: 'clamp(1.2rem, 2vw, 1.7rem)', lineHeight: 1, color: 'var(--text)' }}>
                    {exp.role}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-faint)' }}>{exp.place}</span>
                </div>
              ))}
            </div>

            {/* CV download */}
            <div data-reveal className="mt-12 flex flex-wrap gap-4">
              {[
                { href: `${base}cv/CV_Dan_HoudebineUS_2026.pdf`, label: t('about.cvEnglish') },
                { href: `${base}cv/CV_Dan_HoudebineFR_2026.pdf`, label: t('about.cvFrench') },
              ].map((cv) => (
                <a key={cv.href} href={cv.href} download data-cursor="hover"
                  className="btn-shine border-glow font-mono text-[10px] tracking-[0.25em] transition-all duration-300"
                  style={{ padding: '13px 24px', color: 'var(--text)', background: 'var(--cyan-dim)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.color = 'var(--bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--cyan-dim)'; e.currentTarget.style.color = 'var(--text)'; }}>
                  ↓ {cv.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
