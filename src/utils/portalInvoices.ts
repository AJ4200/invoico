import { generatePDF } from '@/utils/generateDoc';
import { calculateSubtotalFromServices } from '@/utils/invoice/schedule';
import {
  BankingDetails,
  CompanyInfo,
  GeneratedInvoice,
  PortalInvoice,
  RecurringSchedule,
} from '@/types/invoice';

export function buildGeneratedPortalInvoices(
  generatedInvoices: GeneratedInvoice[],
  recurringSchedules: RecurringSchedule[],
  currency: string
): PortalInvoice[] {
  return generatedInvoices.map((invoice) => {
    const schedule = recurringSchedules.find((item) => item.id === invoice.scheduleId);

    return {
      id: invoice.id,
      source: 'generated',
      scheduleId: invoice.scheduleId,
      clientName: invoice.clientName,
      clientEmail: schedule?.client.email,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      currency,
    };
  });
}

export function downloadGeneratedPortalInvoice({
  bankingDetails,
  businessCurrency,
  companyInfo,
  exchangeRate,
  invoice,
  recurringSchedules,
}: {
  bankingDetails: BankingDetails;
  businessCurrency: string;
  companyInfo: CompanyInfo;
  exchangeRate: number;
  invoice: PortalInvoice;
  recurringSchedules: RecurringSchedule[];
}) {
  const schedule = recurringSchedules.find((item) => item.id === invoice.scheduleId);

  if (!schedule) {
    throw new Error('This invoice needs its saved template before the PDF can be rebuilt.');
  }

  const subtotal = calculateSubtotalFromServices(schedule.template.services);
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
    subtotal,
    grandTotal: invoice.total,
    currency: invoice.currency,
    businessCurrency,
    exchangeRate,
  });
}
