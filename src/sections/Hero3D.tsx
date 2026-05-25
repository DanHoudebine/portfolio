import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

export default function Hero3D() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const name1Ref = useRef<HTMLDivElement>(null);
  const name2Ref = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#06080f'));

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 10);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080f, 0.025);

    // ── Fine silver dust (deep background) ──────────────────────────────────
    const DUST = 3000;
    const dPos = new Float32Array(DUST * 3);
    const dSize = new Float32Array(DUST);
    const dAlpha = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dPos[i * 3]     = (Math.random() - 0.5) * 60;
      dPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      dPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
      dSize[i]  = Math.random() * 0.25 + 0.08;
      dAlpha[i] = Math.random() * 0.35 + 0.05;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dustGeo.setAttribute('aSize',    new THREE.BufferAttribute(dSize, 1));
    dustGeo.setAttribute('aAlpha',   new THREE.BufferAttribute(dAlpha, 1));

    const dustMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        varying float vA;
        void main() {
          vA = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 220.0 / -mv.z;
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          // soft round, slight bluish-white tint
          gl_FragColor = vec4(0.78, 0.85, 0.98, (1.0 - d * d) * vA);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ── Blue glow accents (mid-ground) ──────────────────────────────────────
    const GLOW = 260;
    const gPos  = new Float32Array(GLOW * 3);
    const gSize = new Float32Array(GLOW);
    for (let i = 0; i < GLOW; i++) {
      gPos[i * 3]     = (Math.random() - 0.5) * 36;
      gPos[i * 3 + 1] = (Math.random() - 0.5) * 36;
      gPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      gSize[i] = Math.random() * 2.2 + 0.6;
    }
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    glowGeo.setAttribute('aSize',    new THREE.BufferAttribute(gSize, 1));

    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vS;
        void main() {
          vS = aSize;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 200.0 / -mv.z;
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vS;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv) * 2.0;
          if (d > 1.0) discard;
          // perfectly round, smooth halo — no hard edges
          float core = 1.0 - smoothstep(0.0, 0.35, d);
          float halo = pow(1.0 - d, 3.5) * (vS * 0.18);
          float a = (halo + core * 0.18);
          // soft cyan-blue glow rgb(96,165,250) ≈ vec3(0.376, 0.647, 0.980)
          gl_FragColor = vec4(0.376, 0.647, 0.980, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowPoints = new THREE.Points(glowGeo, glowMat);
    scene.add(glowPoints);

    // ── Thin horizontal accent line ──────────────────────────────────────────
    const lineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#3b82f6'),
      transparent: true,
      opacity: 0.14,
    });
    const lineMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.003), lineMat);
    lineMesh.position.set(0, -0.8, 0);
    scene.add(lineMesh);

    // ── Render loop ──────────────────────────────────────────────────────────
    let animId = 0;
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const t = time * 0.001;
      dustMat.uniforms.uTime.value = t;
      glowMat.uniforms.uTime.value = t;

      dust.rotation.y =  t * 0.018;
      dust.rotation.x =  t * 0.007;
      glowPoints.rotation.y = -t * 0.012;
      glowPoints.rotation.x =  t * 0.005;

      camera.position.x = Math.sin(t * 0.11) * 0.35;
      camera.position.y = Math.cos(t * 0.07) * 0.18;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Entrance timeline ────────────────────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.25 });
    tl.fromTo(cornersRef.current?.children || [],
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 });
    tl.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, '-=0.5');
    tl.fromTo(tagRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, '-=0.35');
    tl.fromTo(name1Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out' }, '-=0.25');
    tl.fromTo(name2Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out' }, '-=0.65');
    tl.fromTo(descRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.25');
    tl.fromTo(metaRef.current?.children || [],
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08 }, '-=0.4');
    tl.fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6 }, '-=0.1');

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dustMat.dispose(); dustGeo.dispose();
      glowMat.dispose(); glowGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '22px',
    height: '22px',
    borderColor: '#3b82f6',
    opacity: 0,
  };

  return (
    <section className="hero-section relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Radial vignette */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(6,8,15,0.7) 100%)',
        }}
      />

      {/* Corner brackets — give the hero a "framed shot" feel */}
      <div ref={cornersRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <div style={{ ...cornerStyle, top: '36px', left: '36px',
          borderTop: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, top: '36px', right: '36px',
          borderTop: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, bottom: '36px', left: '36px',
          borderBottom: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, bottom: '36px', right: '36px',
          borderBottom: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
      </div>

      {/* Center text overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
        style={{ pointerEvents: 'none' }}
      >
        {/* Accent line */}
        <div
          ref={lineRef}
          style={{
            width: '56px', height: '1px',
            background: '#3b82f6',
            marginBottom: '22px',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />

        {/* Tag */}
        <div
          ref={tagRef}
          className="font-mono uppercase"
          style={{
            fontSize: '11px', letterSpacing: '0.3em',
            color: '#3b82f6', marginBottom: '22px', opacity: 0,
          }}
        >
          3D Environment Artist · Paris, France
        </div>

        {/* Name line 1 */}
        <div
          ref={name1Ref}
          className="font-heading font-bold text-white text-center"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            opacity: 0,
            textShadow: '0 0 60px rgba(59,130,246,0.18)',
          }}
        >
          DAN
        </div>

        {/* Name line 2 */}
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
            textShadow: '0 0 80px rgba(59,130,246,0.35)',
          }}
        >
          HOUDEBINE
        </div>

        {/* Description */}
        <p
          ref={descRef}
          className="font-body text-center"
          style={{
            fontSize: '15px', lineHeight: 1.75,
            color: 'rgba(210, 220, 240, 0.7)',
            maxWidth: '440px', opacity: 0,
            marginBottom: '36px',
          }}
        >
          {t('hero.descriptions.0')}
        </p>

        {/* Meta row — gives the hero structural weight */}
        <div
          ref={metaRef}
          className="font-mono flex items-center gap-6"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(180,200,230,0.55)' }}
        >
          <span style={{ opacity: 0 }}>EST. 2018</span>
          <span style={{ opacity: 0, color: '#3b82f6' }}>•</span>
          <span style={{ opacity: 0 }}>UE5 / BLENDER</span>
          <span style={{ opacity: 0, color: '#3b82f6' }}>•</span>
          <span style={{ opacity: 0 }}>OPEN TO WORK</span>
        </div>
      </div>

      {/* Left edge — vertical label */}
      <div
        className="absolute font-mono uppercase z-10 hidden md:block"
        style={{
          left: '36px',
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'left center',
          fontSize: '10px',
          letterSpacing: '0.4em',
          color: 'rgba(180,200,230,0.4)',
        }}
      >
        PORTFOLIO · 2026
      </div>

      {/* Right edge — vertical label */}
      <div
        className="absolute font-mono uppercase z-10 hidden md:block"
        style={{
          right: '36px',
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'right center',
          fontSize: '10px',
          letterSpacing: '0.4em',
          color: 'rgba(180,200,230,0.4)',
        }}
      >
        REEL · ENVIRONMENT
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-10 flex flex-col items-center gap-3"
        style={{ transform: 'translateX(-50%)', opacity: 0 }}
      >
        <span
          className="font-mono uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(180,200,230,0.5)' }}
        >
          {t('hero.scroll')}
        </span>
        <div
          style={{
            width: '1px', height: '44px',
            background: 'linear-gradient(to bottom, #3b82f6, transparent)',
          }}
        />
      </div>
    </section>
  );
}
