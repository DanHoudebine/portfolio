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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#090909'));

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 10);

    const scene = new THREE.Scene();

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
          gl_FragColor = vec4(0.82, 0.84, 0.9, (1.0 - d * d) * vA);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ── Orange glow accents (mid-ground) ────────────────────────────────────
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
          float core = 1.0 - smoothstep(0.0, 0.25, d);
          float halo = pow(1.0 - d, 3.0) * (vS * 0.15);
          float a = halo + core * 0.12;
          gl_FragColor = vec4(0.91, 0.33, 0.10, a);
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
      color: new THREE.Color('#e8541a'),
      transparent: true,
      opacity: 0.12,
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
    tl.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut' });
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

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Radial vignette */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(9,9,9,0.65) 100%)',
        }}
      />

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
            background: '#e8541a',
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
            color: '#e8541a', marginBottom: '22px', opacity: 0,
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
            color: '#e8541a',
            opacity: 0,
            marginBottom: '36px',
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
            color: 'rgba(210, 210, 210, 0.6)',
            maxWidth: '400px', opacity: 0,
          }}
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
        <span
          className="font-mono uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(210,210,210,0.4)' }}
        >
          {t('hero.scroll')}
        </span>
        <div
          style={{
            width: '1px', height: '44px',
            background: 'linear-gradient(to bottom, #e8541a, transparent)',
          }}
        />
      </div>
    </section>
  );
}
