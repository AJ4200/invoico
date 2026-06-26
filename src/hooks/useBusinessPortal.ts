import { useMemo, useState } from 'react';
import { generatePDF } from '@/utils/generateDoc';
import { calculateSubtotalFromServices, createId } from '@/utils/invoice/schedule';
import {
  PAID_INVOICES_STORAGE_KEY,
  PAYMENT_HISTORY_STORAGE_KEY,
} from '@/lib/storageKeys';
import {
  BankingDetails,
  ClientInfo,
  CompanyInfo,
  GeneratedInvoice,
  InvoiceDetails,
  PaymentCollectionMethod,
  PortalInvoice,
  PortalInvoiceStatus,
  PortalPayment,
  RecurringSchedule,
  Service,
} from '@/types/invoice';
import { useStoredState } from './useStoredState';

interface UseBusinessPortalArgs {
  clientInfo: ClientInfo;
  invoiceDetails: InvoiceDetails;
  companyInfo: CompanyInfo;
  bankingDetails: BankingDetails;
  services: Service[];
  tax: number;
  notes: string;
  invoiceCurrency: string;
  businessCurrency: string;
  exchangeRate: number;
  generatedInvoices: GeneratedInvoice[];
  recurringSchedules: RecurringSchedule[];
  subtotal: number;
  grandTotal: number;
}

export function useBusinessPortal({
  clientInfo,
  invoiceDetails,
  companyInfo,
  bankingDetails,
  services,
  tax,
  notes,
  invoiceCurrency,
  businessCurrency,
  exchangeRate,
  generatedInvoices,
  recurringSchedules,
  subtotal,
  grandTotal,
}: UseBusinessPortalArgs) {
  const [portalFilter, setPortalFilter] = useState<PortalInvoiceStatus>('all');
  const [manualPaymentMethod, setManualPaymentMethod] =
    useState<PaymentCollectionMethod>('PayShap');
  const [portalMessage, setPortalMessage] = useState<string | null>(null);
  const [paidInvoiceIds, setPaidInvoiceIds] = useStoredState<string[]>(
    PAID_INVOICES_STORAGE_KEY,
    []
  );
  const [paymentHistory, setPaymentHistory] = useStoredState<PortalPayment[]>(
    PAYMENT_HISTORY_STORAGE_KEY,
    []
  );

  const portalInvoices = useMemo<PortalInvoice[]>(() => {
    const currentPortalInvoice: PortalInvoice = {
      id: `current:${invoiceDetails.invoiceNumber || 'draft'}`,
      source: 'current',
      clientName: clientInfo.name || 'Current draft',
      clientEmail: clientInfo.email,
      invoiceDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate,
      invoiceNumber: invoiceDetails.invoiceNumber || 'Draft invoice',
      total: grandTotal,
      currency: invoiceCurrency,
    };

    return [
      currentPortalInvoice,
      ...generatedInvoices.map((invoice) => ({
        id: invoice.id,
        source: 'generated' as const,
        scheduleId: invoice.scheduleId,
        clientName: invoice.clientName,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        currency: invoiceCurrency,
      })),
    ];
  }, [clientInfo, generatedInvoices, grandTotal, invoiceCurrency, invoiceDetails]);

  const filteredPortalInvoices = useMemo(
    () =>
      portalInvoices.filter((invoice) => {
        const isPaid = paidInvoiceIds.includes(invoice.id);
        if (portalFilter === 'paid') return isPaid;
        if (portalFilter === 'unpaid') return !isPaid;
        return true;
      }),
    [paidInvoiceIds, portalFilter, portalInvoices]
  );

  const unpaidPortalInvoices = useMemo(
    () => portalInvoices.filter((invoice) => !paidInvoiceIds.includes(invoice.id)),
    [paidInvoiceIds, portalInvoices]
  );

  const paidPortalInvoices = useMemo(
    () => portalInvoices.filter((invoice) => paidInvoiceIds.includes(invoice.id)),
    [paidInvoiceIds, portalInvoices]
  );

  const outstandingPortalTotal = useMemo(
    () => unpaidPortalInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
    [unpaidPortalInvoices]
  );

  const handleDownloadPortalInvoice = (invoice: PortalInvoice) => {
    setPortalMessage(null);

    if (invoice.source === 'current') {
      generatePDF({
        clientInfo,
        invoiceDetails,
        companyInfo,
        bankingDetails,
        services,
        tax,
        notes,
        subtotal,
        grandTotal,
        currency: invoiceCurrency,
        businessCurrency,
        exchangeRate,
      });
      return;
    }

    const schedule = recurringSchedules.find((item) => item.id === invoice.scheduleId);
    if (!schedule) {
      setPortalMessage('This invoice needs its saved template before the PDF can be rebuilt.');
      return;
    }

    const scheduleSubtotal = calculateSubtotalFromServices(schedule.template.services);
    generatePDF({
      clientInfo: schedule.client,
      invoiceDetails: {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
      },
      companyInfo,
      bankingDetails,
      services: schedule.template.services,
      tax: schedule.template.tax,
      notes: schedule.template.notes,
      subtotal: scheduleSubtotal,
      grandTotal: invoice.total,
      currency: invoice.currency,
      businessCurrency,
      exchangeRate,
    });
  };

  const handleRecordManualPayment = (invoice: PortalInvoice) => {
    if (paidInvoiceIds.includes(invoice.id)) {
      setPortalMessage(`${invoice.invoiceNumber} is already marked as paid.`);
      return;
    }

    const payment: PortalPayment = {
      id: createId(),
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount: invoice.total,
      currency: invoice.currency,
      method: manualPaymentMethod,
      recordedAt: new Date().toISOString(),
    };

    setPaidInvoiceIds((prev) => [invoice.id, ...prev]);
    setPaymentHistory((prev) => [payment, ...prev].slice(0, 50));
    setPortalMessage(`${manualPaymentMethod} payment recorded for ${invoice.invoiceNumber}.`);
  };

  return {
    filteredPortalInvoices,
    handleDownloadPortalInvoice,
    handleRecordManualPayment,
    manualPaymentMethod,
    outstandingPortalTotal,
    paidInvoiceIds,
    paidPortalInvoices,
    paymentHistory,
    portalFilter,
    portalInvoices,
    portalMessage,
    setManualPaymentMethod,
    setPortalFilter,
    unpaidPortalInvoices,
  };
}
