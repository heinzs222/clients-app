import React from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Code2,
  CreditCard,
  Database,
  FileCheck2,
  LockKeyhole,
  Server,
  ShieldCheck
} from "lucide-react";
import { Notice, PublicFooter, PublicHeader, Spinner, StatusPill } from "./UI.jsx";

function PageFrame({ route, navigate, user, children }) {
  return (
    <div className="publicPage">
      <PublicHeader route={route} navigate={navigate} user={user} />
      {children}
      <PublicFooter navigate={navigate} />
    </div>
  );
}

export function ComingSoonPage() {
  return (
    <main className="comingSoonPage" aria-label="Simple CAPI coming soon">
      <section className="comingSoonHero">
        <img className="comingSoonMark" src="/capi-tracker-mark.png" alt="" width="254" height="236" />
        <p className="comingSoonKicker">simplecapi.com</p>
        <h1>Simple CAPI</h1>
        <p className="comingSoonLine">Coming soon.</p>
      </section>
    </main>
  );
}

export function HomePage({ navigate, user }) {
  return (
    <PageFrame route="home" navigate={navigate} user={user}>
      <main>
        <section className="homeHero">
          <div className="homeHeroCopy">
            <span className="eyebrow"><i /> Easy conversion tracking for every ad platform</span>
            <h1>Track Meta, TikTok, and Google Ads with one simple script.</h1>
            <p>Choose the ad platform and conversion, paste the generated script on the exact page, and start sending better lead and booking data in minutes.</p>
            <div className="heroActions">
              <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}>
                {user ? "Create an endpoint" : "Launch your first endpoint"}<ArrowRight size={18} />
              </button>
              <button className="button secondary" type="button" onClick={() => navigate("guide")}>Unlock the 9.3 guide</button>
            </div>
            <div className="heroTrust">
              <span><Check size={16} /> First eligible script free</span>
              <span><Check size={16} /> 25+ client setups tested</span>
              <span><Check size={16} /> $5 per Lead or Schedule script</span>
            </div>
          </div>

          <figure className="homeHeroImage">
            <img
              src="/capi-tracker-header.png"
              alt="Simple CAPI conversion tracking"
              width="1024"
              height="1024"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </section>

        <section className="platformDiscovery" aria-labelledby="choose-platform">
          <header>
            <span className="eyebrow">Choose your ad platform</span>
            <h2 id="choose-platform">Meta, TikTok, and Google are all ready.</h2>
            <p>Each platform has its own guided setup, protected connection, and installation script.</p>
          </header>
          <div className="platformDiscoveryGrid">
            <article className="meta">
              <span className="platformWordmark">META</span>
              <h3>Easy Meta CAPI setup</h3>
              <p>Send Lead or Schedule events with the matching data used across 25+ successful client implementations.</p>
              <div className="platformTags"><span>Meta CAPI</span><span>9.3+ EMQ</span><span>Lead</span><span>Schedule</span></div>
              <a href="/how-to-set-up-meta-capi">Explore Meta CAPI <ArrowRight size={17} /></a>
            </article>
            <article className="tiktok">
              <span className="platformWordmark">TIKTOK</span>
              <h3>TikTok Pixel + Events API</h3>
              <p>Connect browser and server conversions with one event ID and the campaign details available on the page.</p>
              <div className="platformTags"><span>Events API</span><span>Pixel</span><span>Lead</span><span>Schedule</span></div>
              <a href="/how-to-set-up-tiktok-events-api">Explore TikTok tracking <ArrowRight size={17} /></a>
            </article>
            <article className="google">
              <span className="platformWordmark">GOOGLE ADS</span>
              <h3>Google enhanced conversions</h3>
              <p>Send the conversion, value, click details, and customer-provided data through one focused setup.</p>
              <div className="platformTags"><span>Google tag</span><span>Enhanced conversions</span><span>Lead</span></div>
              <a href="/how-to-set-up-google-ads-enhanced-conversions">Explore Google Ads tracking <ArrowRight size={17} /></a>
            </article>
          </div>
          <a className="button primary platformDiscoveryCta" href="/register">Create my first script <ArrowRight size={18} /></a>
        </section>

        <section className="resultsProof" aria-labelledby="results-proof-title">
          <div>
            <span className="eyebrow light">Proven on real client funnels</span>
            <h2 id="results-proof-title">9.3+ Meta Event Match Quality across every tested setup.</h2>
            <p>Our team has used this exact setup method with more than 25 clients. Every configured Lead and Schedule event reached at least 9.3 Event Match Quality.</p>
          </div>
          <dl>
            <div><dt>25+</dt><dd>client implementations</dd></div>
            <div><dt>9.3+</dt><dd>minimum tested EMQ</dd></div>
            <div><dt>1</dt><dd>script to install</dd></div>
          </dl>
        </section>

        <section className="featureBand">
          <div className="sectionHeading">
            <span className="eyebrow">Simple by design</span>
            <h2>Easy tracking setup without the usual technical work.</h2>
            <p>Create Meta CAPI, TikTok Events API, or Google enhanced conversion tracking from one focused workspace.</p>
          </div>
          <div className="featureGrid">
            <article>
              <span><Code2 size={22} /></span>
              <h3>One-step installation</h3>
              <p>Copy one generated script and paste it into the client page.</p>
            </article>
            <article>
              <span><Activity size={22} /></span>
              <h3>Meta, TikTok, and Google</h3>
              <p>Choose the platform first, then create the exact Lead or Schedule conversion you need.</p>
            </article>
            <article>
              <span><Database size={22} /></span>
              <h3>Organized by client</h3>
              <p>Keep every client and dataset clearly separated in your workspace.</p>
            </article>
            <article>
              <span><ShieldCheck size={22} /></span>
              <h3>Protected credentials</h3>
              <p>Sensitive credentials never appear in the installation script.</p>
            </article>
          </div>
        </section>

        <section className="pricingBand">
          <div>
            <span className="eyebrow">Simple pricing</span>
            <h2>$5 for Lead. $5 for Schedule.</h2>
            <p>Each one-time payment creates exactly one event-specific script. Lead and Schedule are separate purchases, so using both costs $10 total. No subscription.</p>
          </div>
          <button className="button primary" type="button" onClick={() => navigate(user ? "setup" : "register")}><CreditCard size={18} /> Buy an endpoint</button>
        </section>

        <section className="guideBand">
          <div>
            <span className="guideIcon"><FileCheck2 size={24} /></span>
            <span className="eyebrow">Included with every script</span>
            <h2>Use the same 9.3+ Meta setup method.</h2>
            <p>Every Meta script includes the private configuration, installation, and verification guide used across our 25+ tested client implementations.</p>
          </div>
          <button className="button primary" type="button" onClick={() => navigate("guide")}>Unlock with a script <ArrowRight size={18} /></button>
        </section>

        <section className="principleBand">
          <div>
            <span className="eyebrow">Built for real client work</span>
            <h2>One workspace. Clear client boundaries.</h2>
          </div>
          <ul>
            <li><Activity size={20} /><span><strong>Fast launch</strong> Go from client credentials to installation code in a few steps.</span></li>
            <li><ShieldCheck size={20} /><span><strong>9.3+ Meta result</strong> Follow the tested setup used successfully across more than 25 client implementations.</span></li>
            <li><Code2 size={20} /><span><strong>Simple handoff</strong> Give the installer one script, not a technical workflow.</span></li>
            <li><LockKeyhole size={20} /><span><strong>Private by default</strong> Client credentials stay out of page code.</span></li>
          </ul>
        </section>
      </main>
    </PageFrame>
  );
}

