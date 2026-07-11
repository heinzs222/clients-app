import React from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Code2,
  CreditCard,
  Database,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Route,
  Server,
  ShieldCheck,
  Webhook
} from "lucide-react";
import { Notice, PublicFooter, PublicHeader, StatusPill } from "./UI.jsx";

function PageFrame({ route, navigate, user, children }) {
  return (
    <div className="publicPage">
      <PublicHeader route={route} navigate={navigate} user={user} />
      {children}
      <PublicFooter navigate={navigate} />
    </div>
  );
}

export function HomePage({ navigate, user }) {
  return (
    <PageFrame route="home" navigate={navigate} user={user}>
      <main>
        <section className="homeHero">
          <div className="homeHeroCopy">
            <span className="eyebrow"><i /> Isolated CAPI infrastructure</span>
            <h1>Meta Conversions API tracking for every client.</h1>
            <p>CAPI Tracker creates a dedicated Netlify endpoint for each client, keeps Meta tokens server-side, and deduplicates browser and server Lead and Schedule events.</p>
            <div className="heroActions">
              <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}>
                {user ? "Create an endpoint" : "Launch your first endpoint"}<ArrowRight size={18} />
              </button>
              <button className="button secondary" type="button" onClick={() => navigate("docs")}>Read the setup guide</button>
            </div>
            <div className="heroTrust">
              <span><Check size={16} /> No token in page code</span>
              <span><Check size={16} /> Separate client sites</span>
              <span><Check size={16} /> $5 per endpoint</span>
            </div>
          </div>

          <div className="pipelineVisual" aria-label="GHL to Netlify to Meta data flow">
            <header><i /><i /><i /><code>capi-tracker / deploy</code></header>
            <div className="pipelineLog">
              <p><span>&gt;</span> Validating dataset credentials</p>
              <p className="active"><span>&gt;</span> Provisioning isolated Netlify site</p>
              <p><span>&gt;</span> Installing tracker and CAPI function</p>
            </div>
            <div className="pipelineNodes">
              <div><Webhook size={22} /><span>Form or GHL</span></div>
              <ArrowRight size={21} />
              <div className="selected"><Fingerprint size={22} /><span>Deduplication</span></div>
              <ArrowRight size={21} />
              <div><Database size={22} /><span>Meta CAPI</span></div>
            </div>
            <footer><i /> Server ready</footer>
          </div>
        </section>

        <section className="featureBand">
          <div className="sectionHeading">
            <span className="eyebrow">What gets automated</span>
            <h2>The repetitive infrastructure, handled once.</h2>
            <p>The app creates the server layer and gives you the two things needed for installation: a hosted tracker tag and a GHL webhook endpoint.</p>
          </div>
          <div className="featureGrid">
            <article>
              <span><Server size={22} /></span>
              <h3>Dedicated endpoint</h3>
              <p>Every client receives a separate Netlify site and environment variable set.</p>
            </article>
            <article>
              <span><Code2 size={22} /></span>
              <h3>Universal form tracker</h3>
              <p>Captures standard form fields, attribution, fbp, fbc, user agent, and a shared event ID.</p>
            </article>
            <article>
              <span><Route size={22} /></span>
              <h3>GHL mapping</h3>
              <p>Generates the JSON body for the GHL custom webhook step after contact creation.</p>
            </article>
            <article>
              <span><ShieldCheck size={22} /></span>
              <h3>Server-side secrets</h3>
              <p>Meta access tokens are sent only to the provisioner and stored as Netlify environment variables.</p>
            </article>
          </div>
        </section>

        <section className="pricingBand">
          <div>
            <span className="eyebrow">Simple pricing</span>
            <h2>$5 per endpoint. No subscription.</h2>
            <p>Each one-time Lemon Squeezy payment creates one isolated Netlify CAPI endpoint and its hosted tracker.</p>
          </div>
          <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}><CreditCard size={18} /> Buy an endpoint</button>
        </section>

        <section className="principleBand">
          <div>
            <span className="eyebrow">Built for real client work</span>
            <h2>One workspace. Clear client boundaries.</h2>
          </div>
          <ul>
            <li><LockKeyhole size={20} /><span><strong>Isolated credentials</strong> A client token never shares an environment with another client.</span></li>
            <li><Fingerprint size={20} /><span><strong>Match data coverage</strong> Email, phone, name, address, external ID, fbp, fbc, IP, and user agent are supported when available.</span></li>
            <li><Activity size={20} /><span><strong>Honest verification</strong> The app checks endpoint health without creating a fake Meta Lead event.</span></li>
          </ul>
        </section>
      </main>
    </PageFrame>
  );
}

