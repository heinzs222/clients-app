import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Clipboard,
  Database,
  Eye,
  EyeOff,
  Gauge,
  HelpCircle,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Plus,
  Rocket,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import {
  AUTH_EVENTS,
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  requestPasswordRecovery,
  signup,
  updateUser
} from "@netlify/identity";
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "dh:capi-launcher:clients";

const defaultClient = {
  clientName: "New Client",
  clientSlug: "new-client",
  websiteUrl: "https://example.com",
  netlifyEndpoint: "https://client-name.netlify.app/.netlify/functions/meta-capi-lead",
  trackerUrl: "https://client-name.netlify.app/tracker.js",
  ghlWebhookUrl: "",
  datasetId: "",
  accessToken: "",
  graphVersion: "v23.0",
  eventName: "Lead",
  formSelector: "form",
  onlyMetaTraffic: true,
  firePixel: true,
  country: "US",
  currency: "USD",
  leadValue: "1.00",
  successUrlContains: "",
  fields: {
    email: true,
    phone: true,
    name: true,
    address: true,
    fbpFbc: true,
    externalId: true,
    ipUserAgent: true,
    eventId: true
  }
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "client";
}

function cleanDatasetId(value) {
  return value.replace(/\D/g, "");
}

function cleanAccessToken(value) {
  const compact = value.replace(/\s+/g, "");
  const match = compact.match(/EAA[A-Za-z0-9_-]+/);
  return match ? match[0] : compact;
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHostedTrackerTag(client, trackerUrl) {
  const url = trackerUrl || client.trackerUrl;
  const webhookUrl = client.ghlWebhookUrl || "PASTE_GHL_INBOUND_WEBHOOK_URL";

  return `<script src="${escapeAttribute(url)}" data-ghl-webhook-url="${escapeAttribute(webhookUrl)}" defer></script>`;
}

function scoreClient(client) {
  const weights = {
    email: 22,
    phone: 20,
    name: 12,
    address: 8,
    fbpFbc: 14,
    externalId: 8,
    ipUserAgent: 10,
    eventId: 6
  };

  return Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (client.fields[key] ? weight : 0);
  }, 0);
}

function rating(score) {
  if (score >= 90) return { label: "Excellent setup", tone: "excellent" };
  if (score >= 74) return { label: "Strong setup", tone: "strong" };
  if (score >= 55) return { label: "Useful, not complete", tone: "medium" };
  return { label: "Needs more match data", tone: "low" };
}

