import assert from "node:assert/strict";
import { friendlyAuthError, isOAuthRedirectSignal } from "../src/lib/auth-errors.mjs";
import { capiRequest, sessionAccessToken } from "../src/lib/api.js";

assert.equal(
  friendlyAuthError({ message: "invalid_grant" }),
  "Please confirm your email before logging in. Check your inbox for the secure confirmation link."
);
assert.equal(
  friendlyAuthError({ error_description: "Invalid login credentials" }),
  "Email or password is incorrect."
);
assert.equal(
  friendlyAuthError({ message: "Signup is disabled" }),
  "Account registration is currently closed."
);
assert.equal(
  friendlyAuthError(null),
  "Authentication failed. Please try again."
);
assert.equal(isOAuthRedirectSignal({ message: "Redirecting to OAuth provider" }), true);
assert.equal(isOAuthRedirectSignal({ message: "Google provider is unavailable" }), false);

const testJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdXRoLWhhbmRvZmYtdGVzdCJ9.signature";
assert.equal(sessionAccessToken(`other=value; nf_jwt=${encodeURIComponent(testJwt)}; theme=light`), testJwt);
assert.equal(sessionAccessToken("nf_jwt=malformed"), "");

const originalDocument = globalThis.document;
const originalFetch = globalThis.fetch;
let authorization = "";
globalThis.document = { cookie: `nf_jwt=${encodeURIComponent(testJwt)}` };
globalThis.fetch = async (_url, options) => {
  authorization = options.headers.get("Authorization") || "";
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  await capiRequest("list");
  assert.equal(authorization, `Bearer ${testJwt}`);
} finally {
  globalThis.document = originalDocument;
  globalThis.fetch = originalFetch;
}

console.log("Authentication error messages and API session handoff passed.");
