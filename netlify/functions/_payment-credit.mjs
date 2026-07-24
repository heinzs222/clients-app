import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";
const SECURITY_STORE = "simple-capi-security";
const DEFAULT_ENDPOINT_PRICE_CENTS = 500;

function cleanString(value) {
  if (typeof value !== "string") return "";
  const result = value.trim();
  return result && !/^(null|undefined)$/i.test(result) ? result : "";
}

function safeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanEnv(name, fallback) {
  const value = cleanString(process.env[name]).toLowerCase();
  return value ? ["1", "true", "yes", "on"].includes(value) : fallback;
}

function endpointPriceCents() {
  return Math.max(50, Math.min(safeInteger(process.env.CAPI_ENDPOINT_PRICE_CENTS, DEFAULT_ENDPOINT_PRICE_CENTS), 1000000));
}

function ownerKey(user) {
  const identity = cleanString(user?.id) || cleanString(user?.email) || "local-development";
  return crypto.createHash("sha256").update(identity).digest("hex").slice(0, 12);
}

function securityStore() {
  return getStore({ name: SECURITY_STORE, consistency: "strong" });
}

function checkoutOrderId(value) {
  const id = cleanString(value);
  return /^\d{1,20}$/.test(id) ? id : "";
}

function isLocalRequest(request) {
  try {
    const hostname = new URL(request.url).hostname;
    return process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev" || ["localhost", "127.0.0.1"].includes(hostname);
  } catch {
    return false;
  }
}

export function paymentExemption(user, request) {
  if (request && isLocalRequest(request)) return "development";
  if (!booleanEnv("CAPI_REQUIRE_PAYMENT", true)) return "service";
  const email = cleanString(user?.email).toLowerCase();
  const exempt = cleanString(process.env.CAPI_BILLING_EXEMPT_EMAILS)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return exempt.includes(email) ? "account" : "";
}

async function lemonFetch(path) {
  const apiKey = cleanString(process.env.LEMONSQUEEZY_API_KEY);
  if (apiKey.length < 20) {
    throw Object.assign(new Error("Endpoint payments are not configured."), { statusCode: 503 });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${LEMON_API_BASE}${path}`, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = cleanString(data?.errors?.[0]?.detail) || "Payment verification failed.";
      throw Object.assign(new Error(message), { statusCode: response.status >= 500 ? 502 : 402 });
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("Payment verification timed out."), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function validateOrder(order, user) {
  const attributes = order?.attributes || {};
  const orderId = checkoutOrderId(order?.id);
  const expectedEmail = cleanString(user?.email).toLowerCase();
  if (!orderId || !expectedEmail || cleanString(attributes.user_email).toLowerCase() !== expectedEmail) {
    throw Object.assign(new Error("This payment belongs to another account."), { statusCode: 403 });
  }
  if (
    Number(attributes.store_id) !== safeInteger(process.env.LEMONSQUEEZY_STORE_ID, 0) ||
    Number(attributes.first_order_item?.variant_id) !== safeInteger(process.env.LEMONSQUEEZY_VARIANT_ID, 0)
  ) {
    throw Object.assign(new Error("This is not an endpoint payment."), { statusCode: 402 });
  }
  if (attributes.status !== "paid" || attributes.refunded || Number(attributes.refunded_amount || 0) > 0) {
    throw Object.assign(new Error("Endpoint payment is not complete."), { statusCode: 402 });
  }
  if (Number(attributes.subtotal) !== endpointPriceCents() || cleanString(attributes.currency).toLowerCase() !== "usd") {
    throw Object.assign(new Error("Endpoint payment amount is invalid."), { statusCode: 402 });
  }
  if (Boolean(attributes.test_mode) !== booleanEnv("LEMONSQUEEZY_TEST_MODE", true)) {
    throw Object.assign(new Error("Payment mode does not match the configured checkout mode."), { statusCode: 402 });
  }
  return {
    orderId,
    amount: endpointPriceCents(),
    currency: "USD",
    paidAt: cleanString(attributes.created_at) || new Date().toISOString()
  };
}

function claimKey(orderId) {
  return `billing/orders/${checkoutOrderId(orderId)}`;
}

export async function verifyAndReservePayment(user, request, orderId, endpointRef) {
  const normalizedOrderId = checkoutOrderId(orderId);
  if (!normalizedOrderId) {
    throw Object.assign(new Error("Purchase a $5 conversion credit before creating this endpoint."), { statusCode: 402 });
  }
  const result = await lemonFetch(`/orders/${encodeURIComponent(normalizedOrderId)}`);
  const payment = validateOrder(result?.data, user);
  const ref = cleanString(endpointRef);
  const claim = {
    owner_key: ownerKey(user),
    endpoint_ref: ref,
    claimed_at: new Date().toISOString()
  };
  const db = securityStore();
  const created = await db.setJSON(claimKey(payment.orderId), claim, { onlyIfNew: true });
  if (!created.modified) {
    const existing = await db.get(claimKey(payment.orderId), { type: "json", consistency: "strong" });
    if (existing?.owner_key !== claim.owner_key || existing?.endpoint_ref !== ref) {
      throw Object.assign(new Error("This payment has already been used for an endpoint."), { statusCode: 409 });
    }
  }
  return payment;
}

export async function releasePaymentReservation(orderId, endpointRef) {
  const id = checkoutOrderId(orderId);
  if (!id) return;
  const db = securityStore();
  const existing = await db.get(claimKey(id), { type: "json", consistency: "strong" });
  if (existing?.endpoint_ref === cleanString(endpointRef)) await db.delete(claimKey(id));
}

export async function claimedEndpointForOrder(orderId) {
  const id = checkoutOrderId(orderId);
  if (!id) return "";
  const claim = await securityStore().get(claimKey(id), { type: "json", consistency: "strong" });
  return cleanString(claim?.endpoint_ref);
}

export const __testing = {
  checkoutOrderId,
  validateOrder
};
