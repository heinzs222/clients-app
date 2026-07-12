import crypto from "node:crypto";
import JSZip from "jszip";
import { getUser } from "@netlify/identity";
import { minify } from "terser";

const API_BASE = "https://api.netlify.com/api/v1";
const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";
const SITE_PREFIX = "dhc";
const MANIFEST_PATH = "/.well-known/capi-launcher.json";
const DEFAULT_GRAPH_VERSION = "v23.0";
const DEFAULT_USER_LIMIT = 25;
const DEFAULT_ENDPOINT_PRICE_CENTS = 500;

function cleanString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return "";
  if (/^\{\{[^}]+\}\}$/.test(trimmed)) return "";
  return trimmed;
}

function safeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || "client";
}

function sha1(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function ownerKey(user) {
  const identity = cleanString(user?.id) || cleanString(user?.email) || "local-development";
  return sha256(identity).slice(0, 12);
}

function ownerPrefix(user) {
  return `${SITE_PREFIX}-${ownerKey(user)}-`;
}

function booleanEnv(name, fallback) {
  const value = cleanString(process.env[name]).toLowerCase();
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value);
}

function endpointPriceCents() {
  const value = safeInteger(process.env.CAPI_ENDPOINT_PRICE_CENTS, DEFAULT_ENDPOINT_PRICE_CENTS);
  return Math.max(50, Math.min(value, 1000000));
}

function lemonApiKey() {
  const key = cleanString(process.env.LEMONSQUEEZY_API_KEY);
  return key.length >= 20 ? key : "";
}

function lemonStoreId() {
  return safeInteger(process.env.LEMONSQUEEZY_STORE_ID, 0);
}

function lemonVariantId() {
  return safeInteger(process.env.LEMONSQUEEZY_VARIANT_ID, 0);
}

function billingRequired() {
  return booleanEnv("CAPI_REQUIRE_PAYMENT", true);
}

function billingExempt(user, request) {
  if (request && isLocalRequest(request)) return true;
  const configured = cleanString(process.env.CAPI_BILLING_EXEMPT_EMAILS);
  if (!configured) return false;
  const email = cleanString(user?.email).toLowerCase();
  return configured.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean).includes(email);
}

function billingConfiguration() {
  const configured = Boolean(lemonApiKey() && lemonStoreId() && lemonVariantId());
  const testMode = booleanEnv("LEMONSQUEEZY_TEST_MODE", true);
  return {
    required: billingRequired(),
    configured,
    provider: "lemonsqueezy",
    price_cents: endpointPriceCents(),
    currency: "USD",
    mode: configured ? (testMode ? "test" : "live") : "unconfigured"
  };
}

function allowedAppOrigins(request) {
  const origins = new Set([new URL(request.url).origin]);
  cleanString(process.env.CAPI_APP_ORIGIN)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      try {
        origins.add(new URL(value).origin);
      } catch {
        // Ignore malformed deployment configuration instead of weakening origin checks.
      }
    });
  return origins;
}

function trustedAppOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin && allowedAppOrigins(request).has(origin)) return origin;
  return new URL(request.url).origin;
}

