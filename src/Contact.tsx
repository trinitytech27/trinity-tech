import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { PageHero } from "./FX3D";
import { scrollToElement, scrollToPageTop, showStars } from "./scroll";
import {
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  BookOpen,
  Building2,
  Layers,
  ShoppingBag,
  Utensils,
  Store,
  GraduationCap,
  Calendar,
  Code,
  HelpCircle,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import {
  DEFAULT_WEBSITE_CATEGORIES,
  categoryArt,
  PRIMARY_PURPOSE_OPTIONS,
  LOGIN_OPTIONS,
  LOGIN_METHODS,
  DASHBOARD_OPTIONS,
  DATA_STORAGE_OPTIONS,
  DESIGN_STYLES,
  ANIMATION_LEVELS,
  PAGE_COUNT_OPTIONS,
  DESIGN_MIND_OPTIONS,
  DOMAIN_OPTIONS,
  TIMELINE_CHOICES,
  BUDGET_CHOICES,
  getCategoryFeatureHeading,
  getWhatsAppEnquiryUrl,
  type DetailedEnquiryData,
} from "./content";

// Available Country Codes for Mobile
const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "US / Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
];

export interface FormState {
  // Step 1: Website Type
  selectedCategory: string;
  customCategoryConcept: string;
  selectedPurposes: string[];

  // Step 2: Features & Architecture
  selectedFeatures: string[];
  includeNotSureFeature: boolean;
  includeOtherFeature: boolean;
  customFeatureNote: string;
  loginOption: string; // 'no' | 'yes' | 'not_sure'
  loginMethod: string; // 'email_password' | 'google' | 'mobile_otp' | 'not_sure'
  dashboardOption: string; // 'no' | 'yes' | 'not_sure'
  dataStorage: string; // 'yes' | 'no' | 'not_sure'

  // Step 3: Design & Preferences
  pageCount: string;
  designStyle: string;
  animationLevel: string;
  designMind: string;
  referenceUrl: string;
  hasDomain: string;
  timeline: string;
  budget: string;

  // Step 4: Contact & Submit
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  whatsappPhone: string;
  sameAsPhone: boolean;
  city: string;
  country: string;
  isBusiness: boolean;
  bizChosen: boolean;
  businessName: string;
  preferredContact: string;
  additionalMessage: string;
  consent: boolean;
  website: string; // honeypot
  idempotencyKey: string;
}

