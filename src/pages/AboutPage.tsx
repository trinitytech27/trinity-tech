import { Eye, Mail, Target, Sparkles, ArrowUpRight } from "lucide-react";
import { audiences, brand, team, values } from "../content";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";

export default function AboutPage() {
  useRefreshOnLoad();
  return (
    <div className="tt-page">
      <PageHero
        index="03"
        kicker="About Us"
        title="Your digital partner,"
        accent="from idea to impact."
        sub="Trinity Tech is a modern web development and digital solutions brand helping businesses, startups, entrepreneurs and individuals build a strong online presence."
      />

      <section className="tt-section wrap tt-first" data-section="Story" aria-label="Our story">
        <div className="tt-about">
          <div className="tt-about-intro" data-reveal="from-left">
            <span className="tt-eyebrow">Our Story</span>
            <h2 className="tt-title">Build. Innovate. Transform.</h2>
            <p className="tt-lede">{brand.core}</p>
            <p className="tt-lede tt-mt">
              We bring creative design, modern technology and reliable development together —
              and we make high-quality digital solutions accessible to businesses of every size.
            </p>
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
            <TiltCard className="tt-mv-card" data-reveal="zoom">
              <div className="tt-mv-icon">
                <Target size={20} />
              </div>
              <h3>Our Mission</h3>
              <p>{brand.mission}</p>
            </TiltCard>
            <TiltCard className="tt-mv-card accent" data-reveal="zoom">
              <div className="tt-mv-icon">
                <Eye size={20} />
              </div>
              <h3>Our Vision</h3>
              <p>{brand.vision}</p>
            </TiltCard>
          </div>
        </div>
      </section>

      <section className="tt-section wrap" data-section="Team" aria-label="Our team">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">The Team</span>
          <h2 className="tt-title">
            The people behind <span className="tt-gradient-text">the vision.</span>
          </h2>
          <p className="tt-lede">Hover or tap a card to learn more.</p>
        </header>
        <div className="tt-team" data-reveal-stagger="140">
          {team.map((m) => (
            <div className="tt-flip" key={m.name} data-reveal="rise" tabIndex={0}>
              <div className="tt-flip-inner">
                <div className="tt-flip-face front">
                  <div className="tt-avatar lg">{m.initials}</div>
                  <span className="tt-team-role">{m.role}</span>
                  <h3>{m.name}</h3>
                  <span className="tt-flip-hint">Hover to flip ↻</span>
                </div>
                <div className="tt-flip-face back">
                  <span className="tt-team-role">{m.role}</span>
                  <h3>{m.name}</h3>
                  <p>{m.bio}</p>
                  <ul>
                    {m.focus.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <a href={"mailto:" + m.email} className="tt-team-mail">
                    <Mail size={14} /> {m.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tt-section wrap" data-section="Values" aria-label="Our values">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">What We Stand For</span>
          <h2 className="tt-title">
            Six promises in <span className="tt-gradient-text">every build.</span>
          </h2>
        </header>
        <div className="tt-grid-3" data-reveal-stagger="80">
          {values.map((v, i) => (
            <TiltCard className="tt-glass tt-feature" key={v.title} data-reveal="rise">
              <span className="tt-value-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>
                <Sparkles size={16} /> {v.title}
              </h3>
              <p>{v.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="tt-section wrap" data-section="Network" aria-label="Professional affiliation">
        <div className="tt-glass tt-affil" data-reveal="zoom">
          <div>
            <span className="tt-eyebrow">Professional Network</span>
            <h3>Sanjay is also Co-Founder at CodeXa Agency</h3>
            <p>A separate business association delivering full-scale digital agency solutions.</p>
          </div>
          <a href="https://codxa-agency.online/" target="_blank" rel="noreferrer" className="tt-btn tt-btn-ghost">
            Visit CodeXa <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

    </div>
  );
}
