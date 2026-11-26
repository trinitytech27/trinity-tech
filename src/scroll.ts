import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
// phones: the address bar showing/hiding must not re-layout pinned scenes
ScrollTrigger.config({ ignoreMobileResize: true });

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
  // ScrollTrigger remembers the old page's scroll position and puts it back on
  // its next refresh (phones use native scrolling, so this showed there):
  // forget it, so every new page really starts at the top.
  ScrollTrigger.clearScrollMemory("manual");
  ScrollTrigger.update();
}

/** Smoothly bring an element into view (hash links). */
export function scrollToElement(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { offset: -88, duration: 1.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export { gsap, ScrollTrigger };

/** Smoothly return to the very top of the page (wizard steps, Home link). */
export function scrollToPageTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1 });
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Ask the star background for a symbol (sent only when it changes). */
let lastStars = "";
export function showStars(shape?: string) {
  if (!shape || shape === lastStars) return;
  lastStars = shape;
  window.dispatchEvent(new CustomEvent("tt:stars", { detail: shape }));
}
if (typeof window !== "undefined") {
  window.addEventListener("tt:stars", (e) => {
    lastStars = String((e as CustomEvent).detail || "");
  });
}