const docsSections = [
  {
    id: "architecture",
    title: "How the flow works",
    body: (
      <>
        <p>The form page runs the hosted tracker. On submit it creates one event ID, uses it for the browser Pixel Lead event, and includes it in the payload.</p>
        <div className="inlineFlow"><span>Browser form</span><ArrowRight size={16} /><span>GHL inbound webhook</span><ArrowRight size={16} /><span>Generated Netlify endpoint</span><ArrowRight size={16} /><span>Meta CAPI</span></div>
        <p>If no GHL inbound URL is configured, the tracker posts directly to the generated Netlify endpoint.</p>
      </>
    )
  },
  {
    id: "create",
    title: "1. Create the endpoint",
    body: <p>Purchase one $5 endpoint credit through Lemon Squeezy, then enter a client name, the numeric Meta Dataset ID, and the Conversions API access token. The token is not saved in browser storage or returned by the API. It is written to that client site's Netlify environment.</p>
  },
  {
    id: "install",
    title: "2. Install the tracker",
    body: <p>Paste the generated script tag inside the actual page containing the form. A script outside a cross-origin iframe cannot read fields inside the iframe, so an embedded third-party form requires installation in the form document itself.</p>
  },
  {
    id: "ghl",
    title: "3. Configure GHL",
    body: (
      <ol>
        <li>Add the GHL inbound webhook URL to the tracker settings.</li>
        <li>Submit a real test form so GHL discovers the top-level inbound fields.</li>
        <li>In the workflow after contact creation, add a Custom Webhook action.</li>
        <li>Use the generated Netlify endpoint as the URL and paste the generated JSON mapping as the request body.</li>
        <li>Confirm the action returns <code>success: true</code> and the expected <code>event_id</code>.</li>
      </ol>
    )
  },
  {
    id: "deduplication",
    title: "Deduplication",
    body: <p>Meta deduplicates matching browser and server events using the same event name and event ID. The tracker fires the browser event and passes that exact ID through GHL to the Netlify function. Do not replace <code>event_id</code> with a contact ID in the workflow.</p>
  },
  {
    id: "match-data",
    title: "Event match data",
    body: <p>The generated function SHA-256 hashes normalized email, phone, first name, last name, city, state, postal code, country, and external ID. fbp, fbc, IP address, and user agent are sent unhashed as Meta expects. Actual Event Match Quality still depends on the fields a lead provides and Meta's ability to match them.</p>
  },
  {
    id: "testing",
    title: "Testing safely",
    body: <p>The dashboard Verify action sends an OPTIONS request only. To test an actual event, submit the real form and use Meta Events Manager's Test Events tool when appropriate. This avoids polluting production reporting with synthetic Leads.</p>
  }
];

export function DocsPage({ navigate, user }) {
  return (
    <PageFrame route="docs" navigate={navigate} user={user}>
      <main className="contentPage">
        <header className="contentHero">
          <span className="eyebrow">Implementation guide</span>
          <h1>Connect the browser, GHL, and Meta without losing the event ID.</h1>
          <p>This guide covers the generated infrastructure and the exact handoff between each system.</p>
        </header>
        <div className="contentLayout">
          <aside>
            <strong>On this page</strong>
            {docsSections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
          </aside>
          <article className="document">
            {docsSections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.body}
              </section>
            ))}
          </article>
        </div>
      </main>
    </PageFrame>
  );
}

export function PrivacyPage({ navigate, user }) {
  return (
    <PageFrame route="privacy" navigate={navigate} user={user}>
      <main className="contentPage legalPage">
        <header className="contentHero">
          <span className="eyebrow">Last updated July 11, 2026</span>
          <h1>Privacy Policy</h1>
          <p>How CAPI Tracker handles account data, credentials, configuration, and lead event payloads.</p>
        </header>
        <article className="document wide">
          <section><h2>1. Scope</h2><p>This policy applies to the CAPI Tracker web application and the client-specific Netlify services it provisions. It does not replace the privacy policies of Meta, Netlify, GoHighLevel, or a website using the generated tracker.</p></section>
          <section><h2>2. Account information</h2><p>Email addresses, passwords, confirmation links, and recovery sessions are handled by Netlify Identity. CAPI Tracker does not receive plaintext passwords.</p></section>
          <section><h2>3. Meta credentials</h2><p>A Meta Dataset ID and access token are submitted to the server-side provisioner over HTTPS. The token is stored in the generated client's Netlify environment variables. It is not embedded in tracker code, saved to browser storage, logged by the application, or returned in API responses.</p></section>
          <section><h2>4. Endpoint configuration</h2><p>Non-secret endpoint details such as client name, Dataset ID, deployment state, and site URL are used to display and manage endpoints. Tracker preferences, including an optional GHL inbound webhook URL, are stored locally in the current browser for convenience.</p></section>
          <section><h2>5. Lead event data</h2><p>Generated endpoints process event data only to format and send it to Meta Conversions API. CAPI Tracker does not provide a lead database and does not intentionally persist event payloads. Netlify runtime logs, GHL, and Meta may process data under their own terms and retention policies.</p></section>
          <section><h2>6. Payments</h2><p>Lemon Squeezy processes checkout, card details, receipts, payment status, tax, and related billing information as merchant of record. CAPI Tracker receives order identifiers, payment amount, currency, status, and redemption state. It does not receive complete card numbers or security codes.</p></section>
          <section><h2>7. Security and deletion</h2><p>Management actions require an authenticated session and are limited to endpoints owned by that account. Deleting an endpoint removes its generated Netlify site. Users remain responsible for deleting related data held by third parties.</p></section>
          <section><h2>8. Your responsibilities</h2><p>You must have a lawful basis to collect and transmit lead data, provide required notices, honor consent choices, and comply with Meta Business Tools Terms and applicable privacy laws.</p></section>
        </article>
      </main>
    </PageFrame>
  );
}

