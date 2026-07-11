import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import { __testing } from "../netlify/functions/create-client-capi.mjs";

const baseUrl = process.env.APP_URL || "http://localhost:8888";
const executablePath = process.env.CHROME_PATH || [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
].find((candidate) => fs.existsSync(candidate));

if (!executablePath) throw new Error("Chrome was not found. Set CHROME_PATH before running the smoke test.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const trackerAssets = await __testing.trackerAssets();
const trackerLoader = trackerAssets.loader.toString("utf8");
const trackerCore = trackerAssets.core.toString("utf8");

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const runtimeErrors = [];

page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
});

try {
  const trackerPage = await context.newPage();
  trackerPage.on("pageerror", (error) => runtimeErrors.push(`tracker pageerror: ${error.message}`));
  await trackerPage.route("https://services.leadconnectorhq.com/**", (route) => route.fulfill({ status: 204 }));
  await trackerPage.route("https://tracker.example/**", (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const body = pathname === "/tracker.js" ? trackerLoader : pathname === trackerAssets.corePath ? trackerCore : "";
    route.fulfill({ status: body ? 200 : 404, contentType: "application/javascript", body });
  });
  await trackerPage.goto(`${baseUrl}/?utm_source=fb_ad&fbclid=contract-click`, { waitUntil: "domcontentloaded" });
  await trackerPage.setContent(`<!doctype html><html><body>
    <form id="estimate-form">
      <label>First name <input name="first_name" value="Jane"></label>
      <label>Last name <input name="last_name" value="Doe"></label>
      <label>Email <input type="email" name="email" value="jane@example.com"></label>
      <label>Phone <input type="tel" name="phone" value="5551234567"></label>
      <button type="submit">Submit</button>
    </form>
  </body></html>`);
  await trackerPage.evaluate(() => {
    window.__pixelCalls = [];
    window.__trackerEvent = null;
    window.fbq = function() { window.__pixelCalls.push(Array.from(arguments)); };
    window.addEventListener("capi-launcher:lead", (event) => { window.__trackerEvent = event.detail; });
    const script = document.createElement("script");
    script.src = "https://tracker.example/tracker.js";
    script.setAttribute("data-ghl-webhook-url", "https://services.leadconnectorhq.com/hooks/test/webhook-trigger/test");
    script.setAttribute("data-test-event-code", "TEST_BROWSER_001");
    document.body.appendChild(script);
  });
  await trackerPage.waitForFunction(() => window.__CAPI_LAUNCHER_TRACKER__ === true);
  await trackerPage.evaluate(() => {
    document.getElementById("estimate-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  await trackerPage.waitForTimeout(250);
  const trackerResult = await trackerPage.evaluate(() => {
    const hidden = document.querySelector('form[target^="dh_capi_"]');
    const values = hidden ? Object.fromEntries(Array.from(hidden.querySelectorAll("input")).map((input) => [input.name, input.value])) : {};
    return {
      pixelCalls: window.__pixelCalls,
      event: window.__trackerEvent,
      hiddenForms: document.querySelectorAll('form[target^="dh_capi_"]').length,
      values,
      fbc: document.cookie.split("; ").find((item) => item.startsWith("_fbc=")) || ""
    };
  });
  assert(trackerResult.hiddenForms === 1, "Tracker created duplicate internal GHL forms.");
  assert(trackerResult.pixelCalls.length === 1, "Browser Pixel Lead did not fire exactly once.");
  assert(trackerResult.values.event_id === trackerResult.pixelCalls[0][3].eventID, "Pixel and webhook event IDs differ.");
  assert(trackerResult.values.test_event_code === "TEST_BROWSER_001", "Tracker did not forward the Meta test event code.");
  assert(trackerResult.event.event_id === trackerResult.values.event_id, "Tracker lifecycle event ID differs.");
  assert(trackerResult.values.external_id === "jane@example.com", "Tracker external_id is incorrect.");
  assert(trackerResult.values.fbc.endsWith(".contract-click"), "Tracker did not build fbc from fbclid.");
  assert(trackerResult.fbc.includes("contract-click"), "Tracker did not persist the _fbc cookie.");
  await trackerPage.close();

  const customFormPage = await context.newPage();
  const directRequests = [];
  customFormPage.on("pageerror", (error) => runtimeErrors.push(`custom form pageerror: ${error.message}`));
  await customFormPage.route("https://tracker.example/**", (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/tracker.js") {
      return route.fulfill({ status: 200, contentType: "application/javascript", body: trackerLoader });
    }
    if (pathname === trackerAssets.corePath) {
      return route.fulfill({ status: 200, contentType: "application/javascript", body: trackerCore });
    }
    if (pathname === "/.netlify/functions/meta-capi-lead") {
      directRequests.push({ headers: request.headers(), body: request.postData() || "" });
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }
    return route.fulfill({ status: 404 });
  });
  await customFormPage.goto(`${baseUrl}/?utm_source=fb_ad&fbclid=custom-form-click`, { waitUntil: "domcontentloaded" });
  await customFormPage.setContent(`<!doctype html><html><body>
    <form id="custom-form">
      <label>Email <input type="email" name="email" value="custom@example.com"></label>
      <button type="button" id="custom-submit">Send through custom JavaScript</button>
    </form>
  </body></html>`);
  await customFormPage.evaluate(() => {
    window.__pixelCalls = [];
    window.fbq = function() { window.__pixelCalls.push(Array.from(arguments)); };
    const script = document.createElement("script");
    script.src = "https://tracker.example/tracker.js";
    script.setAttribute("data-capi-endpoint", "https://tracker.example/.netlify/functions/meta-capi-lead");
    script.setAttribute("data-test-event-code", "TEST_CUSTOM_FORM_001");
    document.body.appendChild(script);
  });
  await customFormPage.waitForFunction(() => window.__CAPI_LAUNCHER_TRACKER__ === true);
  await customFormPage.getByRole("button", { name: "Send through custom JavaScript" }).click();
  await customFormPage.evaluate(() => {
    window.fbq("track", "Lead", { value: 50, currency: "USD" }, { eventID: "lead_custom_pixel_001" });
  });
  await customFormPage.waitForFunction(() => window.__pixelCalls.length === 1);
  for (let i = 0; i < 20 && directRequests.length < 1; i += 1) await customFormPage.waitForTimeout(50);
  const directRequest = directRequests[0];
  assert(directRequest, "Custom Pixel Lead did not trigger a direct server request.");
  const directValues = Object.fromEntries(new URLSearchParams(directRequest.body));
  assert((directRequest.headers["content-type"] || "").includes("application/x-www-form-urlencoded"), "Direct tracker request is not CORS-safe form data.");
  assert(directValues.event_id === "lead_custom_pixel_001", "Custom Pixel and server event IDs differ.");
  assert(directValues.email === "custom@example.com", "Custom form values were not collected.");
  assert(directValues.test_event_code === "TEST_CUSTOM_FORM_001", "Custom form test code was not forwarded.");

  await customFormPage.route("**/booking-confirmed", (route) => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: `<!doctype html><html><body><main><h1>Appointment confirmed</h1></main>
      <script>window.__pixelCalls=[];window.fbq=function(){window.__pixelCalls.push(Array.from(arguments));};</script>
      <script src="https://tracker.example/tracker.js" data-capi-endpoint="https://tracker.example/.netlify/functions/meta-capi-lead" data-event-name="Schedule" data-trigger="page-load" data-value="150" data-source="Appointment Booking" data-test-event-code="TEST_SCHEDULE_001" defer></script>
    </body></html>`
  }));
  await customFormPage.goto(`${baseUrl}/booking-confirmed`, { waitUntil: "load" });
  await customFormPage.waitForFunction(() => window.__CAPI_LAUNCHER_TRACKER__ === true);
  for (let i = 0; i < 40 && directRequests.length < 2; i += 1) await customFormPage.waitForTimeout(50);
  assert(directRequests.length === 2, "Schedule confirmation page did not send one server event.");
  const scheduleValues = Object.fromEntries(new URLSearchParams(directRequests[1].body));
  const schedulePixelCalls = await customFormPage.evaluate(() => window.__pixelCalls);
  assert(scheduleValues.event_name === "Schedule", "Confirmation page sent the wrong event name.");
  assert(scheduleValues.email === "custom@example.com", "Schedule event did not carry forward lead identity.");
  assert(scheduleValues.value === "150", "Schedule event value is incorrect.");
  assert(scheduleValues.test_event_code === "TEST_SCHEDULE_001", "Schedule test code was not forwarded.");
  assert(schedulePixelCalls.length === 1, "Schedule browser Pixel did not fire exactly once.");
  assert(schedulePixelCalls[0][1] === "Schedule", "Schedule browser Pixel used the wrong event name.");
  assert(schedulePixelCalls[0][3].eventID === scheduleValues.event_id, "Schedule browser and server event IDs differ.");

  await customFormPage.reload({ waitUntil: "load" });
  await customFormPage.waitForTimeout(250);
  assert(directRequests.length === 2, "Reloading the confirmation page duplicated the Schedule event.");
  await customFormPage.close();

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: /Simple CAPI is coming soon/ }).isVisible(), "Coming-soon home page did not render.");
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-home.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `Mobile home page has ${overflow}px horizontal overflow.`);
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-home-mobile.png"), fullPage: true });

  await page.goto(`${baseUrl}/?view=login`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Welcome back" }).isVisible(), "Login page did not render.");
  assert(await page.getByText("Preview the local workspace").count() === 0, "Local preview control should not render.");
  await page.getByRole("button", { name: "Create one" }).click();
  assert(await page.getByRole("heading", { name: "Create your account" }).isVisible(), "Registration page did not render.");
  assert(await page.getByText("Preview the local workspace").count() === 0, "Local preview control should not render on registration.");

  await page.goto(`${baseUrl}/?view=status`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Provisioning service" }).isVisible(), "Status page did not render.");

  assert(runtimeErrors.length === 0, runtimeErrors.join("\n"));
  process.stdout.write("Smoke test passed: tracker, coming-soon home, mobile layout, auth, and status.\n");
} finally {
  await browser.close();
}
