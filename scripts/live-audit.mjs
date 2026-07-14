import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.APP_URL || "https://simplecapi.com").replace(/\/$/, "");
const executablePath = process.env.CHROME_PATH || [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
].find((candidate) => fs.existsSync(candidate));

if (!executablePath) throw new Error("Chrome was not found. Set CHROME_PATH before running the live audit.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
const results = [];

try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`${viewport.name} pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${viewport.name} console: ${message.text()}`);
    });
    page.on("requestfailed", (request) => {
      errors.push(`${viewport.name} request: ${request.url()} (${request.failure()?.errorText || "failed"})`);
    });

    const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `${viewport.name} homepage did not return 200.`);
    assert((response.headers()["strict-transport-security"] || "").includes("includeSubDomains"), `${viewport.name} HSTS is missing.`);
    assert((response.headers()["content-security-policy"] || "").includes("upgrade-insecure-requests"), `${viewport.name} Content Security Policy is incomplete.`);
    await page.locator("h1").waitFor({ state: "visible" });

    const pageState = await page.evaluate(() => {
      const logo = document.querySelector('img[src="/capi-tracker-mark.png"]');
      const canonical = document.querySelector('link[rel="canonical"]');
      return {
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() || "",
        logoReady: Boolean(logo?.complete && logo.naturalWidth > 0),
        canonical: canonical?.href || "",
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        chromeCount: document.querySelectorAll(".publicHeader, .publicFooter").length,
        interactiveCount: document.querySelectorAll("a, button").length,
        internalLinks: Array.from(document.querySelectorAll('a[href^="/"]')).map((anchor) => anchor.getAttribute("href")),
        insecureUrls: Array.from(document.querySelectorAll("a[href], script[src], img[src], link[href], form[action]"))
          .map((node) => node.href || node.src || node.action || "")
          .filter((value) => value.startsWith("http://"))
      };
    });

    assert(pageState.title.includes("Simple CAPI"), `${viewport.name} title is incorrect.`);
    assert(pageState.h1 === "Launch reliable Meta tracking in minutes.", `${viewport.name} H1 is incorrect.`);
    assert(pageState.chromeCount === 2, `${viewport.name} public navigation is incomplete.`);
    assert(pageState.interactiveCount > 0, `${viewport.name} public calls to action are missing.`);
    assert(pageState.internalLinks.includes("/login"), `${viewport.name} login link is missing.`);
    assert(pageState.logoReady, `${viewport.name} brand logo did not load.`);
    assert(pageState.canonical === `${baseUrl}/`, `${viewport.name} canonical URL is incorrect.`);
    assert(pageState.insecureUrls.length === 0, `${viewport.name} contains insecure public URLs: ${pageState.insecureUrls.join(", ")}`);
    assert(pageState.horizontalOverflow <= 1, `${viewport.name} layout has horizontal overflow.`);

    await page.screenshot({
      path: path.join(os.tmpdir(), `capi-tracker-${viewport.name}-live.png`),
      fullPage: true
    });
    results.push({ viewport: viewport.name, ...pageState });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`routes pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`routes console: ${message.text()}`);
  });

  for (const route of ["emq-guide", "docs", "privacy", "terms", "status", "login", "register", "forgot-password", "reset-password"]) {
    const response = await page.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `/${route} did not return 200.`);
    assert(page.url() === `${baseUrl}/${route}`, `/${route} did not remain on its public route.`);
    assert((await page.title()).includes("Simple CAPI"), `/${route} has an incorrect title.`);
  }

  await page.goto(`${baseUrl}/emq-guide`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "The 9.3 EMQ Setup Guide" }).isVisible(), "The public 9.3 EMQ guide is unavailable.");
  assert(await page.getByRole("button", { name: /Create your account/ }).isVisible(), "The guide is missing its product action.");

  await page.goto(`${baseUrl}/?view=login`, { waitUntil: "networkidle" });
  assert(page.url() === `${baseUrl}/login`, "The login route was not normalized to its canonical path.");
  assert(await page.getByText("Preview the local workspace").count() === 0, "The localhost preview control is exposed in production.");

  const legacyAlias = await context.request.get("https://capi-tracker.vercel.app/docs");
  assert(legacyAlias.url() === `${baseUrl}/docs`, "The legacy alias does not preserve the canonical route.");

  await page.goto("https://capi-tracker-service.netlify.app/#simple-capi-domain-check", { waitUntil: "networkidle" });
  const brandedRedirect = new URL(page.url());
  assert(`${brandedRedirect.origin}${brandedRedirect.pathname}` === `${baseUrl}/`, "The backend project does not redirect to the branded domain.");

  const status = await context.request.get(`${baseUrl}/api/workspace?action=status`);
  assert(status.ok(), "The provisioner status proxy is unavailable.");
  const statusBody = await status.json();
  assert(statusBody.ready === true, "The production provisioner is not ready.");
  assert(statusBody.billing?.required === true, "Production payment enforcement is disabled.");
  assert(statusBody.billing?.configured === true, "Production billing is not configured.");
  assert(statusBody.billing?.mode === "live", "Production billing is not in live mode.");
  assert(statusBody.billing?.price_cents === 500 && statusBody.billing?.currency === "USD", "Production billing price is not $5.00 USD.");

  const retiredWorkspaceRoute = await context.request.get(`${baseUrl}/api/provisioner?action=status`);
  assert(!(retiredWorkspaceRoute.headers()["content-type"] || "").includes("application/json"), "The retired management route remains exposed.");

  const identity = await context.request.get(`${baseUrl}/api/auth/settings`);
  assert(identity.ok(), "The Identity proxy is unavailable.");
  const identityBody = await identity.json();
  assert(identityBody.external?.email === true, "Email authentication is not enabled.");
  assert(identityBody.disable_signup === false, "Public account registration is not enabled.");

  const retiredIdentityRoute = await context.request.get(`${baseUrl}/.netlify/identity/settings`);
  assert(!(retiredIdentityRoute.headers()["content-type"] || "").includes("application/json"), "The retired infrastructure auth route remains exposed.");

  const protectedRequest = await context.request.post(
    `${baseUrl}/api/workspace?action=checkout`,
    { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: {} }
  );
  assert(protectedRequest.status() === 401, "An unauthenticated provisioning request was not rejected.");
  await context.close();

  assert(errors.length === 0, `Live browser errors:\n${errors.join("\n")}`);
  console.log(`Live audit passed: ${baseUrl}, public product routes, confirmed-email registration, protected API, and CSP.`);
} finally {
  await browser.close();
}
