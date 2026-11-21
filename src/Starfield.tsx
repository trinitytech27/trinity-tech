import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Living star background (single WebGL canvas behind every page).
 *
 * - A field of twinkling, colour-drifting stars.
 * - Part of the stars form a shape. On Home it starts as "TRINITY TECH"
 *   written in stars, then each section re-forms the stars into its own
 *   symbol as you scroll (sections declare it with data-stars="…", and
 *   App broadcasts the visible one as a "tt:stars" event). Other pages
 *   have their own default shape.
 * - Readable shapes (text, symbols) face the visitor; 3D shapes turn slowly.
 * - "tt:warp" (page transitions) rushes the stars toward the camera.
 *
 * Cost: one draw call, motion in the vertex shader, capped DPR, fewer stars
 * on phones / low-core devices, paused while hidden, still for reduced motion.
 */

export type Shape =
  | "text"
  | "code"
  | "infinity"
  | "logo"
  | "galaxy"
  | "helix"
  | "helixV"
  | "orbit"
  | "trinity"
  | "wave"
  | "torus"
  | "atom";

export const ROUTE_SHAPES: Record<string, Shape> = {
  "/": "text",
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

/** How the formation is presented: spin (0 = faces visitor) and base tilt. */
const STYLE: Record<Shape, { spin: number; tilt: number }> = {
  text: { spin: 0, tilt: 0 },
  code: { spin: 0, tilt: 0 },
  infinity: { spin: 0, tilt: 0 },
  logo: { spin: 0, tilt: 0 },
  wave: { spin: 0, tilt: 0 },
  galaxy: { spin: 1, tilt: 0.35 },
  helix: { spin: 1, tilt: 0.3 },
  helixV: { spin: 1, tilt: 0.08 },
  orbit: { spin: 1, tilt: 0.35 },
  trinity: { spin: 0.4, tilt: 0.15 },
  torus: { spin: 1, tilt: 0.45 },
  atom: { spin: 0.55, tilt: 0.2 },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

type View = { w: number; h: number; narrow: boolean };

/* ---------- sample star positions from text / drawings on a canvas ---------- */
const sampleCache = new Map<string, Float32Array>();

function sampleCanvas(key: string, draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void, W = 1200, H = 520) {
  const hit = sampleCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(0);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  const step = 3;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 140) pts.push(x / W - 0.5, 0.5 - y / H);
    }
  }
  const out = new Float32Array(pts);
  if (out.length) sampleCache.set(key, out);
  return out;
}

const HEAD_FONT = '"Outfit", "Space Grotesk", "Inter", system-ui, sans-serif';

const drawers: Partial<Record<Shape, (ctx: CanvasRenderingContext2D, W: number, H: number) => void>> = {
  text: (ctx, W, H) => {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${H * 0.4}px ${HEAD_FONT}`;
    ctx.fillText("TRINITY", W / 2, H * 0.3);
    ctx.font = `800 ${H * 0.4}px ${HEAD_FONT}`;
    ctx.fillText("TECH", W / 2, H * 0.74);
  },
  code: (ctx, W, H) => {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${H * 0.78}px ${HEAD_FONT}`;
    ctx.fillText("</>", W / 2, H * 0.54);
  },
  logo: (ctx, W, H) => {
    // the Trinity Tech mark: two bars + stem, inside a rounded tile outline
    const s = H / 64;
    const ox = W / 2 - 32 * s;
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(ox + x * s, y * s, w * s, h * s, r * s);
      ctx.fill();
    };
    rr(13, 15, 17, 9, 4.5);
    rr(34, 15, 17, 9, 4.5);
    rr(27.5, 28, 9, 22, 4.5);
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.roundRect(ox + 2 * s, 2 * s, 60 * s, 60 * s, 15 * s);
    ctx.stroke();
  },
};

