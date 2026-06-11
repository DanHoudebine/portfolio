import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-viewport cinematic opener — the Blender/UE5 reel plays behind
 * letterbox bars while the name towers over it. The video parallaxes
 * and the title fades as you scroll into the page.
 */
export default function Hero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { /* autoplay blocked — starts on first gesture */ });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const introDelay = reduced ? 0 : 2.4; // wait for the preloader wipe

      // Letterbox bars open like a curtain
      gsap.fromTo('.hero-bar-top', { scaleY: 3.2 }, { scaleY: 1, duration: 1.4, ease: 'power4.inOut', delay: introDelay * 0.75 });
      gsap.fromTo('.hero-bar-bottom', { scaleY: 3.2 }, { scaleY: 1, duration: 1.4, ease: 'power4.inOut', delay: introDelay * 0.75 });

      // Title lines rise in
      gsap.fromTo(
        '.hero-rise',
        { yPercent: 110 },
        { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: introDelay },
      );
      gsap.fromTo(
        '.hero-fade',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.08, delay: introDelay + 0.55 },
      );

      // Scroll: video sinks + title drifts away
      gsap.to('.hero-video-wrap', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-content', {
        yPercent: -14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '75% top', scrub: true },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      {/* Reel background */}
      <div className="hero-video-wrap absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src={`${base}portfolio-reel-mobile.mp4`} type="video/mp4" media="(max-width: 767px)" />
          <source src={`${base}portfolio-reel.mp4`} type="video/mp4" />
        </video>
        {/* Cinematic grade: vignette + warm shadow lift */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,9,7,0.92) 0%, rgba(10,9,7,0.25) 35%, rgba(10,9,7,0.15) 60%, rgba(10,9,7,0.65) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,9,7,0.55) 100%)',
          }}
        />
      </div>

      {/* Letterbox bars */}
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
            <span className="hero-rise block">DAN</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-rise block">
              HOUDEBINE<span style={{ color: 'var(--ember)' }}>.</span>
            </span>
          </span>
        </h1>

        {/* Role + tagline */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="hero-fade font-mono text-[12px] tracking-[0.3em] opacity-0" style={{ color: 'var(--text)' }}>
              {t('hero.role').toUpperCase()}
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
      <div className="hero-fade absolute bottom-0 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-0 md:flex" style={{ paddingBottom: 'clamp(34px, 5vh, 52px)' }}>
        <span className="font-mono text-[9px] tracking-[0.4em]" style={{ color: 'var(--text-dim)' }}>
          {t('hero.scroll')}
        </span>
        <span className="block h-8 w-px" style={{ background: 'linear-gradient(to bottom, var(--ember), transparent)' }} />
      </div>
    </section>
  );
}
