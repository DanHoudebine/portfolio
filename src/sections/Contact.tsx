import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import Magnetic from '../components/site/Magnetic';
import useReveal from '../lib/useReveal';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'danhoudebine@gmail.com';

const SOCIALS = [
  { name: 'ArtStation', href: 'https://www.artstation.com/danhoudebine' },
  { name: 'LinkedIn',   href: 'https://www.linkedin.com/in/danhoudebine' },
  { name: 'GitHub',     href: 'https://github.com/DanHoudebine' },
];

export default function Contact() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const emailRef   = useRef<HTMLAnchorElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState('');

  useReveal(sectionRef);

  /* Paris clock */
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZone: 'Europe/Paris',
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* Giant CTA word-by-word clip reveal */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lines = el.querySelectorAll<HTMLElement>('.cta-line');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
    tl.fromTo(lines,
      { yPercent: 110, skewY: 2.5 },
      { yPercent: 0, skewY: 0, duration: 1.15, ease: 'power4.out', stagger: 0.12 },
    );
    /* cyan glow pulse after land */
    tl.to(lines[1], {
      textShadow: '0 0 60px rgba(0,229,255,0.6), 0 0 120px rgba(0,229,255,0.25)',
      duration: 0.35,
      ease: 'power2.out',
    }, '-=0.1');

    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  /* Email char-by-char reveal */
  useEffect(() => {
    const el = emailRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const chars = el.querySelectorAll<HTMLElement>('.email-char');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 84%', once: true },
    });
    tl.fromTo(chars,
      { opacity: 0, y: 18, rotateX: -55 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.65, ease: 'power3.out', stagger: 0.022 },
    );

    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  /* Magnetic pull on email link */
  useEffect(() => {
    const el = emailRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power2.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power2.out' });

    const onMove  = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      qx(((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 16);
      qy(((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 10);
    };
    const onLeave = () => { qx(0); qy(0); };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const titleA = t('contact.titleA');
  const titleB = t('contact.titleB');

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px) clamp(70px, 9vw, 120px)',
        background: 'var(--bg)',
        borderTop: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* background "04" */}
      <div
        className="font-display text-hollow-cyan pointer-events-none absolute select-none"
        style={{ fontSize: 'clamp(14rem, 28vw, 24rem)', lineHeight: 1, opacity: 0.04, right: '-0.05em', bottom: '-0.1em' }}
        aria-hidden="true"
      >
        04
      </div>

      {/* Horizontal scan line accent */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{ top: '42%', height: 1, background: 'linear-gradient(to right, transparent, var(--line-strong), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <SectionHeading num="04" label={t('contact.label')} titleA={titleA} titleB={titleB} />

        {/* ── Monumental CTA ── */}
        <div ref={ctaRef} className="mb-16 overflow-hidden" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="overflow-hidden pt-8">
            <div
              className="cta-line font-display"
              style={{
                fontSize: 'clamp(3.2rem, 9vw, 11rem)',
                lineHeight: 0.86,
                color: 'var(--text)',
                letterSpacing: '-0.015em',
              }}
            >
              {titleA}
            </div>
          </div>
          <div className="overflow-hidden">
            <div
              className="cta-line font-display"
              style={{
                fontSize: 'clamp(3.2rem, 9vw, 11rem)',
                lineHeight: 0.86,
                color: 'var(--cyan)',
                letterSpacing: '-0.015em',
              }}
            >
              {titleB.toUpperCase()}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span
              className="animate-pulse-dot inline-block"
              style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }}
            />
            <span className="font-mono text-[9px] tracking-[0.35em]" style={{ color: 'var(--cyan)' }}>
              OPEN TO WORK — PARIS · WORLDWIDE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_minmax(260px,360px)] lg:gap-24">

          {/* Email CTA */}
          <div>
            <p
              data-reveal
              className="font-body mb-10 max-w-[520px] text-[15px] leading-relaxed"
              style={{ color: 'var(--text-dim)' }}
            >
              {t('contact.description')}
            </p>

            <a
              ref={emailRef}
              href={`mailto:${EMAIL}`}
              className="group block w-max max-w-full"
              data-cursor="view"
              style={{ perspective: 600 }}
            >
              <span className="font-mono text-[10px] tracking-[0.4em]" style={{ color: 'var(--cyan)' }}>
                {t('contact.emailCta')} ↗
              </span>
              <div
                className="font-display mt-2 transition-colors duration-300 group-hover:text-[var(--cyan)]"
                style={{ fontSize: 'clamp(1.5rem, 4.2vw, 4rem)', lineHeight: 1, color: 'var(--text)' }}
              >
                {EMAIL.split('').map((char, i) => (
                  <span
                    key={i}
                    className="email-char inline-block"
                    style={{ display: 'inline-block', opacity: 0 }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <span
                className="mt-3 block h-px w-full origin-left transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: 'var(--cyan)', transform: 'scaleX(0.14)' }}
              />
            </a>
          </div>

          {/* Socials + clock */}
          <div className="flex flex-col gap-10">
            <div data-reveal>
              <div className="eyebrow mb-5" style={{ color: 'var(--text-dim)' }}>
                {t('contact.socialsLabel')}
              </div>
              <div className="flex flex-col">
                {SOCIALS.map((social) => (
                  <Magnetic key={social.name} strength={0.3}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between py-4 transition-colors duration-300"
                      style={{ borderBottom: '1px solid var(--line)' }}
                      data-cursor="hover"
                    >
                      <span
                        className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--cyan)]"
                        style={{ color: 'var(--text)' }}
                        data-magnetic-text
                      >
                        {social.name}
                      </span>
                      <span
                        className="font-mono text-[12px] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cyan)]"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        ↗
                      </span>
                    </a>
                  </Magnetic>
                ))}
              </div>
            </div>

            <div data-reveal>
              <div className="eyebrow mb-3" style={{ color: 'var(--text-dim)' }}>
                {t('contact.localTime')}
              </div>
              <div
                className="font-display flex items-baseline gap-3"
                style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text)' }}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{time || '--:--:--'}</span>
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  PARIS — UTC+2
                </span>
              </div>
            </div>

            {/* Status card */}
            <div
              data-reveal
              style={{
                border: '1px solid var(--line-strong)',
                padding: '16px 20px',
                background: 'var(--cyan-dim)',
              }}
            >
              <div className="font-mono text-[9px] tracking-[0.3em]" style={{ color: 'var(--cyan)' }}>
                STATUS
              </div>
              <div className="font-body mt-2 text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                Available for new projects
              </div>
              <div className="font-mono mt-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                Freelance · Full-time · Collab
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
