const API_PATH = "/.netlify/functions/create-client-capi";

export async function capiRequest(action, { method = "GET", body } = {}) {
  const response = await fetch(`${API_PATH}?action=${encodeURIComponent(action)}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok || data.success === false) {
    const error = new Error(data.error || "The request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}
