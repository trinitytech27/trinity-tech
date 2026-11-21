import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Living star background (single WebGL canvas behind every page).
 *
 * - A field of twinkling stars whose colours slowly drift.
 * - Part of the stars form a shape that changes per page (galaxy, helix,
 *   orbit sphere, trinity rings, wave, torus). On navigation they travel
 *   to the new shape, so the background is different on every page.
 * - Scroll turns and lifts the formation; the pointer tilts it slightly.
 * - "tt:warp" events (page transitions) rush the stars toward the camera.
 *
 * Cost control: one draw call, all motion in the vertex shader, DPR capped,
 * fewer stars on phones, paused while the tab is hidden, a single still
 * frame for reduced-motion visitors.
 */

type Shape = "galaxy" | "helix" | "orbit" | "trinity" | "wave" | "torus";

export const ROUTE_SHAPES: Record<string, Shape> = {
  "/": "galaxy",
  "/work": "helix",
  "/services": "orbit",
  "/about": "trinity",
  "/project": "wave",
  "/contact": "torus",
};

export const shapeFor = (path: string): Shape => {
  if (path.startsWith("/work/")) return "helix";
  return ROUTE_SHAPES[path] ?? "galaxy";
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Fill `out` (xyz per star) with the formation for the shaped stars. */
function buildShape(shape: Shape, out: Float32Array, from: number, count: number) {
  const set = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  };
  for (let k = 0; k < count; k++) {
    const i = from + k;
    const t = k / count;
    switch (shape) {
      case "galaxy": {
        const arm = k % 3;
        const r = Math.pow(Math.random(), 0.55) * 34 + 1.5;
        const a = r * 0.28 + (arm * Math.PI * 2) / 3 + gauss() * 0.22;
        const h = gauss() * 1.6 * (1 - r / 40);
        set(i, Math.cos(a) * r, h, Math.sin(a) * r);
        break;
      }
      case "helix": {
        const along = (t - 0.5) * 96;
        const strand = k % 5 === 0 ? 2 : k % 2; // 2 = rung
        const a = along * 0.16;
        if (strand === 2) {
          const s = rand(-1, 1);
          set(i, along, Math.cos(a) * 9 * s, Math.sin(a) * 9 * s);
        } else {
          const off = strand * Math.PI;
          set(
            i,
            along + gauss() * 0.4,
            Math.cos(a + off) * 9 + gauss() * 0.7,
            Math.sin(a + off) * 9 + gauss() * 0.7,
          );
        }
        break;
      }
      case "orbit": {
        if (k % 3 === 0) {
          // two tilted orbit rings
          const ring = k % 2;
          const a = Math.random() * Math.PI * 2;
          const R = ring ? 30 : 36;
          const x = Math.cos(a) * R;
          const z = Math.sin(a) * R;
          const tilt = ring ? 0.5 : -0.35;
          set(i, x, z * Math.sin(tilt) + gauss() * 0.4, z * Math.cos(tilt));
        } else {
          // fibonacci sphere
          const n = count;
          const y = 1 - (k / (n - 1)) * 2;
          const rad = Math.sqrt(1 - y * y);
          const phi = k * 2.399963;
          const R = 18 + gauss() * 0.5;
          set(i, Math.cos(phi) * rad * R, y * R, Math.sin(phi) * rad * R);
        }
        break;
      }
      case "trinity": {
        // three interlocking rings — the Trinity mark in stars
        const ring = k % 3;
        const ca = (ring * Math.PI * 2) / 3 - Math.PI / 2;
        const cx = Math.cos(ca) * 10;
        const cy = Math.sin(ca) * 10;
        const a = Math.random() * Math.PI * 2;
        const R = 15 + gauss() * 0.45;
        set(i, cx + Math.cos(a) * R, cy + Math.sin(a) * R, gauss() * 1.4 + Math.sin(a * 2 + ring) * 2);
        break;
      }
      case "wave": {
        const gx = (Math.random() - 0.5) * 110;
        const gz = (Math.random() - 0.5) * 70;
        const y = Math.sin(gx * 0.12) * 4 + Math.cos(gz * 0.16) * 3 - 6;
        set(i, gx, y, gz);
        break;
      }
      case "torus": {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 22;
        const r = 6 + gauss() * 0.35;
        set(i, (R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
        break;
      }
    }
  }
}

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uMorph;
  uniform float uWarp;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // each star leaves at its own moment so the morph feels organic
    float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - aSeed * 0.7, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, m);
    // a soft arc while travelling
    p.y += sin(m * 3.14159) * (aSeed - 0.5) * 14.0;
    // gentle drift
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * 0.35;
    p.y += cos(uTime * 0.17 + aSeed * 30.0) * 0.35;
    // warp: rush toward the camera during page transitions
    p.z += uWarp * (20.0 + aSeed * 60.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 2.4) + aSeed * 90.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + uWarp * 1.5) * (260.0 / -mv.z);
    vAlpha = twinkle;
    // colours slowly shift over time
    float shift = 0.5 + 0.5 * sin(uTime * 0.12 + aSeed * 6.2831);
    vColor = mix(aColor, aColor.zxy, shift * 0.35);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const PALETTE = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#c7d2fe"),
  new THREE.Color("#818cf8"),
  new THREE.Color("#67e8f9"),
  new THREE.Color("#a5b4fc"),
];