function response(request, status, body) {
  const origin = request.headers.get("origin");
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };

  if (origin && allowedAppOrigins(request).has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function isLocalRequest(request) {
  const host = new URL(request.url).hostname.toLowerCase();
  return (
    process.env.NETLIFY_DEV === "true" ||
    process.env.CONTEXT === "dev" ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function assertSameOrigin(request) {
  if (isLocalRequest(request)) return;
  const origin = request.headers.get("origin");
  if (!origin || !allowedAppOrigins(request).has(origin)) {
    throw Object.assign(new Error("Request origin is not allowed."), { statusCode: 403 });
  }
}

function assertAllowedUser(user) {
  const configured = cleanString(process.env.CAPI_ALLOWED_EMAILS);
  if (!configured) return;

  const allowed = configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = cleanString(user?.email).toLowerCase();

  if (!email || !allowed.includes(email)) {
    throw Object.assign(new Error("This account is not allowed to provision endpoints."), {
      statusCode: 403
    });
  }
}

async function requireUser(request) {
  const user = await getUser();
  if (user) {
    assertAllowedUser(user);
    return user;
  }

  if (isLocalRequest(request)) {
    return { id: "local-development", email: "local-preview@capilauncher.test" };
  }

  throw Object.assign(new Error("Login required."), { statusCode: 401 });
}

function provisionerStatus() {
  const missing = [];
  if (!cleanString(process.env.NETLIFY_AUTH_TOKEN)) missing.push("NETLIFY_AUTH_TOKEN");
  if (!cleanString(process.env.NETLIFY_ACCOUNT_SLUG)) missing.push("NETLIFY_ACCOUNT_SLUG");

  return {
    success: true,
    ready: missing.length === 0,
    missing_count: missing.length,
    billing: billingConfiguration(),
    user_limit: safeInteger(process.env.CAPI_MAX_ENDPOINTS_PER_USER, DEFAULT_USER_LIMIT),
    message: missing.length ? "Provisioning service needs administrator configuration." : "Provisioner is ready."
  };
}

async function netlifyFetch(path, options = {}) {
  const token = cleanString(process.env.NETLIFY_AUTH_TOKEN);
  if (!token) {
    throw Object.assign(new Error("Server provisioning credentials are missing."), { statusCode: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 20000);

  try {
    const result = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "Simple CAPI",
        ...(options.headers || {})
      }
    });

    const contentType = result.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await result.json().catch(() => ({}))
      : await result.text().catch(() => "");

    if (!result.ok) {
      const providerMessage = typeof data === "object"
        ? cleanString(data.message) || cleanString(data.error)
        : cleanString(data);
      const message = result.status === 401 || result.status === 403
        ? "Infrastructure authorization failed."
        : result.status === 404
          ? "Infrastructure resource was not found."
          : "Infrastructure request failed.";
      throw Object.assign(new Error(message), { statusCode: result.status, providerMessage });
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("Infrastructure request timed out."), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function lemonFetch(path, options = {}) {
  const key = lemonApiKey();
  if (!key) {
    throw Object.assign(new Error("Lemon Squeezy payments are not configured."), { statusCode: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
  const headers = {
    "Authorization": `Bearer ${key}`,
    "Accept": "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    ...(options.headers || {})
  };

  try {
    const result = await fetch(`${LEMON_API_BASE}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    const data = await result.json().catch(() => ({}));
    if (!result.ok) {
      const message = cleanString(data?.errors?.[0]?.detail) || cleanString(data?.errors?.[0]?.title) || "Lemon Squeezy request failed.";
      const statusCode = result.status === 401 ? 503 : result.status >= 500 ? 502 : 400;
      throw Object.assign(new Error(message), { statusCode });
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("Lemon Squeezy request timed out."), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function checkoutOrderId(value) {
  const id = cleanString(value);
  return /^\d{1,20}$/.test(id) ? id : "";
}

async function createLemonCheckout(request, user) {
  const origin = trustedAppOrigin(request);
  const owner = ownerKey(user);
  const price = endpointPriceCents();
  const storeId = lemonStoreId();
  const variantId = lemonVariantId();
  const result = await lemonFetch("/checkouts", {
    method: "POST",
    body: {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: price,
          product_options: {
            name: "Simple CAPI endpoint credit",
            description: "Creates one isolated Meta Conversions API endpoint.",
            redirect_url: `${origin}/?view=setup&checkout=success&order_id=[order_id]`,
            receipt_button_text: "Create your endpoint",
            receipt_link_url: `${origin}/?view=billing`,
            enabled_variants: [variantId]
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
            desc: true,
            discount: false
          },
          checkout_data: {
            email: cleanString(user.email),
            name: cleanString(user.name || user.userMetadata?.full_name),
            custom: {
              capi_owner_key: owner,
              capi_product: "endpoint_credit"
            }
          },
          test_mode: booleanEnv("LEMONSQUEEZY_TEST_MODE", true),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } }
        }
      }
    }
  });
  const checkout = result?.data;
  const url = cleanString(checkout?.attributes?.url);
  if (!url) {
    throw Object.assign(new Error("Lemon Squeezy did not return a checkout URL."), { statusCode: 502 });
  }
  return { id: cleanString(checkout.id), url };
}

async function retrieveLemonOrder(id) {
  const orderId = checkoutOrderId(id);
  if (!orderId) {
    throw Object.assign(new Error("Invalid Lemon Squeezy order."), { statusCode: 400 });
  }
  const result = await lemonFetch(`/orders/${encodeURIComponent(orderId)}`);
  return result?.data;
}

function validateLemonOrder(order, user, { allowRedeemed = false, redeemedSiteId = "" } = {}) {
  const attributes = order?.attributes || {};
  const price = endpointPriceCents();
  const email = cleanString(user?.email).toLowerCase();
  if (!email || cleanString(attributes.user_email).toLowerCase() !== email) {
    throw Object.assign(new Error("This payment belongs to another account."), { statusCode: 403 });
  }
  if (Number(attributes.store_id) !== lemonStoreId() || Number(attributes.first_order_item?.variant_id) !== lemonVariantId()) {
    throw Object.assign(new Error("This is not an endpoint payment."), { statusCode: 402 });
  }
  if (attributes.status !== "paid" || attributes.refunded || Number(attributes.refunded_amount || 0) > 0) {
    throw Object.assign(new Error("Endpoint payment is not complete."), { statusCode: 402 });
  }
  if (Number(attributes.subtotal) !== price || cleanString(attributes.currency).toLowerCase() !== "usd") {
    throw Object.assign(new Error("Endpoint payment amount is invalid."), { statusCode: 402 });
  }
  const expectedTestMode = booleanEnv("LEMONSQUEEZY_TEST_MODE", true);
  if (Boolean(attributes.test_mode) !== expectedTestMode) {
    throw Object.assign(new Error("Payment mode does not match the configured checkout mode."), { statusCode: 402 });
  }
  if (redeemedSiteId && !allowRedeemed) {
    throw Object.assign(new Error("This payment has already been used for an endpoint."), { statusCode: 409 });
  }
  const orderId = checkoutOrderId(order?.id);
  return {
    orderId,
    orderHash: sha256(`lemon:${orderId}`),
    redeemedSiteId,
    amount: price,
    currency: "USD",
    paidAt: cleanString(attributes.created_at) || new Date().toISOString()
  };
}

async function redeemedSiteForOrder(accountSlug, user, orderId) {
  const endpoints = await listOwnedSites(accountSlug, user);
  return endpoints.find((endpoint) => cleanString(endpoint.billing?.order_id) === cleanString(orderId))?.id || "";
}

function lemonOrderSearchParams(user) {
  return new URLSearchParams({
    "filter[store_id]": String(lemonStoreId()),
    "filter[user_email]": cleanString(user?.email),
    "page[size]": "100"
  });
}

async function billingStatus(accountSlug, user, request) {
  const config = billingConfiguration();
  const exempt = billingExempt(user, request) || !config.required;
  if (exempt) {
    return { ...config, exempt: true, available_credits: null, payments: [] };
  }
  if (!config.configured) {
    return { ...config, exempt: false, available_credits: 0, payments: [] };
  }

  const params = lemonOrderSearchParams(user);
  const orders = await lemonFetch(`/orders?${params}`);
  const endpoints = await listOwnedSites(accountSlug, user);
  const redeemed = new Map(endpoints
    .filter((endpoint) => endpoint.billing?.order_id)
    .map((endpoint) => [cleanString(endpoint.billing.order_id), endpoint.id]));
  const valid = (Array.isArray(orders.data) ? orders.data : []).filter((order) => {
    try {
      validateLemonOrder(order, user, { allowRedeemed: true });
      return true;
    } catch {
      return false;
    }
  });
  const available = valid.filter((order) => !redeemed.has(cleanString(order.id)));
  return {
    ...config,
    exempt: false,
    available_credits: available.length,
    available_order_id: available[0]?.id || "",
    payments: valid.slice(0, 20).map((order) => ({
      id: order.id,
      amount: Number(order.attributes?.subtotal) || 0,
      currency: cleanString(order.attributes?.currency).toUpperCase(),
      created_at: cleanString(order.attributes?.created_at),
      redeemed: redeemed.has(cleanString(order.id))
    }))
  };
}

function validateClientInput(input, { tokenRequired = true } = {}) {
  const clientName = cleanString(input.clientName).slice(0, 100) || "Client";
  const datasetId = cleanString(input.datasetId).replace(/\D/g, "");
  const accessToken = cleanString(input.accessToken).replace(/\s+/g, "");
  const graphVersion = cleanString(input.graphVersion) || DEFAULT_GRAPH_VERSION;

  if (!/^\d{6,30}$/.test(datasetId)) {
    throw Object.assign(new Error("Enter a valid numeric Meta dataset ID."), { statusCode: 400 });
  }
  if (tokenRequired && !/^EAA[A-Za-z0-9_-]{20,}$/.test(accessToken)) {
    throw Object.assign(new Error("Enter a valid Meta Conversions API access token."), { statusCode: 400 });
  }
  if (accessToken && !/^EAA[A-Za-z0-9_-]{20,}$/.test(accessToken)) {
    throw Object.assign(new Error("Enter a valid Meta Conversions API access token."), { statusCode: 400 });
  }
  if (!/^v\d{1,3}\.\d{1,2}$/.test(graphVersion)) {
    throw Object.assign(new Error("Enter a Graph API version such as v23.0."), { statusCode: 400 });
  }

  return { clientName, datasetId, accessToken, graphVersion };
}

function capiFunctionSource() {
  return String.raw`const crypto = require("crypto");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
};

function json(statusCode, body) {
  return { statusCode, headers, body: statusCode === 204 ? "" : JSON.stringify(body) };
}

function getString(value) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const trimmed = String(value).trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return "";
  if (/^\{\{[^}]+\}\}$/.test(trimmed)) return "";
  return trimmed;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeText(value) {
  return getString(value).toLowerCase();
}

function normalizePhone(value, country) {
  let digits = getString(value).replace(/\D/g, "");
  const normalizedCountry = normalizeText(country);
  if ((normalizedCountry === "us" || normalizedCountry === "ca") && digits.length === 10) {
    digits = "1" + digits;
  }
  return digits;
}

function removeEmpty(value) {
  if (Array.isArray(value)) {
    const filtered = value.map(removeEmpty).filter((item) => item !== undefined);
    return filtered.length ? filtered : undefined;
  }
  if (value && typeof value === "object") {
    const next = {};
    Object.keys(value).forEach((key) => {
      const cleaned = removeEmpty(value[key]);
      if (cleaned !== undefined) next[key] = cleaned;
    });
    return Object.keys(next).length ? next : undefined;
  }
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  if (Buffer.byteLength(raw, "utf8") > 256000) {
    throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });
  }
  const contentType = getString(event.headers["content-type"]).toLowerCase();
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return JSON.parse(raw);
}

function clientIp(event, input) {
  return getString(input.client_ip_address) ||
    getString(event.headers["x-nf-client-connection-ip"]) ||
    getString(event.headers["client-ip"]) ||
    getString(event.headers["x-forwarded-for"]).split(",")[0].trim();
}

function splitName(input) {
  const explicitFirst = normalizeText(input.first_name);
  const explicitLast = normalizeText(input.last_name);
  const parts = getString(input.full_name).split(/\s+/).filter(Boolean);
  return {
    first: explicitFirst || normalizeText(parts[0] || ""),
    last: explicitLast || normalizeText(parts.slice(1).join(" "))
  };
}

function buildFbc(input, timestampMs) {
  const existing = getString(input.fbc);
  const clickId = getString(input.fbclid);
  if (existing) return existing;
  return clickId ? "fb.1." + timestampMs + "." + clickId : "";
}

function userData(input, event, timestampMs) {
  const names = splitName(input);
  const email = normalizeText(input.email);
  const phone = normalizePhone(input.phone, input.country);
  const externalId = normalizeText(input.external_id) || email || phone;
  const city = normalizeText(input.city);
  const state = normalizeText(input.state);
  const postal = normalizeText(input.postal_code);
  const country = normalizeText(input.country);

  return removeEmpty({
    em: email ? [sha256(email)] : undefined,
    ph: phone ? [sha256(phone)] : undefined,
    fn: names.first ? [sha256(names.first)] : undefined,
    ln: names.last ? [sha256(names.last)] : undefined,
    ct: city ? [sha256(city)] : undefined,
    st: state ? [sha256(state)] : undefined,
    zp: postal ? [sha256(postal)] : undefined,
    country: country ? [sha256(country)] : undefined,
    external_id: externalId ? [sha256(externalId)] : undefined,
    fbp: getString(input.fbp),
    fbc: buildFbc(input, timestampMs),
    client_ip_address: clientIp(event, input),
    client_user_agent: getString(input.client_user_agent) || getString(event.headers["user-agent"])
  });
}

const RESERVED = new Set([
  "event_name", "event_id", "event_time", "test_event_code", "full_name", "first_name", "last_name",
  "email", "phone", "external_id", "address1", "city", "state", "postal_code", "country",
  "landing_page", "page_url", "page_variant", "client_ip_address", "client_user_agent", "fbp", "fbc", "fbclid",
  "currency", "value", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "utm_adset", "utm_ad", "utm_id", "referrer", "source", "tags", "project_type", "project_timeline"
]);

function extraCustomData(input) {
  const result = {};
  Object.keys(input).slice(0, 100).forEach((key) => {
    if (RESERVED.has(key) || !/^[A-Za-z0-9_]{1,80}$/.test(key)) return;
    const value = input[key];
    if (!["string", "number", "boolean"].includes(typeof value)) return;
    const cleaned = typeof value === "string" ? getString(value).slice(0, 500) : value;
    if (cleaned !== "" && cleaned !== null && cleaned !== undefined) result[key] = cleaned;
  });
  return result;
}

function numberValue(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildPayload(input, event) {
  const eventName = getString(input.event_name).slice(0, 80) || "Lead";
  const suppliedEventId = getString(input.event_id).slice(0, 200);
  const eventId = suppliedEventId || crypto.randomUUID();
  const timestampMs = Date.now();
  const eventSourceUrl = getString(input.landing_page) || getString(input.page_url);
  const customData = {
    currency: getString(input.currency).toUpperCase(),
    value: numberValue(input.value),
    lead_source: getString(input.utm_source),
    campaign: getString(input.utm_campaign),
    adset: getString(input.utm_adset),
    ad: getString(input.utm_ad),
    utm_medium: getString(input.utm_medium),
    utm_content: getString(input.utm_content),
    utm_term: getString(input.utm_term),
    utm_id: getString(input.utm_id),
    fbclid: getString(input.fbclid),
    page_variant: getString(input.page_variant),
    referrer: getString(input.referrer),
    source: getString(input.source),
    tags: getString(input.tags),
    project_type: getString(input.project_type),
    project_timeline: getString(input.project_timeline),
    business_name: getString(input.business_name),
    ...extraCustomData(input)
  };

  return {
    eventName,
    eventId,
    generatedEventId: !suppliedEventId,
    payload: removeEmpty({
      data: [{
        event_name: eventName,
        event_time: Math.floor(timestampMs / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData(input, event, timestampMs),
        custom_data: removeEmpty(customData)
      }],
      test_event_code: getString(input.test_event_code)
    })
  };
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(204, null);
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  const datasetId = getString(process.env.META_DATASET_ID);
  const accessToken = getString(process.env.META_ACCESS_TOKEN);
  const version = getString(process.env.META_GRAPH_API_VERSION) || "v23.0";
  if (!datasetId || !accessToken) {
    return json(500, { success: false, error: "Missing required environment variables." });
  }

  let input;
  try {
    input = parseBody(event);
  } catch (error) {
    return json(error.statusCode || 400, { success: false, error: error.message || "Invalid request body" });
  }

  const built = buildPayload(input, event);
  const url = "https://graph.facebook.com/" + encodeURIComponent(version) + "/" +
    encodeURIComponent(datasetId) + "/events?access_token=" + encodeURIComponent(accessToken);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const metaResponse = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(built.payload)
    });
    const raw = await metaResponse.text();
    let meta;
    try { meta = raw ? JSON.parse(raw) : {}; } catch { meta = { message: raw.slice(0, 1000) }; }

    const body = {
      success: metaResponse.ok,
      meta,
      event_id: built.eventId,
      event_name: built.eventName,
      warnings: built.generatedEventId ? ["event_id_missing_generated"] : undefined
    };
    return json(metaResponse.ok ? 200 : 502, removeEmpty(body));
  } catch (error) {
    return json(502, {
      success: false,
      error: error && error.name === "AbortError" ? "Meta request timed out" : "Meta request failed",
      event_id: built.eventId,
      event_name: built.eventName
    });
  } finally {
    clearTimeout(timeout);
  }
};`;
}

async function buildFunctionZip() {
  const zip = new JSZip();
  zip.file("meta-capi-lead.js", await minifyJavaScript(capiFunctionSource()));
  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
}

function trackerScriptSource() {
  return Buffer.from(String.raw`(function(window, document) {
  "use strict";

  if (window.__CAPI_LAUNCHER_TRACKER__) return;
  window.__CAPI_LAUNCHER_TRACKER__ = true;

  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      if ((scripts[i].src || "").indexOf("/tracker.js") !== -1) {
        script = scripts[i];
        break;
      }
    }
  }

  function attr(name, fallback) {
    if (!script) return fallback || "";
    var value = script.getAttribute("data-" + name);
    return value === null || value === undefined || value === "" ? (fallback || "") : value;
  }

  function defaultEndpoint() {
    try {
      var url = new URL(script.src);
      return url.origin + url.pathname.replace(/\/tracker\.js(?:\?.*)?$/, "") + "/events";
    } catch (error) { return ""; }
  }

  var CFG = {
    endpoint: attr("capi-endpoint", defaultEndpoint()),
    ghlWebhookUrl: attr("ghl-webhook-url", ""),
    formSelector: attr("form-selector", "form"),
    eventName: attr("event-name", "Lead"),
    trigger: attr("trigger", "form").toLowerCase(),
    country: attr("country", "US").toUpperCase(),
    currency: attr("currency", "USD").toUpperCase(),
    value: Number(attr("value", "1")),
    source: attr("source", "Estimate Form"),
    tags: attr("tags", "estimate-lead,website-form"),
    projectType: attr("project-type", ""),
    projectTimeline: attr("project-timeline", ""),
    pageVariant: attr("page-variant", ""),
    testEventCode: attr("test-event-code", ""),
    onlyMetaTraffic: attr("only-meta-traffic", "false") === "true",
    firePixel: attr("fire-pixel", "true") !== "false",
    debug: attr("debug", "false") === "true"
  };
  if (!Number.isFinite(CFG.value)) CFG.value = 1;
  var nativeFormSubmit = window.HTMLFormElement && window.HTMLFormElement.prototype
    ? window.HTMLFormElement.prototype.submit
    : null;

  var ATTRIBUTION_KEY = "dh_capi_attribution_v2";
  var IDENTITY_KEY = "dh_capi_identity_v1";
  var IDENTITY_FIELDS = [
    "full_name", "first_name", "last_name", "email", "phone", "external_id",
    "business_name", "address1", "city", "state", "postal_code", "country"
  ];
  var PARAMS = [
    "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "utm_adset", "utm_ad", "utm_id", "hsa_acc", "hsa_cam", "hsa_grp", "hsa_ad",
    "hsa_src", "hsa_net", "hsa_ver"
  ];

  function clean(value) {
    if (value === null || value === undefined) return "";
    var result = String(value).trim();
    if (!result || /^(null|undefined)$/i.test(result) || /^\{\{[^}]+\}\}$/.test(result)) return "";
    return result;
  }

  function readStoredAttribution() {
    try { return JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "{}"); }
    catch (error) { return {}; }
  }

  function captureAttribution() {
    var stored = readStoredAttribution();
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (error) { params = null; }

    PARAMS.forEach(function(name) {
      var current = params ? clean(params.get(name)) : "";
      if (current) stored[name] = current;
    });
    if (!stored.landing_page) stored.landing_page = window.location.href;
    if (!stored.referrer) stored.referrer = document.referrer;
    try { window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(stored)); } catch (error) {}
    return stored;
  }

  var attribution = captureAttribution();

  function getParam(name) {
    try {
      var current = clean(new URLSearchParams(window.location.search).get(name));
      return current || clean(attribution[name]);
    } catch (error) {
      return clean(attribution[name]);
    }
  }

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i].indexOf(name + "=") === 0) {
        try { return decodeURIComponent(parts[i].split("=").slice(1).join("=")); }
        catch (error) { return parts[i].split("=").slice(1).join("="); }
      }
    }
    return "";
  }

  function setCookie(name, value) {
    if (!value) return;
    var secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/; Max-Age=7776000; SameSite=Lax" + secure;
  }

  function getFbc() {
    var existing = getCookie("_fbc");
    var fbclid = getParam("fbclid");
    if (existing) return existing;
    if (!fbclid) return "";
    var created = "fb.1." + Date.now() + "." + fbclid;
    setCookie("_fbc", created);
    return created;
  }

  getFbc();

  function hasMetaTraffic() {
    var source = getParam("utm_source").toLowerCase();
    return Boolean(
      getParam("fbclid") || getCookie("_fbc") || getCookie("_fbp") ||
      source.indexOf("fb") !== -1 || source.indexOf("facebook") !== -1 || source.indexOf("meta") !== -1
    );
  }

  function eventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return "lead_" + window.crypto.randomUUID();
    }
    return "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function phoneDigits(value) {
    return clean(value).replace(/\D/g, "");
  }

  function controls(form) {
    return Array.prototype.slice.call(form.querySelectorAll("input, textarea, select"));
  }

  function controlValue(control) {
    var type = (control.type || "").toLowerCase();
    if (control.disabled || /^(button|submit|reset|image|file|password)$/i.test(type)) return "";
    if (type === "checkbox") return control.checked ? clean(control.value || "true") : "";
    if (type === "radio") return control.checked ? clean(control.value) : "";
    if (control.tagName && control.tagName.toLowerCase() === "select" && control.multiple) {
      return Array.prototype.slice.call(control.selectedOptions).map(function(option) {
        return clean(option.value || option.text);
      }).filter(Boolean).join(",");
    }
    return clean(control.value);
  }

  function labelText(control) {
    var text = "";
    if (control.id && window.CSS && window.CSS.escape) {
      var explicit = document.querySelector("label[for=\"" + window.CSS.escape(control.id) + "\"]");
      if (explicit) text += " " + explicit.textContent;
    }
    if (control.closest) {
      var wrapped = control.closest("label");
      if (wrapped) text += " " + wrapped.textContent;
    }
    return text;
  }

  function normalized(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function controlDescriptor(control) {
    return normalized([
      control.name, control.id, control.className, control.type,
      control.getAttribute("data-field"), control.getAttribute("data-name"),
      control.getAttribute("data-label"), control.getAttribute("aria-label"),
      control.getAttribute("placeholder"), control.getAttribute("autocomplete"), labelText(control)
    ].join(" "));
  }

  function fieldValue(form, aliases, exclusions) {
    var list = controls(form);
    var bestValue = "";
    var bestScore = -1;
    for (var i = 0; i < list.length; i += 1) {
      var value = controlValue(list[i]);
      if (!value) continue;
      var descriptor = controlDescriptor(list[i]);
      if ((exclusions || []).some(function(term) { return descriptor.indexOf(normalized(term)) !== -1; })) continue;
      for (var j = 0; j < aliases.length; j += 1) {
        var alias = normalized(aliases[j]);
        if (!alias || descriptor.indexOf(alias) === -1) continue;
        var key = normalized(list[i].name || list[i].id || list[i].getAttribute("autocomplete"));
        var score = alias.length + (key === alias ? 100 : 0) + (descriptor === alias ? 50 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestValue = value;
        }
      }
    }
    return bestValue;
  }

  function safeExtraKey(key) {
    return key && !/(password|passcode|token|secret|card|credit|cvv|cvc|ssn|social_security|bank|routing|account_number)/i.test(key);
  }

  function collectExtraFields(form) {
    var extra = {};
    controls(form).forEach(function(control) {
      var key = normalized(control.name || control.id || control.getAttribute("data-field") || control.getAttribute("aria-label"));
      var value = controlValue(control);
      if (!safeExtraKey(key) || !value) return;
      extra[key] = extra[key] ? extra[key] + "," + value : value;
    });
    return extra;
  }

  function splitName(fullName) {
    var parts = clean(fullName).split(/\s+/).filter(Boolean);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") };
  }

  function compact(payload) {
    var next = {};
    Object.keys(payload).forEach(function(key) {
      var value = payload[key];
      if (value !== "" && value !== null && value !== undefined) next[key] = value;
    });
    return next;
  }

  function readStoredIdentity() {
    try { return JSON.parse(window.sessionStorage.getItem(IDENTITY_KEY) || "{}"); }
    catch (error) { return {}; }
  }

  function rememberIdentity(payload) {
    var identity = readStoredIdentity();
    IDENTITY_FIELDS.forEach(function(key) {
      if (clean(payload[key])) identity[key] = payload[key];
    });
    if (!identity.email && !identity.phone && !identity.external_id) return;
    try { window.sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); } catch (error) {}
  }

  function mergeStoredIdentity(payload) {
    var identity = readStoredIdentity();
    IDENTITY_FIELDS.forEach(function(key) {
      if (!clean(payload[key]) && clean(identity[key])) payload[key] = identity[key];
    });
    return compact(payload);
  }

  function buildPayload(form, eventIdOverride) {
    var extra = collectExtraFields(form);
    var firstName = fieldValue(form, ["first_name", "firstname", "given_name", "fname"]);
    var lastName = fieldValue(form, ["last_name", "lastname", "family_name", "surname", "lname"]);
    var fullName = fieldValue(form, ["full_name", "fullname", "contact_name", "your_name", "name"], ["first_name", "last_name", "business", "company"]);
    if ((!fullName || fullName === firstName || fullName === lastName) && (firstName || lastName)) {
      fullName = clean(firstName + " " + lastName);
    }
    var split = splitName(fullName);
    var email = fieldValue(form, ["email", "e_mail", "email_address"]);
    var phone = fieldValue(form, ["phone", "mobile", "cell", "telephone", "tel"]);
    var id = clean(eventIdOverride) || fieldValue(form, ["event_id", "eventid", "meta_event_id"]) || eventId();
    var page = window.location.href;
    var payload = compact({
      event_name: CFG.eventName,
      event_id: id,
      test_event_code: CFG.testEventCode,
      full_name: fullName,
      first_name: firstName || split.first,
      last_name: lastName || split.last,
      email: email,
      phone: phone,
      external_id: clean(email || phoneDigits(phone)).toLowerCase(),
      business_name: fieldValue(form, ["business_name", "company_name", "company", "organization", "organisation"]),
      address1: fieldValue(form, ["address1", "address_1", "street_address", "address"]),
      city: fieldValue(form, ["city", "town"]),
      state: fieldValue(form, ["state", "province", "region"]),
      postal_code: fieldValue(form, ["postal_code", "postcode", "zip_code", "zipcode", "zip"]),
      country: fieldValue(form, ["country"]) || CFG.country,
      source: CFG.source,
      tags: CFG.tags,
      project_type: fieldValue(form, ["project_type", "property_type", "service_type"]) || CFG.projectType,
      project_timeline: fieldValue(form, ["project_timeline", "timeline", "when"]) || CFG.projectTimeline,
      landing_page: clean(attribution.landing_page) || page,
      page_url: page,
      page_variant: CFG.pageVariant,
      referrer: clean(attribution.referrer) || document.referrer,
      client_user_agent: window.navigator.userAgent,
      fbclid: getParam("fbclid"),
      fbp: getCookie("_fbp"),
      fbc: getFbc(),
      utm_source: getParam("utm_source") || getParam("hsa_src"),
      utm_medium: getParam("utm_medium"),
      utm_campaign: getParam("utm_campaign") || getParam("hsa_cam"),
      utm_content: getParam("utm_content"),
      utm_term: getParam("utm_term"),
      utm_adset: getParam("utm_adset") || getParam("hsa_grp"),
      utm_ad: getParam("utm_ad") || getParam("hsa_ad"),
      utm_id: getParam("utm_id"),
      hsa_acc: getParam("hsa_acc"),
      hsa_cam: getParam("hsa_cam"),
      hsa_grp: getParam("hsa_grp"),
      hsa_ad: getParam("hsa_ad"),
      hsa_src: getParam("hsa_src"),
      hsa_net: getParam("hsa_net"),
      hsa_ver: getParam("hsa_ver"),
      currency: CFG.currency,
      value: CFG.value,
      submitted_at: new Date().toISOString()
    });
    Object.keys(extra).forEach(function(key) {
      if (payload[key] === undefined) payload[key] = extra[key];
    });
    return compact(payload);
  }

  function firePixel(payload) {
    if (!CFG.firePixel || typeof window.fbq !== "function") return;
    var params = {
      content_name: CFG.source || CFG.eventName,
      content_category: "Sales",
      value: CFG.value,
      currency: CFG.currency
    };
    if (CFG.pageVariant) params.page_variant = CFG.pageVariant;
    window.fbq("track", CFG.eventName, params, { eventID: payload.event_id });
  }

  function submitHiddenPost(url, payload) {
    if (!url || url.indexOf("PASTE_") !== -1) return false;
    var iframeName = "dh_capi_" + Math.random().toString(36).slice(2);
    var iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    var postForm = document.createElement("form");
    postForm.__dhCapiInternal = true;
    postForm.method = "POST";
    postForm.action = url;
    postForm.target = iframeName;
    postForm.style.display = "none";
    Object.keys(payload).forEach(function(key) {
      var value = payload[key];
      if (Array.isArray(value)) value = value.join(",");
      if (value === "" || value === null || value === undefined) return;
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      postForm.appendChild(input);
    });
    document.body.appendChild(iframe);
    document.body.appendChild(postForm);
    if (nativeFormSubmit) nativeFormSubmit.call(postForm);
    else postForm.submit();
    window.setTimeout(function() {
      if (postForm.parentNode) postForm.parentNode.removeChild(postForm);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 5000);
    return true;
  }

  function postDirect(payload) {
    if (!CFG.endpoint) return;
    var params = new URLSearchParams();
    Object.keys(payload).forEach(function(key) {
      var value = payload[key];
      if (Array.isArray(value)) value = value.join(",");
      else if (value && typeof value === "object") value = JSON.stringify(value);
      if (value === "" || value === null || value === undefined) return;
      params.append(key, String(value));
    });
    if (window.navigator.sendBeacon) {
      try {
        if (window.navigator.sendBeacon(CFG.endpoint, params)) return;
      } catch (error) {}
    }
    fetch(CFG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
      keepalive: true,
      credentials: "omit"
    }).catch(function() {});
  }

  function matchesConfiguredForm(form) {
    if (form && form.__dhCapiInternal) return false;
    try { return form && form.matches && form.matches(CFG.formSelector); }
    catch (error) { return form && form.tagName && form.tagName.toLowerCase() === "form"; }
  }

  function deliverPayload(payload, options) {
    options = options || {};
    try { window.sessionStorage.setItem("dh_meta_event_id", payload.event_id); } catch (error) {}
    if (!options.skipPixel) firePixel(payload);
    if (!submitHiddenPost(CFG.ghlWebhookUrl, payload)) postDirect(payload);
    var detail = {
      event_id: payload.event_id,
      event_name: payload.event_name,
      destination: CFG.ghlWebhookUrl ? "ghl" : "direct"
    };
    try {
      window.dispatchEvent(new CustomEvent("capi-launcher:event", { detail: detail }));
      window.dispatchEvent(new CustomEvent("capi-launcher:lead", { detail: detail }));
    } catch (error) {}
    if (CFG.debug && window.console) window.console.info("Simple CAPI tracked " + payload.event_name, detail);
  }

  function trackForm(form, options) {
    if (!matchesConfiguredForm(form)) return;
    if (CFG.onlyMetaTraffic && !hasMetaTraffic()) return;
    options = options || {};
    var now = Date.now();
    if (form.__dhCapiTrackedAt && now - form.__dhCapiTrackedAt < 2000) return;
    form.__dhCapiTrackedAt = now;
    var payload = buildPayload(form, options.eventId);
    rememberIdentity(payload);
    deliverPayload(payload, options);
  }

  var standaloneTrackedAt = 0;

  function trackStandalone(options) {
    if (CFG.onlyMetaTraffic && !hasMetaTraffic()) return;
    options = options || {};
    var now = Date.now();
    if (now - standaloneTrackedAt < 2000) return;
    standaloneTrackedAt = now;
    var root = document.body || document.documentElement;
    deliverPayload(mergeStoredIdentity(buildPayload(root, options.eventId)), options);
  }

  function trackPageLoad() {
    if (CFG.onlyMetaTraffic && !hasMetaTraffic()) return;
    var key = "dh_capi_page_event_v1:" + normalized(CFG.eventName) + ":" + window.location.pathname;
    try {
      var previous = JSON.parse(window.sessionStorage.getItem(key) || "{}");
      if (previous.time && Date.now() - previous.time < 300000) return;
      window.sessionStorage.setItem(key, JSON.stringify({ time: Date.now() }));
    } catch (error) {}
    trackStandalone();
  }

  function findConfiguredForm() {
    var active = document.activeElement;
    if (active && active.closest) {
      try {
        var activeForm = active.closest(CFG.formSelector);
        if (matchesConfiguredForm(activeForm)) return activeForm;
      } catch (error) {}
    }
    var forms = [];
    try { forms = Array.prototype.slice.call(document.querySelectorAll(CFG.formSelector)); }
    catch (error) { forms = Array.prototype.slice.call(document.forms || []); }
    forms = forms.filter(matchesConfiguredForm);
    for (var i = 0; i < forms.length; i += 1) {
      if (forms[i].getClientRects && forms[i].getClientRects().length) return forms[i];
    }
    return forms[0] || null;
  }

  var suppressPixelObserver = false;

  function observePixelLead(args) {
    if (suppressPixelObserver || !args || args[0] !== "track") return;
    if (clean(args[1]).toLowerCase() !== clean(CFG.eventName).toLowerCase()) return;
    var pixelOptions = args[3] && typeof args[3] === "object" ? args[3] : {};
    var options = {
      eventId: clean(pixelOptions.eventID || pixelOptions.event_id),
      skipPixel: true
    };
    var form = findConfiguredForm();
    if (form) trackForm(form, options);
    else trackStandalone(options);
  }

  function installPixelObserver() {
    var original = window.fbq;
    if (typeof original !== "function") return false;
    if (original.__dhCapiObserver) return true;
    var wrapped = function() {
      var result = original.apply(this, arguments);
      try { observePixelLead(arguments); } catch (error) {}
      return result;
    };
    ["callMethod", "queue", "push", "loaded", "version"].forEach(function(key) {
      try { wrapped[key] = original[key]; } catch (error) {}
    });
    wrapped.__dhCapiObserver = true;
    wrapped.__dhCapiOriginal = original;
    window.fbq = wrapped;
    return true;
  }

  var originalFirePixel = firePixel;
  firePixel = function(payload) {
    suppressPixelObserver = true;
    try { originalFirePixel(payload); }
    finally { suppressPixelObserver = false; }
  };

  if (!installPixelObserver()) {
    var pixelChecks = 0;
    var pixelTimer = window.setInterval(function() {
      pixelChecks += 1;
      if (installPixelObserver() || pixelChecks >= 60) window.clearInterval(pixelTimer);
    }, 500);
  }

  window.CapiLauncher = window.CapiLauncher || {};
  window.CapiLauncher.track = function(target, options) {
    var form = target;
    if (typeof target === "string") {
      try { form = document.querySelector(target); } catch (error) { form = null; }
    }
    form = form || findConfiguredForm();
    if (form) trackForm(form, options || {});
    else trackStandalone(options || {});
  };

  if (CFG.trigger === "page-load" || CFG.trigger === "pageview") {
    if (document.readyState === "complete") window.setTimeout(trackPageLoad, 0);
    else window.addEventListener("load", trackPageLoad, { once: true });
  } else {
    document.addEventListener("submit", function(event) {
      var form = event.target && event.target.closest ? event.target.closest("form") : null;
      trackForm(form);
    }, true);

    if (window.HTMLFormElement && window.HTMLFormElement.prototype) {
      window.HTMLFormElement.prototype.submit = function() {
        trackForm(this);
        return nativeFormSubmit.apply(this, arguments);
      };
    }
  }
})(window, document);
`, "utf8");
}

async function minifyJavaScript(source) {
  const result = await minify(Buffer.isBuffer(source) ? source.toString("utf8") : String(source), {
    ecma: 2020,
    compress: { passes: 2 },
    mangle: true,
    format: {
      ascii_only: true,
      comments: false,
      semicolons: true
    }
  });

  if (!result.code) {
    throw Object.assign(new Error("Could not build the generated JavaScript."), { statusCode: 500 });
  }

  return Buffer.from(result.code, "utf8");
}

async function trackerAssets() {
  const core = await minifyJavaScript(trackerScriptSource());
  const corePath = `/assets/tracker-core.${sha256(core).slice(0, 16)}.js`;
  const loaderSource = String.raw`(function(window, document, script, corePath) {
  "use strict";
  if (!script) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      if ((scripts[i].src || "").indexOf("/tracker.js") !== -1) {
        script = scripts[i];
        break;
      }
    }
  }
  if (!script || window.__CAPI_LAUNCHER_LOADING__ || window.__CAPI_LAUNCHER_TRACKER__) return;
  window.__CAPI_LAUNCHER_LOADING__ = true;
  var core = document.createElement("script");
  core.src = new URL(corePath.replace(/^\//, ""), script.src).href;
  core.async = true;
  for (var j = 0; j < script.attributes.length; j += 1) {
    var attribute = script.attributes[j];
    if (attribute.name.indexOf("data-") === 0 || attribute.name === "nonce") {
      core.setAttribute(attribute.name, attribute.value);
    }
  }
  core.onerror = function() { window.__CAPI_LAUNCHER_LOADING__ = false; };
  (script.parentNode || document.head || document.documentElement).insertBefore(core, script.nextSibling);
})(window, document, document.currentScript, ${JSON.stringify(corePath)});`;
  const loader = await minifyJavaScript(loaderSource);

  return { loader, core, corePath };
}

function trackerHeaders(corePath) {
  return Buffer.from(`/tracker.js
  Cache-Control: public, max-age=300, must-revalidate
  X-Content-Type-Options: nosniff

