/* ==========================================================================
   PROJECT BOOKING — website types, add-ons and plan options.
   Plain-language choices so clients never have to answer technical
   questions (login, database, hosting): Trinity Tech works those out.

   `from` is the starting price shown to clients (₹). Change it here.
   `days` is the usual delivery time.
   ========================================================================== */

export type SiteGroup = "business" | "sell" | "personal" | "education" | "custom";

export type SiteType = {
  id: string;
  group: SiteGroup;
  label: string;
  desc: string;
  includes: string[]; // what every build of this type comes with (pre-selected)
  extras: string[]; // optional features specific to this type
  pages: string; // suggested size (id from PAGE_OPTIONS)
  days: string;
  from: number | null; // null = custom quote
  tag?: "Most popular" | "Quick launch" | "High value";
  icon: string; // lucide-style icon key (see Contact.tsx) + star shape
  art?: string; // illustration id in /brand/types
};

export const SITE_GROUPS: { id: SiteGroup | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "business", label: "Business & Local" },
  { id: "sell", label: "Sell Online" },
  { id: "personal", label: "Personal & Events" },
  { id: "education", label: "Education & Community" },
  { id: "custom", label: "Custom & Apps" },
];

export const SITE_TYPES: SiteType[] = [
  // ---------------- Business & Local ----------------
  {
    id: "business",
    group: "business",
    label: "Business Website",
    desc: "A professional home for your company or service, built to bring in enquiries.",
    includes: ["Home, About & Services pages", "Enquiry form + WhatsApp button", "Google Maps & contact details"],
    extras: ["Customer reviews", "Photo gallery", "Request a quote form", "Service pricing table", "FAQ section"],
    pages: "small",
    days: "5–7 days",
    from: 9999,
    tag: "Most popular",
    icon: "briefcase",
    art: "business",
  },
  {
    id: "restaurant",
    group: "business",
    label: "Restaurant / Café",
    desc: "Digital menu, food photos and orders or table bookings straight to WhatsApp.",
    includes: ["Digital menu with photos", "QR code menu for tables", "Location & opening hours"],
    extras: ["Order on WhatsApp", "Table reservation", "Online payments", "Offers & combos", "Customer reviews"],
    pages: "small",
    days: "5–7 days",
    from: 8999,
    icon: "utensils",
    art: "restaurant",
  },
  {
    id: "clinic",
    group: "business",
    label: "Clinic / Doctor",
    desc: "Build patient trust and let them book appointments in a few taps.",
    includes: ["Doctor & treatment pages", "Appointment request form", "Timings, map & emergency contact"],
    extras: ["Online slot booking", "WhatsApp reminders", "Patient reviews", "Health blog", "Telugu / Hindi version"],
    pages: "small",
    days: "7–10 days",
    from: 11999,
    tag: "High value",
    icon: "heart-pulse",
    art: "booking",
  },
  {
    id: "salon",
    group: "business",
    label: "Salon / Spa / Gym",
    desc: "Show services and prices, and let customers book their slot online.",
    includes: ["Services & price list", "Slot booking", "Gallery & trainer / stylist profiles"],
    extras: ["Online payments", "Membership plans", "WhatsApp reminders", "Offers & packages", "Customer reviews"],
    pages: "small",
    days: "7–10 days",
    from: 12999,
    icon: "calendar-check",
    art: "booking",
  },
  {
    id: "realestate",
    group: "business",
    label: "Real Estate / Properties",
    desc: "Property listings with photos, filters and site-visit enquiries.",
    includes: ["Property listings with photo galleries", "Search & filters (area, price, type)", "Site-visit enquiry form"],
    extras: ["Admin panel to add properties", "Location map view", "EMI calculator", "Brochure download", "WhatsApp enquiry per property"],
    pages: "medium",
    days: "10–14 days",
    from: 19999,
    tag: "High value",
    icon: "building-2",
    art: "business",
  },
  {
    id: "hotel",
    group: "business",
    label: "Hotel / Homestay / Resort",
    desc: "Rooms, photos and amenities with direct booking enquiries (no commission).",
    includes: ["Rooms & amenities pages", "Photo gallery", "Booking enquiry with dates"],
    extras: ["Online payments / advance booking", "Availability calendar", "Nearby attractions", "Guest reviews", "Multi-language"],
    pages: "small",
    days: "7–10 days",
    from: 14999,
    icon: "bed-double",
    art: "booking",
  },
  {
    id: "travel",
    group: "business",
    label: "Travel & Tour Packages",
    desc: "Showcase tour packages with itineraries and quick booking enquiries.",
    includes: ["Package pages with itineraries", "Enquiry form per package", "WhatsApp chat button"],
    extras: ["Online advance payment", "Admin panel to add packages", "Customer stories & photos", "Search by destination"],
    pages: "medium",
    days: "10–14 days",
    from: 14999,
    icon: "plane",
    art: "business",
  },
  {
    id: "interior",
    group: "business",
    label: "Interior / Construction",
    desc: "A portfolio of finished work that turns visitors into site-visit leads.",
    includes: ["Project portfolio with before/after", "Services & process", "Free consultation form"],
    extras: ["Cost estimator", "Client testimonials", "Admin panel to add projects", "Brochure download"],
    pages: "small",
    days: "7–10 days",
    from: 11999,
    icon: "hammer",
    art: "agency",
  },
  {
    id: "agency",
    group: "business",
    label: "Agency / Startup",
    desc: "A sharp, modern site for agencies, startups and consultants.",
    includes: ["Services & case studies", "Team section", "Project enquiry form"],
    extras: ["Consultation booking", "Careers page", "Blog", "Advanced animations", "Client logos & reviews"],
    pages: "medium",
    days: "10–14 days",
    from: 14999,
    icon: "layers",
    art: "agency",
  },

  // ---------------- Sell Online ----------------
  {
    id: "catalogue",
    group: "sell",
    label: "WhatsApp Catalogue Store",
    desc: "Show your products online and take orders on WhatsApp — no complex checkout.",
    includes: ["Product catalogue with categories", "Order on WhatsApp button", "Admin panel to add products"],
    extras: ["Product search", "Offers & discount banners", "Stock status", "Online payments (UPI)", "Delivery areas"],
    pages: "small",
    days: "7–10 days",
    from: 9999,
    tag: "Most popular",
    icon: "store",
    art: "shop",
  },
  {
    id: "ecommerce",
    group: "sell",
    label: "E-Commerce Store",
    desc: "A full online shop with cart, UPI/card payments and order management.",
    includes: ["Products, cart & checkout", "UPI / card payments", "Orders & stock admin panel"],
    extras: ["Customer accounts", "Coupons & offers", "Order tracking", "Shipping integration", "Invoice emails"],
    pages: "large",
    days: "3–4 weeks",
    from: 24999,
    tag: "High value",
    icon: "shopping-cart",
    art: "ecommerce",
  },
  {
    id: "landing",
    group: "sell",
    label: "Landing Page",
    desc: "One focused page to launch a product, course or offer and collect leads.",
    includes: ["Single high-converting page", "Lead form / WhatsApp", "Speed & SEO basics"],
    extras: ["Pricing section", "Countdown timer", "Testimonials", "Payment button", "Email sign-up"],
    pages: "one",
    days: "3–5 days",
    from: 4999,
    tag: "Quick launch",
    icon: "rocket",
    art: "custom",
  },

  // ---------------- Personal & Events ----------------
  {
    id: "portfolio",
    group: "personal",
    label: "Personal Portfolio",
    desc: "Show your work, skills and resume — for students, freelancers and creators.",
    includes: ["Projects & skills", "Resume download", "Contact & social links"],
    extras: ["Certificates", "Blog", "Advanced animations", "Testimonials", "Custom domain email"],
    pages: "one",
    days: "4–6 days",
    from: 5999,
    tag: "Quick launch",
    icon: "user",
    art: "portfolio",
  },
  {
    id: "photography",
    group: "personal",
    label: "Photography / Artist",
    desc: "Beautiful albums and galleries that get you more shoot bookings.",
    includes: ["Albums & full-screen gallery", "Packages & pricing", "Shoot enquiry form"],
    extras: ["Client private galleries", "Video showreel", "Booking calendar", "Instagram feed"],
    pages: "small",
    days: "5–7 days",
    from: 7999,
    icon: "camera",
    art: "portfolio",
  },
  {
    id: "invitation",
    group: "personal",
    label: "Wedding / Event Invitation",
    desc: "A shareable invite link with RSVP, schedule, music and directions.",
    includes: ["Event details & schedule", "RSVP form", "Map directions & countdown"],
    extras: ["Photo / video gallery", "Background music", "Guest wishes wall", "Telugu / Hindi version"],
    pages: "one",
    days: "2–4 days",
    from: 2999,
    tag: "Quick launch",
    icon: "sparkles",
  },
  {
    id: "blog",
    group: "personal",
    label: "Blog / News",
    desc: "Publish articles and updates with an easy editor — no coding needed.",
    includes: ["Articles & categories", "Easy post editor", "Search & share buttons"],
    extras: ["Newsletter sign-up", "Comments", "Ads placement", "Multiple authors"],
    pages: "medium",
    days: "7–10 days",
    from: 7999,
    icon: "book-open",
    art: "blog",
  },

  // ---------------- Education & Community ----------------
  {
    id: "coaching",
    group: "education",
    label: "Coaching / Institute",
    desc: "Courses, batches, results and admissions enquiries in one place.",
    includes: ["Courses & batch timings", "Admission enquiry form", "Faculty & results"],
    extras: ["Student login & materials", "Online fee payment", "Online tests", "Announcements"],
    pages: "medium",
    days: "10–14 days",
    from: 14999,
    icon: "graduation-cap",
    art: "educational",
  },
  {
    id: "school",
    group: "education",
    label: "School / College",
    desc: "An official website for admissions, notices, events and galleries.",
    includes: ["About, academics & facilities", "Admissions & notices", "Events gallery"],
    extras: ["Admin panel for notices", "Fee payment", "Parent / student login", "Downloads (circulars, forms)"],
    pages: "large",
    days: "2–3 weeks",
    from: 19999,
    icon: "school",
    art: "educational",
  },
  {
    id: "ngo",
    group: "education",
    label: "NGO / Trust / Temple",
    desc: "Share your mission and events, and accept donations online.",
    includes: ["About & activities", "Events & gallery", "Donation (UPI) page"],
    extras: ["Volunteer sign-up", "80G receipt emails", "Live darshan / video", "Telugu / Hindi version"],
    pages: "small",
    days: "7–10 days",
    from: 9999,
    icon: "hand-heart",
    art: "custom",
  },

  // ---------------- Custom & Apps ----------------
  {
    id: "redesign",
    group: "custom",
    label: "Website Redesign",
    desc: "Already have a website? We make it modern, fast and mobile-friendly.",
    includes: ["Fresh modern design", "Faster loading & mobile fix", "Same content moved over"],
    extras: ["New pages", "SEO improvement", "Admin panel", "Move to new hosting"],
    pages: "small",
    days: "5–10 days",
    from: 7999,
    tag: "Quick launch",
    icon: "refresh-cw",
    art: "custom",
  },
  {
    id: "quiz",
    group: "custom",
    label: "Quiz App",
    desc: "Timed quizzes with scores and leaderboards for students, brands or communities.",
    includes: ["Timed questions & instant feedback", "Scores & results screen", "Share on WhatsApp"],
    extras: ["Leaderboard", "Student logins", "Question bank admin", "Certificates", "Telugu / Hindi version"],
    pages: "small",
    days: "7–10 days",
    from: 6999,
    icon: "circle-help",
    art: "educational",
  },
  {
    id: "calculator",
    group: "custom",
    label: "Calculator Tools",
    desc: "EMI, BMI, GST or price calculators that bring visitors back to your website.",
    includes: ["Calculators with instant results", "Simple charts", "Share result button"],
    extras: ["Lead form with result", "More calculators", "PDF report download", "Embed on your website"],
    pages: "small",
    days: "5–7 days",
    from: 4999,
    tag: "Quick launch",
    icon: "calculator",
    art: "custom",
  },
  {
    id: "survey",
    group: "custom",
    label: "Feedback / Survey Form",
    desc: "Branded feedback and survey forms with a results dashboard and QR code.",
    includes: ["Branded form (ratings, choices, comments)", "Results dashboard", "QR code to share"],
    extras: ["CSV / Excel export", "Email alerts on new replies", "Multiple surveys", "Admin login"],
    pages: "small",
    days: "5–7 days",
    from: 4999,
    icon: "clipboard-list",
    art: "custom",
  },
  {
    id: "webapp",
    group: "custom",
    label: "Web App / Dashboard",
    desc: "Booking systems, CRMs, portals and internal tools built around your workflow.",
    includes: ["Logins & user roles", "Dashboard & reports", "Database & secure hosting"],
    extras: ["Online payments", "AI assistant", "Email / WhatsApp alerts", "Mobile-app feel (PWA)"],
    pages: "app",
    days: "3–6 weeks",
    from: null,
    tag: "High value",
    icon: "code-xml",
    art: "custom",
  },
  {
    id: "not_sure",
    group: "custom",
    label: "Not sure — help me choose",
    desc: "Tell us about your business and we'll recommend the right website.",
    includes: ["Free consultation call", "Recommended plan", "Clear quote before work starts"],
    extras: [],
    pages: "not_sure",
    days: "We'll advise",
    from: null,
    icon: "circle-help",
  },
];

