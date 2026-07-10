const crypto = require("crypto");
const JSZip = require("jszip");
const { getUser } = require("@netlify/identity");

const API_BASE = "https://api.netlify.com/api/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

function cleanString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
  return trimmed;
}

function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 38) || "client";
}

function sha1(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function netlifyFetch(path, options = {}) {
  const token = cleanString(process.env.NETLIFY_AUTH_TOKEN);
  if (!token) {
    throw Object.assign(new Error("Server is missing NETLIFY_AUTH_TOKEN."), {
      statusCode: 500
    });
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "DarkHorse CAPI Launcher",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message = typeof data === "object"
      ? data.message || data.error || "Netlify API request failed."
      : data || "Netlify API request failed.";

    throw Object.assign(new Error(message), {
      statusCode: response.status,
      details: data
    });
  }

  return data;
}

function provisionerStatus() {
  const missing = [];

  if (!cleanString(process.env.NETLIFY_AUTH_TOKEN)) {
    missing.push("NETLIFY_AUTH_TOKEN");
  }

  if (!cleanString(process.env.NETLIFY_ACCOUNT_SLUG)) {
    missing.push("NETLIFY_ACCOUNT_SLUG");
  }

  return {
    success: true,
    ready: missing.length === 0,
    missing,
    message: missing.length
      ? `Provisioner is missing: ${missing.join(", ")}`
      : "Provisioner is ready."
  };
}

async function authenticatedUser() {
  try {
    return await getUser();
  } catch {
    return null;
  }
}

function isLocalDevRequest(event) {
  const host = cleanString(event.headers.host || event.headers.Host).toLowerCase();
  return (
    process.env.NETLIFY_DEV === "true" ||
    process.env.CONTEXT === "dev" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:")
  );
}

function capiFunctionSource() {
  return `const crypto = require("crypto");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
  return trimmed;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeText(value) {
  return getString(value).toLowerCase();
}

function normalizePhone(value) {
  return getString(value).replace(/\\D/g, "");
}

function removeEmpty(value) {
  if (Array.isArray(value)) {
    const filtered = value.map(removeEmpty).filter((item) => item !== undefined);
    return filtered.length ? filtered : undefined;
  }

  if (value && typeof value === "object") {
    const next = {};
    Object.keys(value).forEach((key) => {
      const cleaned = removeEmpty(value[key]);
      if (cleaned !== undefined) next[key] = cleaned;
    });
    return Object.keys(next).length ? next : undefined;
  }

  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}

function parseBody(event) {
  if (!event.body) return {};
  return JSON.parse(event.body);
}

function clientIp(event, input) {
  return getString(input.client_ip_address) ||
    getString(event.headers["x-nf-client-connection-ip"]) ||
    getString(event.headers["client-ip"]) ||
    getString(event.headers["x-forwarded-for"]).split(",")[0].trim();
}

function splitName(input) {
  const explicitFirst = normalizeText(input.first_name);
  const explicitLast = normalizeText(input.last_name);
  if (explicitFirst || explicitLast) return { first: explicitFirst, last: explicitLast };

  const parts = getString(input.full_name).split(/\\s+/).filter(Boolean);
  return {
    first: normalizeText(parts[0] || ""),
    last: normalizeText(parts.slice(1).join(" "))
  };
}

function userData(input, event) {
  const names = splitName(input);
  const email = normalizeText(input.email);
  const phone = normalizePhone(input.phone);
  const externalId = normalizeText(input.external_id) || email || phone;
  const city = normalizeText(input.city);
  const state = normalizeText(input.state);
  const postal = normalizeText(input.postal_code);
  const country = normalizeText(input.country);

  return removeEmpty({
    em: email ? [sha256(email)] : undefined,
    ph: phone ? [sha256(phone)] : undefined,
    fn: names.first ? [sha256(names.first)] : undefined,
    ln: names.last ? [sha256(names.last)] : undefined,
    ct: city ? [sha256(city)] : undefined,
    st: state ? [sha256(state)] : undefined,
    zp: postal ? [sha256(postal)] : undefined,
    country: country ? [sha256(country)] : undefined,
    external_id: externalId ? [sha256(externalId)] : undefined,
    fbp: getString(input.fbp),
    fbc: getString(input.fbc),
    client_ip_address: clientIp(event, input),
    client_user_agent: getString(input.client_user_agent) || getString(event.headers["user-agent"])
  });
}

function buildPayload(input, event) {
  const eventName = getString(input.event_name) || "Lead";
  const eventId = getString(input.event_id) || crypto.randomUUID();
  const eventSourceUrl = getString(input.landing_page) || getString(input.page_url);

  return {
    eventName,
    eventId,
    payload: removeEmpty({
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: userData(input, event),
          custom_data: removeEmpty({
            currency: getString(input.currency),
            value: Number(input.value) || undefined,
            lead_source: getString(input.utm_source),
            campaign: getString(input.utm_campaign),
            adset: getString(input.utm_adset),
            ad: getString(input.utm_ad),
            utm_medium: getString(input.utm_medium),
            utm_content: getString(input.utm_content),
            utm_term: getString(input.utm_term),
            utm_id: getString(input.utm_id),
            fbclid: getString(input.fbclid),
            referrer: getString(input.referrer),
            source: getString(input.source),
            tags: getString(input.tags),
            project_type: getString(input.project_type),
            project_timeline: getString(input.project_timeline)
          })
        }
      ],
      test_event_code: getString(input.test_event_code)
    })
  };
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  const datasetId = getString(process.env.META_DATASET_ID);
  const accessToken = getString(process.env.META_ACCESS_TOKEN);
  const version = getString(process.env.META_GRAPH_API_VERSION) || "v23.0";

  if (!datasetId || !accessToken) {
    return json(500, {
      success: false,
      error: "Missing required environment variables."
    });
  }

  let input;
  try {
    input = parseBody(event);
  } catch {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  const built = buildPayload(input, event);
  const url = "https://graph.facebook.com/" + encodeURIComponent(version) + "/" + encodeURIComponent(datasetId) + "/events?access_token=" + encodeURIComponent(accessToken);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(built.payload)
    });
    const meta = await response.json().catch(() => ({}));

    if (!response.ok) {
      return json(502, {
        success: false,
        meta,
        event_id: built.eventId,
        event_name: built.eventName
      });
    }

    return json(200, {
      success: true,
      meta,
      event_id: built.eventId,
      event_name: built.eventName
    });
  } catch {
    return json(502, {
      success: false,
      error: "Meta request failed",
      event_id: built.eventId,
      event_name: built.eventName
    });
  }
};`;
}

async function buildFunctionZip() {
  const zip = new JSZip();
  zip.file("meta-capi-lead.js", capiFunctionSource());
  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
}

function trackerScriptSource() {
  return Buffer.from(`(function(window, document) {
  "use strict";

  var script = document.currentScript;

  if (!script) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      if ((scripts[i].src || "").indexOf("/tracker.js") !== -1) {
        script = scripts[i];
        break;
      }
    }
  }

  function attr(name, fallback) {
    if (!script) return fallback || "";
    var value = script.getAttribute("data-" + name);
    return value === null || value === undefined || value === "" ? (fallback || "") : value;
  }

  function scriptOrigin() {
    try {
      return new URL(script.src).origin;
    } catch (error) {
      return "";
    }
  }

  var origin = scriptOrigin();
  var CFG = {
    endpoint: attr("capi-endpoint", origin ? origin + "/.netlify/functions/meta-capi-lead" : ""),
    ghlWebhookUrl: attr("ghl-webhook-url", ""),
    formSelector: attr("form-selector", "form"),
    eventName: attr("event-name", "Lead"),
    country: attr("country", "US"),
    currency: attr("currency", "USD"),
    value: Number(attr("value", "1")) || 1,
    source: attr("source", "Estimate Form"),
    tags: attr("tags", "estimate-lead,website-form"),
    projectType: attr("project-type", ""),
    projectTimeline: attr("project-timeline", ""),
    onlyMetaTraffic: attr("only-meta-traffic", "false") === "true",
    firePixel: attr("fire-pixel", "true") !== "false"
  };

  function clean(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function getParam(name) {
    try {
      return clean(new URLSearchParams(window.location.search).get(name));
    } catch (error) {
      return "";
    }
  }

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i].indexOf(name + "=") === 0) {
        return decodeURIComponent(parts[i].split("=").slice(1).join("="));
      }
    }
    return "";
  }

  function getFbc() {
    var existing = getCookie("_fbc");
    var fbclid = getParam("fbclid");
    if (existing) return existing;
    if (fbclid) return "fb.1." + Date.now() + "." + fbclid;
    return "";
  }

  function hasMetaTraffic() {
    var source = (getParam("utm_source") || "").toLowerCase();
    return Boolean(
      getParam("fbclid") ||
      getCookie("_fbc") ||
      getCookie("_fbp") ||
      source.indexOf("fb") !== -1 ||
      source.indexOf("facebook") !== -1 ||
      source.indexOf("meta") !== -1
    );
  }

  function eventId() {
    return "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function phoneDigits(value) {
    return clean(value).replace(/\\D/g, "");
  }

  function controls(form) {
    return Array.prototype.slice.call(form.querySelectorAll("input, textarea, select"));
  }

  function controlValue(control) {
    var type = (control.type || "").toLowerCase();
    if (control.disabled || /^(button|submit|reset|image|file|password)$/i.test(type)) return "";

    if (type === "checkbox") {
      return control.checked ? clean(control.value || "true") : "";
    }

    if (type === "radio") {
      return control.checked ? clean(control.value) : "";
    }

    if (control.tagName && control.tagName.toLowerCase() === "select" && control.multiple) {
      return Array.prototype.slice.call(control.selectedOptions).map(function(option) {
        return clean(option.value || option.text);
      }).filter(Boolean).join(",");
    }

    return clean(control.value);
  }

  function labelText(control) {
    var text = "";

    if (control.id && window.CSS && window.CSS.escape) {
      var explicit = document.querySelector("label[for=\\"" + window.CSS.escape(control.id) + "\\"]");
      if (explicit) text += " " + explicit.textContent;
    }

    if (control.closest) {
      var wrapped = control.closest("label");
      if (wrapped) text += " " + wrapped.textContent;
    }

    return text;
  }

  function controlText(control) {
    return [
      control.name,
      control.id,
      control.className,
      control.type,
      control.getAttribute("data-field"),
      control.getAttribute("data-name"),
      control.getAttribute("data-label"),
      control.getAttribute("aria-label"),
      control.getAttribute("placeholder"),
      control.getAttribute("autocomplete"),
      labelText(control)
    ].join(" ").toLowerCase();
  }

  function fieldValue(form, names) {
    var list = controls(form);
    for (var i = 0; i < list.length; i += 1) {
      var control = list[i];
      var text = controlText(control);
      var value = controlValue(control);
      if (!value) continue;

      for (var j = 0; j < names.length; j += 1) {
        if (text.indexOf(names[j]) !== -1) {
          return value;
        }
      }
    }
    return "";
  }

  function normalizeKey(value) {
    return clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function keyForControl(control) {
    return normalizeKey(
      control.name ||
      control.id ||
      control.getAttribute("data-field") ||
      control.getAttribute("data-name") ||
      control.getAttribute("aria-label") ||
      control.getAttribute("placeholder")
    );
  }

  function safeExtraKey(key) {
    if (!key) return false;
    return !/(password|passcode|token|secret|card|cc_|credit|cvv|cvc|ssn|social_security|bank|routing|account_number)/i.test(key);
  }

  function collectExtraFields(form) {
    var extra = {};
    var list = controls(form);

    for (var i = 0; i < list.length; i += 1) {
      var key = keyForControl(list[i]);
      var value = controlValue(list[i]);
      if (!safeExtraKey(key) || !value) continue;

      if (extra[key]) {
        extra[key] = extra[key] + "," + value;
      } else {
        extra[key] = value;
      }
    }

    return extra;
  }

  function splitName(fullName) {
    var parts = clean(fullName).split(/\\s+/).filter(Boolean);
    return {
      first: parts[0] || "",
      last: parts.slice(1).join(" ")
    };
  }

  function compact(payload) {
    var next = {};
    Object.keys(payload).forEach(function(key) {
      var value = payload[key];
      if (value !== "" && value !== null && value !== undefined) {
        next[key] = value;
      }
    });
    return next;
  }

  function buildPayload(form) {
    var extra = collectExtraFields(form);
    var firstName = fieldValue(form, ["first name", "firstname", "given name", "fname"]);
    var lastName = fieldValue(form, ["last name", "lastname", "family name", "surname", "lname"]);
    var fullName = fieldValue(form, ["full name", "fullname", "contact name", "your name", "name"]);
    if ((!fullName || fullName === firstName || fullName === lastName) && (firstName || lastName)) {
      fullName = clean(firstName + " " + lastName);
    }

    var split = splitName(fullName);
    var email = fieldValue(form, ["email", "e-mail", "email address"]);
    var phone = fieldValue(form, ["phone", "mobile", "cell", "tel", "telephone"]);
    var id = fieldValue(form, ["event_id", "event id"]) || eventId();
    var page = window.location.href;
    var payload;

    try {
      window.sessionStorage.setItem("dh_meta_event_id", id);
    } catch (error) {}

    payload = compact({
      event_name: CFG.eventName,
      event_id: id,
      full_name: fullName,
      first_name: firstName || split.first,
      last_name: lastName || split.last,
      email: email,
      phone: phone,
      external_id: (email || phoneDigits(phone)).toLowerCase(),
      business_name: fieldValue(form, ["business name", "company", "company name", "organization", "organisation"]),
      address1: fieldValue(form, ["address", "street", "address 1", "address1"]),
      city: fieldValue(form, ["city", "town"]),
      state: fieldValue(form, ["state", "province", "region"]),
      postal_code: fieldValue(form, ["zip", "zipcode", "zip code", "postal", "postal code"]),
      country: fieldValue(form, ["country"]) || CFG.country,
      source: CFG.source,
      tags: CFG.tags,
      project_type: fieldValue(form, ["project type", "property type", "service type"]) || CFG.projectType,
      project_timeline: fieldValue(form, ["timeline", "project timeline", "when"]) || CFG.projectTimeline,
      landing_page: page,
      page_url: page,
      referrer: document.referrer,
      client_user_agent: window.navigator.userAgent,
      fbclid: getParam("fbclid"),
      fbp: getCookie("_fbp"),
      fbc: getFbc(),
      utm_source: getParam("utm_source") || getParam("hsa_src"),
      utm_medium: getParam("utm_medium"),
      utm_campaign: getParam("utm_campaign") || getParam("hsa_cam"),
      utm_content: getParam("utm_content"),
      utm_term: getParam("utm_term"),
      utm_adset: getParam("utm_adset") || getParam("hsa_grp"),
      utm_ad: getParam("utm_ad") || getParam("hsa_ad"),
      utm_id: getParam("utm_id"),
      hsa_acc: getParam("hsa_acc"),
      hsa_cam: getParam("hsa_cam"),
      hsa_grp: getParam("hsa_grp"),
      hsa_ad: getParam("hsa_ad"),
      hsa_src: getParam("hsa_src"),
      hsa_net: getParam("hsa_net"),
      hsa_ver: getParam("hsa_ver"),
      currency: CFG.currency,
      value: CFG.value,
      submitted_at: new Date().toISOString()
    });

    Object.keys(extra).forEach(function(key) {
      if (payload[key] === undefined) {
        payload[key] = extra[key];
      }
    });

    return compact(payload);
  }

  function firePixel(payload) {
    if (!CFG.firePixel || typeof window.fbq !== "function") return;
    window.fbq("track", CFG.eventName, {
      content_name: "Lead Form",
      content_category: "Sales",
      value: CFG.value,
      currency: CFG.currency
    }, {
      eventID: payload.event_id
    });
  }

  function submitHiddenPost(url, payload) {
    if (!url || url.indexOf("PASTE_") !== -1) return false;

    var iframeName = "dh_capi_" + Math.random().toString(36).slice(2);
    var iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";

    var form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = iframeName;
    form.style.display = "none";

    Object.keys(payload).forEach(function(key) {
      var value = payload[key];
      if (Array.isArray(value)) value = value.join(",");
      if (value === "" || value === null || value === undefined) return;

      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    window.setTimeout(function() {
      if (form.parentNode) form.parentNode.removeChild(form);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 5000);

    return true;
  }

  function postDirect(payload) {
    if (!CFG.endpoint) return;

    var body = JSON.stringify(payload);

    if (window.navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: "application/json" });
        if (window.navigator.sendBeacon(CFG.endpoint, blob)) return;
      } catch (error) {}
    }

    fetch(CFG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
      credentials: "omit"
    }).catch(function() {});
  }

  document.addEventListener("submit", function(event) {
    var target = event.target;
    var form = target && target.closest ? target.closest(CFG.formSelector) : null;
    if (!form) return;
    if (CFG.onlyMetaTraffic && !hasMetaTraffic()) return;

    var payload = buildPayload(form);
    firePixel(payload);

    if (!submitHiddenPost(CFG.ghlWebhookUrl, payload)) {
      postDirect(payload);
    }
  }, true);
})(window, document);
`);
}

function statusPage(clientName) {
  const escapedName = cleanString(clientName).replace(/[<>&"]/g, "");
  return Buffer.from(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedName || "Client"} CAPI Endpoint</title>
    <style>
      body{margin:0;font-family:Inter,system-ui,sans-serif;background:#10141d;color:#fff;display:grid;min-height:100vh;place-items:center}
      main{max-width:620px;padding:32px}
      code{display:block;background:#171d2a;border:1px solid #273044;border-radius:8px;padding:14px;margin-top:18px;color:#c7d8ff;word-break:break-all}
      .pill{display:inline-block;background:#13b98122;color:#72f0c5;border:1px solid #13b98155;border-radius:999px;padding:6px 10px;font-size:13px;font-weight:800}
    </style>
  </head>
  <body>
    <main>
      <span class="pill">Live</span>
      <h1>${escapedName || "Client"} CAPI endpoint is ready.</h1>
      <p>Use the function URL below as the server endpoint for Meta Conversions API forwarding.</p>
      <code>/.netlify/functions/meta-capi-lead</code>
    </main>
  </body>
</html>`);
}

function envVar(key, value, options = {}) {
  const item = {
    key,
    values: [{ context: "all", value }],
    is_secret: Boolean(options.isSecret)
  };

  if (options.scopes) {
    item.scopes = options.scopes;
  }

  return item;
}

function envVars(datasetId, accessToken, graphVersion, options = {}) {
  const scopes = options.scoped ? ["functions"] : undefined;

  return [
    envVar("META_DATASET_ID", datasetId, { scopes }),
    envVar("META_ACCESS_TOKEN", accessToken, {
      scopes,
      isSecret: options.secretToken
    }),
    envVar("META_GRAPH_API_VERSION", graphVersion || "v23.0", { scopes })
  ];
}

function canFallbackToStandardEnv(error) {
  const message = `${error && error.message ? error.message : ""}`.toLowerCase();
  return (
    error &&
    (error.statusCode === 403 || error.statusCode === 422) &&
    (
      message.includes("specific scopes") ||
      message.includes("post_processing") ||
      message.includes("post-processing")
    )
  );
}

async function createSiteEnvVars(accountSlug, siteId, datasetId, accessToken, graphVersion) {
  const envPath = `/accounts/${encodeURIComponent(accountSlug)}/env?site_id=${encodeURIComponent(siteId)}`;

  try {
    await netlifyFetch(envPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envVars(datasetId, accessToken, graphVersion, {
        scoped: true,
        secretToken: true
      }))
    });

    return "scoped-secret";
  } catch (error) {
    if (!canFallbackToStandardEnv(error)) {
      throw error;
    }
  }

  await netlifyFetch(envPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envVars(datasetId, accessToken, graphVersion, {
      scoped: false,
      secretToken: false
    }))
  });

  return "standard-env";
}

async function uploadRequiredDeployFiles(deploy, files, functionZip) {
  const requiredFiles = deploy.required || [];
  const requiredFunctions = deploy.required_functions || [];

  for (const [path, body] of Object.entries(files)) {
    if (requiredFiles.includes(sha1(body))) {
      await netlifyFetch(`/deploys/${deploy.id}/files${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body
      });
    }
  }

  if (requiredFunctions.includes(sha256(functionZip))) {
    await netlifyFetch(`/deploys/${deploy.id}/functions/meta-capi-lead?runtime=js`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: functionZip
    });
  }
}

async function pollDeploy(deployId) {
  let lastDeploy = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    lastDeploy = await netlifyFetch(`/deploys/${deployId}`);
    if (["ready", "error"].includes(lastDeploy.state)) return lastDeploy;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  return lastDeploy;
}

async function verifyEndpoint(endpoint) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(endpoint, { method: "OPTIONS" });
      if (response.ok) return true;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod === "GET") return json(200, provisionerStatus());
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  const user = await authenticatedUser();
  if (!user && !isLocalDevRequest(event)) {
    return json(401, {
      success: false,
      error: "Login required."
    });
  }

  const accountSlug = cleanString(process.env.NETLIFY_ACCOUNT_SLUG);
  if (!accountSlug) {
    return json(500, {
      success: false,
      error: "Server is missing NETLIFY_ACCOUNT_SLUG."
    });
  }

  let input;
  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { success: false, error: "Invalid JSON body." });
  }

  const clientName = cleanString(input.clientName) || "Client";
  const datasetId = cleanString(input.datasetId);
  const accessToken = cleanString(input.accessToken);
  const graphVersion = cleanString(input.graphVersion) || "v23.0";

  if (!datasetId || !accessToken) {
    return json(400, {
      success: false,
      error: "Meta dataset ID and access token are required."
    });
  }

  const siteName = `dh-capi-${slugify(clientName)}-${Date.now().toString(36)}`;

  try {
    await netlifyFetch(`/accounts/${encodeURIComponent(accountSlug)}`);

    const site = await netlifyFetch(`/${encodeURIComponent(accountSlug)}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: siteName })
    });

    const envMode = await createSiteEnvVars(
      accountSlug,
      site.id,
      datasetId,
      accessToken,
      graphVersion
    );

    const indexHtml = statusPage(clientName);
    const trackerJs = trackerScriptSource();
    const staticFiles = {
      "/index.html": indexHtml,
      "/tracker.js": trackerJs
    };
    const functionZip = await buildFunctionZip();

    const deploy = await netlifyFetch(`/sites/${encodeURIComponent(site.id)}/deploys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: Object.fromEntries(
          Object.entries(staticFiles).map(([path, body]) => [path, sha1(body)])
        ),
        functions: {
          "meta-capi-lead": sha256(functionZip)
        }
      })
    });

    await uploadRequiredDeployFiles(deploy, staticFiles, functionZip);
    const finalDeploy = await pollDeploy(deploy.id);

    const baseUrl = site.ssl_url || `https://${site.name || siteName}.netlify.app`;
    const endpoint = `${baseUrl.replace(/\/$/, "")}/.netlify/functions/meta-capi-lead`;
    const tracker_url = `${baseUrl.replace(/\/$/, "")}/tracker.js`;
    const verified = await verifyEndpoint(endpoint);

    return json(200, {
      success: true,
      endpoint,
      tracker_url,
      site_name: site.name,
      site_id: site.id,
      site_url: baseUrl,
      admin_url: site.admin_url,
      deploy_state: finalDeploy ? finalDeploy.state : deploy.state,
      verified,
      env_mode: envMode
    });
  } catch (error) {
    return json(error.statusCode || 500, {
      success: false,
      error: error.message || "Could not create CAPI endpoint."
    });
  }
};
