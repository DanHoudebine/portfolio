import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

/**
 * Hero — text overlay only. The Three.js scene lives in <SceneBackground />
 * mounted once in Home.tsx and stays behind every section.
 */
export default function Hero3D() {
  const { t } = useTranslation();
  const lineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const name1Ref = useRef<HTMLDivElement>(null);
  const name2Ref = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 1.7 }); // wait for Loader fade
    tl.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut' });
    tl.fromTo(tagRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35');
    tl.fromTo(name1Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.95, ease: 'power3.out' }, '-=0.2');
    tl.fromTo(name2Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.95, ease: 'power3.out' }, '-=0.7');
    tl.fromTo(descRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, '-=0.3');
    tl.fromTo(metaRef.current?.children || [],
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, '-=0.4');
    tl.fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }, '-=0.1');
  }, []);

  return (
    <section
      id="hero"
      className="hero-section relative w-full overflow-hidden"
      style={{ height: '100vh', background: 'transparent' }}
    >
      {/* Top + bottom atmospheric gradients for legibility */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '35%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(4,6,13,0.75) 0%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(4,6,13,0.5) 0%, transparent 100%)',
        }}
      />

      {/* Center text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={lineRef}
          style={{
            width: '64px', height: '1px',
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            marginBottom: '22px',
            transformOrigin: 'center',
            transform: 'scaleX(0)',
          }}
        />
        <div
          ref={tagRef}
          className="font-mono uppercase"
          style={{
            fontSize: '11px', letterSpacing: '0.35em',
            color: '#60a5fa', marginBottom: '22px', opacity: 0,
            textShadow: '0 0 12px rgba(59,130,246,0.5)',
          }}
        >
          3D Environment Artist · Paris, France
        </div>
        <div
          ref={name1Ref}
          className="font-heading font-bold text-white text-center"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            opacity: 0,
            textShadow: '0 0 80px rgba(59,130,246,0.25)',
          }}
        >
          DAN
        </div>
        <div
          ref={name2Ref}
          className="font-heading font-bold text-center"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: '#3b82f6',
            opacity: 0,
            marginBottom: '36px',
            textShadow: '0 0 90px rgba(59,130,246,0.55), 0 0 30px rgba(96,165,250,0.4)',
          }}
        >
          HOUDEBINE
        </div>
        <p
          ref={descRef}
          className="font-body text-center"
          style={{
            fontSize: '15px', lineHeight: 1.75,
            color: 'rgba(210, 220, 240, 0.75)',
            maxWidth: '460px', opacity: 0,
            marginBottom: '36px',
          }}
        >
          {t('hero.descriptions.0')}
        </p>
        <div
          ref={metaRef}
          className="font-mono flex items-center gap-5"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(180,200,230,0.6)' }}
        >
          <span style={{ opacity: 0 }}>EST. 2018</span>
          <span style={{ opacity: 0, color: '#3b82f6' }}>•</span>
          <span style={{ opacity: 0 }}>UE5 / BLENDER / SUBSTANCE</span>
          <span style={{ opacity: 0, color: '#3b82f6' }}>•</span>
          <span style={{ opacity: 0 }}>15+ ENVIRONMENTS</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-10 flex flex-col items-center gap-3"
        style={{ transform: 'translateX(-50%)', opacity: 0 }}
      >
        <span
          className="font-mono uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(180,200,230,0.55)' }}
        >
          {t('hero.scroll')}
        </span>
        <div
          style={{
            width: '1px', height: '48px',
            background: 'linear-gradient(to bottom, #3b82f6, transparent)',
            animation: 'scroll-line 2s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scroll-line {
          0%, 100% { transform: scaleY(1); opacity: 0.6; transform-origin: top; }
          50%      { transform: scaleY(0.6); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
