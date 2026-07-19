import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const RESEND_API = "https://api.resend.com/emails";
const LEAD_STORE = "simple-capi-sales-leads";
const OFFER_LABELS = {
  done_for_you: "Done-for-you Meta CAPI setup",
  agency_rollout: "Agency client rollout",
  monitoring: "Ongoing tracking support"
};

function cleanString(value, max = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\u0000/g, "").slice(0, max);
}

function escapeHtml(value) {
  return cleanString(value, 5000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function response(request, status, body) {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (allowedOrigins(request).has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function allowedOrigins(request) {
  const origins = new Set(["https://simplecapi.com"]);
  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // The function still keeps the explicit production origin.
  }
  cleanString(process.env.CAPI_APP_ORIGIN, 2000)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      try { origins.add(new URL(value).origin); } catch { /* Ignore malformed configuration. */ }
    });
  if (process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev") {
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:5173");
    origins.add("http://localhost:8888");
  }
  return origins;
}

function assertSameOrigin(request) {
  const origin = request.headers.get("origin") || "";
  if (!origin || !allowedOrigins(request).has(origin)) {
    throw Object.assign(new Error("Request origin is not allowed."), { statusCode: 403 });
  }
}

async function parseJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 64000) {
    throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
  }
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Invalid request body."), { statusCode: 400 });
  }
}

function sourceIp(request) {
  for (const name of ["x-nf-client-connection-ip", "cf-connecting-ip", "x-real-ip", "x-forwarded-for"]) {
    const value = cleanString(request.headers.get(name), 200);
    if (value) return value.split(",")[0].trim();
  }
  return "";
}

