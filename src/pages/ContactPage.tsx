import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Mail, MessageCircle, Minus, Phone, Plus, Radar, Rocket } from "lucide-react";
import { mainContact, publicFaqs } from "../content";
import { PageHero, TiltCard, useRefreshOnLoad } from "../FX3D";

/** FAQ: everything closed at first; opening one never hides the others. */
function Faq() {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <div className="tt-faq" data-reveal>
      {publicFaqs.map((f, i) => {
        const isOpen = open.includes(i);
        return (
          <div className={"tt-faq-item" + (isOpen ? " open" : "")} key={f.q}>
            <button type="button" aria-expanded={isOpen} onClick={() => toggle(i)}>
              <span>{f.q}</span>
              {isOpen ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            <div className="tt-faq-a">
              <p>{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  action,
  external,
  copy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  action: string;
  external?: boolean;
  copy?: string;
}) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(copy || value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the link still works */
    }
  };
  return (
    <TiltCard className="tt-glass tt-mailcard">
      <div className="tt-mailcard-icon">{icon}</div>
      <span className="tt-team-role">{label}</span>
      <a href={href} className="tt-mailcard-link" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {value}
      </a>
      <div className="tt-mailcard-actions">
        <a href={href} className="tt-btn tt-btn-primary sm" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {action} <ArrowRight size={16} />
        </a>
        <button type="button" className="tt-btn tt-btn-ghost sm" onClick={doCopy} aria-label={"Copy " + value}>
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
        sub="Questions, ideas or a project in mind? Reach Trinity Tech directly — we read every message."
      />

      <section className="tt-section wrap tt-first" data-section="Contact" aria-label="Contact details">
        <div className="tt-grid-3" data-reveal="rise">
          <ContactCard icon={<Mail size={22} />} label="Email" value={mainContact.email} href={"mailto:" + mainContact.email} action="Send email" />
          <ContactCard icon={<Phone size={22} />} label="Call" value={mainContact.phone} href={mainContact.phoneHref} action="Call now" />
          <ContactCard
            icon={<MessageCircle size={22} />}
            label="WhatsApp"
            value={mainContact.whatsapp}
            href={mainContact.whatsappHref}
            action="Chat on WhatsApp"
            external
          />
        </div>
      </section>

      <section className="tt-section wrap" data-section="Next Steps" aria-label="Next steps">
        <div className="tt-grid-2" data-reveal="rise">
          <Link to="/project" className="tt-glass tt-action">
            <Rocket size={26} />
            <div>
              <h3>Start a project</h3>
              <p>Five easy steps — choose what you need and get an honest proposal with your tracking ID.</p>
            </div>
            <ArrowRight size={20} className="tt-action-go" />
          </Link>
          <Link to="/track" className="tt-glass tt-action">
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
          <span className="tt-eyebrow">FAQ</span>
          <h2 className="tt-title">Questions clients ask.</h2>
        </header>
        <Faq />
      </section>
    </div>
  );
}