${corePath}
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
`, "utf8");
}

function statusPage(clientName) {
  const escaped = cleanString(clientName).replace(/[<>&"]/g, "");
  return Buffer.from(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${escaped || "Client"} CAPI Endpoint</title>
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f5f7fc;color:#0b1c30;display:grid;min-height:100vh;place-items:center;padding:24px}
    main{width:min(620px,100%);background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:32px}.pill{display:inline-flex;align-items:center;gap:8px;color:#047857;font-weight:700;font-size:13px}.pill:before{content:"";width:9px;height:9px;border-radius:50%;background:#10b981}h1{font-size:30px;line-height:1.2;margin:18px 0 10px}p{color:#475569;line-height:1.6}code{display:block;background:#102238;color:#c8e4ff;padding:14px;border-radius:6px;margin-top:20px;word-break:break-all}
  </style>
</head>
<body><main><span class="pill">Endpoint online</span><h1>${escaped || "Client"} CAPI bridge</h1><p>This isolated event service is ready to receive conversion events and forward them to Meta.</p></main></body>
</html>`, "utf8");
}

function manifestBuffer({ site, user, clientName, datasetId, graphVersion, createdAt, billing }) {
  return Buffer.from(JSON.stringify({
    product: "capi-launcher",
    schema_version: 3,
    site_id: site.id,
    site_name: site.name,
    owner_key: ownerKey(user),
    client_name: clientName,
    dataset_id: datasetId,
    graph_version: graphVersion,
    billing: billing || undefined,
    created_at: createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2), "utf8");
}

function envVar(key, value, options = {}) {
  const item = {
    key,
    values: [{ context: "all", value }],
    is_secret: Boolean(options.isSecret)
  };
  if (options.scopes) item.scopes = options.scopes;
  return item;
}

function envVars(datasetId, accessToken, graphVersion, options = {}) {
  const scopes = options.scoped ? ["functions"] : undefined;
  return [
    envVar("META_DATASET_ID", datasetId, { scopes }),
    envVar("META_ACCESS_TOKEN", accessToken, { scopes, isSecret: options.secretToken }),
    envVar("META_GRAPH_API_VERSION", graphVersion || DEFAULT_GRAPH_VERSION, { scopes })
  ];
}

function canFallbackToStandardEnv(error) {
  const message = cleanString(error?.providerMessage || error?.message).toLowerCase();
  return (error?.statusCode === 403 || error?.statusCode === 422) &&
    (message.includes("specific scopes") || message.includes("post_processing") || message.includes("post-processing"));
}

async function createSiteEnvVars(accountId, siteId, datasetId, accessToken, graphVersion) {
  const path = `/accounts/${encodeURIComponent(accountId)}/env?site_id=${encodeURIComponent(siteId)}`;
  try {
    await netlifyFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envVars(datasetId, accessToken, graphVersion, { scoped: true, secretToken: true }))
    });
    return "functions-scoped-secret";
  } catch (error) {
    if (!canFallbackToStandardEnv(error)) throw error;
  }

  await netlifyFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envVars(datasetId, accessToken, graphVersion, { scoped: false, secretToken: false }))
  });
  return "site-environment";
}

