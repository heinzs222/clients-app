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
const seoShellStyles = read("../src/seo-public-shell.css");
const main = read("../src/main.jsx");
const homeEnhancements = read("../src/lib/home-enhancements.js");
const fullLogoStyles = read("../src/full-logo.css");

assert(ui.includes('blogs: "/blogs"'), "Shared public navigation is missing the blogs route.");
assert(ui.includes('route === "blogs" ? "active"'), "Shared public header cannot mark Blogs as active.");
assert(ui.includes('const requiresPageLoad = route === "blogs"'), "Blog navigation is not marked as a full page route.");
assert(ui.includes('navigate && !requiresPageLoad'), "Blog links can still be intercepted by the product SPA router.");
assert(ui.includes('src="/capi-tracker-logo.png"'), "The shared brand is not using the full logo image.");
assert(ui.includes('alt="Simple CAPI"'), "The full logo image needs an accessible name.");
assert(!ui.includes('className="brandName"'), "The shared brand still renders separate text beside the logo image.");
assert(!ui.includes('src="/capi-tracker-mark.png"'), "The shared brand still uses the icon-only mark.");
assert(fullLogoStyles.includes(".brandLogo"), "Full logo sizing styles are missing.");

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
assert(seoShellStyles.includes(".seoHeader") && seoShellStyles.includes(".seoFooter") && seoShellStyles.includes("display: none !important"), "Legacy SEO chrome is not suppressed inside the shared shell.");

assert(homeEnhancements.includes('pageFooter.insertAdjacentElement("beforebegin", section)'), "Beginner guide section is not placed immediately before the homepage footer.");
assert(!homeEnhancements.includes('hero.insertAdjacentElement("afterend", section)'), "Beginner guide section is still placed below the hero.");
assert(homeEnhancements.includes("New to Meta CAPI?"), "Beginner guide section copy is missing.");

console.log("Validated full-image branding and one shared public header/footer across home, blogs, and SEO guides.");
