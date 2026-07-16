import React, { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  CircleAlert,
  Code2,
  Database,
  Fingerprint,
  Gauge,
  GitMerge,
  Globe2,
  Layers3,
  Link2,
  LockKeyhole,
  Network,
  Radar,
  RefreshCw,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  Users2,
  Workflow
} from "lucide-react";
import { Brand } from "./UI.jsx";

const ROOT = "https://simplecapi.com";

export const SEO_PATHS = new Set([
  "/gohighlevel-meta-capi",
  "/meta-capi-no-attribution-data",
  "/meta-capi-event-deduplication",
  "/improve-meta-event-match-quality",
  "/stape-alternative",
  "/meta-capi-for-agencies"
]);

const relatedLabels = {
  "/gohighlevel-meta-capi": "GoHighLevel Meta CAPI",
  "/meta-capi-no-attribution-data": "Fix missing attribution",
  "/meta-capi-event-deduplication": "Event deduplication",
  "/improve-meta-event-match-quality": "Improve match quality",
  "/stape-alternative": "Focused Stape alternative",
  "/meta-capi-for-agencies": "Meta CAPI for agencies"
};

const pages = {
  "/gohighlevel-meta-capi": {
    theme: "flow",
    title: "GoHighLevel Meta CAPI Integration | SimpleCAPI",
    description: "Send reliable Meta Conversions API events from GoHighLevel. Preserve attribution data, improve event matching, and simplify server-side lead tracking.",
    eyebrow: "GoHighLevel + Meta Conversions API",
    h1: "Reliable Meta CAPI tracking for GoHighLevel.",
    intro: "Turn GoHighLevel form submissions, bookings, and workflow events into structured server-side Meta conversions without rebuilding a fragile tracking setup for every funnel.",
    primary: "Connect GoHighLevel",
    secondary: "See the event flow",
    proof: ["One generated installation", "Lead and Schedule events", "Credentials stay protected"],
    problemTitle: "GoHighLevel captures the lead. Meta still needs the right signals.",
    problemIntro: "The CRM event is only the final step. Useful attribution starts on the landing page and must survive every handoff after it.",
    problems: [
      ["Attribution disappears", "Redirects, embedded forms, and disconnected workflows can separate the conversion from the original Meta click."],
      ["Events arrive incomplete", "A server event may be delivered while still missing useful browser, identity, or source information."],
      ["Every client becomes a custom build", "Copying scripts, webhook mappings, and payload logic across accounts creates avoidable errors."]
    ],
    steps: [
      ["Capture the visit", "Preserve campaign parameters, click identifiers, and browser context before the form is submitted."],
      ["Connect the lead", "Pass the submitted contact and event data into a controlled Simple CAPI endpoint."],
      ["Send the conversion", "Deliver a structured server event using the client’s own Meta dataset credentials."],
      ["Validate the result", "Inspect matching, diagnostics, and deduplication inside Meta Events Manager."]
    ],
    codeLabel: "Example Lead payload",
    code: `{
  "event_name": "Lead",
  "event_id": "lead_demo_9f6d2a",
  "event_source_url": "https://example.com/free-estimate",
  "action_source": "website",
  "user_data": {
    "em": "[hashed_email]",
    "ph": "[hashed_phone]",
    "fbp": "fb.1.demo",
    "fbc": "fb.1.demo-click",
    "client_user_agent": "[browser_user_agent]"
  }
}`,
    featureTitle: "Built around the conversion moments agencies actually track.",
    features: ["Form submitted", "Appointment booked", "Qualified lead", "Estimate requested", "Pipeline milestone", "Purchase completed"],
    faq: [
      ["Can I use Simple CAPI with GoHighLevel forms?", "Yes. The generated setup can connect a page or form submission to a client-specific server endpoint. The exact implementation depends on how the form is embedded and where the submission is handled."],
      ["Can it work with GoHighLevel calendars?", "Schedule events are supported as a separate event-specific script. Keep the booking event ID and source data connected to the original visit."],
      ["Do I still need the Meta Pixel?", "The Pixel remains useful for browser-side signals and can run beside CAPI. When both send the same conversion, configure deduplication with a shared event name and event ID."],
      ["What information should I preserve from the landing page?", "Keep the original URL, Meta click and browser identifiers when available, UTMs, user agent, event source URL, and a stable event ID."],
      ["Can one agency manage multiple client datasets?", "Simple CAPI separates client endpoints and dataset configuration inside the workspace. Each client should use the dataset and credentials they control."],
      ["How do I test a server event?", "Use Meta Events Manager Test Events and Diagnostics, then verify that the expected event name, source, match parameters, and deduplication details appear."]
    ],
    related: ["/meta-capi-no-attribution-data", "/meta-capi-event-deduplication", "/improve-meta-event-match-quality", "/meta-capi-for-agencies"]
  },
  "/meta-capi-no-attribution-data": {
    theme: "scanner",
    title: "Fix Meta CAPI No Attribution Data | SimpleCAPI",
    description: "Understand and fix missing attribution in Meta Conversions API events. Preserve click IDs, browser identifiers, UTMs, and event source information.",
    eyebrow: "Meta CAPI troubleshooting",
    h1: "Fix “No Attribution Data” at the source.",
    intro: "A conversion can reach Meta and still provide weak attribution. Trace what disappeared between the ad click, landing page, form submission, CRM, and server event.",
    primary: "Build a complete event",
    secondary: "View common causes",
    proof: ["Trace every handoff", "Keep source context", "Validate the final payload"],
    problemTitle: "Delivered does not always mean attributable.",
    problemIntro: "A successful API response confirms delivery. It does not prove that Meta received enough context to connect the event to the original ad interaction.",
    problems: [
      ["The click identifier was never stored", "The visitor arrived from an ad, but the click information vanished before the form or CRM record was created."],
      ["A redirect removed the query parameters", "The first landing URL contained attribution data, but a route change failed to preserve it."],
      ["Browser identifiers were not passed", "The server event was disconnected from useful browser-side context."],
      ["The event source was incomplete", "The payload did not clearly identify where the conversion happened."],
      ["The workflow started too late", "The CRM knew a lead converted but had no access to the lead’s original website visit."],
      ["The wrong event was inspected", "A test event, browser event, and production server event can look similar while carrying different fields."]
    ],
    steps: [
      ["Inspect the original landing URL", "Confirm the ad click identifier and UTMs are present before any redirect."],
      ["Store attribution early", "Persist useful browser and campaign values before the visitor submits anything."],
      ["Carry the values through the CRM", "Map the fields through the form, contact record, webhook, and workflow."],
      ["Inspect the final server payload", "Verify the exact event sent to Meta, not merely the source form data."]
    ],
    codeLabel: "Connected event checklist",
    code: `event_name        Lead
event_id          lead_8e71c4
event_source_url  https://example.com/offer
fbclid / fbc       present when available
fbp                present when available
client_user_agent  present
email / phone      normalized + hashed
UTM parameters     preserved for reporting`,
    featureTitle: "Check these values before blaming Meta.",
    features: ["Original landing URL", "FBCLID and FBC", "FBP browser ID", "UTM parameters", "Event source URL", "Client user agent", "Normalized identity data", "Stable event ID"],
    faq: [
      ["What does “No Attribution Data” mean?", "It generally means the event lacks enough usable context to connect it confidently to an ad interaction or browser session."],
      ["Can an event be received without being attributed?", "Yes. Delivery and attribution are separate. Meta can receive the event while still having limited information for matching or campaign attribution."],
      ["Is FBCLID always available?", "No. It may be absent because the visit did not come from a Meta ad, consent or browser conditions limited it, or a redirect removed it."],
      ["What is the difference between FBCLID and FBC?", "FBCLID is the click identifier commonly found in the landing URL. FBC is the formatted browser value that can be derived or stored for Meta matching when appropriate."],
      ["Can UTMs replace Meta click identifiers?", "No. UTMs are useful for your own reporting, but they do not replace Meta-specific click and browser identifiers."],
      ["Does Simple CAPI guarantee attribution?", "No platform can guarantee that Meta attributes every event. Simple CAPI helps preserve and send the available signals correctly; Meta controls the final matching and attribution decision."]
    ],
    related: ["/gohighlevel-meta-capi", "/improve-meta-event-match-quality", "/meta-capi-event-deduplication"]
  },
  "/meta-capi-event-deduplication": {
    theme: "dedupe",
    title: "Meta CAPI Event Deduplication Guide | SimpleCAPI",
    description: "Prevent duplicate Meta conversions by connecting browser Pixel events and server CAPI events with matching event names and unique event IDs.",
    eyebrow: "Browser + server tracking",
    h1: "One conversion. One event ID. No double counting.",
    intro: "Use the Meta Pixel and Conversions API together without reporting the same lead or purchase twice.",
    primary: "Create deduplicated events",
    secondary: "See how matching works",
    proof: ["Shared event ID", "Matching event name", "Retry-safe delivery"],
    problemTitle: "Deduplication fails when the events cannot recognize each other.",
    problemIntro: "Browser and server events are separate requests. They become one conversion only when the identifying details match.",
    problems: [
      ["Different event IDs", "The Pixel and server create unrelated identifiers for the same conversion."],
      ["Different event names", "A browser Lead and a server CompleteRegistration do not describe the same event."],
      ["The server generates a new ID", "The form’s event ID never reaches the webhook or server function."],
      ["The browser fires twice", "Multiple listeners or repeated renders send duplicate Pixel events before CAPI is involved."],
      ["Retries create new conversions", "A failed request is retried with a fresh event ID instead of reusing the original."],
      ["Several tools send the same event", "Native CRM tracking, GTM, plugins, and custom code overlap without a shared plan."]
    ],
    steps: [
      ["Generate one event ID", "Create it at the conversion source before either browser or server delivery begins."],
      ["Send it with the Pixel event", "Use the eventID option with the exact event name."],
      ["Carry it into the server request", "Include the same value in the form, webhook, or backend payload."],
      ["Reuse it for safe retries", "A retry should represent the same conversion, not invent a new one."],
      ["Inspect both event sources", "Confirm browser and server events appear as connected in Events Manager."]
    ],
    codeLabel: "Shared event ID example",
    code: `const eventId = crypto.randomUUID();

fbq("track", "Lead", {}, {
  eventID: eventId
});

await sendToSimpleCAPI({
  event_name: "Lead",
  event_id: eventId
});`,
    featureTitle: "Keep both delivery paths tied to the same conversion identity.",
    features: ["Generate once", "Send through both paths", "Keep event names identical", "Reuse on retries", "Avoid overlapping tools", "Validate in Events Manager"],
    faq: [
      ["What is Meta event deduplication?", "It is the process Meta uses to recognize that a browser Pixel event and a server CAPI event represent the same conversion."],
      ["Do browser and server events need the same event name?", "Yes. Use the same event name and the same event ID for the same conversion."],
      ["Where should I generate the event ID?", "Generate it as close as possible to the conversion action, then pass that exact value to both delivery paths."],
      ["Should retries use a new event ID?", "No. Retry the same conversion with the original ID. A new ID can make the retry look like another conversion."],
      ["Can I use only CAPI without the Pixel?", "Yes, but you lose browser-side signals that may be useful. Deduplication is only needed when both paths send the same event."],
      ["How do I find duplicate events?", "Inspect Events Manager Diagnostics, compare event source breakdowns, and review whether several scripts or integrations fire the same event."]
    ],
    related: ["/improve-meta-event-match-quality", "/gohighlevel-meta-capi"]
  },
  "/improve-meta-event-match-quality": {
    theme: "emq",
    title: "Improve Meta Event Match Quality | SimpleCAPI",
    description: "Improve Meta Event Match Quality by sending normalized identity signals, browser identifiers, click information, and complete server event context.",
    eyebrow: "Event Match Quality",
    h1: "Give Meta stronger match signals, not more noise.",
    intro: "Build server events with useful, properly formatted customer and browser information so Meta has a better chance of connecting conversions to accounts and ad interactions.",
    primary: "Improve my event payload",
    secondary: "Inspect the signals",
    proof: ["Normalize identity data", "Preserve browser context", "Send complete event details"],
    problemTitle: "Event Match Quality starts before the API request.",
    problemIntro: "A perfect-looking JSON object cannot recover data that was never captured, was formatted incorrectly, or was separated from the original visit.",
    problems: [
      ["Identity data is inconsistent", "Spaces, casing, local phone formats, and placeholder values weaken otherwise useful fields."],
      ["Browser context is missing", "The server event cannot benefit from identifiers that were discarded on the page."],
      ["The event source is vague", "Meta receives the conversion but little context about where it happened."],
      ["More fields create more noise", "Inaccurate or fabricated values do not become useful merely because the payload is larger."],
      ["Hashing happens too early", "Data is hashed before normalization, producing a different result from the expected value."],
      ["Consent is ignored", "A technically complete payload can still be inappropriate if the data was not lawfully collected or permitted."]
    ],
    steps: [
      ["Capture accurate source data", "Collect only the values you are permitted to process and can keep connected to the event."],
      ["Normalize before hashing", "Trim and format identity fields consistently, then hash the required values."],
      ["Preserve browser identifiers", "Carry available FBP, FBC, user agent, source URL, and click context into the server event."],
      ["Use a stable event ID", "Keep one identifier across browser delivery, server delivery, and retries."],
      ["Monitor diagnostics", "Review changes over time rather than treating one score as a permanent result."]
    ],
    codeLabel: "Normalize, then hash",
    code: `Email
Before:  " Demo.User@Example.COM "
Normalized: "demo.user@example.com"
Hashed:     "[sha256 value]"

Phone
Before:     "(514) 555-0199"
Normalized: "15145550199"
Hashed:     "[sha256 value]"`,
    featureTitle: "Useful signal coverage.",
    features: ["Email", "Phone", "External ID", "First and last name", "City and region", "Postal code and country", "FBP and FBC", "IP and user agent", "Event source URL", "Event ID"],
    faq: [
      ["What is Meta Event Match Quality?", "It is Meta’s assessment of how effectively the customer information parameters in an event may help match it to Meta accounts."],
      ["Is Event Match Quality the same as attribution?", "No. Matching, attribution, and reporting are related but separate processes."],
      ["Which parameters affect matching?", "Useful identity fields, browser identifiers, click context, user agent, IP when appropriate, event source, and consistent formatting can all contribute."],
      ["Should email and phone be hashed?", "Meta expects certain customer information fields to be normalized and SHA-256 hashed before transmission unless the integration handles that step for you."],
      ["Can I guarantee a 10/10 score?", "No. Available data, browser conditions, consent, implementation details, and Meta’s own systems affect the result."],
      ["Does a higher score guarantee better ad performance?", "No. Better signals can improve measurement quality, but they do not guarantee lower costs, higher ROAS, or better campaign outcomes."],
      ["How long does Meta take to update the score?", "Updates are not always immediate. Use recent event diagnostics and parameter coverage alongside the displayed score."]
    ],
    related: ["/meta-capi-no-attribution-data", "/meta-capi-event-deduplication"]
  },
  "/stape-alternative": {
    theme: "compare",
    title: "SimpleCAPI: A Focused Stape Alternative for Meta CAPI",
    description: "Compare SimpleCAPI with broader server-side tracking platforms. Choose a focused Meta CAPI workflow when you do not need a complete server GTM infrastructure.",
    eyebrow: "Focused Meta CAPI implementation",
    h1: "A simpler Meta CAPI path when you do not need an entire server-side GTM stack.",
    intro: "Simple CAPI focuses on direct Meta conversion endpoints. Broader platforms support server-side tagging across many destinations. Choose the architecture that matches the destinations, control, and maintenance your team actually needs.",
    primary: "Try the focused approach",
    secondary: "Compare the workflows",
    proof: ["Meta-focused", "No server GTM required", "One-time event scripts"],
    problemTitle: "Different tools for different tracking architectures.",
    problemIntro: "Simple CAPI is intentionally narrow. A broader server-side platform is more configurable, but that extra surface area only helps when your implementation needs it.",
    problems: [
      ["A focused workflow", "Website or CRM → Simple CAPI → Meta. Best when Meta conversion delivery is the main requirement."],
      ["A broader stack", "Website → web container → server container → several analytics and advertising destinations."],
      ["Different maintenance burden", "A direct endpoint is easier to hand off; a server tagging environment offers more control and requires more ongoing expertise."]
    ],
    steps: [
      ["List the destinations", "Decide whether Meta is the only server-side destination or one part of a larger analytics architecture."],
      ["Map the events", "Identify the conversions, source systems, and data requirements you actually need."],
      ["Choose the smallest complete system", "Avoid both underbuilding and paying for architecture that your team will never use."],
      ["Validate ownership and maintenance", "Know who controls credentials, monitors diagnostics, and updates the implementation."]
    ],
    codeLabel: "Architecture comparison",
    code: `Focused Meta workflow
Website or CRM → Simple CAPI → Meta

Broader server-side workflow
Website → Web GTM → Server GTM
        → Meta
        → Google Analytics
        → Other destinations`,
    featureTitle: "Simple CAPI may fit when:",
    features: ["Meta is the main destination", "You need reusable client endpoints", "You want a smaller setup surface", "You do not need server GTM", "Your team wants direct payload control", "You prefer one-time event pricing"],
    comparison: [
      ["Primary focus", "Direct Meta CAPI event delivery", "Multi-platform server-side tagging"],
      ["Typical setup", "Client, event, credentials, generated script", "Server container, clients, tags, hosting"],
      ["Best suited for", "Focused Meta conversion workflows", "Advanced multi-platform analytics"],
      ["Server GTM control", "Not required", "Core capability"],
      ["Technical complexity", "Focused implementation", "More configurable and usually more involved"],
      ["Other destinations", "Meta-focused today", "Commonly designed for several platforms"]
    ],
    faq: [
      ["Is Simple CAPI a complete replacement for Stape?", "No. It is not a replacement for every Stape or server GTM use case. It is a focused alternative when direct Meta conversion delivery is the actual requirement."],
      ["Does Simple CAPI use server-side tracking?", "Yes. It creates a protected server endpoint that receives the conversion data and sends the event to Meta."],
      ["Do I need server Google Tag Manager?", "Not for the focused Simple CAPI workflow."],
      ["Which option is better for Meta-only tracking?", "A focused endpoint can be simpler when Meta is the only server-side destination and the required events are supported."],
      ["Which option is better for multi-platform analytics?", "A broader server-side tagging platform is usually more appropriate when you need several destinations, advanced tag logic, or container-level control."],
      ["Can an agency migrate one client at a time?", "Yes. Evaluate each client’s stack separately rather than forcing every account into one architecture."]
    ],
    related: ["/meta-capi-for-agencies", "/gohighlevel-meta-capi", "/improve-meta-event-match-quality"]
  },
  "/meta-capi-for-agencies": {
    theme: "agency",
    title: "Meta CAPI for Agencies and Multiple Clients | SimpleCAPI",
    description: "Manage repeatable Meta CAPI setups across agency clients. Create endpoints, standardize event payloads, and reduce tracking implementation work.",
    eyebrow: "Built for client tracking operations",
    h1: "Stop rebuilding Meta CAPI from scratch for every client.",
    intro: "Create a repeatable server-side conversion workflow for landing pages, CRMs, forms, and booking systems across your client portfolio.",
    primary: "Add your first client",
    secondary: "Explore agency workflows",
    proof: ["Separate client endpoints", "Repeatable payload standard", "Simple installer handoff"],
    problemTitle: "The implementation should scale better than the client list.",
    problemIntro: "An agency setup becomes expensive when every launch depends on one person remembering a slightly different collection of scripts and webhook fields.",
    problems: [
      ["Repeated setup work", "Each account requires another round of scripts, webhooks, field mapping, and testing."],
      ["Inconsistent payloads", "Different developers and funnel builders send different versions of the same conversion event."],
      ["Credentials spread across tools", "Dataset IDs, tokens, and endpoint details become difficult to audit and maintain."],
      ["Reactive troubleshooting", "Tracking problems are often discovered after campaign reporting already looks wrong."],
      ["Messy client handoff", "The installer receives a technical workflow instead of one controlled script."],
      ["No shared checklist", "Launch quality depends on memory rather than a repeatable standard."]
    ],
    steps: [
      ["Create the client endpoint", "Keep the client name, dataset, event, and generated installation clearly separated."],
      ["Connect client-owned credentials", "Use the dataset and token approved for that client’s Meta account."],
      ["Install the generated script", "Add the controlled implementation to the landing page, form, or custom workflow."],
      ["Send a test conversion", "Check browser context, identity fields, source details, and event ID before launch."],
      ["Document the final setup", "Record the event source, owner, validation result, and any client-specific field mapping."]
    ],
    codeLabel: "Agency event standard",
    code: `Required
event_name
event_id
event_time
action_source
event_source_url

When available
email, phone, external_id
fbp, fbc, user_agent, ip_address
value, currency, UTM parameters`,
    featureTitle: "Designed for the systems agencies inherit.",
    features: ["GoHighLevel", "HubSpot", "Custom React forms", "WordPress forms", "Webflow", "Shopify", "Zapier workflows", "Custom backends"],
    faq: [
      ["Can I manage multiple clients?", "Yes. The workspace organizes separate endpoints by client so configurations do not have to live inside one shared script."],
      ["Does every client use a separate dataset?", "Each endpoint should use the dataset approved for that client. Whether a business uses one or several datasets depends on its Meta setup."],
      ["Can I use different events for different clients?", "Yes. Lead and Schedule are separate event-specific scripts, and each client setup can use the event it requires."],
      ["Can this work with client-owned Meta accounts?", "Yes. Use client-approved dataset credentials and keep access ownership clear in your documentation."],
      ["How should agencies handle access tokens?", "Use the least access required, keep tokens out of page code and shared documents, and rotate or revoke them when access changes."],
      ["Can I test an event before launching ads?", "Yes. Send test events and inspect the exact parameters in Events Manager before relying on production reporting."],
      ["Does Simple CAPI replace an analytics specialist?", "No. It reduces implementation work for supported Meta events, but measurement strategy, consent, debugging, and broader analytics still require qualified judgment."]
    ],
    related: ["/gohighlevel-meta-capi", "/meta-capi-no-attribution-data", "/meta-capi-event-deduplication", "/improve-meta-event-match-quality", "/stape-alternative"]
  }
};

function upsertMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const [name, key] = attribute;
    element.setAttribute(name, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function useSeoMetadata(page, path) {
  useEffect(() => {
    const url = `${ROOT}${path}`;
    document.title = page.title;
    upsertMeta('meta[name="description"]', ["name", "description"], page.description);
    upsertMeta('meta[name="robots"]', ["name", "robots"], "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    upsertMeta('meta[property="og:title"]', ["property", "og:title"], page.title);
    upsertMeta('meta[property="og:description"]', ["property", "og:description"], page.description);
    upsertMeta('meta[property="og:url"]', ["property", "og:url"], url);
    upsertMeta('meta[name="twitter:title"]', ["name", "twitter:title"], page.title);
    upsertMeta('meta[name="twitter:description"]', ["name", "twitter:description"], page.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let schema = document.getElementById("simplecapi-seo-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.id = "simplecapi-seo-schema";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: page.title,
          description: page.description,
          isPartOf: { "@id": `${ROOT}/#website` },
          about: { "@type": "SoftwareApplication", name: "Simple CAPI", applicationCategory: "BusinessApplication" }
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Simple CAPI", item: `${ROOT}/` },
            { "@type": "ListItem", position: 2, name: page.eyebrow, item: url }
          ]
        },
        {
          "@type": "FAQPage",
          mainEntity: page.faq.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
          }))
        }
      ]
    });
  }, [page, path]);
}

