import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileInput,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";
import { providerRequest } from "../lib/api.js";
import { CopyButton, Notice, Spinner } from "./UI.jsx";

const emptyForm = {
  provider: "tiktok",
  clientName: "",
  eventName: "Lead",
  allowedPageUrl: "",
  formSelector: "",
  country: "US",
  currency: "USD",
  value: "1.00",
  source: "Website Form",
  onlyPaidTraffic: false,
  pixelCode: "",
  accessToken: "",
  testEventCode: "",
  conversionId: "",
  conversionLabel: "",
  customerId: "",
  conversionAction: "",
  developerToken: "",
  clientId: "",
  clientSecret: "",
  refreshToken: "",
  loginCustomerId: ""
};

function providerName(value) {
  return value === "tiktok" ? "TikTok" : "Google Ads";
}

function eventHint(form) {
  if (form.provider === "tiktok") return form.eventName === "Schedule" ? "TikTok Schedule" : "TikTok Lead";
  return form.eventName === "Schedule" ? "Google Ads booking conversion" : "Google Ads lead conversion";
}

function installationTag(endpoint) {
  return endpoint?.tracker_url ? `<script src="${endpoint.tracker_url}" defer></script>` : "";
}

function providerErrorMessage(error, fallback) {
  const message = String(error?.message || "").trim();
  if (!message || /netlify|blob|siteid|internal server|stack|token required/i.test(message)) {
    return fallback;
  }
  return message;
}

function EndpointCard({ endpoint, onVerify, onDelete, busy }) {
  const [expanded, setExpanded] = useState(false);
  const code = installationTag(endpoint);
  return (
    <article className={`providerEndpointCard ${endpoint.provider}`}>
      <header>
        <div>
          <span className="providerBadge">{endpoint.provider_label}</span>
          <h3>{endpoint.client_name}</h3>
          <p>{endpoint.event_name} / {endpoint.provider_event_name}</p>
        </div>
        <span className="providerReady"><i /> Ready</span>
      </header>
      <dl>
        <div><dt>Locked page</dt><dd>{endpoint.allowed_page_url}</dd></div>
        {endpoint.form_selector ? <div><dt>Locked form</dt><dd><code>{endpoint.form_selector}</code></dd></div> : null}
        <div><dt>Delivery</dt><dd>Ready</dd></div>
      </dl>
      <div className="providerCardActions">
        <button className="button secondary small" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Hide install code" : "Install code"}</button>
        <button className="button ghost small" type="button" onClick={() => onVerify(endpoint)} disabled={busy}><RefreshCw className={busy ? "spin" : ""} size={16} /> Verify</button>
        <button className="button ghost small dangerText" type="button" onClick={() => onDelete(endpoint)} disabled={busy}><Trash2 size={16} /> Delete</button>
      </div>
      {expanded ? (
        <div className="providerInstallCode">
          <div><strong>Paste this on the locked conversion page</strong><CopyButton value={code} label="Copy script" /></div>
          <pre><code>{code}</code></pre>
          <small>{endpoint.event_name === "Schedule" ? "The event fires once when the saved confirmation page loads." : "The event fires only when the saved form selector is submitted."}</small>
        </div>
      ) : null}
    </article>
  );
}

