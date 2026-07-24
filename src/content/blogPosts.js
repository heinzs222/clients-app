import { GHL_BLOG_POSTS } from "./ghlBlogData.js";
import { META_BEGINNER_POSTS } from "./metaBeginnerBlogData.js";
import { META_DEFINITION_POSTS } from "./metaDefinitionBlogData.js";
import { MULTI_PLATFORM_POSTS } from "./multiPlatformBlogData.js";

export const ALL_BLOG_POSTS = [...MULTI_PLATFORM_POSTS, ...META_DEFINITION_POSTS, ...META_BEGINNER_POSTS, ...GHL_BLOG_POSTS];
export const ALL_BLOG_PATHS = new Set(ALL_BLOG_POSTS.map((post) => post.path));
export const ALL_BLOG_SUMMARIES = ALL_BLOG_POSTS.map(({ path, platform, category, title, description, icon, tags }) => ({
  href: path,
  platform,
  category,
  title,
  description,
  icon,
  tags: tags || []
}));

export function getBlogPost(path) {
  return ALL_BLOG_POSTS.find((post) => post.path === path) || ALL_BLOG_POSTS[0];
}
