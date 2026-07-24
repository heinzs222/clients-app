import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ui = read("../src/components/UI.jsx");
const blogIndex = read("../src/components/BlogIndex.jsx");
const blogArticle = read("../src/components/GhlBlogPage.jsx");
const seoShell = read("../src/components/SeoPublicShell.jsx");
const seoPages = read("../src/components/SeoPages.jsx");
const main = read("../src/main.jsx");
const index = read("../index.html");
const homepageMetadata = read("../src/lib/homepage-search-metadata.js");
const homeEnhancements = read("../src/lib/home-enhancements.js");
const publicPages = read("../src/components/PublicPages.jsx");
const boundaryStyles = read("../src/client-boundaries-visual.css");
const boundaryIllustration = read("../public/client-workspace-boundaries.svg");

assert(ui.includes('blogs: "/blogs"'), "Shared public navigation is missing the blogs route.");
assert(ui.includes('services: "/meta-capi-setup-service"'), "Shared public navigation is missing the setup service route.");
assert(ui.includes('tiktok: "/how-to-set-up-tiktok-events-api"'), "Shared public navigation is missing the TikTok route.");
assert(ui.includes('google: "/how-to-set-up-google-ads-enhanced-conversions"'), "Shared public navigation is missing the Google Ads route.");
assert(ui.includes('route === "blogs" ? "active"'), "Shared public header cannot mark Blogs as active.");
assert(ui.includes('"meta", "tiktok", "google"'), "Platform content routes are not marked as full page loads.");
assert(ui.includes('navigate && !requiresPageLoad'), "Public page links can still be intercepted by the product SPA router.");
assert(ui.includes('src="/capi-tracker-mark.png"'), "The shared brand is missing the Simple CAPI mark.");
assert(ui.includes('className="brandName">Simple CAPI</span>'), "The shared brand is missing its visible name.");
assert(ui.includes('src="/capi-tracker-header.png"'), "The public header is missing the supplied header image.");
assert(ui.includes("<Brand compact headerArtwork />"), "The supplied artwork is not assigned to the public header.");
assert(!publicPages.includes('src="/capi-tracker-header.png"'), "The supplied header image is still rendered inside the homepage hero.");
assert(index.includes('content="https://simplecapi.com/capi-tracker-header.png"'), "Social metadata is missing the supplied header image.");

for (const [name, source] of [["blog index", blogIndex], ["blog article", blogArticle]]) {
  assert(source.includes('import { PublicFooter, PublicHeader } from "./UI.jsx";'), `${name} does not import the homepage header and footer.`);
  assert(source.includes('<PublicHeader route="blogs" />'), `${name} does not render the shared homepage header.`);
  assert(source.includes('<PublicFooter />'), `${name} does not render the shared homepage footer.`);
  assert(!source.includes('className="blogHeader"'), `${name} still contains a custom blog header.`);
  assert(!source.includes('className="blogFooter"'), `${name} still contains a custom blog footer.`);
}

assert(seoShell.includes('import { PublicFooter, PublicHeader } from "./UI.jsx";'), "SEO guides do not import the shared homepage layout.");
assert(seoShell.includes('<PublicHeader route="blogs" />'), "SEO guides do not render the shared homepage header.");
assert(seoShell.includes('<PublicFooter />'), "SEO guides do not render the shared homepage footer.");
assert(main.includes('<SeoPublicShell path={normalizedPath} />'), "SEO routes bypass the shared public shell.");
assert(!main.includes('<SeoPage path={normalizedPath} />'), "SEO routes still render their legacy page chrome directly.");
assert(!seoPages.includes("function SiteHeader") && !seoPages.includes("function PageFooter"), "SEO pages still contain duplicate public chrome.");
assert(!seoPages.includes('href="/login"') && !seoPages.includes('href="/register">Start free'), "SEO pages still contain hardcoded account actions.");

const expectedHomeTitle = "Easy Meta CAPI, TikTok and Google Ads Tracking | Simple CAPI";
const expectedHomeDescription = "Easy Meta CAPI setup plus TikTok Events API and Google enhanced conversions. Create one protected Lead or Schedule script and install it in minutes.";
assert(index.includes(`<title>${expectedHomeTitle}</title>`), "Static homepage title does not identify the three tracking platforms.");
assert(index.includes(`name="description" content="${expectedHomeDescription}"`), "Static homepage description is inconsistent.");
assert(main.includes('import "./lib/homepage-search-metadata.js";'), "Homepage metadata protection is not loaded.");
assert(homepageMetadata.includes(expectedHomeTitle) && homepageMetadata.includes(expectedHomeDescription), "Rendered homepage metadata does not match the static HTML.");
assert(homepageMetadata.includes("MutationObserver") && homepageMetadata.includes("isHomepage"), "The React title overwrite is not guarded on the homepage.");

assert(homeEnhancements.includes('pageFooter.insertAdjacentElement("beforebegin", section)'), "Beginner guide section is not placed immediately before the homepage footer.");
assert(!homeEnhancements.includes('hero.insertAdjacentElement("afterend", section)'), "Beginner guide section is still placed below the hero.");
assert(homeEnhancements.includes("Meta, TikTok and Google guides"), "Multi-platform guide section copy is missing.");
assert(homeEnhancements.includes('image.src = "/client-workspace-boundaries.svg"'), "Client boundaries illustration is not added below the homepage principle heading.");
assert(homeEnhancements.includes('image.alt = "Four separate client setups connected to one protected Simple CAPI workspace."'), "Client boundaries illustration needs useful alternative text.");
assert(main.includes('import "./client-boundaries-visual.css";'), "Client boundaries illustration styles are not loaded.");
assert(boundaryStyles.includes(".clientBoundaryFigure"), "Client boundaries illustration sizing is missing.");
assert(boundaryIllustration.includes("CLIENT DATA STAYS SEPARATE"), "Client boundaries illustration does not communicate the section message.");

console.log("Validated shared public layout, free-first-script homepage metadata, provider navigation, and the client boundaries illustration.");
