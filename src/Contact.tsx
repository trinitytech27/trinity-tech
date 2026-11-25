import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHero } from "./FX3D";
import { scrollToElement, scrollToPageTop, showStars } from "./scroll";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  CodeXml,
  Copy,
  GraduationCap,
  Hammer,
  HandHeart,
  HeartPulse,
  Layers,
  Lock,
  MessageCircle,
  Plane,
  RefreshCw,
  Rocket,
  School,
  ShoppingCart,
  Sparkles,
  Store,
  User,
  Utensils,
} from "lucide-react";
import { getWhatsAppEnquiryUrl, type DetailedEnquiryData } from "./content";
import "./booking.css";
import {
  ADDONS,
  BUDGETS,
  CONTACT_METHODS,
  CONTENT_OPTIONS,
  DOMAIN_CHOICES,
  EXISTING_OPTIONS,
  GOALS,
  PAGE_OPTIONS,
  SITE_GROUPS,
  SITE_TYPES,
  STYLE_OPTIONS,
  TIMELINES,
  priceLabel,
  typeById,
  typeFromParam,
  type SiteGroup,
} from "./booking";

const COUNTRY_CODES = ["+91", "+1", "+44", "+971", "+61", "+65", "+49", "+966", "+974"];

const ICONS: Record<string, React.ReactNode> = {
  briefcase: <Briefcase size={20} />,
  utensils: <Utensils size={20} />,
  "heart-pulse": <HeartPulse size={20} />,
  "calendar-check": <CalendarCheck size={20} />,
  "building-2": <Building2 size={20} />,
  "bed-double": <BedDouble size={20} />,
  plane: <Plane size={20} />,
  hammer: <Hammer size={20} />,
  layers: <Layers size={20} />,
  store: <Store size={20} />,
  "shopping-cart": <ShoppingCart size={20} />,
  rocket: <Rocket size={20} />,
  user: <User size={20} />,
  camera: <Camera size={20} />,
  sparkles: <Sparkles size={20} />,
  "book-open": <BookOpen size={20} />,
  "graduation-cap": <GraduationCap size={20} />,
  school: <School size={20} />,
  "hand-heart": <HandHeart size={20} />,
  "refresh-cw": <RefreshCw size={20} />,
  "code-xml": <CodeXml size={20} />,
  "circle-help": <CircleHelp size={20} />,
};
// star shapes the starfield can draw for each icon
const STAR_SHAPE: Record<string, string> = {
  "heart-pulse": "calendar-check",
  "bed-double": "calendar-check",
  plane: "rocket",
  hammer: "layers",
  school: "graduation-cap",
  "hand-heart": "handshake",
  "refresh-cw": "sparkles",
  "building-2": "briefcase",
  camera: "layers",
};

type Form = {
  type: string;
  goals: string[];
  extras: string[];
  addons: string[];
  notes: string;
  pages: string;
  style: string;
  existing: string;
  link: string;
  content: string;
  domain: string;
  timeline: string;
  budget: string;
  name: string;
  email: string;
  code: string;
  phone: string;
  waDifferent: boolean;
  whatsapp: string;
  city: string;
  country: string;
  business: string;
  contact: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
};

const EMPTY: Form = {
  type: "",
  goals: [],
  extras: [],
  addons: [],
  notes: "",
  pages: "",
  style: "",
  existing: "",
  link: "",
  content: "",
  domain: "",
  timeline: "",
  budget: "",
  name: "",
  email: "",
  code: "+91",
  phone: "",
  waDifferent: false,
  whatsapp: "",
  city: "",
  country: "India",
  business: "",
  contact: "",
  message: "",
  consent: false,
  website: "",
};

const DRAFT = "tt_booking_draft_v8";
const STEPS = ["Website", "Features", "Design & plan", "Your details"];
const labelOf = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label || "";

