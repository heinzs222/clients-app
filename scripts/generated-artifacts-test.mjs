import crypto from "node:crypto";
import vm from "node:vm";
import { __testing } from "../netlify/functions/create-client-capi.mjs";
import clientGateway from "../netlify/functions/client-gateway.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

let metaRequest = null;
const module = { exports: {} };
const fakeToken = "EAA_TEST_TOKEN_NOT_A_REAL_SECRET_123456789";
const sandbox = {
  AbortController,
  Buffer,
  URLSearchParams,
  clearTimeout,
  console,
  crypto,
  fetch: async (url, options) => {
    metaRequest = { url, options };
    return new Response(JSON.stringify({ events_received: 1, messages: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },
  module,
  exports: module.exports,
  process: {
    env: {
      META_DATASET_ID: "123456789012345",
      META_ACCESS_TOKEN: fakeToken,
      META_GRAPH_API_VERSION: "v23.0"
    }
  },
  require(name) {
    if (name === "crypto") return crypto;
    throw new Error(`Unexpected generated dependency: ${name}`);
  },
  Response,
  setTimeout
};

const unminifiedCapi = __testing.capiFunctionSource();
const minifiedCapi = await __testing.minifyJavaScript(unminifiedCapi);
assert(minifiedCapi.length < Buffer.byteLength(unminifiedCapi), "Generated CAPI function was not minified.");
vm.runInNewContext(minifiedCapi.toString("utf8"), sandbox, { filename: "meta-capi-lead.min.js" });
const handler = module.exports.handler;
assert(typeof handler === "function", "Generated CAPI handler was not exported.");

const eventId = "lead_contract_test_001";
const result = await handler({
  httpMethod: "POST",
  headers: {
    "content-type": "application/json",
    "user-agent": "CAPI Contract Test/1.0",
    "x-nf-client-connection-ip": "203.0.113.8"
  },
  body: JSON.stringify({
    event_name: "Lead",
    event_id: eventId,
    test_event_code: "TEST_CONTRACT_001",
    first_name: "  JANE ",
    last_name: " DOE ",
    email: " JANE@EXAMPLE.COM ",
    phone: "(555) 123-4567",
    country: "US",
    external_id: "lead-42",
    landing_page: "https://example.com/estimate?fbclid=test-click",
    page_variant: "Variant B",
    fbclid: "test-click",
    fbp: "fb.1.1000.2000",
    currency: "USD",
    value: 1,
    q1_service: "generator"
  })
});

assert(result.statusCode === 200, "Generated CAPI handler did not return 200.");
const responseBody = JSON.parse(result.body);
const outbound = JSON.parse(metaRequest.options.body);
const sentEvent = outbound.data[0];
assert(responseBody.success === true, "Success response is incorrect.");
assert(responseBody.event_id === eventId, "Response event_id changed.");
assert(!result.body.includes(fakeToken), "Access token leaked in the response.");
assert(metaRequest.url.includes("123456789012345"), "Dataset ID was not used in the Meta URL.");
assert(sentEvent.event_id === eventId, "Outbound event_id changed.");
assert(outbound.test_event_code === "TEST_CONTRACT_001", "Meta test event code was not sent at the payload root.");
assert(sentEvent.user_data.em[0] === hash("jane@example.com"), "Email normalization or hash is incorrect.");
assert(sentEvent.user_data.ph[0] === hash("15551234567"), "US phone normalization or hash is incorrect.");
assert(sentEvent.user_data.fn[0] === hash("jane"), "First-name hash is incorrect.");
assert(sentEvent.user_data.ln[0] === hash("doe"), "Last-name hash is incorrect.");
assert(sentEvent.user_data.external_id[0] === hash("lead-42"), "External ID hash is incorrect.");
assert(sentEvent.user_data.client_ip_address === "203.0.113.8", "Client IP was not included.");
assert(sentEvent.user_data.client_user_agent === "CAPI Contract Test/1.0", "User agent was not included.");
assert(sentEvent.user_data.fbp === "fb.1.1000.2000", "fbp was not included.");
assert(sentEvent.user_data.fbc.endsWith(".test-click"), "fbc was not built from fbclid.");
assert(sentEvent.custom_data.page_variant === "Variant B", "Landing-page variant was not forwarded.");
assert(sentEvent.custom_data.q1_service === "generator", "Safe extra form fields were not forwarded.");

const invalid = await handler({ httpMethod: "POST", headers: { "content-type": "application/json" }, body: "{" });
assert(invalid.statusCode === 400, "Invalid JSON did not return 400.");
const wrongMethod = await handler({ httpMethod: "GET", headers: {} });
assert(wrongMethod.statusCode === 405, "Wrong method did not return 405.");
const options = await handler({ httpMethod: "OPTIONS", headers: {} });
assert(options.statusCode === 204, "OPTIONS did not return 204.");

const tracker = await __testing.trackerAssets();
const trackerSource = __testing.trackerScriptSource();
const loaderText = tracker.loader.toString("utf8");
assert(tracker.core.length < trackerSource.length, "Generated tracker core was not minified.");
assert(/^\/assets\/tracker-core\.[a-f0-9]{16}\.js$/.test(tracker.corePath), "Tracker core does not use a content hash.");
assert(loaderText.includes(tracker.corePath), "Tracker loader does not reference its core asset.");
assert(!loaderText.includes("ghlWebhookUrl"), "The public loader contains tracker implementation details.");
assert(!loaderText.includes("\n") && !tracker.core.toString("utf8").includes("\n"), "Generated tracker assets are not compact.");
assert(!/netlify/i.test(loaderText + tracker.core.toString("utf8")), "Generated tracker assets expose the infrastructure provider.");

process.env.CAPI_GATEWAY_SECRET = "contract-test-gateway-secret-1234567890";
const internalSite = "dhc-a1b2c3d4e5f6-example-client-abc123";
const publicRoute = __testing.gatewayRoute(internalSite);
assert(!publicRoute.includes(internalSite) && !publicRoute.includes("example-client"), "Public endpoint route exposes internal hosting details.");

const originalFetch = globalThis.fetch;
let gatewayRequest = null;
globalThis.fetch = async (url, options = {}) => {
  gatewayRequest = { url: String(url), options };
  if (String(url).endsWith("/tracker.js")) {
    return new Response("window.__TRACKER_TEST__=true;", { status: 200, headers: { "Content-Type": "application/javascript" } });
  }
  return new Response(JSON.stringify({ success: true, event_id: "lead_gateway_001" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

try {
  const assetResult = await clientGateway(new Request(`https://service.example/gateway?route=${publicRoute}&asset=tracker.js`));
  assert(assetResult.status === 200, "Branded tracker gateway did not return the asset.");
  assert(gatewayRequest.url === `https://${internalSite}.netlify.app/tracker.js`, "Tracker gateway resolved the wrong internal service.");

  const eventResult = await clientGateway(new Request(`https://service.example/gateway?route=${publicRoute}&action=events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Gateway Contract/1.0",
      "X-Forwarded-For": "198.51.100.24"
    },
    body: "email=gateway%40example.com&event_id=lead_gateway_001"
  }));
  assert(eventResult.status === 200, "Branded event gateway did not return success.");
  const forwarded = new URLSearchParams(gatewayRequest.options.body);
  assert(forwarded.get("client_ip_address") === "198.51.100.24", "Gateway did not preserve the browser IP.");
  assert(forwarded.get("client_user_agent") === "Gateway Contract/1.0", "Gateway did not preserve the browser user agent.");
  assert((await clientGateway(new Request("https://service.example/gateway?route=invalid&asset=tracker.js"))).status === 404, "Gateway accepted an invalid route token.");
} finally {
  globalThis.fetch = originalFetch;
}

const billingUser = { id: "payment-contract-user", email: "owner@example.com" };
process.env.LEMONSQUEEZY_STORE_ID = "1234";
process.env.LEMONSQUEEZY_VARIANT_ID = "5678";
process.env.LEMONSQUEEZY_TEST_MODE = "true";
process.env.CAPI_ENDPOINT_PRICE_CENTS = "500";
const paidOrder = {
  type: "orders",
  id: "42001",
  attributes: {
    store_id: 1234,
    user_email: "owner@example.com",
    currency: "USD",
    subtotal: 500,
    status: "paid",
    refunded: false,
    refunded_amount: 0,
    created_at: "2026-07-11T12:00:00.000Z",
    test_mode: true,
    first_order_item: { variant_id: 5678 }
  }
};
const paid = __testing.validateLemonOrder(paidOrder, billingUser);
assert(paid.amount === 500 && paid.currency === "USD", "Valid Lemon Squeezy endpoint payment was rejected.");
assert(paid.orderHash === hash(`lemon:${paidOrder.id}`), "Lemon Squeezy order redemption hash is incorrect.");
assert(__testing.checkoutOrderId(paidOrder.id) === paidOrder.id, "Lemon Squeezy order ID validation failed.");
assert(__testing.checkoutOrderId("not-an-order") === "", "Invalid Lemon Squeezy order ID was accepted.");
const orderParams = __testing.lemonOrderSearchParams(billingUser);
assert(orderParams.get("filter[store_id]") === "1234", "Lemon Squeezy store filter is incorrect.");
assert(orderParams.get("filter[user_email]") === billingUser.email, "Lemon Squeezy email filter is incorrect.");
assert(!orderParams.has("filter[store-id]") && !orderParams.has("filter[user-email]"), "Unsupported Lemon Squeezy filter names were generated.");
process.env.CAPI_APP_ORIGIN = "https://simplecapi.com";
const proxiedRequest = new Request("https://capi-tracker-service.netlify.app/.netlify/functions/create-client-capi", {
  headers: { origin: "https://simplecapi.com" }
});
assert(__testing.trustedAppOrigin(proxiedRequest) === "https://simplecapi.com", "Checkout redirects do not preserve the trusted public app origin.");

function expectsPaymentFailure(order, message, options) {
  let failed = false;
  try { __testing.validateLemonOrder(order, billingUser, options); } catch { failed = true; }
  assert(failed, message);
}

expectsPaymentFailure({ ...paidOrder, attributes: { ...paidOrder.attributes, subtotal: 499 } }, "Wrong Lemon Squeezy payment amount was accepted.");
expectsPaymentFailure({ ...paidOrder, attributes: { ...paidOrder.attributes, user_email: "another@example.com" } }, "Another user's Lemon Squeezy payment was accepted.");
expectsPaymentFailure(paidOrder, "Reused Lemon Squeezy order was accepted.", { redeemedSiteId: "site-used" });
expectsPaymentFailure({ ...paidOrder, attributes: { ...paidOrder.attributes, refunded: true, refunded_amount: 500, status: "refunded" } }, "Refunded Lemon Squeezy payment was accepted.");

process.stdout.write("Generated contracts passed: tracker, CAPI matching, Lemon Squeezy ownership, amount, refund, and redemption checks.\n");
