import { BankingDetails, ClientInfo, CompanyInfo, InvoiceDetails } from '@/types/invoice';
import { formatMoney } from './currency';

interface InvoiceMailtoArgs {
  bankingDetails: BankingDetails;
  clientInfo: ClientInfo;
  companyInfo: CompanyInfo;
  grandTotal: number;
  invoiceCurrency: string;
  invoiceDetails: InvoiceDetails;
  portalUrl?: string;
}

export function buildInvoiceMailto({
  bankingDetails,
  clientInfo,
  companyInfo,
  grandTotal,
  invoiceCurrency,
  invoiceDetails,
  portalUrl,
}: InvoiceMailtoArgs) {
  const companyName = companyInfo.name || 'Your Company';
  const clientName = clientInfo.name || 'Valued Client';
  const invoiceNumber = invoiceDetails.invoiceNumber || 'your invoice';
  const amountDue = formatMoney(grandTotal, invoiceCurrency);

  const subject = `Invoice ${invoiceNumber} from ${companyName}`;
  const body = [
    `Dear ${clientName},`,
    '',
    `Please find invoice ${invoiceNumber} from ${companyName}.`,
    `Amount due: ${amountDue}`,
    `Due date: ${invoiceDetails.dueDate || 'As stated on invoice'}`,
    '',
    'Payment options:',
    `PayShap: ${bankingDetails.payShapCell || 'Available on request'}`,
    `Bank: ${bankingDetails.bankName || 'Available on request'}`,
    `Account number: ${bankingDetails.accountNumber || 'Available on request'}`,
    `Branch code: ${bankingDetails.branchCode || 'Available on request'}`,
    `Reference: ${invoiceNumber}`,
    ...(portalUrl
      ? [
          '',
          'Client portal:',
          portalUrl,
        ]
      : []),
    '',
    'Please attach the downloaded PDF invoice before sending.',
    '',
    'If you have any questions about this invoice, please let me know.',
    '',
    'Thank you for your business.',
    '',
    companyName,
  ].join('\n');

  return `mailto:${encodeURIComponent(clientInfo.email.trim())}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
