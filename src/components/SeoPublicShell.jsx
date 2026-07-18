import React from "react";
import SeoPage from "./SeoPages.jsx";
import { PublicFooter, PublicHeader } from "./UI.jsx";

export default function SeoPublicShell({ path }) {
  return (
    <div className="publicPage seoPublicShell">
      <PublicHeader route="blogs" />
      <div className="seoPublicContent">
        <SeoPage path={path} />
      </div>
      <PublicFooter />
    </div>
  );
}
