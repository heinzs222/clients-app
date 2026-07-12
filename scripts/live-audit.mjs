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
        internalLinks: Array.from(document.querySelectorAll('a[href^="/"]')).map((anchor) => anchor.getAttribute("href"))
      };
    });

    assert(pageState.title.includes("Simple CAPI"), `${viewport.name} title is incorrect.`);
    assert(pageState.h1 === "Simple CAPI", `${viewport.name} H1 is incorrect.`);
    assert(pageState.chromeCount === 0, `${viewport.name} public navigation is exposed.`);
    assert(pageState.interactiveCount === 0, `${viewport.name} coming-soon page exposes interactive links.`);
    assert(pageState.internalLinks.length === 0, `${viewport.name} coming-soon page exposes internal links.`);
    assert(pageState.logoReady, `${viewport.name} brand logo did not load.`);
    assert(pageState.canonical === `${baseUrl}/`, `${viewport.name} canonical URL is incorrect.`);
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

  for (const route of ["docs", "privacy", "terms", "status", "login", "register", "forgot-password", "reset-password"]) {
    const response = await page.goto(`${baseUrl}/${route}`, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `/${route} did not return 200.`);
    assert(page.url() === `${baseUrl}/`, `/${route} did not redirect to the coming-soon page.`);
    assert((await page.title()) === "Simple CAPI - Coming Soon", `/${route} has an incorrect title.`);
  }

  await page.goto(`${baseUrl}/?view=login`, { waitUntil: "networkidle" });
  assert(page.url() === `${baseUrl}/`, "A query-string product route remains exposed in production.");
  assert(await page.getByText("Preview the local workspace").count() === 0, "The localhost preview control is exposed in production.");

  const legacyAlias = await context.request.get("https://capi-tracker.vercel.app/docs");
  assert(legacyAlias.url() === `${baseUrl}/`, "The legacy Vercel alias does not redirect to the locked canonical page.");

  await page.goto("https://capi-tracker-service.netlify.app/#simple-capi-domain-check", { waitUntil: "networkidle" });
  assert(page.url() === `${baseUrl}/`, "The backend project does not redirect to the locked branded domain.");

  const status = await context.request.get(`${baseUrl}/api/provisioner?action=status`);
  assert(status.ok(), "The provisioner status proxy is unavailable.");
  const statusBody = await status.json();
  assert(statusBody.ready === true, "The production provisioner is not ready.");

  const identity = await context.request.get(`${baseUrl}/.netlify/identity/settings`);
  assert(identity.ok(), "The Identity proxy is unavailable.");
  const identityBody = await identity.json();
  assert(identityBody.external?.email === true, "Email authentication is not enabled.");
  assert(identityBody.disable_signup === true, "Public account registration is still enabled.");

  const protectedRequest = await context.request.post(
    `${baseUrl}/api/provisioner?action=checkout`,
    { headers: { Origin: baseUrl, "Content-Type": "application/json" }, data: {} }
  );
  assert(protectedRequest.status() === 401, "An unauthenticated provisioning request was not rejected.");
  await context.close();

  assert(errors.length === 0, `Live browser errors:\n${errors.join("\n")}`);
  console.log(`Live audit passed: ${baseUrl}, coming-soon lock, closed registration, protected API, and CSP.`);
} finally {
  await browser.close();
}
