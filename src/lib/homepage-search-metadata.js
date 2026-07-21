const HOME_TITLE = "See Which Ads Bring Leads | First Script Free | Simple CAPI";
const HOME_DESCRIPTION = "Track leads and bookings from Meta, Google Ads, and TikTok without complicated setup. Create your first protected tracking script for free.";

function isHomepage() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const view = new URLSearchParams(window.location.search).get("view");
  return path === "/" && (!view || view === "home");
}

function setMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element && element.getAttribute(attribute) !== value) {
    element.setAttribute(attribute, value);
  }
}

function applyHomepageSearchMetadata() {
  if (!isHomepage()) return;

  if (document.title !== HOME_TITLE) document.title = HOME_TITLE;
  setMeta('meta[name="description"]', "content", HOME_DESCRIPTION);
  setMeta('meta[property="og:title"]', "content", HOME_TITLE);
  setMeta('meta[property="og:description"]', "content", HOME_DESCRIPTION);
  setMeta('meta[name="twitter:title"]', "content", HOME_TITLE);
  setMeta('meta[name="twitter:description"]', "content", HOME_DESCRIPTION);
}

let scheduled = false;
function scheduleHomepageMetadata() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyHomepageSearchMetadata();
  });
}

applyHomepageSearchMetadata();

if (document.head) {
  new MutationObserver(scheduleHomepageMetadata).observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["content"]
  });
}

window.addEventListener("popstate", scheduleHomepageMetadata);