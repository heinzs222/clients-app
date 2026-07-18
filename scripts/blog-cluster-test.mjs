import fs from "node:fs";
import { GHL_BLOG_POSTS } from "../src/content/ghlBlogData.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

assert(GHL_BLOG_POSTS.length >= 10, "Expected at least ten GoHighLevel Meta CAPI articles.");
assert(new Set(GHL_BLOG_POSTS.map((post) => post.path)).size === GHL_BLOG_POSTS.length, "Blog paths must be unique.");
assert(new Set(GHL_BLOG_POSTS.map((post) => post.title)).size === GHL_BLOG_POSTS.length, "Blog titles must be unique.");
assert(main.includes("ALL_BLOG_PATHS.has(normalizedPath)"), "Main router does not include the combined blog routes.");

for (const post of GHL_BLOG_POSTS) {
  assert(post.path.startsWith("/gohighlevel-"), `Unexpected article path: ${post.path}`);
  assert(post.title.length >= 35 && post.title.length <= 80, `Title length needs review: ${post.path}`);
  assert(post.description.length >= 110 && post.description.length <= 180, `Meta description length needs review: ${post.path}`);
  assert(post.sections.length >= 3, `Article needs at least three sections: ${post.path}`);
  assert(post.faq.length >= 4, `Article needs at least four FAQs: ${post.path}`);
  assert(post.related.length >= 3, `Article needs at least three internal links: ${post.path}`);
  assert(post.sources.length >= 2, `Article needs official references: ${post.path}`);
  assert(sitemap.includes(`<loc>https://simplecapi.com${post.path}</loc>`), `Sitemap missing: ${post.path}`);
}

console.log(`Validated ${GHL_BLOG_POSTS.length} GoHighLevel Meta CAPI articles.`);