/** Add-ons any website can have — written in plain language. */
export const ADDONS: { id: string; label: string; hint: string }[] = [
  { id: "admin", label: "Edit it yourself (admin panel)", hint: "Change text, photos and products without calling us." },
  { id: "payments", label: "Online payments (UPI / cards)", hint: "Razorpay / UPI checkout or advance payments." },
  { id: "booking", label: "Booking / appointment calendar", hint: "Customers pick a date and time slot." },
  { id: "login", label: "Customer accounts / login", hint: "Members area, order history or student portal." },
  { id: "whatsapp", label: "WhatsApp chat & alerts", hint: "Chat button plus enquiry alerts on WhatsApp." },
  { id: "seo", label: "Google search setup (SEO)", hint: "Google Business profile, sitemap and fast loading." },
  { id: "language", label: "Telugu / Hindi version", hint: "Your website in more than one language." },
  { id: "ai", label: "AI chat assistant", hint: "Answers visitor questions 24/7, like Spideyy." },
  { id: "email", label: "Business email (you@yourbrand.in)", hint: "Professional email on your own domain." },
  { id: "maintenance", label: "Monthly care & updates", hint: "Backups, small changes and security updates." },
];

export const GOALS = [
  "Get more enquiries",
  "Look professional / build trust",
  "Sell products online",
  "Take bookings or appointments",
  "Show my work",
  "Share information & updates",
  "Accept payments or donations",
  "Save time with automation",
];

