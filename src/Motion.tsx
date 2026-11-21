import { useEffect } from "react";

/**
 * Lightweight, professional scroll motion.
 *
 * - Elements marked with `data-reveal` fade and rise gently into place the
 *   first time they enter the viewport (one IntersectionObserver for the page).
 * - `data-reveal-stagger` on a parent staggers its `data-reveal` children.
 * - A single passive, rAF-throttled scroll listener drives the reading-progress
 *   bar and the compact header state, so scrolling never does layout work.
 *
 * Everything is disabled for visitors who prefer reduced motion.
 */

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useScrollReveal(routeKey: string) {
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      root.classList.remove("motion-ready");
      return;
    }
    root.classList.add("motion-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
        .forEach((group) => {
          const step = Number(group.dataset.revealStagger) || 90;
          group
            .querySelectorAll<HTMLElement>(":scope > [data-reveal]")
            .forEach((child, i) => {
              child.style.setProperty("--reveal-delay", `${Math.min(i, 6) * step}ms`);
            });
        });
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan();
    // Pick up content rendered later (site data fetch, lazy routes, filters).
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    const main = document.getElementById("main") ?? document.body;
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
    };
  }, [routeKey]);
}

export function useScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    let compact = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      // Write straight to the bar's transform (compositor-only, no style recalc).
      const bar = document.querySelector<HTMLElement>(".scroll-progress");
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      const next = y > 24;
      if (next !== compact) {
        compact = next;
        root.classList.toggle("is-scrolled", compact);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true" />;
}
