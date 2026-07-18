import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = process.cwd();
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const workspaceRewrite = vercel.rewrites.find((rule) => rule.source === "/api/workspace");
const wrapperSource = fs.readFileSync(path.join(root, "netlify/functions/workspace-api.mjs"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.js"), "utf8");

assert(workspaceRewrite, "The workspace API rewrite is missing.");
assert(
  workspaceRewrite.destination.endsWith("/.netlify/functions/workspace-api"),
  "The public workspace route still points to the authenticator-gated function."
);
assert(
  wrapperSource.includes("authenticator_requirement_disabled: true") &&
    wrapperSource.includes("authenticator_verified_at"),
  "The workspace wrapper does not disable the obsolete authenticator requirement."
);
assert(
  apiSource.includes('if (action === "security-status")') &&
    apiSource.includes("required: false") &&
    apiSource.includes("complete: true"),
  "The frontend security status still requires an authenticator."
);

console.log("Authenticator requirement is disabled in the public workspace flow.");