function SiteHeader() {
  return (
    <header className="seoHeader">
      <div className="seoHeaderInner">
        <a className="seoBrand" href="/" aria-label="Simple CAPI home"><Brand compact /></a>
        <nav className="seoNav" aria-label="SEO resources">
          <a href="/gohighlevel-meta-capi">GoHighLevel</a>
          <a href="/improve-meta-event-match-quality">Match quality</a>
          <a href="/meta-capi-for-agencies">Agencies</a>
        </nav>
        <div className="seoHeaderActions">
          <a className="button ghost small" href="/login">Log in</a>
          <a className="button primary small" href="/register">Start free</a>
        </div>
      </div>
    </header>
  );
}

function FlowVisual() {
  return (
    <div className="heroVisual flowVisual" aria-label="GoHighLevel to Meta event flow">
      <div className="visualTop"><span>LIVE EVENT FLOW</span><i>Healthy</i></div>
      <div className="flowTrack">
        <div className="flowNode"><Globe2 /><strong>Meta ad</strong><small>Click context</small></div>
        <ArrowRight />
        <div className="flowNode"><Code2 /><strong>Landing page</strong><small>Capture signals</small></div>
        <ArrowRight />
        <div className="flowNode selected"><Workflow /><strong>GoHighLevel</strong><small>Lead event</small></div>
        <ArrowRight />
        <div className="flowNode"><Server /><strong>Simple CAPI</strong><small>Server delivery</small></div>
      </div>
      <div className="dataChips"><span>fbclid</span><span>_fbc</span><span>_fbp</span><span>event_id</span><span>email</span><span>phone</span></div>
      <div className="visualResult"><CheckCircle2 /><span><strong>Lead received</strong><small>Browser and server context connected</small></span><b>200</b></div>
    </div>
  );
}

