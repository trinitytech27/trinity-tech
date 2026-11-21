import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import { mainContact } from "../content";

/** Common to every page: get in touch + start a project. */
export function ContactStrip() {
  return (
    <section className="wrap tt-strip-wrap" aria-label="Contact Trinity Tech">
      <div className="tt-strip" data-reveal="zoom">
        <div className="tt-strip-copy">
          <span className="tt-eyebrow">Let&apos;s Work Together</span>
          <h2>Have an idea? Let&apos;s build it.</h2>
          <p>Talk to us directly or start your project in a few easy steps.</p>
          <Link to="/project" className="tt-btn tt-btn-light">
            Start a Project <ArrowRight size={18} />
          </Link>
        </div>
        <div className="tt-strip-links">
          <a href={"mailto:" + mainContact.email} className="tt-strip-item">
            <span className="tt-strip-icon">
              <Mail size={20} />
            </span>
            <span>
              <small>Email</small>
              {mainContact.email}
            </span>
          </a>
          <a href={mainContact.phoneHref} className="tt-strip-item">
            <span className="tt-strip-icon">
              <Phone size={20} />
            </span>
            <span>
              <small>Call</small>
              {mainContact.phone}
            </span>
          </a>
          <a href={mainContact.whatsappHref} target="_blank" rel="noreferrer" className="tt-strip-item">
            <span className="tt-strip-icon wa">
              <MessageCircle size={20} />
            </span>
            <span>
              <small>WhatsApp</small>
              {mainContact.whatsapp}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
