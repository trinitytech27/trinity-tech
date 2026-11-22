import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail, Radar } from "lucide-react";
import { gsap, ScrollTrigger, showStars } from "./scroll";
import { team, siteTypes, PROJECT_ICONS, PROJECT_SCENES, type projects } from "./content";
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
   PROJECTS — fly-through, alternating sides. Each project comes out of deep
   space onto its own side (right, then left, then right…), the caption sits
   on the other side, and the stars draw the project's symbol opposite the
   image. When the next one arrives, the current screen rushes past the
   visitor and blurs away.
   ========================================================================== */
// every project shows its screenshot on the right, copy on the left
const sideOf = (_i: number) => "right" as const;
const opposite = (s: string) => (s === "right" ? "left" : "right");

export function ProjectQueue({ items, n = "02" }: { items: Project[]; n?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const inView = useRef(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  const starsFor = (i: number) => `${PROJECT_ICONS[items[i]?.slug] || "galaxy"}@${opposite(sideOf(i))}`;

  useEffect(() => {
    if (inView.current) showStars(starsFor(active));
  }, [active, items]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-flying");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-pf-card", el);
      const narrow = window.innerWidth < 760;
      // laptops: the screen sits on the right half (info card owns the left half)
      const sx = (_i: number) => (narrow ? 0 : 23); // vw
      const FROM_X = narrow ? 0 : -38; // next screen waits on the left…
      const EXIT_X = narrow ? 0 : 62; // …and the current one leaves to the right
      const pose = (x: number, y: number, z: number, scale: number, opacity: number, blur = 0) => ({
        xPercent: -50,
        yPercent: -50,
        x: x + "vw",
        y: y + "vh",
        z,
        scale,
        opacity,
        filter: `blur(${blur}px)`,
      });
      const MAIN_Y = narrow ? -9 : -3;
      // waiting far away, small, on the project's own side
      cards.forEach((c) => gsap.set(c, pose(FROM_X, MAIN_Y - 6, -1800, 0.5, 0)));

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
          onToggle: (self) => {
            inView.current = self.isActive;
            if (self.isActive) showStars(starsFor(activeRef.current));
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
          // the current screen rushes toward the visitor and blurs away
          tl.to(cards[i - 1], { ...pose(narrow ? 0 : EXIT_X, MAIN_Y + 4, narrow ? 900 : 300, narrow ? 1.6 : 1.15, 0, 14), duration: 1, ease: "power2.in" }, ">");
        }
        // the first project is already in place when the section arrives;
        // each next screen glides in from deep space
        if (i === 0) gsap.set(card, pose(sx(0), MAIN_Y, 0, 1, 1, 0));
        else tl.to(card, { ...pose(sx(i), MAIN_Y, 0, 1, 1, 0), duration: 1.1, ease: "power3.out" }, "<0.15");
        // and the one after it appears far behind, waiting
        if (cards[i + 1]) tl.to(cards[i + 1], { ...pose(FROM_X, MAIN_Y - 5, -1300, 0.55, 0.35, 2), duration: 0.8 }, "<0.3");
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
  const side = sideOf(active);
  return (
    <section ref={root} className="tt-pfly" data-section="Our Work" aria-label="Our live projects">
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
            style={{ zIndex: items.length - Math.abs(i - active) } as React.CSSProperties}
            aria-label={"Visit the " + p.short + " live site"}
          >
            <span className="tt-pf-chip">
              <b>{String(i + 1).padStart(2, "0")}</b> {p.category.split("/")[0].trim()}
            </span>
            <img src={p.image} alt={p.name + " live website"} loading="eager" decoding="async" />
          </a>
        ))}
      </div>
      {cur && (
        <div className={"tt-pf-caption on-" + opposite(side)} key={cur.slug}>
          {PROJECT_SCENES[cur.slug] && <img className="tt-scene-bg" src={PROJECT_SCENES[cur.slug]} alt="" aria-hidden="true" />}
          <span className="tt-pf-kicker">{cur.category}</span>
          <h3>{cur.short}</h3>
          <p className="tt-pf-quote">“{(cur as Project & { quote?: string }).quote || cur.headline}”</p>
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
      <div className={"tt-pf-progress on-" + side} aria-hidden="true">
        <b>{String(active + 1).padStart(2, "0")}</b>
        <i>
          <span style={{ transform: `scaleX(${(active + 1) / items.length})` }} />
        </i>
      </div>
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
    if (inView.current) showStars(siteTypes[active]?.icon + "@center");
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
        onToggle: (self) => {
          inView.current = self.isActive;
          if (self.isActive) showStars(siteTypes[activeRef.current]?.icon + "@center");
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
                <img className="tt-layer-art" src={t.art} alt="" loading="lazy" />
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
   TEAM — the stars form an atom; the three cards rise out of its centre and
   fan out (left · founder in front · right), like a hand of cards.
   ========================================================================== */
const ORDER = [1, 0, 2]; // Madhan (left) · Balajose (centre, in front) · Sanjay (right)

export function TeamAtom({ n = "04" }: { n?: string }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-fanning");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-member", el);
      const narrow = window.innerWidth < 760;
      // fan positions: [x (vw), y (vh), rotation, scale]
      const fan = narrow
        ? [
            [-20, 6, -9, 0.9],
            [0, 0, 0, 1],
            [20, 6, 9, 0.9],
          ]
        : [
            [-24, 5, -8, 0.94],
            [0, 0, 0, 1.04],
            [24, 5, 8, 0.94],
          ];
      gsap.set(cards, { xPercent: -50, yPercent: -50, x: 0, y: "12vh", scale: 0.2, rotate: 0, opacity: 0, rotateX: 50 });
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.5,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      // out of the atom's centre, rising up together…
      tl.to(cards, { y: "2vh", scale: 0.55, opacity: 1, rotateX: 20, duration: 0.6, stagger: 0.08 })
        // …then each card fans out to its place
        .to(cards, {
          x: (i) => fan[i][0] + "vw",
          y: (i) => fan[i][1] + "vh",
          rotate: (i) => fan[i][2],
          scale: (i) => fan[i][3],
          rotateX: 0,
          duration: 1,
          stagger: 0.12,
        })
        .to({}, { duration: 0.5 });
      return () => {
        el.classList.remove("is-fanning");
        gsap.set(cards, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="tt-atom" data-section="Team" data-stars="atom@top" aria-label="Our team">
      <header className="tt-atom-head wrap">
        <SectionTag n={n} label="The Team" />
        <h2 className="tt-display">
          The people behind <span className="tt-gradient-text">Trinity Tech.</span>
        </h2>
        <p className="tt-lede">One founder, two developers — and one shared obsession with building things that work beautifully.</p>
      </header>
      <div className="tt-atom-scene" aria-hidden="true" />
      <div className="tt-fan-stage">
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
