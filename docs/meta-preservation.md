# Meta preservation boundary

TikTok and Google support is additive.

The following existing Meta files remain the source of truth and are not replaced by the provider workspace:

- `netlify/functions/create-client-capi.mjs`
- `netlify/functions/workspace-api.mjs`
- `netlify/functions/client-gateway.mjs`
- `netlify/functions/script-binding.mjs`
- `src/components/Workspace.jsx`
- `src/lib/capi.js`

Existing Meta endpoints continue to default to Meta without requiring a provider field. Their dataset IDs, access tokens, generated Netlify sites, page/form bindings, billing credits, browser Pixel events and server Conversions API events stay on the original implementation.

TikTok and Google use separate functions, storage and public routes:

- `provider-workspace.mjs`
- `provider-gateway.mjs`
- `/api/providers`
- `/p/:route/tracker.js`
- `/p/:route/events`

The provider contract test checks both boundaries before merge.
