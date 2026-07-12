import crypto from "node:crypto";

const CLIENT_SITE_PATTERN = /^dhc-[a-f0-9]{12}-[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const TRACKER_ASSET_PATTERN = /^assets\/tracker-core\.[a-f0-9]{12,64}\.js$/;
const MAX_EVENT_BYTES = 512000;

function json(status, body) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function sourceIp(request) {
  for (const header of ["x-nf-client-connection-ip", "cf-connecting-ip", "x-real-ip", "x-forwarded-for"]) {
    const value = request.headers.get(header);
    if (value) return value.split(",")[0].trim();
  }
  return "";
}

function gatewayKeys() {
  return [...new Set([process.env.CAPI_GATEWAY_SECRET, process.env.NETLIFY_AUTH_TOKEN])]
    .map((value) => String(value || "").trim())
    .filter((value) => value.length >= 20)
    .map((secret) => crypto.createHash("sha256").update(`simplecapi-gateway-v1:${secret}`).digest());
}

function decodeRoute(route) {
  if (!/^[A-Za-z0-9_-]{40,240}$/.test(route)) return "";
  const packed = Buffer.from(route, "base64url");
  if (packed.length < 29) return "";
  for (const key of gatewayKeys()) {
    try {
      const iv = packed.subarray(0, 12);
      const tag = packed.subarray(packed.length - 16);
      const ciphertext = packed.subarray(12, packed.length - 16);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    } catch {
      // Try the fallback key used by local development.
    }
  }
  return "";
}

function targetOrigin(site) {
  return `https://${site}.netlify.app`;
}

async function proxyTrackerAsset(request, site, asset) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json(405, { success: false, error: "Method not allowed" });
  }
  if (asset !== "tracker.js" && !TRACKER_ASSET_PATTERN.test(asset)) {
    return json(404, { success: false, error: "Asset not found" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(`${targetOrigin(site)}/${asset}`, {
      method: request.method,
      signal: controller.signal,
      headers: { Accept: "application/javascript" }
    });
    if (!upstream.ok) return json(upstream.status === 404 ? 404 : 502, { success: false, error: "Asset unavailable" });

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": asset === "tracker.js"
          ? "public, max-age=300, s-maxage=300, must-revalidate"
          : "public, max-age=31536000, s-maxage=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return json(502, { success: false, error: error?.name === "AbortError" ? "Asset request timed out" : "Asset unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}

async function eventBody(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_EVENT_BYTES) throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });

  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_EVENT_BYTES) {
    throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });
  }

  const ip = sourceIp(request);
  const userAgent = request.headers.get("user-agent") || "";

  if (contentType.includes("application/json")) {
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw Object.assign(new Error("Invalid JSON body"), { statusCode: 400 });
    }
    if (!body.client_ip_address && ip) body.client_ip_address = ip;
    if (!body.client_user_agent && userAgent) body.client_user_agent = userAgent;
    return { body: JSON.stringify(body), contentType: "application/json" };
  }

  const params = new URLSearchParams(text);
  if (!params.get("client_ip_address") && ip) params.set("client_ip_address", ip);
  if (!params.get("client_user_agent") && userAgent) params.set("client_user_agent", userAgent);
  return { body: params.toString(), contentType: "application/x-www-form-urlencoded;charset=UTF-8" };
}

async function proxyEvent(request, site) {
  if (request.method === "OPTIONS") return json(204, {});
  if (request.method !== "POST") return json(405, { success: false, error: "Method not allowed" });

  let prepared;
  try {
    prepared = await eventBody(request);
  } catch (error) {
    return json(error.statusCode || 400, { success: false, error: error.message || "Invalid request" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(`${targetOrigin(site)}/.netlify/functions/meta-capi-lead`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": prepared.contentType },
      body: prepared.body
    });
    const raw = await upstream.text();
    let body;
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = { success: false, error: "Event service returned an unreadable response" }; }
    return json(upstream.ok ? 200 : upstream.status === 400 ? 400 : 502, body);
  } catch (error) {
    return json(502, { success: false, error: error?.name === "AbortError" ? "Event request timed out" : "Event service unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request) {
  const url = new URL(request.url);
  const site = decodeRoute((url.searchParams.get("route") || "").trim()).toLowerCase();
  if (!CLIENT_SITE_PATTERN.test(site)) return json(404, { success: false, error: "Endpoint not found" });

  if (url.searchParams.get("action") === "events") return proxyEvent(request, site);
  return proxyTrackerAsset(request, site, (url.searchParams.get("asset") || "").replace(/^\/+/, ""));
}

export const config = {
  path: "/.netlify/functions/client-gateway",
  rateLimit: {
    windowLimit: 300,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
