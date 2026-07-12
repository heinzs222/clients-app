export const DEFAULT_TRACKING = Object.freeze({
  eventName: "Lead",
  trigger: "form",
  formSelector: "form",
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

export function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function trackerTag(endpoint, settings = DEFAULT_TRACKING) {
  const config = { ...DEFAULT_TRACKING, ...settings };
  const attributes = [
    ["src", endpoint.tracker_url],
    ["data-event-name", config.eventName || "Lead"],
    ["data-trigger", config.trigger || "form"],
    ["data-form-selector", config.trigger === "page-load" ? "" : (config.formSelector || "form")],
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
