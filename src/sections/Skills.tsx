import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import useReveal from '../lib/useReveal';

gsap.registerPlugin(ScrollTrigger);

interface SkillData { name: string; level: number }
type Category = 'software' | 'technical' | 'artistic';

function levelLabel(l: number) {
  if (l >= 0.95) return 'ULTRA';
  if (l >= 0.85) return 'HIGH';
  if (l >= 0.7)  return 'MED';
  return 'LEARNING';
}
function levelColor(l: number) {
  if (l >= 0.95) return 'var(--cyan)';
  if (l >= 0.85) return 'var(--ember-soft)';
  if (l >= 0.7)  return 'var(--text-dim)';
  return 'var(--text-faint)';
}

export default function Skills() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const barsRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Category>('software');
  const [inView, setInView] = useState(false);

  useReveal(sectionRef);

  const categories: Category[]  = ['software', 'technical', 'artistic'];
  const catLabels = t('skills.categories', { returnObjects: true }) as string[];
  const software  = t('skills.softwareSkills',  { returnObjects: true }) as SkillData[];
  const technical = t('skills.technicalSkills', { returnObjects: true }) as SkillData[];
  const artistic  = t('skills.artisticSkills',  { returnObjects: true }) as string[];

  /* trigger once in view */
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current, start: 'top 65%', once: true,
      onEnter: () => setInView(true),
    });
    return () => st.kill();
  }, []);

  /* animate bars whenever tab changes or first reveal */
  useEffect(() => {
    if (!inView || !barsRef.current) return;
    const fills = barsRef.current.querySelectorAll<HTMLElement>('.bar-fill');
    gsap.fromTo(fills,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out', stagger: 0.04 },
    );
  }, [inView, active]);

  const rows = active === 'software' ? software : active === 'technical' ? technical : null;

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{ padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
    >
      {/* background "03" */}
      <div className="font-display text-hollow-cyan pointer-events-none absolute select-none"
        style={{ fontSize: 'clamp(14rem, 28vw, 24rem)', lineHeight: 1, opacity: 0.04, left: '-0.05em', bottom: '-0.1em' }}
        aria-hidden="true">03</div>

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <SectionHeading num="03" label={t('skills.label')} titleA={t('skills.titleA')} titleB={t('skills.titleB')} />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(260px,380px)_1fr] lg:gap-20">

          {/* description */}
          <div>
            <p data-reveal className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('skills.description')}
            </p>
            <p data-reveal className="font-mono mt-5 text-[10px] leading-relaxed tracking-[0.06em]" style={{ color: 'var(--cyan)' }}>
              {t('skills.hint')}
            </p>
            {/* legend */}
            <div data-reveal className="mt-8 flex flex-col gap-2">
              {[
                { label: 'ULTRA',    color: 'var(--cyan)' },
                { label: 'HIGH',     color: 'var(--ember-soft)' },
                { label: 'MED',      color: 'var(--text-dim)' },
                { label: 'LEARNING', color: 'var(--text-faint)' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span style={{ width: 24, height: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
                  <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* skill panel */}
          <div data-reveal style={{ border: '1px solid var(--line-strong)' }}>
            {/* tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid var(--line)' }}>
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  data-cursor="hover"
                  className="font-mono flex-1 text-[9px] tracking-[0.3em] transition-all duration-300"
                  style={{
                    padding: '13px 8px',
                    color:      active === cat ? 'var(--bg)'  : 'var(--text-dim)',
                    background: active === cat ? 'var(--cyan)' : 'transparent',
                    borderRight: i < 2 ? '1px solid var(--line)' : undefined,
                  }}
                >
                  {catLabels[i]}
                </button>
              ))}
            </div>

            {/* content */}
            <div ref={barsRef} style={{ padding: 'clamp(16px, 2.5vw, 28px)' }}>
              {rows ? (
                rows.map((skill) => (
                  <div
                    key={skill.name}
                    className="group flex items-center gap-4 py-4"
                    style={{ borderBottom: '1px solid var(--line)' }}
                  >
                    {/* name */}
                    <span
                      className="font-body w-[38%] shrink-0 text-[13px] font-semibold transition-colors duration-300 group-hover:text-[var(--cyan)]"
                      style={{ color: 'var(--text)' }}
                    >
                      {skill.name}
                    </span>
                    {/* bar track */}
                    <div className="flex-1 relative" style={{ height: 2, background: 'rgba(0,229,255,0.08)' }}>
                      <div
                        className="bar-fill absolute inset-y-0 left-0"
                        style={{
                          width: `${skill.level * 100}%`,
                          height: '100%',
                          transformOrigin: 'left',
                          background: `linear-gradient(to right, ${levelColor(skill.level)}, rgba(0,229,255,0.2))`,
                          boxShadow: skill.level >= 0.95 ? `0 0 8px var(--cyan)` : undefined,
                        }}
                      />
                    </div>
                    {/* label */}
                    <span
                      className="font-mono w-[68px] shrink-0 text-right text-[9px] tracking-[0.2em]"
                      style={{ color: levelColor(skill.level) }}
                    >
                      {levelLabel(skill.level)}
                    </span>
                  </div>
                ))
              ) : (
                /* artistic chips */
                <div className="flex flex-wrap gap-3 py-3">
                  {artistic.map((skill) => (
                    <span
                      key={skill}
                      data-cursor="hover"
                      className="font-mono btn-shine text-[10px] tracking-[0.12em] transition-all duration-300 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                      style={{ padding: '10px 16px', border: '1px solid var(--line-strong)', color: 'var(--text)' }}
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* footer */}
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  PRESET: CUSTOM
                </span>
                <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  VSYNC: ON — 60 FPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
