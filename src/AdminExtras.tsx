import { useState } from "react";
import { siteTypes } from "./content";
import {
  Send, Plus, Trash2, Pencil, Check, X, Mail, Inbox, FolderKanban, Activity, ShieldCheck, LayoutDashboard, Briefcase,
  BarChart3, FileText, Layers, ClipboardList, Image as ImageIcon, Globe, Bot, Settings, Bell, UserRound, Users, LogOut,
} from "lucide-react";

export type Me = { id: string; name: string; fullName: string; role: string; access: "superadmin" | "admin" };
type Api = (body?: any) => Promise<any>;

export const isSuper = (me?: Me | null) => !me || me.access === "superadmin";
export const accessLabel = (me?: Me | null) => (isSuper(me) ? "Super Admin" : "Admin");

/* ---------------------------------------------------------------------------
   Compose a branded email from Trinity Tech (every admin; logged in the outbox)
   --------------------------------------------------------------------------- */
export type ComposeInit = {
  to?: string;
  name?: string;
  trackingCode?: string;
  subject?: string;
  message?: string;
  category?: string;
  domainKey?: string;
};
type Contact = { email: string; name?: string; code?: string; category?: string };

/** Ready-made messages; {name} and {type} are filled in when chosen. */
const TEMPLATES: { id: string; label: string; subject: string; message: string; withSample?: boolean }[] = [
  {
    id: "thanks",
    label: "Thank you for your enquiry",
    subject: "Thank you for contacting Trinity Tech",
    message:
      "Thank you for your enquiry. We have received your details and a member of our team will contact you within one working day to understand your requirements.\n\nYou can track your project any time with your tracking ID.",
  },
  {
    id: "sample",
    label: "Share a sample website (prototype)",
    subject: "A sample {type} for you",
    message:
      "As promised, here is a working sample of a {type} we build. Open it on your phone or laptop and click through the models.\n\nTell us which one you like, and what you would change. We will build yours with your own name, content and photos.",
    withSample: true,
  },
  {
    id: "proposal",
    label: "Proposal is ready",
    subject: "Your website proposal is ready",
    message:
      "Your website proposal is ready. It covers the pages, features, timeline and cost we discussed.\n\nPlease reply to this email or message us on WhatsApp with any questions, and we can start as soon as you approve it.",
  },
  {
    id: "payment",
    label: "Payment reminder",
    subject: "Gentle reminder: next payment for your website",
    message:
      "This is a gentle reminder that the next payment for your website project is due. Once it is received, we will move on to the next stage straight away.\n\nIf you have already paid, please ignore this message. Thank you!",
  },
  {
    id: "live",
    label: "Website is live",
    subject: "Your website is live!",
    message:
      "Great news: your website is now live! Please open it, check every page on your phone and laptop, and share any changes you would like.\n\nThank you for choosing Trinity Tech.",
  },
];

const fill = (text: string, name: string, type: string) =>
  text.replace(/\{name\}/g, name || "there").replace(/\{type\}/g, type || "website");

