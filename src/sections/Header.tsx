import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Magnetic from '../components/site/Magnetic';

const NAV = ['work', 'about', 'skills', 'contact'] as const;

export default function Header() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // navigator-detected languages come back as 'fr-FR', 'en-US', …
  const currentLang = i18n.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    // wait for the overlay to release the scroll lock
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const toggleLang = () => i18n.changeLanguage(currentLang === 'en' ? 'fr' : 'en');

  return (
    <>
      <header
        className="fixed left-0 top-0 z-[60] flex w-full items-center justify-between transition-all duration-500"
        style={{
          padding: scrolled ? '14px clamp(20px, 4vw, 48px)' : '24px clamp(20px, 4vw, 48px)',
          background: scrolled ? 'rgba(10, 9, 7, 0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        }}
      >
        {/* Wordmark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="-my-2 py-2 text-left"
          style={{ minHeight: 44 }}
          aria-label="Back to top"
        >
          <span className="font-display text-[20px] tracking-[0.06em]" style={{ color: 'var(--text)' }}>
            DAN HOUDEBINE
            <span style={{ color: 'var(--ember)' }}>.</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((id) => (
            <Magnetic key={id} strength={0.4}>
              <button
                onClick={() => scrollTo(id)}
                className="link-line font-mono text-[11px] tracking-[0.25em] transition-colors duration-300 hover:text-[var(--text)]"
                style={{ color: 'var(--text-dim)' }}
                data-cursor="hover"
              >
                <span data-magnetic-text style={{ display: 'inline-block' }}>{t(`nav.${id}`)}</span>
              </button>
            </Magnetic>
          ))}
          <Magnetic strength={0.4}>
            <button
              onClick={toggleLang}
              className="btn-shine font-mono text-[11px] tracking-[0.2em] transition-colors duration-300"
              style={{
                color: 'var(--text)',
                border: '1px solid var(--line-strong)',
                padding: '7px 12px',
              }}
              aria-label="Switch language"
            >
              <span style={{ color: currentLang === 'en' ? 'var(--ember)' : 'var(--text-faint)' }}>EN</span>
              <span style={{ color: 'var(--text-faint)' }}> / </span>
              <span style={{ color: currentLang === 'fr' ? 'var(--ember)' : 'var(--text-faint)' }}>FR</span>
            </button>
          </Magnetic>
        </nav>

        {/* Mobile burger — generous padding for a ≥44px touch target */}
        <button
          className="-m-3 flex flex-col justify-center gap-[6px] p-4 md:hidden"
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span
            className="block h-px w-7 transition-transform duration-300"
            style={{
              background: 'var(--text)',
              transform: menuOpen ? 'translateY(3.5px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block h-px w-7 transition-transform duration-300"
            style={{
              background: 'var(--text)',
              transform: menuOpen ? 'translateY(-3.5px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className="fixed inset-0 z-[55] flex flex-col justify-center transition-opacity duration-500 md:hidden"
        style={{
          background: 'rgba(10, 9, 7, 0.97)',
          backdropFilter: 'blur(10px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          padding: '0 clamp(24px, 8vw, 60px)',
        }}
      >
        {NAV.map((id, i) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="font-display flex items-baseline gap-4 py-3 text-left"
            style={{ fontSize: 'clamp(2.6rem, 12vw, 4.5rem)', lineHeight: 1, color: 'var(--text)' }}
          >
            <span className="font-mono text-[12px]" style={{ color: 'var(--ember)' }}>
              0{i + 1}
            </span>
            {t(`nav.${id}`)}
          </button>
        ))}
        <button
          onClick={toggleLang}
          className="font-mono mt-10 w-max text-[12px] tracking-[0.25em]"
          style={{ color: 'var(--text)', border: '1px solid var(--line-strong)', padding: '10px 16px' }}
        >
          <span style={{ color: currentLang === 'en' ? 'var(--ember)' : 'var(--text-faint)' }}>EN</span>
          <span style={{ color: 'var(--text-faint)' }}> / </span>
          <span style={{ color: currentLang === 'fr' ? 'var(--ember)' : 'var(--text-faint)' }}>FR</span>
        </button>
      </div>
    </>
  );
}
