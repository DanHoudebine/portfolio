import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeading from '../components/site/SectionHeading';
import useReveal from '../lib/useReveal';

const EMAIL = 'danhoudebine@gmail.com';

const SOCIALS = [
  { name: 'ArtStation', href: 'https://www.artstation.com/danhoudebine' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/danhoudebine' },
  { name: 'GitHub', href: 'https://github.com/DanHoudebine' },
];

export default function Contact() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [time, setTime] = useState('');

  useReveal(sectionRef);

  // Live Paris clock
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Paris',
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px) clamp(70px, 9vw, 120px)',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading num="04" label={t('contact.label')} titleA={t('contact.titleA')} titleB={t('contact.titleB')} />

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_minmax(260px,360px)] lg:gap-24">
          {/* Giant mail CTA */}
          <div>
            <p data-reveal className="font-body mb-10 max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('contact.description')}
            </p>

            <a
              data-reveal
              href={`mailto:${EMAIL}`}
              className="group block w-max max-w-full"
              data-cursor="hover"
            >
              <span className="font-mono text-[10px] tracking-[0.4em]" style={{ color: 'var(--ember)' }}>
                {t('contact.emailCta')} ↗
              </span>
              <span
                className="font-display mt-2 block break-all transition-colors duration-300 group-hover:text-[var(--ember)]"
                style={{ fontSize: 'clamp(1.6rem, 4.6vw, 4.4rem)', lineHeight: 1, color: 'var(--text)' }}
              >
                {EMAIL}
              </span>
              <span className="mt-3 block h-px w-full origin-left transition-transform duration-500 group-hover:scale-x-100" style={{ background: 'var(--ember)', transform: 'scaleX(0.25)' }} />
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
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-4 transition-colors duration-300"
                    style={{ borderBottom: '1px solid var(--line)' }}
                  >
                    <span className="font-body text-[14px] font-semibold transition-colors duration-300 group-hover:text-[var(--ember)]" style={{ color: 'var(--text)' }}>
                      {social.name}
                    </span>
                    <span className="font-mono text-[12px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: 'var(--ember)' }}>
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div data-reveal>
              <div className="eyebrow mb-3" style={{ color: 'var(--text-dim)' }}>
                {t('contact.localTime')}
              </div>
              <div className="font-display flex items-baseline gap-3" style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text)' }}>
                {time || '--:--:--'}
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  PARIS — UTC+1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
