import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const metaBackend = read("../netlify/functions/create-client-capi.mjs");
const metaWorkspace = read("../src/components/Workspace.jsx");
const metaClient = read("../src/lib/capi.js");
const providerWorkspace = read("../netlify/functions/provider-workspace.mjs");
const providerGateway = read("../netlify/functions/provider-gateway.mjs");
const providerPage = read("../src/components/PlatformsPage.jsx");
const providerApi = read("../src/lib/api.js");
const providerNavigation = read("../src/lib/provider-navigation.js");
const main = read("../src/main.jsx");
const ui = read("../src/components/UI.jsx");
const vercel = read("../vercel.json");

// Existing Meta implementation remains on its original code path.
assert(metaBackend.includes('const DEFAULT_GRAPH_VERSION = "v23.0"'), "Meta Graph API default changed unexpectedly.");
assert(metaBackend.includes('"META_DATASET_ID"') && metaBackend.includes('"META_ACCESS_TOKEN"'), "Meta endpoint credentials are no longer provisioned.");
assert(metaBackend.includes('https://graph.facebook.com/'), "Meta server events no longer use the Graph API.");
assert(metaBackend.includes('window.fbq("track", CFG.eventName'), "Meta browser event contract changed.");
assert(metaBackend.includes('event_id: eventId') && metaBackend.includes('fbc: buildFbc'), "Meta deduplication or attribution fields changed.");
assert(metaWorkspace.includes('label="Meta Dataset ID (Pixel ID)"'), "Existing Meta setup wizard was replaced.");
assert(metaWorkspace.includes('label="Conversions API access token"'), "Existing Meta token field was removed.");
assert(metaClient.includes('["data-only-meta-traffic", String(Boolean(config.onlyMetaTraffic))]'), "Existing Meta installation tag changed.");

// Provider workspace is isolated and never returns raw credentials.
assert(providerWorkspace.includes('const PROVIDERS = new Set(["tiktok", "google"])'), "TikTok and Google providers are not registered.");
assert(providerWorkspace.includes('createCipheriv("aes-256-gcm"'), "Provider credentials are not encrypted at rest.");
assert(providerWorkspace.includes('This script is locked to a different page') || providerGateway.includes('This script is locked to a different page'), "Exact page protection is missing.");
assert(providerWorkspace.includes('Enter a selector that targets one exact form'), "Exact form protection is missing.");
assert(providerWorkspace.includes('provider: config.provider') && !/publicRecord\([\s\S]*accessToken/.test(providerWorkspace), "Public provider records may expose credentials.");
assert(providerWorkspace.includes('existing_app: true'), "Provider status does not preserve the existing Meta app.");

// TikTok Pixel + Events API implementation.
assert(providerGateway.includes('https://business-api.tiktok.com/open_api/v1.3/event/track/'), "TikTok Events API endpoint is missing.");
assert(providerGateway.includes('"Access-Token": config.tiktok.accessToken'), "TikTok Events API authentication is missing.");
assert(providerGateway.includes('ttclid') && providerGateway.includes('ttp:'), "TikTok click and cookie attribution are missing.");
assert(providerGateway.includes('event_id: eventId'), "TikTok browser/server deduplication ID is missing.");
assert(providerGateway.includes('email: email ? sha256(email)') && providerGateway.includes('phone: phone ? sha256(phone)'), "TikTok first-party identifiers are not hashed.");
assert(providerGateway.includes('analytics.tiktok.com/i18n/pixel/events.js'), "TikTok Pixel loader is missing.");
assert(providerWorkspace.includes('eventName === "Schedule" ? "Schedule" : "SubmitForm"'), "TikTok standard event mapping is missing.");

// Google tag + enhanced conversions + optional Ads API upload.
assert(providerGateway.includes('www.googletagmanager.com/gtag/js?id='), "Google tag loader is missing.");
assert(providerGateway.includes('w.gtag("set","user_data"'), "Google enhanced conversion user data is missing.");
assert(providerGateway.includes('transaction_id:p.event_id'), "Google browser duplicate protection is missing.");
assert(providerGateway.includes(':uploadClickConversions'), "Google Ads API conversion upload is missing.");
assert(providerGateway.includes('gclid') && providerGateway.includes('wbraid') && providerGateway.includes('gbraid'), "Google click identifiers are incomplete.");
assert(providerGateway.includes('hashedEmail') && providerGateway.includes('hashedPhoneNumber'), "Google enhanced conversion hashing is missing.");
assert(providerWorkspace.includes('Complete every Google Ads API field'), "Google server credentials cannot be validated as a complete set.");

// Routing and UI are additive.
assert(providerApi.includes('const PROVIDER_PATH = "/api/providers"'), "Authenticated provider API client is missing.");
assert(main.includes('normalizedPath === "/platforms"') && main.includes('<PlatformsPage />'), "Provider workspace route is missing.");
assert(providerPage.includes('Meta remains unchanged'), "Provider workspace does not communicate Meta preservation.");
assert(providerPage.includes('TikTok Pixel + Events API') && providerPage.includes('Google tag + enhanced conversions'), "Provider setup options are incomplete.");
assert(providerNavigation.includes('sideNavLinks') && providerNavigation.includes('TikTok & Google'), "Existing Meta workspace has no additive provider link.");
assert(ui.includes('platforms: "/platforms"'), "Shared public navigation is missing the provider workspace.");
assert(vercel.includes('"source": "/api/providers"'), "Vercel provider API proxy is missing.");
assert(vercel.includes('"source": "/p/:route/tracker.js"') && vercel.includes('"source": "/p/:route/events"'), "Provider tracker and event proxy routes are missing.");

console.log("Validated Meta preservation and isolated TikTok/Google provider contracts.");