export default function PlatformsPage({ billing, onCheckout, refreshBilling }) {
  const [endpoints, setEndpoints] = useState([]);
  const [listState, setListState] = useState({ status: "idle", error: "" });
  const [form, setForm] = useState(emptyForm);
  const [createState, setCreateState] = useState({ status: "idle", error: "" });
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [showGoogleApi, setShowGoogleApi] = useState(false);

  const googleApiComplete = useMemo(() => [
    form.customerId,
    form.conversionAction,
    form.developerToken,
    form.clientId,
    form.clientSecret,
    form.refreshToken
  ].every((value) => value.trim()), [form]);

  async function load() {
    setListState({ status: "loading", error: "" });
    try {
      const data = await providerRequest("list");
      setEndpoints(Array.isArray(data.endpoints) ? data.endpoints : []);
      setListState({ status: "success", error: "" });
    } catch (error) {
      setListState({
        status: "error",
        error: providerErrorMessage(error, "Tracking setups are temporarily unavailable. Please refresh and try again.")
      });
    }
  }

  useEffect(() => { load(); }, []);

  function patch(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "provider") {
        next.accessToken = "";
        next.pixelCode = "";
        next.conversionId = "";
        next.conversionLabel = "";
      }
      if (name === "eventName") {
        next.formSelector = value === "Schedule" ? "" : current.formSelector;
        next.value = value === "Schedule" ? "150" : "1.00";
        next.source = value === "Schedule" ? "Appointment Booking" : "Website Form";
      }
      return next;
    });
  }

  async function create(event) {
    event.preventDefault();
    if (createState.status === "loading") return;
    setCreateState({ status: "loading", error: "" });
    setNotice("");
    try {
      const requiresCredit = billing.required && !billing.exempt && !billing.free_script_available;
      if (requiresCredit && !billing.available_order_id) {
        throw new Error("Purchase a $5 conversion credit before creating this endpoint.");
      }
      const payload = {
        ...form,
        checkoutOrderId: requiresCredit ? billing.available_order_id : undefined,
        value: Number(form.value),
        formSelector: form.eventName === "Schedule" ? "" : form.formSelector,
        customerId: showGoogleApi ? form.customerId : "",
        conversionAction: showGoogleApi ? form.conversionAction : "",
        developerToken: showGoogleApi ? form.developerToken : "",
        clientId: showGoogleApi ? form.clientId : "",
        clientSecret: showGoogleApi ? form.clientSecret : "",
        refreshToken: showGoogleApi ? form.refreshToken : "",
        loginCustomerId: showGoogleApi ? form.loginCustomerId : ""
      };
      const data = await providerRequest("create", { method: "POST", body: payload });
      setEndpoints((current) => [data.endpoint, ...current]);
      setForm((current) => ({
        ...emptyForm,
        provider: current.provider,
        currency: current.currency,
        eventName: current.eventName,
        value: current.eventName === "Schedule" ? "150" : "1.00",
        source: current.eventName === "Schedule" ? "Appointment Booking" : "Website Form"
      }));
      setShowSecrets(false);
      setCreateState({ status: "success", error: "" });
      setNotice(`${providerName(data.endpoint.provider)} ${data.endpoint.event_name} tracking was created.`);
      await refreshBilling();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setCreateState({
        status: "error",
        error: providerErrorMessage(error, "The tracking setup could not be created. Check the details and try again.")
      });
    }
  }

  async function verify(endpoint) {
    setBusyId(endpoint.id);
    setNotice("");
    try {
      const data = await providerRequest("verify", { method: "POST", body: { id: endpoint.id } });
      setNotice(data.healthy
        ? `${endpoint.provider_label} configuration is healthy. Browser tracking is enabled${data.server_mode ? " and server tracking is enabled" : ""}.`
        : `${endpoint.provider_label} configuration could not be verified.`);
    } catch (error) {
      setNotice(providerErrorMessage(error, "The tracking setup could not be verified. Please try again."));
    } finally {
      setBusyId("");
    }
  }

  async function remove(endpoint) {
    if (!window.confirm(`Delete ${endpoint.client_name} ${endpoint.provider_label} tracking?`)) return;
    setBusyId(endpoint.id);
    setNotice("");
    try {
      await providerRequest("delete", { method: "DELETE", body: { id: endpoint.id } });
      setEndpoints((current) => current.filter((item) => item.id !== endpoint.id));
      setNotice(`${endpoint.provider_label} tracking was deleted.`);
    } catch (error) {
      setNotice(providerErrorMessage(error, "The tracking setup could not be deleted. Please try again."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="workspaceMain providerPage providerWorkspaceMain">
      <header className="workspaceHeader">
        <div>
          <h1>TikTok & Google Ads</h1>
          <p>Create protected Lead or Schedule tracking with the same $5-per-event pricing.</p>
        </div>
      </header>
      {!billing.exempt && billing.required && !billing.free_script_available && !Number(billing.available_credits) ? (
        <section className="providerPaymentGate">
          <div><strong>One conversion credit required</strong><p>Each Lead or Schedule script is a separate one-time $5 purchase.</p></div>
          <button className="button primary" type="button" onClick={onCheckout} disabled={["checkout", "verifying"].includes(billing.status)}>
            {billing.status === "checkout" ? <Spinner label="Opening checkout" /> : "Buy one $5 credit"}
          </button>
        </section>
      ) : null}

        {listState.status !== "success" || endpoints.length ? <section className="providerExisting">
          <header>
            <div><span className="eyebrow">Your endpoints</span><h2>TikTok and Google tracking</h2><p>Each setup is locked to one exact page and one Lead form or Schedule confirmation.</p></div>
            <button className="button ghost" type="button" onClick={load} disabled={listState.status === "loading"}><RefreshCw className={listState.status === "loading" ? "spin" : ""} size={17} /> Refresh</button>
          </header>
          {notice ? <Notice tone={/deleted|created|healthy|enabled/i.test(notice) ? "success" : "info"}>{notice}</Notice> : null}
          {listState.error ? <Notice tone="error" title="Could not load provider endpoints">{listState.error}</Notice> : null}
          {listState.status === "loading" ? <div className="providerLoading"><Spinner label="Loading TikTok and Google endpoints" /></div> : null}
          {listState.status !== "loading" && endpoints.length ? (
            <div className="providerEndpointGrid">{endpoints.map((endpoint) => <EndpointCard key={endpoint.id} endpoint={endpoint} onVerify={verify} onDelete={remove} busy={busyId === endpoint.id} />)}</div>
          ) : null}
        </section> : null}

        <section className="providerCreate" id="create-provider">
          <header><span className="eyebrow">New endpoint</span><h2>Choose the platform, conversion and exact page.</h2><p>Credentials are encrypted before storage and never appear in the installation script.</p></header>
          <form onSubmit={create}>
            <fieldset className="providerSelector">
              <legend>Platform</legend>
              <button className={form.provider === "tiktok" ? "active" : ""} type="button" onClick={() => patch("provider", "tiktok")}><strong>TikTok</strong><small>Pixel + Events API</small></button>
              <button className={form.provider === "google" ? "active" : ""} type="button" onClick={() => patch("provider", "google")}><strong>Google Ads</strong><small>Tag + enhanced conversions</small></button>
            </fieldset>

            <fieldset className="providerSelector eventSelector">
              <legend>Conversion</legend>
              <button className={form.eventName === "Lead" ? "active" : ""} type="button" onClick={() => patch("eventName", "Lead")}><FileInput size={19} /><span><strong>Lead</strong><small>Exact form submit</small></span></button>
              <button className={form.eventName === "Schedule" ? "active" : ""} type="button" onClick={() => patch("eventName", "Schedule")}><CalendarCheck2 size={19} /><span><strong>Schedule</strong><small>Confirmation page load</small></span></button>
            </fieldset>

            <div className="providerFormGrid">
              <label><span>Client or project name</span><input required minLength="2" value={form.clientName} onChange={(event) => patch("clientName", event.target.value)} placeholder="Acme Home Services" /></label>
              <label><span>Exact conversion page URL</span><input required type="url" value={form.allowedPageUrl} onChange={(event) => patch("allowedPageUrl", event.target.value)} placeholder={form.eventName === "Schedule" ? "https://example.com/booking-confirmed" : "https://example.com/free-estimate"} /></label>
            </div>
            {form.eventName === "Lead" ? <label><span>Exact form selector</span><input required value={form.formSelector} onChange={(event) => patch("formSelector", event.target.value)} placeholder="#estimate-form" /><small>Generic selectors such as <code>form</code> are rejected.</small></label> : null}

            {form.provider === "tiktok" ? (
              <section className="providerCredentialBox tiktok">
                <header><div><strong>TikTok connection</strong><span>{eventHint(form)}</span></div><button className="iconOnly" type="button" onClick={() => setShowSecrets((value) => !value)} aria-label={showSecrets ? "Hide token" : "Show token"}>{showSecrets ? <EyeOff size={18} /> : <Eye size={18} />}</button></header>
                <div className="providerFormGrid">
                  <label><span>TikTok Pixel Code</span><input required value={form.pixelCode} onChange={(event) => patch("pixelCode", event.target.value.trim())} placeholder="Pixel Code from Events Manager" /></label>
                  <label><span>Events API access token</span><input required type={showSecrets ? "text" : "password"} value={form.accessToken} onChange={(event) => patch("accessToken", event.target.value.trim())} placeholder="Paste the TikTok access token" autoComplete="off" /></label>
                </div>
                <label><span>Test event code <small>Optional</small></span><input value={form.testEventCode} onChange={(event) => patch("testEventCode", event.target.value.trim())} placeholder="Temporary TikTok test code" /></label>
                <Notice tone="info" title="Complete TikTok tracking">The generated script is configured to send the selected conversion with the matching and campaign data available on the page.</Notice>
              </section>
            ) : (
              <section className="providerCredentialBox google">
                <header><div><strong>Google Ads connection</strong><span>{eventHint(form)}</span></div><button className="iconOnly" type="button" onClick={() => setShowSecrets((value) => !value)} aria-label={showSecrets ? "Hide secrets" : "Show secrets"}>{showSecrets ? <EyeOff size={18} /> : <Eye size={18} />}</button></header>
                <div className="providerFormGrid">
                  <label><span>Conversion ID</span><input required value={form.conversionId} onChange={(event) => patch("conversionId", event.target.value.trim())} placeholder="AW-123456789" /></label>
                  <label><span>Conversion label</span><input required value={form.conversionLabel} onChange={(event) => patch("conversionLabel", event.target.value.trim())} placeholder="AbC-D_efG-h12_34" /></label>
                </div>
                <Notice tone="info" title="Complete Google Ads tracking">The generated script is configured with your conversion action, value, currency, and available customer matching data.</Notice>
                <label className="providerApiToggle"><input type="checkbox" checked={showGoogleApi} onChange={(event) => setShowGoogleApi(event.target.checked)} /><span><strong>Advanced Google Ads connection</strong><small>Optional. Use this only when your Google Ads API access is already configured.</small></span></label>
                {showGoogleApi ? (
                  <div className="googleApiFields">
                    <div className="providerFormGrid">
                      <label><span>Google Ads customer ID</span><input required value={form.customerId} onChange={(event) => patch("customerId", event.target.value)} placeholder="1234567890" /></label>
                      <label><span>Login customer ID <small>Optional</small></span><input value={form.loginCustomerId} onChange={(event) => patch("loginCustomerId", event.target.value)} placeholder="Manager account ID" /></label>
                    </div>
                    <label><span>Conversion action resource name</span><input required value={form.conversionAction} onChange={(event) => patch("conversionAction", event.target.value.trim())} placeholder="customers/1234567890/conversionActions/987654321" /></label>
                    <div className="providerFormGrid">
                      <label><span>Developer token</span><input required type={showSecrets ? "text" : "password"} value={form.developerToken} onChange={(event) => patch("developerToken", event.target.value.trim())} autoComplete="off" /></label>
                      <label><span>OAuth client ID</span><input required value={form.clientId} onChange={(event) => patch("clientId", event.target.value.trim())} autoComplete="off" /></label>
                      <label><span>OAuth client secret</span><input required type={showSecrets ? "text" : "password"} value={form.clientSecret} onChange={(event) => patch("clientSecret", event.target.value.trim())} autoComplete="off" /></label>
                      <label><span>OAuth refresh token</span><input required type={showSecrets ? "text" : "password"} value={form.refreshToken} onChange={(event) => patch("refreshToken", event.target.value.trim())} autoComplete="off" /></label>
                    </div>
                    {!googleApiComplete ? <small className="providerApiWarning">All six required API fields must be completed for server upload.</small> : <span className="providerApiReady"><CheckCircle2 size={16} /> Google Ads API server upload is configured.</span>}
                  </div>
                ) : null}
              </section>
            )}

            <div className="providerFormGrid compact">
              <label><span>Country</span><select value={form.country} onChange={(event) => patch("country", event.target.value)}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="AU">Australia</option><option value="NZ">New Zealand</option><option value="IE">Ireland</option></select></label>
              <label><span>Currency</span><select value={form.currency} onChange={(event) => patch("currency", event.target.value)}><option>USD</option><option>CAD</option><option>EUR</option><option>GBP</option><option>AUD</option><option>NZD</option></select></label>
              <label><span>Conversion value</span><input type="number" min="0" step="0.01" value={form.value} onChange={(event) => patch("value", event.target.value)} /></label>
            </div>
            <label><span>Conversion source label</span><input value={form.source} onChange={(event) => patch("source", event.target.value)} /></label>
            <label className="providerApiToggle"><input type="checkbox" checked={form.onlyPaidTraffic} onChange={(event) => patch("onlyPaidTraffic", event.target.checked)} /><span><strong>Paid traffic only</strong><small>{form.provider === "tiktok" ? "Require TTCLID, _ttp or TikTok campaign attribution." : "Require GCLID, WBRAID, GBRAID or Google campaign attribution."}</small></span></label>

            {createState.error ? <Notice tone="error" title="Provider endpoint was not created">{createState.error}</Notice> : null}
            <Notice tone="warning" title="The page and form lock is permanent">A different page, form, conversion or provider should use a separate endpoint.</Notice>
            <button className="button primary full providerCreateButton" type="submit" disabled={createState.status === "loading" || (!billing.exempt && billing.required && !billing.free_script_available && !Number(billing.available_credits))}>{createState.status === "loading" ? <><LoaderCircle className="spin" size={18} /> Creating protected endpoint</> : <><Plus size={18} /> Create {providerName(form.provider)} endpoint</>}</button>
          </form>
        </section>
    </main>
  );
}
