import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

const STORE_NAME = "simple-capi-provider-configs";
const PUBLIC_ORIGIN = "https://simplecapi.com";
const PROVIDERS = new Set(["tiktok", "google"]);
const EVENTS = new Set(["Lead", "Schedule"]);

function cleanString(value, max = 2000) {
  if (typeof value !== "string") return "";
  const result = value.trim().replace(/\u0000/g, "");
  if (!result || /^(null|undefined)$/i.test(result)) return "";
  return result.slice(0, max);
}

function json(request, status, body) {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (allowedOrigins(request).has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-CAPI-Device";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function allowedOrigins(request) {
  const values = new Set([PUBLIC_ORIGIN]);
  try { values.add(new URL(request.url).origin); } catch {}
  cleanString(process.env.CAPI_APP_ORIGIN)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      try { values.add(new URL(item).origin); } catch {}
    });
  if (process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev") {
    values.add("http://localhost:5173");
    values.add("http://127.0.0.1:5173");
    values.add("http://localhost:8888");
  }
  return values;
}

function assertSameOrigin(request) {
  const origin = request.headers.get("origin") || "";
  if (!origin || !allowedOrigins(request).has(origin)) {
    throw Object.assign(new Error("Request origin is not allowed."), { statusCode: 403 });
  }
}

