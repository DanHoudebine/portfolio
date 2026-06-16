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
  const [time, setTime] = useState('');

  useReveal(sectionRef);

  // Live Paris clock
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

  // Email char-by-char fade-in on scroll
  useEffect(() => {
    const el = emailRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const chars = el.querySelectorAll<HTMLElement>('.email-char');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
    tl.fromTo(chars,
      { opacity: 0, y: 16, rotateX: -60 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: 'power3.out', stagger: 0.025 },
    );

    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  // Magnetic hover on email link
  useEffect(() => {
    const el = emailRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power2.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power2.out' });

    const onMove  = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      qx(dx * 16); qy(dy * 10);
    };
    const onLeave = () => { qx(0); qy(0); };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px) clamp(70px, 9vw, 120px)',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large decorative background character */}
      <div
        className="font-display text-hollow pointer-events-none absolute -right-8 bottom-0 select-none"
        style={{ fontSize: 'clamp(12rem, 28vw, 22rem)', lineHeight: 0.8, opacity: 0.03 }}
        aria-hidden="true"
      >
        @
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <SectionHeading num="04" label={t('contact.label')} titleA={t('contact.titleA')} titleB={t('contact.titleB')} />

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_minmax(260px,360px)] lg:gap-24">
          {/* Giant mail CTA */}
          <div>
            <p data-reveal className="font-body mb-10 max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('contact.description')}
            </p>

            <a
              ref={emailRef}
              href={`mailto:${EMAIL}`}
              className="group block w-max max-w-full"
              data-cursor="view"
              style={{ perspective: 600 }}
            >
              <span className="font-mono text-[10px] tracking-[0.4em]" style={{ color: 'var(--ember)' }}>
                {t('contact.emailCta')} ↗
              </span>
              <div
                className="font-display mt-2 transition-colors duration-300 group-hover:text-[var(--ember)]"
                style={{ fontSize: 'clamp(1.6rem, 4.6vw, 4.4rem)', lineHeight: 1, color: 'var(--text)' }}
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
                style={{ background: 'var(--ember)', transform: 'scaleX(0.18)' }}
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
                        className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--ember)]"
                        style={{ color: 'var(--text)' }}
                        data-magnetic-text
                      >
                        {social.name}
                      </span>
                      <span
                        className="font-mono text-[12px] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--ember)]"
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
                {time || '--:--:--'}
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  PARIS — UTC+2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
