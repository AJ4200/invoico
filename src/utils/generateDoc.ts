import { jsPDF } from 'jspdf';

const formatRands = (amount: number): string =>
  `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface InvoiceData {
  clientInfo: { name: string; email: string; address: string; phone: string };
  invoiceDetails: { invoiceNumber: string; invoiceDate: string; dueDate: string };
  companyInfo: {
    name: string;
    tagline: string;
    email: string;
    address: string;
    phone: string;
    website: string;
    regNo: string;
    vatNo: string;
  };
  bankingDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    payShapCell: string;
  };
  services: { description: string; date: string; quantity: number; unitPrice: number; discount: number; total: number }[];
  tax: number;
  notes: string;
  subtotal: number;
  grandTotal: number;
}

function buildInvoicePDF(data: InvoiceData): jsPDF {
  const {
    clientInfo,
    invoiceDetails,
    companyInfo,
    bankingDetails,
    services,
    tax,
    notes,
    subtotal,
    grandTotal,
  } = data;
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const amountColRight = margin + contentWidth;

  const company = companyInfo;

  const colors = {
    primary: [15, 23, 42] as [number, number, number],
    accent: [14, 165, 233] as [number, number, number],
    secondary: [100, 116, 139] as [number, number, number],
    dark: [30, 41, 59] as [number, number, number],
    light: [248, 250, 252] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    discount: [239, 68, 68] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  let currentY = 20;

  // === Header: Company branding + Invoice badge ===
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(...colors.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(company.tagline, margin, 26);

  doc.setFillColor(...colors.accent);
  doc.rect(pageWidth - margin - 45, 12, 45, 18, 'F');
  doc.setTextColor(...colors.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 22, 22, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceDetails.invoiceNumber}`, pageWidth - margin - 22, 28, { align: 'center' });

  currentY = 50;

  // === Two-column: From / Bill To ===
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', margin, currentY);

  doc.setTextColor(...colors.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, margin, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.secondary);
  doc.text(company.address, margin, currentY + 14);
  doc.text(company.email, margin, currentY + 20);
  doc.text(company.phone, margin, currentY + 26);
  doc.text(company.website, margin, currentY + 32);

  doc.setTextColor(...colors.secondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 95, currentY);

  doc.setTextColor(...colors.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clientInfo.name, margin + 95, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.secondary);
  const clientAddress = clientInfo.address || '—';
  const clientEmail = clientInfo.email || '—';
  const clientPhone = clientInfo.phone || '—';
  doc.text(clientAddress, margin + 95, currentY + 14);
  doc.text(clientEmail, margin + 95, currentY + 20);
  doc.text(clientPhone, margin + 95, currentY + 26);

  currentY += 45;

  // === Invoice meta box ===
  doc.setFillColor(...colors.light);
  doc.rect(margin, currentY, contentWidth, 28, 'F');
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 28, 'S');

  doc.setTextColor(...colors.dark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date', margin + 8, currentY + 10);
  doc.text('Due Date', margin + 65, currentY + 10);
  doc.text('Currency', margin + 122, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.secondary);
  doc.text(invoiceDetails.invoiceDate, margin + 8, currentY + 18);
  doc.text(invoiceDetails.dueDate, margin + 65, currentY + 18);
  doc.text('ZAR (South African Rand)', margin + 122, currentY + 18);

  currentY += 38;

  // === Line items table header ===
  doc.setFillColor(...colors.primary);
  doc.rect(margin, currentY, contentWidth, 10, 'F');

  doc.setTextColor(...colors.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 4, currentY + 7);
  doc.text('Date', margin + 82, currentY + 7);
  doc.text('Qty', margin + 100, currentY + 7);
  doc.text('Unit Price', margin + 115, currentY + 7);
  doc.text('Discount', margin + 140, currentY + 7);
  doc.text('Amount', amountColRight, currentY + 7, { align: 'right' });

  currentY += 12;

  // === Line items ===
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  services.forEach((service, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
      doc.setFillColor(...colors.primary);
      doc.rect(margin, currentY, contentWidth, 10, 'F');
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', margin + 4, currentY + 7);
      doc.text('Date', margin + 82, currentY + 7);
      doc.text('Qty', margin + 100, currentY + 7);
      doc.text('Unit Price', margin + 115, currentY + 7);
      doc.text('Discount', margin + 140, currentY + 7);
      doc.text('Amount', amountColRight, currentY + 7, { align: 'right' });
      currentY += 12;
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY - 2, contentWidth, 12, 'F');
    }

    const descLines = doc.splitTextToSize(service.description || '—', 70);
    doc.text(descLines, margin + 4, currentY + 4);
    doc.text(service.date || '—', margin + 82, currentY + 4);
    doc.text(service.quantity.toString(), margin + 100, currentY + 4);
    doc.text(formatRands(service.unitPrice), margin + 115, currentY + 4);
    const discount = service.discount ?? 0;
    doc.setTextColor(...(discount > 0 ? colors.discount : colors.dark));
    doc.text(formatRands(discount), margin + 140, currentY + 4);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRands(service.total), amountColRight, currentY + 4, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    const lineHeight = Math.max(descLines.length * 5, 10);
    currentY += lineHeight;
  });

  currentY += 12;

  // === Totals ===
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(margin + 120, currentY, margin + contentWidth, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', margin + 130, currentY);
  doc.text(formatRands(subtotal), amountColRight, currentY, { align: 'right' });
  currentY += 8;

  doc.text('Tax (VAT)', margin + 130, currentY);
  doc.setTextColor(...colors.success);
  doc.text(`+ ${formatRands(tax)}`, amountColRight, currentY, { align: 'right' });
  doc.setTextColor(...colors.dark);
  currentY += 14;

  doc.setFillColor(...colors.primary);
  doc.rect(margin + 100, currentY - 6, contentWidth - 100, 14, 'F');
  doc.setTextColor(...colors.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Due', margin + 110, currentY + 2);
  doc.text(formatRands(grandTotal), amountColRight, currentY + 2, { align: 'right' });

  currentY += 24;

  // === Notes ===
  if (notes && notes.trim()) {
    doc.setTextColor(...colors.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.secondary);
    const noteLines = doc.splitTextToSize(notes.trim(), contentWidth);
    doc.text(noteLines, margin, currentY + 7);
    currentY += 7 + noteLines.length * 5 + 12;
  }

  // === Payment instructions ===
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(...colors.light);
  doc.rect(margin, currentY, contentWidth, 52, 'F');
  doc.setDrawColor(...colors.border);
  doc.rect(margin, currentY, contentWidth, 52, 'S');

  doc.setTextColor(...colors.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions', margin + 8, currentY + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.secondary);
  doc.text('Bank Transfer (EFT)', margin + 8, currentY + 22);
  doc.text(`Bank: ${bankingDetails.bankName || '—'}`, margin + 8, currentY + 28);
  doc.text(`Account Number: ${bankingDetails.accountNumber || '—'}`, margin + 8, currentY + 34);
  doc.text(`Branch Code: ${bankingDetails.branchCode || '—'}`, margin + 8, currentY + 40);
  doc.text('Reference: Inv #' + invoiceDetails.invoiceNumber, margin + 8, currentY + 46);

  doc.text('PayShap', margin + 110, currentY + 22);
  doc.text(`Cell: ${bankingDetails.payShapCell || '—'}`, margin + 110, currentY + 28);

  currentY += 60;

  // === Terms & conditions ===
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(...colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', margin, currentY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.secondary);
  const terms = [
    '• Payment is due within the specified due date. Late payments may incur interest.',
    '• All amounts are in South African Rand (ZAR) unless otherwise stated.',
    '• Please use the invoice number as your payment reference.',
    '• VAT is included where applicable. Tax invoice available on request.',
  ];
  terms.forEach((line, i) => {
    doc.text(line, margin, currentY + 8 + i * 5);
  });

  currentY += 8 + terms.length * 5 + 12;

  // === Footer ===
  doc.setDrawColor(...colors.border);
  doc.line(margin, 275, pageWidth - margin, 275);

  doc.setFontSize(7);
  doc.setTextColor(...colors.secondary);
  doc.text(
    `${company.name} | ${company.regNo} | ${company.vatNo} | ${company.website}`,
    pageWidth / 2,
    282,
    { align: 'center' }
  );
  doc.text('Invoice generated by Invoico. This is a computer-generated document.', pageWidth / 2, 288, {
    align: 'center',
  });

  return doc;
}

export const generatePDF = (data: InvoiceData): void => {
  const doc = buildInvoicePDF(data);
  doc.save(`${data.clientInfo.name.replace(/\s+/g, '-')}-invoice-${data.invoiceDetails.invoiceNumber}.pdf`);
};

/** Returns the PDF as base64 string for email attachment */
export const generatePDFAsBase64 = (data: InvoiceData): string => {
  const doc = buildInvoicePDF(data);
  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1] ?? '';
};
