import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const { t, i18n } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState('');
  const currentLang = i18n.language === 'fr' ? 'fr' : 'en';

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.to(header, {
      opacity: 0.8,
      scrollTrigger: {
        trigger: document.body,
        start: '200px top',
        end: '201px top',
        toggleActions: 'play none reverse none',
      },
    });

    const sections = ['work', 'skills', 'contact'];
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: `#${section}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(section),
        onEnterBack: () => setActiveSection(section),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

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
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50 px-[4vw] py-8 flex justify-between items-center"
      style={{ background: 'transparent' }}
    >
      {/* Logo */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left">
        <div className="font-heading font-bold text-white tracking-[0.15em]" style={{ fontSize: '20px' }}>
          YLÉNIA
        </div>
        <div
          className="font-body font-normal tracking-[0.2em] mt-1"
          style={{ fontSize: '11px', color: '#d2d2d2' }}
        >
          3D ENVIRONMENT ARTIST
        </div>
      </button>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {(['work', 'skills', 'contact'] as const).map((section) => (
          <button
            key={section}
            onClick={() => scrollTo(section)}
            className={`nav-link ${activeSection === section ? 'active' : ''}`}
          >
            {t(`nav.${section}`)}
          </button>
        ))}

        {/* Language Toggle */}
        <div className="flex items-center gap-2 ml-4">
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
      </nav>
    </header>
  );
}
