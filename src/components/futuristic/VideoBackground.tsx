import { useEffect, useRef, useState } from 'react';

/**
 * Cinematic Blender-rendered reel used as a fixed background video.
 * Lives at z-index 0; Three.js overlay sits at z-index 1.
 *
 * Renders muted, looping, autoplay, playsInline (required for iOS).
 * Fades in once `canplay` fires so the page never shows a black flash.
 */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setReady(true);
    v.addEventListener('canplay', onCanPlay);
    // Some browsers (Safari) need an explicit play() call after metadata
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
        src={`${base}portfolio-reel.mp4`}
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
      />
      {/* Subtle blue tint + slight vignette to keep cohesion with UI palette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(4,6,13,0.0) 0%, rgba(4,6,13,0.55) 90%)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,30,70,0.18)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
