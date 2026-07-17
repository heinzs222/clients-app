import { __testing as binding } from "../netlify/functions/script-binding.mjs";
import { __testing as gateway } from "../netlify/functions/client-gateway.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  binding.canonicalPageUrl("https://Example.com/form/?utm_source=meta#top") === "https://example.com/form",
  "Page URLs are not normalized consistently."
);
assert(binding.exactFormSelector("#estimate-form", "Lead") === "#estimate-form", "Exact form selector was rejected.");
assert(binding.exactFormSelector("", "Schedule") === "", "Schedule should not require a form selector.");

let broadSelectorRejected = false;
try { binding.exactFormSelector("form", "Lead"); } catch { broadSelectorRejected = true; }
assert(broadSelectorRejected, "A selector matching every form was accepted.");

const saved = {
  allowed_page_url: "https://example.com/form",
  allowed_origin: "https://example.com",
  form_selector: "#estimate-form",
  event_name: "Lead"
};
const allowedRequest = new Request("https://simplecapi.com/client/example/events", {
  method: "POST",
  headers: { Origin: "https://example.com" }
});
assert(gateway.eventAllowed(allowedRequest, saved, { pageUrl: "https://example.com/form?fbclid=test", eventName: "Lead" }), "The saved page was rejected.");
assert(!gateway.eventAllowed(allowedRequest, saved, { pageUrl: "https://example.com/another-form", eventName: "Lead" }), "A different page was accepted.");
assert(!gateway.eventAllowed(new Request("https://simplecapi.com/client/example/events", { method: "POST", headers: { Origin: "https://copied.example" } }), saved, { pageUrl: "https://example.com/form", eventName: "Lead" }), "A copied script origin was accepted.");

const lockedLoader = gateway.lockTrackerConfiguration("window.__UPSTREAM__=true;", saved);
assert(lockedLoader.includes("#estimate-form"), "The saved form selector was not forced into the tracker loader.");
assert(lockedLoader.includes("data-event-name"), "The saved event type was not forced into the tracker loader.");

console.log("Page and form binding tests passed.");
