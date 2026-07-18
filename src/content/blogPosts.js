import { GHL_BLOG_POSTS } from "./ghlBlogData.js";
import { META_BEGINNER_POSTS } from "./metaBeginnerBlogData.js";

export const ALL_BLOG_POSTS = [...META_BEGINNER_POSTS, ...GHL_BLOG_POSTS];
export const ALL_BLOG_PATHS = new Set(ALL_BLOG_POSTS.map((post) => post.path));
export const ALL_BLOG_SUMMARIES = ALL_BLOG_POSTS.map(({ path, category, title, description, icon }) => ({
  href: path,
  category,
  title,
  description,
  icon
}));

export function getBlogPost(path) {
  return ALL_BLOG_POSTS.find((post) => post.path === path) || ALL_BLOG_POSTS[0];
}
