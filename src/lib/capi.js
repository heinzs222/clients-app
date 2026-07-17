export const DEFAULT_TRACKING = Object.freeze({
  eventName: "Lead",
  trigger: "form",
  formSelector: "",
  country: "US",
  currency: "USD",
  leadValue: "1.00",
  source: "Estimate Form",
  tags: "estimate-lead,website-form",
  projectType: "",
  projectTimeline: "",
  pageVariant: "",
  testEventCode: "",
  onlyMetaTraffic: false,
  firePixel: true
});

export function trackingDefaultsForEvent(eventName) {
  const schedule = eventName === "Schedule";
  return {
    ...DEFAULT_TRACKING,
    eventName: schedule ? "Schedule" : "Lead",
    trigger: schedule ? "page-load" : "form",
    formSelector: "",
    leadValue: schedule ? "150" : "1.00",
    source: schedule ? "Appointment Booking" : "Estimate Form",
    tags: schedule ? "appointment-booked,website-calendar" : "estimate-lead,website-form"
  };
}

const SETTINGS_KEY = "capi-launcher:tracking:v2";

export function cleanDatasetId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 30);
}

export function cleanAccessToken(value) {
  const compact = String(value || "").replace(/\s+/g, "");
  const match = compact.match(/EAA[A-Za-z0-9_-]+/);
  return (match ? match[0] : compact).slice(0, 2000);
}

export function isValidDatasetId(value) {
  return /^\d{6,30}$/.test(cleanDatasetId(value));
}

export function isValidAccessToken(value) {
  return /^EAA[A-Za-z0-9_-]{20,}$/.test(cleanAccessToken(value));
}

export function canonicalPageUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    url.search = "";
    url.username = "";
    url.password = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export function isValidPageUrl(value) {
  return Boolean(canonicalPageUrl(value));
}

export function isExactFormSelector(value) {
  const selector = String(value || "").trim();
  if (!selector || selector.length > 180) return false;
  if (["form", "*", "body", "html"].includes(selector.toLowerCase())) return false;
  return /^[#.[\]="'():_\-a-zA-Z0-9\s>+~*^$|]+$/.test(selector);
}

export function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function trackerTag(endpoint, settings = DEFAULT_TRACKING) {
  const binding = endpoint?.binding;
  if (!binding?.allowed_page_url) return "";
  const config = { ...DEFAULT_TRACKING, ...settings };
  const eventName = endpoint.event_name === "Schedule" ? "Schedule" : "Lead";
  const attributes = [
    ["src", endpoint.tracker_url],
    ["data-event-name", eventName],
    ["data-trigger", eventName === "Schedule" ? "page-load" : "form"],
    ["data-form-selector", eventName === "Schedule" ? "" : binding.form_selector],
    ["data-country", config.country || "US"],
    ["data-currency", config.currency || "USD"],
    ["data-value", config.leadValue || "1.00"],
    ["data-source", config.source || "Estimate Form"],
    ["data-tags", config.tags || "estimate-lead,website-form"],
    ["data-project-type", config.projectType],
    ["data-project-timeline", config.projectTimeline],
    ["data-page-variant", config.pageVariant],
    ["data-test-event-code", config.testEventCode],
    ["data-only-meta-traffic", String(Boolean(config.onlyMetaTraffic))],
    ["data-fire-pixel", String(Boolean(config.firePixel))]
  ]
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");

  return `<script ${attributes} defer></script>`;
}

function storageNamespace(userId) {
  return `${SETTINGS_KEY}:${userId || "local"}`;
}

export function loadTrackingSettings(userId) {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageNamespace(userId)) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function saveTrackingSettings(userId, endpointId, settings) {
  try {
    const current = loadTrackingSettings(userId);
    current[endpointId] = { ...DEFAULT_TRACKING, ...settings };
    window.localStorage.setItem(storageNamespace(userId), JSON.stringify(current));
  } catch {
    // Tracking preferences are a convenience; endpoint operation does not depend on local storage.
  }
}

export function removeTrackingSettings(userId, endpointId) {
  try {
    const current = loadTrackingSettings(userId);
    delete current[endpointId];
    window.localStorage.setItem(storageNamespace(userId), JSON.stringify(current));
  } catch {
    // Ignore browsers where storage is unavailable.
  }
}

export function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function endpointState(endpoint) {
  if (["ready", "current"].includes(endpoint?.state)) return "active";
  if (["building", "uploading", "processing"].includes(endpoint?.state)) return "pending";
  return "error";
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}
