# VANTHARI

VANTHARI's multilingual public website. The current release is a static site with English, French, German, and Spanish copy. Visitors can change language without leaving or reloading the page, and their choice is remembered in the browser.

## Files

- `index.html` — complete website, styles, animations, and translations
- `customer-service/index.html` — multilingual customer-service form and English translation display
- `functions/api/customer-service.js` — translation and email endpoint used by the Cloudflare Worker
- `worker.js` — Worker entry point that routes customer-service API requests and serves the site
- `wrangler.jsonc` — Cloudflare Worker, static assets, and Workers AI configuration
- `_headers` — baseline security headers for Cloudflare Pages

## Preview locally

Open `index.html` directly in a browser, or serve this directory with any local static-file server.

## Deploy from GitHub to Cloudflare Workers

1. Push this directory to a GitHub repository.
2. In Cloudflare Workers, connect that repository under Builds.
3. Leave the build command empty.
4. Use `npx wrangler deploy` as the deploy command.
5. Use the repository's `main` branch as the production branch.

The checked-in Wrangler configuration uploads only the public website assets, runs the Worker for `/api/*`, and supplies the Workers AI binding named `AI`. Cloudflare deploys automatically after changes reach the production branch.

## Customer service translation and email

The customer-service form accepts a message in any language, uses a Cloudflare Workers AI binding to detect its language and translate it into English, emails both versions to `support@gns-success.com` through Resend, and shows the English translation to the sender. No API key is placed in the browser or committed to GitHub.

Before the form can send live email, configure the Worker under **Cloudflare Workers → Settings → Variables and Secrets**:

1. Add `RESEND_API_KEY` as an encrypted secret and paste the Resend API key into it.

The Workers AI binding named `AI` is declared in `wrangler.jsonc` and is created during deployment; it does not need to be added manually in the dashboard.

The verified Resend sender and destination are both `support@gns-success.com`. The public endpoint validates and limits inputs, uses same-origin requests, includes a honeypot and minimum completion time, and does not log message text or email addresses. For production traffic, add a Cloudflare rate-limiting rule or Turnstile challenge for `/api/customer-service`.

## Stripe membership checkout

The membership buttons use Stripe-hosted Payment Links. No Stripe secret keys are placed in `index.html` or committed to GitHub. A later member-access phase should add signed Stripe webhooks so billing status can control private-community entitlements.

Defined membership offer:

- Kindred — 7 days free, then $199 USD per month
- Circle — 7 days free, then $499 USD per month
- Sovereign — 7 days free, then $999 USD per month
- A payment card is required, but nothing is charged when the trial begins
- The recurring charge begins after seven days and continues monthly until canceled
- Public website areas remain available without registration
- Meetings, the private community, introductions, and membership benefits begin with the 7-day trial
- Initial availability: United States, Canada, United Kingdom, Germany, Austria, France, Spain, Australia, New Zealand, Benin, Ghana, Nigeria, and Niger

Still to define before checkout goes live:

- whether displayed prices include tax;
- the success and cancellation experience;
- the member data required after signup.

## Planned member access architecture

- The public website remains available without an account.
- A `Login` link will open the member application once its URL is defined.
- Supabase Auth will identify members and manage their login session.
- A Cloudflare Worker will receive and verify Stripe webhook events.
- Verified webhook events will update a membership-entitlements table in Supabase.
- Protected member pages will require both a valid Supabase session and an active membership entitlement.
- Trialing, active, past-due, canceled, and refunded memberships will map to explicit access states.
- Stripe remains the billing source of truth; Supabase stores the access entitlement needed by the member application.