export default function Starfield({ route }: { route: string }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ morphTo: (s: Shape) => void } | null>(null);
  const routeRef = useRef(route);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;
    const lowCore = (navigator.hardwareConcurrency || 8) <= 4;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: CSS star fallback stays
    }
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 0, 64);

    const AMBIENT = small || lowCore ? 1400 : 2600;
    const SHAPED = small || lowCore ? 2600 : 6000;
    const N = AMBIENT + SHAPED;

    const from = new Float32Array(N * 3);
    const to = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const size = new Float32Array(N);
    const color = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      seed[i] = Math.random();
      const shaped = i >= AMBIENT;
      size[i] = shaped ? rand(0.9, 2.1) : rand(0.6, 2.6);
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      color.set([c.r, c.g, c.b], i * 3);
      if (!shaped) {
        // distant field, wrapped around the camera
        const r = rand(70, 190);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(rand(-1, 1));
        const x = r * Math.sin(ph) * Math.cos(th);
        const y = r * Math.sin(ph) * Math.sin(th);
        const z = r * Math.cos(ph) - 40;
        from.set([x, y, z], i * 3);
        to.set([x, y, z], i * 3);
      }
    }
    let shape = shapeFor(routeRef.current);
    buildShape(shape, to, AMBIENT, SHAPED);
    // start as a loose cloud and gather into the first shape
    for (let i = AMBIENT; i < N; i++) {
      from.set([gauss() * 60, gauss() * 40, gauss() * 40], i * 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(to.slice(), 3));
    const aFrom = new THREE.BufferAttribute(from, 3);
    const aTo = new THREE.BufferAttribute(to, 3);
    geo.setAttribute("aFrom", aFrom);
    geo.setAttribute("aTo", aTo);
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uWarp: { value: 0 },
      uPixelRatio: { value: dpr },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    const morphTween = { kill: () => {} };
    const morphTo = (next: Shape) => {
      if (next === shape && uniforms.uMorph.value >= 1) return;
      // freeze the current (possibly mid-morph) positions as the new start
      const mVal = uniforms.uMorph.value;
      for (let i = AMBIENT; i < N; i++) {
        const s = seed[i];
        const m = Math.min(1, Math.max(0, mVal * 1.7 - s * 0.7));
        const e = m * m * (3 - 2 * m);
        for (let c = 0; c < 3; c++) {
          const j = i * 3 + c;
          from[j] = from[j] + (to[j] - from[j]) * e;
        }
      }
      shape = next;
      buildShape(next, to, AMBIENT, SHAPED);
      aFrom.needsUpdate = true;
      aTo.needsUpdate = true;
      morphTween.kill();
      uniforms.uMorph.value = 0;
      const tw = gsap.to(uniforms.uMorph, { value: 1, duration: reduced ? 0 : 2.4, ease: "power2.inOut" });
      morphTween.kill = () => tw.kill();
      if (reduced) renderOnce();
    };
    api.current = { morphTo };
    gsap.to(uniforms.uMorph, { value: 1, duration: reduced ? 0 : 3, ease: "power2.out", delay: 0.2 });

    const onWarp = () => {
      if (reduced) return;
      gsap.killTweensOf(uniforms.uWarp);
      gsap
        .timeline()
        .to(uniforms.uWarp, { value: 1, duration: 0.55, ease: "power3.in" })
        .to(uniforms.uWarp, { value: 0, duration: 1.1, ease: "power3.out" });
    };
    window.addEventListener("tt:warp", onWarp);

    // pointer + scroll influence (smoothed)
    const target = { rx: 0, ry: 0, scroll: 0 };
    const cur = { rx: 0, ry: 0, scroll: 0 };
    const onPointer = (e: PointerEvent) => {
      target.ry = (e.clientX / window.innerWidth - 0.5) * 0.25;
      target.rx = (e.clientY / window.innerHeight - 0.5) * 0.15;
    };
    if (!small) window.addEventListener("pointermove", onPointer, { passive: true });
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.scroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      const narrow = window.innerWidth < 760;
      // keep the formation framed on narrow screens
      camera.position.z = narrow ? 92 : 64;
      renderOnce();
    };
    window.addEventListener("resize", onResize);

    const renderOnce = () => renderer.render(scene, camera);
    const clock = new THREE.Clock();
    let spin = 0;
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      spin += dt * 0.035;
      cur.rx += (target.rx - cur.rx) * 0.04;
      cur.ry += (target.ry - cur.ry) * 0.04;
      cur.scroll += (target.scroll - cur.scroll) * 0.06;
      group.rotation.y = spin + cur.ry + cur.scroll * Math.PI * 0.9;
      group.rotation.x = 0.35 + cur.rx - cur.scroll * 0.5;
      group.position.y = cur.scroll * 10;
      renderer.render(scene, camera);
    };

    onResize();
    if (reduced) {
      uniforms.uMorph.value = 1;
      group.rotation.x = 0.35;
      renderOnce();
    } else {
      renderer.setAnimationLoop(loop);
    }

    const onVis = () => {
      if (reduced) return;
      renderer.setAnimationLoop(document.hidden ? null : loop);
      if (!document.hidden) clock.getDelta();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("tt:warp", onWarp);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      morphTween.kill();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    routeRef.current = route;
    api.current?.morphTo(shapeFor(route));
  }, [route]);

  return <div ref={host} className="tt-starfield" aria-hidden="true" />;
}
