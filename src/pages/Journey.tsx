import { useEffect, useRef, useState } from "react";
import { showStars } from "../scroll";

/* About page: the stars act out how a project travels from our keyboards to
   the client — code, test, deploy, deliver, hand over. Natural scroll, no pin. */
const STEPS = [
  { icon: "square-terminal", k: "01 · Write", t: "We write the code", d: "Clean, hand-written code built around your goals — no bloated templates." },
  { icon: "monitor-smartphone", k: "02 · Test", t: "Tested on every screen", d: "Phones, tablets and laptops — every page checked before anyone sees it." },
  { icon: "cloud-upload", k: "03 · Deploy", t: "Deployed to the cloud", d: "Fast, secure hosting with your domain, HTTPS and SEO set up for you." },
  { icon: "package-check", k: "04 · Deliver", t: "Delivered to you", d: "You get the live site, admin access and a walkthrough of everything." },
  { icon: "handshake", k: "05 · Support", t: "And we stay with you", d: "Updates, fixes and new features whenever your business grows." },
];

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".tt-journey-step"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.i);
          setActive(i);
          showStars("icon:" + STEPS[i].icon + "@right");
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={root}
      className="tt-section wrap tt-journey"
      data-section="Journey"
      data-stars="icon:square-terminal@right"
      aria-label="How we build and deliver"
    >
      <header className="tt-section-head" data-reveal>
        <span className="tt-eyebrow">How We Deliver</span>
        <h2 className="tt-title">
          From our code <span className="tt-gradient-text">to your hands.</span>
        </h2>
      </header>
      <ol className="tt-journey-list">
        {STEPS.map((s, i) => (
          <li key={s.k} data-i={i} className={"tt-journey-step" + (i === active ? " on" : i < active ? " done" : "")}>
            <span className="tt-journey-k">{s.k}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
