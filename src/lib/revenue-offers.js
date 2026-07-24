function offerCard({ eyebrow, title, price, description, features, href, primary = false }) {
  const article = document.createElement("article");
  if (primary) article.className = "revenueCard featured";
  else article.className = "revenueCard";
  article.innerHTML = `
    ${primary ? '<span class="revenuePopular">Most practical</span>' : ""}
    <span class="revenueEyebrow">${eyebrow}</span>
    <h3>${title}</h3>
    <strong>${price}</strong>
    <p>${description}</p>
    <ul>${features.map((feature) => `<li><span aria-hidden="true">✓</span>${feature}</li>`).join("")}</ul>
    <a class="button ${primary ? "primary" : "secondary"} full" href="${href}">${primary ? "Request setup" : "See details"}<b aria-hidden="true">→</b></a>`;
  return article;
}

function addRevenueOffers() {
  if ((window.location.pathname.replace(/\/+$/, "") || "/") !== "/") return;
  const footer = document.querySelector(".publicFooter");
  if (!footer) return;

  let section = document.querySelector(".revenueOfferBand");
  if (!section) {
    section = document.createElement("section");
    section.className = "revenueOfferBand";
    section.setAttribute("aria-labelledby", "revenue-offer-title");
    section.innerHTML = `
      <header>
        <span class="eyebrow">Self-serve or fully handled</span>
        <h2 id="revenue-offer-title">Use the script yourself, or pay to have the setup done correctly.</h2>
        <p>The first script remains the easy entry point. Professional implementation is available when the tracking problem is worth more than another afternoon of debugging.</p>
      </header>
      <div class="revenueCardGrid"></div>`;

    const grid = section.querySelector(".revenueCardGrid");
    grid.append(
      offerCard({
        eyebrow: "Self-serve",
        title: "Create the script",
        price: "First eligible script free",
        description: "$5 for each additional Lead or Schedule script.",
        features: ["Protected Meta token", "Event-specific installation", "Testing guide"],
        href: "/register"
      }),
      offerCard({
        eyebrow: "Done for you",
        title: "Install and verify it",
        price: "$249 one time",
        description: "Lead and Schedule setup for one GoHighLevel funnel and booking flow.",
        features: ["Event verification", "Meta Test Events", "Event Match Quality review"],
        href: "/meta-capi-setup-service?offer=done_for_you#request",
        primary: true
      }),
      offerCard({
        eyebrow: "Agency rollout",
        title: "Repeat it across clients",
        price: "From $499",
        description: "A structured implementation plan for agencies managing several client accounts.",
        features: ["Multi-client rollout", "Source tracking", "Reusable handoff"],
        href: "/meta-capi-setup-service?offer=agency_rollout#request"
      })
    );
  }

  const anchor = document.querySelector(".beginnerGuideBand") || footer;
  if (section.parentElement !== anchor.parentElement || section.nextElementSibling !== anchor) {
    anchor.insertAdjacentElement("beforebegin", section);
  }
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    addRevenueOffers();
  });
}

schedule();
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
