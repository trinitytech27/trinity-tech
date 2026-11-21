import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Lightbulb, Rocket, CheckCircle2 } from "lucide-react";
import { deliverables, pillars, steps, techStack } from "../content";
import { VelocityMarquee, useProcessScrub } from "../ShowcaseFX";
import { PageHero, useRefreshOnLoad } from "../FX3D";
import { PILLAR_ICONS } from "../Home";
import { SectionTag } from "../Scenes";
import { gsap } from "../scroll";

const STEP_ICONS = [<Hammer size={20} key="b" />, <Lightbulb size={20} key="i" />, <Rocket size={20} key="t" />];
const CODES: Record<string, string> = {
  web: "WEB",
  uiux: "UI/UX",
  business: "BIZ",
  redesign: "REDO",
  creative: "XP",
};

/* --------------------------------------------------------------------------
   Services on a 3D ring around the star sphere. Each scroll turns the ring
   to the next service; the one facing you is lit and its details show below.
   -------------------------------------------------------------------------- */
function ServiceOrbit() {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const N = pillars.length;

  useLayoutEffect(() => {
    const el = root.current;
    const rg = ring.current;
    if (!el || !rg) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-orbit");
      const cards = gsap.utils.toArray<HTMLElement>(".tt-so-card", rg);
      const step = 360 / N;
      const radius = () => Math.min(480, window.innerWidth * (window.innerWidth < 760 ? 0.46 : 0.3));
      const place = () =>
        cards.forEach((c, i) => {
          c.style.transform = `translate(-50%, -50%) rotateY(${i * step}deg) translateZ(${radius()}px)`;
        });
      const shade = (rot: number) =>
        cards.forEach((c, i) => {
          let a = (((i * step + rot) % 360) + 360) % 360;
          if (a > 180) a = 360 - a;
          const f = 1 - a / 180;
          c.style.opacity = String(0.12 + f * 0.88);
          c.classList.toggle("is-front", f > 0.86);
        });
      place();
      shade(0);
      const state = { rot: 0 };
      const tween = gsap.to(state, {
        rot: -(360 - step),
        ease: "none",
        onUpdate: () => {
          gsap.set(rg, { rotationY: state.rot });
          shade(state.rot);
          setActive(((Math.round(-state.rot / step) % N) + N) % N);
        },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * N * 0.6,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: place,
          snap: { snapTo: 1 / (N - 1), duration: { min: 0.25, max: 0.7 }, ease: "power1.inOut", delay: 0.05, inertia: false },
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.classList.remove("is-orbit");
        gsap.set(rg, { clearProps: "transform" });
        cards.forEach((c) => {
          c.style.transform = "";
          c.style.opacity = "";
          c.classList.remove("is-front");
        });
      };
    });
    return () => mm.revert();
  }, [N]);

  const cur = pillars[active];
  return (
    <section ref={root} className="tt-so" data-section="Services" aria-label="Our services">
      <header className="tt-so-head wrap">
        <SectionTag n="01" label="5 Services" />
        <h2 className="tt-display">
          Spin through <span className="tt-gradient-text">every service.</span>
        </h2>
      </header>
      <div className="tt-so-stage">
        <div ref={ring} className="tt-so-ring">
          {pillars.map((p, i) => (
            <article key={p.key} className={"tt-so-card" + (i === active ? " is-active" : "")}>
              <span className="tt-so-code">{CODES[p.key]}</span>
              <h3>{p.title}</h3>
              <small>{p.items.length} specialities</small>
              <span className="tt-so-icon">{PILLAR_ICONS[p.key]}</span>
              <span className="tt-so-explore">
                Explore <ArrowRight size={14} />
              </span>
            </article>
          ))}
        </div>
      </div>
      <div className="tt-so-detail wrap" key={cur.key}>
        <div>
          <span className="tt-so-kicker">
            {String(active + 1).padStart(2, "0")} · {cur.title}
          </span>
          <p>{cur.desc}</p>
          <ul>
            {cur.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
          <div className="tt-so-dashes" aria-hidden="true">
            {pillars.map((p, i) => (
              <i key={p.key} className={i === active ? "on" : ""} />
            ))}
          </div>
        </div>
        <Link to="/project" className="tt-btn tt-btn-primary">
          Start a {CODES[cur.key]} project <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  useRefreshOnLoad();
  const stepsRef = useRef<HTMLElement>(null);
  useProcessScrub(stepsRef);

  return (
    <div className="tt-page">
      <PageHero
        index="02"
        kicker="Services"
        title="Everything you need to"
        accent="grow online."
        sub="From your first website to a complete digital platform — designed with care, built on modern technology and made to perform."
      />

      <ServiceOrbit />

      <section ref={stepsRef} className="tt-section wrap" data-section="Process" aria-label="How we work">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">How We Work</span>
          <h2 className="tt-title">Build. Innovate. Transform.</h2>
        </header>
        <div className="tt-steps" data-reveal="steps">
          <div className="tt-steps-line" aria-hidden="true">
            <span />
          </div>
          {steps.map((x, i) => (
            <div className="tt-step" key={x.step}>
              <div className="tt-step-badge">{STEP_ICONS[i]}</div>
              <span className="tt-step-num">{x.step}</span>
              <h3>{x.title}</h3>
              <p>{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="tt-section" data-section="Technology">
        <header className="tt-section-head center wrap" data-reveal>
          <span className="tt-eyebrow">Technology</span>
          <h2 className="tt-title">
            Built with a <span className="tt-gradient-text">modern stack.</span>
          </h2>
        </header>
        <VelocityMarquee a={techStack.slice(0, 5)} b={techStack.slice(5)} />
      </div>

      {/* everything included — shown together in one panel */}
      <section className="tt-section wrap" data-section="Included" aria-label="Included with every project">
        <div className="tt-included" data-reveal="zoom">
          <div className="tt-included-head">
            <span className="tt-eyebrow">Included</span>
            <h2 className="tt-title">
              What you get with <span className="tt-gradient-text">every website.</span>
            </h2>
          </div>
          <div className="tt-included-grid">
            {deliverables.map((d) => (
              <div className="tt-included-item" key={d.title}>
                <CheckCircle2 size={20} />
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
