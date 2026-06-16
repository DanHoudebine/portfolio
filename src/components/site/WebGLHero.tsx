import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m*m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 a0=x-floor(x+.5);
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x =a0.x *x0.x  +h.x *x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

float fbm(vec2 st){
  float v=0.,a=.5;
  vec2 shift=vec2(100.);
  mat2 rot=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));
  for(int i=0;i<6;i++){v+=a*snoise(st);st=rot*st*2.02+shift;a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float ar=u_res.x/u_res.y;
  vec2 st=uv; st.x*=ar;

  float t=u_time*.032;

  /* mouse influence */
  vec2 m=u_mouse/u_res; m.x*=ar;
  float md=length(st-m);
  float mf=smoothstep(.7,0.,md)*.22;

  /* FBM domain warping */
  vec2 q=vec2(fbm(st+t),fbm(st+vec2(5.2,1.3)+t*.8));
  vec2 r=vec2(fbm(st+4.*q+vec2(1.7,9.2)+t*.55),
              fbm(st+4.*q+vec2(8.3,2.8)+t*.42));
  r+=mf;
  float f=fbm(st+r);

  /* colour ramp: navy → teal → cyan → ember spark */
  vec3 c0=vec3(.031,.051,.102);   /* #080d1a navy      */
  vec3 c1=vec3(.012,.09,.16);     /* deep teal         */
  vec3 c2=vec3(0.,.22,.35);      /* teal              */
  vec3 c3=vec3(0.,.898,1.);      /* #00e5ff cyan      */
  vec3 c4=vec3(1.,.478,.184);    /* #ff7a2f ember     */

  vec3 col=c0;
  col=mix(col,c1,clamp(f*1.8,0.,1.));
  col=mix(col,c2,clamp(f*f*3.,0.,1.));
  col=mix(col,c3,clamp(pow(max(f,.0),3.)*5.,0.,.35));
  col=mix(col,c4,clamp(pow(max(f,.0),5.)*14.,0.,.15));

  /* vignette */
  vec2 vg=(uv-.5)*2.;
  col*=1.-dot(vg,vg)*.45;

  gl_FragColor=vec4(col,1.);
}
`;

/**
 * Full-screen WebGL GLSL shader — animated FBM domain-warping plasma
 * in deep navy → cyan → ember palette. Falls back to CSS gradient.
 */
export default function WebGLHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    if (!gl) return;

    /* compile shader */
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* fullscreen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let W = 0, H = 0, mx = 0, my = 0, raf = 0, start = performance.now();

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      const pr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = W * pr;
      canvas.height = H * pr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = H - e.clientY; };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('mousemove', onMove, { passive: true });

    const render = () => {
      const t = (performance.now() - start) * 0.001;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx * (canvas.width / W), my * (canvas.height / H));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: 'block' }}
    />
  );
}
