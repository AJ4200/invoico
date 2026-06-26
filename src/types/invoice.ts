export interface ClientInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  regNo: string;
  vatNo: string;
}

export interface BankingDetails {
  bankName: string;
  accountNumber: string;
  branchCode: string;
  payShapCell: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

export interface Service {
  description: string;
  date: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type RecurrenceFrequency = 'none' | 'monthly' | 'yearly' | 'custom';
export type IntervalUnit = 'days' | 'weeks' | 'months' | 'years';

export interface RecurrenceSettings {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  intervalUnit: IntervalUnit;
  startDate: string;
  notifyEnabled: boolean;
  notifyDaysBefore: number;
}

export interface ScheduleTemplate {
  services: Service[];
  tax: number;
  notes: string;
}

export interface ScheduleNotification {
  enabled: boolean;
  daysBefore: number;
  lastNotifiedFor?: string;
}

export interface RecurringSchedule {
  id: string;
  client: ClientInfo;
  template: ScheduleTemplate;
  intervalCount: number;
  intervalUnit: IntervalUnit;
  startDate: string;
  nextRun: string;
  status: 'active' | 'paused';
  createdAt: string;
  lastGenerated?: string;
  dueInDays: number;
  notify: ScheduleNotification;
}

export interface GeneratedInvoice {
  id: string;
  scheduleId: string;
  clientName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  subtotal: number;
  total: number;
  createdAt: string;
}

export type PortalInvoiceSource = 'current' | 'generated';
export type PortalInvoiceStatus = 'all' | 'paid' | 'unpaid';
export type PaymentCollectionMethod = 'PayShap' | 'Bank transfer' | 'Bank deposit';

export interface PortalInvoice {
  id: string;
  source: PortalInvoiceSource;
  scheduleId?: string;
  clientName: string;
  clientEmail?: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  total: number;
  currency: string;
}

export interface PortalPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  method: PaymentCollectionMethod;
  recordedAt: string;
}
