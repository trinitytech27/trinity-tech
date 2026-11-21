import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, Radar, Rocket } from "lucide-react";
import { publicFaqs } from "../content";
import { useRefreshOnLoad } from "../FX3D";
import { ContactStrip } from "./Shared";

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

export default function ContactPage() {
  useRefreshOnLoad();
  return (
    <div className="tt-page">
      {/* NEC-style contact hero with the animated Trinity emblem */}
      <ContactStrip page />

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

      <section className="tt-section wrap tt-narrow" data-section="FAQ" data-stars="icon:handshake@top" aria-label="Frequently asked questions">
        <header className="tt-section-head center" data-reveal>
          <span className="tt-eyebrow">FAQ</span>
          <h2 className="tt-title">Questions clients ask.</h2>
        </header>
        <Faq />
      </section>
    </div>
  );
}