export function ComposeMail({
  api,
  initial,
  contacts = [],
  onClose,
  onSent,
}: {
  api: Api;
  initial?: ComposeInit;
  contacts?: Contact[];
  onClose?: () => void;
  onSent?: () => void;
}) {
  const startDomain =
    (initial?.domainKey && siteTypes.find((t) => t.key === initial.domainKey)) ||
    (initial?.category && siteTypes.find((t) => t.category === initial.category)) ||
    null;
  const [to, setTo] = useState(initial?.to || "");
  const [name, setName] = useState(initial?.name || "");
  const [trackingCode, setTrackingCode] = useState(initial?.trackingCode || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [message, setMessage] = useState(initial?.message || "");
  const [button, setButton] = useState<string>(startDomain ? "domain:" + startDomain.key : "none");
  const [customUrl, setCustomUrl] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [state, setState] = useState<{ busy: boolean; msg: string; ok?: boolean }>({ busy: false, msg: "" });

  const domain = button.startsWith("domain:") ? siteTypes.find((t) => "domain:" + t.key === button) : null;
  const typeName = (domain || startDomain)?.title.toLowerCase() || "website";
  const link = domain
    ? { url: domain.demo.url, label: domain.demo.label === "Check prototype" ? "Open the " + domain.title.toLowerCase() + " sample" : "Open the live example" }
    : button === "custom"
      ? { url: customUrl.trim(), label: customLabel.trim() || "Open link" }
      : null;

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    if (t.withSample && !domain) {
      const d = startDomain || siteTypes.find((x) => x.demo.label === "Check prototype");
      if (d) setButton("domain:" + d.key);
    }
    const type = (domain || startDomain)?.title.toLowerCase() || "website";
    setSubject(fill(t.subject, name, type));
    setMessage(fill(t.message, name, type));
  };

  const pickContact = (email: string) => {
    setTo(email);
    const c = contacts.find((x) => x.email === email);
    if (!c) return;
    if (c.name && !name) setName(c.name);
    if (c.code && !trackingCode) setTrackingCode(c.code);
    const d = c.category ? siteTypes.find((t) => t.category === c.category) : null;
    if (d && button === "none") setButton("domain:" + d.key);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (link && !/^https:\/\/\S+$/.test(link.url)) {
      setState({ busy: false, msg: "The button link must start with https://" });
      return;
    }
    setState({ busy: true, msg: "" });
    try {
      await api({
        action: "send-mail",
        to: to.trim(),
        name,
        trackingCode,
        subject,
        message,
        linkUrl: link?.url || "",
        linkLabel: link?.label || "",
      });
      setState({ busy: false, msg: "Email sent to " + to.trim() + ".", ok: true });
      setMessage("");
      onSent?.();
    } catch (err: any) {
      setState({ busy: false, msg: err?.message || "Could not send the email." });
    }
  };

  const uniqueContacts = contacts.filter((c, i, a) => c.email && a.findIndex((x) => x.email === c.email) === i);

  return (
    <form className="tt-ax-card tt-compose" onSubmit={send}>
      <div className="tt-ax-head">
        <div>
          <span className="tt-ax-kicker"><Mail size={14} /> From trinitytech27@gmail.com</span>
          <h3>Send an email as Trinity Tech</h3>
        </div>
        {onClose && (
          <button type="button" className="tt-ax-icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>

      <label>
        Start from a template
        <select defaultValue="" onChange={(e) => { applyTemplate(e.target.value); e.target.value = ""; }}>
          <option value="" disabled>Choose a ready-made message…</option>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>

      <div className="tt-ax-grid">
        <label>
          To (client email)
          <input type="email" required list="tt-compose-contacts" value={to} onChange={(e) => pickContact(e.target.value)} placeholder="client@example.com" />
          <datalist id="tt-compose-contacts">
            {uniqueContacts.map((c) => <option key={c.email} value={c.email}>{[c.name, c.code].filter(Boolean).join(" · ")}</option>)}
          </datalist>
        </label>
        <label>
          Client name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aakash" />
        </label>
        <label>
          Tracking ID (optional)
          <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.toUpperCase())} placeholder="TT-002" />
        </label>
        <label>
          Subject
          <input required maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your website design is ready to review" />
        </label>
      </div>
      <label>
        Message
        <textarea required rows={7} maxLength={6000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message to the client…" />
      </label>

      <div className="tt-ax-grid">
        <label>
          Add a button
          <select value={button} onChange={(e) => setButton(e.target.value)}>
            <option value="none">No button</option>
            <optgroup label="Sample website for a domain">
              {siteTypes.map((t) => (
                <option key={t.key} value={"domain:" + t.key}>{t.title} ({t.demo.label === "Check prototype" ? "prototype" : "live project"})</option>
              ))}
            </optgroup>
            <option value="custom">Custom link…</option>
          </select>
        </label>
        {button === "custom" ? (
          <>
            <label>
              Button link
              <input type="url" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://…" />
            </label>
            <label>
              Button text
              <input maxLength={60} value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="View the design" />
            </label>
          </>
        ) : link ? (
          <p className="tt-ax-note tt-compose-link">
            Button: <b>{link.label}</b>{" "}
            <a href={link.url} target="_blank" rel="noreferrer">{link.url.replace(/^https:\/\//, "")} ↗</a>
          </p>
        ) : null}
      </div>

      <div className="tt-ax-actions">
        <span className={"tt-ax-status" + (state.ok ? " ok" : "")} role="status">{state.msg}</span>
        <button className="button" disabled={state.busy}>
          <Send size={15} /> {state.busy ? "Sending…" : "Send email"}
        </button>
      </div>
      <p className="tt-ax-note">
        The client receives it in the Trinity Tech gold email design{link ? `, with a "${link.label}" button` : ""}
        {trackingCode ? " and a button to their project" : ""}. Templates use the client name and the {typeName} you pick.
      </p>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   Prototypes: open, copy or share the sample site for every domain
   --------------------------------------------------------------------------- */
export function PrototypeShelf({ onEmail }: { onEmail?: (init: ComposeInit) => void }) {
  const [copied, setCopied] = useState("");
  const copy = async (key: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <div className="tt-ax-card tt-shelf">
      <div className="tt-ax-head">
        <div>
          <h3>Samples to share with clients</h3>
          <p className="tt-ax-note">One sample for every domain we build. Copy the link, send it on WhatsApp or email it in the Trinity Tech design.</p>
        </div>
      </div>
      <ul className="tt-shelf-list">
        {siteTypes.map((t) => (
          <li key={t.key}>
            <span className="tt-shelf-main">
              <b>{t.title}</b>
              <small>{t.demo.label === "Check prototype" ? "Prototype" : "Live project"} · {t.demo.url.replace(/^https:\/\//, "").replace(/\/$/, "")}</small>
            </span>
            <span className="tt-shelf-actions">
              <a className="button secondary" href={t.demo.url} target="_blank" rel="noreferrer">Open</a>
              <button type="button" className="button secondary" onClick={() => void copy(t.key, t.demo.url)}>
                {copied === t.key ? <><Check size={14} /> Copied</> : "Copy link"}
              </button>
              <a
                className="button secondary"
                href={"https://wa.me/?text=" + encodeURIComponent(`Here is a sample ${t.title.toLowerCase()} website by Trinity Tech: ${t.demo.url}`)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              {onEmail && (
                <button type="button" className="button" onClick={() => onEmail({ domainKey: t.key })}>
                  <Send size={14} /> Email
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Client-visible project updates: add, edit, remove (shown on /track)
   --------------------------------------------------------------------------- */
type Update = { id: string; text: string; at: string; by?: string };

export function UpdatesEditor({ project, api, me, onSaved }: { project: any; api: Api; me?: Me | null; onSaved?: () => void }) {
  const [list, setList] = useState<Update[]>(() => {
    const u = Array.isArray(project.updates) ? project.updates : [];
    if (u.length) return u;
    // carry over the old single "public update" so nothing is lost
    return project.public_update
      ? [{ id: "legacy", text: project.public_update, at: project.public_update_time || project.updated_at || new Date().toISOString() }]
      : [];
  });
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [msg, setMsg] = useState("");

  const save = async (next: Update[]) => {
    setMsg("Saving…");
    try {
      await api({ action: "project-updates", id: project.id, updates: next });
      setList(next);
      setMsg("Saved — the client sees this on the Track page.");
      onSaved?.();
    } catch (e: any) {
      setMsg(e?.message || "Could not save.");
    }
  };

  return (
    <div className="tt-updates">
      <div className="tt-updates-add">
        <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Post a new update for the client (e.g. Home page design finished)…" />
        <button
          type="button"
          className="button"
          disabled={!draft.trim()}
          onClick={() => {
            const next = [{ id: Math.random().toString(36).slice(2, 10), text: draft.trim(), at: new Date().toISOString(), by: me?.name }, ...list];
            setDraft("");
            void save(next);
          }}
        >
          <Plus size={15} /> Post update
        </button>
      </div>
      {list.length === 0 && <p className="tt-ax-note">No updates yet.</p>}
      <ol className="tt-updates-list">
        {list.map((u) => (
          <li key={u.id}>
            <span className="tt-updates-dot" />
            <div className="tt-updates-body">
              <small>
                {new Date(u.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {u.by ? " · " + u.by : ""}
              </small>
              {editing === u.id ? (
                <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
              ) : (
                <p>{u.text}</p>
              )}
            </div>
            <div className="tt-updates-tools">
              {editing === u.id ? (
                <>
                  <button type="button" className="tt-ax-icon" aria-label="Save" onClick={() => { setEditing(null); void save(list.map((x) => (x.id === u.id ? { ...x, text: editText.trim() || x.text } : x))); }}>
                    <Check size={16} />
                  </button>
                  <button type="button" className="tt-ax-icon" aria-label="Cancel" onClick={() => setEditing(null)}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="tt-ax-icon" aria-label="Edit update" onClick={() => { setEditing(u.id); setEditText(u.text); }}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="tt-ax-icon danger" aria-label="Remove update" onClick={() => { if (confirm("Remove this update?")) void save(list.filter((x) => x.id !== u.id)); }}>
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
      {msg && <p className="tt-ax-status" role="status">{msg}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Overview: what needs attention today
   --------------------------------------------------------------------------- */
export function AdminOverview({ data, me, goTo, onCompose }: { data: any; me?: Me | null; goTo: (tab: string) => void; onCompose: (init?: ComposeInit) => void }) {
  const enquiries: any[] = data?.enquiries || [];
  const projects: any[] = data?.projects || [];
  const emails: any[] = data?.emails || [];
  const fresh = enquiries.filter((x) => x.status === "new");
  const running = projects.filter((p) => !["completed", "declined"].includes(p.status));
  const failed = emails.filter((e) => e.status === "failed");
  const stats = [
    { icon: <Inbox size={18} />, n: fresh.length, label: "New enquiries", tab: "Enquiries" },
    { icon: <FolderKanban size={18} />, n: running.length, label: "Projects in progress", tab: "Active Projects" },
    { icon: <Mail size={18} />, n: emails.length, label: "Emails sent", tab: isSuper(me) ? "Email Outbox" : "Overview" },
    { icon: <Activity size={18} />, n: failed.length, label: "Failed emails", tab: isSuper(me) ? "Email Outbox" : "Overview" },
  ];
  return (
    <div className="tt-ov">
      <div className="tt-ov-stats">
        {stats.map((s) => (
          <button key={s.label} type="button" className="tt-ov-stat" onClick={() => goTo(s.tab)}>
            <span className="tt-ov-ic">{s.icon}</span>
            <b>{s.n}</b>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="tt-ov-cols">
        <div className="tt-ax-card">
          <div className="tt-ax-head">
            <h3>Latest enquiries</h3>
            <button type="button" className="button secondary" onClick={() => goTo("Enquiries")}>View all</button>
          </div>
          {enquiries.length === 0 ? (
            <p className="tt-ax-note">No enquiries yet — new ones appear here instantly.</p>
          ) : (
            <ul className="tt-ov-list">
              {enquiries.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <span className="tt-ov-code">{e.tracking_code || "—"}</span>
                  <span className="tt-ov-main">
                    <b>{e.data?.name || "Client"}</b>
                    <small>{e.data?.service} · {new Date(e.created_at).toLocaleDateString()}</small>
                  </span>
                  <span className={"tt-ov-badge s-" + String(e.status || "new").replace(/[^a-z]/gi, "")}>{e.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tt-ax-card">
          <div className="tt-ax-head">
            <h3>Quick actions</h3>
            <span className="tt-role"><ShieldCheck size={13} /> {accessLabel(me)}</span>
          </div>
          <div className="tt-ov-actions">
            <button type="button" className="button" onClick={() => goTo("Active Projects")}>Manage client projects</button>
            <button type="button" className="button secondary" onClick={() => goTo("Projects")}>Edit portfolio projects</button>
            {isSuper(me) && (
              <button type="button" className="button secondary" onClick={() => goTo("Page content")}>Edit site text &amp; settings</button>
            )}
            <button type="button" className="button secondary" onClick={() => onCompose()}>
              <Send size={14} /> Email a client
            </button>
          </div>
          <h4 className="tt-ov-sub">Recent activity</h4>
          <ul className="tt-ov-activity">
            {(data?.activity || []).slice(0, 6).map((a: any) => (
              <li key={a.id || a.created_at}>
                <span>{a.action}</span>
                <small>{new Date(a.created_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PrototypeShelf onEmail={onCompose} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Navigation: which pages each role sees (Super Admin gets every setting)
   --------------------------------------------------------------------------- */
export type NavItem = { id: string; label: string; icon: React.ReactNode; superOnly?: boolean };
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Work",
    items: [
      { id: "Overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { id: "Enquiries", label: "Enquiries", icon: <Inbox size={18} /> },
      { id: "Active Projects", label: "Client Projects", icon: <FolderKanban size={18} /> },
      { id: "Projects", label: "Portfolio", icon: <Briefcase size={18} /> },
      { id: "Analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "Website",
    items: [
      { id: "Page content", label: "Site Content", icon: <FileText size={18} />, superOnly: true },
      { id: "Services", label: "Services", icon: <Layers size={18} />, superOnly: true },
      { id: "Services & Enquiry Form", label: "Enquiry Form", icon: <ClipboardList size={18} />, superOnly: true },
      { id: "Media", label: "Media", icon: <ImageIcon size={18} /> },
      { id: "SEO", label: "SEO", icon: <Globe size={18} />, superOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { id: "Email Outbox", label: "Emails", icon: <Mail size={18} />, superOnly: true },
      { id: "spideyy", label: "Spideyy AI", icon: <Bot size={18} />, superOnly: true },
      { id: "Security", label: "Security", icon: <ShieldCheck size={18} />, superOnly: true },
      { id: "Settings", label: "Settings", icon: <Settings size={18} /> },
    ],
  },
];
export const navFor = (me?: Me | null) =>
  NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.superOnly || isSuper(me)) })).filter((g) => g.items.length);
export const allowedTab = (tab: string, me?: Me | null) => navFor(me).some((g) => g.items.some((i) => i.id === tab));
export const labelOf = (tab: string) => NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === tab)?.label || tab;

/* ---------------------------------------------------------------------------
   Settings: account, sign-out, notification preferences
   (+ team & system settings for the Super Admin)
   --------------------------------------------------------------------------- */
const PREF_KEY = "tt-admin-prefs";
export type Prefs = { sound: boolean; desktop: boolean };
export function readPrefs(): Prefs {
  try {
    return { sound: true, desktop: false, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") };
  } catch {
    return { sound: true, desktop: false };
  }
}
function writePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

const TEAM = [
  { name: "Sanju", role: "Sanjay · Developer", access: "Super Admin" },
  { name: "Jose", role: "Balajose · Founder", access: "Admin" },
  { name: "Maddy", role: "Madhan Kumar · Developer", access: "Admin" },
];

const SYSTEM_LINKS: [string, string, React.ReactNode][] = [
  ["Email Outbox", "Email server & outbox", <Mail size={16} />],
  ["Security", "Security & sessions", <ShieldCheck size={16} />],
  ["spideyy", "Spideyy AI", <Bot size={16} />],
  ["Services & Enquiry Form", "Enquiry form", <ClipboardList size={16} />],
  ["Page content", "Site content", <FileText size={16} />],
  ["SEO", "SEO", <Globe size={16} />],
];

export function AdminSettings({
  me,
  profile,
  busy,
  onSignOut,
  goTo,
}: {
  me?: Me | null;
  profile?: { name: string; fullName: string; role: string } | null;
  busy?: boolean;
  onSignOut: (everywhere: boolean) => void;
  goTo: (tab: string) => void;
}) {
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const set = (p: Partial<Prefs>) => {
    const next = { ...prefs, ...p };
    setPrefs(next);
    writePrefs(next);
  };
  const askDesktop = async (on: boolean) => {
    if (on && "Notification" in window && Notification.permission !== "granted") {
      const r = await Notification.requestPermission();
      if (r !== "granted") return set({ desktop: false });
    }
    set({ desktop: on });
  };
  const sup = isSuper(me);
  const name = me?.fullName || profile?.fullName || me?.name || profile?.name || "Admin";

  return (
    <div className="tt-set">
      <div className="tt-ax-card">
        <div className="tt-ax-head">
          <div>
            <span className="tt-ax-kicker"><UserRound size={14} /> Your account</span>
            <h3>{name}</h3>
          </div>
          <span className={"tt-role" + (sup ? " super" : "")}>{accessLabel(me)}</span>
        </div>
        <dl className="tt-set-dl">
          <div><dt>Role</dt><dd>{me?.role || profile?.role || "—"}</dd></div>
          <div><dt>Access</dt><dd>{sup ? "Everything, including emails, security and deleting records" : "Enquiries, client projects, portfolio, analytics and media"}</dd></div>
          <div><dt>Session</dt><dd>Locks automatically after 30 minutes</dd></div>
        </dl>
      </div>

      <div className="tt-ax-card">
        <div className="tt-ax-head">
          <div>
            <span className="tt-ax-kicker"><Bell size={14} /> Notifications</span>
            <h3>How you hear about new enquiries</h3>
          </div>
        </div>
        <label className="tt-set-toggle">
          <input type="checkbox" checked={prefs.sound} onChange={(e) => set({ sound: e.target.checked })} />
          <span><b>Sound</b><small>Play a soft chime when a new enquiry arrives.</small></span>
        </label>
        <label className="tt-set-toggle">
          <input type="checkbox" checked={prefs.desktop} onChange={(e) => void askDesktop(e.target.checked)} />
          <span><b>Desktop alerts</b><small>Show a system notification while this tab is in the background.</small></span>
        </label>
      </div>

      {sup && (
        <>
          <div className="tt-ax-card">
            <div className="tt-ax-head">
              <div>
                <span className="tt-ax-kicker"><Users size={14} /> Super Admin</span>
                <h3>Team &amp; access</h3>
              </div>
            </div>
            <ul className="tt-set-team">
              {TEAM.map((t) => (
                <li key={t.name}>
                  <span className="tt-set-av">{t.name[0]}</span>
                  <span><b>{t.name}</b><small>{t.role}</small></span>
                  <span className={"tt-role" + (t.access === "Super Admin" ? " super" : "")}>{t.access}</span>
                </li>
              ))}
            </ul>
            <p className="tt-ax-note">Admins manage enquiries, client projects, portfolio, analytics and media. Only the Super Admin sends emails, deletes records and changes site, email, AI and security settings. Access codes are changed in Vercel, never in the code.</p>
          </div>
          <div className="tt-ax-card">
            <div className="tt-ax-head">
              <div>
                <span className="tt-ax-kicker"><Settings size={14} /> Super Admin</span>
                <h3>System settings</h3>
              </div>
            </div>
            <div className="tt-set-links">
              {SYSTEM_LINKS.map(([id, label, icon]) => (
                <button key={id} type="button" onClick={() => goTo(id)}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="tt-ax-card tt-set-out">
        <div className="tt-ax-head">
          <div>
            <span className="tt-ax-kicker"><LogOut size={14} /> Sign out</span>
            <h3>Leave the workspace</h3>
          </div>
        </div>
        <div className="tt-ax-actions">
          <button type="button" className="button secondary" disabled={busy} onClick={() => onSignOut(false)}>
            <LogOut size={15} /> Sign out on this device
          </button>
          <button type="button" className="button tt-set-all" disabled={busy} onClick={() => onSignOut(true)}>
            <LogOut size={15} /> Sign out everywhere
          </button>
        </div>
      </div>
    </div>
  );
}
