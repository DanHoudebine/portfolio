import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WebGLHero from '../components/site/WebGLHero';
import ScrambleText from '../components/site/ScrambleText';
import ParticleCanvas from '../components/site/ParticleCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay   = reduced ? 0 : 2.2;

    const ctx = gsap.context(() => {
      /* ── intro ── */
      gsap.fromTo('.h-bar-t', { scaleY: 6 }, { scaleY: 1, duration: 1.6, ease: 'power4.inOut', delay: delay * 0.7 });
      gsap.fromTo('.h-bar-b', { scaleY: 6 }, { scaleY: 1, duration: 1.6, ease: 'power4.inOut', delay: delay * 0.7 });

      gsap.fromTo('.h-rise',
        { yPercent: 110, skewY: 4 },
        { yPercent: 0, skewY: 0, duration: 1.25, ease: 'power4.out', stagger: 0.1, delay },
      );
      gsap.fromTo('.h-fade',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0,  duration: 0.95, ease: 'power2.out', stagger: 0.08, delay: delay + 0.5 },
      );

      /* ── on scroll ── */
      gsap.to('.h-shader', {
        yPercent: 30, scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 1.5 },
      });
      gsap.to('.h-content', {
        yPercent: -22, opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '65% top', scrub: 1.5 },
      });
      gsap.to('.h-particles', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '40% top', scrub: 1 },
      });
    }, section);

    /* velocity skew */
    let rafSkew = 0;
    if (!reduced) {
      const skewQ = gsap.quickTo('.h-content', 'skewY', { duration: 0.9, ease: 'power3.out' });
      const clamp = gsap.utils.clamp(-4.5, 4.5);
      const tick  = () => {
        const v = parseFloat(document.documentElement.style.getPropertyValue('--sv') || '0');
        skewQ(clamp(v * -0.16));
        rafSkew = requestAnimationFrame(tick);
      };
      rafSkew = requestAnimationFrame(tick);
    }

    return () => { ctx.revert(); cancelAnimationFrame(rafSkew); };
  }, []);

  /* 6-layer mouse parallax */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const qShX  = gsap.quickTo('.h-shader',    'x', { duration: 2.4, ease: 'power2.out' });
    const qShY  = gsap.quickTo('.h-shader',    'y', { duration: 2.4, ease: 'power2.out' });
    const qPaX  = gsap.quickTo('.h-particles', 'x', { duration: 1.8, ease: 'power2.out' });
    const qPaY  = gsap.quickTo('.h-particles', 'y', { duration: 1.8, ease: 'power2.out' });
    const qViX  = gsap.quickTo('.h-vignette',  'x', { duration: 3.0, ease: 'power2.out' });
    const qViY  = gsap.quickTo('.h-vignette',  'y', { duration: 3.0, ease: 'power2.out' });
    const qCoX  = gsap.quickTo('.h-content',   'x', { duration: 3.8, ease: 'power2.out' });
    const qCoY  = gsap.quickTo('.h-content',   'y', { duration: 3.8, ease: 'power2.out' });
    const qIdX  = gsap.quickTo('.h-coord',     'x', { duration: 4.5, ease: 'power1.out' });
    const qIdY  = gsap.quickTo('.h-coord',     'y', { duration: 4.5, ease: 'power1.out' });
    const qBrX  = gsap.quickTo('.h-bars',      'x', { duration: 5.0, ease: 'power1.out' });

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      qShX(nx * 28);  qShY(ny * 18);   /* layer 1 — shader deepest  */
      qPaX(nx * -12); qPaY(ny * -8);   /* layer 2 — particles opp.  */
      qViX(nx * -16); qViY(ny * -10);  /* layer 3 — vignette opp.   */
      qCoX(nx * 10);  qCoY(ny * 6);    /* layer 4 — content         */
      qIdX(nx * 6);   qIdY(ny * 4);    /* layer 5 — coordinates tag */
      qBrX(nx * 3);                    /* layer 6 — bars            */
    };

    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden"
      data-cursor="drag"
    >
      {/* L1 — WebGL plasma shader */}
      <div className="h-shader absolute" style={{ inset: '-10%', zIndex: 0 }}>
        <WebGLHero />
      </div>

      {/* L2 — ember particles */}
      <div className="h-particles absolute" style={{ inset: '-8%', zIndex: 2 }}>
        <ParticleCanvas />
      </div>

      {/* L3 — radial vignette (moves opposite) */}
      <div
        className="h-vignette pointer-events-none absolute"
        style={{
          inset: '-8%', zIndex: 3,
          background: 'radial-gradient(ellipse at center, transparent 28%, rgba(8,13,26,0.78) 100%)',
        }}
      />

      {/* L6 — letterbox bars */}
      <div className="h-bars pointer-events-none absolute inset-0" style={{ zIndex: 10 }}>
        <div className="h-bar-t absolute left-0 top-0 w-full origin-top"
          style={{ height: 'clamp(24px, 3.5vh, 40px)', background: 'var(--bg)' }} />
        <div className="h-bar-b absolute bottom-0 left-0 w-full origin-bottom"
          style={{ height: 'clamp(24px, 3.5vh, 40px)', background: 'var(--bg)' }} />
      </div>

      {/* Coordinate tag (top-right) — L5 */}
      <div
        className="h-coord h-fade pointer-events-none absolute right-0 top-0 z-20 flex items-end gap-6 opacity-0"
        style={{ padding: 'clamp(44px, 7vh, 80px) clamp(20px, 4vw, 48px) 0 0' }}
      >
        <span className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--text-faint)' }}>
          48°52′N 2°21′E
        </span>
        <span
          className="font-display text-hollow-cyan select-none"
          style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', lineHeight: 0.85 }}
        >
          001
        </span>
      </div>

      {/* L4 — main content */}
      <div
        className="h-content relative z-20 flex h-full flex-col justify-end"
        style={{ padding: '0 clamp(20px, 4vw, 48px) clamp(68px, 10vh, 110px)' }}
      >
        {/* kicker */}
        <div className="h-fade mb-5 flex items-center gap-4 opacity-0">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <span className="h-px w-16" style={{ background: 'var(--cyan)' }} />
          <span className="eyebrow" style={{ color: 'var(--text-faint)' }}>{t('hero.reel')}</span>
        </div>

        {/* monumental name */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(4.5rem, 16vw, 15rem)',
            lineHeight: 0.82,
            color: 'var(--text)',
            letterSpacing: '0.01em',
          }}
        >
          <span className="block overflow-hidden">
            <span className="h-rise block" style={{ transform: 'translateY(110%)' }}>DAN</span>
          </span>
          <span className="block overflow-hidden">
            <span className="h-rise block" style={{ transform: 'translateY(110%)' }}>
              HOUDEBINE<span style={{ color: 'var(--ember)' }}>.</span>
            </span>
          </span>
        </h1>

        {/* role row */}
        <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div
              className="h-fade font-mono text-[11px] tracking-[0.35em] opacity-0"
              style={{ color: 'var(--cyan)' }}
            >
              <ScrambleText text={t('hero.role').toUpperCase()} delay={2800} />
            </div>
            <div
              className="h-fade font-serif-i mt-2 opacity-0"
              style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.7rem)', color: 'var(--ember-soft)' }}
            >
              {t('hero.tagline')}
            </div>
          </div>

          <div className="h-fade flex flex-col items-start gap-2 opacity-0 sm:items-end">
            <div className="flex items-center gap-2">
              <span className="animate-pulse-dot inline-block"
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)' }} />
              <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>
                {t('hero.status')}
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'var(--text-faint)' }}>
              {t('hero.location')}
            </span>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div
        className="h-fade absolute bottom-0 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-0 md:flex"
        style={{ paddingBottom: 'clamp(30px, 5vh, 48px)' }}
      >
        <span className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--text-faint)' }}>
          {t('hero.scroll')}
        </span>
        <span className="block h-8 w-px animate-scroll-line"
          style={{ background: 'linear-gradient(to bottom, var(--cyan), transparent)' }} />
      </div>
    </section>
  );
}