async function setEnvValue(accountId, siteId, key, value) {
  const base = `/accounts/${encodeURIComponent(accountId)}/env/${encodeURIComponent(key)}?site_id=${encodeURIComponent(siteId)}`;
  const secret = key === "META_ACCESS_TOKEN";
  let existing = null;

  try {
    existing = await netlifyFetch(base);
  } catch (error) {
    if (error?.statusCode !== 404) throw error;
  }

  if (existing) {
    const functionsOnly = Array.isArray(existing.scopes) &&
      existing.scopes.length === 1 && existing.scopes[0] === "functions";
    const replacement = {
      key,
      values: [{ context: "all", value }],
      is_secret: Boolean(existing.is_secret)
    };
    if (functionsOnly) replacement.scopes = ["functions"];

    await netlifyFetch(base, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replacement)
    });
    return;
  }

  const path = `/accounts/${encodeURIComponent(accountId)}/env?site_id=${encodeURIComponent(siteId)}`;
  try {
    await netlifyFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([envVar(key, value, { scopes: ["functions"], isSecret: secret })])
    });
  } catch (error) {
    if (!secret || !canFallbackToStandardEnv(error)) throw error;
    await netlifyFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([envVar(key, value)])
    });
  }
}

async function uploadRequiredDeployFiles(deploy, files, functionZip) {
  const requiredFiles = deploy.required || [];
  const requiredFunctions = deploy.required_functions || [];
  await Promise.all(Object.entries(files).map(async ([path, body]) => {
    if (!requiredFiles.includes(sha1(body))) return;
    await netlifyFetch(`/deploys/${deploy.id}/files${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body
    });
  }));

  if (requiredFunctions.includes(sha256(functionZip))) {
    await netlifyFetch(`/deploys/${deploy.id}/functions/meta-capi-lead?runtime=js`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: functionZip
    });
  }
}

async function pollDeploy(deployId) {
  let latest = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    latest = await netlifyFetch(`/deploys/${encodeURIComponent(deployId)}`);
    if (["ready", "error"].includes(latest.state)) return latest;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  return latest;
}

async function deploySite({ site, user, clientName, datasetId, graphVersion, createdAt, billing }) {
  const tracker = await trackerAssets();
  const files = {
    "/index.html": statusPage(clientName),
    "/tracker.js": tracker.loader,
    [tracker.corePath]: tracker.core,
    "/_headers": trackerHeaders(tracker.corePath),
    [MANIFEST_PATH]: manifestBuffer({ site, user, clientName, datasetId, graphVersion, createdAt, billing })
  };
  const functionZip = await buildFunctionZip();
  const deploy = await netlifyFetch(`/sites/${encodeURIComponent(site.id)}/deploys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: Object.fromEntries(Object.entries(files).map(([path, body]) => [path, sha1(body)])),
      functions: { "meta-capi-lead": sha256(functionZip) }
    })
  });
  await uploadRequiredDeployFiles(deploy, files, functionZip);
  const finalDeploy = await pollDeploy(deploy.id);
  if (finalDeploy?.state === "error") {
    throw Object.assign(new Error("The generated endpoint deploy failed."), { statusCode: 502 });
  }
  return finalDeploy || deploy;
}

