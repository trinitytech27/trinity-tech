import { CheckCircle2 } from "lucide-react";
import { deliverables, projects as seed } from "../content";
import { DemoStage, WorkGallery } from "../ShowcaseFX";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";
import { CtaBand } from "./Shared";

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
            <b>4</b>
            <span>Project categories</span>
          </div>
        </div>
      </PageHero>

      <DemoStage items={all} />

      <WorkGallery items={all} />

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

      <CtaBand title="Want a website like these?" text="Share your idea and we'll build a live, professional experience for your business." />
    </div>
  );
}
