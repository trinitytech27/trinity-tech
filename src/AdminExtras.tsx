import { useState } from "react";
import { Send, Plus, Trash2, Pencil, Check, X, Mail, Inbox, FolderKanban, Activity, ShieldCheck } from "lucide-react";

export type Me = { id: string; name: string; fullName: string; role: string; access: "superadmin" | "admin" };
type Api = (body?: any) => Promise<any>;

export const isSuper = (me?: Me | null) => !me || me.access === "superadmin";
export const accessLabel = (me?: Me | null) => (isSuper(me) ? "Super Admin" : "Admin");

/* ---------------------------------------------------------------------------
   Compose a branded email from Trinity Tech (Super Admin only)
   --------------------------------------------------------------------------- */
export function ComposeMail({
  api,
  initial,
  onClose,
  onSent,
}: {
  api: Api;
  initial?: { to?: string; name?: string; trackingCode?: string; subject?: string };
  onClose?: () => void;
  onSent?: () => void;
}) {
  const [to, setTo] = useState(initial?.to || "");
  const [name, setName] = useState(initial?.name || "");
  const [trackingCode, setTrackingCode] = useState(initial?.trackingCode || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<{ busy: boolean; msg: string; ok?: boolean }>({ busy: false, msg: "" });

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ busy: true, msg: "" });
    try {
      await api({ action: "send-mail", to, name, trackingCode, subject, message });
      setState({ busy: false, msg: "Email sent to " + to + ".", ok: true });
      setMessage("");
      onSent?.();
    } catch (err: any) {
      setState({ busy: false, msg: err?.message || "Could not send the email." });
    }
  };

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
      <div className="tt-ax-grid">
        <label>
          To (client email)
          <input type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@example.com" />
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
      <div className="tt-ax-actions">
        <span className={"tt-ax-status" + (state.ok ? " ok" : "")} role="status">{state.msg}</span>
        <button className="button" disabled={state.busy}>
          <Send size={15} /> {state.busy ? "Sending…" : "Send email"}
        </button>
      </div>
      <p className="tt-ax-note">The client receives it in the Trinity Tech gold email design, with a button to their project when you add a tracking ID.</p>
    </form>
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
export function AdminOverview({ data, me, goTo, onCompose }: { data: any; me?: Me | null; goTo: (tab: string) => void; onCompose: () => void }) {
  const enquiries: any[] = data?.enquiries || [];
  const projects: any[] = data?.projects || [];
  const emails: any[] = data?.emails || [];
  const fresh = enquiries.filter((x) => x.status === "new");
  const running = projects.filter((p) => !["completed", "declined"].includes(p.status));
  const failed = emails.filter((e) => e.status === "failed");
  const stats = [
    { icon: <Inbox size={18} />, n: fresh.length, label: "New enquiries", tab: "Enquiries" },
    { icon: <FolderKanban size={18} />, n: running.length, label: "Projects in progress", tab: "Active Projects" },
    { icon: <Mail size={18} />, n: emails.length, label: "Emails sent", tab: "Email Outbox" },
    { icon: <Activity size={18} />, n: failed.length, label: "Failed emails", tab: "Email Outbox" },
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
            <button type="button" className="button secondary" onClick={() => goTo("Page content")}>Edit site text &amp; settings</button>
            {isSuper(me) && (
              <button type="button" className="button secondary" onClick={onCompose}>
                <Send size={14} /> Email a client
              </button>
            )}
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
    </div>
  );
}
