import fs from "node:fs";
import assert from "node:assert/strict";
import { ALL_BLOG_POSTS } from "../src/content/blogPosts.js";

const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../src/components/PublicPages.jsx", import.meta.url), "utf8");
const navigation = fs.readFileSync(new URL("../src/components/UI.jsx", import.meta.url), "utf8");

const expected = [
  ["/what-is-tiktok-events-api", "what is tiktok events api"],
  ["/how-does-tiktok-events-api-work", "how does tiktok events api work"],
  ["/how-to-set-up-tiktok-events-api", "how to set up tiktok events api"],
  ["/what-are-google-ads-enhanced-conversions", "what are google ads enhanced conversions"],
  ["/how-do-google-ads-enhanced-conversions-work", "how do google enhanced conversions work"],
  ["/how-to-set-up-google-ads-enhanced-conversions", "how to set up google ads enhanced conversions"]
];

for (const [path, query] of expected) {
  const post = ALL_BLOG_POSTS.find((item) => item.path === path);
  assert(post, `Missing multi-platform article: ${path}`);
  assert(post.keywords.some((keyword) => keyword.toLowerCase().includes(query)), `${path} is missing the target query.`);
  assert(post.tags?.length >= 3, `${path} needs visible topic tags.`);
  assert(post.sections.length >= 3, `${path} needs a complete what/how/setup answer.`);
  assert(post.faq.length >= 4, `${path} needs search-focused FAQs.`);
  assert(post.sources.length >= 3, `${path} needs official references.`);
  assert(sitemap.includes(`<loc>https://simplecapi.com${path}</loc>`), `Sitemap missing: ${path}`);
}

for (const copy of [
  "Easy Meta CAPI setup",
  "TikTok Pixel + Events API",
  "Google enhanced conversions",
  "25+",
  "client implementations",
  "9.3+ Meta Event Match Quality"
]) {
  assert(home.includes(copy), `Homepage is missing platform/result copy: ${copy}`);
}

assert(navigation.includes(">Meta CAPI</RouteLink>"), "Public navigation is missing Meta.");
assert(navigation.includes(">TikTok</RouteLink>"), "Public navigation is missing TikTok.");
assert(navigation.includes(">Google Ads</RouteLink>"), "Public navigation is missing Google Ads.");

console.log("Validated TikTok and Google what/how/setup clusters, tags, sitemap entries, navigation, and 9.3+ proof.");
