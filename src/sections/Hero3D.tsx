import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

// ─── Camera Path Positions ───
const cameraPositions = new Float32Array([
  // Phase 0: Title (0-5%)
  0, 0, 4,
  0, 0, 4,
  0, 0, 4,
  // Phase 1: Fly Through (5-20%)
  0, 0, 3.5,
  0, 0.2, 3.0,
  0, 0.3, 2.5,
  0, 0.4, 2.2,
  0, 0.5, 2.0,
  // Phase 2: Lateral Gallery (20-45%)
  -2.5, 0.3, 2.0,
  -1.5, -0.2, 2.2,
  -0.5, 0.5, 2.0,
  0.5, -0.3, 2.2,
  1.5, 0.4, 2.0,
  2.5, 0, 2.2,
  // Phase 3: Dust Cloud (45-65%)
  1.5, 0.5, 3.0,
  0.5, -0.3, 3.5,
  -0.5, 0.4, 4.0,
  -1.0, -0.2, 4.2,
  -0.5, 0.3, 4.0,
  // Phase 4: Starburst (65-85%)
  0, 0, 4.0,
  2.0, 1.0, 3.5,
  2.5, 0.5, 3.0,
  2.0, -0.5, 3.5,
  0, 0, 4.0,
  // Phase 5: Color Sweep (85-95%)
  0, 0, 3.5,
  0, 0, 3.0,
  0, 0, 2.5,
  // Phase 6: Final Push (95-100%)
  0, 0, 2.0,
  0, 0, 1.0,
  0, 0, 0.5,
]);

function getCameraPosition(progress: number): THREE.Vector3 {
  const length = cameraPositions.length / 3;
  const index = Math.floor(progress * (length - 1));
  const nextIndex = Math.min(index + 1, length - 1);
  const localProgress = progress * (length - 1) - index;
  const result = new THREE.Vector3();
  result.x = cameraPositions[index * 3] + (cameraPositions[nextIndex * 3] - cameraPositions[index * 3]) * localProgress;
  result.y = cameraPositions[index * 3 + 1] + (cameraPositions[nextIndex * 3 + 1] - cameraPositions[index * 3 + 1]) * localProgress;
  result.z = cameraPositions[index * 3 + 2] + (cameraPositions[nextIndex * 3 + 2] - cameraPositions[index * 3 + 2]) * localProgress;
  return result;
}

// ─── Dust Particle Sprite (procedural) ───
function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

