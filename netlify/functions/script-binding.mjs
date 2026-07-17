import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const API_BASE = "https://api.netlify.com/api/v1";
const STORE_NAME = "simple-capi-bindings";
const SITE_PREFIX = "dhc";
const MANIFEST_PATH = "/.well-known/capi-launcher.json";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function ownerKey(user) {
  return sha256(clean(user?.id) || clean(user?.email) || "unknown").slice(0, 12);
}

function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function canonicalPageUrl(value) {
  const input = clean(value);
  let url;
  try {
    url = new URL(input);
  } catch {
    throw Object.assign(new Error("Enter a complete page URL, including https://."), { statusCode: 400 });
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw Object.assign(new Error("The page URL must use http or https."), { statusCode: 400 });
  }
  url.hash = "";
  url.search = "";
  url.username = "";
  url.password = "";
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${url.pathname}`;
}

function exactFormSelector(value, eventName) {
  if (eventName === "Schedule") return "";
  const selector = clean(value);
  if (!selector) {
    throw Object.assign(new Error("Enter the exact form selector, such as #contact-form."), { statusCode: 400 });
  }
  if (selector.length > 180) {
    throw Object.assign(new Error("The form selector is too long."), { statusCode: 400 });
  }
  if (["form", "*", "body", "html"].includes(selector.toLowerCase())) {
    throw Object.assign(new Error("Use a selector for one exact form, not every form on the page."), { statusCode: 400 });
  }
  if (!/^[#.[\]="'():_\-a-zA-Z0-9\s>+~*^$|]+$/.test(selector)) {
    throw Object.assign(new Error("The form selector contains unsupported characters."), { statusCode: 400 });
  }
  return selector;
}

function identityEndpoint(request) {
  const configured = clean(process.env.CAPI_IDENTITY_URL);
  if (configured) return new URL("user", configured.endsWith("/") ? configured : `${configured}/`).href;
  return new URL("/.netlify/identity/user", clean(process.env.URL) || new URL(request.url).origin).href;
}

async function bearerUser(request) {
  const match = clean(request.headers.get("authorization")).match(/^Bearer\s+([A-Za-z0-9._-]+)$/i);
  if (!match) return null;
  try {
    const response = await fetch(identityEndpoint(request), { headers: { Authorization: `Bearer ${match[1]}` } });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.id ? {
      id: clean(data.id),
      email: clean(data.email),
      name: clean(data.user_metadata?.full_name) || clean(data.user_metadata?.name)
    } : null;
  } catch {
    return null;
  }
}

async function requireUser(request) {
  const user = await getUser() || await bearerUser(request);
  if (!user) throw Object.assign(new Error("Login required."), { statusCode: 401 });
  return user;
}

function allowedOrigins(request) {
  const origins = new Set([new URL(request.url).origin]);
  clean(process.env.CAPI_APP_ORIGIN).split(",").map((item) => item.trim()).filter(Boolean).forEach((item) => {
    try { origins.add(new URL(item).origin); } catch {}
  });
  return origins;
}

function assertAppOrigin(request) {
  if (["localhost", "127.0.0.1"].includes(new URL(request.url).hostname)) return;
  const origin = clean(request.headers.get("origin"));
  if (!origin || !allowedOrigins(request).has(origin)) {
    throw Object.assign(new Error("Request origin is not allowed."), { statusCode: 403 });
  }
}

function reply(request, status, body) {
  const origin = clean(request.headers.get("origin"));
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (origin && allowedOrigins(request).has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

async function netlifySite(siteId) {
  const token = clean(process.env.NETLIFY_AUTH_TOKEN);
  if (!token) throw Object.assign(new Error("Binding service is not configured."), { statusCode: 503 });
  const response = await fetch(`${API_BASE}/sites/${encodeURIComponent(siteId)}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "Simple CAPI" }
  });
  if (!response.ok) throw Object.assign(new Error("Tracking setup was not found."), { statusCode: response.status === 404 ? 404 : 502 });
  return response.json();
}

async function ownedSite(user, siteId) {
  const site = await netlifySite(siteId);
  const expected = `${SITE_PREFIX}-${ownerKey(user)}-`;
  if (!clean(site.name).startsWith(expected)) {
    throw Object.assign(new Error("You do not own this tracking setup."), { statusCode: 403 });
  }
  return site;
}

