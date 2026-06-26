# Neon, Google auth, currencies, and business portal implementation plan

## Environment

- `DATABASE_URL`: Neon PostgreSQL pooled connection string.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`: session encryption and callback URL.
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`: invoice email delivery.
- No online payment provider credentials are required. Payment collection is handled through PayShap, bank transfer, or bank deposit.

## Login and business provisioning

Use Google OAuth for business users. After a successful login, run an idempotent provisioning step: find the user's `Business` record by `ownerId`; if it does not exist, create it using the Google profile name/email and default currency.

## Business portal

Businesses should have a secure portal to:

- View invoices by paid/unpaid status.
- Download stored invoice PDFs.
- Show clients PayShap details, EFT/bank transfer details, and bank deposit instructions.
- Record manual payments received through PayShap, bank transfer, or bank deposit.
- View payment history over time.
- Keep the client's invoice-facing view read-only except for downloading PDFs and seeing payment instructions.

Online card payments are intentionally out of scope for now. There should be no Stripe, PayPal, checkout-session, hosted payment page, or Open Payments integration in this phase.

## Payment handling

Every payment record should store:

- Invoice ID and client ID.
- Amount and currency.
- Method: `PAYSHAP`, `BANK_TRANSFER`, `BANK_DEPOSIT`, or `MANUAL`.
- Optional reference or proof-of-payment note.
- Status: `PENDING`, `CONFIRMED`, or `REVERSED`.
- Confirmation timestamp when the business marks the payment as received.

## International currency support

Businesses store a default currency, while every invoice stores its own invoice currency, business currency, and exchange rate snapshot. Amounts should always be formatted with `Intl.NumberFormat` for the invoice currency, and exchange rates should be displayed when the invoice currency differs from the business default.
