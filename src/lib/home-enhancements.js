const beginnerGuides = [
  ["How does Meta CAPI work?", "/how-does-meta-capi-work", "A plain-English explanation of browser and server tracking."],
  ["How to set up Meta CAPI", "/how-to-set-up-meta-capi", "The full setup in a simple step-by-step checklist."],
  ["How to install Meta CAPI", "/how-to-install-meta-capi", "Where the script goes on a website or GoHighLevel page."],
  ["How to implement Meta CAPI", "/how-to-implement-meta-capi", "Plan the event, keep the data connected, and send it securely."],
  ["How to use Meta CAPI", "/how-to-use-meta-capi", "Use Lead, Schedule, Purchase, and later-stage events correctly."],
  ["How to test Meta CAPI", "/how-to-test-meta-capi", "Run a real conversion and inspect it in Meta Events Manager."],
  ["How to get a Meta CAPI access token", "/how-to-get-meta-capi-access-token", "Generate the token and keep it out of public page code."]
];

function guideCard([title, href, description]) {
  const link = document.createElement("a");
  link.href = href;
  link.innerHTML = `<span aria-hidden="true">↗</span><div><h3>${title}</h3><p>${description}</p></div><b aria-hidden="true">→</b>`;
  return link;
}

function setHomeMetadata() {
  document.title = "How to Set Up Meta CAPI for GoHighLevel | Simple CAPI";
  const description = "Learn how Meta CAPI works and set it up for GoHighLevel forms or bookings. Create one protected script, install it on the intended page, and test the event in Meta.";
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

  if (eyebrow) eyebrow.innerHTML = "<i></i> Meta CAPI without the technical headache";
  if (title) title.textContent = "Send better lead data to Meta with one simple script.";
  if (intro) intro.textContent = "Choose what you want to track, paste the script on your form or booking page, and Simple CAPI sends the conversion securely. No complicated server build.";

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
      "Works with forms and bookings",
      "Your Meta token stays private"
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
  if (footer) footer.innerHTML = "<i></i> Meta event ready";
}

function addBeginnerHub(hero) {
  if (document.querySelector(".beginnerGuideBand")) return;
  const section = document.createElement("section");
  section.className = "beginnerGuideBand";
  section.setAttribute("aria-labelledby", "meta-capi-beginner-guides");

  const intro = document.createElement("div");
  intro.className = "beginnerGuideIntro";
  intro.innerHTML = `
    <span class="eyebrow">New to Meta CAPI?</span>
    <h2 id="meta-capi-beginner-guides">Start with the exact question you searched.</h2>
    <p>These guides explain Meta CAPI in normal language, from the first setup to testing it with GoHighLevel forms and bookings.</p>`;

  const grid = document.createElement("div");
  grid.className = "beginnerGuideGrid";
  beginnerGuides.forEach((guide) => grid.appendChild(guideCard(guide)));

  section.append(intro, grid);
  hero.insertAdjacentElement("afterend", section);
}

function applyHomeEnhancements() {
  if ((window.location.pathname.replace(/\/+$/, "") || "/") !== "/") return false;
  const hero = document.querySelector(".homeHero");
  if (!hero) return false;
  setHomeMetadata();
  simplifyHero(hero);
  addBeginnerHub(hero);
  return true;
}

if (!applyHomeEnhancements()) {
  const observer = new MutationObserver(() => {
    if (applyHomeEnhancements()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
