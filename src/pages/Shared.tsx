import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CtaBand({
  title = "Ready to build your digital identity?",
  text = "Tell us about your idea — we'll help shape it into a professional online experience.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="wrap tt-cta-wrap" aria-label="Get started">
      <div className="tt-cta" data-reveal="zoom">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
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
  );
}
