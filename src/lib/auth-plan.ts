export const authPlan = {
  database: 'Neon PostgreSQL via DATABASE_URL',
  provider: 'Google OAuth',
  firstLoginProvisioning:
    'After a Google login, create a Business row for the user if one does not already exist.',
  businessPortal:
    'Businesses authenticate, then manage invoice status, download PDFs, and record manual collections.',
  paymentOptions: ['PayShap', 'Bank transfer', 'Bank deposit'],
};
