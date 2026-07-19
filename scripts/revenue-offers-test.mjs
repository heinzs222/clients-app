import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const page = read("../src/components/ServicesPage.jsx");
const pageStyles = read("../src/services-page.css");
const offers = read("../src/lib/revenue-offers.js");
const offerStyles = read("../src/revenue-offers.css");
const functionSource = read("../netlify/functions/service-lead.mjs");
const main = read("../src/main.jsx");
const ui = read("../src/components/UI.jsx");
const vercel = read("../vercel.json");
const sitemap = read("../public/sitemap.xml");

assert(page.includes("$249 one time"), "Done-for-you setup price is missing.");
assert(page.includes("From $499"), "Agency rollout price is missing.");
assert(page.includes('fetch("/api/service-lead"'), "Setup request form does not submit to the sales endpoint.");
assert(page.includes('<PublicHeader route="services" />') && page.includes("<PublicFooter />"), "Setup service page does not use the shared public layout.");
assert(pageStyles.includes(".servicePlanGrid") && pageStyles.includes(".serviceLeadForm"), "Setup service page styles are incomplete.");

assert(offers.includes("First eligible script free"), "Homepage self-serve offer is missing.");
assert(offers.includes("$249 one time"), "Homepage done-for-you offer is missing.");
assert(offers.includes("From $499"), "Homepage agency offer is missing.");
assert(offers.includes('document.querySelector(".beginnerGuideBand") || footer'), "Revenue offers are not positioned before the beginner guides and footer.");
assert(offerStyles.includes(".revenueCardGrid") && offerStyles.includes(".revenueCard.featured"), "Homepage revenue offer styles are incomplete.");

assert(functionSource.includes("simple-capi-sales-leads"), "Sales leads are not persisted.");
assert(functionSource.includes("RESEND_API_KEY") && functionSource.includes("CAPI_ADMIN_EMAIL") && functionSource.includes("CAPI_FROM_EMAIL"), "Sales notifications are not connected to Resend configuration.");
assert(functionSource.includes("windowLimit: 10") && functionSource.includes("website_url"), "Sales endpoint spam controls are missing.");
assert(functionSource.includes("New Simple CAPI lead"), "Admin sales notification is missing.");
assert(functionSource.includes("Simple CAPI received your setup request"), "Buyer confirmation email is missing.");

assert(main.includes('normalizedPath === "/meta-capi-setup-service"'), "Setup service route is not registered.");
assert(main.includes('import "./lib/revenue-offers.js";'), "Homepage revenue offers are not loaded.");
assert(ui.includes('services: "/meta-capi-setup-service"'), "Shared navigation does not link to the setup service.");
assert(vercel.includes('"source": "/api/service-lead"'), "Vercel does not proxy setup requests to the backend.");
assert(sitemap.includes("https://simplecapi.com/meta-capi-setup-service"), "Setup service page is missing from the sitemap.");

console.log("Validated the self-serve, done-for-you, and agency revenue paths.");
