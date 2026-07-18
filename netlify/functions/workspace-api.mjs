import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import workspaceHandler, { __testing } from "./create-client-capi.mjs";

const SECURITY_STORE = "simple-capi-security";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function ownerKey(user) {
  const identity = cleanString(user?.id) || cleanString(user?.email) || "local-development";
  return crypto.createHash("sha256").update(identity).digest("hex").slice(0, 12);
}

async function authenticatedUser(request) {
  return await getUser() || await __testing.identityUserFromBearer(request);
}

export async function disableAuthenticatorRequirement(user) {
  if (!user) return false;

  const store = getStore({ name: SECURITY_STORE, consistency: "strong" });
  const key = `accounts/${ownerKey(user)}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const state = current?.data || {};

    if (state.authenticator_verified_at && state.authenticator_requirement_disabled) {
      return false;
    }

    const next = {
      ...state,
      authenticator_verified_at: state.authenticator_verified_at || new Date().toISOString(),
      authenticator_requirement_disabled: true,
      pending_authenticator_secret: null,
      pending_authenticator_expires_at: null
    };

    const result = await store.setJSON(
      key,
      next,
      current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true }
    );

    if (result.modified) return true;
  }

  throw Object.assign(new Error("Account access could not be initialized."), { statusCode: 503 });
}

export default async function handler(request) {
  const user = await authenticatedUser(request);
  if (user) await disableAuthenticatorRequirement(user);
  return workspaceHandler(request);
}

export const config = {
  path: "/.netlify/functions/workspace-api",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
