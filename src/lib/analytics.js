const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
let initialized = false;
let lastPage = "";

function enabled() {
  return /^G-[A-Z0-9]{6,20}$/i.test(MEASUREMENT_ID);
}

function currentPage() {
  return `${window.location.pathname}${window.location.search}`;
}

export function trackEvent(name, parameters = {}) {
  if (!enabled() || typeof window.gtag !== "function") return;
  window.gtag("event", name, parameters);
}

function trackPageView() {
  const page = currentPage();
  if (page === lastPage) return;
  lastPage = page;
  trackEvent("page_view", {
    page_location: window.location.href,
    page_path: page,
    page_title: document.title
  });
}

function installHistoryTracking() {
  for (const method of ["pushState", "replaceState"]) {
    const original = window.history[method];
    window.history[method] = function(...args) {
      const result = original.apply(this, args);
      window.setTimeout(trackPageView, 0);
      return result;
    };
  }
  window.addEventListener("popstate", () => window.setTimeout(trackPageView, 0));
}

function installClickTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target?.closest?.("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    let targetHost = "";
    let outbound = false;
    try {
      const url = new URL(link.href, window.location.href);
      targetHost = url.hostname;
      outbound = url.origin !== window.location.origin;
    } catch {}
    trackEvent("link_click", {
      link_url: href.slice(0, 300),
      link_text: String(link.textContent || "").trim().slice(0, 120),
      link_domain: targetHost,
      outbound
    });
  }, true);
}

export function initializeAnalytics() {
  if (initialized || !enabled() || typeof document === "undefined") return false;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.appendChild(script);

  installHistoryTracking();
  installClickTracking();
  trackPageView();
  return true;
}

export const __testing = { enabled };