export function EmqGuidePage({ navigate, user, guideState, onRetry }) {
  const guide = guideState.data;
  return (
    <PageFrame route="guide" navigate={navigate} user={user}>
      <main className="contentPage guidePage">
        <header className="contentHero">
          <span className="eyebrow">{guide?.eyebrow || "Purchased setup guide"}</span>
          <h1>{guide?.title || "Your 9.3 EMQ setup guide"}</h1>
          <p>{guide?.description || "Loading your private event setup instructions."}</p>
        </header>
        {guideState.status === "loading" || guideState.status === "idle" ? <Spinner label="Loading your private guide" /> : null}
        {guideState.status === "error" ? <Notice tone="error" title="Could not load guide">{guideState.error}<button className="button secondary small" type="button" onClick={onRetry}>Try again</button></Notice> : null}
        {guide ? (
          <div className="contentLayout">
            <aside>
              <strong>9.3 setup checklist</strong>
              {guide.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
            </aside>
            <article className="document">
              <section className="guideIntro">
                <span><FileCheck2 size={22} /></span>
                <div><h2>{guide.intro_title}</h2><p>{guide.intro_text}</p></div>
              </section>
              {guide.sections.map((section) => (
                <section id={section.id} key={section.id}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
              <section className="guideCta">
                <h2>{guide.cta_title}</h2>
                <p>{guide.cta_text}</p>
                <button className="button primary" type="button" onClick={() => navigate("setup")}>Buy another script <ArrowRight size={18} /></button>
              </section>
            </article>
          </div>
        ) : null}
      </main>
    </PageFrame>
  );
}

const docsSections = [
  {
    id: "purchase",
    title: "Event-specific pricing",
    body: <p>Each $5 one-time purchase unlocks one client-specific Lead or Schedule setup. Lead and Schedule are separate purchases, so both events cost $10 total.</p>
  },
  {
    id: "workspace",
    title: "Private delivery",
    body: <p>The purchased setup, installation code, configuration controls, and verification guidance are delivered inside the account workspace.</p>
  },
  {
    id: "security",
    title: "Protected credentials",
    body: <p>Sensitive client credentials stay protected and do not appear in the installation code provided to the customer.</p>
  },
  {
    id: "support",
    title: "Guided launch",
    body: <p>After purchase, the workspace provides the exact event-specific instructions needed to install, validate, and manage the setup.</p>
  }
];

export function DocsPage({ navigate, user }) {
  return (
    <PageFrame route="docs" navigate={navigate} user={user}>
      <main className="contentPage">
        <header className="contentHero">
          <span className="eyebrow">Product overview</span>
          <h1>Simple, private event setup.</h1>
          <p>What Simple CAPI provides before you choose a Lead or Schedule event.</p>
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
          <p>How Simple CAPI handles account data, credentials, configuration, and lead event payloads.</p>
        </header>
        <article className="document wide">
          <section><h2>1. Scope</h2><p>This policy applies to the Simple CAPI application and its client tracking services. It does not replace the privacy policies of Meta or websites using Simple CAPI.</p></section>
          <section><h2>2. Account information</h2><p>Email addresses, passwords, confirmation links, and recovery sessions are handled by a managed authentication service. Simple CAPI does not receive plaintext passwords.</p></section>
          <section><h2>3. Meta credentials</h2><p>A Meta Dataset ID and access token are submitted over HTTPS and handled securely. The token is not included in installation code, saved to browser storage, logged by the application, or returned in account responses.</p></section>
          <section><h2>4. Endpoint configuration</h2><p>Non-secret details such as client name, Dataset ID, status, and tracking preferences are used to display and manage each endpoint.</p></section>
          <section><h2>5. Lead event data</h2><p>Simple CAPI processes conversion information only to provide the service. It does not provide a lead database and does not intentionally persist event payloads. Meta and service providers may process data under their own terms and retention policies.</p></section>
          <section><h2>6. Payments</h2><p>Lemon Squeezy processes checkout, card details, receipts, payment status, tax, and related billing information as merchant of record. Simple CAPI receives order identifiers, payment amount, currency, status, and redemption state. It does not receive complete card numbers or security codes.</p></section>
          <section><h2>7. Security and deletion</h2><p>Management actions require an authenticated session and are limited to endpoints owned by that account. Deleting an endpoint removes its generated event service and stored credentials. Users remain responsible for deleting related data held by third parties.</p></section>
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
          <span className="eyebrow">Last updated July 13, 2026</span>
          <h1>Terms of Service</h1>
          <p>Operational terms for using Simple CAPI to create and manage Meta CAPI endpoints.</p>
        </header>
        <article className="document wide">
          <section><h2>1. Service</h2><p>Simple CAPI provides client-specific Meta conversion tracking, installation scripts, and account management. Availability depends on Meta and internet services outside Simple CAPI's control.</p></section>
          <section><h2>2. Authorized use</h2><p>You may use the service only for accounts, websites, datasets, and lead data you are authorized to manage. You may not use it to send misleading, unlawful, or unauthorized events.</p></section>
          <section><h2>3. Credentials</h2><p>You are responsible for obtaining valid Meta credentials, limiting access to your account, rotating exposed tokens, and removing endpoints no longer in use.</p></section>
          <section><h2>4. Privacy compliance</h2><p>You are the party determining what lead data is collected and sent. You are responsible for notices, consent, data processing agreements, retention obligations, and honoring data subject rights.</p></section>
          <section><h2>5. Payments and conversion credits</h2><p>Unless an account is explicitly exempt, each Lead or Schedule endpoint requires one $5 USD payment. Lead and Schedule are purchased separately, so enabling both costs $10 USD. A confirmed payment provides one conversion credit, which is consumed when endpoint creation succeeds and cannot be reused. Deleting an endpoint does not restore its credit. Refund requests are reviewed according to applicable law and the service's stated refund policy.</p></section>
          <section><h2>6. No performance guarantee</h2><p>The service is designed to improve conversion data completeness. It does not guarantee a specific Event Match Quality score, attribution result, ad performance, delivery rate, or revenue outcome.</p></section>
          <section><h2>7. Third-party platforms</h2><p>Your use of Lemon Squeezy, Meta, and other connected services remains subject to their terms. Changes, outages, limits, token revocation, payment disputes, or enforcement decisions by those platforms may affect the service.</p></section>
          <section><h2>8. Availability and liability</h2><p>The service is provided on an as-available basis. To the extent permitted by law, Simple CAPI is not liable for indirect losses, lost advertising spend, missing attribution, or third-party platform failures.</p></section>
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
          <h1>Service availability</h1>
          <p>Current status for Simple CAPI tracking and checkout.</p>
        </header>
        <section className="statusPanel">
          <div>
            <span className={`statusIcon ${ready ? "ready" : "down"}`}><Server size={24} /></span>
            <div><h2>Core tracking</h2><p>{ready ? "Available" : backend.status === "checking" ? "Checking availability..." : "Temporarily unavailable"}</p></div>
          </div>
          <StatusPill state={ready ? "active" : backend.status === "checking" ? "pending" : "error"} label={ready ? "Operational" : backend.status === "checking" ? "Checking" : "Needs configuration"} />
        </section>
        <section className="statusPanel">
          <div>
            <span className={`statusIcon ${paymentsReady ? "ready" : "down"}`}><CreditCard size={24} /></span>
            <div><h2>Checkout</h2><p>{paymentsReady ? `${backend.billing?.mode === "test" ? "Test" : "Live"} checkout is available.` : "Checkout is temporarily unavailable."}</p></div>
          </div>
          <StatusPill state={paymentsReady ? "active" : "error"} label={paymentsReady ? "Operational" : "Needs configuration"} />
        </section>
        {!ready && backend.status !== "checking" ? (
          <Notice tone="warning" title="Service unavailable">Endpoint creation is temporarily unavailable.</Notice>
        ) : null}
        {!paymentsReady ? <Notice tone="warning" title="Checkout unavailable">Please try again later.</Notice> : null}
      </main>
    </PageFrame>
  );
}
