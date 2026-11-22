import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  Menu,
  X,
  Monitor,
  Smartphone,
  Expand,
} from "lucide-react";
import { defaults, projects as seed, mainContact } from "./content";
import { ContactStrip } from "./pages/Shared";
import Contact from "./Contact";
import Assistant from "./Assistant";
import HomePage from "./Home";
import WorkPage from "./pages/WorkPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PageTransition from "./PageTransition";
import { SectionLabel } from "./FX3D";
import { ScrollProgress, useScrollReveal, useScrollState } from "./Motion";
import { destroySmoothScroll, initSmoothScroll, resetScroll, scrollToElement, ScrollTrigger } from "./scroll";
import { ChatProvider, useChat, STARTER_QUESTIONS } from "./chat-context";

const Admin = lazy(() => import("./Admin"));
// three.js loads in its own chunk after the page is interactive
const Starfield = lazy(() => import("./Starfield"));
const Track = lazy(() => import("./Track"));

export type Site = typeof defaults;
export const Context = createContext(defaults);
export const useSite = () => useContext(Context);

export const Arrow = () => <ArrowUpRight size={18} aria-hidden="true" />;

export function CTA({
  text = "Start a conversation",
  to = "/project",
  light = false,
}: {
  text?: string;
  to?: string;
  light?: boolean;
}) {
  return (
    <Link className={"button " + (light ? "secondary" : "")} to={to}>
      {text}
      <Arrow />
    </Link>
  );
}

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Trinity Tech home">
      <img
        src="/brand/mark.webp"
        alt=""
        className="brand-logo-img"
        width={53}
        height={40}
      />
      <span className="brand-copy">
        <span className="brand-title">
          <span className="bt-a">Trinity</span> <span className="bt-b">Tech</span>
        </span>
        <span className="brand-sub">Build · Innovate · Transform</span>
      </span>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="tt-footer">
      <div className="wrap tt-footer-grid">
        <div className="tt-footer-brand">
          <Brand />
          <p>Your Vision. Our Technology. Infinite Possibilities.</p>
          <Link to="/project" className="tt-btn tt-btn-primary sm">
            Start Your Project <ArrowRight size={16} />
          </Link>
        </div>
        <nav className="tt-footer-col" aria-label="Footer">
          <b>Explore</b>
          <Link to="/">Home</Link>
          <Link to="/work">Work</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <nav className="tt-footer-col" aria-label="Projects">
          <b>Projects</b>
          <Link to="/project">Start a Project</Link>
          <Link to="/track">Track Project</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
        <div className="tt-footer-col">
          <b>Contact</b>
          <a href={"mailto:" + mainContact.email}>
            <span>Email</span>
            {mainContact.email}
          </a>
          <a href={mainContact.phoneHref}>
            <span>Call</span>
            {mainContact.phone}
          </a>
          <a href={mainContact.whatsappHref} target="_blank" rel="noreferrer">
            <span>WhatsApp</span>
            {mainContact.whatsapp}
          </a>
        </div>
      </div>
      <div className="wrap tt-footer-base">
        <small>© {new Date().getFullYear()} Trinity Tech. All rights reserved.</small>
        <small>Build. Innovate. Transform.</small>
      </div>
    </footer>
  );
}

export function Device({
  p,
  hero = false,
}: {
  p: (typeof seed)[number];
  hero?: boolean;
}) {
  const [mobile, setMobile] = useState(p.slug === "starx-connect");
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div
      className={"device-stage " + (hero ? "hero-device" : "")}
      style={{ "--project": p.color } as React.CSSProperties}
    >
      <div className="device-controls">
        <span className="device-hostname">{new URL(p.url).hostname}</span>
        <div className="device-view-tabs">
          <button
            type="button"
            className={"device-tab-btn " + (!mobile ? "active" : "")}
            aria-label="Desktop preview"
            aria-pressed={!mobile}
            onClick={() => setMobile(false)}
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            className={"device-tab-btn " + (mobile ? "active" : "")}
            aria-label="Mobile preview"
            aria-pressed={mobile}
            onClick={() => setMobile(true)}
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            className="device-tab-btn"
            aria-label="Expand screenshot"
            onClick={() => dialog.current?.showModal()}
          >
            <Expand size={14} />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>
      <div className={"device " + (mobile ? "phone" : "desktop")}>
        <div className="device-bar">
          <i />
          <i />
          <i />
          <span>{p.short}</span>
        </div>
        <img
          src={mobile ? p.mobile : p.image}
          alt={
            p.short +
            " actual " +
            (mobile ? "mobile" : "desktop") +
            " website screenshot"
          }
          loading={hero ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      <span className="image-caption">
        ACTUAL INTERFACE / {mobile ? "MOBILE" : "DESKTOP"} VIEW
      </span>
      <dialog ref={dialog} className="lightbox">
        <button
          onClick={() => dialog.current?.close()}
          autoFocus
          aria-label="Close screenshot"
        >
          <X />
        </button>
        <img
          src={mobile ? p.mobile : p.image}
          alt={p.short + " expanded screenshot"}
        />
      </dialog>
    </div>
  );
}

