import { useEffect, useRef } from 'react';
import type * as THREENS from 'three';
import gsap from 'gsap';

interface DistortImageProps {
  src: string;
  alt: string;
  /** classes applied to the positioned wrapper */
  className?: string;
  style?: React.CSSProperties;
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uHover;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uPlane;
uniform vec2 uImage;
varying vec2 vUv;

// background-size: cover equivalent
vec2 cover(vec2 uv) {
  float planeR = uPlane.x / uPlane.y;
  float imageR = uImage.x / uImage.y;
  vec2 s = (planeR > imageR)
    ? vec2(1.0, imageR / planeR)
    : vec2(planeR / imageR, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = cover(vUv);
  vec2 m  = cover(uMouse);

  // slight zoom while hovered
  uv = (uv - 0.5) * (1.0 - 0.06 * uHover) + 0.5;

  // liquid wave
  uv.x += (sin(uv.y * 9.0 + uTime * 2.4) * 0.014
        +  sin(uv.y * 22.0 - uTime * 1.6) * 0.006) * uHover;
  uv.y += cos(uv.x * 11.0 + uTime * 1.8) * 0.008 * uHover;

  // bulge toward cursor
  vec2 toM = uv - m;
  float d = length(toM);
  uv -= (toM / max(d, 1e-4)) * exp(-d * 9.0) * 0.03 * uHover;

  // chromatic split
  float shift = 0.012 * uHover;
  float r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
  float g = texture2D(uMap, uv).g;
  float b = texture2D(uMap, uv - vec2(shift, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

/**
 * Image with WebGL liquid-distortion + chromatic-aberration hover.
 * Renders a plain <img> first; the canvas is lazily created when the
 * element nears the viewport. Falls back to the <img> alone on touch
 * devices, reduced motion, or when WebGL is unavailable.
 */
export default function DistortImage({ src, alt, className = '', style }: DistortImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let renderer: THREENS.WebGLRenderer | null = null;
    let texture: THREENS.Texture | null = null;
    let material: THREENS.ShaderMaterial | null = null;
    let geometry: THREENS.PlaneGeometry | null = null;
    let raf = 0;
    let disposed = false;
    let needsRender = false;
    const hover = { value: 0 };

    const cleanupFns: Array<() => void> = [];

    const init = async () => {
      if (disposed || renderer) return;

      // three.js loads on demand — keeps it out of the critical bundle
      const THREE = await import('three');
      if (disposed) return;

      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
      } catch {
        return; // WebGL unavailable — plain <img> stays
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      Object.assign(canvas.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0',
      } as CSSStyleDeclaration);
      wrap.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uMap: { value: null },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uPlane: { value: new THREE.Vector2(wrap.clientWidth, wrap.clientHeight) },
          uImage: { value: new THREE.Vector2(1, 1) },
        },
      });
      geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      new THREE.TextureLoader().load(src, (tex) => {
        if (disposed || !material || !renderer) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        texture = tex;
        material.uniforms.uMap.value = tex;
        material.uniforms.uImage.value.set(tex.image.width, tex.image.height);
        canvas.style.opacity = '1';
        needsRender = true;
      });

      const ro = new ResizeObserver(() => {
        if (!renderer || !material) return;
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
        material.uniforms.uPlane.value.set(wrap.clientWidth, wrap.clientHeight);
        needsRender = true;
      });
      ro.observe(wrap);
      cleanupFns.push(() => ro.disconnect());

      const onEnter = () => gsap.to(hover, { value: 1, duration: 0.7, ease: 'power2.out' });
      const onLeave = () => gsap.to(hover, { value: 0, duration: 0.9, ease: 'power3.out' });
      const onMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect();
        material?.uniforms.uMouse.value.set(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height,
        );
      };
      wrap.addEventListener('mouseenter', onEnter);
      wrap.addEventListener('mouseleave', onLeave);
      wrap.addEventListener('mousemove', onMove);
      cleanupFns.push(() => {
        wrap.removeEventListener('mouseenter', onEnter);
        wrap.removeEventListener('mouseleave', onLeave);
        wrap.removeEventListener('mousemove', onMove);
      });

      const tick = (t: number) => {
        raf = requestAnimationFrame(tick);
        if (!renderer || !material) return;
        // render only when the effect is live — idle frames cost nothing
        if (hover.value > 0.001 || needsRender) {
          material.uniforms.uHover.value = hover.value;
          material.uniforms.uTime.value = t / 1000;
          renderer.render(scene, camera);
          needsRender = false;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          init();
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(wrap);

    return () => {
      disposed = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      cleanupFns.forEach((fn) => fn());
      texture?.dispose();
      material?.dispose();
      geometry?.dispose();
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
      }
    };
  }, [src]);

  // NOTE: caller must size & position this wrapper (e.g. `absolute inset-0`)
  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
