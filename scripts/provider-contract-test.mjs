import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const metaBackend = read("../netlify/functions/create-client-capi.mjs");
const metaWorkspace = read("../src/components/Workspace.jsx");
const metaClient = read("../src/lib/capi.js");
const workspace = read("../netlify/functions/provider-workspace.mjs");
const gateway = read("../netlify/functions/provider-gateway.mjs");
const page = read("../src/components/PlatformsPage.jsx");
const api = read("../src/lib/api.js");
const main = read("../src/main.jsx");
const ui = read("../src/components/UI.jsx");
const vercel = read("../vercel.json");

// Lock the existing Meta behavior in place.
assert(metaBackend.includes('const DEFAULT_GRAPH_VERSION = "v23.0"'), "Meta API default changed.");
assert(metaBackend.includes('"META_DATASET_ID"') && metaBackend.includes('"META_ACCESS_TOKEN"'), "Meta credential provisioning changed.");
assert(metaBackend.includes('https://graph.facebook.com/'), "Meta server delivery changed.");
assert(metaBackend.includes('window.fbq("track", CFG.eventName'), "Meta browser delivery changed.");
assert(metaBackend.includes('event_id: eventId') && metaBackend.includes('fbc: buildFbc'), "Meta deduplication or attribution changed.");
assert(metaWorkspace.includes('label="Meta Dataset ID (Pixel ID)"'), "Meta setup wizard was replaced.");
assert(metaWorkspace.includes('label="Conversions API access token"'), "Meta setup token field was removed.");
assert(metaClient.includes('["data-only-meta-traffic", String(Boolean(config.onlyMetaTraffic))]'), "Meta installation output changed.");

// Isolated provider storage and page/form protection.
assert(workspace.includes('new Set(["tiktok", "google"])'), "Provider registry is incomplete.");
assert(workspace.includes('createCipheriv("aes-256-gcm"'), "Provider data is not encrypted.");
assert(workspace.includes('credential_summary:') && workspace.includes('provider: config.provider'), "Safe provider summaries are missing.");
assert(workspace.includes('existing_app: true'), "Meta preservation status is missing.");
assert(gateway.includes('This script is locked to a different page'), "Page locking is missing.");
assert(workspace.includes('selector that targets one exact form'), "Form locking is missing.");

// TikTok Pixel and Events API.
assert(gateway.includes('business-api.tiktok.com/open_api/v1.3/event/track/'), "TikTok Events API is missing.");
assert(gateway.includes('"Access-Token": config.tiktok.accessToken'), "TikTok API authentication is missing.");
assert(gateway.includes('ttclid') && gateway.includes('ttp:'), "TikTok attribution is incomplete.");
assert(gateway.includes('event_id: eventId'), "TikTok event deduplication is missing.");
assert(gateway.includes('email: email ? [sha256(email)]') && gateway.includes('phone: phone ? [sha256(phone)]'), "TikTok identifier arrays are missing.");
assert(gateway.includes('test_event_code: config.tiktok.testEventCode'), "TikTok test code is not request-level.");
assert(gateway.includes('analytics.tiktok.com/i18n/pixel/events.js'), "TikTok Pixel is missing.");
assert(workspace.includes('"Schedule" : "Lead"'), "TikTok standard event mapping is missing.");

// Google tag, enhanced conversions and optional Ads API upload.
assert(gateway.includes('www.googletagmanager.com/gtag/js?id='), "Google tag is missing.");
assert(gateway.includes('script[src*="googletagmanager.com/gtag/js?id="]'), "Existing Google tags are not reused.");
assert(gateway.includes('w.gtag("set","user_data"'), "Google enhanced conversion data is missing.");
assert(gateway.includes('transaction_id:p.event_id'), "Google duplicate protection is missing.");
assert(gateway.includes(':uploadClickConversions'), "Google Ads API upload is missing.");
assert(gateway.includes('const GOOGLE_ADS_VERSION = "v24"'), "Google Ads API is not using the current supported major version.");
assert(gateway.includes('gclid') && gateway.includes('wbraid') && gateway.includes('gbraid'), "Google click identifiers are incomplete.");
assert(gateway.includes('hashedEmail') && gateway.includes('hashedPhoneNumber'), "Google identifier hashing is missing.");
assert(gateway.includes('SimpleCAPIConsent') && !gateway.includes('? "DENIED" : "GRANTED"'), "Google consent is being assumed instead of supplied explicitly.");
assert(workspace.includes('Complete every Google Ads API field'), "Google API configuration validation is missing.");

// Browser event guards.
assert(gateway.includes('simple-capi:page-event:') && gateway.includes('300000'), "Schedule reload protection is missing.");
assert(gateway.includes('HTMLFormElement.prototype.submit'), "Programmatic form submission capture is missing.");

// Integrated routes and navigation.
assert(api.includes('const PROVIDER_PATH = "/api/providers"'), "Provider API client is missing.");
assert(!main.includes('normalizedPath === "/platforms"'), "Provider page still bypasses the authenticated app router.");
assert(metaWorkspace.includes('{ id: "platforms", label: "TikTok & Google"'), "Dashboard provider navigation is missing.");
assert(page.includes('TikTok connection') && page.includes('Google Ads connection'), "Provider page is incomplete.");
assert(ui.includes('platforms: "/platforms"'), "Shared provider navigation is missing.");
assert(workspace.includes('verifyAndReservePayment') && workspace.includes('checkoutOrderId'), "Provider checkout enforcement is missing.");
assert(vercel.includes('"source": "/api/providers"'), "Provider API proxy is missing.");
assert(vercel.includes('"source": "/p/:route/tracker.js"') && vercel.includes('"source": "/p/:route/events"'), "Provider public routes are missing.");

console.log("Validated preserved Meta behavior and isolated TikTok/Google providers.");
