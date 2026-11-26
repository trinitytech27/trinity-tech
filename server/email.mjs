import nodemailer from "nodemailer";

const escape = (s) =>
  String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function sanitizeError(err, pass) {
  let msg = String(err?.message || err || "Email delivery failed");
  if (pass && typeof pass === "string" && pass.length > 3) {
    msg = msg.split(pass).join("[REDACTED]");
  }
  return msg;
}

const SITE_FALLBACK = "https://trinity-tech.vercel.app";
const originOf = (siteUrl) => (siteUrl || process.env.SITE_URL || SITE_FALLBACK).replace(/\/$/, "");

/* Dark-gold Trinity Tech email layout (inline-friendly; works in Gmail/Outlook). */
function emailShell(title, preheader, content, siteUrl) {
  const origin = originOf(siteUrl);
  const host = origin.replace(/^https?:\/\//, "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>${escape(title)}</title>
  <style>
    body { margin:0; padding:0; background:#050403; }
    .wrap { width:100%; box-sizing:border-box; background:#050403; padding:28px 12px; }
    .card { box-sizing:border-box; }
    .card { max-width:620px; margin:0 auto; background:#0d0a06; border:1px solid #8a6424; border-radius:18px; padding:30px 26px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#efe3cc; }
    h1 { margin:6px 0 14px; font-size:24px; line-height:1.3; color:#ffffff; text-align:center; font-weight:700; }
    h1 .gold, .gold { color:#f0b752; }
    p { margin:0 0 14px; font-size:14.5px; line-height:1.65; color:#d9cdb6; }
    strong { color:#ffffff; }
    .pill { display:inline-block; border:1px solid #c8913a; border-radius:999px; padding:7px 18px; font-size:13px; color:#f6d28a; background:#1a130a; }
    .code-badge { display:inline-block; border:1px solid #c8913a; border-radius:14px; padding:12px 26px; font-size:28px; font-weight:800; letter-spacing:.04em; color:#f6c66b; background:#120d06; margin:10px 0 6px; font-family:'Segoe UI',Roboto,Arial,sans-serif; }
    .panel { border:1px solid #6e4f1d; border-radius:14px; background:#110c07; padding:14px 16px; margin:14px 0; }
    .panel-title { font-size:15px; font-weight:700; color:#ffffff; margin:0 0 8px; }
    .meta-table { width:100%; border-collapse:collapse; font-size:13.5px; }
    .meta-table td { padding:8px 4px; border-bottom:1px solid #2a2014; color:#efe3cc; vertical-align:top; }
    .meta-table td.label { color:#b9a684; width:42%; }
    .box { background:#140f08; border-left:3px solid #e8a33d; padding:14px 16px; margin:16px 0; border-radius:0 10px 10px 0; font-size:14px; white-space:pre-wrap; color:#efe3cc; }
    .btn { display:inline-block; background:#e8a33d; background-image:linear-gradient(120deg,#c9862a,#f0b752,#f6d28a); color:#1a1206 !important; text-decoration:none; padding:13px 28px; border-radius:999px; font-weight:700; font-size:14.5px; margin-top:10px; }
    .btn-secondary { display:inline-block; background:#25d366; color:#ffffff !important; text-decoration:none; padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px; margin-left:8px; margin-top:10px; }
    .notice { font-size:12.5px; color:#b9a684; background:#120d07; padding:12px 14px; border-radius:10px; border:1px solid #3a2c17; margin-top:16px; }
    .footer { text-align:center; margin-top:26px; padding-top:18px; border-top:1px solid #3a2c17; font-size:12.5px; color:#b9a684; }
    .footer a { color:#f0b752; text-decoration:none; }
    a { color:#f0b752; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#050403;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(preheader)}</div>
  <div class="wrap">
    <div style="text-align:center;margin:0 0 18px;">
      <img src="${origin}/brand/mark.png" width="64" height="48" alt="Trinity Tech" style="display:inline-block;border:0;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:.32em;color:#ffffff;margin-top:8px;">TRINITY TECH</div>
      <div style="font-size:10.5px;letter-spacing:.42em;color:#e8a33d;margin-top:6px;">DIGITAL SOLUTIONS</div>
    </div>
    <div class="card">
      ${content}
      <div class="footer">
        <div style="font-family:Georgia,serif;letter-spacing:.3em;color:#e8a33d;font-size:14px;">TRINITY TECH</div>
        <div style="font-style:italic;margin:4px 0 12px;">Your Vision. Our Code. Infinite Possibilities.</div>
        <a href="${origin}">${escape(host)}</a> &nbsp;·&nbsp; <a href="mailto:trinitytech27@gmail.com">trinitytech27@gmail.com</a> &nbsp;·&nbsp; <a href="https://wa.me/917075452718">WhatsApp +91 70754 52718</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// EMAIL A: New Enquiry to Owner
export function formatNewEnquiryOwnerHtml(enquiry, trackingCode, siteUrl) {
  const origin = (siteUrl || "https://trinity-tech.in").replace(/\/$/, "");
  const dashboardUrl = origin + "/spideyy";
  const cleanPhone = (enquiry.phone || "").replace(/[^0-9]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const timeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

  const content = `
    <h1>New Client Enquiry Received</h1>
    <div class="code-badge">${escape(trackingCode)}</div>
    <p>A new customer has submitted an enquiry through the website.</p>

    <table class="meta-table">
      <tr><td class="label">Client Name</td><td><strong>${escape(enquiry.name)}</strong></td></tr>
      <tr><td class="label">Business / Brand</td><td>${escape(enquiry.company || "Individual / Personal Project")}</td></tr>
      <tr><td class="label">Email</td><td><a href="mailto:${escape(enquiry.email)}" style="color:#852c32;">${escape(enquiry.email)}</a></td></tr>
      <tr><td class="label">Mobile Number</td><td>${escape(enquiry.phone || "Not provided")}</td></tr>
      ${enquiry.whatsapp ? `<tr><td class="label">WhatsApp</td><td>${escape(enquiry.whatsapp)}</td></tr>` : ""}
      <tr><td class="label">Preferred Contact</td><td><strong>${escape(enquiry.preferred_contact || "Email")}</strong></td></tr>
      <tr><td class="label">Primary Service</td><td><strong>${escape(enquiry.service)}</strong></td></tr>
      ${enquiry.categories?.length ? `<tr><td class="label">Project Types</td><td>${escape(enquiry.categories.join(", "))}</td></tr>` : ""}
      ${enquiry.design_preference ? `<tr><td class="label">Design Style</td><td>${escape(enquiry.design_preference)}</td></tr>` : ""}
      ${enquiry.reference_url ? `<tr><td class="label">Reference Link</td><td><a href="${escape(enquiry.reference_url)}" target="_blank">${escape(enquiry.reference_url)}</a></td></tr>` : ""}
      ${enquiry.has_domain ? `<tr><td class="label">Domain Status</td><td>${escape(enquiry.has_domain)}</td></tr>` : ""}
      ${enquiry.has_existing_website ? `<tr><td class="label">Existing Site</td><td>${escape(enquiry.has_existing_website)}</td></tr>` : ""}
      ${enquiry.website_url ? `<tr><td class="label">Existing Website</td><td><a href="${escape(enquiry.website_url)}" target="_blank">${escape(enquiry.website_url)}</a></td></tr>` : ""}
      ${enquiry.city ? `<tr><td class="label">Location</td><td>${escape(enquiry.city)}, ${escape(enquiry.country || "")}</td></tr>` : ""}
      <tr><td class="label">Timeline</td><td>${escape(enquiry.timeline || "Flexible")}</td></tr>
      <tr><td class="label">Budget Preference</td><td>${escape(enquiry.budget || "Not specified")}</td></tr>
      <tr><td class="label">Submitted At</td><td>${escape(timeIST)}</td></tr>
    </table>

    <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555;">Project Requirements</div>
    <div class="box">${escape(enquiry.description)}</div>

    ${enquiry.additional_message ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Additional Message</div>
      <div class="box" style="border-left-color: #315768;">${escape(enquiry.additional_message)}</div>
    ` : ""}

    ${enquiry.features?.length ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Requested Features</div>
      <div class="box" style="border-left-color: #6c5c4e;">${escape(Array.isArray(enquiry.features) ? enquiry.features.join(", ") : enquiry.features)}</div>
    ` : ""}

    <div style="margin-top: 20px;">
      <a href="${dashboardUrl}" class="btn">Open in Dashboard →</a>
      ${waUrl ? `<a href="${waUrl}" target="_blank" class="btn-secondary">Message on WhatsApp</a>` : ""}
    </div>
  `;

  return emailShell("New Enquiry — " + trackingCode, "New project enquiry from " + enquiry.name, content, siteUrl);
}

// EMAIL B: Confirmation to Customer with Tracking Code
export function formatCustomerConfirmationHtml(enquiry, trackingCode, siteUrl) {
  const origin = originOf(siteUrl);
  const trackUrl = `${origin}/track?code=${encodeURIComponent(trackingCode)}`;
  const row = (label, value) =>
    value ? `<tr><td class="label">${escape(label)}</td><td>${escape(value)}</td></tr>` : "";
  const business = enquiry.business_name || enquiry.company;

  const content = `
    <div style="text-align:center;"><span class="pill">&#10003;&nbsp; Project Enquiry Received</span></div>
    <h1>Your Project Request Has Been <span class="gold">Received</span></h1>
    <p><strong>Hello ${escape(enquiry.name)},</strong><br>
    Thank you for choosing <strong>TRINITY TECH</strong>! We've received your project enquiry. Your details are saved securely and our team will review your requirements and get in touch with you soon.</p>

    <div style="text-align:center;margin:18px 0 6px;">
      <div style="font-size:12px;letter-spacing:.16em;color:#b9a684;text-transform:uppercase;">Your Tracking ID</div>
      <div class="code-badge">${escape(trackingCode)}</div>
      <div><span class="pill" style="font-size:12px;">Request Status: <strong style="color:#f6d28a;">Request Received</strong></span></div>
    </div>

    <div class="panel">
      <div class="panel-title">&#128100;&nbsp; Client Information</div>
      <table class="meta-table">
        ${row("Client Name", enquiry.name)}
        ${row("Business / Brand", business || "Individual / Personal Project")}
        ${row("Registered Email", enquiry.email)}
        ${row("Mobile Number", enquiry.phone)}
        ${row("WhatsApp Number", enquiry.whatsapp)}
        ${row("Preferred Contact", enquiry.preferred_contact || "Email")}
        ${row("Location", enquiry.city)}
      </table>
    </div>

    <div class="panel">
      <div class="panel-title">&#9881;&nbsp; Project Requirements</div>
      <table class="meta-table">
        ${row("Website Type", enquiry.service)}
        ${row("Design Style", enquiry.design_preference)}
        ${row("Pages", enquiry.page_count)}
        ${row("Timeline", enquiry.timeline || "Flexible")}
        ${row("Budget", enquiry.budget || "Not sure yet")}
        ${row("Domain", enquiry.has_domain)}
        ${row("Content", enquiry.content_ready)}
      </table>
    </div>

    <div class="panel" style="text-align:center;">
      <div class="panel-title">&#10148;&nbsp; Track Your Project</div>
      <p style="margin:0 0 6px;">Check your project status and follow every update with your tracking ID and registered email.</p>
      <a href="${trackUrl}" class="btn">Track Your Project &rarr;</a>
      <div style="font-size:12px;margin-top:10px;"><a href="${trackUrl}">${escape(trackUrl.replace(/^https?:\/\//, ""))}</a></div>
    </div>

    <div class="notice">
      <strong>What happens next?</strong> We'll contact you on ${escape(enquiry.preferred_contact || "Email")} to confirm the scope, timeline and pricing before any work begins. Questions? Just reply to this email or message us on WhatsApp.
    </div>

    <p style="text-align:center;margin-top:20px;">Thank you for giving us the opportunity to work on your idea.<br>We look forward to building something great together!</p>
  `;

  return emailShell("Your Project Request Has Been Received — " + trackingCode, "Your tracking ID is " + trackingCode, content, siteUrl);
}

// Custom message from Trinity Tech (superadmin compose)
export function formatCustomMessageHtml({ name, heading, message, trackingCode, linkUrl, linkLabel }, siteUrl) {
  const origin = originOf(siteUrl);
  const safeLink = /^https:\/\/[^\s"'<>]+$/.test(String(linkUrl || "")) ? String(linkUrl) : "";
  const content = `
    ${trackingCode ? `<div style="text-align:center;"><span class="pill">Project ${escape(trackingCode)}</span></div>` : ""}
    <h1>${escape(heading || "A message from Trinity Tech")}</h1>
    <p><strong>Hello ${escape(name || "there")},</strong></p>
    <div class="box">${escape(message)}</div>
    ${safeLink ? `<div style="text-align:center;margin:18px 0;"><a class="btn" href="${escape(safeLink)}">${escape(linkLabel || "Open link")} &rarr;</a></div>` : ""}
    ${trackingCode ? `<div style="text-align:center;"><a class="btn" href="${origin}/track?code=${encodeURIComponent(trackingCode)}">View Your Project &rarr;</a></div>` : ""}
    <p style="margin-top:18px;">Warm regards,<br><strong>Team Trinity Tech</strong></p>
  `;
  return emailShell(heading || "A message from Trinity Tech", String(message || "").slice(0, 90), content, siteUrl);
}

// EMAIL C: Project Accepted
export function formatProjectAcceptedHtml(project, siteUrl) {
  const origin = (siteUrl || "https://trinity-tech.in").replace(/\/$/, "");
  const trackUrl = `${origin}/track?code=${encodeURIComponent(project.tracking_code)}`;

  const content = `
    <h1>Project Accepted!</h1>
    <p>Hello ${escape(project.client_name)},</p>
    <p>We are excited to let you know that your project <strong>${escape(project.title)}</strong> has been officially accepted by Trinity Tech.</p>

    <div class="code-badge">${escape(project.tracking_code)}</div>

    <table class="meta-table">
      <tr><td class="label">Project Title</td><td><strong>${escape(project.title)}</strong></td></tr>
      <tr><td class="label">Service</td><td>${escape(project.service)}</td></tr>
      ${project.target_date ? `<tr><td class="label">Target Completion</td><td><strong>${escape(new Date(project.target_date).toLocaleDateString("en-IN", { dateStyle: "long" }))}</strong></td></tr>` : ""}
      ${project.agreed_price ? `<tr><td class="label">Agreed Price</td><td>${escape(project.agreed_price)}</td></tr>` : ""}
    </table>

    ${project.agreed_scope ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Confirmed Project Scope</div>
      <div class="box">${escape(project.agreed_scope)}</div>
    ` : ""}

    <p style="margin-top: 14px;">You can monitor the live milestones, progress updates, and completion countdown on your project tracking page.</p>

    <div style="margin-top: 20px;">
      <a href="${trackUrl}" class="btn">View Live Project Status →</a>
    </div>
  `;

  return emailShell("Project Accepted: " + project.title + " — " + project.tracking_code, "Your project has been accepted", content, siteUrl);
}

// EMAIL D: Progress Update
export function formatProgressUpdatedHtml(project, updateMessage, siteUrl) {
  const origin = (siteUrl || "https://trinity-tech.in").replace(/\/$/, "");
  const trackUrl = `${origin}/track?code=${encodeURIComponent(project.tracking_code)}`;

  const content = `
    <h1>Project Progress Update</h1>
    <p>Hello ${escape(project.client_name)},</p>
    <p>A new progress milestone has been published for your project <strong>${escape(project.title)}</strong>.</p>

    <div class="code-badge">${escape(project.tracking_code)}</div>

    <table class="meta-table">
      <tr><td class="label">Current Status</td><td><strong>${escape(project.status_label || project.status)}</strong></td></tr>
      <tr><td class="label">Progress</td><td><strong>${escape(project.progress_pct || 0)}% Completed</strong></td></tr>
      ${project.target_date ? `<tr><td class="label">Target Date</td><td>${escape(new Date(project.target_date).toLocaleDateString("en-IN", { dateStyle: "long" }))}</td></tr>` : ""}
    </table>

    ${updateMessage ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Latest Update</div>
      <div class="box">${escape(updateMessage)}</div>
    ` : ""}

    <div style="margin-top: 20px;">
      <a href="${trackUrl}" class="btn">Check Updated Progress →</a>
    </div>
  `;

  return emailShell("Project Update: " + project.tracking_code, "New update on your project", content, siteUrl);
}

// EMAIL E: Project Completed
export function formatProjectCompletedHtml(project, siteUrl) {
  const origin = (siteUrl || "https://trinity-tech.in").replace(/\/$/, "");
  const trackUrl = `${origin}/track?code=${encodeURIComponent(project.tracking_code)}`;

  const content = `
    <h1>Your Project is Completed! 🎉</h1>
    <p>Hello ${escape(project.client_name)},</p>
    <p>We are delighted to confirm that development for <strong>${escape(project.title)}</strong> is complete and ready for launch.</p>

    <div class="code-badge">${escape(project.tracking_code)}</div>

    ${project.live_url ? `
      <div style="margin: 20px 0; padding: 16px; background: #fdfbf7; border: 1px solid #dcd3c4; border-radius: 6px; text-align: center;">
        <div style="font-size: 12px; color: #706044; margin-bottom: 6px;">Live Website / Application Link</div>
        <a href="${escape(project.live_url)}" target="_blank" style="font-size: 17px; font-weight: 700; color: #852c32; text-decoration: underline;">
          ${escape(project.live_url)} ↗
        </a>
      </div>
    ` : ""}

    ${project.delivery_notes ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Delivery & Handover Notes</div>
      <div class="box">${escape(project.delivery_notes)}</div>
    ` : ""}

    <p style="margin-top: 16px;">Thank you for partnering with Trinity Tech. Please review your deliverable and let us know if you need any follow-up adjustments or support.</p>

    <div style="margin-top: 20px;">
      <a href="${trackUrl}" class="btn">View Final Project Summary →</a>
    </div>
  `;

  return emailShell("Project Completed: " + project.tracking_code, "Your project is ready", content, siteUrl);
}

// EMAIL F: Project On Hold / Declined
export function formatProjectStatusChangeHtml(project, reason, siteUrl) {
  const origin = (siteUrl || "https://trinity-tech.in").replace(/\/$/, "");
  const trackUrl = `${origin}/track?code=${encodeURIComponent(project.tracking_code)}`;

  const content = `
    <h1>Project Status Notification</h1>
    <p>Hello ${escape(project.client_name)},</p>
    <p>We are writing to update you on the status of your enquiry / project <strong>${escape(project.title || project.tracking_code)}</strong>.</p>

    <div class="code-badge">${escape(project.tracking_code)}</div>

    <table class="meta-table">
      <tr><td class="label">New Status</td><td><strong>${escape(project.status_label || project.status)}</strong></td></tr>
    </table>

    ${reason ? `
      <div style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 14px;">Status Explanation</div>
      <div class="box">${escape(reason)}</div>
    ` : ""}

    <p style="margin-top: 16px;">If you have any questions or would like to discuss next steps, please reply to this email or reach us at <a href="mailto:trinitytech27@gmail.com" style="color: #852c32;">trinitytech27@gmail.com</a>.</p>

    <div style="margin-top: 20px;">
      <a href="${trackUrl}" class="btn">View Project Tracking →</a>
    </div>
  `;

  return emailShell("Project Status: " + project.tracking_code, "Update regarding your project status", content, siteUrl);
}

// Factory helper to construct or extract a Nodemailer transporter
export function createSmtpTransport(options = {}) {
  if (options.transporter) return options.transporter;

  const host = options.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(options.smtpPort || process.env.SMTP_PORT || 465);
  const secure =
    options.smtpSecure !== undefined
      ? Boolean(options.smtpSecure)
      : process.env.SMTP_SECURE === "false"
        ? false
        : true;
  const user = (options.smtpUser || process.env.SMTP_USER || "").trim();
  const pass = (options.smtpPass || process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

// Verification helper for diagnostic scripts and dashboard test
export async function verifySmtpConnection(options = {}) {
  const host = options.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(options.smtpPort || process.env.SMTP_PORT || 465);
  const secure =
    options.smtpSecure !== undefined
      ? Boolean(options.smtpSecure)
      : process.env.SMTP_SECURE === "false"
        ? false
        : true;
  const user = (options.smtpUser || process.env.SMTP_USER || "").trim();
  const pass = (options.smtpPass || process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return {
      configured: false,
      verified: false,
      host,
      port,
      secure,
      user: user || null,
      error: "Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in environment variables.",
    };
  }

  try {
    const transporter =
      options.transporter ||
      nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });

    await transporter.verify();
    return {
      configured: true,
      verified: true,
      host,
      port,
      secure,
      user,
    };
  } catch (err) {
    const cleanErr = sanitizeError(err, pass);
    return {
      configured: true,
      verified: false,
      host,
      port,
      secure,
      user,
      error: cleanErr,
    };
  }
}

// Core Email Dispatcher via Gmail SMTP (with fallback for Resend if legacy configured)
export async function sendEmail({
  to,
  subject,
  html,
  trackingCode = "",
  template = "generic",
  options = {},
  client = null,
}) {
  const user = (options.smtpUser || process.env.SMTP_USER || "").trim();
  const pass = (options.smtpPass || process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const fromEmail =
    options.fromEmail ||
    process.env.SMTP_FROM_EMAIL ||
    (user ? `"Trinity Tech" <${user}>` : '"Trinity Tech" <trinitytech27@gmail.com>');

  // Priority 1: Gmail SMTP Transporter
  const transporter = options.transporter || createSmtpTransport(options);

  if (transporter) {
    try {
      const recipientString = Array.isArray(to) ? to.join(", ") : to;
      const textFallback = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

      const info = await transporter.sendMail({
        from: fromEmail,
        to: recipientString,
        subject,
        html,
        text: textFallback,
      });

      const messageId = info.messageId || info.response || "gmail-smtp";

      if (client) {
        await logOutbox(client, {
          tracking_code: trackingCode,
          template,
          recipient: recipientString,
          subject,
          status: "sent",
          provider_id: messageId,
        });
      }

      return { success: true, id: messageId, provider: "Gmail SMTP" };
    } catch (err) {
      const cleanErr = sanitizeError(err, pass);
      const recipientString = Array.isArray(to) ? to.join(", ") : to;

      if (client) {
        await logOutbox(client, {
          tracking_code: trackingCode,
          template,
          recipient: recipientString,
          subject,
          status: "failed",
          error: cleanErr,
        });
      }
      return { success: false, error: cleanErr, provider: "Gmail SMTP" };
    }
  }

  // Priority 2: Fallback to Resend (if legacy RESEND_API_KEY is explicitly supplied in options/env)
  const resendApiKey = options.resendApiKey || process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const fetchImpl = options.fetchFn || globalThis.fetch;
    const resendFrom = options.fromEmail || process.env.RESEND_FROM_EMAIL || fromEmail;
    try {
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + resendApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
        signal: AbortSignal.timeout(12000),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.message || "Failed to send email via Resend";
        if (client) {
          await logOutbox(client, {
            tracking_code: trackingCode,
            template,
            recipient: Array.isArray(to) ? to.join(", ") : to,
            subject,
            status: "failed",
            error: errorMsg,
          });
        }
        return { success: false, error: errorMsg, provider: "Resend" };
      }

      if (client) {
        await logOutbox(client, {
          tracking_code: trackingCode,
          template,
          recipient: Array.isArray(to) ? to.join(", ") : to,
          subject,
          status: "sent",
          provider_id: data.id,
        });
      }
      return { success: true, id: data.id, provider: "Resend" };
    } catch (err) {
      const errText = err.message || "Network error while connecting to Resend";
      if (client) {
        await logOutbox(client, {
          tracking_code: trackingCode,
          template,
          recipient: Array.isArray(to) ? to.join(", ") : to,
          subject,
          status: "failed",
          error: errText,
        });
      }
      return { success: false, error: errText, provider: "Resend" };
    }
  }

  // Priority 3: Neither SMTP nor Resend configured -> graceful skip without breaking enquiry
  const unconfiguredReason =
    "Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in environment variables.";

  if (client) {
    await logOutbox(client, {
      tracking_code: trackingCode,
      template,
      recipient: Array.isArray(to) ? to.join(", ") : to,
      subject,
      status: "failed",
      error: unconfiguredReason,
    });
  }

  return {
    success: false,
    skipped: true,
    reason: unconfiguredReason,
  };
}

// Outbox Logger Helper (persists to studio_emails table)
async function logOutbox(client, record) {
  try {
    if (client?.from) {
      await client.from("studio_emails").insert({
        ...record,
        sent_at: record.status === "sent" ? new Date().toISOString() : null,
      });
    }
  } catch {
    /* non-blocking outbox logging */
  }
}

// Backward-compatible wrapper for initial enquiry notification
export function formatEnquiryHtml(enquiry, siteUrl) {
  return formatNewEnquiryOwnerHtml(enquiry, enquiry.tracking_code || "TT-001", siteUrl);
}

// Automatic Notification Pipeline: Owner Alert + Customer Tracking Confirmation
export async function sendEnquiryNotification(enquiry, options = {}, client = null) {
  const siteUrl = options.siteUrl || process.env.SITE_URL || SITE_FALLBACK;
  const trackingCode = enquiry.tracking_code || "TT-001";
  const toEmail =
    options.toEmail ||
    process.env.OWNER_NOTIFICATION_EMAIL ||
    options.smtpUser ||
    process.env.SMTP_USER ||
    "trinitytech27@gmail.com";

  // 1. Send Immediate Notification to Owner's Gmail Inbox
  const ownerHtml = formatNewEnquiryOwnerHtml(enquiry, trackingCode, siteUrl);
  const ownerSubject = `New Trinity Tech Enquiry — ${trackingCode} (${enquiry.name})`;
  const ownerResult = await sendEmail({
    to: toEmail,
    subject: ownerSubject,
    html: ownerHtml,
    trackingCode,
    template: "new_enquiry_owner",
    options,
    client,
  });

  // 2. Send Tracking Code Confirmation to Customer
  if (enquiry.email && /^\S+@\S+\.\S+$/.test(enquiry.email)) {
    const customerHtml = formatCustomerConfirmationHtml(enquiry, trackingCode, siteUrl);
    const customerSubject = `Your Enquiry Has Been Received — ${trackingCode} | Trinity Tech`;
    await sendEmail({
      to: enquiry.email,
      subject: customerSubject,
      html: customerHtml,
      trackingCode,
      template: "confirmation_customer",
      options,
      client,
    });
  }

  return ownerResult;
}
