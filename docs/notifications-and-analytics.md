# Registration notifications, branded email, and analytics

## Registration notifications

The `identity-signup` function sends an owner notification after a registration is completed.

Add these environment variables to the Netlify service project:

- `RESEND_API_KEY`
- `CAPI_ADMIN_EMAIL` — the email that receives registration notifications
- `CAPI_FROM_EMAIL` — a verified sender such as `Simple CAPI <accounts@simplecapi.com>`

The signup process is never blocked if the notification provider is unavailable. Failed notifications are written to the function log.

## Remove `@netlify.com` from Identity emails

The sender for confirmation and password-recovery emails is controlled by Netlify Identity, not by the React application.

In Netlify:

1. Open the Simple CAPI service project.
2. Open **Project configuration → Identity → Emails**.
3. Configure a custom SMTP provider.
4. Set the sender to an address on `simplecapi.com`, such as `accounts@simplecapi.com`.
5. Verify SPF and DKIM records with the email provider.

Netlify requires a plan that supports custom SMTP. The application cannot safely store or invent SMTP credentials.

## Website visits and link clicks

Set this Vercel environment variable:

- `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

The application then records:

- page views, including client-side route changes
- link clicks
- link text
- destination domain
- whether the link is outbound

No email addresses, names, access tokens, or form values are sent to Google Analytics by this implementation.

## Script page and form lock

Every new script must be assigned to:

- one exact page URL
- one exact form selector for Lead events

The lock is stored server-side and cannot be edited. The gateway rejects events whose current page does not match the saved page. It also forces the saved form selector into the tracker, ignoring a different selector placed in the HTML tag.

Older endpoints are disabled until they are locked from the Install tab. Replace any previously copied installation tag after applying the lock.
