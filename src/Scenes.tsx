import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail, Radar } from "lucide-react";
import { gsap, ScrollTrigger, showStars } from "./scroll";
import { team, siteTypes, PROJECT_ICONS, type projects } from "./content";
import { BOOKING_STEPS } from "./Home";

type Project = (typeof projects)[number];

// Same choreography on laptops, tablets and phones (only reduced-motion opts out)
const DESKTOP = "(prefers-reduced-motion: no-preference)";

/* "04 ——— PROGRAMMES" style section tag */
export function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <span className="tt-tag">
      <b>{n}</b>
      <i />
      {label}
    </span>
  );
}

/* ==========================================================================
   PROJECTS — "fly through" one at a time: each project arrives out of deep
   space into the main frame, then drifts back to the left as the next one
   comes in. The caption panel shows the current project with
   "Visit Live Site" and "View Full Details".
   ========================================================================== */
export function ProjectQueue({ items, n = "02" }: { items: Project[]; n?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const inView = useRef(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  useEffect(() => {
    if (inView.current) showStars(PROJECT_ICONS[items[active]?.slug]);
  }, [active, items]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-flying");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-pf-card", el);
      const narrow = window.innerWidth < 760;
      // main frame, the "just passed" spot on the left, and far away
      const MAIN = narrow ? { x: 0, y: -7, z: 0, scale: 1 } : { x: 9, y: -4, z: 0, scale: 1 };
      const LEFT = narrow ? { x: -62, y: -12, z: -500, scale: 0.6 } : { x: -21, y: -5, z: -520, scale: 0.56 };
      const FAR = narrow ? { x: 40, y: -20, z: -1600, scale: 0.5 } : { x: 32, y: -16, z: -1800, scale: 0.55 };
      const at = (p: { x: number; y: number; z: number; scale: number }, opacity: number) => ({
        xPercent: -50,
        yPercent: -50,
        x: p.x + "vw",
        y: p.y + "vh",
        z: p.z,
        scale: p.scale,
        opacity,
      });
      gsap.set(cards, at(FAR, 0));

      const marks: number[] = [];
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * (cards.length * 0.95),
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: "labels", duration: { min: 0.25, max: 0.7 }, ease: "power1.inOut", delay: 0.05, inertia: false },
          onToggle: (self) => {
            inView.current = self.isActive;
            if (self.isActive) showStars(PROJECT_ICONS[items[activeRef.current]?.slug]);
          },
          onUpdate: (self) => {
            const t = self.progress * (self.animation ? self.animation.duration() : 0);
            let idx = 0;
            marks.forEach((m, i) => t >= m - 0.05 && (idx = i));
            setActive(idx);
          },
        },
      });
      cards.forEach((card, i) => {
        if (i > 0) {
          // previous project drifts back to the left…
          tl.to(cards[i - 1], { ...at(LEFT, 0.5), duration: 1 }, ">");
          // …the one before it leaves completely
          if (i > 1) tl.to(cards[i - 2], { ...at({ ...LEFT, x: LEFT.x - 30, z: -900 }, 0), duration: 1 }, "<");
        }
        // this project flies in to the main frame
        tl.to(card, { ...at(MAIN, 1), duration: 1.1, ease: "power3.out" }, i === 0 ? 0 : "<0.1");
        marks.push(tl.duration());
        tl.addLabel("p" + i);
        tl.to({}, { duration: 0.5 });
      });
      return () => {
        el.classList.remove("is-flying");
        gsap.set(cards, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, [items.length]);

  const cur = items[active];
  return (
    <section
      ref={root}
      className="tt-pfly"
      data-section="Our Work"
      aria-label="Our live projects"
    >
      <header className="tt-pfly-head wrap">
        <SectionTag n={n} label="Live Projects" />
      </header>
      <div className="tt-pfly-stage">
        {items.map((p, i) => (
          <a
            key={p.slug}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className={"tt-pf-card" + (i === active ? " is-active" : "")}
            style={{ zIndex: i + 1 } as React.CSSProperties}
            aria-label={"Visit the " + p.short + " live site"}
          >
            <span className="tt-pf-chip">
              <b>{String(i + 1).padStart(2, "0")}</b> {p.category.split("/")[0].trim()}
            </span>
            <img src={p.image} alt={p.name + " live website"} loading="lazy" decoding="async" />
          </a>
        ))}
      </div>
      {cur && (
        <div className="tt-pf-caption" key={cur.slug}>
          <span className="tt-pf-kicker">{cur.category}</span>
          <h3>{cur.short}</h3>
          <p>{cur.summary}</p>
          <div className="tt-pf-actions">
            <a href={cur.url} target="_blank" rel="noreferrer" className="tt-btn tt-btn-primary">
              Visit Live Site <ArrowUpRight size={17} />
            </a>
            <Link to={"/work/" + cur.slug} className="tt-btn tt-btn-ghost">
              View Full Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
      <div className="tt-pf-progress" aria-hidden="true">
        <b>{String(active + 1).padStart(2, "0")}</b>
        <i>
          <span style={{ transform: `scaleX(${(active + 1) / items.length})` }} />
        </i>
      </div>
      {/* list for reduced motion / no-JS */}
      <ul className="tt-pf-list">
        {items.map((p) => (
          <li key={p.slug}>
            <a href={p.url} target="_blank" rel="noreferrer">
              {p.short}
            </a>{" "}
            · <Link to={"/work/" + p.slug}>Details</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ==========================================================================
   DOMAINS — starts as a compressed stack; on arrival it opens up and each
   scroll brings the next domain to the top. The stars draw that domain's
   symbol (briefcase, cart, calendar…).
   ========================================================================== */
export function LayerStack({ n = "03" }: { n?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const N = siteTypes.length;
  const inView = useRef(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  useEffect(() => {
    if (inView.current) showStars(siteTypes[active]?.icon);
  }, [active]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-stacked");
      const layers = gsap.utils.toArray<HTMLElement>(".tt-layer", el);
      const OPEN = 0.14; // first part of the scroll: the compressed stack opens
      const place = (open: number, p: number) => {
        const gap = 12 + 74 * open;
        layers.forEach((layer, k) => {
          const d = k - p;
          if (d < 0) {
            gsap.set(layer, { z: 70 + -d * 360, y: d * 40, opacity: Math.max(0, 1 + d * 1.6) });
          } else {
            gsap.set(layer, {
              z: 70 - d * gap,
              y: 0,
              opacity: Math.max(0.22, 1 - d * (0.05 + 0.15 * open)),
            });
          }
          layer.classList.toggle("is-top", Math.abs(d) < 0.5);
        });
      };
      place(0, 0);
      const snaps = [0, ...siteTypes.slice(1).map((_, k) => OPEN + ((1 - OPEN) * (k + 1)) / (N - 1))];
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * N * 0.6,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: { snapTo: snaps, duration: { min: 0.25, max: 0.7 }, ease: "power1.inOut", delay: 0.05, inertia: false },
        onToggle: (self) => {
          inView.current = self.isActive;
          if (self.isActive) showStars(siteTypes[activeRef.current]?.icon);
        },
        onUpdate: (self) => {
          const v = self.progress;
          const open = Math.min(1, v / OPEN);
          const p = v <= OPEN ? 0 : ((v - OPEN) / (1 - OPEN)) * (N - 1);
          place(open, p);
          setActive(Math.round(p));
        },
      });
      return () => {
        el.classList.remove("is-stacked");
        gsap.set(layers, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, [N]);

  const cur = siteTypes[active];
  return (
    <section ref={root} className="tt-layers" data-section="Domains" aria-label="Websites we build">
      <div className="tt-layers-inner wrap">
        <div className="tt-layers-copy">
          <SectionTag n={n} label="Domains We Build" />
          <h2 className="tt-display">
            Websites for <span className="tt-gradient-text">every ambition.</span>
          </h2>
          <div className="tt-layer-panel" key={cur.title}>
            <span className="tt-layer-kicker">
              {String(active + 1).padStart(2, "0")} · {cur.sub}
            </span>
            <h3>{cur.title}</h3>
            <p>{cur.desc}</p>
            <div className="tt-layer-tags">
              {cur.tags.map((t) => (
                <em key={t}>{t}</em>
              ))}
            </div>
            <Link to={"/project?category=" + encodeURIComponent(cur.category)} className="tt-link">
              Start a {cur.title.toLowerCase()} project <ArrowRight size={16} />
            </Link>
          </div>
          <div className="tt-layer-dashes" aria-hidden="true">
            {siteTypes.map((t, i) => (
              <i key={t.title} className={i === active ? "on" : ""} />
            ))}
          </div>
        </div>
        <div className="tt-stack" aria-hidden="true">
          <div className="tt-stack-plane">
            {siteTypes.map((t, k) => (
              <div className="tt-layer" key={t.title} style={{ zIndex: N - k } as React.CSSProperties}>
                <span className="tt-layer-n">{String(k + 1).padStart(2, "0")}</span>
                <b>{t.title}</b>
                <small>{t.sub}</small>
                <div className="tt-layer-chips">
                  {t.tags.slice(0, 3).map((x) => (
                    <em key={x}>{x}</em>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="tt-layers-list" data-reveal-stagger="80">
          {siteTypes.map((t, k) => (
            <Link key={t.title} to={"/project?category=" + encodeURIComponent(t.category)} className="tt-layer-card" data-reveal="rise">
              <span className="tt-layer-kicker">
                {String(k + 1).padStart(2, "0")} · {t.sub}
              </span>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   TEAM — no flying in. A glowing Trinity hub appears, connection lines draw
   out to each person, and each card rises into place where it belongs.
   ========================================================================== */
const ORDER = [1, 0, 2]; // Madhan (left) · Balajose (centre) · Sanjay (right)

export function TeamAtom({ n = "04" }: { n?: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [hub, setHub] = useState({ x: 0, y: 0 });

  // connection lines from the hub to the top of each card
  useLayoutEffect(() => {
    const st = stage.current;
    if (!st) return;
    const measure = () => {
      const box = st.getBoundingClientRect();
      const hubEl = st.querySelector<HTMLElement>(".tt-hub");
      const cards = Array.from(st.querySelectorAll<HTMLElement>(".tt-member"));
      if (!hubEl || !cards.length) return;
      const h = hubEl.getBoundingClientRect();
      const hx = h.left + h.width / 2 - box.left;
      const hy = h.top + h.height / 2 - box.top;
      setHub({ x: hx, y: hy });
      setPaths(
        cards.map((c) => {
          const r = c.getBoundingClientRect();
          const cx = r.left + r.width / 2 - box.left;
          const cy = r.top - box.top;
          const my = (hy + cy) / 2;
          return `M ${hx} ${hy} C ${hx} ${my}, ${cx} ${my}, ${cx} ${cy}`;
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-linking");
      const q = gsap.utils.selector(el);
      const cards = q(".tt-member");
      const order = [1, 0, 2]; // founder first, then the developers
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.4,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(q(".tt-hub"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" })
        .fromTo(q(".tt-link-path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12 }, "<0.2");
      order.forEach((ci, k) => {
        tl.fromTo(
          cards[ci],
          { opacity: 0, y: 60, rotateX: 28, scale: 0.94 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.8 },
          k === 0 ? "<0.35" : "<0.3",
        );
      });
      tl.to({}, { duration: 0.6 });
      return () => {
        el.classList.remove("is-linking");
        gsap.set([...cards, ...q(".tt-hub"), ...q(".tt-link-path")], { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="tt-atom" data-section="Team" data-stars="atom" aria-label="Our team">
      <header className="tt-atom-head wrap">
        <SectionTag n={n} label="The Team" />
        <h2 className="tt-display">
          The people behind <span className="tt-gradient-text">Trinity Tech.</span>
        </h2>
        <p className="tt-lede">One founder, two developers — and one shared obsession with building things that work beautifully.</p>
      </header>
      <div ref={stage} className="tt-team-stage wrap">
        <svg className="tt-links" aria-hidden="true">
          <defs>
            <linearGradient id="tt-link-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#67e8f9" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {paths.map((d, i) => (
            <g key={i}>
              <path className="tt-link-path" d={d} pathLength={1} />
              <circle className="tt-link-dot" r="3.5">
                <animateMotion dur={3 + i * 0.6 + "s"} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          ))}
        </svg>
        <div className="tt-hub" style={{ "--hx": hub.x + "px" } as React.CSSProperties}>
          <img src="/assets/trinity-logo.svg" alt="" width={40} height={40} />
        </div>
        <div className="tt-team-grid">
          {ORDER.map((idx) => {
            const m = team[idx];
            return (
              <article className={"tt-member" + (idx === 0 ? " is-founder" : "")} key={m.name}>
                <div className="tt-member-top">
                  <div className="tt-orb">
                    <span className="tt-orb-ring" />
                    <span className="tt-orb-ring two" />
                    <b>{m.initials}</b>
                  </div>
                  <span className="tt-member-role">{m.role}</span>
                </div>
                <h3 data-role={m.role}>{m.name}</h3>
                <p>{m.bio}</p>
                <div className="tt-member-tags">
                  {m.focus.map((f) => (
                    <em key={f}>{f}</em>
                  ))}
                </div>
                <a href={"mailto:" + m.email} className="tt-member-mail">
                  <Mail size={15} /> {m.email}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   BOOKING — a rolling wave of stars overhead; the four steps rise out of it
   one after another, with one clear way to get started.
   ========================================================================== */
export function BookingWave({ n = "05", email }: { n?: string; email: string }) {
  return (
    <section className="tt-wave" data-section="Start a Project" data-stars="wave" aria-label="Start your project">
      <div className="wrap">
        <header className="tt-wave-head" data-reveal>
          <SectionTag n={n} label="Start a Project" />
          <h2 className="tt-display">
            Your project in <span className="tt-gradient-text">five easy steps.</span>
          </h2>
          <p className="tt-lede">
            No long forms, no confusion. Choose what you need, get an honest proposal and
            track everything with your own project ID.
          </p>
        </header>
        <ol className="tt-wave-steps" data-reveal="wave-rise">
          {BOOKING_STEPS.map((s, i) => (
            <li key={s.title} style={{ "--i": i } as React.CSSProperties}>
              <span className="tt-wave-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="tt-wave-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="tt-wave-actions" data-reveal="zoom">
          <Link to="/project" className="tt-btn tt-btn-primary lg">
            Start Your Project <ArrowRight size={19} />
          </Link>
          <a href={"mailto:" + email} className="tt-btn tt-btn-ghost">
            <Mail size={17} /> Email us
          </a>
          <Link to="/track" className="tt-btn tt-btn-ghost">
            <Radar size={17} /> Track a project
          </Link>
        </div>
      </div>
    </section>
  );
}