export function TermsPage({ navigate, user }) {
  return (
    <PageFrame route="terms" navigate={navigate} user={user}>
      <main className="contentPage legalPage">
        <header className="contentHero">
          <span className="eyebrow">Last updated July 11, 2026</span>
          <h1>Terms of Service</h1>
          <p>Operational terms for using CAPI Tracker to create and manage Meta CAPI endpoints.</p>
        </header>
        <article className="document wide">
          <section><h2>1. Service</h2><p>CAPI Tracker provisions client-specific Netlify sites, serverless functions, hosted tracker files, and installation guidance. Availability depends on Netlify, Meta, GHL, and internet services outside CAPI Tracker's control.</p></section>
          <section><h2>2. Authorized use</h2><p>You may use the service only for accounts, websites, datasets, and lead data you are authorized to manage. You may not use it to send misleading, unlawful, or unauthorized events.</p></section>
          <section><h2>3. Credentials</h2><p>You are responsible for obtaining valid Meta credentials, limiting access to your account, rotating exposed tokens, and removing endpoints no longer in use.</p></section>
          <section><h2>4. Privacy compliance</h2><p>You are the party determining what lead data is collected and sent. You are responsible for notices, consent, data processing agreements, retention obligations, and honoring data subject rights.</p></section>
          <section><h2>5. Payments and endpoint credits</h2><p>Unless an account is explicitly exempt, creating an endpoint requires one $5 USD Lemon Squeezy payment. A confirmed payment provides one endpoint credit. A credit is consumed when provisioning succeeds and cannot be reused for another endpoint. Deleting an endpoint does not restore its credit. Refund requests are reviewed according to applicable law and the service's stated refund policy.</p></section>
          <section><h2>6. No performance guarantee</h2><p>The service is designed to improve data completeness and support browser/server deduplication. It does not guarantee a specific Event Match Quality score, attribution result, ad performance, delivery rate, or revenue outcome.</p></section>
          <section><h2>7. Third-party platforms</h2><p>Your use of Lemon Squeezy, Meta, Netlify, and GHL remains subject to their terms. Changes, outages, limits, token revocation, payment disputes, or enforcement decisions by those platforms may affect the service.</p></section>
          <section><h2>8. Availability and liability</h2><p>The service is provided on an as-available basis. To the extent permitted by law, CAPI Tracker is not liable for indirect losses, lost advertising spend, missing attribution, or third-party platform failures.</p></section>
        </article>
      </main>
    </PageFrame>
  );
}

export function StatusPage({ navigate, user, backend }) {
  const ready = backend.status === "ready" && backend.ready;
  const paymentsReady = Boolean(backend.billing?.configured) || backend.billing?.required === false;
  return (
    <PageFrame route="status" navigate={navigate} user={user}>
      <main className="statusPage">
        <header>
          <span className="eyebrow">System status</span>
          <h1>Provisioning service</h1>
          <p>Live configuration check for the server that creates and manages client endpoints.</p>
        </header>
        <section className="statusPanel">
          <div>
            <span className={`statusIcon ${ready ? "ready" : "down"}`}><Server size={24} /></span>
            <div><h2>Netlify provisioner</h2><p>{backend.message}</p></div>
          </div>
          <StatusPill state={ready ? "active" : backend.status === "checking" ? "pending" : "error"} label={ready ? "Operational" : backend.status === "checking" ? "Checking" : "Needs configuration"} />
        </section>
        <section className="statusPanel">
          <div>
            <span className={`statusIcon ${paymentsReady ? "ready" : "down"}`}><CreditCard size={24} /></span>
            <div><h2>Lemon Squeezy Checkout</h2><p>{paymentsReady ? `${backend.billing?.mode === "test" ? "Test" : "Live"} payments configured at $5 per endpoint.` : "Lemon Squeezy API, store, or variant settings are missing."}</p></div>
          </div>
          <StatusPill state={paymentsReady ? "active" : "error"} label={paymentsReady ? "Operational" : "Needs configuration"} />
        </section>
        {!ready && backend.status !== "checking" ? (
          <Notice tone="warning" title="Administrator action required">The app host must have NETLIFY_AUTH_TOKEN and NETLIFY_ACCOUNT_SLUG configured before endpoint creation can work.</Notice>
        ) : null}
        {!paymentsReady ? <Notice tone="warning" title="Payments are not ready">Add the Lemon Squeezy API key, store ID, and variant ID before accepting paid endpoint purchases.</Notice> : null}
      </main>
    </PageFrame>
  );
}
