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
} from "lucide-react";
import { projects as seed } from "./content";
import { Statement, VelocityMarquee, useHeroParallax } from "./ShowcaseFX";
import { useRefreshOnLoad } from "./FX3D";
import { BookingWave, LayerStack, ProjectQueue, SectionTag, TeamAtom } from "./Scenes";

type SiteLike = { projects: (typeof seed)[number][]; email: string };

export const PILLAR_ICONS: Record<string, React.ReactNode> = {
  web: <Code size={22} />,
  uiux: <Palette size={22} />,
  business: <Briefcase size={22} />,
  redesign: <RefreshCw size={22} />,
  creative: <Sparkles size={22} />,
};

export const BOOKING_STEPS = [
  { icon: <MousePointerClick size={22} />, title: "Website type", desc: "Portfolio, business, e-commerce, booking, custom app and more." },
  { icon: <ListChecks size={22} />, title: "Features", desc: "Pick the pages and features you need — nothing you don't." },
  { icon: <Palette size={22} />, title: "Design", desc: "Choose a style, page count and the feel you want." },
  { icon: <Send size={22} />, title: "Your details", desc: "Just the basics so we know who we're building for." },
  { icon: <Radar size={22} />, title: "Contact & track", desc: "Email, Google Meet, WhatsApp or call — then track with your ID." },
];

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
      {/* 01 — HERO: the stars spell TRINITY TECH above this copy */}
      <section
        ref={heroRef}
        className="tt-hero tt-hero-stars"
        data-section="Trinity Tech"
        data-stars="text"
        aria-label="Trinity Tech"
      >
        <div className="wrap tt-hero-inner solo">
          <div className="tt-hero-copy hero-enter">
            <h1 className="tt-sr">Trinity Tech — Web Development &amp; Digital Solutions</h1>
            <span className="tt-kicker">
              <span className="tt-kicker-dot" /> Web Development &amp; Digital Solutions
            </span>
            <p className="tt-hero-tagline">
              Your Vision. Our Code. <span className="tt-gradient-text">Infinite Possibilities.</span>
            </p>
            <p className="tt-hero-sub">
              We turn ideas into fast, beautiful websites and digital products that help
              businesses, startups and creators grow online.
            </p>
            <div className="tt-hero-actions">
              <Link to="/project" className="tt-btn tt-btn-primary lg">
                Start Your Project <ArrowRight size={18} />
              </Link>
              <Link to="/work" className="tt-btn tt-btn-ghost">
                Explore Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VelocityMarquee />

      {/* 02 — PROJECTS, one by one */}
      <ProjectQueue items={p} n="02" />

      {/* infinity statement */}
      <div data-section="Possibilities" data-stars="infinity">
        <Statement />
      </div>

      {/* 03 — WEBSITE TYPES layered stack */}
      <LayerStack n="03" />

      {/* 04 — TEAM atom */}
      <TeamAtom n="04" />

      {/* 05 — BOOKING wave */}
      <BookingWave n="05" email={site.email} />

      {/* 06 — ASK + CTA, stars form the Trinity mark */}
      <section className="tt-section wrap" data-section="Assistant" data-stars="trinity" aria-label="Ask Spideyy">
        <div className="tt-ask">
          <div data-reveal="from-left">
            <SectionTag n="06" label="Instant Guidance" />
            <h2 className="tt-display">
              Not sure where to start? <span className="tt-gradient-text">Ask Spideyy.</span>
            </h2>
            <p className="tt-lede">
              Our assistant suggests the right website for your business, explains features
              and helps you plan your project — any time of day.
            </p>
          </div>
          <div className="tt-ask-console" data-reveal="zoom">
            {aiConsole}
          </div>
        </div>
      </section>

      {/* 07 — FINALE: the stars form the Trinity mark, then one last call */}
      <section className="wrap tt-finale" data-section="Get Started" data-stars="logo" aria-label="Get started">
        <h2 className="tt-display tt-finale-title" data-reveal>
          Let&apos;s build something <span className="tt-gradient-text">remarkable.</span>
        </h2>
      </section>
    </div>
  );
}
