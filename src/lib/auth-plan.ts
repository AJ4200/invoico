export const authPlan = {
  database: 'Neon PostgreSQL via DATABASE_URL',
  provider: 'Google OAuth',
  firstLoginProvisioning:
    'After a Google login, create a Business row for the user if one does not already exist.',
  clientPortal:
    'Clients authenticate, then view invoice status, download PDFs, pay online, or use bank details.',
  paymentOptions: ['Stripe', 'PayPal', 'Open Payments-compatible providers', 'Bank transfer'],
};
