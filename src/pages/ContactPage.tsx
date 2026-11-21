import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Mail, Radar, Rocket } from "lucide-react";
import { contactEmails } from "../content";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";
import { Faq } from "./ServicesPage";

function EmailCard({ name, role, email }: { name: string; role: string; email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };
  return (
    <TiltCard className="tt-glass tt-mailcard" data-reveal="rise">
      <div className="tt-mailcard-icon">
        <Mail size={22} />
      </div>
      <span className="tt-team-role">{role}</span>
      <h3>{name}</h3>
      <a href={"mailto:" + email} className="tt-mailcard-link">
        {email}
      </a>
      <div className="tt-mailcard-actions">
        <a href={"mailto:" + email} className="tt-btn tt-btn-primary sm">
          Send email <ArrowRight size={16} />
        </a>
        <button type="button" className="tt-btn tt-btn-ghost sm" onClick={copy} aria-label={"Copy " + email}>
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </TiltCard>
  );
}

export default function ContactPage() {
  useRefreshOnLoad();
  return (
    <div className="tt-page">
      <PageHero
        index="05"
        kicker="Contact"
        title="Let's build something"
        accent="together."
        sub="Questions, ideas or a project in mind? Email any of us directly — we read every message."
      />

      <section className="tt-section wrap tt-first" data-section="Email" aria-label="Email us">
        <div className="tt-grid-3" data-reveal-stagger="120">
          {contactEmails.map((c) => (
            <EmailCard key={c.email} {...c} />
          ))}
        </div>
      </section>

      <section className="tt-section wrap" data-section="Next Steps" aria-label="Next steps">
        <div className="tt-grid-2" data-reveal-stagger="120">
          <Link to="/project" className="tt-glass tt-action" data-reveal="from-left">
            <Rocket size={26} />
            <div>
              <h3>Start a project</h3>
              <p>Choose your website type and features, and get an honest proposal with your tracking ID.</p>
            </div>
            <ArrowRight size={20} className="tt-action-go" />
          </Link>
          <Link to="/track" className="tt-glass tt-action" data-reveal="from-right">
            <Radar size={26} />
            <div>
              <h3>Track your project</h3>
              <p>Already submitted an enquiry? Check your project status with your tracking ID.</p>
            </div>
            <ArrowRight size={20} className="tt-action-go" />
          </Link>
        </div>
      </section>

      <section className="tt-section wrap tt-narrow" data-section="FAQ" aria-label="Frequently asked questions">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">Before You Ask</span>
          <h2 className="tt-title">Common questions.</h2>
        </header>
        <Faq />
      </section>
    </div>
  );
}
