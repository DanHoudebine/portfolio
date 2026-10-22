import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/site/SectionHeading';
import useReveal from '../lib/useReveal';

gsap.registerPlugin(ScrollTrigger);

interface SkillData { name: string; level: number }
type Category = 'software' | 'technical' | 'artistic';

const SEGMENTS = 12;

/** Map a 0–1 proficiency onto a game-style quality preset. */
function presetKey(level: number): 'ultra' | 'high' | 'medium' | 'learning' {
  if (level >= 0.95) return 'ultra';
  if (level >= 0.85) return 'high';
  if (level >= 0.7) return 'medium';
  return 'learning';
}

const presetColor: Record<string, string> = {
  ultra: 'var(--ember)',
  high: 'var(--ember-soft)',
  medium: 'var(--text-dim)',
  learning: 'var(--text-faint)',
};

export default function Skills() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Category>('software');
  const [inView, setInView] = useState(false);

  useReveal(sectionRef);

  const categories: Category[] = ['software', 'technical', 'artistic'];
  const categoryLabels = t('skills.categories', { returnObjects: true }) as string[];
  const software = t('skills.softwareSkills', { returnObjects: true }) as SkillData[];
  const technical = t('skills.technicalSkills', { returnObjects: true }) as SkillData[];
  const artistic = t('skills.artisticSkills', { returnObjects: true }) as string[];

  // Fire the segment fill once the panel scrolls into view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 65%',
      once: true,
      onEnter: () => setInView(true),
    });
    return () => st.kill();
  }, []);

  // Stagger-fill the segments whenever the tab changes (or first reveal)
  useEffect(() => {
    if (!inView || !panelRef.current) return;
    const segs = panelRef.current.querySelectorAll('.seg-on');
    gsap.fromTo(
      segs,
      { opacity: 0, scaleY: 0.2 },
      { opacity: 1, scaleY: 1, duration: 0.35, ease: 'power2.out', stagger: 0.012 },
    );
  }, [inView, active]);

  const rows = active === 'software' ? software : active === 'technical' ? technical : null;

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{ padding: 'clamp(90px, 12vw, 160px) clamp(20px, 4vw, 48px)', background: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading num="03" label={t('skills.label')} titleA={t('skills.titleA')} titleB={t('skills.titleB')} />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-20">
          {/* Left — copy */}
          <div>
            <p data-reveal className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {t('skills.description')}
            </p>
            <p data-reveal className="font-mono mt-6 text-[11px] leading-relaxed tracking-[0.05em]" style={{ color: 'var(--ember)' }}>
              {t('skills.hint')}
            </p>
          </div>

          {/* Right — settings panel */}
          <div data-reveal ref={panelRef} style={{ border: '1px solid var(--line-strong)', background: 'var(--bg-panel)' }}>
            {/* Panel title bar */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}
            >
              <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'var(--text-dim)' }}>
                SETTINGS / {t('skills.label')}
              </span>
              <span className="flex gap-2">
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: d === 0 ? 'var(--ember)' : 'var(--line-strong)' }} />
                ))}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex" style={{ borderBottom: '1px solid var(--line)' }}>
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="font-mono flex-1 text-[10px] tracking-[0.25em] transition-colors duration-300"
                  style={{
                    padding: '14px 8px',
                    color: active === cat ? '#0a0907' : 'var(--text-dim)',
                    background: active === cat ? 'var(--ember)' : 'transparent',
                    borderRight: i < 2 ? '1px solid var(--line)' : undefined,
                  }}
                >
                  {categoryLabels[i]}
                </button>
              ))}
            </div>

            {/* Rows */}
            <div style={{ padding: 'clamp(16px, 2.5vw, 28px)' }}>
              {rows ? (
                rows.map((skill) => {
                  const key = presetKey(skill.level);
                  const filled = Math.round(skill.level * SEGMENTS);
                  return (
                    <div
                      key={skill.name}
                      className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[180px_1fr_72px] sm:gap-6"
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <span className="font-body col-start-1 row-start-1 text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                        {skill.name}
                      </span>
                      <div className="col-span-2 col-start-1 row-start-2 flex gap-[5px] sm:col-span-1 sm:col-start-2 sm:row-start-1">
                        {Array.from({ length: SEGMENTS }, (_, s) => (
                          <span
                            key={s}
                            className={s < filled ? 'seg-on' : ''}
                            style={{
                              height: 16,
                              flex: 1,
                              background: s < filled ? presetColor[key] : 'rgba(236,230,218,0.07)',
                              boxShadow: s < filled && key === 'ultra' ? '0 0 8px rgba(255,122,47,0.45)' : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="font-mono col-start-2 row-start-1 text-right text-[10px] tracking-[0.15em] sm:col-start-3"
                        style={{ color: presetColor[key] }}
                      >
                        {t(`skills.levels.${key}`)}
                      </span>
                    </div>
                  );
                })
              ) : (
                /* Artistic — perk chips */
                <div className="flex flex-wrap gap-3 py-2">
                  {artistic.map((skill) => (
                    <span
                      key={skill}
                      className="font-mono text-[11px] tracking-[0.1em] transition-colors duration-300 hover:border-[var(--ember)] hover:text-[var(--ember)]"
                      style={{ padding: '11px 18px', border: '1px solid var(--line-strong)', color: 'var(--text)' }}
                    >
                      ✦ {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Panel footer */}
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
                  PRESET: CUSTOM
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>
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