function baseUrlForSite(site) {
  return cleanString(site.ssl_url) || `https://${site.name}.netlify.app`;
}

function publicOrigin() {
  const configured = cleanString(process.env.CAPI_PUBLIC_ORIGIN) || cleanString(process.env.CAPI_APP_ORIGIN).split(",")[0];
  try { return new URL(configured).origin; } catch { return "https://simplecapi.com"; }
}

function gatewayRoute(siteName) {
  const secret = cleanString(process.env.CAPI_GATEWAY_SECRET) || cleanString(process.env.NETLIFY_AUTH_TOKEN);
  if (secret.length < 20) throw Object.assign(new Error("Secure endpoint routing is not configured."), { statusCode: 500 });
  const key = crypto.createHash("sha256").update(`simplecapi-gateway-v1:${secret}`).digest();
  const iv = crypto.createHmac("sha256", key).update(siteName).digest().subarray(0, 12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(siteName, "utf8"), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]).toString("base64url");
}

function endpointRecord(site, manifest = {}) {
  const publicBase = `${publicOrigin()}/client/${gatewayRoute(site.name)}`;
  return {
    id: site.id,
    client_name: cleanString(manifest.client_name) || cleanString(site.name),
    dataset_id: cleanString(manifest.dataset_id),
    graph_version: cleanString(manifest.graph_version) || DEFAULT_GRAPH_VERSION,
    billing: manifest.billing && typeof manifest.billing === "object" ? {
      provider: cleanString(manifest.billing.provider),
      order_id: cleanString(manifest.billing.order_id),
      amount: Number(manifest.billing.amount) || 0,
      currency: cleanString(manifest.billing.currency),
      paid_at: cleanString(manifest.billing.paid_at)
    } : null,
    endpoint: `${publicBase}/events`,
    tracker_url: `${publicBase}/tracker.js`,
    state: site.published_deploy?.state || site.state || "unknown",
    created_at: cleanString(manifest.created_at) || site.created_at,
    updated_at: cleanString(manifest.updated_at) || site.updated_at
  };
}

