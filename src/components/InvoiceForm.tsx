'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Phone,
  FileText,
  Calendar,
  Plus,
  Download,
  Banknote,
  FileCheck,
  Send,
  Repeat,
  Bell,
  CalendarClock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Building2,
  Globe,
  Hash,
  Landmark,
  CreditCard,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ServiceItem } from './ServiceItem';
import { generatePDF } from '@/utils/generateDoc';
import { formatExchangeRate, formatMoney, SUPPORTED_CURRENCIES } from '@/utils/currency';
import { buildInvoiceMailto } from '@/utils/emailDraft';
import { Loader } from './ui/Loader';
import { BusinessPortalPanel } from './portal/BusinessPortalPanel';
import { PortalSummaryCards } from './portal/PortalSummaryCards';
import { useBusinessPortal } from '@/hooks/useBusinessPortal';
import { useStoredState } from '@/hooks/useStoredState';
import {
  GeneratedInvoice,
  IntervalUnit,
  RecurrenceFrequency,
  RecurrenceSettings,
  RecurringSchedule,
  Service,
} from '@/types/invoice';
import {
  addDays,
  addInterval,
  calculateSubtotalFromServices,
  computeNextRun,
  createId,
  diffInDays,
  makeInvoiceNumber,
  normalizeServices,
  todayISO,
} from '@/utils/invoice/schedule';

const RECURRENCE_STORAGE_KEY = 'invoico.recurringSchedules';
const GENERATED_STORAGE_KEY = 'invoico.generatedInvoices';

