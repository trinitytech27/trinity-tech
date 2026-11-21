import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToElement } from "./scroll";

// Same choreography on laptops, tablets and phones (only reduced-motion opts out)
const DESKTOP = "(prefers-reduced-motion: no-preference)";
const finePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !prefersReducedMotion();

/* --------------------------------------------------------------------------
   Tilt: cards lean toward the pointer in 3D (desktop pointers only)
   -------------------------------------------------------------------------- */
export function useTilt<T extends HTMLElement>(max = 8) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer()) return;
    const rx = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
    gsap.set(el, { transformPerspective: 900 });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max * 2);
      rx(-py * max * 2);
      el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return ref;
}

export function TiltCard({
  className = "",
  children,
  max,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { max?: number }) {
  const ref = useTilt<HTMLDivElement>(max);
  return (
    <div ref={ref} className={"tt-tilt " + className} {...rest}>
      <span className="tt-tilt-glare" aria-hidden="true" />
      {children}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Page hero: words rise in with a 3D turn when the page opens
   -------------------------------------------------------------------------- */
export function PageHero({
  kicker,
  title,
  accent,
  sub,
  index,
  children,
}: {
  kicker: string;
  title: string;
  accent?: string;
  sub?: string;
  index?: string;
  children?: React.ReactNode;
}) {
  const words = title.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  let n = 0;
  const word = (w: string, cls = "") => (
    <span className="tt-ph-word" key={n} style={{ "--i": n++ } as React.CSSProperties}>
      <span className={cls}>{w}</span>
    </span>
  );
  return (
    <header className="tt-ph wrap" data-section={kicker}>
      <div className="tt-ph-meta">
        {index && <span className="tt-ph-index">{index}</span>}
        <span className="tt-eyebrow">{kicker}</span>
      </div>
      <h1 className="tt-ph-title">
        {words.map((w) => word(w))}
        {accentWords.length > 0 && <br />}
        {accentWords.map((w) => word(w, "tt-gradient-text"))}
      </h1>
      {sub && (
        <p className="tt-ph-sub" style={{ "--i": n + 1 } as React.CSSProperties}>
          {sub}
        </p>
      )}
      {children && (
        <div className="tt-ph-extra" style={{ "--i": n + 2 } as React.CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}

/* --------------------------------------------------------------------------
   Fly-through (pinned on desktop): screens fly out of deep space toward
   the visitor as they scroll, with the current item's caption below.
   -------------------------------------------------------------------------- */
export type FlyItem = { src: string; title: string; kicker: string; tall?: boolean; href?: string };

export function FlyThrough({
  items,
  title = "Fly through our work.",
  hint = "Keep scrolling — every screen is a real project.",
  cta,
}: {
  items: FlyItem[];
  title?: string;
  hint?: string;
  cta?: { to: string; label: string };
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-flying");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-fly-card", el);
      // spread cards around the centre so they pass beside the visitor
      const spots = [
        [-26, -14],
        [24, -10],
        [-20, 16],
        [26, 14],
        [-4, -22],
        [6, 20],
        [-30, 2],
        [30, -2],
      ];
      const per = 1;
      const gap = 0.42; // seconds between screens: several are in flight at once
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * (cards.length * 0.62 + 0.8),
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // the caption follows the screen that is currently closest
          onUpdate: (self) => {
            const t = self.animation ? self.animation.time() : 0;
            setActive(Math.max(0, Math.min(cards.length - 1, Math.round((t - 0.8) / gap))));
          },
        },
      });
      cards.forEach((card, i) => {
        const [x, y] = spots[i % spots.length];
        tl.fromTo(
          card,
          { xPercent: -50, yPercent: -50, x: `${x * 0.6}vw`, y: `${y * 0.6}vh`, z: -2200, opacity: 0, rotateY: x > 0 ? -12 : 12 },
          {
            keyframes: [
              { z: -900, opacity: 1, x: `${x * 0.85}vw`, y: `${y * 0.85}vh`, duration: per * 0.55 },
              { z: 380, opacity: 1, x: `${x * 1.6}vw`, y: `${y * 1.6}vh`, rotateY: x > 0 ? 18 : -18, duration: per * 0.45 },
              { z: 700, opacity: 0, duration: per * 0.12 },
            ],
          },
          i * gap,
        );
      });
      tl.fromTo(".tt-fly-title", { opacity: 0.15, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6 }, 0);
      return () => el.classList.remove("is-flying");
    });
    return () => mm.revert();
  }, [items.length]);

  const cur = items[active];
  return (
    <section ref={root} className="tt-fly" data-section="Work" aria-label={title}>
      <div className="tt-fly-space">
        <div className="tt-fly-title">
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
        {items.map((it) => (
          <figure key={it.title + it.src} className={"tt-fly-card" + (it.tall ? " tall" : "")} data-reveal="zoom">
            <img src={it.src} alt={it.title} loading="lazy" decoding="async" />
            <figcaption>
              <span>{it.kicker}</span>
              {it.title}
            </figcaption>
          </figure>
        ))}
        {cur && (
          <div className="tt-fly-caption" aria-live="polite">
            <span className="tt-eyebrow">{cur.kicker}</span>
            <h3>{cur.title}</h3>
            <div className="tt-fly-progress">
              <b>{String(active + 1).padStart(2, "0")}</b>
              <i>
                <span style={{ transform: `scaleX(${(active + 1) / items.length})` }} />
              </i>
              <b>{String(items.length).padStart(2, "0")}</b>
            </div>
          </div>
        )}
        {cta && (
          <Link to={cta.to} className="tt-btn tt-btn-primary tt-fly-cta">
            {cta.label} <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Spin ring (pinned on desktop): cards sit on a 3D ring that turns with
   scroll; the card facing the visitor is lit, the back ones dim.
   -------------------------------------------------------------------------- */
export function SpinRing({
  title,
  accent,
  kicker,
  items,
  cta,
}: {
  title: string;
  accent: string;
  kicker: string;
  items: { title: string; desc: string; icon?: React.ReactNode; tag?: string }[];
  cta?: { to: string; label: string };
}) {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const rg = ring.current;
    if (!el || !rg) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-spinning");
      const slots = gsap.utils.toArray<HTMLElement>(".tt-ring-card", rg);
      const step = 360 / slots.length;
      const radius = () => Math.min(520, window.innerWidth * 0.34);
      // rotate first, then push out along the rotated axis (order matters)
      const place = () =>
        slots.forEach((s, i) => {
          s.style.transform = `translate(-50%, -50%) rotateY(${i * step}deg) translateZ(${radius()}px)`;
        });
      place();
      const shade = () => {
        const cur = Number(gsap.getProperty(rg, "rotationY")) || 0;
        slots.forEach((s, i) => {
          let a = (((i * step + cur) % 360) + 360) % 360;
          if (a > 180) a = 360 - a;
          const front = 1 - a / 180;
          s.style.opacity = String(0.18 + front * 0.82);
          s.classList.toggle("is-front", front > 0.86);
        });
      };
      shade();
      const tween = gsap.to(rg, {
        rotationY: -(360 - step),
        ease: "none",
        onUpdate: shade,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * slots.length * 0.55,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: place,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.classList.remove("is-spinning");
        gsap.set(rg, { clearProps: "transform" });
        slots.forEach((s) => {
          s.style.transform = "";
          s.style.opacity = "";
          s.classList.remove("is-front");
        });
      };
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <section ref={root} className="tt-ring" data-section={kicker} aria-label={title + " " + accent}>
      <header className="tt-ring-head wrap">
        <span className="tt-eyebrow">{kicker}</span>
        <h2 className="tt-title">
          {title} <span className="tt-gradient-text">{accent}</span>
        </h2>
      </header>
      <div className="tt-ring-stage">
        <div ref={ring} className="tt-ring-track" data-reveal-stagger="80">
          {items.map((it, i) => (
            <article className="tt-ring-card" key={it.title} data-reveal="rise">
              <div className="tt-ring-top">
                <span className="tt-ring-icon">{it.icon}</span>
                <span className="tt-ring-num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
              {it.tag && <span className="tt-ring-tag">{it.tag}</span>}
            </article>
          ))}
        </div>
      </div>
      {cta && (
        <div className="tt-ring-cta">
          <Link to={cta.to} className="tt-btn tt-btn-ghost">
            {cta.label} <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------------------------
   Right-edge section label ("02 — WORK"), like a chapter marker
   -------------------------------------------------------------------------- */
export function SectionLabel() {
  const loc = useLocation();
  const [sections, setSections] = useState<{ el: HTMLElement; name: string }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let lastStars = "";
    const id = window.setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("main [data-section]"));
      setSections(els.map((el) => ({ el, name: el.dataset.section || "" })));
      setActive(0);
      const broadcast = (el: HTMLElement) => {
        const s = el.dataset.stars;
        if (s && s !== lastStars) {
          lastStars = s;
          window.dispatchEvent(new CustomEvent("tt:stars", { detail: s }));
        }
      };
      if (els[0]) broadcast(els[0]);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            setActive(els.indexOf(el));
            broadcast(el);
          }
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      els.forEach((el) => io?.observe(el));
    }, 350);
    return () => {
      window.clearTimeout(id);
      io?.disconnect();
    };
  }, [loc.pathname]);

  if (!sections.length) return null;
  const cur = sections[active];
  return (
    <>
      <div className="tt-pill" key={"p" + cur?.name} aria-hidden="true">
        <i /> {cur?.name}
      </div>
      <nav className="tt-rail" aria-label="Page sections">
        {sections.map((s, i) => (
          <button
            key={s.name + i}
            type="button"
            className={i === active ? "on" : ""}
            aria-label={"Go to " + s.name}
            aria-current={i === active}
            onClick={() => scrollToElement(s.el)}
          >
            {i === active && (
              <span>
                {String(i + 1).padStart(2, "0")} {s.name}
              </span>
            )}
            <i />
          </button>
        ))}
      </nav>
    </>
  );
}

/* Refresh ScrollTrigger once lazy images/fonts settle on a page */
export function useRefreshOnLoad() {
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", onLoad);
    };
  }, []);
}
