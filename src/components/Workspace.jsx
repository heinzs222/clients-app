import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Code2,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  FileInput,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ReceiptText,
  Route,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import {
  canonicalPageUrl,
  cleanAccessToken,
  cleanDatasetId,
  endpointState,
  formatDate,
  isExactFormSelector,
  isValidAccessToken,
  isValidDatasetId,
  isValidPageUrl,
  loadTrackingSettings,
  removeTrackingSettings,
  saveTrackingSettings,
  trackingDefaultsForEvent,
  trackerTag
} from "../lib/capi.js";
import { bindingRequest } from "../lib/api.js";
import {
  Brand,
  CopyButton,
  EmptyState,
  Field,
  InputShell,
  Modal,
  Notice,
  Spinner,
  StatusPill
} from "./UI.jsx";
import PlatformsPage from "./PlatformsPage.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "endpoints", label: "Endpoints", icon: Database },
  { id: "setup", label: "Setup Wizard", icon: CircleGauge },
  { id: "platforms", label: "TikTok & Google", icon: Route },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "tracking", label: "Tracking", icon: Route }
];

function userName(user) {
  return user?.name || user?.userMetadata?.full_name || user?.email?.split("@")[0] || "Workspace user";
}

function SideNav({ user, active, navigate, onNew, onLogout, authBusy }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(route) {
    setMobileOpen(false);
    navigate(route);
  }

  return (
    <>
      <header className="mobileWorkspaceHeader">
        <Brand compact />
        <button className="iconOnly" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" title="Open navigation"><Menu size={21} /></button>
      </header>
      {mobileOpen ? <button className="mobileNavScrim" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}
      <aside className={`sideNav ${mobileOpen ? "open" : ""}`}>
        <div className="sideNavTop">
          <div className="sideBrandRow">
            <Brand compact />
            <button className="iconOnly sideClose" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" title="Close"><X size={20} /></button>
          </div>
          <div className="workspaceIdentity">
            <span>{userName(user).slice(0, 2).toUpperCase()}</span>
            <div><strong>{userName(user)}</strong><small>Secure workspace</small></div>
          </div>
          <button className="button primary full sideNew" type="button" onClick={() => { setMobileOpen(false); onNew(); }}><Plus size={18} /> New endpoint</button>
          <nav className="sideNavLinks" aria-label="Workspace navigation">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button className={active === id ? "active" : ""} type="button" key={id} onClick={() => go(id)}>
                <Icon size={19} /> {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sideNavBottom">
          <button type="button" onClick={() => go("docs")}><BookOpen size={18} /> Documentation</button>
          <button type="button" onClick={() => go("status")}><LifeBuoy size={18} /> System status</button>
          <button type="button" onClick={onLogout} disabled={authBusy}><LockKeyhole size={18} /> {authBusy ? "Logging out..." : "Log out"}</button>
        </div>
      </aside>
    </>
  );
}

function WorkspaceHeader({ title, description, action }) {
  return (
    <header className="workspaceHeader">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </header>
  );
}

function EndpointTable({ endpoints, onOpen, onManage, onDelete, compact = false, busyId }) {
  if (!endpoints.length) return null;
  return (
    <div className={`endpointTableWrap ${compact ? "compact" : ""}`}>
      <table className="endpointTable">
        <thead><tr><th>Client</th><th>Dataset ID</th><th>Status</th><th>Updated</th><th><span className="srOnly">Actions</span></th></tr></thead>
        <tbody>
          {endpoints.map((endpoint) => {
            const state = endpointState(endpoint);
            return (
              <tr key={endpoint.id}>
                <td data-label="Client"><button className="clientLink" type="button" onClick={() => onOpen(endpoint)}>{endpoint.client_name}</button><small>{endpoint.event_name || "Lead"} / {endpoint.binding ? "Locked" : "Lock required"}</small></td>
                <td data-label="Dataset"><code>{endpoint.dataset_id || "Unavailable"}</code></td>
                <td data-label="Status"><StatusPill state={endpoint.binding ? state : "pending"} label={endpoint.binding ? (state === "active" ? "Active" : state === "pending" ? "Pending" : "Check") : "Lock required"} /></td>
                <td data-label="Updated">{formatDate(endpoint.updated_at)}</td>
                <td className="rowActions">
                  <button className="iconOnly" type="button" onClick={() => onOpen(endpoint)} aria-label={`Open ${endpoint.client_name} tracking`} title="Open tracking"><Eye size={18} /></button>
                  <button className="iconOnly" type="button" onClick={() => onManage(endpoint)} aria-label={`Manage ${endpoint.client_name}`} title="Endpoint settings"><Settings size={18} /></button>
                  <button className="iconOnly danger" type="button" onClick={() => onDelete(endpoint)} disabled={busyId === endpoint.id} aria-label={`Delete ${endpoint.client_name}`} title="Delete endpoint"><Trash2 size={18} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EndpointDeleteModal({ endpoint, open, onClose, onConfirm, busy }) {
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => { if (open) setConfirmation(""); }, [open]);
  const confirmed = confirmation.trim() === endpoint?.client_name;
  return (
    <Modal
      open={open}
      title="Delete endpoint"
      onClose={busy ? () => {} : onClose}
      actions={
        <>
          <button className="button secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="button danger" type="button" onClick={onConfirm} disabled={!confirmed || busy}>{busy ? "Deleting..." : "Delete endpoint"}</button>
        </>
      }
    >
      <Notice tone="warning" title="This permanently removes the endpoint">Tracking for this client will stop immediately. A redeemed endpoint payment is not restored as a reusable credit.</Notice>
      <Field label={`Type ${endpoint?.client_name || "the client name"} to confirm`}>
        <InputShell><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></InputShell>
      </Field>
    </Modal>
  );
}

function Dashboard({ endpoints, loading, error, navigate, onNew, onOpen, onManage, onDelete, busyId, refresh }) {
  const active = endpoints.filter((item) => endpointState(item) === "active" && item.binding).length;
  const newest = [...endpoints].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0];
  return (
    <main className="workspaceMain">
      <WorkspaceHeader
        title="Dashboard"
        description="Your client tracking workspace."
        action={<button className="button primary" type="button" onClick={onNew}><Plus size={18} /> New endpoint</button>}
      />
      {error ? <Notice tone="error" title="Could not load endpoints">{error} <button className="inlineButton" type="button" onClick={refresh}>Try again</button></Notice> : null}
      <section className="metricGrid" aria-label="Endpoint overview">
        <article><span><Database size={22} /></span><p>Total endpoints</p><strong>{loading ? "-" : endpoints.length}</strong><small>Client tracking setups</small></article>
        <article><span className="green"><Activity size={22} /></span><p>Ready endpoints</p><strong>{loading ? "-" : active}</strong><small>{endpoints.length ? `${active} of ${endpoints.length} ready` : "No endpoint created yet"}</small></article>
        <article><span className="cyan"><RefreshCw size={22} /></span><p>Last update</p><strong className="metricDate">{newest ? formatDate(newest.updated_at) : "None"}</strong><small>{newest ? newest.client_name : "Create the first client"}</small></article>
      </section>
      <section className="managedSection">
        <header><div><h2>Recent endpoints</h2><p>Open a client to copy installation code or verify its service.</p></div><button className="button ghost" type="button" onClick={() => navigate("endpoints")}>View all <ChevronRight size={17} /></button></header>
        {loading ? <div className="loadingPanel"><Spinner label="Loading endpoints" /></div> : endpoints.length ? (
          <EndpointTable endpoints={endpoints.slice(0, 5)} onOpen={onOpen} onManage={onManage} onDelete={onDelete} busyId={busyId} compact />
        ) : (
          <EmptyState icon={Server} title="No endpoints yet" action={<button className="button primary" type="button" onClick={onNew}><Plus size={18} /> Create endpoint</button>}>
            Start with a client name, Meta Dataset ID, access token, and the exact page to track.
          </EmptyState>
        )}
      </section>
    </main>
  );
}

function EndpointsPage({ endpoints, loading, error, onNew, onOpen, onManage, onDelete, busyId, refresh }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return endpoints;
    return endpoints.filter((item) => [item.client_name, item.dataset_id, item.event_name, item.id, item.binding?.allowed_page_url].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [endpoints, search]);
  return (
    <main className="workspaceMain">
      <WorkspaceHeader title="Endpoints" description="Manage each client's tracking setup." action={<button className="button primary" type="button" onClick={onNew}><Plus size={18} /> New endpoint</button>} />
      {error ? <Notice tone="error" title="Could not load endpoints">{error} <button className="inlineButton" type="button" onClick={refresh}>Try again</button></Notice> : null}
      <section className="managedSection endpointsManager">
        <header>
          <div><h2>All endpoints</h2><p>{loading ? "Loading..." : `${endpoints.length} client ${endpoints.length === 1 ? "endpoint" : "endpoints"}`}</p></div>
          <label className="searchBox"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients or datasets" aria-label="Search endpoints" /></label>
        </header>
        {loading ? <div className="loadingPanel"><Spinner label="Loading endpoints" /></div> : filtered.length ? (
          <EndpointTable endpoints={filtered} onOpen={onOpen} onManage={onManage} onDelete={onDelete} busyId={busyId} />
        ) : endpoints.length ? (
          <EmptyState icon={Search} title="No matching endpoints">Try a different client name or Dataset ID.</EmptyState>
        ) : (
          <EmptyState icon={Server} title="No endpoints yet" action={<button className="button primary" type="button" onClick={onNew}><Plus size={18} /> Create endpoint</button>}>
            Every client you create will appear here with its own private endpoint.
          </EmptyState>
        )}
      </section>
    </main>
  );
}

function Progress({ stage }) {
  return (
    <div className="wizardProgress" aria-label="Endpoint setup progress">
      {["Payment", "Client details", "Create setup", "Install"].map((label, index) => {
        const number = index + 1;
        return (
          <React.Fragment key={label}>
            {index ? <i className={stage >= number ? "active" : ""} /> : null}
            <div className={stage >= number ? "active" : ""}><span>{stage > number ? <Check size={16} /> : number}</span><strong>{label}</strong></div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function money(cents, currency = "USD") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((Number(cents) || 0) / 100);
}

function PaymentStep({ billing, onCheckout, refreshBilling, onCancel }) {
  const busy = ["loading", "checkout", "verifying"].includes(billing.status);
  return (
    <main className="workspaceMain">
      <WorkspaceHeader title="Create new endpoint" description="One $5 payment unlocks one Lead or Schedule script for one exact page." />
      <Progress stage={1} />
      <div className="wizardLayout paymentLayout">
        <section className="wizardCard paymentCard">
          <header><span className="paymentIcon"><CreditCard size={23} /></span><div><h2>Conversion credit</h2><p>Lemon Squeezy securely processes the payment as merchant of record. Card details never pass through Simple CAPI.</p></div></header>
          <div className="priceLine"><strong>{money(billing.price_cents, billing.currency)}</strong><span>one-time</span></div>
          <ul className="paymentIncludes">
            <li><CheckCircle2 size={18} /><span>Exactly one Lead or one Schedule script</span></li>
            <li><CheckCircle2 size={18} /><span>Locked to one exact page and form</span></li>
            <li><CheckCircle2 size={18} /><span>Secure credential handling and endpoint management</span></li>
          </ul>
          <p className="paymentRule">Need both events? Buy two scripts: $5 for Lead plus $5 for Schedule.</p>
          {billing.mode === "test" ? <Notice tone="warning" title="Lemon Squeezy test mode">Use Lemon Squeezy's test checkout. No real charge will be made.</Notice> : null}
          {!billing.configured ? <Notice tone="error" title="Payments unavailable">Lemon Squeezy has not been configured by the administrator.</Notice> : null}
          {billing.message ? <Notice tone={billing.status === "error" ? "error" : "info"}>{billing.message}</Notice> : null}
          {billing.error ? <Notice tone="error">{billing.error}</Notice> : null}
          <div className="wizardActions">
            <button className="button ghost" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
            <button className="button ghost" type="button" onClick={() => refreshBilling()} disabled={busy}><RefreshCw size={17} /> Refresh</button>
            <button className="button primary" type="button" onClick={onCheckout} disabled={busy || !billing.configured}>
              {busy ? <Spinner label={billing.status === "verifying" ? "Verifying payment" : "Opening checkout"} /> : <>Pay {money(billing.price_cents, billing.currency)} securely <ArrowRight size={18} /></>}
            </button>
          </div>
        </section>
        <aside className="setupGuide paymentGuide">
          <span><ReceiptText size={23} /></span>
          <h2>How payment works</h2>
          <ol>
            <li><strong>Secure checkout</strong><small>Lemon Squeezy handles card entry, tax, and required authentication.</small></li>
            <li><strong>Verified credit</strong><small>Your payment is confirmed before the endpoint is created.</small></li>
            <li><strong>Permanent lock</strong><small>The page and form cannot be changed after the script is created.</small></li>
          </ol>
          <div className="secureNote"><CreditCard size={17} /><span>Need another page or the other event? Create another script.</span></div>
          <div className="secureNote"><LockKeyhole size={17} /><span>Closing or cancelling checkout does not create an endpoint or consume a credit.</span></div>
        </aside>
      </div>
    </main>
  );
}

function BillingPage({ billing, onCheckout, refreshBilling, navigate }) {
  const busy = ["loading", "checkout", "verifying"].includes(billing.status);
  const available = Number(billing.available_credits) || 0;
  const accountExempt = billing.exemption === "account";
  const developmentExempt = billing.exemption === "development";
  return (
    <main className="workspaceMain">
      <WorkspaceHeader
        title="Billing"
        description="Each $5 payment purchases one event-specific script locked to one page."
        action={<button className="button secondary" type="button" onClick={() => refreshBilling()} disabled={busy}><RefreshCw size={17} /> Refresh</button>}
      />
      <div className="billingOverview">
        <section className="billingMetric">
          <span>Available credits</span>
          <strong>{billing.exempt ? (developmentExempt ? "Development" : "Unlimited") : available}</strong>
          <small>{billing.exempt ? (developmentExempt ? "Payment is bypassed only in this local development environment." : accountExempt ? "This owner account can create endpoints without checkout." : "This service currently allows endpoint creation without checkout.") : "One credit creates one Lead or one Schedule script for one page."}</small>
        </section>
        <section className="billingMetric">
          <span>Conversion price</span>
          <strong>{money(billing.price_cents, billing.currency)}</strong>
          <small>One-time payment. No recurring subscription.</small>
        </section>
        <section className="billingActionPanel">
          <div><CreditCard size={22} /><span><strong>Lemon Squeezy Checkout</strong><small>{billing.mode === "test" ? "Test mode is active." : "Secure merchant-of-record checkout."}</small></span></div>
          {billing.exempt || !billing.required ? (
            <button className="button primary" type="button" onClick={() => navigate("setup")}>Create endpoint <ArrowRight size={17} /></button>
          ) : available ? (
            <button className="button primary" type="button" onClick={() => navigate("setup")}>Use a credit <ArrowRight size={17} /></button>
          ) : (
            <button className="button primary" type="button" onClick={onCheckout} disabled={busy || !billing.configured}>{busy ? <Spinner label="Opening checkout" /> : <>Buy one credit <ArrowRight size={17} /></>}</button>
          )}
        </section>
      </div>
      {billing.error ? <Notice tone="error" title="Billing request failed">{billing.error}</Notice> : null}
      {!billing.configured && billing.required && !billing.exempt ? <Notice tone="error" title="Lemon Squeezy is not configured">The administrator must add the Lemon Squeezy API, store, and variant settings before payments can be accepted.</Notice> : null}
      <section className="billingHistory">
        <header><div><h2>Payment history</h2><p>Completed conversion-credit purchases associated with this account.</p></div></header>
        {billing.payments?.length ? (
          <div className="endpointTableWrap">
            <table className="endpointTable billingTable">
              <thead><tr><th>Date</th><th>Payment</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {billing.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.created_at)}</td>
                    <td><code>{payment.id.slice(0, 8)}...{payment.id.slice(-6)}</code></td>
                    <td>{money(payment.amount, payment.currency)}</td>
                    <td><span className={`creditState ${payment.redeemed ? "used" : "available"}`}>{payment.redeemed ? "Used" : "Available"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="billingEmpty"><ReceiptText size={24} /><div><strong>No payments yet</strong><span>Completed Lemon Squeezy purchases will appear here.</span></div></div>}
      </section>
    </main>
  );
}

function SetupWizard({ backend, billing, createState, onCreate, onCheckout, refreshBilling, onCancel }) {
  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState({ clientName: "", datasetId: "", accessToken: "", graphVersion: "v23.0", eventName: "Lead", allowedPageUrl: "", formSelector: "" });
  const [touched, setTouched] = useState(false);
  const pageValid = isValidPageUrl(form.allowedPageUrl);
  const selectorValid = form.eventName === "Schedule" || isExactFormSelector(form.formSelector);
  const valid = form.clientName.trim().length >= 2 && isValidDatasetId(form.datasetId) && isValidAccessToken(form.accessToken) && pageValid && selectorValid;
  const hasCredit = billing.exempt || !billing.required || billing.free_script_available || Number(billing.available_credits) > 0;

  if (!hasCredit) {
    return <PaymentStep billing={billing} onCheckout={onCheckout} refreshBilling={refreshBilling} onCancel={onCancel} />;
  }

  async function submit(event) {
    event.preventDefault();
    setTouched(true);
    if (!valid || !backend.ready) return;
    const success = await onCreate({
      ...form,
      clientName: form.clientName.trim(),
      allowedPageUrl: canonicalPageUrl(form.allowedPageUrl),
      formSelector: form.eventName === "Schedule" ? "" : form.formSelector.trim()
    });
    if (success) setForm((current) => ({ ...current, accessToken: "" }));
  }

  return (
    <main className="workspaceMain">
      <WorkspaceHeader title="Create new endpoint" description="Choose the conversion, page, and exact form this script will permanently track." />
      <Progress stage={createState.status === "success" ? 4 : createState.status === "loading" ? 3 : 2} />
      <div className="wizardLayout">
        <form className="wizardCard" onSubmit={submit}>
          <header><h2>Client details</h2><p>The access token is handled securely and never included in the installation script.</p></header>
          <div className="formStack">
            {!billing.exempt && billing.required ? <Notice tone="success" title="Payment confirmed">{billing.available_credits} conversion credit{billing.available_credits === 1 ? " is" : "s are"} available. One credit creates exactly one Lead or one Schedule script.</Notice> : null}
            <fieldset className="trackingModeField">
              <legend>Conversion to track</legend>
              <div className="trackingModeSelector">
                <button className={form.eventName === "Lead" ? "active" : ""} type="button" aria-pressed={form.eventName === "Lead"} onClick={() => setForm({ ...form, eventName: "Lead" })}>
                  <FileInput size={19} /><span><strong>Lead</strong><small>$5 one-time setup</small></span>
                </button>
                <button className={form.eventName === "Schedule" ? "active" : ""} type="button" aria-pressed={form.eventName === "Schedule"} onClick={() => setForm({ ...form, eventName: "Schedule", formSelector: "" })}>
                  <CalendarCheck2 size={19} /><span><strong>Schedule</strong><small>$5 one-time setup</small></span>
                </button>
              </div>
            </fieldset>
            <Field label="Client or project name" hint="Use a recognizable business name." error={touched && form.clientName.trim().length < 2 ? "Enter at least two characters." : undefined}>
              <InputShell><input value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} placeholder="Acme Home Services" autoComplete="organization" /></InputShell>
            </Field>
            <Field label={form.eventName === "Schedule" ? "Booking confirmation page URL" : "Form page URL"} hint="The script will reject events from every other page." error={touched && !pageValid ? "Enter the full page URL, including https://." : undefined}>
              <InputShell code><input value={form.allowedPageUrl} onChange={(event) => setForm({ ...form, allowedPageUrl: event.target.value })} placeholder={form.eventName === "Schedule" ? "https://example.com/booking-confirmed" : "https://example.com/free-estimate"} autoComplete="url" /></InputShell>
            </Field>
            {form.eventName === "Lead" ? (
              <Field label="Exact form selector" hint="Use a unique selector such as #estimate-form. Generic selectors like form are blocked." error={touched && !selectorValid ? "Enter a selector that targets one exact form." : undefined}>
                <InputShell code><input value={form.formSelector} onChange={(event) => setForm({ ...form, formSelector: event.target.value })} placeholder="#estimate-form" autoComplete="off" /></InputShell>
              </Field>
            ) : null}
            <Field label="Meta Dataset ID (Pixel ID)" hint="Numeric ID from Meta Events Manager." error={touched && !isValidDatasetId(form.datasetId) ? "Enter a valid numeric Dataset ID." : undefined}>
              <InputShell icon={Database}><input inputMode="numeric" value={form.datasetId} onChange={(event) => setForm({ ...form, datasetId: cleanDatasetId(event.target.value) })} placeholder="123456789012345" autoComplete="off" /></InputShell>
            </Field>
            <Field label="Conversions API access token" hint="Generate it under Events Manager > Settings > Conversions API." error={touched && !isValidAccessToken(form.accessToken) ? "Enter the long-lived token beginning with EAA." : undefined}>
              <InputShell icon={KeyRound} action={<button className="inputAction" type="button" onClick={() => setShowToken((value) => !value)} aria-label={showToken ? "Hide token" : "Show token"} title={showToken ? "Hide token" : "Show token"}>{showToken ? <EyeOff size={18} /> : <Eye size={18} />}</button>}>
                <input type={showToken ? "text" : "password"} value={form.accessToken} onChange={(event) => setForm({ ...form, accessToken: cleanAccessToken(event.target.value) })} placeholder="Paste the Meta access token" autoComplete="off" />
              </InputShell>
            </Field>
            <details className="advancedSettings">
              <summary>Advanced settings</summary>
              <Field label="Meta Graph API version" hint="Defaults to v23.0.">
                <InputShell code><input value={form.graphVersion} onChange={(event) => setForm({ ...form, graphVersion: event.target.value.trim() })} placeholder="v23.0" autoComplete="off" /></InputShell>
              </Field>
            </details>
            {!backend.ready ? <Notice tone={backend.status === "checking" ? "info" : "error"} title="Service unavailable">{backend.status === "checking" ? "Checking availability..." : "Endpoint creation is temporarily unavailable."}</Notice> : null}
            {createState.error ? <Notice tone="error" title="Endpoint was not created">{createState.error}</Notice> : null}
            <Notice tone="warning" title="The page and form lock is permanent">Creating another page, another form, or the other conversion requires another script.</Notice>
            <div className="wizardActions">
              <button className="button ghost" type="button" onClick={onCancel} disabled={createState.status === "loading"}>Cancel</button>
              <button className="button primary" type="submit" disabled={createState.status === "loading" || !backend.ready}>
                {createState.status === "loading" ? <Spinner label="Creating endpoint" /> : <>Create endpoint <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </form>
        <aside className="setupGuide">
          <span><ShieldCheck size={23} /></span>
          <h2>Before you continue</h2>
          <ol>
            <li><strong>Exact page</strong><small>Use the final live URL, without temporary preview domains.</small></li>
            <li><strong>Exact form</strong><small>For Lead, give the form a unique ID and use that selector.</small></li>
            <li><strong>Conversion type</strong><small>Lead and Schedule need separate scripts.</small></li>
          </ol>
          <div className="secureNote"><LockKeyhole size={17} /><span>The token is never included in the installation script.</span></div>
        </aside>
      </div>
    </main>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="toggleRow">
      <span><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

function CodePanel({ title, description, value, copyLabel = "Copy" }) {
  return (
    <section className="codePanel">
      <header><div><h3>{title}</h3><p>{description}</p></div>{value ? <CopyButton value={value} label={copyLabel} /> : null}</header>
      <pre><code>{value || "Lock this script to a page before copying it."}</code></pre>
    </section>
  );
}

function BindingSetup({ endpoint, onBound }) {
  const confirmationMode = endpoint.event_name === "Schedule";
  const [form, setForm] = useState({ allowedPageUrl: "", formSelector: "" });
  const [state, setState] = useState({ status: "idle", error: "" });
  const valid = isValidPageUrl(form.allowedPageUrl) && (confirmationMode || isExactFormSelector(form.formSelector));

  async function submit(event) {
    event.preventDefault();
    if (!valid) return;
    setState({ status: "loading", error: "" });
    try {
      const data = await bindingRequest("lock", {
        method: "POST",
        body: {
          siteId: endpoint.id,
          allowedPageUrl: canonicalPageUrl(form.allowedPageUrl),
          formSelector: confirmationMode ? "" : form.formSelector.trim()
        }
      });
      onBound(data.binding);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: error.message });
    }
  }

  return (
    <section className="wizardCard bindingCard">
      <header><h2>Lock this existing script</h2><p>Older scripts must be assigned to one page before they can send events again.</p></header>
      <form className="formStack" onSubmit={submit}>
        <Field label={confirmationMode ? "Booking confirmation page URL" : "Form page URL"} hint="This cannot be changed after saving.">
          <InputShell code><input value={form.allowedPageUrl} onChange={(event) => setForm({ ...form, allowedPageUrl: event.target.value })} placeholder="https://example.com/conversion-page" autoComplete="url" /></InputShell>
        </Field>
        {!confirmationMode ? (
          <Field label="Exact form selector" hint="Example: #estimate-form. Generic form selectors are not accepted.">
            <InputShell code><input value={form.formSelector} onChange={(event) => setForm({ ...form, formSelector: event.target.value })} placeholder="#estimate-form" autoComplete="off" /></InputShell>
          </Field>
        ) : null}
        <Notice tone="warning" title="Permanent lock">A different page or form requires another script.</Notice>
        {endpoint.binding_error ? <Notice tone="error">{endpoint.binding_error}</Notice> : null}
        {state.error ? <Notice tone="error">{state.error}</Notice> : null}
        <button className="button primary alignStart" type="submit" disabled={!valid || state.status === "loading"}>{state.status === "loading" ? <Spinner label="Locking script" /> : "Lock and generate script"}</button>
      </form>
    </section>
  );
}

function TrackingInstall({ endpoint, settings, setSettings, onBound }) {
  const confirmationMode = endpoint.event_name === "Schedule";
  const EventIcon = confirmationMode ? CalendarCheck2 : FileInput;
  if (!endpoint.binding) return <BindingSetup endpoint={endpoint} onBound={onBound} />;
  const script = trackerTag(endpoint, settings);

  return (
    <div className="trackingColumns">
      <section className="trackingConfigPanel">
        <header><h2>{confirmationMode ? "Schedule" : "Lead"} tracking</h2><p>Configure this conversion and copy its page-locked installation script.</p></header>
        <div className="formStack">
          <div className="eventTypeSummary"><span><EventIcon size={20} /></span><div><strong>{confirmationMode ? "Schedule confirmation" : "Lead form"}</strong><small>This endpoint is locked to its purchased conversion type, page, and form.</small></div></div>
          <Field label="Locked page"><InputShell code><input value={endpoint.binding.allowed_page_url} readOnly /></InputShell></Field>
          {!confirmationMode ? <Field label="Locked form"><InputShell code><input value={endpoint.binding.form_selector} readOnly /></InputShell></Field> : null}
          <div className="twoFields">
            <Field label="Country">
              <InputShell><select value={settings.country} onChange={(event) => setSettings({ ...settings, country: event.target.value })}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="AU">Australia</option><option value="NZ">New Zealand</option><option value="IE">Ireland</option></select></InputShell>
            </Field>
            <Field label="Currency">
              <InputShell><select value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })}><option value="USD">USD</option><option value="CAD">CAD</option><option value="GBP">GBP</option><option value="AUD">AUD</option><option value="NZD">NZD</option><option value="EUR">EUR</option></select></InputShell>
            </Field>
          </div>
          <div className="twoFields">
            <Field label="Meta event"><InputShell><input value={settings.eventName} readOnly /></InputShell></Field>
            <Field label="Event value"><InputShell><input type="number" min="0" step="0.01" value={settings.leadValue} onChange={(event) => setSettings({ ...settings, leadValue: event.target.value })} /></InputShell></Field>
          </div>
          <Field label="Landing page label" hint="Optional. Use labels such as Control or Variant B when this client runs an A/B test.">
            <InputShell code><input value={settings.pageVariant} onChange={(event) => setSettings({ ...settings, pageVariant: event.target.value.trimStart().slice(0, 80) })} placeholder="Control" autoComplete="off" /></InputShell>
          </Field>
          <Field label="Meta test event code" hint="Optional. Paste the temporary TEST code from Events Manager, then remove it after testing.">
            <InputShell code><input value={settings.testEventCode} onChange={(event) => setSettings({ ...settings, testEventCode: event.target.value.trim() })} placeholder="TEST12345" autoComplete="off" /></InputShell>
          </Field>
          <Toggle checked={settings.firePixel} onChange={(value) => setSettings({ ...settings, firePixel: value })} label="Complete Meta tracking" description="Recommended when the Meta Pixel is already installed on the page." />
          <Toggle checked={settings.onlyMetaTraffic} onChange={(value) => setSettings({ ...settings, onlyMetaTraffic: value })} label="Meta traffic only" description="Track only visits attributed to Meta campaigns." />
          <Notice tone="success" title="Page and form protected">The gateway checks the page URL before accepting an event. The tracker also forces the saved form selector.</Notice>
          <Notice tone="info" title="Where to paste it">{confirmationMode ? "Paste it only on the saved booking confirmation page." : "Paste it on the saved page containing the saved form."}</Notice>
        </div>
      </section>
      <div className="trackingCodeStack">
        <CodePanel title={confirmationMode ? "Schedule installation script" : "Lead installation script"} description="This exact script will be rejected on a different page or form." value={script} />
        {confirmationMode
          ? <Notice tone="warning" title="Confirmation page only">Installing this tag globally will not work and could cause incorrect browser events.</Notice>
          : <Notice tone="warning" title="Embedded forms">If the form is inside an iframe, the locked page URL and selector must refer to the page inside that iframe.</Notice>}
      </div>
    </div>
  );
}

function EndpointSettings({ endpoint, onUpdate, onDelete, updateState }) {
  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState({ clientName: endpoint.client_name, datasetId: endpoint.dataset_id, graphVersion: endpoint.graph_version || "v23.0", accessToken: "" });
  useEffect(() => setForm({ clientName: endpoint.client_name, datasetId: endpoint.dataset_id, graphVersion: endpoint.graph_version || "v23.0", accessToken: "" }), [endpoint]);
  const valid = form.clientName.trim().length >= 2 && isValidDatasetId(form.datasetId) && (!form.accessToken || isValidAccessToken(form.accessToken));
  async function submit(event) {
    event.preventDefault();
    if (!valid) return;
    const ok = await onUpdate(endpoint, form);
    if (ok) setForm((current) => ({ ...current, accessToken: "" }));
  }
  return (
    <div className="settingsLayout">
      <form className="settingsPanel" onSubmit={submit}>
        <header><h2>Endpoint settings</h2><p>Update display details, Dataset ID, Graph version, or rotate the Meta token.</p></header>
        <div className="formStack">
          <Field label="Client name"><InputShell><input value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} /></InputShell></Field>
          <Field label="Dataset ID"><InputShell icon={Database}><input value={form.datasetId} inputMode="numeric" onChange={(event) => setForm({ ...form, datasetId: cleanDatasetId(event.target.value) })} /></InputShell></Field>
          <Field label="Graph API version"><InputShell code><input value={form.graphVersion} onChange={(event) => setForm({ ...form, graphVersion: event.target.value.trim() })} /></InputShell></Field>
          <Field label="New Meta access token" hint="Leave blank to keep the current token.">
            <InputShell icon={KeyRound} action={<button className="inputAction" type="button" onClick={() => setShowToken((value) => !value)} aria-label={showToken ? "Hide token" : "Show token"} title={showToken ? "Hide token" : "Show token"}>{showToken ? <EyeOff size={18} /> : <Eye size={18} />}</button>}>
              <input type={showToken ? "text" : "password"} value={form.accessToken} onChange={(event) => setForm({ ...form, accessToken: cleanAccessToken(event.target.value) })} placeholder="Only required when rotating credentials" autoComplete="off" />
            </InputShell>
          </Field>
          {endpoint.binding ? <Notice tone="info" title="Page lock cannot be edited">{endpoint.binding.allowed_page_url}{endpoint.binding.form_selector ? ` / ${endpoint.binding.form_selector}` : ""}</Notice> : null}
          {updateState.error ? <Notice tone="error">{updateState.error}</Notice> : null}
          {updateState.success ? <Notice tone="success">Endpoint settings were updated.</Notice> : null}
          <button className="button primary alignStart" type="submit" disabled={!valid || updateState.status === "loading"}>{updateState.status === "loading" ? <Spinner label="Updating" /> : "Save changes"}</button>
        </div>
      </form>
      <aside className="endpointMetaPanel">
        <h2>Endpoint details</h2>
        <dl><div><dt>Conversion</dt><dd>{endpoint.event_name || "Lead"}</dd></div><div><dt>Endpoint ID</dt><dd>{endpoint.id.slice(0, 8)}</dd></div><div><dt>Page lock</dt><dd>{endpoint.binding ? "Active" : "Required"}</dd></div><div><dt>Created</dt><dd>{formatDate(endpoint.created_at)}</dd></div><div><dt>Updated</dt><dd>{formatDate(endpoint.updated_at)}</dd></div><div><dt>State</dt><dd><StatusPill state={endpoint.binding ? endpointState(endpoint) : "pending"} /></dd></div></dl>
        <div className="dangerZone"><h3>Delete endpoint</h3><p>Permanently removes this client's tracking setup and stored credentials.</p><button className="button danger" type="button" onClick={() => onDelete(endpoint)}><Trash2 size={17} /> Delete</button></div>
      </aside>
    </div>
  );
}

function TrackingPage({ endpoint, user, initialTab, onBack, onGuide, onVerify, verifyState, onUpdate, updateState, onDelete }) {
  const [tab, setTab] = useState(initialTab === "settings" ? "settings" : "install");
  const [settings, setSettingsState] = useState(() => trackingDefaultsForEvent(endpoint.event_name));
  const [binding, setBinding] = useState(endpoint.binding || null);
  useEffect(() => setBinding(endpoint.binding || null), [endpoint.id, endpoint.binding]);
  useEffect(() => {
    const all = loadTrackingSettings(user.id || user.email);
    const defaults = trackingDefaultsForEvent(endpoint.event_name);
    setSettingsState({ ...defaults, ...(all[endpoint.id] || {}), eventName: defaults.eventName, trigger: defaults.trigger, formSelector: "" });
  }, [endpoint.id, endpoint.event_name, user.id, user.email]);
  function setSettings(next) {
    setSettingsState(next);
    saveTrackingSettings(user.id || user.email, endpoint.id, next);
  }
  const boundEndpoint = { ...endpoint, binding };
  return (
    <main className="workspaceMain">
      <button className="backButton" type="button" onClick={onBack}><ArrowLeft size={17} /> All endpoints</button>
      <WorkspaceHeader
        title={endpoint.client_name}
        description={`${endpoint.event_name || "Lead"} / Dataset ${endpoint.dataset_id || "unavailable"} / ${endpoint.graph_version || "v23.0"}`}
        action={<div className="headerActions"><button className="button secondary" type="button" onClick={onGuide}><BookOpen size={17} /> 9.3 setup guide</button><button className="button secondary" type="button" onClick={() => onVerify(endpoint)} disabled={verifyState.status === "loading"}><RefreshCw className={verifyState.status === "loading" ? "spin" : ""} size={17} /> Verify</button></div>}
      />
      <section className="deploymentBanner">
        <div><span>{binding ? <CheckCircle2 size={23} /> : <AlertTriangle size={23} />}</span><div><h2>{binding ? "Tracking ready" : "Page lock required"}</h2><p>{binding ? "Your protected installation script is ready to use." : "Lock this existing endpoint before copying its script."}</p></div></div>
        {binding ? (verifyState.status === "success" ? <StatusPill state={verifyState.healthy ? "active" : "error"} label={verifyState.healthy ? `Healthy / ${verifyState.latency_ms} ms` : "Unavailable"} /> : <StatusPill state={endpointState(endpoint)} label={endpointState(endpoint) === "active" ? "Ready" : "Check"} />) : <StatusPill state="pending" label="Lock required" />}
      </section>
      {verifyState.error ? <Notice tone="error">{verifyState.error}</Notice> : null}
      <div className="pageTabs" role="tablist">
        <button className={tab === "install" ? "active" : ""} type="button" onClick={() => setTab("install")}><Code2 size={18} /> Install</button>
        <button className={tab === "settings" ? "active" : ""} type="button" onClick={() => setTab("settings")}><Settings size={18} /> Settings</button>
      </div>
      {tab === "install" ? <TrackingInstall endpoint={boundEndpoint} settings={settings} setSettings={setSettings} onBound={setBinding} /> : null}
      {tab === "settings" ? <EndpointSettings endpoint={boundEndpoint} onUpdate={onUpdate} onDelete={onDelete} updateState={updateState} /> : null}
    </main>
  );
}

export default function Workspace({
  user,
  route,
  navigate,
  backend,
  billing,
  onCheckout,
  refreshBilling,
  endpoints,
  endpointsState,
  refreshEndpoints,
  onCreate,
  createState,
  onVerify,
  verifyState,
  onUpdate,
  updateState,
  onDelete,
  deleteState,
  onLogout,
  authBusy,
  selectedEndpoint,
  onSelectEndpoint,
  onNew
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const active = route === "endpoint-settings" ? "tracking" : route;
  function open(endpoint) { onSelectEndpoint(endpoint, "tracking"); }
  function manage(endpoint) { onSelectEndpoint(endpoint, "endpoint-settings"); }
  function requestDelete(endpoint) { setDeleteTarget(endpoint); }
  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const ok = await onDelete(deleteTarget);
    if (ok) {
      removeTrackingSettings(user.id || user.email, id);
      setDeleteTarget(null);
    }
  }

  let page;
  if (route === "dashboard") {
    page = <Dashboard endpoints={endpoints} loading={endpointsState.status === "loading"} error={endpointsState.error} navigate={navigate} onNew={onNew} onOpen={open} onManage={manage} onDelete={requestDelete} busyId={deleteState.id} refresh={refreshEndpoints} />;
  } else if (route === "endpoints") {
    page = <EndpointsPage endpoints={endpoints} loading={endpointsState.status === "loading"} error={endpointsState.error} onNew={onNew} onOpen={open} onManage={manage} onDelete={requestDelete} busyId={deleteState.id} refresh={refreshEndpoints} />;
  } else if (route === "setup") {
    page = <SetupWizard backend={backend} billing={billing} createState={createState} onCreate={onCreate} onCheckout={onCheckout} refreshBilling={refreshBilling} onCancel={() => navigate("dashboard")} />;
  } else if (route === "platforms") {
    page = <PlatformsPage billing={billing} onCheckout={onCheckout} refreshBilling={refreshBilling} />;
  } else if (route === "billing") {
    page = <BillingPage billing={billing} onCheckout={onCheckout} refreshBilling={refreshBilling} navigate={navigate} />;
  } else if ((route === "tracking" || route === "endpoint-settings") && selectedEndpoint) {
    page = <TrackingPage endpoint={selectedEndpoint} user={user} initialTab={route === "endpoint-settings" ? "settings" : "install"} onBack={() => navigate("endpoints")} onGuide={() => navigate("guide")} onVerify={onVerify} verifyState={verifyState} onUpdate={onUpdate} updateState={updateState} onDelete={requestDelete} />;
  } else {
    page = <main className="workspaceMain"><WorkspaceHeader title="Tracking" description="Select a client to get its installation script." /><EmptyState icon={Route} title="Choose an endpoint" action={<button className="button primary" type="button" onClick={() => navigate("endpoints")}>View endpoints <ArrowRight size={17} /></button>}>Each client has its own tracking setup.</EmptyState></main>;
  }

  return (
    <div className="workspaceShell">
      <SideNav user={user} active={active} navigate={navigate} onNew={onNew} onLogout={onLogout} authBusy={authBusy} />
      {page}
      <EndpointDeleteModal endpoint={deleteTarget} open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleteState.status === "loading"} />
    </div>
  );
}