export default function ProjectPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState<number>(0);
  const [contactOther, setContactOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const idempotencyRef = useRef<string>("");

  if (!idempotencyRef.current) {
    idempotencyRef.current = "sxd_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  // Pre-selected category from URL param (e.g. /project?category=... or /project?type=...)
  const initialCategory = useMemo(() => {
    const paramVal = params.get("category") || params.get("type") || params.get("service");
    if (!paramVal) return "";
    const match = DEFAULT_WEBSITE_CATEGORIES.find(
      (c) =>
        c.label.toLowerCase() === paramVal.toLowerCase() ||
        c.id.toLowerCase() === paramVal.toLowerCase(),
    );
    return match ? match.label : paramVal;
  }, [params]);

  const [form, setForm] = useState<FormState>({
    selectedCategory: initialCategory,
    customCategoryConcept: "",
    selectedPurposes: [],

    selectedFeatures: [],
    includeNotSureFeature: false,
    includeOtherFeature: false,
    customFeatureNote: "",
    loginOption: "",
    loginMethod: "",
    dashboardOption: "",
    dataStorage: "",

    pageCount: "",
    designStyle: "",
    animationLevel: "",
    designMind: "",
    referenceUrl: "",
    hasDomain: "",
    timeline: "",
    budget: "",

    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    whatsappPhone: "",
    sameAsPhone: false,
    city: "",
    country: "",
    isBusiness: false,
    bizChosen: false,
    businessName: "",
    preferredContact: "",
    additionalMessage: "",
    consent: false,
    website: "",
    idempotencyKey: idempotencyRef.current,
  });

  // Restore saved draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tt_enquiry_draft_v6");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setForm((prev) => ({
            ...prev,
            ...parsed,
            selectedCategory: initialCategory || parsed.selectedCategory || "",
            website: "",
            idempotencyKey: idempotencyRef.current,
          }));
        }
      }
    } catch {
      /* ignore storage errors */
    }
  }, [initialCategory]);

  // the star background draws the type of website the client picked
  useEffect(() => {
    const ICONS: Record<string, string> = {
      portfolio: "user",
      blog: "book-open",
      business: "briefcase",
      agency: "layers",
      ecommerce: "shopping-cart",
      restaurant: "utensils",
      shop: "store",
      booking: "calendar-check",
      educational: "graduation-cap",
      custom: "code-xml",
      not_sure: "circle-help",
    };
    const cat = DEFAULT_WEBSITE_CATEGORIES.find((c) => c.label === form.selectedCategory);
    const icon = cat ? ICONS[cat.id] : "";
    showStars(icon ? "icon:" + icon + "@top" : "wave");
  }, [form.selectedCategory]);

  // Persist draft
  useEffect(() => {
    try {
      const safeState: Record<string, unknown> = { ...form };
      delete safeState.website;
      sessionStorage.setItem("tt_enquiry_draft_v6", JSON.stringify(safeState));
    } catch {
      /* ignore storage errors */
    }
  }, [form]);

  const update = (k: keyof FormState, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const selectedCategoryObj = useMemo(() => {
    return DEFAULT_WEBSITE_CATEGORIES.find((c) => c.label === form.selectedCategory);
  }, [form.selectedCategory]);

  const togglePurpose = (purp: string) => {
    setForm((f) => {
      if (purp.includes("Not Sure")) {
        return {
          ...f,
          selectedPurposes: f.selectedPurposes.includes(purp) ? [] : [purp],
        };
      }
      const filtered = f.selectedPurposes.filter((p) => !p.includes("Not Sure"));
      const exists = filtered.includes(purp);
      return {
        ...f,
        selectedPurposes: exists ? filtered.filter((p) => p !== purp) : [...filtered, purp],
      };
    });
  };

  const toggleFeature = (feat: string) => {
    setForm((f) => {
      const exists = f.selectedFeatures.includes(feat);
      return {
        ...f,
        includeNotSureFeature: false,
        selectedFeatures: exists
          ? f.selectedFeatures.filter((item) => item !== feat)
          : [...f.selectedFeatures, feat],
      };
    });
  };

  // every Continue / Back brings the stepper + new step header into view
  const scrollToTop = () =>
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(".builder-progress-stepper");
      if (el) scrollToElement(el);
      else scrollToPageTop();
    });

  // Step 1 Validation
  function handleGoToStep2(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.selectedCategory) {
      setStatus("Please choose a website category to continue.");
      return;
    }
    if (form.selectedPurposes.length === 0) {
      setStatus("Please select at least one primary goal or choose 'Not Sure — Help Me Decide'.");
      return;
    }
    setStatus("");
    setStep(1);
    scrollToTop();
  }

  // Step 2 Validation
  function handleGoToStep3(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const hasFeature =
      form.selectedFeatures.length > 0 ||
      form.includeNotSureFeature ||
      form.includeOtherFeature;
    if (!hasFeature) {
      setStatus("Please select at least one website feature or choose 'Not Sure — Help Me Decide'.");
      return;
    }
    if (!form.loginOption) {
      setStatus("Please answer: 'Do Customers Need to Log In?' (or choose 'Not Sure').");
      return;
    }
    if (form.loginOption === "yes" && !form.loginMethod) {
      setStatus("Please choose how customers should log in (or choose 'Not Sure').");
      return;
    }
    if (!form.dashboardOption) {
      setStatus("Please answer: 'Do You Want to Manage Your Website Yourself?' (or choose 'Not Sure').");
      return;
    }
    if (!form.dataStorage) {
      setStatus("Please answer: 'Will your website need to save customer information?' (or choose 'Not Sure').");
      return;
    }
    setStatus("");
    setStep(2);
    scrollToTop();
  }

  // Step 3 Validation
  function handleGoToStep4(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.pageCount) {
      setStatus("Please choose how many pages you need (or select 'Not Sure — Help Me Decide').");
      return;
    }
    if (!form.designStyle) {
      setStatus("Please select a visual design style (or choose 'Not Sure').");
      return;
    }
    if (!form.animationLevel) {
      setStatus("Please choose your animation preference (or select 'Not Sure').");
      return;
    }
    if (!form.designMind) {
      setStatus("Please answer: 'Do You Already Have a Website or Design?' (or select 'Not Sure').");
      return;
    }
    setStatus("");
    setStep(3);
    scrollToTop();
  }

  // Step 4 Validation — your details
  function validateDetails() {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Please enter your mobile phone number.";
    const wa = form.sameAsPhone ? form.phone.trim() : form.whatsappPhone.trim();
    if (!wa) return "Please enter your WhatsApp number (or check 'Same as Mobile Number').";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.country.trim()) return "Please enter your country.";
    if (!form.bizChosen) return "Please tell us if this is for yourself or a business.";
    if (form.isBusiness && !form.businessName.trim()) return "Please enter your business or brand name.";
    return "";
  }

  function handleGoToStep5(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const problem = validateDetails();
    if (problem) {
      setStatus(problem);
      return;
    }
    setStatus("");
    setStep(4);
    scrollToTop();
  }

  // Final Step 5 Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!form.preferredContact) {
      setStatus("Please choose how we should contact you.");
      return;
    }
    if (form.preferredContact === "Other" && !contactOther.trim()) {
      setStatus("Please tell us how you would like us to contact you.");
      return;
    }

    if (!form.name.trim()) {
      setStatus("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setStatus("Please enter a valid email address.");
      return;
    }
    if (!form.phone.trim()) {
      setStatus("Please enter your mobile phone number.");
      return;
    }
    const finalWhatsApp = form.sameAsPhone ? form.phone.trim() : form.whatsappPhone.trim();
    if (!finalWhatsApp) {
      setStatus("Please enter your WhatsApp number (or check 'Same as Mobile Number').");
      return;
    }
    if (!form.city.trim() || !form.country.trim()) {
      setStatus("Please enter your city and country.");
      return;
    }
    if (form.isBusiness && !form.businessName.trim()) {
      setStatus("Please enter your business or brand name.");
      return;
    }
    if (!form.consent) {
      setStatus("Please check the consent box to proceed.");
      return;
    }

    setBusy(true);
    setStatus("");

    try {
      const fullMobile = form.phone.trim().startsWith("+")
        ? form.phone.trim()
        : `${form.countryCode} ${form.phone.trim()}`;
      const fullWhatsApp = finalWhatsApp.startsWith("+")
        ? finalWhatsApp
        : `${form.countryCode} ${finalWhatsApp}`;

      const compiledFeatures = [...form.selectedFeatures];
      if (form.includeOtherFeature && form.customFeatureNote.trim()) {
        compiledFeatures.push(`Custom: ${form.customFeatureNote.trim()}`);
      }
      if (form.includeNotSureFeature) {
        compiledFeatures.push("Not Sure — Help Me Decide");
      }

      const categoryDescription =
        form.selectedCategory === "Other / Custom Website" && form.customCategoryConcept.trim()
          ? `Other / Custom: ${form.customCategoryConcept.trim()}`
          : form.selectedCategory;

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: fullMobile,
        whatsapp: fullWhatsApp,
        preferred_contact: (form.preferredContact === "Other"
          ? "Other: " + contactOther.trim()
          : form.preferredContact
        ).slice(0, 40),
        company: form.isBusiness ? form.businessName.trim() : "",
        business_name: form.isBusiness ? form.businessName.trim() : "",
        is_business: form.isBusiness,
        is_individual: !form.isBusiness,
        service: categoryDescription,
        categories: [categoryDescription],
        features: compiledFeatures,
        primary_purpose: form.selectedPurposes.join(", "),
        login_option: form.loginOption,
        login_method: form.loginMethod,
        dashboard_option: form.dashboardOption,
        data_storage: form.dataStorage,
        animation_preference: form.animationLevel,
        page_count: form.pageCount,
        existing_design_option: form.designMind,
        reference_url: form.referenceUrl.trim(),
        design_preference: form.designStyle,
        has_domain: form.hasDomain,
        timeline: form.timeline || "Flexible",
        budget: form.budget || "Not Sure Yet",
        description: `Project enquiry for ${categoryDescription}. Objectives: ${form.selectedPurposes.join(", ") || "General"}. Pages: ${form.pageCount}. Style: ${form.designStyle}.`,
        city: (form.city.trim() + ", " + form.country.trim()).slice(0, 100),
        additional_message: [
          form.preferredContact === "Other" ? "Preferred contact: " + contactOther.trim() : "",
          form.additionalMessage.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
        consent: true,
        website: form.website, // honeypot
        idempotency_key: form.idempotencyKey,
      };

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Unable to send your enquiry. Please check your information and try again.");

      const generatedCode = d.trackingCode || "SXD-001";
      setTrackingCode(generatedCode);

      // Build rich WhatsApp URL with all requirements
      const detailedData: DetailedEnquiryData = {
        trackingCode: generatedCode,
        name: form.name.trim(),
        businessName: form.isBusiness ? form.businessName.trim() : undefined,
        email: form.email.trim(),
        phone: fullMobile,
        whatsapp: fullWhatsApp,
        city: form.city.trim() + ", " + form.country.trim(),
        websiteType: categoryDescription,
        primaryPurpose: form.selectedPurposes,
        features: compiledFeatures,
        loginOption:
          form.loginOption === "yes"
            ? "Yes"
            : form.loginOption === "no"
            ? "No"
            : "Not Sure",
        loginMethod:
          form.loginOption === "yes" && form.loginMethod
            ? LOGIN_METHODS.find((m) => m.id === form.loginMethod)?.label || form.loginMethod
            : undefined,
        dashboardOption:
          DASHBOARD_OPTIONS.find((d) => d.id === form.dashboardOption)?.label || form.dashboardOption,
        dataStorage:
          DATA_STORAGE_OPTIONS.find((ds) => ds.id === form.dataStorage)?.label || form.dataStorage,
        designStyle:
          DESIGN_STYLES.find((ds) => ds.id === form.designStyle)?.label || form.designStyle,
        animationLevel:
          ANIMATION_LEVELS.find((al) => al.id === form.animationLevel)?.label || form.animationLevel,
        pageCount:
          PAGE_COUNT_OPTIONS.find((pc) => pc.id === form.pageCount)?.label || form.pageCount,
        existingDesign:
          DESIGN_MIND_OPTIONS.find((dm) => dm.id === form.designMind)?.label || form.designMind,
        referenceUrl: form.referenceUrl.trim() || undefined,
        hasDomain:
          DOMAIN_OPTIONS.find((dm) => dm.id === form.hasDomain)?.label || form.hasDomain || undefined,
        timeline: form.timeline || "Flexible",
        budget: form.budget || "Not Sure Yet",
        additionalMessage: form.additionalMessage.trim() || undefined,
      };

      const waUrl = getWhatsAppEnquiryUrl(generatedCode, categoryDescription, detailedData);
      setGeneratedWhatsAppUrl(waUrl);
      setSent(true);

      // Clear draft storage
      sessionStorage.removeItem("tt_enquiry_draft_v6");
      scrollToTop();

      // Continue on WhatsApp only when that is the chosen contact method
      if (form.preferredContact === "WhatsApp") setTimeout(() => {
        try {
          window.location.assign(waUrl);
        } catch {
          /* fallback to clickable button on success screen */
        }
      }, 400);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copyTrackingId() {
    if (trackingCode) {
      void navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const renderCategoryIcon = (catId?: string) => {
    switch (catId) {
      case "portfolio":
        return <User size={20} />;
      case "blog":
        return <BookOpen size={20} />;
      case "business":
        return <Building2 size={20} />;
      case "agency":
        return <Layers size={20} />;
      case "ecommerce":
        return <ShoppingBag size={20} />;
      case "restaurant":
        return <Utensils size={20} />;
      case "shop":
        return <Store size={20} />;
      case "educational":
        return <GraduationCap size={20} />;
      case "booking":
        return <Calendar size={20} />;
      case "custom":
        return <Code size={20} />;
      case "not_sure":
      default:
        return <HelpCircle size={20} />;
    }
  };

  return (
    <div id="enquiry-top" className="page contact-page tt-booking-page">
      <PageHero
        index="04"
        kicker="Start a Project"
        title="Let's start"
        accent="your project."
        sub="Five easy steps: choose what you need, tell us about you and how to reach you — you get a permanent tracking ID."
      />
      <div className="wrap tt-booking-body" data-section="Booking">

      {/* 4-Step Progress Indicator Header (01 -> 02 -> 03 -> 04) */}
      {!sent && (
        <div className="builder-progress-stepper" aria-label="Enquiry progress">
          <button
            type="button"
            className={`stepper-item ${step === 0 ? "active" : step > 0 ? "completed" : ""}`}
            onClick={() => step > 0 && setStep(0)}
          >
            <span className="stepper-num">01</span>
            <span className="stepper-label">Website Type</span>
          </button>
          <span className="stepper-arrow" aria-hidden="true">→</span>
          <button
            type="button"
            className={`stepper-item ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}
            onClick={() => step > 1 && setStep(1)}
          >
            <span className="stepper-num">02</span>
            <span className="stepper-label">Features</span>
          </button>
          <span className="stepper-arrow" aria-hidden="true">→</span>
          <button
            type="button"
            className={`stepper-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}
            onClick={() => step > 2 && setStep(2)}
          >
            <span className="stepper-num">03</span>
            <span className="stepper-label">Design</span>
          </button>
          <span className="stepper-arrow" aria-hidden="true">→</span>
          <button
            type="button"
            className={`stepper-item ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}
            onClick={() => step > 3 && setStep(3)}
          >
            <span className="stepper-num">04</span>
            <span className="stepper-label">Your Details</span>
          </button>
          <span className="stepper-arrow">→</span>
          <button
            type="button"
            className={`stepper-item ${step === 4 ? "active" : ""}`}
            onClick={() => step > 4 && setStep(4)}
          >
            <span className="stepper-num">05</span>
            <span className="stepper-label">Contact & Submit</span>
          </button>
        </div>
      )}

      {/* Confirmation Screen */}
      {sent ? (
        <div className="builder-confirmation-card">
          <div className="washi-tape-strip top-center" aria-hidden="true" />
          <div className="confirmation-badge">
            <CheckCircle2 size={44} style={{ color: "#3b5f3d" }} />
          </div>
          <h2 className="confirmation-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)", marginTop: 12 }}>
            Your Project Enquiry Has Been Registered!
          </h2>
          <p className="confirmation-sub" style={{ fontSize: 15, maxWidth: 580, margin: "8px auto 20px" }}>
            Thank you, <strong>{form.name}</strong>. Your project details have been securely recorded in our database.
          </p>

          <div className="confirmation-code-box">
            <span className="confirmation-code-label">Permanent Tracking ID</span>
            <div className="confirmation-code">{trackingCode}</div>
            <p className="confirmation-code-note">
              Use this tracking code anytime to check milestones, updates, and progress on our tracking portal.
            </p>
            <button type="button" className="confirmation-copy-btn" onClick={copyTrackingId}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied Tracking ID!" : "Copy Tracking ID"}
            </button>
          </div>

          {/* Primary WhatsApp Action */}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <a
              href={generatedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-whatsapp"
              style={{
                fontSize: 16,
                padding: "14px 32px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageCircle size={20} />
              Open WhatsApp with Project Brief →
            </a>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              A prefilled WhatsApp message with your selected requirements is ready to send.
            </span>
          </div>

          <div className="confirmation-actions" style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to={`/track?code=${trackingCode}`} className="button secondary">
              Track My Project
            </Link>
            <Link to="/" className="button secondary">
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="builder-container">
          {/* STEP 1: CHOOSE YOUR WEBSITE */}
          {step === 0 && (
            <div className="builder-step-form">
              <div className="builder-step-header">
                <span className="eyebrow">STEP 1 OF 5</span>
                <h2 className="builder-step-title">What Kind of Website Do You Need?</h2>
                <p className="builder-step-sub">
                  Choose the type of website you&apos;re planning. We&apos;ll help you with the rest.
                </p>
              </div>

              {/* 11 Selectable Category Cards */}
              <div className="builder-categories-grid" role="radiogroup" aria-label="Website Category">
                {DEFAULT_WEBSITE_CATEGORIES.map((cat) => {
                  const isSelected = form.selectedCategory === cat.label;
                  return (
                    <div
                      key={cat.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      className={`builder-category-card ${isSelected ? "selected" : ""}`}
                      onClick={() => update("selectedCategory", cat.label)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          update("selectedCategory", cat.label);
                        }
                      }}
                    >
                      {categoryArt(cat.id) && <img className="builder-cat-art" src={categoryArt(cat.id)} alt="" loading="lazy" />}
                      <div className="builder-cat-header">
                        <div className="builder-cat-icon">{renderCategoryIcon(cat.id)}</div>
                        <div className="builder-radio-dot" aria-hidden="true" />
                      </div>
                      <div className="builder-cat-body">
                        <h3 className="builder-cat-title">{cat.label}</h3>
                        <p className="builder-cat-desc">{cat.desc}</p>
                      </div>
                      {cat.examples && cat.examples.length > 0 && (
                        <div className="builder-cat-examples">
                          <span className="builder-examples-label">Examples:</span>
                          <div className="builder-examples-tags">
                            {cat.examples.map((ex, idx) => (
                              <span key={idx} className="builder-example-tag">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* If Custom / Other is Selected */}
              {form.selectedCategory === "Other / Custom Website" && (
                <div className="builder-custom-category-box">
                  <label htmlFor="custom-category-concept" className="builder-custom-label">
                    Describe your custom website concept (Optional):
                  </label>
                  <input
                    id="custom-category-concept"
                    type="text"
                    className="builder-input"
                    maxLength={150}
                    placeholder="e.g. A member portal with interactive calculator and booking"
                    value={form.customCategoryConcept}
                    onChange={(e) => update("customCategoryConcept", e.target.value)}
                  />
                </div>
              )}

              {/* Primary Purpose Multi-Select Checklist */}
              <div className="builder-features-section" style={{ marginTop: 32 }}>
                <div className="builder-features-header">
                  <span className="eyebrow">PRIMARY OBJECTIVES</span>
                  <h3 className="builder-features-title">What should your website help you do?</h3>
                  <p className="builder-features-sub">Select all that apply to guide our recommendations.</p>
                </div>

                <div className="builder-objectives-grid">
                  {PRIMARY_PURPOSE_OPTIONS.map((purp) => {
                    const isChecked = form.selectedPurposes.includes(purp);
                    return (
                      <div
                        key={purp}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        className={`builder-checkbox-card ${isChecked ? "checked" : ""}`}
                        onClick={() => togglePurpose(purp)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            togglePurpose(purp);
                          }
                        }}
                      >
                        <div className="builder-checkbox-indicator">
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="builder-objective-name">{purp}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {status && <div className="builder-status-alert">{status}</div>}

              <div className="builder-step-actions">
                <button
                  type="button"
                  className="button builder-continue-btn"
                  onClick={handleGoToStep2}
                >
                  Continue to Features & Functionality <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT FEATURES */}
          {step === 1 && (
            <div className="builder-step-form">
              <div className="builder-step-header">
                <span className="eyebrow">STEP 2 OF 5</span>
                <h2 className="builder-step-title">Select Website Features</h2>
                <p className="builder-step-sub">
                  Choose the features you need for your <strong>{form.selectedCategory}</strong>.
                </p>
              </div>

              {/* Category-Specific Checklist */}
              {selectedCategoryObj && selectedCategoryObj.features && (
                <div className="builder-features-section">
                  <div className="builder-features-header">
                    <h3 className="builder-features-title">
                      {getCategoryFeatureHeading(form.selectedCategory)}
                    </h3>
                  </div>

                  <div className="builder-feature-grid">
                    {selectedCategoryObj.features.map((feat) => {
                      const isChecked = form.selectedFeatures.includes(feat);
                      return (
                        <div
                          key={feat}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          className={`builder-checkbox-card ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleFeature(feat)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleFeature(feat);
                            }
                          }}
                        >
                          <div className="builder-checkbox-indicator">
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                          <span className="builder-feature-label">{feat}</span>
                        </div>
                      );
                    })}

                    {/* Not Sure Feature Choice */}
                    <div
                      role="checkbox"
                      aria-checked={form.includeNotSureFeature}
                      tabIndex={0}
                      className={`builder-checkbox-card ${form.includeNotSureFeature ? "checked" : ""}`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          includeNotSureFeature: !f.includeNotSureFeature,
                          selectedFeatures: f.includeNotSureFeature ? f.selectedFeatures : [],
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setForm((f) => ({
                            ...f,
                            includeNotSureFeature: !f.includeNotSureFeature,
                            selectedFeatures: f.includeNotSureFeature ? f.selectedFeatures : [],
                          }));
                        }
                      }}
                    >
                      <div className="builder-checkbox-indicator">
                        {form.includeNotSureFeature && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="builder-feature-label">Not Sure — Help Me Decide</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Requirements (Simplified) */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">Do Customers Need to Log In?</h3>
                  <p className="builder-substep-desc">
                    Let us know if your website needs visitor accounts or members-only areas.
                  </p>
                </div>

                <div className="builder-radio-cards-grid three-col" role="radiogroup" aria-label="Customer Login">
                  {LOGIN_OPTIONS.map((opt) => {
                    const isSelected = form.loginOption === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          update("loginOption", opt.id);
                          if (opt.id !== "yes") update("loginMethod", "");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("loginOption", opt.id);
                            if (opt.id !== "yes") update("loginMethod", "");
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded login method if Yes is chosen */}
                {form.loginOption === "yes" && (
                  <div style={{ marginTop: 18, padding: 16, background: "var(--soft)", borderRadius: 8 }}>
                    <span className="builder-custom-label" style={{ marginBottom: 10 }}>
                      How should customers log in?
                    </span>
                    <div className="builder-radio-cards-grid" role="radiogroup" aria-label="Login Method">
                      {LOGIN_METHODS.map((method) => {
                        const isMethodSelected = form.loginMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            role="radio"
                            aria-checked={isMethodSelected}
                            tabIndex={0}
                            className={`builder-option-card ${isMethodSelected ? "active" : ""}`}
                            onClick={() => update("loginMethod", method.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                update("loginMethod", method.id);
                              }
                            }}
                          >
                            <div className="builder-radio-dot" aria-hidden="true" />
                            <div className="builder-option-content">
                              <span className="builder-option-title">{method.label}</span>
                              <span className="builder-option-desc">{method.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Dashboard Requirements (Simplified) */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">Do You Want to Manage Your Website Yourself?</h3>
                  <p className="builder-substep-desc">
                    An admin dashboard lets you update content, products, or review enquiries anytime.
                  </p>
                </div>

                <div className="builder-radio-cards-grid three-col" role="radiogroup" aria-label="Admin Dashboard">
                  {DASHBOARD_OPTIONS.map((opt) => {
                    const isSelected = form.dashboardOption === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("dashboardOption", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("dashboardOption", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Storage Requirements (Simplified) */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">
                    Will your website need to save customer information, orders or bookings?
                  </h3>
                  <p className="builder-substep-desc">
                    We handle all database architecture and secure cloud hosting for you.
                  </p>
                </div>

                <div className="builder-radio-cards-grid three-col" role="radiogroup" aria-label="Data Storage">
                  {DATA_STORAGE_OPTIONS.map((opt) => {
                    const isSelected = form.dataStorage === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("dataStorage", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("dataStorage", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {status && <div className="builder-status-alert">{status}</div>}

              <div className="builder-step-actions split">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setStep(0);
                    scrollToTop();
                  }}
                >
                  <ArrowLeft size={16} /> Back to Website Type
                </button>
                <button
                  type="button"
                  className="button builder-continue-btn"
                  onClick={handleGoToStep3}
                >
                  Continue to Design Preferences <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DESIGN PREFERENCES */}
          {step === 2 && (
            <div className="builder-step-form">
              <div className="builder-step-header">
                <span className="eyebrow">STEP 3 OF 5</span>
                <h2 className="builder-step-title">Design & Scope Preferences</h2>
                <p className="builder-step-sub">
                  Tell us about your page expectations, visual style, and timeline.
                </p>
              </div>

              {/* A. Website Page Count (ONLY 4 options as strictly requested) */}
              <div className="builder-substep-section" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">How Many Pages Do You Need?</h3>
                  <p className="builder-substep-desc">Estimate the size of your website. We can refine this together later.</p>
                </div>

                <div className="builder-radio-cards-grid" role="radiogroup" aria-label="Page Count">
                  {PAGE_COUNT_OPTIONS.map((opt) => {
                    const isSelected = form.pageCount === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("pageCount", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("pageCount", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* B. Website Design Style */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">What Style Do You Prefer?</h3>
                  <p className="builder-substep-desc">Choose a design mood that represents your business.</p>
                </div>

                <div className="builder-radio-cards-grid" role="radiogroup" aria-label="Design Style">
                  {DESIGN_STYLES.map((opt) => {
                    const isSelected = form.designStyle === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("designStyle", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("designStyle", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C. Animation Level */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">How Much Animation Do You Want?</h3>
                  <p className="builder-substep-desc">All websites remain fast and smooth across all devices.</p>
                </div>

                <div className="builder-radio-cards-grid" role="radiogroup" aria-label="Animation">
                  {ANIMATION_LEVELS.map((opt) => {
                    const isSelected = form.animationLevel === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("animationLevel", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("animationLevel", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* D. Existing Website or Design */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">Do You Already Have a Website or Design?</h3>
                  <p className="builder-substep-desc">Let us know if we are starting fresh or improving an existing site.</p>
                </div>

                <div className="builder-radio-cards-grid" role="radiogroup" aria-label="Existing Design">
                  {DESIGN_MIND_OPTIONS.map((opt) => {
                    const isSelected = form.designMind === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("designMind", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("designMind", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional URL input if reference or existing site */}
                {(form.designMind === "existing_site" || form.designMind === "reference_site") && (
                  <div style={{ marginTop: 14 }}>
                    <label htmlFor="ref-url-field" className="builder-custom-label">
                      Website or Reference Link (Optional):
                    </label>
                    <input
                      id="ref-url-field"
                      type="url"
                      className="builder-input"
                      maxLength={300}
                      placeholder="https://example.com"
                      value={form.referenceUrl}
                      onChange={(e) => update("referenceUrl", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* E. Domain Address */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">Do you already own a website address?</h3>
                  <p className="builder-substep-desc">Such as yourbusiness.com or yourbrand.in.</p>
                </div>

                <div className="builder-radio-cards-grid three-col" role="radiogroup" aria-label="Domain Ownership">
                  {DOMAIN_OPTIONS.map((opt) => {
                    const isSelected = form.hasDomain === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`builder-option-card ${isSelected ? "active" : ""}`}
                        onClick={() => update("hasDomain", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            update("hasDomain", opt.id);
                          }
                        }}
                      >
                        <div className="builder-radio-dot" aria-hidden="true" />
                        <div className="builder-option-content">
                          <span className="builder-option-title">{opt.label}</span>
                          <span className="builder-option-desc">{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* F. Timeline & Budget */}
              <div className="builder-substep-section">
                <div className="builder-substep-header">
                  <h3 className="builder-substep-title">When Would You Like It Ready?</h3>
                  <p className="builder-substep-desc">This is a planning preference, not a guaranteed delivery date.</p>
                </div>

                <div className="builder-pills-row" role="radiogroup" aria-label="Timeline">
                  {TIMELINE_CHOICES.map((tl) => (
                    <button
                      key={tl}
                      type="button"
                      className={`builder-pill ${form.timeline === tl ? "active" : ""}`}
                      onClick={() => update("timeline", tl)}
                    >
                      {tl}
                    </button>
                  ))}
                </div>

                <div className="builder-substep-header" style={{ marginTop: 24 }}>
                  <h3 className="builder-substep-title">What Is Your Budget Preference?</h3>
                  <p className="builder-substep-desc">This is an initial preference to guide scoping, not a confirmed price.</p>
                </div>

                <div className="builder-pills-row" role="radiogroup" aria-label="Budget">
                  {BUDGET_CHOICES.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      className={`builder-pill ${form.budget === bg ? "active" : ""}`}
                      onClick={() => update("budget", bg)}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {status && <div className="builder-status-alert">{status}</div>}

              <div className="builder-step-actions split">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setStep(1);
                    scrollToTop();
                  }}
                >
                  <ArrowLeft size={16} /> Back to Features
                </button>
                <button
                  type="button"
                  className="button builder-continue-btn"
                  onClick={handleGoToStep4}
                >
                  Continue to Contact Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT AND SUBMIT */}
          {step === 3 && (
            <div className="builder-step-form">
              <div className="builder-step-header">
                <span className="eyebrow">STEP 4 OF 5</span>
                <h2 className="builder-step-title">Tell Us About You</h2>
                <p className="builder-step-sub">
                  Just the basics, so we know who we are building for.
                </p>
              </div>

              <form onSubmit={handleGoToStep5}>
                <div className="builder-form-grid">
                  {/* Full Name */}
                  <div className="builder-form-group">
                    <label htmlFor="client-name">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      className="builder-input"
                      required
                      maxLength={80}
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="builder-form-group">
                    <label htmlFor="client-email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      className="builder-input"
                      required
                      maxLength={120}
                      placeholder="your.email@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="builder-form-group">
                    <label htmlFor="client-phone">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <div className="builder-phone-wrap">
                      <select
                        className="builder-country-select"
                        value={form.countryCode}
                        onChange={(e) => update("countryCode", e.target.value)}
                        aria-label="Country Code"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="client-phone"
                        type="tel"
                        className="builder-input phone-field"
                        required
                        maxLength={20}
                        placeholder="Mobile number"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((f) => ({
                            ...f,
                            phone: val,
                            whatsappPhone: f.sameAsPhone ? val : f.whatsappPhone,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number with Same as Mobile Checkbox */}
                  <div className="builder-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label htmlFor="client-whatsapp" style={{ margin: 0 }}>
                        WhatsApp Number <span className="req">*</span>
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.sameAsPhone}
                        className={"tt-switch" + (form.sameAsPhone ? " on" : "")}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            sameAsPhone: !f.sameAsPhone,
                            whatsappPhone: !f.sameAsPhone ? f.phone : f.whatsappPhone,
                          }))
                        }
                      >
                        <span className="tt-switch-track">
                          <span className="tt-switch-thumb" />
                        </span>
                        Same as mobile
                      </button>
                    </div>
                    <input
                      id="client-whatsapp"
                      type="tel"
                      className="builder-input"
                      required
                      disabled={form.sameAsPhone}
                      maxLength={20}
                      placeholder="WhatsApp number with country code"
                      value={form.sameAsPhone ? form.phone : form.whatsappPhone}
                      onChange={(e) => update("whatsappPhone", e.target.value)}
                    />
                  </div>

                  {/* City */}
                  <div className="builder-form-group">
                    <label htmlFor="client-city">
                      City <span className="req">*</span>
                    </label>
                    <input
                      id="client-city"
                      type="text"
                      className="builder-input"
                      required
                      maxLength={50}
                      placeholder="e.g. Hyderabad"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>

                  {/* Country */}
                  <div className="builder-form-group">
                    <label htmlFor="client-country">
                      Country <span className="req">*</span>
                    </label>
                    <input
                      id="client-country"
                      type="text"
                      className="builder-input"
                      required
                      maxLength={45}
                      list="tt-countries"
                      placeholder="e.g. India"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
                    <datalist id="tt-countries">
                      {["India", "United States", "United Kingdom", "United Arab Emirates", "Canada", "Australia", "Singapore", "Germany", "Saudi Arabia", "Qatar"].map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Individual vs Business */}
                  <div className="builder-form-group">
                    <label>
                      Are You Enquiring For Yourself or a Business? <span className="req">*</span>
                    </label>
                    <div className="builder-pills-row" role="radiogroup">
                      <button
                        type="button"
                        className={`builder-pill ${form.bizChosen && !form.isBusiness ? "active" : ""}`}
                        onClick={() => setForm((f) => ({ ...f, isBusiness: false, bizChosen: true }))}
                      >
                        Personal / Individual Project
                      </button>
                      <button
                        type="button"
                        className={`builder-pill ${form.bizChosen && form.isBusiness ? "active" : ""}`}
                        onClick={() => setForm((f) => ({ ...f, isBusiness: true, bizChosen: true }))}
                      >
                        Business / Organization
                      </button>
                    </div>
                  </div>

                  {/* Business Name if business */}
                  {form.isBusiness && (
                    <div className="builder-form-group full-width">
                      <label htmlFor="client-business-name">
                        Business or Brand Name <span className="req">*</span>
                      </label>
                      <input
                        id="client-business-name"
                        type="text"
                        className="builder-input"
                        required
                        maxLength={100}
                        placeholder="e.g. Acme Studio or CodeXa Solutions"
                        value={form.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                      />
                    </div>
                  )}

                </div>

                {status && <div className="builder-status-alert">{status}</div>}

                <div className="builder-step-actions split">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setStep(2);
                      scrollToTop();
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="button builder-continue-btn">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="builder-step-form">
              <div className="builder-step-header">
                <span className="eyebrow">STEP 5 OF 5</span>
                <h2 className="builder-step-title">How Should We Contact You?</h2>
                <p className="builder-step-sub">
                  Pick what suits you best, check your summary and send your enquiry.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="builder-form-grid">
                  {/* How can we contact you? */}
                  <div className="builder-form-group full-width">
                    <label>
                      How Can We Contact You? <span className="req">*</span>
                    </label>
                    <div className="builder-radio-cards-grid tt-contact-methods" role="radiogroup">
                      {[
                        { id: "Email", desc: "We reply with your proposal by email." },
                        { id: "Google Meet", desc: "A quick video call to discuss your project." },
                        { id: "WhatsApp", desc: "Chat with our team on WhatsApp." },
                        { id: "Phone Call", desc: "We call you at a convenient time." },
                        { id: "Other", desc: "Tell us your preferred way." },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={form.preferredContact === m.id}
                          className={`builder-option-card ${form.preferredContact === m.id ? "selected" : ""}`}
                          onClick={() => update("preferredContact", m.id)}
                        >
                          <span className="builder-radio-dot" />
                          <span className="builder-option-content">
                            <span className="builder-option-title">{m.id}</span>
                            <span className="builder-option-desc">{m.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    {form.preferredContact === "Other" && (
                      <input
                        type="text"
                        className="builder-input"
                        style={{ marginTop: 12 }}
                        maxLength={80}
                        placeholder="Please specify (e.g. Telegram, Zoom, Instagram DM)"
                        value={contactOther}
                        onChange={(e) => setContactOther(e.target.value)}
                        aria-label="Other contact method"
                      />
                    )}
                  </div>

                  {/* Additional Notes (Optional) */}
                  <div className="builder-form-group full-width">
                    <label htmlFor="client-notes">
                      Additional Message or Notes (Optional)
                    </label>
                    <textarea
                      id="client-notes"
                      className="builder-input"
                      rows={3}
                      maxLength={1000}
                      placeholder="Tell us any specific requirements, deadlines, or reference ideas..."
                      value={form.additionalMessage}
                      onChange={(e) => update("additionalMessage", e.target.value)}
                    />
                  </div>
                </div>

                {/* Compact Review Summary */}
                <div className="builder-review-summary">
                  <div className="review-summary-header">
                    <h4 className="review-summary-title">Enquiry Summary</h4>
                    <span className="review-summary-tag">Ready for Proposal</span>
                  </div>

                  <div className="review-summary-rows">
                    <div className="review-row">
                      <span className="review-lbl">Website Type:</span>
                      <span className="review-val">{form.selectedCategory}</span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(0)}>
                        Edit
                      </button>
                    </div>

                    <div className="review-row">
                      <span className="review-lbl">Objectives:</span>
                      <span className="review-val">
                        {form.selectedPurposes.length > 0
                          ? form.selectedPurposes.join(", ")
                          : "Not selected"}
                      </span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(0)}>
                        Edit
                      </button>
                    </div>

                    <div className="review-row">
                      <span className="review-lbl">Features:</span>
                      <span className="review-val">
                        {form.selectedFeatures.length} features selected
                        {form.includeNotSureFeature ? " + Need Guidance" : ""}
                      </span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(1)}>
                        Edit
                      </button>
                    </div>

                    <div className="review-row">
                      <span className="review-lbl">Pages & Style:</span>
                      <span className="review-val">
                        {PAGE_COUNT_OPTIONS.find((p) => p.id === form.pageCount)?.label || "Not specified"} ·{" "}
                        {DESIGN_STYLES.find((d) => d.id === form.designStyle)?.label || "Standard"}
                      </span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>
                        Edit
                      </button>
                    </div>

                    <div className="review-row">
                      <span className="review-lbl">Timeline & Budget:</span>
                      <span className="review-val">
                        {form.timeline || "Flexible"} · {form.budget || "Not sure yet"}
                      </span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>
                        Edit
                      </button>
                    </div>
                    <div className="review-row">
                      <span className="review-lbl">Your Details:</span>
                      <span className="review-val">
                        {form.name || "—"} · {form.email || "—"}
                      </span>
                      <button type="button" className="review-edit-btn" onClick={() => setStep(3)}>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy Consent Checkbox (High Contrast & Flex Aligned) */}
                <label className="builder-consent-check">
                  <input
                    type="checkbox"
                    id="client-consent"
                    required
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                  />
                  <span className="builder-consent-text">
                    I agree to let Trinity Tech contact me regarding this enquiry and store my submitted project details. <span className="req">*</span>
                  </span>
                </label>

                {status && <div className="builder-status-alert">{status}</div>}

                <div className="builder-step-actions split">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setStep(3);
                      scrollToTop();
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="button builder-continue-btn" disabled={busy}>
                    {busy
                      ? "Sending…"
                      : form.preferredContact === "WhatsApp"
                      ? "Submit & Continue on WhatsApp"
                      : "Submit Enquiry"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

// Homepage Section 4 Preview Component
export function EnquiryPreview() {
  const navigate = useNavigate();

  return (
    <div className="builder-container">
      <div className="builder-categories-grid" role="region" aria-label="Website Types Overview">
        {DEFAULT_WEBSITE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="builder-category-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/project?category=${encodeURIComponent(cat.label)}`)}
          >
            {categoryArt(cat.id) && <img className="builder-cat-art" src={categoryArt(cat.id)} alt="" loading="lazy" />}
            <div className="builder-cat-header">
              <div className="builder-cat-icon">
                {cat.id === "portfolio" && <User size={20} />}
                {cat.id === "blog" && <BookOpen size={20} />}
                {cat.id === "business" && <Building2 size={20} />}
                {cat.id === "agency" && <Layers size={20} />}
                {cat.id === "ecommerce" && <ShoppingBag size={20} />}
                {cat.id === "restaurant" && <Utensils size={20} />}
                {cat.id === "shop" && <Store size={20} />}
                {cat.id === "educational" && <GraduationCap size={20} />}
                {cat.id === "booking" && <Calendar size={20} />}
                {cat.id === "custom" && <Code size={20} />}
                {cat.id === "not_sure" && <HelpCircle size={20} />}
              </div>
              <span className="builder-pill" style={{ padding: "4px 10px", fontSize: 11 }}>
                Explore →
              </span>
            </div>
            <div className="builder-cat-body">
              <h3 className="builder-cat-title">{cat.label}</h3>
              <p className="builder-cat-desc">{cat.desc}</p>
            </div>
            {cat.examples && cat.examples.length > 0 && (
              <div className="builder-cat-examples">
                <span className="builder-examples-label">Examples:</span>
                <div className="builder-examples-tags">
                  {cat.examples.slice(0, 3).map((ex, idx) => (
                    <span key={idx} className="builder-example-tag">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Link
          to="/project"
          className="button builder-continue-btn"
          style={{ fontSize: 16, padding: "14px 34px" }}
        >
          Start Your Project (Full Builder) <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
