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
const homeEnhancements = read("../src/lib/home-enhancements.js");

assert(ui.includes('blogs: "/blogs"'), "Shared public navigation is missing the blogs route.");
assert(ui.includes('route === "blogs" ? "active"'), "Shared public header cannot mark Blogs as active.");
assert(ui.includes('onClick={navigate ?'), "Shared route links must support normal links when no SPA navigator is provided.");

for (const [name, source] of [["blog index", blogIndex], ["blog article", blogArticle]]) {
  assert(source.includes('import { PublicFooter, PublicHeader } from "./UI.jsx";'), `${name} does not import the homepage header and footer.`);
  assert(source.includes('<PublicHeader route="blogs" />'), `${name} does not render the shared homepage header.`);
  assert(source.includes('<PublicFooter />'), `${name} does not render the shared homepage footer.`);
  assert(!source.includes('className="blogHeader"'), `${name} still contains a custom blog header.`);
  assert(!source.includes('className="blogFooter"'), `${name} still contains a custom blog footer.`);
}

assert(homeEnhancements.includes('pageFooter.insertAdjacentElement("beforebegin", section)'), "Beginner guide section is not placed immediately before the homepage footer.");
assert(!homeEnhancements.includes('hero.insertAdjacentElement("afterend", section)'), "Beginner guide section is still placed below the hero.");
assert(homeEnhancements.includes("New to Meta CAPI?"), "Beginner guide section copy is missing.");

console.log("Validated shared public header/footer and homepage beginner-section placement.");