export default function InvoiceForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState('Generating PDF');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: 'JE Productions',
    tagline: 'Professional Digital Solutions',
    email: 'abeljackson33@gmail.com',
    address: 'Modimolle, Limpopo, South Africa',
    phone: '+27 62 677 5823',
    website: 'www.aj4200.dev',
    regNo: '---',
    vatNo: '---',
  });

  const [bankingDetails, setBankingDetails] = useState({
    bankName: 'Capitec',
    accountNumber: '1534094529',
    branchCode: '470010',
    payShapCell: '062 677 5823',
  });

  const [invoiceDetails, setInvoiceDetails] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { invoiceNumber: 'INV-', invoiceDate: today, dueDate: today };
  });

  const [services, setServices] = useState<Service[]>([
    { description: '', date: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 },
  ]);

  const [expandedServiceIndex, setExpandedServiceIndex] = useState<number | null>(0);

  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [businessCurrency, setBusinessCurrency] = useState('ZAR');
  const [invoiceCurrency, setInvoiceCurrency] = useState('ZAR');
  const [exchangeRate, setExchangeRate] = useState(1);

  const [recurrence, setRecurrence] = useState<RecurrenceSettings>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      frequency: 'none',
      intervalCount: 1,
      intervalUnit: 'months',
      startDate: today,
      notifyEnabled: false,
      notifyDaysBefore: 3,
    };
  });

  const [recurringSchedules, setRecurringSchedules] = useStoredState<RecurringSchedule[]>(
    RECURRENCE_STORAGE_KEY,
    []
  );
  const [generatedInvoices, setGeneratedInvoices] = useStoredState<GeneratedInvoice[]>(
    GENERATED_STORAGE_KEY,
    []
  );
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<
    'unsupported' | NotificationPermission
  >('default');

  useEffect(() => {
    const date = invoiceDetails.invoiceDate || new Date().toISOString().slice(0, 10);
    const datePart = date.replace(/-/g, '');
    const name = clientInfo.name.trim();
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const invoiceNumber = initials ? `INV-${datePart}-${initials}` : `INV-${datePart}`;
    setInvoiceDetails((prev) => ({ ...prev, invoiceNumber }));
  }, [clientInfo.name, invoiceDetails.invoiceDate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }
    setNotificationStatus(Notification.permission);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const runScheduleCheck = () => {
      const today = todayISO();
      const generated: GeneratedInvoice[] = [];
      let notifiedSchedules: Record<string, string> = {};

      setRecurringSchedules((prev) => {
        let changed = false;
        const updated = prev.map((schedule) => {
          if (schedule.status !== 'active') return schedule;

          let nextRun = schedule.nextRun;
          let lastGenerated = schedule.lastGenerated;
          let notify = schedule.notify;

          while (nextRun <= today) {
            const invoiceDate = nextRun;
            const dueDate = addDays(invoiceDate, schedule.dueInDays);
            const subtotal = calculateSubtotalFromServices(schedule.template.services);
            const total = subtotal + schedule.template.tax;
            const invoiceNumber = makeInvoiceNumber(schedule.client.name, invoiceDate);

            generated.push({
              id: createId(),
              scheduleId: schedule.id,
              clientName: schedule.client.name,
              invoiceDate,
              dueDate,
              invoiceNumber,
              subtotal,
              total,
              createdAt: todayISO(),
            });

            lastGenerated = invoiceDate;
            nextRun = addInterval(nextRun, schedule.intervalCount, schedule.intervalUnit);
            changed = true;
          }

          const daysUntil = diffInDays(today, nextRun);
          if (
            notify.enabled &&
            daysUntil <= notify.daysBefore &&
            notify.lastNotifiedFor !== nextRun
          ) {
            if (notificationStatus === 'granted') {
              new Notification('Upcoming invoice generation', {
                body: `${schedule.client.name} is scheduled for ${nextRun}.`,
              });
            }
            notify = { ...notify, lastNotifiedFor: nextRun };
            notifiedSchedules[schedule.id] = nextRun;
            changed = true;
          }

          if (changed) {
            return {
              ...schedule,
              nextRun,
              lastGenerated,
              notify,
            };
          }

          return schedule;
        });

        return changed ? updated : prev;
      });

      if (generated.length > 0) {
        setGeneratedInvoices((prev) => [...generated, ...prev].slice(0, 50));
      }

      if (Object.keys(notifiedSchedules).length > 0) {
        setScheduleMessage('Upcoming invoices have been queued.');
        setTimeout(() => setScheduleMessage(null), 3000);
      }
    };

    runScheduleCheck();
    const interval = setInterval(runScheduleCheck, 60000);
    return () => clearInterval(interval);
  }, [notificationStatus]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setClientInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleInvoiceChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setInvoiceDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCompanyInfoChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setCompanyInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleBankingDetailsChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setBankingDetails((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleServiceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newServices = [...services];

    if (name === 'quantity' || name === 'unitPrice' || name === 'discount') {
      newServices[index][name as 'quantity' | 'unitPrice' | 'discount'] = Number(value);
    } else {
      newServices[index][name as 'description' | 'date'] = value;
    }

    const svc = newServices[index];
    const lineTotal = svc.quantity * svc.unitPrice;
    newServices[index].total = Math.max(0, lineTotal - svc.discount);

    setServices(newServices);
  };

  const addService = () => {
    const newIndex = services.length;
    setServices([
      ...services,
      { description: '', date: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 },
    ]);
    setExpandedServiceIndex(newIndex);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    setExpandedServiceIndex((prev) => {
      if (prev === null || prev === index) return newServices.length > 0 ? 0 : null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const toggleServiceExpand = (index: number) => {
    setExpandedServiceIndex((prev) => (prev === index ? null : index));
  };

  const calculateSubtotal = () => {
    return services.reduce((acc, service) => acc + service.total, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + tax;
  };

  const {
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
  } = useBusinessPortal({
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
    subtotal: calculateSubtotal(),
    grandTotal: calculateGrandTotal(),
  });

  const recurrenceInterval = (() => {
    if (recurrence.frequency === 'monthly') {
      return { count: 1, unit: 'months' as IntervalUnit };
    }
    if (recurrence.frequency === 'yearly') {
      return { count: 1, unit: 'years' as IntervalUnit };
    }
    if (recurrence.frequency === 'custom') {
      return {
        count: Math.max(1, recurrence.intervalCount),
        unit: recurrence.intervalUnit,
      };
    }
    return null;
  })();

  const nextRecurringDate =
    recurrenceInterval && recurrence.startDate
      ? computeNextRun(
          recurrence.startDate,
          recurrenceInterval.count,
          recurrenceInterval.unit,
          todayISO()
        )
      : null;

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  const applyScheduleToForm = (schedule: RecurringSchedule, invoiceDate: string) => {
    const dueDate = addDays(invoiceDate, schedule.dueInDays);
    const normalizedServices = normalizeServices(schedule.template.services);
    setClientInfo({ ...schedule.client });
    setServices(normalizedServices);
    setTax(schedule.template.tax);
    setNotes(schedule.template.notes);
    setInvoiceDetails((prev) => ({
      ...prev,
      invoiceDate,
      dueDate,
      invoiceNumber: makeInvoiceNumber(schedule.client.name, invoiceDate),
    }));
  };

  const handleCreateSchedule = () => {
    setScheduleError(null);
    setScheduleMessage(null);

    if (recurrence.frequency === 'none' || !recurrenceInterval) {
      setScheduleError('Select a recurrence option before saving a schedule.');
      return;
    }

    if (!clientInfo.name.trim()) {
      setScheduleError('Add a client name to attach this schedule.');
      return;
    }

    if (!recurrence.startDate) {
      setScheduleError('Choose a start date for this schedule.');
      return;
    }

    const normalizedServices = normalizeServices(services);
    const dueInDays = Math.max(
      0,
      diffInDays(invoiceDetails.invoiceDate, invoiceDetails.dueDate)
    );
    const nextRun = computeNextRun(
      recurrence.startDate,
      recurrenceInterval.count,
      recurrenceInterval.unit,
      todayISO()
    );

    const schedule: RecurringSchedule = {
      id: createId(),
      client: { ...clientInfo },
      template: {
        services: normalizedServices,
        tax,
        notes,
      },
      intervalCount: recurrenceInterval.count,
      intervalUnit: recurrenceInterval.unit,
      startDate: recurrence.startDate,
      nextRun,
      status: 'active',
      createdAt: todayISO(),
      lastGenerated: undefined,
      dueInDays,
      notify: {
        enabled: recurrence.notifyEnabled,
        daysBefore: Math.max(0, recurrence.notifyDaysBefore),
      },
    };

    setRecurringSchedules((prev) => [schedule, ...prev]);
    setScheduleMessage(`Recurring schedule saved. Next invoice: ${nextRun}.`);
  };

  const handleRecurrenceFrequencyChange = (value: RecurrenceFrequency) => {
    if (value === 'monthly') {
      setRecurrence((prev) => ({
        ...prev,
        frequency: value,
        intervalCount: 1,
        intervalUnit: 'months',
      }));
      return;
    }

    if (value === 'yearly') {
      setRecurrence((prev) => ({
        ...prev,
        frequency: value,
        intervalCount: 1,
        intervalUnit: 'years',
      }));
      return;
    }

    setRecurrence((prev) => ({
      ...prev,
      frequency: value,
    }));
  };

  const handleToggleScheduleStatus = (scheduleId: string) => {
    setRecurringSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              status: schedule.status === 'active' ? 'paused' : 'active',
            }
          : schedule
      )
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setRecurringSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId));
  };

  const handleGenerateNow = (scheduleId: string) => {
    const schedule = recurringSchedules.find((item) => item.id === scheduleId);
    if (!schedule) return;

    const invoiceDate = todayISO();
    const dueDate = addDays(invoiceDate, schedule.dueInDays);
    const subtotal = calculateSubtotalFromServices(schedule.template.services);
    const total = subtotal + schedule.template.tax;
    const invoiceNumber = makeInvoiceNumber(schedule.client.name, invoiceDate);

    const generated: GeneratedInvoice = {
      id: createId(),
      scheduleId: schedule.id,
      clientName: schedule.client.name,
      invoiceDate,
      dueDate,
      invoiceNumber,
      subtotal,
      total,
      createdAt: todayISO(),
    };

    setGeneratedInvoices((prev) => [generated, ...prev].slice(0, 50));
    setRecurringSchedules((prev) =>
      prev.map((item) =>
        item.id === scheduleId
          ? {
              ...item,
              lastGenerated: invoiceDate,
              nextRun: addInterval(invoiceDate, item.intervalCount, item.intervalUnit),
            }
          : item
      )
    );

    applyScheduleToForm(schedule, invoiceDate);
    setScheduleMessage(`Invoice generated for ${schedule.client.name}.`);
  };

  const selectStyles =
    'w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all duration-200';

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setGeneratingLabel('Preparing invoice data');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setGeneratingLabel('Creating PDF document');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setGeneratingLabel('Applying formatting');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setGeneratingLabel('Finalizing document');

    generatePDF({
      clientInfo,
      invoiceDetails,
      companyInfo,
      bankingDetails,
      services,
      tax,
      notes,
      subtotal: calculateSubtotal(),
      grandTotal: calculateGrandTotal(),
      currency: invoiceCurrency,
      businessCurrency,
      exchangeRate,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsGenerating(false);
  };

  const handleOpenEmailDraft = () => {
    if (!clientInfo.email?.trim()) {
      setEmailStatus('error');
      setEmailError('Please enter the client email address first.');
      return;
    }

    setEmailStatus('idle');
    setEmailError(null);

    try {
      const mailtoUrl = buildInvoiceMailto({
        bankingDetails,
        clientInfo,
        companyInfo,
        grandTotal: calculateGrandTotal(),
        invoiceCurrency,
        invoiceDetails,
      });

      window.location.href = mailtoUrl;
      setEmailStatus('success');
    } catch (err) {
      setEmailStatus('error');
      setEmailError(err instanceof Error ? err.message : 'Failed to open email draft');
    }
  };

  return (
    <>
      {isGenerating && <Loader label={generatingLabel} size="lg" fullScreen />}

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-stone-800 dark:text-stone-100 mb-3">
            Create Your Invoice
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Professional invoices in minutes
          </p>
        </motion.div>

        <PortalSummaryCards
          invoiceCurrency={invoiceCurrency}
          outstandingPortalTotal={outstandingPortalTotal}
          paidPortalInvoices={paidPortalInvoices}
          portalInvoices={portalInvoices}
          unpaidPortalInvoices={unpaidPortalInvoices}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Your Company Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleCompanyInfoChange}
                  placeholder="Your Company Name"
                  icon={<Building2 className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Tagline"
                  name="tagline"
                  value={companyInfo.tagline}
                  onChange={handleCompanyInfoChange}
                  placeholder="Professional Services"
                  icon={<FileText className="w-4 h-4" />}
                />

                <Input
                  label="Company Email"
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleCompanyInfoChange}
                  placeholder="billing@yourcompany.com"
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Company Phone"
                  type="tel"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleCompanyInfoChange}
                  placeholder="+27 12 345 6789"
                  icon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Company Address"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyInfoChange}
                  placeholder="123 Main St, City"
                  icon={<MapPin className="w-4 h-4" />}
                />

                <Input
                  label="Website"
                  name="website"
                  value={companyInfo.website}
                  onChange={handleCompanyInfoChange}
                  placeholder="www.yourcompany.com"
                  icon={<Globe className="w-4 h-4" />}
                />

                <Input
                  label="Registration Number"
                  name="regNo"
                  value={companyInfo.regNo}
                  onChange={handleCompanyInfoChange}
                  placeholder="Company registration number"
                  icon={<Hash className="w-4 h-4" />}
                />

                <Input
                  label="VAT Number"
                  name="vatNo"
                  value={companyInfo.vatNo}
                  onChange={handleCompanyInfoChange}
                  placeholder="VAT number"
                  icon={<Hash className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Banking Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  name="bankName"
                  value={bankingDetails.bankName}
                  onChange={handleBankingDetailsChange}
                  placeholder="Your bank"
                  icon={<Landmark className="w-4 h-4" />}
                />

                <Input
                  label="Account Number"
                  name="accountNumber"
                  value={bankingDetails.accountNumber}
                  onChange={handleBankingDetailsChange}
                  placeholder="Account number"
                  icon={<CreditCard className="w-4 h-4" />}
                />

                <Input
                  label="Branch Code"
                  name="branchCode"
                  value={bankingDetails.branchCode}
                  onChange={handleBankingDetailsChange}
                  placeholder="Branch code"
                  icon={<Hash className="w-4 h-4" />}
                />

                <Input
                  label="PayShap Cell"
                  type="tel"
                  name="payShapCell"
                  value={bankingDetails.payShapCell}
                  onChange={handleBankingDetailsChange}
                  placeholder="PayShap number"
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Client Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Name"
                  name="name"
                  value={clientInfo.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={clientInfo.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Address"
                  name="address"
                  value={clientInfo.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, Province, South Africa"
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={clientInfo.phone}
                  onChange={handleInputChange}
                  placeholder="+27 12 345 6789"
                  icon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Invoice Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Invoice Number"
                    name="invoiceNumber"
                    value={invoiceDetails.invoiceNumber}
                    onChange={handleInvoiceChange}
                    placeholder="INV-001"
                    icon={<FileCheck className="w-4 h-4" />}
                    required
                  />
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Auto-generated from client name & date (editable)
                  </p>
                </div>

                <Input
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={invoiceDetails.invoiceDate}
                  onChange={handleInvoiceChange}
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={invoiceDetails.dueDate}
                  onChange={handleInvoiceChange}
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Services</h2>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addService}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Service
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {services.map((service, index) => (
                    <ServiceItem
                      key={index}
                      service={service}
                      index={index}
                      isExpanded={expandedServiceIndex === index}
                      onToggle={() => toggleServiceExpand(index)}
                      onChange={handleServiceChange}
                      onRemove={removeService}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Additional Charges
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Tax (${invoiceCurrency})`}
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  icon={<Banknote className="w-4 h-4" />}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Default Business Currency
                  </label>
                  <select className={selectStyles} value={businessCurrency} onChange={(e) => setBusinessCurrency(e.target.value)}>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} — {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Invoice Currency
                  </label>
                  <select className={selectStyles} value={invoiceCurrency} onChange={(e) => setInvoiceCurrency(e.target.value)}>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} — {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Exchange Rate"
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                  min="0.000001"
                  step="0.000001"
                  icon={<Globe className="w-4 h-4" />}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {businessCurrency === invoiceCurrency ? 'No exchange rate needed.' : formatExchangeRate(exchangeRate, businessCurrency, invoiceCurrency)}
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Notes / Additional Information
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all duration-200 min-h-[100px]"
                  placeholder="Add any additional notes or payment instructions..."
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  Recurring Invoices
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Recurrence
                  </label>
                  <select
                    className={selectStyles}
                    value={recurrence.frequency}
                    onChange={(e) =>
                      handleRecurrenceFrequencyChange(e.target.value as RecurrenceFrequency)
                    }
                  >
                    <option value="none">No recurrence</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom interval</option>
                  </select>
                </div>

                <Input
                  label="Start Date"
                  type="date"
                  value={recurrence.startDate}
                  onChange={(e) =>
                    setRecurrence((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  icon={<Calendar className="w-4 h-4" />}
                  disabled={recurrence.frequency === 'none'}
                />

                {recurrence.frequency === 'custom' && (
                  <>
                    <Input
                      label="Every"
                      type="number"
                      min="1"
                      value={recurrence.intervalCount}
                      onChange={(e) =>
                        setRecurrence((prev) => ({
                          ...prev,
                          intervalCount: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                    />
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                        Interval Unit
                      </label>
                      <select
                        className={selectStyles}
                        value={recurrence.intervalUnit}
                        onChange={(e) =>
                          setRecurrence((prev) => ({
                            ...prev,
                            intervalUnit: e.target.value as IntervalUnit,
                          }))
                        }
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                    checked={recurrence.notifyEnabled}
                    onChange={(e) =>
                      setRecurrence((prev) => ({ ...prev, notifyEnabled: e.target.checked }))
                    }
                    disabled={recurrence.frequency === 'none'}
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    Notify before generation
                  </span>
                </div>

                <Input
                  label="Notify Days Before"
                  type="number"
                  min="0"
                  value={recurrence.notifyDaysBefore}
                  onChange={(e) =>
                    setRecurrence((prev) => ({
                      ...prev,
                      notifyDaysBefore: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  disabled={!recurrence.notifyEnabled || recurrence.frequency === 'none'}
                  icon={<Bell className="w-4 h-4" />}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                <CalendarClock className="w-4 h-4" />
                <span>
                  Next scheduled invoice:{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-100">
                    {nextRecurringDate ?? '—'}
                  </span>
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCreateSchedule}
                  disabled={recurrence.frequency === 'none'}
                >
                  Save Recurring Schedule
                </Button>
                {notificationStatus !== 'unsupported' && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={requestNotificationPermission}
                    disabled={notificationStatus === 'granted'}
                  >
                    {notificationStatus === 'granted'
                      ? 'Notifications Enabled'
                      : 'Enable Browser Notifications'}
                  </Button>
                )}
              </div>

              {scheduleError && (
                <p className="text-sm text-red-600 font-medium mt-3">{scheduleError}</p>
              )}
              {scheduleMessage && (
                <p className="text-sm text-green-600 font-medium mt-3">{scheduleMessage}</p>
              )}

              <div className="mt-8 border-t border-stone-200 dark:border-stone-700 pt-6">
                <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
                  Active Schedules
                </h3>

                {recurringSchedules.length === 0 && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    No recurring schedules yet. Save one to automate future invoices.
                  </p>
                )}

                <div className="space-y-4">
                  {recurringSchedules.map((schedule) => {
                    const daysUntil = diffInDays(todayISO(), schedule.nextRun);
                    const daysLabel =
                      daysUntil === 0
                        ? 'Today'
                        : daysUntil === 1
                        ? 'In 1 day'
                        : `In ${daysUntil} days`;

                    return (
                      <div
                        key={schedule.id}
                        className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Client
                            </p>
                            <p className="text-base font-semibold text-stone-800 dark:text-stone-100">
                              {schedule.client.name || 'Unnamed Client'}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {schedule.client.email || 'No email on file'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-stone-500 dark:text-stone-400">Next Run</p>
                            <p className="text-base font-semibold text-stone-800 dark:text-stone-100">
                              {schedule.nextRun}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {daysLabel}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-600 dark:text-stone-400">
                          <span>
                            Every {schedule.intervalCount} {schedule.intervalUnit}
                          </span>
                          <span>
                            Status:{' '}
                            <span className="font-semibold">
                              {schedule.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                          </span>
                          <span>
                            Notify:{' '}
                            {schedule.notify.enabled
                              ? `${schedule.notify.daysBefore} days before`
                              : 'Off'}
                          </span>
                          <span>
                            Last Generated:{' '}
                            {schedule.lastGenerated ? schedule.lastGenerated : '—'}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyScheduleToForm(schedule, schedule.nextRun)}
                          >
                            Load Template
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleGenerateNow(schedule.id)}
                          >
                            Generate Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={
                              schedule.status === 'active' ? (
                                <PauseCircle className="w-4 h-4" />
                              ) : (
                                <PlayCircle className="w-4 h-4" />
                              )
                            }
                            onClick={() => handleToggleScheduleStatus(schedule.id)}
                          >
                            {schedule.status === 'active' ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 border-t border-stone-200 dark:border-stone-700 pt-6">
                <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
                  Generated Invoices
                </h3>
                {generatedInvoices.length === 0 && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Generated invoices will appear here when schedules run.
                  </p>
                )}
                <div className="space-y-3">
                  {generatedInvoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 dark:border-stone-700 p-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-100">
                          {invoice.clientName}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {invoice.invoiceNumber} • {invoice.invoiceDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-800 dark:text-stone-100">
                          {formatMoney(invoice.total, invoiceCurrency)}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Due {invoice.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BusinessPortalPanel
              bankingDetails={bankingDetails}
              filteredPortalInvoices={filteredPortalInvoices}
              invoiceNumber={invoiceDetails.invoiceNumber}
              manualPaymentMethod={manualPaymentMethod}
              paidInvoiceIds={paidInvoiceIds}
              paymentHistory={paymentHistory}
              portalFilter={portalFilter}
              portalMessage={portalMessage}
              selectStyles={selectStyles}
              onDownloadInvoice={handleDownloadPortalInvoice}
              onRecordPayment={handleRecordManualPayment}
              onSetManualPaymentMethod={setManualPaymentMethod}
              onSetPortalFilter={setPortalFilter}
            />
            <Card variant="elevated" className="p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
                  <span className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                    {formatMoney(calculateSubtotal(), invoiceCurrency)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="text-stone-600 dark:text-stone-400">Tax</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    +{formatMoney(tax, invoiceCurrency)}
                  </span>
                </div>

                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white"
                >
                  <p className="text-sm opacity-90 mb-2">Total Amount Due</p>
                  <p className="text-4xl font-bold">
                    {formatMoney(calculateGrandTotal(), invoiceCurrency)}
                  </p>
                </motion.div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGeneratePDF}
                  leftIcon={<Download className="w-5 h-5" />}
                  className="w-full"
                  isLoading={isGenerating}
                >
                  Download PDF
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleOpenEmailDraft}
                  leftIcon={<Send className="w-5 h-5" />}
                  className="w-full"
                >
                  Open Email Draft
                </Button>
              </div>

              {emailStatus === 'success' && (
                <p className="text-sm text-green-600 font-medium text-center mt-4">
                  Email draft opened for {clientInfo.email}. Attach the PDF before sending.
                </p>
              )}
              {emailStatus === 'error' && emailError && (
                <p className="text-sm text-red-600 font-medium text-center mt-4">
                  {emailError}
                </p>
              )}

              <p className="text-xs text-stone-500 text-center mt-4">
                Download the PDF, then open a prepared email draft to send from your own account
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
