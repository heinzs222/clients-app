const SESSION_HINT_KEY = "simple-capi-session-active";

export function hasPublicSessionHint() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
}

export function setPublicSessionHint(authenticated) {
  if (typeof window === "undefined") return;
  if (authenticated) {
    window.localStorage.setItem(SESSION_HINT_KEY, "1");
  } else {
    window.localStorage.removeItem(SESSION_HINT_KEY);
  }
}

export const PUBLIC_SESSION_HINT_KEY = SESSION_HINT_KEY;