function ScannerVisual() {
  const rows = [
    ["Landing URL", true], ["Click identifier", true], ["Browser IDs", true],
    ["Form payload", true], ["CRM record", false], ["Server event", false]
  ];
  return (
    <div className="heroVisual scannerVisual" aria-label="Attribution diagnostic scanner">
      <div className="scannerHead"><span><Radar /> Attribution trace</span><b>6 checkpoints</b></div>
      <div className="scannerBeam" />
      <div className="scannerRows">
        {rows.map(([label, good], index) => <div key={label} className={good ? "good" : "warning"}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><b>{good ? "Captured" : "Review"}</b></div>)}
      </div>
      <div className="scannerFooter"><CircleAlert /><span><strong>Break found</strong><small>CRM record is missing browser attribution fields.</small></span></div>
    </div>
  );
}

function DedupeVisual() {
  return (
    <div className="heroVisual dedupeVisual" aria-label="Browser and server event deduplication">
      <div className="dedupeStream browser"><Globe2 /><span><strong>Browser event</strong><small>Lead · lead_7c91a2</small></span></div>
      <div className="dedupeStream server"><Server /><span><strong>Server event</strong><small>Lead · lead_7c91a2</small></span></div>
      <div className="mergeLines"><i /><i /></div>
      <div className="dedupeResult"><GitMerge /><span><strong>One conversion</strong><small>Matching name + matching event ID</small></span><BadgeCheck /></div>
      <div className="dedupeMeta"><span>Browser</span><b>+</b><span>Server</span><b>=</b><strong>Deduplicated</strong></div>
    </div>
  );
}

