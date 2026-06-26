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
      clientEmail: invoice.client?.email ?? schedule?.client.email,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      currency: invoice.currency ?? currency,
    };
  });
}

export function downloadGeneratedPortalInvoice({
  bankingDetails,
  businessCurrency,
  companyInfo,
  exchangeRate,
  generatedInvoices,
  invoice,
  recurringSchedules,
}: {
  bankingDetails: BankingDetails;
  businessCurrency: string;
  companyInfo: CompanyInfo;
  exchangeRate: number;
  generatedInvoices: GeneratedInvoice[];
  invoice: PortalInvoice;
  recurringSchedules: RecurringSchedule[];
}) {
  const savedInvoice = generatedInvoices.find((item) => item.id === invoice.id);
  const schedule = recurringSchedules.find((item) => item.id === invoice.scheduleId);
  const client = savedInvoice?.client ?? schedule?.client;
  const template = savedInvoice?.template ?? schedule?.template;

  if (!client || !template) {
    throw new Error('This invoice needs its saved template before the PDF can be rebuilt.');
  }

  const subtotal = savedInvoice?.subtotal ?? calculateSubtotalFromServices(template.services);
  generatePDF({
    clientInfo: client,
    invoiceDetails: {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
    },
    companyInfo: savedInvoice?.companyInfo ?? companyInfo,
    bankingDetails: savedInvoice?.bankingDetails ?? bankingDetails,
    services: template.services,
    tax: template.tax,
    notes: template.notes,
    subtotal,
    grandTotal: invoice.total,
    currency: invoice.currency,
    businessCurrency: savedInvoice?.businessCurrency ?? businessCurrency,
    exchangeRate: savedInvoice?.exchangeRate ?? exchangeRate,
  });
}
