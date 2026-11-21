import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One Lenis instance for the whole site, driven by GSAP's ticker so smooth
 * scrolling, ScrollTrigger scrubs and pins all share a single frame.
 * Touch devices keep native scrolling (it already has momentum).
 */
export function initSmoothScroll() {
  if (lenis || typeof window === "undefined" || prefersReducedMotion()) return lenis;
  if (!window.matchMedia("(pointer: fine)").matches) return null;

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: { offset: -88 },
    // Dialogs, the assistant and lightboxes keep their own native scrolling
    prevent: (node) =>
      Boolean(
        node.closest &&
          node.closest('[role="dialog"], dialog, [data-lenis-prevent], .chat, .home-ai-stream'),
      ),
  });

  lenis.on("scroll", ScrollTrigger.update);
  if (import.meta.env.DEV) (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function destroySmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

/** Jump to the top instantly on page change without fighting Lenis' target. */
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
}

/** Smoothly bring an element into view (hash links). */
export function scrollToElement(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { offset: -88, duration: 1.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export { gsap, ScrollTrigger };