export default function Hero3D() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    uniforms: Record<string, { value: unknown }>;
    particles: THREE.Points;
    titleGroup: THREE.Group;
    cubesGroup: THREE.Group;
    starGroup: THREE.Group;
    grid: THREE.GridHelper;
    animId: number;
  } | null>(null);

  const updateHUD = useCallback((progress: number) => {
    const labels = t('hero.labels', { returnObjects: true }) as string[];
    const descriptions = t('hero.descriptions', { returnObjects: true }) as string[];

    let phaseIndex = 0;
    if (progress < 0.05) phaseIndex = 0;
    else if (progress < 0.20) phaseIndex = 1;
    else if (progress < 0.45) phaseIndex = 2;
    else if (progress < 0.65) phaseIndex = 3;
    else if (progress < 0.85) phaseIndex = 4;
    else phaseIndex = 5;

    if (phaseLabelRef.current && labels[phaseIndex]) {
      phaseLabelRef.current.textContent = labels[phaseIndex];
    }
    if (bottomTextRef.current && descriptions[phaseIndex]) {
      bottomTextRef.current.textContent = descriptions[phaseIndex];
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`;
    }
  }, [t]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // ─── Scene Setup ───
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#060d1a'));

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.set(0, 0, 4);

    const scene = new THREE.Scene();

    const uniforms = {
      time: { value: 0 },
      progress: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    // ─── Title 3D Text (using box geometry blocks to form "DAN") ───
    const titleGroup = new THREE.Group();
    const letterColors = ['#c96f2e', '#e08840', '#c96f2e'];
    const letters = 'DAN';
    const letterSpacing = 0.45;
    const startX = -((letters.length - 1) * letterSpacing) / 2;

    for (let i = 0; i < letters.length; i++) {
      const geo = new THREE.BoxGeometry(0.25, 0.35, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(letterColors[i]),
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(startX + i * letterSpacing, 0, 0);
      mesh.userData = {
        originalX: startX + i * letterSpacing,
        letterIndex: i,
        splitDirection: i < letters.length / 2 ? 1 : -1,
      };
      titleGroup.add(mesh);
    }
    titleGroup.position.set(0, 0, -1);
    scene.add(titleGroup);

    // ─── Wireframe Grid ───
    const grid = new THREE.GridHelper(20, 40, new THREE.Color('#c96f2e'), new THREE.Color('#111d32'));
    grid.position.y = -1.5;
    grid.material = new THREE.LineBasicMaterial({
      color: new THREE.Color('#c96f2e'),
      transparent: true,
      opacity: 0.15,
    });
    scene.add(grid);

    // ─── Portfolio Cubes ───
    const cubesGroup = new THREE.Group();
    const projectImages = [
      '/work-ruins.jpg',
      '/work-cyberpunk.jpg',
      '/work-nordic.jpg',
      '/work-desert.jpg',
      '/work-underwater.jpg',
      '/work-spacestation.jpg',
      '/work-forest.jpg',
      '/work-industrial.jpg',
    ];

    const textureLoader = new THREE.TextureLoader();
    projectImages.forEach((img, i) => {
      const tex = textureLoader.load(img);
      const geo = new THREE.BoxGeometry(0.6, 0.4, 0.05);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / projectImages.length) * Math.PI * 2;
      const radius = 2.5;
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1.5, Math.sin(angle) * radius - 2);
      mesh.userData = {
        originalPos: mesh.position.clone(),
        angle,
        radius,
      };
      cubesGroup.add(mesh);
    });
    scene.add(cubesGroup);

    // ─── Starburst ───
    const starGroup = new THREE.Group();
    const starShape = new THREE.Shape();
    const outerR = 0.8;
    const innerR = 0.35;
    const points = 12;
    const step = Math.PI / points;
    starShape.moveTo(0, outerR);
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = step * i + Math.PI / 2;
      starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.05, bevelEnabled: false });
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E8B830'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.userData = { material: starMat };
    starGroup.add(starMesh);

    // Ring
    const ringGeo = new THREE.RingGeometry(1.0, 1.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#c96f2e'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.userData = { material: ringMat };
    starGroup.add(ringMesh);

    // Center circle
    const circleGeo = new THREE.CircleGeometry(0.15, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#c96f2e'),
      transparent: true,
      opacity: 0,
    });
    const circleMesh = new THREE.Mesh(circleGeo, circleMat);
    circleMesh.position.z = 0.03;
    circleMesh.userData = { material: circleMat };
    starGroup.add(circleMesh);

    starGroup.position.set(0, 0, -3);
    scene.add(starGroup);

    // ─── Dust Particles ───
    const PARTICLE_COUNT = window.innerWidth < 768 ? 250 : 500;
    const particleTexture = createParticleTexture();
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      opacities[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 0.5 + 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const particleUniforms = {
      map: { value: particleTexture },
      size: { value: 8.0 },
      time: { value: 0 },
      opacity: { value: 0.6 },
      pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    const particleVertexShader = `
      uniform float size;
      uniform float pixelRatio;
      attribute float aSize;
      varying float vOpacity;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * aSize;
        gl_PointSize *= (80.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vOpacity = aSize;
      }
    `;

    const particleFragmentShader = `
      uniform sampler2D map;
      uniform float time;
      uniform float opacity;
      varying float vOpacity;
      void main() {
        vec4 color = texture2D(map, gl_PointCoord);
        float blink = sin(time * vOpacity * 2.0) * 0.5 + 0.5;
        color.a *= opacity * mix(0.1, 1.0, blink);
        color.rgb = vec3(0.788, 0.435, 0.180);
        if (color.a < 0.01) discard;
        gl_FragColor = color;
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // ─── GSAP Master Timeline ───
    const masterTimeline = gsap.timeline({ paused: true });

    // Phase 1: Title curtain opening (0-5%)
    masterTimeline.to(titleGroup.position, { z: -1, duration: 5 }, 0);
    masterTimeline.to(grid.material, { opacity: 0, duration: 3 }, 0);

    // Phase 2: Title fly-through (5-20%)
    titleGroup.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const dir = mesh.userData.splitDirection;
      const speed = 1 + Math.random() * 4;
      masterTimeline.to(mesh.position, {
        x: mesh.userData.originalX + dir * speed,
        duration: 15,
        ease: 'power2.in',
      }, 5);
    });
    masterTimeline.to(titleGroup.children.map((c) => (c as THREE.Mesh).material), {
      opacity: 0,
      duration: 10,
    }, 10);

    // Phase 3: Lateral gallery - cubes rotate to face camera (20-45%)
    cubesGroup.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      masterTimeline.to(mesh.rotation, {
        y: Math.PI * 2,
        duration: 25,
        ease: 'none',
      }, 20 + i * 1);
    });

    // Phase 4: Dust cloud (45-65%)
    masterTimeline.to(particleMaterial.uniforms.opacity, { value: 0.9, duration: 20 }, 45);

    // Phase 5: Starburst (65-85%)
    masterTimeline.to(starMesh.userData.material, { opacity: 0.9, duration: 10 }, 65);
    masterTimeline.to(ringMesh.userData.material, { opacity: 0.6, duration: 10 }, 68);
    masterTimeline.to(circleMesh.userData.material, { opacity: 1, duration: 10 }, 70);
    masterTimeline.to(starGroup.rotation, { z: Math.PI * 2, duration: 20 }, 65);

    // Phase 6: Color sweep (85-95%)
    masterTimeline.to(starMesh.userData.material, { opacity: 0, duration: 5 }, 85);
    masterTimeline.to(ringMesh.userData.material, { opacity: 0, duration: 5 }, 85);
    masterTimeline.to(circleMesh.userData.material, { opacity: 0, duration: 5 }, 85);
    masterTimeline.to(particleMaterial.uniforms.opacity, { value: 0.3, duration: 10 }, 85);

    // Phase 7: Final push (95-100%)
    masterTimeline.to({}, { duration: 5 }, 95);

    // ─── ScrollTrigger ───
    const st = ScrollTrigger.create({
      trigger: container,
      pin: true,
      start: 'top top',
      end: '+=800%',
      scrub: 1,
      onUpdate: (self) => {
        masterTimeline.progress(self.progress);
        updateHUD(self.progress);
      },
    });

    // ─── Render Loop ───
    let animId = 0;
    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const t_sec = time * 0.001;

      uniforms.time.value = t_sec * 0.1;
      uniforms.progress.value = masterTimeline.progress();
      particleUniforms.time.value = t_sec;

      // Rotate particles slowly
      particles.rotation.y += 0.0003;

      // Animate cubes floating
      cubesGroup.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.position.y = mesh.userData.originalPos.y + Math.sin(t_sec * 0.5 + i) * 0.1;
      });

      // Camera position from path
      const progress = uniforms.progress.value as number;
      camera.position.copy(getCameraPosition(progress));
      camera.lookAt(0, 0, 0);

      // Add slight camera sway
      camera.position.y += Math.sin(t_sec * 0.3) * 0.05;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(render);

    // ─── Store refs ───
    sceneRef.current = {
      renderer,
      scene,
      camera,
      uniforms,
      particles,
      titleGroup,
      cubesGroup,
      starGroup,
      grid,
      animId,
    };

    // ─── Resize ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      particleUniforms.pixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      st.kill();
      masterTimeline.kill();
      renderer.dispose();
    };
  }, [updateHUD]);

  return (
    <section
      ref={containerRef}
      className="hero-section relative w-full"
      style={{ height: '100vh' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* HUD Overlay */}
      <div
        className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-[4vw] pt-8 pointer-events-none"
        style={{ paddingTop: '100px' }}
      >
        {/* Phase Label */}
        <span
          ref={phaseLabelRef}
          className="font-mono text-white uppercase tracking-[0.08em]"
          style={{ fontSize: '13px' }}
        >
          INTRO
        </span>

        {/* Progress Bar */}
        <div
          className="mx-4 flex-1 max-w-[120px] mt-2"
          style={{
            height: '2px',
            background: 'rgba(255,255,255,0.2)',
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: '100%',
              width: '0%',
              background: '#ffffff',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Scroll indicator */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-white uppercase" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>
            {t('hero.scroll')}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#ffffff" strokeWidth="1.5">
            <path d="M6 2v8M3 7l3 3 3-3" />
          </svg>
        </div>
      </div>

      {/* Bottom Text */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{ bottom: '80px', left: '4vw', maxWidth: '400px' }}
      >
        <p
          ref={bottomTextRef}
          className="font-body"
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#8fa3bb',
            transition: 'opacity 0.3s ease',
          }}
        >
          {t('hero.descriptions.0')}
        </p>
      </div>

      {/* Bottom Logo */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{ bottom: '80px', right: '4vw' }}
      >
        <span
          className="font-heading font-bold text-white uppercase"
          style={{ fontSize: '12px', letterSpacing: '0.2em', opacity: 0.5 }}
        >
          DAN HOUDEBINE
        </span>
      </div>

      {/* Footer Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex justify-between items-center px-[4vw] py-4"
        style={{
          backdropFilter: 'blur(4px)',
          background: 'rgba(6, 13, 26, 0.3)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          2026 DAN HOUDEBINE
        </span>
        <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          PARIS, FRANCE
        </span>
        <span className="font-mono hidden sm:inline" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          ENVIRONMENTS & WORLDS
        </span>
      </div>
    </section>
  );
}
