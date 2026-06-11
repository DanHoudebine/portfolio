import { useTranslation } from 'react-i18next';
import Marquee from '../components/site/Marquee';

export default function Footer() {
  const { t } = useTranslation();
  const marqueeItems = t('footer.marquee', { returnObjects: true }) as string[];

  return (
    <footer style={{ background: 'var(--bg)' }}>
      {/* Display-size skill band */}
      <Marquee items={marqueeItems} size="big" />

      <div
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        style={{ padding: '28px clamp(20px, 4vw, 48px)' }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-faint)' }}>
          {t('footer.rights')}
        </span>
        <span className="font-mono hidden text-[10px] tracking-[0.2em] md:block" style={{ color: 'var(--text-faint)' }}>
          {t('footer.tagline')} — {t('footer.location')}
        </span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="link-line font-mono -my-3 py-3 text-[10px] tracking-[0.3em] transition-colors duration-300 hover:text-[var(--ember)]"
          style={{ color: 'var(--text-dim)', minHeight: 44 }}
        >
          {t('footer.backToTop')} ↑
        </button>
      </div>
    </footer>
  );
}
