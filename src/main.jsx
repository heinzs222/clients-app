import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import BlogIndex from "./components/BlogIndex.jsx";
import SeoPage, { SEO_PATHS } from "./components/SeoPages.jsx";
import "./styles.css";
import "./seo-pages.css";
import "./blog-index.css";
import "./mobile-navigation-fixes.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const content = normalizedPath === "/blogs"
  ? <BlogIndex />
  : SEO_PATHS.has(normalizedPath)
    ? <SeoPage path={normalizedPath} />
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
    </Suspense>
  </React.StrictMode>
);
