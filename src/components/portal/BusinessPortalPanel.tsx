import { Download, FileCheck, Hash, History, Landmark, Phone } from 'lucide-react';
import { BankingDetails, PaymentCollectionMethod, PortalInvoice, PortalInvoiceStatus, PortalPayment } from '@/types/invoice';
import { formatMoney } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface BusinessPortalPanelProps {
  bankingDetails: BankingDetails;
  filteredPortalInvoices: PortalInvoice[];
  invoiceNumber: string;
  manualPaymentMethod: PaymentCollectionMethod;
  paidInvoiceIds: string[];
  paymentHistory: PortalPayment[];
  portalFilter: PortalInvoiceStatus;
  portalMessage: string | null;
  selectStyles: string;
  onDownloadInvoice: (invoice: PortalInvoice) => void;
  onRecordPayment: (invoice: PortalInvoice) => void;
  onSetManualPaymentMethod: (method: PaymentCollectionMethod) => void;
  onSetPortalFilter: (status: PortalInvoiceStatus) => void;
}

export function BusinessPortalPanel({
  bankingDetails,
  filteredPortalInvoices,
  invoiceNumber,
  manualPaymentMethod,
  paidInvoiceIds,
  paymentHistory,
  portalFilter,
  portalMessage,
  selectStyles,
  onDownloadInvoice,
  onRecordPayment,
  onSetManualPaymentMethod,
  onSetPortalFilter,
}: BusinessPortalPanelProps) {
  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
          <FileCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
          Business Portal
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {(['all', 'unpaid', 'paid'] as PortalInvoiceStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onSetPortalFilter(status)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
              portalFilter === status
                ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Collection Method
        </label>
        <select
          className={selectStyles}
          value={manualPaymentMethod}
          onChange={(e) => onSetManualPaymentMethod(e.target.value as PaymentCollectionMethod)}
        >
          <option value="PayShap">PayShap</option>
          <option value="Bank transfer">Bank transfer</option>
          <option value="Bank deposit">Bank deposit</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredPortalInvoices.slice(0, 4).map((invoice) => {
          const isPaid = paidInvoiceIds.includes(invoice.id);

          return (
            <div
              key={invoice.id}
              className="rounded-lg border border-stone-200 dark:border-stone-700 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {invoice.clientName}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {invoice.invoiceNumber}
                  </p>
                </div>
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

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {formatMoney(invoice.total, invoice.currency)}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Due {invoice.dueDate}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => onDownloadInvoice(invoice)}
                  >
                    PDF
                  </Button>
                  <Button
                    variant={isPaid ? 'ghost' : 'secondary'}
                    size="sm"
                    disabled={isPaid}
                    onClick={() => onRecordPayment(invoice)}
                  >
                    Record Paid
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPortalInvoices.length === 0 && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No invoices match this status.
        </p>
      )}

      {portalMessage && (
        <p className="mt-4 text-sm font-medium text-sky-700 dark:text-sky-300">
          {portalMessage}
        </p>
      )}

      <div className="mt-6 border-t border-stone-200 dark:border-stone-700 pt-5">
        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Client Payment Details
        </h4>
        <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-500" />
            PayShap: {bankingDetails.payShapCell || 'Add PayShap cell'}
          </p>
          <p className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-sky-500" />
            {bankingDetails.bankName || 'Bank'} account{' '}
            {bankingDetails.accountNumber || 'not set'}
          </p>
          <p className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-sky-500" />
            Reference: {invoiceNumber || 'invoice number'}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-stone-200 dark:border-stone-700 pt-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">
          <History className="w-4 h-4 text-sky-500" />
          Payment History
        </h4>
        {paymentHistory.length === 0 && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Payments recorded from PayShap, bank transfer, or deposit will appear here.
          </p>
        )}
        <div className="space-y-2">
          {paymentHistory.slice(0, 5).map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg bg-stone-50 dark:bg-stone-800 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-stone-800 dark:text-stone-100">
                  {payment.invoiceNumber}
                </p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(payment.amount, payment.currency)}
                </p>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {payment.method} - {new Date(payment.recordedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