function validateLead(input, request) {
  if (cleanString(input.website_url, 200)) return null;

  const fullName = cleanString(input.full_name, 120);
  const email = cleanString(input.email, 254).toLowerCase();
  const company = cleanString(input.company, 160);
  const website = cleanString(input.website, 500);
  const offer = cleanString(input.offer, 50);
  const message = cleanString(input.message, 4000);

  if (fullName.length < 2) {
    throw Object.assign(new Error("Enter your name."), { statusCode: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Enter a valid email address."), { statusCode: 400 });
  }
  if (!Object.hasOwn(OFFER_LABELS, offer)) {
    throw Object.assign(new Error("Choose the setup you need."), { statusCode: 400 });
  }
  if (message.length < 10) {
    throw Object.assign(new Error("Briefly describe what you need fixed or installed."), { statusCode: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  return {
    id,
    created_at: createdAt,
    full_name: fullName,
    email,
    company,
    website,
    offer,
    offer_label: OFFER_LABELS[offer],
    message,
    page_url: cleanString(input.page_url, 1000),
    referrer: cleanString(input.referrer, 1000),
    utm_source: cleanString(input.utm_source, 200),
    utm_medium: cleanString(input.utm_medium, 200),
    utm_campaign: cleanString(input.utm_campaign, 300),
    utm_content: cleanString(input.utm_content, 300),
    utm_term: cleanString(input.utm_term, 300),
    source_ip: sourceIp(request),
    user_agent: cleanString(request.headers.get("user-agent"), 500),
    status: "new"
  };
}

async function saveLead(lead) {
  const store = getStore({ name: LEAD_STORE, consistency: "strong" });
  const day = lead.created_at.slice(0, 10);
  await store.setJSON(`leads/${day}/${lead.id}`, lead, { onlyIfNew: true });
}

function resendConfiguration() {
  const apiKey = cleanString(process.env.RESEND_API_KEY, 500);
  const from = cleanString(process.env.CAPI_FROM_EMAIL, 320);
  const admin = cleanString(process.env.CAPI_ADMIN_EMAIL, 1000)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!apiKey || !from || !admin.length) {
    throw Object.assign(new Error("Email notifications are not configured."), { statusCode: 503 });
  }
  return { apiKey, from, admin };
}

async function sendEmail({ apiKey, from, to, subject, html, text, replyTo }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch(RESEND_API, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo })
    });
    const data = await result.json().catch(() => ({}));
    if (!result.ok) {
      const detail = cleanString(data?.message, 500) || "Email delivery failed.";
      throw Object.assign(new Error(detail), { statusCode: 502 });
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("Email delivery timed out."), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function adminEmail(lead) {
  const rows = [
    ["Offer", lead.offer_label],
    ["Name", lead.full_name],
    ["Email", lead.email],
    ["Company", lead.company || "Not provided"],
    ["Website", lead.website || "Not provided"],
    ["Source", [lead.utm_source, lead.utm_campaign].filter(Boolean).join(" / ") || "Direct"],
    ["Submitted", lead.created_at]
  ];
  const table = rows.map(([label, value]) => `<tr><td style="padding:8px 12px;color:#566173;border-bottom:1px solid #e1e7f0">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#0b1c30;border-bottom:1px solid #e1e7f0;font-weight:600">${escapeHtml(value)}</td></tr>`).join("");
  return {
    subject: `New Simple CAPI lead: ${lead.offer_label}`,
    text: `${lead.offer_label}\n\n${lead.full_name} (${lead.email})\n${lead.company || "No company"}\n${lead.website || "No website"}\n\n${lead.message}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:auto;color:#0b1c30"><h1 style="font-size:24px">New revenue lead</h1><table style="width:100%;border-collapse:collapse;border:1px solid #e1e7f0">${table}</table><h2 style="font-size:18px;margin-top:28px">What they need</h2><p style="white-space:pre-wrap;line-height:1.65;color:#465266">${escapeHtml(lead.message)}</p><p style="font-size:12px;color:#718096">Lead ID: ${escapeHtml(lead.id)}</p></div>`
  };
}

function confirmationEmail(lead) {
  return {
    subject: "Simple CAPI received your setup request",
    text: `Hi ${lead.full_name},\n\nYour request for ${lead.offer_label} was received. I will review the details and reply to this email with the next step.\n\nSimple CAPI`,
    html: `<div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:auto;color:#0b1c30"><img src="https://simplecapi.com/capi-tracker-logo.png" alt="Simple CAPI" width="190" style="display:block;margin-bottom:28px"><h1 style="font-size:26px">Your request is in.</h1><p style="line-height:1.65;color:#465266">Hi ${escapeHtml(lead.full_name)},</p><p style="line-height:1.65;color:#465266">I received your request for <strong>${escapeHtml(lead.offer_label)}</strong>. I will review what you sent and reply by email with the next step.</p><div style="margin:24px 0;padding:18px;background:#f3f7ff;border:1px solid #c8d9f4;border-radius:8px"><strong>What you submitted</strong><p style="margin:10px 0 0;white-space:pre-wrap;line-height:1.55;color:#465266">${escapeHtml(lead.message)}</p></div><p style="line-height:1.65;color:#465266">Simple CAPI</p></div>`
  };
}

export default async function handler(request) {
  if (request.method === "OPTIONS") return response(request, 204, null);
  if (request.method !== "POST") return response(request, 405, { success: false, error: "Method not allowed." });

  try {
    assertSameOrigin(request);
    const input = await parseJson(request);
    const lead = validateLead(input, request);
    if (!lead) return response(request, 200, { success: true });

    const config = resendConfiguration();
    await saveLead(lead);

    const admin = adminEmail(lead);
    await sendEmail({
      apiKey: config.apiKey,
      from: config.from,
      to: config.admin,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: lead.email
    });

    const confirmation = confirmationEmail(lead);
    sendEmail({
      apiKey: config.apiKey,
      from: config.from,
      to: [lead.email],
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
      replyTo: config.admin[0]
    }).catch(() => {});

    return response(request, 200, { success: true, lead_id: lead.id });
  } catch (error) {
    return response(request, error?.statusCode || 500, {
      success: false,
      error: error?.message || "Could not submit the request."
    });
  }
}

export const config = {
  path: "/.netlify/functions/service-lead",
  rateLimit: {
    windowLimit: 10,
    windowSize: 600,
    aggregateBy: ["ip", "domain"]
  }
};
