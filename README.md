# VANTHARI

VANTHARI's multilingual public website. The current release is a static site with English, French, German, and Spanish copy. Visitors can change language without leaving or reloading the page, and their choice is remembered in the browser.

## Files

- `index.html` — complete website, styles, animations, and translations
- `customer-service/index.html` — multilingual customer-service form and English translation display
- `functions/api/customer-service.js` — same-origin translation and email endpoint for Cloudflare Pages
- `_headers` — baseline security headers for Cloudflare Pages

## Preview locally

Open `index.html` directly in a browser, or serve this directory with any local static-file server.

## Deploy from GitHub to Cloudflare Pages

1. Push this directory to a GitHub repository.
2. In Cloudflare, create a Pages project and connect that repository.
3. Choose no framework preset.
4. Set the build command to `exit 0`.
5. Set the build output directory to `.` (the repository root).
6. Use the repository's main branch as the production branch.

Cloudflare will publish the top-level `index.html` and create preview deployments for other branches and pull requests.

## Customer service translation and email

The customer-service form accepts a message in any language, uses a Cloudflare Workers AI binding to detect its language and translate it into English, emails both versions to `support@gns-success.com` through Resend, and shows the English translation to the sender. No API key is placed in the browser or committed to GitHub.

Before the form can send live email, configure the production and preview environments in **Cloudflare Pages → Settings → Bindings / Variables and Secrets**:

1. Add a Workers AI binding named `AI`.
2. Add `RESEND_API_KEY` as an encrypted secret and paste the Resend API key into it.

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