function buildDropInSnippet(client) {
  const cfg = {
    endpoint: client.netlifyEndpoint,
    eventName: client.eventName || "Lead",
    formSelector: client.formSelector || "form",
    onlyMetaTraffic: Boolean(client.onlyMetaTraffic),
    firePixel: Boolean(client.firePixel),
    country: client.country || "US",
    currency: client.currency || "USD",
    leadValue: Number(client.leadValue || 1),
    successUrlContains: client.successUrlContains || ""
  };

  return `<script>
(function(w, d) {
  'use strict';

  var CFG = ${JSON.stringify(cfg, null, 2)};

  function getParam(name) {
    return new URLSearchParams(w.location.search).get(name) || '';
  }

  function getCookie(name) {
    var match = d.cookie.split('; ').find(function(row) {
      return row.indexOf(name + '=') === 0;
    });
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
  }

  function hasMetaTraffic() {
    var source = (getParam('utm_source') || '').toLowerCase();
    return Boolean(getParam('fbclid') || getCookie('_fbc') || getCookie('_fbp') || source.indexOf('fb') !== -1 || source.indexOf('facebook') !== -1 || source.indexOf('meta') !== -1);
  }

  function getFbc() {
    var existing = getCookie('_fbc');
    var fbclid = getParam('fbclid');
    if (existing) return existing;
    if (fbclid) return 'fb.1.' + Date.now() + '.' + fbclid;
    return '';
  }

  function eventId() {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
  }

  function normalize(value) {
    return (value || '').toString().trim();
  }

  function cleanPhone(value) {
    return normalize(value).replace(/\\D/g, '');
  }

  function findField(form, names) {
    var controls = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));
    var match = controls.find(function(control) {
      var haystack = [
        control.name,
        control.id,
        control.getAttribute('aria-label'),
        control.getAttribute('placeholder'),
        control.getAttribute('autocomplete')
      ].join(' ').toLowerCase();

      return names.some(function(name) {
        return haystack.indexOf(name) !== -1;
      });
    });

    return match ? normalize(match.value) : '';
  }

  function splitName(fullName) {
    var parts = normalize(fullName).split(/\\s+/).filter(Boolean);
    return {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ')
    };
  }

  function buildPayload(form) {
    var fullName = findField(form, ['full name', 'fullname', 'name']);
    var split = splitName(fullName);
    var email = findField(form, ['email', 'e-mail']);
    var phone = findField(form, ['phone', 'mobile', 'cell', 'tel']);
    var event_id = eventId();

    try {
      sessionStorage.setItem('dh_last_meta_event_id', event_id);
    } catch (error) {}

    return {
      event_name: CFG.eventName,
      event_id: event_id,
      full_name: fullName,
      first_name: findField(form, ['first name', 'firstname']) || split.first_name,
      last_name: findField(form, ['last name', 'lastname']) || split.last_name,
      email: email,
      phone: phone,
      external_id: (email || cleanPhone(phone)).toLowerCase(),
      address1: findField(form, ['address', 'street']),
      city: findField(form, ['city']),
      state: findField(form, ['state', 'province', 'region']),
      postal_code: findField(form, ['zip', 'postal']),
      country: CFG.country,
      landing_page: w.location.href,
      page_url: w.location.href,
      referrer: d.referrer,
      client_user_agent: navigator.userAgent,
      fbclid: getParam('fbclid'),
      fbp: getCookie('_fbp'),
      fbc: getFbc(),
      utm_source: getParam('utm_source') || getParam('hsa_src'),
      utm_medium: getParam('utm_medium'),
      utm_campaign: getParam('utm_campaign') || getParam('hsa_cam'),
      utm_content: getParam('utm_content'),
      utm_term: getParam('utm_term'),
      utm_adset: getParam('utm_adset') || getParam('hsa_grp'),
      utm_ad: getParam('utm_ad') || getParam('hsa_ad'),
      utm_id: getParam('utm_id'),
      hsa_acc: getParam('hsa_acc'),
      hsa_cam: getParam('hsa_cam'),
      hsa_grp: getParam('hsa_grp'),
      hsa_ad: getParam('hsa_ad'),
      hsa_src: getParam('hsa_src'),
      hsa_net: getParam('hsa_net'),
      hsa_ver: getParam('hsa_ver'),
      submitted_at: new Date().toISOString()
    };
  }

  function compact(payload) {
    return Object.keys(payload).reduce(function(next, key) {
      if (payload[key] !== '' && payload[key] !== null && payload[key] !== undefined) {
        next[key] = payload[key];
      }
      return next;
    }, {});
  }

  function fireBrowserPixel(payload) {
    if (!CFG.firePixel || typeof w.fbq !== 'function') return;

    w.fbq('track', CFG.eventName, {
      content_name: 'Lead Form',
      content_category: 'Sales',
      value: CFG.leadValue,
      currency: CFG.currency
    }, {
      eventID: payload.event_id
    });
  }

  function send(payload) {
    var body = JSON.stringify(compact(payload));
    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(CFG.endpoint, blob)) return;
    }

    fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: true,
      credentials: 'omit'
    }).catch(function() {});
  }

  d.addEventListener('submit', function(event) {
    var form = event.target.closest(CFG.formSelector);
    if (!form) return;
    if (CFG.onlyMetaTraffic && !hasMetaTraffic()) return;

    var payload = buildPayload(form);
    fireBrowserPixel(payload);
    send(payload);
  }, true);
})(window, document);
</script>`;
}

function buildNetlifyFunction() {
  return `const crypto = require("crypto");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function getString(value) {
  if (typeof value !== "string") return "";
  var trimmed = value.trim();
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
    var array = value.map(removeEmpty).filter(function(item) {
      return item !== undefined;
    });
    return array.length ? array : undefined;
  }

  if (value && typeof value === "object") {
    var next = {};
    Object.keys(value).forEach(function(key) {
      var cleaned = removeEmpty(value[key]);
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
  var fullName = getString(input.full_name);
  var parts = fullName.split(/\\s+/).filter(Boolean);
  return {
    first: normalizeText(input.first_name) || normalizeText(parts[0] || ""),
    last: normalizeText(input.last_name) || normalizeText(parts.slice(1).join(" "))
  };
}

function buildUserData(input, event) {
  var names = splitName(input);
  var email = normalizeText(input.email);
  var phone = normalizePhone(input.phone);
  var externalId = normalizeText(input.external_id) || email || phone;
  var city = normalizeText(input.city);
  var state = normalizeText(input.state);
  var postal = normalizeText(input.postal_code);
  var country = normalizeText(input.country);

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
  var eventName = getString(input.event_name) || "Lead";
  var eventId = getString(input.event_id) || crypto.randomUUID();
  var eventSourceUrl = getString(input.landing_page) || getString(input.page_url);

  return {
    payload: removeEmpty({
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: buildUserData(input, event),
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
    }),
    eventId,
    eventName
  };
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { success: false, error: "Method not allowed" });

  var datasetId = getString(process.env.META_DATASET_ID);
  var accessToken = getString(process.env.META_ACCESS_TOKEN);
  var version = getString(process.env.META_GRAPH_API_VERSION) || "v23.0";

  if (!datasetId || !accessToken) {
    return json(500, { success: false, error: "Missing META_DATASET_ID or META_ACCESS_TOKEN" });
  }

  var input;
  try {
    input = parseBody(event);
  } catch {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  var built = buildPayload(input, event);
  var url = "https://graph.facebook.com/" + encodeURIComponent(version) + "/" + encodeURIComponent(datasetId) + "/events?access_token=" + encodeURIComponent(accessToken);

  try {
    var response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(built.payload)
    });
    var meta = await response.json().catch(function() {
      return {};
    });

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
  } catch (error) {
    return json(502, {
      success: false,
      error: "Meta request failed",
      event_id: built.eventId,
      event_name: built.eventName
    });
  }
};`;
}

