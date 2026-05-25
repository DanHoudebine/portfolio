import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Persistent fixed-position WebGL scene that lives behind ALL sections.
 * The camera position is driven by the global scroll progress (0 → 1)
 * via the CSS variable `--scroll-progress` set by Home.tsx, so as the
 * visitor scrolls down they "fly through" the environment.
 *
 * Scene composition:
 *   • infinite shader-grid floor (Tron-style scroll)
 *   • horizon sun + glow band
 *   • drifting low-poly wireframe shapes
 *   • two particle layers (silver dust + blue glow)
 */
export default function SceneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 1.6, 12);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.022);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // ── Grid floor ───────────────────────────────────────────────────────────
    const gridGeo = new THREE.PlaneGeometry(220, 220, 1, 1);
    const gridMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x3b82f6) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorld;
        void main() {
          vUv = uv * 90.0;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vWorld;

        float gridLine(vec2 uv, float w) {
          vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
          return 1.0 - smoothstep(0.0, w, min(g.x, g.y));
        }

        void main() {
          vec2 uv = vec2(vUv.x, vUv.y + uTime * 0.35);
          float fine = gridLine(uv, 1.2) * 0.5;
          float bold = gridLine(uv / 10.0, 1.5) * 1.0;
          float grid = max(fine, bold);

          float dist = length(vWorld.xz);
          float distFade = smoothstep(110.0, 6.0, dist);
          float nearFade = smoothstep(0.0, 2.0, dist);
          float fade = distFade * nearFade;

          if (grid < 0.01 && fade < 0.01) discard;
          gl_FragColor = vec4(uColor * grid * fade, grid * fade);
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

    // ── Horizon sun ──────────────────────────────────────────────────────────
    const sunGeo = new THREE.CircleGeometry(8, 64);
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
          float core = 1.0 - smoothstep(0.0, 0.32, d);
          float halo = pow(1.0 - d, 2.8);
          float pulse = 0.85 + 0.15 * sin(uTime * 0.6);
          vec3 col = mix(vec3(0.376, 0.647, 0.980), vec3(0.114, 0.310, 0.918), d);
          gl_FragColor = vec4(col, (core * 0.9 + halo * 0.45) * pulse);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(0, -0.5, -55);
    scene.add(sun);

    // ── Horizon band ─────────────────────────────────────────────────────────
    const horizGeo = new THREE.PlaneGeometry(140, 1.5);
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
          float v = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 4.0);
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

    // ── Floating geometry ────────────────────────────────────────────────────
    type FloatingObj = {
      mesh: THREE.Mesh;
      rotSpeed: THREE.Vector3;
      floatPhase: number;
      baseY: number;
    };
    const floaters: FloatingObj[] = [];
    const accentColor = new THREE.Color(0x3b82f6);
    const wireMat = (op = 0.55) =>
      new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: op });

    const shapes: Array<{
      geo: THREE.BufferGeometry;
      pos: [number, number, number];
      scale: number;
      op: number;
    }> = [
      { geo: new THREE.IcosahedronGeometry(1.1, 0), pos: [-6, 1.5, -8],  scale: 1.0, op: 0.7 },
      { geo: new THREE.IcosahedronGeometry(0.7, 0), pos: [7, 2.2, -10],  scale: 0.9, op: 0.55 },
      { geo: new THREE.IcosahedronGeometry(0.5, 0), pos: [-9, 3.8, -16], scale: 0.7, op: 0.4 },
      { geo: new THREE.IcosahedronGeometry(0.4, 0), pos: [10, 4.2, -20], scale: 0.6, op: 0.35 },
      { geo: new THREE.IcosahedronGeometry(0.9, 0), pos: [0, 6.0, -28],  scale: 0.8, op: 0.3 },
      { geo: new THREE.BoxGeometry(1, 1, 1),        pos: [-4, -0.5, -6], scale: 0.8, op: 0.55 },
      { geo: new THREE.BoxGeometry(0.7, 0.7, 0.7),  pos: [5, 0.2, -7],   scale: 0.7, op: 0.45 },
      { geo: new THREE.OctahedronGeometry(0.8, 0),  pos: [-2, 4.5, -12], scale: 0.9, op: 0.5 },
      // Extra deep shapes for the scroll fly-through
      { geo: new THREE.IcosahedronGeometry(1.3, 0), pos: [-8, 2.0, -45], scale: 1.2, op: 0.45 },
      { geo: new THREE.BoxGeometry(1.2, 1.2, 1.2),  pos: [8, 1.5, -50],  scale: 1.0, op: 0.4 },
      { geo: new THREE.OctahedronGeometry(1.0, 0),  pos: [3, 5.0, -65],  scale: 1.0, op: 0.35 },
      { geo: new THREE.IcosahedronGeometry(0.8, 0), pos: [-12, 1.0, -75],scale: 1.0, op: 0.3 },
    ];

    shapes.forEach((s) => {
      const m = new THREE.Mesh(s.geo, wireMat(s.op));
      m.position.set(...s.pos);
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

    // ── Particle layers ──────────────────────────────────────────────────────
    const DUST = 3000;
    const dPos = new Float32Array(DUST * 3);
    const dSize = new Float32Array(DUST);
    const dAlpha = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dPos[i * 3]     = (Math.random() - 0.5) * 120;
      dPos[i * 3 + 1] = Math.random() * 60 - 10;
      dPos[i * 3 + 2] = -Math.random() * 120;
      dSize[i] = Math.random() * 0.3 + 0.1;
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
        varying float vA;
        void main() {
          vA = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 260.0 / -mv.z;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          gl_FragColor = vec4(0.78, 0.86, 0.99, (1.0 - d * d) * vA);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const GLOW = 200;
    const gPos = new Float32Array(GLOW * 3);
    const gSize = new Float32Array(GLOW);
    for (let i = 0; i < GLOW; i++) {
      gPos[i * 3]     = (Math.random() - 0.5) * 60;
      gPos[i * 3 + 1] = Math.random() * 30 - 5;
      gPos[i * 3 + 2] = -Math.random() * 60;
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
          gl_Position = projectionMatrix * mv;
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
    const glow = new THREE.Points(glowGeo, glowMat);
    scene.add(glow);

    // ── Animation loop ───────────────────────────────────────────────────────
    let animId = 0;
    const clock = new THREE.Clock();
    let elapsed = 0;

    // Read scroll progress 0→1 from CSS custom property on documentElement
    const getScrollProgress = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress').trim();
      return parseFloat(v) || 0;
    };

    let smoothScroll = 0; // smoothed scroll value

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      gridMat.uniforms.uTime.value  = elapsed;
      sunMat.uniforms.uTime.value   = elapsed;
      horizMat.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uTime.value  = elapsed;
      glowMat.uniforms.uTime.value  = elapsed;

      // Smooth scroll-driven camera fly-through
      const targetScroll = getScrollProgress();
      smoothScroll += (targetScroll - smoothScroll) * 0.06;

      // Mouse parallax target
      mouse.tx += (mouse.x - mouse.tx) * 0.04;
      mouse.ty += (mouse.y - mouse.ty) * 0.04;

      // As scroll advances, camera flies forward (z decreases), rises, and tilts down slightly
      const camZ = 12 - smoothScroll * 50;     // 12 → -38
      const camY = 1.6 + smoothScroll * 4;     // 1.6 → 5.6
      const camPitchTarget = 0.5 - smoothScroll * 3.0;
      camera.position.set(mouse.tx * 1.4, camY + mouse.ty * 0.5, camZ);
      camera.lookAt(0, camPitchTarget, camZ - 20);

      // Floating shapes
      floaters.forEach((f, i) => {
        f.mesh.rotation.x += f.rotSpeed.x * dt;
        f.mesh.rotation.y += f.rotSpeed.y * dt;
        f.mesh.rotation.z += f.rotSpeed.z * dt;
        f.mesh.position.y = f.baseY + Math.sin(elapsed * 0.4 + f.floatPhase) * 0.4;
        f.mesh.position.x += Math.sin(elapsed * 0.15 + i) * 0.001;
      });

      dust.rotation.y = elapsed * 0.01;
      glow.rotation.y = -elapsed * 0.008;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // ── Interaction ──────────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
