# VANTHARI billing integration notes

The CSV files in this directory are read-only snapshots exported from Stripe. Do not edit their IDs or amounts by hand. Re-export them after changing Stripe products or prices.

## Export reviewed on 2026-09-11

| Tier | Product ID | Ongoing price | Website offer |
| --- | --- | --- | --- |
| Kindred | `prod_V8QsihF0nf0o7S` | `price_1U8A0RPoTLTSVLKObd4X8xxg` — $199/month | 7 days free, then $199/month |
| Circle | `prod_V8QtnpF55u7L5P` | `price_1U8A1pPoTLTSVLKOqhwkjywN` — $499/month | 7 days free, then $499/month |
| Sovereign | `prod_V8QuWCJxQbA3IF` | `price_1U8A2xPoTLTSVLKOy92ufD4d` — $999/month | 7 days free, then $999/month |

## Live Payment Links

| Tier | Checkout URL |
| --- | --- |
| Kindred | `https://buy.stripe.com/fZu4gB4Alaxb1wk09D0Fi02` |
| Circle | `https://buy.stripe.com/fZudRbgj348N7UI6y10Fi00` |
| Sovereign | `https://buy.stripe.com/5kQ14p6It0WB3Ese0t0Fi01` |

Each live checkout was verified to show a seven-day free trial, $0 due today, and the matching monthly renewal amount.

### Items to reconcile in Stripe

1. The checkout flow no longer uses the exported weekly introductory prices. Confirm they are inactive and archive unused prices rather than deleting historical billing records.
2. The export contains both $125/week and $149/week Circle prices, plus two $49 Kindred prices with different billing intervals. None is used by the live Payment Links.
3. The ongoing prices use `month × 1`, so the website describes renewal as monthly rather than exactly every 30 days.
4. Assign and verify an appropriate Stripe product tax code before enabling automatic tax.

## Payment Link option

The public site is static, so each membership button links directly to its Stripe-hosted Payment Link. Price IDs and Product IDs remain catalog references rather than browser checkout URLs.

A custom Cloudflare Worker can create Checkout Sessions from the same catalog instead. In that design, Payment Links are not required, but the Worker needs the Stripe secret key, success and cancellation URLs, webhook handling, and a secure member-account linking flow.

## Planned system boundary

### Public website

- Remains readable without registration.
- Sends tier selection to a server-created Stripe Checkout Session.
- Includes a `Login` link once the member application URL exists.
- Never contains Stripe secret keys, webhook secrets, or Supabase secret keys.

### Cloudflare Worker

- Creates Stripe Checkout Sessions using an allowlist of known tier keys and server-side price IDs.
- Receives Stripe webhook events at a dedicated endpoint.
- Verifies the `Stripe-Signature` against the unmodified raw request body before processing an event.
- Records processed Stripe event IDs so retries are idempotent.
- Uses a server-only Supabase secret key to update billing and entitlement records.
- Returns a successful response quickly and handles duplicate or out-of-order events safely.

### Supabase

- Supabase Auth identifies the member.
- Row Level Security protects member-facing tables.
- A membership table links the Supabase user to Stripe customer, subscription, product, and price IDs.
- Stripe webhook data controls billing status; browser-supplied membership claims are never trusted.
- Only a server-side secret key may update authoritative entitlement fields.

## Suggested membership record

- `user_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_product_id`
- `stripe_price_id`
- `tier`
- `status`
- `billing_phase`
- `access_started_at`
- `current_period_end`
- `cancel_at_period_end`
- `canceled_at`
- `updated_at`

Suggested access states include `trial`, `active`, `past_due`, `canceled`, `unpaid`, and `refunded`. The member application should grant protected access only when the authenticated user has a current entitlement in an allowed state.

## Stripe events to design for

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- refund events relevant to the final refund policy

The final event list and state transitions should be fixed before implementation and covered by replay/idempotency tests.

## Account linking decision still required

The checkout customer must be securely linked to a Supabase user. Do not grant access based only on an unverified matching email address. Choose one of these flows before implementation:

1. Require Supabase signup/login before Stripe Checkout, then place the authenticated `user_id` into server-controlled Stripe metadata.
2. Allow checkout first, then let the purchaser claim the membership through a signed success flow and a verified email invitation.
