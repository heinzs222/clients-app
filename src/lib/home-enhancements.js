const beginnerGuides = [
  ["What is Meta CAPI?", "/what-is-meta-capi", "The plain-English definition, purpose, Pixel difference, and gateway meaning."],
  ["How does Meta CAPI work?", "/how-does-meta-capi-work", "A plain-English explanation of browser and server tracking."],
  ["How to set up Meta CAPI", "/how-to-set-up-meta-capi", "The full setup in a simple step-by-step checklist."],
  ["How to install Meta CAPI", "/how-to-install-meta-capi", "Where the script goes on a website or GoHighLevel page."],
  ["How to implement Meta CAPI", "/how-to-implement-meta-capi", "Plan the event, keep the data connected, and send it securely."],
  ["How to use Meta CAPI", "/how-to-use-meta-capi", "Use Lead, Schedule, Purchase, and later-stage events correctly."],
  ["How to test Meta CAPI", "/how-to-test-meta-capi", "Run a real conversion and inspect it in Meta Events Manager."],
  ["How to get a Meta CAPI access token", "/how-to-get-meta-capi-access-token", "Generate the token and keep it out of public page code."],
  ["What is TikTok Events API?", "/what-is-tiktok-events-api", "Understand TikTok's server connection and how it works with the Pixel."],
  ["How does TikTok Events API work?", "/how-does-tiktok-events-api-work", "See how a Lead or Schedule conversion reaches TikTok."],
  ["How to set up TikTok Events API", "/how-to-set-up-tiktok-events-api", "Connect the Pixel, access token, event, page, and form."],
  ["What are Google enhanced conversions?", "/what-are-google-ads-enhanced-conversions", "Learn how Google uses customer-provided conversion data."],
  ["How do Google enhanced conversions work?", "/how-do-google-ads-enhanced-conversions-work", "See how the Google tag connects a conversion to the ad click."],
  ["How to set up Google enhanced conversions", "/how-to-set-up-google-ads-enhanced-conversions", "Create the conversion action and install it on the exact page."]
];

function guideCard([title, href, description]) {
  const link = document.createElement("a");
  link.href = href;
  link.innerHTML = `<span aria-hidden="true">↗</span><div><h3>${title}</h3><p>${description}</p></div><b aria-hidden="true">→</b>`;
  return link;
}

function setHomeMetadata() {
  document.title = "Easy Meta CAPI, TikTok and Google Ads Tracking | Simple CAPI";
  const description = "Easy Meta CAPI setup plus TikTok Events API and Google enhanced conversions. Create one protected Lead or Schedule script and install it in minutes.";
  const descriptionMeta = document.head.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    const element = document.head.querySelector(selector);
    if (element) element.content = document.title;
  }
  for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    const element = document.head.querySelector(selector);
    if (element) element.content = description;
  }
}

function simplifyHero(hero) {
  const copy = hero.querySelector(".homeHeroCopy");
  if (!copy) return;

  const eyebrow = copy.querySelector(".eyebrow");
  const title = copy.querySelector("h1");
  const intro = copy.querySelector(":scope > p");
  const actions = copy.querySelector(".heroActions");
  const trust = copy.querySelector(".heroTrust");

  if (eyebrow) eyebrow.innerHTML = "<i></i> Easy Meta CAPI, TikTok and Google Ads tracking";
  if (title) title.textContent = "Track Meta, TikTok, and Google Ads with one simple script.";
  if (intro) intro.textContent = "Choose the platform and conversion, paste the script on the exact form or booking page, and start sending better conversion data in minutes.";

  if (actions) {
    const primary = actions.querySelector(".button.primary");
    if (primary) {
      const signedIn = /create/i.test(primary.textContent || "") && !/first/i.test(primary.textContent || "");
      primary.innerHTML = `${signedIn ? "Create a tracking script" : "Create my free script"}<span aria-hidden="true">→</span>`;
    }
    const secondary = actions.querySelector(".button.secondary");
    if (secondary && secondary.tagName !== "A") {
      const link = document.createElement("a");
      link.className = secondary.className;
      link.href = "/how-does-meta-capi-work";
      link.textContent = "See how Meta CAPI works";
      secondary.replaceWith(link);
    }
  }

  if (trust) {
    trust.innerHTML = [
      "First eligible script is free",
      "25+ client setups tested",
      "Meta setups reached 9.3+ EMQ"
    ].map((item) => `<span><b aria-hidden="true">✓</b>${item}</span>`).join("");
  }

  const logs = hero.querySelectorAll(".pipelineLog p");
  const logLabels = ["Choose Lead or Schedule", "Paste one script", "Test the conversion"];
  logs.forEach((item, index) => {
    if (logLabels[index]) item.innerHTML = `<span>${index + 1}</span> ${logLabels[index]}`;
  });
  const nodeLabels = hero.querySelectorAll(".pipelineNodes > div span");
  ["Choose", "Paste", "Track"].forEach((label, index) => {
    if (nodeLabels[index]) nodeLabels[index].textContent = label;
  });
  const footer = hero.querySelector(".pipelineVisual > footer");
  if (footer) footer.innerHTML = "<i></i> Conversion tracking ready";
}

function addClientBoundaryVisual() {
  if (document.querySelector(".clientBoundaryFigure")) return;
  const intro = document.querySelector(".principleBand > div:first-child");
  if (!intro) return;

  const figure = document.createElement("figure");
  figure.className = "clientBoundaryFigure";

  const image = document.createElement("img");
  image.src = "/client-workspace-boundaries.svg";
  image.alt = "Four separate client setups connected to one protected Simple CAPI workspace.";
  image.width = 760;
  image.height = 520;
  image.loading = "lazy";
  image.decoding = "async";

  figure.appendChild(image);
  intro.appendChild(figure);
}

function addBeginnerHub() {
  if (document.querySelector(".beginnerGuideBand")) return;
  const pageFooter = document.querySelector(".publicFooter");
  if (!pageFooter) return;

  const section = document.createElement("section");
  section.className = "beginnerGuideBand";
  section.setAttribute("aria-labelledby", "meta-capi-beginner-guides");

  const intro = document.createElement("div");
  intro.className = "beginnerGuideIntro";
  intro.innerHTML = `
    <span class="eyebrow">Meta, TikTok and Google guides</span>
    <h2 id="meta-capi-beginner-guides">Start with the exact question you searched.</h2>
    <p>Learn what each conversion system does, how it works, and how to set it up without a wall of technical language.</p>`;

  const grid = document.createElement("div");
  grid.className = "beginnerGuideGrid";
  beginnerGuides.forEach((guide) => grid.appendChild(guideCard(guide)));

  section.append(intro, grid);
  pageFooter.insertAdjacentElement("beforebegin", section);
}

function applyHomeEnhancements() {
  if ((window.location.pathname.replace(/\/+$/, "") || "/") !== "/") return;
  const hero = document.querySelector(".homeHero");
  if (!hero) return;

  if (hero.dataset.simpleCapiEnhanced !== "true") {
    setHomeMetadata();
    simplifyHero(hero);
    hero.dataset.simpleCapiEnhanced = "true";
  }
  addClientBoundaryVisual();
  addBeginnerHub();
}

let scheduled = false;
function scheduleEnhancement() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyHomeEnhancements();
  });
}

scheduleEnhancement();
const observer = new MutationObserver(scheduleEnhancement);
observer.observe(document.documentElement, { childList: true, subtree: true });
