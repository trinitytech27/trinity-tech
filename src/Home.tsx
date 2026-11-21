import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Code,
  Palette,
  Briefcase,
  RefreshCw,
  Sparkles,
  MousePointerClick,
  ListChecks,
  Send,
  Radar,
  Mail,
} from "lucide-react";
import { projects as seed, pillars, team } from "./content";
import { Statement, VelocityMarquee, useHeroParallax } from "./ShowcaseFX";
import { FlyThrough, SpinRing, TiltCard, useRefreshOnLoad, type FlyItem } from "./FX3D";

type SiteLike = { projects: (typeof seed)[number][] };

export const PILLAR_ICONS: Record<string, React.ReactNode> = {
  web: <Code size={22} />,
  uiux: <Palette size={22} />,
  business: <Briefcase size={22} />,
  redesign: <RefreshCw size={22} />,
  creative: <Sparkles size={22} />,
};

export const BOOKING_STEPS = [
  { icon: <MousePointerClick size={22} />, title: "Choose a website type", desc: "Portfolio, business, e-commerce, booking, custom app and more." },
  { icon: <ListChecks size={22} />, title: "Select your features", desc: "Pick the pages and features you need — nothing you don't." },
  { icon: <Send size={22} />, title: "Share your details", desc: "Tell us about your goals and receive an honest proposal." },
  { icon: <Radar size={22} />, title: "Track your project", desc: "Your tracking ID shows progress at every stage." },
];

export function flyItemsFrom(projects: SiteLike["projects"]): FlyItem[] {
  const out: FlyItem[] = [];
  projects.forEach((p) => {
    out.push({ src: p.image, title: p.short, kicker: p.category });
    if (p.slug === "starx-connect" || p.slug === "audiox") {
      out.push({ src: p.mobile, title: p.short + " — mobile", kicker: "Responsive design", tall: true });
    }
  });
  return out;
}

export default function Home({
  site,
  console: aiConsole,
}: {
  site: SiteLike;
  console: React.ReactNode;
}) {
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef);
  useRefreshOnLoad();

  const p = site.projects
    .filter((x) => x.published)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="tt-home">
      {/* 1 — HERO */}
      <section ref={heroRef} className="tt-hero" data-section="Trinity Tech" aria-label="Trinity Tech">
        <div className="wrap tt-hero-inner solo">
          <div className="tt-hero-copy hero-enter">
            <span className="tt-kicker">
              <span className="tt-kicker-dot" /> Web Development &amp; Digital Solutions
            </span>
            <h1 className="tt-hero-brand" aria-label="Trinity Tech">
              <span className="tt-3d-text" data-text="Trinity">Trinity</span>{" "}
              <span className="tt-3d-text accent" data-text="Tech">Tech</span>
            </h1>
            <p className="tt-hero-tagline">
              Your Vision. Our Technology. <span className="tt-gradient-text">Infinite Possibilities.</span>
            </p>
            <p className="tt-hero-sub">
              We transform ideas into professional digital experiences — modern websites,
              premium UI/UX and custom solutions that help your business stand out and grow
              online.
            </p>
            <div className="tt-hero-actions">
              <Link to="/project" className="tt-btn tt-btn-primary">
                Start Your Project <ArrowRight size={18} />
              </Link>
              <Link to="/work" className="tt-btn tt-btn-ghost">
                Explore Our Work
              </Link>
            </div>
            <div className="tt-scroll-cue" aria-hidden="true">
              <span />
              Scroll to explore
            </div>
          </div>
        </div>
      </section>

      {/* 2 — ROLLING MARQUEE */}
      <VelocityMarquee />

      {/* 3 — FLY THROUGH THE WORK */}
      <FlyThrough items={flyItemsFrom(p)} cta={{ to: "/work", label: "See every live demo" }} />

      {/* 4 — STATEMENT */}
      <Statement />

      {/* 5 — SERVICES RING */}
      <SpinRing
        kicker="What We Do"
        title="Spin through"
        accent="every service."
        items={pillars.map((x) => ({
          title: x.title,
          desc: x.desc,
          icon: PILLAR_ICONS[x.key],
          tag: x.items[0],
        }))}
        cta={{ to: "/services", label: "Explore all services" }}
      />

      {/* 6 — TEAM */}
      <section className="tt-section wrap" data-section="Team" aria-label="Our team">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">The Team</span>
          <h2 className="tt-title">
            The people behind <span className="tt-gradient-text">the vision.</span>
          </h2>
        </header>
        <div className="tt-team-row" data-reveal-stagger="120">
          {team.map((m) => (
            <TiltCard className="tt-team-mini" key={m.name} data-reveal="rise">
              <div className="tt-avatar">{m.initials}</div>
              <span className="tt-team-role">{m.role}</span>
              <h3>{m.name}</h3>
              <a href={"mailto:" + m.email} className="tt-team-mail">
                <Mail size={14} /> {m.email}
              </a>
            </TiltCard>
          ))}
        </div>
        <div className="tt-center" data-reveal>
          <Link to="/about" className="tt-link">
            Meet the team <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 7 — BOOKING TEASER */}
      <section className="tt-section wrap" data-section="Booking" aria-label="Start your project">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">Project Booking</span>
          <h2 className="tt-title">
            Four steps to your <span className="tt-gradient-text">new website.</span>
          </h2>
        </header>
        <ol className="tt-flow" data-reveal="flow">
          {BOOKING_STEPS.map((s, i) => (
            <li className="tt-flow-step" key={s.title} style={{ "--i": i } as React.CSSProperties}>
              <span className="tt-flow-icon">{s.icon}</span>
              <span className="tt-flow-num">Step {i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="tt-center" data-reveal>
          <Link to="/project" className="tt-btn tt-btn-primary">
            Book Your Project <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 8 — ASK SPIDEYY */}
      <section className="tt-section wrap" data-section="Assistant" aria-label="Ask Spideyy">
        <div className="tt-ask">
          <div data-reveal="from-left">
            <span className="tt-eyebrow">Instant Guidance</span>
            <h2 className="tt-title">Not sure where to start? Ask Spideyy.</h2>
            <p className="tt-lede">
              Our assistant can suggest the right website for your business, explain
              features and help you plan your project — any time.
            </p>
          </div>
          <div className="tt-ask-console" data-reveal="zoom">
            {aiConsole}
          </div>
        </div>
      </section>

      {/* 9 — CTA */}
      <section className="wrap tt-cta-wrap" aria-label="Get started">
        <div className="tt-cta" data-reveal="zoom">
          <div>
            <h2>Ready to build your digital identity?</h2>
            <p>Tell us about your idea — we&apos;ll help shape it into a professional online experience.</p>
          </div>
          <div className="tt-cta-actions">
            <Link to="/project" className="tt-btn tt-btn-light">
              Start Your Project <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="tt-btn tt-btn-outline-light">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