export default function ProjectPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<SiteGroup | "all">("all");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState<null | { code: string; wa: string }>(null);
  const [copied, setCopied] = useState(false);
  const key = useRef("tt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9));

  const [form, setForm] = useState<Form>(() => {
    let draft: Partial<Form> = {};
    try {
      draft = JSON.parse(sessionStorage.getItem(DRAFT) || "{}");
    } catch {
      /* ignore */
    }
    const fromLink = typeFromParam(params.get("type") || params.get("category") || params.get("service"));
    const t = fromLink || typeById(draft.type);
    return { ...EMPTY, ...draft, type: t?.id || "", website: "", consent: false };
  });
  const type = typeById(form.type);

  useEffect(() => {
    try {
      const { website, consent, ...safe } = form;
      void website;
      void consent;
      sessionStorage.setItem(DRAFT, JSON.stringify(safe));
    } catch {
      /* ignore */
    }
  }, [form]);

  // the starfield draws the chosen type of website
  useEffect(() => {
    showStars(type ? "icon:" + (STAR_SHAPE[type.icon] || type.icon) + "@top" : "wave");
  }, [type]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: "goals" | "extras" | "addons", v: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const chooseType = (id: string) => {
    setForm((f) => ({ ...f, type: id, extras: f.type === id ? f.extras : [] }));
    setStatus("");
  };

  const go = (n: number) => {
    setStatus("");
    setStep(n);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(".tt-bk-steps");
      if (el) scrollToElement(el);
      else scrollToPageTop();
    });
  };

  const next = () => {
    if (step === 0 && !form.type) return setStatus("Choose the type of website you need to continue.");
    go(step + 1);
  };

  const visible = SITE_TYPES.filter((t) => group === "all" || t.group === group);
  const addonLabels = ADDONS.filter((a) => form.addons.includes(a.id)).map((a) => a.label);
  const allFeatures = useMemo(
    () => [...(type?.includes || []), ...form.extras, ...addonLabels],
    [type, form.extras, addonLabels.join("|")],
  );

  function problem() {
    if (!form.type) return "Choose the type of website (step 1).";
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 7) return "Please enter your mobile number.";
    if (form.waDifferent && form.whatsapp.replace(/\D/g, "").length < 7) return "Please enter your WhatsApp number.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.contact) return "Please choose the best way to reach you.";
    if (!form.consent) return "Please tick the box so we can contact you about this project.";
    return "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const p = problem();
    if (p) return setStatus(p);
    if (!type) return;
    setBusy(true);
    setStatus("");
    const full = (n: string) => (n.trim().startsWith("+") ? n.trim() : `${form.code} ${n.trim()}`);
    const phone = full(form.phone);
    const whatsapp = form.waDifferent ? full(form.whatsapp) : phone;
    const has = (id: string) => form.addons.includes(id);
    const features = [...type.includes, ...form.extras, ...addonLabels.map((a) => "Add-on: " + a)];
    const pages = labelOf(PAGE_OPTIONS, form.pages) || "Recommend for me";
    const style = labelOf(STYLE_OPTIONS, form.style) || "You choose";
    const existing = labelOf(EXISTING_OPTIONS, form.existing);
    const content = labelOf(CONTENT_OPTIONS, form.content);
    const domain = labelOf(DOMAIN_CHOICES, form.domain);
    const city = [form.city.trim(), form.country.trim()].filter(Boolean).join(", ");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone,
          whatsapp,
          preferred_contact: form.contact,
          company: form.business.trim(),
          business_name: form.business.trim(),
          is_business: !!form.business.trim(),
          is_individual: !form.business.trim(),
          service: type.label,
          categories: [type.label],
          features,
          primary_purpose: form.goals.join(", "),
          login_option: has("login") ? "Yes — customer accounts" : "Not requested",
          login_method: "",
          dashboard_option: has("admin") ? "Yes — admin panel" : "Not requested",
          data_storage: has("login") || has("payments") || has("booking") || has("admin") ? "Yes" : "Not needed",
          animation_preference: "",
          page_count: pages,
          existing_design_option: existing,
          reference_url: form.link.trim(),
          design_preference: style,
          content_ready: content,
          has_domain: domain,
          timeline: form.timeline || "Flexible",
          budget: form.budget || "Suggest a budget",
          description:
            form.notes.trim() ||
            `${type.label} (${priceLabel(type)}, usually ${type.days}). Goals: ${form.goals.join(", ") || "not specified"}.`,
          city: form.city.trim(),
          country: form.country.trim(),
          additional_message: [content ? "Content: " + content : "", form.message.trim()].filter(Boolean).join("\n"),
          consent: true,
          website: form.website,
          idempotency_key: key.current,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "We couldn't send your request. Please check your details and try again.");
      const code = d.trackingCode || "TT-001";
      const details: DetailedEnquiryData = {
        trackingCode: code,
        name: form.name.trim(),
        businessName: form.business.trim() || undefined,
        email: form.email.trim(),
        phone,
        whatsapp,
        city,
        websiteType: `${type.label} (${priceLabel(type)})`,
        primaryPurpose: form.goals,
        features,
        designStyle: style,
        pageCount: pages,
        existingDesign: existing || undefined,
        referenceUrl: form.link.trim() || undefined,
        hasDomain: domain || undefined,
        timeline: form.timeline || "Flexible",
        budget: form.budget || "Suggest a budget",
        additionalMessage: [form.notes.trim(), form.message.trim(), content ? "Content: " + content : ""].filter(Boolean).join(" · ") || undefined,
      };
      const wa = getWhatsAppEnquiryUrl(code, type.label, details);
      setSent({ code, wa });
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {
        /* ignore */
      }
      scrollToPageTop();
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- confirmation ---------------- */
  if (sent) {
    return (
      <div className="page contact-page tt-booking-page tt-bk">
        <PageHero index="04" kicker="Start a Project" title="Request" accent="received." sub="Thank you — your project is booked into our queue." />
        <div className="wrap tt-bk-body">
          <div className="tt-bk-done">
            <CheckCircle2 size={46} className="tt-bk-done-ic" />
            <h2>Thanks, {form.name.split(" ")[0]}! Your project request is in.</h2>
            <p>We've emailed you a copy. A Trinity Tech developer will contact you on <b>{form.contact}</b> within 24 hours to confirm scope, timeline and price — no payment is needed until you approve the quote.</p>
            <div className="tt-bk-code">
              <span>Your tracking ID</span>
              <b>{sent.code}</b>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(sent.code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <ol className="tt-bk-next">
              <li><b>Free call</b> — we go through your requirements together.</li>
              <li><b>Clear quote</b> — fixed price and delivery date in writing.</li>
              <li><b>Build & updates</b> — follow every step with your tracking ID.</li>
            </ol>
            <div className="tt-bk-actions center">
              <a href={sent.wa} target="_blank" rel="noopener noreferrer" className="tt-bk-btn primary">
                <MessageCircle size={17} /> Send brief on WhatsApp
              </a>
              <Link to={`/track?code=${sent.code}`} className="tt-bk-btn">
                Track my project
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- builder ---------------- */
  return (
    <div className="page contact-page tt-booking-page tt-bk">
      <PageHero
        index="04"
        kicker="Start a Project"
        title="Let's build"
        accent="your website."
        sub="Four quick steps, about 2 minutes. No technical questions — just tell us what you need and we'll handle the rest."
      />
      <div className="wrap tt-bk-body" data-section="Booking">
        <ol className="tt-bk-steps" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? "on" : i < step ? "done" : ""}>
              <button type="button" disabled={i > step} onClick={() => i < step && go(i)}>
                <span>{i < step ? <Check size={13} strokeWidth={3} /> : "0" + (i + 1)}</span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="tt-bk-layout">
          <div className="tt-bk-main">
            {/* ---------- 1. Website type ---------- */}
            {step === 0 && (
              <section aria-labelledby="bk-h1">
                <header className="tt-bk-head">
                  <span>Step 1 of 4</span>
                  <h2 id="bk-h1">What would you like to build?</h2>
                  <p>Pick the closest match. You can fine-tune everything in the next steps.</p>
                </header>
                <div className="tt-bk-tabs" role="tablist" aria-label="Website categories">
                  {SITE_GROUPS.map((g) => (
                    <button key={g.id} type="button" role="tab" aria-selected={group === g.id} className={group === g.id ? "on" : ""} onClick={() => setGroup(g.id)}>
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="tt-bk-types" role="radiogroup" aria-label="Website type">
                  {visible.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={form.type === t.id}
                      className={"tt-bk-type" + (form.type === t.id ? " on" : "")}
                      onClick={() => chooseType(t.id)}
                    >
                      {t.art && <img className="tt-bk-type-art" src={`/brand/types/${t.art}.webp`} alt="" loading="lazy" />}
                      <span className="tt-bk-type-top">
                        <span className="tt-bk-ic">{ICONS[t.icon]}</span>
                        {t.tag && <span className={"tt-bk-tag t-" + t.tag.split(" ")[0].toLowerCase()}>{t.tag}</span>}
                        <span className="tt-bk-radio" aria-hidden="true">{form.type === t.id && <Check size={12} strokeWidth={3} />}</span>
                      </span>
                      <b>{t.label}</b>
                      <span className="tt-bk-desc">{t.desc}</span>
                      <ul>
                        {t.includes.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                      <span className="tt-bk-meta">
                        <span><Clock size={13} /> {t.days}</span>
                        <strong>{priceLabel(t)}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ---------- 2. Features ---------- */}
            {step === 1 && type && (
              <section aria-labelledby="bk-h2">
                <header className="tt-bk-head">
                  <span>Step 2 of 4</span>
                  <h2 id="bk-h2">What should your {type.label.toLowerCase()} do?</h2>
                  <p>Everything is optional — pick what matters and we'll suggest the rest on our call.</p>
                </header>

                <div className="tt-bk-block">
                  <h3>Your main goals</h3>
                  <div className="tt-bk-chips">
                    {GOALS.map((g) => (
                      <button key={g} type="button" aria-pressed={form.goals.includes(g)} className={form.goals.includes(g) ? "on" : ""} onClick={() => toggle("goals", g)}>
                        {form.goals.includes(g) && <Check size={13} strokeWidth={3} />} {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-bk-block">
                  <h3>Already included</h3>
                  <div className="tt-bk-checks">
                    {[...type.includes, "Mobile-friendly design", "Fast loading & basic SEO", "Free SSL (https)"].map((x) => (
                      <div key={x} className="tt-bk-check locked">
                        <span className="box"><Lock size={11} /></span>
                        {x}
                      </div>
                    ))}
                  </div>
                </div>

                {type.extras.length > 0 && (
                  <div className="tt-bk-block">
                    <h3>Popular for {type.label}</h3>
                    <div className="tt-bk-checks">
                      {type.extras.map((x) => (
                        <button key={x} type="button" aria-pressed={form.extras.includes(x)} className={"tt-bk-check" + (form.extras.includes(x) ? " on" : "")} onClick={() => toggle("extras", x)}>
                          <span className="box">{form.extras.includes(x) && <Check size={12} strokeWidth={3} />}</span>
                          {x}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="tt-bk-block">
                  <h3>Add-ons</h3>
                  <div className="tt-bk-addons">
                    {ADDONS.map((a) => (
                      <button key={a.id} type="button" aria-pressed={form.addons.includes(a.id)} className={"tt-bk-addon" + (form.addons.includes(a.id) ? " on" : "")} onClick={() => toggle("addons", a.id)}>
                        <span className="box">{form.addons.includes(a.id) && <Check size={12} strokeWidth={3} />}</span>
                        <span>
                          <b>{a.label}</b>
                          <small>{a.hint}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-bk-block">
                  <label className="tt-bk-label" htmlFor="bk-notes">
                    Describe your idea <em>(optional)</em>
                  </label>
                  <textarea
                    id="bk-notes"
                    className="tt-bk-input"
                    rows={3}
                    maxLength={1500}
                    placeholder={type.id === "webapp" || type.id === "not_sure" ? "Tell us about your business and what the website or app should do…" : "e.g. 3 branches in Guntur, want customers to see the menu and order on WhatsApp"}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
              </section>
            )}

            {/* ---------- 3. Design & plan ---------- */}
            {step === 2 && type && (
              <section aria-labelledby="bk-h3">
                <header className="tt-bk-head">
                  <span>Step 3 of 4</span>
                  <h2 id="bk-h3">Design & plan</h2>
                  <p>Skip anything you're unsure about — "You choose" is always fine.</p>
                </header>

                <div className="tt-bk-block">
                  <h3>Size</h3>
                  <div className="tt-bk-cards">
                    {PAGE_OPTIONS.map((o) => (
                      <button key={o.id} type="button" aria-pressed={form.pages === o.id} className={"tt-bk-card" + (form.pages === o.id ? " on" : "")} onClick={() => set("pages", o.id)}>
                        <b>{o.label}{o.id === type.pages && o.id !== "not_sure" && <i>Suggested</i>}</b>
                        <small>{o.desc}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-bk-block">
                  <h3>Look & feel</h3>
                  <div className="tt-bk-cards">
                    {STYLE_OPTIONS.map((o) => (
                      <button key={o.id} type="button" aria-pressed={form.style === o.id} className={"tt-bk-card" + (form.style === o.id ? " on" : "")} onClick={() => set("style", o.id)}>
                        <span className="tt-bk-swatch" aria-hidden="true">
                          {o.swatch.map((c) => (
                            <i key={c} style={{ background: c }} />
                          ))}
                        </span>
                        <b>{o.label}</b>
                        <small>{o.desc}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-bk-grid2">
                  <div className="tt-bk-block">
                    <h3>Starting point</h3>
                    <Pills options={EXISTING_OPTIONS} value={form.existing} onPick={(v) => set("existing", v)} />
                    {(form.existing === "have_site" || form.existing === "reference") && (
                      <input
                        className="tt-bk-input"
                        type="url"
                        maxLength={300}
                        placeholder={form.existing === "have_site" ? "Your current website link" : "Link to a website you like"}
                        value={form.link}
                        onChange={(e) => set("link", e.target.value)}
                        aria-label="Website link"
                      />
                    )}
                  </div>
                  <div className="tt-bk-block">
                    <h3>Your content</h3>
                    <Pills options={CONTENT_OPTIONS} value={form.content} onPick={(v) => set("content", v)} />
                  </div>
                  <div className="tt-bk-block">
                    <h3>Domain & hosting</h3>
                    <Pills options={DOMAIN_CHOICES} value={form.domain} onPick={(v) => set("domain", v)} />
                  </div>
                  <div className="tt-bk-block">
                    <h3>When do you need it?</h3>
                    <Pills options={TIMELINES.map((x) => ({ id: x, label: x }))} value={form.timeline} onPick={(v) => set("timeline", v)} />
                  </div>
                </div>

                <div className="tt-bk-block">
                  <h3>Budget</h3>
                  <Pills options={BUDGETS.map((x) => ({ id: x, label: x }))} value={form.budget} onPick={(v) => set("budget", v)} />
                  <p className="tt-bk-hint">
                    {type.from ? `${type.label} usually starts ${priceLabel(type).replace("From", "from")}. ` : ""}
                    Your final price is fixed in writing after a free call — nothing to pay now.
                  </p>
                </div>
              </section>
            )}

            {/* ---------- 4. Details ---------- */}
            {step === 3 && type && (
              <form onSubmit={submit} aria-labelledby="bk-h4" noValidate>
                <header className="tt-bk-head">
                  <span>Step 4 of 4</span>
                  <h2 id="bk-h4">Where should we send your plan?</h2>
                  <p>We reply within 24 hours. Your details are only used for this project.</p>
                </header>
                <input type="text" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className="tt-bk-fields">
                  <Field label="Full name" req>
                    <input className="tt-bk-input" autoComplete="name" maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
                  </Field>
                  <Field label="Email" req>
                    <input className="tt-bk-input" type="email" autoComplete="email" maxLength={120} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                  </Field>
                  <Field label="Mobile number" req>
                    <div className="tt-bk-phone">
                      <select className="tt-bk-input" value={form.code} onChange={(e) => set("code", e.target.value)} aria-label="Country code">
                        {COUNTRY_CODES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <input className="tt-bk-input" type="tel" autoComplete="tel-national" maxLength={20} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" />
                    </div>
                    <label className="tt-bk-inline">
                      <input type="checkbox" checked={form.waDifferent} onChange={(e) => set("waDifferent", e.target.checked)} /> My WhatsApp is a different number
                    </label>
                  </Field>
                  {form.waDifferent ? (
                    <Field label="WhatsApp number" req>
                      <input className="tt-bk-input" type="tel" maxLength={20} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="WhatsApp number" />
                    </Field>
                  ) : (
                    <Field label="Business / brand name">
                      <input className="tt-bk-input" autoComplete="organization" maxLength={100} value={form.business} onChange={(e) => set("business", e.target.value)} placeholder="Leave empty if personal" />
                    </Field>
                  )}
                  <Field label="City" req>
                    <input className="tt-bk-input" autoComplete="address-level2" maxLength={50} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Guntur" />
                  </Field>
                  <Field label="Country">
                    <input className="tt-bk-input" autoComplete="country-name" maxLength={45} value={form.country} onChange={(e) => set("country", e.target.value)} />
                  </Field>
                  {form.waDifferent && (
                    <Field label="Business / brand name" wide>
                      <input className="tt-bk-input" autoComplete="organization" maxLength={100} value={form.business} onChange={(e) => set("business", e.target.value)} placeholder="Leave empty if personal" />
                    </Field>
                  )}
                </div>

                <div className="tt-bk-block">
                  <h3>Best way to reach you</h3>
                  <div className="tt-bk-cards four">
                    {CONTACT_METHODS.map((m) => (
                      <button key={m.id} type="button" aria-pressed={form.contact === m.id} className={"tt-bk-card" + (form.contact === m.id ? " on" : "")} onClick={() => set("contact", m.id)}>
                        <b>{m.id}</b>
                        <small>{m.desc}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-bk-block">
                  <label className="tt-bk-label" htmlFor="bk-msg">
                    Anything else? <em>(optional)</em>
                  </label>
                  <textarea id="bk-msg" className="tt-bk-input" rows={3} maxLength={1000} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Deadlines, best time to call, questions…" />
                </div>

                <label className="tt-bk-consent">
                  <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
                  <span>I agree that Trinity Tech can contact me about this project and store these details.</span>
                </label>

                {status && <p className="tt-bk-alert" role="alert">{status}</p>}
                <div className="tt-bk-actions">
                  <button type="button" className="tt-bk-btn" onClick={() => go(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="tt-bk-btn primary" disabled={busy}>
                    {busy ? "Sending…" : "Send project request"} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {step < 3 && (
              <>
                {status && <p className="tt-bk-alert" role="alert">{status}</p>}
                <div className="tt-bk-actions">
                  {step > 0 ? (
                    <button type="button" className="tt-bk-btn" onClick={() => go(step - 1)}>
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" className="tt-bk-btn primary" onClick={next}>
                    {step === 0 && type ? `Continue with ${type.label}` : step === 2 ? "Continue to your details" : "Continue"} <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ---------- live summary ---------- */}
          <aside className={"tt-bk-summary" + (type ? "" : " empty")} aria-label="Your project summary">
            <span className="tt-bk-sum-k">Your project</span>
            {type ? (
              <>
                <div className="tt-bk-sum-type">
                  <span className="tt-bk-ic">{ICONS[type.icon]}</span>
                  <div>
                    <b>{type.label}</b>
                    <small><Clock size={12} /> {type.days}</small>
                  </div>
                </div>
                <div className="tt-bk-sum-price">
                  <span>{type.from ? "Starting price" : "Pricing"}</span>
                  <strong>{type.from ? priceLabel(type).replace("From ", "") : "Custom quote"}</strong>
                  {form.extras.length + form.addons.length > 0 && <small>+ {form.extras.length + form.addons.length} extras, quoted on call</small>}
                </div>
                <dl>
                  {form.goals.length > 0 && (
                    <div>
                      <dt>Goals</dt>
                      <dd>{form.goals.join(", ")}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Features</dt>
                    <dd>{allFeatures.length} selected</dd>
                  </div>
                  {(form.pages || form.style) && (
                    <div>
                      <dt>Design</dt>
                      <dd>{[labelOf(PAGE_OPTIONS, form.pages), labelOf(STYLE_OPTIONS, form.style)].filter(Boolean).join(" · ")}</dd>
                    </div>
                  )}
                  {(form.timeline || form.budget) && (
                    <div>
                      <dt>Plan</dt>
                      <dd>{[form.timeline, form.budget].filter(Boolean).join(" · ")}</dd>
                    </div>
                  )}
                </dl>
                {step > 0 && (
                  <button type="button" className="tt-bk-sum-edit" onClick={() => go(0)}>
                    Change website type
                  </button>
                )}
              </>
            ) : (
              <p className="tt-bk-sum-empty">Choose a website type to see the usual timeline and starting price.</p>
            )}
            <ul className="tt-bk-trust">
              <li><Check size={13} /> Free consultation call</li>
              <li><Check size={13} /> Fixed quote before any work</li>
              <li><Check size={13} /> Live tracking with your ID</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Pills({ options, value, onPick }: { options: { id: string; label: string }[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="tt-bk-chips">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className={value === o.id ? "on" : ""} onClick={() => onPick(value === o.id ? "" : o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, req, wide, children }: { label: string; req?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={"tt-bk-field" + (wide ? " wide" : "")}>
      <span className="tt-bk-label">
        {label} {req && <i aria-hidden="true">*</i>}
      </span>
      {children}
    </div>
  );
}
