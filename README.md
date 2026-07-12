# Simple CAPI

Simple CAPI is an authenticated React application that provisions one isolated Netlify Meta Conversions API endpoint per client.

## What it creates

For every client, the app:

1. Creates a separate Netlify site owned by the signed-in Simple CAPI user.
2. Stores `META_DATASET_ID`, `META_ACCESS_TOKEN`, and `META_GRAPH_API_VERSION` in that site's environment.
3. Deploys `/.netlify/functions/meta-capi-lead`.
4. Deploys a stable `/tracker.js` loader and a content-hashed, minified tracker core for same-document HTML forms.
5. Returns the endpoint URL, tracker tag, and GHL Custom Webhook JSON mapping.

One endpoint belongs to one client, one Meta dataset, and one purchased conversion type. Lead costs `$5 USD` and Schedule costs `$5 USD`; enabling both requires two endpoints and costs `$10 USD`. Each endpoint can be reused across compatible pages for that same client and dataset.

The Meta access token is never embedded in the tracker, saved to browser storage, logged by application code, or returned by the provisioning API.

The browser tracker is intentionally minified and split for smaller delivery and reliable caching. Like all browser JavaScript, it remains inspectable by a determined visitor; security comes from keeping credentials and Meta requests in the server-side function.

## App host environment

Set these variables on the Netlify project hosting the authenticated Simple CAPI backend:

```text
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_ACCOUNT_SLUG=your_netlify_team_slug
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_numeric_store_id
LEMONSQUEEZY_VARIANT_ID=your_numeric_one_time_product_variant_id
```

Optional safeguards:

```text
CAPI_ALLOWED_EMAILS=owner@example.com,operator@example.com
CAPI_MAX_ENDPOINTS_PER_USER=25
CAPI_REQUIRE_PAYMENT=true
CAPI_ENDPOINT_PRICE_CENTS=500
CAPI_BILLING_EXEMPT_EMAILS=owner@example.com
LEMONSQUEEZY_TEST_MODE=true
```

`CAPI_ALLOWED_EMAILS` limits endpoint management to an explicit comma-separated allowlist. Without it, any confirmed Identity user can use the provisioner, subject to the per-user endpoint limit.

Leave `CAPI_BILLING_EXEMPT_EMAILS` empty when every production endpoint must consume a paid credit. Local Netlify development requests bypass payment so the checkout flow can be developed without creating test orders; the workspace labels this state as development access.

## Lemon Squeezy billing

Each Lead or Schedule endpoint costs `$5 USD`. The conversion type is stored with the endpoint and enforced by the server, so changing browser code cannot switch a paid Lead endpoint into Schedule or vice versa.

1. Create a Lemon Squeezy store, complete identity verification, and connect a supported payout account.
2. Set the store currency to USD before creating products.
3. Create and publish a one-time software product with a `$5 USD` variant.
4. Create an API key and add it with the numeric store and variant IDs to the backend environment.
5. Keep `CAPI_REQUIRE_PAYMENT=true`, `CAPI_ENDPOINT_PRICE_CENTS=500`, and `LEMONSQUEEZY_TEST_MODE=true` while testing.
6. Keep `CAPI_BILLING_EXEMPT_EMAILS` empty unless a deliberate internal billing bypass is required.
7. Complete a test checkout, then replace the test key and IDs and set `LEMONSQUEEZY_TEST_MODE=false` after the live store and product are approved.

The app creates Lemon Squeezy-hosted one-time checkouts. Before provisioning, it retrieves the order server-side and verifies the authenticated email, store, variant, amount, currency, test/live mode, payment status, and refund state. Redemption is tied to a deterministic endpoint name and recorded in the generated endpoint manifest so one order cannot create multiple endpoints.

## Authentication setup

The app uses Netlify Identity for registration, email confirmation, login, logout, invitations, and password recovery.

After deploying the app:

1. Open the Simple CAPI backend project in Netlify.
2. Go to **Project configuration > Access & security > Visitor access > Identity**.
3. Enable Identity.
4. Use **Invite only** registration for a private agency workspace, or configure `CAPI_ALLOWED_EMAILS` before allowing open registration.
5. Keep HTTPS enabled on the production domain.

The management function uses Netlify's modern function runtime so authenticated sessions are checked server-side. State-changing requests also require a same-origin browser request.

## Local development

The deployed Vercel frontend currently shows a link-free coming-soon screen and redirects product, documentation, and authentication routes to `/`. The full product remains available only on localhost while private development continues. The Netlify management API still enforces authentication, origin checks, and the configured email allowlist.

Create `.env` from `.env.example`, then run:

```text
npm install
npm run dev:local
```

Open:

```text
http://localhost:8888
```

For the native Netlify runtime, use:

```text
npm run dev:netlify
```
## Client installation

After creating an endpoint:

1. Purchase one conversion credit.
2. Choose Lead or Schedule while creating the endpoint.
3. Open the endpoint's **Install** tab.
4. Select the correct country and currency.
5. Optionally add a Landing page label such as `Control` or `Variant B` for A/B reporting.
6. Paste the generated script into the actual page containing the form or the successful booking confirmation page, as instructed.
7. Submit one real test and confirm the conversion in Meta Test Events.

For Meta Test Events, paste the temporary `TEST...` value into **Meta test event code** before copying the tracker tag. Submit the real form while Test Events is open, then clear the code and replace the temporary tag so production events are no longer marked as tests.

## Tracker limits

The tracker handles standard and dynamically inserted same-document forms, plus programmatic `form.submit()` calls. It cannot inspect a form inside a cross-origin iframe. For an iframe form, install the tracker inside the iframe document or map the form platform's own webhook into the generated endpoint.

For appointment conversions, purchase a Schedule endpoint. Its generated tag must be installed only on the page reached after a successful booking. Schedule and Lead are separate paid endpoints.

The tracker improves match-data coverage and browser/server deduplication. It cannot guarantee a specific Meta Event Match Quality score or attribution outcome.

## Commands

```text
npm run build
npm run check
npm run test:generated
npm run test:smoke
npm run dev:local
npm run dev:netlify
```
