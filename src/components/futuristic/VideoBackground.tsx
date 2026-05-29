import { useEffect, useRef, useState } from 'react';

/**
 * Cinematic UE5/Blender reel as a fixed background video.
 * Lives at z-index 0; Three.js overlay sits at z-index 1.
 *
 * Two encodings shipped:
 *   - portfolio-reel.mp4        960×540, 7.58 MB → desktop / wide screens
 *   - portfolio-reel-mobile.mp4 640×360, 3.11 MB → < 768px
 *
 * The mobile source is chosen via <source media> so a phone never downloads
 * the 7.6 MB version. Autoplay/loop/muted/playsInline for iOS-friendly bg.
 */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setReady(true);
    v.addEventListener('canplay', onCanPlay);
    // Safari needs explicit play() after metadata is loaded
    v.play().catch(() => { /* autoplay blocked; will start on first user gesture */ });
    return () => v.removeEventListener('canplay', onCanPlay);
  }, []);

  const base = import.meta.env.BASE_URL;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#04060d',
        pointerEvents: 'none',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: ready ? 1 : 0,
          transition: 'opacity 1.2s ease-out',
        }}
      >
        {/* Mobile-first source: small phones get the 3 MB version */}
        <source src={`${base}portfolio-reel-mobile.mp4`} type="video/mp4" media="(max-width: 767px)" />
        {/* Desktop fallback */}
        <source src={`${base}portfolio-reel.mp4`} type="video/mp4" />
      </video>
      {/* Neutral vignette only — keep the warm UE5 palette intact */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 95%)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Soft darken at top for header readability */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '25%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)',
        }}
      />
      {/* Soft darken at bottom for HUD readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: '20%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