function EmqVisual() {
  return (
    <div className="heroVisual emqVisual" aria-label="Event match signal coverage">
      <div className="signalOrbit">
        <span className="signal s1">Email</span><span className="signal s2">Phone</span><span className="signal s3">FBP</span><span className="signal s4">FBC</span><span className="signal s5">Source URL</span><span className="signal s6">Event ID</span>
        <div className="signalCore"><Gauge /><strong>Signal coverage</strong><small>Accurate · normalized · connected</small></div>
      </div>
      <div className="emqFooter"><ShieldCheck /><span>Privacy-aware collection</span><CheckCircle2 /></div>
    </div>
  );
}

function CompareVisual() {
  return (
    <div className="heroVisual compareVisual" aria-label="Focused and broader server-side architectures">
      <div className="architecture focused"><span>FOCUSED</span><strong>Website or CRM</strong><ArrowRight /><b>Simple CAPI</b><ArrowRight /><em>Meta</em></div>
      <div className="architecture broad"><span>BROADER STACK</span><strong>Website</strong><ArrowRight /><b>Server GTM</b><div className="destinations"><em>Meta</em><em>Analytics</em><em>Other tools</em></div></div>
      <div className="compareNote"><Sparkles /><span>Use the smallest architecture that fully solves the requirement.</span></div>
    </div>
  );
}

