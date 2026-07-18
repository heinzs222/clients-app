import fs from "node:fs";
import { ALL_BLOG_POSTS } from "../src/content/blogPosts.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expected = [
  ["what is meta capi", "/what-is-meta-capi"],
  ["what is meta capi gateway", "/what-is-meta-capi"],
  ["what does meta capi do", "/what-is-meta-capi"],
  ["what is capi meta ads", "/what-is-meta-capi"],
  ["what does meta capi stand for", "/what-is-meta-capi"],
  ["how does meta capi work", "/how-does-meta-capi-work"],
  ["how to setup meta capi", "/how-to-set-up-meta-capi"],
  ["how to install meta capi", "/how-to-install-meta-capi"],
  ["how to implement meta capi", "/how-to-implement-meta-capi"],
  ["how to use meta capi", "/how-to-use-meta-capi"],
  ["how to test meta capi", "/how-to-test-meta-capi"],
  ["how to get meta capi access token", "/how-to-get-meta-capi-access-token"]
];

const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../src/lib/home-enhancements.js", import.meta.url), "utf8");

assert(main.includes("ALL_BLOG_PATHS.has(normalizedPath)"), "Combined blog routes are missing from the router.");

for (const [keyword, path] of expected) {
  const post = ALL_BLOG_POSTS.find((item) => item.path === path);
  assert(post, `Missing beginner guide: ${path}`);
  assert(post.keywords.map((item) => item.toLowerCase()).includes(keyword), `Exact keyword contract is missing: ${keyword}`);
  assert(post.sections.length >= 3 && post.faq.length >= 4, `Guide content is incomplete: ${path}`);
  assert(home.includes(path), `Homepage guide hub is missing: ${path}`);
  assert(sitemap.includes(`<loc>https://simplecapi.com${path}</loc>`), `Sitemap missing: ${path}`);
}

const definition = ALL_BLOG_POSTS.find((post) => post.path === "/what-is-meta-capi");
assert(definition.quickAnswerTitle === "What Meta CAPI is", "Definition guide needs a definition-specific quick-answer heading.");
assert(definition.sections.some((section) => section.id === "gateway"), "Definition guide is missing the gateway explanation.");

console.log("Validated What and How Meta CAPI keywords, routes, homepage links, and sitemap entries.");
