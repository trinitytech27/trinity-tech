import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail, Radar } from "lucide-react";
import { gsap, ScrollTrigger } from "./scroll";
import { team, siteTypes, type projects } from "./content";
import { BOOKING_STEPS } from "./Home";

type Project = (typeof projects)[number];

const DESKTOP = "(min-width: 960px) and (prefers-reduced-motion: no-preference)";

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

const host = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/* ==========================================================================
   PROJECTS — one at a time. Each project comes forward out of deep space,
   holds in the centre with "View Live Website" / "View Details", then flies
   past as the next one arrives.
   ========================================================================== */
export function ProjectQueue({ items, n = "02" }: { items: Project[]; n?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-queued");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-q-card", el);
      const marks: number[] = [0];
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * (cards.length * 1.05),
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = self.animation ? self.animation.time() : 0;
            let idx = 0;
            marks.forEach((m, i) => t >= m && (idx = i));
            setActive(idx);
          },
        },
      });
      // the first project arrives while the section scrolls into place
      gsap.fromTo(
        cards[0],
        { z: -900, opacity: 0, rotateX: 14 },
        {
          z: 0,
          opacity: 1,
          rotateX: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 85%", end: "top top", scrub: 0.8 },
        },
      );
      gsap.set(cards.slice(1), { z: -1600, opacity: 0, rotateX: 18 });
      tl.to({}, { duration: 0.5 });
      cards.forEach((card, i) => {
        if (i === 0) return;
        const prev = cards[i - 1];
        // outgoing project flies past the visitor and clears quickly…
        tl.to(prev, { z: 560, y: "-8vh", rotateX: -12, duration: 0.7, ease: "power1.in" })
          .to(prev, { opacity: 0, duration: 0.32, ease: "power1.in" }, "<")
          // …then the next one comes forward out of deep space
          .to(card, { z: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "power2.out" }, "<0.3");
        marks.push(tl.duration() - 0.5);
        tl.to({}, { duration: 0.55 });
      });
      return () => {
        el.classList.remove("is-queued");
        gsap.set(cards, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <section ref={root} className="tt-queue" data-section="Our Work" data-stars="code" aria-label="Our work">
      <header className="tt-queue-head wrap">
        <div>
          <SectionTag n={n} label="Our Work" />
          <h2 className="tt-display">
            Live projects, <span className="tt-gradient-text">one by one.</span>
          </h2>
        </div>
        <div className="tt-queue-count" aria-hidden="true">
          <b>{String(active + 1).padStart(2, "0")}</b>
          <span>/ {String(items.length).padStart(2, "0")}</span>
          <div>
            {items.map((p, i) => (
              <i key={p.slug} className={i === active ? "on" : i < active ? "done" : ""} />
            ))}
          </div>
        </div>
      </header>
      <div className="tt-queue-stage">
        {items.map((p, i) => (
          <article
            key={p.slug}
            className={"tt-q-card" + (i === active ? " is-active" : "")}
            style={{ "--project-color": p.color, zIndex: items.length - i } as React.CSSProperties}
            data-reveal="rise"
          >
            <a href={p.url} target="_blank" rel="noreferrer" className="tt-q-shot" aria-label={"Open " + p.short + " live website"}>
              <span className="tt-q-bar">
                <span className="tt-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="tt-url">{host(p.url)}</span>
              </span>
              <img src={p.image} alt={p.name + " live website"} loading="lazy" decoding="async" />
            </a>
            <div className="tt-q-info">
              <span className="tt-q-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="tt-q-cat">{p.category}</span>
              <h3>{p.short}</h3>
              <p>{p.summary}</p>
              <ul>
                {p.features.slice(0, 3).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="tt-q-actions">
                <a href={p.url} target="_blank" rel="noreferrer" className="tt-btn tt-btn-primary">
                  View Live Website <ArrowUpRight size={17} />
                </a>
                <Link to={"/work/" + p.slug} className="tt-btn tt-btn-ghost">
                  View Details <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   WEBSITE TYPES — a tilted stack of glowing layers next to a star helix.
   Scrolling lifts each layer off the stack to reveal the next; the panel on
   the left follows the active layer.
   ========================================================================== */
export function LayerStack({ n = "03" }: { n?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const N = siteTypes.length;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-stacked");
      const layers = gsap.utils.toArray<HTMLElement>(".tt-layer", el);
      const place = (p: number) => {
        layers.forEach((layer, k) => {
          const d = k - p;
          if (d < 0) {
            // lifted off and fading away
            gsap.set(layer, { z: 70 + -d * 360, y: d * 40, opacity: Math.max(0, 1 + d * 1.6) });
          } else {
            gsap.set(layer, { z: 70 - d * 86, y: 0, opacity: Math.max(0.22, 1 - d * 0.2) });
          }
          layer.classList.toggle("is-top", Math.abs(d) < 0.5);
        });
      };
      place(0);
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * N * 0.55,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress * (N - 1);
          place(p);
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
    <section ref={root} className="tt-layers" data-section="Website Types" data-stars="helixV" aria-label="Websites we build">
      <div className="tt-layers-inner wrap">
        <div className="tt-layers-copy">
          <SectionTag n={n} label="Website Types" />
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
        {/* phones: every type as a readable card */}
        <div className="tt-layers-list" data-reveal-stagger="80">
          {siteTypes.map((t, k) => (
            <Link key={t.title} to={"/project?category=" + encodeURIComponent(t.category)} className="tt-layer-card" data-reveal="rise">
              <span className="tt-layer-kicker">
                {String(k + 1).padStart(2, "0")} · {t.sub}
              </span>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className="tt-layer-tags">
                {t.tags.map((x) => (
                  <em key={x}>{x}</em>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   TEAM — the stars form an atom; each member's card travels along an orbit
   and settles into place (founder in the centre).
   ========================================================================== */
const ORDER = [1, 0, 2]; // Madhan (left) · Balajose (centre) · Sanjay (right)

export function TeamAtom({ n = "04" }: { n?: string }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      el.classList.add("is-orbiting");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-member", el);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.8,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((card, i) => {
        const slot = Number(card.dataset.slot); // -1, 0, 1
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const RX = vw * 0.32;
        const RY = vh * 0.16;
        const tilt = ((i - 1) * Math.PI) / 3;
        const start = i * 2.1;
        // points along this member's orbit, then the final slot
        const frames = [0, 0.33, 0.66].map((f) => {
          const a = start + f * Math.PI * 1.4;
          const x = Math.cos(a) * RX;
          const y = Math.sin(a) * RY;
          return {
            x: x * Math.cos(tilt) - y * Math.sin(tilt),
            y: x * Math.sin(tilt) + y * Math.cos(tilt),
          };
        });
        const finalX = slot * Math.min(vw * 0.29, 400);
        tl.fromTo(
          card,
          { x: frames[0].x, y: frames[0].y, scale: 0.35, rotateY: 60, rotateZ: -12, opacity: 0 },
          {
            keyframes: [
              { x: frames[1].x, y: frames[1].y, scale: 0.55, rotateY: 40, rotateZ: -6, opacity: 1, duration: 0.4 },
              { x: frames[2].x, y: frames[2].y, scale: 0.75, rotateY: 20, rotateZ: 4, duration: 0.4 },
              { x: finalX, y: slot === 0 ? -18 : 12, scale: slot === 0 ? 1.04 : 0.96, rotateY: 0, rotateZ: 0, duration: 0.5 },
            ],
          },
          i * 0.35,
        );
      });
      tl.to({}, { duration: 0.6 });
      return () => {
        el.classList.remove("is-orbiting");
        gsap.set(cards, { clearProps: "all" });
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
      <div className="tt-atom-stage">
        {ORDER.map((idx, i) => {
          const m = team[idx];
          return (
            <article
              className={"tt-member" + (idx === 0 ? " is-founder" : "")}
              key={m.name}
              data-slot={i - 1}
              data-reveal="rise"
            >
              <div className="tt-member-top">
                <div className="tt-orb">
                  <span className="tt-orb-ring" />
                  <span className="tt-orb-ring two" />
                  <b>{m.initials}</b>
                </div>
                <span className="tt-member-role">{m.role}</span>
              </div>
              <h3>{m.name}</h3>
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
            Your project in <span className="tt-gradient-text">four easy steps.</span>
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
