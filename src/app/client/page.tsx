'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Download,
  FileText,
  Landmark,
  LogOut,
  Mail,
  Phone,
  ReceiptText,
  Send,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  DEFAULT_BANKING_DETAILS,
  DEFAULT_BUSINESS_CURRENCY,
  DEFAULT_COMPANY_INFO,
  DEFAULT_INVOICE_CURRENCY,
} from '@/data/defaultBusiness';
import { useStoredState } from '@/hooks/useStoredState';
import {
  CLIENT_SESSION_STORAGE_KEY,
  GENERATED_STORAGE_KEY,
  PAID_INVOICES_STORAGE_KEY,
  PAYMENT_HISTORY_STORAGE_KEY,
  RECURRENCE_STORAGE_KEY,
} from '@/lib/storageKeys';
import {
  GeneratedInvoice,
  PortalInvoice,
  PortalPayment,
  RecurringSchedule,
} from '@/types/invoice';
import { formatMoney } from '@/utils/currency';
import { buildGeneratedPortalInvoices, downloadGeneratedPortalInvoice } from '@/utils/portalInvoices';

interface ClientSession {
  email: string;
  invoiceNumber: string;
}

export default function ClientPortalPage() {
  const [session, setSession] = useStoredState<ClientSession | null>(
    CLIENT_SESSION_STORAGE_KEY,
    null
  );
  const [login, setLogin] = useState({ email: '', invoiceNumber: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [recurringSchedules] = useStoredState<RecurringSchedule[]>(RECURRENCE_STORAGE_KEY, []);
  const [generatedInvoices] = useStoredState<GeneratedInvoice[]>(GENERATED_STORAGE_KEY, []);
  const [paidInvoiceIds] = useStoredState<string[]>(PAID_INVOICES_STORAGE_KEY, []);
  const [paymentHistory] = useStoredState<PortalPayment[]>(PAYMENT_HISTORY_STORAGE_KEY, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email')?.trim();
    const invoiceNumber = params.get('invoice')?.trim() ?? '';

    if (!email) return;

    const nextSession = { email, invoiceNumber };
    setLogin(nextSession);

    if (
      session?.email === nextSession.email &&
      session?.invoiceNumber === nextSession.invoiceNumber
    ) {
      return;
    }

    setSession(nextSession);
  }, [session, setSession]);

  const portalInvoices = useMemo(
    () =>
      buildGeneratedPortalInvoices(
        generatedInvoices,
        recurringSchedules,
        DEFAULT_INVOICE_CURRENCY
      ),
    [generatedInvoices, recurringSchedules]
  );

  const clientInvoices = useMemo(() => {
    if (!session) return [];
    const email = session.email.trim().toLowerCase();
    const invoiceNumber = session.invoiceNumber.trim().toLowerCase();

    return portalInvoices.filter((invoice) => {
      const emailMatches = invoice.clientEmail?.toLowerCase() === email;
      const invoiceMatches = !invoiceNumber || invoice.invoiceNumber.toLowerCase() === invoiceNumber;
      return emailMatches && invoiceMatches;
    });
  }, [portalInvoices, session]);

  const outstandingTotal = clientInvoices
    .filter((invoice) => !paidInvoiceIds.includes(invoice.id))
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const handleLogin = () => {
    if (!login.email.trim()) {
      setMessage('Enter the email address used on your invoice.');
      return;
    }

    setSession({
      email: login.email.trim(),
      invoiceNumber: login.invoiceNumber.trim(),
    });
    setMessage(null);
  };

  const handleDownload = (invoice: PortalInvoice) => {
    try {
      downloadGeneratedPortalInvoice({
        bankingDetails: DEFAULT_BANKING_DETAILS,
        businessCurrency: DEFAULT_BUSINESS_CURRENCY,
        companyInfo: DEFAULT_COMPANY_INFO,
        exchangeRate: 1,
        generatedInvoices,
        invoice,
        recurringSchedules,
      });
      setMessage(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not download this invoice.');
    }
  };

  const handleCopyReference = async (invoiceNumber: string) => {
    try {
      await navigator.clipboard.writeText(invoiceNumber);
      setMessage(`Copied ${invoiceNumber} as payment reference.`);
    } catch {
      setMessage(`Use ${invoiceNumber} as your payment reference.`);
    }
  };

  const handleSendProof = (invoice: PortalInvoice) => {
    const subject = `Payment proof for ${invoice.invoiceNumber}`;
    const body = [
      `Hi ${DEFAULT_COMPANY_INFO.name},`,
      '',
      `I have paid invoice ${invoice.invoiceNumber}.`,
      `Amount: ${formatMoney(invoice.total, invoice.currency)}`,
      `Reference: ${invoice.invoiceNumber}`,
      '',
      'I will attach proof of payment before sending.',
      '',
      'Thank you.',
    ].join('\n');

    window.location.href = `mailto:${encodeURIComponent(
      DEFAULT_COMPANY_INFO.email
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-sky-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <Card variant="elevated" className="w-full max-w-md p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <ReceiptText className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Client Portal
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  View invoices and payment instructions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={login.email}
                onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))}
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Invoice Number"
                value={login.invoiceNumber}
                onChange={(e) =>
                  setLogin((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                }
                placeholder="Optional"
                icon={<FileText className="h-4 w-4" />}
              />
              <Button className="w-full" size="lg" onClick={handleLogin}>
                Continue
              </Button>
            </div>

            {message && <p className="mt-4 text-sm font-medium text-red-600">{message}</p>}
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-sky-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Signed in as {session.email}
              </p>
              <h1 className="mt-1 text-4xl font-bold text-stone-900 dark:text-stone-100">
                Client Portal
              </h1>
            </div>
            <Button variant="ghost" leftIcon={<LogOut className="h-4 w-4" />} onClick={() => setSession(null)}>
              Sign Out
            </Button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">Invoices</p>
              <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">
                {clientInvoices.length}
              </p>
            </Card>
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">Outstanding</p>
              <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(outstandingTotal, DEFAULT_INVOICE_CURRENCY)}
              </p>
            </Card>
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">PayShap</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {DEFAULT_BANKING_DETAILS.payShapCell}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card variant="elevated" className="p-6 lg:col-span-2">
              <h2 className="mb-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                Your Invoices
              </h2>
              <p className="mb-5 text-sm text-stone-500 dark:text-stone-400">
                Download PDFs, check payment status, and use the invoice number as reference
              </p>

              <div className="space-y-3">
                {clientInvoices.map((invoice) => {
                  const isPaid = paidInvoiceIds.includes(invoice.id);
                  const invoicePayments = paymentHistory.filter(
                    (payment) => payment.invoiceId === invoice.id
                  );

                  return (
                    <motion.div
                      key={invoice.id}
                      layout
                      className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900/60"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-stone-900 dark:text-stone-100">
                              {invoice.invoiceNumber}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            Issued {invoice.invoiceDate} - Due {invoice.dueDate}
                          </p>
                          {invoicePayments.length > 0 && (
                            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                              Payment recorded by business
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 md:items-end">
                          <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                            {formatMoney(invoice.total, invoice.currency)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Download className="h-4 w-4" />}
                              onClick={() => handleDownload(invoice)}
                            >
                              PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Copy className="h-4 w-4" />}
                              onClick={() => handleCopyReference(invoice.invoiceNumber)}
                            >
                              Copy Ref
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Send className="h-4 w-4" />}
                              onClick={() => handleSendProof(invoice)}
                            >
                              Send Proof
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {clientInvoices.length === 0 && (
                <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
                  <ReceiptText className="mx-auto h-8 w-8 text-stone-400" />
                  <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                    No invoices were found for this email and invoice number.
                  </p>
                </div>
              )}

              {message && <p className="mt-4 text-sm font-medium text-sky-700 dark:text-sky-300">{message}</p>}
            </Card>

            <Card variant="elevated" className="p-6">
              <h2 className="mb-5 text-xl font-bold text-stone-900 dark:text-stone-100">
                Payment Details
              </h2>
              <div className="space-y-4 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-sky-500" />
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">PayShap</p>
                    <p>{DEFAULT_BANKING_DETAILS.payShapCell}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Landmark className="mt-0.5 h-4 w-4 text-sky-500" />
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">
                      Bank Transfer / Deposit
                    </p>
                    <p>{DEFAULT_BANKING_DETAILS.bankName}</p>
                    <p>Account: {DEFAULT_BANKING_DETAILS.accountNumber}</p>
                    <p>Branch: {DEFAULT_BANKING_DETAILS.branchCode}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-sky-50 p-4 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                Use the invoice number as your payment reference so the business can match your payment quickly.
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
