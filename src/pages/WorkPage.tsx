import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BookOpen, Briefcase, Calculator, Camera, CheckCircle2, ClipboardList, GraduationCap, ListChecks, PartyPopper, PenLine, Rocket, Store, UserRound, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { deliverables, projects as seed, prototypes } from "../content";

const PROTO_ICONS: Record<string, LucideIcon> = {
  portfolio: UserRound, blog: PenLine, agency: Briefcase, restaurant: UtensilsCrossed, shop: Store, educational: GraduationCap,
  quiz: ListChecks, landing: Rocket, invitation: PartyPopper, calculator: Calculator, survey: ClipboardList, gallery: Camera,
};
import { DemoStage } from "../ShowcaseFX";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";

type Project = (typeof seed)[number];

export default function WorkPage({ projects }: { projects: Project[] }) {
  useRefreshOnLoad();
  const all = projects.filter((p) => p.published).sort((a, b) => a.order - b.order);

  return (
    <div className="tt-page">
      <PageHero
        index="01"
        kicker="Our Work"
        title="Every project is a"
        accent="live demo."
        sub="Real websites and web applications, live on the web right now. Scroll through each one, open the live demo and see the quality you can expect."
      >
        <div className="tt-stats" data-reveal-stagger="90">
          <div data-reveal="rise">
            <b>{all.length}</b>
            <span>Live projects</span>
          </div>
          <div data-reveal="rise">
            <b>100%</b>
            <span>Responsive builds</span>
          </div>
          <div data-reveal="rise">
            <b>{prototypes.length}</b>
            <span>Prototypes to try</span>
          </div>
        </div>
      </PageHero>

      <DemoStage items={all} />

      <section className="tt-section wrap" data-section="Prototypes" aria-label="Prototypes for every website type">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">Prototypes</span>
          <h2 className="tt-title">
            Try a sample of <span className="tt-gradient-text">every website type.</span>
          </h2>
          <p className="tt-proto-sub">
            Each prototype explains the website type and shows several ready-made models you can click through. Pick the one closest to
            your business and we build yours with your name, content and photos.
          </p>
        </header>
        <div className="tt-grid-3 tt-proto-grid" data-reveal-stagger="60">
          {prototypes.map((p) => {
            const Icon = PROTO_ICONS[p.key] ?? BookOpen;
            return (
              <article className="tt-glass tt-feature tt-proto" key={p.key} data-reveal="rise">
                <div className="tt-proto-top">
                  <span className="tt-proto-icon"><Icon size={20} /></span>
                  <span className="tt-proto-models">{p.models}</span>
                </div>
                <span className="tt-proto-type">{p.category}</span>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="tt-proto-actions">
                  <a href={p.url} target="_blank" rel="noreferrer" className="tt-btn tt-btn-primary tt-proto-btn">
                    Check prototype <ArrowUpRight size={16} />
                  </a>
                  <Link to={"/project?category=" + encodeURIComponent(p.category)} className="tt-proto-link">
                    Start one like this <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>


      <section className="tt-section wrap" data-section="Included" aria-label="What every project includes">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">With Every Project</span>
          <h2 className="tt-title">
            Quality that comes <span className="tt-gradient-text">standard.</span>
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

    </div>
  );
}
