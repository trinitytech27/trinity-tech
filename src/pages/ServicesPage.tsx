import { useRef, useState } from "react";
import { Hammer, Lightbulb, Rocket, Plus, Minus, CheckCircle2 } from "lucide-react";
import { deliverables, pillars, publicFaqs, steps, techStack } from "../content";
import { VelocityMarquee } from "../ShowcaseFX";
import { useProcessScrub } from "../ShowcaseFX";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";
import { PILLAR_ICONS } from "../Home";
import { CtaBand } from "./Shared";

const STEP_ICONS = [<Hammer size={20} key="b" />, <Lightbulb size={20} key="i" />, <Rocket size={20} key="t" />];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="tt-faq" data-reveal-stagger="70">
      {publicFaqs.map((f, i) => (
        <div className={"tt-faq-item" + (open === i ? " open" : "")} key={f.q} data-reveal="rise">
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{f.q}</span>
            {open === i ? <Minus size={18} /> : <Plus size={18} />}
          </button>
          <div className="tt-faq-a">
            <p>{f.a}</p>
          </div>
        </div>
      ))}
    </div>
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

      <section className="tt-section wrap tt-first" data-section="Services" aria-label="Our services">
        <div className="tt-services" data-reveal-stagger="90">
          {pillars.map((x, i) => (
            <TiltCard className={"tt-service" + (i === 0 ? " wide" : "")} key={x.key} data-reveal="rise" max={5}>
              <div className="tt-service-icon">{PILLAR_ICONS[x.key]}</div>
              <h3>{x.title}</h3>
              <p>{x.desc}</p>
              <ul>
                {x.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </section>

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

      <section className="tt-section wrap" data-section="Included" aria-label="Included with every project">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">Included</span>
          <h2 className="tt-title">
            What you get with <span className="tt-gradient-text">every website.</span>
          </h2>
        </header>
        <div className="tt-grid-3" data-reveal-stagger="80">
          {deliverables.map((d) => (
            <TiltCard className="tt-glass tt-feature" key={d.title} data-reveal="rise">
              <CheckCircle2 size={22} className="tt-feature-icon" />
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="tt-section wrap tt-narrow" data-section="FAQ" aria-label="Frequently asked questions">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">FAQ</span>
          <h2 className="tt-title">Questions clients ask.</h2>
        </header>
        <Faq />
      </section>

      <CtaBand />
    </div>
  );
}
