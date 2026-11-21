import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code,
  Palette,
  Briefcase,
  RefreshCw,
  Sparkles,
  Hammer,
  Lightbulb,
  Rocket,
  Target,
  Eye,
} from "lucide-react";
import { projects as seed, brand, pillars, steps, audiences } from "./content";
import { EnquiryPreview } from "./Contact";
import {
  DemoStage,
  Statement,
  VelocityMarquee,
  WorkGallery,
  useHeroParallax,
  useProcessScrub,
} from "./ShowcaseFX";

type SiteLike = { projects: (typeof seed)[number][] };

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  web: <Code size={22} />,
  uiux: <Palette size={22} />,
  business: <Briefcase size={22} />,
  redesign: <RefreshCw size={22} />,
  creative: <Sparkles size={22} />,
};
const STEP_ICONS = [
  <Hammer size={20} key="b" />,
  <Lightbulb size={20} key="i" />,
  <Rocket size={20} key="t" />,
];

export default function Home({
  site,
  console: aiConsole,
  affiliation,
  contact,
}: {
  site: SiteLike;
  console: React.ReactNode;
  affiliation: React.ReactNode;
  contact: React.ReactNode;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef);
  useProcessScrub(stepsRef);

  const p = site.projects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);

  // Live demo projects shown on the homepage: StarX Live and TicketX
  const featuredCards = [
    p.find((x) => x.slug === "starx-live") || seed[0],
    p.find((x) => x.slug === "ticketx") || seed[1],
  ];

  return (
    <div className="tt-home">
      {/* 1 — HERO */}
      <section ref={heroRef} className="tt-hero" aria-label="Trinity Tech">
        <div className="tt-hero-bg" aria-hidden="true">
          <div className="tt-hero-grid" />
          <div className="tt-hero-glow one" />
          <div className="tt-hero-glow two" />
        </div>
        <div className="wrap tt-hero-inner">
          <div className="tt-hero-copy hero-enter">
            <span className="tt-kicker">
              <span className="tt-kicker-dot" /> Web Development &amp; Digital Solutions
            </span>
            <h1 className="tt-hero-title">
              Your Vision.
              <br />
              Our Technology.
              <br />
              <span className="tt-gradient-text">Infinite Possibilities.</span>
            </h1>
            <p className="tt-hero-sub">
              Trinity Tech transforms ideas into professional digital experiences —
              modern websites, premium UI/UX and custom solutions that help your
              business stand out and grow online.
            </p>
            <div className="tt-hero-actions">
              <Link to="/project" className="tt-btn tt-btn-primary">
                Start Your Project <ArrowRight size={18} />
              </Link>
              <a href="#featured-projects" className="tt-btn tt-btn-ghost">
                View Live Demos
              </a>
            </div>
            <ul className="tt-hero-points">
              <li>
                <Check size={16} /> Responsive on every device
              </li>
              <li>
                <Check size={16} /> Modern, fast technology
              </li>
              <li>
                <Check size={16} /> Transparent project tracking
              </li>
            </ul>
          </div>
          <div className="tt-hero-console hero-enter">{aiConsole}</div>
        </div>
      </section>

      {/* 2 — ROLLING MARQUEE (speed follows scroll) */}
      <VelocityMarquee />

      {/* 3 — LIVE DEMOS: pinned stage */}
      <DemoStage items={featuredCards} />

      {/* 4 — STATEMENT: lines slide apart */}
      <Statement />

      {/* 5 — ALL WORK: horizontal rolling gallery */}
      <WorkGallery items={p} />

      {/* 6 — SERVICES */}
      <section id="services" className="tt-section wrap" aria-label="What we do">
        <header className="tt-section-head" data-reveal>
          <span className="tt-eyebrow">What We Do</span>
          <h2 className="tt-title">Everything you need to grow online.</h2>
          <p className="tt-lede">
            From your first website to a complete digital platform — designed with care
            and built to perform.
          </p>
        </header>
        <div className="tt-services" data-reveal-stagger="90">
          {pillars.map((x, i) => (
            <article
              className={"tt-service" + (i === 0 ? " wide" : "")}
              key={x.key}
              data-reveal="rise"
            >
              <div className="tt-service-icon">{PILLAR_ICONS[x.key]}</div>
              <h3>{x.title}</h3>
              <p>{x.desc}</p>
              <ul>
                {x.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 7 — PROCESS: BUILD. INNOVATE. TRANSFORM. */}
      <section ref={stepsRef} className="tt-section wrap" aria-label="How we work">
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

      {/* 8 — ABOUT: MISSION / VISION / AUDIENCE */}
      <section className="tt-section wrap" aria-label="About Trinity Tech">
        <div className="tt-about">
          <div className="tt-about-intro" data-reveal="from-left">
            <span className="tt-eyebrow">About Trinity Tech</span>
            <h2 className="tt-title">Your digital partner, from idea to impact.</h2>
            <p className="tt-lede">{brand.core}</p>
            <div className="tt-audience">
              <span>Built for</span>
              <div>
                {audiences.map((a) => (
                  <em key={a}>{a}</em>
                ))}
              </div>
            </div>
          </div>
          <div className="tt-mv" data-reveal-stagger="120">
            <div className="tt-mv-card" data-reveal="zoom">
              <div className="tt-mv-icon">
                <Target size={20} />
              </div>
              <h3>Our Mission</h3>
              <p>{brand.mission}</p>
            </div>
            <div className="tt-mv-card dark" data-reveal="zoom">
              <div className="tt-mv-icon">
                <Eye size={20} />
              </div>
              <h3>Our Vision</h3>
              <p>{brand.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — PROJECT BOOKING */}
      <section
        id="choose-website"
        className="tt-section tt-booking"
        aria-label="Start your project"
      >
        <div className="wrap">
          <header className="tt-section-head center" data-reveal>
            <span className="tt-eyebrow">Start Your Project</span>
            <h2 className="tt-title">What would you like to build?</h2>
            <p className="tt-lede">
              Pick a website type, choose your features and get an honest proposal with
              your own tracking code — then continue with us on WhatsApp.
            </p>
          </header>
          <ol className="tt-booking-steps" data-reveal-stagger="110">
            {[
              "Choose a website type",
              "Select features",
              "Share your details",
              "Track your project",
            ].map((t, i) => (
              <li key={t} data-reveal="rise">
                <b>{i + 1}</b> {t}
              </li>
            ))}
          </ol>
          <div className="tt-booking-panel" data-reveal="booking">
            <EnquiryPreview />
          </div>
        </div>
      </section>

      {/* 10 — CTA BAND */}
      <section className="wrap tt-cta-wrap" aria-label="Get started">
        <div className="tt-cta" data-reveal="zoom">
          <div>
            <h2>Ready to build your digital identity?</h2>
            <p>
              Tell us about your idea — we&apos;ll help shape it into a professional
              online experience.
            </p>
          </div>
          <div className="tt-cta-actions">
            <Link to="/project" className="tt-btn tt-btn-light">
              Start Your Project <ArrowRight size={18} />
            </Link>
            <a href="#contact" className="tt-btn tt-btn-outline-light">
              Contact us
            </a>
          </div>
        </div>
      </section>

      <div className="wrap">{affiliation}</div>

      {contact}
    </div>
  );
}
