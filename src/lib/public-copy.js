const exactReplacements = new Map([
  // Homepage
  ["Meta conversion tracking, simplified", "Meta tracking without the complicated setup"],
  ["Launch reliable Meta tracking in minutes.", "Set up Meta conversion tracking without the usual hassle."],
  ["Add the client, choose the conversion, and paste one generated script. Simple CAPI handles everything else.", "Add a client, choose what you want to track, and paste one script. Simple CAPI takes care of the connection to Meta."],
  ["Create an endpoint", "Create a tracking setup"],
  ["Launch your first endpoint", "Create your first tracking setup"],
  ["Unlock the 9.3 guide", "View the setup guide"],
  ["One script to install", "One script to add"],
  ["Credentials stay protected", "Your Meta access details stay private"],
  ["$5 per event-specific script", "$5 for each Lead or Schedule setup"],
  ["Everything you need, without a complicated setup.", "Everything needed to start tracking, without building it from scratch."],
  ["Launch tracking for each client from one focused workspace and move from credentials to a working installation in minutes.", "Manage each client in one place and create a working Meta tracking setup in a few clear steps."],
  ["One-step installation", "One script to install"],
  ["Copy one generated script and paste it into the client page.", "Copy the script, paste it on the client’s page, and the setup is ready."],
  ["Lead and Schedule", "Track leads or bookings"],
  ["Purchase either conversion separately and maximize the matching data available for that event.", "Choose Lead or Schedule depending on what the client needs to track."],
  ["Organized by client", "Keep every client separate"],
  ["Keep every client and dataset clearly separated in your workspace.", "Each client has their own setup, so nothing gets mixed together."],
  ["Protected credentials", "Private Meta access"],
  ["Sensitive credentials never appear in the installation script.", "Your Meta token stays off the website and out of the script."],
  ["Buy an endpoint", "Create a tracking setup"],
  ["Get the complete 9.3 EMQ setup guide.", "Follow the complete setup guide."],
  ["Purchase one $5 Lead or Schedule script to unlock the private Meta configuration, installation, launch, and verification playbook.", "Your Lead or Schedule setup includes a clear guide for connecting Meta, installing the script, and checking that it works."],
  ["Unlock with a script", "Open the setup guide"],
  ["One workspace. Clear client boundaries.", "Manage every client from one clear workspace."],
  ["Go from client credentials to installation code in a few steps.", "Add the client’s Meta details and get the installation script in a few steps."],
  ["Built to maximize Event Match Quality from the customer data available.", "Send the useful customer details Meta needs for better matching."],
  ["Give the installer one script, not a technical workflow.", "Give the person installing it one script, not a complicated process."],
  ["Client credentials stay out of page code.", "Client Meta access details stay private."],

  // Shared SEO page language
  ["Where tracking breaks", "What usually goes wrong"],
  ["The controlled path", "How to fix it"],
  ["Move from a loose collection of signals to one traceable event.", "Keep the ad click and the conversion connected from start to finish."],
  ["Simple CAPI keeps the implementation focused: capture the useful data, connect it to the conversion, send it through a protected endpoint, and validate the result.", "Simple CAPI keeps the important visit details connected, sends the conversion to Meta, and lets you check that it arrived correctly."],
  ["Practical coverage", "What this covers"],
  ["Use accurate values, preserve ownership, and validate the event before relying on campaign reporting.", "Use real customer information, keep each client’s setup separate, and test it before running ads."],
  ["Built for controlled implementation.", "Built for a clean, secure setup."],
  ["Keep client credentials out of page code, collect only permitted data, and preserve a clear boundary between client configurations.", "Keep Meta access details private, only send data you are allowed to use, and keep each client separate."],
  ["The parts people usually discover after launch.", "Common questions to answer before launch."],
  ["Resolve the implementation details before the campaign starts spending money.", "Set it up correctly before the ads start spending."],
  ["Continue the setup", "Related guides"],
  ["Build the event once. Hand off one controlled installation.", "Set it up once. Install it with one script."],
  ["Create a client-specific Lead or Schedule endpoint and validate the exact event Meta receives.", "Create a Lead or Schedule setup for each client and check that Meta receives the right information."],
  ["First eligible script is free after account verification.", "Your first eligible script is free."],
  ["Credentials remain outside the installation code.", "Your Meta access details stay private."],
  ["Example Lead payload", "Example Lead data"],
  ["Connected event checklist", "What a complete event should include"],
  ["Shared event ID example", "Example using the same event ID"],
  ["Normalize, then hash", "Clean the information before securing it"],
  ["Architecture comparison", "Setup comparison"],
  ["Agency event standard", "Standard client checklist"],
  ["Open guide", "Read guide"],

  // GoHighLevel page
  ["Turn GoHighLevel form submissions, bookings, and workflow events into structured server-side Meta conversions without rebuilding a fragile tracking setup for every funnel.", "Send GoHighLevel leads and bookings to Meta without rebuilding the tracking setup for every funnel."],
  ["One generated installation", "One script to install"],
  ["Lead and Schedule events", "Track leads and bookings"],
  ["GoHighLevel captures the lead. Meta still needs the right signals.", "GoHighLevel captures the lead, but Meta still needs the visit details."],
  ["The CRM event is only the final step. Useful attribution starts on the landing page and must survive every handoff after it.", "Meta needs information from the original ad click and landing-page visit. That information must stay connected until the lead is sent."],
  ["Attribution disappears", "The ad click gets lost"],
  ["Redirects, embedded forms, and disconnected workflows can separate the conversion from the original Meta click.", "Redirects and separate forms can lose the connection between the lead and the Meta ad that brought them in."],
  ["Events arrive incomplete", "Meta receives incomplete information"],
  ["A server event may be delivered while still missing useful browser, identity, or source information.", "The event can reach Meta but still be missing customer, browser, or landing-page details."],
  ["Every client becomes a custom build", "Every client needs another manual setup"],
  ["Copying scripts, webhook mappings, and payload logic across accounts creates avoidable errors.", "Copying scripts and webhook settings between accounts makes mistakes more likely."],
  ["Capture the visit", "Save the visit details"],
  ["Preserve campaign parameters, click identifiers, and browser context before the form is submitted.", "Save the Meta click, campaign, and browser details before the visitor submits the form."],
  ["Connect the lead", "Keep the lead connected"],
  ["Pass the submitted contact and event data into a controlled Simple CAPI endpoint.", "Send the lead and its visit details to the client’s Simple CAPI setup."],
  ["Send the conversion", "Send it to Meta"],
  ["Deliver a structured server event using the client’s own Meta dataset credentials.", "Send the conversion using the client’s own Meta Dataset ID and access token."],
  ["Validate the result", "Check the result"],
  ["Inspect matching, diagnostics, and deduplication inside Meta Events Manager.", "Open Meta Events Manager and confirm the event arrived with the expected details."],
  ["Built around the conversion moments agencies actually track.", "Track the actions that matter to your clients."],

  // No attribution page
  ["Fix “No Attribution Data” at the source.", "Fix Meta’s “No Attribution Data” warning."],
  ["A conversion can reach Meta and still provide weak attribution. Trace what disappeared between the ad click, landing page, form submission, CRM, and server event.", "A conversion can reach Meta without being connected to the right ad. Find where the click or visit details were lost."],
  ["Build a complete event", "Send complete conversion data"],
  ["Trace every handoff", "Check every step"],
  ["Keep source context", "Keep the original visit details"],
  ["Validate the final payload", "Check what Meta received"],
  ["Delivered does not always mean attributable.", "Reaching Meta does not mean Meta can connect it to the ad."],
  ["A successful API response confirms delivery. It does not prove that Meta received enough context to connect the event to the original ad interaction.", "A successful response only means the event arrived. Meta still needs enough information to connect it to the original ad click."],
  ["The click identifier was never stored", "The Meta click ID was never saved"],
  ["The visitor arrived from an ad, but the click information vanished before the form or CRM record was created.", "The visitor came from a Meta ad, but the click details were lost before the lead was saved."],
  ["A redirect removed the query parameters", "A redirect removed the ad details"],
  ["The first landing URL contained attribution data, but a route change failed to preserve it.", "The first page had the Meta click details, but the next page did not keep them."],
  ["Browser identifiers were not passed", "Browser details were not passed"],
  ["The server event was disconnected from useful browser-side context.", "The conversion was sent without the browser information from the visitor’s session."],
  ["The event source was incomplete", "The page source was missing"],
  ["The payload did not clearly identify where the conversion happened.", "Meta was not told which page the conversion happened on."],
  ["The workflow started too late", "The workflow only saw the final lead"],
  ["The CRM knew a lead converted but had no access to the lead’s original website visit.", "The CRM received the lead but did not have the original ad and page details."],
  ["Inspect the original landing URL", "Check the first landing-page URL"],
  ["Store attribution early", "Save the ad details early"],
  ["Persist useful browser and campaign values before the visitor submits anything.", "Save the click, campaign, and browser details before the form is submitted."],
  ["Carry the values through the CRM", "Keep the details with the lead"],
  ["Map the fields through the form, contact record, webhook, and workflow.", "Pass the saved values through the form, CRM, webhook, and workflow."],
  ["Inspect the final server payload", "Check the final data sent to Meta"],
  ["Verify the exact event sent to Meta, not merely the source form data.", "Check what was actually sent to Meta, not only what the form collected."],
  ["Check these values before blaming Meta.", "Check these details first."],

  // Deduplication page
  ["Create deduplicated events", "Prevent duplicate conversions"],
  ["See how matching works", "See how it works"],
  ["Shared event ID", "Same event ID"],
  ["Matching event name", "Same event name"],
  ["Retry-safe delivery", "Safe retries"],
  ["Deduplication fails when the events cannot recognize each other.", "Duplicate conversions happen when the browser and server events do not match."],
  ["Browser and server events are separate requests. They become one conversion only when the identifying details match.", "The browser and server each send an event. Meta counts them as one conversion only when they use the same event name and event ID."],
  ["Different event IDs", "The event IDs are different"],
  ["The Pixel and server create unrelated identifiers for the same conversion.", "The Pixel and server use different IDs for the same lead or purchase."],
  ["Different event names", "The event names are different"],
  ["A browser Lead and a server CompleteRegistration do not describe the same event.", "For example, a browser Lead and a server CompleteRegistration will not be treated as the same conversion."],
  ["The server generates a new ID", "The server creates another ID"],
  ["The form’s event ID never reaches the webhook or server function.", "The ID created on the page is not passed to the webhook or server."],
  ["Retries create new conversions", "A retry looks like a new conversion"],
  ["A failed request is retried with a fresh event ID instead of reusing the original.", "The retry uses a new ID instead of reusing the ID from the original conversion."],
  ["Generate one event ID", "Create one event ID"],
  ["Create it at the conversion source before either browser or server delivery begins.", "Create the ID when the conversion happens, before sending anything."],
  ["Carry it into the server request", "Pass the same ID to the server"],
  ["Include the same value in the form, webhook, or backend payload.", "Include the same ID in the form, webhook, or backend request."],
  ["Reuse it for safe retries", "Reuse the ID when retrying"],
  ["A retry should represent the same conversion, not invent a new one.", "A retry is still the same conversion, so it must keep the same ID."],
  ["Keep both delivery paths tied to the same conversion identity.", "Keep the Pixel and server event tied to the same conversion."],

  // Event Match Quality page
  ["Give Meta stronger match signals, not more noise.", "Help Meta match more of your conversions."],
  ["Build server events with useful, properly formatted customer and browser information so Meta has a better chance of connecting conversions to accounts and ad interactions.", "Send clean customer and browser details so Meta has a better chance of connecting each conversion to the right person and ad."],
  ["Improve my event payload", "Improve my tracking data"],
  ["Inspect the signals", "See what to send"],
  ["Normalize identity data", "Clean customer information"],
  ["Preserve browser context", "Keep browser details"],
  ["Send complete event details", "Send complete conversion details"],
  ["Event Match Quality starts before the API request.", "Good Event Match Quality starts with clean information."],
  ["A perfect-looking JSON object cannot recover data that was never captured, was formatted incorrectly, or was separated from the original visit.", "The final request cannot fix information that was never saved, was entered in the wrong format, or was separated from the original visit."],
  ["Identity data is inconsistent", "Customer information is inconsistent"],
  ["Spaces, casing, local phone formats, and placeholder values weaken otherwise useful fields.", "Extra spaces, capital letters, local phone formats, and fake values make customer details harder to match."],
  ["Browser context is missing", "Browser details are missing"],
  ["The server event cannot benefit from identifiers that were discarded on the page.", "The server cannot send browser details that the page never saved."],
  ["The event source is vague", "The conversion page is unclear"],
  ["Meta receives the conversion but little context about where it happened.", "Meta receives the conversion without clearly knowing which page it came from."],
  ["More fields create more noise", "More fields are not always better"],
  ["Inaccurate or fabricated values do not become useful merely because the payload is larger.", "Wrong or made-up information does not help just because more fields were sent."],
  ["Capture accurate source data", "Save accurate information"],
  ["Collect only the values you are permitted to process and can keep connected to the event.", "Only collect information you are allowed to use and can keep connected to the conversion."],
  ["Normalize before hashing", "Clean the information before securing it"],
  ["Trim and format identity fields consistently, then hash the required values.", "Remove extra spaces and format customer details correctly before hashing the fields Meta requires."],
  ["Preserve browser identifiers", "Keep browser details"],
  ["Carry available FBP, FBC, user agent, source URL, and click context into the server event.", "Keep the available FBP, FBC, browser, page, and Meta click details with the conversion."],
  ["Monitor diagnostics", "Check Meta’s warnings"],
  ["Review changes over time rather than treating one score as a permanent result.", "Check the score and warnings regularly because they can change as new events arrive."],
  ["Useful signal coverage.", "Useful information to send."],

  // Stape comparison page
  ["A simpler Meta CAPI path when you do not need an entire server-side GTM stack.", "A simpler option when you only need Meta CAPI."],
  ["Simple CAPI focuses on direct Meta conversion endpoints. Broader platforms support server-side tagging across many destinations. Choose the architecture that matches the destinations, control, and maintenance your team actually needs.", "Simple CAPI focuses on sending conversions to Meta. Broader tools such as server-side GTM can send data to several platforms. Choose the option that matches what you actually need."],
  ["Try the focused approach", "Try Simple CAPI"],
  ["Compare the workflows", "Compare the options"],
  ["Meta-focused", "Built for Meta"],
  ["No server GTM required", "No server GTM setup"],
  ["One-time event scripts", "One-time payment per script"],
  ["Different tools for different tracking architectures.", "Simple CAPI and broader server tools solve different needs."],
  ["Simple CAPI is intentionally narrow. A broader server-side platform is more configurable, but that extra surface area only helps when your implementation needs it.", "Simple CAPI keeps Meta tracking focused and simple. A broader platform gives you more control, but it also takes more work to set up and maintain."],
  ["A focused workflow", "Simple CAPI setup"],
  ["Website or CRM → Simple CAPI → Meta. Best when Meta conversion delivery is the main requirement.", "Your website or CRM sends the conversion to Simple CAPI, which sends it to Meta."],
  ["A broader stack", "Broader server setup"],
  ["Website → web container → server container → several analytics and advertising destinations.", "The website sends data through web and server containers to Meta, analytics tools, and other platforms."],
  ["Different maintenance burden", "Different amount of maintenance"],
  ["A direct endpoint is easier to hand off; a server tagging environment offers more control and requires more ongoing expertise.", "Simple CAPI is easier to install and hand over. A server tagging setup gives more control but needs more technical maintenance."],
  ["List the destinations", "List the platforms you need"],
  ["Decide whether Meta is the only server-side destination or one part of a larger analytics architecture.", "Decide whether you only need Meta or also need Google Analytics and other advertising platforms."],
  ["Map the events", "List the conversions"],
  ["Identify the conversions, source systems, and data requirements you actually need.", "List what you need to track, where the data comes from, and which details each platform needs."],
  ["Choose the smallest complete system", "Choose the simplest tool that covers the job"],
  ["Avoid both underbuilding and paying for architecture that your team will never use.", "Do not choose a limited tool, but do not pay for a complex system your team will never use."],
  ["Validate ownership and maintenance", "Decide who will manage it"],
  ["Know who controls credentials, monitors diagnostics, and updates the implementation.", "Decide who controls access, checks errors, and keeps the setup working."],
  ["Simple CAPI may fit when:", "Simple CAPI may be the better fit when:"],
  ["You need reusable client endpoints", "You need a separate setup for each client"],
  ["You want a smaller setup surface", "You want a simpler setup"],
  ["Your team wants direct payload control", "Your team wants to control the data sent to Meta"],

  // Agencies page
  ["Create a repeatable server-side conversion workflow for landing pages, CRMs, forms, and booking systems across your client portfolio.", "Use the same clear Meta tracking process across client landing pages, CRMs, forms, and booking systems."],
  ["Separate client endpoints", "A separate setup for each client"],
  ["Repeatable payload standard", "The same data checklist every time"],
  ["Simple installer handoff", "One script to hand over"],
  ["The implementation should scale better than the client list.", "Your tracking process should stay simple as you add clients."],
  ["An agency setup becomes expensive when every launch depends on one person remembering a slightly different collection of scripts and webhook fields.", "Agency tracking becomes slow and error-prone when every client has a different script, webhook, and setup process."],
  ["Repeated setup work", "The same work is repeated for every client"],
  ["Each account requires another round of scripts, webhooks, field mapping, and testing.", "Every new client needs scripts, webhook settings, field connections, and testing again."],
  ["Inconsistent payloads", "Different data is sent for each client"],
  ["Different developers and funnel builders send different versions of the same conversion event.", "Different people may send different information for the same type of lead or booking."],
  ["Credentials spread across tools", "Meta access details are scattered"],
  ["Dataset IDs, tokens, and endpoint details become difficult to audit and maintain.", "Dataset IDs, tokens, and setup details become hard to find and manage."],
  ["Reactive troubleshooting", "Problems are found too late"],
  ["Tracking problems are often discovered after campaign reporting already looks wrong.", "Tracking problems are often noticed only after the campaign reports incorrect results."],
  ["Messy client handoff", "The setup is hard to hand over"],
  ["The installer receives a technical workflow instead of one controlled script.", "The installer receives a complicated process instead of one clear script."],
  ["No shared checklist", "There is no standard checklist"],
  ["Launch quality depends on memory rather than a repeatable standard.", "A successful launch depends on what someone remembers instead of a process everyone follows."],
  ["Create the client endpoint", "Create the client setup"],
  ["Keep the client name, dataset, event, and generated installation clearly separated.", "Keep the client name, Meta dataset, conversion type, and script together in one place."],
  ["Connect client-owned credentials", "Add the client’s Meta access details"],
  ["Use the dataset and token approved for that client’s Meta account.", "Use the Dataset ID and token approved for that client."],
  ["Install the generated script", "Install the script"],
  ["Add the controlled implementation to the landing page, form, or custom workflow.", "Add the script to the landing page, form, or workflow used by the client."],
  ["Send a test conversion", "Send a test lead or booking"],
  ["Check browser context, identity fields, source details, and event ID before launch.", "Check the browser, customer, page, and event ID details before launching ads."],
  ["Document the final setup", "Save the final setup details"],
  ["Record the event source, owner, validation result, and any client-specific field mapping.", "Record where the conversion comes from, who owns the setup, the test result, and any custom fields."],
  ["Designed for the systems agencies inherit.", "Works with the tools agencies already use."],

  // Blog index
  ["Practical Meta CAPI guides without the usual tracking fog.", "Clear Meta CAPI guides without the confusing language."],
  ["Clear implementation guides for attribution, event matching, deduplication, GoHighLevel, agencies, and focused server-side tracking.", "Straightforward guides for GoHighLevel, missing attribution, duplicate events, Event Match Quality, agencies, and Meta server tracking."],
  ["Start with the problem you are trying to fix.", "Choose the tracking problem you need to solve."],
  ["Each guide focuses on one exact tracking problem, explains where it breaks, and shows the controlled implementation path.", "Each guide explains one problem, why it happens, and the steps to fix it."],
  ["Connect forms, bookings, and workflow events to structured server-side Meta conversions.", "Send GoHighLevel forms and bookings to Meta with the right tracking details."],
  ["Trace missing click IDs, browser identifiers, source URLs, and campaign context.", "Find where the Meta click, browser, page, or campaign details were lost."],
  ["Connect browser and server events with one matching event name and event ID.", "Prevent duplicates by using the same event name and event ID in the browser and server."],
  ["Send accurate identity, browser, click, and event context without adding useless noise.", "Send clean customer, browser, click, and conversion details to Meta."],
  ["Compare direct Meta event delivery with a broader server-side GTM architecture.", "Compare Simple CAPI with a larger server-side GTM setup."],
  ["Standardize client endpoints, payloads, testing, credentials, and implementation handoffs.", "Use the same client setup, data checklist, testing process, and handoff every time."],
  ["Turn the guide into a working client endpoint.", "Turn the guide into a working client setup."],
  ["Create a protected Lead or Schedule setup and keep client credentials outside the page code.", "Create a Lead or Schedule setup while keeping the client’s Meta access details private."],
  ["Focused Meta Conversions API endpoints and implementation guides.", "Simple Meta Conversions API setups and clear guides."],

  // Docs page
  ["Event-specific pricing", "Simple one-time pricing"],
  ["Each $5 one-time purchase unlocks one client-specific Lead or Schedule setup. Lead and Schedule are separate purchases, so both events cost $10 total.", "Each $5 payment creates one Lead or Schedule setup for one client. Using both costs $10 total."],
  ["Private delivery", "Everything stays in your account"],
  ["The purchased setup, installation code, configuration controls, and verification guidance are delivered inside the account workspace.", "Your script, settings, and setup instructions are available inside your account."],
  ["Sensitive client credentials stay protected and do not appear in the installation code provided to the customer.", "The client’s Meta token stays private and never appears in the script installed on the website."],
  ["Guided launch", "Clear setup instructions"],
  ["After purchase, the workspace provides the exact event-specific instructions needed to install, validate, and manage the setup.", "After purchase, the workspace shows the steps to install the script, test it, and manage the client setup."],
  ["Simple, private event setup.", "Simple Meta tracking for each client."],
  ["What Simple CAPI provides before you choose a Lead or Schedule event.", "How Simple CAPI works before you create a Lead or Schedule setup."]
]);

