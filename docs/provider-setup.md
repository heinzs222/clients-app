# TikTok and Google provider setup

Meta, TikTok, and Google are managed from the same authenticated Simple CAPI workspace. Each Lead or Schedule setup consumes its own conversion credit and keeps its credentials isolated.

## TikTok

Each TikTok endpoint requires:

- TikTok Pixel Code
- Events API access token
- Optional Test Events code while validating
- The exact live conversion page
- For Lead, one exact form selector

Simple CAPI sends the same event ID to the TikTok Pixel and Events API, includes TTCLID and `_ttp` when available, and hashes first-party identifiers before server delivery.

## Google Ads

Browser enhanced-conversion mode requires:

- Google Ads Conversion ID, for example `AW-123456789`
- Conversion Label
- The exact live conversion page
- For Lead, one exact form selector

Optional Google Ads API server upload additionally requires:

- Google Ads customer ID
- Conversion action resource name
- Google Ads API developer token
- OAuth client ID
- OAuth client secret
- OAuth refresh token
- Optional manager account ID as the login customer ID

The site should have an appropriate consent implementation. The Google tag respects the site's Consent Mode configuration. Simple CAPI does not silently override the site's consent state.

## Backend configuration

The Netlify backend can use the existing `NETLIFY_AUTH_TOKEN` as the provider-encryption key fallback. A dedicated random secret is preferred:

```text
CAPI_PROVIDER_SECRET=<at least 32 random characters>
```

Do not place provider credentials in Vercel environment variables or frontend code. They are entered by the authenticated user and encrypted in the Netlify backend.
