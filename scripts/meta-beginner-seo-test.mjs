import fs from "node:fs";
import { META_BEGINNER_POSTS } from "../src/content/metaBeginnerBlogData.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expected = [
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

assert(META_BEGINNER_POSTS.length === expected.length, "Expected seven beginner Meta CAPI guides.");
assert(main.includes("ALL_BLOG_PATHS.has(normalizedPath)"), "Combined blog routes are missing from the router.");

for (const [keyword, path] of expected) {
  const post = META_BEGINNER_POSTS.find((item) => item.path === path);
  assert(post, `Missing beginner guide: ${path}`);
  assert(post.keywords.map((item) => item.toLowerCase()).includes(keyword), `Exact keyword contract is missing: ${keyword}`);
  assert(post.sections.length >= 3 && post.faq.length >= 4, `Guide content is incomplete: ${path}`);
  assert(home.includes(path), `Homepage guide hub is missing: ${path}`);
  assert(sitemap.includes(`<loc>https://simplecapi.com${path}</loc>`), `Sitemap missing: ${path}`);
}

console.log("Validated exact beginner Meta CAPI keywords, routes, homepage links, and sitemap entries.");
