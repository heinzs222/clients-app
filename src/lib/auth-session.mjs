function validJwt(value) {
  if (typeof value !== "string") return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;
  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(window.atob(padded));
    return Boolean(payload && typeof payload === "object");
  } catch {
    return false;
  }
}

function cookieValue(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function expireCookie(name) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

export function clearMalformedAuthSession() {
  if (typeof window === "undefined") return false;
  let cleared = false;
  const stored = window.localStorage.getItem("gotrue.user");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!validJwt(parsed?.token?.access_token)) {
        window.localStorage.removeItem("gotrue.user");
        cleared = true;
      }
    } catch {
      window.localStorage.removeItem("gotrue.user");
      cleared = true;
    }
  }

  const jwt = cookieValue("nf_jwt");
  if (jwt && !validJwt(jwt)) {
    expireCookie("nf_jwt");
    expireCookie("nf_refresh");
    cleared = true;
  }

  return cleared;
}
