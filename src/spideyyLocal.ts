/**
 * Spideyy quick answers — used when the live AI is unreachable, so visitors
 * always get a useful reply (built only from Trinity Tech's own content).
 */
import { mainContact, pillars, projects, publicFaqs, siteTypes, team } from "./content";
import type { ChatLink } from "./chat-context";

type Answer = { text: string; links: ChatLink[] };

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function localAnswer(raw: string): Answer {
  const q = raw.toLowerCase();
  const start: ChatLink = { label: "Start Your Project", url: "/project" };

  if (has(q, "hi", "hello", "hey", "namaste", "namaskaram", "hii", "good morning", "good evening") && q.length < 30) {
    return {
      text: "Hi! I'm Spideyy from Trinity Tech. Tell me what you'd like to build — a business website, an online store, a portfolio or a custom web app — and I'll guide you.",
      links: [start, { label: "See Our Work", url: "/work" }],
    };
  }
  if (has(q, "who are you", "team", "founder", "developer", "who built", "about you", "company", "trinity")) {
    return {
      text: "Trinity Tech is a web development team: " + team.map((m) => m.name + " (" + m.role + ")").join(", ") + ". We design, build, launch and support websites and web apps for businesses and creators.",
      links: [{ label: "Meet the Team", url: "/about" }, start],
    };
  }
  if (has(q, "domain", "hosting", "host", "server", "deploy", "ssl", "https")) {
    return {
      text: "We handle the technical side for you — domain connection, secure HTTPS hosting and deployment. If you already own a domain we connect it; if not, we help you pick one.",
      links: [start],
    };
  }
  if (has(q, "seo", "google", "rank", "search")) {
    return {
      text: "Every site we build is SEO-ready: fast loading, mobile-friendly, proper titles and descriptions, a sitemap, and Google-friendly structure so customers can find you.",
      links: [{ label: "Explore Services", url: "/services" }, start],
    };
  }
  if (has(q, "mobile", "phone friendly", "responsive", "android", "iphone", "tablet")) {
    return {
      text: "Yes — every Trinity Tech website works beautifully on phones, tablets and laptops. We test every page on real screen sizes before delivery.",
      links: [start],
    };
  }
  if (has(q, "maintenance", "support", "update", "after delivery", "change later", "edit myself", "admin")) {
    return {
      text: "We stay with you after launch — updates, fixes and new features when you need them. You can also ask for an admin dashboard so you can edit content yourself.",
      links: [start, { label: "Chat on WhatsApp", url: mainContact.whatsappHref }],
    };
  }
  if (has(q, "payment", "pay", "advance", "upi", "invoice")) {
    return {
      text: "We agree the price and payment plan with you before any work starts — usually a part in advance and the rest on delivery. No hidden charges.",
      links: [start, { label: "Talk to Us", url: mainContact.whatsappHref }],
    };
  }
  if (has(q, "where", "location", "located", "city", "india", "hyderabad")) {
    return {
      text: "We're based in India and work with clients everywhere online — calls, WhatsApp, Google Meet or email, whichever suits you.",
      links: [{ label: "Contact Us", url: "/contact" }],
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
