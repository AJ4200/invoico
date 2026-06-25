# Neon, Google auth, currencies, and client portal implementation plan

## Environment

- `DATABASE_URL`: Neon PostgreSQL pooled connection string.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`: session encryption and callback URL.
- Payment provider credentials for Stripe, PayPal, or an Open Payments-compatible provider.

## Login and business provisioning

Use Google OAuth for business users. After a successful login, run an idempotent provisioning step: find the user's `Business` record by `ownerId`; if it does not exist, create it using the Google profile name/email and default currency.

## Client portal

Clients should have a secure portal to:

- View invoices by paid/unpaid status.
- Download stored invoice PDFs.
- Pay outstanding invoices online.
- Use bank details as an alternative payment method when online payments are not available.
- View payment history over time.

## International currency support

Businesses store a default currency, while every invoice stores its own invoice currency, business currency, and exchange rate snapshot. Amounts should always be formatted with `Intl.NumberFormat` for the invoice currency, and exchange rates should be displayed when the invoice currency differs from the business default.