const phraseReplacements = [
  ["client-specific endpoints", "separate client tracking setups"],
  ["client-specific endpoint", "client tracking setup"],
  ["client endpoints", "client tracking setups"],
  ["client endpoint", "client tracking setup"],
  ["endpoints", "tracking setups"],
  ["endpoint", "tracking setup"],
  ["event-specific scripts", "Lead or Schedule scripts"],
  ["event-specific script", "Lead or Schedule script"],
  ["installation code", "website script"],
  ["server-side conversion", "conversion sent directly to Meta"],
  ["server-side tracking", "server tracking"],
  ["server event", "event sent from the server"],
  ["event payloads", "event data"],
  ["event payload", "event data"],
  ["payloads", "event data"],
  ["payload", "event data"],
  ["browser context", "browser details"],
  ["browser-side context", "browser details"],
  ["browser identifiers", "browser IDs"],
  ["identity fields", "customer details"],
  ["identity data", "customer information"],
  ["source context", "original visit details"],
  ["source data", "original information"],
  ["credentials", "access details"],
  ["diagnostics", "warnings and test results"],
  ["implementation", "setup"],
  ["handoff", "handover"],
  ["conversion identity", "conversion"],
  ["conversion source", "place where the conversion happens"]
];

const metadataByPath = {
  "/": {
    title: "Simple CAPI | Easy Meta Conversion Tracking",
    description: "Create Meta CAPI tracking for leads and bookings with one script. Keep each client separate and their Meta access details private."
  },
  "/blogs": {
    title: "Clear Meta CAPI Guides | Simple CAPI",
    description: "Straightforward Meta CAPI guides for GoHighLevel, missing attribution, duplicate events, Event Match Quality, agencies, and server tracking."
  },
  "/gohighlevel-meta-capi": {
    title: "GoHighLevel Meta CAPI Integration | Simple CAPI",
    description: "Send GoHighLevel leads and bookings to Meta while keeping the original ad and landing-page details connected."
  },
  "/meta-capi-no-attribution-data": {
    title: "Fix Meta CAPI No Attribution Data | Simple CAPI",
    description: "Find where Meta click, browser, or page details were lost and fix the No Attribution Data warning."
  },
  "/meta-capi-event-deduplication": {
    title: "Meta CAPI Event Deduplication Guide | Simple CAPI",
    description: "Prevent duplicate Meta conversions by using the same event name and event ID for browser and server events."
  },
  "/improve-meta-event-match-quality": {
    title: "Improve Meta Event Match Quality | Simple CAPI",
    description: "Improve Meta Event Match Quality by sending clean customer, browser, click, and conversion details."
  },
  "/stape-alternative": {
    title: "A Simple Stape Alternative for Meta CAPI | Simple CAPI",
    description: "Compare Simple CAPI with broader server-side GTM tools when you only need to send conversions to Meta."
  },
  "/meta-capi-for-agencies": {
    title: "Meta CAPI for Agencies and Clients | Simple CAPI",
    description: "Use one clear Meta CAPI process across clients, with separate setups, consistent data, testing, and simple handovers."
  }
};

