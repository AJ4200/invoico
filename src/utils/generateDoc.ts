import { jsPDF } from 'jspdf';

export const generatePDF = (
  clientInfo: { name: string; email: string; address: string; phone: string },
  invoiceDetails: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
  },
  services: {
    description: string;
    date: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[],
  tax: number,
  discount: number,
  notes: string,
  subtotal: number,
  grandTotal: number
) => {
  const doc = new jsPDF();

  const yourInfo = {
    name: 'JE Productions',
    email: 'abeljackson33@gmail.com',
    address: '1234 Street Name, City, Country',
    phone: '0626775823',
    website: 'www.aj4200.dev',
  };

  const colors = {
    primary: [14, 165, 233] as [number, number, number],
    secondary: [120, 113, 108] as [number, number, number],
    dark: [28, 25, 23] as [number, number, number],
    light: [245, 245, 244] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
  };

  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(...colors.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(yourInfo.name, 15, 22);

  doc.setFillColor(...colors.white);
  doc.rect(0, 35, 210, 50, 'F');

  doc.setTextColor(...colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FROM:', 15, 45);
  doc.setFontSize(9);
  doc.text(yourInfo.email, 15, 52);
  doc.text(yourInfo.phone, 15, 57);
  doc.text(yourInfo.address, 15, 62);
  doc.text(yourInfo.website, 15, 67);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE TO:', 120, 45);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clientInfo.name, 120, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(clientInfo.email, 120, 57);
  doc.text(clientInfo.phone, 120, 62);
  doc.text(clientInfo.address, 120, 67);

  doc.setDrawColor(...colors.light);
  doc.setLineWidth(0.5);
  doc.line(15, 72, 195, 72);

  doc.setFillColor(...colors.light);
  doc.rect(0, 75, 210, 20, 'F');

  doc.setTextColor(...colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS', 15, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Invoice #: ${invoiceDetails.invoiceNumber}`, 15, 91);
  doc.text(`Date: ${invoiceDetails.invoiceDate}`, 80, 91);
  doc.text(`Due Date: ${invoiceDetails.dueDate}`, 140, 91);

  let currentY = 105;

  doc.setFillColor(...colors.primary);
  doc.rect(15, currentY, 180, 8, 'F');

  doc.setTextColor(...colors.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 18, currentY + 5.5);
  doc.text('DATE', 95, currentY + 5.5);
  doc.text('QTY', 125, currentY + 5.5);
  doc.text('RATE', 145, currentY + 5.5);
  doc.text('AMOUNT', 170, currentY + 5.5);

  currentY += 10;

  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  services.forEach((service, index) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;

      doc.setFillColor(...colors.primary);
      doc.rect(15, currentY, 180, 8, 'F');

      doc.setTextColor(...colors.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 18, currentY + 5.5);
      doc.text('DATE', 95, currentY + 5.5);
      doc.text('QTY', 125, currentY + 5.5);
      doc.text('RATE', 145, currentY + 5.5);
      doc.text('AMOUNT', 170, currentY + 5.5);

      currentY += 10;
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, currentY - 2, 180, 10, 'F');
    }

    const descriptionLines = doc.splitTextToSize(service.description, 70);
    doc.text(descriptionLines, 18, currentY + 3);

    doc.text(service.date, 95, currentY + 3);
    doc.text(service.quantity.toString(), 125, currentY + 3);
    doc.text(`$${service.unitPrice.toFixed(2)}`, 145, currentY + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${service.total.toFixed(2)}`, 170, currentY + 3);
    doc.setFont('helvetica', 'normal');

    const lineHeight = Math.max(descriptionLines.length * 5, 10);
    currentY += lineHeight;
  });

  currentY += 10;

  doc.setDrawColor(...colors.light);
  doc.line(15, currentY, 195, currentY);

  currentY += 8;

  doc.setFontSize(10);
  doc.text('Subtotal:', 140, currentY);
  doc.text(`$${subtotal.toFixed(2)}`, 180, currentY, { align: 'right' });

  currentY += 7;
  doc.text('Tax:', 140, currentY);
  doc.setTextColor(...colors.success);
  doc.text(`$${tax.toFixed(2)}`, 180, currentY, { align: 'right' });

  currentY += 7;
  doc.setTextColor(...colors.dark);
  doc.text('Discount:', 140, currentY);
  doc.setTextColor(239, 68, 68);
  doc.text(`-$${discount.toFixed(2)}`, 180, currentY, { align: 'right' });

  currentY += 10;

  doc.setFillColor(...colors.primary);
  doc.rect(130, currentY - 5, 65, 12, 'F');

  doc.setTextColor(...colors.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 140, currentY + 2);
  doc.text(`$${grandTotal.toFixed(2)}`, 185, currentY + 2, { align: 'right' });

  currentY += 20;

  if (notes && notes.trim()) {
    doc.setTextColor(...colors.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 15, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(notes, 180);
    doc.text(noteLines, 15, currentY + 6);

    currentY += 6 + noteLines.length * 5 + 10;
  }

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(...colors.light);
  doc.rect(0, currentY, 210, 35, 'F');

  doc.setTextColor(...colors.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INSTRUCTIONS', 15, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Bank Transfer: Capitect - Account 1234094529', 15, currentY + 15);
  doc.text('PayShap: 0626775823', 15, currentY + 21);
  doc.text('Thank you for your business!', 15, currentY + 28);

  doc.setFontSize(7);
  doc.setTextColor(...colors.secondary);
  doc.text('Invoice generated by Invoico | Built by @aj4200', 105, 290, {
    align: 'center',
  });

  doc.save(`${clientInfo.name.replace(/\s+/g, '-')}-invoice-${invoiceDetails.invoiceNumber}.pdf`);
};
