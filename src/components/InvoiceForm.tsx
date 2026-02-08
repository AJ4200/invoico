'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ServiceItem } from './ServiceItem';
import { generatePDF, generatePDFAsBase64 } from '@/utils/generateDoc';
import { Loader } from './ui/Loader';

interface Service {
  description: string;
  date: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export default function InvoiceForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState('Generating PDF');
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
  });

  const [services, setServices] = useState<Service[]>([
    { description: '', date: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 },
  ]);

  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');

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
    setServices([
      ...services,
      { description: '', date: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 },
    ]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const calculateSubtotal = () => {
    return services.reduce((acc, service) => acc + service.total, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + tax;
  };

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
      services,
      tax,
      notes,
      subtotal: calculateSubtotal(),
      grandTotal: calculateGrandTotal(),
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsGenerating(false);
  };

  const handleSendEmail = async () => {
    if (!clientInfo.email?.trim()) {
      setEmailStatus('error');
      setEmailError('Please enter the client email address first.');
      return;
    }

    setIsSending(true);
    setEmailStatus('idle');
    setEmailError(null);

    try {
      setGeneratingLabel('Preparing invoice');
      setIsGenerating(true);

      const pdfBase64 = generatePDFAsBase64({
        clientInfo,
        invoiceDetails,
        services,
        tax,
        notes,
        subtotal: calculateSubtotal(),
        grandTotal: calculateGrandTotal(),
      });

      setIsGenerating(false);
      setGeneratingLabel('Sending email');

      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clientInfo.email.trim(),
          clientName: clientInfo.name || 'Valued Client',
          invoiceNumber: invoiceDetails.invoiceNumber,
          grandTotal: calculateGrandTotal(),
          pdfBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailStatus('success');
    } catch (err) {
      setEmailStatus('error');
      setEmailError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSending(false);
      setIsGenerating(false);
    }
  };

  return (
    <>
      {(isGenerating || isSending) && <Loader label={generatingLabel} size="lg" fullScreen />}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                <Input
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={invoiceDetails.invoiceNumber}
                  onChange={handleInvoiceChange}
                  placeholder="INV-001"
                  icon={<FileCheck className="w-4 h-4" />}
                  required
                />

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
                  label="Tax (R)"
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  icon={<Banknote className="w-4 h-4" />}
                />
              </div>

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
          </div>

          <div className="lg:col-span-1">
            <Card variant="elevated" className="p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
                  <span className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                    R {calculateSubtotal().toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="text-stone-600 dark:text-stone-400">Tax</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    +R {tax.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white"
                >
                  <p className="text-sm opacity-90 mb-2">Total Amount Due</p>
                  <p className="text-4xl font-bold">
                    R {calculateGrandTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  onClick={handleSendEmail}
                  leftIcon={<Send className="w-5 h-5" />}
                  className="w-full"
                  isLoading={isSending}
                >
                  Email to Client
                </Button>
              </div>

              {emailStatus === 'success' && (
                <p className="text-sm text-green-600 font-medium text-center mt-4">
                  Invoice sent successfully to {clientInfo.email}
                </p>
              )}
              {emailStatus === 'error' && emailError && (
                <p className="text-sm text-red-600 font-medium text-center mt-4">
                  {emailError}
                </p>
              )}

              <p className="text-xs text-stone-500 text-center mt-4">
                Download as PDF or email directly to your client
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