async function verifyEndpoint(endpoint) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const result = await fetch(endpoint, { method: "OPTIONS", signal: controller.signal, cache: "no-store" });
    return { healthy: result.ok, status: result.status, latency_ms: Date.now() - startedAt };
  } catch {
    return { healthy: false, status: 0, latency_ms: Date.now() - startedAt };
  } finally {
    clearTimeout(timeout);
  }
}

async function listAccountSites(accountSlug) {
  const sites = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await netlifyFetch(`/${encodeURIComponent(accountSlug)}/sites?per_page=100&page=${page}`);
    sites.push(...batch);
    if (!Array.isArray(batch) || batch.length < 100) break;
  }
  return sites;
}

async function readManifest(site) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const result = await fetch(`${baseUrlForSite(site).replace(/\/$/, "")}${MANIFEST_PATH}`, {
      signal: controller.signal,
      cache: "no-store"
    });
    if (!result.ok) return {};
    return await result.json().catch(() => ({}));
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

async function ownedSiteObjects(accountSlug, user) {
  const prefix = ownerPrefix(user);
  return (await listAccountSites(accountSlug)).filter((site) => cleanString(site.name).startsWith(prefix));
}

async function listOwnedSites(accountSlug, user) {
  const sites = await ownedSiteObjects(accountSlug, user);
  return Promise.all(sites.map(async (site) => endpointRecord(site, await readManifest(site))));
}