function HomepageAiConsole() {
  const { messages, busy, status, ask, setFloatingOpen } = useChat();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultQuestions = STARTER_QUESTIONS;

  const handleSubmit = (q: string) => {
    const target = q.trim();
    if (!target || busy) return;
    setQuery("");
    void ask(target);
  };

  const conversationTurns = messages.filter(
    (m) => m.role === "user" || (m.role === "assistant" && m.timestamp),
  );
  const latestTurns =
    conversationTurns.length > 0 ? conversationTurns.slice(-4) : [];

  return (
    <div className="home-ai-scrapbook-card" aria-label="Spideyy Assistant">
      <div className="home-ai-card-header">
        <div className="home-ai-badge">
          <img className="spider-official" src="/brand/spideyy.svg" alt="Spideyy" />
          <div>
            <b>Spideyy</b>
            <span>Instant website guidance & project estimates</span>
          </div>
        </div>
        <span className={`home-ai-status-pill ${status === "Available" ? "status-available" : "status-limited"}`}>
          <span className="live-dot" /> {status}
        </span>
      </div>

      <form
        className="home-ai-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(query);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="home-ai-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Spideyy about websites, features, or your project idea..."
          aria-label="Ask Spideyy a question"
          disabled={busy}
        />
        <button
          type="submit"
          className="home-ai-submit"
          disabled={busy || !query.trim()}
          aria-label="Send question to Spideyy"
        >
          <ArrowUp size={18} />
        </button>
      </form>

      <div className="home-ai-chips-wrap">
        <span className="home-ai-chips-label">Quick questions:</span>
        <div className="home-ai-chips">
          {defaultQuestions.map((qText, idx) => (
            <button
              key={idx}
              type="button"
              className="home-ai-chip"
              disabled={busy}
              onClick={() => handleSubmit(qText)}
            >
              {qText}
            </button>
          ))}
        </div>
      </div>

      {(busy || latestTurns.length > 0) && (
        <div className="home-ai-stream" aria-live="polite">
          {latestTurns.map((turn, tIdx) => (
            <div key={tIdx} className={"home-ai-message " + turn.role}>
              <div className="home-ai-msg-role">
                {turn.role === "user" ? "You" : "Spideyy"}
              </div>
              <div className="home-ai-msg-text">
                {turn.text.split("\n").map((line, li) => (
                  <span key={li}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
              {turn.links && turn.links.length > 0 && (
                <div className="home-ai-msg-links">
                  {turn.links.map((lnk, lIdx) =>
                    lnk.url.startsWith("http") ? (
                      <a
                        key={lIdx}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="home-ai-link"
                      >
                        {lnk.label}
                      </a>
                    ) : (
                      <Link
                        key={lIdx}
                        to={lnk.url}
                        className={
                          "home-ai-link " +
                          (lnk.label.includes("Start") ? "action-primary" : "")
                        }
                      >
                        {lnk.label} <Arrow />
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="home-ai-message assistant thinking">
              <span className="live-dot" /> Spideyy is thinking…
            </div>
          )}
          <div className="home-ai-footer-actions">
            <button
              type="button"
              className="home-ai-popout-btn"
              onClick={() => setFloatingOpen(true)}
            >
              Continue in floating assistant ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const s = useSite();
  return (
    <HomePage site={s} console={<HomepageAiConsole />} />
  );
}

function CaseStudy() {
  const { slug } = useParams();
  const s = useSite();
  const p = s.projects.find((p) => p.slug === slug && p.published);
  if (!p) return <NotFound />;

  return (
    <article className="page wrap case">
      <Link className="text-link" to="/work">
        ← All work
      </Link>
      <div className="case-heading">
        <span className="eyebrow">{p.category}</span>
        <h1>{p.name}</h1>
        <p className="lede">{p.headline}</p>
        <a className="button" href={p.url} target="_blank" rel="noreferrer">
          Visit Live Site <Arrow />
        </a>
      </div>
      <div data-reveal>
        <Device p={p} />
      </div>
      <section className="case-story" data-reveal>
        <div>
          <span className="eyebrow">Experience overview</span>
          <h2>{p.headline}</h2>
        </div>
        <div>
          <p>{p.story}</p>
          <h3>Inside the interface</h3>
          {p.features.map((f, i) => (
            <div className="feature-line" key={f}>
              <span>0{i + 1}</span>
              {f}
            </div>
          ))}
          <p className="verification-note">{p.note}</p>
          <p className="verification-note">
            Hosting: Vercel. Other technologies and sole authorship are not
            asserted without source verification.
          </p>
        </div>
      </section>
      <CTA
        text="Discuss a similar project"
        to={"/project?category=" + encodeURIComponent(p.category)}
      />
    </article>
  );
}

function Privacy() {
  return (
    <section className="page wrap prose">
      <span className="eyebrow">Your information</span>
      <h1>Privacy, clearly.</h1>
      <p>
        When you submit a project enquiry, Trinity Tech uses your contact details
        and project requirements to respond and discuss the requested work.
        Please do not submit passwords, payment details or confidential
        documents.
      </p>
      <h2>Storage and service providers</h2>
      <p>
        Submitted enquiries are stored in a private Supabase database when
        configured. Vercel hosts the website. If AI mode is enabled, your
        assistant question is sent to the configured AI provider; FAQ mode does
        not require a model provider. The assistant identifies its mode.
      </p>
      <h2>Your choices</h2>
      <p>
        Owner authentication uses authentication storage and a secure
        session cookie. We do not use advertising cookies or sell enquiry
        details.
      </p>
      <h2>Contact and deletion</h2>
      <p>
        Ask about your enquiry or request deletion at{" "}
        <a href="mailto:trinitytech27@gmail.com">trinitytech27@gmail.com</a>.
        Information is retained only as needed for the enquiry and any
        subsequent business relationship.
      </p>
    </section>
  );
}

function NotFound() {
  return (
    <section className="page wrap">
      <span className="eyebrow">404 / A little off course</span>
      <h1>
        Let’s get you
        <br />
        <em>back to the good stuff.</em>
      </h1>
      <CTA to="/" text="Back to home" />
    </section>
  );
}

export default function App() {
  const [site, setSite] = useState(defaults);
  const [menu, setMenu] = useState(false);
  const [intro, setIntro] = useState(
    () =>
      location.pathname === "/" &&
      !sessionStorage.getItem("sxd-intro") &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const loc = useLocation();
  const isOwner = loc.pathname.startsWith("/spideyy") || loc.pathname.startsWith("/admin");
  useScrollState();
  useScrollReveal(loc.pathname);

  // StarX-style smooth scrolling (desktop pointers only; touch stays native)
  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  useEffect(() => {
    // the admin workspace now shares the dark gold Trinity Tech theme
    document.documentElement.classList.toggle("tt-admin", isOwner);
  }, [isOwner]);

  // lets pages tune the star background (e.g. calmer behind the booking form)
  useEffect(() => {
    document.documentElement.dataset.route = loc.pathname;
  }, [loc.pathname]);

  const [introLeaving, setIntroLeaving] = useState(false);
  // Spideyy waits until the intro has fully finished, then fades in
  const [assistantReady, setAssistantReady] = useState(false);
  const finish = () => {
    setIntro(false);
    setIntroLeaving(false);
    sessionStorage.setItem("sxd-intro", "1");
  };
  useEffect(() => {
    if (intro) return;
    const id = setTimeout(() => setAssistantReady(true), 1400);
    return () => clearTimeout(id);
  }, [intro]);

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((d) => {
        if (d.site) {
          setSite({
            ...d.site,
            projects: (d.site.projects || []).filter(
              (p: { slug: string }) => p.slug !== "yuva-shakti",
            ),
          });
          if (!d.site.introEnabled) setIntro(false);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!intro) return;
    const leave = setTimeout(() => setIntroLeaving(true), 3300);
    const id = setTimeout(finish, 4100);
    return () => {
      clearTimeout(leave);
      clearTimeout(id);
    };
  }, [intro]);

  useEffect(() => {
    setMenu(false);
    if (!loc.hash) {
      // Jump (not smooth-scroll) to the top when changing pages.
      resetScroll();
      // new page content: recalculate pinned / scrubbed sections
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      const el = document.getElementById(loc.hash.replace("#", ""));
      if (el) scrollToElement(el);
    }

    const p = site.projects.find((p) => loc.pathname === "/work/" + p.slug);
    document.title =
      (loc.pathname === "/"
        ? ""
        : (p
            ? p.name
            : ((
                {
                  "/": "",
                  "/work": "Our Work",
                  "/about": "About",
                  "/services": "Services",
                  "/contact": "Contact",
                  "/project": "Start a Project",
                  "/track": "Track Your Project",
                  "/privacy": "Privacy",
                  "/spideyy": "Admin Workspace",
                  "/admin": "Spideyy — Private Access",
                } as Record<string, string>
              )[loc.pathname] ?? "Page not found")) + " — ") + site.seoTitle;
  }, [loc.pathname, loc.hash, site]);

  // The admin is a separate private workspace: none of the public site around it
  if (isOwner) {
    return (
      <Context.Provider value={site}>
        <div className="tt-ws">
          <header className="tt-ws-bar">
            <span className="tt-ws-brand">
              <img src="/brand/mark.webp" alt="" width={42} height={32} />
              <span>
                <b>Trinity Tech</b>
                <small>Admin Workspace</small>
              </span>
            </span>
            <a href="/" target="_blank" rel="noreferrer" className="tt-ws-link">
              View public site ↗
            </a>
          </header>
          <main id="main" className="tt-ws-main">
            <Suspense fallback={<p className="wrap page">Loading workspace…</p>}>
              <Admin />
            </Suspense>
          </main>
        </div>
      </Context.Provider>
    );
  }

  return (
    <Context.Provider value={site}>
      <ChatProvider>
        <ScrollProgress />
        <div className="tt-space-fallback" aria-hidden="true" />
        {!isOwner && (
          <Suspense fallback={null}>
            <Starfield route={loc.pathname} />
          </Suspense>
        )}
        <PageTransition />
        {!isOwner && <SectionLabel />}
        <a className="skip" href="#main">
          Skip to content
        </a>
        {intro && (
          <div
            className={"intro tt-intro2" + (introLeaving ? " is-leaving" : "")}
            role="dialog"
            aria-label="Trinity Tech introduction"
            aria-modal="true"
          >
            <span className="tt-intro-glow" aria-hidden="true" />
            <span className="tt-intro-ring" aria-hidden="true" />
            <span className="tt-intro-ring two" aria-hidden="true" />
            <div className="intro-mark">
              <span className="tt-intro-logo">
                <img src="/brand/mark.webp" alt="Trinity Tech official logo" />
                <span className="tt-intro-shine" aria-hidden="true" />
              </span>
              <h2 aria-label="Trinity Tech">
                {"TRINITY TECH".split("").map((c, i) => (
                  <span key={i} style={{ "--i": i } as React.CSSProperties} aria-hidden="true">
                    {c === " " ? " " : c}
                  </span>
                ))}
              </h2>
              <p>Your Vision. Our Code. Infinite Possibilities.</p>
            </div>
            <button autoFocus onClick={finish}>
              Skip introduction <Arrow />
            </button>
          </div>
        )}
        <div {...((intro ? { inert: "" } : {}) as any)}>
          <header className="scrapbook-header">
            <div className="nav-wrap">
              <Brand />
              <button
                className="menu-toggle"
                aria-expanded={menu}
                aria-label="Toggle navigation"
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X /> : <Menu />}
              </button>
              <nav className={menu ? "expanded" : ""}>
                <NavLink to="/" end>
                  Home
                </NavLink>
                <NavLink to="/work">Work</NavLink>
                <NavLink to="/services">Services</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
                <NavLink to="/track">Track Project</NavLink>
                <NavLink to="/project" className="nav-cta-btn">
                  Start a Project <ArrowRight size={15} />
                </NavLink>
              </nav>
            </div>
          </header>
          <main id="main">
            <div className="route-view" key={loc.pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<WorkPage projects={site.projects} />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/project" element={<Contact />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/track"
                element={
                  <Suspense
                    fallback={
                      <p className="wrap page">Loading project tracking…</p>
                    }
                  >
                    <Track />
                  </Suspense>
                }
              />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/spideyy"
                element={
                  <Suspense
                    fallback={
                      <p className="wrap page">Loading owner workspace…</p>
                    }
                  >
                    <Admin />
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={<Navigate to="/spideyy" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
            {/* common to every page: contact + start a project */}
            {!isOwner && loc.pathname !== "/contact" && <ContactStrip />}
          </main>
          <Footer />
          {site.assistantEnabled &&
            !intro &&
            assistantReady &&
            !loc.pathname.startsWith("/spideyy") &&
            !loc.pathname.startsWith("/admin") && <Assistant />}
        </div>
      </ChatProvider>
    </Context.Provider>
  );
}
