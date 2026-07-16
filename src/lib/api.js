import { refreshSession } from "@netlify/identity";

const API_PATH = "/.netlify/functions/create-client-capi";
const DEVICE_KEY = "simple-capi-device";

function deviceToken() {
  if (typeof window === "undefined") return "";
  let value = window.localStorage.getItem(DEVICE_KEY) || "";
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(value)) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(DEVICE_KEY, value);
  }
  return value;
}

export function sessionAccessToken(cookieHeader = typeof document === "undefined" ? "" : document.cookie) {
  const match = String(cookieHeader || "").match(/(?:^|;\s*)nf_jwt=([^;]+)/);
  if (!match) return "";
  try {
    const value = decodeURIComponent(match[1]);
    return value.split(".").length === 3 ? value : "";
  } catch {
    return "";
  }
}

async function sendRequest(action, { method, body }, accessToken) {
  const headers = new Headers();
  if (body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const device = deviceToken();
  if (device) headers.set("X-CAPI-Device", device);

  return fetch(`${API_PATH}?action=${encodeURIComponent(action)}`, {
    method,
    credentials: "same-origin",
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

function legacySecurityResponse(action, response, data) {
  if (action !== "security-status") return null;
  if (response.status !== 404 || data?.error !== "Unknown action.") return null;
  return {
    success: true,
    security: {
      required: false,
      complete: true,
      authenticator_verified: false,
      compatibility_mode: true
    }
  };
}

export async function capiRequest(action, { method = "GET", body } = {}) {
  const request = { method, body };
  const accessToken = sessionAccessToken();
  let response = await sendRequest(action, request, accessToken);

  if (response.status === 401 && accessToken) {
    const refreshedToken = await refreshSession();
    if (refreshedToken) response = await sendRequest(action, request, refreshedToken);
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("The service returned an unreadable response.");
  }

  const compatibility = legacySecurityResponse(action, response, data);
  if (compatibility) return compatibility;

  if (!response.ok || data.success === false) {
    const error = new Error(data.error || "The request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}