async function requireOwnedSite(siteId, user) {
  const id = cleanString(siteId);
  if (!/^[a-f0-9-]{20,}$/i.test(id)) {
    throw Object.assign(new Error("Invalid endpoint ID."), { statusCode: 400 });
  }
  const site = await netlifyFetch(`/sites/${encodeURIComponent(id)}`);
  if (!cleanString(site.name).startsWith(ownerPrefix(user))) {
    throw Object.assign(new Error("Endpoint not found."), { statusCode: 404 });
  }
  return site;
}

async function createEndpoint(accountSlug, accountId, user, input, request) {
  const client = validateClientInput(input);
  const owned = await ownedSiteObjects(accountSlug, user);
  const limit = safeInteger(process.env.CAPI_MAX_ENDPOINTS_PER_USER, DEFAULT_USER_LIMIT);
  if (owned.length >= limit) {
    throw Object.assign(new Error(`Endpoint limit reached (${limit}). Remove an endpoint before creating another.`), {
      statusCode: 409
    });
  }

  const exempt = billingExempt(user, request) || !billingRequired();
  let payment = null;
  if (!exempt) {
    if (!billingConfiguration().configured) {
      throw Object.assign(new Error("Endpoint payments are not configured."), { statusCode: 503 });
    }
    const order = await retrieveLemonOrder(input.checkoutOrderId);
    const redeemedSiteId = await redeemedSiteForOrder(accountSlug, user, order?.id);
    payment = validateLemonOrder(order, user, { redeemedSiteId });
  }

  const suffix = payment ? payment.orderHash.slice(0, 10) : Date.now().toString(36);
  const siteName = `${ownerPrefix(user)}${slugify(client.clientName)}-${suffix}`.slice(0, 63);
  let site;
  try {
    site = await netlifyFetch(`/${encodeURIComponent(accountSlug)}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: siteName })
    });
    const envMode = await createSiteEnvVars(
      accountId,
      site.id,
      client.datasetId,
      client.accessToken,
      client.graphVersion
    );
    const billing = payment ? {
      provider: "lemonsqueezy",
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      paid_at: payment.paidAt
    } : undefined;
    const deploy = await deploySite({ site, user, ...client, billing });
    const record = endpointRecord({ ...site, published_deploy: deploy }, {
      client_name: client.clientName,
      dataset_id: client.datasetId,
      graph_version: client.graphVersion,
      billing,
      created_at: site.created_at,
      updated_at: new Date().toISOString()
    });
    const health = await verifyEndpoint(record.endpoint);
    return { ...record, ...health, env_mode: envMode };
  } catch (error) {
    if (site?.id) {
      try { await netlifyFetch(`/sites/${encodeURIComponent(site.id)}`, { method: "DELETE" }); } catch {}
    }
    throw error;
  }
}

async function updateEndpoint(accountId, user, input) {
  const site = await requireOwnedSite(input.siteId, user);
  const previous = await readManifest(site);
  const client = validateClientInput({
    clientName: input.clientName || previous.client_name,
    datasetId: input.datasetId || previous.dataset_id,
    accessToken: input.accessToken || "",
    graphVersion: input.graphVersion || previous.graph_version
  }, { tokenRequired: false });

  if (client.datasetId !== cleanString(previous.dataset_id)) {
    await setEnvValue(accountId, site.id, "META_DATASET_ID", client.datasetId);
  }
  if (client.graphVersion !== cleanString(previous.graph_version)) {
    await setEnvValue(accountId, site.id, "META_GRAPH_API_VERSION", client.graphVersion);
  }
  if (client.accessToken) {
    await setEnvValue(accountId, site.id, "META_ACCESS_TOKEN", client.accessToken);
  }
  const deploy = await deploySite({
    site,
    user,
    ...client,
    createdAt: previous.created_at || site.created_at,
    billing: previous.billing
  });
  const record = endpointRecord({ ...site, published_deploy: deploy }, {
    ...previous,
    client_name: client.clientName,
    dataset_id: client.datasetId,
    graph_version: client.graphVersion,
    updated_at: new Date().toISOString()
  });
  return { ...record, ...(await verifyEndpoint(record.endpoint)) };
}

async function parseJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 256000) {
    throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
  }
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { statusCode: 400 });
  }
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    const result = response(request, 204, null);
    result.headers.set("Access-Control-Allow-Headers", "Content-Type");
    result.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    return result;
  }

  const url = new URL(request.url);
  const action = cleanString(url.searchParams.get("action")) || "status";

  if (request.method === "GET" && action === "status") {
    return response(request, 200, provisionerStatus());
  }

  try {
    if (!["GET", "POST", "PATCH", "DELETE"].includes(request.method)) {
      return response(request, 405, { success: false, error: "Method not allowed." });
    }
    if (request.method !== "GET") assertSameOrigin(request);
    const user = await requireUser(request);
    const accountSlug = cleanString(process.env.NETLIFY_ACCOUNT_SLUG);
    if (!accountSlug) {
      throw Object.assign(new Error("Server provisioning account is missing."), { statusCode: 500 });
    }

    const account = await netlifyFetch(`/accounts/${encodeURIComponent(accountSlug)}`);
    const accountId = cleanString(account?.id) || accountSlug;

    if (request.method === "GET" && action === "list") {
      const endpoints = await listOwnedSites(accountSlug, user);
      return response(request, 200, { success: true, endpoints, count: endpoints.length });
    }

    if (request.method === "GET" && action === "billing") {
      return response(request, 200, { success: true, billing: await billingStatus(accountSlug, user, request) });
    }

    if (request.method === "POST" && action === "checkout") {
      const config = billingConfiguration();
      if (billingExempt(user, request) || !config.required) {
        throw Object.assign(new Error("This account does not require payment."), { statusCode: 400 });
      }
      if (!config.configured) {
        throw Object.assign(new Error("Lemon Squeezy payments are not configured."), { statusCode: 503 });
      }
      const checkout = await createLemonCheckout(request, user);
      return response(request, 201, { success: true, checkout, billing: config });
    }

    if (request.method === "POST" && action === "checkout-verify") {
      const input = await parseJson(request);
      const order = await retrieveLemonOrder(input.checkoutOrderId);
      const redeemedSiteId = await redeemedSiteForOrder(accountSlug, user, order?.id);
      const payment = validateLemonOrder(order, user, { allowRedeemed: true, redeemedSiteId });
      return response(request, 200, {
        success: true,
        payment: {
          paid: true,
          available: !payment.redeemedSiteId,
          redeemed: Boolean(payment.redeemedSiteId),
          amount: payment.amount,
          currency: payment.currency,
          paid_at: payment.paidAt
        }
      });
    }

    if (request.method === "POST" && action === "create") {
      const endpoint = await createEndpoint(accountSlug, accountId, user, await parseJson(request), request);
      return response(request, 201, { success: true, endpoint });
    }

    if (request.method === "POST" && action === "verify") {
      const input = await parseJson(request);
      const site = await requireOwnedSite(input.siteId, user);
      const record = endpointRecord(site, await readManifest(site));
      return response(request, 200, { success: true, ...(await verifyEndpoint(record.endpoint)) });
    }

    if (request.method === "PATCH" && action === "update") {
      const endpoint = await updateEndpoint(accountId, user, await parseJson(request));
      return response(request, 200, { success: true, endpoint });
    }

    if (request.method === "DELETE" && action === "delete") {
      const input = await parseJson(request);
      const site = await requireOwnedSite(input.siteId, user);
      await netlifyFetch(`/sites/${encodeURIComponent(site.id)}`, { method: "DELETE" });
      return response(request, 200, { success: true, deleted: site.id });
    }

    return response(request, 404, { success: false, error: "Unknown action." });
  } catch (error) {
    const status = error?.statusCode || 500;
    const message = status >= 500
      ? cleanString(error?.message) || "The provisioning service failed."
      : cleanString(error?.message) || "Request failed.";
    return response(request, status, { success: false, error: message });
  }
}

export const config = {
  path: "/.netlify/functions/create-client-capi",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};

export const __testing = {
  capiFunctionSource,
  trackerScriptSource,
  minifyJavaScript,
  trackerAssets,
  ownerKey,
  checkoutOrderId,
  lemonOrderSearchParams,
  validateLemonOrder,
  billingConfiguration,
  trustedAppOrigin,
  gatewayRoute
};
