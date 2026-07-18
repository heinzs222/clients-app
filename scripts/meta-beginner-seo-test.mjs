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
const home = fs.readFileSync(new URL("../src/lib/home-enhancements.js", import.meta.url), "utf8").toLowerCase();
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8").toLowerCase();

assert(META_BEGINNER_POSTS.length === expected.length, "Expected seven beginner Meta CAPI guides.");
assert(new Set(META_BEGINNER_POSTS.map((post) => post.path)).size === META_BEGINNER_POSTS.length, "Beginner paths must be unique.");
assert(new Set(META_BEGINNER_POSTS.map((post) => post.title)).size === META_BEGINNER_POSTS.length, "Beginner titles must be unique.");
assert(main.includes("ALL_BLOG_PATHS.has(normalizedPath)"), "Combined blog routes are missing from the router.");
assert(index.includes("meta capi") && index.includes("gohighlevel"), "Homepage metadata must describe Meta CAPI and GoHighLevel.");

for (const [keyword, path] of expected) {
  const post = META_BEGINNER_POSTS.find((item) => item.path === path);
  assert(post, `Missing beginner guide: ${path}`);

  const searchable = JSON.stringify(post).toLowerCase();
  assert(searchable.includes(keyword), `Exact search phrase is missing from ${path}: ${keyword}`);
  assert(home.includes(path), `Homepage guide hub is missing its link: ${path}`);
  assert(home.includes(post.title.toLowerCase().replace(/:.*$/, "")) || home.includes(post.h1.toLowerCase()), `Homepage guide hub is missing its visible title: ${path}`);
  assert(post.description && post.description.length >= 100, `Meta description is too thin: ${path}`);
  assert(post.sections.length >= 3, `Guide needs at least three sections: ${path}`);
  assert(post.faq.length >= 4, `Guide needs at least four FAQs: ${path}`);
  assert(post.related.length >= 3, `Guide needs internal links: ${path}`);
  assert(post.sources.length >= 2, `Guide needs official references: ${path}`);
  assert(sitemap.includes(`<loc>https://simplecapi.com${path}</loc>`), `Sitemap missing: ${path}`);
}

console.log(`Validated ${META_BEGINNER_POSTS.length} beginner Meta CAPI search guides and homepage links.`);
