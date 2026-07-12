import assert from "node:assert/strict";
import { friendlyAuthError } from "../src/lib/auth-errors.mjs";

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

console.log("Authentication error messages passed.");
