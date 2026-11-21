import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./scroll";
import type { projects } from "./content";

type Project = (typeof projects)[number];

/** Desktop-only choreography (pins, horizontal rolls). Phones get simple reveals. */
const DESKTOP = "(min-width: 960px) and (prefers-reduced-motion: no-preference)";
const ANY_MOTION = "(prefers-reduced-motion: no-preference)";

const host = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

function Browser({ p, eager = false }: { p: Project; eager?: boolean }) {
  return (
    <div className="tt-browser">
      <div className="tt-browser-bar">
        <span className="tt-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="tt-url">{host(p.url)}</span>
      </div>
      <div className="tt-browser-view">
        <img
          src={p.image}
          alt={p.name + " live website"}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Hero: content drifts up and dims while the grid moves slower (depth)
   -------------------------------------------------------------------------- */
export function useHeroParallax(ref: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: root, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".tt-hero-copy", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: st });
      gsap.to(".tt-hero-console", { yPercent: -8, ease: "none", scrollTrigger: st });
      gsap.to(".tt-hero-grid", { yPercent: 22, ease: "none", scrollTrigger: st });
      gsap.to(".tt-hero-glow.one", { xPercent: 12, yPercent: 18, ease: "none", scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, [ref]);
}

/* --------------------------------------------------------------------------
   Rolling marquee: two crossing bands. Speed follows scroll velocity and the
   direction flips when the visitor scrolls back up.
   -------------------------------------------------------------------------- */
export function VelocityMarquee({
  a = ["Build", "Innovate", "Transform", "Your Vision", "Our Technology"],
  b = ["Websites", "Web Apps", "UI/UX Design", "E-Commerce", "Redesign", "Digital Identity"],
}: {
  a?: string[];
  b?: string[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const loopA = gsap.to(rowA.current, { xPercent: -50, ease: "none", duration: 34, repeat: -1 });
      const loopB = gsap.fromTo(
        rowB.current,
        { xPercent: -50 },
        { xPercent: 0, ease: "none", duration: 38, repeat: -1 },
      );
      let direction = 1;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          // Pause entirely while off-screen (saves work on long pages)
          loopA.paused(!self.isActive);
          loopB.paused(!self.isActive);
        },
        onUpdate: (self) => {
          direction = self.direction;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          gsap.to([loopA, loopB], { timeScale: boost * direction, duration: 0.2, overwrite: true });
          gsap.to([loopA, loopB], {
            timeScale: direction,
            duration: 1.2,
            delay: 0.25,
            ease: "power2.out",
          });
        },
      });
      gsap.from(".tt-vm-band", {
        scaleX: 0.7,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 88%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const row = (list: string[]) =>
    [...list, ...list, ...list, ...list].map((w, i) => (
      <span className="tt-vm-item" key={w + i}>
        {w}
        <i>✦</i>
      </span>
    ));

  return (
    <div ref={root} className="tt-vm" aria-hidden="true">
      <div className="tt-vm-band is-brand">
        <div ref={rowA} className="tt-vm-row">
          {row(a)}
        </div>
      </div>
      <div className="tt-vm-band is-ink">
        <div ref={rowB} className="tt-vm-row">
          {row(b)}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Live demos stage (pinned): each project's screen tilts up and zooms in,
   then the next project slides over it like a stack of cards.
   -------------------------------------------------------------------------- */
export function DemoStage({ items }: { items: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-staged");
      const panels = gsap.utils.toArray<HTMLElement>(".tt-demo", el);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * (panels.length * 1.15),
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // counter follows the panel that is (mostly) on screen
          onUpdate: (self) => {
            const t = self.animation ? self.animation.time() : 0;
            let idx = 0;
            marks.forEach((m, i) => {
              if (t >= m) idx = i;
            });
            setActive(idx);
          },
        },
      });
      const marks: number[] = [0];

      panels.forEach((panel, i) => {
        const frame = panel.querySelector(".tt-demo-frame");
        const img = panel.querySelector(".tt-browser-view img");
        const copy = panel.querySelectorAll(".tt-demo-copy > *");

        if (i === 0) {
          // First project is already on stage: its screen tilts up and zooms
          // in while the section scrolls into place, before the pin starts.
          gsap.fromTo(
            frame,
            { scale: 0.82, rotateX: 16, yPercent: 10 },
            {
              scale: 1,
              rotateX: 0,
              yPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 0.8 },
            },
          );
          tl.to({}, { duration: 0.6 }); // hold so it can be read
          return;
        }

        const prev = panels[i - 1];
        tl.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 1 }, ">")
          .to(prev, { scale: 0.9, opacity: 0.3, duration: 1 }, "<")
          .to(prev.querySelector(".tt-demo-frame"), { yPercent: -6, duration: 1 }, "<");
        marks.push(tl.duration() - 0.5);
        tl.fromTo(
          frame,
          { scale: 0.8, rotateX: 14, yPercent: 8 },
          { scale: 1, rotateX: 0, yPercent: 0, duration: 1.1 },
          ">-0.45",
        )
          .fromTo(img, { yPercent: -6, scale: 1.1 }, { yPercent: 0, scale: 1, duration: 1.1 }, "<")
          .fromTo(
            copy,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
            "<+0.2",
          )
          .to({}, { duration: 0.6 }); // hold so the project can be read
      });

      return () => el.classList.remove("is-staged");
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <section
      ref={root}
      id="featured-projects"
      className="tt-demos"
      aria-label="Live demo projects"
    >
      <div className="tt-demos-head wrap">
        <div>
          <span className="tt-eyebrow">Live Demo Projects</span>
          <h2 className="tt-title light">Real work, live on the web.</h2>
        </div>
        <div className="tt-demos-counter" aria-hidden="true">
          <b>{String(active + 1).padStart(2, "0")}</b>
          <span>/ {String(items.length).padStart(2, "0")}</span>
          <div className="tt-demos-dots">
            {items.map((p, i) => (
              <i key={p.slug} className={i === active ? "on" : ""} />
            ))}
          </div>
        </div>
      </div>

      <div className="tt-demos-stage">
        {items.map((p, i) => (
          <article
            className="tt-demo"
            key={p.slug}
            style={{ "--project-color": p.color, zIndex: i + 1 } as React.CSSProperties}
          >
            <div className="tt-demo-inner wrap">
              <div className="tt-demo-copy" data-reveal="from-left">
                <span className="tt-demo-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="tt-eyebrow">{p.category}</span>
                <h3>{p.short}</h3>
                <p>{p.summary}</p>
                <ul className="tt-feature-list">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check size={16} /> {f}
                    </li>
                  ))}
                </ul>
                <div className="tt-showcase-actions">
                  <a href={p.url} target="_blank" rel="noreferrer" className="tt-btn tt-btn-primary">
                    Open Live Demo <ArrowUpRight size={17} />
                  </a>
                  <Link to={"/work/" + p.slug} className="tt-btn tt-btn-ghost">
                    Case study
                  </Link>
                </div>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="tt-demo-frame"
                data-reveal="wipe"
                aria-label={"Open the " + p.short + " live demo"}
              >
                <Browser p={p} eager={i === 0} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Statement (pinned on desktop): an outlined line slides one way while a
   gradient line slides the other and fills with colour as you scroll.
   -------------------------------------------------------------------------- */