export const PAGE_OPTIONS = [
  { id: "one", label: "1 page", desc: "Everything on one scrolling page" },
  { id: "small", label: "2–5 pages", desc: "Home, About, Services, Gallery, Contact" },
  { id: "medium", label: "6–10 pages", desc: "More services, listings or sections" },
  { id: "large", label: "10+ pages", desc: "Large site or store" },
  { id: "app", label: "Web app", desc: "Logins, dashboards and data" },
  { id: "not_sure", label: "Recommend for me", desc: "We'll size it with you" },
];

export const STYLE_OPTIONS = [
  { id: "clean", label: "Clean & simple", desc: "Light, minimal, easy to read", swatch: ["#ffffff", "#e9edf2", "#1f2937"] },
  { id: "modern", label: "Modern & bold", desc: "Strong colours, sharp type", swatch: ["#0f172a", "#2563eb", "#f8fafc"] },
  { id: "premium", label: "Dark & premium", desc: "Luxury feel, gold accents", swatch: ["#0b0805", "#e8a33d", "#f6e2be"] },
  { id: "warm", label: "Warm & friendly", desc: "Soft colours, welcoming", swatch: ["#fff7ed", "#f97316", "#7c2d12"] },
  { id: "brand", label: "Match my brand", desc: "Use my logo & colours", swatch: ["#d4d4d8", "#a1a1aa", "#52525b"] },
  { id: "not_sure", label: "You choose", desc: "Trinity Tech recommends", swatch: ["#1a1206", "#f6d28a", "#e8a33d"] },
];

