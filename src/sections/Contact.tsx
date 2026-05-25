import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll('.reveal-item');
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const socialIcons = [
    // ArtStation
    <svg key="artstation" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
      <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.621-.189-1.192-.503-1.667L15.491 3.328A2.424 2.424 0 0 0 13.349 2H9.672l11.063 19.166 2.864-4.964c.357-.609.401-1.28.401-1.454zM11.119 6.475L2.485 21.448l.003.003a.962.962 0 0 0 .09.145l.002.002.011.017 4.582 7.932L20.355 6.475h-9.236z" />
    </svg>,
    // LinkedIn
    <svg key="linkedin" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>,
    // Twitter/X
    <svg key="twitter" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>,
    // Instagram
    <svg key="instagram" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>,
    // GitHub
    <svg key="github" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>,
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: '120px 4vw',
        background: '#0f0f14',
      }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16">
        {/* Left Column */}
        <div>
          <div className="reveal-item section-label mb-4">
            {t('contact.label')}
          </div>
          <h2
            className="reveal-item font-heading font-bold text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              marginBottom: '24px',
              lineHeight: 1.1,
            }}
          >
            {t('contact.heading')}
          </h2>
          <p
            className="reveal-item font-body"
            style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#d2d2d2',
              maxWidth: '480px',
              marginBottom: '40px',
            }}
          >
            {t('contact.description')}
          </p>

          {/* Email */}
          <div className="reveal-item">
            <a
              href="mailto:Danhoudebine@gmail.com"
              className="font-mono inline-block relative group"
              style={{ fontSize: '18px', color: '#ffffff' }}
            >
              Danhoudebine@gmail.com
              <span
                className="absolute left-0 bottom-0 h-[1px] bg-[#3b82f6] transition-all duration-300 group-hover:w-[120%] group-hover:bg-[#60a5fa]"
                style={{ width: '100%', bottom: '-4px' }}
              />
            </a>
          </div>

          {/* Social Links */}
          <div className="reveal-item flex gap-4 mt-8">
            {socialIcons.map((icon, i) => (
              <a
                key={i}
                href={[
                  'https://www.artstation.com/danhoudebine',
                  'https://www.linkedin.com/in/danhoudebine',
                  '#',
                  '#',
                  'https://github.com/DanHoudebine',
                ][i] || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center transition-all duration-300"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#d2d2d2',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = '#d2d2d2';
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right Column - Form */}
        <div
          className="reveal-item"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '40px',
          }}
        >
          {submitted ? (
            <div className="h-full flex items-center justify-center">
              <p
                className="font-heading font-semibold"
                style={{ fontSize: '24px', color: '#3b82f6' }}
              >
                {t('contact.form.success')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="text"
                placeholder={t('contact.form.name')}
                required
                className="bg-transparent border-b font-body text-white placeholder-white/40 focus:outline-none transition-colors duration-300 focus:border-[#3b82f6]"
                style={{
                  fontSize: '16px',
                  padding: '16px 0',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              />
              <input
                type="email"
                placeholder={t('contact.form.email')}
                required
                className="bg-transparent border-b font-body text-white placeholder-white/40 focus:outline-none transition-colors duration-300 focus:border-[#3b82f6]"
                style={{
                  fontSize: '16px',
                  padding: '16px 0',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              />
              <input
                type="text"
                placeholder={t('contact.form.subject')}
                required
                className="bg-transparent border-b font-body text-white placeholder-white/40 focus:outline-none transition-colors duration-300 focus:border-[#3b82f6]"
                style={{
                  fontSize: '16px',
                  padding: '16px 0',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              />
              <textarea
                placeholder={t('contact.form.message')}
                required
                rows={5}
                className="bg-transparent border-b font-body text-white placeholder-white/40 focus:outline-none transition-colors duration-300 focus:border-[#3b82f6] resize-none"
                style={{
                  fontSize: '16px',
                  padding: '16px 0',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  minHeight: '150px',
                }}
              />
              <button
                type="submit"
                className="font-body font-semibold uppercase tracking-[0.1em] transition-all duration-300 hover:bg-[#60a5fa]"
                style={{
                  fontSize: '15px',
                  padding: '18px',
                  background: '#3b82f6',
                  color: '#000b1f',
                  border: 'none',
                  marginTop: '8px',
                }}
              >
                {t('contact.form.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
