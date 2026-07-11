import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={(
      <div className="bootScreen" role="status" aria-live="polite">
        <div className="routeLoaderMark" aria-hidden="true" />
        <span className="bootLine"><i /> Loading workspace</span>
      </div>
    )}>
      <App />
    </Suspense>
  </React.StrictMode>
);
