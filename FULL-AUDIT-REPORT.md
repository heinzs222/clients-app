# Simple CAPI Homepage SEO Audit

## Executive Summary

- Audited URL: https://simplecapi.com/
- Audit date: July 12, 2026
- Scope: coming-soon homepage, custom-domain routing, crawl controls, metadata, structured data, responsive rendering, authentication proxy, and security headers.
- Final Lighthouse SEO score: **100/100** with zero failed SEO audits.
- Security headers score: **100/100**.
- Desktop and mobile browser audits pass with no console errors or horizontal overflow.

## Evidence

| Area | Result | Evidence |
| --- | --- | --- |
| Domain | Pass | Apex HTTPS is live, HTTP upgrades to HTTPS, and `www` redirects to the apex domain |
| Lighthouse SEO | Pass | 100/100, canonical URL is `https://simplecapi.com/`, zero failed audits |
| Metadata | Pass | Descriptive title, description, canonical, robots, Open Graph, and Twitter metadata |
| Structured data | Pass | Organization and WebSite JSON-LD target the canonical domain |
| Crawlability | Pass | Valid robots.txt, XML sitemap, llms.txt, and llms-full.txt |
| Security | Pass | HTTPS, HSTS, CSP, frame protection, MIME protection, referrer policy, and permissions policy |
| Rendering | Pass | Coming-soon layout is stable on desktop and mobile with the supplied brand mark |
| Application routes | Pass | Documentation, legal, status, login, registration, and recovery routes return 200 |
| Application services | Pass | Identity and provisioner proxies are live; unauthenticated provisioning is rejected |

## Resolved Findings

1. The Netlify provisioner rejected state-changing requests from the new custom domain with HTTP 403. The backend now explicitly allows `simplecapi.com`.
2. Netlify Identity email callbacks targeted the backend hostname. The backend root now redirects callback fragments to the branded domain.
3. The old Vercel alias served duplicate indexable pages. It now permanently redirects to the canonical domain.
4. Social metadata referenced the previous CAPI Tracker wordmark. It now uses the neutral brand mark and Simple CAPI descriptions.
5. The remote update removed dashboard, billing, GHL mapping, and mobile regression checks. Localhost-only preview support and full smoke coverage were restored without exposing preview access in production.
6. HSTS now covers subdomains, and AI discovery files contain useful launch context instead of a one-line placeholder.

## Remaining External Work

- Configure Lemon Squeezy API, store, and variant credentials before accepting public payments.
- Add `simplecapi.com` to Google Search Console and Bing Webmaster Tools, then submit the sitemap.
- Replace the coming-soon page with the full public product experience when launch content is approved.
- Review field Core Web Vitals and search queries after sufficient production traffic exists.
