# CAPI Launcher

Client-facing app flow:

1. Client enters:
   - business name
   - Meta dataset ID
   - Meta access token
2. The app calls `/.netlify/functions/create-client-capi`.
3. The function creates a separate Netlify site for that client.
4. The function stores the Meta values as Netlify environment variables.
5. The function deploys `meta-capi-lead`.
6. The function also deploys a hosted `tracker.js` file.
7. The app returns the live endpoint and the install tag:

```text
https://client-site.netlify.app/.netlify/functions/meta-capi-lead
```

```html
<script src="https://client-site.netlify.app/tracker.js" data-ghl-webhook-url="PASTE_GHL_INBOUND_WEBHOOK_URL" defer></script>
```

## Required env vars for this app

Set these on the Netlify site that hosts this app:

```text
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_ACCOUNT_SLUG=your_netlify_team_slug
```

Do not expose `NETLIFY_AUTH_TOKEN` in browser code.

For local testing, create `.env` in this folder with the same variables and run:

```text
npx netlify dev
```

Open the Netlify Dev URL, usually:

```text
http://localhost:8888
```

Do not use the plain Vite URL for endpoint creation. Vite serves the React UI only and does not run Netlify functions.

## Important

## Authentication

The app uses Netlify Identity for registration, login, email confirmation, logout, and password recovery.

Before using auth in production:

1. Deploy this app to Netlify.
2. In the Netlify project, go to Project configuration > Identity.
3. Enable Identity.
4. Set registration to Open or Invite only.
5. Keep HTTPS enabled on the production domain.

The provisioning function requires a logged-in Identity user for `POST` requests, so the login screen is not cosmetic.

The generated endpoint is the backend. The generated `tracker.js` is the page-side capture layer.

Use the install tag inside the actual custom form page. If `data-ghl-webhook-url` is set, the tracker posts the captured fields to the GHL inbound webhook as a hidden POST form. If it is not set, the tracker falls back to posting directly to the generated Netlify CAPI endpoint.

The client does not need to see the function code.
