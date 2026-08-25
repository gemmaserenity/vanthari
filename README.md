# VANTHARI

VANTHARI's multilingual public website. The current release is a static site with English, French, German, and Spanish copy. Visitors can change language without leaving or reloading the page, and their choice is remembered in the browser.

## Files

- `index.html` — complete website, styles, animations, and translations
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

## Stripe membership phase

Stripe checkout must be created server-side; secret keys must never be placed in `index.html` or committed to GitHub. The next phase should add a Cloudflare Worker for checkout sessions and signed Stripe webhooks.

Defined membership offer:

- Kindred — $49 USD for the first 7 days, then $199 USD every 30 days
- Circle — $125 USD for the first 7 days, then $499 USD every 30 days
- Sovereign — $249 USD for the first 7 days, then $999 USD every 30 days
- A payment card is required and the 7-day trial charge is collected immediately
- The standard recurring charge begins seven days later and continues every 30 days until canceled
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