/** Fill `out` (xyz per star) for the shaped stars. */
function buildShape(shape: Shape, out: Float32Array, from: number, count: number, view: View) {
  const set = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  };

  const draw = drawers[shape];
  if (draw) {
    const pts = sampleCanvas(shape, draw);
    if (pts.length) {
      // fit to the visible area
      const fitW = shape === "text" ? (view.narrow ? 0.9 : 0.66) : shape === "code" ? 0.4 : 0.42;
      const width = Math.min(view.w * fitW, shape === "text" ? 86 : 64);
      const aspect = 520 / 1200;
      const scaleX = shape === "logo" ? width * (1200 / 520) * 0.55 : width;
      const scaleY = shape === "logo" ? scaleX * aspect : width * aspect;
      const lift = shape === "text" ? view.h * (view.narrow ? 0.17 : 0.12) : shape === "logo" ? view.h * 0.2 : 0;
      const n = pts.length / 2;
      for (let k = 0; k < count; k++) {
        const j = Math.floor(Math.random() * n) * 2;
        set(
          from + k,
          pts[j] * scaleX + gauss() * 0.12,
          pts[j + 1] * scaleY + lift + gauss() * 0.12,
          gauss() * 0.9,
        );
      }
      return;
    }
  }

  for (let k = 0; k < count; k++) {
    const i = from + k;
    const t = k / count;
    switch (shape) {
      case "infinity": {
        const a = Math.random() * Math.PI * 2;
        const sc = Math.min(view.w * 0.3, 34);
        const d = 1 + Math.sin(a) ** 2;
        const x = (sc * Math.cos(a)) / d;
        const y = (sc * Math.sin(a) * Math.cos(a)) / d;
        set(i, x + gauss() * 0.5, y + gauss() * 0.5, Math.sin(a * 2) * 4 + gauss() * 0.8);
        break;
      }
      case "galaxy": {
        const arm = k % 3;
        const r = Math.pow(Math.random(), 0.55) * 34 + 1.5;
        const a = r * 0.28 + (arm * Math.PI * 2) / 3 + gauss() * 0.22;
        set(i, Math.cos(a) * r, gauss() * 1.6 * (1 - r / 40), Math.sin(a) * r);
        break;
      }
      case "helix":
      case "helixV": {
        const along = (t - 0.5) * (shape === "helixV" ? view.h * 1.15 : 96);
        const strand = k % 5 === 0 ? 2 : k % 2;
        const a = along * 0.16;
        const R = shape === "helixV" ? 7 : 9;
        let u: number;
        let v: number;
        if (strand === 2) {
          const s = rand(-1, 1);
          u = Math.cos(a) * R * s;
          v = Math.sin(a) * R * s;
        } else {
          const off = strand * Math.PI;
          u = Math.cos(a + off) * R + gauss() * 0.7;
          v = Math.sin(a + off) * R + gauss() * 0.7;
        }
        if (shape === "helixV") set(i, u, along + gauss() * 0.4, v);
        else set(i, along + gauss() * 0.4, u, v);
        break;
      }
      case "orbit": {
        if (k % 3 === 0) {
          const ring = k % 2;
          const a = Math.random() * Math.PI * 2;
          const R = ring ? 30 : 36;
          const tilt = ring ? 0.5 : -0.35;
          const z = Math.sin(a) * R;
          set(i, Math.cos(a) * R, z * Math.sin(tilt) + gauss() * 0.4, z * Math.cos(tilt));
        } else {
          const y = 1 - (k / (count - 1)) * 2;
          const rad = Math.sqrt(1 - y * y);
          const phi = k * 2.399963;
          const R = 18 + gauss() * 0.5;
          set(i, Math.cos(phi) * rad * R, y * R, Math.sin(phi) * rad * R);
        }
        break;
      }
      case "trinity": {
        const ring = k % 3;
        const ca = (ring * Math.PI * 2) / 3 - Math.PI / 2;
        const a = Math.random() * Math.PI * 2;
        const R = 15 + gauss() * 0.45;
        set(
          i,
          Math.cos(ca) * 10 + Math.cos(a) * R,
          Math.sin(ca) * 10 + Math.sin(a) * R,
          gauss() * 1.4 + Math.sin(a * 2 + ring) * 2,
        );
        break;
      }
      case "wave": {
        // a wide surface hanging near the top of the screen, receding into depth
        const gx = (Math.random() - 0.5) * view.w * 1.5;
        const gz = rand(-70, 12);
        const top = view.h * 0.3;
        set(i, gx, top + Math.sin(gx * 0.12) * 2.4 + Math.cos(gz * 0.16) * 1.6 + gz * -0.18, gz);
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
      case "atom": {
        // nucleus + three tilted elliptical orbits (one per team member)
        if (k % 5 === 0) {
          set(i, gauss() * 3.2, gauss() * 3.2, gauss() * 3.2);
        } else {
          const orbit = k % 3;
          const a = Math.random() * Math.PI * 2;
          const RX = Math.min(view.w * 0.3, 30);
          const RY = RX * 0.36;
          let x = Math.cos(a) * RX + gauss() * 0.35;
          let y = Math.sin(a) * RY + gauss() * 0.35;
          const rot = (orbit * Math.PI) / 3;
          const xr = x * Math.cos(rot) - y * Math.sin(rot);
          const yr = x * Math.sin(rot) + y * Math.cos(rot);
          x = xr;
          y = yr;
          set(i, x, y, Math.sin(a + orbit) * 4);
        }
        break;
      }
      default:
        set(i, gauss() * 30, gauss() * 20, gauss() * 20);
    }
  }
}

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute float aSize;
  attribute float aShaped;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uMorph;
  uniform float uWarp;
  uniform float uWave;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - aSeed * 0.7, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, m);
    p.y += sin(m * 3.14159) * (aSeed - 0.5) * 14.0 * aShaped;
    // gentle drift (smaller for shaped stars so text stays crisp)
    float drift = mix(0.35, 0.12, aShaped);
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * drift;
    p.y += cos(uTime * 0.17 + aSeed * 30.0) * drift;
    // rolling wave surface
    p.y += uWave * aShaped * (sin(p.x * 0.13 + uTime * 0.9) * 2.4 + cos(p.z * 0.17 + uTime * 0.7) * 1.8);
    p.z += uWarp * (20.0 + aSeed * 60.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 2.4) + aSeed * 90.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + uWarp * 1.5) * (260.0 / -mv.z);
    vAlpha = mix(twinkle, 0.7 + 0.3 * twinkle, aShaped);
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
      return; // no WebGL: the CSS star fallback stays
    }
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 0, 64);
    const view: View = { w: 100, h: 66, narrow: false };
    const measure = () => {
      const narrow = window.innerWidth < 760;
      camera.position.z = narrow ? 80 : 64;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
      view.h = h;
      view.w = h * camera.aspect;
      view.narrow = narrow;
    };
    measure();

    const AMBIENT = small || lowCore ? 1300 : 2400;
    const SHAPED = small || lowCore ? 3200 : 7000;
    const N = AMBIENT + SHAPED;

    const from = new Float32Array(N * 3);
    const to = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const size = new Float32Array(N);
    const shaped = new Float32Array(N);
    const color = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      seed[i] = Math.random();
      const isShaped = i >= AMBIENT;
      shaped[i] = isShaped ? 1 : 0;
      size[i] = isShaped ? rand(0.8, 1.9) : rand(0.6, 2.6);
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      color.set([c.r, c.g, c.b], i * 3);
      if (!isShaped) {
        const r = rand(70, 190);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(rand(-1, 1));
        const p = [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph) - 40];
        from.set(p, i * 3);
        to.set(p, i * 3);
      } else {
        // a loose cloud that gathers into the first shape
        from.set([gauss() * 60, gauss() * 40, gauss() * 40], i * 3);
      }
    }

    let shape: Shape = shapeFor(routeRef.current);
    // fonts must be ready before stars can spell text; start with a galaxy
    const needsFont = (s: Shape) => s === "text" || s === "code";
    let fontReady = !needsFont(shape);
    buildShape(fontReady ? shape : "galaxy", to, AMBIENT, SHAPED, view);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(to.slice(), 3));
    const aFrom = new THREE.BufferAttribute(from, 3);
    const aTo = new THREE.BufferAttribute(to, 3);
    geo.setAttribute("aFrom", aFrom);
    geo.setAttribute("aTo", aTo);
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aShaped", new THREE.BufferAttribute(shaped, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uWarp: { value: 0 },
      uWave: { value: 0 },
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
    const group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    scene.add(group);

    const renderOnce = () => renderer.render(scene, camera);
    let morphTween: gsap.core.Tween | null = null;
    const style = { spin: STYLE[shape].spin, tilt: STYLE[shape].tilt };

    const morphTo = (next: Shape, quick = false) => {
      if (next === shape && uniforms.uMorph.value >= 1 && !quick) return;
      if (needsFont(next) && !fontReady) {
        shape = next; // applied once fonts load
        return;
      }
      const mVal = uniforms.uMorph.value;
      for (let i = AMBIENT; i < N; i++) {
        const m = Math.min(1, Math.max(0, mVal * 1.7 - seed[i] * 0.7));
        const e = m * m * (3 - 2 * m);
        for (let c = 0; c < 3; c++) {
          const j = i * 3 + c;
          from[j] = from[j] + (to[j] - from[j]) * e;
        }
      }
      shape = next;
      buildShape(next, to, AMBIENT, SHAPED, view);
      aFrom.needsUpdate = true;
      aTo.needsUpdate = true;
      morphTween?.kill();
      uniforms.uMorph.value = 0;
      const dur = reduced ? 0 : quick ? 0.8 : 2.2;
      morphTween = gsap.to(uniforms.uMorph, { value: 1, duration: dur, ease: "power2.inOut" });
      gsap.to(style, { spin: STYLE[next].spin, tilt: STYLE[next].tilt, duration: dur || 0.01, ease: "power2.inOut" });
      gsap.to(uniforms.uWave, { value: next === "wave" ? 1 : 0, duration: dur || 0.01 });
      if (reduced) renderOnce();
    };
    api.current = { morphTo: (s) => morphTo(s) };
    morphTween = gsap.to(uniforms.uMorph, { value: 1, duration: reduced ? 0 : 3, ease: "power2.out", delay: 0.2 });
    if (shape === "wave") uniforms.uWave.value = 1;

    if (!fontReady) {
      const ready = Promise.race([
        document.fonts?.load(`800 200px Outfit`).catch(() => null),
        new Promise((r) => setTimeout(r, 1800)),
      ]);
      ready.then(() => {
        fontReady = true;
        sampleCache.clear();
        morphTo(shape, false);
      });
    }

    const onWarp = () => {
      if (reduced) return;
      gsap.killTweensOf(uniforms.uWarp);
      gsap
        .timeline()
        .to(uniforms.uWarp, { value: 1, duration: 0.55, ease: "power3.in" })
        .to(uniforms.uWarp, { value: 0, duration: 1.1, ease: "power3.out" });
    };
    const onScene = (e: Event) => {
      const s = (e as CustomEvent<string>).detail as Shape;
      if (s && s in STYLE) morphTo(s);
    };
    window.addEventListener("tt:warp", onWarp);
    window.addEventListener("tt:stars", onScene);

    const target = { rx: 0, ry: 0, scroll: 0 };
    const cur = { rx: 0, ry: 0, scroll: 0 };
    const onPointer = (e: PointerEvent) => {
      target.ry = (e.clientX / window.innerWidth - 0.5) * 0.3;
      target.rx = (e.clientY / window.innerHeight - 0.5) * 0.18;
    };
    if (!small) window.addEventListener("pointermove", onPointer, { passive: true });
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.scroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeT = 0;
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      measure();
      renderOnce();
      window.clearTimeout(resizeT);
      // re-fit text/symbol shapes to the new screen
      resizeT = window.setTimeout(() => morphTo(shape, true), 250);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let spin = 0;
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      spin += dt * 0.06 * style.spin;
      // readable shapes: ease the accumulated turn back to facing front
      if (style.spin < 0.05) spin += (Math.round(spin / (Math.PI * 2)) * Math.PI * 2 - spin) * 0.04;
      cur.rx += (target.rx - cur.rx) * 0.05;
      cur.ry += (target.ry - cur.ry) * 0.05;
      cur.scroll += (target.scroll - cur.scroll) * 0.06;
      // readable shapes face the visitor; 3D shapes turn
      group.rotation.y = spin + cur.ry * (0.6 + style.spin);
      group.rotation.x = style.tilt + cur.rx * 0.8;
      group.position.y = cur.scroll * 6 * style.spin;
      renderer.render(scene, camera);
    };

    if (reduced) {
      uniforms.uMorph.value = 1;
      group.rotation.x = style.tilt;
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
      window.removeEventListener("tt:stars", onScene);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.clearTimeout(resizeT);
      morphTween?.kill();
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
