import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap, prefersReducedMotion } from "./scroll";

/**
 * Page-to-page transition.
 * Every internal link click is intercepted (capture phase, so it runs before
 * React Router's own Link handler): the stars warp, an iris of deep space
 * opens from the click point showing the destination's name, the route
 * changes underneath, and the iris lifts away to reveal the new page.
 * Back/forward buttons and reduced-motion visitors navigate instantly.
 */

export const PAGE_LABELS: Record<string, { title: string; kicker: string }> = {
  "/": { title: "Trinity Tech", kicker: "Home" },
  "/work": { title: "Our Work", kicker: "Live demo projects" },
  "/services": { title: "Services", kicker: "What we do" },
  "/about": { title: "About Us", kicker: "The people behind the vision" },
  "/project": { title: "Start a Project", kicker: "Project booking" },
  "/contact": { title: "Contact", kicker: "Let's talk" },
  "/track": { title: "Track Project", kicker: "Your project status" },
  "/privacy": { title: "Privacy", kicker: "Your information" },
};

export const labelFor = (path: string) =>
  PAGE_LABELS[path] ??
  (path.startsWith("/work/")
    ? { title: "Case Study", kicker: "Our Work" }
    : { title: "Trinity Tech", kicker: "Build. Innovate. Transform." });

export default function PageTransition() {
  const navigate = useNavigate();
  const loc = useLocation();
  const overlay = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState(labelFor(loc.pathname));
  const locRef = useRef(loc);
  locRef.current = loc;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const current = locRef.current;
      const to = url.pathname + url.search + url.hash;
      // same page (e.g. only the hash differs): let the normal handler run
      if (url.pathname === current.pathname && url.search === current.search) return;
      if (url.pathname.startsWith("/api")) return;

      e.preventDefault();
      e.stopPropagation();
      go(to, url.pathname, e.clientX, e.clientY);
    };

    const go = (to: string, path: string, x: number, y: number) => {
      if (busy.current) return;
      const el = overlay.current;
      if (!el || prefersReducedMotion()) {
        navigate(to);
        return;
      }
      busy.current = true;
      // render the destination name before animating its letters
      flushSync(() => setLabel(labelFor(path)));
      window.dispatchEvent(new Event("tt:warp"));

      const cx = x || window.innerWidth / 2;
      const cy = y || window.innerHeight / 2;
      const title = el.querySelectorAll(".tt-pt-title span");
      const meta = el.querySelectorAll(".tt-pt-kicker, .tt-pt-mark, .tt-pt-line");

      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
          },
        })
        .set(el, { visibility: "visible", clipPath: `circle(0px at ${cx}px ${cy}px)` })
        .set(title, { yPercent: 110, opacity: 0 })
        .set(meta, { opacity: 0, y: 12 })
        .to(el, {
          clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${cx}px ${cy}px)`,
          duration: 0.6,
          ease: "power3.in",
        })
        .to(title, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.03, ease: "power3.out" }, "-=0.15")
        .to(meta, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }, "<")
        .add(() => navigate(to))
        .to({}, { duration: 0.25 })
        .to(title, { yPercent: -110, opacity: 0, duration: 0.4, stagger: 0.02, ease: "power3.in" })
        .to(meta, { opacity: 0, duration: 0.25 }, "<")
        .to(el, {
          clipPath: `circle(0px at ${window.innerWidth / 2}px ${window.innerHeight * 0.4}px)`,
          duration: 0.65,
          ease: "power3.inOut",
        }, "-=0.1")
        .set(el, { visibility: "hidden" });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <div ref={overlay} className="tt-pt" aria-hidden="true">
      <div className="tt-pt-inner">
        <img className="tt-pt-mark" src="/assets/trinity-logo.svg" alt="" width={56} height={56} />
        <span className="tt-pt-kicker">{label.kicker}</span>
        <h2 className="tt-pt-title">
          {label.title.split("").map((ch, i) => (
            <span key={i}>{ch === " " ? " " : ch}</span>
          ))}
        </h2>
        <span className="tt-pt-line" />
      </div>
    </div>
  );
}
