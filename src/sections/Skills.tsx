import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SkillData {
  name: string;
  level: number;
  label?: string;
}

type CategoryType = 'software' | 'technical' | 'artistic';

export default function Skills() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('software');
  const [animated, setAnimated] = useState(false);
  const metersRef = useRef<(SVGCircleElement | null)[]>([]);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  const categories: CategoryType[] = ['software', 'technical', 'artistic'];
  const categoryLabels = t('skills.categories', { returnObjects: true }) as string[];

  const softwareSkills = t('skills.softwareSkills', { returnObjects: true }) as SkillData[];
  const technicalSkills = t('skills.technicalSkills', { returnObjects: true }) as SkillData[];
  const artisticSkills = t('skills.artisticSkills', { returnObjects: true }) as string[];

  // Animate on scroll enter
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Section entrance
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

    // Trigger skill animations
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      once: true,
      onEnter: () => setAnimated(true),
    });
  }, []);

  // Animate radial meters
  useEffect(() => {
    if (!animated) return;

    if (activeCategory === 'software') {
      metersRef.current.forEach((circle, i) => {
        if (!circle) return;
        const skill = softwareSkills[i];
        if (!skill) return;

        const radius = 65;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - skill.level);

        gsap.fromTo(
          circle,
          { strokeDashoffset: circumference },
          {
            strokeDashoffset: offset,
            duration: 1.2,
            ease: 'power2.out',
            delay: i * 0.1,
          }
        );
      });
    }
  }, [animated, activeCategory, softwareSkills]);

  // Animate bars
  useEffect(() => {
    if (!animated) return;

    if (activeCategory === 'technical') {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const skill = technicalSkills[i];
        if (!skill) return;

        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${skill.level * 100}%`,
            duration: 1,
            ease: 'power2.out',
            delay: i * 0.08,
          }
        );
      });
    }
  }, [animated, activeCategory, technicalSkills]);

  const handleCategoryChange = (cat: CategoryType) => {
    setActiveCategory(cat);
    setAnimated(false);
    // Re-trigger animation
    requestAnimationFrame(() => {
      setAnimated(true);
    });
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        padding: '140px 4vw',
        background: 'rgba(4,6,13,0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        zIndex: 10,
      }}
    >
      {/* Background Particles Canvas */}
      <canvas
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.3 }}
        ref={(canvas) => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;

          const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
          }> = [];

          for (let i = 0; i < 50; i++) {
            particles.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              size: Math.random() * 2 + 0.5,
              speedX: (Math.random() - 0.5) * 0.3,
              speedY: (Math.random() - 0.5) * 0.3,
              opacity: Math.random() * 0.5 + 0.1,
            });
          }

          let animId: number;
          const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
              p.x += p.speedX;
              p.y += p.speedY;
              if (p.x < 0) p.x = canvas.width;
              if (p.x > canvas.width) p.x = 0;
              if (p.y < 0) p.y = canvas.height;
              if (p.y > canvas.height) p.y = 0;

              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
              ctx.fill();
            });
            animId = requestAnimationFrame(animate);
          };
          animate();

          return () => cancelAnimationFrame(animId);
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column */}
          <div>
            <div className="reveal-item flex items-center gap-4 mb-4">
              <span className="font-mono" style={{
                fontSize: '13px', color: '#3b82f6', letterSpacing: '0.15em',
                fontWeight: 600, textShadow: '0 0 10px rgba(59,130,246,0.4)',
              }}>02</span>
              <span className="section-label" style={{ marginBottom: 0 }}>/ {t('skills.label')}</span>
            </div>
            <h2
              className="reveal-item font-heading font-bold text-white"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                marginBottom: '24px',
                lineHeight: 1.1,
              }}
            >
              {t('skills.heading')}
            </h2>
            <p
              className="reveal-item font-body"
              style={{
                fontSize: '18px',
                lineHeight: 1.7,
                color: '#d2d2d2',
                maxWidth: '480px',
                marginBottom: '16px',
              }}
            >
              {t('skills.description')}
            </p>
            <p
              className="reveal-item font-body"
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'rgba(210, 210, 210, 0.7)',
              }}
            >
              {t('skills.secondaryDescription')}
            </p>

            {/* Category Tabs */}
            <div className="reveal-item flex flex-wrap gap-3 mt-10">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="font-body font-medium uppercase tracking-[0.08em] transition-all duration-300"
                  style={{
                    fontSize: '14px',
                    padding: '10px 24px',
                    border: `1px solid ${activeCategory === cat ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                    background: activeCategory === cat ? '#3b82f6' : 'transparent',
                    color: activeCategory === cat ? '#000b1f' : '#d2d2d2',
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.color = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.color = '#d2d2d2';
                    }
                  }}
                >
                  {categoryLabels[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Skill Visualizations */}
          <div>
            {/* Software - Radial Meters */}
            {activeCategory === 'software' && (
              <div className="grid grid-cols-3 gap-6">
                {softwareSkills.map((skill, i) => {
                  const radius = 65;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - skill.level);

                  return (
                    <div key={skill.name} className="flex flex-col items-center">
                      <div className="relative" style={{ width: '140px', height: '140px' }}>
                        <svg
                          width="140"
                          height="140"
                          viewBox="0 0 140 140"
                          className="transform -rotate-90"
                        >
                          {/* Track circle */}
                          <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                          />
                          {/* Fill circle */}
                          <circle
                            ref={(el) => { metersRef.current[i] = el; }}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={animated ? offset : circumference}
                            style={{ transition: 'none' }}
                          />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className="font-body font-medium text-white text-center px-2"
                            style={{ fontSize: '12px', lineHeight: 1.2 }}
                          >
                            {skill.name}
                          </span>
                          <span
                            className="font-mono mt-1"
                            style={{ fontSize: '18px', color: '#60a5fa' }}
                          >
                            {Math.round(skill.level * 100)}%
                          </span>
                        </div>
                      </div>
                      <span
                        className="font-body uppercase mt-2"
                        style={{ fontSize: '11px', color: 'rgba(210,210,210,0.6)' }}
                      >
                        {skill.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Technical - Bar Chart */}
            {activeCategory === 'technical' && (
              <div className="flex flex-col gap-5">
                {technicalSkills.map((skill, i) => (
                  <div key={skill.name} className="flex items-center gap-4">
                    <span
                      className="font-body font-medium text-white flex-shrink-0"
                      style={{ fontSize: '14px', width: '180px', textAlign: 'right' }}
                    >
                      {skill.name}
                    </span>
                    <div
                      className="flex-1 relative"
                      style={{
                        height: '32px',
                        background: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div
                        ref={(el) => { barsRef.current[i] = el; }}
                        className="h-full flex items-center justify-end"
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                          width: animated ? `${skill.level * 100}%` : '0%',
                          transition: 'none',
                        }}
                      >
                        <span
                          className="font-body font-semibold px-2"
                          style={{ fontSize: '12px', color: '#000b1f' }}
                        >
                          {Math.round(skill.level * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Artistic - List View */}
            {activeCategory === 'artistic' && (
              <div className="grid grid-cols-2 gap-4">
                {artisticSkills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3">
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="font-body"
                      style={{ fontSize: '15px', color: '#d2d2d2' }}
                    >
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
