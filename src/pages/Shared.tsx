import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Mail, MessageCircle, Phone } from "lucide-react";
import { mainContact } from "../content";
import { scrollToPageTop } from "../scroll";

/** The Trinity Tech emblem as a slowly spinning 3D coin with an orbit ring. */
export function EmblemCoin({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className={"tt-coin-wrap " + size} aria-hidden="true">
      <span className="tt-coin-orbit" />
      <span className="tt-coin-orbit two" />
      <div className="tt-coin">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="tt-coin-edge" style={{ "--d": i } as React.CSSProperties} />
        ))}
        <img className="tt-coin-face front" src="/brand/emblem.webp" alt="" />
        <img className="tt-coin-face back" src="/brand/emblem.webp" alt="" />
      </div>
      <span className="tt-coin-glow" />
    </div>
  );
}

/** Common to every page: get in touch + start a project (NEC-style). */
export function ContactStrip({ page = false }: { page?: boolean }) {
  return (
    <section
      className={"tt-cshow" + (page ? " is-page" : "")}
      data-section={page ? "Contact" : "Get in Touch"}
      data-stars="icon:handshake@top"
      aria-label="Contact Trinity Tech"
    >
      <div className="tt-cshow-bg" aria-hidden="true" />
      <div className="wrap tt-cshow-inner">
        <div className="tt-cshow-copy" data-reveal="from-left">
          <span className="tt-eyebrow">Let&apos;s Work Together</span>
          <h2 className="tt-display">
            Your project <span className="tt-gradient-text">starts here.</span>
          </h2>
          <p className="tt-lede">
            Talk to us directly — or start your project in five easy steps and get a
            tracking ID to follow every stage.
          </p>
          <div className="tt-cshow-cards">
            <a href={"mailto:" + mainContact.email} className="tt-cshow-card wide">
              <Mail size={20} />
              <span>
                <small>Email</small>
                {mainContact.email}
              </span>
            </a>
            <a href={mainContact.phoneHref} className="tt-cshow-card">
              <Phone size={20} />
              <span>
                <small>Call</small>
                {mainContact.phone}
              </span>
            </a>
            <a href={mainContact.whatsappHref} target="_blank" rel="noreferrer" className="tt-cshow-card">
              <MessageCircle size={20} className="wa" />
              <span>
                <small>WhatsApp</small>
                {mainContact.whatsapp}
              </span>
            </a>
          </div>
          <div className="tt-cshow-actions">
            <Link to="/project" className="tt-btn tt-btn-primary">
              Start a Project <ArrowRight size={18} />
            </Link>
            <button type="button" className="tt-btn tt-btn-ghost" onClick={() => scrollToPageTop()}>
              <ArrowUp size={17} /> Back to the beginning
            </button>
          </div>
        </div>
        <div className="tt-cshow-visual" data-reveal="zoom">
          <EmblemCoin size={page ? "lg" : "md"} />
        </div>
      </div>
    </section>
  );
}
