# Simple CAPI Launch Action Plan

## Completed

1. Connect `simplecapi.com` to the Vercel production project and verify DNS and HTTPS.
2. Rebrand public metadata, app copy, manifest, schema, and discovery files as Simple CAPI.
3. Restore the full public product homepage with Simple CAPI branding and current product scope.
4. Authorize the custom domain in the Netlify provisioner.
5. Redirect Identity email callbacks and the legacy Vercel alias to the canonical domain.
6. Restore full tracker, dashboard, billing, GHL mapping, auth, and mobile regression coverage.
7. Verify Lighthouse SEO 100/100 and production browser behavior.
8. Add the Lemon Squeezy test API key and test store ID `429432` to the backend.

## Launch Follow-Up

1. In the `simplecapi` test store, rename the store to Simple CAPI and change its currency from TND to USD.
2. Create and publish a one-time `$5 USD` product named Simple CAPI Endpoint Credit, then add its numeric variant ID to `LEMONSQUEEZY_VARIANT_ID`.
3. Run a test-mode $5 checkout and confirm one-order/one-endpoint redemption.
4. Complete merchant approval, copy the product to live mode, and replace the test API key, store ID, and variant ID with live values.
5. Submit `https://simplecapi.com/sitemap.xml` to search engines.
6. Add verified customer proof and demo media when those assets are approved.
