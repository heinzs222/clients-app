import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function brandedIdentityEndpoint() {
  return {
    name: "branded-identity-endpoint",
    enforce: "pre",
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, "/");
      if (!normalizedId.includes("/@netlify/identity/dist/main.js")) return null;

      const pathMarker = 'var IDENTITY_PATH = "/.netlify/identity";';
      if (!code.includes(pathMarker)) throw new Error("Identity endpoint marker changed; update the branded endpoint transform.");

      const transformed = code
        .replace(pathMarker, `var IDENTITY_PATH = "/api/auth";
var browserIdentityUrl = () => ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname.toLowerCase())
  ? "https://simplecapi.com" + IDENTITY_PATH
  : window.location.origin + IDENTITY_PATH;`)
        .replaceAll('`${window.location.origin}${IDENTITY_PATH}`', "browserIdentityUrl()");

      return { code: transformed, map: null };
    }
  };
}

export default defineConfig({
  plugins: [brandedIdentityEndpoint(), react()],
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@netlify/identity")) return "identity";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react")) return "react";
          return "vendor";
        }
      }
    }
  }
});