export const EXISTING_OPTIONS = [
  { id: "new", label: "Starting fresh" },
  { id: "have_site", label: "I have a website to improve" },
  { id: "reference", label: "I have example sites I like" },
];

export const CONTENT_OPTIONS = [
  { id: "ready", label: "Text & photos ready" },
  { id: "partly", label: "Some of it ready" },
  { id: "help", label: "Need help writing content" },
];

export const DOMAIN_CHOICES = [
  { id: "have", label: "I have a domain" },
  { id: "need", label: "Need a domain & hosting" },
  { id: "not_sure", label: "Not sure" },
];

export const TIMELINES = ["Urgent (within 1 week)", "2–3 weeks", "Within 1 month", "Flexible"];

export const BUDGETS = ["Under ₹5,000", "₹5,000 – ₹10,000", "₹10,000 – ₹20,000", "₹20,000 – ₹40,000", "₹40,000+", "Suggest a budget"];

export const CONTACT_METHODS = [
  { id: "WhatsApp", desc: "Quickest reply" },
  { id: "Phone Call", desc: "We call you" },
  { id: "Email", desc: "Proposal by email" },
  { id: "Google Meet", desc: "Short video call" },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const priceLabel = (t?: SiteType) => (!t ? "" : t.from ? "From " + inr(t.from) : "Custom quote");
export const typeById = (id?: string) => SITE_TYPES.find((t) => t.id === id);
/** Match old links like /project?category=Business%20Website or ?type=ecommerce */
/** Website-type names used on the homepage, Work page and chat → a booking type. */
const TYPE_ALIASES: Record<string, string> = {
  "booking / appointment website": "salon",
  "shop / local store website": "catalogue",
  "educational website": "school",
  "other / custom website": "webapp",
  "quiz app": "quiz",
  "calculator tools": "calculator",
  "feedback / survey form": "survey",
  "photography gallery": "photography",
};
export const typeFromParam = (v?: string | null) => {
  if (!v) return undefined;
  const q = v.toLowerCase();
  const alias = TYPE_ALIASES[q];
  if (alias) return SITE_TYPES.find((t) => t.id === alias);
  return (
    SITE_TYPES.find((t) => t.id === q || t.label.toLowerCase() === q) ||
    SITE_TYPES.find((t) => q.includes(t.id) || t.label.toLowerCase().includes(q.split(/[ /]/)[0]))
  );
};