function isPublicRoot(element) {
  return element?.matches?.(".seoPage, .blogIndexPage, .publicPage");
}

function shouldSkip(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest("code, pre, script, style, textarea, .legalPage, .guidePage")) return true;
  return !parent.closest(".seoPage, .blogIndexPage, .publicPage");
}

function simplifyValue(value) {
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const core = value.trim();
  if (!core) return value;

  let next = exactReplacements.get(core) || core;
  for (const [from, to] of phraseReplacements) {
    if (next.includes(from)) next = next.split(from).join(to);
  }

  return next === core ? value : `${leading}${next}${trailing}`;
}

function simplifyRoot(root) {
  if (!root || !isPublicRoot(root)) return;
  if (root.querySelector?.(".legalPage, .guidePage")) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  for (const textNode of nodes) {
    if (shouldSkip(textNode)) continue;
    const next = simplifyValue(textNode.nodeValue || "");
    if (next !== textNode.nodeValue) textNode.nodeValue = next;
  }
}

function setMeta(selector, content) {
  const element = document.head.querySelector(selector);
  if (element && element.getAttribute("content") !== content) {
    element.setAttribute("content", content);
  }
}

function updateMetadata() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const metadata = metadataByPath[path];
  if (!metadata) return;

  if (document.title !== metadata.title) document.title = metadata.title;
  setMeta('meta[name="description"]', metadata.description);
  setMeta('meta[property="og:title"]', metadata.title);
  setMeta('meta[property="og:description"]', metadata.description);
  setMeta('meta[name="twitter:title"]', metadata.title);
  setMeta('meta[name="twitter:description"]', metadata.description);
}

function applyPublicCopy() {
  document.querySelectorAll(".seoPage, .blogIndexPage, .publicPage").forEach(simplifyRoot);
  updateMetadata();
}

let installed = false;

export function installPublicCopy() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyPublicCopy();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
}