function AgencyVisual() {
  const clients = [
    ["Northstar Dental", "Lead", "Healthy"],
    ["Atlas Roofing", "Schedule", "Healthy"],
    ["Summit Coaching", "Lead", "Testing"],
    ["Electric Guys", "Lead", "Healthy"]
  ];
  return (
    <div className="heroVisual agencyVisual" aria-label="Fictional agency client dashboard">
      <div className="agencyHead"><span><Users2 /> Client endpoints</span><button type="button" tabIndex={-1}>+ Add client</button></div>
      <div className="agencyGrid">
        {clients.map(([name, event, state], index) => <div className="agencyClient" key={name}><span className="clientMark">{name.charAt(0)}</span><div><strong>{name}</strong><small>{event} event · Dataset connected</small></div><b className={state === "Testing" ? "testing" : ""}>{state}</b><i style={{ width: `${76 + index * 5}%` }} /></div>)}
      </div>
      <div className="agencyFoot"><Activity /><span>Demo workspace · fictional client names</span><b>4 active</b></div>
    </div>
  );
}

function HeroVisual({ theme }) {
  if (theme === "scanner") return <ScannerVisual />;
  if (theme === "dedupe") return <DedupeVisual />;
  if (theme === "emq") return <EmqVisual />;
  if (theme === "compare") return <CompareVisual />;
  if (theme === "agency") return <AgencyVisual />;
  return <FlowVisual />;
}

