import { refreshSession } from "@netlify/identity";

const API_PATH = "/api/workspace";

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

  return fetch(`${API_PATH}?action=${encodeURIComponent(action)}`, {
    method,
    credentials: "same-origin",
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
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

  if (!response.ok || data.success === false) {
    const error = new Error(data.error || "The request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}