function buildEnv(client) {
  return `META_DATASET_ID=${client.datasetId || "replace_me"}
META_ACCESS_TOKEN=${client.accessToken || "replace_me"}
META_GRAPH_API_VERSION=${client.graphVersion || "v23.0"}`;
}

function buildGhlBody() {
  return JSON.stringify(
    {
      event_name: "Lead",
      event_id: "{{inboundWebhookRequest.event_id}}",
      full_name: "{{inboundWebhookRequest.full_name}}",
      first_name: "{{inboundWebhookRequest.first_name}}",
      last_name: "{{inboundWebhookRequest.last_name}}",
      email: "{{inboundWebhookRequest.email}}",
      phone: "{{inboundWebhookRequest.phone}}",
      external_id: "{{inboundWebhookRequest.external_id}}",
      client_ip_address: "{{inboundWebhookRequest.headers.cf-connecting-ip}}",
      address1: "{{inboundWebhookRequest.address1}}",
      city: "{{inboundWebhookRequest.city}}",
      state: "{{inboundWebhookRequest.state}}",
      postal_code: "{{inboundWebhookRequest.postal_code}}",
      country: "{{inboundWebhookRequest.country}}",
      source: "{{inboundWebhookRequest.source}}",
      tags: "{{inboundWebhookRequest.tags}}",
      project_type: "{{inboundWebhookRequest.project_type}}",
      project_timeline: "{{inboundWebhookRequest.project_timeline}}",
      landing_page: "{{inboundWebhookRequest.landing_page}}",
      page_url: "{{inboundWebhookRequest.page_url}}",
      referrer: "{{inboundWebhookRequest.referrer}}",
      client_user_agent: "{{inboundWebhookRequest.client_user_agent}}",
      fbclid: "{{inboundWebhookRequest.fbclid}}",
      fbp: "{{inboundWebhookRequest.fbp}}",
      fbc: "{{inboundWebhookRequest.fbc}}",
      utm_source: "{{inboundWebhookRequest.utm_source}}",
      utm_medium: "{{inboundWebhookRequest.utm_medium}}",
      utm_campaign: "{{inboundWebhookRequest.utm_campaign}}",
      utm_content: "{{inboundWebhookRequest.utm_content}}",
      utm_term: "{{inboundWebhookRequest.utm_term}}",
      utm_adset: "{{inboundWebhookRequest.utm_adset}}",
      utm_ad: "{{inboundWebhookRequest.utm_ad}}",
      utm_id: "{{inboundWebhookRequest.utm_id}}",
      hsa_acc: "{{inboundWebhookRequest.hsa_acc}}",
      hsa_cam: "{{inboundWebhookRequest.hsa_cam}}",
      hsa_grp: "{{inboundWebhookRequest.hsa_grp}}",
      hsa_ad: "{{inboundWebhookRequest.hsa_ad}}",
      hsa_src: "{{inboundWebhookRequest.hsa_src}}",
      hsa_net: "{{inboundWebhookRequest.hsa_net}}",
      hsa_ver: "{{inboundWebhookRequest.hsa_ver}}",
      submitted_at: "{{inboundWebhookRequest.submitted_at}}"
    },
    null,
    2
  );
}

function buildQaChecklist(client) {
  return `Setup checklist for ${client.clientName}

1. Create a dedicated Netlify site or function for this client.
2. Add these environment variables in Netlify:
   - META_DATASET_ID
   - META_ACCESS_TOKEN
   - META_GRAPH_API_VERSION
3. Deploy netlify/functions/meta-capi-lead.js.
4. Add the page snippet to the actual form page, not an iframe wrapper.
5. Submit one test lead from a Meta-style URL:
   ${client.websiteUrl}?utm_source=fb_ad&utm_medium=paid&fbclid=test_click_id
6. Confirm the Netlify response returns success true and an event_id.
7. Confirm Meta Events Manager receives:
   - ${client.eventName || "Lead"}
   - event_id
   - fbp
   - fbc
   - client_ip_address
   - client_user_agent
   - hashed email/phone/name when available
   - external_id
8. If GHL is in the flow, map the GHL body tab into the Custom Webhook action.
9. Do not put the Meta access token in browser code.

Expectation:
This setup gives Meta the strongest available match data from the page and form. It is built to improve EMQ, but the final score still depends on Meta's ability to match the submitted user data.`;
}

