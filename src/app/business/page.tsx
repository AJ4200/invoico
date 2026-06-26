'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Download,
  FileCheck,
  History,
  LogOut,
  Mail,
  WalletCards,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DEFAULT_BANKING_DETAILS, DEFAULT_BUSINESS_CURRENCY, DEFAULT_COMPANY_INFO, DEFAULT_INVOICE_CURRENCY } from '@/data/defaultBusiness';
import { useStoredState } from '@/hooks/useStoredState';
import {
  BUSINESS_SESSION_STORAGE_KEY,
  GENERATED_STORAGE_KEY,
  PAID_INVOICES_STORAGE_KEY,
  PAYMENT_HISTORY_STORAGE_KEY,
  RECURRENCE_STORAGE_KEY,
} from '@/lib/storageKeys';
import {
  GeneratedInvoice,
  PaymentCollectionMethod,
  PortalInvoice,
  PortalInvoiceStatus,
  PortalPayment,
  RecurringSchedule,
} from '@/types/invoice';
import { formatMoney } from '@/utils/currency';
import { createId } from '@/utils/invoice/schedule';
import { buildGeneratedPortalInvoices, downloadGeneratedPortalInvoice } from '@/utils/portalInvoices';

interface BusinessSession {
  businessName: string;
  email: string;
}

const selectStyles =
  'w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all duration-200';

export default function BusinessPortalPage() {
  const [session, setSession] = useStoredState<BusinessSession | null>(
    BUSINESS_SESSION_STORAGE_KEY,
    null
  );
  const [login, setLogin] = useState({
    businessName: DEFAULT_COMPANY_INFO.name,
    email: DEFAULT_COMPANY_INFO.email,
  });
  const [filter, setFilter] = useState<PortalInvoiceStatus>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentCollectionMethod>('PayShap');
  const [message, setMessage] = useState<string | null>(null);
  const [recurringSchedules] = useStoredState<RecurringSchedule[]>(RECURRENCE_STORAGE_KEY, []);
  const [generatedInvoices] = useStoredState<GeneratedInvoice[]>(GENERATED_STORAGE_KEY, []);
  const [paidInvoiceIds, setPaidInvoiceIds] = useStoredState<string[]>(
    PAID_INVOICES_STORAGE_KEY,
    []
  );
  const [paymentHistory, setPaymentHistory] = useStoredState<PortalPayment[]>(
    PAYMENT_HISTORY_STORAGE_KEY,
    []
  );

  const portalInvoices = useMemo(
    () =>
      buildGeneratedPortalInvoices(
        generatedInvoices,
        recurringSchedules,
        DEFAULT_INVOICE_CURRENCY
      ),
    [generatedInvoices, recurringSchedules]
  );

  const filteredInvoices = portalInvoices.filter((invoice) => {
    const isPaid = paidInvoiceIds.includes(invoice.id);
    if (filter === 'paid') return isPaid;
    if (filter === 'unpaid') return !isPaid;
    return true;
  });

  const unpaidInvoices = portalInvoices.filter((invoice) => !paidInvoiceIds.includes(invoice.id));
  const paidInvoices = portalInvoices.filter((invoice) => paidInvoiceIds.includes(invoice.id));
  const outstandingTotal = unpaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const handleLogin = () => {
    if (!login.email.trim()) {
      setMessage('Add your business email to continue.');
      return;
    }

    setSession({
      businessName: login.businessName.trim() || DEFAULT_COMPANY_INFO.name,
      email: login.email.trim(),
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
        invoice,
        recurringSchedules,
      });
      setMessage(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not download this invoice.');
    }
  };

  const handleRecordPayment = (invoice: PortalInvoice) => {
    if (paidInvoiceIds.includes(invoice.id)) {
      setMessage(`${invoice.invoiceNumber} is already marked as paid.`);
      return;
    }

    const payment: PortalPayment = {
      id: createId(),
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount: invoice.total,
      currency: invoice.currency,
      method: paymentMethod,
      recordedAt: new Date().toISOString(),
    };

    setPaidInvoiceIds((prev) => [invoice.id, ...prev]);
    setPaymentHistory((prev) => [payment, ...prev].slice(0, 50));
    setMessage(`${paymentMethod} payment recorded for ${invoice.invoiceNumber}.`);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-sky-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <Card variant="elevated" className="w-full max-w-md p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
                <Building2 className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Business Portal
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Manage invoices and received payments
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Business Name"
                value={login.businessName}
                onChange={(e) => setLogin((prev) => ({ ...prev, businessName: e.target.value }))}
                icon={<Building2 className="h-4 w-4" />}
              />
              <Input
                label="Business Email"
                type="email"
                value={login.email}
                onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))}
                icon={<Mail className="h-4 w-4" />}
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
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                Signed in as {session.email}
              </p>
              <h1 className="mt-1 text-4xl font-bold text-stone-900 dark:text-stone-100">
                {session.businessName}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/workspace">
                <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Create Invoice
                </Button>
              </Link>
              <Button variant="ghost" leftIcon={<LogOut className="h-4 w-4" />} onClick={() => setSession(null)}>
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Invoices</p>
              <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">
                {portalInvoices.length}
              </p>
            </Card>
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">Outstanding</p>
              <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(outstandingTotal, DEFAULT_INVOICE_CURRENCY)}
              </p>
            </Card>
            <Card variant="elevated" className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400">Paid</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {paidInvoices.length}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card variant="elevated" className="p-6 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    Invoice Workbench
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Download invoices and record PayShap, transfer, or deposit payments
                  </p>
                </div>
                <div className="flex rounded-lg border border-stone-200 p-1 dark:border-stone-700">
                  {(['all', 'unpaid', 'paid'] as PortalInvoiceStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                        filter === status
                          ? 'bg-sky-600 text-white'
                          : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5 max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Collection Method
                </label>
                <select
                  className={selectStyles}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentCollectionMethod)}
                >
                  <option value="PayShap">PayShap</option>
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="Bank deposit">Bank deposit</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredInvoices.map((invoice) => {
                  const isPaid = paidInvoiceIds.includes(invoice.id);

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
                            {invoice.clientName} {invoice.clientEmail ? `- ${invoice.clientEmail}` : ''}
                          </p>
                          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            Due {invoice.dueDate}
                          </p>
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
                              variant={isPaid ? 'ghost' : 'secondary'}
                              size="sm"
                              disabled={isPaid}
                              onClick={() => handleRecordPayment(invoice)}
                            >
                              Record Paid
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredInvoices.length === 0 && (
                <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
                  <FileCheck className="mx-auto h-8 w-8 text-stone-400" />
                  <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                    No invoices here yet. Create invoices or run recurring schedules from the main workspace.
                  </p>
                </div>
              )}

              {message && <p className="mt-4 text-sm font-medium text-sky-700 dark:text-sky-300">{message}</p>}
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <WalletCards className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Payment History
                </h2>
              </div>
              <div className="space-y-3">
                {paymentHistory.slice(0, 8).map((payment) => (
                  <div key={payment.id} className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          {payment.invoiceNumber}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {payment.method}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(payment.amount, payment.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {paymentHistory.length === 0 && (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Recorded payments will appear here.
                </p>
              )}
              <div className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-sky-500" />
                  Client portal payments remain read-only until the business confirms receipt.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