export function Statement({
  lineA = "Your Vision ✦ Our Technology",
  lineB = "Infinite Possibilities ✦ Build ✦ Innovate",
}: {
  lineA?: string;
  lineB?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const build = (pin: boolean) => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: pin
          ? { trigger: el, start: "top top", end: "+=110%", scrub: 0.6, pin: true, anticipatePin: 1 }
          : { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      tl.fromTo(a.current, { xPercent: 12 }, { xPercent: -38 }, 0)
        .fromTo(b.current, { xPercent: -42 }, { xPercent: 6 }, 0)
        .fromTo(b.current, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0" }, 0);
    };
    mm.add(DESKTOP, () => build(true));
    mm.add("(max-width: 959px) and (prefers-reduced-motion: no-preference)", () => build(false));
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="tt-statement" aria-label="Your Vision. Our Technology. Infinite Possibilities.">
      <div ref={a} className="tt-statement-line is-outline" aria-hidden="true">
        {lineA} ✦ {lineA}
      </div>
      <div ref={b} className="tt-statement-line is-fill" aria-hidden="true">
        {lineB} ✦ {lineB}
      </div>
      <p className="tt-statement-note">
        We don&apos;t just build websites — we build digital identities.
      </p>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Work gallery: on desktop the section pins and the cards roll sideways as
   you scroll down, leaning slightly with scroll speed. Phones swipe natively.
   -------------------------------------------------------------------------- */
export function WorkGallery({ items }: { items: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-rolling");
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 64);
      const cards = gsap.utils.toArray<HTMLElement>(".tt-work-card", tr);
      const lean = gsap.quickTo(cards, "skewX", { duration: 0.5, ease: "power3.out" });
      const roll = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + distance(),
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            lean(gsap.utils.clamp(-5, 5, self.getVelocity() / -400));
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
          onScrubComplete: () => lean(0),
        },
      });
      // Each screenshot drifts inside its frame while the row rolls (depth)
      cards.forEach((card) => {
        const img = card.querySelector(".tt-work-shot img");
        if (!img) return;
        gsap.fromTo(
          img,
          { xPercent: -6 },
          {
            xPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: roll,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });
      return () => {
        el.classList.remove("is-rolling");
        gsap.set(cards, { clearProps: "transform" });
      };
    });
    mm.add(ANY_MOTION, () => {
      // refresh pin positions once screenshots have loaded
      const imgs = Array.from(el.querySelectorAll("img"));
      const onLoad = () => ScrollTrigger.refresh();
      imgs.forEach((i) => !i.complete && i.addEventListener("load", onLoad, { once: true }));
      return () => imgs.forEach((i) => i.removeEventListener("load", onLoad));
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <section ref={root} className="tt-work" aria-label="Our work">
      <div className="tt-work-head wrap">
        <div>
          <span className="tt-eyebrow">Our Work</span>
          <h2 className="tt-title">Selected projects, built end to end.</h2>
        </div>
        <div className="tt-work-meter" aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>
      <div className="tt-work-viewport">
        <div ref={track} className="tt-work-track">
          {items.map((p, i) => {
            const tall = p.slug === "starx-connect" || p.slug === "audiox";
            return (
              <article
                className={"tt-work-card" + (tall ? " has-phone" : "")}
                key={p.slug}
                style={{ "--project-color": p.color } as React.CSSProperties}
              >
                <Link to={"/work/" + p.slug} className="tt-work-shot" aria-label={p.short + " case study"}>
                  <img src={p.image} alt={p.name + " interface"} loading="lazy" decoding="async" />
                  {tall && (
                    <span className="tt-work-phone">
                      <img src={p.mobile} alt="" loading="lazy" decoding="async" />
                    </span>
                  )}
                </Link>
                <div className="tt-work-meta">
                  <span className="tt-work-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="tt-work-cat">{p.category}</span>
                    <h3>{p.short}</h3>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="tt-work-go" aria-label={"Open " + p.short}>
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </article>
            );
          })}
          <Link to="/project" className="tt-work-card tt-work-next">
            <span className="tt-eyebrow">Next could be yours</span>
            <h3>Your project here.</h3>
            <p>Tell us about your idea and we&apos;ll design and build it with you.</p>
            <span className="tt-btn tt-btn-primary">
              Start Your Project <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Process connector drawn by scroll position (desktop), time-based elsewhere
   -------------------------------------------------------------------------- */
export function useProcessScrub(ref: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-scrubbed");
      gsap.fromTo(
        el.querySelector(".tt-steps-line span"),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 55%", scrub: 0.6 },
        },
      );
      return () => el.classList.remove("is-scrubbed");
    });
    return () => mm.revert();
  }, [ref]);
}