function TextInput({ label, value, onChange, icon: Icon, type = "text", placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputShell">
        {Icon ? <Icon size={16} /> : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function Toggle({ checked, onChange, label, detail }) {
  return (
    <button
      className={`toggle ${checked ? "on" : ""}`}
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="toggleBox">{checked ? <Check size={14} /> : null}</span>
      <span>
        <strong>{label}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
    </button>
  );
}

function CopyButton({ value, id, copied, setCopied }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <button className="iconButton primary" type="button" onClick={copy}>
      {copied === id ? <Check size={16} /> : <Clipboard size={16} />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

function AuthInput({ label, value, onChange, type = "text", placeholder, autoComplete }) {
  return (
    <label className="stitchField">
      <span>{label}</span>
      <div className="stitchInput">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function StitchFooter() {
  return (
    <footer className="stitchFooter">
      <div>
        <strong>CAPI Launcher</strong>
        <span>Â© 2026 CAPI Launcher. All rights reserved.</span>
      </div>
      <nav>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#status">Status</a>
        <a href="#contact">Contact</a>
      </nav>
    </footer>
  );
}

function StitchCopyButton({ value, id, copied, setCopied }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <button className="stitchCopyBtn" type="button" onClick={copy}>
      {copied === id ? <Check size={16} /> : <Clipboard size={16} />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

function StitchSideNav({ userEmail, active, onLogout, authBusy }) {
  return (
    <nav className="stitchSideNav">
      <div className="stitchSideHeader">
        <div className="stitchSideMark"><Rocket size={22} /></div>
        <div>
          <h1>CAPI Launcher</h1>
          <p>Pro Plan</p>
        </div>
      </div>

      <button className="stitchSideCta" type="button">
        <Plus size={18} />
        New Endpoint
      </button>

      <div className="stitchNavLinks">
        <button className={active === "dashboard" ? "active" : ""} type="button"><Gauge size={19} /> Dashboard</button>
        <button className={active === "endpoints" ? "active" : ""} type="button"><Database size={19} /> Endpoints</button>
        <button className={active === "setup" ? "active" : ""} type="button"><Wand2 size={19} /> Setup Wizard</button>
        <button className={active === "tracking" ? "active" : ""} type="button"><Server size={19} /> Tracking</button>
      </div>

      <div className="stitchSideFooter">
        <div className="stitchUserBlock">
          <div>{(userEmail || "U").slice(0, 2).toUpperCase()}</div>
          <span>{userEmail}</span>
        </div>
        <button type="button"><BookOpen size={18} /> Documentation</button>
        <button type="button"><LifeBuoy size={18} /> Support</button>
        <button type="button" onClick={onLogout} disabled={authBusy}><LockKeyhole size={18} /> Logout</button>
      </div>
    </nav>
  );
}

function StitchProgress({ provisionStatus }) {
  const isProvisioned = provisionStatus === "success";
  const isProvisioning = provisionStatus === "loading" || isProvisioned;

  return (
    <div className="stitchProgress">
      <div className="stitchProgressStep active">
        <span>1</span>
        <strong>Client Configuration</strong>
      </div>
      <i />
      <div className={`stitchProgressStep ${isProvisioning ? "active" : ""}`}>
        <span>2</span>
        <strong>Provision Server</strong>
      </div>
      <i />
      <div className={`stitchProgressStep ${isProvisioned ? "active" : ""}`}>
        <span>3</span>
        <strong>Verify Connection</strong>
      </div>
    </div>
  );
}

function StitchSetupWizard({
  client,
  patchClient,
  updateName,
  showToken,
  setShowToken,
  provision,
  backend,
  createClientEndpoint
}) {
  return (
    <main className="stitchMain">
      <header className="stitchPageHeader">
        <h2>Create New Endpoint</h2>
        <p>Configure your new Conversions API endpoint. We&apos;ll guide you through connecting your Meta dataset and provisioning the server infrastructure.</p>
      </header>

      <StitchProgress provisionStatus={provision.status} />

      <div className="stitchWizardGrid">
        <section className="stitchWizardCard">
          <h3>Client Details</h3>

          <div className="stitchFormStack">
            <label className="stitchField">
              <span>Client / Project Name</span>
              <div className="stitchInput">
                <input
                  type="text"
                  value={client.clientName}
                  placeholder="e.g. Acme Corp Web Store"
                  onChange={(event) => updateName(event.target.value)}
                />
              </div>
              <small>A recognizable name to identify this endpoint in your dashboard.</small>
            </label>

            <label className="stitchField">
              <span>Meta Dataset ID (Pixel ID)</span>
              <div className="stitchInput hasIcon">
                <Database size={18} />
                <input
                  type="text"
                  value={client.datasetId}
                  placeholder="e.g. 123456789012345"
                  onChange={(event) => patchClient({ datasetId: cleanDatasetId(event.target.value) })}
                />
              </div>
            </label>

            <label className="stitchField">
              <span>Conversions API Access Token</span>
              <div className="stitchInput hasIcon">
                <KeyRound size={18} />
                <input
                  type={showToken ? "text" : "password"}
                  value={client.accessToken}
                  placeholder="Paste your long-lived access token here"
                  onChange={(event) => patchClient({ accessToken: cleanAccessToken(event.target.value) })}
                />
                <button className="stitchInputAction" type="button" onClick={() => setShowToken((value) => !value)}>
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small>Generate this token in Meta Events Manager under Settings &gt; Conversions API.</small>
            </label>

            <label className="stitchField">
              <span>GHL Inbound Webhook URL optional</span>
              <div className="stitchInput hasIcon">
                <Server size={18} />
                <input
                  type="url"
                  value={client.ghlWebhookUrl}
                  placeholder="https://services.leadconnectorhq.com/hooks/..."
                  onChange={(event) => patchClient({ ghlWebhookUrl: event.target.value.trim() })}
                />
              </div>
            </label>

            {!backend.ready ? (
              <div className={`stitchAlert ${backend.status === "checking" ? "notice" : "error"}`}>
                <AlertCircle size={16} />
                {backend.message}
              </div>
            ) : null}

            {provision.status === "error" ? (
              <div className="stitchAlert error">
                <AlertCircle size={16} />
                {provision.error}
              </div>
            ) : null}

            <div className="stitchWizardActions">
              <button className="stitchGhostBtn" type="button">Cancel</button>
              <button
                className="stitchPrimaryBtn"
                type="button"
                onClick={createClientEndpoint}
                disabled={provision.status === "loading" || !backend.ready || !cleanDatasetId(client.datasetId) || !cleanAccessToken(client.accessToken)}
              >
                {provision.status === "loading" ? "Provisioning Endpoint..." : "Next: Provision Endpoint"}
                {provision.status !== "loading" ? <ArrowRight size={18} /> : null}
              </button>
            </div>
          </div>
        </section>

        <aside className="stitchGuideCard">
          <div>
            <HelpCircle size={22} />
            <h4>Setup Guide</h4>
          </div>
          <p>To configure your endpoint, you need two pieces of information from Meta Business Manager:</p>
          <ol>
            <li>Go to Data Sources in Events Manager.</li>
            <li>Select your Pixel or Dataset.</li>
            <li>Open the Settings tab.</li>
            <li>Copy the Dataset ID.</li>
            <li>Generate the Conversions API access token.</li>
          </ol>
        </aside>
      </div>
    </main>
  );
}

function StitchTrackingConfig({ client, provision, copied, setCopied }) {
  const scriptTag = buildHostedTrackerTag(client, provision.trackerUrl);
  const ghlBody = buildGhlBody();

  return (
    <main className="stitchMain">
      <header className="stitchPageHeader">
        <h2>Tracking Configuration</h2>
        <p>Complete your integration by adding the tracking script to the form page and mapping the GHL workflow webhook.</p>
      </header>

      <section className="stitchDeployBanner">
        <div>
          <span><Check size={22} /></span>
          <div>
            <h3>Successfully Deployed to Netlify</h3>
            <p>Your endpoint is live and ready to receive events.</p>
          </div>
        </div>
        <p><i /> System Active</p>
      </section>

      <div className="stitchTrackingGrid">
        <section className="stitchTrackingCard">
          <header>
            <h3><Code2 size={22} /> Your Tracking Script</h3>
            <StitchCopyButton value={scriptTag} id="tracker-tag" copied={copied} setCopied={setCopied} />
          </header>
          <p>Paste this code snippet into the actual custom form page.</p>
          <pre><code>{scriptTag}</code></pre>
        </section>

        <section className="stitchTrackingCard">
          <header>
            <h3><Route size={22} /> GHL Webhook Mapping</h3>
            <StitchCopyButton value={ghlBody} id="ghl-body" copied={copied} setCopied={setCopied} />
          </header>
          <p>Use this endpoint as the GHL workflow custom webhook URL.</p>
          <label className="stitchField">
            <span>Endpoint URL</span>
            <div className="stitchInput code">
              <input value={provision.endpoint} readOnly />
              <StitchCopyButton value={provision.endpoint} id="endpoint" copied={copied} setCopied={setCopied} />
            </div>
          </label>
          <pre><code>{ghlBody}</code></pre>
        </section>
      </div>
    </main>
  );
}

function AuthScreen({
  mode,
  setMode,
  authForm,
  patchAuthForm,
  onLogin,
  onRegister,
  onForgot,
  onReset,
  onPreview,
  busy,
  error,
  message,
  callbackReady
}) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const canPreview = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  function submit(event) {
    event.preventDefault();
    if (isLogin) onLogin();
    if (isRegister) onRegister();
    if (isForgot) onForgot();
    if (isReset) onReset();
  }

  if (isRegister) {
    return (
      <div className="stitchAuthPage">
        <header className="stitchTopNav">
          <div className="stitchTopInner">
            <a className="stitchLogoText" href="#home">CAPI Launcher</a>
            <nav>
              <a href="#product">Product</a>
              <a href="#solutions">Solutions</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Docs</a>
            </nav>
            <div className="stitchTopActions">
              <button type="button" onClick={() => setMode("login")}>Log In</button>
              <button type="button" onClick={() => setMode("register")}>Get Started</button>
            </div>
          </div>
        </header>

        <main className="stitchRegisterMain">
          <section className="stitchRegisterGrid">
            <div className="stitchRegisterForm">
              <div className="stitchAuthTitle">
                <h1>Create your account</h1>
                <p>Start building high-speed Meta CAPI endpoints today.</p>
              </div>

              <form className="stitchFormStack" onSubmit={submit}>
                <AuthInput
                  label="Full Name"
                  value={authForm.fullName}
                  onChange={(value) => patchAuthForm({ fullName: value })}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
                <AuthInput
                  label="Work Email"
                  value={authForm.email}
                  onChange={(value) => patchAuthForm({ email: value })}
                  type="email"
                  placeholder="jane@company.com"
                  autoComplete="email"
                />
                <AuthInput
                  label="Password"
                  value={authForm.password}
                  onChange={(value) => patchAuthForm({ password: value })}
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                />
                <AuthInput
                  label="Confirm Password"
                  value={authForm.confirmPassword}
                  onChange={(value) => patchAuthForm({ confirmPassword: value })}
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                />

                {error ? <div className="stitchAlert error"><AlertCircle size={16} />{error}</div> : null}
                {message ? <div className="stitchAlert success"><Check size={16} />{message}</div> : null}

                <button className="stitchPrimaryBtn" type="submit" disabled={busy}>
                  {busy ? "Working..." : "Sign Up"}
                </button>
              </form>

              <div className="stitchAuthFineprint">
                <p>By signing up, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p>
                <p>Already have an account? <button type="button" onClick={() => setMode("login")}>Log In</button></p>
              </div>
            </div>

            <aside className="stitchValuePanel">
              <div className="stitchGlass">
                <div className="stitchBadge"><Sparkles size={16} /> Pro Plan Default</div>
                <h2>Start with maximum power.</h2>
                <p>New accounts can create dedicated client endpoints, hosted trackers, and GHL mapping templates from one secure workspace.</p>
                <ul>
                  <li><Check size={18} /> Separate Netlify endpoint per client</li>
                  <li><Check size={18} /> Server-side token storage</li>
                  <li><Check size={18} /> Hosted tracker and CAPI bridge</li>
                </ul>
              </div>
            </aside>
          </section>
        </main>

        <StitchFooter />
      </div>
    );
  }

  return (
    <div className="stitchAuthPage">
      <main className="stitchLoginMain">
        <section className="stitchLoginCard">
          <div className="stitchLoginHeader">
            <div className="stitchIconBox"><Rocket size={28} /></div>
            <h1>{isForgot ? "Recover access" : isReset ? "Set a new password" : "Welcome Back"}</h1>
            <p>{isForgot ? "Send a secure password reset link to your email." : isReset ? "Complete the secure recovery flow." : "Log in to CAPI Launcher to continue managing your pipelines."}</p>
          </div>

          <div className="stitchLoginBody">
            <form className="stitchFormStack" onSubmit={submit}>
              {!isReset ? (
                <label className="stitchField">
                  <span>Email Address</span>
                  <div className="stitchInput hasIcon">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={authForm.email}
                      placeholder="developer@company.com"
                      autoComplete="email"
                      onChange={(event) => patchAuthForm({ email: event.target.value })}
                    />
                  </div>
                </label>
              ) : null}

              {isLogin || isReset ? (
                <label className="stitchField">
                  <span>{isReset ? "New Password" : "Password"}</span>
                  {isLogin ? <button className="fieldLink" type="button" onClick={() => setMode("forgot")}>Forgot password?</button> : null}
                  <div className="stitchInput hasIcon">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      value={authForm.password}
                      placeholder="********"
                      autoComplete={isReset ? "new-password" : "current-password"}
                      onChange={(event) => patchAuthForm({ password: event.target.value })}
                    />
                  </div>
                </label>
              ) : null}

              {isReset ? (
                <AuthInput
                  label="Confirm Password"
                  value={authForm.confirmPassword}
                  onChange={(value) => patchAuthForm({ confirmPassword: value })}
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                />
              ) : null}

              {error ? <div className="stitchAlert error"><AlertCircle size={16} />{error}</div> : null}
              {message ? <div className="stitchAlert success"><Check size={16} />{message}</div> : null}
              {isReset && !callbackReady ? <div className="stitchAlert error"><AlertCircle size={16} />Open this screen from the secure email link.</div> : null}

              <button className="stitchPrimaryBtn" type="submit" disabled={busy || (isReset && !callbackReady)}>
                {busy ? "Working..." : isForgot ? "Send secure reset link" : isReset ? "Update password" : "Log In"}
                {!busy ? <ArrowRight size={18} /> : null}
              </button>
            </form>

            {isLogin ? (
              <div className="stitchDivider"><span>Or continue with</span></div>
            ) : null}

            {isLogin ? (
              <div className="stitchDisabledSocials">
                <button type="button" disabled>Google</button>
                <button type="button" disabled>GitHub</button>
              </div>
            ) : null}

            {canPreview ? (
              <button className="stitchPreviewBtn" type="button" onClick={onPreview}>
                Preview app locally
              </button>
            ) : null}

            <div className="stitchAuthFineprint">
              {isLogin ? <p>Don't have an account? <button type="button" onClick={() => setMode("register")}>Sign up</button></p> : null}
              {isForgot || isReset ? <p><button type="button" onClick={() => setMode("login")}>Back to login</button></p> : null}
            </div>
          </div>
        </section>
      </main>
      <StitchFooter />
    </div>
  );
}

export default function App() {
  const [client, setClient] = useState(defaultClient);
  const [copied, setCopied] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const [authMode, setAuthMode] = useState("login");
  const [localPreview, setLocalPreview] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [callbackReady, setCallbackReady] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [provision, setProvision] = useState({
    status: "idle",
    endpoint: "",
    trackerUrl: "",
    siteUrl: "",
    adminUrl: "",
    error: ""
  });
  const [backend, setBackend] = useState({
    status: "checking",
    ready: false,
    message: "Checking provisioning backend..."
  });

  useEffect(() => {
    initializeAuth();
    checkBackend();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((event, user) => {
      if (event === AUTH_EVENTS.RECOVERY) {
        setAuthMode("reset");
        setCallbackReady(true);
      }

      if (event === AUTH_EVENTS.LOGOUT) {
        setAuthUser(null);
        setAuthMode("login");
      } else if (user) {
        setAuthUser(user);
      }
    });

    return unsubscribe;
  }, []);

  function patchAuthForm(patch) {
    setAuthForm((current) => ({ ...current, ...patch }));
  }

  function resetAuthFeedback() {
    setAuthError("");
    setAuthMessage("");
  }

  function friendlyAuthError(error) {
    const message = error && error.message ? error.message : "Authentication failed.";
    if (message.toLowerCase().includes("identity")) {
      return "Netlify Identity is not enabled for this app yet. Enable Identity on the Netlify project first.";
    }
    return message;
  }

  function validatePasswordPair() {
    if (authForm.password.length < 8) {
      setAuthError("Use at least 8 characters for the password.");
      return false;
    }

    if (authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return false;
    }

    return true;
  }

  async function initializeAuth() {
    setAuthStatus("checking");
    resetAuthFeedback();

    try {
      const callback = await handleAuthCallback();
      if (callback && callback.type === "recovery") {
        setAuthMode("reset");
        setCallbackReady(true);
        setAuthMessage("Recovery link verified. Set a new password.");
      } else if (callback && callback.type === "confirmation") {
        setAuthMode("login");
        setAuthMessage("Email confirmed. You can log in now.");
      } else if (callback && callback.type === "invite") {
        setAuthMode("reset");
        setCallbackReady(true);
        setInviteToken(callback.token || "");
        setAuthMessage("Invite link verified. Set your password.");
      }

      const user = await getUser();
      setAuthUser(user);
      setAuthStatus("ready");
    } catch (error) {
      setAuthStatus("ready");
      setAuthError(friendlyAuthError(error));
    }
  }

  async function submitLogin() {
    resetAuthFeedback();
    setAuthBusy(true);

    try {
      const user = await login(authForm.email.trim(), authForm.password);
      setAuthUser(user);
      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setAuthMode("login");
      await checkBackend();
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitRegister() {
    resetAuthFeedback();

    if (!validatePasswordPair()) return;

    setAuthBusy(true);

    try {
      const user = await signup(authForm.email.trim(), authForm.password, {
        full_name: authForm.fullName.trim()
      });

      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));

      if (user && user.confirmedAt) {
        setAuthUser(user);
        await checkBackend();
      } else {
        setAuthMode("login");
        setAuthMessage("Account created. Check your email for the secure confirmation link.");
      }
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitForgotPassword() {
    resetAuthFeedback();
    setAuthBusy(true);

    try {
      await requestPasswordRecovery(authForm.email.trim());
      setAuthMessage("If that account exists, Netlify sent a secure password reset link.");
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitResetPassword() {
    resetAuthFeedback();

    if (!validatePasswordPair()) return;

    setAuthBusy(true);

    try {
      const user = inviteToken
        ? await acceptInvite(inviteToken, authForm.password)
        : await updateUser({ password: authForm.password });
      setAuthUser(user || await getUser());
      setCallbackReady(false);
      setInviteToken("");
      setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setAuthMessage("Password set. You are logged in.");
      await checkBackend();
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitLogout() {
    resetAuthFeedback();
    setAuthBusy(true);

    try {
      await logout();
      setAuthUser(null);
      setLocalPreview(false);
      setAuthMode("login");
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function checkBackend() {
    setBackend({
      status: "checking",
      ready: false,
      message: "Checking provisioning backend..."
    });

    try {
      const response = await fetch("/.netlify/functions/create-client-capi");
      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Provisioning backend is not running. Open this through Netlify Dev or the deployed Netlify app.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Provisioning backend is not available.");
      }

      setBackend({
        status: data.ready ? "ready" : "missing",
        ready: Boolean(data.ready),
        message: data.message || (data.ready ? "Provisioning backend is ready." : "Provisioning backend is missing setup.")
      });
    } catch (error) {
      setBackend({
        status: "offline",
        ready: false,
        message: error.message
      });
    }
  }

  function patchClient(patch) {
    setClient((current) => ({ ...current, ...patch }));
  }

  function updateName(value) {
    setClient((current) => ({
      ...current,
      clientName: value,
      clientSlug: current.clientSlug === slugify(current.clientName) ? slugify(value) : current.clientSlug
    }));
  }

  async function createClientEndpoint() {
    const datasetId = cleanDatasetId(client.datasetId);
    const accessToken = cleanAccessToken(client.accessToken);

    if (!backend.ready) {
      setProvision({
        status: "error",
        endpoint: "",
        trackerUrl: "",
        siteUrl: "",
        adminUrl: "",
        error: backend.message
      });
      return;
    }

    setProvision({
      status: "loading",
      endpoint: "",
      trackerUrl: "",
      siteUrl: "",
      adminUrl: "",
      error: ""
    });

    try {
      const response = await fetch("/.netlify/functions/create-client-capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: client.clientName,
          datasetId,
          accessToken,
          graphVersion: client.graphVersion
        })
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("The Netlify provisioning function is not running. Open this app through Netlify Dev or deploy it to Netlify first.");
      }

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          throw new Error("The Netlify provisioning function is not running. Open this app through Netlify Dev or deploy it to Netlify first.");
        }
        throw new Error(data.error || "Could not create the Netlify endpoint. Check NETLIFY_AUTH_TOKEN and NETLIFY_ACCOUNT_SLUG on the app host.");
      }

      setProvision({
        status: "success",
        endpoint: data.endpoint,
        trackerUrl: data.tracker_url || "",
        siteUrl: data.site_url,
        adminUrl: data.admin_url,
        error: data.verified ? "" : "Endpoint was created, but verification did not finish yet. Wait a minute and test the link."
      });
      patchClient({
        netlifyEndpoint: data.endpoint,
        trackerUrl: data.tracker_url || ""
      });
    } catch (error) {
      setProvision({
        status: "error",
        endpoint: "",
        trackerUrl: "",
        siteUrl: "",
        adminUrl: "",
          error: error.message.includes("Unexpected token")
            ? "Provisioning backend is not available here. Deploy this app on Netlify or run it with Netlify Dev."
            : error.message
      });
    }
  }

  if (authStatus === "checking") {
    return (
      <div className="stitchAuthPage">
        <main className="stitchLoginMain">
          <div className="stitchLoginCard">
            <div className="stitchLoginHeader">
              <div className="stitchIconBox"><Rocket size={28} /></div>
              <h1>Checking session</h1>
              <p>Processing secure sign-in and recovery links.</p>
            </div>
          </div>
        </main>
        <StitchFooter />
      </div>
    );
  }

  const effectiveUser = authUser || (localPreview ? { email: "local-preview@capilauncher.test" } : null);

  if (!effectiveUser || authMode === "reset") {
    return (
      <AuthScreen
        mode={authMode}
        setMode={(mode) => {
          setAuthMode(mode);
          if (mode !== "reset") {
            setCallbackReady(false);
            setInviteToken("");
          }
          resetAuthFeedback();
        }}
        authForm={authForm}
        patchAuthForm={patchAuthForm}
        onLogin={submitLogin}
        onRegister={submitRegister}
        onForgot={submitForgotPassword}
        onReset={submitResetPassword}
        onPreview={() => setLocalPreview(true)}
        busy={authBusy}
        error={authError}
        message={authMessage}
        callbackReady={callbackReady}
      />
    );
  }

  return (
    <div className="stitchAppShell">
      <StitchSideNav
        userEmail={effectiveUser.email}
        active={provision.status === "success" ? "tracking" : "setup"}
        onLogout={submitLogout}
        authBusy={authBusy}
      />

      {provision.status === "success" ? (
        <StitchTrackingConfig
          client={client}
          provision={provision}
          copied={copied}
          setCopied={setCopied}
        />
      ) : (
        <StitchSetupWizard
          client={client}
          patchClient={patchClient}
          updateName={updateName}
          showToken={showToken}
          setShowToken={setShowToken}
          provision={provision}
          backend={backend}
          createClientEndpoint={createClientEndpoint}
        />
      )}
    </div>
  );
}
