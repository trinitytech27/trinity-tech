/**
 * Spideyy quick answers — used when the live AI is unreachable, so visitors
 * always get a useful reply (built only from Trinity Tech's own content).
 */
import { mainContact, pillars, projects, publicFaqs, siteTypes } from "./content";
import type { ChatLink } from "./chat-context";

type Answer = { text: string; links: ChatLink[] };

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function localAnswer(raw: string): Answer {
  const q = raw.toLowerCase();
  const start: ChatLink = { label: "Start Your Project", url: "/project" };

  if (has(q, "hi", "hello", "hey", "namaste") && q.length < 25) {
    return {
      text: "Hi! I'm Spideyy from Trinity Tech. Tell me what you'd like to build — a business website, an online store, a portfolio or a custom web app — and I'll guide you.",
      links: [start, { label: "See Our Work", url: "/work" }],
    };
  }
  if (has(q, "cost", "price", "pricing", "budget", "charge", "how much", "rate")) {
    const f = publicFaqs.find((x) => /cost/i.test(x.q));
    return { text: f?.a || "Pricing depends on your pages and features. Start a project to get an honest proposal.", links: [start] };
  }
  if (has(q, "how long", "time", "timeline", "days", "weeks", "deadline")) {
    const f = publicFaqs.find((x) => /how long/i.test(x.q));
    return { text: f?.a || "Timelines depend on scope — we agree on one before work starts.", links: [start] };
  }
  if (has(q, "store", "shop", "e-commerce", "ecommerce", "sell", "product", "cart")) {
    const t = siteTypes.find((x) => /commerce/i.test(x.title));
    return {
      text: `Yes! ${t?.desc || "We build online stores with catalogues, cart and checkout."} Our live ABPS Books store is a good example.`,
      links: [{ label: "Start an E-Commerce Project", url: "/project?category=" + encodeURIComponent("E-Commerce Website") }, { label: "See ABPS Books", url: "/work/abps-books" }],
    };
  }
  if (has(q, "book", "ticket", "appointment", "event", "reservation")) {
    return {
      text: "We build booking and event platforms — listings, slot booking and reminders. TicketX is one of our live booking platforms.",
      links: [{ label: "See TicketX", url: "/work/ticketx" }, start],
    };
  }
  if (has(q, "project", "work", "portfolio", "previous", "example", "demo", "live")) {
    return {
      text: "Here are our live projects: " + projects.map((p) => p.short).join(", ") + ". Every one is a live demo you can open.",
      links: [{ label: "View Our Work", url: "/work" }, start],
    };
  }
  if (has(q, "service", "what do you do", "offer", "redesign", "ui", "ux", "design")) {
    return {
      text: "We offer " + pillars.map((p) => p.title).join(", ") + ". Every website is responsive, fast and SEO-ready.",
      links: [{ label: "Explore Services", url: "/services" }, start],
    };
  }
  if (has(q, "right for me", "which website", "what website", "suggest", "recommend", "not sure")) {
    return {
      text: "Tell me a bit about your goal! In short: showcasing yourself → Portfolio; a local or company business → Business website; selling online → E-Commerce; bookings → Booking website; something unique → Custom web app. The 5-step project guide helps you choose.",
      links: [start],
    };
  }
  if (has(q, "track", "status", "tracking", "tt-", "sxd")) {
    return {
      text: "You can follow your project any time on the Track page with your tracking ID and email.",
      links: [{ label: "Track a Project", url: "/track" }],
    };
  }
  if (has(q, "contact", "call", "phone", "whatsapp", "email", "mail", "reach", "talk")) {
    return {
      text: `You can reach Trinity Tech at ${mainContact.email}, call ${mainContact.phone}, or chat on WhatsApp at ${mainContact.whatsapp}.`,
      links: [{ label: "Chat on WhatsApp", url: mainContact.whatsappHref }, { label: "Contact Page", url: "/contact" }],
    };
  }
  if (has(q, "start", "begin", "how do i", "process", "steps")) {
    return {
      text: "Starting is easy — five steps: choose your website type, pick features, choose a design, share your details and tell us how to contact you. You'll get a tracking ID right away.",
      links: [start],
    };
  }
  return {
    text: "Good question! I can help with services, pricing, timelines, our live projects or starting your project. You can also talk to our team directly on WhatsApp.",
    links: [start, { label: "Chat on WhatsApp", url: mainContact.whatsappHref }],
  };
}
