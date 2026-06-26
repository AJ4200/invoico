import { LockKeyhole, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/utils/currency';
import { PortalInvoice } from '@/types/invoice';

interface PortalSummaryCardsProps {
  invoiceCurrency: string;
  outstandingPortalTotal: number;
  paidPortalInvoices: PortalInvoice[];
  portalInvoices: PortalInvoice[];
  unpaidPortalInvoices: PortalInvoice[];
}

export function PortalSummaryCards({
  invoiceCurrency,
  outstandingPortalTotal,
  paidPortalInvoices,
  portalInvoices,
  unpaidPortalInvoices,
}: PortalSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card variant="elevated" className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center">
            <LockKeyhole className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Business portal
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Track paid and unpaid invoices from the current draft and recurring schedule
              output. The future Neon version will attach this workspace to a Google-owned
              business profile.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {portalInvoices.length}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Invoices</p>
              </div>
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {paidPortalInvoices.length}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Paid</p>
              </div>
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-3">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {unpaidPortalInvoices.length}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Unpaid</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Manual collections
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Online card payments are removed. Invoico now records PayShap, bank transfer,
              and bank deposit payments against the invoice history.
            </p>
            <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Outstanding
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {formatMoney(outstandingPortalTotal, invoiceCurrency)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
