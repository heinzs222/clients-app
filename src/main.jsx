import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import BlogIndex from "./components/BlogIndex.jsx";
import GhlBlogPage from "./components/GhlBlogPage.jsx";
import PlatformsPage from "./components/PlatformsPage.jsx";
import SeoPublicShell from "./components/SeoPublicShell.jsx";
import ServicesPage from "./components/ServicesPage.jsx";
import { SEO_PATHS } from "./components/SeoPages.jsx";
import { ALL_BLOG_PATHS } from "./content/blogPosts.js";
import { initializeAnalytics } from "./lib/analytics.js";
import "./styles.css";
import "./full-logo.css";
import "./home-beginner-seo.css";
import "./client-boundaries-visual.css";
import "./revenue-offers.css";
import "./services-page.css";
import "./platforms-page.css";
import "./provider-navigation.css";
import "./seo-pages.css";
import "./seo-public-shell.css";
import "./blog-index.css";
import "./ghl-blog-pages.css";
import "./mobile-navigation-fixes.css";
import "./lib/public-copy.js";
import "./lib/home-enhancements.js";
import "./lib/revenue-offers.js";
import "./lib/provider-navigation.js";
import "./lib/homepage-search-metadata.js";

initializeAnalytics();

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const content = normalizedPath === "/platforms"
  ? <PlatformsPage />
  : normalizedPath === "/meta-capi-setup-service"
    ? <ServicesPage />
    : normalizedPath === "/blogs"
      ? <BlogIndex />
      : ALL_BLOG_PATHS.has(normalizedPath)
        ? <GhlBlogPage path={normalizedPath} />
        : SEO_PATHS.has(normalizedPath)
          ? <SeoPublicShell path={normalizedPath} />
          : <App />;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={(
      <div className="bootScreen" role="status" aria-live="polite">
        <div className="routeLoaderMark" aria-hidden="true" />
        <span className="bootLine"><i /> Loading Simple CAPI</span>
      </div>
    )}>
      {content}
      <Analytics />
    </Suspense>
  </React.StrictMode>
);
