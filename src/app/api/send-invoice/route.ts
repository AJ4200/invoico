import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,
      clientName,
      invoiceNumber,
      grandTotal,
      pdfBase64,
      companyName,
    }: {
      to: string;
      clientName: string;
      invoiceNumber: string;
      grandTotal: number;
      pdfBase64: string;
      companyName?: string;
    } = body;

    if (!to || !pdfBase64) {
      return NextResponse.json(
        { error: 'Missing required fields: to, pdfBase64' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. Add RESEND_API_KEY to your environment.' },
        { status: 503 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Invoico <onboarding@resend.dev>';
    const senderCompanyName = companyName?.trim() || process.env.COMPANY_NAME || 'JE Productions';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Invoice #${invoiceNumber} from ${senderCompanyName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Invoice #${invoiceNumber}</h2>
          <p>Dear ${clientName || 'Valued Client'},</p>
          <p>Please find attached your invoice #${invoiceNumber} from ${senderCompanyName}.</p>
          <p style="font-size: 18px; font-weight: 600; color: #0ea5e9;">
            Amount due: R ${grandTotal?.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
          </p>
          <p>If you have any questions about this invoice, please don't hesitate to reach out.</p>
          <p>Thank you for your business!</p>
          <br>
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from Invoico. Please do not reply directly to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
