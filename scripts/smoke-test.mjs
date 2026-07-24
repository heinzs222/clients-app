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
  if (message.type() === "warning" && message.text().includes("DO NOT USE HTTP IN PRODUCTION")) {
    runtimeErrors.push(`console: ${message.text()}`);
  }
});

await page.route("**/api/auth/settings", (route) => route.fulfill({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ external: { google: true, email: true }, disable_signup: false, autoconfirm: false })
}));

try {
  const trackerPage = await context.newPage();
  const trackerRequests = [];
  trackerPage.on("pageerror", (error) => runtimeErrors.push(`tracker pageerror: ${error.message}`));
  await trackerPage.route("https://tracker.example/**", (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/client/test-route/events") {
      trackerRequests.push(request.postData() || "");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    }
    const body = pathname === "/tracker.js" ? trackerLoader : pathname === trackerAssets.corePath ? trackerCore : "";
    return route.fulfill({ status: body ? 200 : 404, contentType: "application/javascript", body });
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
    script.setAttribute("data-capi-endpoint", "https://tracker.example/client/test-route/events");
    script.setAttribute("data-page-variant", "Control");
    script.setAttribute("data-test-event-code", "TEST_BROWSER_001");
    document.body.appendChild(script);
  });
  await trackerPage.waitForFunction(() => window.__CAPI_LAUNCHER_TRACKER__ === true);
  await trackerPage.evaluate(() => {
    document.getElementById("estimate-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  for (let i = 0; i < 20 && trackerRequests.length < 1; i += 1) await trackerPage.waitForTimeout(50);
  const trackerResult = await trackerPage.evaluate(() => {
    return {
      pixelCalls: window.__pixelCalls,
      event: window.__trackerEvent,
      fbc: document.cookie.split("; ").find((item) => item.startsWith("_fbc=")) || ""
    };
  });
  assert(trackerRequests.length === 1, "Lead form did not send exactly one request.");
  const trackerValues = Object.fromEntries(new URLSearchParams(trackerRequests[0]));
  assert(trackerResult.pixelCalls.length === 1, "Browser Pixel Lead did not fire exactly once.");
  assert(trackerValues.event_id === trackerResult.pixelCalls[0][3].eventID, "Pixel and server event IDs differ.");
  assert(trackerValues.page_variant === "Control", "Tracker did not include the landing-page variant.");
  assert(trackerResult.pixelCalls[0][2].page_variant === "Control", "Browser Pixel event omitted the landing-page variant.");
  assert(trackerValues.test_event_code === "TEST_BROWSER_001", "Tracker did not forward the Meta test event code.");
  assert(trackerResult.event.event_id === trackerValues.event_id, "Tracker lifecycle event ID differs.");
  assert(trackerValues.external_id === "jane@example.com", "Tracker external_id is incorrect.");
  assert(trackerValues.fbc.endsWith(".contract-click"), "Tracker did not build fbc from fbclid.");
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
    if (pathname === "/client/test-route/events") {
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
    script.setAttribute("data-capi-endpoint", "https://tracker.example/client/test-route/events");
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
      <script src="https://tracker.example/tracker.js" data-capi-endpoint="https://tracker.example/client/test-route/events" data-event-name="Schedule" data-trigger="page-load" data-value="150" data-source="Appointment Booking" data-test-event-code="TEST_SCHEDULE_001" defer></script>
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
  assert(await page.getByRole("heading", { name: "Send better lead data to Meta with one simple script." }).isVisible(), "Product home page did not render.");
  assert(await page.getByRole("button", { name: /Create my free script/ }).isVisible(), "Homepage primary action did not render.");
  assert(await page.getByRole("button", { name: "Unlock with a script" }).isVisible(), "Homepage paid-guide action did not render.");
  assert(await page.getByRole("link", { name: "Log in" }).isVisible(), "Homepage login action did not render.");
  assert(await page.getByRole("link", { name: "Register" }).isVisible(), "Homepage registration CTA did not render.");
  assert(await page.locator(".publicHeader").count() === 1, "Home page header did not render.");
  assert(await page.locator(".publicFooter").count() === 1, "Home page footer did not render.");
  const homeText = await page.locator("body").innerText();
  assert(!/webhook|SHA-256|fbp|fbc|client IP|user agent|deduplication/i.test(homeText), "Homepage exposes implementation details.");
  assert(!/netlify/i.test(homeText), "Customer-facing homepage exposes the infrastructure provider.");
  const browserBundles = fs.readdirSync(path.join(process.cwd(), "dist", "assets"))
    .filter((file) => file.endsWith(".js"))
    .map((file) => fs.readFileSync(path.join(process.cwd(), "dist", "assets", file), "utf8"))
    .join("\n");
  assert(!browserBundles.includes("Verify the paired event"), "The paid guide is compiled into public browser assets.");
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-home.png"), fullPage: true });

  await page.getByRole("button", { name: "Unlock with a script" }).click();
  await page.waitForURL(`${baseUrl}/login`);
  assert(await page.getByRole("heading", { name: "Welcome back" }).isVisible(), "The paid guide is accessible without login.");
  const loginButton = page.getByRole("button", { name: "Log in" });
  const googleButton = page.getByRole("button", { name: "Continue with Google" });
  assert(await googleButton.isVisible(), "Enabled Google sign-in did not render.");
  assert(await page.getByRole("button", { name: "Create one" }).isVisible(), "Login page registration link did not render.");
  const loginBox = await loginButton.boundingBox();
  const googleBox = await googleButton.boundingBox();
  assert(googleBox.y > loginBox.y + loginBox.height, "Google sign-in is not positioned below the primary login actions.");
  assert(Math.abs(googleBox.width - loginBox.width) < 4, "Google sign-in and email login are not consistently sized.");

  await page.goto(`${baseUrl}/docs`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Simple, private event setup." }).isVisible(), "Public product overview did not render.");
  const publicDocsText = await page.locator("body").innerText();
  assert(!/access token|browser pixel|test events|deduplicat|paste the generated|page head|confirmation page/i.test(publicDocsText), "Public product overview exposes the paid implementation playbook.");

  await page.goto(`${baseUrl}/?preview=1&view=dashboard`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Dashboard" }).isVisible(), "Dashboard did not render in local preview.");
  const dashboardHasEndpoints = await page.locator(".endpointTable").count() > 0;
  const dashboardIsEmpty = await page.getByText("No endpoints yet").isVisible().catch(() => false);
  assert(dashboardHasEndpoints || dashboardIsEmpty, "Dashboard endpoint state did not render.");

  await page.route("**/api/workspace?action=guide", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, guide: __testing.purchasedGuide() })
    });
  });
  await page.route("**/api/workspace?action=list", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        count: 2,
        endpoints: [{
          id: "11111111-1111-4111-8111-111111111111",
          client_name: "Example Lead Client",
          dataset_id: "123456789012345",
          graph_version: "v23.0",
          event_name: "Lead",
          tracker_url: "https://simplecapi.com/client/opaque-route/tracker.js",
          state: "ready",
          created_at: "2026-07-10T12:00:00.000Z",
          updated_at: "2026-07-11T12:00:00.000Z"
        }, {
          id: "22222222-2222-4222-8222-222222222222",
          client_name: "Example Schedule Client",
          dataset_id: "123456789012345",
          graph_version: "v23.0",
          event_name: "Schedule",
          tracker_url: "https://simplecapi.com/client/opaque-schedule-route/tracker.js",
          state: "ready",
          created_at: "2026-07-10T12:00:00.000Z",
          updated_at: "2026-07-11T12:00:00.000Z"
        }]
      })
    });
  });
  await page.route("**/api/providers?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, endpoints: [] })
    });
  });
  await page.route("**/api/bindings?action=get*", async (route) => {
    const siteId = new URL(route.request().url()).searchParams.get("siteId") || "";
    const schedule = siteId.startsWith("22222222");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        binding: {
          allowed_page_url: schedule ? "https://example.com/booking-confirmed" : "https://example.com/free-estimate",
          form_selector: schedule ? "" : "#estimate-form"
        }
      })
    });
  });
  await page.goto(`${baseUrl}/?preview=1&view=endpoints`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Example Lead Client", exact: true }).click();
  assert(await page.getByRole("heading", { name: "Example Lead Client" }).isVisible(), "Lead tracking detail did not open.");
  assert(await page.getByText("Lead installation script", { exact: true }).isVisible(), "Tracker install panel did not render.");
  assert(await page.getByText("This endpoint is locked to its purchased conversion type, page, and form.", { exact: true }).isVisible(), "Lead endpoint does not explain its conversion lock.");
  await page.getByLabel("Landing page label").fill("Variant B");
  const variantInstallCode = await page.locator(".codePanel pre").first().innerText();
  assert(variantInstallCode.includes('data-page-variant="Variant B"'), "Installer omitted the landing-page variant.");
  assert(variantInstallCode.includes('data-event-name="Lead"'), "Lead endpoint generated the wrong event name.");
  assert(!variantInstallCode.includes("data-capi-endpoint"), "Installer exposes an unnecessary event route.");
  assert(await page.getByRole("button", { name: /Schedule confirmation/ }).count() === 0, "Lead endpoint allows switching to Schedule without another purchase.");

  await page.getByRole("button", { name: "All endpoints" }).click();
  await page.getByRole("button", { name: "Example Schedule Client", exact: true }).click();
  assert(await page.getByText("Schedule installation script", { exact: true }).isVisible(), "Schedule installer did not render.");
  assert(await page.getByText("Confirmation page only", { exact: true }).isVisible(), "Schedule placement warning did not render.");
  const scheduleInstallCode = await page.locator(".codePanel pre").first().innerText();
  assert(scheduleInstallCode.includes('data-event-name="Schedule"'), "Schedule installer generated the wrong event name.");
  assert(scheduleInstallCode.includes('data-trigger="page-load"'), "Schedule installer omitted the page-load trigger.");
  assert(!scheduleInstallCode.includes("data-form-selector"), "Schedule installer included an irrelevant form selector.");
  assert(await page.getByRole("button", { name: /Lead form/ }).count() === 0, "Schedule endpoint allows switching to Lead without another purchase.");
  const trackingText = await page.locator("body").innerText();
  assert(!/GHL|webhook|SHA-256|fbp|fbc|client IP|user agent|deduplication/i.test(trackingText), "Tracking UI exposes implementation details.");
  assert(await page.locator(".pageTabs button").count() === 2, "Tracking UI exposes unnecessary configuration tabs.");
  assert(!/netlify/i.test(await page.locator("body").innerText()), "Customer-facing workspace exposes the infrastructure provider.");
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-install.png"), fullPage: true });

  await page.goto(`${baseUrl}/platforms?preview=1`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "TikTok & Google Ads" }).isVisible(), "TikTok and Google workspace did not render.");
  assert(await page.getByRole("button", { name: /TikTok Pixel \+ Events API/ }).isVisible(), "TikTok setup option did not render.");
  assert(await page.getByRole("button", { name: /Google Ads Tag \+ enhanced conversions/ }).isVisible(), "Google Ads setup option did not render.");
  assert(await page.getByText("TikTok Lead", { exact: true }).isVisible(), "TikTok Lead does not use the current standard event name.");
  assert(!/Back to Meta workspace|Meta remains unchanged/i.test(await page.locator("body").innerText()), "Provider setup still renders as a separate legacy workspace.");

  await page.goto(`${baseUrl}/?preview=1&view=tracking`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "9.3 setup guide" }).click();
  await page.getByRole("heading", { name: "The 9.3 EMQ Setup Guide" }).waitFor({ state: "visible" });
  assert(await page.getByRole("heading", { name: "The 9.3 EMQ Setup Guide" }).isVisible(), "A paid endpoint did not unlock the 9.3 setup guide.");
  assert(await page.getByRole("heading", { name: "5. Verify the paired event" }).isVisible(), "The paid guide is missing the Meta verification sequence.");
  const paidGuideText = await page.locator("body").innerText();
  assert(/Lead costs \$5\. Schedule costs \$5\./.test(paidGuideText), "The paid guide does not explain separate Lead and Schedule pricing.");
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-emq-guide.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const guideOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(guideOverflow <= 1, `Mobile EMQ guide has ${guideOverflow}px horizontal overflow.`);
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-emq-guide-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(`${baseUrl}/?preview=1&view=setup`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Create new endpoint" }).isVisible(), "Setup wizard did not render.");
  assert(await page.getByLabel("Client or project name").isVisible(), "Setup form fields are not accessible by label.");

  async function mockPaidAppPage(availableCredits) {
    const billingPage = await context.newPage();
    await billingPage.route("**/api/workspace?**", (route) => {
      const action = new URL(route.request().url()).searchParams.get("action");
      if (action === "status") {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, ready: true, user_limit: 25, billing: { required: true, configured: true, provider: "lemonsqueezy", price_cents: 500, currency: "USD", mode: "test" } }) });
      }
      if (action === "billing") {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, billing: { required: true, configured: true, exempt: false, provider: "lemonsqueezy", price_cents: 500, currency: "USD", mode: "test", available_credits: availableCredits, available_order_id: availableCredits ? "42001" : "", payments: [] } }) });
      }
      if (action === "list") {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, endpoints: [], count: 0 }) });
      }
      return route.continue();
    });
    await billingPage.goto(`${baseUrl}/?preview=1&view=setup`, { waitUntil: "networkidle" });
    return billingPage;
  }

  const unpaidPage = await mockPaidAppPage(0);
  assert(await unpaidPage.getByRole("heading", { name: "Conversion credit" }).isVisible(), "Lemon Squeezy payment gate did not render.");
  assert(await unpaidPage.getByRole("button", { name: /Pay \$5\.00 securely/ }).isVisible(), "Lemon Squeezy Checkout command did not render.");
  assert(await unpaidPage.getByText("Exactly one Lead or one Schedule script", { exact: true }).isVisible(), "Payment gate does not state the one-payment, one-event rule.");
  assert(await unpaidPage.getByText("Need both events? Buy two scripts: $5 for Lead plus $5 for Schedule.", { exact: true }).isVisible(), "Payment gate does not show the separate Lead and Schedule prices.");
  await unpaidPage.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-payment.png"), fullPage: true });
  await unpaidPage.goto(`${baseUrl}/?preview=1&view=billing`, { waitUntil: "networkidle" });
  assert(await unpaidPage.getByRole("heading", { name: "Billing" }).isVisible(), "Billing page did not render.");
  await unpaidPage.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-billing.png"), fullPage: true });
  await unpaidPage.setViewportSize({ width: 390, height: 844 });
  await unpaidPage.goto(`${baseUrl}/?preview=1&view=setup`, { waitUntil: "networkidle" });
  const paymentOverflow = await unpaidPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(paymentOverflow <= 1, `Mobile payment page has ${paymentOverflow}px horizontal overflow.`);
  await unpaidPage.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-payment-mobile.png"), fullPage: true });
  await unpaidPage.close();

  const creditedPage = await mockPaidAppPage(1);
  assert(await creditedPage.getByLabel("Client or project name").isVisible(), "Paid conversion credit did not unlock endpoint creation.");
  assert(await creditedPage.getByText("Payment confirmed", { exact: true }).isVisible(), "Paid credit confirmation did not render.");
  assert(await creditedPage.getByText(/One credit creates exactly one Lead or one Schedule script\./).isVisible(), "Paid credit does not state its single-event limit.");
  assert(await creditedPage.getByRole("button", { name: /Lead \$5 one-time setup/ }).isVisible(), "Lead purchase option did not render.");
  const scheduleChoice = creditedPage.getByRole("button", { name: /Schedule \$5 one-time setup/ });
  assert(await scheduleChoice.isVisible(), "Schedule purchase option did not render.");
  await scheduleChoice.click();
  assert(await scheduleChoice.getAttribute("aria-pressed") === "true", "Schedule purchase option could not be selected.");
  await creditedPage.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-conversion-setup.png"), fullPage: true });
  await creditedPage.close();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `Mobile home page has ${overflow}px horizontal overflow.`);
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-home-mobile.png"), fullPage: true });

  await page.goto(`${baseUrl}/?preview=1&view=dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert(await page.locator(".sideNav.open").isVisible(), "Mobile navigation did not open.");
  await page.screenshot({ path: path.join(os.tmpdir(), "capi-launcher-mobile.png"), fullPage: true });

  await page.goto(`${baseUrl}/?view=login`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Welcome back" }).isVisible(), "Login page did not render.");
  assert(await page.getByText("Preview the local workspace").isVisible(), "Local preview control did not render on localhost.");

  await page.evaluate(() => {
    window.localStorage.setItem("gotrue.user", JSON.stringify({ token: {} }));
  });
  await page.reload({ waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Welcome back" }).isVisible(), "Login page did not recover from a malformed session.");
  assert(await page.evaluate(() => window.localStorage.getItem("gotrue.user")) === null, "Malformed auth session was not cleared.");

  await page.getByRole("button", { name: "Create one" }).click();
  assert(await page.getByRole("heading", { name: "Create your account" }).isVisible(), "Registration page did not render.");
  assert(await page.getByText("Preview the local workspace").count() === 0, "Local preview control should only render on login.");

  await page.goto(`${baseUrl}/?view=status`, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "Service availability" }).isVisible(), "Status page did not render.");

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${baseUrl}/?preview=1&view=dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${baseUrl}/`);
  await page.getByRole("heading", { name: "Send better lead data to Meta with one simple script." }).waitFor({ state: "visible" });
  assert(await page.getByRole("heading", { name: "Send better lead data to Meta with one simple script." }).isVisible(), "Logout did not return to the public home page.");

  assert(runtimeErrors.length === 0, runtimeErrors.join("\n"));
  process.stdout.write("Smoke test passed: tracker, simplified product UI, payment gate, dashboard, mobile, auth, and status.\n");
} finally {
  await browser.close();
}
