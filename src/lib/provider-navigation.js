function addProviderNavigation() {
  const sideNav = document.querySelector(".sideNavLinks");
  if (sideNav && !sideNav.querySelector("[data-provider-workspace-link]")) {
    const link = document.createElement("a");
    link.href = "/platforms";
    link.dataset.providerWorkspaceLink = "true";
    link.className = "providerWorkspaceNavLink";
    link.innerHTML = '<span aria-hidden="true">↗</span> TikTok & Google';
    sideNav.appendChild(link);
  }

  const homeActions = document.querySelector(".homeHeroActions, .heroActions");
  if (homeActions && !homeActions.querySelector("[data-provider-home-link]")) {
    const link = document.createElement("a");
    link.href = "/platforms";
    link.dataset.providerHomeLink = "true";
    link.className = "button secondary";
    link.textContent = "TikTok & Google tracking";
    homeActions.appendChild(link);
  }
}

let scheduled = false;
function scheduleProviderNavigation() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    addProviderNavigation();
  });
}

scheduleProviderNavigation();
new MutationObserver(scheduleProviderNavigation).observe(document.documentElement, { childList: true, subtree: true });