function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function secretKey() {
  const secret = cleanString(process.env.CAPI_PROVIDER_SECRET) ||
    cleanString(process.env.CAPI_GATEWAY_SECRET) ||
    cleanString(process.env.NETLIFY_AUTH_TOKEN);
  if (secret.length < 20) {
    throw Object.assign(new Error("Provider encryption is not configured."), { statusCode: 503 });
  }
  return crypto.createHash("sha256").update(`simple-capi-provider-v1:${secret}`).digest();
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function ownerKey(user) {
  const value = cleanString(user?.id) || cleanString(user?.email) || "local-development";
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function ownerIndexKey(user) {
  return `owners/${ownerKey(user)}`;
}

function configKey(route) {
  return `configs/${route}`;
}

function sourceIp(request) {
  for (const name of ["x-nf-client-connection-ip", "cf-connecting-ip", "x-real-ip", "x-forwarded-for"]) {
    const value = cleanString(request.headers.get(name), 200);
    if (value) return value.split(",")[0].trim();
  }
  return "";
}

async function identityUserFromBearer(request) {
  const authorization = cleanString(request.headers.get("authorization"), 9000);
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9._-]+)$/i);
  if (!match) return null;
  const base = cleanString(process.env.CAPI_IDENTITY_URL) ||
    `${cleanString(process.env.URL) || new URL(request.url).origin}/.netlify/identity/`;
  const endpoint = new URL("user", base.endsWith("/") ? base : `${base}/`).href;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const result = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${match[1]}` },
      signal: controller.signal
    });
    if (!result.ok) return null;
    const data = await result.json().catch(() => null);
    if (!cleanString(data?.id)) return null;
    return {
      id: cleanString(data.id),
      email: cleanString(data.email),
      name: cleanString(data?.user_metadata?.full_name) || cleanString(data?.user_metadata?.name)
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function requireUser(request) {
  const user = await getUser() || await identityUserFromBearer(request);
  if (user) return user;
  if (process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev") {
    return { id: "local-development", email: "local-preview@simplecapi.test", name: "Local Preview" };
  }
  throw Object.assign(new Error("Login required."), { statusCode: 401 });
}

async function parseJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 128000) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
  try { return await request.json(); }
  catch { throw Object.assign(new Error("Invalid request body."), { statusCode: 400 }); }
}

function canonicalPageUrl(value) {
  try {
    const url = new URL(cleanString(value, 1000));
    if (!/https?:/.test(url.protocol)) return "";
    url.hash = "";
    url.search = "";
    url.username = "";
    url.password = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}

function exactSelector(value) {
  const selector = cleanString(value, 180);
  if (!selector || ["form", "*", "body", "html"].includes(selector.toLowerCase())) return "";
  return /^[#.[\]="'():_\-a-zA-Z0-9\s>+~*^$|]+$/.test(selector) ? selector : "";
}

function normalizeProvider(value) {
  const provider = cleanString(value, 20).toLowerCase();
  return PROVIDERS.has(provider) ? provider : "";
}

function normalizeEvent(value) {
  const event = cleanString(value, 30);
  return EVENTS.has(event) ? event : "";
}

function tiktokEvent(eventName) {
  return eventName === "Schedule" ? "Schedule" : "SubmitForm";
}

function publicOrigin() {
  const configured = cleanString(process.env.CAPI_PUBLIC_ORIGIN) || cleanString(process.env.CAPI_APP_ORIGIN).split(",")[0];
  try { return configured ? new URL(configured).origin : PUBLIC_ORIGIN; }
  catch { return PUBLIC_ORIGIN; }
}

function publicRecord(config) {
  const origin = publicOrigin();
  return {
    id: config.id,
    route: config.route,
    provider: config.provider,
    provider_label: config.provider === "tiktok" ? "TikTok" : "Google Ads",
    client_name: config.clientName,
    event_name: config.eventName,
    provider_event_name: config.provider === "tiktok" ? config.tiktok.eventName : "conversion",
    allowed_page_url: config.allowedPageUrl,
    form_selector: config.formSelector,
    tracker_url: `${origin}/p/${config.route}/tracker.js`,
    events_url: `${origin}/p/${config.route}/events`,
    status: "ready",
    server_mode: config.provider === "tiktok" ? true : Boolean(config.google?.apiEnabled),
    browser_mode: true,
    credential_summary: config.provider === "tiktok"
      ? { pixel_code: config.tiktok.pixelCode }
      : {
          conversion_id: config.google.conversionId,
          conversion_label: config.google.conversionLabel,
          customer_id: config.google.customerId || "",
          api_enabled: Boolean(config.google.apiEnabled)
        },
    created_at: config.createdAt,
    updated_at: config.updatedAt
  };
}

async function readIndex(user) {
  const data = await store().get(ownerIndexKey(user), { type: "json", consistency: "strong" });
  return Array.isArray(data) ? data : [];
}

async function writeIndex(user, mutate) {
  const key = ownerIndexKey(user);
  const db = store();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await db.getWithMetadata(key, { type: "json", consistency: "strong" });
    const items = Array.isArray(current?.data) ? current.data : [];
    const next = mutate(items);
    const result = await db.setJSON(key, next, current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
    if (result.modified) return next;
  }
  throw Object.assign(new Error("Provider workspace changed. Please try again."), { statusCode: 409 });
}

function validateTikTok(input) {
  const pixelCode = cleanString(input.pixelCode, 100);
  const accessToken = cleanString(input.accessToken, 2000).replace(/\s+/g, "");
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(pixelCode)) {
    throw Object.assign(new Error("Enter a valid TikTok Pixel Code."), { statusCode: 400 });
  }
  if (accessToken.length < 20) {
    throw Object.assign(new Error("Enter a valid TikTok Events API access token."), { statusCode: 400 });
  }
  return {
    pixelCode,
    accessToken,
    eventName: tiktokEvent(input.eventName),
    testEventCode: cleanString(input.testEventCode, 200)
  };
}

function validateGoogle(input) {
  const rawId = cleanString(input.conversionId, 100).toUpperCase();
  const conversionId = rawId.startsWith("AW-") ? rawId : `AW-${rawId.replace(/\D/g, "")}`;
  const conversionLabel = cleanString(input.conversionLabel, 150);
  if (!/^AW-\d{6,20}$/.test(conversionId)) {
    throw Object.assign(new Error("Enter a valid Google Ads conversion ID such as AW-123456789."), { statusCode: 400 });
  }
  if (!/^[A-Za-z0-9_-]{3,150}$/.test(conversionLabel)) {
    throw Object.assign(new Error("Enter a valid Google Ads conversion label."), { statusCode: 400 });
  }

  const customerId = cleanString(input.customerId, 40).replace(/\D/g, "");
  const conversionAction = cleanString(input.conversionAction, 250);
  const developerToken = cleanString(input.developerToken, 500).replace(/\s+/g, "");
  const clientId = cleanString(input.clientId, 500);
  const clientSecret = cleanString(input.clientSecret, 500);
  const refreshToken = cleanString(input.refreshToken, 2000);
  const loginCustomerId = cleanString(input.loginCustomerId, 40).replace(/\D/g, "");
  const anyApi = Boolean(customerId || conversionAction || developerToken || clientId || clientSecret || refreshToken);
  const apiEnabled = Boolean(customerId && conversionAction && developerToken && clientId && clientSecret && refreshToken);
  if (anyApi && !apiEnabled) {
    throw Object.assign(new Error("Complete every Google Ads API field, or leave all server API fields blank."), { statusCode: 400 });
  }
  if (apiEnabled && !/^customers\/\d+\/conversionActions\/\d+$/.test(conversionAction)) {
    throw Object.assign(new Error("Use the full Google conversion action resource name."), { statusCode: 400 });
  }
  return {
    conversionId,
    conversionLabel,
    customerId,
    conversionAction,
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    loginCustomerId,
    apiEnabled
  };
}

function validateInput(input) {
  const provider = normalizeProvider(input.provider);
  const eventName = normalizeEvent(input.eventName);
  const clientName = cleanString(input.clientName, 100);
  const allowedPageUrl = canonicalPageUrl(input.allowedPageUrl);
  const formSelector = eventName === "Schedule" ? "" : exactSelector(input.formSelector);
  if (!provider) throw Object.assign(new Error("Choose TikTok or Google Ads."), { statusCode: 400 });
  if (!eventName) throw Object.assign(new Error("Choose Lead or Schedule."), { statusCode: 400 });
  if (clientName.length < 2) throw Object.assign(new Error("Enter a client or project name."), { statusCode: 400 });
  if (!allowedPageUrl) throw Object.assign(new Error("Enter the exact live conversion page URL."), { statusCode: 400 });
  if (eventName === "Lead" && !formSelector) {
    throw Object.assign(new Error("Enter a selector that targets one exact form."), { statusCode: 400 });
  }
  return {
    provider,
    eventName,
    clientName,
    allowedPageUrl,
    formSelector,
    currency: cleanString(input.currency, 3).toUpperCase() || "USD",
    value: Number.isFinite(Number(input.value)) ? Number(input.value) : (eventName === "Schedule" ? 150 : 1),
    source: cleanString(input.source, 120) || (eventName === "Schedule" ? "Appointment Booking" : "Website Form"),
    onlyPaidTraffic: Boolean(input.onlyPaidTraffic),
    tiktok: provider === "tiktok" ? validateTikTok({ ...input, eventName }) : undefined,
    google: provider === "google" ? validateGoogle(input) : undefined
  };
}

async function saveConfig(config) {
  await store().set(configKey(config.route), encrypt(config));
}

async function createEndpoint(user, input, request) {
  assertSameOrigin(request);
  const validated = validateInput(input);
  const current = await readIndex(user);
  if (current.length >= 50) {
    throw Object.assign(new Error("Provider endpoint limit reached."), { statusCode: 409 });
  }
  const id = crypto.randomUUID();
  const route = crypto.randomBytes(18).toString("base64url");
  const now = new Date().toISOString();
  const config = {
    id,
    route,
    ownerKey: ownerKey(user),
    ...validated,
    createdAt: now,
    updatedAt: now,
    createdIp: sourceIp(request)
  };
  await saveConfig(config);
  const record = publicRecord(config);
  await writeIndex(user, (items) => [record, ...items.filter((item) => item.id !== id)]);
  return record;
}

async function updateEndpoint(user, input, request) {
  assertSameOrigin(request);
  const id = cleanString(input.id, 100);
  const items = await readIndex(user);
  const record = items.find((item) => item.id === id);
  if (!record) throw Object.assign(new Error("Provider endpoint not found."), { statusCode: 404 });
  const encrypted = await store().get(configKey(record.route), { type: "text", consistency: "strong" });
  if (!encrypted) throw Object.assign(new Error("Provider endpoint configuration is missing."), { statusCode: 404 });
  // Updates intentionally require the full provider configuration again. This avoids ambiguous partial secret rotation.
  const validated = validateInput({ ...input, provider: record.provider, eventName: record.event_name, allowedPageUrl: record.allowed_page_url, formSelector: record.form_selector });
  const config = {
    id: record.id,
    route: record.route,
    ownerKey: ownerKey(user),
    ...validated,
    createdAt: record.created_at,
    updatedAt: new Date().toISOString(),
    createdIp: ""
  };
  await saveConfig(config);
  const nextRecord = publicRecord(config);
  await writeIndex(user, (all) => all.map((item) => item.id === id ? nextRecord : item));
  return nextRecord;
}

async function deleteEndpoint(user, input, request) {
  assertSameOrigin(request);
  const id = cleanString(input.id, 100);
  const items = await readIndex(user);
  const record = items.find((item) => item.id === id);
  if (!record) throw Object.assign(new Error("Provider endpoint not found."), { statusCode: 404 });
  await store().delete(configKey(record.route));
  await writeIndex(user, (all) => all.filter((item) => item.id !== id));
}

async function verifyEndpoint(user, input) {
  const id = cleanString(input.id, 100);
  const record = (await readIndex(user)).find((item) => item.id === id);
  if (!record) throw Object.assign(new Error("Provider endpoint not found."), { statusCode: 404 });
  const exists = Boolean(await store().get(configKey(record.route), { type: "text", consistency: "strong" }));
  return { healthy: exists, provider: record.provider, browser_mode: true, server_mode: record.server_mode };
}

export default async function handler(request) {
  if (request.method === "OPTIONS") return json(request, 204, null);
  const url = new URL(request.url);
  const action = cleanString(url.searchParams.get("action"), 40) || "status";
  if (request.method === "GET" && action === "status") {
    return json(request, 200, {
      success: true,
      ready: true,
      providers: {
        meta: { available: true, existing_app: true },
        tiktok: { available: true, pixel: true, events_api: true },
        google: { available: true, google_tag: true, enhanced_conversions: true, ads_api: true }
      }
    });
  }

  try {
    const user = await requireUser(request);
    if (request.method === "GET" && action === "list") {
      return json(request, 200, { success: true, endpoints: await readIndex(user) });
    }
    if (request.method === "POST" && action === "create") {
      return json(request, 200, { success: true, endpoint: await createEndpoint(user, await parseJson(request), request) });
    }
    if (request.method === "PATCH" && action === "update") {
      return json(request, 200, { success: true, endpoint: await updateEndpoint(user, await parseJson(request), request) });
    }
    if (request.method === "DELETE" && action === "delete") {
      await deleteEndpoint(user, await parseJson(request), request);
      return json(request, 200, { success: true });
    }
    if (request.method === "POST" && action === "verify") {
      return json(request, 200, { success: true, ...(await verifyEndpoint(user, await parseJson(request))) });
    }
    return json(request, 404, { success: false, error: "Unknown action." });
  } catch (error) {
    return json(request, error?.statusCode || 500, { success: false, error: error?.message || "Provider request failed." });
  }
}

export const config = {
  path: "/.netlify/functions/provider-workspace",
  rateLimit: {
    windowLimit: 120,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