async function siteEventName(site) {
  const base = clean(site.ssl_url) || clean(site.url) || `https://${site.name}.netlify.app`;
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}${MANIFEST_PATH}`, { cache: "no-store" });
    if (!response.ok) return "Lead";
    const manifest = await response.json();
    return clean(manifest.event_name) === "Schedule" ? "Schedule" : "Lead";
  } catch {
    return "Lead";
  }
}

function bindingKey(siteName) {
  return `sites/${clean(siteName).toLowerCase()}`;
}

function publicBinding(binding) {
  if (!binding) return null;
  return {
    id: binding.id,
    site_id: binding.site_id,
    allowed_page_url: binding.allowed_page_url,
    form_selector: binding.form_selector,
    event_name: binding.event_name,
    locked_at: binding.locked_at
  };
}

async function readJson(request) {
  try { return await request.json(); }
  catch { throw Object.assign(new Error("Invalid JSON body."), { statusCode: 400 }); }
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    const response = reply(request, 204, null);
    response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    return response;
  }

  try {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const action = clean(url.searchParams.get("action")) || "get";
    const siteId = clean(url.searchParams.get("siteId"));

    if (request.method === "GET" && action === "get") {
      if (!siteId) throw Object.assign(new Error("Tracking setup ID is required."), { statusCode: 400 });
      const site = await ownedSite(user, siteId);
      const binding = await store().get(bindingKey(site.name), { type: "json", consistency: "strong" });
      return reply(request, 200, { success: true, binding: publicBinding(binding) });
    }

    if (request.method === "POST" && action === "lock") {
      assertAppOrigin(request);
      const input = await readJson(request);
      const requestedSiteId = clean(input.siteId);
      if (!requestedSiteId) throw Object.assign(new Error("Tracking setup ID is required."), { statusCode: 400 });
      const site = await ownedSite(user, requestedSiteId);
      const eventName = await siteEventName(site);
      const allowedPageUrl = canonicalPageUrl(input.allowedPageUrl);
      const formSelector = exactFormSelector(input.formSelector, eventName);
      const key = bindingKey(site.name);
      const existing = await store().get(key, { type: "json", consistency: "strong" });

      if (existing) {
        const same = existing.allowed_page_url === allowedPageUrl &&
          existing.form_selector === formSelector && existing.event_name === eventName;
        if (!same) {
          throw Object.assign(new Error("This script is already locked. Create another script for a different page or form."), { statusCode: 409 });
        }
        return reply(request, 200, { success: true, binding: publicBinding(existing) });
      }

      const binding = {
        id: crypto.randomBytes(18).toString("base64url"),
        site_id: site.id,
        site_name: clean(site.name).toLowerCase(),
        owner_key: ownerKey(user),
        allowed_page_url: allowedPageUrl,
        allowed_origin: new URL(allowedPageUrl).origin,
        form_selector: formSelector,
        event_name: eventName,
        locked_at: new Date().toISOString()
      };
      const result = await store().setJSON(key, binding, { onlyIfNew: true });
      if (!result.modified) {
        throw Object.assign(new Error("This script was locked by another request. Refresh and try again."), { statusCode: 409 });
      }
      return reply(request, 201, { success: true, binding: publicBinding(binding) });
    }

    if (request.method === "DELETE" && action === "delete") {
      assertAppOrigin(request);
      if (!siteId) throw Object.assign(new Error("Tracking setup ID is required."), { statusCode: 400 });
      const site = await ownedSite(user, siteId);
      await store().delete(bindingKey(site.name));
      return reply(request, 200, { success: true, deleted: true });
    }

    return reply(request, 405, { success: false, error: "Method not allowed." });
  } catch (error) {
    return reply(request, error?.statusCode || 500, {
      success: false,
      error: error?.statusCode >= 500 ? "The binding service could not complete this request." : clean(error?.message) || "Request failed."
    });
  }
}

export const config = {
  path: "/.netlify/functions/script-binding",
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ["ip", "domain"] }
};

export const __testing = { canonicalPageUrl, exactFormSelector, bindingKey, ownerKey };
