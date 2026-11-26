import { useEffect, useMemo, useRef } from "react";
import {
  Atom, Braces, Bug, Chrome, Cloud, Codepen, Codesandbox, CodeXml, Cpu, Database, Figma, FileJson, Framer, GitBranch, Github, Gitlab, GitPullRequest,
  Globe, Hash, Layers, Monitor, MousePointer2, Package, Palette, Rocket, Server, Smartphone, SquareTerminal, Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Faint web symbols wandering along the edges of the screen (code brackets,
 * globe, cloud, phone…). Each one drifts to a new random spot every few
 * seconds, but only to places that are free: never over text, buttons,
 * cards or images, and never over the star shapes in the middle. If content
 * scrolls underneath one, it fades away and finds a new free spot.
 * Purely decorative, never clickable; still for reduced-motion visitors.
 */
// web, tools (GitHub, GitLab, Figma, Chrome, CodePen…) and dev symbols
const ICONS: LucideIcon[] = [
  Github, CodeXml, Figma, Globe, Atom, Database, Chrome, Braces, Gitlab, Cloud, Codepen, Smartphone, GitBranch, Server, Framer,
  SquareTerminal, Package, Monitor, GitPullRequest, Cpu, Codesandbox, FileJson, Bug, Layers, Palette, Rocket, Wifi, Hash, MousePointer2,
];
// languages and tools as small code tags
const GLYPHS = ["JS", "TS", "</>", "HTML", "CSS", "Py", "{ }", "SQL", "npm", "=>", "git", "React"];

// anything a symbol must not sit on top of
const BUSY =
  "h1,h2,h3,h4,h5,h6,p,a,button,input,textarea,select,label,img,video,li,blockquote,figure,small,strong,em,b," +
  "[class*='card'],[class*='btn'],[class*='panel'],[class*='member'],[class*='tag'],[class*='chip'],[class*='layer'],[class*='proto'],[class*='glass'],.chat,.chat-launch,header,nav,footer";

type Item = { size: number; icon?: LucideIcon; glyph?: string; o: number; side: "l" | "r"; x: number; y: number; rot: number };

export default function FloatingSymbols() {
  const host = useRef<HTMLDivElement>(null);
  const items = useMemo<Item[]>(() => {
    const phone = typeof window !== "undefined" && window.innerWidth < 760;
    const count = phone ? 8 : 18;
    const icons = [...ICONS].sort(() => Math.random() - 0.5);
    const glyphs = [...GLYPHS].sort(() => Math.random() - 0.5);
    return Array.from({ length: count }, (_, i) => {
      const glyph = i % 3 === 2 ? glyphs[i % glyphs.length] : undefined;
      return {
        size: phone ? 16 + Math.random() * 10 : 22 + Math.random() * 22,
        icon: glyph ? undefined : icons[i % icons.length],
        glyph,
        o: 0.14 + Math.random() * 0.1,
        side: i % 2 ? "r" : "l",
        x: 0,
        y: 0,
        rot: 0,
      };
    });
  }, []);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(root.children) as HTMLElement[];

    // a point is free if nothing busy is under it
    const freeAt = (x: number, y: number) => {
      const under = document.elementsFromPoint(x, y);
      return !under.some((el) => el instanceof HTMLElement && el.closest(BUSY) && !el.closest(".tt-float"));
    };
    // the star shapes live in the middle: keep out of it
    const inCenter = (x: number, y: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      return x > W * 0.22 && x < W * 0.78 && y > H * 0.08 && y < H * 0.78;
    };
    const boxFree = (x: number, y: number, s: number) =>
      !inCenter(x + s / 2, y + s / 2) &&
      [
        [x + s / 2, y + s / 2],
        [x, y],
        [x + s, y],
        [x, y + s],
        [x + s, y + s],
      ].every(([px, py]) => freeAt(px, py));

    /** pick a new free spot in the item's edge band; hide it if there is none */
    const move = (k: number, first = false) => {
      const it = items[k];
      const el = els[k];
      if (!el) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const band = Math.max(70, Math.min(W * 0.2, 260));
      const s = it.size + 8;
      for (let tries = 0; tries < 10; tries++) {
        const x = it.side === "l" ? 8 + Math.random() * (band - s) : W - band + Math.random() * (band - s - 8);
        const y = H * 0.12 + Math.random() * (H * 0.82 - s);
        if (boxFree(x, y, s)) {
          it.x = x;
          it.y = y;
          it.rot = (Math.random() - 0.5) * 50;
          el.style.transitionDuration = first ? "0s, 0.9s" : `${6 + Math.random() * 5}s, 0.9s`;
          el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${it.rot}deg)`;
          el.style.opacity = String(it.o);
          return;
        }
      }
      el.style.opacity = "0";
    };

    // still in its current spot? (content may have scrolled underneath)
    const check = () => {
      items.forEach((it, k) => {
        const el = els[k];
        if (!el || el.style.opacity === "0") return;
        if (!boxFree(it.x, it.y, it.size + 8)) {
          el.style.opacity = "0";
          window.setTimeout(() => move(k), 900);
        }
      });
    };

    items.forEach((_, k) => move(k, true));
    if (reduced) return;

    const timers = items.map((_, k) =>
      window.setInterval(() => move(k), 7000 + Math.random() * 6000),
    );
    let scrollT = 0;
    const onScroll = () => {
      window.clearTimeout(scrollT);
      scrollT = window.setTimeout(check, 180);
    };
    const onResize = () => items.forEach((_, k) => move(k, true));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const recheck = window.setInterval(check, 1200);
    return () => {
      timers.forEach((t) => window.clearInterval(t));
      window.clearInterval(recheck);
      window.clearTimeout(scrollT);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items]);

  return (
    <div ref={host} className="tt-float" aria-hidden="true">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <span key={i} className="tt-float-item" style={{ "--s": it.size + "px" } as React.CSSProperties}>
            <span className="tt-float-bob" style={{ animationDelay: -Math.random() * 6 + "s" }}>
              {Icon ? <Icon size={it.size} strokeWidth={1.25} /> : <b>{it.glyph}</b>}
            </span>
          </span>
        );
      })}
    </div>
  );
}