const problemIcons = [CircleAlert, Link2, Layers3, RefreshCw, Route, Network];

function PageFooter() {
  return (
    <footer className="seoFooter">
      <div className="seoFooterTop">
        <div><Brand compact /><p>Focused Meta Conversions API endpoints for client work.</p></div>
        <div><strong>Resources</strong><a href="/gohighlevel-meta-capi">GoHighLevel Meta CAPI</a><a href="/meta-capi-no-attribution-data">No attribution data</a><a href="/meta-capi-event-deduplication">Event deduplication</a></div>
        <div><strong>Use cases</strong><a href="/improve-meta-event-match-quality">Improve match quality</a><a href="/stape-alternative">Stape alternative</a><a href="/meta-capi-for-agencies">For agencies</a></div>
        <div><strong>Product</strong><a href="/docs">How it works</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </div>
      <div className="seoFooterBottom"><span>© 2026 Simple CAPI.</span><span>Meta is a trademark of Meta Platforms, Inc. Simple CAPI is not affiliated with Meta.</span></div>
    </footer>
  );
}

export default function SeoPage({ path }) {
  const page = pages[path] || pages["/gohighlevel-meta-capi"];
  useSeoMetadata(page, path);

  return (
    <div className={`seoPage theme-${page.theme}`}>
      <SiteHeader />
      <main>
        <section className="seoHero">
          <div className="heroGridGlow" aria-hidden="true" />
          <div className="seoHeroInner">
            <div className="seoHeroCopy">
              <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Simple CAPI</a><span>/</span><strong>{page.eyebrow}</strong></nav>
              <span className="seoEyebrow"><i /><span>{page.eyebrow}</span></span>
              <h1>{page.h1}</h1>
              <p>{page.intro}</p>
              <div className="seoHeroActions"><a className="button primary" href="/register">{page.primary}<ArrowRight /></a><a className="button secondary" href="#how-it-works">{page.secondary}</a></div>
              <div className="seoProof">{page.proof.map((item) => <span key={item}><Check /> {item}</span>)}</div>
            </div>
            <HeroVisual theme={page.theme} />
          </div>
        </section>

        <section className="seoSection problemSection" id="common-causes">
          <div className="sectionIntro"><span className="sectionKicker">Where tracking breaks</span><h2>{page.problemTitle}</h2><p>{page.problemIntro}</p></div>
          <div className="problemGrid">{page.problems.map(([title, text], index) => { const Icon = problemIcons[index % problemIcons.length]; return <article key={title}><span><Icon /></span><h3>{title}</h3><p>{text}</p></article>; })}</div>
        </section>

        <section className="seoSection processSection" id="how-it-works">
          <div className="sectionIntro split"><div><span className="sectionKicker">The controlled path</span><h2>Move from a loose collection of signals to one traceable event.</h2></div><p>Simple CAPI keeps the implementation focused: capture the useful data, connect it to the conversion, send it through a protected endpoint, and validate the result.</p></div>
          <div className="processGrid"><div className="stepList">{page.steps.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div><div className="codePanel"><header><span><Code2 /> {page.codeLabel}</span><i /><i /><i /></header><pre><code>{page.code}</code></pre><footer><LockKeyhole /> Credentials remain outside the installation code.</footer></div></div>
        </section>

        {page.comparison ? (
          <section className="seoSection comparisonSection">
            <div className="sectionIntro"><span className="sectionKicker">Honest comparison</span><h2>Pick the architecture that matches the requirement.</h2><p>Both approaches can be valid. The useful question is which one matches the destinations, control, and maintenance your team actually needs.</p></div>
            <div className="comparisonTable" role="table" aria-label="Simple CAPI and broader server-side platform comparison">
              <div className="comparisonRow head" role="row"><strong role="columnheader">Requirement</strong><strong role="columnheader">Simple CAPI</strong><strong role="columnheader">Broader platform</strong></div>
              {page.comparison.map((row) => <div className="comparisonRow" role="row" key={row[0]}>{row.map((cell, index) => <span role="cell" key={cell}><b>{index === 0 ? cell : ""}</b>{index === 0 ? "" : cell}</span>)}</div>)}
            </div>
          </section>
        ) : null}

        <section className="seoSection featureSection">
          <div className="featureStatement"><span className="sectionKicker">Practical coverage</span><h2>{page.featureTitle}</h2><p>Use accurate values, preserve ownership, and validate the event before relying on campaign reporting.</p></div>
          <div className="featureCloud">{page.features.map((item, index) => <span key={item}><i>{index % 3 === 0 ? <Database /> : index % 3 === 1 ? <Fingerprint /> : <BarChart3 />}</i>{item}<CheckCircle2 /></span>)}</div>
        </section>

        <section className="seoSection privacyCallout">
          <div><ShieldCheck /><span><strong>Built for controlled implementation.</strong><small>Keep client credentials out of page code, collect only permitted data, and preserve a clear boundary between client configurations.</small></span></div>
          <a href="/privacy">Review privacy principles <ArrowRight /></a>
        </section>

        <section className="seoSection faqSection">
          <div className="sectionIntro"><span className="sectionKicker">Frequently asked questions</span><h2>The parts people usually discover after launch.</h2><p>Resolve the implementation details before the campaign starts spending money.</p></div>
          <div className="faqGrid">{page.faq.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><i>+</i></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="seoSection relatedSection">
          <div><span className="sectionKicker">Continue the setup</span><h2>Related Meta CAPI guides.</h2></div>
          <div className="relatedGrid">{page.related.map((href) => <a href={href} key={href}><span><Network /></span><strong>{relatedLabels[href]}</strong><small>Open guide</small><ArrowRight /></a>)}</div>
        </section>

        <section className="finalCta">
          <div className="finalCtaGlow" aria-hidden="true" />
          <div><span className="seoEyebrow light"><i /><span>Simple CAPI workspace</span></span><h2>Build the event once. Hand off one controlled installation.</h2><p>Create a client-specific Lead or Schedule endpoint and validate the exact event Meta receives.</p></div>
          <div><a className="button primary" href="/register">Create your endpoint <ArrowRight /></a><span><BadgeCheck /> First eligible script is free after account verification.</span></div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
}
