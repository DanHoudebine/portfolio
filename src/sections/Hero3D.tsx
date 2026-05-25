import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

function createParticleField() {
  const COUNT = 1400;
  const positions = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    sizes[i] = Math.random() * 0.5 + 0.3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  return geo;
}

export default function Hero3D() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const name1Ref = useRef<HTMLDivElement>(null);
  const name2Ref = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#080808'));

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const scene = new THREE.Scene();

    // Particle field
    const geo = createParticleField();
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#e8541a') },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vAlpha = aSize * 0.8;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 3.0 * (300.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float alpha = (1.0 - d) * vAlpha * 0.5;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Subtle horizontal light streak (two thin planes)
    const streakGeo = new THREE.PlaneGeometry(12, 0.002);
    const streakMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#e8541a'),
      transparent: true,
      opacity: 0.15,
    });
    const streak = new THREE.Mesh(streakGeo, streakMat);
    streak.position.set(0, -0.5, 0);
    scene.add(streak);

    // Render loop
    let animId = 0;
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const elapsed = time * 0.001;
      mat.uniforms.uTime.value = elapsed;
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = elapsed * 0.015;
      // Gentle camera drift
      camera.position.x = Math.sin(elapsed * 0.12) * 0.3;
      camera.position.y = Math.cos(elapsed * 0.08) * 0.15;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Entrance animation
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut' });
    tl.fromTo(tagRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    tl.fromTo(name1Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');
    tl.fromTo(name2Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55');
    tl.fromTo(descRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3');
    tl.fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1');

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      mat.dispose();
      geo.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="hero-section relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
        style={{ pointerEvents: 'none' }}
      >
        {/* Horizontal line */}
        <div
          ref={lineRef}
          style={{
            width: '60px',
            height: '1px',
            background: '#e8541a',
            marginBottom: '24px',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />

        {/* Tag */}
        <div
          ref={tagRef}
          className="font-mono uppercase text-center"
          style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#e8541a', marginBottom: '24px', opacity: 0 }}
        >
          3D Environment Artist · Paris, France
        </div>

        {/* Name */}
        <div
          ref={name1Ref}
          className="font-heading font-bold text-white text-center"
          style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', lineHeight: 1, letterSpacing: '-0.02em', opacity: 0 }}
        >
          DAN
        </div>
        <div
          ref={name2Ref}
          className="font-heading font-bold text-center"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#e8541a',
            opacity: 0,
            marginBottom: '32px',
          }}
        >
          HOUDEBINE
        </div>

        {/* Description */}
        <p
          ref={descRef}
          className="font-body text-center"
          style={{ fontSize: '15px', lineHeight: 1.7, color: '#7a8291', maxWidth: '420px', opacity: 0 }}
        >
          {t('hero.descriptions.0')}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-10 flex flex-col items-center gap-3"
        style={{ transform: 'translateX(-50%)', opacity: 0 }}
      >
        <span className="font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#7a8291' }}>
          {t('hero.scroll')}
        </span>
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, #e8541a, transparent)',
          }}
        />
      </div>
    </section>
  );
}
