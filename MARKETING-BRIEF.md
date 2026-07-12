# Simple CAPI Marketing Brief

This brief turns Bruno's funnel concepts into claims the product can support. The recovered reference files and images are kept locally in `research/bruno/` and excluded from Git.

## Positioning

**Category:** a simple Meta Conversions API launcher for agencies and media buyers.

**Core promise:** launch an isolated server-side Meta endpoint for each client, install a hosted tracker, and send deduplicated browser and server conversion events without building custom infrastructure.

**Narrative:**

> Meta receives cleaner, more complete conversion signals. That gives its delivery system better data for attribution and optimization. Better measurement gives an agency a stronger basis for campaign decisions and client retention.

Do not turn that chain into a guarantee that every account will get cheaper or more qualified leads.

## Two Landing-Page Angles

### GoHighLevel audience

**Headline:** Stop losing form conversions between GoHighLevel and Meta.

**Support:** Simple CAPI connects supported on-page forms, GHL workflows when needed, and Meta CAPI with one shared event ID. No Zapier or Make scenario is required.

### Universal audience

**Headline:** Meta cannot optimize from conversions it never receives.

**Support:** Add a lightweight tracker to a supported form page. Simple CAPI captures available match data, pairs browser and server events, and sends the server event through an isolated client endpoint.

**CTA:** Connect my first client.

## Product Diagram

Use Bruno's three-part diagram with these labels:

1. **Your landing page** - supported same-document form or platform webhook.
2. **Simple CAPI endpoint** - normalizes, hashes, deduplicates, and forwards the event.
3. **Meta Conversions API** - receives a server event with available match data.

Supporting line: **The browser Pixel and server event use the same event ID.**

Avoid "any builder, any form," "nothing gets blocked," and "past every iframe." A script on an outer page cannot inspect a cross-origin iframe.

## Proof

Use a real Events Manager screenshot with the dataset and customer details redacted. The defensible format is:

> A live client implementation reached 9.3 Event Match Quality with the match data available in that form.

Do not call 9.3 an average until there is a documented sample. Do not publish invented 6.1, 8.3, or 9.3 market benchmarks. Event Match Quality varies by event and available customer data.

## Offer Boundaries

- One purchased endpoint belongs to one client, one Meta dataset, and one conversion type.
- The same endpoint can serve that client's A/B landing pages; URLs, UTMs, and optional page labels distinguish them.
- Lead costs $5 one-time and Schedule costs $5 one-time. A client using both requires two endpoints and pays $10 total.
- A different client or Meta dataset requires a separate endpoint.
- Browser JavaScript is inspectable. Meta credentials remain server-side and isolated.

This keeps pricing tied to the conversion capability while still allowing each purchased conversion across that client's compatible pages.

## Lead Generation Funnel

Bruno's funnel is sound:

1. Ad, referral, or organic content promotes a useful tracking resource.
2. Name and email unlock the resource with clear consent language.
3. The thank-you page offers the Simple CAPI setup.
4. GHL sends the resource and a short nurture sequence.
5. Retargeting and email return interested prospects to the product.

Start with the **5-Minute EMQ Self-Audit** because it is useful, specific, and directly connected to the product. Add the **Agency Tracking SOP** second. Build a CPL leak calculator only after its assumptions can be shown; it must be labeled as an estimate rather than money definitely being "burned."

## Assets Required Before Ads

- A short demo showing endpoint creation, script installation, Test Events, and deduplication.
- A real redacted Events Manager result.
- Two or three approved customer quotes or screenshots.
- A completed checkout and onboarding flow.
- Privacy, consent, refund, and performance-disclaimer language.
- GHL email delivery and nurture automation for the lead magnet.

Word of mouth and existing agency contacts should validate activation and support requirements before increasing ad spend.

## Claims To Remove

- "Every conversion" or "nothing gets blocked."
- "Works inside every iframe."
- "9.0+ or 9.3 guaranteed" without narrowly defined refund terms and eligibility.
- "Cheaper and qualified leads" as a certain outcome.
- Unverified competitor pricing or benchmark scores.
- Fake testimonials, fake counters, or placeholder scarcity.

## Measurement

Track acquisition source, lead-magnet selection, email delivery, checkout start, purchase, endpoint activation, first successful Meta event, verified deduplication, and a voluntarily submitted EMQ result. Those numbers should become the proof used in later campaigns.
