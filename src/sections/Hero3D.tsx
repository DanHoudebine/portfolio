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
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#04060d'));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 400);
    camera.position.set(0, 1.6, 12);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.028);

    // Mouse parallax target
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INFINITE GRID FLOOR (custom shader — animated scroll)
    // ─────────────────────────────────────────────────────────────────────────
    const gridSize = 200;
    const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, 1, 1);
    const gridMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x3b82f6) },
        uFogColor: { value: new THREE.Color(0x04060d) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorld;
        void main() {
          vUv = uv * 80.0;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uFogColor;
        varying vec2 vUv;
        varying vec3 vWorld;

        float gridLine(vec2 uv, float width) {
          vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
          float line = min(g.x, g.y);
          return 1.0 - smoothstep(0.0, width, line);
        }

        void main() {
          // Slowly scroll the grid forward (toward camera)
          vec2 uv = vec2(vUv.x, vUv.y + uTime * 0.35);

          // Two grid scales: fine and bold every 10 units
          float fine  = gridLine(uv, 1.2) * 0.5;
          float bold  = gridLine(uv / 10.0, 1.5) * 1.0;
          float grid  = max(fine, bold);

          // Distance from camera ground point — fade lines far away & very near
          float dist = length(vWorld.xz);
          float distFade = smoothstep(95.0, 8.0, dist);   // far fade
          float nearFade = smoothstep(0.0, 3.0, dist);    // near fade
          float fade = distFade * nearFade;

          if (grid < 0.01 && fade < 0.01) discard;

          vec3 col = uColor * grid * fade;
          float alpha = grid * fade;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -2.5;
    scene.add(grid);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. HORIZON SUN / GLOW DISK
    // ─────────────────────────────────────────────────────────────────────────
    const sunGeo = new THREE.CircleGeometry(7, 64);
    const sunMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          float d = length(p) * 2.0;
          if (d > 1.0) discard;
          // soft radial gradient — bright blue core, fading halo
          float core = 1.0 - smoothstep(0.0, 0.32, d);
          float halo = pow(1.0 - d, 2.8);
          float pulse = 0.85 + 0.15 * sin(uTime * 0.6);
          vec3 col = mix(vec3(0.376, 0.647, 0.980), vec3(0.114, 0.310, 0.918), d);
          float a = (core * 0.9 + halo * 0.45) * pulse;
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(0, -0.5, -55);
    scene.add(sun);

    // Wide horizontal horizon glow line
    const horizGeo = new THREE.PlaneGeometry(120, 1.5);
    const horizMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // bright thin line in vertical center, fading vertically
          float v = 1.0 - abs(vUv.y - 0.5) * 2.0;
          v = pow(v, 4.0);
          // soft horizontal falloff at edges
          float h = smoothstep(0.0, 0.15, vUv.x) * smoothstep(0.0, 0.15, 1.0 - vUv.x);
          gl_FragColor = vec4(0.376, 0.647, 0.980, v * h * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const horizon = new THREE.Mesh(horizGeo, horizMat);
    horizon.position.set(0, -2.4, -54.5);
    scene.add(horizon);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. FLOATING LOW-POLY GEOMETRY (icosahedrons + cubes drifting)
    // ─────────────────────────────────────────────────────────────────────────
    type FloatingObj = { mesh: THREE.Mesh; rotSpeed: THREE.Vector3; floatPhase: number; baseY: number };
    const floaters: FloatingObj[] = [];
    const accentColor = new THREE.Color(0x3b82f6);

    const wireMatFor = (opacity = 0.55) => new THREE.MeshBasicMaterial({
      color: accentColor, wireframe: true, transparent: true, opacity,
    });

    // 5 icosahedrons + 3 cubes, scattered at various depths
    const shapes: Array<{ geo: THREE.BufferGeometry; pos: [number,number,number]; scale: number; op: number }> = [
      { geo: new THREE.IcosahedronGeometry(1.1, 0), pos: [-6,  1.5, -8],  scale: 1.0, op: 0.7 },
      { geo: new THREE.IcosahedronGeometry(0.7, 0), pos: [ 7,  2.2, -10], scale: 0.9, op: 0.55 },
      { geo: new THREE.IcosahedronGeometry(0.5, 0), pos: [-9,  3.8, -16], scale: 0.7, op: 0.4 },
      { geo: new THREE.IcosahedronGeometry(0.4, 0), pos: [ 10, 4.2, -20], scale: 0.6, op: 0.35 },
      { geo: new THREE.IcosahedronGeometry(0.9, 0), pos: [ 0,  6.0, -28], scale: 0.8, op: 0.3 },
      { geo: new THREE.BoxGeometry(1, 1, 1),        pos: [-4, -0.5, -6],  scale: 0.8, op: 0.55 },
      { geo: new THREE.BoxGeometry(0.7, 0.7, 0.7),  pos: [ 5,  0.2, -7],  scale: 0.7, op: 0.45 },
      { geo: new THREE.OctahedronGeometry(0.8, 0),  pos: [-2,  4.5, -12], scale: 0.9, op: 0.5 },
    ];

    shapes.forEach((s) => {
      const m = new THREE.Mesh(s.geo, wireMatFor(s.op));
      m.position.set(s.pos[0], s.pos[1], s.pos[2]);
      m.scale.setScalar(s.scale);
      scene.add(m);
      floaters.push({
        mesh: m,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2,
        ),
        floatPhase: Math.random() * Math.PI * 2,
        baseY: s.pos[1],
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. STAR DUST + GLOW PARTICLES (background depth)
    // ─────────────────────────────────────────────────────────────────────────
    const DUST = 2500;
    const dPos = new Float32Array(DUST * 3);
    const dSize = new Float32Array(DUST);
    const dAlpha = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dPos[i * 3]     = (Math.random() - 0.5) * 90;
      dPos[i * 3 + 1] = Math.random() * 50 - 5;
      dPos[i * 3 + 2] = -Math.random() * 80 - 5;
      dSize[i]  = Math.random() * 0.3 + 0.1;
      dAlpha[i] = Math.random() * 0.5 + 0.1;
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
        uniform float uTime;
        varying float vA;
        void main() {
          vA = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 260.0 / -mv.z;
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float fall = 1.0 - d * d;
          gl_FragColor = vec4(0.78, 0.86, 0.99, fall * vA);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Blue glow accents (closer, fewer)
    const GLOW = 180;
    const gPos  = new Float32Array(GLOW * 3);
    const gSize = new Float32Array(GLOW);
    for (let i = 0; i < GLOW; i++) {
      gPos[i * 3]     = (Math.random() - 0.5) * 40;
      gPos[i * 3 + 1] = Math.random() * 20 - 2;
      gPos[i * 3 + 2] = -Math.random() * 30 - 4;
      gSize[i] = Math.random() * 2.5 + 0.8;
    }
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    glowGeo.setAttribute('aSize',    new THREE.BufferAttribute(gSize, 1));
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        varying float vS;
        void main() {
          vS = aSize;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 220.0 / -mv.z;
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vS;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv) * 2.0;
          if (d > 1.0) discard;
          float core = 1.0 - smoothstep(0.0, 0.35, d);
          float halo = pow(1.0 - d, 3.5) * (vS * 0.20);
          gl_FragColor = vec4(0.376, 0.647, 0.980, halo + core * 0.18);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowPoints = new THREE.Points(glowGeo, glowMat);
    scene.add(glowPoints);

    // ─────────────────────────────────────────────────────────────────────────
    // Render loop
    // ─────────────────────────────────────────────────────────────────────────
    let animId = 0;
    const clock = new THREE.Clock();
    let elapsed = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      elapsed += dt;

      gridMat.uniforms.uTime.value = elapsed;
      sunMat.uniforms.uTime.value = elapsed;
      horizMat.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uTime.value = elapsed;
      glowMat.uniforms.uTime.value = elapsed;

      // Floating shapes — drift + rotate
      floaters.forEach((f, i) => {
        f.mesh.rotation.x += f.rotSpeed.x * dt;
        f.mesh.rotation.y += f.rotSpeed.y * dt;
        f.mesh.rotation.z += f.rotSpeed.z * dt;
        f.mesh.position.y = f.baseY + Math.sin(elapsed * 0.4 + f.floatPhase) * 0.4;
        // Subtle parallax drift
        f.mesh.position.x += Math.sin(elapsed * 0.15 + i) * 0.001;
      });

      // Particle systems slow rotation
      dust.rotation.y = elapsed * 0.012;
      glowPoints.rotation.y = -elapsed * 0.008;

      // Smooth parallax — camera follows mouse with damping
      mouse.tx += (mouse.x - mouse.tx) * 0.04;
      mouse.ty += (mouse.y - mouse.ty) * 0.04;
      camera.position.x = mouse.tx * 1.6;
      camera.position.y = 1.6 + mouse.ty * 0.6;
      camera.lookAt(0, 0.5, -20);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // ─────────────────────────────────────────────────────────────────────────
    // Interaction handlers
    // ─────────────────────────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / W - 0.5) * 2;
      mouse.y = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    // ─────────────────────────────────────────────────────────────────────────
    // Entrance timeline
    // ─────────────────────────────────────────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(cornersRef.current?.children || [],
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
    tl.fromTo(statusRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');
    tl.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, '-=0.4');
    tl.fromTo(tagRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, '-=0.35');
    tl.fromTo(name1Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.95, ease: 'power3.out' }, '-=0.2');
    tl.fromTo(name2Ref.current,
      { opacity: 0, y: 70, skewX: -6 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.95, ease: 'power3.out' }, '-=0.7');
    tl.fromTo(descRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3');
    tl.fromTo(metaRef.current?.children || [],
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08 }, '-=0.4');
    tl.fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6 }, '-=0.1');

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      gridGeo.dispose();  gridMat.dispose();
      sunGeo.dispose();   sunMat.dispose();
      horizGeo.dispose(); horizMat.dispose();
      dustGeo.dispose();  dustMat.dispose();
      glowGeo.dispose();  glowMat.dispose();
      floaters.forEach((f) => {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '26px',
    height: '26px',
    opacity: 0,
  };

  return (
    <section className="hero-section relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Top atmospheric gradient — darkens top for header readability */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(4,6,13,0.85) 0%, transparent 100%)',
        }}
      />
      {/* Bottom darkening for text contrast */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(4,6,13,0.6) 0%, transparent 100%)',
        }}
      />
      {/* Radial vignette */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(4,6,13,0.55) 100%)',
        }}
      />

      {/* Corner brackets */}
      <div ref={cornersRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <div style={{ ...cornerStyle, top: '32px', left: '32px',
          borderTop: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, top: '32px', right: '32px',
          borderTop: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, bottom: '32px', left: '32px',
          borderBottom: '1px solid #3b82f6', borderLeft: '1px solid #3b82f6' }} />
        <div style={{ ...cornerStyle, bottom: '32px', right: '32px',
          borderBottom: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }} />
      </div>

      {/* Status badge — bottom-left */}
      <div
        ref={statusRef}
        className="absolute font-mono uppercase z-10 hidden md:flex items-center gap-2"
        style={{
          bottom: '70px', left: '60px',
          fontSize: '10px', letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.7)',
          opacity: 0,
        }}
      >
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#3b82f6',
          boxShadow: '0 0 10px #3b82f6, 0 0 20px rgba(59,130,246,0.6)',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        <span>AVAILABLE FOR WORK</span>
        <span style={{ color: '#3b82f6', margin: '0 6px' }}>·</span>
        <span>PARIS · FR</span>
      </div>

      {/* Coords / readout — bottom-right */}
      <div
        className="absolute font-mono uppercase z-10 hidden md:block"
        style={{
          bottom: '70px', right: '60px',
          fontSize: '10px', letterSpacing: '0.25em',
          color: 'rgba(180,200,230,0.5)',
        }}
      >
        <div>LAT 48.8566° N</div>
        <div style={{ marginTop: '4px' }}>LON 2.3522° E</div>
      </div>

      {/* Left edge — vertical label */}
      <div
        className="absolute font-mono uppercase z-10 hidden md:block"
        style={{
          left: '32px', top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'left center',
          fontSize: '10px', letterSpacing: '0.4em',
          color: 'rgba(180,200,230,0.4)',
        }}
      >
        PORTFOLIO · 2026
      </div>

      {/* Right edge — vertical label */}
      <div
        className="absolute font-mono uppercase z-10 hidden md:block"
        style={{
          right: '32px', top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'right center',
          fontSize: '10px', letterSpacing: '0.4em',
          color: 'rgba(180,200,230,0.4)',
        }}
      >
        REEL · ENVIRONMENT
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
            width: '64px', height: '1px',
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            marginBottom: '22px',
            transformOrigin: 'center',
            transform: 'scaleX(0)',
          }}
        />

        {/* Tag */}
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

        {/* Name line 1 */}
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
            textShadow: '0 0 90px rgba(59,130,246,0.55), 0 0 30px rgba(96,165,250,0.4)',
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
            color: 'rgba(210, 220, 240, 0.75)',
            maxWidth: '460px', opacity: 0,
            marginBottom: '36px',
          }}
        >
          {t('hero.descriptions.0')}
        </p>

        {/* Meta row */}
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
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes scroll-line {
          0%, 100% { transform: scaleY(1); opacity: 0.6; transform-origin: top; }
          50%      { transform: scaleY(0.6); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
