import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '../components/futuristic/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceItem { years: string; role: string; place: string }

export default function About() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const elements = section.querySelectorAll('.reveal-item');
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      },
    );
  }, []);

  const experience = t('about.experience', { returnObjects: true }) as ExperienceItem[];
  const base = import.meta.env.BASE_URL;

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding: '140px 4vw',
        background: 'rgba(4,6,13,0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader num="01" label={t('about.label')} heading={t('about.heading')} />

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 lg:gap-16">
          {/* Left — Portrait */}
          <div className="reveal-item">
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
                overflow: 'hidden',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: '0 0 0 1px rgba(59,130,246,0.08), 0 20px 60px rgba(0,0,0,0.4)',
              }}
            >
              <img
                src={`${base}dan.jpg`}
                alt="Dan Houdebine"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'saturate(0.95) contrast(1.02)',
                }}
              />
              {/* HUD-style frame corners */}
              <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16,
                borderTop: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16,
                borderTop: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
              <div style={{ position: 'absolute', bottom: 8, left: 8, width: 16, height: 16,
                borderBottom: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 8, width: 16, height: 16,
                borderBottom: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
            </div>

            {/* Quick stats */}
            <div className="mt-6 font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(180,200,230,0.6)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#3b82f6', boxShadow: '0 0 10px #3b82f6',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                <span>AVAILABLE</span>
              </div>
              <div style={{ color: 'rgba(180,200,230,0.45)' }}>PARIS · FR</div>
              <div style={{ color: 'rgba(180,200,230,0.45)', marginTop: 4 }}>EST. 2018</div>
            </div>
          </div>

          {/* Right — Bio + Experience + CV */}
          <div>
            {/* Bio */}
            <p
              className="reveal-item font-body"
              style={{
                fontSize: '17px',
                lineHeight: 1.75,
                color: '#e5edff',
                marginBottom: '24px',
                maxWidth: '720px',
              }}
            >
              {t('about.bio')}
            </p>
            <p
              className="reveal-item font-body"
              style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: 'rgba(210, 220, 240, 0.72)',
                marginBottom: '48px',
                maxWidth: '720px',
              }}
            >
              {t('about.bio2')}
            </p>

            {/* Experience timeline */}
            <div className="reveal-item">
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  color: '#3b82f6',
                  marginBottom: '20px',
                }}
              >
                {t('about.experienceHeading')}
              </div>
              <div className="space-y-5" style={{ maxWidth: '720px' }}>
                {experience.map((exp, i) => (
                  <div
                    key={i}
                    className="reveal-item grid grid-cols-[140px_1fr] gap-6 pb-5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="font-mono"
                      style={{ fontSize: '12px', letterSpacing: '0.12em', color: '#60a5fa', fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}
                    >
                      {exp.years}
                    </div>
                    <div>
                      <div className="font-heading font-semibold" style={{ fontSize: '16px', color: '#ffffff' }}>
                        {exp.role}
                      </div>
                      <div className="font-body" style={{ fontSize: '13px', color: 'rgba(210,220,240,0.6)', marginTop: 4 }}>
                        {exp.place}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CV download */}
            <div className="reveal-item mt-12">
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  color: '#3b82f6',
                  marginBottom: '16px',
                }}
              >
                {t('about.cvHeading')}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${base}cv/CV_Dan_Houdebine_EN_2026.pdf`}
                  download
                  className="font-body font-medium uppercase tracking-[0.12em] transition-all duration-300"
                  style={{
                    fontSize: '12px',
                    padding: '14px 24px',
                    border: '1px solid rgba(59,130,246,0.5)',
                    color: '#e5edff',
                    background: 'rgba(59,130,246,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = '#04060d';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
                    e.currentTarget.style.color = '#e5edff';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                  }}
                >
                  ↓ CV · {t('about.cvEnglish')}
                </a>
                <a
                  href={`${base}cv/CV_Dan_HoudebineFR_2026.pdf`}
                  download
                  className="font-body font-medium uppercase tracking-[0.12em] transition-all duration-300"
                  style={{
                    fontSize: '12px',
                    padding: '14px 24px',
                    border: '1px solid rgba(59,130,246,0.5)',
                    color: '#e5edff',
                    background: 'rgba(59,130,246,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = '#04060d';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
                    e.currentTarget.style.color = '#e5edff';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                  }}
                >
                  ↓ CV · {t('about.cvFrench')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
