import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === 'fr' ? 'fr' : 'en';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLang = () => {
    const next = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <footer
      style={{
        padding: '60px 4vw 40px',
        background: '#0c1c36',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Logo */}
          <div>
            <div
              className="font-heading font-bold text-white tracking-[0.15em]"
              style={{ fontSize: '20px' }}
            >
              DAN HOUDEBINE
            </div>
            <div
              className="font-body mt-1"
              style={{ fontSize: '12px', color: '#8fa3bb' }}
            >
              3D ENVIRONMENT ARTIST
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6">
            {(['work', 'skills', 'contact'] as const).map((section) => (
              <button
                key={section}
                onClick={() => scrollTo(section)}
                className="font-body transition-colors duration-300 hover:text-[#c96f2e]"
                style={{ fontSize: '14px', color: '#8fa3bb' }}
              >
                {t(`nav.${section}`)}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="font-mono transition-opacity duration-300"
              style={{
                fontSize: '12px',
                color: currentLang === 'en' ? '#ffffff' : '#d2d2d2',
                opacity: currentLang === 'en' ? 1 : 0.5,
              }}
            >
              EN
            </button>
            <span className="font-mono" style={{ fontSize: '12px', color: '#d2d2d2', opacity: 0.3 }}>
              |
            </span>
            <button
              onClick={toggleLang}
              className="font-mono transition-opacity duration-300"
              style={{
                fontSize: '12px',
                color: currentLang === 'fr' ? '#ffffff' : '#d2d2d2',
                opacity: currentLang === 'fr' ? 1 : 0.5,
              }}
            >
              FR
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: '40px 0',
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'rgba(210,210,210,0.5)' }}
          >
            {t('footer.rights')}
          </span>
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'rgba(210,210,210,0.5)' }}
          >
            {t('footer.tagline')}
          </span>
        </div>
      </div>
    </footer>
 