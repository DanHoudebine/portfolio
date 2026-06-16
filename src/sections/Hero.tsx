import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrambleText from '../components/site/ScrambleText';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  // Core intro + scroll animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introDelay = reduced ? 0 : 2.4;

    const ctx = gsap.context(() => {
      // Letterbox curtain open
      gsap.fromTo('.hero-bar-top', { scaleY: 4 }, { scaleY: 1, duration: 1.5, ease: 'power4.inOut', delay: introDelay * 0.75 });
      gsap.fromTo('.hero-bar-bottom', { scaleY: 4 }, { scaleY: 1, duration: 1.5, ease: 'power4.inOut', delay: introDelay * 0.75 });

      // Title lines rise with slight skew
      gsap.fromTo('.hero-rise',
        { yPercent: 115, skewY: 4 },
        { yPercent: 0, skewY: 0, duration: 1.25, ease: 'power4.out', stagger: 0.12, delay: introDelay },
      );
      gsap.fromTo('.hero-fade',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.08, delay: introDelay + 0.55 },
      );

      // Scroll: video sinks deeper + content drifts up
      gsap.to('.hero-video-wrap', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 1.5 },
      });
      gsap.to('.hero-content', {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '70% top', scrub: 1.5 },
      });
    }, section);

    // Scroll velocity skew — runs outside GSAP context for clean RAF cleanup
    let rafId = 0;
    if (!reduced) {
      const skewSet = gsap.quickTo('.hero-content', 'skewY', { duration: 0.9, ease: 'power3.out' });
      const clamp = gsap.utils.clamp(-3.5, 3.5);
      const tick = () => {
        const vel = parseFloat(document.documentElement.style.getPropertyValue('--sv') || '0');
        skewSet(clamp(vel * -0.14));
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      ctx.revert();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Mouse parallax — desktop only
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const deepQ = gsap.quickTo('.hero-video-wrap', 'x', { duration: 2.2, ease: 'power2.out' });
    const deepQY = gsap.quickTo('.hero-video-wrap', 'y', { duration: 2.2, ease: 'power2.out' });
    const midQ = gsap.quickTo('.hero-vignette', 'x', { duration: 2.8, ease: 'power2.out' });
    const midQY = gsap.quickTo('.hero-vignette', 'y', { duration: 2.8, ease: 'power2.out' });
    const contentQ = gsap.quickTo('.hero-content', 'x', { duration: 3.5, ease: 'power2.out' });
    const contentQY = gsap.quickTo('.hero-content', 'y', { duration: 3.5, ease: 'power2.out' });

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      deepQ(nx * 22);
      deepQY(ny * 14);
      midQ(nx * -14);
      midQY(ny * -9);
      contentQ(nx * 8);
      contentQY(ny * 5);
    };

    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      {/* Extended video so mouse parallax never shows edges */}
      <div className="hero-video-wrap absolute" style={{ inset: '-8%' }}>
        <video
          ref={videoRef}
          autoPlay loop muted playsInline preload="auto"
          className="h-full w-full object-cover"
        >
          <source src={`${base}portfolio-reel-mobile.mp4`} type="video/mp4" media="(max-width: 767px)" />
          <source src={`${base}portfolio-reel.mp4`} type="video/mp4" />
        </video>
        {/* Cinematic grade */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.94) 0%, rgba(10,9,7,0.22) 38%, rgba(10,9,7,0.12) 62%, rgba(10,9,7,0.68) 100%)' }}
        />
      </div>

      {/* Radial vignette — separate layer for mouse depth */}
      <div
        className="hero-vignette pointer-events-none absolute"
        style={{ inset: '-8%', background: 'radial-gradient(ellipse at center, transparent 38%, rgba(10,9,7,0.62) 100%)' }}
      />

      {/* Letterbox */}
      <div className="hero-bar-top absolute left-0 top-0 z-10 w-full origin-top" style={{ height: 'clamp(28px, 4vh, 44px)', background: 'var(--bg)' }} />
      <div className="hero-bar-bottom absolute bottom-0 left-0 z-10 w-full origin-bottom" style={{ height: 'clamp(28px, 4vh, 44px)', background: 'var(--bg)' }} />

      {/* Content */}
      <div
        className="hero-content relative z-20 flex h-full flex-col justify-end"
        style={{ padding: '0 clamp(20px, 4vw, 48px) clamp(72px, 11vh, 120px)' }}
      >
        {/* Kicker */}
        <div className="hero-fade mb-4 flex items-center gap-4 opacity-0">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <span className="h-px w-12" style={{ background: 'var(--ember)' }} />
          <span className="eyebrow" style={{ color: 'var(--text-dim)' }}>{t('hero.reel')}</span>
        </div>

        {/* Monumental name */}
        <h1 className="font-display" style={{ fontSize: 'clamp(4.2rem, 15.5vw, 14.5rem)', lineHeight: 0.85, color: 'var(--text)' }}>
          <span className="block overflow-hidden">
            <span className="hero-rise block" style={{ transform: 'translateY(115%)' }}>DAN</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-rise block" style={{ transform: 'translateY(115%)' }}>
              HOUDEBINE<span style={{ color: 'var(--ember)' }}>.</span>
            </span>
          </span>
        </h1>

        {/* Role + tagline */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="hero-fade font-mono text-[12px] tracking-[0.3em] opacity-0" style={{ color: 'var(--text)' }}>
              <ScrambleText text={t('hero.role').toUpperCase()} delay={3000} />
            </div>
            <div
              className="hero-fade font-serif-i mt-2 opacity-0"
              style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.8rem)', color: 'var(--ember-soft)' }}
            >
              {t('hero.tagline')}
            </div>
          </div>

          <div className="hero-fade flex flex-col items-start gap-2 opacity-0 sm:items-end">
            <div className="flex items-center gap-2">
              <span className="animate-pulse-dot inline-block" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ember)' }} />
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

      {/* Scroll cue */}
      <div
        className="hero-fade absolute bottom-0 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-0 md:flex"
        style={{ paddingBottom: 'clamp(34px, 5vh, 52px)' }}
      >
        <span className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--text-dim)' }}>
          {t('hero.scroll')}
        </span>
        <span className="block h-8 w-px animate-scroll-line" style={{ background: 'linear-gradient(to bottom, var(--ember), transparent)' }} />
      </div>
    </section>
  );
}
